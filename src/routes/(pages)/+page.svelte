<script lang="ts">
	import { projects } from '$lib/projects';
	import Spotify from '$lib/spotify.svelte.js';
	import tooltip from '$lib/tooltip/index.svelte';
	import { nullsToUndefined } from '$lib/util.js';

	let { data } = $props();

	let audioSource = $state<HTMLAudioElement | null>(null);
	let audioSourcePlaying = $state(false);

	$effect(() => {
		if (audioSource) {
			audioSource.volume = 0.2;
		}
	});

	let hasPlayed = $state(false);
	const spotify = new Spotify(undefined, data.spotify);
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
	{#if spotify.item && spotify.isPlaying}
		<div class="flex flex-col w-fit gap-3 justify-center align-middle items-center">
			<h2 class="text-3xl">Currently Listening To:</h2>
			<div class="flex flex-row h-20 w-fit gap-3">
				{#if spotify.item.album?.images?.length > 0 || spotify.item.uri.startsWith('spotify:local')}
					<img
						class="rounded-full w-20 h-20 spin"
						src={spotify.item.uri.startsWith('spotify:local')
							? `https://localfiles.lvna.gay/${spotify.item.uri}/image`
							: spotify.item.album.images[0].url}
						alt="Album Cover"
					/>
				{/if}
				<div class="flex flex-col h-20 justify-center">
					<p>{spotify.item.name}</p>
					<p>{spotify.item.artists.map((a) => a.name).join(', ')}</p>
					{#if spotify.currentLyric}
						<p use:tooltip={'Lyrics!'}>
							{#if 'text' in spotify.currentLyric}
								{spotify.currentLyric.text}
							{:else}
								{spotify.currentLyric.lead?.map((l) => l.words).join(' ')}
							{/if}
						</p>
					{/if}
				</div>
				{#if spotify.item.uri.startsWith('spotify:local')}
					<audio
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
									audioSource.currentTime = spotify.progressMs! / 1000;
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
					style="width: {Math.min((spotify.progressMs! / spotify.item.duration_ms) * 100, 100)}%"
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
		<li use:tooltip={'i love you annie and sammy <3'}>Taken</li>
	</ul>
	<h2 class="text-3xl">I Know:</h2>
	<ul class="list-disc list-outside">
		{#each ['Typescript', 'Svelte', 'Python', 'React', 'Rust'] as i}
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
