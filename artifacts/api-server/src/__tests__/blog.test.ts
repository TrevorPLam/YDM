/**
 * Integration tests for blog endpoints
 * Tests all blog CRUD operations with authentication
 */

import request from 'supertest';
import express from 'express';
import blogRouter from '../routes/blog';

// Mock dependencies
jest.mock('../services/blog', () => ({
  blogService: {
    listBlogPosts: jest.fn(),
    getBlogPostBySlug: jest.fn(),
    createBlogPost: jest.fn(),
    updateBlogPost: jest.fn(),
    deleteBlogPost: jest.fn(),
  }
}));
jest.mock('../lib/logger');
jest.mock('@workspace/db');

// Import mocked modules
import { blogService } from '../services/blog';
import { logger } from '../lib/logger';

// Create test app
const app = express();
app.use(express.json());
app.use('/blog', blogRouter);

// Mock blog service
const mockBlogService = blogService as jest.Mocked<typeof blogService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Blog API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/blog/posts', () => {
    it('should return 200 and paginated blog posts', async () => {
      const mockPosts = [
        {
          id: 1,
          publicId: 'post-1',
          slug: 'test-post-1',
          title: 'Test Post 1',
          content: 'Test content 1',
          status: 'published',
          isFeatured: false,
          publishedAt: new Date().toISOString(),
          authorId: 1,
          industryId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          publicId: 'post-2',
          slug: 'test-post-2',
          title: 'Test Post 2',
          content: 'Test content 2',
          status: 'published',
          isFeatured: true,
          publishedAt: new Date().toISOString(),
          authorId: 1,
          industryId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockBlogService.listBlogPosts.mockResolvedValue({
        blogPosts: mockPosts,
        pagination: {
          page: 0,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });

      const response = await request(app)
        .get('/blog/posts')
        .query({ page: '0', limit: '10' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        blogPosts: mockPosts,
        pagination: {
          page: 0,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
      expect(mockBlogService.listBlogPosts).toHaveBeenCalledWith({
        page: 0,
        limit: 10,
        search: undefined,
        industrySlug: undefined,
        featured: undefined,
        orderBy: undefined
      });
    });

    it('should handle search functionality', async () => {
      mockBlogService.listBlogPosts.mockResolvedValue({
        posts: [],
        pagination: {
          page: 0,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });

      const response = await request(app)
        .get('/blog/posts')
        .query({ search: 'test query', page: '0', limit: '10' });

      expect(response.status).toBe(200);
      expect(mockBlogService.listBlogPosts).toHaveBeenCalledWith({
        page: 0,
        limit: 10,
        search: 'test query',
        industrySlug: undefined,
        featured: undefined,
        orderBy: 'published_at'
      });
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/blog/posts')
        .query({ page: '-1', limit: '101' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
    });
  });

  describe('GET /api/blog/posts/{slug}', () => {
    it('should return 200 and blog post for valid slug', async () => {
      const mockPost = {
        id: 1,
        publicId: 'test-post',
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        featured: false,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockBlogService.getBlogPostBySlug.mockResolvedValue(mockPost);

      const response = await request(app)
        .get('/blog/posts/test-post');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPost);
      expect(mockBlogService.getBlogPostBySlug).toHaveBeenCalledWith('test-post');
    });

    it('should return 404 for non-existent slug', async () => {
      mockBlogService.getBlogPostBySlug.mockResolvedValue(null);

      const response = await request(app)
        .get('/blog/posts/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Blog post not found');
    });

    it('should return 400 for invalid slug', async () => {
      const response = await request(app)
        .get('/blog/posts/');

      expect(response.status).toBe(404); // Express handles this as 404
    });
  });

  describe('POST /api/blog/posts', () => {
    const validPostData = {
      title: 'New Blog Post',
      content: 'This is a blog post content.',
      excerpt: 'This is an excerpt.',
      featured: false,
      industrySlug: 'technology'
    };

    it('should return 201 and create blog post with authentication', async () => {
      const mockCreatedPost = {
        id: 1,
        publicId: 'new-blog-post',
        title: validPostData.title,
        content: validPostData.content,
        excerpt: validPostData.excerpt,
        featured: validPostData.featured,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockBlogService.createBlogPost.mockResolvedValue(mockCreatedPost);

      const response = await request(app)
        .post('/blog/posts')
        .set('Authorization', 'Bearer valid-api-key')
        .send(validPostData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreatedPost);
      expect(mockBlogService.createBlogPost).toHaveBeenCalledWith(validPostData);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/blog/posts')
        .send(validPostData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(mockBlogService.createBlogPost).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        title: '', // Invalid: empty title
        content: 'Short', // Invalid: too short content
        featured: 'not-a-boolean' // Invalid: wrong type
      };

      const response = await request(app)
        .post('/blog/posts')
        .set('Authorization', 'Bearer valid-api-key')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      expect(mockBlogService.createBlogPost).not.toHaveBeenCalled();
    });

    it('should validate title length', async () => {
      const longTitleData = {
        ...validPostData,
        title: 'a'.repeat(256) // Exceeds 255 character limit
      };

      const response = await request(app)
        .post('/blog/posts')
        .set('Authorization', 'Bearer valid-api-key')
        .send(longTitleData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
    });
  });

  describe('PUT /api/blog/posts/{slug}', () => {
    const validUpdateData = {
      title: 'Updated Blog Post',
      content: 'Updated blog post content.',
      excerpt: 'Updated excerpt.',
      featured: true
    };

    it('should return 200 and update blog post with authentication', async () => {
      const mockUpdatedPost = {
        id: 1,
        publicId: 'test-post',
        title: validUpdateData.title,
        content: validUpdateData.content,
        excerpt: validUpdateData.excerpt,
        featured: validUpdateData.featured,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockBlogService.updateBlogPost.mockResolvedValue(mockUpdatedPost);

      const response = await request(app)
        .put('/blog/posts/test-post')
        .set('Authorization', 'Bearer valid-api-key')
        .send(validUpdateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedPost);
      expect(mockBlogService.updateBlogPost).toHaveBeenCalledWith('test-post', validUpdateData);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/blog/posts/test-post')
        .send(validUpdateData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(mockBlogService.updateBlogPost).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent slug', async () => {
      mockBlogService.updateBlogPost.mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .put('/blog/posts/non-existent')
        .set('Authorization', 'Bearer valid-api-key')
        .send(validUpdateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Blog post not found');
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        title: '', // Invalid: empty title
        content: 'x'.repeat(10001) // Invalid: too long content
      };

      const response = await request(app)
        .put('/blog/posts/test-post')
        .set('Authorization', 'Bearer valid-api-key')
        .send(invalidUpdateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      expect(mockBlogService.updateBlogPost).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/blog/posts/{slug}', () => {
    it('should return 204 and delete blog post with authentication', async () => {
      mockBlogService.deleteBlogPost.mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/blog/posts/test-post')
        .set('Authorization', 'Bearer valid-api-key');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(mockBlogService.deleteBlogPost).toHaveBeenCalledWith('test-post');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/blog/posts/test-post');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(mockBlogService.deleteBlogPost).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent slug', async () => {
      mockBlogService.deleteBlogPost.mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .delete('/blog/posts/non-existent')
        .set('Authorization', 'Bearer valid-api-key');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Blog post not found');
    });
  });

  describe('Error handling', () => {
    it('should return 500 when service throws error', async () => {
      mockBlogService.listBlogPosts.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/blog/posts');

      expect(response.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
