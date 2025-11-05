#!/usr/bin/env node

/**
 * Google OAuth Test Script
 * This script helps test your Google OAuth configuration
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

async function testGoogleOAuthConfig() {
  console.log('🔍 Testing Google OAuth Configuration...\n');
  
  const env = loadEnvFile();
  
  // Check required environment variables
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  let allPresent = true;
  
  console.log('📋 Environment Variables Check:');
  requiredVars.forEach(varName => {
    if (env[varName]) {
      console.log(`✅ ${varName}: Present`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  });
  
  if (!allPresent) {
    console.log('\n❌ Some required environment variables are missing.');
    return;
  }
  
  console.log('\n🔗 OAuth Configuration:');
  console.log(`   NEXTAUTH_URL: ${env.NEXTAUTH_URL}`);
  console.log(`   Google Client ID: ${env.GOOGLE_CLIENT_ID}`);
  
  console.log('\n📍 Required Redirect URIs for Google Cloud Console:');
  console.log(`   Production: ${env.NEXTAUTH_URL}/api/auth/callback/google`);
  console.log(`   Development: http://localhost:3000/api/auth/callback/google`);
  
  // Test if the client ID format is correct
  const clientIdPattern = /^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
  if (clientIdPattern.test(env.GOOGLE_CLIENT_ID)) {
    console.log('\n✅ Google Client ID format looks correct');
  } else {
    console.log('\n❌ Google Client ID format looks incorrect');
    console.log('   Expected format: 123456789-abcdefg.apps.googleusercontent.com');
  }
  
  // Test if the client secret format is correct
  const clientSecretPattern = /^GOCSPX-[a-zA-Z0-9_-]+$/;
  if (clientSecretPattern.test(env.GOOGLE_CLIENT_SECRET)) {
    console.log('✅ Google Client Secret format looks correct');
  } else {
    console.log('❌ Google Client Secret format looks incorrect');
    console.log('   Expected format: GOCSPX-abcdefghijklmnop');
  }
  
  console.log('\n🚨 Current Issue Analysis:');
  console.log('   Error: OAuthCallback');
  console.log('   Location: After Google consent screen');
  console.log('   Redirect URL: http://localhost:3000/auth/login?callbackUrl=...&error=OAuthCallback');
  
  console.log('\n🔧 Possible Solutions:');
  console.log('1. ❗ CREATE GOOGLE OAUTH CLIENT (Most Likely Issue):');
  console.log('   - Go to https://console.cloud.google.com/apis/credentials');
  console.log('   - Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"');
  console.log('   - Application type: "Web application"');
  console.log('   - Add the redirect URIs listed above');
  console.log('   - Copy the new Client ID and Secret to .env.local');
  
  console.log('\n2. 🔄 UPDATE EXISTING OAUTH CLIENT:');
  console.log('   - Find your OAuth client in Google Cloud Console');
  console.log('   - Add missing redirect URIs');
  console.log('   - Ensure domains are authorized');
  
  console.log('\n3. 🔍 CHECK OAUTH CONSENT SCREEN:');
  console.log('   - Go to "OAuth consent screen" in Google Cloud Console');
  console.log('   - Ensure app is configured and published');
  console.log('   - Add your domain to authorized domains');
  
  console.log('\n4. 🕐 WAIT FOR PROPAGATION:');
  console.log('   - Changes can take 5-10 minutes to propagate');
  console.log('   - Try clearing browser cache');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Create/update Google OAuth client with correct redirect URIs');
  console.log('2. Update .env.local with new credentials');
  console.log('3. Restart your development server');
  console.log('4. Test at: http://localhost:3000/debug/oauth');
  
  console.log('\n✅ Configuration test complete!');
}

testGoogleOAuthConfig().catch(console.error);
