import path from 'path'

import { lingui } from '@lingui/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteBabel from 'vite-plugin-babel'

const webOnlyExtensions = [".web.js", ".web.jsx", ".web.ts", ".web.tsx"];

export default defineConfig({
  plugins: [
    react({
      babel: {
        configFile: path.resolve(__dirname, 'babel.config.cjs')
      }
    }),
    viteBabel({
      filter: /\.[jt]sx?$/,
    }),
    tailwindcss(),
    lingui()
  ],
  resolve: {
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom'],
    extensions: [
      ...webOnlyExtensions,
      ".mjs",
      ".js",
      ".mts",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
    ]
  },
  optimizeDeps: {
    exclude: ['@tetherto/pearpass-lib-ui-kit', 'react-strict-dom'],
  },
  ssr: {
    noExternal: ['react-strict-dom']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        action: path.resolve(__dirname, 'index.html'),
        'content-popups': path.resolve(__dirname, 'content-popups.html'),
        onboarding: path.resolve(__dirname, 'onboarding.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
