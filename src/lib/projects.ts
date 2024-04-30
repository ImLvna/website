export const projects = [
	{
		name: 'This Website',
		language: 'Svelte',
		url: 'https://lvna.gay',
		source: 'https://github.com/imlvna/website'
	},
	{
		name: 'ClanGen',
		language: 'Python',
		url: 'https://clangen.io',
		source: 'https://github.com/ClanGenOfficial/ClanGen'
	},
	{
		name: 'ClanGen Website',
		language: 'Svelte',
		url: 'https://clangen.io'
	}
] as {
	name: string;
	language: string;
	url?: string;
	source?: string;
}[];
