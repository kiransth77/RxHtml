import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
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
    // Framework enhanced error overlay
    {
      name: 'rxhtmx-error-overlay',
      configureServer(server) {
        server.ws.on('connection', () => {
          // No-op; overlay pushes on errors
        });
        server.middlewares.use((req, res, next) => {
          next();
        });
      },
      handleHotUpdate(ctx) {
        // Do nothing here
      },
      transform(code, id) {
        // Inject global error handler only once for entry files
        if (/src\/index\.js$/.test(id)) {
          const injection =
            "\nif (import.meta.hot) {\n  window.__RXHTMX_ERRORS__ = window.__RXHTMX_ERRORS__ || [];\n  window.addEventListener('error', (e) => {\n    window.__RXHTMX_ERRORS__.push({ message: e.message, filename: e.filename, lineno: e.lineno });\n    if (document && !document.getElementById('__rxhtmx_error_overlay')) {\n      const el = document.createElement('div');\n      el.id = '__rxhtmx_error_overlay';\n      el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#300;color:#fdd;font-family:monospace;font-size:14px;z-index:99999;padding:8px;border-bottom:2px solid #900;max-height:50%;overflow:auto';\n      document.body.appendChild(el);\n    }\n    const overlay = document.getElementById('__rxhtmx_error_overlay');\n    if (overlay) {\n      overlay.innerHTML = '<strong>RxHtmx Error Overlay</strong><br>' + window.__RXHTMX_ERRORS__.map(err => err.message).join('<br>');\n    }\n  });\n}\n";
          return code + injection;
        }
        return code;
      },
    },
    // Bundle analyzer (enabled in analyze mode)
    mode === 'analyze' &&
      visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // sunburst, treemap, network
      }),
  ].filter(Boolean),

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
}));
