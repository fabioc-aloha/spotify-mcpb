# Claude Desktop Setup Guide - Spotify MCPB

**Quick guide for getting Spotify MCPB working in Claude Desktop**

## The OAuth Redirect URI Issue

Claude Desktop runs in a different environment than your local development setup, which can cause issues with the OAuth redirect URI. Here are the solutions:

## ✅ Recommended Setup Options

### Option 1: Multiple Redirect URIs (Recommended)

Add **ALL** of these redirect URIs to your Spotify Developer App:

```
http://127.0.0.1:8888/callback
http://localhost:8888/callback
http://127.0.0.1:3000/callback
urn:ietf:wg:oauth:2.0:oob
```

**Why this works**: Different environments may prefer different URIs. Having multiple ensures compatibility.

### Option 2: Out-of-Band Flow (Most Compatible)

If the callback URLs don't work in Claude Desktop, use the out-of-band flow:

1. **Add to Spotify App**: `urn:ietf:wg:oauth:2.0:oob`
2. **When authorizing**: You'll get an authorization code displayed on screen instead of a redirect
3. **Copy the code**: Use this code directly with Claude

## 🛠️ Step-by-Step Setup for Claude Desktop

### Step 1: Configure Your Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Open your app (or create one)
3. Click **"Edit Settings"**
4. Under **"Redirect URIs"**, add ALL of these:
   ```
   http://127.0.0.1:8888/callback
   http://localhost:8888/callback
   http://127.0.0.1:3000/callback
   urn:ietf:wg:oauth:2.0:oob
   ```
5. Click **"Save"**

### Step 2: Install Bundle in Claude Desktop

1. Download `spotify-mcpb-0.2.2.mcpb`
2. Double-click to install in Claude Desktop
3. Enter your credentials:
   - **Client ID**: From Spotify Developer Dashboard
   - **Client Secret**: From Spotify Developer Dashboard
   - **Refresh Token**: Leave empty initially

### Step 3: Get Refresh Token via Claude

Ask Claude:
```
"Help me get a Spotify refresh token"
```

Claude will:
1. Generate an authorization URL
2. Guide you through the OAuth process
3. Handle different redirect scenarios automatically
4. Extract your refresh token

### Step 4: Update Configuration

Once you have the refresh token:
1. Update Claude Desktop configuration
2. Set **SPOTIFY_REFRESH_TOKEN** to the token value
3. Ready to use! Try: _"What's playing on Spotify?"_

## 🔧 Troubleshooting

### "This site can't be reached" Error

**Problem**: Browser can't reach `127.0.0.1:8888/callback`

**Solutions**:
1. **Check URL bar**: Even if page fails to load, the authorization code should be in the URL
2. **Copy full URL**: `http://127.0.0.1:8888/callback?code=AQC...` (the code is what matters)
3. **Use out-of-band**: Add `urn:ietf:wg:oauth:2.0:oob` to your Spotify app

### Port 8888 Not Available

**Problem**: Port 8888 might be blocked or in use

**Solution**: Use alternative redirect URI `http://127.0.0.1:3000/callback`

### "Invalid redirect URI" Error

**Problem**: Your Spotify app doesn't have the redirect URI

**Solution**:
1. Add ALL recommended URIs to your Spotify app
2. Make sure there are no typos (case sensitive)
3. Try the out-of-band URI: `urn:ietf:wg:oauth:2.0:oob`

### Claude Desktop Can't Generate Token

**Problem**: Network restrictions in Claude Desktop environment

**Solutions**:
1. **Use local script first**:
   ```bash
   npm run get-token
   ```
2. **Copy token to Claude Desktop configuration**
3. **Alternative**: Use web browser method with out-of-band flow

## 📋 Quick Reference

### Redirect URIs to Add to Spotify App
```
http://127.0.0.1:8888/callback    ← Primary
http://localhost:8888/callback     ← Localhost alternative
http://127.0.0.1:3000/callback    ← Alternative port
urn:ietf:wg:oauth:2.0:oob         ← Out-of-band (most compatible)
```

### Claude Commands to Try After Setup
```
"What's playing on Spotify?"
"Create a playlist called 'AI Favorites'"
"Search for tracks by Daft Punk"
"Get recommendations based on high energy electronic music"
"Analyze my Discover Weekly playlist"
```

## 🎯 Why This Approach Works

1. **Multiple URIs**: Cover different environment preferences
2. **Out-of-Band**: Works when callback URLs fail
3. **Flexible Code Extraction**: Handles various URL patterns
4. **Environment Agnostic**: Works in Claude Desktop, local development, and web browsers

## 📞 Support

If you still have issues:
1. **Check Spotify Developer Dashboard**: Verify all redirect URIs are saved
2. **Copy exact error messages**: Include full error text when asking for help
3. **Try out-of-band flow**: Most compatible option for restricted environments
4. **Use local development first**: Generate token locally, then copy to Claude Desktop

---

**The key insight**: Claude Desktop has different networking constraints than local development. Multiple redirect URIs and out-of-band support ensure compatibility across all environments.
