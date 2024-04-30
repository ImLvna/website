import type { Lyrics, NowPlaying } from '$lib/types/spotify';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let nowPlaying: NowPlaying | null = null;
	let lyrics: Lyrics | null = null;

	try {
		nowPlaying = await fetch('https://spotify.lvna.gay').then((res) => res.json());

		if (nowPlaying && nowPlaying.is_playing) {
			lyrics = await fetch(
				`https://spotify-lyrics-api.lvna.workers.dev/lyrics/${nowPlaying.item.id}`
			).then((r) => r.json());
		}
	} catch (e) {
		console.error(e);
	}

	return {
		nowPlaying,
		lyrics
	};
};
