import { defineConfig } from 'vite'
import path from 'path'

// prettier-ignore
const INDEX_ROUTE = '^/(\\?.*)?$'
const QR_CODE_IMAGE_ROUTE = '^/qrcodes/[0-9]+/image(\\?.*)?$'
const QR_CODE_ROUTE = '^/qrcodes/[0-9]+(\\?.*)?$'
const API_ROUTE = '^/api/'

const root = new URL('.', import.meta.url).pathname
const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
}

export default defineConfig({
  root,
  define: {
    'process.env.SHOPIFY_API_KEY': JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  server: {
    port: process.env.FRONTEND_PORT,
    middlewareMode: 'html',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 64999,
      clientPort: 64999,
    },
    proxy: {
      [INDEX_ROUTE]: proxyOptions,
      [QR_CODE_IMAGE_ROUTE]: proxyOptions,
      [QR_CODE_ROUTE]: proxyOptions,
      [API_ROUTE]: proxyOptions,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    deps: {
      inline: ['@shopify/react-testing'],
    },
  },
})
