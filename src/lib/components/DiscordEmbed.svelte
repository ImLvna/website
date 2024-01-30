<script lang="ts">
	export let title = "Luna's Site";
	export let color = '#333300';
	export let image: string;
	export let description = 'Welcome to my site!';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />

	<meta name="theme-color" content={color} />

	<meta name="og:image" content={image} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:card" content="summary_large_image" />

	<meta property="og:description" content={description} />
	<meta name="description" content={description} />
	<meta property="twitter:description" content={description} />
</svelte:head>
