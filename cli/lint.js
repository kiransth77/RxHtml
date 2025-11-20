/**
 * Linter integration
 * @module cli/lint
 */

import { spawn } from 'child_process';

/**
 * Run linter
 * @param {Object} options - Lint options
 * @param {boolean} options.fix - Auto-fix issues
 */
export async function lint(options = {}) {
  const { fix = false } = options;

  console.log('🔍 Linting code...\n');

  const args = ['run', 'lint'];

  if (fix) {
    args.push('--', '--fix');
  }

  const proc = spawn('npm', args, {
    stdio: 'inherit',
    shell: true,
  });

  proc.on('exit', code => {
    if (code !== 0) {
      console.error('\n❌ Linting failed');
      process.exit(code);
    } else {
      console.log('\n✅ No linting errors!');
    }
  });
}
