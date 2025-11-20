/**
 * Preview production build
 * @module cli/preview
 */

import { preview as vitePreview } from 'vite';

/**
 * Preview production build
 * @param {Object} options - Preview options
 * @param {number} options.port - Port number
 * @param {string} options.host - Host address
 */
export async function preview(options = {}) {
  const { port = 4173, host = 'localhost' } = options;

  console.log('👀 Previewing production build...\n');

  try {
    const server = await vitePreview({
      preview: {
        port,
        host,
        open: true,
      },
    });

    server.printUrls();
    console.log('\n💡 Press Ctrl+C to stop\n');
  } catch (error) {
    console.error('❌ Failed to start preview server:', error);
    process.exit(1);
  }
}
