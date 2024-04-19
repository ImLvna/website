import type { Album, Artist, PlaybackState, TrackItem } from '@spotify/web-api-ts-sdk';

export interface NowPlaying extends PlaybackState {
	item: TrackItem & {
		album: Album;
		artists: Artist[];
	};
}
