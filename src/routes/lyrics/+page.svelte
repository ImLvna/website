<script lang="ts">
	import Spotify from '$lib/spotify.svelte';

	const { data } = $props();

	const spotify = new Spotify(undefined, data.spotify);

	const backgroundImage = $derived(
		spotify.item?.uri.startsWith('spotify:local')
			? `https://localfiles.lvna.gay/${spotify.item.uri}/image`
			: spotify.item?.album.images[0].url
	);
</script>

<div class="root w-full h-full">
	<div class="bkgcontainer">
		<img class="background" src={backgroundImage} alt="Background for lyrics page" />
	</div>
	<div class="container mx-auto max-w-screen-md">
		{#if spotify.lyrics}
			<div class="lyrics">
				{#each spotify.lyrics.lines as line}
					<p class:current={spotify.currentLyric === line}>
						<!-- {#if spotify.lyrics.syncType === 'UNSYNCED' || spotify.lyrics.syncType === 'LINE_SYNCED'}{line.text}{/if} -->
					</p>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
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
