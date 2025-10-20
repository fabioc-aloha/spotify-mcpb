# Spotify MCPB

Control Spotify and create custom playlists using the Spotify Web API through Claude Desktop. Cross-platform support for Windows, macOS, and Linux.

> **Based on [spotify-dxt](https://github.com/kenneth-lien/spotify-dxt)** by Kenneth Lien
> Rewritten to use Spotify Web API for cross-platform compatibility

## Features

- **Playback Control** - Play, pause, skip, volume control
- **Search & Discovery** - Search Spotify's catalog, get recommendations
- **Playlist Management** - Create, modify, and analyze playlists
- **Audio Analysis** - Detailed audio features and statistics
- **Interactive Setup** - Built-in OAuth flow for easy authentication

## Requirements

- Spotify account (Premium required for playback control)
- Spotify Developer App credentials ([setup guide](SETUP.md))
- Claude Desktop (for bundle installation) or Node.js 18+ (for development)

## Quick Start

### For Users

**Download** `spotify-mcpb-0.2.0.mcpb` from [releases](https://github.com/fabioc-aloha/spotify-mcpb/releases)

1. **Install**: Double-click the `.mcpb` file
2. **Setup**: Ask Claude "Help me get a Spotify refresh token" (follows interactive OAuth)
3. **Use**: Ask Claude "What's playing on Spotify?"

See [SETUP.md](SETUP.md) for detailed credential setup.

### For Developers

### For Developers

```bash
# Clone and install
git clone https://github.com/fabioc-aloha/spotify-mcpb.git
cd spotify-mcpb
npm install

# Configure credentials
cp .env.example .env
# Edit .env with your Spotify API credentials

# Run locally
npm start

# Build bundle (optional)
npm install -g @anthropic-ai/mcpb
mcpb pack
```

See [BUNDLE.md](BUNDLE.md) for detailed build instructions.

## Available Tools (16 Total)

### Setup & Authentication
- `spotify_get_refresh_token` - Interactive OAuth flow (no manual scripts needed!)

### Playback Control
- `spotify_play`, `spotify_pause`, `spotify_next_track`, `spotify_previous_track`, `spotify_set_volume`

### Track Info & Search
- `spotify_get_current_track`, `spotify_get_playback_state`, `spotify_search_tracks`

### Playlist Management
- `spotify_create_playlist`, `spotify_add_tracks_to_playlist`, `spotify_get_playlist`, `spotify_get_user_playlists`

### Recommendations & Analysis
- `spotify_get_recommendations`, `spotify_get_audio_features`, `spotify_analyze_playlist`

## Documentation

- **[SETUP.md](SETUP.md)** - Spotify API credential setup
- **[BUNDLE.md](BUNDLE.md)** - How to create and install `.mcpb` bundles
- **[REFRESH_TOKEN_GUIDE.md](REFRESH_TOKEN_GUIDE.md)** - Interactive OAuth walkthrough

## Distribution

Download `spotify-mcpb-0.2.0.mcpb` from [GitHub Releases](https://github.com/fabioc-aloha/spotify-mcpb/releases) or build your own (see BUNDLE.md).

## License

MIT License - See [LICENSE.md](LICENSE.md)

## Credits

**Original Project**: [spotify-dxt](https://github.com/kenneth-lien/spotify-dxt) by Kenneth Lien
**Cross-Platform Port**: Fabio C.

---

*Based on the original macOS-only spotify-dxt, reimagined for cross-platform use with Spotify Web API*
