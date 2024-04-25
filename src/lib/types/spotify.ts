import type { Album, Artist, PlaybackState, TrackItem } from '@spotify/web-api-ts-sdk';

export interface NowPlaying extends PlaybackState {
	item: TrackItem & {
		album: Album;
		artists: Artist[];
	};
}

/**
 * The Three below are returned depending on the syncType of the lyrics
 */

// Given when the syncType is 'UNSYNCED'
export type LyricsUnsynced = {
	lyrics: {
		syncType: 'UNSYNCED';
		lines: {
			words: string;
		}[];
	};
};

// Given when the syncType is 'LINE_SYNCED' and no endTimeMs is given
export type LyricsLineSyncedNoEndTimes = {
	lyrics: {
		syncType: 'LINE_SYNCED';
		lines: {
			startTimeMs: string;
			words: string;
		}[];
	};
};

// Given when the syncType is 'LINE_SYNCED' and endTimeMs is given
export type LyricsLineSyncedEndTimes = {
	lyrics: {
		syncType: 'LINE_SYNCED';
		lines: {
			startTimeMs: string;
			words: string;
			endTimeMs: string;
		}[];
	};
};

export type LyricsLineSynced = LyricsLineSyncedNoEndTimes | LyricsLineSyncedEndTimes;

export type Lyrics = LyricsUnsynced | LyricsLineSynced;
