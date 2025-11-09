/**
 * Type definitions for RxHtml State Management
 * Provides centralized state management with actions, mutations, and getters
 */

import { Signal } from '../core/signal';

/**
 * Store state object
 */
export type State = Record<string, any>;

/**
 * Mutation function that modifies state synchronously
 */
export type Mutation<S = State, P = any> = (state: S, payload?: P) => void;

/**
 * Action function that can perform async operations
 */
export type Action<S = State, P = any, R = any> = (
  context: ActionContext<S>,
  payload?: P
) => R | Promise<R>;

/**
 * Getter function that derives values from state
 */
export type Getter<S = State, R = any> = (
  state: S,
  getters?: Record<string, any>
) => R;

/**
 * Action context provided to action functions
 */
export interface ActionContext<S = State> {
  /**
   * Store state (reactive)
   */
  state: S;

  /**
   * Commit a mutation
   * @param type - Mutation name
   * @param payload - Mutation payload
   */
  commit<P = any>(type: string, payload?: P): void;

  /**
   * Dispatch an action
   * @param type - Action name
   * @param payload - Action payload
   */
  dispatch<P = any, R = any>(type: string, payload?: P): Promise<R>;

  /**
   * Store getters
   */
  getters: Record<string, any>;

  /**
   * Root state (for modules)
   */
  rootState?: State;

  /**
   * Root getters (for modules)
   */
  rootGetters?: Record<string, any>;
}

/**
 * Store plugin function
 */
export type Plugin<S = State> = (store: Store<S>) => void;

/**
 * Middleware function that intercepts mutations
 */
export type Middleware<S = State> = (
  mutation: { type: string; payload: any },
  state: S
) => void;

/**
 * Store module definition
 */
export interface Module<S = State, R = State> {
  /**
   * Module state
   */
  state?: S | (() => S);

  /**
   * Module mutations
   */
  mutations?: Record<string, Mutation<S>>;

  /**
   * Module actions
   */
  actions?: Record<string, Action<S>>;

  /**
   * Module getters
   */
  getters?: Record<string, Getter<S>>;

  /**
   * Nested modules
   */
  modules?: Record<string, Module>;

  /**
   * Whether module is namespaced
   */
  namespaced?: boolean;
}

/**
 * Store configuration options
 */
export interface StoreOptions<S = State> {
  /**
   * Initial store state
   */
  state?: S | (() => S);

  /**
   * Store mutations (synchronous state updates)
   */
  mutations?: Record<string, Mutation<S>>;

  /**
   * Store actions (async operations)
   */
  actions?: Record<string, Action<S>>;

  /**
   * Store getters (computed values from state)
   */
  getters?: Record<string, Getter<S>>;

  /**
   * Store modules for organizing large stores
   */
  modules?: Record<string, Module>;

  /**
   * Plugins to extend store functionality
   */
  plugins?: Plugin<S>[];

  /**
   * Middleware to intercept mutations
   */
  middleware?: Middleware<S>[];

  /**
   * Strict mode - throws errors for mutations outside of mutation handlers
   */
  strict?: boolean;

  /**
   * Enable DevTools integration
   */
  devtools?: boolean;
}

/**
 * Store instance
 */
export interface Store<S = State> {
  /**
   * Current store state (reactive)
   */
  state: Signal<S>;

  /**
   * Store getters (reactive computed values)
   */
  getters: Record<string, any>;

  /**
   * Commit a mutation to update state
   * 
   * @param type - Mutation name
   * @param payload - Mutation payload
   * 
   * @example
   * ```typescript
   * store.commit('increment', 5);
   * store.commit('setUser', { id: 1, name: 'John' });
   * ```
   */
  commit<P = any>(type: string, payload?: P): void;

  /**
   * Dispatch an action
   * 
   * @param type - Action name
   * @param payload - Action payload
   * @returns Promise that resolves when action completes
   * 
   * @example
   * ```typescript
   * await store.dispatch('fetchUser', userId);
   * await store.dispatch('login', credentials);
   * ```
   */
  dispatch<P = any, R = any>(type: string, payload?: P): Promise<R>;

  /**
   * Subscribe to mutations
   * 
   * @param callback - Function called after each mutation
   * @returns Unsubscribe function
   * 
   * @example
   * ```typescript
   * const unsubscribe = store.subscribe((mutation, state) => {
   *   console.log('Mutation:', mutation.type);
   *   console.log('New state:', state);
   * });
   * 
   * // Later...
   * unsubscribe();
   * ```
   */
  subscribe(
    callback: (mutation: { type: string; payload: any }, state: S) => void
  ): () => void;

  /**
   * Subscribe to actions
   * 
   * @param callback - Function called before/after each action
   * @returns Unsubscribe function
   */
  subscribeAction(
    callback: (action: { type: string; payload: any }, state: S) => void
  ): () => void;

  /**
   * Register a module dynamically
   * 
   * @param path - Module path (string or array of strings)
   * @param module - Module definition
   */
  registerModule(path: string | string[], module: Module): void;

  /**
   * Unregister a module dynamically
   * 
   * @param path - Module path (string or array of strings)
   */
  unregisterModule(path: string | string[]): void;

  /**
   * Check if a module is registered
   * 
   * @param path - Module path (string or array of strings)
   * @returns True if module exists
   */
  hasModule(path: string | string[]): boolean;

  /**
   * Replace the root state (for hot-reloading)
   * 
   * @param state - New root state
   */
  replaceState(state: S): void;

  /**
   * Watch a getter value
   * 
   * @param getter - Getter function or name
   * @param callback - Function called when getter value changes
   * @returns Unsubscribe function
   */
  watch<T>(
    getter: string | ((state: S, getters: any) => T),
    callback: (value: T, oldValue: T) => void
  ): () => void;

  /**
   * Reset store to initial state
   */
  reset(): void;
}

/**
 * Creates a store instance
 * 
 * @template S - State type
 * @param options - Store configuration options
 * @returns Store instance
 * 
 * @example
 * ```typescript
 * interface AppState {
 *   count: number;
 *   user: User | null;
 * }
 * 
 * const store = createStore<AppState>({
 *   state: {
 *     count: 0,
 *     user: null
 *   },
 *   mutations: {
 *     increment(state, amount: number = 1) {
 *       state.count += amount;
 *     },
 *     setUser(state, user: User) {
 *       state.user = user;
 *     }
 *   },
 *   actions: {
 *     async fetchUser({ commit }, userId: string) {
 *       const user = await api.getUser(userId);
 *       commit('setUser', user);
 *     }
 *   },
 *   getters: {
 *     isLoggedIn: (state) => state.user !== null,
 *     doubleCount: (state) => state.count * 2
 *   }
 * });
 * ```
 */
export function createStore<S = State>(options: StoreOptions<S>): Store<S>;

/**
 * Gets the current store instance (must be called during component setup)
 * 
 * @returns Current store instance
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     const store = useStore<AppState>();
 *     
 *     const increment = () => {
 *       store.commit('increment');
 *     };
 *     
 *     return { 
 *       count: computed(() => store.state.value.count),
 *       increment 
 *     };
 *   }
 * });
 * ```
 */
export function useStore<S = State>(): Store<S>;

/**
 * Maps state properties to component computed properties
 * 
 * @param map - State property names or mapper functions
 * @returns Object of computed properties
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     return {
 *       ...mapState(['count', 'user']),
 *       ...mapState({
 *         localCount: 'count',
 *         currentUser: 'user'
 *       })
 *     };
 *   }
 * });
 * ```
 */
export function mapState<S = State>(
  map: string[] | Record<string, string | ((state: S) => any)>
): Record<string, () => any>;

/**
 * Maps getters to component computed properties
 * 
 * @param map - Getter names or mapper functions
 * @returns Object of computed properties
 */
export function mapGetters(
  map: string[] | Record<string, string>
): Record<string, () => any>;

/**
 * Maps mutations to component methods
 * 
 * @param map - Mutation names or mapper object
 * @returns Object of methods
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     return {
 *       ...mapMutations(['increment', 'setUser']),
 *       ...mapMutations({
 *         add: 'increment'
 *       })
 *     };
 *   }
 * });
 * ```
 */
export function mapMutations(
  map: string[] | Record<string, string>
): Record<string, (...args: any[]) => void>;

/**
 * Maps actions to component methods
 * 
 * @param map - Action names or mapper object
 * @returns Object of methods
 */
export function mapActions(
  map: string[] | Record<string, string>
): Record<string, (...args: any[]) => Promise<any>>;

/**
 * Creates a namespaced helpers object for a module
 * 
 * @param namespace - Module namespace
 * @returns Helpers object with mapState, mapGetters, mapMutations, mapActions
 * 
 * @example
 * ```typescript
 * const { mapState, mapActions } = createNamespacedHelpers('user');
 * 
 * const UserComponent = defineComponent({
 *   setup() {
 *     return {
 *       ...mapState(['profile', 'settings']),
 *       ...mapActions(['fetchProfile', 'updateSettings'])
 *     };
 *   }
 * });
 * ```
 */
export function createNamespacedHelpers(namespace: string): {
  mapState: typeof mapState;
  mapGetters: typeof mapGetters;
  mapMutations: typeof mapMutations;
  mapActions: typeof mapActions;
};
