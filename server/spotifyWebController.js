/**
 * Spotify Web API Controller
 * Handles authentication, token management, and API requests
 */

import SpotifyWebApi from 'spotify-web-api-node';
import { logger } from './logging.js';
import { wrapSpotifyError, AuthError, InternalError } from './error.js';

// Token expiry buffer - refresh 5 seconds before actual expiry
const TOKEN_EXPIRY_BUFFER = 5000;

export class SpotifyWebController {
  constructor() {
    this.spotifyApi = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.userId = null;
    this.initialized = false;
  }

  /**
   * Initialize the Spotify API client with credentials
   */
  async initialize() {
    if (this.initialized) return;

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new AuthError(
        'Missing Spotify credentials. Please configure SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN.',
        {
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          hasRefreshToken: !!refreshToken,
        }
      );
    }

    this.spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      refreshToken,
    });

    // Get initial access token
    await this.refreshAccessToken();

    // Get user ID
    await this.fetchUserId();

    this.initialized = true;
    logger.info('spotify_controller_initialized', { userId: this.userId });
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken() {
    try {
      logger.debug('refreshing_access_token');

      const data = await this.spotifyApi.refreshAccessToken();
      this.accessToken = data.body.access_token;
      this.spotifyApi.setAccessToken(this.accessToken);

      // Calculate expiry time
      const expiresIn = data.body.expires_in || 3600;
      this.tokenExpiry = Date.now() + expiresIn * 1000;

      logger.info('access_token_refreshed', {
        expiresIn,
      });
    } catch (error) {
      logger.error('token_refresh_failed', { error: error.message });
      throw wrapSpotifyError(error);
    }
  }

  /**
   * Ensure access token is valid, refresh if needed
   */
  async ensureValidToken() {
    if (!this.tokenExpiry || Date.now() >= this.tokenExpiry - TOKEN_EXPIRY_BUFFER) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Fetch and cache user ID
   */
  async fetchUserId() {
    if (this.userId) return this.userId;

    try {
      const userIdEnv = process.env.SPOTIFY_USER_ID;
      if (userIdEnv) {
        this.userId = userIdEnv;
        return this.userId;
      }

      const data = await this.spotifyApi.getMe();
      this.userId = data.body.id;
      return this.userId;
    } catch (error) {
      throw wrapSpotifyError(error);
    }
  }

  /**
   * Execute API request with automatic retry on 401
   */
  async executeWithRetry(apiCall) {
    await this.ensureValidToken();

    try {
      return await apiCall();
    } catch (error) {
      // Retry once on 401
      if (error.statusCode === 401) {
        logger.warn('got_401_retrying_with_new_token');
        await this.refreshAccessToken();
        return await apiCall();
      }
      throw wrapSpotifyError(error);
    }
  }

  /**
   * Get current playback state
   */
  async getPlaybackState() {
    return this.executeWithRetry(() => this.spotifyApi.getMyCurrentPlaybackState());
  }

  /**
   * Get currently playing track
   */
  async getCurrentTrack() {
    return this.executeWithRetry(() => this.spotifyApi.getMyCurrentPlayingTrack());
  }

  /**
   * Play
   */
  async play(options = {}) {
    return this.executeWithRetry(() => this.spotifyApi.play(options));
  }

  /**
   * Pause
   */
  async pause() {
    return this.executeWithRetry(() => this.spotifyApi.pause());
  }

  /**
   * Skip to next track
   */
  async skipToNext() {
    return this.executeWithRetry(() => this.spotifyApi.skipToNext());
  }

  /**
   * Skip to previous track
   */
  async skipToPrevious() {
    return this.executeWithRetry(() => this.spotifyApi.skipToPrevious());
  }

  /**
   * Set volume (0-100)
   */
  async setVolume(volumePercent) {
    return this.executeWithRetry(() => this.spotifyApi.setVolume(volumePercent));
  }

  /**
   * Search for tracks
   */
  async searchTracks(query, options = {}) {
    const { limit = 20, market = 'US' } = options;
    return this.executeWithRetry(() =>
      this.spotifyApi.searchTracks(query, { limit, market })
    );
  }

  /**
   * Create a playlist
   */
  async createPlaylist(name, options = {}) {
    const { description = '', isPublic = false } = options;

    return this.executeWithRetry(() =>
      this.spotifyApi.createPlaylist(name, {
        description,
        public: isPublic,
      })
    );
  }

  /**
   * Add tracks to playlist
   */
  async addTracksToPlaylist(playlistId, trackUris) {
    return this.executeWithRetry(() =>
      this.spotifyApi.addTracksToPlaylist(playlistId, trackUris)
    );
  }

  /**
   * Get playlist
   */
  async getPlaylist(playlistId, options = {}) {
    const { market = 'US', fields } = options;
    return this.executeWithRetry(() =>
      this.spotifyApi.getPlaylist(playlistId, { market, fields })
    );
  }

  /**
   * Get playlist tracks
   */
  async getPlaylistTracks(playlistId, options = {}) {
    const { limit = 100, offset = 0, market = 'US' } = options;
    return this.executeWithRetry(() =>
      this.spotifyApi.getPlaylistTracks(playlistId, { limit, offset, market })
    );
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(options = {}) {
    const userId = await this.fetchUserId();
    const { limit = 50, offset = 0 } = options;

    return this.executeWithRetry(() =>
      this.spotifyApi.getUserPlaylists(userId, { limit, offset })
    );
  }

  /**
   * Get recommendations
   * Note: This API is marked as deprecated by Spotify. Monitor for future changes.
   */
  async getRecommendations(options = {}) {
    logger.warn('recommendations_api_deprecated', {
      message: 'Spotify recommendations API is deprecated. Monitor for future changes.'
    });
    return this.executeWithRetry(() => this.spotifyApi.getRecommendations(options));
  }

  /**
   * Get audio features for tracks
   */
  async getAudioFeaturesForTracks(trackIds) {
    return this.executeWithRetry(() =>
      this.spotifyApi.getAudioFeaturesForTracks(trackIds)
    );
  }

  /**
   * Get audio features for a single track
   */
  async getAudioFeaturesForTrack(trackId) {
    return this.executeWithRetry(() => this.spotifyApi.getAudioFeaturesForTrack(trackId));
  }
}
