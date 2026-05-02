// Simple test script to verify blog endpoints are accessible
// This tests the API structure without requiring a database

const http = require('http');

// Test function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testBlogEndpoints() {
  console.log('Testing Blog API Endpoints...\n');
  
  const baseUrl = 'http://localhost:3000';
  const apiKey = 'test-admin-api-key-12345';
  
  try {
    // Test 1: Health check (should work without database)
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/healthz',
      method: 'GET'
    });
    console.log(`   Status: ${healthResponse.statusCode}`);
    console.log(`   Response: ${healthResponse.body}\n`);
    
    // Test 2: List blog posts (should work but return empty due to no database)
    console.log('2. Testing GET /api/blog/posts...');
    try {
      const listResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/blog/posts',
        method: 'GET'
      });
      console.log(`   Status: ${listResponse.statusCode}`);
      console.log(`   Response: ${listResponse.body}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }
    
    // Test 3: Create blog post (should fail auth without API key)
    console.log('3. Testing POST /api/blog/posts (without auth)...');
    try {
      const createResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/blog/posts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, JSON.stringify({
        title: 'Test Blog Post',
        content: 'This is a test blog post content.',
        industryId: 1
      }));
      console.log(`   Status: ${createResponse.statusCode}`);
      console.log(`   Response: ${createResponse.body}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }
    
    // Test 4: Create blog post (should fail auth with wrong API key)
    console.log('4. Testing POST /api/blog/posts (with wrong API key)...');
    try {
      const createResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/blog/posts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'wrong-api-key'
        }
      }, JSON.stringify({
        title: 'Test Blog Post',
        content: 'This is a test blog post content.',
        industryId: 1
      }));
      console.log(`   Status: ${createResponse.statusCode}`);
      console.log(`   Response: ${createResponse.body}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }
    
    // Test 5: Get blog post by slug (should return 404)
    console.log('5. Testing GET /api/blog/posts/test-slug...');
    try {
      const getResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/blog/posts/test-slug',
        method: 'GET'
      });
      console.log(`   Status: ${getResponse.statusCode}`);
      console.log(`   Response: ${getResponse.body}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }
    
    console.log('Blog API endpoint tests completed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run tests
testBlogEndpoints();
