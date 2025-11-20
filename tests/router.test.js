// Tests for the router system
// Tests routing, navigation, guards, and history management

import { JSDOM } from 'jsdom';

// Set up DOM environment with history API
const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="app"></div></body></html>',
  {
    url: 'http://localhost:3000/',
    pretendToBeVisual: true,
    resources: 'usable',
  }
);

global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;
global.history = dom.window.history;
global.location = dom.window.location;

import {
  createRouter,
  Router,
  authGuard,
  useRouter,
  useRoute,
} from '../src/router/router.js';
import { defineComponent } from '../src/core/component.js';

describe('Router System', () => {
  let router;

  // Mock components
  const HomeComponent = defineComponent({
    name: 'Home',
    template: '<div>Home Page</div>',
  });

  const AboutComponent = defineComponent({
    name: 'About',
    template: '<div>About Page</div>',
  });

  const UserComponent = defineComponent({
    name: 'User',
    template: '<div>User {{route.params.id}}</div>',
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';

    router = createRouter({
      routes: [
        { path: '/', component: HomeComponent },
        { path: '/about', component: AboutComponent },
        { path: '/user/:id', component: UserComponent },
        {
          path: '/protected',
          component: AboutComponent,
          meta: { requiresAuth: true },
        },
      ],
    });
  });

  describe('Router creation', () => {
    test('should create router instance', () => {
      expect(router).toBeInstanceOf(Router);
      expect(router.routes).toHaveLength(4);
      expect(router.mode).toBe('history');
    });

    test('should support hash mode', () => {
      const hashRouter = createRouter({
        mode: 'hash',
        routes: [],
      });

      expect(hashRouter.mode).toBe('hash');
    });
  });

  describe('Route matching', () => {
    test('should match exact routes', () => {
      const route = router.matchRoute('/');

      expect(route).toBeDefined();
      expect(route.component).toBe(HomeComponent);
      expect(route.path).toBe('/');
    });

    test('should match parameterized routes', () => {
      const route = router.matchRoute('/user/123');

      expect(route).toBeDefined();
      expect(route.component).toBe(UserComponent);
      expect(route.params.id).toBe('123');
    });

    test('should parse query parameters', () => {
      const route = router.matchRoute('/about?tab=info&sort=name');

      expect(route).toBeDefined();
      expect(route.query.tab).toBe('info');
      expect(route.query.sort).toBe('name');
    });

    test('should return null for non-matching routes', () => {
      const route = router.matchRoute('/non-existent');

      expect(route).toBeNull();
    });
  });

  describe('Navigation', () => {
    test('should navigate to route', async () => {
      await router.handleRoute('/about');

      expect(router.currentRoute.value).toBeDefined();
      expect(router.currentRoute.value.component).toBe(AboutComponent);
    });

    test('should support push navigation', () => {
      const pushStateSpy = jest
        .spyOn(window.history, 'pushState')
        .mockImplementation();

      router.push('/about');

      expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/about');

      pushStateSpy.mockRestore();
    });

    test('should support replace navigation', () => {
      const replaceStateSpy = jest
        .spyOn(window.history, 'replaceState')
        .mockImplementation();

      router.replace('/about');

      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/about');

      replaceStateSpy.mockRestore();
    });

    test('should support back navigation', () => {
      const backSpy = jest.spyOn(window.history, 'back').mockImplementation();

      router.back();

      expect(backSpy).toHaveBeenCalled();

      backSpy.mockRestore();
    });
  });

  describe('Route guards', () => {
    test('should run before guards', async () => {
      const guard = jest.fn().mockResolvedValue(true);

      router.beforeEach(guard);
      await router.handleRoute('/about');

      expect(guard).toHaveBeenCalled();
    });

    test('should block navigation when guard returns false', async () => {
      const guard = jest.fn().mockResolvedValue(false);
      const currentRoute = router.currentRoute.value;

      router.beforeEach(guard);
      await router.handleRoute('/about');

      // Route should not have changed
      expect(router.currentRoute.value).toBe(currentRoute);
    });

    test('should support route-specific guards', async () => {
      const routeGuard = jest.fn().mockResolvedValue(true);

      const routerWithGuards = createRouter({
        routes: [
          {
            path: '/protected',
            component: AboutComponent,
            beforeEnter: routeGuard,
          },
        ],
      });

      await routerWithGuards.handleRoute('/protected');

      expect(routeGuard).toHaveBeenCalled();
    });

    test('should run after hooks', async () => {
      const afterHook = jest.fn();

      router.afterEach(afterHook);
      await router.handleRoute('/about');

      expect(afterHook).toHaveBeenCalled();
    });
  });

  describe('Auth guard', () => {
    test('should allow access when authenticated', () => {
      localStorage.setItem('auth-token', 'valid-token');

      const result = authGuard({ meta: { requiresAuth: true } }, null);

      expect(result).toBe(true);

      localStorage.removeItem('auth-token');
    });

    test('should redirect when not authenticated', () => {
      localStorage.removeItem('auth-token');

      const result = authGuard({ meta: { requiresAuth: true } }, null);

      expect(result).toBe('/login');
    });

    test('should allow access for non-protected routes', () => {
      localStorage.removeItem('auth-token');

      const result = authGuard({ meta: {} }, null);

      expect(result).toBe(true);
    });
  });

  describe('Router mounting', () => {
    test('should mount router to container', () => {
      const container = document.getElementById('app');

      router.mount(container);

      expect(router.container).toBe(container);
    });

    test('should mount current route component when mounted', async () => {
      const container = document.getElementById('app');

      await router.handleRoute('/');
      router.mount(container);

      expect(router.currentComponent).toBeDefined();
    });
  });

  describe('Hash mode', () => {
    test('should handle hash changes', () => {
      const hashRouter = createRouter({
        mode: 'hash',
        routes: [{ path: '/', component: HomeComponent }],
      });

      // Simulate hash change
      window.location.hash = '#/about';
      const path = hashRouter.getCurrentPath();

      expect(path).toBe('/about');
    });
  });

  describe('Composables', () => {
    test('useRouter should return current router', () => {
      // Mock current router
      const { setCurrentRouter } = require('../src/router/router.js');
      setCurrentRouter(router);

      const routerInstance = useRouter();
      expect(routerInstance).toBe(router);
    });

    test('useRoute should return current route signal', () => {
      const { setCurrentRouter } = require('../src/router/router.js');
      setCurrentRouter(router);

      const route = useRoute();
      expect(route).toBe(router.currentRoute);
    });
  });
});
