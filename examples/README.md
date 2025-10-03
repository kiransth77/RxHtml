# RxHtmx Framework Examples

This directory contains comprehensive examples showcasing the full capabilities of the RxHtmx reactive frontend framework. These examples demonstrate real-world applications built with components, routing, state management, and reactive patterns.

## Available Examples

### 1. [Form Validation](./form-validation/)
**Component-based form with reactive validation and state management**

- ✅ Component architecture with lifecycle hooks
- ✅ Reactive form validation with signals
- ✅ Cross-field validation (password confirmation)
- ✅ State management with framework stores
- ✅ Custom validation components
- ✅ Form submission handling
- ✅ Error boundary implementation

**Framework Features**: Components, reactive signals, state management, validation system
**Key Learning**: Building robust forms using the RxHtmx component system and reactive validation patterns.

### 2. [Search with Autocomplete](./search/)
**Single-page application with routing and async data handling**

- ✅ Client-side routing with multiple views
- ✅ Search components with reactive streams
- ✅ Autocomplete with debouncing
- ✅ Loading states and error boundaries
- ✅ Route-based state management
- ✅ Performance optimization patterns
- ✅ SEO-friendly routing

**Framework Features**: Router system, components, async handling, performance optimization
**Key Learning**: Creating performant search experiences with routing and component-based architecture.

### 3. [Real-time Chat](./chat/)
**Full-featured chat application demonstrating advanced framework patterns**

- ✅ Component composition and reusability
- ✅ Real-time message state management
- ✅ User authentication patterns
- ✅ Route guards and protected routes
- ✅ WebSocket integration patterns
- ✅ Advanced signal composition
- ✅ Performance monitoring
- ✅ Responsive design components

**Framework Features**: Full framework stack, WebSocket integration, authentication, route guards
**Key Learning**: Building complex applications with the complete RxHtmx framework ecosystem.

## Running the Examples

Each example is a complete application built with the RxHtmx framework:

### Development Setup
```bash
# Install the framework
npm install rxhtmx
# or
bun install rxhtmx

# Start the development server (with hot reload)
npm run dev
# or use the framework CLI
rxhtmx dev --examples
```

### Production Build
```bash
# Build examples for production
rxhtmx build examples/
```

### Direct Browser Access
For quick exploration, examples can be opened directly:
1. Navigate to the example directory
2. Open `index.html` in your browser
3. Interact with the full framework features

## Framework Architecture Demonstrated

### Component System
```javascript
// Modern component with lifecycle and state
class TodoComponent extends Component {
  constructor() {
    super();
    this.state = createSignal([]);
  }
  
  onMount() {
    // Component lifecycle
    this.loadTodos();
  }
  
  render() {
    return `<div class="todo-app">${this.renderTodos()}</div>`;
  }
}
```

### Reactive State Management
```javascript
// Framework-integrated state store
const appStore = createStore({
  user: null,
  notifications: [],
  theme: 'light'
});

// Reactive selectors
const user$ = appStore.select('user');
const notifications$ = appStore.select('notifications');
```

### Client-Side Routing
```javascript
// Declarative routing with guards
const routes = [
  { path: '/', component: HomeComponent },
  { path: '/chat', component: ChatComponent, guard: authGuard },
  { path: '/profile/:id', component: ProfileComponent }
];

const router = createRouter(routes);
```

## Example Features

### Core Framework Patterns
- **Component Lifecycle**: Mount, update, unmount hooks
- **Reactive Signals**: Framework-native reactivity system  
- **State Management**: Centralized stores with selectors
- **Client Routing**: SPA navigation with guards
- **Error Boundaries**: Graceful error handling
- **Performance**: Optimized rendering and updates

## Learning Path

**Beginner**: Start with [Form Validation](./form-validation/) to understand the component system and reactive signals.

**Intermediate**: Explore [Search](./search/) to learn routing, async operations, and performance patterns.

**Advanced**: Master [Chat](./chat/) for complex state management, real-time features, and authentication.

## Framework Integration

### Production Applications
Each example can be extended into production applications:

1. **Enhanced Authentication**: Add OAuth, JWT, or session-based auth
2. **Backend Integration**: Connect to REST APIs, GraphQL, or WebSocket services  
3. **Testing Setup**: Unit tests with framework testing utilities
4. **Deployment**: Production builds with optimization and bundling
5. **Monitoring**: Performance tracking and error reporting

### Migration from Other Frameworks
Examples include migration patterns from:
- React to RxHtmx components
- Angular to RxHtmx services and routing
- Vue to RxHtmx reactivity and state

## Browser Support & Performance

### Modern Browser Features
- ES2020+ module system
- Web Components API
- Modern CSS features (Grid, Custom Properties)
- Performance Observer API
- Service Workers (for PWA examples)

### Performance Optimizations
- Component-level code splitting
- Reactive rendering optimizations
- Memory-efficient signal management
- Bundle size optimization
- Progressive loading patterns

## Development Tools

### Framework CLI Commands
```bash
# Create new example
rxhtmx create example my-example

# Development with hot reload
rxhtmx dev examples/my-example

# Production build
rxhtmx build examples/my-example

# Run tests
rxhtmx test examples/my-example
```

### Developer Experience
- Hot module replacement
- TypeScript support
- Framework DevTools browser extension
- Performance profiling
- Component inspector

## Next Steps

After mastering these examples:

1. **[Framework Documentation](../docs/)** - Complete API reference and guides
2. **[Advanced Patterns](../docs/advanced.md)** - Complex use cases and optimizations  
3. **[Migration Guide](../docs/migration.md)** - Moving from other frameworks
4. **[Best Practices](../docs/best-practices.md)** - Production-ready patterns
5. **[Community Examples](https://github.com/rxhtmx/examples)** - Real-world applications

## Contributing Examples

We welcome community examples! Please:
1. Follow the established patterns and documentation style
2. Include comprehensive comments and README
3. Demonstrate specific framework features or use cases
4. Add tests and performance benchmarks where applicable

Each example serves as both a learning tool and a reference implementation for building production applications with the RxHtmx framework.
