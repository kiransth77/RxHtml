/**
 * Display environment information
 * @module cli/info
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Get command output safely
 */
function getCommandOutput(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch {
    return 'Not installed';
  }
}

/**
 * Display environment information
 */
export async function info() {
  console.log('📊 RxHtmx Environment Information\n');
  console.log('━'.repeat(50));

  try {
    // Package info
    const pkgPath = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));

    console.log('\n📦 Project:');
    console.log(`   Name: ${pkg.name}`);
    console.log(`   Version: ${pkg.version}`);
    console.log(`   Description: ${pkg.description}`);

    // System info
    console.log('\n💻 System:');
    console.log(`   OS: ${process.platform} ${process.arch}`);
    console.log(`   Node: ${process.version}`);
    console.log(`   Bun: ${getCommandOutput('bun --version')}`);
    console.log(`   NPM: ${getCommandOutput('npm --version')}`);

    // Dependencies
    console.log('\n📚 Dependencies:');
    console.log(`   RxJS: ${pkg.dependencies?.rxjs || 'Not installed'}`);
    console.log(
      `   HTMX: ${pkg.dependencies?.['htmx.org'] || 'Not installed'}`
    );

    // Dev Dependencies
    console.log('\n🛠️  Dev Dependencies:');
    console.log(`   Vite: ${pkg.devDependencies?.vite || 'Not installed'}`);
    console.log(`   ESLint: ${pkg.devDependencies?.eslint || 'Not installed'}`);
    console.log(
      `   Prettier: ${pkg.devDependencies?.prettier || 'Not installed'}`
    );
    console.log(
      `   Playwright: ${pkg.devDependencies?.['@playwright/test'] || 'Not installed'}`
    );

    // Git info
    console.log('\n🌿 Git:');
    console.log(`   Branch: ${getCommandOutput('git branch --show-current')}`);
    console.log(`   Commit: ${getCommandOutput('git rev-parse --short HEAD')}`);
    console.log(`   Remote: ${getCommandOutput('git remote get-url origin')}`);

    console.log('\n' + '━'.repeat(50) + '\n');
  } catch (error) {
    console.error('❌ Failed to get environment info:', error.message);
    process.exit(1);
  }
}
