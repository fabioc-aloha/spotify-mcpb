# Release v0.2.0 - Windows 11 Support & MCPB Bundle

## 🎉 First Official Release - Cross-Platform Spotify Control for Claude Desktop

This is the first official release of **Spotify MCPB**, a complete rewrite of the original macOS-only spotify-dxt project. Now with Windows 11 support, playlist creation features, and proper MCPB bundle packaging for one-click installation in Claude Desktop!

---

## 📦 Download

**Bundle File**: [`spotify-mcpb-0.2.0.mcpb`](https://github.com/fabioc-aloha/spotify-mcpb/releases/download/v0.2.0/spotify-mcpb-0.2.0.mcpb) (2.3 MB)

### Quick Install
1. **Download** the `.mcpb` file above
2. **Double-click** to install in Claude Desktop
3. **Configure** your Spotify API credentials (see setup instructions below)
4. **Start using** - Ask Claude: "What's playing on Spotify?"

---

## ✨ What's New

### Cross-Platform Support
- ✅ **Windows 11** - First-class support
- ✅ **macOS** - Fully compatible
- ✅ **Linux** - Full support

### 16 MCP Tools
- **Setup**: Interactive refresh token generation (no manual scripts!)
- **Playback Control**: play, pause, next, previous, set volume
- **Track Info**: get current track, playback state, search
- **Playlists**: create, add tracks, get details, list user playlists
- **AI Features**: recommendations, audio analysis, playlist statistics

### Modern Architecture
- Spotify Web API (replaces AppleScript)
- MCPB v0.2 bundle format
- One-click installation
- Complete documentation

---

## 🚀 Getting Started

### Prerequisites
- **Claude Desktop** (for one-click installation)
- **Spotify Account** (Premium required for playback control)
- **Spotify API Credentials** (free - see setup guide)

### Installation

#### Step 1: Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your **Client ID** and **Client Secret**
4. Add `http://localhost:8888/callback` to Redirect URIs
5. Follow the [Setup Guide](https://github.com/fabioc-aloha/spotify-mcpb/blob/main/SETUP.md) to get your **Refresh Token**

#### Step 2: Install the Bundle

1. Download `spotify-mcpb-0.2.0.mcpb`
2. Double-click the file
3. Claude Desktop will open with an installation dialog
4. Enter your credentials:
   - Spotify Client ID
   - Spotify Client Secret
   - Spotify Refresh Token
5. Click "Install"

#### Step 3: Start Using

Ask Claude:
- "What's currently playing on Spotify?"
- "Search for tracks by Daft Punk"
- "Create a playlist called 'AI Favorites'"
- "Analyze my Discover Weekly playlist"
- "Get me some energetic dance music recommendations"

---

## 📚 Documentation

Included in the bundle:
- **README.md** - Quick start and overview
- **SETUP.md** - Detailed credential setup guide
- **BUNDLE.md** - Bundle creation and installation guide
- **CHANGELOG.md** - Complete changelog

Online:
- [GitHub Repository](https://github.com/fabioc-aloha/spotify-mcpb)
- [Setup Guide](https://github.com/fabioc-aloha/spotify-mcpb/blob/main/SETUP.md)
- [MCPB Specification](https://github.com/anthropics/mcpb)

---

## 🎯 Available Tools (16 Total)

### Setup
0. `spotify_get_refresh_token` - Interactive OAuth flow (no manual scripts!)

### Playback Control
1. `spotify_play` - Resume playback
2. `spotify_pause` - Pause playback
3. `spotify_next_track` - Skip to next
4. `spotify_previous_track` - Skip to previous
5. `spotify_set_volume` - Set volume (0-100)

### Track Information
6. `spotify_get_current_track` - Get currently playing track
7. `spotify_get_playback_state` - Get full playback state
8. `spotify_search_tracks` - Search Spotify catalog

### Playlist Management
9. `spotify_create_playlist` - Create new playlist
10. `spotify_add_tracks_to_playlist` - Add tracks with deduplication
11. `spotify_get_playlist` - Get playlist details
12. `spotify_get_user_playlists` - List user's playlists

### AI & Analysis
13. `spotify_get_recommendations` - Get recommendations with audio feature targeting
14. `spotify_get_audio_features` - Get detailed audio features
15. `spotify_analyze_playlist` - Complete playlist analysis with statistics

---

## 📊 Technical Details

### Bundle Statistics
- **Size**: 1.89 MB (compressed from 6.3 MB)
- **Files**: 1,144 files bundled
- **Dependencies**: 60 production packages
- **SHA-1**: `470c31f638c718fe7af9c5717b8f6e8aad90ff4d`

### Architecture
- **Node.js** ES Modules (≥18.0.0)
- **MCP SDK** @modelcontextprotocol/sdk v0.6.0
- **Spotify API** spotify-web-api-node v5.0.2
- **Performance**: Caching, batching, concurrent limiting
- **Security**: No secrets bundled, input validation

---

## 🔒 Security & Privacy

- ✅ No API keys or tokens included in bundle
- ✅ Credentials managed via user configuration
- ✅ Input validation on all tools
- ✅ Error sanitization in logs
- ✅ Follows Spotify's privacy policies

**Important**: Your Spotify credentials are stored locally and never shared. Review [Spotify's Privacy Policy](https://www.spotify.com/legal/privacy-policy/).

---

## 🐛 Known Limitations

1. **Spotify Premium Required** - Playback control features require Spotify Premium (search and playlist features work with Free accounts)
2. **Active Device Needed** - Playback commands require an active Spotify device (desktop, mobile, or web player)
3. **Rate Limits** - Subject to Spotify API rate limits (handled with automatic retries)

---

## 🛠️ For Developers

### Build from Source

```bash
# Clone repository
git clone https://github.com/fabioc-aloha/spotify-mcpb.git
cd spotify-mcpb

# Install dependencies
npm install

# Configure credentials
cp .env.example .env
# Edit .env with your credentials

# Run locally
npm start

# Build bundle
npm install -g @anthropic-ai/mcpb
mcpb pack
```

See [BUNDLE.md](https://github.com/fabioc-aloha/spotify-mcpb/blob/main/BUNDLE.md) for complete build instructions.

---

## 🆘 Troubleshooting

### Bundle won't install
- Verify the file downloaded completely (should be 1.89 MB)
- Try extracting manually and running `node server/index.js`
- Check Claude Desktop version is up to date

### Authentication errors
- Double-check your Client ID and Client Secret
- Ensure you're using the **refresh token**, not access token
- Verify redirect URI is `http://localhost:8888/callback`

### "No active device" error
- Open Spotify on any device (desktop, mobile, web)
- Start playing something
- Try the command again

### More Help
- Check [SETUP.md](https://github.com/fabioc-aloha/spotify-mcpb/blob/main/SETUP.md) for detailed troubleshooting
- [Open an issue](https://github.com/fabioc-aloha/spotify-mcpb/issues) on GitHub
- Review [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)

---

## 📋 Changelog

See [CHANGELOG.md](https://github.com/fabioc-aloha/spotify-mcpb/blob/main/CHANGELOG.md) for complete version history.

**v0.2.0 Highlights**:
- ✅ Windows 11 support (cross-platform)
- ✅ Spotify Web API integration
- ✅ 15 MCP tools
- ✅ Playlist creation and management
- ✅ Audio analysis and recommendations
- ✅ MCPB v0.2 bundle format
- ✅ One-click installation
- ✅ Complete documentation

---

## 👏 Credits

- **Original Project**: [spotify-dxt](https://github.com/kenneth-lien/spotify-dxt) by Kenneth Lien
- **Windows Port & Features**: Fabio C.
- **MCPB Specification**: [Anthropic](https://github.com/anthropics/mcpb)
- **MCP Protocol**: [Model Context Protocol](https://modelcontextprotocol.io/)

---

## 📄 License

MIT License - See [LICENSE.md](https://github.com/fabioc-aloha/spotify-mcpb/blob/main/LICENSE.md)

---

## 🌟 What's Next

Future enhancements being considered:
- Playback queue management
- Collaborative playlist features
- Podcast support
- Device selection and transfer
- Advanced playlist curation algorithms

**Star the repository** to stay updated on new features!

---

**Ready to control Spotify with AI? Download the bundle and start creating playlists! 🎵**
