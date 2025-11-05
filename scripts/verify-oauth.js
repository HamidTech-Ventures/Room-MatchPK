#!/usr/bin/env node

/**
 * OAuth Configuration Verification Script
 * This script helps verify your Google OAuth setup
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

function verifyConfiguration() {
  console.log('🔍 Verifying Google OAuth Configuration...\n');
  
  const env = loadEnvFile();
  
  // Check required environment variables
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  let allPresent = true;
  
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
  
  console.log('\n📋 Configuration Summary:');
  console.log(`   NEXTAUTH_URL: ${env.NEXTAUTH_URL}`);
  console.log(`   Google Client ID: ${env.GOOGLE_CLIENT_ID}`);
  
  if (env.GOOGLE_CLIENT_ID === 'your-google-client-id' || env.GOOGLE_CLIENT_ID.length < 20) {
    console.log('\n❌ WARNING: It looks like you have a placeholder Google Client ID!');
    console.log('📝 You need to create an OAuth 2.0 Client ID first:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Navigate to APIs & Services → Credentials');
    console.log('3. If you see "No OAuth clients to display", read CREATE_OAUTH_CLIENT.md');
    console.log('4. Follow the step-by-step guide to create your OAuth client');
    console.log('\n⚠️  Cannot proceed with redirect URI configuration until OAuth client exists.');
    return;
  }
  
  console.log('\n🔗 Required Redirect URIs for Google Cloud Console:');
  console.log(`   Production: ${env.NEXTAUTH_URL}/api/auth/callback/google`);
  console.log(`   Development: http://localhost:3000/api/auth/callback/google`);
  console.log(`   Development (Alt): http://127.0.0.1:3000/api/auth/callback/google`);
  
  console.log('\n📝 Steps to fix redirect_uri_mismatch error:');
  console.log('1. Go to https://console.cloud.google.com/');
  console.log('2. Navigate to APIs & Services → Credentials');
  console.log(`3. Find OAuth 2.0 Client ID: ${env.GOOGLE_CLIENT_ID}`);
  console.log('4. Click on the Client ID to edit it');
  console.log('5. In "Authorized redirect URIs" section, add ALL the URIs listed above');
  console.log('6. Also add to "Authorized JavaScript origins":');
  console.log(`   - ${env.NEXTAUTH_URL}`);
  console.log(`   - http://localhost:3000`);
  console.log('7. Click SAVE');
  console.log('8. Wait 5-10 minutes for changes to propagate');
  console.log('9. Clear browser cache and try again');
  
  console.log('\n✅ Configuration verification complete!');
}

verifyConfiguration();
