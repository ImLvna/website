import type { PageServerLoad } from './$types';
import Spotify from '$lib/spotify.svelte';
import type { ExtendedSession } from '$lib/types/auth';
export const load: PageServerLoad = async ({ locals }) => {
	const session = (await locals.auth()) as ExtendedSession;
	try {
		const spotify = new Spotify();
		await spotify.fetchNowPlaying();
		await spotify.fetchLyrics();
		return {
			session,
			spotify: {
				item: spotify.item ?? undefined,
				context: spotify.context ?? undefined,
				progressMs: spotify.progressMs ?? undefined,
				isPlaying: spotify.isPlaying ?? undefined,
				lyrics: spotify.lyrics ?? undefined
			}
		};
	} catch (e) {
		return {
			session,
			spotify: {
				item: undefined,
				progressMs: undefined,
				isPlaying: undefined,
				lyrics: undefined
			}
		};
	}
};
