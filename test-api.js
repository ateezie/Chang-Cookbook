require('dotenv').config();
const https = require('https');

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

console.log('🔑 API Key loaded:', UNSPLASH_ACCESS_KEY ? `${UNSPLASH_ACCESS_KEY.substring(0, 8)}...` : 'NOT FOUND');

if (!UNSPLASH_ACCESS_KEY) {
  console.error('❌ No API key found in environment variables');
  process.exit(1);
}

// Test the most basic endpoint
const testUrl = 'https://api.unsplash.com/photos?per_page=1';

const req = https.request(testUrl, {
  headers: {
    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    'Accept-Version': 'v1'
  }
}, (res) => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📡 HTTP Status:', res.statusCode);
    console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
    
    if (res.statusCode === 200) {
      console.log('✅ API key is working!');
      const photos = JSON.parse(data);
      console.log(`📸 Got ${photos.length} photos from Unsplash`);
    } else {
      console.log('❌ API Error Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('🔌 Network Error:', error.message);
});

req.end();