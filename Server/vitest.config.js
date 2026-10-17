import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    test: {
      testTimeout: 60000,
      hookTimeout: 60000,
      env: {
        ...env,
        PLATFORM_MONGO_URI: 'mongodb://localhost:27017/test_platform',
        MONGODB_HOTEL_BASE_URI: 'mongodb://localhost:27017/test_hotel_',
        JWT_ACCESS_SECRET: 'test',
        JWT_REFRESH_SECRET: 'test'
      }
    },
  };
});
