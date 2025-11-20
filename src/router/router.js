// Router system for RxHtmx framework
// Provides client-side routing with history API support

import { signal, computed } from '../core/signal.js';
import { createComponent, mountComponent } from '../core/component.js';
import { h } from '../core/dom.js';

export class Router {
  constructor(options = {}) {
    this.routes = options.routes || [];
    this.mode = options.mode || 'history'; // 'history' or 'hash'
    this.base = options.base || '/';
    this.guards = options.guards || {};

    // Reactive state
    this.currentRoute = signal(null);
    this.isReady = signal(false);

    // Internal state
    this.currentComponent = null;
    this.container = null;
    this.beforeEachHooks = [];
    this.afterEachHooks = [];

    this.init();
  }

  init() {
    console.log('Router initialization started');
    // Set up event listeners
    if (this.mode === 'history') {
      window.addEventListener('popstate', this.handlePopState.bind(this));
    } else {
      window.addEventListener('hashchange', this.handleHashChange.bind(this));
    }

    // Initial route
    console.log('Handling initial route');
    this.handleRoute(this.getCurrentPath());
    this.isReady.value = true;
    console.log('Router initialization completed');
  }

  getCurrentPath() {
    if (this.mode === 'history') {
      return window.location.pathname + window.location.search;
    } else {
      return window.location.hash.slice(1) || '/';
    }
  }

  handlePopState() {
    this.handleRoute(this.getCurrentPath());
  }

  handleHashChange() {
    this.handleRoute(this.getCurrentPath());
  }

  async handleRoute(path) {
    console.log(`Handling route: ${path}`);
    const route = this.matchRoute(path);

    if (!route) {
      console.warn(`No route found for path: ${path}`);
      return;
    }

    // Run before guards
    console.log('Running before guards');
    const canNavigate = await this.runBeforeGuards(
      route,
      this.currentRoute.value
    );
    if (!canNavigate) {
      console.log('Navigation cancelled by before guards');
      return;
    }

    // Update current route
    const previousRoute = this.currentRoute.value;
    this.currentRoute.value = route;
    console.log(`Route updated to: ${route.path}`);

    // Mount component
    if (route.component && this.container) {
      console.log('Mounting route component');
      this.mountRouteComponent(route);
    }

    // Run after hooks
    console.log('Running after hooks');
    this.runAfterHooks(route, previousRoute);
  }

  matchRoute(path) {
    for (const routeConfig of this.routes) {
      const match = this.matchPath(path, routeConfig.path);
      if (match) {
        return {
          ...routeConfig,
          path,
          params: match.params,
          query: this.parseQuery(path),
          fullPath: path,
        };
      }
    }
    return null;
  }

  matchPath(path, pattern) {
    // Remove query string for matching
    const cleanPath = path.split('?')[0];

    // Convert pattern to regex
    const paramPattern = pattern.replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${paramPattern}$`);

    const match = cleanPath.match(regex);
    if (!match) {
      return null;
    }

    // Extract parameters
    const params = {};
    const paramNames = pattern.match(/:([^/]+)/g);
    if (paramNames) {
      paramNames.forEach((param, index) => {
        const paramName = param.slice(1); // Remove ':'
        params[paramName] = match[index + 1];
      });
    }

    return { params };
  }

  parseQuery(path) {
    const queryString = path.split('?')[1];
    if (!queryString) {
      return {};
    }

    const query = {};
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });

    return query;
  }

  async runBeforeGuards(to, from) {
    // Global before hooks
    for (const hook of this.beforeEachHooks) {
      const result = await hook(to, from);
      if (result === false) {
        return false;
      }
    }

    // Route-specific guards
    if (to.beforeEnter) {
      const guards = Array.isArray(to.beforeEnter)
        ? to.beforeEnter
        : [to.beforeEnter];
      for (const guard of guards) {
        const result = await guard(to, from);
        if (result === false) {
          return false;
        }
      }
    }

    return true;
  }

  runAfterHooks(to, from) {
    this.afterEachHooks.forEach(hook => {
      try {
        hook(to, from);
      } catch (error) {
        console.error('Error in after hook:', error);
      }
    });
  }

  mountRouteComponent(route) {
    // Unmount previous component
    if (this.currentComponent) {
      this.currentComponent.unmount();
    }

    // Mount new component
    if (route.component) {
      this.currentComponent = createComponent(route.component, {
        route,
        router: this,
      });
      mountComponent(this.currentComponent, this.container);
    }
  }

  // Navigation methods
  push(path) {
    if (this.mode === 'history') {
      window.history.pushState(null, '', path);
      this.handleRoute(path);
    } else {
      window.location.hash = path;
    }
  }

  replace(path) {
    if (this.mode === 'history') {
      window.history.replaceState(null, '', path);
      this.handleRoute(path);
    } else {
      window.location.replace(`#${path}`);
    }
  }

  go(delta) {
    window.history.go(delta);
  }

  back() {
    window.history.back();
  }

  forward() {
    window.history.forward();
  }

  // Guard registration
  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
    return () => {
      const index = this.beforeEachHooks.indexOf(hook);
      if (index > -1) {
        this.beforeEachHooks.splice(index, 1);
      }
    };
  }

  afterEach(hook) {
    this.afterEachHooks.push(hook);
    return () => {
      const index = this.afterEachHooks.indexOf(hook);
      if (index > -1) {
        this.afterEachHooks.splice(index, 1);
      }
    };
  }

  // Mount router to container
  mount(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    this.container = container;

    // Mount current route if available
    if (this.currentRoute.value) {
      this.mountRouteComponent(this.currentRoute.value);
    }
  }
}

// Router creation helper
export function createRouter(options) {
  return new Router(options);
}

// Route guards
export function authGuard(to, from) {
  // Example auth guard
  const isAuthenticated = localStorage.getItem('auth-token');
  if (!isAuthenticated && to.meta?.requiresAuth) {
    return '/login';
  }
  return true;
}

// Link component for navigation
export const RouterLink = {
  name: 'RouterLink',
  props: {
    to: { type: String, required: true },
    replace: { type: Boolean, default: false },
    tag: { type: String, default: 'a' },
  },
  setup(props, { slots }) {
    const router = getCurrentRouter();

    const navigate = event => {
      event.preventDefault();
      if (props.replace) {
        router.replace(props.to);
      } else {
        router.push(props.to);
      }
    };

    return () => {
      const Tag = props.tag;
      return h(
        Tag,
        {
          href: props.to,
          onClick: navigate,
        },
        slots.default?.()
      );
    };
  },
};

// Router view component
export const RouterView = {
  name: 'RouterView',
  setup() {
    const router = getCurrentRouter();

    return () => {
      const route = router.currentRoute.value;
      if (!route || !route.component) {
        return null;
      }

      return h(route.component, {
        route,
        router,
      });
    };
  },
};

// Current router instance
let currentRouter = null;

export function setCurrentRouter(router) {
  currentRouter = router;
}

export function getCurrentRouter() {
  return currentRouter;
}

// Composables
export function useRouter() {
  return getCurrentRouter();
}

export function useRoute() {
  const router = getCurrentRouter();
  return router ? router.currentRoute : signal(null);
}

// Utility functions
export function createRoutes(routes) {
  return routes.map(route => ({
    ...route,
    // Add any route processing here
  }));
}

export function createWebHistory(base = '/') {
  return {
    mode: 'history',
    base,
  };
}

export function createWebHashHistory() {
  return {
    mode: 'hash',
  };
}
