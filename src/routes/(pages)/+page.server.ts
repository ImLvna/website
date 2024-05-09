import { DISCORD_USER_ID } from '$lib/constants';
import { get as discordGet } from '$lib/server/discord';
import type { APIUser } from 'discord-api-types/v9';
import type { PageServerLoad } from './$types';
import Spotify from '$lib/spotify.svelte';
let user: APIUser | undefined;
export const load: PageServerLoad = async () => {
	user ??= await discordGet<APIUser>(`/users/${DISCORD_USER_ID}`);

	try {
		const spotify = new Spotify();
		await spotify.fetchNowPlaying();
		await spotify.fetchLyrics();
		return {
			user,
			spotify: {
				item: spotify.item ?? undefined,
				progressMs: spotify.progressMs ?? undefined,
				isPlaying: spotify.isPlaying ?? undefined,
				lyrics: spotify.lyrics ?? undefined
			}
		};
	} catch (e) {
		return {
			user,
			spotify: {
				item: undefined,
				progressMs: undefined,
				isPlaying: undefined,
				lyrics: undefined
			}
		};
	}
};
