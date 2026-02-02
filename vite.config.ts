import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import exposes from './federation-exposes.json'

// Remote URL: set VITE_PROJECT_A_URL for production (e.g. Vercel). Default: local dev.
const projectAUrl = (process.env.VITE_PROJECT_A_URL ?? '').replace(/\/$/, '') || 'http://localhost:3001/build' // 'https://project-a-tau-gilt.vercel.app' //

/** Ensures CORS headers so remotes (e.g. projectA on Vercel) can load host remoteEntry from localhost. */
function corsForFederation() {
  const corsMiddleware = (
    _req: import('http').IncomingMessage,
    res: import('http').ServerResponse,
    next: () => void,
  ) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (_req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }
    next()
  }
  return {
    name: 'cors-for-federation',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use(corsMiddleware)
    },
    configurePreviewServer(server: { middlewares: { use: (m: typeof corsMiddleware) => void } }) {
      server.middlewares.use(corsMiddleware)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    corsForFederation(),
    react(),
    federation({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
        projectA: `${projectAUrl}/assets/remoteEntry.js`,
      },
      exposes,
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    cors: true,
  },
  preview: {
    port: 3000,
    cors: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
