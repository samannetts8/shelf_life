import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,            // Use global functions like describe, it, etc.
    environment: 'jsdom',     // Use jsdom for DOM manipulation in tests
    setupFiles: './setupTests.ts', // Path to the setup file
  },
});