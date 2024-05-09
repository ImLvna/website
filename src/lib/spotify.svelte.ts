import type { Album, Artist, TrackItem } from '@spotify/web-api-ts-sdk';
import type { Lyrics, LyricsLineSynced, LyricsLineSyncedEndTimes } from './types/spotify';
import { browser } from '$app/environment';

interface SpotifyOptions {
	nowPlayingApiUrl: string;
	lyricsApiUrl: string;
	fetchInterval: number;
}

export default class Spotify {
	options: SpotifyOptions = $state({
		nowPlayingApiUrl: 'https://spotify.lvna.gay',
		lyricsApiUrl: 'https://spotify-lyrics-api.lvna.workers.dev',
		fetchInterval: 5000
	});
	item:
		| (TrackItem & {
				album: Album;
				artists: Artist[];
		  })
		| null = $state(null);
	progressMs: number | null = $state(null);
	isPlaying: boolean = $state(false);

	lyrics: Lyrics | null = $state(null);
	currentLyric: LyricsLineSynced['lines'][number] | null = $derived.by(() => {
		this.item;
		this.progressMs;
		this.lyrics;
		return this.getCurrentLyric();
	});

	constructor(
		options: Partial<SpotifyOptions> = {},
		initial: {
			item?: TrackItem & {
				album: Album;
				artists: Artist[];
			};
			progressMs?: number;
			isPlaying?: boolean;
			lyrics?: Lyrics;
		} = {}
	) {
		if (initial?.item) {
			this.item = initial.item;
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
				if (this.progressMs) {
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
		const res = await fetch(`${this.options.lyricsApiUrl}/lyrics/${this.item.uri}`);
		const data = await res.json();
		this.lyrics = data;
	}

	getCurrentLyric(): LyricsLineSynced['lines'][number] | null {
		if (!this.lyrics) return null;
		if (this.lyrics.syncType === 'UNSYNCED') return null;
		if (!this.progressMs) return null;
		switch (this.lyrics.syncType) {
			case 'LINE_SYNCED': {
				const before = this.lyrics.lines.filter((line) => line.start <= this.progressMs!);
				if (before.length === 0) return null;
				if ((before[0] as LyricsLineSyncedEndTimes['lines'][number]).end !== undefined) {
					return (
						(before as LyricsLineSyncedEndTimes['lines']).find(
							(line) => line.end > this.progressMs!
						) || null
					);
				}
				return before[before.length - 1];
			}
			case 'SYLLABLE_SYNCED':
				return null;
		}
		return null;
	}
}
