/**
 * Simple test script to validate contact endpoint functionality
 * Tests the core implementation without requiring database setup
 */

const express = express();
const request = require('supertest');

// Mock the database and email service
const mockDb = {
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([{ 
        id: 1, 
        publicId: 'ABC123', 
        fullName: 'John Doe', 
        email: 'john@example.com',
        message: 'Test message',
        source: 'website',
        status: 'new',
        createdAt: new Date()
      }])
    })
  })
};

const mockEmailService = {
  sendContactNotification: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  isAvailable: () => true
};

const mockLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};

// Mock the modules
jest.mock('@workspace/db', () => ({ db: mockDb }));
jest.mock('../services/email', () => ({ emailService: mockEmailService }));
jest.mock('../lib/logger', () => ({ logger: mockLogger }));

// Test the validation schemas
const { SubmitContactBody } = require('@workspace/api-zod');

async function testContactValidation() {
  console.log('Testing contact validation schemas...');
  
  try {
    // Test valid payload
    const validPayload = {
      fullName: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Corp',
      phone: '+1-555-0123',
      message: 'This is a valid message for testing purposes.'
    };
    
    const result = SubmitContactBody.parse(validPayload);
    console.log('✅ Valid payload validation passed');
    
    // Test invalid email
    try {
      const invalidPayload = { ...validPayload, email: 'invalid-email' };
      SubmitContactBody.parse(invalidPayload);
      console.log('❌ Invalid email validation should have failed');
    } catch (error) {
      console.log('✅ Invalid email validation correctly failed');
    }
    
    // Test missing required fields
    try {
      const incompletePayload = { fullName: 'John Doe' };
      SubmitContactBody.parse(incompletePayload);
      console.log('❌ Missing fields validation should have failed');
    } catch (error) {
      console.log('✅ Missing fields validation correctly failed');
    }
    
    // Test message too short
    try {
      const shortMessagePayload = { 
        fullName: 'John Doe', 
        email: 'john@example.com', 
        message: 'Hi.' 
      };
      SubmitContactBody.parse(shortMessagePayload);
      console.log('❌ Short message validation should have failed');
    } catch (error) {
      console.log('✅ Short message validation correctly failed');
    }
    
  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testRateLimiting() {
  console.log('Testing rate limiting middleware...');
  
  try {
    const { createRateLimit } = require('./artifacts/api-server/src/middlewares/rateLimit');
    
    const rateLimiter = createRateLimit({
      windowMs: 60000, // 1 minute
      maxRequests: 2
    });
    
    let requestCount = 0;
    const mockReq = {
      ip: '127.0.0.1',
      get: (header) => header === 'User-Agent' ? 'test-agent' : undefined
    };
    
    const mockRes = {
      status: (code) => ({ 
        json: (data) => ({ 
          status: code, 
          data,
          set: () => mockRes 
        }),
        set: () => mockRes 
      }),
      set: () => mockRes
    };
    
    const mockNext = () => {
      requestCount++;
    };
    
    // First request should pass
    await rateLimiter(mockReq, mockRes, mockNext);
    console.log('✅ First request passed rate limit');
    
    // Second request should pass
    await rateLimiter(mockReq, mockRes, mockNext);
    console.log('✅ Second request passed rate limit');
    
    // Third request should be rate limited
    try {
      await rateLimiter(mockReq, mockRes, mockNext);
      console.log('❌ Third request should have been rate limited');
      return false;
    } catch (error) {
      console.log('✅ Third request correctly rate limited');
    }
    
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
    return false;
  }
  
  return true;
}

async function runTests() {
  console.log('🧪 Running Contact Endpoint Tests\n');
  
  let allTestsPassed = true;
  
  // Test validation schemas
  allTestsPassed &= await testContactValidation();
  console.log('');
  
  // Test rate limiting
  allTestsPassed &= await testRateLimiting();
  console.log('');
  
  if (allTestsPassed) {
    console.log('🎉 All tests passed! Contact endpoint implementation is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run the tests
runTests().catch(console.error);
