import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe;

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@shared': resolve(__dirname, 'shared'),
      },
    },
    plugins: [
      react(),
      electron([
        {
          // Main process entry
          entry: 'electron/main/index.ts',
          onstart({ startup }) {
            startup();
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                // Native + node-only modules must stay external
                external: ['better-sqlite3', 'electron', 'electron-updater'],
              },
            },
          },
        },
        {
          // Preload script entry
          entry: 'electron/preload/index.ts',
          onstart({ reload }) {
            reload();
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined,
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: ['electron'],
                output: {
                  // Electron loads an ESM preload only when it ends in .mjs
                  entryFileNames: '[name].mjs',
                },
              },
            },
          },
        },
      ]),
      renderer(),
    ],
    build: {
      outDir: 'dist',
      target: 'es2022',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // Manual chunking keeps initial bundle small for fast startup
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    clearScreen: false,
  };
});
