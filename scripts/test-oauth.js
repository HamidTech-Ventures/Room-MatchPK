#!/usr/bin/env node

/**
 * OAuth Test Script
 * This script helps test your Google OAuth setup after configuration
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

async function testOAuthEndpoint() {
  const env = loadEnvFile();
  
  console.log('🧪 Testing OAuth Configuration...\n');
  
  // Test NextAuth endpoint
  const testUrl = `${env.NEXTAUTH_URL}/api/auth/providers`;
  
  console.log(`🔗 Testing: ${testUrl}`);
  
  try {
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (data.google) {
      console.log('✅ NextAuth Google provider is configured correctly');
      console.log(`   Client ID: ${data.google.clientId}`);
      console.log(`   Callback URL: ${data.google.callbackUrl}`);
    } else {
      console.log('❌ Google provider not found in NextAuth configuration');
    }
  } catch (error) {
    console.error('❌ Failed to test NextAuth endpoint:', error.message);
  }
  
  console.log('\n📝 Manual Testing Steps:');
  console.log('1. Open your application in a browser');
  console.log('2. Click "Sign in with Google"');
  console.log('3. If you see the Google consent screen, configuration is working');
  console.log('4. If you get redirect_uri_mismatch, run the verify-oauth.js script');
  
  console.log('\n🔍 Debug URLs:');
  console.log(`   Production Auth: ${env.NEXTAUTH_URL}/auth/login`);
  console.log(`   Local Auth: http://localhost:3000/auth/login`);
  console.log(`   Debug Page: ${env.NEXTAUTH_URL}/debug/oauth`);
}

// Only run if Node.js version supports fetch
if (typeof fetch === 'undefined') {
  console.log('⚠️  This script requires Node.js 18+ for fetch support');
  console.log('🔧 Alternative: Test manually by visiting your auth pages');
  process.exit(0);
}

testOAuthEndpoint();
