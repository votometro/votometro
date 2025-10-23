import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Support both __tests__ directories and collocated .test.ts files
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,ts,jsx,tsx}'
    ],
    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
    // Environment
    environment: 'node',
    // Display options
    globals: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  }
});
