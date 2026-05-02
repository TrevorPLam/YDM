import request from 'supertest';
import app from '../app';

/**
 * Debug test to isolate the 500 error
 */

describe('Debug Industry Endpoint', () => {
  it('should return basic response without database calls', async () => {
    const response = await request(app)
      .get('/api/healthz')
      .expect(200);

    console.log('Health check response:', response.body);
    expect(response.body).toHaveProperty('status');
  });

  it('should return 500 error for industries endpoint', async () => {
    try {
      const response = await request(app)
        .get('/api/industries')
        .expect(500);

      console.log('Industries error response:', response.body);
    } catch (error) {
      console.log('Error details:', error);
      expect(error).toBeDefined();
    }
  });
});
