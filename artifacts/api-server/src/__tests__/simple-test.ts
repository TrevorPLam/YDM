import request from 'supertest';
import app from '../app';

/**
 * Simple test to check if the industry service is being imported correctly
 */

describe('Simple Industry Test', () => {
  it('should handle industries endpoint with minimal mocking', async () => {
    // Mock the industry service directly
    jest.doMock('../services/industries', () => ({
      industryService: {
        listIndustries: jest.fn().mockResolvedValue({
          industries: [],
          pagination: {
            page: 0,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }),
        validateListIndustriesParams: jest.fn(),
      },
    }));

    const response = await request(app)
      .get('/api/industries')
      .expect(200);

    expect(response.body).toHaveProperty('industries');
    expect(response.body).toHaveProperty('pagination');
  });
});
