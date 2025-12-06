#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Building browser bundle...');

const distPath = path.join(__dirname, '../dist');
const umdPath = path.join(distPath, 'rxhtmx.umd.js');
const browserBundlePath = path.join(distPath, 'rxhtmx.browser.js');

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

if (fs.existsSync(umdPath)) {
    console.log(`📦 Copying UMD build from ${umdPath} to ${browserBundlePath}`);
    fs.copyFileSync(umdPath, browserBundlePath);
    console.log('✅ Browser bundle built successfully!');
} else {
    console.error('❌ UMD build not found. Please run "vite build" first.');
    process.exit(1);
}
