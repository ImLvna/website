import { AUTH_SPOTIFY_SECRET } from '$env/static/private';
import { PUBLIC_AUTH_SPOTIFY_ID } from '$env/static/public';
import { SvelteKitAuth } from '@auth/sveltekit';
import Spotify from '@auth/sveltekit/providers/spotify';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Spotify({
			clientId: PUBLIC_AUTH_SPOTIFY_ID,
			clientSecret: AUTH_SPOTIFY_SECRET,
			authorization:
				'https://accounts.spotify.com/authorize?scope=user-read-email,streaming,user-modify-playback-state,user-read-playback-state'
		})
	],
	callbacks: {
		async session({ session, token }) {
			return {
				...session,
				accessToken: token.accessToken
			};
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
			}
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async redirect() {
			return '/lyrics';
		}
	},
	trustHost: true
});
