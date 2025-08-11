// Test script to verify API endpoints work correctly
// This simulates how your frontend will work on both local and Vercel

const testEndpoints = async () => {
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Health endpoint
  try {
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch('/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint working:', healthData);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }

  // Test 2: Session creation
  try {
    console.log('\n2️⃣ Testing Session Creation...');
    const sessionResponse = await fetch('/api/session/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const sessionData = await sessionResponse.json();
    console.log('✅ Session creation working:', sessionData);
  } catch (error) {
    console.log('❌ Session creation failed:', error.message);
  }

  // Test 3: Chat endpoint
  try {
    console.log('\n3️⃣ Testing Chat Endpoint...');
    const chatResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello, this is a test' }]
      })
    });
    const chatData = await chatResponse.json();
    console.log('✅ Chat endpoint working:', chatData);
  } catch (error) {
    console.log('❌ Chat endpoint failed:', error.message);
  }

  console.log('\n🎯 Test Complete!');
  console.log('\n📝 How it works:');
  console.log('   • Local Development: /api/* → Vite Proxy → localhost:3001');
  console.log('   • Vercel Production: /api/* → Vercel API Routes');
  console.log('   • Frontend code: Always uses relative URLs (/api/*)');
};

// Note: This script needs to run in a browser environment
// or with proper fetch polyfill for Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  testEndpoints();
} else {
  console.log('This test script is designed to run in a browser environment.');
  console.log('It demonstrates how your frontend will work on both local and Vercel.');
} 