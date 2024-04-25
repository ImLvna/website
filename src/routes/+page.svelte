<script lang="ts">
	import { projects } from '$lib/projects';
	import tooltip from '$lib/tooltip/index.svelte';
	import { type Lyrics, type LyricsLineSyncedEndTimes } from '$lib/types/spotify';
	import { onMount } from 'svelte';

	let { data } = $props();

	let nowPlaying = $state(data.nowPlaying);
	let curTimeMs = $state<number | null>(null);
	let lyrics = $state<Lyrics | null>(null);
	const currentLyric = $derived.by(() => {
		if (!lyrics) return null;
		if (!curTimeMs) return null;
		if (!nowPlaying?.is_playing) return null;
		if (lyrics.lyrics.syncType === 'UNSYNCED') return null;
		if (lyrics.lyrics.lines.length === 0) return null;

		const before = lyrics.lyrics.lines.filter(
			(l) => Number(l.startTimeMs) <= curTimeMs!
		) as LyricsLineSyncedEndTimes['lyrics']['lines'];

		// No endTimeMs
		if (!Object.keys(lyrics.lyrics.lines[0]).includes('endTimeMs')) {
			console.log(before);
			const match = before[before.length - 1];
			return match.words === '♪' ? '' : match.words;
		}

		const match = (before as LyricsLineSyncedEndTimes['lyrics']['lines']).find(
			(l) => Number(l.endTimeMs) >= curTimeMs!
		);

		if (!match) return '';
		return match.words === '♪' ? '' : match.words;
	});

	$inspect(lyrics);

	$effect(() => {
		curTimeMs = nowPlaying.progress_ms;
	});

	async function getLyrics() {
		try {
			const newLyrics = await fetch(
				`https://spotify-lyrics-api.lvna.workers.dev/lyrics/${nowPlaying.item.id}`
			).then((r) => r.json());
			lyrics = newLyrics;
		} catch (e) {
			lyrics = null;
		}
	}

	onMount(async () => {
		const fetchNowPlaying = async () => {
			const oldNowPlaying = nowPlaying;
			const response = await fetch('https://spotify.lvna.gay').then((r) => r.json());
			nowPlaying = response;

			if (oldNowPlaying && oldNowPlaying.item?.id !== nowPlaying.item?.id) {
				await getLyrics();
			}

			let nextTime = Date.now() + 5000;
			if (response.is_playing && response.item) {
				nextTime = Math.min(
					nextTime,
					Date.now() + response.item.duration_ms - response.progress_ms
				);
			}
			setTimeout(fetchNowPlaying, nextTime - Date.now());
		};
		await fetchNowPlaying();
		await getLyrics();

		setInterval(() => {
			if (curTimeMs === null) return;
			if (!nowPlaying.is_playing) return;
			curTimeMs += 250;
		}, 250);
	});
</script>

<div class="root flex flex-col w-full h-full">
	<img
		class="rounded-full w-40 h-40"
		src="https://cdn.discordapp.com/avatars/{data.user.id}/{data.user.avatar}.png"
		alt="Profile"
	/>
	<h1 class="text-5xl">Lily</h1>
	<p class="text-1xl py-10">
		I am a freelance programmer who works on a variety of projects. I work in many languages, but
		specialize in Typescript
	</p>
	{#if nowPlaying.item && nowPlaying.is_playing}
		<h2 class="text-3xl">Currently Listening To:</h2>
		<div class="flex flex-row h-20 gap-3">
			{#if nowPlaying.item.album?.images?.length > 0}
				<img
					class="rounded-full w-20 h-20 spin"
					src={nowPlaying.item.album.images[0].url}
					alt="Album Cover"
				/>
			{/if}
			<div class="flex flex-col h-20 justify-center">
				<p>{nowPlaying.item.name}</p>
				<p>{nowPlaying.item.artists.map((a) => a.name).join(', ')}</p>
				{#if currentLyric}
					<p use:tooltip={'Lyrics!'}>{currentLyric}</p>
				{/if}
			</div>
		</div>
	{/if}
	<h2 class="text-3xl">Facts about me:</h2>
	<ul class="list-none">
		<li>I am a puppy!</li>
		<li use:tooltip={'This is not a joke.'}>My pronouns are Pup/Pups</li>
		<li>Trans</li>
		<li>Lesbian-Leaning</li>
		<li use:tooltip={'i love you annie <3'}>Taken</li>
	</ul>
	<h2 class="text-3xl">I Know:</h2>
	<ul class="list-disc list-outside">
		{#each ['Typescript', 'Javascript', 'C#', 'HTML', 'CSS', 'Svelte', 'React', 'Rust'] as i}
			<li>{i}</li>
		{/each}
	</ul>
	<h2 class="text-3xl">Current Projects:</h2>
	<ul class="list-disc list-outside">
		{#each projects as project}
			<li class="project flex flex-col">
				<div>{project.name}</div>
				<div>{project.language}</div>
				{#if project.url}
					<a class="underline" href={project.url}>Link</a>
				{/if}
				{#if project.source}
					<a class="underline" href={project.source}>Github</a>
				{/if}
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.root > * {
		align-self: center;
		text-align: center;
	}

	.spin {
		animation: spin 5s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
