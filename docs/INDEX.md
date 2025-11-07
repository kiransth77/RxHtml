# 📚 Documentation Index

Welcome to the RxHtml Framework documentation! This index helps you find the information you need quickly.

## 🚀 Getting Started

**New to RxHtml?** Start here:

1. **[README.md](../README.md)** - Framework overview and quick start
2. **[Getting Started Guide](getting-started.md)** - Detailed installation and first app
3. **[Examples](../examples/README.md)** - Working code examples

## 🔄 Migration Guides

Coming from another framework? We've got you covered:

- **[From React](migration-from-react.md)** - React developers: See how hooks map to signals
- **[From Vue](migration-from-vue.md)** - Vue developers: You'll feel right at home!
- **[From HTMX](migration-from-htmx.md)** - HTMX users: Learn hybrid approaches

**Migration difficulty:**
- Vue → RxHtml: ⭐ Very Easy (similar API)
- HTMX → RxHtml: ⭐⭐ Easy (complementary)
- React → RxHtml: ⭐⭐⭐ Moderate (different paradigm)

## 📖 Core Concepts

**Understanding RxHtml fundamentals:**

- **[Getting Started](getting-started.md)** - Signals, components, routing, state management
- **[Advanced Patterns](advanced.md)** - HOCs, render props, composition
- **[API Integration](api-integration.md)** - REST, GraphQL, WebSocket, Authentication

## 🔷 TypeScript Support

**Using RxHtml with TypeScript:**

- **[TypeScript Guide](typescript-guide.md)** - Complete guide with 30+ examples
- **Type Definitions** - Located in `src/**/*.d.ts`
- **IDE Support** - Full auto-completion and type checking

**Topics covered:**
- Typed signals and computed values
- Component props and data types
- Store state management types
- Router with type-safe navigation
- Generic patterns and custom hooks

## ⚡ Performance

**Optimizing your RxHtml applications:**

- **[Performance Guide](performance.md)** - Best practices and benchmarks
- **Benchmarks** - RxHtml vs React vs Vue comparisons
- **Memory Management** - Preventing leaks and optimizing cleanup
- **Bundle Optimization** - Tree shaking and code splitting

**Key topics:**
- Signal optimization
- Component performance
- Virtual scrolling for large lists
- Debouncing and throttling
- Profiling and debugging

## 🔌 API Integration

**Connecting to backends and services:**

- **[API Integration Guide](api-integration.md)** - Comprehensive integration patterns

**Covered technologies:**
- REST APIs with fetch
- GraphQL queries and mutations
- WebSocket real-time updates
- Server-Sent Events (SSE)
- JWT Authentication
- Error handling strategies
- Caching patterns

## 🧪 Testing

**Testing your RxHtml applications:**

- **[Testing Guide](testing.md)** - Testing strategies and patterns
- **Test Examples** - See `tests/` directory for examples

## 🐛 Debugging

**Troubleshooting and debugging:**

- **[Debugging Guide](debugging-troubleshooting.md)** - Common issues and solutions
- **[Advanced Debugging](debugging.md)** - Deep debugging techniques

## 🤝 Contributing

**Want to contribute to RxHtml?**

- **[Contributing Guide](../CONTRIBUTING.md)** - Complete contributor guide
- **Issue Templates:**
  - [Bug Report](../.github/ISSUE_TEMPLATE/bug_report.md)
  - [Feature Request](../.github/ISSUE_TEMPLATE/feature_request.md)
  - [Good First Issue](../.github/ISSUE_TEMPLATE/good_first_issue.md)

**What you'll learn:**
- Development workflow
- Coding standards
- Testing guidelines
- PR submission process
- Good first issue examples

## 📦 Examples

**Learn by example:**

- **[Examples Overview](../examples/README.md)** - All available examples
- **[Form Validation](../examples/form-validation/)** - Real-time form validation
- **[Data Table](../examples/data-table/)** - Interactive table with sorting, filtering, pagination
- **[Search](../examples/search/)** - Search with autocomplete
- **[Chat](../examples/chat/)** - Real-time chat application

## 🏗️ Architecture

**Understanding RxHtml internals:**

- **[Framework Architecture](../FRAMEWORK_ARCHITECTURE.md)** - Technical deep dive
- **[Project Structure](../PROJECT_STRUCTURE.md)** - Codebase organization

## 🔧 CLI and Build Tools

**Development tools:**

- **CLI Commands** - See [CLI documentation](../cli/README.md)
- **Build System** - Vite-based development and production builds
- **[CI/CD Guide](ci-cd.md)** - Continuous integration and deployment

## 📊 Quick Reference

### Installation

```bash
# Create new project
npx rxhtmx create my-app

# Add to existing project
npm install rxhtmx
```

### Basic Usage

```javascript
import { signal, computed, effect, defineComponent } from 'rxhtmx';

// Signals
const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  console.log('Count:', count.value);
});

// Components
const Counter = defineComponent({
  name: 'Counter',
  setup() {
    const count = signal(0);
    return { count, increment: () => count.value++ };
  },
  template: `
    <div>
      <span>{{count}}</span>
      <button @click="increment">+</button>
    </div>
  `
});
```

### Router

```javascript
import { createRouter } from 'rxhtmx';

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: UserProfile }
  ]
});

router.mount('#app');
```

### Store

```javascript
import { createStore } from 'rxhtmx';

const store = createStore({
  state: { count: 0 },
  mutations: {
    increment(state) { state.count++; }
  },
  actions: {
    async incrementAsync({ commit }) {
      await delay(1000);
      commit('increment');
    }
  }
});
```

## 🔗 External Resources

**Community and support:**

- **GitHub Repository:** [kiransth77/RxHtml](https://github.com/kiransth77/RxHtml)
- **Issues:** [Report bugs or request features](https://github.com/kiransth77/RxHtml/issues)
- **Discussions:** [Community discussions](https://github.com/kiransth77/RxHtml/discussions)

## 📈 Learning Path

**Recommended learning order:**

### Beginner
1. Read [README.md](../README.md)
2. Follow [Getting Started](getting-started.md)
3. Try [Examples](../examples/README.md)
4. Build a simple todo app

### Intermediate
1. Study [Advanced Patterns](advanced.md)
2. Learn [API Integration](api-integration.md)
3. Explore [TypeScript Guide](typescript-guide.md)
4. Build a data-driven application

### Advanced
1. Master [Performance Optimization](performance.md)
2. Study [Framework Architecture](../FRAMEWORK_ARCHITECTURE.md)
3. Read [Contributing Guide](../CONTRIBUTING.md)
4. Contribute to the project

## 🎯 Use Cases

**Find documentation by use case:**

### Building a Form
- [Form Validation Example](../examples/form-validation/)
- [API Integration - Forms](api-integration.md#form-handling)
- [Component Patterns](getting-started.md#form-handling)

### Real-time Updates
- [WebSocket Integration](api-integration.md#websockets)
- [Chat Example](../examples/chat/)
- [Performance Tips](performance.md#real-time-updates)

### Data Tables
- [Data Table Example](../examples/data-table/)
- [Virtual Scrolling](performance.md#virtual-scrolling-for-large-lists)
- [Pagination Patterns](getting-started.md#pagination)

### Authentication
- [JWT Authentication](api-integration.md#authentication)
- [Route Guards](getting-started.md#routing-features)
- [Protected Routes](migration-from-react.md#protected-routes)

### State Management
- [Store Guide](getting-started.md#state-management)
- [Advanced State Patterns](advanced.md#state-management-patterns)
- [TypeScript Store](typescript-guide.md#store-with-types)

## 💡 Tips

- **Use Ctrl+F** to search within documents
- **Check examples first** - they often answer questions quickly
- **Migration guides** are great even if you're not migrating - they explain concepts well
- **TypeScript types** provide excellent documentation even if you use JavaScript

## 📝 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| README.md | ✅ Current | 2024 |
| Getting Started | ✅ Current | 2024 |
| Migration Guides | ✅ Current | 2024 |
| TypeScript Guide | ✅ Current | 2024 |
| Performance Guide | ✅ Current | 2024 |
| API Integration | ✅ Current | 2024 |
| Contributing | ✅ Current | 2024 |

---

**Can't find what you're looking for?**

1. Use GitHub's search to find keywords
2. Check the [Examples](../examples/)
3. Open a [Discussion](https://github.com/kiransth77/RxHtml/discussions)
4. File an [Issue](https://github.com/kiransth77/RxHtml/issues)

**Happy coding with RxHtml! 🚀**
