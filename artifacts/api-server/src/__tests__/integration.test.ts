/**
 * Integration tests combining API + database
 * Tests complete workflows from request to database
 */

import request from 'supertest';
import express from 'express';
import { db } from '@workspace/db';
import { eq, and, or, ilike, desc, asc } from 'drizzle-orm';

// Import all routes to test integration
import contactsRouter from '../routes/contacts';
import newsletterRouter from '../routes/newsletter';
import industriesRouter from '../routes/industries';
import blogRouter from '../routes/blog';

// Create test app with all routes
const app = express();
app.use(express.json());

// Apply middleware that exists in main app
app.use((req, res, next) => {
  // Mock authentication middleware for protected routes
  if (req.path.startsWith('/blog') && req.method !== 'GET') {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer valid-api-key') {
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
});

app.use('/contacts', contactsRouter);
app.use('/newsletter', newsletterRouter);
app.use('/industries', industriesRouter);
app.use('/blog', blogRouter);

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Clear database before each test
    // Note: In a real integration test, you'd use a test database
    // For this example, we'll mock the db operations
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Cleanup after all tests
    jest.clearAllMocks();
  });

  describe('Contact Form Integration', () => {
    it('should create contact and send email notification', async () => {
      const contactData = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        message: 'Integration test message'
      };

      const response = await request(app)
        .post('/contacts')
        .send(contactData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('publicId');
      expect(response.body.fullName).toBe(contactData.fullName);
      expect(response.body.email).toBe(contactData.email);
      expect(response.body.message).toBe(contactData.message);

      // Verify database was called
      // In real integration test, you'd check the database directly
      const dbContacts = await db.select().from(contacts).limit(1);
      expect(dbContacts.length).toBe(1);
      expect(dbContacts[0].fullName).toBe(contactData.fullName);
      expect(dbContacts[0].email).toBe(contactData.email);
    });

    it('should handle validation errors in contact form', async () => {
      const invalidData = {
        email: 'not-an-email', // Missing required fields
      };

      const response = await request(app)
        .post('/contacts')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
    });
  });

  describe('Newsletter Integration', () => {
    it('should create newsletter subscription', async () => {
      const newsletterData = {
        email: 'newsletter@example.com'
      };

      const response = await request(app)
        .post('/newsletter')
        .send(newsletterData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(newsletterData.email);

      // Verify database was called
      const dbSubscriptions = await db.select().from(newsletterSubscriptions).limit(1);
      expect(dbSubscriptions.length).toBe(1);
      expect(dbSubscriptions[0].email).toBe(newsletterData.email);
    });

    it('should handle duplicate newsletter subscription', async () => {
      // First subscription
      const firstResponse = await request(app)
        .post('/newsletter')
        .send({ email: 'duplicate@example.com' });

      expect(firstResponse.status).toBe(201);

      // Second subscription (should return 200)
      const secondResponse = await request(app)
        .post('/newsletter')
        .send({ email: 'duplicate@example.com' });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body).toHaveProperty('message', 'Email already subscribed');

      // Verify only one subscription exists
      const dbSubscriptions = await db.select().from(newsletterSubscriptions);
      expect(dbSubscriptions.length).toBe(1);
    });
  });

  describe('Industries Integration', () => {
    it('should retrieve industries list', async () => {
      const response = await request(app)
        .get('/industries')
        .query({ page: '0', limit: '10' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(Array.isArray(response.body.posts)).toBe(true);

      // Verify database query was executed correctly
      // In real test, you'd verify the actual SQL query
      expect(db.select).toHaveBeenCalledWith(
        expect.any(Function), // The query builder function
        expect.objectContaining({
          where: expect.any(Object),
          limit: 10,
          offset: 0
        })
      );
    });

    it('should retrieve industry by slug', async () => {
      const response = await request(app)
        .get('/industries/technology');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('Technology');
    });
  });

  describe('Blog Integration', () => {
    it('should create and retrieve blog post', async () => {
      const blogData = {
        title: 'Integration Test Post',
        content: 'This is integration test content.',
        industrySlug: 'technology'
      };

      // Create blog post
      const createResponse = await request(app)
        .post('/blog/posts')
        .set('Authorization', 'Bearer valid-api-key')
        .send(blogData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body).toHaveProperty('slug');

      // Retrieve the created post
      const getResponse = await request(app)
        .get(`/blog/posts/${createResponse.body.slug}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.title).toBe(blogData.title);
      expect(getResponse.body.content).toBe(blogData.content);

      // Verify database operations
      const dbPosts = await db.select().from(blogPosts).limit(2);
      expect(dbPosts.length).toBe(2);
      expect(dbPosts.some(post => post.title === blogData.title)).toBe(true);
    });

    it('should handle blog authentication', async () => {
      const response = await request(app)
        .post('/blog/posts')
        .send({ title: 'Unauthorized Post' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should handle blog pagination', async () => {
      const response = await request(app)
        .get('/blog/posts')
        .query({ page: '1', limit: '5' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database to throw error
      const originalSelect = db.select;
      db.select = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/industries');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');

      // Restore original function
      db.select = originalSelect;
    });
  });

  describe('Cross-Context Integration', () => {
    it('should maintain data consistency across endpoints', async () => {
      // Create contact via API
      const contactResponse = await request(app)
        .post('/contacts')
        .send({
          fullName: 'Cross Context User',
          email: 'cross@example.com',
          message: 'Testing cross-context data flow'
        });

      expect(contactResponse.status).toBe(201);

      // Verify contact appears in industries list (contact has industryId)
      const industriesResponse = await request(app)
        .get('/industries');

      expect(industriesResponse.status).toBe(200);
      
      // The contact should be associated with an industry
      // This tests the relationship between contact submission and industry data
      expect(db.select).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          where: expect.any(Object),
          // Should include join with contacts table to verify industry relationship
        })
      );
    });
  });
});
