/**
 * Playlist Controller
 * Higher-level playlist operations including analysis and curation
 */

import QuickLRU from 'quick-lru';
import pLimit from 'p-limit';
import { logger } from './logging.js';
import { InvalidArgumentError, NotFoundError } from './error.js';

// Cache for audio features
const audioFeaturesCache = new QuickLRU({ maxSize: 1000 });

// Limit concurrent API requests
const limit = pLimit(4);

export class PlaylistController {
  constructor(spotifyWebController) {
    this.spotify = spotifyWebController;
  }

  /**
   * Get audio features for multiple tracks with caching and batching
   */
  async getAudioFeaturesWithCache(trackIds) {
    const uncachedIds = [];
    const result = {};

    // Check cache first
    for (const id of trackIds) {
      const cached = audioFeaturesCache.get(id);
      if (cached) {
        result[id] = cached;
      } else {
        uncachedIds.push(id);
      }
    }

    if (uncachedIds.length === 0) {
      return result;
    }

    // Fetch uncached features in batches of 50 (Spotify API limit)
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < uncachedIds.length; i += batchSize) {
      batches.push(uncachedIds.slice(i, i + batchSize));
    }

    // Fetch batches in parallel with concurrency limit
    const batchResults = await Promise.all(
      batches.map((batch) =>
        limit(async () => {
          try {
            const data = await this.spotify.getAudioFeaturesForTracks(batch);
            return data.body.audio_features;
          } catch (error) {
            logger.error('batch_audio_features_failed', { batchSize: batch.length });
            return [];
          }
        })
      )
    );

    // Process results and update cache
    for (const features of batchResults) {
      for (const feature of features) {
        if (feature && feature.id) {
          audioFeaturesCache.set(feature.id, feature);
          result[feature.id] = feature;
        }
      }
    }

    return result;
  }

  /**
   * Analyze a playlist's audio features and statistics
   */
  async analyzePlaylist(playlistId) {
    logger.info('analyzing_playlist', { playlistId });

    // Get playlist details
    const playlistData = await this.spotify.getPlaylist(playlistId);
    const playlist = playlistData.body;

    // Get all tracks (handle pagination)
    let allTracks = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const tracksData = await this.spotify.getPlaylistTracks(playlistId, { limit, offset });
      const tracks = tracksData.body.items;

      if (tracks.length === 0) break;

      allTracks = allTracks.concat(tracks);
      offset += tracks.length;

      if (tracks.length < limit) break;
    }

    const trackIds = allTracks
      .filter((item) => item.track && item.track.id)
      .map((item) => item.track.id);

    if (trackIds.length === 0) {
      throw new InvalidArgumentError('Playlist has no valid tracks');
    }

    // Get audio features
    const audioFeatures = await this.getAudioFeaturesWithCache(trackIds);
    const features = Object.values(audioFeatures).filter((f) => f);

    if (features.length === 0) {
      throw new InvalidArgumentError('Unable to retrieve audio features for playlist tracks');
    }

    // Calculate statistics
    const stats = this.calculateFeatureStats(features);

    // Calculate diversity metrics
    const artists = new Set(
      allTracks.flatMap((item) => item.track?.artists?.map((a) => a.id) || [])
    );
    const albums = new Set(allTracks.map((item) => item.track?.album?.id).filter(Boolean));

    // Calculate total duration
    const totalDuration = features.reduce((sum, f) => sum + (f.duration_ms || 0), 0);
    const lengthMinutes = Math.round(totalDuration / 60000);

    // Extract release years
    const releaseYears = allTracks
      .map((item) => {
        const dateStr = item.track?.album?.release_date;
        if (!dateStr) return null;
        const year = parseInt(dateStr.substring(0, 4));
        return isNaN(year) ? null : year;
      })
      .filter((y) => y !== null);

    const yearStats =
      releaseYears.length > 0
        ? {
            mean: Math.round(releaseYears.reduce((a, b) => a + b, 0) / releaseYears.length),
            min: Math.min(...releaseYears),
            max: Math.max(...releaseYears),
          }
        : null;

    // Extract popularity
    const popularities = allTracks
      .map((item) => item.track?.popularity)
      .filter((p) => typeof p === 'number');

    const popularityStats =
      popularities.length > 0
        ? {
            mean: Math.round(popularities.reduce((a, b) => a + b, 0) / popularities.length),
            min: Math.min(...popularities),
            max: Math.max(...popularities),
          }
        : null;

    return {
      playlist: {
        name: playlist.name,
        description: playlist.description || '',
        owner: playlist.owner?.display_name || 'Unknown',
        public: playlist.public,
        collaborative: playlist.collaborative,
      },
      counts: {
        tracks: trackIds.length,
        artists: artists.size,
        albums: albums.size,
      },
      audio_feature_stats: stats,
      diversity: {
        artist_ratio: artists.size / trackIds.length,
        album_ratio: albums.size / trackIds.length,
      },
      length_minutes: lengthMinutes,
      popularity: popularityStats,
      release_year: yearStats,
    };
  }

  /**
   * Calculate statistics for audio features
   */
  calculateFeatureStats(features) {
    const featureNames = [
      'danceability',
      'energy',
      'valence',
      'tempo',
      'acousticness',
      'instrumentalness',
      'liveness',
      'speechiness',
      'loudness',
    ];

    const stats = {};

    for (const name of featureNames) {
      const values = features.map((f) => f[name]).filter((v) => typeof v === 'number');

      if (values.length === 0) continue;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      // Calculate standard deviation
      const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
      const stddev = Math.sqrt(variance);

      stats[name] = {
        mean: Math.round(mean * 1000) / 1000,
        stddev: Math.round(stddev * 1000) / 1000,
        min: Math.round(min * 1000) / 1000,
        max: Math.round(max * 1000) / 1000,
      };
    }

    return stats;
  }

  /**
   * Add tracks to playlist with deduplication
   */
  async addTracksWithDedup(playlistId, trackUris, deduplicate = true) {
    if (!deduplicate) {
      // Add in batches of 100 (Spotify limit)
      const batchSize = 100;
      let added = 0;

      for (let i = 0; i < trackUris.length; i += batchSize) {
        const batch = trackUris.slice(i, i + batchSize);
        await this.spotify.addTracksToPlaylist(playlistId, batch);
        added += batch.length;
      }

      return { added, skipped: 0 };
    }

    // Get existing tracks
    const existingTracks = await this.getPlaylistTrackUris(playlistId);
    const existingSet = new Set(existingTracks);

    // Filter out duplicates
    const newUris = trackUris.filter((uri) => !existingSet.has(uri));

    // Add new tracks in batches
    const batchSize = 100;
    let added = 0;

    for (let i = 0; i < newUris.length; i += batchSize) {
      const batch = newUris.slice(i, i + batchSize);
      await this.spotify.addTracksToPlaylist(playlistId, batch);
      added += batch.length;
    }

    return {
      added,
      skipped: trackUris.length - newUris.length,
    };
  }

  /**
   * Get all track URIs from a playlist
   */
  async getPlaylistTrackUris(playlistId) {
    const allUris = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const data = await this.spotify.getPlaylistTracks(playlistId, { limit, offset });
      const tracks = data.body.items;

      if (tracks.length === 0) break;

      const uris = tracks.map((item) => item.track?.uri).filter(Boolean);
      allUris.push(...uris);

      offset += tracks.length;

      if (tracks.length < limit) break;
    }

    return allUris;
  }
}
