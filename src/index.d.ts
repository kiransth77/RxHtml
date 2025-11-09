/**
 * RxHtml Framework - TypeScript Definitions
 * A modern reactive frontend framework with signals, components, routing, and state management
 * 
 * @packageDocumentation
 */

// Core Signal System
export {
  Signal,
  ComputedSignal,
  EffectCleanup,
  EffectFunction,
  ComputedFunction,
  BatchFunction,
  signal,
  computed,
  effect,
  batch,
  reactive,
  isSignal,
  unref
} from './core/signal';

// Component System
export {
  LifecycleHook,
  PropDefinition,
  PropsDefinition,
  SetupContext,
  SetupFunction,
  ComponentTemplate,
  ComponentOptions,
  ComponentInstance,
  Component,
  defineComponent,
  createComponent,
  getCurrentInstance,
  onMounted,
  onUpdated,
  onUnmounted,
  provide,
  inject,
  ref,
  markRaw,
  shallowReactive
} from './core/component';

// Router System
export {
  RouteLocation,
  RouteRecord,
  NavigationGuard,
  NavigationGuardReturn,
  NavigationFailureType,
  NavigationFailure,
  RouterOptions,
  Router,
  createRouter,
  useRouter,
  useRoute,
  RouterLink,
  RouterView
} from './router/router';

// State Management
export {
  State,
  Mutation,
  Action,
  Getter,
  ActionContext,
  Plugin,
  Middleware,
  Module,
  StoreOptions,
  Store,
  createStore,
  useStore,
  mapState,
  mapGetters,
  mapMutations,
  mapActions,
  createNamespacedHelpers
} from './state/store';

// Legacy/Utility Functions
/**
 * Creates a reactive signal for an HTML input element
 * 
 * @param selector - CSS selector for the target element
 * @returns Signal connected to the input element
 * 
 * @example
 * ```typescript
 * const searchInput = createStream('#search');
 * 
 * effect(() => {
 *   console.log('Search term:', searchInput.value);
 * });
 * ```
 */
export function createStream(selector: string): Signal<string>;

/**
 * Integrates htmx events with signals
 * 
 * @returns Signal that emits htmx events
 * 
 * @example
 * ```typescript
 * const htmxSignal = integrateHtmxWithSignals();
 * 
 * effect(() => {
 *   const event = htmxSignal.value;
 *   if (event && event.type === 'afterSwap') {
 *     console.log('Content swapped:', event.detail);
 *   }
 * });
 * ```
 */
export function integrateHtmxWithSignals(): Signal<{
  type: string;
  detail: any;
} | null>;

/**
 * Binds a signal to a DOM element with a custom update function
 * 
 * @param signal - Signal to bind
 * @param selector - CSS selector for target element
 * @param updateFn - Function to update the element when signal changes
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * const message = signal('Hello World');
 * 
 * const unsubscribe = bindSignalToDom(
 *   message,
 *   '#message',
 *   (el, value) => {
 *     el.textContent = value;
 *   }
 * );
 * 
 * // Later...
 * unsubscribe();
 * ```
 */
export function bindSignalToDom<T>(
  signal: Signal<T>,
  selector: string,
  updateFn: (element: HTMLElement, value: T) => void
): () => void;
