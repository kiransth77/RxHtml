// Integration tests for the complete framework
// Tests that all systems work together properly

import { JSDOM } from 'jsdom';

// Set up comprehensive DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <title>RxHtmx Framework Test</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`, {
  url: 'http://localhost:3000/',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;
global.history = dom.window.history;
global.location = dom.window.location;
global.localStorage = dom.window.localStorage;

// Import all framework components
import { signal, computed, effect, batch, isSignal } from '../src/core/signal.js';
import { defineComponent, createComponent } from '../src/core/component.js';
import { createRouter } from '../src/router/router.js';
import { createStore } from '../src/state/store.js';

describe('Framework Integration Tests', () => {
  let app, router, store;
  
  beforeEach(() => {
    console.log('🧹 Setting up test environment...');
    document.body.innerHTML = '<div id="app"></div>';
    
    // Create store
    console.log('🏪 Creating store...');
    store = createStore({
      state: {
        user: null,
        counter: 0,
        todos: []
      },
      mutations: {
        setUser: (state, user) => state.user = user,
        increment: (state) => state.counter++,
        addTodo: (state, todo) => {
          state.todos = [...state.todos, todo];
        },
        toggleTodo: (state, id) => {
          const todo = state.todos.find(t => t.id === id);
          if (todo) todo.completed = !todo.completed;
        }
      },
      actions: {
        login: async ({ commit }, credentials) => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 10));
          commit('setUser', { id: 1, name: credentials.username });
        },
        createTodo: async ({ commit }, text) => {
          const todo = {
            id: Date.now(),
            text,
            completed: false
          };
          commit('addTodo', todo);
        }
      },
      getters: {
        completedTodos: (state) => state.todos.filter(t => t.completed),
        todoCount: (state) => state.todos.length
      }
    });
    
    console.log('✅ Store created successfully');
    app = document.getElementById('app');
    console.log('📱 App element ready');
  });

  afterEach(() => {
    console.log('🧹 Cleaning up after test...');
    if (router) {
      try {
        router.unmount?.();
      } catch (e) {
        console.warn('⚠️ Router cleanup warning:', e.message);
      }
      router = null;
    }
    
    // Clear any timers or effects
    if (app) {
      app.innerHTML = '';
    }
    
    // Reset document body
    document.body.innerHTML = '<div id="app"></div>';
    console.log('✅ Cleanup completed');
  });

  
  describe('Signal + Component Integration', () => {
    test('should create reactive components with signals', () => {
      console.log('🔄 Testing reactive components with signals...');
      const count = signal(0);
      console.log('📊 Signal created');
      
      const Counter = defineComponent({
        name: 'Counter',
        setup() {
          console.log('⚙️ Setting up Counter component');
          const increment = () => count.value++;
          const doubleCount = computed(() => count.value * 2);
          
          return { count, increment, doubleCount };
        },
        template: `
          <div>
            <span data-testid="count">{{count}}</span>
            <span data-testid="double">{{doubleCount}}</span>
            <button @click="increment">+</button>
          </div>
        `
      });
      
      console.log('🏗️ Creating component instance...');
      const component = createComponent(Counter);
      console.log('📦 Mounting component...');
      component.mount(app);
      console.log('✅ Component mounted successfully');
      console.log('✅ Component mounted successfully');
      
      console.log('🔍 Querying DOM elements...');
      const countEl = app.querySelector('[data-testid="count"]');
      const doubleEl = app.querySelector('[data-testid="double"]');
      const button = app.querySelector('button');
      
      console.log('📋 Current DOM:', app.innerHTML);
      console.log('💯 Count element:', countEl?.textContent);
      console.log('✖️2 Double element:', doubleEl?.textContent);
      
      expect(countEl?.textContent).toBe('0');
      expect(doubleEl?.textContent).toBe('0');
      
      console.log('🖱️ Simulating button click...');
      button?.click();
      
      console.log('📋 DOM after click:', app.innerHTML);
      console.log('💯 Count after click:', countEl?.textContent);
      console.log('✖️2 Double after click:', doubleEl?.textContent);
      
      // Should update reactively
      expect(countEl?.textContent).toBe('1');
      expect(doubleEl?.textContent).toBe('2');
      console.log('✅ Reactive update test passed');
    });
    
    test('should handle props and reactive updates', () => {
      const message = signal('Hello');
      
      const Greeting = defineComponent({
        name: 'Greeting',
        props: {
          name: { type: String, required: true }
        },
        setup(props) {
          const fullMessage = computed(() => `${message.value}, ${props.name}!`);
          return { fullMessage };
        },
        template: '<div data-testid="greeting">{{fullMessage}}</div>'
      });
      
      const component = createComponent(Greeting, { name: 'World' });
      component.mount(app);
      
      const greetingEl = app.querySelector('[data-testid="greeting"]');
      expect(greetingEl.textContent).toBe('Hello, World!');
      
      // Update signal
      message.value = 'Hi';
      expect(greetingEl.textContent).toBe('Hi, World!');
    });
  });
  
  describe('Router + Component Integration', () => {
    test('should render components for routes', async () => {
      console.log('🧭 Testing router + component integration...');
      
      const Home = defineComponent({
        name: 'Home',
        template: '<div data-testid="page">Home Page</div>'
      });
      
      const About = defineComponent({
        name: 'About',
        template: '<div data-testid="page">About Page</div>'
      });
      
      console.log('🛤️ Creating router...');
      router = createRouter({
        routes: [
          { path: '/', component: Home },
          { path: '/about', component: About }
        ]
      });
      
      console.log('🔧 Mounting router...');
      router.mount(app);
      console.log('✅ Router mounted');
      
      console.log('🏠 Navigating to home...');
      await Promise.race([
        router.push('/'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Router push timeout')), 5000))
      ]);
      
      console.log('📋 DOM after home navigation:', app.innerHTML);
      const homeElement = app.querySelector('[data-testid="page"]');
      console.log('🏠 Home element found:', !!homeElement, homeElement?.textContent);
      expect(homeElement?.textContent).toBe('Home Page');
      
      console.log('ℹ️ Navigating to about...');
      await Promise.race([
        router.push('/about'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Router push timeout')), 5000))
      ]);
      
      console.log('📋 DOM after about navigation:', app.innerHTML);
      const aboutElement = app.querySelector('[data-testid="page"]');
      console.log('ℹ️ About element found:', !!aboutElement, aboutElement?.textContent);
      expect(aboutElement?.textContent).toBe('About Page');
      console.log('✅ Router navigation test passed');
    }, 10000); // 10 second timeout
    
    test('should pass route params to components', async () => {
      const User = defineComponent({
        name: 'User',
        setup() {
          const route = router.currentRoute;
          return { route };
        },
        template: '<div data-testid="user">User ID: {{route.params.id}}</div>'
      });
      
      router = createRouter({
        routes: [
          { path: '/user/:id', component: User }
        ]
      });
      
      router.mount(app);
      
      await router.push('/user/123');
      
      expect(app.querySelector('[data-testid="user"]').textContent).toBe('User ID: 123');
    });
  });
  
  describe('Store + Component Integration', () => {
    test('should connect components to store state', () => {
      const TodoList = defineComponent({
        name: 'TodoList',
        setup() {
          const addTodo = (text) => store.dispatch('createTodo', text);
          const toggleTodo = (id) => store.commit('toggleTodo', id);
          
          return {
            todos: store.state.todos,
            todoCount: store.getters.todoCount,
            addTodo,
            toggleTodo
          };
        },
        template: `
          <div>
            <div data-testid="count">Todos: {{todoCount}}</div>
            <div data-testid="todos">
              <div v-for="todo in todos" :key="todo.id">
                {{todo.text}} - {{todo.completed ? 'Done' : 'Pending'}}
              </div>
            </div>
            <button @click="addTodo('New Todo')">Add Todo</button>
          </div>
        `
      });
      
      const component = createComponent(TodoList);
      component.mount(app);
      
      expect(app.querySelector('[data-testid="count"]').textContent).toBe('Todos: 0');
      
      console.log('🧪 About to click button to add todo...');
      console.log('🧪 Store state before click:', store.getState());
      
      // Add todo
      app.querySelector('button').click();
      
      console.log('🧪 Store state after click:', store.getState());
      console.log('🧪 DOM after click:', app.innerHTML);
      
      expect(app.querySelector('[data-testid="count"]').textContent).toBe('Todos: 1');
    });
  });
  
  describe('Full App Integration', () => {
    test('should create complete app with routing and state', async () => {
      console.log('🚀 Testing full app integration...');
      
      // Counter component
      const Counter = defineComponent({
        name: 'Counter',
        setup() {
          console.log('⚙️ Setting up Counter component');
          return {
            counter: store.state.counter,
            increment: () => store.commit('increment')
          };
        },
        template: `
          <div data-testid="counter-page">
            <h1>Counter: {{counter}}</h1>
            <button @click="increment">+</button>
          </div>
        `
      });
      
      // Profile component
      const Profile = defineComponent({
        name: 'Profile',
        setup() {
          console.log('⚙️ Setting up Profile component');
          return {
            user: store.state.user,
            login: async () => {
              console.log('🔐 Executing login action...');
              const result = await store.dispatch('login', { username: 'testuser' });
              console.log('🔐 Login completed');
              return result;
            }
          };
        },
        template: `
          <div data-testid="profile-page">
            <div v-if="user">Welcome, {{user.name}}!</div>
            <div v-else>
              <button @click="login">Login</button>
            </div>
          </div>
        `
      });
      
      // Create router
      console.log('🛤️ Creating router for full app...');
      router = createRouter({
        routes: [
          { path: '/', component: Counter },
          { path: '/profile', component: Profile }
        ]
      });
      
      // Mount router with timeout protection
      console.log('🔧 Mounting router...');
      await Promise.race([
        new Promise((resolve) => {
          router.mount(app);
          resolve();
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Router mount timeout')), 5000))
      ]);
      console.log('✅ Router mounted successfully');
      
      // Test counter page with timeout
      console.log('🏠 Navigating to counter page...');
      await Promise.race([
        router.push('/'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Counter navigation timeout')), 5000))
      ]);
      
      console.log('📋 DOM after counter navigation:', app.innerHTML);
      const counterPage = app.querySelector('[data-testid="counter-page"]');
      const h1Element = app.querySelector('h1');
      
      console.log('📊 Counter page found:', !!counterPage);
      console.log('📊 H1 element found:', !!h1Element, h1Element?.textContent);
      
      expect(counterPage).toBeTruthy();
      expect(h1Element?.textContent).toBe('Counter: 0');
      
      // Increment counter
      console.log('🖱️ Clicking increment button...');
      const incrementButton = app.querySelector('button');
      incrementButton?.click();
      console.log('📊 Counter after increment:', h1Element?.textContent);
      expect(h1Element?.textContent).toBe('Counter: 1');
      
      // Navigate to profile with timeout
      console.log('👤 Navigating to profile page...');
      await Promise.race([
        router.push('/profile'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile navigation timeout')), 5000))
      ]);
      
      console.log('📋 DOM after profile navigation:', app.innerHTML);
      const profilePage = app.querySelector('[data-testid="profile-page"]');
      console.log('👤 Profile page found:', !!profilePage);
      expect(profilePage).toBeTruthy();
      
      // Test login with timeout
      console.log('🔐 Testing login functionality...');
      const loginButton = app.querySelector('button');
      if (loginButton) {
        console.log('🖱️ Clicking login button...');
        await Promise.race([
          new Promise((resolve) => {
            loginButton.click();
            // Give some time for async login to complete
            setTimeout(resolve, 100);
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Login timeout')), 5000))
        ]);
      }
      
      // Wait a bit more for the store update to propagate
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('📋 DOM after login:', app.innerHTML);
      console.log('👤 Checking login result...');
      const welcomeText = app.textContent;
      console.log('👋 Welcome text found:', welcomeText);
      expect(welcomeText).toContain('Welcome, testuser!');
      console.log('✅ Full app integration test passed');
    }, 15000); // 15 second timeout for this complex test
  });
  
  describe('Complex State Updates', () => {
    test('should handle batched updates across systems', () => {
      const count1 = signal(0);
      const count2 = signal(0);
      
      const Component = defineComponent({
        name: 'BatchTest',
        setup() {
          const total = computed(() => count1.value + count2.value + store.state.counter.value);
          
          const batchUpdate = () => {
            batch(() => {
              count1.value++;
              count2.value++;
              store.commit('increment');
            });
          };
          
          return { count1, count2, storeCounter: store.state.counter, total, batchUpdate };
        },
        template: `
          <div>
            <span data-testid="count1">{{count1}}</span>
            <span data-testid="count2">{{count2}}</span>
            <span data-testid="store">{{storeCounter}}</span>
            <span data-testid="total">{{total}}</span>
            <button @click="batchUpdate">Update All</button>
          </div>
        `
      });
      
      const component = createComponent(Component);
      component.mount(app);
      
      expect(app.querySelector('[data-testid="total"]').textContent).toBe('0');
      
      // Trigger batched update
      app.querySelector('button').click();
      
      // All should update together
      expect(app.querySelector('[data-testid="count1"]').textContent).toBe('1');
      expect(app.querySelector('[data-testid="count2"]').textContent).toBe('1');
      expect(app.querySelector('[data-testid="store"]').textContent).toBe('1');
      expect(app.querySelector('[data-testid="total"]').textContent).toBe('3');
    });
  });
  
  describe('Error Boundaries', () => {
    test('should handle component errors gracefully', () => {
      const ErrorComponent = defineComponent({
        name: 'ErrorComponent',
        setup() {
          const triggerError = () => {
            throw new Error('Test error');
          };
          
          return { triggerError };
        },
        template: '<button @click="triggerError">Trigger Error</button>',
        errorCaptured(error) {
          console.log('Error captured:', error.message);
          return false; // Prevent error propagation
        }
      });
      
      const component = createComponent(ErrorComponent);
      component.mount(app);
      
      // Should not throw
      expect(() => {
        app.querySelector('button').click();
      }).not.toThrow();
    });
  });
  
  describe('Memory Management', () => {
    test('should clean up subscriptions on unmount', () => {
      const count = signal(0);
      let effectCalls = 0;
      
      const Component = defineComponent({
        name: 'CleanupTest',
        setup() {
          effect(() => {
            count.value; // Access signal
            effectCalls++;
          });
          
          return { count };
        },
        template: '<div>{{count}}</div>'
      });
      
      const component = createComponent(Component);
      component.mount(app);
      
      expect(effectCalls).toBe(1);
      
      // Update signal
      count.value++;
      expect(effectCalls).toBe(2);
      
      // Unmount component
      component.unmount();
      
      // Update signal again
      count.value++;
      
      // Effect should not be called after unmount
      expect(effectCalls).toBe(2);
    });
  });
});
