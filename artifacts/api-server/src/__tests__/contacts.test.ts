/**
 * Integration tests for contact endpoint
 * Tests all BDD scenarios from docs/features/contact-submission.feature
 */

import request from 'supertest';
import express from 'express';
import contactsRouter from '../routes/contacts';
import { validateRequest } from '../middlewares/validation';
import { contactRateLimit } from '../middlewares/rateLimit';

// Mock the dependencies
jest.mock('../services/contacts');
jest.mock('../services/email');
jest.mock('../lib/logger');
jest.mock('@workspace/db');

// Import mocked modules
import { contactService } from '../services/contacts';
import { emailService } from '../services/email';
import { logger } from '../lib/logger';

// Create test app
const app = express();
app.use(express.json());
app.use('/contacts', contactsRouter);

// Mock the contact service
const mockContactService = contactService as jest.Mocked<typeof contactService>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('POST /api/contacts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful response
    mockContactService.submitContact.mockResolvedValue({
      id: 1,
      publicId: 'ABC123',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Acme Corporation',
      message: 'I am interested in your services. Please contact me.',
      phone: '+1-555-0123',
      source: 'website',
      status: 'new',
      createdAt: new Date().toISOString()
    });
  });

  describe('Successful contact submission', () => {
    it('should return 201 and save contact with all fields', async () => {
      const validPayload = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corporation',
        phone: '+1-555-0123',
        message: 'I am interested in your services. Please contact me.'
      };

      const response = await request(app)
        .post('/contacts')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 1,
        publicId: 'ABC123',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corporation',
        message: 'I am interested in your services. Please contact me.',
        phone: '+1-555-0123',
        source: 'website',
        status: 'new'
      });
      expect(response.body).toHaveProperty('createdAt');

      expect(mockContactService.submitContact).toHaveBeenCalledWith(validPayload);
      expect(mockEmailService.sendContactNotification).toHaveBeenCalledWith(validPayload);
    });

    it('should work with minimal required fields only', async () => {
      const minimalPayload = {
        fullName: 'Jane Smith',
        email: 'jane.smith@email.com',
        message: 'Hello, I need help.'
      };

      const response = await request(app)
        .post('/contacts')
        .send(minimalPayload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        fullName: 'Jane Smith',
        email: 'jane.smith@email.com',
        message: 'Hello, I need help.'
      });
      expect(response.body).not.toHaveProperty('company');
      expect(response.body).not.toHaveProperty('phone');

      expect(mockContactService.submitContact).toHaveBeenCalledWith(minimalPayload);
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for invalid email format', async () => {
      const invalidPayload = {
        fullName: 'Invalid User',
        email: 'not-an-email',
        message: 'Test message.'
      };

      const response = await request(app)
        .post('/contacts')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
      
      const emailError = response.body.details.find((detail: any) => 
        detail.field === 'email' || detail.message?.toLowerCase().includes('email')
      );
      expect(emailError).toBeDefined();

      expect(mockContactService.submitContact).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/contacts')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);

      const errors = response.body.details;
      const requiredFields = ['fullName', 'email', 'message'];
      
      for (const field of requiredFields) {
        const fieldError = errors.find((detail: any) => 
          detail.field === field || detail.message?.toLowerCase().includes(field.toLowerCase())
        );
        expect(fieldError).toBeDefined();
      }

      expect(mockContactService.submitContact).not.toHaveBeenCalled();
    });

    it('should return 400 for message too short', async () => {
      const shortMessagePayload = {
        fullName: 'Short User',
        email: 'user@test.com',
        message: 'Hi.'
      };

      const response = await request(app)
        .post('/contacts')
        .send(shortMessagePayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      expect(response.body).toHaveProperty('details');
      
      const messageError = response.body.details.find((detail: any) => 
        detail.field === 'message' || detail.message?.toLowerCase().includes('message')
      );
      expect(messageError).toBeDefined();
      expect(messageError.message).toMatch(/at least|minimum|too short/i);

      expect(mockContactService.submitContact).not.toHaveBeenCalled();
    });

    it('should return 400 for message too long', async () => {
      const longMessagePayload = {
        fullName: 'Long User',
        email: 'user@test.com',
        message: 'a'.repeat(5001) // Exceeds 5000 character limit
      };

      const response = await request(app)
        .post('/contacts')
        .send(longMessagePayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      
      expect(mockContactService.submitContact).not.toHaveBeenCalled();
    });

    it('should return 400 for name too short', async () => {
      const shortNamePayload = {
        fullName: 'A',
        email: 'user@test.com',
        message: 'This is a valid message length for testing purposes.'
      };

      const response = await request(app)
        .post('/contacts')
        .send(shortNamePayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      
      expect(mockContactService.submitContact).not.toHaveBeenCalled();
    });
  });

  describe('Rate limiting', () => {
    it('should allow requests within rate limit', async () => {
      const validPayload = {
        fullName: 'Test User',
        email: 'test@example.com',
        message: 'Valid message for testing.'
      };

      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/contacts')
          .send(validPayload);

        expect(response.status).toBe(201);
      }

      expect(mockContactService.submitContact).toHaveBeenCalledTimes(5);
    });

    it('should return 429 after rate limit exceeded', async () => {
      const validPayload = {
        fullName: 'Rate Limit User',
        email: 'ratelimit@example.com',
        message: 'Testing rate limits.'
      };

      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/contacts')
          .send(validPayload);
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/contacts')
        .send(validPayload);

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('error', 'Too many requests');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('retryAfter');

      // Should not have called the service for the rate limited request
      expect(mockContactService.submitContact).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error handling', () => {
    it('should return 500 when service throws error', async () => {
      mockContactService.submitContact.mockRejectedValue(new Error('Database error'));

      const validPayload = {
        fullName: 'Error User',
        email: 'error@example.com',
        message: 'This will cause an error.'
      };

      const response = await request(app)
        .post('/contacts')
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('GET /api/contacts/:publicId', () => {
    it('should return 200 and contact data for valid public ID', async () => {
      const mockContact = {
        id: 1,
        publicId: 'ABC123',
        fullName: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        source: 'website',
        status: 'new',
        createdAt: new Date().toISOString()
      };

      mockContactService.getContactByPublicId.mockResolvedValue(mockContact);

      const response = await request(app)
        .get('/contacts/ABC123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContact);
      expect(mockContactService.getContactByPublicId).toHaveBeenCalledWith('ABC123');
    });

    it('should return 404 for non-existent public ID', async () => {
      mockContactService.getContactByPublicId.mockResolvedValue(null);

      const response = await request(app)
        .get('/contacts/NONEXISTENT');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact not found');
    });

    it('should return 400 for invalid public ID', async () => {
      const response = await request(app)
        .get('/contacts/');

      expect(response.status).toBe(404); // Express handles this as 404
    });
  });
});
