/**
 * Type definitions for RxHtml Router
 * Provides client-side routing capabilities
 */

import { Component, ComponentInstance } from './component';
import { Signal } from './signal';

/**
 * Route location object
 */
export interface RouteLocation {
  /**
   * Current route path
   */
  path: string;

  /**
   * Route parameters (e.g., { id: '123' } for /user/:id)
   */
  params: Record<string, string>;

  /**
   * Query parameters (e.g., { search: 'term' } for ?search=term)
   */
  query: Record<string, string | string[]>;

  /**
   * URL hash
   */
  hash: string;

  /**
   * Full path including query and hash
   */
  fullPath: string;

  /**
   * Matched route record
   */
  matched: RouteRecord[];

  /**
   * Route metadata
   */
  meta: Record<string, any>;

  /**
   * Route name
   */
  name?: string | symbol;
}

/**
 * Route record configuration
 */
export interface RouteRecord {
  /**
   * Route path pattern (e.g., '/user/:id')
   */
  path: string;

  /**
   * Route name for navigation
   */
  name?: string | symbol;

  /**
   * Component to render for this route
   */
  component?: Component | (() => Promise<Component>);

  /**
   * Redirect to another route
   */
  redirect?: string | RouteLocation | ((to: RouteLocation) => string | RouteLocation);

  /**
   * Route-level navigation guard
   */
  beforeEnter?: NavigationGuard | NavigationGuard[];

  /**
   * Nested child routes
   */
  children?: RouteRecord[];

  /**
   * Route metadata
   */
  meta?: Record<string, any>;

  /**
   * Props to pass to component
   */
  props?: boolean | Record<string, any> | ((route: RouteLocation) => Record<string, any>);

  /**
   * Case-sensitive path matching
   */
  caseSensitive?: boolean;

  /**
   * Alias paths for this route
   */
  alias?: string | string[];
}

/**
 * Navigation guard result
 */
export type NavigationGuardReturn = void | boolean | RouteLocation | string;

/**
 * Navigation guard function
 */
export type NavigationGuard = (
  to: RouteLocation,
  from: RouteLocation,
  next?: (guard?: NavigationGuardReturn) => void
) => NavigationGuardReturn | Promise<NavigationGuardReturn>;

/**
 * Navigation failure types
 */
export enum NavigationFailureType {
  /**
   * Navigation was aborted by a navigation guard
   */
  aborted = 'aborted',

  /**
   * Navigation was cancelled by a new navigation
   */
  cancelled = 'cancelled',

  /**
   * Navigation failed with an error
   */
  duplicated = 'duplicated',
}

/**
 * Navigation failure error
 */
export interface NavigationFailure extends Error {
  type: NavigationFailureType;
  from: RouteLocation;
  to: RouteLocation;
}

/**
 * Router configuration options
 */
export interface RouterOptions {
  /**
   * Array of route records
   */
  routes: RouteRecord[];

  /**
   * History mode (defaults to 'hash')
   */
  mode?: 'hash' | 'history';

  /**
   * Base path for the router
   */
  base?: string;

  /**
   * Function to scroll to position on navigation
   */
  scrollBehavior?: (
    to: RouteLocation,
    from: RouteLocation,
    savedPosition: { x: number; y: number } | null
  ) => { x: number; y: number } | Promise<{ x: number; y: number }>;

  /**
   * Link active class name
   */
  linkActiveClass?: string;

  /**
   * Link exact active class name
   */
  linkExactActiveClass?: string;
}

/**
 * Router instance
 */
export interface Router {
  /**
   * Current route location (reactive)
   */
  currentRoute: Signal<RouteLocation>;

  /**
   * All registered routes
   */
  routes: RouteRecord[];

  /**
   * Navigate to a new location
   * 
   * @param to - Path or route location object
   * @returns Promise that resolves when navigation is complete
   */
  push(to: string | RouteLocation): Promise<void | NavigationFailure>;

  /**
   * Replace current location without adding to history
   * 
   * @param to - Path or route location object
   * @returns Promise that resolves when navigation is complete
   */
  replace(to: string | RouteLocation): Promise<void | NavigationFailure>;

  /**
   * Go back in history
   */
  back(): void;

  /**
   * Go forward in history
   */
  forward(): void;

  /**
   * Navigate to a specific history position
   * 
   * @param n - Number of steps to move (negative for backwards)
   */
  go(n: number): void;

  /**
   * Register a global before navigation guard
   * 
   * @param guard - Navigation guard function
   * @returns Function to remove the guard
   */
  beforeEach(guard: NavigationGuard): () => void;

  /**
   * Register a global after navigation guard
   * 
   * @param guard - Navigation guard function
   * @returns Function to remove the guard
   */
  afterEach(
    guard: (to: RouteLocation, from: RouteLocation) => void
  ): () => void;

  /**
   * Register a global error handler
   * 
   * @param handler - Error handler function
   * @returns Function to remove the handler
   */
  onError(handler: (error: Error) => void): () => void;

  /**
   * Check if a location matches a route
   * 
   * @param location - Location to check
   * @param route - Route to match against
   * @returns True if location matches route
   */
  isReady(): Promise<void>;

  /**
   * Add a route dynamically
   * 
   * @param route - Route record to add
   */
  addRoute(route: RouteRecord): void;

  /**
   * Remove a route by name
   * 
   * @param name - Name of route to remove
   */
  removeRoute(name: string | symbol): void;

  /**
   * Check if a route with given name exists
   * 
   * @param name - Route name to check
   * @returns True if route exists
   */
  hasRoute(name: string | symbol): boolean;

  /**
   * Get all route records
   * 
   * @returns Array of route records
   */
  getRoutes(): RouteRecord[];

  /**
   * Resolve a location to a route location
   * 
   * @param to - Path or location object
   * @returns Resolved route location
   */
  resolve(to: string | RouteLocation): RouteLocation;

  /**
   * Mount router to a DOM element
   * 
   * @param target - CSS selector or HTMLElement
   */
  mount(target: string | HTMLElement): void;

  /**
   * Unmount router
   */
  unmount(): void;
}

/**
 * Creates a router instance
 * 
 * @param options - Router configuration options
 * @returns Router instance
 * 
 * @example
 * ```typescript
 * const router = createRouter({
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About },
 *     { path: '/user/:id', component: UserProfile }
 *   ]
 * });
 * 
 * router.mount('#app');
 * ```
 */
export function createRouter(options: RouterOptions): Router;

/**
 * Gets the current router instance (must be called during component setup)
 * 
 * @returns Current router instance
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     const router = useRouter();
 *     
 *     const goToAbout = () => {
 *       router.push('/about');
 *     };
 *     
 *     return { goToAbout };
 *   }
 * });
 * ```
 */
export function useRouter(): Router;

/**
 * Gets the current route location (reactive)
 * 
 * @returns Current route location signal
 * 
 * @example
 * ```typescript
 * const MyComponent = defineComponent({
 *   setup() {
 *     const route = useRoute();
 *     
 *     effect(() => {
 *       console.log('Current path:', route.value.path);
 *     });
 *     
 *     return { route };
 *   }
 * });
 * ```
 */
export function useRoute(): Signal<RouteLocation>;

/**
 * Creates a router link component
 * 
 * @param to - Target route location
 * @param options - Link options
 * @returns Link component
 * 
 * @example
 * ```typescript
 * const link = RouterLink({ 
 *   to: '/about',
 *   activeClass: 'active'
 * });
 * ```
 */
export function RouterLink(props: {
  to: string | RouteLocation;
  replace?: boolean;
  activeClass?: string;
  exactActiveClass?: string;
}): Component;

/**
 * Router view component that renders matched routes
 * 
 * @example
 * ```typescript
 * const App = defineComponent({
 *   template: `
 *     <div>
 *       <nav>...</nav>
 *       <RouterView />
 *     </div>
 *   `
 * });
 * ```
 */
export const RouterView: Component;
