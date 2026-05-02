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
  
  // Test timeout - increased for async operations
  testTimeout: 15000,
  
  // Verbose output
  verbose: true,
  
  // Prevent hanging on unhandled rejections
  errorOnDeprecated: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: false,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true
};
