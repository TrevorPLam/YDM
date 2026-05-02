import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 10000, // 10 second timeout
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
