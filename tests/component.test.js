// Tests for the component system
// Tests component lifecycle, props, events, and rendering

import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="app"></div></body></html>'
);
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;

import {
  defineComponent,
  createComponent,
  mountComponent,
  createApp,
  onMounted,
  onUnmounted,
} from '../src/core/component.js';
import { signal } from '../src/core/signal.js';

describe('Component System', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  describe('defineComponent()', () => {
    test('should create component definition', () => {
      const definition = defineComponent({
        name: 'TestComponent',
        setup() {
          return { message: 'Hello' };
        },
      });

      expect(definition.name).toBe('TestComponent');
      expect(typeof definition.setup).toBe('function');
    });
  });

  describe('Component creation and mounting', () => {
    test('should create and mount component', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          const message = signal('Hello World');
          return { message };
        },
        template: '<div>{{message}}</div>',
      });

      const component = createComponent(TestComponent);
      const container = document.getElementById('app');

      mountComponent(component, container);

      expect(component.isMounted).toBe(true);
    });

    test('should handle props correctly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        props: {
          title: { type: String, required: true },
          count: { type: Number, default: 0 },
        },
        setup(props) {
          return { props };
        },
      });

      const component = createComponent(TestComponent, {
        title: 'Test Title',
        count: 5,
      });

      expect(component.props.title).toBe('Test Title');
      expect(component.props.count).toBe(5);
    });

    test('should use default props when not provided', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        props: {
          message: { type: String, default: 'Default Message' },
          count: { type: Number, default: 10 },
        },
        setup(props) {
          return { props };
        },
      });

      const component = createComponent(TestComponent, {});

      expect(component.props.message).toBe('Default Message');
      expect(component.props.count).toBe(10);
    });

    test('should validate prop types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const TestComponent = defineComponent({
        name: 'TestComponent',
        props: {
          count: { type: Number, required: true },
        },
        setup(props) {
          return { props };
        },
      });

      const component = createComponent(TestComponent, {
        count: 'invalid', // Wrong type
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Prop 'count' expected Number")
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Lifecycle hooks', () => {
    test('should call mounted hook', () => {
      const mountedHook = jest.fn();

      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          onMounted(mountedHook);
          return {};
        },
        template: '<div>Test</div>',
      });

      const component = createComponent(TestComponent);
      const container = document.getElementById('app');

      mountComponent(component, container);

      expect(mountedHook).toHaveBeenCalled();
    });

    test('should call unmounted hook', () => {
      const unmountedHook = jest.fn();

      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          onUnmounted(unmountedHook);
          return {};
        },
        template: '<div>Test</div>',
      });

      const component = createComponent(TestComponent);
      const container = document.getElementById('app');

      mountComponent(component, container);
      component.unmount();

      expect(unmountedHook).toHaveBeenCalled();
    });
  });

  describe('createApp()', () => {
    test('should create app instance', () => {
      const RootComponent = defineComponent({
        name: 'App',
        template: '<div>App</div>',
      });

      const app = createApp(RootComponent);

      expect(app).toBeDefined();
      expect(typeof app.mount).toBe('function');
      expect(typeof app.unmount).toBe('function');
    });

    test('should mount app to container', () => {
      const RootComponent = defineComponent({
        name: 'App',
        setup() {
          const message = signal('Hello App');
          return { message };
        },
        template: '<div>{{message}}</div>',
      });

      const app = createApp(RootComponent);
      const container = document.getElementById('app');

      app.mount(container);

      expect(app.component).toBeDefined();
      expect(app.component.isMounted).toBe(true);
    });

    test('should unmount app', () => {
      const RootComponent = defineComponent({
        name: 'App',
        template: '<div>App</div>',
      });

      const app = createApp(RootComponent);
      const container = document.getElementById('app');

      app.mount(container);
      app.unmount();

      expect(app.component).toBeNull();
    });
  });

  describe('Component events', () => {
    test('should emit events to parent', () => {
      const eventHandler = jest.fn();

      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        setup(props, { emit }) {
          const handleClick = () => {
            emit('customEvent', 'test data');
          };
          return { handleClick };
        },
        template: '<button @click="handleClick">Click</button>',
      });

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        setup() {
          return { eventHandler };
        },
        template: '<ChildComponent @customEvent="eventHandler" />',
      });

      // This would need more sophisticated component rendering to test properly
      // For now, we test the emit mechanism directly
      const child = createComponent(
        ChildComponent,
        {},
        {
          handleEvent: eventHandler,
        }
      );

      child.emit('customEvent', 'test data');
      expect(eventHandler).toHaveBeenCalledWith('customEvent', 'test data');
    });
  });

  describe('Template compilation', () => {
    test('should interpolate expressions', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          const message = signal('Hello World');
          const count = signal(42);
          return { message, count };
        },
        template: '<div>{{message}} - {{count}}</div>',
      });

      const component = createComponent(TestComponent);

      // Test expression evaluation
      expect(component.evaluateExpression('message')).toBe('Hello World');
      expect(component.evaluateExpression('count')).toBe(42);
    });

    test('should handle method calls in templates', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          const count = signal(5);
          const doubleCount = () => count.value * 2;
          return { count, doubleCount };
        },
        template: '<div>{{doubleCount()}}</div>',
      });

      const component = createComponent(TestComponent);

      expect(component.evaluateExpression('doubleCount()')).toBe(10);
    });
  });
});
