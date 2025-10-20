#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyWebController } from './spotifyWebController.js';
import { PlaylistController } from './playlistController.js';
import { logger } from './logging.js';
import { handleError, McpToolError, InvalidArgumentError } from './error.js';
import { validateRequired, validateString, validateNumber, validateArray } from './validation.js';

class SpotifyMcpServer {
  constructor() {
    this.server = new Server(
      { name: 'spotify-mcpb', version: '0.2.2' },
      { capabilities: { tools: {} } }
    );
    
    this.spotifyController = new SpotifyWebController();
    this.playlistController = new PlaylistController(this.spotifyController);
    
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'spotify_play',
          description: 'Resume playback on the active Spotify device',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'spotify_pause',
          description: 'Pause playback on the active Spotify device',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'spotify_next_track',
          description: 'Skip to the next track',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'spotify_previous_track',
          description: 'Skip to the previous track',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'spotify_set_volume',
          description: 'Set the volume (0-100)',
          inputSchema: {
            type: 'object',
            properties: { volume: { type: 'number', minimum: 0, maximum: 100 } },
            required: ['volume']
          }
        },
        {
          name: 'spotify_get_current_track',
          description: 'Get information about the currently playing track',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'spotify_get_playback_state',
          description: 'Get the current playback state',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'spotify_search_tracks',
          description: 'Search for tracks on Spotify',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', minLength: 1 },
              limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
            },
            required: ['query']
          }
        },
        {
          name: 'spotify_create_playlist',
          description: 'Create a new playlist',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 100 },
              description: { type: 'string', maxLength: 300 },
              public: { type: 'boolean', default: true }
            },
            required: ['name']
          }
        },
        {
          name: 'spotify_add_tracks_to_playlist',
          description: 'Add tracks to a playlist with deduplication',
          inputSchema: {
            type: 'object',
            properties: {
              playlist_id: { type: 'string', minLength: 1 },
              track_uris: { type: 'array', items: { type: 'string' }, minItems: 1 }
            },
            required: ['playlist_id', 'track_uris']
          }
        },
        {
          name: 'spotify_get_playlist',
          description: 'Get playlist details',
          inputSchema: {
            type: 'object',
            properties: { playlist_id: { type: 'string', minLength: 1 } },
            required: ['playlist_id']
          }
        },
        {
          name: 'spotify_get_user_playlists',
          description: 'Get the current user\'s playlists',
          inputSchema: {
            type: 'object',
            properties: { limit: { type: 'number', minimum: 1, maximum: 50, default: 20 } },
            required: []
          }
        },
        {
          name: 'spotify_get_recommendations',
          description: 'Get track recommendations based on seeds and audio features',
          inputSchema: {
            type: 'object',
            properties: {
              seed_tracks: { type: 'array', items: { type: 'string' } },
              seed_artists: { type: 'array', items: { type: 'string' } },
              seed_genres: { type: 'array', items: { type: 'string' } },
              limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
              target_acousticness: { type: 'number', minimum: 0, maximum: 1 },
              target_danceability: { type: 'number', minimum: 0, maximum: 1 },
              target_energy: { type: 'number', minimum: 0, maximum: 1 },
              target_valence: { type: 'number', minimum: 0, maximum: 1 },
              target_tempo: { type: 'number', minimum: 0 }
            },
            required: []
          }
        },
        {
          name: 'spotify_get_audio_features',
          description: 'Get audio features for tracks',
          inputSchema: {
            type: 'object',
            properties: { track_ids: { type: 'array', items: { type: 'string' }, minItems: 1 } },
            required: ['track_ids']
          }
        },
        {
          name: 'spotify_analyze_playlist',
          description: 'Analyze a playlist\'s audio features and statistics',
          inputSchema: {
            type: 'object',
            properties: { playlist_id: { type: 'string', minLength: 1 } },
            required: ['playlist_id']
          }
        },
        {
          name: 'spotify_get_refresh_token',
          description: 'Generate a Spotify refresh token for authentication. Step 1: Call with client_id and client_secret to get authorization URL. Step 2: Visit the URL in browser, authorize, then call again with the authorization_code from the redirect URL to get the refresh token.',
          inputSchema: {
            type: 'object',
            properties: {
              client_id: { type: 'string', minLength: 1, description: 'Spotify Client ID from Developer Dashboard' },
              client_secret: { type: 'string', minLength: 1, description: 'Spotify Client Secret from Developer Dashboard' },
              authorization_code: { type: 'string', description: 'Optional: The authorization code from the redirect URL after user authorizes the app' }
            },
            required: ['client_id', 'client_secret']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        switch (name) {
          case 'spotify_play': return await this.handlePlay();
          case 'spotify_pause': return await this.handlePause();
          case 'spotify_next_track': return await this.handleNextTrack();
          case 'spotify_previous_track': return await this.handlePreviousTrack();
          case 'spotify_set_volume': return await this.handleSetVolume(args);
          case 'spotify_get_current_track': return await this.handleGetCurrentTrack();
          case 'spotify_get_playback_state': return await this.handleGetPlaybackState();
          case 'spotify_search_tracks': return await this.handleSearchTracks(args);
          case 'spotify_create_playlist': return await this.handleCreatePlaylist(args);
          case 'spotify_add_tracks_to_playlist': return await this.handleAddTracksToPlaylist(args);
          case 'spotify_get_playlist': return await this.handleGetPlaylist(args);
          case 'spotify_get_user_playlists': return await this.handleGetUserPlaylists(args);
          case 'spotify_get_recommendations': return await this.handleGetRecommendations(args);
          case 'spotify_get_audio_features': return await this.handleGetAudioFeatures(args);
          case 'spotify_analyze_playlist': return await this.handleAnalyzePlaylist(args);
          case 'spotify_get_refresh_token': return await this.handleGetRefreshToken(args);
          default:
            throw new InvalidArgumentError(`Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpToolError) {
          return error.toResponse();
        }
        return handleError(error).toResponse();
      }
    });
  }

  async handlePlay() {
    this.spotifyController.ensureReady();
    await this.spotifyController.play();
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'playing' }) }] };
  }

  async handlePause() {
    this.spotifyController.ensureReady();
    await this.spotifyController.pause();
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'paused' }) }] };
  }

  async handleNextTrack() {
    this.spotifyController.ensureReady();
    await this.spotifyController.skipToNext();
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'skipped to next track' }) }] };
  }

  async handlePreviousTrack() {
    this.spotifyController.ensureReady();
    await this.spotifyController.skipToPrevious();
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'skipped to previous track' }) }] };
  }

  async handleSetVolume(args) {
    this.spotifyController.ensureReady();
    validateRequired(args, ['volume']);
    validateNumber(args.volume, 'volume', 0, 100, true);
    await this.spotifyController.setVolume(Math.round(args.volume));
    return { content: [{ type: 'text', text: JSON.stringify({ volume: args.volume }) }] };
  }

  async handleGetCurrentTrack() {
    this.spotifyController.ensureReady();
    const track = await this.spotifyController.getCurrentTrack();
    return { content: [{ type: 'text', text: JSON.stringify(track) }] };
  }

  async handleGetPlaybackState() {
    this.spotifyController.ensureReady();
    const state = await this.spotifyController.getPlaybackState();
    return { content: [{ type: 'text', text: JSON.stringify(state) }] };
  }

  async handleSearchTracks(args) {
    this.spotifyController.ensureReady();
    validateRequired(args, ['query']);
    validateString(args.query, 'query', 1);
    const limit = args.limit || 20;
    validateNumber(limit, 'limit', 1, 50, true);
    const tracks = await this.spotifyController.searchTracks(args.query, limit);
    return { content: [{ type: 'text', text: JSON.stringify({ tracks }) }] };
  }

  async handleCreatePlaylist(args) {
    this.spotifyController.ensureReady();
    validateRequired(args, ['name']);
    validateString(args.name, 'name', 1, 100);
    if (args.description) {
      validateString(args.description, 'description', 0, 300);
    }
    const playlist = await this.spotifyController.createPlaylist(
      args.name,
      args.description || '',
      args.public !== false
    );
    return { content: [{ type: 'text', text: JSON.stringify(playlist) }] };
  }

  async handleAddTracksToPlaylist(args) {
    this.spotifyController.ensureReady();
    validateRequired(args, ['playlist_id', 'track_uris']);
    validateString(args.playlist_id, 'playlist_id', 1);
    validateArray(args.track_uris, 'track_uris', 1);
    const result = await this.playlistController.addTracksWithDedup(
      args.playlist_id,
      args.track_uris
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }

  async handleGetPlaylist(args) {
    this.spotifyController.ensureReady();
    validateRequired(args, ['playlist_id']);
    validateString(args.playlist_id, 'playlist_id', 1);
    const playlist = await this.spotifyController.getPlaylist(args.playlist_id);
    return { content: [{ type: 'text', text: JSON.stringify(playlist) }] };
  }

  async handleGetUserPlaylists(args) {
    this.spotifyController.ensureReady();
    const limit = args?.limit || 20;
    validateNumber(limit, 'limit', 1, 50, true);
    const playlists = await this.spotifyController.getUserPlaylists(limit);
    return { content: [{ type: 'text', text: JSON.stringify({ playlists }) }] };
  }

  async handleGetRecommendations(args) {
    this.spotifyController.ensureReady();
    const options = {
      seed_tracks: args?.seed_tracks || [],
      seed_artists: args?.seed_artists || [],
      seed_genres: args?.seed_genres || [],
      limit: args?.limit || 20
    };
    
    if (args?.target_acousticness !== undefined) options.target_acousticness = args.target_acousticness;
    if (args?.target_danceability !== undefined) options.target_danceability = args.target_danceability;
    if (args?.target_energy !== undefined) options.target_energy = args.target_energy;
    if (args?.target_valence !== undefined) options.target_valence = args.target_valence;
    if (args?.target_tempo !== undefined) options.target_tempo = args.target_tempo;
    
    const recommendations = await this.spotifyController.getRecommendations(options);
    return { content: [{ type: 'text', text: JSON.stringify(recommendations) }] };
  }

  async handleGetAudioFeatures(args) {
    this.spotifyController.ensureReady();
    validateRequired(args, ['track_ids']);
    validateArray(args.track_ids, 'track_ids', 1);
    const features = await this.playlistController.getAudioFeaturesWithCache(args.track_ids);
    return { content: [{ type: 'text', text: JSON.stringify({ features }) }] };
  }

  async handleAnalyzePlaylist(args) {
    this.spotifyController.ensureReady();
    validateRequired(args, ['playlist_id']);
    validateString(args.playlist_id, 'playlist_id', 1);
    const analysis = await this.playlistController.analyzePlaylist(args.playlist_id);
    return { content: [{ type: 'text', text: JSON.stringify(analysis) }] };
  }

  async handleGetRefreshToken(args) {
    // This tool works independently - no need for main controller initialization
    validateRequired(args, ['client_id', 'client_secret']);
    validateString(args.client_id, 'client_id', 1);
    validateString(args.client_secret, 'client_secret', 1);

    const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
    
    // Create a separate Spotify API instance for token generation
    const spotifyApi = new SpotifyWebApi({
      clientId: args.client_id,
      clientSecret: args.client_secret,
      redirectUri: REDIRECT_URI,
    });

    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-top-read',
    ];

    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    
    const result = {
      step: 1,
      message: 'Authorization required. Please visit the URL below in your browser, authorize the app, and you will be redirected to a URL with a code parameter.',
      authorization_url: authorizeURL,
      instructions: [
        '1. Visit the authorization_url above in your web browser',
        '2. Log in to Spotify and authorize the application',
        '3. You will be redirected to http://127.0.0.1:8888/callback?code=...',
        '4. Copy the entire URL you were redirected to',
        '5. Call this tool again with: client_id, client_secret, and the authorization_code from the URL'
      ],
      next_step: 'Once you have the authorization code from the redirect URL, call this tool again with the "authorization_code" parameter included'
    };

    // If authorization_code is provided, exchange it for tokens
    if (args.authorization_code) {
      try {
        const data = await spotifyApi.authorizationCodeGrant(args.authorization_code);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              refresh_token: data.body.refresh_token,
              access_token: data.body.access_token,
              expires_in: data.body.expires_in,
              message: 'Success! Save the refresh_token to your .env file or bundle configuration as SPOTIFY_REFRESH_TOKEN',
              instructions: [
                '1. Copy the refresh_token value above',
                '2. Add it to your .env file as: SPOTIFY_REFRESH_TOKEN=<your_token>',
                '3. You can now use all Spotify tools'
              ]
            }, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        let helpText = 'Make sure the authorization code is valid and hasn\'t been used already.';
        
        if (errorMessage.includes('invalid_grant')) {
          helpText = 'The authorization code has expired or been used already. Please get a new code by visiting the authorization URL again.';
        } else if (errorMessage.includes('invalid_client')) {
          helpText = 'Invalid client credentials. Please check your Client ID and Client Secret.';
        }
        
        throw new InvalidArgumentError(`Failed to exchange authorization code: ${errorMessage}. ${helpText}`);
      }
    }

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async run() {
    try {
      await this.spotifyController.initialize();
      logger.info('server_started', { name: 'spotify-mcpb', version: '0.2.2' });
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    } catch (error) {
      logger.error('server_failed_to_start', { error: error.message });
      process.exit(1);
    }
  }
}

const server = new SpotifyMcpServer();
server.run();
