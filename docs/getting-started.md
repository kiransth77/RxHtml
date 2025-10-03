# Getting Started with RxHtmx Framework

Welcome to RxHtmx Framework! This comprehensive guide will help you get up and running with our modern reactive frontend framework.

## What is RxHtmx Framework?

RxHtmx Framework is a complete reactive frontend framework that provides:

- **🔄 Enhanced Signal System**: Modern reactivity with signals, computed values, and effects
- **🧩 Component Architecture**: Full component lifecycle with props and templates
- **🛣️ Client-Side Router**: SPA routing with history API and guards
- **📦 State Management**: Advanced store with actions, mutations, and middleware
- **⚡ Build System**: Development server with HMR and production bundler
- **🔧 CLI Tools**: Project scaffolding and development commands

## Installation

### Option 1: Create New Project (Recommended)

```bash
# Create a new RxHtmx project
npx rxhtmx create my-app
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Add to Existing Project

```bash
# Install the framework
npm install rxhtmx

# Or with Bun
bun add rxhtmx
```

## Your First RxHtmx App

### 1. Basic Component

Create a simple counter component:

```javascript
// src/components/Counter.js
import { defineComponent, signal } from 'rxhtmx';

export const Counter = defineComponent({
  name: 'Counter',
  props: {
    initialValue: { type: Number, default: 0 }
  },
  setup(props) {
    const count = signal(props.initialValue);
    
    const increment = () => count.value++;
    const decrement = () => count.value--;
    const reset = () => count.value = props.initialValue;
    
    return {
      count,
      increment,
      decrement,
      reset
    };
  },
  template: `
    <div class="counter">
      <h2>Counter: {{count}}</h2>
      <div class="buttons">
        <button @click="decrement">-</button>
        <button @click="reset">Reset</button>
        <button @click="increment">+</button>
      </div>
    </div>
  `
});
```

### 2. Setting Up the Application

```javascript
// src/main.js
import { createComponent } from 'rxhtmx';
import { Counter } from './components/Counter.js';

// Create and mount the component
const app = createComponent(Counter, { initialValue: 10 });
app.mount('#app');
```

### 3. HTML Structure

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My RxHtmx App</title>
    <style>
        .counter { text-align: center; padding: 2rem; }
        .buttons { margin-top: 1rem; }
        button { margin: 0 0.5rem; padding: 0.5rem 1rem; }
    </style>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="./src/main.js"></script>
</body>
</html>
```

## Core Concepts

### 1. Signals - Reactive Primitives

```javascript
import { signal, computed, effect } from 'rxhtmx';

// Create a reactive signal
const count = signal(0);

// Computed values automatically update
const doubled = computed(() => count.value * 2);

// Effects run when dependencies change
effect(() => {
  console.log(`Count is now: ${count.value}`);
});

// Update the signal
count.value = 5; // Triggers computed and effect
```

### 2. Components - Building Blocks

```javascript
import { defineComponent, signal } from 'rxhtmx';

const TodoItem = defineComponent({
  name: 'TodoItem',
  props: {
    todo: { type: Object, required: true },
    onToggle: { type: Function, required: true }
  },
  setup(props) {
    const handleToggle = () => {
      props.onToggle(props.todo.id);
    };
    
    return { handleToggle };
  },
  template: `
    <div class="todo-item" :class="{ completed: todo.completed }">
      <input 
        type="checkbox" 
        :checked="todo.completed"
        @change="handleToggle"
      >
      <span>{{todo.text}}</span>
    </div>
  `
});
```

### 3. Routing - Navigation

```javascript
import { createRouter } from 'rxhtmx/router';

const router = createRouter({
  routes: [
    { 
      path: '/', 
      component: Home,
      name: 'home' 
    },
    { 
      path: '/todos', 
      component: TodoList,
      name: 'todos'
    },
    { 
      path: '/todo/:id', 
      component: TodoDetail,
      name: 'todo-detail'
    }
  ]
});

// Navigation
router.push('/todos');
router.push({ name: 'todo-detail', params: { id: '123' } });
```

### 4. State Management - Global State

```javascript
import { createStore } from 'rxhtmx/state';

const store = createStore({
  state: {
    todos: [],
    user: null,
    loading: false
  },
  
  mutations: {
    setTodos: (state, todos) => state.todos = todos,
    addTodo: (state, todo) => state.todos.push(todo),
    setLoading: (state, loading) => state.loading = loading
  },
  
  actions: {
    async fetchTodos({ commit }) {
      commit('setLoading', true);
      try {
        const todos = await api.getTodos();
        commit('setTodos', todos);
      } finally {
        commit('setLoading', false);
      }
    }
  },
  
### 2. Create Components

```javascript
// src/components/TodoApp.js
import { defineComponent, signal } from 'rxhtmx';
import { todoStore } from '../store/todos.js';

export const TodoApp = defineComponent({
  name: 'TodoApp',
  setup() {
    const newTodoText = signal('');
    
    const addTodo = () => {
      if (newTodoText.value.trim()) {
        todoStore.commit('addTodo', newTodoText.value.trim());
        newTodoText.value = '';
      }
    };
    
    const toggleTodo = (id) => {
      todoStore.commit('toggleTodo', id);
    };
    
    const setFilter = (filter) => {
      todoStore.commit('setFilter', filter);
    };
    
    return {
      newTodoText,
      todos: todoStore.getters.filteredTodos,
      stats: todoStore.getters.todoStats,
      currentFilter: todoStore.state.filter,
      addTodo,
      toggleTodo,
      setFilter
    };
  },
  
  template: `
    <div class="todo-app">
      <header>
        <h1>RxHtmx Todos</h1>
        <div class="add-todo">
          <input 
            v-model="newTodoText" 
            @keyup.enter="addTodo"
            placeholder="What needs to be done?"
          >
          <button @click="addTodo">Add</button>
        </div>
      </header>
      
      <main>
        <div class="filters">
          <button 
            :class="{ active: currentFilter === 'all' }"
            @click="setFilter('all')"
          >
            All ({{stats.total}})
          </button>
          <button 
            :class="{ active: currentFilter === 'active' }"
            @click="setFilter('active')"
          >
            Active ({{stats.active}})
          </button>
          <button 
            :class="{ active: currentFilter === 'completed' }"
            @click="setFilter('completed')"
          >
            Completed ({{stats.completed}})
          </button>
        </div>
        
        <div class="todo-list">
          <div 
            v-for="todo in todos" 
            :key="todo.id"
            class="todo-item"
            :class="{ completed: todo.completed }"
          >
            <input 
              type="checkbox" 
              :checked="todo.completed"
              @change="toggleTodo(todo.id)"
            >
            <span>{{todo.text}}</span>
          </div>
        </div>
      </main>
    </div>
  `
});
```

### 3. Set Up the Main Application

```javascript
// src/main.js
import { createComponent } from 'rxhtmx';
import { TodoApp } from './components/TodoApp.js';

// Create and mount the application
const app = createComponent(TodoApp);
app.mount('#app');
```

### 4. Add Styling

```css
/* src/style.css */
.todo-app {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
}

.add-todo {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-todo input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filters button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.filters button.active {
  background: #007bff;
  color: white;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.todo-item.completed span {
  text-decoration: line-through;
  opacity: 0.6;
}
```

## Next Steps

Now that you have a basic understanding of RxHtmx Framework, explore these advanced topics:

### 1. Advanced Component Patterns
- Lifecycle hooks (`onMounted`, `onUpdated`, `onUnmounted`)
- Component composition with slots
- Higher-order components
- Error boundaries

### 2. Routing Features
- Route guards and authentication
- Nested routes and layouts
- Route metadata
- Navigation hooks

### 3. State Management Patterns
- Middleware for logging and persistence
- Async actions with error handling
- State normalization
- DevTools integration

### 4. Build System Configuration
- Custom bundler plugins
- Environment-specific builds
- Code splitting strategies
- Asset optimization

## Resources

- **[Framework Architecture](advanced.md)** - Deep dive into the framework
- **[API Reference](README.md)** - Complete API documentation
- **[Examples](../examples/README.md)** - Sample applications
- **[Debugging Guide](debugging-troubleshooting.md)** - Troubleshooting help

## Common Patterns

### Handling Forms

```javascript
const LoginForm = defineComponent({
  name: 'LoginForm',
  setup() {
    const form = reactive({
      email: '',
      password: '',
      loading: false,
      errors: {}
    });
    
    const submit = async () => {
      form.loading = true;
      form.errors = {};
      
      try {
        await authStore.dispatch('login', {
          email: form.email,
          password: form.password
        });
        router.push('/dashboard');
      } catch (error) {
        form.errors = error.fieldErrors || { general: error.message };
      } finally {
        form.loading = false;
      }
    };
    
    return { form, submit };
  },
  
  template: `
    <form @submit.prevent="submit">
      <div class="field">
        <input v-model="form.email" type="email" placeholder="Email">
        <span v-if="form.errors.email" class="error">{{form.errors.email}}</span>
      </div>
      
      <div class="field">
        <input v-model="form.password" type="password" placeholder="Password">
        <span v-if="form.errors.password" class="error">{{form.errors.password}}</span>
      </div>
      
      <button :disabled="form.loading" type="submit">
        {{form.loading ? 'Logging in...' : 'Login'}}
      </button>
      
      <div v-if="form.errors.general" class="error">
        {{form.errors.general}}
      </div>
    </form>
  `
});
```

### API Integration

```javascript
// src/services/api.js
export class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  get(endpoint) {
    return this.request(endpoint);
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Usage in store actions
const api = new ApiService('/api');

export const dataStore = createStore({
  state: { users: [], loading: false },
  
  mutations: {
    setUsers: (state, users) => state.users = users,
    setLoading: (state, loading) => state.loading = loading
  },
  
  actions: {
    async fetchUsers({ commit }) {
      commit('setLoading', true);
      try {
        const users = await api.get('/users');
        commit('setUsers', users);
      } finally {
        commit('setLoading', false);
      }
    }
  }
});
```

Ready to build amazing apps with RxHtmx Framework! 🚀

// The stream emits values when the user types
stream.subscribe(value => {
    console.log('User typed:', value);
});
```

#### Transforming Data
```javascript
import { debounceTime, map, filter } from 'rxjs/operators';

const stream = createStream('#search-input').pipe(
    debounceTime(300),           // Wait 300ms after user stops typing
    map(text => text.trim()),    // Remove whitespace
    filter(text => text.length > 2) // Only search if 3+ characters
);
```

#### Binding to DOM
```javascript
// Update DOM elements reactively
bindSignalToDom(stream, '#result', (element, value) => {
    element.innerHTML = `<strong>${value}</strong>`;
});
```

### 3. Common Patterns

#### Form Validation
```javascript
const emailStream = createStream('#email');
const validationStream = emailStream.pipe(
    map(email => ({
        isValid: email.includes('@'),
        message: email.includes('@') ? 'Valid email' : 'Invalid email'
    }))
);

bindSignalToDom(validationStream, '#email-feedback', (el, validation) => {
    el.textContent = validation.message;
    el.className = validation.isValid ? 'success' : 'error';
});
```

#### Search with Debouncing
```javascript
const searchStream = createStream('#search').pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => fetch(`/api/search?q=${query}`).then(r => r.json()))
);

bindSignalToDom(searchStream, '#results', (el, results) => {
    el.innerHTML = results.map(r => `<div>${r.title}</div>`).join('');
});
```

#### HTMX Integration
```javascript
// Listen to HTMX events
const htmxSignal = integrateHtmxWithSignals();

htmxSignal
    .pipe(filter(event => event.type === 'afterSwap'))
    .subscribe(event => {
        console.log('HTMX updated content:', event.detail);
    });
```

## Examples

Explore our [examples](./examples/) to see RxHtmx in action:

1. **[Form Validation](./examples/form-validation/)** - Real-time form validation
2. **[Search](./examples/search/)** - Search with autocomplete
3. **[Chat](./examples/chat/)** - Real-time chat application

## Best Practices

### 1. Always Debounce User Input
```javascript
// ✅ Good - debounced
const stream = createStream('#input').pipe(debounceTime(300));

// ❌ Bad - fires on every keystroke
const stream = createStream('#input');
```

### 2. Unsubscribe to Prevent Memory Leaks
```javascript
const subscription = stream.subscribe(handleValue);

// Later, when component unmounts
subscription.unsubscribe();
```

### 3. Handle Errors Gracefully
```javascript
const stream = createStream('#input').pipe(
    catchError(error => {
        console.error('Stream error:', error);
        return of(''); // Provide fallback value
    })
);
```

### 4. Use Meaningful Transform Functions
```javascript
// ✅ Good - clear transformations
const validEmailStream = emailStream.pipe(
    map(email => email.trim().toLowerCase()),
    filter(email => email.length > 0),
    map(email => ({ email, isValid: isValidEmail(email) }))
);
```

## Operators Cheat Sheet

| Operator | Purpose | Example |
|----------|---------|---------|
| `map` | Transform values | `.pipe(map(x => x * 2))` |
| `filter` | Filter values | `.pipe(filter(x => x > 0))` |
| `debounceTime` | Delay emissions | `.pipe(debounceTime(300))` |
| `distinctUntilChanged` | Skip duplicates | `.pipe(distinctUntilChanged())` |
| `switchMap` | Switch to new observable | `.pipe(switchMap(x => fetch(x)))` |
| `combineLatest` | Combine streams | `combineLatest([stream1, stream2])` |

## Troubleshooting

### Common Issues

**Stream not emitting values**
- Check that the element exists when creating the stream
- Verify the CSS selector is correct
- Ensure the element can receive input events

**Memory leaks**
- Always unsubscribe from streams when done
- Use operators like `takeUntil` for automatic cleanup

**Performance issues**
- Add `debounceTime` to user input streams
- Use `distinctUntilChanged` to avoid duplicate processing
- Consider using `throttleTime` for high-frequency events

## Next Steps

1. **Read the [full documentation](./docs/README.md)** for detailed API reference
2. **Try the [examples](./examples/)** to see different patterns
3. **Check out [advanced patterns](./docs/advanced.md)** for complex use cases
4. **Build your own reactive application!**

## Need Help?

- Check the [documentation](./docs/)
- Look at the [examples](./examples/)
- Review the test files for usage patterns
- Create an issue on GitHub for bugs or questions

Happy coding with RxHtmx! 🚀
