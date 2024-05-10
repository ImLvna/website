import type { Session } from '@auth/sveltekit';

export type ExtendedSession = Session & {
	accessToken: string;
};
