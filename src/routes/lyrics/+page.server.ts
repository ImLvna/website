import type { PageServerLoad } from './$types';
import Spotify from '$lib/spotify.svelte';
export const load: PageServerLoad = async () => {
	try {
		const spotify = new Spotify();
		await spotify.fetchNowPlaying();
		await spotify.fetchLyrics();
		return {
			spotify: {
				item: spotify.item ?? undefined,
				progressMs: spotify.progressMs ?? undefined,
				isPlaying: spotify.isPlaying ?? undefined,
				lyrics: spotify.lyrics ?? undefined
			}
		};
	} catch (e) {
		return {
			spotify: {
				item: undefined,
				progressMs: undefined,
				isPlaying: undefined,
				lyrics: undefined
			}
		};
	}
};
