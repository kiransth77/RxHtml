// Enhanced store system for RxHtmx framework
// Provides state management with middleware support

import { signal, computed, effect } from '../core/signal.js';

export class Store {
  constructor(options = {}) {
    this._state = {};
    this.getters = {};
    this.actions = {};
    this.mutations = {};
    this.middleware = options.middleware || [];
    this.strict = options.strict !== false;

    // Initialize state
    if (options.state) {
      this.initState(options.state);
    }

    // Initialize getters
    if (options.getters) {
      this.initGetters(options.getters);
    }

    // Initialize actions
    if (options.actions) {
      this.actions = { ...options.actions };
    }

    // Initialize mutations
    if (options.mutations) {
      this.mutations = { ...options.mutations };
    }

    // Create reactive state proxy
    this.state = this.createStateProxy();

    // Apply middleware
    this.applyMiddleware();
  }

  getState() {
    // Return a plain object representation of the current state
    const state = {};
    for (const [key, signal$] of Object.entries(this._state)) {
      state[key] = signal$.value;
    }
    return state;
  }

  initState(stateConfig) {
    for (const [key, value] of Object.entries(stateConfig)) {
      this._state[key] = signal(value);
    }
  }

  createStateProxy() {
    const stateProxy = new Proxy(
      {},
      {
        get: (target, key) => {
          // Handle subscribe method
          if (key === 'subscribe') {
            return (callback) => {
              // Subscribe to all state changes
              const subscribers = [];
              for (const [stateKey, signal$] of Object.entries(this._state)) {
                const unsubscribe = effect(() => {
                  // Access the signal to track dependency
                  signal$.value;
                  // Call the callback with the current state
                  callback(this.state);
                });
                subscribers.push(unsubscribe);
              }
              // Return an unsubscribe function
              return () => {
                subscribers.forEach(unsub => unsub && typeof unsub === 'function' && unsub());
              };
            };
          }

          const stateProp = this._state[key];
          if (
            stateProp &&
            typeof stateProp === 'object' &&
            'value' in stateProp
          ) {
            // Return the unwrapped value for better API, but keep signals internally for reactivity
            return stateProp.value;
          }
          return stateProp;
        },
        set: (target, key, value) => {
          if (
            this._state[key] &&
            typeof this._state[key] === 'object' &&
            'value' in this._state[key]
          ) {
            this._state[key].value = value;
          } else {
            this._state[key] = signal(value);
          }
          return true;
        },
        has: (target, key) => key in this._state || key === 'subscribe',
        ownKeys: target => [...Object.keys(this._state), 'subscribe'],
      }
    );
    return stateProxy;
  }

  initGetters(gettersConfig) {
    // Create a state proxy that unwraps signals for getters but preserves reactivity
    const stateProxy = new Proxy(
      {},
      {
        get: (target, key) => {
          const stateProp = this._state[key];
          if (
            stateProp &&
            typeof stateProp === 'object' &&
            'value' in stateProp
          ) {
            // Access the signal value to establish dependency
            const value = stateProp.value;
            return value;
          }
          return stateProp;
        },
      }
    );

    for (const [key, getterFn] of Object.entries(gettersConfig)) {
      const computedSignal = computed(() => {
        const result = getterFn(stateProxy, this.getters);
        return result;
      });
      // Create a getter that returns the unwrapped value
      Object.defineProperty(this.getters, key, {
        get() {
          return computedSignal.value;
        },
        enumerable: true,
      });
    }
  }

  applyMiddleware() {
    // Instantiate middleware
    const middlewareInstances = this.middleware.map(m => m(this));

    // Create middleware chain
    this.dispatch = middlewareInstances.reduceRight(
      (next, middleware) => middleware(next),
      this.baseDispatch.bind(this)
    );

    this.commit = middlewareInstances.reduceRight(
      (next, middleware) =>
        middleware.commit ? middleware.commit(this)(next) : next,
      this.baseCommit.bind(this)
    );
  }

  baseDispatch(action, payload) {
    if (typeof action === 'string') {
      const actionFn = this.actions[action];
      if (!actionFn) {
        return Promise.reject(new Error(`Action ${action} not found`));
      }
      // Wrap in Promise.resolve to ensure async behavior
      return Promise.resolve(
        actionFn.call(
          this,
          { state: this.state, commit: this.commit, dispatch: this.dispatch },
          payload
        )
      );
    }

    if (typeof action === 'object' && action.type) {
      return this.dispatch(action.type, action.payload);
    }

    return Promise.reject(new Error('Invalid action format'));
  }

  baseCommit(mutation, payload) {
    if (typeof mutation === 'string') {
      const mutationFn = this.mutations[mutation];
      if (!mutationFn) {
        throw new Error(`Mutation ${mutation} not found`);
      }

      // Create a state proxy that unwraps and wraps signals for mutations
      const stateProxy = new Proxy(
        {},
        {
          get: (target, key) => {
            const stateProp = this._state[key];
            return stateProp &&
              typeof stateProp === 'object' &&
              'value' in stateProp
              ? stateProp.value
              : stateProp;
          },
          set: (target, key, value) => {
            if (
              this._state[key] &&
              typeof this._state[key] === 'object' &&
              'value' in this._state[key]
            ) {
              this._state[key].value = value;
            } else {
              this._state[key] = signal(value);
            }
            return true;
          },
        }
      );

      mutationFn(stateProxy, payload);
    } else if (typeof mutation === 'object' && mutation.type) {
      this.commit(mutation.type, mutation.payload);
    } else {
      throw new Error('Invalid mutation format');
    }
  }

  // Subscribe to state changes
  subscribe(fn) {
    const unsubscribers = Object.values(this._state).map(stateProp =>
      stateProp.subscribe(() => fn(this._state))
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  // Watch specific state property
  watch(key, callback) {
    if (!(key in this._state)) {
      throw new Error(`State property '${key}' not found`);
    }

    return this._state[key].subscribe(callback);
  }

  // Replace entire state (for hydration)
  replaceState(newState) {
    for (const [key, value] of Object.entries(newState)) {
      if (key in this._state) {
        this._state[key].value = value;
      } else {
        this._state[key] = signal(value);
      }
    }
  }
}

// Store creation helper
export function createStore(options) {
  return new Store(options);
}

// Built-in middleware

// Logger middleware
export function logger(store) {
  const middleware = next => (action, payload) => {
    console.group(`Action: ${action}`);
    console.log('Payload:', payload);
    console.log('State before:', store.getState());

    const result = next(action, payload);

    console.log('State after:', store.getState());
    console.groupEnd();

    return result;
  };

  // Add commit middleware for mutations
  middleware.commit = store => next => (mutation, payload) => {
    if (typeof console !== 'undefined' && console.log) {
      console.log(`Mutation ${mutation}:`, payload);
    }
    return next(mutation, payload);
  };

  return middleware;
}

// Persistence middleware
export function persistence(options = {}) {
  // Handle string argument for backward compatibility
  if (typeof options === 'string') {
    options = { key: options };
  }
  const { key = 'rxhtmx-store', storage = localStorage } = options;

  return store => {
    // Load initial state
    try {
      const savedState = storage.getItem(key);
      if (savedState) {
        store.replaceState(JSON.parse(savedState));
      }
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }

    // Subscribe to state changes
    store.subscribe(() => {
      try {
        storage.setItem(key, JSON.stringify(store.getState()));
      } catch (error) {
        console.warn('Failed to persist state:', error);
      }
    });

    return next => (action, payload) => {
      return next(action, payload);
    };
  };
}

// DevTools middleware
export function devtools(options = {}) {
  const { name = 'RxHtmx Store' } = options;

  return store => {
    // Initialize devtools connection immediately
    let devtoolsInstance = null;
    
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
      devtoolsInstance = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name });
      devtoolsInstance.init(store.getState ? store.getState() : {});
    }

    return next => (action, payload) => {
      const result = next(action, payload);

      if (devtoolsInstance) {
        devtoolsInstance.send(
          `Action: ${action}`,
          store.getState ? store.getState() : {}
        );
      }

      return result;
    };
  };
}

// Validation middleware
export function validation(schemas = {}) {
  return store => {
    return next => (action, payload) => {
      // Validate payload if schema exists
      if (schemas[action]) {
        const isValid = schemas[action](payload);
        if (!isValid) {
          throw new Error(`Invalid payload for action '${action}'`);
        }
      }

      return next(action, payload);
    };
  };
}

// Async middleware for handling promises
export function asyncMiddleware(store) {
  return next => (action, payload) => {
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState);
    }

    return next(action, payload);
  };
}

// Module system for organizing large stores
export class StoreModule {
  constructor(options = {}) {
    this.namespaced = options.namespaced || false;
    this.state = options.state || {};
    this.getters = options.getters || {};
    this.actions = options.actions || {};
    this.mutations = options.mutations || {};
    this.modules = options.modules || {};
  }
}

export function createModule(options) {
  return new StoreModule(options);
}

// Store composition utilities
export function combineStores(stores) {
  const combinedState = {};
  const combinedGetters = {};
  const combinedActions = {};
  const combinedMutations = {};

  for (const [key, store] of Object.entries(stores)) {
    combinedState[key] = store.state;
    combinedGetters[key] = store.getters;
    combinedActions[key] = store.actions;
    combinedMutations[key] = store.mutations;
  }

  return createStore({
    state: combinedState,
    getters: combinedGetters,
    actions: combinedActions,
    mutations: combinedMutations,
  });
}

// Composables for component integration
let currentStore = null;

export function setCurrentStore(store) {
  currentStore = store;
}

export function useStore(store) {
  if (store) {
    return store;
  }
  if (!currentStore) {
    throw new Error('No store provided and no current store set');
  }
  return currentStore;
}

export function useState(store, key) {
  if (!(key in store.state)) {
    throw new Error(`State property '${key}' not found`);
  }
  return store.state[key];
}

export function useGetter(store, key) {
  if (!(key in store.getters)) {
    throw new Error(`Getter '${key}' not found`);
  }
  return store.getters[key];
}

export function useActions(store, actionNames) {
  if (Array.isArray(actionNames)) {
    const actions = {};
    actionNames.forEach(name => {
      actions[name] = payload => store.dispatch(name, payload);
    });
    return actions;
  }

  if (typeof actionNames === 'string') {
    return payload => store.dispatch(actionNames, payload);
  }

  throw new Error('Invalid action names format');
}

// Aliases for backwards compatibility
export const loggingMiddleware = logger;
export const persistenceMiddleware = persistence;
export const devToolsMiddleware = devtools;
