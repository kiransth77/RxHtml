# RxHtmx Framework Documentation

Complete documentation for the RxHtmx reactive frontend framework.

## Table of Contents

1. [Getting Started](getting-started.md) - Installation and basic usage
2. [Framework Architecture](advanced.md) - Deep dive into framework design
3. [API Reference](#api-reference) - Complete API documentation
4. [Examples](../examples/README.md) - Sample applications and tutorials
5. [Build System](../build/README.md) - Development and production builds
6. [CLI Tools](../cli/README.md) - Command-line interface
7. [Debugging Guide](debugging-troubleshooting.md) - Troubleshooting help

## Framework Overview

RxHtmx Framework is a complete reactive frontend framework that provides:

- **🔄 Enhanced Signal System**: Modern reactivity with signals, computed values, and effects
- **🧩 Component Architecture**: Full component lifecycle with props and templates
- **🛣️ Client-Side Router**: SPA routing with history API and guards
- **📦 State Management**: Advanced store with actions, mutations, and middleware
- **⚡ Build System**: Development server with HMR and production bundler
- **🔧 CLI Tools**: Project scaffolding and development commands

## Quick Start

### Installation

```bash
# Create new project (recommended)
npx rxhtmx create my-app
cd my-app
npm run dev

# Or add to existing project
npm install rxhtmx
```

### Basic Example

```javascript
import { defineComponent, signal } from 'rxhtmx';

const Counter = defineComponent({
  name: 'Counter',
  setup() {
    const count = signal(0);
    const increment = () => count.value++;
    
    return { count, increment };
  },
  template: `
    <div>
      <span>Count: {{count}}</span>
      <button @click="increment">+</button>
    </div>
  `
## API Reference

### Core Signal System

#### `signal(initialValue)`
Creates a reactive signal that can hold and emit values.

```javascript
const count = signal(0);
count.value = 5; // Update value
count.subscribe(val => console.log(val)); // Subscribe to changes
```

#### `computed(fn)`
Creates a computed signal that automatically updates when dependencies change.

```javascript
const count = signal(0);
const doubled = computed(() => count.value * 2);
```

#### `effect(fn, options?)`
Creates a side effect that runs when dependencies change.

```javascript
effect(() => {
  console.log('Count:', count.value);
});
```

#### `batch(fn)`
Batches multiple signal updates to prevent excessive re-computations.

```javascript
batch(() => {
  signal1.value = 10;
  signal2.value = 20;
});
```

### Component System

#### `defineComponent(options)`
Defines a reusable component with lifecycle and reactivity.

```javascript
const MyComponent = defineComponent({
  name: 'MyComponent',
  props: {
    title: { type: String, required: true }
  },
  setup(props) {
    const state = signal('initial');
    return { state };
  },
  template: '<div>{{title}}: {{state}}</div>'
});
```

#### `createComponent(definition, props?)`
Creates a component instance from a definition.

```javascript
const instance = createComponent(MyComponent, { title: 'Hello' });
instance.mount('#app');
```

### Router System

#### `createRouter(options)`
Creates a client-side router for single-page applications.

```javascript
import { createRouter } from 'rxhtmx/router';

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: User }
  ]
});
```

### State Management

#### `createStore(options)`
Creates a centralized state store with mutations, actions, and getters.

```javascript
import { createStore } from 'rxhtmx/state';

const store = createStore({
  state: { count: 0 },
  mutations: {
    increment: (state) => state.count++
  },
  actions: {
    async fetchData({ commit }) {
      const data = await api.getData();
      commit('setData', data);
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  }
});
```

### Legacy RxJS Integration

For backwards compatibility, the original RxJS integration is preserved:

#### `createStream(selector)`
Creates an RxJS stream from DOM elements.

```javascript
const inputStream = createStream('#my-input');
inputStream.subscribe(value => console.log(value));
```

#### `integrateHtmxWithSignals()`
Creates a stream of HTMX events.

```javascript
const htmxSignal = integrateHtmxWithSignals();
htmxSignal.subscribe(event => console.log('HTMX event:', event.type));
```

#### `bindSignalToDom(signal, selector, updateFn)`
Binds an RxJS signal to DOM updates.

```javascript
bindSignalToDom(dataStream, '#output', (element, value) => {
  element.textContent = value;
});
```

## Framework Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Signal System │    │  Component Sys  │
│   • Reactivity  │◄──►│  • Lifecycle    │
│   • Computed    │    │  • Templates    │
│   • Effects     │    │  • Props        │
└─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Router System │    │  State System   │
│   • Navigation  │◄──►│  • Store        │
│   • Guards      │    │  • Actions      │
│   • History     │    │  • Middleware   │
└─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Interaction** → Component Event Handler
2. **Event Handler** → State Mutation or Router Navigation
3. **State Change** → Signal Updates
4. **Signal Updates** → Component Re-render
5. **Component Re-render** → DOM Updates

## Best Practices

### Component Design

```javascript
// ✅ Good: Single responsibility
const UserAvatar = defineComponent({
  name: 'UserAvatar',
  props: {
    user: { type: Object, required: true },
    size: { type: String, default: 'medium' }
  },
  setup(props) {
    const imageUrl = computed(() => 
      props.user.avatar || '/default-avatar.png'
    );
    
    return { imageUrl };
  }
});

// ❌ Avoid: Too many responsibilities
const UserEverything = defineComponent({
  // Handles user data, profile editing, notifications, etc.
});
```

### State Management

```javascript
// ✅ Good: Normalized state structure
const store = createStore({
  state: {
    users: {},
    posts: {},
    currentUser: null
  },
  
  mutations: {
    setUser: (state, user) => {
      state.users[user.id] = user;
    }
  }
});

// ❌ Avoid: Nested, denormalized state
const badStore = createStore({
  state: {
    currentUser: {
      posts: [
        { comments: [...] }
      ]
    }
  }
});
```

### Signal Usage

```javascript
// ✅ Good: Computed for derived state
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

// ❌ Avoid: Manual updates for derived state
effect(() => {
  fullName.value = `${firstName.value} ${lastName.value}`;
});
```

## Migration Guide

### From Legacy RxHtmx

The original RxJS integration continues to work:

```javascript
// Legacy (still works)
import { createStream, integrateHtmxWithSignals } from 'rxhtmx';

// New framework approach
import { defineComponent, signal } from 'rxhtmx';
```

### From Other Frameworks

#### From Vue.js

```javascript
// Vue.js
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    doubled() { return this.count * 2; }
  }
}

// RxHtmx
const MyComponent = defineComponent({
  setup() {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    return { count, doubled };
  }
});
```

#### From React

```javascript
// React
function Counter() {
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]);
  
  return <div>{count}</div>;
}

// RxHtmx
const Counter = defineComponent({
  setup() {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    
    return { count, doubled };
  },
  template: '<div>{{count}}</div>'
});
```

## Resources

- **[Getting Started Guide](getting-started.md)** - Step-by-step tutorial
- **[Advanced Patterns](advanced.md)** - Complex use cases and patterns
- **[Example Applications](../examples/README.md)** - Complete sample apps
- **[Build System Guide](../build/README.md)** - Development and production builds
- **[CLI Documentation](../cli/README.md)** - Command-line tools
- **[Debugging Guide](debugging-troubleshooting.md)** - Troubleshooting help

## Community

- **GitHub**: [RxHtmx Framework Repository](https://github.com/kiransth77/RxHtml)
- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas

---

**RxHtmx Framework** - A complete reactive frontend framework built for modern web development! 🚀
```

### Signal Binding

Bind RxJS signals directly to DOM elements for reactive UI updates.

```javascript
import { bindSignalToDom } from 'rxhtmx';
import { Subject } from 'rxjs';

const dataSignal = new Subject();
bindSignalToDom(dataSignal, '#output', (element, value) => {
    element.innerHTML = `<p>Data: ${value}</p>`;
});

dataSignal.next('Hello World!');
```

## API Reference

### `createStream(selector)`

Creates an RxJS Subject that emits values when the specified element receives input events.

**Parameters:**
- `selector` (string): CSS selector for the target element

**Returns:**
- `Subject`: RxJS Subject that emits input values

**Example:**
```javascript
const inputStream = createStream('#email-input');
inputStream
    .debounce(300)
    .filter(email => email.includes('@'))
    .subscribe(email => validateEmail(email));
```

### `integrateHtmxWithSignals()`

Creates an RxJS Subject that emits HTMX events as reactive signals.

**Returns:**
- `Subject`: RxJS Subject that emits HTMX event objects

**Event Object Structure:**
```javascript
{
    type: 'afterSwap' | 'beforeRequest' | /* other HTMX events */,
    detail: /* HTMX event detail object */
}
```

**Example:**
```javascript
const htmxSignal = integrateHtmxWithSignals();
htmxSignal
    .filter(event => event.type === 'afterSwap')
    .map(event => event.detail)
    .subscribe(detail => {
        console.log('New content loaded:', detail);
    });
```

### `bindSignalToDom(signal$, selector, updateFn)`

Binds an RxJS observable to a DOM element with a custom update function.

**Parameters:**
- `signal$` (Observable): RxJS observable to bind
- `selector` (string): CSS selector for the target element
- `updateFn` (function): Function to update the element `(element, value) => void`

**Returns:**
- `Subscription`: RxJS subscription that can be unsubscribed

**Example:**
```javascript
import { interval } from 'rxjs';

const timer$ = interval(1000);
const subscription = bindSignalToDom(timer$, '#timer', (el, count) => {
    el.textContent = `Timer: ${count}`;
});

// Later: subscription.unsubscribe();
```

## Examples

See the [examples](./examples/) directory for complete working examples:

- [Basic Form Validation](./examples/form-validation/)
- [Real-time Chat](./examples/chat/)
- [Search with Autocomplete](./examples/search/)
- [Shopping Cart](./examples/shopping-cart/)

## Best Practices

### 1. Memory Management

Always unsubscribe from streams to prevent memory leaks:

```javascript
const stream = createStream('#input');
const subscription = stream.subscribe(value => {
    // Handle value
});

// Clean up when component unmounts
subscription.unsubscribe();
```

### 2. Error Handling

Use RxJS error handling operators:

```javascript
const stream = createStream('#input')
    .pipe(
        catchError(error => {
            console.error('Stream error:', error);
            return of(''); // Provide fallback value
        })
    );
```

### 3. Debouncing User Input

Debounce rapid user input to improve performance:

```javascript
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

createStream('#search-input')
    .pipe(
        debounceTime(300),
        distinctUntilChanged()
    )
    .subscribe(query => performSearch(query));
```

### 4. Combining Streams

Combine multiple streams for complex interactions:

```javascript
import { combineLatest } from 'rxjs';

const nameStream = createStream('#name');
const emailStream = createStream('#email');

combineLatest([nameStream, emailStream])
    .pipe(
        map(([name, email]) => ({ name, email })),
        filter(({ name, email }) => name && email)
    )
    .subscribe(user => enableSubmitButton());
```

## Troubleshooting

### Common Issues

**1. "Element not found" warning**
```javascript
// Ensure the element exists before creating the stream
if (document.querySelector('#my-input')) {
    const stream = createStream('#my-input');
}
```

**2. HTMX events not firing**
```javascript
// Make sure HTMX is loaded before integrating signals
document.addEventListener('DOMContentLoaded', () => {
    const htmxSignal = integrateHtmxWithSignals();
});
```

**3. Memory leaks**
```javascript
// Always store subscriptions and unsubscribe
const subscriptions = [];
subscriptions.push(stream.subscribe(...));

// Clean up
subscriptions.forEach(sub => sub.unsubscribe());
```

### Browser Compatibility

RxHtmx requires:
- ES6 module support
- Modern DOM APIs
- RxJS 7+
- HTMX 1.8+

### Testing

For testing RxHtmx applications:

```javascript
// Use the standalone test implementations
import { createTestStream } from 'rxhtmx/testing';

// Mock DOM environment
import { JSDOM } from 'jsdom';
const dom = new JSDOM();
global.document = dom.window.document;
```

## Performance Tips

1. **Use operators wisely**: Leverage RxJS operators like `debounceTime`, `throttleTime`, and `distinctUntilChanged`
2. **Unsubscribe properly**: Always clean up subscriptions
3. **Batch DOM updates**: Use `bindSignalToDom` for efficient DOM manipulation
4. **Profile your streams**: Use RxJS debugging tools to identify bottlenecks

For more advanced usage and patterns, check out our [advanced guide](./advanced.md).
