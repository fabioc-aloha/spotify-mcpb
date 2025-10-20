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

    // Allow server to start without refresh token (needed for getting refresh token)
    // but require client_id and client_secret for basic initialization
    if (!clientId || !clientSecret) {
      logger.warn('spotify_credentials_incomplete', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRefreshToken: !!refreshToken,
        message: 'Server started with incomplete credentials. Only refresh token generation will be available.'
      });
      this.initialized = true; // Mark as initialized to prevent re-initialization attempts
      return;
    }

    this.spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      refreshToken: refreshToken || undefined, // Allow undefined refresh token
    });

    // Only get initial access token if refresh token is available
    if (refreshToken) {
      try {
        await this.refreshAccessToken();
        
        // Get user ID
        await this.fetchUserId();
        
        this.initialized = true;
        logger.info('spotify_controller_initialized', { userId: this.userId });
      } catch (error) {
        logger.error('spotify_initialization_failed', { error: error.message });
        throw new AuthError('Failed to initialize Spotify API. Please check your credentials.', { error: error.message });
      }
    } else {
      // Mark as initialized but not fully configured
      this.initialized = true;
      logger.warn('spotify_controller_partially_initialized', { 
        message: 'No refresh token provided. Only token generation tools will work.' 
      });
    }
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
   * Check if controller is fully initialized with valid credentials
   */
  isFullyInitialized() {
    return this.initialized && this.spotifyApi && process.env.SPOTIFY_REFRESH_TOKEN;
  }

  /**
   * Ensure controller is ready for API operations
   */
  ensureReady() {
    if (!this.isFullyInitialized()) {
      throw new AuthError(
        'Spotify API not fully configured. Please set SPOTIFY_REFRESH_TOKEN or use spotify_get_refresh_token tool to obtain one.'
      );
    }
  }

  /**
   * Ensure access token is valid, refresh if needed
   */
  async ensureValidToken() {
    this.ensureReady();
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
   * Play a specific playlist by ID or URI
   */
  async playPlaylist(playlistId) {
    // Convert playlist ID to context URI if needed
    let contextUri;
    if (playlistId.startsWith('spotify:playlist:')) {
      contextUri = playlistId;
    } else if (playlistId.startsWith('spotify:')) {
      contextUri = playlistId;
    } else {
      // Plain ID, convert to URI
      contextUri = `spotify:playlist:${playlistId}`;
    }

    return this.executeWithRetry(() => 
      this.spotifyApi.play({ context_uri: contextUri })
    );
  }

  /**
   * Play specific tracks by URIs
   */
  async playTracks(trackUris) {
    // Ensure all URIs are in correct format
    const formattedUris = trackUris.map(uri => {
      if (uri.startsWith('spotify:track:')) {
        return uri;
      } else if (uri.startsWith('spotify:')) {
        return uri;
      } else {
        // Plain ID, convert to URI
        return `spotify:track:${uri}`;
      }
    });

    return this.executeWithRetry(() => 
      this.spotifyApi.play({ uris: formattedUris })
    );
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

  // === USER LIBRARY MANAGEMENT ===

  /**
   * Get user's saved tracks (Liked Songs)
   */
  async getSavedTracks(options = {}) {
    const { limit = 20, offset = 0, market } = options;
    return this.executeWithRetry(() =>
      this.spotifyApi.getMySavedTracks({
        limit,
        offset,
        market
      })
    );
  }

  /**
   * Save tracks to user's library
   */
  async saveTracks(trackIds) {
    if (!Array.isArray(trackIds)) {
      trackIds = [trackIds];
    }
    return this.executeWithRetry(() => this.spotifyApi.addToMySavedTracks(trackIds));
  }

  /**
   * Remove tracks from user's library
   */
  async removeSavedTracks(trackIds) {
    if (!Array.isArray(trackIds)) {
      trackIds = [trackIds];
    }
    return this.executeWithRetry(() => this.spotifyApi.removeFromMySavedTracks(trackIds));
  }

  /**
   * Check if tracks are saved in user's library
   */
  async checkSavedTracks(trackIds) {
    if (!Array.isArray(trackIds)) {
      trackIds = [trackIds];
    }
    return this.executeWithRetry(() => this.spotifyApi.containsMySavedTracks(trackIds));
  }

  /**
   * Get user's saved albums
   */
  async getSavedAlbums(options = {}) {
    const { limit = 20, offset = 0, market } = options;
    return this.executeWithRetry(() =>
      this.spotifyApi.getMySavedAlbums({
        limit,
        offset,
        market
      })
    );
  }
}
