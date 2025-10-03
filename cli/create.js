// Project creation utility for RxHtmx CLI
// Creates new projects from templates

import { mkdir, writeFile, readdir, readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function create(projectName, options = {}) {
  const { template = 'default', install = true } = options;
  
  console.log(`🚀 Creating RxHtmx project: ${projectName}`);
  console.log(`📋 Template: ${template}`);
  
  const projectPath = resolve(process.cwd(), projectName);
  
  try {
    // Check if directory already exists
    await stat(projectPath);
    console.error(`❌ Directory ${projectName} already exists`);
    process.exit(1);
  } catch (error) {
    // Directory doesn't exist, which is what we want
  }
  
  // Create project directory
  await mkdir(projectPath, { recursive: true });
  
  // Generate project files based on template
  await generateTemplate(projectPath, template);
  
  // Install dependencies if requested
  if (install) {
    console.log('📦 Installing dependencies...');
    await installDependencies(projectPath);
  }
  
  console.log('✅ Project created successfully!');
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  if (!install) {
    console.log(`  npm install`);
  }
  console.log(`  npm run dev`);
}

async function generateTemplate(projectPath, template) {
  const templates = {
    default: generateDefaultTemplate,
    spa: generateSPATemplate,
    component: generateComponentTemplate
  };
  
  const generator = templates[template];
  if (!generator) {
    throw new Error(`Unknown template: ${template}`);
  }
  
  await generator(projectPath);
}

async function generateDefaultTemplate(projectPath) {
  // Generate package.json
  const packageJson = {
    name: projectPath.split('/').pop(),
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'rxhtmx dev',
      build: 'rxhtmx build',
      preview: 'rxhtmx preview',
      test: 'rxhtmx test',
      lint: 'rxhtmx lint',
      format: 'rxhtmx format'
    },
    dependencies: {
      'rxhtmx': '^1.0.0'
    },
    devDependencies: {
      '@rxhtmx/cli': '^1.0.0'
    }
  };
  
  await writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create directories
  await mkdir(join(projectPath, 'src'), { recursive: true });
  await mkdir(join(projectPath, 'public'), { recursive: true });
  await mkdir(join(projectPath, 'src', 'components'), { recursive: true });
  await mkdir(join(projectPath, 'src', 'stores'), { recursive: true });
  await mkdir(join(projectPath, 'src', 'pages'), { recursive: true });
  
  // Generate main HTML file
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RxHtmx App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
  
  await writeFile(join(projectPath, 'public', 'index.html'), indexHtml);
  
  // Generate main.js
  const mainJs = `import { createApp } from 'rxhtmx';
import App from './App.js';

createApp(App).mount('#app');`;
  
  await writeFile(join(projectPath, 'src', 'main.js'), mainJs);
  
  // Generate App.js
  const appJs = `import { defineComponent, signal } from 'rxhtmx';
import Counter from './components/Counter.js';

export default defineComponent({
  name: 'App',
  setup() {
    const message = signal('Welcome to RxHtmx!');
    
    return {
      message
    };
  },
  template: \`
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-4xl font-bold text-center text-blue-600 mb-8">
          {{message}}
        </h1>
        <div class="bg-white rounded-lg shadow-md p-6">
          <Counter />
        </div>
      </div>
    </div>
  \`
});`;
  
  await writeFile(join(projectPath, 'src', 'App.js'), appJs);
  
  // Generate Counter component
  const counterJs = `import { defineComponent, signal } from 'rxhtmx';

export default defineComponent({
  name: 'Counter',
  setup() {
    const count = signal(0);
    
    const increment = () => {
      count.value++;
    };
    
    const decrement = () => {
      count.value--;
    };
    
    return {
      count,
      increment,
      decrement
    };
  },
  template: \`
    <div class="text-center">
      <h2 class="text-2xl font-semibold mb-4">Counter Example</h2>
      <div class="flex items-center justify-center space-x-4">
        <button 
          @click="decrement"
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          -
        </button>
        <span class="text-3xl font-mono">{{count}}</span>
        <button 
          @click="increment"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          +
        </button>
      </div>
    </div>
  \`
});`;
  
  await writeFile(join(projectPath, 'src', 'components', 'Counter.js'), counterJs);
  
  // Generate README
  const readme = `# ${projectPath.split('/').pop()}

A RxHtmx application built with signals and reactive programming.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # Reusable components
├── pages/         # Page components
├── stores/        # State management
├── App.js         # Root component
└── main.js        # Application entry point
\`\`\`

## Learn More

- [RxHtmx Documentation](https://rxhtmx.dev)
- [Signal Guide](https://rxhtmx.dev/signals)
- [Component System](https://rxhtmx.dev/components)
`;
  
  await writeFile(join(projectPath, 'README.md'), readme);
  
  // Generate .gitignore
  const gitignore = `node_modules/
dist/
.env
.env.local
.env.production
*.log
.DS_Store
Thumbs.db`;
  
  await writeFile(join(projectPath, '.gitignore'), gitignore);
}

async function generateSPATemplate(projectPath) {
  await generateDefaultTemplate(projectPath);
  
  // Add router dependency
  const pkgPath = join(projectPath, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
  pkg.dependencies['@rxhtmx/router'] = '^1.0.0';
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  
  // Generate router configuration
  const routerJs = `import { createRouter, createWebHistory } from 'rxhtmx';
import Home from './pages/Home.js';
import About from './pages/About.js';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});`;
  
  await writeFile(join(projectPath, 'src', 'router.js'), routerJs);
  
  // Generate pages
  const homeJs = `import { defineComponent, signal } from 'rxhtmx';

export default defineComponent({
  name: 'Home',
  template: \`
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Home Page</h1>
      <p class="text-gray-600">Welcome to your RxHtmx SPA!</p>
    </div>
  \`
});`;
  
  await writeFile(join(projectPath, 'src', 'pages', 'Home.js'), homeJs);
  
  const aboutJs = `import { defineComponent } from 'rxhtmx';

export default defineComponent({
  name: 'About',
  template: \`
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">About Page</h1>
      <p class="text-gray-600">Learn more about RxHtmx framework.</p>
    </div>
  \`
});`;
  
  await writeFile(join(projectPath, 'src', 'pages', 'About.js'), aboutJs);
  
  // Update main.js for router
  const mainJs = `import { createApp } from 'rxhtmx';
import App from './App.js';
import router from './router.js';

const app = createApp(App);
app.use(router);
app.mount('#app');`;
  
  await writeFile(join(projectPath, 'src', 'main.js'), mainJs);
}

async function generateComponentTemplate(projectPath) {
  await generateDefaultTemplate(projectPath);
  
  // Add additional component examples
  const buttonJs = `import { defineComponent } from 'rxhtmx';

export default defineComponent({
  name: 'Button',
  props: {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    disabled: { type: Boolean, default: false }
  },
  template: \`
    <button 
      :class="buttonClasses"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <slot />
    </button>
  \`,
  computed: {
    buttonClasses() {
      return [
        'font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline',
        this.variant === 'primary' ? 'bg-blue-500 hover:bg-blue-700 text-white' : '',
        this.variant === 'secondary' ? 'bg-gray-500 hover:bg-gray-700 text-white' : '',
        this.size === 'sm' ? 'text-sm py-1 px-2' : '',
        this.size === 'lg' ? 'text-lg py-3 px-6' : '',
        this.disabled ? 'opacity-50 cursor-not-allowed' : ''
      ].filter(Boolean).join(' ');
    }
  }
});`;
  
  await writeFile(join(projectPath, 'src', 'components', 'Button.js'), buttonJs);
}

async function installDependencies(projectPath) {
  try {
    // Check if npm is available
    await execAsync('npm --version');
    
    // Install dependencies
    await execAsync('npm install', { cwd: projectPath });
    
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.warn('⚠️ Could not install dependencies automatically');
    console.log('Please run "npm install" manually');
  }
}