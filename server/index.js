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
      { name: 'spotify-mcpb', version: '0.2.4' },
      { capabilities: { tools: {} } }
    );
    
    this.spotifyController = new SpotifyWebController();
    this.playlistController = new PlaylistController(this.spotifyController);
    
    // Context tracking for smart play functionality
    this.recentContext = {
      playlists: [], // Recently created/accessed playlists
      searchResults: null, // Last search results
      lastCreatedPlaylist: null // Most recently created playlist
    };
    
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'spotify_play',
          description: 'Smart play function: Resume playback (no params), play search results (with query), or play playlist by name. Auto-detects content type.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for tracks/artists, playlist name, or track URIs. Leave empty to resume playback.'
              },
              type: {
                type: 'string',
                enum: ['track', 'playlist', 'auto'],
                default: 'auto',
                description: 'Type of content to play. "auto" will auto-detect based on query.'
              }
            },
            required: []
          }
        },
        {
          name: 'spotify_play_playlist',
          description: 'Play a specific playlist by name or ID. Searches user\'s playlists by name if not an ID.',
          inputSchema: {
            type: 'object',
            properties: {
              playlist: {
                type: 'string',
                description: 'Playlist name or Spotify playlist ID'
              }
            },
            required: ['playlist']
          }
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
          description: 'Get instructions for obtaining a Spotify refresh token using the provided script. This tool provides step-by-step guidance for running the token generation script and obtaining the refresh token needed for Spotify API access.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'spotify_get_saved_tracks',
          description: 'Get user\'s saved tracks (Liked Songs) from their library. Returns paginated list of saved tracks with details.',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
              offset: { type: 'integer', minimum: 0, default: 0 },
              market: { type: 'string', pattern: '^[A-Z]{2}$' }
            },
            required: []
          }
        },
        {
          name: 'spotify_save_tracks',
          description: 'Save tracks to user\'s library (add to Liked Songs). Accepts single track ID or array of track IDs.',
          inputSchema: {
            type: 'object',
            properties: {
              track_ids: {
                oneOf: [
                  { type: 'string', minLength: 1 },
                  { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1, maxItems: 50 }
                ]
              }
            },
            required: ['track_ids']
          }
        },
        {
          name: 'spotify_remove_saved_tracks',
          description: 'Remove tracks from user\'s library (remove from Liked Songs). Accepts single track ID or array of track IDs.',
          inputSchema: {
            type: 'object',
            properties: {
              track_ids: {
                oneOf: [
                  { type: 'string', minLength: 1 },
                  { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1, maxItems: 50 }
                ]
              }
            },
            required: ['track_ids']
          }
        },
        {
          name: 'spotify_check_saved_tracks',
          description: 'Check if tracks are saved in user\'s library (are in Liked Songs). Returns boolean array indicating save status for each track.',
          inputSchema: {
            type: 'object',
            properties: {
              track_ids: {
                oneOf: [
                  { type: 'string', minLength: 1 },
                  { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1, maxItems: 50 }
                ]
              }
            },
            required: ['track_ids']
          }
        },
        {
          name: 'spotify_get_saved_albums',
          description: 'Get user\'s saved albums from their library. Returns paginated list of saved albums with details.',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
              offset: { type: 'integer', minimum: 0, default: 0 },
              market: { type: 'string', pattern: '^[A-Z]{2}$' }
            },
            required: []
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        switch (name) {
          case 'spotify_play': return await this.handlePlay(args);
          case 'spotify_play_playlist': return await this.handlePlayPlaylist(args);
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
          case 'spotify_get_saved_tracks': return await this.handleGetSavedTracks(args);
          case 'spotify_save_tracks': return await this.handleSaveTracks(args);
          case 'spotify_remove_saved_tracks': return await this.handleRemoveSavedTracks(args);
          case 'spotify_check_saved_tracks': return await this.handleCheckSavedTracks(args);
          case 'spotify_get_saved_albums': return await this.handleGetSavedAlbums(args);
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

  async handlePlay(args = {}) {
    await this.ensureReady();

    try {
      const { query, type = 'auto' } = args;

      // No query = resume playback (original behavior)
      if (!query) {
        logger.info('resuming_playback');
        await this.spotifyController.play();
        return { 
          content: [{ 
            type: 'text', 
            text: JSON.stringify({ 
              action: 'resume',
              status: 'playing',
              message: 'Resumed playback'
            }, null, 2)
          }] 
        };
      }

      logger.info('smart_play_called', { query, type });

      // Smart detection based on query and type
      if (type === 'playlist' || this.isPlaylistQuery(query)) {
        return await this.playPlaylistByQuery(query);
      } else if (type === 'track' || this.isTrackQuery(query)) {
        return await this.playTracksByQuery(query);
      } else if (type === 'auto') {
        // Auto-detect based on query characteristics
        if (this.looksLikePlaylistName(query)) {
          return await this.playPlaylistByQuery(query);
        } else {
          return await this.playTracksByQuery(query);
        }
      }

      // Fallback to track search
      return await this.playTracksByQuery(query);

    } catch (error) {
      logger.error('smart_play_failed', { error: error.message, query: args.query });
      return handleError(error, 'playing content').toResponse();
    }
  }

  // Helper: Check if query is asking for a playlist
  isPlaylistQuery(query) {
    const playlistKeywords = ['playlist', 'mix', 'radio', 'station'];
    return playlistKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  // Helper: Check if query is specifically for tracks
  isTrackQuery(query) {
    const trackKeywords = ['track', 'song', 'by ', 'artist', 'album'];
    return trackKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  // Helper: Check if query looks like a playlist name
  looksLikePlaylistName(query) {
    // If it's short and doesn't contain typical search terms, might be playlist name
    const searchTerms = [' by ', ' artist', ' track', ' song'];
    const hasSearchTerms = searchTerms.some(term => 
      query.toLowerCase().includes(term)
    );
    
    // If no search terms and reasonably short, likely a playlist name
    return !hasSearchTerms && query.length < 50;
  }

  // Helper: Play playlist by search/name
  async playPlaylistByQuery(query) {
    // First check if it matches recently created playlist
    if (this.recentContext.lastCreatedPlaylist && 
        query.toLowerCase().includes(this.recentContext.lastCreatedPlaylist.name.toLowerCase())) {
      logger.info('playing_recent_playlist', { 
        playlistName: this.recentContext.lastCreatedPlaylist.name 
      });
      
      await this.spotifyController.playPlaylist(this.recentContext.lastCreatedPlaylist.id);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({ 
            action: 'play_playlist',
            status: 'playing',
            playlist: this.recentContext.lastCreatedPlaylist,
            message: `Playing recently created playlist: ${this.recentContext.lastCreatedPlaylist.name}`
          }, null, 2)
        }] 
      };
    }

    // Search user's playlists
    const playlists = await this.spotifyController.getUserPlaylists({ limit: 50 });
    const playlist = playlists.items.find(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(p.name.toLowerCase())
    );

    if (playlist) {
      logger.info('playing_found_playlist', { playlistName: playlist.name });
      await this.spotifyController.playPlaylist(playlist.id);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({ 
            action: 'play_playlist',
            status: 'playing',
            playlist: {
              id: playlist.id,
              name: playlist.name,
              tracks: playlist.tracks.total
            },
            message: `Playing playlist: ${playlist.name}`
          }, null, 2)
        }] 
      };
    }

    throw new McpToolError('PLAYLIST_NOT_FOUND', `No playlist found matching "${query}"`);
  }

  // Helper: Play tracks by search
  async playTracksByQuery(query) {
    const searchResults = await this.spotifyController.searchTracks(query, { limit: 10 });
    
    if (!searchResults.tracks.items.length) {
      throw new McpToolError('NO_TRACKS_FOUND', `No tracks found for "${query}"`);
    }

    // Store search results in context for future reference
    this.recentContext.searchResults = {
      query,
      tracks: searchResults.tracks.items,
      timestamp: Date.now()
    };

    // Get URIs of found tracks
    const trackUris = searchResults.tracks.items.slice(0, 5).map(track => track.uri);
    
    logger.info('playing_search_results', { 
      query, 
      trackCount: trackUris.length,
      firstTrack: searchResults.tracks.items[0].name
    });

    await this.spotifyController.playTracks(trackUris);

    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({ 
          action: 'play_tracks',
          status: 'playing',
          query,
          tracks: searchResults.tracks.items.slice(0, 5).map(track => ({
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name
          })),
          message: `Playing ${trackUris.length} tracks for "${query}"`
        }, null, 2)
      }] 
    };
  }

  async handlePlayPlaylist(args) {
    await this.ensureReady();

    try {
      const { playlist } = args;
      validateRequired(args, ['playlist']);
      validateString(playlist, 'playlist', { minLength: 1 });

      logger.info('play_playlist_called', { playlist });

      // Check if it's already a Spotify ID (contains only alphanumeric characters and is long enough)
      const isSpotifyId = /^[a-zA-Z0-9]{22}$/.test(playlist);
      
      let playlistId;
      
      if (isSpotifyId || playlist.startsWith('spotify:')) {
        // Direct ID or URI
        playlistId = playlist;
        logger.info('play_playlist_direct_id', { playlistId });
      } else {
        // Search by name in user's playlists
        logger.info('play_playlist_search_by_name', { playlistName: playlist });
        
        const userPlaylists = await this.spotifyController.getUserPlaylists({ limit: 50 });
        const playlists = userPlaylists.body.items;
        
        // Find playlist by name (case-insensitive)
        const matchedPlaylist = playlists.find(p => 
          p.name.toLowerCase() === playlist.toLowerCase()
        );
        
        if (!matchedPlaylist) {
          // Try partial match if exact match fails
          const partialMatch = playlists.find(p => 
            p.name.toLowerCase().includes(playlist.toLowerCase())
          );
          
          if (!partialMatch) {
            return handleError(
              new InvalidArgumentError(`Playlist "${playlist}" not found in your playlists`),
              'finding playlist'
            ).toResponse();
          }
          
          logger.info('play_playlist_partial_match', { 
            searchTerm: playlist, 
            foundName: partialMatch.name 
          });
          playlistId = partialMatch.id;
        } else {
          logger.info('play_playlist_exact_match', { 
            searchTerm: playlist, 
            foundName: matchedPlaylist.name 
          });
          playlistId = matchedPlaylist.id;
        }
      }

      // Play the playlist
      await this.spotifyController.playPlaylist(playlistId);
      
      // Get playlist info for response
      const playlistInfo = await this.spotifyController.getPlaylist(playlistId);
      const playlist_data = playlistInfo.body;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: 'playing_playlist',
            playlist: {
              id: playlist_data.id,
              name: playlist_data.name,
              description: playlist_data.description,
              owner: playlist_data.owner.display_name,
              total_tracks: playlist_data.tracks.total,
              public: playlist_data.public,
              uri: playlist_data.uri,
              external_urls: playlist_data.external_urls
            },
            message: `Now playing playlist: ${playlist_data.name}`
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('play_playlist_failed', { error: error.message, playlist: args.playlist });
      return handleError(error, 'playing playlist').toResponse();
    }
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

    // Store in recent context for smart play functionality
    this.recentContext.lastCreatedPlaylist = {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      timestamp: Date.now()
    };
    
    // Add to recent playlists list (keep last 5)
    this.recentContext.playlists.unshift(this.recentContext.lastCreatedPlaylist);
    if (this.recentContext.playlists.length > 5) {
      this.recentContext.playlists = this.recentContext.playlists.slice(0, 5);
    }

    logger.info('playlist_created_and_stored', { 
      playlistId: playlist.id, 
      playlistName: playlist.name 
    });

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
    // This tool provides instructions for getting refresh token using the standalone script
    
    const instructions = {
      message: "📋 Spotify Refresh Token Setup Instructions",
      overview: "To use Spotify MCPB, you need to provide your refresh token during the Claude Desktop setup. Follow these steps to get your refresh token:",
      steps: [
        {
          step: 1,
          title: "Run the Token Generation Script",
          description: "Use the included script to get your refresh token",
          commands: {
            windows: "npm run get-token",
            mac_linux: "npm run get-token"
          },
          details: [
            "This will start a local server on port 8888",
            "Your browser will open automatically to Spotify's authorization page",
            "Log in to Spotify and authorize the app",
            "The script will automatically capture the token and display it"
          ]
        },
        {
          step: 2, 
          title: "Copy the Refresh Token",
          description: "The script will display your refresh token",
          action: "Copy the refresh token value (starts with 'AQ...')"
        },
        {
          step: 3,
          title: "Update Claude Desktop Configuration", 
          description: "Add the refresh token to your Spotify MCPB configuration",
          action: "Set SPOTIFY_REFRESH_TOKEN to the token value you copied"
        },
        {
          step: 4,
          title: "Start Using Spotify MCPB",
          description: "You can now use all Spotify commands!",
          examples: [
            "What's currently playing on Spotify?",
            "Create a playlist called 'My AI Playlist'",
            "Search for tracks by your favorite artist"
          ]
        }
      ],
      alternative_method: {
        title: "Alternative: Manual Method",
        description: "If the script doesn't work, you can use the manual method:",
        command: "npm run manual-token",
        note: "This provides step-by-step manual instructions for getting the token"
      },
      prerequisites: [
        "Spotify Developer App created at https://developer.spotify.com/dashboard",
        "Client ID and Client Secret configured in Claude Desktop",
        "Redirect URI set to: http://127.0.0.1:8888/callback"
      ],
      troubleshooting: {
        port_in_use: "If port 8888 is in use, the script will show an error. Stop other applications using that port.",
        browser_issues: "If browser doesn't open automatically, copy the URL from the script output and open it manually.",
        token_invalid: "If the token doesn't work, regenerate it using the script again."
      }
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(instructions, null, 2)
      }]
    };
  }

  // === USER LIBRARY MANAGEMENT HANDLERS ===

  async handleGetSavedTracks(args) {
    await this.ensureReady();

    try {
      const { limit = 20, offset = 0, market } = args;
      validateNumber(limit, 'limit', { min: 1, max: 50, integer: true });
      validateNumber(offset, 'offset', { min: 0, integer: true });
      if (market) validateString(market, 'market', { minLength: 2, maxLength: 2 });

      logger.info('get_saved_tracks_called', { limit, offset, market });

      const result = await this.spotifyController.getSavedTracks({ limit, offset, market });
      const tracks = result.body;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            total: tracks.total,
            limit: tracks.limit,
            offset: tracks.offset,
            next: tracks.next,
            previous: tracks.previous,
            items: tracks.items.map(item => ({
              added_at: item.added_at,
              track: {
                id: item.track.id,
                name: item.track.name,
                artists: item.track.artists.map(artist => ({
                  id: artist.id,
                  name: artist.name
                })),
                album: {
                  id: item.track.album.id,
                  name: item.track.album.name,
                  release_date: item.track.album.release_date
                },
                duration_ms: item.track.duration_ms,
                popularity: item.track.popularity,
                explicit: item.track.explicit,
                external_urls: item.track.external_urls,
                uri: item.track.uri
              }
            }))
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('get_saved_tracks_failed', { error: error.message });
      return handleError(error, 'getting saved tracks').toResponse();
    }
  }

  async handleSaveTracks(args) {
    await this.ensureReady();

    try {
      const { track_ids } = args;
      validateRequired(args, ['track_ids']);
      
      // Convert single ID to array
      const trackIds = Array.isArray(track_ids) ? track_ids : [track_ids];
      
      // Validate track IDs
      for (const trackId of trackIds) {
        validateString(trackId, 'track_id', { minLength: 1 });
      }

      if (trackIds.length > 50) {
        throw new InvalidArgumentError('Cannot save more than 50 tracks at once');
      }

      logger.info('save_tracks_called', { count: trackIds.length });

      await this.spotifyController.saveTracks(trackIds);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: `Successfully saved ${trackIds.length} track(s) to your library`,
            track_count: trackIds.length
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('save_tracks_failed', { error: error.message });
      return handleError(error, 'saving tracks to library').toResponse();
    }
  }

  async handleRemoveSavedTracks(args) {
    await this.ensureReady();

    try {
      const { track_ids } = args;
      validateRequired(args, ['track_ids']);
      
      // Convert single ID to array
      const trackIds = Array.isArray(track_ids) ? track_ids : [track_ids];
      
      // Validate track IDs
      for (const trackId of trackIds) {
        validateString(trackId, 'track_id', { minLength: 1 });
      }

      if (trackIds.length > 50) {
        throw new InvalidArgumentError('Cannot remove more than 50 tracks at once');
      }

      logger.info('remove_saved_tracks_called', { count: trackIds.length });

      await this.spotifyController.removeSavedTracks(trackIds);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: `Successfully removed ${trackIds.length} track(s) from your library`,
            track_count: trackIds.length
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('remove_saved_tracks_failed', { error: error.message });
      return handleError(error, 'removing tracks from library').toResponse();
    }
  }

  async handleCheckSavedTracks(args) {
    await this.ensureReady();

    try {
      const { track_ids } = args;
      validateRequired(args, ['track_ids']);
      
      // Convert single ID to array
      const trackIds = Array.isArray(track_ids) ? track_ids : [track_ids];
      
      // Validate track IDs
      for (const trackId of trackIds) {
        validateString(trackId, 'track_id', { minLength: 1 });
      }

      if (trackIds.length > 50) {
        throw new InvalidArgumentError('Cannot check more than 50 tracks at once');
      }

      logger.info('check_saved_tracks_called', { count: trackIds.length });

      const result = await this.spotifyController.checkSavedTracks(trackIds);
      const savedStatus = result.body;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            track_count: trackIds.length,
            saved_status: trackIds.map((trackId, index) => ({
              track_id: trackId,
              is_saved: savedStatus[index]
            })),
            summary: {
              total_tracks: trackIds.length,
              saved_tracks: savedStatus.filter(Boolean).length,
              unsaved_tracks: savedStatus.filter(saved => !saved).length
            }
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('check_saved_tracks_failed', { error: error.message });
      return handleError(error, 'checking saved tracks').toResponse();
    }
  }

  async handleGetSavedAlbums(args) {
    await this.ensureReady();

    try {
      const { limit = 20, offset = 0, market } = args;
      validateNumber(limit, 'limit', { min: 1, max: 50, integer: true });
      validateNumber(offset, 'offset', { min: 0, integer: true });
      if (market) validateString(market, 'market', { minLength: 2, maxLength: 2 });

      logger.info('get_saved_albums_called', { limit, offset, market });

      const result = await this.spotifyController.getSavedAlbums({ limit, offset, market });
      const albums = result.body;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            total: albums.total,
            limit: albums.limit,
            offset: albums.offset,
            next: albums.next,
            previous: albums.previous,
            items: albums.items.map(item => ({
              added_at: item.added_at,
              album: {
                id: item.album.id,
                name: item.album.name,
                artists: item.album.artists.map(artist => ({
                  id: artist.id,
                  name: artist.name
                })),
                release_date: item.album.release_date,
                total_tracks: item.album.total_tracks,
                album_type: item.album.album_type,
                external_urls: item.album.external_urls,
                uri: item.album.uri,
                images: item.album.images
              }
            }))
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('get_saved_albums_failed', { error: error.message });
      return handleError(error, 'getting saved albums').toResponse();
    }
  }

  async run() {
    try {
      await this.spotifyController.initialize();
      logger.info('server_started', { name: 'spotify-mcpb', version: '0.2.4' });
      
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
