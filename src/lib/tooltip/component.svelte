<script lang="ts">
	export let text: string;
	export let x: number;
	export let y: number;
</script>

<div
	class="border-2 border-solid text-pink border-current bg-base rounded-md p-2 absolute flex flex-col"
	style="
		top: {y + 5}px;
		left: {x + 5}px;"
>
	{#each text.split('\n') as line}
		<span>{line}</span>
	{/each}
</div>

<style>
	:global(.tooltip_underline) {
		text-decoration: underline;
	}
</style>
