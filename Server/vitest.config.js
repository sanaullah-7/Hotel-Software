import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    test: {
      testTimeout: 60000,
      hookTimeout: 60000,
      globalSetup: ['./vitest.globalSetup.js'],
      env: {
        ...env,
        MONGODB_URI: 'mongodb://localhost:27017/test_explore_pakistan',
        JWT_ACCESS_SECRET: 'test',
        JWT_REFRESH_SECRET: 'test'
      }
    },
  };
});
