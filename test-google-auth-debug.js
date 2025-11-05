// Test script to debug Google Auth API
const fetch = require('node-fetch');

async function testGoogleAuth() {
  console.log('🧪 Testing Google Auth API...');
  
  // Test data - simulating what Flutter might send
  const testData = {
    token: 'fake-token-for-testing', // This will fail Google verification but we want to see the structure
    intent: 'student'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/mobile/auth/googleauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('📋 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testGoogleAuth();
