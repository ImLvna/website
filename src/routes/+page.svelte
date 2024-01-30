<script lang="ts">
	import { projects } from '$lib/projects';
	import tooltip from '$lib/tooltip';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<div class="root flex flex-col w-full h-full">
	<img
		class="rounded-full w-40 h-40"
		src="https://cdn.discordapp.com/avatars/{data.user.id}/{data.user.avatar}.png"
		alt="Profile"
	/>
	<h1 class="text-5xl">Luna</h1>
	<p class="text-1xl py-10">
		I am a freelance programmer who works on a variety of projects. I work in many languages, but
		specialize in Typescript
	</p>
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
</style>
