import request from 'supertest';
import app from '../app';
import { industries } from '@workspace/db/schema';
import { clearMockIndustries, addSampleIndustries, mockDb } from './setup';

interface IndustryResponse {
  id: number;
  publicId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface IndustryListResponse {
  industries: IndustryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Industry endpoints integration tests
 * Following TDD approach - tests written first, then implementation
 */

describe('Industry Endpoints', () => {
  beforeEach(() => {
    // Clean up mock industries before each test
    clearMockIndustries();
    // Add sample data for testing
    addSampleIndustries();
  });

  afterAll(() => {
    // Clean up after all tests
    clearMockIndustries();
  });

  describe('GET /api/industries', () => {
    it('should return list of industries when data exists', async () => {
      const response = await request(app)
        .get('/api/industries')
        .expect(200);

      const body = response.body as IndustryListResponse;
      expect(body.industries).toHaveLength(3);
      expect(body.pagination.total).toBe(3);
      expect(body.pagination).toEqual({
        page: 0,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should return paginated industries with default parameters', async () => {
      // Insert test data
      const testData = [
        {
          publicId: 'IND001',
          name: 'Technology',
          slug: 'technology',
          description: 'Technology industry',
        },
        {
          publicId: 'IND002',
          name: 'Healthcare',
          slug: 'healthcare',
          description: 'Healthcare industry',
        },
        {
          publicId: 'IND003',
          name: 'Finance',
          slug: 'finance',
          description: 'Finance industry',
        },
      ];

      await mockDb.insert(industries).values(testData);

      const response = await request(app)
        .get('/api/industries')
        .expect(200);

      const body = response.body as IndustryListResponse;
      expect(body.industries).toHaveLength(3);
      expect(body.pagination).toEqual({
        page: 0,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should handle pagination with custom page and limit', async () => {
      // Insert 15 test industries
      const testData = Array.from({ length: 15 }, (_, i) => ({
        publicId: `IND${String(i + 1).padStart(3, '0')}`,
        name: `Industry ${i + 1}`,
        slug: `industry-${i + 1}`,
        description: `Description for industry ${i + 1}`,
      }));

      await mockDb.insert(industries).values(testData);

      // Test first page with limit 5
      const response = await request(app)
        .get('/api/industries?page=0&limit=5')
        .expect(200);

      expect(response.body.industries).toHaveLength(5);
      expect(response.body.pagination).toEqual({
        page: 0,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });

      // Test second page
      const secondPage = await request(app)
        .get('/api/industries?page=1&limit=5')
        .expect(200);

      const secondPageBody = secondPage.body as IndustryListResponse;
      expect(secondPageBody.industries).toHaveLength(5);
      expect(secondPageBody.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle pagination edge cases', async () => {
      // Insert 3 test industries
      const testData = [
        { publicId: 'IND001', name: 'Tech', slug: 'tech', description: 'Tech' },
        { publicId: 'IND002', name: 'Health', slug: 'health', description: 'Health' },
        { publicId: 'IND003', name: 'Finance', slug: 'finance', description: 'Finance' },
      ];

      await mockDb.insert(industries).values(testData);

      // Test page beyond available data
      const response = await request(app)
        .get('/api/industries?page=10&limit=5')
        .expect(200);

      const body = response.body as IndustryListResponse;
      expect(body.industries).toHaveLength(0);
      expect(body.pagination).toEqual({
        page: 10,
        limit: 5,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should validate pagination parameters', async () => {
      // Test negative page
      await request(app)
        .get('/api/industries?page=-1')
        .expect(400);

      // Test zero limit
      await request(app)
        .get('/api/industries?limit=0')
        .expect(400);

      // Test limit exceeding maximum
      await request(app)
        .get('/api/industries?limit=200')
        .expect(400);

      // Test invalid page type
      await request(app)
        .get('/api/industries?page=abc')
        .expect(400);
    });

    it('should search industries by name', async () => {
      const testData = [
        { publicId: 'IND001', name: 'Technology', slug: 'tech', description: 'Tech industry' },
        { publicId: 'IND002', name: 'Healthcare', slug: 'health', description: 'Health industry' },
        { publicId: 'IND003', name: 'Financial Technology', slug: 'fintech', description: 'FinTech industry' },
      ];

      await mockDb.insert(industries).values(testData);

      // Search for "technology"
      const response = await request(app)
        .get('/api/industries?search=technology')
        .expect(200);

      const body = response.body as IndustryListResponse;
      expect(body.industries).toHaveLength(2); // Technology and Financial Technology
      expect(body.industries.map((i: any) => i.name)).toContain('Technology');
      expect(body.industries.map((i: any) => i.name)).toContain('Financial Technology');
    });

    it('should search industries by description', async () => {
      const testData = [
        { publicId: 'IND001', name: 'Technology', slug: 'tech', description: 'Software and hardware' },
        { publicId: 'IND002', name: 'Healthcare', slug: 'health', description: 'Medical services' },
        { publicId: 'IND003', name: 'Education', slug: 'edu', description: 'Software learning platforms' },
      ];

      await mockDb.insert(industries).values(testData);

      // Search for "software"
      const response = await request(app)
        .get('/api/industries?search=software')
        .expect(200);

      const body = response.body as IndustryListResponse;
      expect(body.industries).toHaveLength(2); // Technology and Education
      expect(body.industries.map((i: any) => i.name)).toContain('Technology');
      expect(body.industries.map((i: any) => i.name)).toContain('Education');
    });

    it('should handle search with pagination', async () => {
      const testData = Array.from({ length: 15 }, (_, i) => ({
        publicId: `IND${String(i + 1).padStart(3, '0')}`,
        name: `Technology ${i + 1}`,
        slug: `tech-${i + 1}`,
        description: `Description ${i + 1}`,
      }));

      await mockDb.insert(industries).values(testData);

      const response = await request(app)
        .get('/api/industries?search=technology&page=0&limit=5')
        .expect(200);

      const body = response.body as IndustryListResponse;
      expect(body.industries).toHaveLength(5);
      expect(body.pagination.total).toBe(15);
    });

    it('should validate search parameters', async () => {
      // Test empty search
      await request(app)
        .get('/api/industries?search=')
        .expect(400);

      // Test search too long
      await request(app)
        .get('/api/industries?search=' + 'a'.repeat(101))
        .expect(400);
    });

    it('should sort industries by name by default', async () => {
      const testData = [
        { publicId: 'IND001', name: 'Finance', slug: 'finance', description: 'Finance industry' },
        { publicId: 'IND002', name: 'Healthcare', slug: 'healthcare', description: 'Healthcare industry' },
        { publicId: 'IND003', name: 'Technology', slug: 'technology', description: 'Technology industry' },
      ];

      await mockDb.insert(industries).values(testData);

      const response = await request(app)
        .get('/api/industries')
        .expect(200);

      const body = response.body as IndustryListResponse;
      const names = body.industries.map((i: any) => i.name);
      expect(names).toEqual(['Finance', 'Healthcare', 'Technology']); // Alphabetical order
    });

    it('should sort industries by created_at when specified', async () => {
      const testData = [
        { publicId: 'IND001', name: 'First', slug: 'first', description: 'First industry', createdAt: '2024-01-01T00:00:00.000Z' },
        { publicId: 'IND002', name: 'Second', slug: 'second', description: 'Second industry', createdAt: '2024-01-02T00:00:00.000Z' },
        { publicId: 'IND003', name: 'Third', slug: 'third', description: 'Third industry', createdAt: '2024-01-03T00:00:00.000Z' },
      ];

      await mockDb.insert(industries).values(testData);

      const response = await request(app)
        .get('/api/industries?orderBy=created_at')
        .expect(200);

      const body = response.body as IndustryListResponse;
      const names = body.industries.map((i: any) => i.name);
      expect(names).toEqual(['First', 'Second', 'Third']); // Chronological order
    });

    it('should validate orderBy parameter', async () => {
      await request(app)
        .get('/api/industries?orderBy=invalid')
        .expect(400);
    });
  });

  describe('GET /api/industries/:slug', () => {
    it('should return industry by slug', async () => {
      const testData = {
        publicId: 'IND001',
        name: 'Technology',
        slug: 'technology',
        description: 'Technology industry',
      };

      await mockDb.insert(industries).values(testData);

      const response = await request(app)
        .get('/api/industries/technology')
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        publicId: 'ind-abc123',
        name: 'Technology',
        slug: 'technology',
        description: 'Software and technology companies',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return 404 for non-existent slug', async () => {
      // Clear sample data to test 404 case
      clearMockIndustries();
      
      const response = await request(app)
        .get('/api/industries/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Industry not found');
    });

    it('should validate slug parameter', async () => {
      // Test empty slug
      await request(app)
        .get('/api/industries/')
        .expect(404); // Will be handled by Express as 404

      // Test slug too long
      const longSlug = 'a'.repeat(101);
      await request(app)
        .get(`/api/industries/${longSlug}`)
        .expect(400);
    });
  });
});
