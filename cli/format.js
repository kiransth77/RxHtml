/**
 * Code formatter integration
 * @module cli/format
 */

import { spawn } from 'child_process';

/**
 * Format code
 * @param {Object} options - Format options
 * @param {boolean} options.check - Check formatting without writing
 */
export async function format(options = {}) {
  const { check = false } = options;

  console.log('✨ Formatting code...\n');

  const scriptName = check ? 'format:check' : 'format';
  const args = ['run', scriptName];

  const proc = spawn('npm', args, {
    stdio: 'inherit',
    shell: true,
  });

  proc.on('exit', code => {
    if (code !== 0) {
      if (check) {
        console.error('\n❌ Code formatting issues found');
        console.log('💡 Run `rxhtmx format` to fix');
      } else {
        console.error('\n❌ Formatting failed');
      }
      process.exit(code);
    } else {
      console.log(
        check
          ? '\n✅ Code is properly formatted!'
          : '\n✅ Code formatted successfully!'
      );
    }
  });
}
