import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'junit'],
    setupFiles: ['./src/tests/setup-vitest.ts'],
  },
});
