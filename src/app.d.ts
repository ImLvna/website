// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Window as spWindow, Spotify } from '@types/spotify-web-playback-sdk';
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window extends spWindow {}

	interface SpotifyWebPlayer extends Spotify {}
}

export {};
