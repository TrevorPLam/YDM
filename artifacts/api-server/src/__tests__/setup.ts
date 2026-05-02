/**
 * Jest test setup file
 * Configures test environment and global test utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Set required environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.ADMIN_API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-to-meet-requirements';

// Mock data store for industries
let mockIndustries: any[] = [];

// Mock database connection to prevent hanging
const mockDb: any = {
  select: jest.fn((...args: any[]) => {
    // Handle count queries
    if (args.length === 0) {
      mockDb._selectType = 'all';
    } else if (args[0]?.count) {
      mockDb._selectType = 'count';
      mockDb._countField = args[0];
    }
    return mockDb;
  }),
  from: jest.fn((table: any) => {
    // Handle different table calls
    if (table?.tableName === 'industries') {
      mockDb._currentTable = 'industries';
    }
    return mockDb;
  }),
  where: jest.fn((condition: any) => {
    mockDb._whereCondition = condition;
    return mockDb;
  }),
  orderBy: jest.fn((...args: any[]) => {
    // Handle orderBy with desc/asc functions
    if (args.length > 0) {
      const orderByArg = args[0];
      if (orderByArg?.name === 'desc' || orderByArg?.name === 'asc') {
        // Drizzle desc() or asc() function
        mockDb._orderBy = { 
          column: orderByArg.column, 
          direction: orderByArg.name 
        };
      } else {
        // Simple column name
        mockDb._orderBy = { 
          column: orderByArg, 
          direction: 'asc' 
        };
      }
    }
    return mockDb;
  }),
  limit: jest.fn((limit: number) => {
    mockDb._limit = limit;
    return mockDb;
  }),
  offset: jest.fn((offset: number) => {
    mockDb._offset = offset;
    return mockDb;
  }),
  insert: jest.fn(() => mockDb),
  values: jest.fn((values: any) => {
    if (Array.isArray(values)) {
      // Add timestamps if not present
      const timestampedValues = values.map(v => ({
        ...v,
        createdAt: v.createdAt || new Date().toISOString(),
        updatedAt: v.updatedAt || new Date().toISOString(),
      }));
      mockIndustries.push(...timestampedValues);
    } else {
      const timestampedValue = {
        ...values,
        createdAt: values.createdAt || new Date().toISOString(),
        updatedAt: values.updatedAt || new Date().toISOString(),
      };
      mockIndustries.push(timestampedValue);
    }
    return mockDb;
  }),
  returning: jest.fn(() => Promise.resolve(mockIndustries.slice(-1))),
  delete: jest.fn(() => {
    if (mockDb._currentTable === 'industries') {
      mockIndustries = [];
    }
    return Promise.resolve();
  }),
  update: jest.fn(() => mockDb),
  set: jest.fn(() => mockDb),
  // Mock Drizzle functions
  eq: jest.fn((column: any, value: any) => ({ [column]: value })),
  ilike: jest.fn((column: any, value: any) => ({ [column]: { ilike: value } })),
  desc: jest.fn((column: any) => ({ name: 'desc', column })),
  asc: jest.fn((column: any) => ({ name: 'asc', column })),
  sql: jest.fn((template: any, ...values: any[]) => template),
  count: jest.fn(() => ({ name: 'count' })),
  // Add proper query execution methods
  execute: jest.fn(() => {
    // Simulate query execution based on mock state
    let result = [...mockIndustries];
    
    // Apply where conditions
    if (mockDb._whereCondition) {
      result = result.filter(item => {
        // Simple mock for where conditions
        for (const [key, value] of Object.entries(mockDb._whereCondition)) {
          if (typeof value === 'object' && value !== null && 'ilike' in value) {
            // Handle ilike conditions
            const ilikeValue = (value as any).ilike;
            if (typeof ilikeValue === 'string') {
              const searchValue = ilikeValue.replace('%', '').toLowerCase();
              return item[key]?.toLowerCase().includes(searchValue);
            }
          } else {
            // Handle equality conditions
            if (item[key] !== value) return false;
          }
        }
        return true;
      });
    }
    
    // Apply ordering
    if (mockDb._orderBy) {
      result.sort((a, b) => {
        const { column, direction } = mockDb._orderBy;
        const aVal = a[column];
        const bVal = b[column];
        
        if (direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });
    }
    
    // Apply pagination
    const offset = mockDb._offset || 0;
    const limit = mockDb._limit || result.length;
    result = result.slice(offset, offset + limit);
    
    return Promise.resolve(result);
  }),
  // Add method to handle count queries
  then: jest.fn((callback: any) => {
    if (mockDb._selectType === 'count') {
      return callback([{ count: mockIndustries.length }]);
    } else {
      return callback(mockIndustries);
    }
  }),
  // Add catch method for error handling
  catch: jest.fn((callback: any) => {
    return Promise.resolve(mockIndustries);
  }),
};


jest.mock('@workspace/db', () => ({
  db: mockDb
}));

// Mock email service for testing
const mockEmailService = {
  sendContactNotification: jest.fn().mockResolvedValue(undefined),
  sendEmail: jest.fn().mockResolvedValue(undefined),
  isAvailable: jest.fn().mockReturnValue(true),
  isConfigured: jest.fn().mockReturnValue(true),
  getStatus: jest.fn().mockReturnValue({
    configured: true,
    available: true,
    host: 'test.smtp.com',
    port: 587,
    secure: false,
  })
};

jest.mock('../services/email', () => ({
  emailService: mockEmailService
}));

// Mock logger to reduce test noise
const mockLogger: any = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(() => mockLogger),
  level: 'info'
};

// Mock pino-http to avoid configuration issues
jest.mock('pino-http', () => 
  jest.fn(() => (req: any, res: any, next: any) => next())
);

jest.mock('../lib/logger', () => ({
  logger: mockLogger
}));

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  requireApiKey: jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }),
  validateApiKey: jest.fn(() => true)
}));

// Mock rate limiting middleware
jest.mock('../middlewares/rateLimit', () => ({
  contactRateLimit: jest.fn((req, res, next) => next()),
  newsletterRateLimit: jest.fn((req, res, next) => next()),
  authRateLimit: jest.fn((req, res, next) => next()),
  generalRateLimit: jest.fn((req, res, next) => next())
}));

// Increase timeout for async operations
jest.setTimeout(15000);

// Export mocks for use in tests
export { mockEmailService, mockLogger, mockDb, mockIndustries };

// Helper function to clear mock data between tests
export const clearMockIndustries = () => {
  mockIndustries = [];
  // Reset mock state
  mockDb._currentTable = undefined;
  mockDb._whereCondition = undefined;
  mockDb._orderBy = undefined;
  mockDb._limit = undefined;
  mockDb._offset = undefined;
  mockDb._searchTerm = undefined;
};

// Helper function to add sample test data
export const addSampleIndustries = () => {
  const sampleData = [
    {
      id: 1,
      publicId: 'ind-abc123',
      name: 'Technology',
      slug: 'technology',
      description: 'Software and technology companies',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      publicId: 'ind-def456',
      name: 'Finance',
      slug: 'finance',
      description: 'Banking and financial services',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      publicId: 'ind-ghi789',
      name: 'Healthcare',
      slug: 'healthcare',
      description: 'Medical and healthcare services',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ];
  mockIndustries.push(...sampleData);
};
