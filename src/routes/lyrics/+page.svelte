<script lang="ts">
	/// <reference types="spotify-web-playback-sdk" />
	import { browser } from '$app/environment';
	import { PUBLIC_AUTH_SPOTIFY_ID } from '$env/static/public';
	import { default as LilysSpotifyApi } from '$lib/spotify.svelte';
	import type {
		Lyrics,
		LyricsSyllableSynced,
		LyricsSynced,
		LyricsUnsynced
	} from '$lib/types/spotify.js';
	import { SpotifyApi } from '@spotify/web-api-ts-sdk';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	const { data } = $props();

	const lilysSpotifyApi = new LilysSpotifyApi(undefined, data.spotify);

	let spotifyPlayer: Spotify.Player | null = $state(null);

	let spotifyApi: SpotifyApi | null = $state(null);

	let playerReady = $state(false);
	let spotifyPlaybackReady = $derived(!!spotifyApi && playerReady);
	let deviceId = $state<string | null>(null);
	$effect(() => {
		console.log(spotifyPlayer);
		if (spotifyPlayer) {
			spotifyPlayer.addListener('ready', ({ device_id }) => {
				console.log('Player is ready');
				deviceId = device_id;
				playerReady = true;
			});

			spotifyPlayer.addListener('not_ready', () => {
				console.log('Player is not ready');
				playerReady = false;
			});

			spotifyPlayer.addListener('authentication_error', (err) => {
				console.log('Player authentication error', err);
			});

			spotifyPlayer.addListener('account_error', (err) => {
				console.log('Player account error', err);
			});

			spotifyPlayer.addListener('initialization_error', (err) => {
				console.log('Player initialization error', err);
			});

			spotifyPlayer.addListener('playback_error', (err) => {
				console.log('Player playback error', err);
			});

			spotifyPlayer.addListener('player_state_changed', (state) => {
				console.log('Player state changed', state);
			});

			spotifyPlayer.connect();
		}
	});

	const backgroundImage = $derived(
		lilysSpotifyApi.item?.uri.startsWith('spotify:local')
			? `https://localfiles.lvna.gay/${lilysSpotifyApi.item.uri}/image`
			: lilysSpotifyApi.item?.album.images[0].url
	);

	const playCurrentSong = async () => {
		if (!spotifyApi) return;
		if (!spotifyPlayer) return;
		if (!deviceId) return;
		if (!lilysSpotifyApi.item) return;
		const currentDeviceId = await spotifyApi.player.getPlaybackState();
		if (currentDeviceId?.device?.id !== deviceId) {
			if (currentDeviceId?.device?.id) {
				spotifyApi.player.pausePlayback(currentDeviceId.device.id!);
			}
			spotifyApi.player.transferPlayback([deviceId]);
			spotifyApi.player.startResumePlayback(deviceId, undefined, [lilysSpotifyApi.item.uri]);
		}
	};

	$effect(() => {
		lilysSpotifyApi.isPlaying;
		lilysSpotifyApi.item?.uri;
		spotifyPlayer?.getCurrentState().then((state) => {
			if (state?.paused === false) {
				if (lilysSpotifyApi.isPlaying && lilysSpotifyApi.item?.uri) {
					spotifyApi?.player.startResumePlayback(deviceId!, undefined, [lilysSpotifyApi.item.uri]);
				} else {
					spotifyApi?.player.pausePlayback(deviceId!);
				}
			}
		});
	});

	$effect(() => {
		lilysSpotifyApi.lyrics;
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
		lilysSpotifyApi.currentLyric;
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

	onMount(() => {
		window.onSpotifyWebPlaybackSDKReady = () => {
			console.log('Spotify Web Playback SDK is ready');
			if (data.session.accessToken) {
				console.log(data.session.accessToken);
				spotifyPlayer = new window.Spotify.Player({
					name: "Lily's Website",
					getOAuthToken: (cb: (token: string) => void) => {
						cb(data.session.accessToken!);
					},
					volume: 0.5
				});

				spotifyApi = SpotifyApi.withAccessToken(PUBLIC_AUTH_SPOTIFY_ID, {
					access_token: data.session.accessToken!,

					token_type: 'Bearer',

					expires_in: 3600,
					refresh_token: ''
				});
			}
		};

		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		document.body.appendChild(script);
	});
</script>

<div class="root w-full h-content">
	<div class="bkgcontainer">
		<img class="background" src={backgroundImage} alt="Background for lyrics page" />
	</div>
	<div class="container mx-auto max-w-screen-md h-content">
		{#if lilysSpotifyApi.lyrics}
			{#if lilysSpotifyApi.lyrics.syncType === 'UNSYNCED'}
				UNSYNCED
			{:else}
				<div class="lyrics" class:hasOpposite={lilysSpotifyApi.lyricsHaveOpposite}>
					{#each lilysSpotifyApi.lyrics.lines as line}
						<div class="w-full">
							{#if lilysSpotifyApi.lyrics.syncType === 'LINE_SYNCED'}
								{#if 'text' in line}
									<div
										class="line"
										class:opposite={line.opposite}
										class:past={lilysSpotifyApi.lineIsPast(line)}
										class:current={lilysSpotifyApi.currentLyric === line}
									>
										<div class="text" class:opposite={line.opposite}>
											{line.text}
										</div>
									</div>
								{/if}
							{:else if 'background' in line || 'lead' in line}
								<div
									class="line syllable"
									class:opposite={line.opposite}
									class:past={lilysSpotifyApi.lineIsPast(line)}
									class:current={lilysSpotifyApi.currentLyric === line}
								>
									<div class="syllable flex flex-row w-full">
										{#each line.background || [] as bkg}
											<div
												class="text bkg"
												class:currentSyllable={lilysSpotifyApi.currentLyric === line &&
													lilysSpotifyApi.currentSyllables?.back.includes(bkg)}
												class:part={bkg.part}
											>
												{#if bkg === line.background![0]}
													(
												{/if}
												{bkg.words}

												{#if bkg === line.background![line.background!.length - 1]}
													)
												{/if}
											</div>
										{/each}
									</div>
									<div class="syllable flex flex-row w-full">
										{#each line.lead || [] as lead}
											<div
												class="text lead"
												class:currentSyllable={lilysSpotifyApi.currentLyric === line &&
													lilysSpotifyApi.currentSyllables?.front.includes(lead)}
												class:part={lead.part}
											>
												{lead.words}
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>

	<div class="controls">
		{#if spotifyPlaybackReady}
			<button onclick={playCurrentSong}>Listen Along</button>
		{:else}
			<button onclick={() => (window.location.href = '/auth/signin')}>Listen Along</button>
		{/if}
	</div>
</div>

<style lang="postcss">
	.controls {
		position: fixed;
		bottom: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 10px;
		z-index: 100;
	}

	.h-content {
		height: fit-content;
	}
	.line {
		display: flex;
		flex-direction: column;
		width: 100%;

		flex-wrap: wrap;
	}

	.line .syllable {
		flex-wrap: wrap;
	}

	.lyrics:not(.hasOpposite) .line .syllable {
		justify-content: center;
	}
	.lyrics:not(.hasOpposite) .line {
		text-align: center;
	}

	.line.syllable .text:not(.part) {
		margin-right: 10px;
	}

	.text {
		font-size: 1rem;
		transition: font-size 0.5s;
	}

	.hasOpposite .line {
		width: 90%;
		justify-content: flex-start;
	}
	.line.opposite .syllable {
		justify-content: flex-end;
	}

	.text.bkg {
		font-size: 0.8rem;
	}

	.current .text {
		font-size: 2.5rem;
	}

	.current .text.bkg {
		font-size: 1.5rem;
	}

	.line {
		transition: text-sha;
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

	.past .text.bkg {
		font-size: 1.2rem;
	}

	.bkgcontainer {
		position: fixed;
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

		gap: 15px;
	}

	.lyrics p {
		font-size: 2rem;
	}

	.lyrics p.current {
		font-size: 2.5rem;
	}
</style>
