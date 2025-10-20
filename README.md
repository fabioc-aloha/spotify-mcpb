# Spotify MCPB

<p align="center">
  <img src=".github/banner.svg" alt="Spotify MCPB Banner" width="100%">
</p>

<p align="center">
  <strong>Control Spotify and create custom playlists using the Spotify Web API through Claude Desktop.</strong>
  <br>
  Cross-platform support for Windows, macOS, and Linux.
</p>

<p align="center">
  <a href="https://github.com/fabioc-aloha/spotify-mcpb/releases/latest">
    <img src="https://img.shields.io/github/v/release/fabioc-aloha/spotify-mcpb?style=flat-square&color=1DB954&label=version" alt="Latest Release">
  </a>
  <a href="https://github.com/fabioc-aloha/spotify-mcpb/releases/latest">
    <img src="https://img.shields.io/github/downloads/fabioc-aloha/spotify-mcpb/total?style=flat-square&color=1DB954" alt="Downloads">
  </a>
  <a href="https://github.com/fabioc-aloha/spotify-mcpb/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/fabioc-aloha/spotify-mcpb?style=flat-square&color=1DB954" alt="MIT License">
  </a>
  <a href="https://github.com/fabioc-aloha/spotify-mcpb/stargazers">
    <img src="https://img.shields.io/github/stars/fabioc-aloha/spotify-mcpb?style=flat-square&color=1DB954" alt="GitHub Stars">
  </a>
  <a href="https://github.com/fabioc-aloha/spotify-mcpb/issues">
    <img src="https://img.shields.io/github/issues/fabioc-aloha/spotify-mcpb?style=flat-square&color=1DB954" alt="Issues">
  </a>
  <a href="https://github.com/fabioc-aloha/spotify-mcpb">
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-1DB954?style=flat-square" alt="Cross-Platform">
  </a>
  <a href="https://www.npmjs.com/package/@modelcontextprotocol/sdk">
    <img src="https://img.shields.io/badge/MCP-v1.20.1-1DB954?style=flat-square" alt="MCP SDK">
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-1DB954?style=flat-square" alt="Node.js">
  </a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-tools">Tools</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

> **🎵 Turn Claude into your personal Spotify DJ!**
>
> Based on [spotify-dxt](https://github.com/kenneth-lien/spotify-dxt) by Kenneth Lien
> Rewritten for cross-platform compatibility using Spotify Web API

## 🌟 Why Spotify MCPB?

- **🤖 AI-Powered Control** - Control Spotify using natural language through Claude Desktop
- **🎨 Smart Playlists** - Create and curate playlists with AI assistance
- **🔍 Deep Analysis** - Get detailed audio feature analysis and statistics
- **⚡ Easy Setup** - Interactive OAuth flow - no manual scripts needed
- **🌍 Cross-Platform** - Works on Windows, macOS, and Linux
- **🔌 16 Tools** - Comprehensive Spotify control and management
- **📦 One-Click Install** - MCPB bundle format for instant deployment

## ✨ What Can You Do?

```
You: "What's playing on Spotify?"
Claude: Shows currently playing track with artist and album info

You: "Create a workout playlist with high-energy tracks"
Claude: Searches for energetic songs and creates a custom playlist

You: "Analyze my Discover Weekly and tell me the vibe"
Claude: Provides audio feature analysis with energy, danceability, mood stats

You: "Find me some chill jazz for studying"
Claude: Searches catalog and gives you curated recommendations

You: "Skip to the next track and turn up the volume"
Claude: Controls playback instantly
```

## 🚀 Quick Start

### For Users (Easiest)

1. **Download** the latest bundle from [releases](https://github.com/fabioc-aloha/spotify-mcpb/releases/latest)
2. **Double-click** `spotify-mcpb-0.2.2.mcpb` to install in Claude Desktop
3. **Get credentials** from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
4. **Setup token**: Ask Claude _"Help me get a Spotify refresh token"_
5. **Start using**: _"What's playing on Spotify?"_ 🎵

**⏱️ Setup time: ~5 minutes** | See [SETUP.md](SETUP.md) for detailed instructions

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
mcpb pack . spotify-mcpb-0.2.2.mcpb
```

See [BUNDLE.md](BUNDLE.md) for complete build instructions.

## 🎯 Features

### 🎮 Playback Control
- **Play/Pause** - Control playback state
- **Skip Tracks** - Next/previous track navigation
- **Volume Control** - Set volume level (0-100)
- **Playback Info** - Get current track and full playback state

### 🔍 Search & Discovery
- **Catalog Search** - Search millions of tracks
- **AI Recommendations** - Get smart track suggestions based on:
  - Audio features (energy, danceability, tempo, mood)
  - Seed tracks, artists, or genres
  - Customizable targets and ranges

### 📝 Playlist Management
- **Create Playlists** - Build new playlists with custom names/descriptions
- **Add Tracks** - Smart track addition with automatic deduplication
- **View Playlists** - Get detailed playlist information
- **List User Playlists** - Browse all your playlists

### 📊 Audio Analysis
- **Track Features** - Get detailed audio characteristics:
  - Acousticness, danceability, energy, valence
  - Tempo, key, mode, time signature
  - Loudness, speechiness, instrumentalness
- **Playlist Analytics** - Comprehensive statistics:
  - Mean, standard deviation, min/max for all features
  - Total duration and track count
  - Diversity score (coefficient of variation)

### 🔐 Interactive Setup
- **OAuth Flow** - Built-in token generation (no manual scripts!)
- **Secure Storage** - Credentials managed via environment variables
- **Auto Refresh** - Automatic token renewal

## 📋 Requirements

| Requirement | Details |
|-------------|---------|
| **Spotify Account** | Free account works for most features<br>Premium required for playback control |
| **Spotify Developer App** | Free to create at [developer.spotify.com](https://developer.spotify.com/dashboard) |
| **Claude Desktop** | For one-click bundle installation |
| **Node.js** | ≥18.0.0 (for development only) |

## 📦 Installation

## 🛠️ Available Tools (16 Total)

### Setup & Authentication
0. `spotify_get_refresh_token` - Interactive OAuth flow (no manual scripts needed!)

### Playback Control
1. `spotify_play` - Resume playback
2. `spotify_pause` - Pause playback
3. `spotify_next_track` - Skip to next track
4. `spotify_previous_track` - Skip to previous track
5. `spotify_set_volume` - Set volume (0-100)

### Track Info & Search
6. `spotify_get_current_track` - Get currently playing track
7. `spotify_get_playback_state` - Get full playback state
8. `spotify_search_tracks` - Search Spotify catalog

### Playlist Management
9. `spotify_create_playlist` - Create new playlist
10. `spotify_add_tracks_to_playlist` - Add tracks with deduplication
11. `spotify_get_playlist` - Get playlist details
12. `spotify_get_user_playlists` - List user's playlists

### Recommendations & Analysis
13. `spotify_get_recommendations` - Get track recommendations
14. `spotify_get_audio_features` - Get audio features for tracks
15. `spotify_analyze_playlist` - Analyze playlist statistics

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[SETUP.md](SETUP.md)** | Complete guide to getting Spotify API credentials |
| **[REFRESH_TOKEN_GUIDE.md](REFRESH_TOKEN_GUIDE.md)** | Step-by-step interactive OAuth walkthrough |
| **[BUNDLE.md](BUNDLE.md)** | How to create and install MCPB bundles |
| **[CHANGELOG.md](CHANGELOG.md)** | Version history and changes |
| **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** | Complete documentation index |

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

- 🐛 **Report Bugs**: [Open an issue](https://github.com/fabioc-aloha/spotify-mcpb/issues/new)
- 💡 **Suggest Features**: Share your ideas in issues
- 📖 **Improve Documentation**: Submit PRs for docs
- 🔧 **Submit Code**: Fork, create a branch, and submit a PR

## 📊 Project Stats

- **Bundle Size**: 3.0 MB (compressed)
- **Total Files**: 1,767+ files
- **Dependencies**: 60 production packages
- **Code Quality**: 0 vulnerabilities
- **MCP Tools**: 16 comprehensive tools
- **API Compliance**: 100% (verified October 2025)

## 🔗 Related Projects

- **[spotify-dxt](https://github.com/kenneth-lien/spotify-dxt)** - Original macOS-only version by Kenneth Lien
- **[MCP SDK](https://github.com/modelcontextprotocol/sdk)** - Model Context Protocol SDK
- **[Claude Desktop](https://claude.ai/desktop)** - AI assistant with MCP support
- **[MCPB Spec](https://github.com/anthropics/mcpb)** - MCP Bundle specification

## 🙏 Acknowledgments

- **Kenneth Lien** - Original [spotify-dxt](https://github.com/kenneth-lien/spotify-dxt) project
- **Anthropic** - MCPB specification and Claude Desktop
- **Spotify** - Web API and developer platform
- **MCP Community** - Model Context Protocol ecosystem

## 📄 License

MIT License - See [LICENSE.md](LICENSE.md)

**TL;DR**: Free to use, modify, and distribute. Just keep the license notice.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/fabioc-aloha/spotify-mcpb/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fabioc-aloha/spotify-mcpb/discussions)
- **Spotify API**: [Developer Documentation](https://developer.spotify.com/documentation/web-api)
- **MCP Protocol**: [Official Docs](https://modelcontextprotocol.io/)

## ⭐ Show Your Support

If you find this project useful, please consider:
- ⭐ **Starring** the repository
- 🐦 **Sharing** on social media
- 🔗 **Linking** from your projects
- 🤝 **Contributing** improvements

---

<p align="center">
  <strong>Made with ❤️ by Fabio Correa</strong>
  <br>
  <sub>Based on the original macOS-only spotify-dxt, reimagined for cross-platform use</sub>
</p>

<p align="center">
  <a href="https://github.com/fabioc-aloha/spotify-mcpb/releases/latest">
    <strong>Download Latest Release →</strong>
  </a>
</p>
