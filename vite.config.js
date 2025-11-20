import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Root directory for serving files
  root: './',

  // Base public path
  base: './',

  // Development server configuration
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    cors: true,
    strictPort: false,
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: 'localhost',
    open: true,
    cors: true,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    cssCodeSplit: true,

    // Library mode configuration
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'RxHtmx',
      formats: ['es', 'umd', 'cjs'],
      fileName: format => {
        const formatMap = {
          es: 'rxhtmx.esm.js',
          umd: 'rxhtmx.umd.js',
          cjs: 'rxhtmx.cjs.js',
        };
        return formatMap[format];
      },
    },

    // Rollup options
    rollupOptions: {
      external: ['rxjs', 'htmx.org'],
      output: {
        globals: {
          rxjs: 'rxjs',
          'htmx.org': 'htmx',
        },
        // Preserve module structure
        preserveModules: false,
        // Asset file names
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: '[name].js',
      },
    },

    // Terser options for minification
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      format: {
        comments: false,
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // Report compressed size
    reportCompressedSize: true,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@router': resolve(__dirname, 'src/router'),
      '@store': resolve(__dirname, 'src/store'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
    extensions: ['.js', '.json', '.mjs'],
  },

  // Plugin configuration
  plugins: [
    // Custom HMR plugin for framework
    {
      name: 'rxhtmx-hmr',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.js')) {
          console.log(`[RxHtmx HMR] Reloading ${file}`);
          server.ws.send({
            type: 'full-reload',
            path: '*',
          });
        }
      },
    },
  ],

  // Optimize dependencies
  optimizeDeps: {
    include: ['rxjs', 'htmx.org'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    },
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {},
  },

  // JSON configuration
  json: {
    namedExports: true,
    stringify: false,
  },

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
  },

  // Environment variables
  envPrefix: 'RXHTMX_',

  // Clear screen on update
  clearScreen: true,

  // Log level
  logLevel: 'info',
});
