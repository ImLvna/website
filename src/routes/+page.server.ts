import { DISCORD_USER_ID } from '$lib/constants';
import { get as discordGet } from '$lib/server/discord';
import type { NowPlaying } from '$lib/types/spotify';
import type { APIUser } from 'discord-api-types/v9';
import type { PageServerLoad } from './$types';

let user: APIUser | undefined;

export const load: PageServerLoad = async () => {
	user ??= await discordGet<APIUser>(`/users/${DISCORD_USER_ID}`);
	const nowPlaying: NowPlaying = await fetch('https://spotify.lvna.gay').then((res) => res.json());
	return {
		user,
		nowPlaying
	};
};
