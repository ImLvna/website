<script lang="ts">
	import './style.css';
</script>

<svelte:head>
	<title>Lily's Site</title>
</svelte:head>

<div class="root bg-base text-text min-h-full h-full w-full">
	<div class="content min-h-full h-content overflow-y-hidden *:w-full flex flex-col items-center">
		<slot />
	</div>
</div>

<style>
	.h-content {
		height: fit-content;
	}
</style>
