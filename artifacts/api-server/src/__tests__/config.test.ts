import { describe, it, expect, beforeEach } from '@jest/globals';
import { config } from '../lib/config';

describe('Configuration Validation', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.DATABASE_URL;
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.ADMIN_API_KEY;
    delete process.env.LOG_LEVEL;
    delete process.env.JWT_SECRET;
    delete process.env.CORS_ORIGIN;
  });

  // Note: Since config is validated at module load time, we need to test
// the validation by creating a separate test that resets the module
  it('should validate configuration structure', () => {
    // This test verifies the config object has the expected structure
    expect(config).toHaveProperty('DATABASE_URL');
    expect(config).toHaveProperty('PORT');
    expect(config).toHaveProperty('NODE_ENV');
    expect(config).toHaveProperty('ADMIN_API_KEY');
    expect(config).toHaveProperty('JWT_SECRET');
    expect(config).toHaveProperty('LOG_LEVEL');
    expect(config).toHaveProperty('CORS_ORIGIN');
  });

  it('should have valid configuration values', () => {
    // Verify the config has valid types and values
    expect(typeof config.DATABASE_URL).toBe('string');
    expect(typeof config.PORT).toBe('number');
    expect(typeof config.NODE_ENV).toBe('string');
    expect(typeof config.ADMIN_API_KEY).toBe('string');
    expect(typeof config.JWT_SECRET).toBe('string');
    expect(typeof config.LOG_LEVEL).toBe('string');
    expect(typeof config.CORS_ORIGIN).toBe('string');
    
    // Verify PORT is in valid range
    expect(config.PORT).toBeGreaterThan(0);
    expect(config.PORT).toBeLessThan(65536);
    
    // Verify JWT_SECRET meets minimum length
    expect(config.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    
    // Verify NODE_ENV is valid
    expect(['development', 'production', 'test']).toContain(config.NODE_ENV);
    
    // Verify LOG_LEVEL is valid
    expect(['error', 'warn', 'info', 'debug']).toContain(config.LOG_LEVEL);
  });
});
