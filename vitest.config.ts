import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Use jsdom environment for testing
    globals: true,         // To use global functions like describe, it, etc.
    setupFiles: './setupTests.ts', // Optional: setup file for test initialization
  },
});