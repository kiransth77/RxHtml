/**
 * Type definitions for RxHtml Signal System
 * Provides reactive primitives for building reactive applications
 */

/**
 * A reactive signal that holds a value and notifies subscribers when it changes
 */
export interface Signal<T = any> {
  /**
   * The current value of the signal
   * Setting this property triggers all dependent effects and computations
   */
  value: T;

  /**
   * Subscribe to changes in the signal value
   * @param callback - Function called when the signal value changes
   * @returns Unsubscribe function
   */
  subscribe(callback: (value: T) => void): () => void;

  /**
   * Unsubscribe all listeners and cleanup resources
   */
  unsubscribe?(): void;
}

/**
 * A computed signal that automatically updates based on other signals
 */
export interface ComputedSignal<T = any> extends Signal<T> {
  /**
   * The computed value (read-only)
   */
  readonly value: T;
}

/**
 * Effect cleanup function
 */
export type EffectCleanup = () => void;

/**
 * Effect function that runs when dependencies change
 */
export type EffectFunction = () => void | EffectCleanup;

/**
 * Computed value function
 */
export type ComputedFunction<T> = () => T;

/**
 * Batch update function
 */
export type BatchFunction = () => void;

/**
 * Creates a reactive signal with the given initial value
 * 
 * @template T - The type of the signal value
 * @param initialValue - The initial value of the signal
 * @returns A reactive signal object
 * 
 * @example
 * ```typescript
 * const count = signal<number>(0);
 * count.value = 5; // Updates all dependent computations
 * console.log(count.value); // 5
 * ```
 */
export function signal<T = any>(initialValue: T): Signal<T>;

/**
 * Creates a computed signal that automatically recalculates when dependencies change
 * 
 * @template T - The type of the computed value
 * @param fn - Function that computes the value based on other signals
 * @returns A read-only computed signal
 * 
 * @example
 * ```typescript
 * const count = signal(5);
 * const doubled = computed(() => count.value * 2);
 * console.log(doubled.value); // 10
 * 
 * count.value = 10;
 * console.log(doubled.value); // 20
 * ```
 */
export function computed<T = any>(fn: ComputedFunction<T>): ComputedSignal<T>;

/**
 * Creates a side effect that runs when its signal dependencies change
 * 
 * @param fn - Effect function that runs when dependencies change
 * @returns Cleanup function to stop the effect
 * 
 * @example
 * ```typescript
 * const count = signal(0);
 * 
 * const dispose = effect(() => {
 *   console.log('Count is:', count.value);
 * });
 * 
 * count.value = 1; // Logs: Count is: 1
 * count.value = 2; // Logs: Count is: 2
 * 
 * dispose(); // Stop the effect
 * ```
 */
export function effect(fn: EffectFunction): EffectCleanup;

/**
 * Batches multiple signal updates into a single notification cycle
 * Improves performance when updating multiple signals at once
 * 
 * @param fn - Function containing signal updates to batch
 * 
 * @example
 * ```typescript
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 * 
 * effect(() => {
 *   console.log(`${firstName.value} ${lastName.value}`);
 * });
 * 
 * // Without batch: logs twice
 * firstName.value = 'Jane';
 * lastName.value = 'Smith';
 * 
 * // With batch: logs once
 * batch(() => {
 *   firstName.value = 'Jane';
 *   lastName.value = 'Smith';
 * });
 * ```
 */
export function batch(fn: BatchFunction): void;

/**
 * Creates a reactive object where all properties are signals
 * 
 * @template T - The type of the reactive object
 * @param obj - Object to make reactive
 * @returns Reactive object with signal properties
 * 
 * @example
 * ```typescript
 * const state = reactive({
 *   count: 0,
 *   name: 'John'
 * });
 * 
 * effect(() => {
 *   console.log(`${state.name}: ${state.count}`);
 * });
 * 
 * state.count++; // Triggers effect
 * state.name = 'Jane'; // Triggers effect
 * ```
 */
export function reactive<T extends object>(obj: T): T;

/**
 * Checks if a value is a signal
 * 
 * @param value - Value to check
 * @returns True if the value is a signal
 * 
 * @example
 * ```typescript
 * const count = signal(0);
 * const notSignal = 5;
 * 
 * console.log(isSignal(count)); // true
 * console.log(isSignal(notSignal)); // false
 * ```
 */
export function isSignal(value: any): value is Signal;

/**
 * Unwraps a signal to get its raw value
 * If the value is not a signal, returns it as-is
 * 
 * @template T - The type of the value
 * @param value - Signal or raw value
 * @returns The unwrapped value
 * 
 * @example
 * ```typescript
 * const count = signal(5);
 * console.log(unref(count)); // 5
 * console.log(unref(10)); // 10
 * ```
 */
export function unref<T>(value: Signal<T> | T): T;
