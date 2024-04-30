<script lang="ts">
	import { projects } from '$lib/projects';
	import tooltip from '$lib/tooltip/index.svelte';
	import { type Lyrics, type LyricsLineSyncedEndTimes } from '$lib/types/spotify';
	import { onMount } from 'svelte';

	let { data } = $props();

	let audioSource = $state<HTMLAudioElement | null>(null);
	let audioSourcePlaying = $state(false);
	let hasPlayed = $state(false);
	let nowPlaying = $state(data.nowPlaying);
	let curTimeMs = $state<number | null>(data.nowPlaying?.progress_ms ?? null);
	let nextFetchTime = $derived.by(() => {
		let then = 5000;
		if (nowPlaying?.is_playing && nowPlaying?.item) {
			then = Math.min(then, nowPlaying.item.duration_ms - nowPlaying.progress_ms);
		}
		return then + Date.now();
	});
	let lyrics = $state<Lyrics | null>(data.lyrics ?? null);
	const currentLyric = $derived.by(() => {
		if (!lyrics || !lyrics.lyrics) return null;
		if (!curTimeMs) return null;
		if (!nowPlaying?.is_playing) return null;
		if (lyrics.lyrics.syncType === 'UNSYNCED') return null;
		if (lyrics.lyrics.lines.length === 0) return null;

		const before = lyrics.lyrics.lines.filter(
			(l) => Number(l.startTimeMs) <= curTimeMs!
		) as LyricsLineSyncedEndTimes['lyrics']['lines'];

		// No endTimeMs
		if (!Object.keys(lyrics.lyrics.lines[0]).includes('endTimeMs')) {
			if (before.length === 0) return '';
			const match = before[before.length - 1];
			return match.words === '♪' ? '' : match.words;
		}

		const match = (before as LyricsLineSyncedEndTimes['lyrics']['lines']).find(
			(l) => Number(l.endTimeMs) >= curTimeMs!
		);

		if (!match) return '';
		return match.words === '♪' ? '' : match.words;
	});

	$effect(() => {
		if (nowPlaying) curTimeMs = nowPlaying.progress_ms;
	});

	$effect(() => {
		if (nowPlaying?.item?.uri.startsWith('spotify:local') && audioSource) {
			const audioSourceTarget = `https://localfiles.lvna.gay/${nowPlaying.item.uri}`;
			console.log(audioSourceTarget, audioSource.src);
			if (audioSource.src !== audioSourceTarget) {
				audioSource.src = audioSourceTarget;
				audioSource.load();
				if (nowPlaying.is_playing && hasPlayed) audioSource.play();
			}
		}
	});

	async function getLyrics() {
		if (!nowPlaying?.item) return;
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

			try {
				if (audioSource && nowPlaying?.is_playing) {
					const diff = Math.abs(nowPlaying.progress_ms / 1000 - audioSource.currentTime);
					if (diff > 1000) {
						console.log('Seeking audio, diff:', diff);
						audioSource.currentTime = nowPlaying.progress_ms / 5000;
					}
					if (hasPlayed) audioSource.play();
				} else if (audioSource) {
					audioSource.pause();
				}
			} catch (e) {
				console.error(e);
			}

			if (oldNowPlaying && oldNowPlaying.item?.id !== nowPlaying?.item?.id) {
				lyrics = null;
				await getLyrics();
			}
			setTimeout(fetchNowPlaying, nextFetchTime - Date.now());
		};

		setTimeout(fetchNowPlaying, nextFetchTime - Date.now());

		setInterval(() => {
			if (curTimeMs === null) return;
			if (!nowPlaying?.is_playing) return;
			curTimeMs += 250;
		}, 250);
	});
</script>

<div class="root flex flex-col w-full h-full gap-3">
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
	{#if nowPlaying && nowPlaying.item && nowPlaying.is_playing}
		<div class="flex flex-col w-fit gap-3 justify-center align-middle items-center">
			<h2 class="text-3xl">Currently Listening To:</h2>
			<div class="flex flex-row h-20 w-fit gap-3">
				{#if nowPlaying.item.album?.images?.length > 0 || nowPlaying.item.uri.startsWith('spotify:local')}
					<img
						class="rounded-full w-20 h-20 spin"
						src={nowPlaying.item.uri.startsWith('spotify:local')
							? `https://localfiles.lvna.gay/${nowPlaying.item.uri}/image`
							: nowPlaying.item.album.images[0].url}
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
				{#if nowPlaying.item.uri.startsWith('spotify:local')}
					<audio
						volume={0.2}
						bind:this={audioSource}
						onplay={() => (audioSourcePlaying = true)}
						onpause={() => (audioSourcePlaying = false)}
					>
					</audio>
					{#if audioSource}
						<div class="flex flex-col h-16 w-16 text-black rounded-full bg-pink justify-center">
							<button
								onclick={() => {
								
								if (!audioSource) return;
								if (audioSource.paused) {
									audioSource.currentTime = curTimeMs! / 1000;
									hasPlayed = true;
									audioSource.play();
								} else {
									audioSource.pause();
									hasPlayed = false;
								}
							}}
							>
								{audioSourcePlaying ? 'Pause' : 'Play'}
							</button>
						</div>
					{/if}
				{/if}
			</div>
			<div class="progressbar h-3 w-full bg-slate-700">
				<div
					class="progress bg-pink h-full"
					style="width: {Math.min((curTimeMs! / nowPlaying.item.duration_ms) * 100, 100)}%"
				></div>
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
