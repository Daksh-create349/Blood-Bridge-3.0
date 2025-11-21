import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This prevents "process is not defined" crash in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {}
    },
  }
})