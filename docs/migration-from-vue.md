# Migration Guide: From Vue to RxHtml

This guide helps Vue developers transition to RxHtml Framework. Since RxHtml uses Vue-inspired syntax, the migration is relatively straightforward.

## Table of Contents

- [Why RxHtml Feels Familiar](#why-rxhtml-feels-familiar)
- [Core Differences](#core-differences)
- [Component Migration](#component-migration)
- [Composition API Comparison](#composition-api-comparison)
- [Template Syntax](#template-syntax)
- [State Management](#state-management)
- [Routing](#routing)

## Why RxHtml Feels Familiar

RxHtml was designed with Vue developers in mind. If you know Vue, you'll feel right at home:

- ✅ Similar template syntax (`v-if`, `v-for`, `@click`)
- ✅ Composition API-style `setup()` function
- ✅ Signal-based reactivity (similar to Vue 3's `ref`)
- ✅ Component options structure
- ✅ Router with familiar API

## Core Differences

| Feature | Vue 3 | RxHtml |
|---------|-------|--------|
| **Reactivity** | `ref()`, `reactive()` | `signal()`, `reactive()` |
| **Computed** | `computed()` | `computed()` ✅ Same! |
| **Effects** | `watchEffect()` | `effect()` |
| **Watchers** | `watch()` | `effect()` with tracking |
| **Template Compilation** | Compile-time | Runtime (simpler) |
| **Bundle Size** | ~40KB min | ~20KB min (smaller!) |

## Component Migration

### Options API to RxHtml

**Vue 3 (Options API):**
```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
}
</script>
```

**RxHtml:**
```javascript
import { defineComponent, signal, computed } from 'rxhtmx';

const Counter = defineComponent({
  name: 'Counter',
  setup() {
    const count = signal(0);
    
    const increment = () => count.value++;
    
    const doubled = computed(() => count.value * 2);
    
    return { count, increment, doubled };
  },
  template: `
    <div>
      <p>Count: {{count}}</p>
      <button @click="increment">Increment</button>
    </div>
  `
});
```

### Composition API to RxHtml

**Vue 3 (Composition API):**
```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const increment = () => count.value++;
const doubled = computed(() => count.value * 2);
</script>
```

**RxHtml:**
```javascript
import { defineComponent, signal, computed } from 'rxhtmx';

const Counter = defineComponent({
  name: 'Counter',
  setup() {
    const count = signal(0);
    const increment = () => count.value++;
    const doubled = computed(() => count.value * 2);
    
    return { count, increment, doubled };
  },
  template: `
    <div>
      <p>Count: {{count}}</p>
      <button @click="increment">Increment</button>
    </div>
  `
});
```

**Key Changes:**
- No `<script setup>` - use `setup()` function instead
- `ref()` → `signal()` (but works the same way!)
- Template is a string property instead of separate file
- Must return values from `setup()` explicitly

## Composition API Comparison

### Reactive References

**Vue 3:**
```javascript
import { ref, reactive } from 'vue';

const count = ref(0);
const state = reactive({ name: 'John', age: 30 });

// Access
console.log(count.value);
console.log(state.name);
```

**RxHtml:**
```javascript
import { signal, reactive } from 'rxhtmx';

const count = signal(0);
const state = reactive({ name: 'John', age: 30 });

// Access (exactly the same!)
console.log(count.value);
console.log(state.name);
```

### Computed Properties

**Vue 3:**
```javascript
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
```

**RxHtml:**
```javascript
import { signal, computed } from 'rxhtmx';

const count = signal(0);
const doubled = computed(() => count.value * 2);
```

✅ **Identical API!**

### Watchers and Effects

**Vue 3:**
```javascript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);

// Specific watcher
watch(count, (newVal, oldVal) => {
  console.log(`Count changed from ${oldVal} to ${newVal}`);
});

// Auto-tracking effect
watchEffect(() => {
  console.log(`Count is: ${count.value}`);
});
```

**RxHtml:**
```javascript
import { signal, effect } from 'rxhtmx';

const count = signal(0);

// RxHtml uses effect for both cases
// It auto-tracks like watchEffect
effect(() => {
  console.log(`Count is: ${count.value}`);
});

// For old value tracking, implement manually
let oldValue = count.value;
effect(() => {
  const newValue = count.value;
  console.log(`Count changed from ${oldValue} to ${newValue}`);
  oldValue = newValue;
});
```

### Lifecycle Hooks

**Vue 3:**
```javascript
import { onMounted, onUpdated, onUnmounted } from 'vue';

export default {
  setup() {
    onMounted(() => {
      console.log('Mounted');
    });
    
    onUpdated(() => {
      console.log('Updated');
    });
    
    onUnmounted(() => {
      console.log('Unmounted');
    });
  }
}
```

**RxHtml:**
```javascript
import { defineComponent, onMounted, onUpdated, onUnmounted } from 'rxhtmx';

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
      console.log('Unmounted');
    });
  }
});
```

✅ **Same API!**

## Template Syntax

### Directives

Most Vue directives work in RxHtml:

**Vue 3:**
```vue
<template>
  <!-- Conditional rendering -->
  <div v-if="isVisible">Visible</div>
  <div v-else>Hidden</div>
  
  <!-- List rendering -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
  
  <!-- Event handling -->
  <button @click="handleClick">Click me</button>
  
  <!-- Two-way binding -->
  <input v-model="text" />
  
  <!-- Attribute binding -->
  <div :class="className" :style="styleObject">
    Content
  </div>
</template>
```

**RxHtml:**
```javascript
template: `
  <!-- Conditional rendering ✅ Same -->
  <div v-if="isVisible">Visible</div>
  <div v-else>Hidden</div>
  
  <!-- List rendering ✅ Same -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{item.name}}
    </li>
  </ul>
  
  <!-- Event handling ✅ Same -->
  <button @click="handleClick">Click me</button>
  
  <!-- Two-way binding ✅ Same -->
  <input v-model="text" />
  
  <!-- Attribute binding ✅ Same -->
  <div :class="className" :style="styleObject">
    Content
  </div>
`
```

### Component Props

**Vue 3:**
```vue
<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }
}
</script>
```

**RxHtml:**
```javascript
const MyComponent = defineComponent({
  name: 'MyComponent',
  props: {
    title: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }
});
```

✅ **Identical syntax!**

### Slots

**Vue 3:**
```vue
<!-- Parent -->
<template>
  <MyComponent>
    <template #header>
      <h1>Header Content</h1>
    </template>
    
    <p>Default slot content</p>
    
    <template #footer>
      <p>Footer Content</p>
    </template>
  </MyComponent>
</template>

<!-- Child -->
<template>
  <div>
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>
```

**RxHtml:**
```javascript
// Parent
const Parent = defineComponent({
  template: `
    <MyComponent>
      <template #header>
        <h1>Header Content</h1>
      </template>
      
      <p>Default slot content</p>
      
      <template #footer>
        <p>Footer Content</p>
      </template>
    </MyComponent>
  `
});

// Child
const MyComponent = defineComponent({
  template: `
    <div>
      <slot name="header"></slot>
      <slot></slot>
      <slot name="footer"></slot>
    </div>
  `
});
```

✅ **Same concept, slightly different implementation**

## State Management

### Vuex to RxHtml Store

**Vuex:**
```javascript
import { createStore } from 'vuex';

const store = createStore({
  state: {
    count: 0,
    user: null
  },
  mutations: {
    increment(state) {
      state.count++;
    },
    setUser(state, user) {
      state.user = user;
    }
  },
  actions: {
    async fetchUser({ commit }, userId) {
      const user = await api.getUser(userId);
      commit('setUser', user);
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
});
```

**RxHtml Store:**
```javascript
import { createStore } from 'rxhtmx/state';

const store = createStore({
  state: {
    count: 0,
    user: null
  },
  mutations: {
    increment(state) {
      state.count++;
    },
    setUser(state, user) {
      state.user = user;
    }
  },
  actions: {
    async fetchUser({ commit }, userId) {
      const user = await api.getUser(userId);
      commit('setUser', user);
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
});
```

✅ **Nearly identical API!**

### Using Store in Components

**Vue 3 (Vuex):**
```vue
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const count = computed(() => store.state.count);
const doubleCount = computed(() => store.getters.doubleCount);

const increment = () => store.commit('increment');
const fetchUser = (id) => store.dispatch('fetchUser', id);
</script>
```

**RxHtml:**
```javascript
import { defineComponent, computed } from 'rxhtmx';
import { useStore } from 'rxhtmx/state';

const MyComponent = defineComponent({
  setup() {
    const store = useStore();
    const count = computed(() => store.state.count);
    const doubleCount = computed(() => store.getters.doubleCount);
    
    const increment = () => store.commit('increment');
    const fetchUser = (id) => store.dispatch('fetchUser', id);
    
    return { count, doubleCount, increment, fetchUser };
  }
});
```

## Routing

### Vue Router to RxHtml Router

**Vue Router:**
```javascript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { 
      path: '/user/:id', 
      component: UserProfile,
      props: true 
    }
  ]
});

// In component
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

router.push('/about');
console.log(route.params.id);
```

**RxHtml Router:**
```javascript
import { createRouter } from 'rxhtmx/router';

const router = createRouter({
  mode: 'history', // or 'hash'
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { 
      path: '/user/:id', 
      component: UserProfile,
      props: true 
    }
  ]
});

// In component
import { useRouter, useRoute } from 'rxhtmx';

const router = useRouter();
const route = useRoute();

router.push('/about');
console.log(route.value.params.id); // Note: route is a signal
```

**Key Difference:** In RxHtml, `useRoute()` returns a signal, so use `route.value` to access properties.

### Navigation Guards

**Vue Router:**
```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
});
```

**RxHtml Router:**
```javascript
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return '/login';
  }
  // Returning nothing or true allows navigation
});
```

**Key Difference:** RxHtml guards return the redirect location instead of calling `next()`.

## Migration Checklist

### ✅ Quick Wins (Easy to Migrate)

- [ ] Template syntax (v-if, v-for, @click) - works as-is
- [ ] Props definitions - identical syntax
- [ ] Lifecycle hooks - same API
- [ ] Computed properties - same API
- [ ] Store structure - nearly identical

### ⚠️ Requires Changes

- [ ] `ref()` → `signal()` (rename)
- [ ] `watch()` → `effect()` (different API)
- [ ] `useRoute()` returns signal (add `.value`)
- [ ] SFC → JavaScript components (templates as strings)
- [ ] Navigation guards (return vs next())

### 📝 New Concepts

- [ ] Signal-based reactivity system
- [ ] Batch updates for performance
- [ ] Fine-grained DOM updates

## Why Migrate from Vue to RxHtml?

### When It Makes Sense

1. **Performance Critical**: Need maximum performance
2. **Bundle Size**: Every KB matters
3. **Simple Projects**: Don't need Vue's full ecosystem
4. **Learning**: Want to understand fine-grained reactivity

### When to Stick with Vue

1. **Large Ecosystem**: Need Vue plugins, Nuxt, etc.
2. **Team Expertise**: Team is Vue-expert
3. **SFC Tooling**: Prefer Single File Components
4. **Mature Tooling**: Need official dev tools, testing libraries

## Common Migration Pitfalls

1. **Forgetting .value on route**: `route.value.params` not `route.params`
2. **Template strings**: Remember backticks for templates
3. **Setup return**: Must return values from `setup()`
4. **Effect vs watch**: Effects auto-track, watches don't in Vue

## Migration Strategy

1. **Learn the Differences**: Study this guide thoroughly
2. **Small Components First**: Start with simple, isolated components
3. **One Feature at a Time**: Don't migrate everything at once
4. **Test Thoroughly**: Ensure behavior matches
5. **Leverage Similarities**: Use your Vue knowledge!

## Example: Full Component Migration

**Vue 3:**
```vue
<template>
  <div class="todo-app">
    <h1>{{ title }}</h1>
    <input v-model="newTodo" @keyup.enter="addTodo" />
    <button @click="addTodo">Add</button>
    
    <ul>
      <li v-for="todo in filteredTodos" :key="todo.id">
        <input type="checkbox" v-model="todo.done" />
        <span :class="{ done: todo.done }">{{ todo.text }}</span>
      </li>
    </ul>
    
    <p>{{ remaining }} remaining</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const title = 'My Todos';
const newTodo = ref('');
const todos = ref([]);

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value,
      done: false
    });
    newTodo.value = '';
  }
};

const filteredTodos = computed(() => todos.value);
const remaining = computed(() => 
  todos.value.filter(t => !t.done).length
);
</script>
```

**RxHtml:**
```javascript
import { defineComponent, signal, computed } from 'rxhtmx';

const TodoApp = defineComponent({
  name: 'TodoApp',
  setup() {
    const title = 'My Todos';
    const newTodo = signal('');
    const todos = signal([]);
    
    const addTodo = () => {
      if (newTodo.value.trim()) {
        todos.value = [...todos.value, {
          id: Date.now(),
          text: newTodo.value,
          done: false
        }];
        newTodo.value = '';
      }
    };
    
    const filteredTodos = computed(() => todos.value);
    const remaining = computed(() => 
      todos.value.filter(t => !t.done).length
    );
    
    return { 
      title, newTodo, todos, 
      addTodo, filteredTodos, remaining 
    };
  },
  template: `
    <div class="todo-app">
      <h1>{{title}}</h1>
      <input v-model="newTodo" @keyup.enter="addTodo" />
      <button @click="addTodo">Add</button>
      
      <ul>
        <li v-for="todo in filteredTodos" :key="todo.id">
          <input type="checkbox" v-model="todo.done" />
          <span :class="{ done: todo.done }">{{todo.text}}</span>
        </li>
      </ul>
      
      <p>{{remaining}} remaining</p>
    </div>
  `
});
```

## Conclusion

Migrating from Vue to RxHtml is straightforward because:

- Similar template syntax
- Familiar Composition API
- Same lifecycle hooks
- Compatible store patterns
- Comparable router API

The main differences are:
- Use `signal()` instead of `ref()`
- Templates are strings instead of SFC
- Route is a signal
- Effects auto-track dependencies

Happy migrating! 🚀

For more help:
- [RxHtml Documentation](../README.md)
- [Examples](../examples/)
- [GitHub Issues](https://github.com/kiransth77/RxHtml/issues)
