// Tests for the state management system
// Tests store creation, state mutations, getters, and middleware

import { 
  createStore, 
  useStore,
  loggingMiddleware,
  persistenceMiddleware,
  devToolsMiddleware 
} from '../src/state/store.js';

describe('State Store System', () => {
  describe('Store creation', () => {
    test('should create store with initial state', () => {
      const store = createStore({
        state: {
          count: 0,
          user: null
        },
        mutations: {
          increment: (state) => state.count++,
          setUser: (state, user) => state.user = user
        }
      });
      
      expect(store.state.count).toBe(0);
      expect(store.state.user).toBeNull();
    });
    
    test('should make state reactive', () => {
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        }
      });
      
      let reactiveValue;
      const unsubscribe = store.state.subscribe(state => {
        reactiveValue = state.count;
      });
      
      store.commit('increment');
      
      expect(reactiveValue).toBe(1);
      
      unsubscribe();
    });
  });
  
  describe('Mutations', () => {
    let store;
    
    beforeEach(() => {
      store = createStore({
        state: {
          count: 0,
          items: []
        },
        mutations: {
          increment: (state) => state.count++,
          decrement: (state) => state.count--,
          addItem: (state, item) => state.items.push(item),
          setCount: (state, value) => state.count = value
        }
      });
    });
    
    test('should commit mutations', () => {
      store.commit('increment');
      expect(store.state.count).toBe(1);
      
      store.commit('increment');
      expect(store.state.count).toBe(2);
    });
    
    test('should commit mutations with payload', () => {
      store.commit('setCount', 10);
      expect(store.state.count).toBe(10);
      
      store.commit('addItem', 'test item');
      expect(store.state.items).toContain('test item');
    });
    
    test('should throw error for unknown mutations', () => {
      expect(() => {
        store.commit('nonExistentMutation');
      }).toThrow('Mutation nonExistentMutation not found');
    });
  });
  
  describe('Actions', () => {
    let store;
    
    beforeEach(() => {
      store = createStore({
        state: {
          count: 0,
          loading: false,
          error: null
        },
        mutations: {
          increment: (state) => state.count++,
          setLoading: (state, loading) => state.loading = loading,
          setError: (state, error) => state.error = error
        },
        actions: {
          incrementAsync: async ({ commit }) => {
            commit('setLoading', true);
            await new Promise(resolve => setTimeout(resolve, 10));
            commit('increment');
            commit('setLoading', false);
          },
          fetchData: async ({ commit, state }) => {
            if (state.loading) return;
            
            commit('setLoading', true);
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 10));
              commit('increment');
            } catch (error) {
              commit('setError', error.message);
            } finally {
              commit('setLoading', false);
            }
          }
        }
      });
    });
    
    test('should dispatch actions', async () => {
      await store.dispatch('incrementAsync');
      
      expect(store.state.count).toBe(1);
      expect(store.state.loading).toBe(false);
    });
    
    test('should provide context to actions', async () => {
      await store.dispatch('fetchData');
      
      expect(store.state.count).toBe(1);
      expect(store.state.loading).toBe(false);
    });
    
    test('should throw error for unknown actions', async () => {
      await expect(store.dispatch('nonExistentAction'))
        .rejects.toThrow('Action nonExistentAction not found');
    });
  });
  
  describe('Getters', () => {
    let store;
    
    beforeEach(() => {
      store = createStore({
        state: {
          count: 5,
          todos: [
            { id: 1, text: 'Learn Vue', done: true },
            { id: 2, text: 'Learn React', done: false },
            { id: 3, text: 'Learn Angular', done: false }
          ]
        },
        getters: {
          doubleCount: (state) => state.count * 2,
          completedTodos: (state) => state.todos.filter(todo => todo.done),
          todoById: (state) => (id) => state.todos.find(todo => todo.id === id)
        }
      });
    });
    
    test('should compute simple getters', () => {
      expect(store.getters.doubleCount).toBe(10);
    });
    
    test('should compute filtered getters', () => {
      const completed = store.getters.completedTodos;
      expect(completed).toHaveLength(1);
      expect(completed[0].text).toBe('Learn Vue');
    });
    
    test('should support parameterized getters', () => {
      const todo = store.getters.todoById(2);
      expect(todo.text).toBe('Learn React');
    });
    
    test('should be reactive to state changes', () => {
      const initialDouble = store.getters.doubleCount;
      expect(initialDouble).toBe(10);
      
      // Manually update state (normally done through mutations)
      store.state.count = 10;
      
      expect(store.getters.doubleCount).toBe(20);
    });
  });
  
  describe('Middleware', () => {
    test('should apply logging middleware', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        },
        middleware: [loggingMiddleware]
      });
      
      store.commit('increment');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mutation increment:'),
        expect.anything()
      );
      
      consoleSpy.mockRestore();
    });
    
    test('should apply persistence middleware', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
      
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        },
        middleware: [persistenceMiddleware('test-store')]
      });
      
      store.commit('increment');
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'test-store',
        JSON.stringify({ count: 1 })
      );
      
      setItemSpy.mockRestore();
    });
    
    test('should restore state from localStorage', () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
        .mockReturnValue(JSON.stringify({ count: 5 }));
      
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        },
        middleware: [persistenceMiddleware('test-store')]
      });
      
      expect(store.state.count).toBe(5);
      
      getItemSpy.mockRestore();
    });
    
    test('should apply custom middleware', () => {
      const customMiddleware = jest.fn((store) => (next) => (action) => {
        // Middleware logic
        return next(action);
      });
      
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        },
        middleware: [customMiddleware]
      });
      
      expect(customMiddleware).toHaveBeenCalledWith(store);
    });
    
    test('should chain multiple middleware', () => {
      const middleware1 = jest.fn((store) => (next) => (action) => next(action));
      const middleware2 = jest.fn((store) => (next) => (action) => next(action));
      
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        },
        middleware: [middleware1, middleware2]
      });
      
      store.commit('increment');
      
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
    });
  });
  
  describe('Store composable', () => {
    test('should access store via useStore', () => {
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        }
      });
      
      // Mock current store
      const { setCurrentStore } = require('../src/state/store.js');
      setCurrentStore(store);
      
      const storeInstance = useStore();
      expect(storeInstance).toBe(store);
    });
  });
  
  describe('DevTools middleware', () => {
    test('should connect to devtools when available', () => {
      // Mock devtools
      global.window = {
        __REDUX_DEVTOOLS_EXTENSION__: {
          connect: jest.fn(() => ({
            init: jest.fn(),
            send: jest.fn()
          }))
        }
      };
      
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        },
        middleware: [devToolsMiddleware]
      });
      
      expect(window.__REDUX_DEVTOOLS_EXTENSION__.connect).toHaveBeenCalled();
      
      delete global.window;
    });
    
    test('should handle missing devtools gracefully', () => {
      const store = createStore({
        state: { count: 0 },
        mutations: {
          increment: (state) => state.count++
        },
        middleware: [devToolsMiddleware]
      });
      
      // Should not throw error
      store.commit('increment');
      expect(store.state.count).toBe(1);
    });
  });
  
  describe('Error handling', () => {
    test('should handle mutation errors', () => {
      const store = createStore({
        state: { count: 0 },
        mutations: {
          errorMutation: () => {
            throw new Error('Test error');
          }
        }
      });
      
      expect(() => {
        store.commit('errorMutation');
      }).toThrow('Test error');
    });
    
    test('should handle action errors', async () => {
      const store = createStore({
        state: { count: 0 },
        actions: {
          errorAction: async () => {
            throw new Error('Test async error');
          }
        }
      });
      
      await expect(store.dispatch('errorAction'))
        .rejects.toThrow('Test async error');
    });
  });
});