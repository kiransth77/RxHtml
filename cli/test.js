/**
 * Test runner integration
 * @module cli/test
 */

import { spawn } from 'child_process';

/**
 * Run tests
 * @param {Object} options - Test options
 * @param {boolean} options.watch - Watch mode
 * @param {boolean} options.coverage - Generate coverage
 */
export async function test(options = {}) {
  const { watch = false, coverage = false } = options;

  console.log('🧪 Running tests...\n');

  const args = ['test'];

  if (watch) {
    args.push('--watch');
  }

  if (coverage) {
    args.push('--coverage');
  }

  const proc = spawn('bun', args, {
    stdio: 'inherit',
    shell: true,
  });

  proc.on('exit', code => {
    if (code !== 0) {
      console.error('\n❌ Tests failed');
      process.exit(code);
    } else {
      console.log('\n✅ All tests passed!');
    }
  });
}
