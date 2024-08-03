import type { Album, Artist, Context, TrackItem } from '@spotify/web-api-ts-sdk';
import type {
	Lyrics,
	LyricsLineSynced,
	LyricsSyllableSynced,
	LyricsSynced,
	SyllableLyricGroup
} from './types/spotify';
import { browser } from '$app/environment';

interface SpotifyOptions {
	nowPlayingApiUrl: string;
	lyricsApiUrl: string;
	fetchInterval: number;
}

export default class Spotify {
	options: SpotifyOptions = $state({
		nowPlayingApiUrl: 'https://spotify.lilyy.gay',
		lyricsApiUrl: 'https://spotify-lyrics-api.lvna.workers.dev',
		fetchInterval: 5000
	});
	item:
		| (TrackItem & {
				album: Album;
				artists: Artist[];
		  })
		| null = $state(null);
	context: Context | null = $state(null);
	progressMs: number | null = $state(null);
	isPlaying: boolean = $state(false);

	lyrics: Lyrics | null = $state(null);
	lyricsHaveOpposite = $derived(this.lyrics?.lines.find((line) => line.opposite));
	currentLyric: (LyricsLineSynced | LyricsSyllableSynced)['lines'][number] | null = $derived.by(
		() => {
			this.item;
			this.progressMs;
			this.lyrics;
			return this.getCurrentLyric();
		}
	);
	currentSyllables: {
		front: SyllableLyricGroup[];
		back: SyllableLyricGroup[][];
	} | null = $derived.by(() => {
		this.lyrics;
		this.progressMs;
		return this.getCurrentSyllables();
	});

	constructor(
		options: Partial<SpotifyOptions> = {},
		initial: {
			item?: TrackItem & {
				album: Album;
				artists: Artist[];
			};
			context?: Context;
			progressMs?: number;
			isPlaying?: boolean;
			lyrics?: Lyrics;
		} = {}
	) {
		if (initial?.item) {
			this.item = initial.item;
		}
		if (initial?.context) {
			this.context = initial.context;
		}
		if (initial?.progressMs) {
			this.progressMs = initial.progressMs;
		}
		if (initial?.isPlaying) {
			this.isPlaying = initial.isPlaying;
		}
		if (initial?.lyrics) {
			this.lyrics = initial.lyrics;
		}

		if (options.nowPlayingApiUrl) {
			this.options.nowPlayingApiUrl = options.nowPlayingApiUrl;
		}
		if (options.lyricsApiUrl) {
			this.options.lyricsApiUrl = options.lyricsApiUrl;
		}
		if (options.fetchInterval) {
			this.options.fetchInterval = options.fetchInterval;
		}

		if (browser) {
			setInterval(() => {
				if (this.progressMs && this.isPlaying) {
					this.progressMs += 250;
				}
			}, 250);

			setTimeout(() => {
				this.fetchNowPlaying();
			}, 5000);
		}
	}

	async fetchNowPlaying() {
		const oldUri = this.item?.uri;

		const res = await fetch(this.options.nowPlayingApiUrl);
		const data = await res.json();
		this.item = data.item;
		this.context = data.context;
		if (!this.item) {
			this.lyrics = null;
			this.progressMs = null;
			this.isPlaying = false;

			if (browser) setTimeout(() => this.fetchNowPlaying(), 5000);
		} else {
			this.progressMs = data.progress_ms;
			this.isPlaying = data.is_playing;

			const timeLeft = data.item.duration_ms - data.progress_ms;
			const fetchIn = Math.min(timeLeft, this.options.fetchInterval);

			if (browser) setTimeout(() => this.fetchNowPlaying(), fetchIn);

			if (oldUri !== this.item?.uri) {
				this.fetchLyrics();
			}
		}
	}

	async fetchLyrics() {
		this.lyrics = null;
		if (!this.item) return;
		if (this.item.uri.startsWith('spotify:local:')) {
			return;
		}
		try {
			const res = await fetch(`${this.options.lyricsApiUrl}/lyrics/${this.item.uri}`);
			const data = await res.json();
			this.lyrics = data;
		} catch (e) {
			console.error(e);
		}
	}

	getCurrentLyric(): (LyricsLineSynced | LyricsSyllableSynced)['lines'][number] | null {
		if (!this.lyrics) return null;
		if (this.lyrics.syncType === 'UNSYNCED') return null;
		if (!this.progressMs) return null;
		const before = this.lyrics.lines.filter((line) => line.start <= this.progressMs!);
		if (before.length === 0) return null;
		if (before[0].end === -1) return before[0];
		return before.find((line) => line.end > this.progressMs!) || null;
	}

	getCurrentSyllables() {
		if (!this.lyrics) return null;
		if (this.lyrics.syncType === 'UNSYNCED') return null;
		if (this.lyrics.syncType === 'LINE_SYNCED') return null;
		if (!this.progressMs) return null;
		const line = this.currentLyric as LyricsSyllableSynced['lines'][number];
		if (!line) return null;
		const front = line.lead?.filter((syllable) => this.syllableIsCurrent(syllable)) ?? [];
		const back =
			line.background
				?.map((background) =>
					background.groups.filter((syllable) => this.syllableIsCurrent(syllable))
				)
				.filter((i) => i.length) ?? [];
		return { front, back };
	}

	syllableIsCurrent(group: SyllableLyricGroup) {
		if (!this.progressMs) return false;
		if (group.start > this.progressMs) return false;
		return true;
	}

	lineIsPast(line: LyricsSynced['lines'][number]) {
		if (!this.progressMs) return false;
		// Just incase the api breaks and doesnt give us an end time
		if ('end' in (line as Omit<typeof line, 'end'> | typeof line)) {
			return line.end < this.progressMs;
		}
		return line.start > this.progressMs;
	}
}
