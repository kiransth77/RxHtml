# Advanced RxHtmx Framework Patterns

This guide covers advanced concepts and patterns for building complex applications with RxHtmx Framework.

## Framework Architecture Deep Dive

### Core System Integration

The RxHtmx framework consists of four core systems that work together seamlessly:

```
┌─────────────────┐    ┌─────────────────┐
│   Signal System │    │  Component Sys  │
│   • signal()    │◄──►│  • defineComp() │
│   • computed()  │    │  • lifecycle    │
│   • effect()    │    │  • templates    │
└─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Router System │    │  State System   │
│   • routes      │◄──►│  • store        │
│   • navigation  │    │  • mutations    │
│   • guards      │    │  • actions      │
└─────────────────┘    └─────────────────┘
```

## Advanced Signal Patterns

### Computed Value Chains

```javascript
import { signal, computed, effect } from 'rxhtmx';

// Base signals
const price = signal(100);
const quantity = signal(2);
const taxRate = signal(0.08);

// Computed chain
const subtotal = computed(() => price.value * quantity.value);
const tax = computed(() => subtotal.value * taxRate.value);
const total = computed(() => subtotal.value + tax.value);

// Complex derivations
const priceBreakdown = computed(() => ({
  subtotal: subtotal.value,
  tax: tax.value,
  total: total.value,
  savings: price.value > 50 ? price.value * 0.1 : 0
}));

// React to changes across the chain
effect(() => {
  console.log('Price breakdown updated:', priceBreakdown.value);
});
```

### Signal Composition Patterns

```javascript
import { signal, computed, batch } from 'rxhtmx';

class FormState {
  constructor() {
    this.fields = {
      name: signal(''),
      email: signal(''),
      password: signal('')
    };
    
    this.validation = computed(() => ({
      name: this.validateName(this.fields.name.value),
      email: this.validateEmail(this.fields.email.value),
      password: this.validatePassword(this.fields.password.value)
    }));
    
    this.isValid = computed(() => {
      const validation = this.validation.value;
      return Object.values(validation).every(field => field.valid);
    });
    
    this.summary = computed(() => ({
      fields: Object.keys(this.fields).length,
      filled: Object.values(this.fields).filter(f => f.value.trim()).length,
      valid: this.isValid.value,
      errors: Object.values(this.validation.value)
        .filter(v => !v.valid)
        .map(v => v.message)
    }));
  }
  
  validateName(name) {
    return {
      valid: name.length >= 2,
      message: name.length < 2 ? 'Name must be at least 2 characters' : ''
    };
  }
  
  validateEmail(email) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return {
      valid: isValid,
      message: !isValid ? 'Please enter a valid email address' : ''
    };
  }
  
  validatePassword(password) {
    const isValid = password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
    return {
      valid: isValid,
      message: !isValid ? 'Password must be 8+ chars with upper, lower, and number' : ''
    };
  }
  
  reset() {
    batch(() => {
      Object.values(this.fields).forEach(field => field.value = '');
    });
  }
  
  populate(data) {
    batch(() => {
      Object.entries(data).forEach(([key, value]) => {
        if (this.fields[key]) {
          this.fields[key].value = value;
        }
      });
    });
  }
}

// Usage in component
const ContactForm = defineComponent({
  name: 'ContactForm',
  setup() {
    const formState = new FormState();
    
    const submit = async () => {
      if (!formState.isValid.value) return;
      
      try {
        await api.submitContact({
          name: formState.fields.name.value,
          email: formState.fields.email.value,
          password: formState.fields.password.value
        });
        formState.reset();
      } catch (error) {
        console.error('Submission failed:', error);
      }
    };
    
    return { formState, submit };
  }
});
```

## Advanced Component Patterns

### Higher-Order Components

```javascript
import { defineComponent } from 'rxhtmx';

// HOC for loading states
function withLoading(WrappedComponent) {
  return defineComponent({
    name: `WithLoading(${WrappedComponent.name})`,
    props: {
      loading: { type: Boolean, default: false },
      ...WrappedComponent.props
    },
    setup(props) {
      const wrappedProps = { ...props };
      delete wrappedProps.loading;
      
      return { wrappedProps };
    },
    template: `
      <div>
        <div v-if="loading" class="loading-spinner">
          Loading...
        </div>
        <component 
          v-else 
          :is="WrappedComponent" 
          v-bind="wrappedProps"
        />
      </div>
    `
  });
}

// HOC for error boundaries
function withErrorBoundary(WrappedComponent) {
  return defineComponent({
    name: `WithErrorBoundary(${WrappedComponent.name})`,
    setup() {
      const error = signal(null);
      
      const handleError = (err) => {
        error.value = err;
        console.error('Component error:', err);
      };
      
      return { error, handleError };
    },
    template: `
      <div>
        <div v-if="error" class="error-boundary">
          <h3>Something went wrong</h3>
          <p>{{error.message}}</p>
          <button @click="error = null">Try Again</button>
        </div>
        <component 
          v-else 
          :is="WrappedComponent" 
          @error="handleError"
        />
      </div>
    `,
    errorCaptured(error) {
      this.handleError(error);
      return false; // Prevent error propagation
    }
  });
}

// Usage
const EnhancedUserList = withErrorBoundary(withLoading(UserList));
```

### Render Props Pattern

```javascript
const DataProvider = defineComponent({
  name: 'DataProvider',
  props: {
    url: { type: String, required: true },
    default: { type: Function, required: true }
  },
  setup(props) {
    const data = signal(null);
    const loading = signal(false);
    const error = signal(null);
    
    const fetchData = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await fetch(props.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data.value = await response.json();
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(fetchData);
    
    return { data, loading, error, refetch: fetchData };
  },
  template: `
    <div>
      <slot 
        :data="data" 
        :loading="loading" 
        :error="error" 
        :refetch="refetch"
      />
    </div>
  `
});

// Usage
const UserProfile = defineComponent({
  template: `
    <DataProvider url="/api/user/123">
      <template #default="{ data: user, loading, error, refetch }">
        <div v-if="loading">Loading user...</div>
        <div v-else-if="error">
          Error: {{error.message}}
          <button @click="refetch">Retry</button>
        </div>
        <div v-else-if="user">
          <h2>{{user.name}}</h2>
          <p>{{user.email}}</p>
        </div>
      </template>
    </DataProvider>
  `
});
```

## Advanced Routing Patterns

### Route Guards and Authentication

```javascript
import { createRouter } from 'rxhtmx/router';
import { authStore } from './store/auth.js';

// Authentication guard
const requireAuth = (to, from) => {
  if (!authStore.state.user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  return true;
};

// Role-based guard
const requireRole = (roles) => (to, from) => {
  const user = authStore.state.user;
  if (!user || !roles.includes(user.role)) {
    return { path: '/unauthorized' };
  }
  return true;
};

// Admin guard
const requireAdmin = requireRole(['admin', 'super-admin']);

const router = createRouter({
  routes: [
    // Public routes
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    
    // Protected routes
    { 
      path: '/dashboard', 
      component: Dashboard,
      beforeEnter: requireAuth
    },
    { 
      path: '/profile', 
      component: Profile,
      beforeEnter: requireAuth
    },
    
    // Admin routes
    {
      path: '/admin',
      component: AdminLayout,
      beforeEnter: [requireAuth, requireAdmin],
      children: [
        { path: '', component: AdminDashboard },
        { path: 'users', component: UserManagement },
        { path: 'settings', component: AdminSettings }
      ]
    }
  ]
});

// Global navigation guard
router.beforeEach(async (to, from) => {
  // Check if token is still valid
  if (authStore.state.token) {
    try {
      await authStore.dispatch('validateToken');
    } catch (error) {
      authStore.commit('logout');
      if (to.meta.requiresAuth) {
        return '/login';
      }
    }
  }
});
```

### Dynamic Route Loading

```javascript
const router = createRouter({
  routes: [
    {
      path: '/modules/:module',
      component: () => import('./components/ModuleLoader.js'),
      beforeEnter: async (to) => {
        const { module } = to.params;
        
        // Validate module exists
        const availableModules = await api.getAvailableModules();
        if (!availableModules.includes(module)) {
          return { path: '/404' };
        }
        
        // Load module configuration
        const config = await api.getModuleConfig(module);
        to.meta.moduleConfig = config;
      }
    }
  ]
});

const ModuleLoader = defineComponent({
  name: 'ModuleLoader',
  setup() {
    const route = useRoute();
    const moduleComponent = signal(null);
    const loading = signal(true);
    
    onMounted(async () => {
      const { module } = route.value.params;
      const config = route.value.meta.moduleConfig;
      
      try {
        // Dynamically import module component
        const moduleExports = await import(`./modules/${module}/index.js`);
        moduleComponent.value = moduleExports.default;
      } catch (error) {
        console.error(`Failed to load module ${module}:`, error);
      } finally {
        loading.value = false;
      }
    });
    
    return { moduleComponent, loading };
  },
  template: `
    <div>
      <div v-if="loading">Loading module...</div>
      <component v-else-if="moduleComponent" :is="moduleComponent" />
      <div v-else>Failed to load module</div>
    </div>
  `
});
```
    filter(event => event.type === 'afterSwap'),
    filter(event => event.detail.target.id === 'data-container'),
    map(event => event.detail.xhr.response)
);

// Merge with manual refresh signals
const manualRefresh = createStream('#refresh-btn').pipe(
    map(() => 'manual-refresh')
);

const allUpdates = merge(dataUpdates, manualRefresh);

allUpdates.subscribe(update => {
    console.log('Data updated:', update);
    // Trigger additional processing
});
```

## State Management Patterns

### Centralized Application State

```javascript
import { BehaviorSubject, combineLatest } from 'rxjs';
import { bindSignalToDom } from 'rxhtmx';

class AppState {
    constructor() {
        this.user$ = new BehaviorSubject(null);
        this.notifications$ = new BehaviorSubject([]);
        this.loading$ = new BehaviorSubject(false);
        
        // Derived state
        this.isLoggedIn$ = this.user$.pipe(
            map(user => !!user)
        );
        
        this.notificationCount$ = this.notifications$.pipe(
            map(notifications => notifications.length)
        );
    }
    
    setUser(user) {
        this.user$.next(user);
    }
    
    addNotification(notification) {
        const current = this.notifications$.value;
        this.notifications$.next([...current, notification]);
    }
    
    setLoading(loading) {
        this.loading$.next(loading);
    }
}

const appState = new AppState();

// Bind state to UI components
bindSignalToDom(appState.isLoggedIn$, '#login-status', (el, isLoggedIn) => {
    el.textContent = isLoggedIn ? 'Logged In' : 'Please Log In';
});

bindSignalToDom(appState.notificationCount$, '#notification-badge', (el, count) => {
    el.textContent = count;
    el.style.display = count > 0 ? 'block' : 'none';
});
```

## Error Handling Strategies

### Graceful Degradation

```javascript
import { createStream } from 'rxhtmx';
import { catchError, retry, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

const searchStream = createStream('#search-input').pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => 
        fetch(`/api/search?q=${query}`)
            .then(response => response.json())
            .pipe(
                timeout(5000), // 5 second timeout
                retry(2), // Retry failed requests twice
                catchError(error => {
                    console.error('Search failed:', error);
                    return of({ results: [], error: 'Search temporarily unavailable' });
                })
            )
    )
);

bindSignalToDom(searchStream, '#search-results', (el, data) => {
    if (data.error) {
        el.innerHTML = `<div class="error">${data.error}</div>`;
    } else {
        el.innerHTML = data.results.map(result => 
            `<div class="result">${result.title}</div>`
        ).join('');
    }
});
```

## Performance Optimization

### Virtual Scrolling with RxJS

```javascript
import { fromEvent, combineLatest } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

class VirtualList {
    constructor(container, itemHeight = 50) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.data = [];
        
        this.scroll$ = fromEvent(container, 'scroll').pipe(
            map(() => container.scrollTop),
            startWith(0)
        );
        
        this.resize$ = fromEvent(window, 'resize').pipe(
            map(() => container.clientHeight),
            startWith(container.clientHeight)
        );
        
        this.visible$ = combineLatest([this.scroll$, this.resize$]).pipe(
            map(([scrollTop, containerHeight]) => {
                const startIndex = Math.floor(scrollTop / this.itemHeight);
                const endIndex = Math.min(
                    startIndex + Math.ceil(containerHeight / this.itemHeight) + 1,
                    this.data.length
                );
                return { startIndex, endIndex };
            }),
            distinctUntilChanged((prev, curr) => 
                prev.startIndex === curr.startIndex && prev.endIndex === curr.endIndex
            )
        );
        
        this.visible$.subscribe(({ startIndex, endIndex }) => {
            this.renderItems(startIndex, endIndex);
        });
    }
    
    setData(data) {
        this.data = data;
        this.container.style.height = `${data.length * this.itemHeight}px`;
        this.visible$.pipe(take(1)).subscribe(range => {
            this.renderItems(range.startIndex, range.endIndex);
        });
    }
    
    renderItems(start, end) {
        const items = this.data.slice(start, end).map((item, index) => 
            `<div class="item" style="position: absolute; top: ${(start + index) * this.itemHeight}px; height: ${this.itemHeight}px;">
                ${item.content}
            </div>`
        ).join('');
        
        this.container.innerHTML = items;
    }
}
```

## Testing Patterns

### Integration Testing

```javascript
// test-utils.js
import { JSDOM } from 'jsdom';

export function setupTestEnvironment() {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="test-container"></div>
        </body>
        </html>
    `);
    
    global.document = dom.window.document;
    global.window = dom.window;
    global.HTMLElement = dom.window.HTMLElement;
    global.Event = dom.window.Event;
    global.CustomEvent = dom.window.CustomEvent;
    
    return dom;
}

export function createTestElement(html) {
    const container = document.getElementById('test-container');
    container.innerHTML = html;
    return container.firstElementChild;
}

// usage in tests
import { setupTestEnvironment, createTestElement } from './test-utils.js';
import { createStream } from 'rxhtmx';

describe('Form Integration', () => {
    beforeEach(() => {
        setupTestEnvironment();
    });
    
    test('should validate form inputs', () => {
        const input = createTestElement('<input id="email" type="email">');
        const stream = createStream('#email');
        
        const values = [];
        stream.subscribe(value => values.push(value));
        
        input.value = 'test@example.com';
        input.dispatchEvent(new Event('input'));
        
        expect(values).toContain('test@example.com');
    });
});
```

## Deployment Considerations

### Bundle Optimization

```javascript
// webpack.config.js
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                rxjs: {
                    test: /[\\/]node_modules[\\/]rxjs[\\/]/,
                    name: 'rxjs',
                    priority: 10,
                },
                htmx: {
                    test: /[\\/]node_modules[\\/]htmx.org[\\/]/,
                    name: 'htmx',
                    priority: 10,
                }
            }
        }
    }
};
```

### Progressive Enhancement

```javascript
// Graceful degradation for older browsers
if (typeof window !== 'undefined' && window.fetch && window.Promise) {
    import('rxhtmx').then(({ createStream, integrateHtmxWithSignals }) => {
        // Initialize reactive features
        initializeReactiveFeatures();
    });
} else {
    // Fallback to traditional event handling
    initializeFallbackFeatures();
}
```

This advanced guide covers complex patterns and real-world scenarios you might encounter when building applications with RxHtmx.
