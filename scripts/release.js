#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packagePath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

console.log('🚀 Preparing release...');

// Validate current state
try {
  execSync('git diff-index --quiet HEAD --', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Working directory is not clean. Please commit your changes first.');
  process.exit(1);
}

// Run tests
console.log('🧪 Running tests...');
try {
  execSync('bun test', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Tests failed. Please fix failing tests before release.');
  process.exit(1);
}

// Run linting
console.log('🔍 Running linter...');
try {
  execSync('bun run lint', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Linting failed. Please fix linting errors before release.');
  process.exit(1);
}

// Build
console.log('📦 Building project...');
try {
  execSync('bun run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed.');
  process.exit(1);
}

console.log('✅ Release preparation complete!');
console.log('');
console.log('Next steps:');
console.log('1. Run `npm version patch|minor|major` to bump version');
console.log('2. Push to GitHub: `git push && git push --tags`');
console.log('3. Create GitHub release from the new tag');
console.log('4. GitHub Actions will automatically publish to NPM');
console.log('');
console.log(`Current version: ${pkg.version}`);
