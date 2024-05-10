<script lang="ts">
	import { browser } from '$app/environment';
	import Spotify from '$lib/spotify.svelte';
	import type {
		Lyrics,
		LyricsSyllableSynced,
		LyricsSynced,
		LyricsUnsynced
	} from '$lib/types/spotify.js';
	import { onMount } from 'svelte';

	const { data } = $props();

	const spotify = new Spotify(undefined, data.spotify);

	const backgroundImage = $derived(
		spotify.item?.uri.startsWith('spotify:local')
			? `https://localfiles.lvna.gay/${spotify.item.uri}/image`
			: spotify.item?.album.images[0].url
	);

	$effect(() => {
		spotify.lyrics;
		const lyrics = document.querySelector('.lyrics');
		const currentLyric = lyrics?.querySelector('.line.current') as HTMLDivElement | undefined;
		if (currentLyric) {
			currentLyric.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		}
	});

	$effect(() => {
		spotify.currentLyric;
		// Scroll to the last element matching .line.current
		if (browser) {
			const lyrics = document.querySelector('.lyrics');
			const currentLyric = lyrics?.querySelector('.line.current') as HTMLDivElement | undefined;

			if (currentLyric) {
				// Only scroll if the currentLyric is in the viewport
				const rect = currentLyric.getBoundingClientRect();
				const top = rect.top; // Offset from the top of the viewport
				const bottom = rect.bottom; // Offset from the bottom of the viewport
				const height = window.innerHeight;

				if (top >= 0 && bottom >= 0 && top < height && bottom < height) {
					currentLyric.scrollIntoView({
						behavior: 'smooth',
						block: 'center'
					});
				}
			}
		}
	});
</script>

<div class="root w-full h-full">
	<div class="bkgcontainer">
		<img class="background" src={backgroundImage} alt="Background for lyrics page" />
	</div>
	<div class="container mx-auto max-w-screen-md">
		{#if spotify.lyrics}
			{#if spotify.lyrics.syncType === 'UNSYNCED'}
				UNSYNCED
			{:else}
				<div class="lyrics">
					{#each spotify.lyrics.lines as line}
						<div>
							{#if spotify.lyrics.syncType === 'LINE_SYNCED'}
								{#if 'text' in line}
									<div
										class="line"
										class:past={spotify.lineIsPast(line)}
										class:current={spotify.currentLyric === line}
									>
										<div class="text">
											{line.text}
										</div>
									</div>
								{/if}
							{:else if 'background' in line || 'lead' in line}
								<div
									class="line syllable"
									class:past={spotify.lineIsPast(line)}
									class:current={spotify.currentLyric === line}
								>
									{#each line.background || [] as bkg}
										<div
											class="text bkg"
											class:currentSyllable={spotify.currentLyric === line &&
												spotify.currentSyllables?.back.includes(bkg)}
											class:part={bkg.part}
										>
											{bkg.words}
										</div>
									{/each}
									{#each line.lead || [] as lead}
										<div
											class="text lead"
											class:currentSyllable={spotify.currentLyric === line &&
												spotify.currentSyllables?.front.includes(lead)}
											class:part={lead.part}
										>
											{lead.words}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style lang="postcss">
	.line {
		display: flex;
		flex-direction: column;
	}

	.line.syllable {
		flex-direction: row;
	}

	.line.syllable :not(.part) {
		margin-right: 1rem;
	}

	.text {
		font-size: 1rem;
		transition: font-size 0.5s;
	}

	.current .text {
		font-size: 2.5rem;
	}

	.line.current:not(.syllable) .text {
		@apply glow;
	}

	.line.current .text.currentSyllable {
		@apply glow;
	}

	.glow {
		text-shadow: 0 0 10px #ffffff;
	}

	.past .text {
		font-size: 1.5rem;
	}

	.bkgcontainer {
		position: absolute;
		top: 0;
		left: 0;
		width: 5000px;
		height: 5000px;
		z-index: 1;
	}
	.background {
		/** zoomed in 2x, covers the whole screen, spinning, blurred*/
		position: absolute;
		top: -50%;
		left: -50%;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		animation: spin 20s infinite;
		filter: blur(50px);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.container {
		z-index: 2;
		position: relative;
	}

	.lyrics {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.lyrics p {
		font-size: 2rem;
	}

	.lyrics p.current {
		font-size: 2.5rem;
	}
</style>
