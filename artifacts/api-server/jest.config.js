/** @type {import('jest').Config} */
export default {
  // Use CommonJS for simpler testing
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Module name mapping for workspace packages
  moduleNameMapper: {
    '^@workspace/db$': '<rootDir>/../../lib/db/src',
    '^@workspace/db/(.*)$': '<rootDir>/../../lib/db/src/$1',
    '^@workspace/api-zod$': '<rootDir>/../../lib/api-zod/src',
    '^@workspace/api-zod/(.*)$': '<rootDir>/../../lib/api-zod/src/$1',
    '^@workspace/(.*)$': '<rootDir>/../../lib/$1/src',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Test timeout - optimized for reliability
  testTimeout: 10000,
  
  // Verbose output
  verbose: false, // Reduce noise
  
  // Prevent hanging on unhandled rejections
  errorOnDeprecated: false, // Reduce noise
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles - disabled to prevent hanging
  detectOpenHandles: false,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Optimized worker configuration
  maxWorkers: 1,
  maxConcurrency: 1,
  
  // Add global setup/teardown for proper cleanup
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Prevent infinite loops
  bail: false, // Continue on first failure to see all issues
  
  // Better error handling
  collectCoverage: false, // Disable coverage for now to focus on functionality
};
