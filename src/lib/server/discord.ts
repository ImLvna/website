import { DISCORD_BOT_TOKEN } from '$env/static/private';

export async function get<T>(url: string, config: RequestInit = {}): Promise<T> {
	const response = await fetch(`https://discord.com/api/v9${url}`, {
		...config,
		headers: {
			...config.headers,
			Authorization: `Bot ${DISCORD_BOT_TOKEN}`
		}
	});
	return await response.json();
}
