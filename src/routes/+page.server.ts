import { DISCORD_USER_ID } from '$lib/constants';
import { get as discordGet } from '$lib/server/discord';
import type { Lyrics, NowPlaying } from '$lib/types/spotify';
import type { APIUser } from 'discord-api-types/v9';
import type { PageServerLoad } from './$types';
let user: APIUser | undefined;
export const load: PageServerLoad = async () => {
	user ??= await discordGet<APIUser>(`/users/${DISCORD_USER_ID}`);
	let nowPlaying: NowPlaying | null = null;
	let lyrics: Lyrics | null = null;

	try {
		nowPlaying = await fetch('https://spotify.lvna.gay').then((res) => res.json());

		if (
			nowPlaying &&
			nowPlaying.is_playing &&
			nowPlaying.item &&
			!nowPlaying.item.uri.startsWith('spotify:local')
		) {
			try {
				lyrics = await fetch(
					`https://spotify-lyrics-api.lvna.workers.dev/lyrics/${nowPlaying.item.id}`
				).then((r) => r.json());
			} catch (e) {
				/* empty */
			}
		}
	} catch (e) {
		console.error(e);
	}

	return {
		nowPlaying,
		lyrics,
		user
	};
};
