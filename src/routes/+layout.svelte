<script lang="ts">
	import './style.css';
</script>

<svelte:head>
	<title>Luna's Site</title>
</svelte:head>

<div class="root bg-base text-text">
	<div class="header">
		<nav>
			<a href="/">Home</a>
			<a href="/about">About</a>
			<a href="/projects">Projects</a>
			<a href="/contact">Contact</a>
		</nav>
	</div>
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.root {
		width: 100%;
		height: 100%;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
	}
</style>
