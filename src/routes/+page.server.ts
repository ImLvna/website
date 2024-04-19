import { DISCORD_USER_ID } from '$lib/constants';
import { get as discordGet } from '$lib/server/discord';
import type { APIUser } from 'discord-api-types/v9';
import type { PageServerLoad } from './$types';
import type { NowPlaying } from '$lib/types/spotify';

let user: APIUser | undefined;

export const load: PageServerLoad = async () => {
	user ??= await discordGet<APIUser>(`/users/${DISCORD_USER_ID}`);
	const nowPlaying: NowPlaying = await fetch('https://spotify.lvna.gay/now-playing').then((res) =>
		res.json()
	);
	return {
		user,
		nowPlaying
	};
};
