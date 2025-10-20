# Local Testing Guide - Spotify MCPB

Quick guide for testing the Spotify MCPB server locally during development.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure credentials**:
   - Edit `.env` and add your Spotify Client ID and Client Secret
   - Get these from: https://developer.spotify.com/dashboard
   - Leave `SPOTIFY_REFRESH_TOKEN` empty initially

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Server should start with warning**:
   ```json
   {"level":"warn","event":"spotify_controller_partially_initialized","message":"No refresh token provided. Only token generation tools will work."}
   {"level":"info","event":"server_started","name":"spotify-mcpb","version":"0.2.2"}
   ```

## 🛠️ Available NPM Scripts

```bash
npm start        # Start the server
npm run test     # Check syntax of all JS files
npm run validate # Validate manifest.json
npm run bundle   # Create MCPB bundle
npm run clean    # Remove bundle files
npm run get-token # Get Spotify refresh token (interactive)
```## 📝 Configuration

### Required Credentials (.env file)
```env
SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
SPOTIFY_REFRESH_TOKEN=  # Leave empty initially
LOG_LEVEL=debug
```

### Getting Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use existing one
3. Add redirect URI: `http://127.0.0.1:8888/callback`
4. Copy Client ID and Client Secret to `.env`

### Getting Refresh Token (Local Development)

For local testing, use the built-in helper script:

```bash
npm run get-token
```

This will:
1. Show you an authorization URL to visit
2. Open a local server on port 8888
3. Handle the OAuth callback automatically
4. Display your refresh token
5. Give you the exact line to add to your `.env` file

**Alternative Methods:**
- Use the MCP tool in Claude Desktop (if you have it set up)
- Follow the manual process in `SETUP.md`
- Use any OAuth 2.0 flow that supports the authorization code grant

## 🧪 Testing Workflow

### 1. Test Server Startup
```bash
npm start
# Should see: server_started with version 0.2.2
# Should warn about missing refresh token
```

### 2. Test with Partial Credentials
- Server starts with only CLIENT_ID and CLIENT_SECRET ✅
- Shows warning about missing refresh token ✅
- Only `spotify_get_refresh_token` tool will work ✅

### 3. Test with Full Credentials
- Add SPOTIFY_REFRESH_TOKEN to `.env`
- Restart server: `npm start`
- Should see: server_started with no warnings ✅
- All 16 tools should work ✅

### 4. Test Bundle Creation
```bash
npm run validate  # Check manifest
npm run bundle    # Create .mcpb file
```

## 🐛 Troubleshooting

### Server Won't Start
- Check syntax: `npm run test`
- Check Node.js version: `node --version` (needs >=18.0.0)
- Check .env file has valid values

### "Invalid client" Error
- Double-check Client ID and Client Secret
- Make sure redirect URI is set: `http://127.0.0.1:8888/callback`

### "No refresh token" Warnings
- This is normal for initial setup
- Use spotify_get_refresh_token tool to get one
- Or manually follow SETUP.md guide

### Bundle Issues
- Validate manifest: `npm run validate`
- Check MCPB CLI is installed: `npm install -g @anthropic-ai/mcpb`

## 📋 Verification Checklist

- [ ] Server starts without errors
- [ ] Shows correct version (0.2.2)
- [ ] Warns about missing refresh token (if not provided)
- [ ] Syntax validation passes (`npm run test`)
- [ ] Manifest validation passes (`npm run validate`)
- [ ] Bundle creation works (`npm run bundle`)
- [ ] All 16 tools are defined in manifest
- [ ] refresh_token is optional in manifest (`required: false`)

## 🔄 Key Features Fixed in v0.2.2

- ✅ **Refresh token is now optional** in setup dialog
- ✅ **Server starts with partial credentials** (CLIENT_ID + CLIENT_SECRET only)
- ✅ **Proper ensureReady() checks** on all API methods
- ✅ **Clear error messages** when refresh token is missing
- ✅ **spotify_get_refresh_token tool works independently**

## 📚 Related Files

- `.env` - Your local credentials (DO NOT COMMIT)
- `.env.example` - Template for credentials
- `manifest.json` - MCPB bundle configuration
- `server/index.js` - Main MCP server
- `server/spotifyWebController.js` - Spotify API wrapper

---

**Ready to test!** 🎵

The refresh token issue should now be resolved. Users can install the bundle and only need to provide CLIENT_ID and CLIENT_SECRET initially. The refresh token can be obtained after installation using Claude.
