#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📚 Building documentation...');

const docsSourceDir = path.join(__dirname, '../docs');
const docsDistDir = path.join(__dirname, '../docs-dist');
const examplesDir = path.join(__dirname, '../examples');

// Ensure docs-dist directory exists
if (!fs.existsSync(docsDistDir)) {
  fs.mkdirSync(docsDistDir, { recursive: true });
}

// Copy docs files
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy documentation
if (fs.existsSync(docsSourceDir)) {
  copyRecursive(docsSourceDir, docsDistDir);
  console.log('✅ Copied documentation files');
}

// Copy examples
const examplesDistDir = path.join(docsDistDir, 'examples');
if (fs.existsSync(examplesDir)) {
  copyRecursive(examplesDir, examplesDistDir);
  console.log('✅ Copied examples');
}

// Copy dist files for examples to work
const distDir = path.join(__dirname, '../dist');
const distDocsDir = path.join(docsDistDir, 'dist');
if (fs.existsSync(distDir)) {
  copyRecursive(distDir, distDocsDir);
  console.log('✅ Copied distribution files');
}

// Create index.html for GitHub Pages
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RxHtmx Documentation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
        .nav {
            background: #f4f4f4;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 5px;
        }
        .nav a {
            margin-right: 20px;
            text-decoration: none;
            color: #007bff;
        }
        .nav a:hover {
            text-decoration: underline;
        }
        .examples {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .example-card {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .example-card a {
            color: #007bff;
            text-decoration: none;
        }
        .example-card a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>🚀 RxHtmx Documentation</h1>
    
    <div class="nav">
        <a href="README.html">Overview</a>
        <a href="getting-started.html">Getting Started</a>
        <a href="advanced.html">Advanced Usage</a>
        <a href="debugging.html">Debugging</a>
        <a href="https://github.com/yourusername/rxhtmx">GitHub</a>
    </div>
    
    <h2>📖 Documentation</h2>
    <p>RxHtmx combines the reactive power of RxJS with the server-driven simplicity of HTMX.</p>
    
    <h2>🎯 Live Examples</h2>
    <div class="examples">
        <div class="example-card">
            <h3>Form Validation</h3>
            <p>Real-time form validation with reactive streams</p>
            <a href="examples/form-validation/index.html">View Example</a>
        </div>
        <div class="example-card">
            <h3>Search Autocomplete</h3>
            <p>Debounced search with autocomplete functionality</p>
            <a href="examples/search/index.html">View Example</a>
        </div>
        <div class="example-card">
            <h3>Real-time Chat</h3>
            <p>Live chat interface with reactive updates</p>
            <a href="examples/chat/index.html">View Example</a>
        </div>
    </div>
    
    <h2>📦 Installation</h2>
    <pre><code>npm install rxhtmx</code></pre>
    
    <h2>🔗 Quick Links</h2>
    <ul>
        <li><a href="getting-started.html">Getting Started Guide</a></li>
        <li><a href="advanced.html">Advanced Usage</a></li>
        <li><a href="debugging.html">Debugging Guide</a></li>
        <li><a href="examples/">All Examples</a></li>
    </ul>
</body>
</html>`;

fs.writeFileSync(path.join(docsDistDir, 'index.html'), indexHtml);

console.log('✅ Documentation built successfully!');
console.log(`📦 Output: ${docsDistDir}`);
