# Spotify MCPB Project Instructions

## Project Overview

**Project Name**: Spotify MCPB  
**Version**: 0.2.1  
**Type**: MCPB Bundle (Model Context Protocol Bundle) for Claude Desktop  
**Purpose**: Cross-platform Spotify control and playlist management using Spotify Web API

**Important**: This directory is named `spotify-mcpb` matching the project name. The project was rebranded from `spotify-dxt` to `spotify-mcpb`. See [REBRANDING_SUMMARY.md](../REBRANDING_SUMMARY.md) for details.

---

## 🚨 Critical Project Guidelines

### Project Naming
- ✅ **Use "Spotify MCPB"** or "spotify-mcpb" when referring to this project
- ✅ **Repository URL**: `github.com/fabioc-aloha/spotify-mcpb`
- ❌ **Do NOT call this project "spotify-dxt"** (that's the original macOS project by Kenneth Lien)
- ✅ **Credit Original**: Always acknowledge [Kenneth Lien's spotify-dxt](https://github.com/kenneth-lien/spotify-dxt) as the original inspiration

### Bundle Creation
✅ **Directory renamed**: The directory is now named `spotify-mcpb`, so `mcpb pack` creates correctly named bundles!

```bash
# ✅ CORRECT - Simple command now works
mcpb pack

# ✅ ALSO CORRECT - Specify version explicitly
mcpb pack . spotify-mcpb-0.2.1.mcpb
```

See [BUNDLE.md](../BUNDLE.md) for details.

---

## 📚 Essential Documentation Files

### Quick Reference
- **[README.md](../README.md)** - Project overview and quick start (3.7 KB)
- **[SETUP.md](../SETUP.md)** - Spotify API credential setup guide (5.8 KB)
- **[REFRESH_TOKEN_GUIDE.md](../REFRESH_TOKEN_GUIDE.md)** - Interactive OAuth flow walkthrough (12.5 KB)

### Development
- **[BUNDLE.md](../BUNDLE.md)** - Bundle creation, installation & distribution (22 KB)
- **[PLAYLIST_FEATURE_PLAN.md](../PLAYLIST_FEATURE_PLAN.md)** - Implementation details (9.5 KB)
- **[FEATURE_REFRESH_TOKEN.md](../FEATURE_REFRESH_TOKEN.md)** - New refresh token feature docs (11.4 KB)

### Distribution
- **[RELEASE_NOTES.md](../RELEASE_NOTES.md)** - GitHub release template (7.6 KB)
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history (18 KB)

### Administrative
- **[REBRANDING_SUMMARY.md](../REBRANDING_SUMMARY.md)** - Project rename documentation (7.2 KB)
- **[DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md)** - Complete documentation index (updated)
- **[LICENSE.md](../LICENSE.md)** - MIT License (1.0 KB)

---

## 🛠️ Project Structure

```
spotify-mcpb/
├── server/
│   ├── index.js                 # Main MCP server with 16 tool handlers
│   ├── spotifyWebController.js  # Spotify Web API wrapper
│   ├── playlistController.js    # High-level playlist operations
│   ├── logging.js               # Structured JSON logging
│   ├── error.js                 # Error handling with MCP responses
│   └── validation.js            # Input validation and sanitization
├── manifest.json                # MCPB v0.2 manifest (CRITICAL)
├── package.json                 # npm dependencies and scripts
├── .env.example                 # Credential template
├── icon.png                     # Bundle icon (23.9 KB)
└── [documentation files]        # See above
```

---

## 🎯 Key Features

### 16 MCP Tools Available
0. `spotify_get_refresh_token` - Interactive OAuth flow (NEW in 0.2.0)
1. `spotify_play` - Resume playback
2. `spotify_pause` - Pause playback
3. `spotify_next_track` - Skip to next track
4. `spotify_previous_track` - Skip to previous track
5. `spotify_set_volume` - Set volume (0-100)
6. `spotify_get_current_track` - Get currently playing track
7. `spotify_get_playback_state` - Get full playback state
8. `spotify_search_tracks` - Search Spotify catalog
9. `spotify_create_playlist` - Create new playlist
10. `spotify_add_tracks_to_playlist` - Add tracks with deduplication
11. `spotify_get_playlist` - Get playlist details
12. `spotify_get_user_playlists` - List user's playlists
13. `spotify_get_recommendations` - Get track recommendations
14. `spotify_get_audio_features` - Get audio features for tracks
15. `spotify_analyze_playlist` - Analyze playlist statistics

---

## 💻 Development Workflow

### Initial Setup
```bash
# Clone repository
git clone https://github.com/fabioc-aloha/spotify-mcpb.git
cd spotify-mcpb

# Install dependencies
npm install

# Configure credentials
cp .env.example .env
# Edit .env with your Spotify API credentials
```

### Testing Locally
```bash
# Run server directly
node server/index.js

# Or use npm script
npm start
```

### Creating Bundle
```bash
# Install MCPB CLI (if not already installed)
npm install -g @anthropic-ai/mcpb

# Validate manifest
mcpb validate manifest.json

# Create bundle with explicit filename
mcpb pack . spotify-mcpb-0.2.0.mcpb

# Verify bundle
ls -lh spotify-mcpb-0.2.0.mcpb
```

### Making Code Changes

#### Server Code (`server/index.js`)
- All 16 tool handlers are in this file
- Uses MCP SDK v0.6.0
- Follow existing patterns for new tools
- Always validate inputs using `validation.js`
- Handle errors using `error.js`

#### Dependencies
- Keep `package.json` in sync with actual usage
- Only include production dependencies in bundle
- Test after adding new dependencies

#### Manifest (`manifest.json`)
- MCPB v0.2 format - do NOT change `manifest_version`
- Update tool list when adding/removing tools
- Validate with `mcpb validate manifest.json` after changes

---

## 🔧 Common Tasks

### Adding a New Tool

1. **Update `server/index.js`**:
   - Add tool definition in `ListToolsRequestSchema` handler
   - Add case in `CallToolRequestSchema` switch statement
   - Implement handler method (e.g., `handleNewTool()`)

2. **Update `manifest.json`**:
   - Add tool to `tools` array

3. **Update Documentation**:
   - Add tool to README.md tool list
   - Update CHANGELOG.md
   - Update RELEASE_NOTES.md

4. **Test**:
   ```bash
   node --check server/index.js
   mcpb validate manifest.json
   npm start
   ```

### Updating Documentation

When updating docs, ensure consistency across:
- Tool counts (currently 16 tools)
- Version numbers (currently 0.2.0)
- Repository URLs (github.com/fabioc-aloha/spotify-mcpb)
- Project name (Spotify MCPB, not spotify-dxt)

### Creating a Release

1. **Update Version**:
   - `package.json` - version field
   - `manifest.json` - version field
   - `CHANGELOG.md` - add new version section

2. **Update Documentation**:
   - `RELEASE_NOTES.md` - update for new version
   - `README.md` - update if needed
   - `BUNDLE-SUMMARY.md` - update statistics

3. **Create Bundle**:
   ```bash
   mcpb pack . spotify-mcpb-{version}.mcpb
   ```

4. **Test Bundle**:
   - Extract and test locally
   - Verify all tools work
   - Check documentation is complete

5. **Tag and Release**:
   ```bash
   git tag v{version}
   git push origin v{version}
   ```

---

## 🐛 Troubleshooting

### Common Issues

1. **Bundle has wrong name**
   - Solution: Use `mcpb pack . spotify-mcpb-0.2.1.mcpb`
   - See [BUNDLE.md](../BUNDLE.md)

2. **Manifest validation fails**
   - Check `manifest_version` is "0.2"
   - Verify all required fields are present
   - Run `mcpb validate manifest.json`

3. **Node.js errors**
   - Ensure Node.js >= 18.0.0
   - Run `node --check server/index.js`
   - Check all imports are valid

4. **Spotify API errors**
   - Verify credentials in `.env`
   - Check refresh token is valid
   - Ensure proper OAuth scopes

---

## 📝 Code Standards

### JavaScript
- Use ES modules (`import`/`export`)
- Use `async`/`await` for promises
- Always validate inputs
- Handle errors gracefully
- Log important events

### Documentation
- Use Markdown for all docs
- Keep line length reasonable
- Use clear section headers
- Include code examples
- Cross-reference related docs

### Git Commits
- Use conventional commits format
- Reference issue numbers when applicable
- Keep commits focused and atomic

---

## 🔗 Important Links

### Repository
- **GitHub**: https://github.com/fabioc-aloha/spotify-mcpb
- **Issues**: https://github.com/fabioc-aloha/spotify-mcpb/issues
- **Original Project**: https://github.com/kenneth-lien/spotify-dxt (macOS version)

### External Documentation
- **MCPB Spec**: https://github.com/anthropics/mcpb
- **Spotify Web API**: https://developer.spotify.com/documentation/web-api
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk

### Tools
- **MCPB CLI**: `npm install -g @anthropic-ai/mcpb`
- **Node.js**: https://nodejs.org (>= 18.0.0 required)
- **Claude Desktop**: For testing MCPB bundles

---

## 📊 Project Stats

- **Total Tools**: 16
- **Lines of Code**: ~16,000+ (with dependencies)
- **Bundle Size**: 2.3 MB compressed, 8.0 MB unpacked
- **Documentation**: 64.3 KB across 10 files
- **Dependencies**: 60 packages (5 direct)

---

## ⚠️ Important Reminders

1. **Always specify bundle output name** when running `mcpb pack`
2. **Use "spotify-mcpb"** not "spotify-dxt" for this project
3. **Credit Kenneth Lien** for the original spotify-dxt inspiration
4. **Update all documentation** when making changes
5. **Validate manifest** after any changes to `manifest.json`
6. **Test locally** before creating distribution bundle
7. **Check Node.js syntax** with `node --check` before bundling

---

## 🎓 Learning Resources

If you're new to this project, read in this order:
1. [README.md](../README.md) - Start here
2. [SETUP.md](../SETUP.md) - Get credentials
3. [BUNDLE.md](../BUNDLE.md) - Understand bundle creation
4. [PLAYLIST_FEATURE_PLAN.md](../PLAYLIST_FEATURE_PLAN.md) - Deep dive into implementation

For specific tasks:
- **Adding features**: See "Adding a New Tool" section above
- **Creating releases**: See "Creating a Release" section above
- **Troubleshooting**: See [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md)

---

**Last Updated**: October 20, 2025  
**Project Version**: 0.2.1  
**Maintainer**: Fabio Correa
