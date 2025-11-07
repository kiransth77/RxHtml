# TypeScript Usage Guide

This guide demonstrates how to use RxHtml with TypeScript for enhanced type safety and developer experience.

## Table of Contents

- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [Signals with Types](#signals-with-types)
- [Components with Types](#components-with-types)
- [Store with Types](#store-with-types)
- [Router with Types](#router-with-types)
- [Advanced Patterns](#advanced-patterns)

## Setup

### Installation

```bash
npm install rxhtmx
# TypeScript definitions are included!
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Basic Usage

### Importing with Types

```typescript
import { 
  signal, 
  computed, 
  effect,
  defineComponent,
  createStore,
  createRouter 
} from 'rxhtmx';

// All imports are fully typed!
```

## Signals with Types

### Typed Signals

```typescript
import { signal, Signal } from 'rxhtmx';

// Explicitly typed signal
const count: Signal<number> = signal<number>(0);

// Type is inferred
const name = signal('John'); // Signal<string>

// Complex types
interface User {
  id: number;
  name: string;
  email: string;
}

const user = signal<User | null>(null);

// Array types
const items = signal<string[]>([]);
const numbers = signal<number[]>([1, 2, 3]);

// Generic type
function createLoadingSignal<T>(initialValue: T) {
  return {
    data: signal<T>(initialValue),
    loading: signal<boolean>(false),
    error: signal<Error | null>(null)
  };
}

const userLoading = createLoadingSignal<User | null>(null);
```

### Computed with Types

```typescript
import { computed, ComputedSignal } from 'rxhtmx';

const firstName = signal('John');
const lastName = signal('Doe');

// Type is inferred from return value
const fullName: ComputedSignal<string> = computed(() => 
  `${firstName.value} ${lastName.value}`
);

// Generic computed
const items = signal([1, 2, 3, 4, 5]);
const evenItems: ComputedSignal<number[]> = computed(() => 
  items.value.filter(n => n % 2 === 0)
);

// Complex computed type
interface Stats {
  total: number;
  average: number;
  max: number;
}

const numbers = signal([10, 20, 30, 40, 50]);
const stats: ComputedSignal<Stats> = computed(() => {
  const vals = numbers.value;
  return {
    total: vals.reduce((a, b) => a + b, 0),
    average: vals.reduce((a, b) => a + b, 0) / vals.length,
    max: Math.max(...vals)
  };
});
```

### Effects with Types

```typescript
import { effect, EffectCleanup } from 'rxhtmx';

const count = signal(0);

// Effect with cleanup
const dispose: EffectCleanup = effect(() => {
  console.log('Count:', count.value);
  
  // Optional cleanup
  return () => {
    console.log('Cleaning up effect');
  };
});

// Type-safe effect
interface LogEntry {
  message: string;
  timestamp: Date;
}

const logs = signal<LogEntry[]>([]);

effect(() => {
  logs.value.forEach(log => {
    console.log(`[${log.timestamp.toISOString()}] ${log.message}`);
  });
});
```

## Components with Types

### Basic Component

```typescript
import { defineComponent, Component, ComponentOptions } from 'rxhtmx';

// Define component props interface
interface CounterProps {
  initialValue?: number;
  step?: number;
}

// Define component data/state interface
interface CounterData {
  count: Signal<number>;
  increment: () => void;
  decrement: () => void;
}

const Counter: Component<CounterProps, CounterData> = defineComponent<CounterProps, CounterData>({
  name: 'Counter',
  
  props: {
    initialValue: { type: Number, default: 0 },
    step: { type: Number, default: 1 }
  },
  
  setup(props): CounterData {
    const count = signal(props.initialValue || 0);
    
    const increment = () => {
      count.value += props.step || 1;
    };
    
    const decrement = () => {
      count.value -= props.step || 1;
    };
    
    return { count, increment, decrement };
  },
  
  template: `
    <div class="counter">
      <button @click="decrement">-</button>
      <span>{{ count }}</span>
      <button @click="increment">+</button>
    </div>
  `
});
```

### Complex Component with Lifecycle

```typescript
import { defineComponent, onMounted, onUnmounted } from 'rxhtmx';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProfileProps {
  userId: string;
}

interface UserProfileData {
  user: Signal<User | null>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  refresh: () => Promise<void>;
}

const UserProfile = defineComponent<UserProfileProps, UserProfileData>({
  name: 'UserProfile',
  
  props: {
    userId: { type: String, required: true }
  },
  
  setup(props): UserProfileData {
    const user = signal<User | null>(null);
    const loading = signal<boolean>(false);
    const error = signal<string | null>(null);
    
    const fetchUser = async (): Promise<void> => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await fetch(`/api/users/${props.userId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        user.value = await response.json();
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unknown error';
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      fetchUser();
    });
    
    return { user, loading, error, refresh: fetchUser };
  },
  
  template: `
    <div class="user-profile">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">Error: {{ error }}</div>
      <div v-else-if="user">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        <button @click="refresh">Refresh</button>
      </div>
    </div>
  `
});
```

### Component with Generics

```typescript
interface ListProps<T> {
  items: T[];
  keyFn: (item: T) => string | number;
  renderFn: (item: T) => string;
}

interface ListData<T> {
  displayItems: ComputedSignal<T[]>;
}

function createListComponent<T>(): Component<ListProps<T>, ListData<T>> {
  return defineComponent<ListProps<T>, ListData<T>>({
    name: 'GenericList',
    
    props: {
      items: { type: Array, required: true },
      keyFn: { type: Function, required: true },
      renderFn: { type: Function, required: true }
    },
    
    setup(props): ListData<T> {
      const displayItems = computed(() => props.items);
      return { displayItems };
    },
    
    template: `
      <ul>
        <li v-for="item in displayItems" :key="keyFn(item)">
          {{ renderFn(item) }}
        </li>
      </ul>
    `
  });
}

// Usage
interface Product {
  id: number;
  name: string;
  price: number;
}

const ProductList = createListComponent<Product>();
```

## Store with Types

### Typed Store

```typescript
import { createStore, Store, StoreOptions } from 'rxhtmx/state';

// Define state interface
interface AppState {
  user: User | null;
  todos: Todo[];
  loading: boolean;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Define mutations
interface AppMutations {
  setUser: (state: AppState, user: User | null) => void;
  addTodo: (state: AppState, todo: Todo) => void;
  toggleTodo: (state: AppState, id: number) => void;
  setLoading: (state: AppState, loading: boolean) => void;
}

// Define actions
interface AppActions {
  fetchUser: (context: ActionContext<AppState>, userId: string) => Promise<void>;
  createTodo: (context: ActionContext<AppState>, text: string) => Promise<void>;
}

// Create strongly-typed store
const store: Store<AppState> = createStore<AppState>({
  state: {
    user: null,
    todos: [],
    loading: false
  },
  
  mutations: {
    setUser(state, user: User | null) {
      state.user = user;
    },
    
    addTodo(state, todo: Todo) {
      state.todos.push(todo);
    },
    
    toggleTodo(state, id: number) {
      const todo = state.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    
    setLoading(state, loading: boolean) {
      state.loading = loading;
    }
  },
  
  actions: {
    async fetchUser({ commit }, userId: string) {
      commit('setLoading', true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const user = await response.json();
        commit('setUser', user);
      } finally {
        commit('setLoading', false);
      }
    },
    
    async createTodo({ commit }, text: string) {
      const todo: Todo = {
        id: Date.now(),
        text,
        completed: false
      };
      commit('addTodo', todo);
    }
  },
  
  getters: {
    completedTodos: (state): Todo[] => 
      state.todos.filter(t => t.completed),
    
    activeTodos: (state): Todo[] => 
      state.todos.filter(t => !t.completed),
    
    todoStats: (state): { total: number; completed: number; active: number } => ({
      total: state.todos.length,
      completed: state.todos.filter(t => t.completed).length,
      active: state.todos.filter(t => !t.completed).length
    })
  }
});

// Type-safe usage
store.commit('setUser', { id: 1, name: 'John', email: 'john@example.com' });
store.dispatch('fetchUser', '123');

// Getters are typed
const completed: Todo[] = store.getters.completedTodos;
```

## Router with Types

### Typed Routes

```typescript
import { createRouter, Router, RouteLocation } from 'rxhtmx/router';

// Define route names as constants for type safety
const ROUTE_NAMES = {
  HOME: 'home',
  USER_PROFILE: 'user-profile',
  USER_SETTINGS: 'user-settings',
  NOT_FOUND: 'not-found'
} as const;

type RouteName = typeof ROUTE_NAMES[keyof typeof ROUTE_NAMES];

// Define route params interfaces
interface UserProfileParams {
  userId: string;
}

interface UserSettingsParams {
  userId: string;
  section?: string;
}

// Create typed router
const router: Router = createRouter({
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.HOME,
      component: Home
    },
    {
      path: '/user/:userId',
      name: ROUTE_NAMES.USER_PROFILE,
      component: UserProfile
    },
    {
      path: '/user/:userId/settings/:section?',
      name: ROUTE_NAMES.USER_SETTINGS,
      component: UserSettings
    },
    {
      path: '/:pathMatch(.*)*',
      name: ROUTE_NAMES.NOT_FOUND,
      component: NotFound
    }
  ]
});

// Type-safe navigation
function navigateToUser(userId: string): void {
  router.push({
    name: ROUTE_NAMES.USER_PROFILE,
    params: { userId }
  });
}

// Type-safe route access in components
const UserComponent = defineComponent({
  setup() {
    const route = useRoute();
    
    effect(() => {
      // Type assertion for params
      const userId = route.value.params.userId as string;
      console.log('User ID:', userId);
    });
  }
});
```

### Typed Navigation Guards

```typescript
import { NavigationGuard, NavigationGuardReturn } from 'rxhtmx/router';

const requireAuth: NavigationGuard = (to, from): NavigationGuardReturn => {
  const isAuthenticated = authStore.state.isAuthenticated;
  
  if (!isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    };
  }
  
  return true;
};

const requireRole = (roles: string[]): NavigationGuard => {
  return (to, from): NavigationGuardReturn => {
    const user = authStore.state.user;
    
    if (!user || !roles.includes(user.role)) {
      return '/unauthorized';
    }
    
    return true;
  };
};
```

## Advanced Patterns

### Custom Hooks with Types

```typescript
interface UseAsyncResult<T> {
  data: Signal<T | null>;
  loading: Signal<boolean>;
  error: Signal<Error | null>;
  execute: () => Promise<void>;
}

function useAsync<T>(
  asyncFn: () => Promise<T>
): UseAsyncResult<T> {
  const data = signal<T | null>(null);
  const loading = signal<boolean>(false);
  const error = signal<Error | null>(null);
  
  const execute = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    
    try {
      data.value = await asyncFn();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };
  
  return { data, loading, error, execute };
}

// Usage
const { data: user, loading, error, execute: fetchUser } = useAsync<User>(
  () => fetch('/api/user/1').then(r => r.json())
);
```

### Type-safe Event Emitter

```typescript
type EventMap = {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': void;
  'data:update': { id: number; data: any };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<(data: any) => void>>();
  
  on<K extends keyof T>(
    event: K,
    callback: (data: T[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
  
  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

// Usage - fully type-safe!
const events = new TypedEventEmitter<EventMap>();

events.on('user:login', (data) => {
  // data is typed as { userId: string; timestamp: Date }
  console.log('User logged in:', data.userId);
});

events.emit('user:login', {
  userId: '123',
  timestamp: new Date()
});

// TypeScript error! Wrong type
// events.emit('user:login', { wrong: 'type' });
```

## Best Practices

1. **Always type your interfaces**: Define clear interfaces for props, state, and data
2. **Use generics wisely**: Create reusable components with generic types
3. **Leverage type inference**: Let TypeScript infer simple types
4. **Type your stores**: Use strong typing for state management
5. **Use const assertions**: For route names and constants
6. **Add JSDoc comments**: Help other developers understand your code

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [RxHtml Documentation](../README.md)
- [Examples](../examples/)

Happy coding with TypeScript and RxHtml! 🚀
