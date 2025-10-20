# Getting Your Spotify Refresh Token with Claude

The easiest way to get your Spotify refresh token is to ask Claude! The bundle includes a built-in interactive tool that guides you through the process.

## Prerequisites

1. **Spotify Developer App** created with Client ID and Client Secret
   - If you haven't done this yet, visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Set redirect URI to: `http://localhost:8888/callback`
   - Note your Client ID and Client Secret

2. **Spotify MCPB Bundle installed** in Claude Desktop

## Step-by-Step Guide

### Step 1: Start the Process

Ask Claude:
```
Help me get a Spotify refresh token. My client ID is [YOUR_CLIENT_ID] and client secret is [YOUR_CLIENT_SECRET]
```

Or simply:
```
I need to set up Spotify authentication
```

### Step 2: Get the Authorization URL

Claude will call the `spotify_get_refresh_token` tool and provide you with:
- An authorization URL
- Clear instructions on what to do next

The response will look like:
```json
{
  "step": 1,
  "message": "Authorization required...",
  "authorization_url": "https://accounts.spotify.com/authorize?...",
  "instructions": [
    "1. Visit the authorization_url above in your web browser",
    "2. Log in to Spotify and authorize the application",
    "3. You will be redirected to http://localhost:8888/callback?code=...",
    "4. Copy the entire URL you were redirected to",
    "5. Call this tool again with the authorization_code from the URL"
  ]
}
```

### Step 3: Authorize in Your Browser

1. **Copy the authorization URL** from Claude's response
2. **Open it in your web browser**
3. **Log in to Spotify** (if not already logged in)
4. **Click "Agree"** to authorize the application
5. You'll be redirected to a URL that looks like:
   ```
   http://localhost:8888/callback?code=AQD...very_long_code...XYZ
   ```
6. **Copy the entire redirect URL** (including the `http://...`)

### Step 4: Complete the Process

Tell Claude:
```
I got redirected to: http://localhost:8888/callback?code=AQD...XYZ
```

Or you can extract just the code part and say:
```
My authorization code is: AQD...XYZ
```

### Step 5: Get Your Refresh Token

Claude will exchange the authorization code for your refresh token and provide:
```json
{
  "success": true,
  "refresh_token": "AQC...your_refresh_token...XYZ",
  "access_token": "BQD...temporary_access_token...ABC",
  "expires_in": 3600,
  "message": "Success! Save the refresh_token to your .env file...",
  "instructions": [
    "1. Copy the refresh_token value above",
    "2. Add it to your .env file as: SPOTIFY_REFRESH_TOKEN=<your_token>",
    "3. You can now use all Spotify tools"
  ]
}
```

### Step 6: Save Your Token

**For Claude Desktop users:**
- Claude Desktop will prompt you to save the refresh token in the bundle configuration
- Or you can manually add it to the bundle settings

**For developers:**
1. Copy the `refresh_token` value
2. Add it to your `.env` file:
   ```env
   SPOTIFY_REFRESH_TOKEN=AQC...your_token_here...XYZ
   ```

## Example Conversation

Here's what a complete conversation might look like:

**You:**
> Help me get a Spotify refresh token. My client ID is abc123xyz and client secret is secret789

**Claude:**
> I'll help you get your Spotify refresh token! First, you need to authorize the application.
>
> Please visit this URL in your browser:
> https://accounts.spotify.com/authorize?client_id=abc123xyz&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-read-playback-state%20user-modify-playback-state...
>
> After you log in and authorize the app, you'll be redirected to a URL that starts with http://localhost:8888/callback?code=...
>
> Copy that entire URL and send it to me.

**You:**
> I was redirected to: http://localhost:8888/callback?code=AQDhJ7k2mN8pQ3rS5tU9vW0xY1zA2bC3dE4fG5h

**Claude:**
> Perfect! I've exchanged that code for your tokens. Here's your refresh token:
>
> ```
> AQCFXq_nBK-OlK6Lqn8v7UVG41ruPDEdfSY1enzryf7qJrLpX7MjslMtnIOCC-5Q
> ```
>
> Save this token securely! You'll need to add it to your Spotify MCPB configuration as `SPOTIFY_REFRESH_TOKEN`.
>
> This refresh token doesn't expire unless you revoke it, so you only need to do this once.

**You:**
> Thanks! Now play something upbeat

**Claude:**
> I'd be happy to play something upbeat! However, playback control requires an active Spotify device...

## Troubleshooting

### "The redirect didn't work"

This is normal! The redirect to `http://localhost:8888/callback` will show an error page because there's no server running at that address. **This is expected behavior.**

What matters is the URL itself - specifically the `code=` parameter in the URL. Just copy the entire URL and give it to Claude.

### "Invalid client" error

- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces
- Verify the credentials are from the correct app in your Spotify Dashboard

### "Invalid redirect URI" error

- Make sure your Spotify app has `http://localhost:8888/callback` in the Redirect URIs list
- The URI must match exactly (including the port number)

### "Authorization code has expired"

Authorization codes only last for a short time (usually 10 minutes). If you see this error:
1. Start the process again from Step 1
2. Complete all steps quickly
3. Don't reuse an old authorization code

### "I closed the browser before copying the URL"

No problem! Just start over from Step 1. You can authorize as many times as needed.

## Security Notes

- **Never share your refresh token** - it provides full access to your Spotify account
- **The refresh token doesn't expire** unless you revoke it
- **You can revoke access anytime** from [Spotify Account Settings](https://www.spotify.com/account/apps/)
- **Each authorization code is single-use** - once exchanged for tokens, it becomes invalid

## Why This is Better Than Manual Scripts

The built-in `spotify_get_refresh_token` tool offers several advantages:

1. **No Setup Required** - No need to create or run separate Node.js scripts
2. **Integrated Workflow** - Everything happens within your conversation with Claude
3. **Clear Instructions** - Claude guides you through each step
4. **Error Handling** - Better error messages and troubleshooting help
5. **Secure** - Your credentials never leave your machine
6. **Convenient** - No need to open terminals or install additional dependencies

## What This Tool Does

Behind the scenes, the `spotify_get_refresh_token` tool:

1. Creates a Spotify authorization URL with the correct scopes
2. Includes all required permissions:
   - `user-read-playback-state` - Read playback state
   - `user-modify-playback-state` - Control playback
   - `user-read-currently-playing` - Get current track
   - `playlist-read-private` - Read private playlists
   - `playlist-read-collaborative` - Read collaborative playlists
   - `playlist-modify-public` - Modify public playlists
   - `playlist-modify-private` - Modify private playlists
   - `user-library-read` - Read library
   - `user-top-read` - Read top tracks/artists

3. Exchanges the authorization code for tokens using Spotify's OAuth 2.0 flow
4. Returns your refresh token securely

## Next Steps

Once you have your refresh token:

1. **Save it** to your bundle configuration or `.env` file
2. **Test it** by asking Claude to get your current playback state
3. **Start using Spotify** - play music, create playlists, analyze audio features, and more!

---

**Ready to get started?** Just ask Claude:
```
Help me set up Spotify - I need to get a refresh token
```
