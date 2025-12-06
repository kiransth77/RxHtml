let activeEffect = null;
let currentComponentInstance = null;
function setCurrentComponentInstance(instance) {
  currentComponentInstance = instance;
}
const updateQueue = /* @__PURE__ */ new Set();
let isBatching = false;
function queueUpdate(effect2) {
  if (isBatching) {
    updateQueue.add(effect2);
  } else {
    if (effect2 && typeof effect2.run === "function") {
      effect2.run();
    } else if (typeof effect2 === "function") {
      effect2();
    }
  }
}
function signal$1(initialValue) {
  let _value = initialValue;
  const subscribers = /* @__PURE__ */ new Set();
  const sig = {
    get value() {
      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.deps.add(sig);
      }
      return _value;
    },
    set value(newValue) {
      if (_value !== newValue) {
        _value = newValue;
        const currentSubscribers = Array.from(subscribers);
        currentSubscribers.forEach((subscriber) => {
          if (subscriber && typeof subscriber.run === "function") {
            queueUpdate(subscriber);
          } else if (typeof subscriber === "function") {
            subscriber(newValue);
          }
        });
      }
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    // Internal methods for the effect system
    _addSubscriber(effect2) {
      subscribers.add(effect2);
    },
    _removeSubscriber(effect2) {
      subscribers.delete(effect2);
    }
  };
  return sig;
}
function computed(fn) {
  let _value;
  let _dirty = true;
  let _computing = false;
  const dependencies = /* @__PURE__ */ new Set();
  const subscribers = /* @__PURE__ */ new Set();
  const computedSignal = {
    get value() {
      if (_computing) {
        console.warn("Computed recursion detected, returning cached value");
        return _value;
      }
      if (_dirty) {
        _computing = true;
        try {
          dependencies.forEach((dep) => {
            dep._removeSubscriber(computedSignal);
          });
          dependencies.clear();
          const prevEffect = activeEffect;
          activeEffect = {
            deps: dependencies,
            run: () => {
              _dirty = true;
              const currentSubscribers = Array.from(subscribers);
              currentSubscribers.forEach((effect2) => {
                queueUpdate(effect2);
              });
            }
          };
          try {
            _value = fn();
            _dirty = false;
            dependencies.forEach((dep) => {
              dep._addSubscriber(activeEffect);
            });
          } finally {
            activeEffect = prevEffect;
          }
        } finally {
          _computing = false;
        }
      }
      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.deps.add(computedSignal);
      }
      return _value;
    },
    _addSubscriber(effect2) {
      subscribers.add(effect2);
    },
    _removeSubscriber(effect2) {
      subscribers.delete(effect2);
    }
  };
  return computedSignal;
}
function effect(fn, options = {}) {
  const { immediate = true } = options;
  const deps = /* @__PURE__ */ new Set();
  let isActive = true;
  const effectInstance = {
    run() {
      if (!isActive)
        return;
      deps.forEach((dep) => dep._removeSubscriber(effectInstance));
      deps.clear();
      const prevEffect = activeEffect;
      activeEffect = effectInstance;
      effectInstance.deps = deps;
      try {
        return fn();
      } finally {
        activeEffect = prevEffect;
      }
    },
    stop() {
      isActive = false;
      deps.forEach((dep) => dep._removeSubscriber(effectInstance));
      deps.clear();
    },
    deps
  };
  if (currentComponentInstance) {
    currentComponentInstance.effects.push(effectInstance);
  }
  if (immediate) {
    effectInstance.run();
  }
  return effectInstance;
}
function batch(fn) {
  const wasBatching = isBatching;
  isBatching = true;
  try {
    fn();
  } finally {
    isBatching = wasBatching;
    if (!isBatching) {
      flushUpdates();
    }
  }
}
function flushUpdates() {
  const effects = Array.from(updateQueue);
  updateQueue.clear();
  effects.forEach((effect2) => {
    if (typeof effect2.run === "function") {
      effect2.run();
    }
  });
}
function watch(source, callback, options = {}) {
  const { immediate = false } = options;
  let oldValue;
  let isFirst = true;
  return effect(
    () => {
      const newValue = source.value;
      if (!isFirst || immediate) {
        callback(newValue, oldValue);
      }
      oldValue = newValue;
      isFirst = false;
    },
    { immediate: true }
    // Effect should always run immediately to set up tracking
  );
}
function reactive(target) {
  if (typeof target !== "object" || target === null) {
    return target;
  }
  const reactiveTarget = {};
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      const sig = signal$1(target[key]);
      Object.defineProperty(reactiveTarget, key, {
        get() {
          return sig.value;
        },
        set(value) {
          sig.value = value;
        },
        enumerable: true,
        configurable: true
      });
    }
  }
  return reactiveTarget;
}
function ref(value) {
  return signal$1(value);
}
function isSignal(value) {
  return value && typeof value === "object" && "value" in value && ("subscribe" in value || "_addSubscriber" in value);
}
class VNode {
  constructor(tag, props = {}, children = []) {
    this.tag = tag;
    this.props = props;
    this.children = Array.isArray(children) ? children : [children];
    this.element = null;
    this.key = props.key || null;
  }
}
function h(tag, props = {}, ...children) {
  return new VNode(tag, props, children.flat());
}
function text(content) {
  return new VNode("#text", {}, [String(content)]);
}
function fragment(...children) {
  return new VNode("#fragment", {}, children.flat());
}
function render(vnode, container) {
  if (container._vnode) {
    patch(container._vnode, vnode, container);
  } else {
    mount(vnode, container);
  }
  container._vnode = vnode;
}
function mount(vnode, container) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    const textNode = document.createTextNode(vnode);
    container.appendChild(textNode);
    return textNode;
  }
  if (vnode.tag === "#text") {
    const textNode = document.createTextNode(vnode.children[0] || "");
    vnode.element = textNode;
    container.appendChild(textNode);
    return textNode;
  }
  if (vnode.tag === "#fragment") {
    const fragment2 = document.createDocumentFragment();
    vnode.children.forEach((child) => mount(child, fragment2));
    vnode.element = fragment2;
    container.appendChild(fragment2);
    return fragment2;
  }
  const element = document.createElement(vnode.tag);
  vnode.element = element;
  setProps(element, vnode.props);
  if (vnode.children && Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      if (child) {
        mount(child, element);
      }
    });
  }
  container.appendChild(element);
  return element;
}
function patch(oldVNode, newVNode, container) {
  if (oldVNode.tag !== newVNode.tag) {
    const newElement = mount(newVNode, container);
    container.replaceChild(newElement, oldVNode.element);
    return;
  }
  newVNode.element = oldVNode.element;
  if (newVNode.tag === "#text") {
    if (oldVNode.children[0] !== newVNode.children[0]) {
      oldVNode.element.textContent = newVNode.children[0] || "";
    }
    return;
  }
  patchProps(oldVNode.element, oldVNode.props, newVNode.props);
  patchChildren(oldVNode, newVNode);
}
function patchProps(element, oldProps, newProps) {
  for (const key in oldProps) {
    if (!(key in newProps)) {
      removeProp(element, key, oldProps[key]);
    }
  }
  for (const key in newProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue !== newValue) {
      setProp(element, key, newValue, oldValue);
    }
  }
}
function setProp(element, key, value, oldValue) {
  if (key === "key" || key === "ref") {
    return;
  }
  if (key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase();
    if (oldValue) {
      element.removeEventListener(eventName, oldValue);
    }
    element.addEventListener(eventName, value);
  } else if (key === "style" && typeof value === "object") {
    for (const styleProp in value) {
      element.style[styleProp] = value[styleProp];
    }
  } else if (key === "class" || key === "className") {
    element.className = value;
  } else if (key in element) {
    element[key] = value;
  } else {
    element.setAttribute(key, value);
  }
}
function removeProp(element, key, oldValue) {
  if (key.startsWith("on") && typeof oldValue === "function") {
    const eventName = key.slice(2).toLowerCase();
    element.removeEventListener(eventName, oldValue);
  } else if (key === "style") {
    element.style.cssText = "";
  } else if (key === "class" || key === "className") {
    element.className = "";
  } else if (key in element) {
    element[key] = "";
  } else {
    element.removeAttribute(key);
  }
}
function setProps(element, props) {
  for (const key in props) {
    setProp(element, key, props[key]);
  }
}
function patchChildren(oldVNode, newVNode) {
  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;
  const commonLength = Math.min(oldChildren.length, newChildren.length);
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], oldVNode.element);
  }
  for (let i = commonLength; i < oldChildren.length; i++) {
    oldVNode.element.removeChild(oldChildren[i].element);
  }
  for (let i = commonLength; i < newChildren.length; i++) {
    mount(newChildren[i], oldVNode.element);
  }
}
function $(selector, context = document) {
  return context.querySelector(selector);
}
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
const delegatedEvents = /* @__PURE__ */ new Map();
function delegate(container, eventType, selector, handler) {
  const key = `${eventType}:${selector}`;
  if (!delegatedEvents.has(key)) {
    const delegateHandler = (event) => {
      const target = event.target.closest(selector);
      if (target && container.contains(target)) {
        handler.call(target, event);
      }
    };
    container.addEventListener(eventType, delegateHandler);
    delegatedEvents.set(key, delegateHandler);
  }
  return () => {
    const delegateHandler = delegatedEvents.get(key);
    if (delegateHandler) {
      container.removeEventListener(eventType, delegateHandler);
      delegatedEvents.delete(key);
    }
  };
}
function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}
function nextTick(fn) {
  return Promise.resolve().then(fn);
}
function addClass(element, className) {
  element.classList.add(className);
}
function removeClass(element, className) {
  element.classList.remove(className);
}
function toggleClass(element, className) {
  element.classList.toggle(className);
}
function hasClass(element, className) {
  return element.classList.contains(className);
}
function animate(element, keyframes, options) {
  return element.animate(keyframes, options);
}
function fadeIn(element, duration = 300) {
  return animate(element, [{ opacity: 0 }, { opacity: 1 }], {
    duration,
    fill: "forwards"
  });
}
function fadeOut(element, duration = 300) {
  return animate(element, [{ opacity: 1 }, { opacity: 0 }], {
    duration,
    fill: "forwards"
  });
}
const componentRegistry = /* @__PURE__ */ new Map();
let currentInstance = null;
function getCurrentInstance() {
  return currentInstance;
}
class Component {
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
    this.hooks = {
      beforeMount: [],
      mounted: [],
      beforeUpdate: [],
      updated: [],
      beforeUnmount: [],
      unmounted: []
    };
    this.setup();
  }
  processProps(rawProps) {
    const { props: propDefinitions = {} } = this.definition;
    const processedProps = {};
    for (const [key, definition] of Object.entries(propDefinitions)) {
      const {
        type,
        default: defaultValue,
        required = false,
        validator
      } = definition;
      const value = rawProps[key];
      if (value === void 0) {
        if (required) {
          console.warn(`Required prop '${key}' is missing`);
        }
        processedProps[key] = typeof defaultValue === "function" ? defaultValue() : defaultValue;
      } else {
        if (type && !this.validateType(value, type)) {
          console.warn(
            `Prop '${key}' expected ${type.name}, got ${typeof value}`
          );
        }
        if (validator && !validator(value)) {
          console.warn(`Prop '${key}' validation failed`);
        }
        processedProps[key] = value;
      }
    }
    return processedProps;
  }
  validateType(value, type) {
    if (type === String)
      return typeof value === "string";
    if (type === Number)
      return typeof value === "number";
    if (type === Boolean)
      return typeof value === "boolean";
    if (type === Array)
      return Array.isArray(value);
    if (type === Object)
      return typeof value === "object" && value !== null;
    if (type === Function)
      return typeof value === "function";
    return value instanceof type;
  }
  setup() {
    const prevInstance = currentInstance;
    currentInstance = this;
    setCurrentComponentInstance(this);
    try {
      if (this.definition.setup) {
        this.setupResult = this.definition.setup(this.props, {
          emit: this.emit.bind(this),
          slots: this.slots || {},
          expose: this.expose.bind(this)
        });
      }
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
    return () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = template;
      this.processVFor(wrapper);
      this.processInterpolation(wrapper);
      const element = wrapper.firstElementChild;
      if (element) {
        this.bindEventDirectives(element);
      }
      return element;
    };
  }
  processVFor(root) {
    const elements = root.querySelectorAll("[v-for]");
    elements.forEach((el) => {
      const vFor = el.getAttribute("v-for");
      const [itemVar, itemsExpr] = vFor.split(" in ").map((s) => s.trim());
      const items = this.evaluateExpression(itemsExpr);
      if (Array.isArray(items)) {
        const parent = el.parentNode;
        const anchor = el;
        items.forEach((item) => {
          const clone = el.cloneNode(true);
          clone.removeAttribute("v-for");
          clone._localContext = { [itemVar]: item };
          parent.insertBefore(clone, anchor);
        });
        parent.removeChild(anchor);
      }
    });
  }
  processInterpolation(root) {
    const walker = document.createTreeWalker(root, 4);
    let node;
    while (node = walker.nextNode()) {
      const text2 = node.textContent;
      if (text2.includes("{{")) {
        let context = {};
        let parent = node.parentElement;
        while (parent) {
          if (parent._localContext) {
            context = { ...context, ...parent._localContext };
          }
          parent = parent.parentElement;
        }
        const newText = text2.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
          return this.evaluateExpression(expr.trim(), context);
        });
        node.textContent = newText;
      }
    }
  }
  bindEventDirectives(element) {
    const allElements = [element, ...element.querySelectorAll("*")];
    allElements.forEach((el) => {
      Array.from(el.attributes || []).forEach((attr) => {
        if (attr.name.startsWith("@")) {
          const eventName = attr.name.slice(1);
          const handlerExpression = attr.value;
          const context = { ...this.setupResult, ...this.props };
          if (handlerExpression.includes("(") && handlerExpression.includes(")")) {
            const functionName = handlerExpression.split("(")[0];
            const paramsString = handlerExpression.slice(
              functionName.length + 1,
              -1
            );
            if (context[functionName] && typeof context[functionName] === "function") {
              el.addEventListener(eventName, (event) => {
                try {
                  const params = paramsString ? paramsString.split(",").map((param) => {
                    param = param.trim();
                    if (param.startsWith('"') && param.endsWith('"') || param.startsWith("'") && param.endsWith("'")) {
                      return param.slice(1, -1);
                    }
                    if (!isNaN(param)) {
                      return Number(param);
                    }
                    return context[param];
                  }) : [];
                  context[functionName](...params);
                } catch (e) {
                  console.error("Error executing event handler:", e);
                }
              });
            }
          } else {
            if (context[handlerExpression] && typeof context[handlerExpression] === "function") {
              el.addEventListener(eventName, context[handlerExpression]);
            }
          }
          el.removeAttribute(attr.name);
        }
      });
    });
  }
  evaluateExpression(expression, extraContext = {}) {
    const context = { ...this.setupResult, ...this.props, ...extraContext };
    const unwrappedContext = {};
    for (const [key, value] of Object.entries(context)) {
      unwrappedContext[key] = isSignal(value) ? value.value : value;
    }
    try {
      const keys = Object.keys(unwrappedContext);
      const values = Object.values(unwrappedContext);
      const fn = new Function(...keys, `return ${expression}`);
      return fn(...values);
    } catch (e) {
      console.warn(`Error evaluating expression: ${expression}`, e);
      return "";
    }
  }
  mount(container) {
    if (this.isMounted)
      return;
    this.runHooks("beforeMount");
    if (this.renderFn) {
      let isInitialRender = true;
      const renderEffect = effect(() => {
        const vnode = this.renderFn();
        if (isInitialRender) {
          this.element = vnode;
          container.appendChild(vnode);
          isInitialRender = false;
        } else if (this.element && this.element.parentNode) {
          this.updateElement(this.element, vnode);
        }
      });
      this.effects.push(renderEffect);
    }
    this.isMounted = true;
    this.runHooks("mounted");
  }
  updateElement(existing, newElement) {
    if (existing.tagName !== newElement.tagName) {
      existing.parentNode.replaceChild(newElement, existing);
      this.element = newElement;
      return;
    }
    if (existing.textContent !== newElement.textContent) {
      if (existing.children.length === 0 && newElement.children.length === 0) {
        existing.textContent = newElement.textContent;
      } else {
        this.updateChildren(existing, newElement);
      }
    }
    Array.from(newElement.attributes || []).forEach((attr) => {
      if (existing.getAttribute(attr.name) !== attr.value) {
        existing.setAttribute(attr.name, attr.value);
      }
    });
  }
  updateChildren(existing, newElement) {
    const existingChildren = Array.from(existing.children);
    const newChildren = Array.from(newElement.children);
    for (let i = 0; i < Math.max(existingChildren.length, newChildren.length); i++) {
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
    if (this.isUnmounted)
      return;
    this.runHooks("beforeUnmount");
    this.effects.forEach((effect2) => effect2.stop());
    this.effects.length = 0;
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.isUnmounted = true;
    this.runHooks("unmounted");
  }
  runHooks(hookName) {
    this.hooks[hookName].forEach((hook) => hook.call(this));
  }
  emit(eventName, payload) {
    if (this.parent && this.parent.handleEvent) {
      this.parent.handleEvent(eventName, payload);
    }
  }
  expose(api) {
    this.exposedAPI = api;
  }
}
function defineComponent(definition) {
  if (definition.name) {
    componentRegistry.set(definition.name, definition);
  }
  return definition;
}
function onBeforeMount(fn) {
  if (currentInstance) {
    currentInstance.hooks.beforeMount.push(fn);
  }
}
function onMounted(fn) {
  if (currentInstance) {
    currentInstance.hooks.mounted.push(fn);
  }
}
function onBeforeUpdate(fn) {
  if (currentInstance) {
    currentInstance.hooks.beforeUpdate.push(fn);
  }
}
function onUpdated(fn) {
  if (currentInstance) {
    currentInstance.hooks.updated.push(fn);
  }
}
function onBeforeUnmount(fn) {
  if (currentInstance) {
    currentInstance.hooks.beforeUnmount.push(fn);
  }
}
function onUnmounted(fn) {
  if (currentInstance) {
    currentInstance.hooks.unmounted.push(fn);
  }
}
function createComponent(definition, props = {}, parent = null) {
  return new Component(definition, props, parent);
}
function mountComponent(component, container) {
  if (typeof container === "string") {
    container = document.querySelector(container);
  }
  if (!container) {
    throw new Error("Mount container not found");
  }
  component.mount(container);
  return component;
}
function createApp(rootComponent, props = {}) {
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
    }
  };
  return app;
}
function getComponent(name) {
  return componentRegistry.get(name);
}
const directives = /* @__PURE__ */ new Map();
function registerDirective(name, directive) {
  directives.set(name, directive);
}
function getDirective(name) {
  return directives.get(name);
}
registerDirective("if", {
  mounted(el, binding) {
    if (!binding.value) {
      el.style.display = "none";
    }
  },
  updated(el, binding) {
    el.style.display = binding.value ? "" : "none";
  }
});
registerDirective("show", {
  mounted(el, binding) {
    el.style.display = binding.value ? "" : "none";
  },
  updated(el, binding) {
    el.style.display = binding.value ? "" : "none";
  }
});
class Router {
  constructor(options = {}) {
    this.routes = options.routes || [];
    this.mode = options.mode || "history";
    this.base = options.base || "/";
    this.guards = options.guards || {};
    this.currentRoute = signal$1(null);
    this.isReady = signal$1(false);
    this.currentComponent = null;
    this.container = null;
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.init();
  }
  init() {
    if (typeof console !== "undefined" && console.log) {
      console.log("Router initialization started");
    }
    if (this.mode === "history") {
      window.addEventListener("popstate", this.handlePopState.bind(this));
    } else {
      window.addEventListener("hashchange", this.handleHashChange.bind(this));
    }
    console.log("Handling initial route");
    this.handleRoute(this.getCurrentPath());
    this.isReady.value = true;
    console.log("Router initialization completed");
  }
  getCurrentPath() {
    if (this.mode === "history") {
      return window.location.pathname + window.location.search;
    } else {
      return window.location.hash.slice(1) || "/";
    }
  }
  handlePopState() {
    this.handleRoute(this.getCurrentPath());
  }
  handleHashChange() {
    this.handleRoute(this.getCurrentPath());
  }
  async handleRoute(path) {
    if (typeof console !== "undefined" && console.log) {
      console.log(`Handling route: ${path}`);
    }
    const route = this.matchRoute(path);
    if (!route) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(`No route found for path: ${path}`);
      }
      return;
    }
    if (typeof console !== "undefined" && console.log) {
      console.log("Running before guards");
    }
    const canNavigate = await this.runBeforeGuards(
      route,
      this.currentRoute.value
    );
    if (!canNavigate) {
      if (typeof console !== "undefined" && console.log) {
        console.log("Navigation cancelled by before guards");
      }
      return;
    }
    const previousRoute = this.currentRoute.value;
    this.currentRoute.value = route;
    if (typeof console !== "undefined" && console.log) {
      console.log(`Route updated to: ${route.path}`);
    }
    if (route.component && this.container) {
      if (typeof console !== "undefined" && console.log) {
        console.log("Mounting route component");
      }
      this.mountRouteComponent(route);
    }
    if (typeof console !== "undefined" && console.log) {
      console.log("Running after hooks");
    }
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
          fullPath: path
        };
      }
    }
    return null;
  }
  matchPath(path, pattern) {
    const cleanPath = path.split("?")[0];
    const paramPattern = pattern.replace(/:([^/]+)/g, "([^/]+)");
    const regex = new RegExp(`^${paramPattern}$`);
    const match = cleanPath.match(regex);
    if (!match) {
      return null;
    }
    const params = {};
    const paramNames = pattern.match(/:([^/]+)/g);
    if (paramNames) {
      paramNames.forEach((param, index) => {
        const paramName = param.slice(1);
        params[paramName] = match[index + 1];
      });
    }
    return { params };
  }
  parseQuery(path) {
    const queryString = path.split("?")[1];
    if (!queryString) {
      return {};
    }
    const query = {};
    queryString.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      query[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });
    return query;
  }
  async runBeforeGuards(to, from) {
    for (const hook of this.beforeEachHooks) {
      const result = await hook(to, from);
      if (result === false) {
        return false;
      }
    }
    if (to.beforeEnter) {
      const guards = Array.isArray(to.beforeEnter) ? to.beforeEnter : [to.beforeEnter];
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
    this.afterEachHooks.forEach((hook) => {
      try {
        hook(to, from);
      } catch (error) {
        console.error("Error in after hook:", error);
      }
    });
  }
  mountRouteComponent(route) {
    if (this.currentComponent) {
      this.currentComponent.unmount();
    }
    if (route.component) {
      this.currentComponent = createComponent(route.component, {
        route,
        router: this
      });
      mountComponent(this.currentComponent, this.container);
    }
  }
  // Navigation methods
  push(path) {
    if (this.mode === "history") {
      window.history.pushState(null, "", path);
      this.handleRoute(path);
    } else {
      window.location.hash = path;
    }
  }
  replace(path) {
    if (this.mode === "history") {
      window.history.replaceState(null, "", path);
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
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    this.container = container;
    if (this.currentRoute.value) {
      this.mountRouteComponent(this.currentRoute.value);
    }
  }
}
function createRouter(options) {
  return new Router(options);
}
function authGuard(to, from) {
  const isAuthenticated = localStorage.getItem("auth-token");
  if (!isAuthenticated && to.meta?.requiresAuth) {
    return "/login";
  }
  return true;
}
const RouterLink = {
  name: "RouterLink",
  props: {
    to: { type: String, required: true },
    replace: { type: Boolean, default: false },
    tag: { type: String, default: "a" }
  },
  setup(props, { slots }) {
    const router = getCurrentRouter();
    const navigate = (event) => {
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
          onClick: navigate
        },
        slots.default?.()
      );
    };
  }
};
const RouterView = {
  name: "RouterView",
  setup() {
    const router = getCurrentRouter();
    return () => {
      const route = router.currentRoute.value;
      if (!route || !route.component) {
        return null;
      }
      return h(route.component, {
        route,
        router
      });
    };
  }
};
let currentRouter = null;
function setCurrentRouter(router) {
  currentRouter = router;
}
function getCurrentRouter() {
  return currentRouter;
}
function useRouter() {
  return getCurrentRouter();
}
function useRoute() {
  const router = getCurrentRouter();
  return router ? router.currentRoute : signal$1(null);
}
function createRoutes(routes) {
  return routes.map((route) => ({
    ...route
    // Add any route processing here
  }));
}
function createWebHistory(base = "/") {
  return {
    mode: "history",
    base
  };
}
function createWebHashHistory() {
  return {
    mode: "hash"
  };
}
class Store {
  constructor(options = {}) {
    this._state = {};
    this.getters = {};
    this.actions = {};
    this.mutations = {};
    this.middleware = options.middleware || [];
    this.strict = options.strict !== false;
    if (options.state) {
      this.initState(options.state);
    }
    if (options.getters) {
      this.initGetters(options.getters);
    }
    if (options.actions) {
      this.actions = { ...options.actions };
    }
    if (options.mutations) {
      this.mutations = { ...options.mutations };
    }
    this.state = this.createStateProxy();
    this.applyMiddleware();
  }
  getState() {
    const state = {};
    for (const [key, signal$] of Object.entries(this._state)) {
      state[key] = signal$.value;
    }
    return state;
  }
  initState(stateConfig) {
    for (const [key, value] of Object.entries(stateConfig)) {
      this._state[key] = signal$1(value);
    }
  }
  createStateProxy() {
    const stateProxy = new Proxy(
      {},
      {
        get: (target, key) => {
          if (key === "subscribe") {
            return (callback) => {
              const subscribers = [];
              for (const [stateKey, signal$] of Object.entries(this._state)) {
                const unsubscribe = effect(() => {
                  signal$.value;
                  callback(this.state);
                });
                subscribers.push(unsubscribe);
              }
              return () => {
                subscribers.forEach((unsub) => unsub && typeof unsub === "function" && unsub());
              };
            };
          }
          const stateProp = this._state[key];
          if (stateProp && typeof stateProp === "object" && "value" in stateProp) {
            return stateProp.value;
          }
          return stateProp;
        },
        set: (target, key, value) => {
          if (this._state[key] && typeof this._state[key] === "object" && "value" in this._state[key]) {
            this._state[key].value = value;
          } else {
            this._state[key] = signal$1(value);
          }
          return true;
        },
        has: (target, key) => key in this._state || key === "subscribe",
        ownKeys: (target) => [...Object.keys(this._state), "subscribe"]
      }
    );
    return stateProxy;
  }
  initGetters(gettersConfig) {
    const stateProxy = new Proxy(
      {},
      {
        get: (target, key) => {
          const stateProp = this._state[key];
          if (stateProp && typeof stateProp === "object" && "value" in stateProp) {
            const value = stateProp.value;
            return value;
          }
          return stateProp;
        }
      }
    );
    for (const [key, getterFn] of Object.entries(gettersConfig)) {
      const computedSignal = computed(() => {
        const result = getterFn(stateProxy, this.getters);
        return result;
      });
      Object.defineProperty(this.getters, key, {
        get() {
          return computedSignal.value;
        },
        enumerable: true
      });
    }
  }
  applyMiddleware() {
    const middlewareInstances = this.middleware.map((m) => m(this));
    this.dispatch = middlewareInstances.reduceRight(
      (next, middleware) => middleware(next),
      this.baseDispatch.bind(this)
    );
    this.commit = middlewareInstances.reduceRight(
      (next, middleware) => middleware.commit ? middleware.commit(this)(next) : next,
      this.baseCommit.bind(this)
    );
  }
  baseDispatch(action, payload) {
    if (typeof action === "string") {
      const actionFn = this.actions[action];
      if (!actionFn) {
        return Promise.reject(new Error(`Action ${action} not found`));
      }
      return Promise.resolve(
        actionFn.call(
          this,
          { state: this.state, commit: this.commit, dispatch: this.dispatch },
          payload
        )
      );
    }
    if (typeof action === "object" && action.type) {
      return this.dispatch(action.type, action.payload);
    }
    return Promise.reject(new Error("Invalid action format"));
  }
  baseCommit(mutation, payload) {
    if (typeof mutation === "string") {
      const mutationFn = this.mutations[mutation];
      if (!mutationFn) {
        throw new Error(`Mutation ${mutation} not found`);
      }
      const stateProxy = new Proxy(
        {},
        {
          get: (target, key) => {
            const stateProp = this._state[key];
            return stateProp && typeof stateProp === "object" && "value" in stateProp ? stateProp.value : stateProp;
          },
          set: (target, key, value) => {
            if (this._state[key] && typeof this._state[key] === "object" && "value" in this._state[key]) {
              this._state[key].value = value;
            } else {
              this._state[key] = signal$1(value);
            }
            return true;
          }
        }
      );
      mutationFn(stateProxy, payload);
    } else if (typeof mutation === "object" && mutation.type) {
      this.commit(mutation.type, mutation.payload);
    } else {
      throw new Error("Invalid mutation format");
    }
  }
  // Subscribe to state changes
  subscribe(fn) {
    const unsubscribers = Object.values(this._state).map(
      (stateProp) => stateProp.subscribe(() => fn(this._state))
    );
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
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
        this._state[key] = signal$1(value);
      }
    }
  }
}
function createStore(options) {
  return new Store(options);
}
function logger(store) {
  const middleware = (next) => (action, payload) => {
    console.group(`Action: ${action}`);
    console.log("Payload:", payload);
    console.log("State before:", store.getState());
    const result = next(action, payload);
    console.log("State after:", store.getState());
    console.groupEnd();
    return result;
  };
  middleware.commit = (store2) => (next) => (mutation, payload) => {
    if (typeof console !== "undefined" && console.log) {
      console.log(`Mutation ${mutation}:`, payload);
    }
    return next(mutation, payload);
  };
  return middleware;
}
function persistence(options = {}) {
  if (typeof options === "string") {
    options = { key: options };
  }
  const { key = "rxhtmx-store", storage = localStorage } = options;
  return (store) => {
    try {
      const savedState = storage.getItem(key);
      if (savedState) {
        store.replaceState(JSON.parse(savedState));
      }
    } catch (error) {
      console.warn("Failed to load persisted state:", error);
    }
    store.subscribe(() => {
      try {
        storage.setItem(key, JSON.stringify(store.getState()));
      } catch (error) {
        console.warn("Failed to persist state:", error);
      }
    });
    return (next) => (action, payload) => {
      return next(action, payload);
    };
  };
}
function devtools(options = {}) {
  const { name = "RxHtmx Store" } = options;
  return (store) => {
    let devtoolsInstance = null;
    if (typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__) {
      devtoolsInstance = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name });
      devtoolsInstance.init(store.getState ? store.getState() : {});
    }
    return (next) => (action, payload) => {
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
function validation(schemas = {}) {
  return (store) => {
    return (next) => (action, payload) => {
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
function asyncMiddleware(store) {
  return (next) => (action, payload) => {
    if (typeof action === "function") {
      return action(store.dispatch, store.getState);
    }
    return next(action, payload);
  };
}
class StoreModule {
  constructor(options = {}) {
    this.namespaced = options.namespaced || false;
    this.state = options.state || {};
    this.getters = options.getters || {};
    this.actions = options.actions || {};
    this.mutations = options.mutations || {};
    this.modules = options.modules || {};
  }
}
function createModule(options) {
  return new StoreModule(options);
}
function combineStores(stores) {
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
    mutations: combinedMutations
  });
}
let currentStore = null;
function setCurrentStore(store) {
  currentStore = store;
}
function useStore(store) {
  if (store) {
    return store;
  }
  if (!currentStore) {
    throw new Error("No store provided and no current store set");
  }
  return currentStore;
}
function useState(store, key) {
  if (!(key in store.state)) {
    throw new Error(`State property '${key}' not found`);
  }
  return store.state[key];
}
function useGetter(store, key) {
  if (!(key in store.getters)) {
    throw new Error(`Getter '${key}' not found`);
  }
  return store.getters[key];
}
function useActions(store, actionNames) {
  if (Array.isArray(actionNames)) {
    const actions = {};
    actionNames.forEach((name) => {
      actions[name] = (payload) => store.dispatch(name, payload);
    });
    return actions;
  }
  if (typeof actionNames === "string") {
    return (payload) => store.dispatch(actionNames, payload);
  }
  throw new Error("Invalid action names format");
}
const loggingMiddleware = logger;
const persistenceMiddleware = persistence;
const devToolsMiddleware = devtools;
function signal(initialValue) {
  let _value = initialValue;
  const subscribers = /* @__PURE__ */ new Set();
  const sig = {
    get value() {
      return _value;
    },
    set value(v) {
      if (_value !== v) {
        _value = v;
        subscribers.forEach((fn) => fn(_value));
      }
    },
    subscribe(fn) {
      subscribers.add(fn);
      fn(_value);
      return () => subscribers.delete(fn);
    }
  };
  return sig;
}
let htmx;
async function loadHtmx() {
  try {
    if (typeof window !== "undefined") {
      htmx = await import("./chunks/htmxWrapper.37b2f527.js").then((m) => m.default);
      if (!htmx) {
        throw new Error("HTMX failed to load.");
      }
      console.info("[RxHtmx] HTMX loaded successfully.");
    }
  } catch (error) {
    console.error("[RxHtmx] HTMX not available or failed to load:", error);
  }
}
if (typeof window !== "undefined") {
  loadHtmx();
}
function createStream(selector) {
  const element = document.querySelector(selector);
  const sig = signal(element ? element.value || "" : "");
  if (!element) {
    console.warn(`[RxHtmx] Element not found for selector: ${selector}`);
    return sig;
  }
  const handler = (event) => {
    sig.value = event.target.value;
  };
  element.addEventListener("input", handler);
  sig.unsubscribe = () => {
    element.removeEventListener("input", handler);
  };
  return sig;
}
function integrateHtmxWithSignals() {
  const htmxSig = signal(null);
  if (typeof window === "undefined" || !document.body) {
    console.warn(
      "[RxHtmx] integrateHtmxWithSignals called outside browser environment."
    );
    return htmxSig;
  }
  const afterSwapHandler = (event) => {
    htmxSig.value = { type: "afterSwap", detail: event.detail };
  };
  const beforeRequestHandler = (event) => {
    htmxSig.value = { type: "beforeRequest", detail: event.detail };
  };
  document.body.addEventListener("htmx:afterSwap", afterSwapHandler);
  document.body.addEventListener("htmx:beforeRequest", beforeRequestHandler);
  htmxSig.unsubscribe = () => {
    document.body.removeEventListener("htmx:afterSwap", afterSwapHandler);
    document.body.removeEventListener(
      "htmx:beforeRequest",
      beforeRequestHandler
    );
  };
  return htmxSig;
}
function bindSignalToDom(sig, selector, updateFn) {
  if (!sig || typeof sig.subscribe !== "function") {
    throw new Error("[RxHtmx] bindSignalToDom: sig must be a signal");
  }
  let lastElement = null;
  const unsubscribe = sig.subscribe((value) => {
    const element = document.querySelector(selector);
    if (!element) {
      if (lastElement !== null) {
        console.warn(
          `[RxHtmx] Element for selector '${selector}' is no longer in the DOM.`
        );
      }
      lastElement = null;
      return;
    }
    lastElement = element;
    try {
      updateFn(element, value);
    } catch (err) {
      console.error("[RxHtmx] Error in updateFn:", err);
    }
  });
  return unsubscribe;
}
export {
  $,
  $$,
  Component,
  Router,
  RouterLink,
  RouterView,
  Store,
  StoreModule,
  VNode,
  addClass,
  animate,
  asyncMiddleware,
  authGuard,
  batch,
  bindSignalToDom,
  combineStores,
  computed,
  createApp,
  createComponent,
  createModule,
  createRouter,
  createRoutes,
  createStore,
  createStream,
  createWebHashHistory,
  createWebHistory,
  defineComponent,
  delegate,
  devToolsMiddleware,
  devtools,
  effect,
  fadeIn,
  fadeOut,
  fragment,
  getComponent,
  getCurrentInstance,
  getCurrentRouter,
  getDirective,
  h,
  hasClass,
  integrateHtmxWithSignals,
  isSignal,
  logger,
  loggingMiddleware,
  mountComponent,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  persistence,
  persistenceMiddleware,
  queueUpdate,
  reactive,
  ready,
  ref,
  registerDirective,
  removeClass,
  render,
  setCurrentComponentInstance,
  setCurrentRouter,
  setCurrentStore,
  signal$1 as signal,
  text,
  toggleClass,
  useActions,
  useGetter,
  useRoute,
  useRouter,
  useState,
  useStore,
  validation,
  watch
};
//# sourceMappingURL=rxhtmx.esm.js.map
