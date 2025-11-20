/**
 * Code generator for components, pages, etc.
 * @module cli/generate
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const templates = {
  component: name => `import { defineComponent, signal } from 'rxhtmx';

export default defineComponent({
  name: '${name}',
  setup() {
    const state = signal(null);

    return {
      state,
    };
  },
  template: \`
    <div class="${name.toLowerCase()}">
      <h1>${name} Component</h1>
      <p>{{ state }}</p>
    </div>
  \`,
});
`,

  page: name => `import { defineComponent } from 'rxhtmx';

export default defineComponent({
  name: '${name}Page',
  template: \`
    <div class="page-${name.toLowerCase()}">
      <h1>${name} Page</h1>
    </div>
  \`,
});
`,

  store: name => `import { createStore } from 'rxhtmx';

export const ${name.toLowerCase()}Store = createStore({
  state: {
    // Add your state here
  },
  mutations: {
    // Add mutations here
  },
  actions: {
    // Add actions here
  },
  getters: {
    // Add getters here
  },
});
`,
};

/**
 * Generate code files
 * @param {string} type - Type to generate (component, page, store)
 * @param {string} name - Name of the item
 * @param {Object} options - Generation options
 */
export async function generate(type, name, options = {}) {
  const { directory = 'src' } = options;

  console.log(`🎨 Generating ${type}: ${name}...\n`);

  try {
    if (!templates[type]) {
      throw new Error(
        `Unknown type: ${type}. Available types: ${Object.keys(templates).join(', ')}`
      );
    }

    // Create directory if it doesn't exist
    const targetDir = join(process.cwd(), directory, `${type}s`);
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    // Generate file
    const fileName = `${name}.js`;
    const filePath = join(targetDir, fileName);

    if (existsSync(filePath)) {
      throw new Error(`File already exists: ${filePath}`);
    }

    const content = templates[type](name);
    await writeFile(filePath, content, 'utf-8');

    console.log(`✅ Generated ${type}: ${filePath}\n`);
    console.log('💡 Next steps:');
    console.log(
      `   1. Import in your app: import ${name} from './${type}s/${name}';`
    );
    console.log(`   2. Use the ${type} in your application`);
  } catch (error) {
    console.error(`❌ Failed to generate ${type}:`, error.message);
    process.exit(1);
  }
}
