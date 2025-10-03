# RxHtmx Framework Architecture

## Overview
RxHtmx is evolving from a lightweight HTMX + signal integration library into a full-fledged small frontend framework. The framework maintains simplicity while providing modern development patterns.

## Core Principles
1. **Signal-First**: All reactivity built on minimal signal primitives
2. **Progressive Enhancement**: Works with server-rendered HTML
3. **Zero Dependencies**: Self-contained with optional HTMX integration
4. **Developer Experience**: Great tooling and debugging
5. **Small Bundle Size**: Core framework <20KB gzipped

## Architecture Modules

### 1. Core (`src/core/`)
```
core/
├── signal.js          # Enhanced signal system with computed, effect
├── component.js       # Component base class and lifecycle
├── router.js          # Client-side routing
├── dom.js            # DOM utilities and virtual DOM helpers
└── events.js         # Event system and delegation
```

### 2. State Management (`src/state/`)
```
state/
├── store.js          # Enhanced signal containers with middleware
├── persistence.js    # LocalStorage/SessionStorage adapters
├── devtools.js      # Development debugging tools
└── computed.js      # Computed signals and reactive derivations
```

### 3. Components (`src/components/`)
```
components/
├── base.js          # Base component class
├── lifecycle.js     # Component lifecycle hooks
├── props.js         # Props validation and reactivity
├── slots.js         # Content projection system
└── directives.js    # Built-in directives (if, for, etc.)
```

### 4. Router (`src/router/`)
```
router/
├── router.js        # Main router class
├── history.js       # History API wrapper
├── guards.js        # Route guards and middleware
└── lazy.js          # Code splitting and lazy loading
```

### 5. Build System (`build/`)
```
build/
├── bundler.js       # Custom bundler for framework
├── dev-server.js    # Development server with HMR
├── optimizer.js     # Production optimizations
└── plugins.js       # Build plugins system
```

### 6. CLI (`cli/`)
```
cli/
├── create.js        # Project scaffolding
├── build.js         # Build commands
├── dev.js          # Development commands
└── templates/       # Project templates
```

## Framework API Design

### Component Definition
```javascript
import { defineComponent, signal, computed } from 'rxhtmx';

export const Counter = defineComponent({
  name: 'Counter',
  props: {
    initial: { type: Number, default: 0 }
  },
  setup(props) {
    const count = signal(props.initial);
    const doubled = computed(() => count.value * 2);
    
    return {
      count,
      doubled,
      increment: () => count.value++,
      decrement: () => count.value--
    };
  },
  template: `
    <div class="counter">
      <button @click="decrement">-</button>
      <span>{{count}} (doubled: {{doubled}})</span>
      <button @click="increment">+</button>
    </div>
  `
});
```

### Router Usage
```javascript
import { createRouter } from 'rxhtmx';

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/users/:id', component: UserDetail, guards: [authGuard] }
  ]
});
```

### State Management
```javascript
import { createStore } from 'rxhtmx';

const store = createStore({
  state: {
    user: signal(null),
    theme: signal('light')
  },
  actions: {
    setUser(user) {
      this.state.user.value = user;
    },
    toggleTheme() {
      this.state.theme.value = this.state.theme.value === 'light' ? 'dark' : 'light';
    }
  },
  middleware: [logger, persistence]
});
```

## Development Phases

### Phase 1: Enhanced Core (Current Sprint)
- Enhance signal system with computed values and effects
- Create basic component system
- Implement template rendering

### Phase 2: Routing & Navigation
- Client-side router with history API
- Route guards and lazy loading
- Navigation utilities

### Phase 3: Advanced State Management
- Store middleware system
- Persistence adapters
- Development tools integration

### Phase 4: Build System & CLI
- Custom bundler optimized for framework
- Development server with HMR
- Project scaffolding CLI

### Phase 5: Developer Experience
- VS Code extension
- Browser devtools
- Debugging utilities

## File Structure
```
rxhtmx/
├── src/
│   ├── core/           # Core framework modules
│   ├── state/          # State management
│   ├── components/     # Component system
│   ├── router/         # Routing system
│   ├── build/          # Build system
│   └── index.js        # Main entry point
├── cli/                # Command line tools
├── examples/           # Example applications
├── tests/              # Comprehensive test suite
├── docs/               # Documentation
└── templates/          # Project templates
```

## Compatibility
- **Browser**: Modern browsers (ES2020+)
- **Server**: Node.js 18+, Bun, Deno
- **Integration**: Works with existing HTMX applications
- **Migration**: Gradual migration path from current version