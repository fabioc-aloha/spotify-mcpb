# Setup Guide - Spotify MCPB

Complete guide to getting your Spotify MCPB bundle up and running.

---

## Installation & Setup Process

### Step 1: Install the Bundle

1. Download `spotify-mcpb-0.2.0.mcpb` from [releases](https://github.com/fabioc-aloha/spotify-mcpb/releases)
2. Double-click the `.mcpb` file to install in Claude Desktop
3. Claude Desktop will show a configuration dialog

### Step 2: Get Spotify Developer Credentials

Before you can fill in the configuration dialog, you need to create a Spotify Developer App:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in the form:
   - **App name**: "My Spotify MCP" (or any name you like)
   - **App description**: "MCP integration for Spotify"
   - **Redirect URIs**: `http://localhost:8888/callback`
   - **Which API/SDKs are you planning to use**: Web API
5. Accept the terms and click **Create**
6. On your app's page, click **"Settings"**
7. Note your **Client ID**
8. Click **"View client secret"** and note your **Client Secret**

### Step 3: Fill in the Configuration Dialog

When Claude Desktop asks for configuration:

1. **Spotify Client ID**: Paste the Client ID from Step 2
2. **Spotify Client Secret**: Paste the Client Secret from Step 2
3. **Spotify Refresh Token**: Leave empty for now (you'll get this next)
4. **Log Level**: Leave default as "info" (or choose: debug, warn, error)

Click **Save** or **Install** to continue.

### Step 4: Get Your Refresh Token (Automatic!)

After the bundle is installed, simply ask Claude:

```
"Help me get a Spotify refresh token"
```

Claude will:
1. Generate an authorization URL for you
2. Guide you through the Spotify authorization process
3. Exchange your authorization code for a refresh token
4. Provide the refresh token to save back in the configuration

Then update the configuration with your refresh token and you're done!

---

## What to Enter in the Setup Dialog

**Quick Reference**:

| Field | Value | How to Get It |
|-------|-------|---------------|
| **Spotify Client ID** | Your app's Client ID | Spotify Developer Dashboard > Your App > Settings |
| **Spotify Client Secret** | Your app's Client Secret | Spotify Developer Dashboard > Your App > Settings > View client secret |
| **Spotify Refresh Token** | Leave empty initially | After installation, ask Claude: "Help me get a Spotify refresh token" |
| **Log Level** | `info` (default) | Optional: debug, info, warn, or error |

---

## Alternative: Manual Refresh Token Method

If you prefer not to use Claude's interactive method, you can obtain a refresh token manually:

## Alternative: Manual Refresh Token Method

If you prefer not to use Claude's interactive method, you can obtain a refresh token manually:

1. Clone the helper script:
   ```bash
   git clone https://github.com/thelinmichael/spotify-web-api-node
   cd spotify-web-api-node/examples/tutorial
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Edit `authorization_code/app.js` and update:
   ```javascript
   var client_id = 'YOUR_CLIENT_ID';
   var client_secret = 'YOUR_CLIENT_SECRET';
   var redirect_uri = 'http://localhost:8888/callback';
   ```

4. Run the authorization flow:
   ```bash
   node app.js
   ```

5. Open `http://localhost:8888` in your browser
6. Click "Log in with Spotify"
7. Authorize the app
8. You'll be redirected to a page showing your **access_token** and **refresh_token**
9. Copy the **refresh_token** - this is what you need!

---

## For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   SPOTIFY_CLIENT_ID=abc123...
   SPOTIFY_CLIENT_SECRET=def456...
   SPOTIFY_REFRESH_TOKEN=xyz789...
   LOG_LEVEL=info
   ```

## Testing

### Test locally:

```bash
npm install
npm start
```

The server should start and log:
```json
{"timestamp":"...","level":"info","event":"server_started","name":"spotify-mcpb","version":"0.2.0"}
```

### Test with Claude:

1. Ask: "What's currently playing on Spotify?"
2. Try: "Search for tracks by Daft Punk"
3. Create: "Create a playlist called 'Test Playlist'"

## Required Scopes

The refresh token needs these Spotify scopes:

- `user-read-playback-state` - Read playback state
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - Get current track
- `playlist-read-private` - Read private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `playlist-modify-public` - Modify public playlists
- `playlist-modify-private` - Modify private playlists
- `user-library-read` - Read library
- `user-top-read` - Read top tracks/artists

## Troubleshooting

**"Invalid client" error**
- Double-check your Client ID and Client Secret
- Make sure you copied them correctly from the dashboard

**"Invalid redirect URI" error**
- Ensure `http://localhost:8888/callback` is added to your app's Redirect URIs in the Spotify Dashboard
- The URI must match exactly (including the port)

**"Invalid refresh token" error**
- Your refresh token may have expired or been revoked
- Generate a new refresh token using the steps above
- Make sure you're using the **refresh_token**, not the **access_token**

**"No active device" error**
- Open Spotify on any device (desktop app, mobile, or web player)
- Start playing something
- Try the command again

**"Premium required" error**
- Playback control features require Spotify Premium
- Search and playlist features work with Free accounts

## Security Notes

- **Never share your credentials publicly**
- Add `.env` to `.gitignore` (already done in this project)
- The refresh token doesn't expire unless you revoke it
- You can revoke access anytime from [Spotify Account Settings](https://www.spotify.com/account/apps/)

## Need Help?

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Community Forums](https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer)
- [Project Issues](https://github.com/fabioc-aloha/spotify-mcpb/issues)
