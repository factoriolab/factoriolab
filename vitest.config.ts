import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default'],
    setupFiles: ['./src/tests/setup-vitest.ts'],
  },
});
