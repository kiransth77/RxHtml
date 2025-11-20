// Component system for RxHtmx framework
// Provides component definition, lifecycle management, and rendering

import {
  signal,
  computed,
  effect,
  isSignal,
  setCurrentComponentInstance,
} from './signal.js';
import { render, h } from './dom.js';

// Component registry
const componentRegistry = new Map();

// Current component instance during setup
let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

export class Component {
  constructor(definition, props = {}, parent = null) {
    this.definition = definition;
    this.props = this.processProps(props);
    this.parent = parent;
    this.children = [];
    this.element = null;
    this.isMounted = false;
    this.isUnmounted = false;
    this.effects = [];
    this.setupResult = null;
    this.renderFn = null;

    // Lifecycle hooks
    this.hooks = {
      beforeMount: [],
      mounted: [],
      beforeUpdate: [],
      updated: [],
      beforeUnmount: [],
      unmounted: [],
    };

    this.setup();
  }

  processProps(rawProps) {
    const { props: propDefinitions = {} } = this.definition;
    const processedProps = {};

    // Process each prop definition
    for (const [key, definition] of Object.entries(propDefinitions)) {
      const {
        type,
        default: defaultValue,
        required = false,
        validator,
      } = definition;
      const value = rawProps[key];

      if (value === undefined) {
        if (required) {
          console.warn(`Required prop '${key}' is missing`);
        }
        processedProps[key] =
          typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      } else {
        // Type checking
        if (type && !this.validateType(value, type)) {
          console.warn(
            `Prop '${key}' expected ${type.name}, got ${typeof value}`
          );
        }

        // Custom validation
        if (validator && !validator(value)) {
          console.warn(`Prop '${key}' validation failed`);
        }

        processedProps[key] = value;
      }
    }

    return processedProps;
  }

  validateType(value, type) {
    if (type === String) return typeof value === 'string';
    if (type === Number) return typeof value === 'number';
    if (type === Boolean) return typeof value === 'boolean';
    if (type === Array) return Array.isArray(value);
    if (type === Object) return typeof value === 'object' && value !== null;
    if (type === Function) return typeof value === 'function';
    return value instanceof type;
  }

  setup() {
    const prevInstance = currentInstance;
    currentInstance = this;

    // Set component instance for effect tracking
    setCurrentComponentInstance(this);

    try {
      if (this.definition.setup) {
        this.setupResult = this.definition.setup(this.props, {
          emit: this.emit.bind(this),
          slots: this.slots || {},
          expose: this.expose.bind(this),
        });
      }

      // Create render function
      if (this.definition.template) {
        this.renderFn = this.compileTemplate(this.definition.template);
      } else if (this.definition.render) {
        this.renderFn = this.definition.render;
      }
    } finally {
      setCurrentComponentInstance(prevInstance);
      currentInstance = prevInstance;
    }
  }

  compileTemplate(template) {
    // Simple template compilation (in a real implementation, this would be more sophisticated)
    return () => {
      let html = template;

      // Replace {{expression}} with values
      html = html.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
        try {
          const value = this.evaluateExpression(expression.trim());
          return String(value);
        } catch (e) {
          console.warn(`Error evaluating expression: ${expression}`, e);
          return match;
        }
      });

      // Create DOM element from HTML
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      const element = wrapper.firstElementChild;

      // Handle event directives like @click
      this.bindEventDirectives(element);

      return element;
    };
  }

  bindEventDirectives(element) {
    // Find all elements with event directives
    const allElements = [element, ...element.querySelectorAll('*')];

    allElements.forEach(el => {
      Array.from(el.attributes || []).forEach(attr => {
        if (attr.name.startsWith('@')) {
          const eventName = attr.name.slice(1);
          const handlerExpression = attr.value;
          const context = { ...this.setupResult, ...this.props };

          // Check if it's a function call with parameters
          if (
            handlerExpression.includes('(') &&
            handlerExpression.includes(')')
          ) {
            // Parse function call: functionName(params)
            const functionName = handlerExpression.split('(')[0];
            const paramsString = handlerExpression.slice(
              functionName.length + 1,
              -1
            );

            if (
              context[functionName] &&
              typeof context[functionName] === 'function'
            ) {
              el.addEventListener(eventName, event => {
                try {
                  // Evaluate parameters (simple string literals for now)
                  const params = paramsString
                    ? paramsString.split(',').map(param => {
                        param = param.trim();
                        // Handle string literals
                        if (
                          (param.startsWith('"') && param.endsWith('"')) ||
                          (param.startsWith("'") && param.endsWith("'"))
                        ) {
                          return param.slice(1, -1);
                        }
                        // Handle numbers
                        if (!isNaN(param)) {
                          return Number(param);
                        }
                        // Handle variables from context
                        return context[param];
                      })
                    : [];

                  context[functionName](...params);
                } catch (e) {
                  console.error('Error executing event handler:', e);
                }
              });
            }
          } else {
            // Simple function reference
            if (
              context[handlerExpression] &&
              typeof context[handlerExpression] === 'function'
            ) {
              el.addEventListener(eventName, context[handlerExpression]);
            }
          }

          // Remove the directive attribute
          el.removeAttribute(attr.name);
        }
      });
    });
  }

  evaluateExpression(expression) {
    // Simple expression evaluation (would be more robust in real implementation)
    const context = { ...this.setupResult, ...this.props };

    try {
      // Handle nested property access (e.g., route.params.id)
      const parts = expression.split('.');
      let value = context;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (value && typeof value === 'object' && part in value) {
          value = value[part];

          // Unwrap signals for intermediate steps in property access
          // but be careful to let the final access be tracked by effects
          if (isSignal(value) && i < parts.length - 1) {
            value = value.value;
          }
        } else {
          // If property doesn't exist, return the original expression
          return expression;
        }
      }

      // Final unwrapping: if the final value is a signal, access its value
      // This ensures the access is tracked by any active effect
      if (isSignal(value)) {
        const result = value.value;
        return result;
      }

      return value;
    } catch (e) {
      // Handle method calls
      if (expression.includes('(') && expression.includes(')')) {
        const methodName = expression.split('(')[0];
        if (context[methodName] && typeof context[methodName] === 'function') {
          return context[methodName]();
        }
      }

      return expression;
    }
  }

  mount(container) {
    if (this.isMounted) return;

    this.runHooks('beforeMount');

    if (this.renderFn) {
      let isInitialRender = true;

      // Create render effect
      const renderEffect = effect(() => {
        const vnode = this.renderFn();

        if (isInitialRender) {
          // Initial render
          this.element = vnode;
          container.appendChild(vnode);
          isInitialRender = false;
        } else if (this.element && this.element.parentNode) {
          // Update render - efficiently update the existing element instead of replacing
          this.updateElement(this.element, vnode);
        }
      });

      this.effects.push(renderEffect);
    }

    this.isMounted = true;
    this.runHooks('mounted');
  }

  updateElement(existing, newElement) {
    // Simple DOM diffing - in practice this would be more sophisticated
    if (existing.tagName !== newElement.tagName) {
      existing.parentNode.replaceChild(newElement, existing);
      this.element = newElement;
      return;
    }

    // Update text content and attributes
    if (existing.textContent !== newElement.textContent) {
      // Only update text nodes, preserve structure for elements with children
      if (existing.children.length === 0 && newElement.children.length === 0) {
        existing.textContent = newElement.textContent;
      } else {
        // Update children
        this.updateChildren(existing, newElement);
      }
    }

    // Update attributes
    Array.from(newElement.attributes || []).forEach(attr => {
      if (existing.getAttribute(attr.name) !== attr.value) {
        existing.setAttribute(attr.name, attr.value);
      }
    });
  }

  updateChildren(existing, newElement) {
    const existingChildren = Array.from(existing.children);
    const newChildren = Array.from(newElement.children);

    // Simple approach: update text content of matching elements
    for (
      let i = 0;
      i < Math.max(existingChildren.length, newChildren.length);
      i++
    ) {
      if (i < existingChildren.length && i < newChildren.length) {
        if (existingChildren[i].tagName === newChildren[i].tagName) {
          if (existingChildren[i].children.length === 0) {
            existingChildren[i].textContent = newChildren[i].textContent;
          } else {
            this.updateChildren(existingChildren[i], newChildren[i]);
          }
        }
      }
    }
  }

  unmount() {
    if (this.isUnmounted) return;

    this.runHooks('beforeUnmount');

    // Clean up effects
    this.effects.forEach(effect => effect.stop());
    this.effects.length = 0;

    // Remove from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.isUnmounted = true;
    this.runHooks('unmounted');
  }

  runHooks(hookName) {
    this.hooks[hookName].forEach(hook => hook.call(this));
  }

  emit(eventName, payload) {
    // Emit events to parent component
    if (this.parent && this.parent.handleEvent) {
      this.parent.handleEvent(eventName, payload);
    }
  }

  expose(api) {
    // Expose API for parent component access
    this.exposedAPI = api;
  }
}

// Component definition helper
export function defineComponent(definition) {
  if (definition.name) {
    componentRegistry.set(definition.name, definition);
  }
  return definition;
}

// Lifecycle hooks
export function onBeforeMount(fn) {
  if (currentInstance) {
    currentInstance.hooks.beforeMount.push(fn);
  }
}

export function onMounted(fn) {
  if (currentInstance) {
    currentInstance.hooks.mounted.push(fn);
  }
}

export function onBeforeUpdate(fn) {
  if (currentInstance) {
    currentInstance.hooks.beforeUpdate.push(fn);
  }
}

export function onUpdated(fn) {
  if (currentInstance) {
    currentInstance.hooks.updated.push(fn);
  }
}

export function onBeforeUnmount(fn) {
  if (currentInstance) {
    currentInstance.hooks.beforeUnmount.push(fn);
  }
}

export function onUnmounted(fn) {
  if (currentInstance) {
    currentInstance.hooks.unmounted.push(fn);
  }
}

// Component creation helper
export function createComponent(definition, props = {}, parent = null) {
  return new Component(definition, props, parent);
}

// Mount component to DOM
export function mountComponent(component, container) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  if (!container) {
    throw new Error('Mount container not found');
  }

  component.mount(container);
  return component;
}

// Application creation
export function createApp(rootComponent, props = {}) {
  const app = {
    component: null,

    mount(container) {
      this.component = createComponent(rootComponent, props);
      return mountComponent(this.component, container);
    },

    unmount() {
      if (this.component) {
        this.component.unmount();
        this.component = null;
      }
    },
  };

  return app;
}

// Get registered component
export function getComponent(name) {
  return componentRegistry.get(name);
}

// Directive system (simple implementation)
const directives = new Map();

export function registerDirective(name, directive) {
  directives.set(name, directive);
}

export function getDirective(name) {
  return directives.get(name);
}

// Built-in directives
registerDirective('if', {
  mounted(el, binding) {
    if (!binding.value) {
      el.style.display = 'none';
    }
  },
  updated(el, binding) {
    el.style.display = binding.value ? '' : 'none';
  },
});

registerDirective('show', {
  mounted(el, binding) {
    el.style.display = binding.value ? '' : 'none';
  },
  updated(el, binding) {
    el.style.display = binding.value ? '' : 'none';
  },
});
