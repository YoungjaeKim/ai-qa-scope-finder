import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/projects': {
          target: env.SERVER_API_URL || 'http://localhost:4000',
          changeOrigin: true,
        }
      }
    }
  };
});
