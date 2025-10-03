#!/usr/bin/env node

// RxHtmx CLI - Command line interface for the framework
// Usage: rxhtmx <command> [options]

import { program } from 'commander';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const pkgPath = join(__dirname, '..', 'package.json');
const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));

program
  .name('rxhtmx')
  .description('RxHtmx Framework CLI')
  .version(pkg.version);

// Create command
program
  .command('create')
  .description('Create a new RxHtmx project')
  .argument('<project-name>', 'Name of the project')
  .option('-t, --template <template>', 'Project template', 'default')
  .option('--no-install', 'Skip package installation')
  .action(async (projectName, options) => {
    const { create } = await import('./create.js');
    await create(projectName, options);
  });

// Dev command
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .option('--no-hmr', 'Disable hot module replacement')
  .action(async (options) => {
    const { dev } = await import('../build/dev-server.js');
    await dev(options);
  });

// Build command
program
  .command('build')
  .description('Build for production')
  .option('-o, --outDir <dir>', 'Output directory', 'dist')
  .option('--no-minify', 'Disable minification')
  .option('--no-sourcemap', 'Disable sourcemap generation')
  .option('-f, --format <format>', 'Output format', 'es')
  .action(async (options) => {
    const { build } = await import('../build/bundler.js');
    await build(options);
  });

// Preview command
program
  .command('preview')
  .description('Preview production build')
  .option('-p, --port <port>', 'Port number', '4173')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .action(async (options) => {
    const { preview } = await import('./preview.js');
    await preview(options);
  });

// Generate command
program
  .command('generate')
  .alias('g')
  .description('Generate components, pages, etc.')
  .argument('<type>', 'Type to generate (component, page, store)')
  .argument('<name>', 'Name of the generated item')
  .option('-d, --directory <dir>', 'Target directory')
  .action(async (type, name, options) => {
    const { generate } = await import('./generate.js');
    await generate(type, name, options);
  });

// Test command
program
  .command('test')
  .description('Run tests')
  .option('--watch', 'Watch mode')
  .option('--coverage', 'Generate coverage report')
  .action(async (options) => {
    const { test } = await import('./test.js');
    await test(options);
  });

// Lint command
program
  .command('lint')
  .description('Lint code')
  .option('--fix', 'Auto-fix issues')
  .action(async (options) => {
    const { lint } = await import('./lint.js');
    await lint(options);
  });

// Format command
program
  .command('format')
  .description('Format code')
  .option('--check', 'Check formatting without writing')
  .action(async (options) => {
    const { format } = await import('./format.js');
    await format(options);
  });

// Info command
program
  .command('info')
  .description('Display environment information')
  .action(async () => {
    const { info } = await import('./info.js');
    await info();
  });

// Parse command line arguments
program.parse();

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});