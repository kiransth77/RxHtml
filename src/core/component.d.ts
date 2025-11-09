/**
 * Type definitions for RxHtml Component System
 * Provides a component-based architecture for building UI
 */

import { Signal } from './signal';

/**
 * Component lifecycle hook functions
 */
export type LifecycleHook = () => void | (() => void);

/**
 * Component props definition with type validation
 */
export interface PropDefinition<T = any> {
  /**
   * Expected type constructor (String, Number, Boolean, Object, Array, Function)
   */
  type?: T extends string ? StringConstructor
      : T extends number ? NumberConstructor
      : T extends boolean ? BooleanConstructor
      : T extends object ? ObjectConstructor
      : T extends any[] ? ArrayConstructor
      : T extends Function ? FunctionConstructor
      : any;

  /**
   * Default value or factory function
   */
  default?: T | (() => T);

  /**
   * Whether the prop is required
   */
  required?: boolean;

  /**
   * Custom validator function
   */
  validator?: (value: T) => boolean;
}

/**
 * Component props configuration
 */
export type PropsDefinition = Record<string, PropDefinition>;

/**
 * Component setup function context
 */
export interface SetupContext<P = any> {
  /**
   * Component props (reactive)
   */
  props: P;

  /**
   * Emit custom events
   */
  emit: (event: string, ...args: any[]) => void;

  /**
   * Access to slots
   */
  slots: Record<string, () => string>;

  /**
   * Expose public methods/properties
   */
  expose: (exposed: Record<string, any>) => void;
}

/**
 * Component setup function return type
 */
export type SetupFunction<P = any, R = any> = (
  props: P,
  context: SetupContext<P>
) => R | (() => any);

/**
 * Component template string or function
 */
export type ComponentTemplate<T = any> = string | ((context: T) => string);

/**
 * Component options for defining a component
 */
export interface ComponentOptions<P = any, D = any> {
  /**
   * Component name (for debugging and DevTools)
   */
  name?: string;

  /**
   * Component props definition
   */
  props?: PropsDefinition;

  /**
   * Setup function - runs once when component is created
   */
  setup?: SetupFunction<P, D>;

  /**
   * Component template (HTML string or function)
   */
  template?: ComponentTemplate<D>;

  /**
   * Component styles (scoped CSS)
   */
  styles?: string;

  /**
   * Computed properties
   */
  computed?: Record<string, () => any>;

  /**
   * Component methods
   */
  methods?: Record<string, Function>;

  /**
   * Lifecycle hook - called when component is mounted to DOM
   */
  onMounted?: LifecycleHook;

  /**
   * Lifecycle hook - called when component data updates
   */
  onUpdated?: LifecycleHook;

  /**
   * Lifecycle hook - called before component is unmounted
   */
  onUnmounted?: LifecycleHook;

  /**
   * Lifecycle hook - called when an error is captured from child components
   */
  errorCaptured?: (error: Error) => boolean | void;

  /**
   * Child components to register
   */
  components?: Record<string, Component>;
}

/**
 * Component instance
 */
export interface ComponentInstance<P = any, D = any> {
  /**
   * Component unique ID
   */
  id: string;

  /**
   * Component name
   */
  name: string;

  /**
   * Component props
   */
  props: P;

  /**
   * Component reactive data
   */
  data: D;

  /**
   * Root DOM element
   */
  el: HTMLElement | null;

  /**
   * Mount the component to a DOM element
   * @param target - CSS selector or HTMLElement
   */
  mount(target: string | HTMLElement): void;

  /**
   * Unmount the component from DOM
   */
  unmount(): void;

  /**
   * Update component props
   * @param newProps - New props to merge
   */
  updateProps(newProps: Partial<P>): void;

  /**
   * Force update the component
   */
  forceUpdate(): void;

  /**
   * Emit a custom event
   * @param event - Event name
   * @param args - Event arguments
   */
  emit(event: string, ...args: any[]): void;
}

/**
 * Component constructor/definition
 */
export interface Component<P = any, D = any> {
  /**
   * Component options
   */
  options: ComponentOptions<P, D>;

  /**
   * Create a component instance
   * @param props - Component props
   */
  (props?: P): ComponentInstance<P, D>;
}

/**
 * Defines a component with the given options
 * 
 * @template P - Props type
 * @template D - Data/state type
 * @param options - Component configuration options
 * @returns Component definition
 * 
 * @example
 * ```typescript
 * interface CounterProps {
 *   initialValue?: number;
 * }
 * 
 * const Counter = defineComponent<CounterProps>({
 *   name: 'Counter',
 *   props: {
 *     initialValue: { type: Number, default: 0 }
 *   },
 *   setup(props) {
 *     const count = signal(props.initialValue);
 *     const increment = () => count.value++;
 *     return { count, increment };
 *   },
 *   template: `
 *     <div>
 *       <span>{{ count }}</span>
 *       <button @click="increment">+</button>
 *     </div>
 *   `
 * });
 * ```
 */
export function defineComponent<P = any, D = any>(
  options: ComponentOptions<P, D>
): Component<P, D>;

/**
 * Creates and returns a component instance
 * 
 * @template P - Props type
 * @param component - Component definition
 * @param props - Component props
 * @returns Component instance
 * 
 * @example
 * ```typescript
 * const counter = createComponent(Counter, { initialValue: 5 });
 * counter.mount('#app');
 * ```
 */
export function createComponent<P = any>(
  component: Component<P>,
  props?: P
): ComponentInstance<P>;

/**
 * Gets the current component instance (must be called during setup)
 * 
 * @returns Current component instance
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     const instance = getCurrentInstance();
 *     console.log(instance.name);
 *   }
 * });
 * ```
 */
export function getCurrentInstance<P = any, D = any>(): ComponentInstance<P, D> | null;

/**
 * Registers a lifecycle hook
 * 
 * @param hook - Hook function
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     onMounted(() => {
 *       console.log('Component mounted!');
 *     });
 *   }
 * });
 * ```
 */
export function onMounted(hook: LifecycleHook): void;

/**
 * Registers an update lifecycle hook
 * 
 * @param hook - Hook function
 */
export function onUpdated(hook: LifecycleHook): void;

/**
 * Registers an unmount lifecycle hook
 * 
 * @param hook - Hook function
 */
export function onUnmounted(hook: LifecycleHook): void;

/**
 * Provides a value that can be injected by child components
 * 
 * @param key - Injection key
 * @param value - Value to provide
 * 
 * @example
 * ```typescript
 * const Parent = defineComponent({
 *   setup() {
 *     provide('theme', 'dark');
 *   }
 * });
 * ```
 */
export function provide<T = any>(key: string | symbol, value: T): void;

/**
 * Injects a value provided by a parent component
 * 
 * @param key - Injection key
 * @param defaultValue - Default value if not provided
 * @returns Injected value
 * 
 * @example
 * ```typescript
 * const Child = defineComponent({
 *   setup() {
 *     const theme = inject<string>('theme', 'light');
 *     return { theme };
 *   }
 * });
 * ```
 */
export function inject<T = any>(key: string | symbol, defaultValue?: T): T;

/**
 * Creates a reference to a DOM element or component
 * 
 * @returns Ref object
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     const inputRef = ref<HTMLInputElement>();
 *     
 *     onMounted(() => {
 *       inputRef.value?.focus();
 *     });
 *     
 *     return { inputRef };
 *   },
 *   template: '<input ref="inputRef" />'
 * });
 * ```
 */
export function ref<T = any>(initialValue?: T): Signal<T>;

/**
 * Marks properties as non-reactive
 * 
 * @param obj - Object to mark as non-reactive
 * @returns Non-reactive object
 */
export function markRaw<T extends object>(obj: T): T;

/**
 * Creates a shallow reactive object (only root properties are reactive)
 * 
 * @param obj - Object to make shallowly reactive
 * @returns Shallow reactive object
 */
export function shallowReactive<T extends object>(obj: T): T;
