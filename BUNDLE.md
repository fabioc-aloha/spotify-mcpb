# MCPB Bundle Guide - Spotify MCPB

Complete guide to creating, installing, and distributing the Spotify MCPB bundle.

---

## Table of Contents

1. [What is an MCPB Bundle?](#what-is-an-mcpb-bundle)
2. [Bundle Naming](#bundle-naming)
3. [Creating a Bundle](#creating-a-bundle)
4. [Testing Your Bundle](#testing-your-bundle)
5. [Installing the Bundle](#installing-the-bundle)
6. [Distribution](#distribution)
7. [Bundle Contents](#bundle-contents)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## What is an MCPB Bundle?

An MCPB (MCP Bundle) is a zip archive (`.mcpb` file) containing:

- A complete local MCP server
- A `manifest.json` that describes the server and its capabilities
- All dependencies bundled together

Think of it like Chrome extensions (`.crx`) or VS Code extensions (`.vsix`) - users can install your MCP server with a single click.

### Current Bundle Information

**Bundle File**: `spotify-mcpb-0.2.4.mcpb`
**Size**: ~2 MB (compressed), ~6 MB (unpacked)
**Files**: 1,144+ files
**Tools**: 16 MCP tools for Spotify control

---

## Bundle Naming

### ✅ Current Setup (Issue Resolved)

The directory has been renamed to `spotify-mcpb` to match the project name, so `mcpb pack` now automatically creates correctly named bundles!

- **Directory name**: `spotify-mcpb` ✅
- **Manifest name**: `spotify-mcpb` ✅
- **Package name**: `spotify-mcpb` ✅
- **Result**: Running `mcpb pack` creates `spotify-mcpb.mcpb` ✅

### Recommended Commands

```bash
# Simple command - works correctly now!
mcpb pack

# Or specify version explicitly for versioned releases
mcpb pack . spotify-mcpb-0.2.4.mcpb
```

### How MCPB Pack Works

The `mcpb pack` command uses the **directory name** (not the manifest name) for the output filename when no explicit output is specified.

### Command Reference

| Command                                 | Output Name                 | Based On              |
| --------------------------------------- | --------------------------- | --------------------- |
| `mcpb pack`                           | `{directory-name}.mcpb`   | Directory name        |
| `mcpb pack . myapp.mcpb`              | `myapp.mcpb`              | Your specification ✅ |
| `mcpb pack . spotify-mcpb-0.2.2.mcpb` | `spotify-mcpb-0.2.2.mcpb` | Your specification ✅ |

**Note**: The manifest `name` field controls the internal bundle name, but the filename is controlled by the `mcpb pack` command's output parameter.

---

## Creating a Bundle

### Prerequisites

#### 1. Install the MCPB CLI

```bash
npm install -g @anthropic-ai/mcpb
```

#### 2. Verify Your Project Structure

Your project should look like this:

```
spotify-mcpb/
├── manifest.json         # ✅ MCPB v0.2 manifest
├── server/
│   ├── index.js          # ✅ Main entry point
│   ├── spotifyWebController.js
│   ├── playlistController.js
│   ├── logging.js
│   ├── error.js
│   └── validation.js
├── node_modules/         # ✅ Dependencies installed
├── package.json          # ✅ Package definition
├── .env.example          # ✅ Credential template
├── README.md             # ✅ Documentation
├── SETUP.md              # ✅ Setup instructions
└── icon.png              # ✅ Bundle icon
```

### Step 1: Validate Your Manifest

```bash
# Check manifest structure
mcpb validate manifest.json
```

If you need to recreate or update it:

```bash
mcpb init
```

Follow the prompts:

- **Bundle name**: `spotify-mcpb`
- **Description**: `Control Spotify and create custom playlists using the Spotify Web API`
- **Version**: `0.2.4`
- **Entry point**: `node server/index.js`

### Step 2: Prepare Dependencies

#### Bundle Node Modules (Recommended)

For maximum compatibility, bundle all dependencies:

```bash
# Clean install production dependencies
rm -rf node_modules
npm ci --production

# Or if using npm install
npm install --production
```

#### Why Bundle Dependencies?

- **User convenience**: No need for users to run `npm install`
- **Version consistency**: Exact versions you tested with
- **Offline installation**: Works without internet access
- **Cross-platform**: Node.js ships with Claude Desktop

### Step 3: Optional - Add an Icon

Create or add an `icon.png` file (recommended size: 256x256px or 512x512px):

```bash
# Example: Copy your icon
cp /path/to/your/icon.png icon.png
```

The icon will be displayed in Claude Desktop and other MCPB-compatible apps.

### Step 4: Create the Bundle

#### Option A: Using MCPB CLI (Recommended)

```bash
# Create the .mcpb bundle file with explicit version
mcpb pack . spotify-mcpb-0.2.2.mcpb

# Or let it auto-generate the name (uses directory name)

```

The CLI will:

1. ✅ Validate your `manifest.json`
2. ✅ Create a zip archive with all files
3. ✅ Name it based on your specification or directory
4. ✅ Exclude unnecessary files (git files, .env, etc.)

#### Option B: Manual Bundling

If you need more control:

```bash
# Create a zip archive with all necessary files
zip -r spotify-mcpb-0.2.2.mcpb \
  manifest.json \
  server/ \
  node_modules/ \
  package.json \
  package-lock.json \
  .env.example \
  README.md \
  SETUP.md \
  REFRESH_TOKEN_GUIDE.md \
  icon.png \
  -x "*.env" \
  -x "*.log" \
  -x ".git/*" \
  -x ".vscode/*" \
  -x "test/*"

# Rename to .mcpb
mv spotify-mcpb-0.2.2.zip spotify-mcpb-0.2.2.mcpb
```

On Windows (PowerShell):

```powershell
# Compress to zip
Compress-Archive -Path manifest.json,server,node_modules,package.json,package-lock.json,.env.example,README.md,SETUP.md,REFRESH_TOKEN_GUIDE.md,icon.png -DestinationPath spotify-mcpb-0.2.2.zip

# Rename to .mcpb
Rename-Item spotify-mcpb-0.2.2.zip spotify-mcpb-0.2.2.mcpb
```

### What Gets Included in the Bundle?

#### ✅ Include These Files:

- `manifest.json` - **Required**
- `server/` - All server code
- `node_modules/` - All dependencies
- `package.json` - Package definition
- `package-lock.json` or `yarn.lock` - Lock file
- `.env.example` - Template for environment variables
- `README.md` - User documentation
- `SETUP.md` - Setup instructions
- `REFRESH_TOKEN_GUIDE.md` - OAuth setup guide
- `icon.png` - Bundle icon (optional)
- `LICENSE.md` - License information

#### ❌ Exclude These Files:

- `.env` - Contains secrets! ⚠️
- `.git/` - Git repository
- `*.log` - Log files
- `.vscode/` - Editor settings
- `test/` - Test files (optional)
- `.DS_Store` - macOS metadata
- `node_modules/.cache` - Build caches
- Any files with API keys or tokens

### Bundle Size Optimization

#### Check Bundle Size

```bash
ls -lh spotify-mcpb-0.2.2.mcpb
# Target: < 10MB for fast downloads
```

#### Reduce Size (If Needed)

1. **Remove dev dependencies**:

   ```bash
   npm prune --production
   ```
2. **Remove unnecessary files from node_modules**:

   ```bash
   # Use a tool like modclean
   npm install -g modclean
   modclean -r
   ```
3. **Minimize unnecessary assets**:

   - Compress images
   - Remove unused documentation from dependencies

---

## Testing Your Bundle

### Test Locally

Before distributing, test the bundle:

```bash
# Extract to a test directory
mkdir test-bundle
unzip spotify-mcpb-0.2.2.mcpb -d test-bundle
cd test-bundle

# Set credentials
export SPOTIFY_CLIENT_ID="your_client_id"
export SPOTIFY_CLIENT_SECRET="your_client_secret"
export SPOTIFY_REFRESH_TOKEN="your_refresh_token"

# Test the server
node server/index.js

# Should output:
# {"timestamp":"...","level":"info","event":"server_started","name":"spotify-mcpb","version":"0.2.2"}
```

### Test with Claude Desktop

1. **Install in Claude Desktop**:

   - Double-click the `.mcpb` file
   - Claude Desktop will show an installation dialog
   - Follow the prompts to configure Spotify credentials
2. **Verify Installation**:

   - Open Claude Desktop
   - Check that "Spotify" appears in available tools
   - Test a simple command: "What's playing on Spotify?"
   - Try: "Search for tracks by Daft Punk"
   - Test: "Create a playlist called 'AI Playlist'"
3. **Check Logs** (if issues occur):

   - Windows: `%APPDATA%\Claude\logs`
   - macOS: `~/Library/Logs/Claude`
   - Server logs: stderr output (JSON format)

---

## Installing the Bundle

### For End Users

#### Option 1: Claude Desktop (Recommended)

1. **Download** `spotify-mcpb-0.2.2.mcpb`
2. **Double-click** the file
3. Claude Desktop will open with an installation dialog
4. **Enter your Spotify API credentials**:
   - Client ID
   - Client Secret
   - Refresh Token (can get via Claude after install)
5. Click **"Install"**
6. The Spotify tools are now available in Claude!

#### Option 2: Manual Installation

1. Extract the bundle:

   ```bash
   unzip spotify-mcpb-0.2.2.mcpb -d spotify-mcpb
   cd spotify-mcpb
   ```
2. Create `.env` file:

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
3. Test the server:

   ```bash
   node server/index.js
   ```
4. Configure in Claude Desktop or your MCP client

### Getting Spotify Credentials

**Before using the bundle, you need Spotify API credentials.**

See `SETUP.md` in the bundle for detailed instructions:

1. **Create Spotify Developer App**

   - Go to https://developer.spotify.com/dashboard
   - Create new app
   - Note Client ID and Client Secret
   - Add redirect URI: `http://127.0.0.1:8888/callback`
2. **Get Refresh Token** (Easy Method)

   - Download the project from GitHub
   - Run `npm install` and then `npm run get-token`
   - Script automatically handles OAuth flow and provides token
   - Copy the token for use in Claude Desktop setup
3. **Configure Bundle**

   - Enter all three credentials when prompted by Claude Desktop:
     - Client ID
     - Client Secret
     - Refresh Token
   - All tools work immediately after setup

---

## Distribution

### Option 1: GitHub Releases (Recommended)

1. Create a release on GitHub:

   ```bash
   git tag v0.2.2
   git push origin v0.2.2
   ```
2. Upload the `.mcpb` file to the release
3. Users can download and install:

   ```
   Download: spotify-mcpb-0.2.2.mcpb
   Install: Double-click the file (opens in Claude Desktop)
   ```

### Option 2: Direct Distribution

Share the `.mcpb` file directly:

- Email attachment (under 2 MB)
- File sharing service (Dropbox, Google Drive, OneDrive)
- Internal company distribution

### Option 3: Claude Desktop Directory (Future)

Anthropic is working on a curated directory for MCPB bundles. Check the [MCPB repository](https://github.com/anthropics/mcpb) for updates.

### Checksum Verification

Users can verify integrity:

```bash
# SHA-256 checksum
shasum -a 256 spotify-mcpb-0.2.2.mcpb
```

---

## Bundle Contents

### Core Server Files

- ✅ `server/index.js` - Main MCP server (16 tools)
- ✅ `server/spotifyWebController.js` - Spotify Web API wrapper
- ✅ `server/playlistController.js` - Playlist operations
- ✅ `server/logging.js` - Structured logging
- ✅ `server/error.js` - Error handling
- ✅ `server/validation.js` - Input validation

### Dependencies

- ✅ `node_modules/` - All production dependencies bundled (~60 packages)
- ✅ `@modelcontextprotocol/sdk` v1.20.1
- ✅ `spotify-web-api-node` v5.0.2
- ✅ `dotenv` v17.2.3
- ✅ `p-limit` v7.2.0
- ✅ `quick-lru` v7.3.0
- ✅ `express` v5.1.0

### Documentation

- ✅ `manifest.json` - MCPB v0.2 manifest
- ✅ `README.md` - Quick start guide
- ✅ `SETUP.md` - Spotify API setup
- ✅ `REFRESH_TOKEN_GUIDE.md` - Interactive OAuth walkthrough
- ✅ `.env.example` - Credential template
- ✅ `LICENSE.md` - MIT License

### Assets

- ✅ `icon.png` - Bundle icon (23.9 KB)

### Available Tools (16 Total)

#### Setup

0. `spotify_get_refresh_token` - Interactive OAuth flow

#### Playback Control

1. `spotify_play` - Resume playback
2. `spotify_pause` - Pause playback
3. `spotify_next_track` - Skip to next
4. `spotify_previous_track` - Skip to previous
5. `spotify_set_volume` - Set volume (0-100)

#### Track Information

6. `spotify_get_current_track` - Get currently playing track
7. `spotify_get_playback_state` - Get full playback state
8. `spotify_search_tracks` - Search Spotify catalog

#### Playlist Management

9. `spotify_create_playlist` - Create new playlist
10. `spotify_add_tracks_to_playlist` - Add tracks with deduplication
11. `spotify_get_playlist` - Get playlist details
12. `spotify_get_user_playlists` - List user's playlists

#### Recommendations & Analysis

13. `spotify_get_recommendations` - Get AI recommendations
14. `spotify_get_audio_features` - Get track audio features
15. `spotify_analyze_playlist` - Full playlist analysis

### Bundle Statistics

#### Size Breakdown

- **Total Bundle**: ~2 MB (compressed)
- **Unpacked**: ~6 MB
- **Node Modules**: ~5.8 MB (920+ files)
- **Server Code**: ~38 KB (6 files)
- **Documentation**: ~30 KB
- **Manifest**: 4.4 KB

#### File Count

- **Total**: 1,144+ files
- **Bundled**: 868+ files
- **Ignored**: 276+ files (dev dependencies, tests)

#### Dependencies (Production Only)

- Main: 5 direct dependencies
- Total: 60 packages (including transitive)
- No vulnerabilities found

---

## Troubleshooting

### Bundle Creation Issues

#### "Bundle validation failed"

```bash
# Check manifest syntax
mcpb validate manifest.json

# Common issues:
# - Invalid JSON in manifest.json
# - Missing required fields
# - Incorrect manifest_version
```

#### "Bundle too large"

- Run `npm prune --production`
- Check for duplicate dependencies
- Remove test files and documentation
- Consider minifying code (optional)

### Installation Issues

#### Bundle won't install

- Check file isn't corrupted (verify checksum)
- Try extracting manually
- Check Claude Desktop version is up to date

#### "Server fails to start after installation"

- Check that all dependencies are bundled
- Verify entry point is correct in manifest.json
- Test locally before bundling
- Check file permissions (executables need +x on Unix)
- Review server logs with `node server/index.js`

#### "User configuration not working"

- Verify `user_config` section in manifest.json
- Check `mcp_config.env` mappings
- Test with Claude Desktop's configuration UI

### Runtime Issues

#### Tools not responding

- Ensure Spotify is open on a device
- Check if Premium account (required for playback)
- Verify refresh token is valid
- Check Claude Desktop logs

#### Authentication errors

- Double-check your Client ID and Client Secret
- Ensure you're using the **refresh token**, not access token
- Verify redirect URI is `http://localhost:8888/callback`

#### "No active device" error

- Open Spotify on any device (desktop, mobile, web)
- Start playing something
- Try the command again

### Where are logs?

- **Windows**: `%APPDATA%\Claude\logs`
- **macOS**: `~/Library/Logs/Claude`
- **Server logs**: stderr output (JSON format)

---

## Best Practices

### Security

1. **Never bundle secrets**:

   - No `.env` files
   - No API keys or tokens in code
   - Use `user_config` for credentials
2. **Validate inputs**:

   - Already implemented in `validation.js` ✅
   - Sanitize user input
   - Check file paths
3. **Handle errors gracefully**:

   - Already implemented in `error.js` ✅
   - Log errors properly
   - Return meaningful messages
4. **User Responsibilities**:

   - Keep Spotify credentials secure
   - Don't share `.env` files
   - Revoke tokens if compromised
   - Review Spotify's privacy policy

### Documentation

1. **Include comprehensive README**:

   - Installation instructions
   - Setup guide (Spotify credentials)
   - Usage examples
   - Troubleshooting section
2. **Provide .env.example**:

   - Document all required variables
   - Include example values
   - Explain how to obtain credentials
3. **Interactive Setup Guide**:

   - `REFRESH_TOKEN_GUIDE.md` walks through OAuth flow
   - Built-in tool helps users get tokens
   - Clear step-by-step instructions

### Testing

1. **Test on clean systems**:

   - No development tools installed
   - Fresh Claude Desktop installation
   - Different OS versions
2. **Test with real credentials**:

   - Verify Spotify API integration works
   - Test all 16 tools
   - Check error handling
3. **Test updates**:

   - Install old version, then update
   - Verify configuration persists

### Updating Your Bundle

When you release a new version:

1. **Update version** in `manifest.json`, `package.json`, and `server/index.js`:

   ```json
   {
     "version": "0.2.2"
   }
   ```
2. **Update changelog** in CHANGELOG.md
3. **Rebuild the bundle**:

   ```bash
   mcpb pack . spotify-mcpb-0.2.2.mcpb
   ```
4. **Test thoroughly** before distributing
5. **Create a new GitHub release** with version tag

---

## Updating to New Versions

### For Users

To update to a new version:

1. Download new bundle
2. Install over existing (Claude Desktop handles this)
3. Credentials are preserved
4. Server automatically restarted

Or manually:

```bash
# Remove old version
rm -rf ~/spotify-mcpb-old

# Extract new version
unzip spotify-mcpb-0.2.2.mcpb -d ~/spotify-mcpb

# Copy credentials
cp ~/spotify-mcpb-old/.env ~/spotify-mcpb/.env
```

---

## Additional Resources

### Official Documentation

- **MCPB Specification**: https://github.com/anthropics/mcpb/blob/main/MANIFEST.md
- **CLI Documentation**: https://github.com/anthropics/mcpb/blob/main/CLI.md
- **Example Bundles**: https://github.com/anthropics/mcpb/tree/main/examples
- **MCP SDK Documentation**: https://github.com/modelcontextprotocol/sdk

### Project Links

- **Repository**: https://github.com/fabioc-aloha/spotify-mcpb
- **Issues**: https://github.com/fabioc-aloha/spotify-mcpb/issues
- **Spotify Web API**: https://developer.spotify.com/documentation/web-api

### Support

If you encounter issues:

1. Check the [MCPB Issues](https://github.com/anthropics/mcpb/issues)
2. Review [MCP Server documentation](https://modelcontextprotocol.io/)
3. Test your bundle locally before distributing
4. Open an issue on the project repository

---

## Quick Reference

```bash
# Complete bundle creation workflow
npm install -g @anthropic-ai/mcpb          # Install CLI
mcpb validate manifest.json                 # Validate manifest
npm ci --production                         # Install dependencies
mcpb pack . spotify-mcpb-0.2.2.mcpb        # Create bundle
# Result: spotify-mcpb-0.2.2.mcpb

# Test locally
mkdir test && unzip spotify-mcpb-0.2.2.mcpb -d test
cd test && node server/index.js

# Distribute
# Upload to GitHub releases or share directly
```

---

## Credits

- **Original Project**: spotify-dxt by Kenneth Lien (macOS-only version)
- **Cross-Platform Port & Features**: Fabio Correa
- **MCPB Specification**: Anthropic
- **MCP Protocol**: Model Context Protocol
- **Spotify Web API**: Spotify

---

## License

MIT License - See LICENSE.md in bundle

---

**Your bundle is ready for distribution! 🎉**

Share `spotify-mcpb-0.2.2.mcpb` with users - they can install with one click!
