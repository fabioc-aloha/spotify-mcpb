#!/usr/bin/env node
/**
 * Manual Spotify Refresh Token Generator
 * 
 * If the automated script doesn't work, use this manual approach.
 */

import 'dotenv/config';
import SpotifyWebApi from 'spotify-web-api-node';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env file');
  process.exit(1);
}

const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
});

const scopes = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-top-read',
];

console.log('🎵 Manual Spotify Refresh Token Generator');
console.log('==========================================');
console.log('');

// Step 1: Show authorization URL
const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
console.log('📋 STEP 1: Visit this URL in your browser:');
console.log('');
console.log(authorizeURL);
console.log('');
console.log('📋 STEP 2: After authorization, copy the FULL redirect URL');
console.log('📋 STEP 3: Look for the "code" parameter in the URL');
console.log('📋 STEP 4: Run this script again with the code:');
console.log('   node manual-token.js YOUR_AUTHORIZATION_CODE');
console.log('');

// If authorization code is provided as argument
const authCode = process.argv[2];
if (authCode) {
  console.log('🔄 Exchanging authorization code for tokens...');
  console.log('');
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(authCode);
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;
    const expiresIn = data.body.expires_in;

    console.log('🎉 SUCCESS! Here are your tokens:');
    console.log('=====================================');
    console.log('');
    console.log('🔑 Access Token:', accessToken);
    console.log('♻️  Refresh Token:', refreshToken);
    console.log('⏰ Expires In:', expiresIn, 'seconds');
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('1. Copy the refresh token above');
    console.log('2. Add it to your .env file:');
    console.log(`   SPOTIFY_REFRESH_TOKEN=${refreshToken}`);
    console.log('3. Restart your server: npm start');
    console.log('4. All Spotify tools will now work!');
    console.log('');

  } catch (error) {
    console.error('❌ Failed to exchange authorization code:', error.message);
    
    let helpText = 'Make sure the authorization code is valid and hasn\'t been used already.';
    if (error.message.includes('invalid_grant')) {
      helpText = 'The authorization code has expired or been used already. Please get a new code.';
    } else if (error.message.includes('invalid_client')) {
      helpText = 'Invalid client credentials. Please check your Client ID and Client Secret.';
    }
    
    console.log('');
    console.log('💡 HELP:', helpText);
    console.log('');
  }
}
