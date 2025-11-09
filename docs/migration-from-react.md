# Migration Guide: From React to RxHtml

This guide helps React developers transition to RxHtml Framework. We'll compare React concepts with their RxHtml equivalents and provide migration examples.

## Table of Contents

- [Core Concepts Comparison](#core-concepts-comparison)
- [Component Migration](#component-migration)
- [State Management](#state-management)
- [Effects and Lifecycle](#effects-and-lifecycle)
- [Routing](#routing)
- [Performance Optimization](#performance-optimization)
- [Common Patterns](#common-patterns)

## Core Concepts Comparison

### React Hooks vs RxHtml Signals

**React:**
```jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log(`Count is: ${count}`);
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**RxHtml:**
```javascript
import { defineComponent, signal, effect } from 'rxhtmx';

const Counter = defineComponent({
  name: 'Counter',
  setup() {
    const count = signal(0);
    
    effect(() => {
      console.log(`Count is: ${count.value}`);
    });
    
    return {
      count,
      increment: () => count.value++
    };
  },
  template: `
    <div>
      <p>Count: {{count}}</p>
      <button @click="increment">Increment</button>
    </div>
  `
});
```

### Key Differences

| Feature | React | RxHtml |
|---------|-------|--------|
| **Reactivity** | Re-renders components | Fine-grained signal updates |
| **State** | `useState` hook | `signal()` function |
| **Computed** | `useMemo` hook | `computed()` function |
| **Effects** | `useEffect` hook | `effect()` function |
| **Templates** | JSX | HTML template strings |
| **Re-rendering** | Virtual DOM diffing | Direct DOM updates |

## Component Migration

### Functional Components

**React:**
```jsx
function Welcome({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
      <p>You are {age} years old</p>
    </div>
  );
}
```

**RxHtml:**
```javascript
const Welcome = defineComponent({
  name: 'Welcome',
  props: {
    name: { type: String, required: true },
    age: { type: Number, required: true }
  },
  template: `
    <div>
      <h1>Hello, {{name}}</h1>
      <p>You are {{age}} years old</p>
    </div>
  `
});
```

### Component with Local State

**React:**
```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    setTodos([...todos, { id: Date.now(), text: input }]);
    setInput('');
  };
  
  return (
    <div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

**RxHtml:**
```javascript
const TodoList = defineComponent({
  name: 'TodoList',
  setup() {
    const todos = signal([]);
    const input = signal('');
    
    const addTodo = () => {
      todos.value = [...todos.value, { 
        id: Date.now(), 
        text: input.value 
      }];
      input.value = '';
    };
    
    return { todos, input, addTodo };
  },
  template: `
    <div>
      <input v-model="input" />
      <button @click="addTodo">Add</button>
      <ul>
        <li v-for="todo in todos" :key="todo.id">
          {{todo.text}}
        </li>
      </ul>
    </div>
  `
});
```

### Component Composition

**React:**
```jsx
function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function App() {
  return (
    <div>
      <Button onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </div>
  );
}
```

**RxHtml:**
```javascript
const Button = defineComponent({
  name: 'Button',
  props: {
    variant: { type: String, default: 'primary' }
  },
  template: `
    <button 
      :class="'btn btn-' + variant"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `
});

const App = defineComponent({
  name: 'App',
  components: { Button },
  setup() {
    const handleClick = () => alert('Clicked!');
    return { handleClick };
  },
  template: `
    <div>
      <Button @click="handleClick">
        Click Me
      </Button>
    </div>
  `
});
```

## State Management

### Context/Redux vs Store

**React (Context API):**
```jsx
const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  };
  
  return (
    <UserContext.Provider value={{ user, login }}>
      {children}
    </UserContext.Provider>
  );
}

function UserProfile() {
  const { user, login } = useContext(UserContext);
  return <div>{user?.name}</div>;
}
```

**RxHtml (Store):**
```javascript
import { createStore } from 'rxhtmx/state';

const userStore = createStore({
  state: {
    user: null
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const user = await api.login(credentials);
      commit('setUser', user);
    }
  }
});

const UserProfile = defineComponent({
  name: 'UserProfile',
  setup() {
    return {
      user: computed(() => userStore.state.user)
    };
  },
  template: `<div>{{user?.name}}</div>`
});
```

## Effects and Lifecycle

### useEffect vs effect

**React:**
```jsx
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetchUser(userId).then(user => {
      if (!cancelled) {
        setData(user);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [userId]);
  
  return <div>{data?.name}</div>;
}
```

**RxHtml:**
```javascript
const DataFetcher = defineComponent({
  name: 'DataFetcher',
  props: {
    userId: { type: String, required: true }
  },
  setup(props) {
    const data = signal(null);
    
    effect(() => {
      const controller = new AbortController();
      
      fetchUser(props.userId, { 
        signal: controller.signal 
      }).then(user => {
        data.value = user;
      });
      
      return () => controller.abort();
    });
    
    return { data };
  },
  template: `<div>{{data?.name}}</div>`
});
```

### Lifecycle Methods

**React:**
```jsx
function MyComponent() {
  useEffect(() => {
    console.log('Mounted');
    
    return () => {
      console.log('Unmounting');
    };
  }, []);
  
  useEffect(() => {
    console.log('Updated');
  });
  
  return <div>Component</div>;
}
```

**RxHtml:**
```javascript
const MyComponent = defineComponent({
  name: 'MyComponent',
  setup() {
    onMounted(() => {
      console.log('Mounted');
    });
    
    onUpdated(() => {
      console.log('Updated');
    });
    
    onUnmounted(() => {
      console.log('Unmounting');
    });
  },
  template: `<div>Component</div>`
});
```

## Routing

### React Router vs RxHtml Router

**React Router:**
```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/user/:id" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**RxHtml Router:**
```javascript
import { createRouter } from 'rxhtmx/router';

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: UserProfile }
  ]
});

const App = defineComponent({
  name: 'App',
  template: `
    <div>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
      
      <RouterView />
    </div>
  `
});

router.mount('#app');
```

### Protected Routes

**React Router:**
```jsx
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

**RxHtml Router:**
```javascript
const requireAuth = (to, from) => {
  if (!authStore.state.user) {
    return '/login';
  }
  return true;
};

const router = createRouter({
  routes: [
    {
      path: '/dashboard',
      component: Dashboard,
      beforeEnter: requireAuth
    }
  ]
});
```

## Performance Optimization

### useMemo vs computed

**React:**
```jsx
function ExpensiveComponent({ items }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);
  
  return <div>Total: ${total}</div>;
}
```

**RxHtml:**
```javascript
const ExpensiveComponent = defineComponent({
  name: 'ExpensiveComponent',
  props: {
    items: { type: Array, required: true }
  },
  setup(props) {
    const total = computed(() => {
      return props.items.reduce((sum, item) => sum + item.price, 0);
    });
    
    return { total };
  },
  template: `<div>Total: ${{total}}</div>`
});
```

### useCallback vs Method References

**React:**
```jsx
function Parent() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return <Child onIncrement={increment} />;
}
```

**RxHtml:**
```javascript
const Parent = defineComponent({
  name: 'Parent',
  setup() {
    const count = signal(0);
    
    // No need for useCallback - functions don't cause re-renders
    const increment = () => count.value++;
    
    return { increment };
  },
  template: `<Child @increment="increment" />`
});
```

## Common Patterns

### Form Handling

**React:**
```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**RxHtml:**
```javascript
const LoginForm = defineComponent({
  name: 'LoginForm',
  setup() {
    const email = signal('');
    const password = signal('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      login({ email: email.value, password: password.value });
    };
    
    return { email, password, handleSubmit };
  },
  template: `
    <form @submit="handleSubmit">
      <input v-model="email" />
      <input type="password" v-model="password" />
      <button type="submit">Login</button>
    </form>
  `
});
```

### Conditional Rendering

**React:**
```jsx
function UserGreeting({ user }) {
  return (
    <div>
      {user ? (
        <h1>Welcome back, {user.name}!</h1>
      ) : (
        <h1>Please log in</h1>
      )}
    </div>
  );
}
```

**RxHtml:**
```javascript
const UserGreeting = defineComponent({
  name: 'UserGreeting',
  props: {
    user: { type: Object, default: null }
  },
  template: `
    <div>
      <h1 v-if="user">Welcome back, {{user.name}}!</h1>
      <h1 v-else>Please log in</h1>
    </div>
  `
});
```

## Why Migrate to RxHtml?

### Advantages

1. **Fine-grained Reactivity**: Updates only what changed, not entire component trees
2. **No Virtual DOM**: Direct DOM updates for better performance
3. **Simpler Mental Model**: No need to worry about re-renders or memoization
4. **Smaller Bundle Size**: Lightweight framework without heavy runtime
5. **Built-in Solutions**: Router and state management included
6. **TypeScript Support**: Full TypeScript definitions included

### When to Use RxHtml

- Building performance-critical applications
- Creating real-time dashboards
- Developing data-intensive UIs
- Projects where bundle size matters
- Teams preferring template-based syntax

### When to Stick with React

- Large existing React codebase
- Need for extensive ecosystem (React Native, etc.)
- Team expertise in React
- Requirement for specific React libraries

## Migration Strategy

### Incremental Migration

1. **Start Small**: Migrate small, isolated components first
2. **Use Both**: RxHtml can coexist with React initially
3. **Learn Gradually**: Take time to understand signal-based reactivity
4. **Migrate Features**: Move feature by feature, not all at once
5. **Test Thoroughly**: Ensure functionality remains the same

### Common Pitfalls

1. **Forgetting `.value`**: Remember to use `.value` to access signal values
2. **Mutating Arrays**: Use spread operator or array methods that return new arrays
3. **Effect Dependencies**: RxHtml automatically tracks dependencies
4. **Template Syntax**: Learn Vue-style directives (`v-if`, `v-for`, `@click`)

## Getting Help

- [RxHtml Documentation](../README.md)
- [Examples](../examples/)
- [GitHub Issues](https://github.com/kiransth77/RxHtml/issues)

Happy migrating! 🚀
