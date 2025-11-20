// DOM utilities for RxHtmx framework
// Provides efficient DOM manipulation and virtual DOM helpers

export class VNode {
  constructor(tag, props = {}, children = []) {
    this.tag = tag;
    this.props = props;
    this.children = Array.isArray(children) ? children : [children];
    this.element = null; // Reference to actual DOM element
    this.key = props.key || null;
  }
}

// Create virtual nodes (JSX-like syntax support)
export function h(tag, props = {}, ...children) {
  return new VNode(tag, props, children.flat());
}

// Text node helper
export function text(content) {
  return new VNode('#text', {}, [String(content)]);
}

// Fragment helper
export function fragment(...children) {
  return new VNode('#fragment', {}, children.flat());
}

// Render virtual node to DOM
export function render(vnode, container) {
  if (container._vnode) {
    patch(container._vnode, vnode, container);
  } else {
    mount(vnode, container);
  }
  container._vnode = vnode;
}

// Mount virtual node to DOM
function mount(vnode, container) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    const textNode = document.createTextNode(vnode);
    container.appendChild(textNode);
    return textNode;
  }

  if (vnode.tag === '#text') {
    const textNode = document.createTextNode(vnode.children[0] || '');
    vnode.element = textNode;
    container.appendChild(textNode);
    return textNode;
  }

  if (vnode.tag === '#fragment') {
    const fragment = document.createDocumentFragment();
    vnode.children.forEach(child => mount(child, fragment));
    vnode.element = fragment;
    container.appendChild(fragment);
    return fragment;
  }

  // Create element
  const element = document.createElement(vnode.tag);
  vnode.element = element;

  // Set properties
  setProps(element, vnode.props);

  // Mount children
  if (vnode.children && Array.isArray(vnode.children)) {
    vnode.children.forEach(child => {
      if (child) {
        mount(child, element);
      }
    });
  }

  container.appendChild(element);
  return element;
}

// Patch (update) virtual nodes
function patch(oldVNode, newVNode, container) {
  if (oldVNode.tag !== newVNode.tag) {
    // Different elements, replace entirely
    const newElement = mount(newVNode, container);
    container.replaceChild(newElement, oldVNode.element);
    return;
  }

  newVNode.element = oldVNode.element;

  if (newVNode.tag === '#text') {
    if (oldVNode.children[0] !== newVNode.children[0]) {
      oldVNode.element.textContent = newVNode.children[0] || '';
    }
    return;
  }

  // Update props
  patchProps(oldVNode.element, oldVNode.props, newVNode.props);

  // Patch children
  patchChildren(oldVNode, newVNode);
}

// Patch element properties
function patchProps(element, oldProps, newProps) {
  // Remove old props
  for (const key in oldProps) {
    if (!(key in newProps)) {
      removeProp(element, key, oldProps[key]);
    }
  }

  // Add/update new props
  for (const key in newProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue !== newValue) {
      setProp(element, key, newValue, oldValue);
    }
  }
}

// Set individual property
function setProp(element, key, value, oldValue) {
  if (key === 'key' || key === 'ref') {
    return; // Special props
  }

  if (key.startsWith('on') && typeof value === 'function') {
    // Event listeners
    const eventName = key.slice(2).toLowerCase();
    if (oldValue) {
      element.removeEventListener(eventName, oldValue);
    }
    element.addEventListener(eventName, value);
  } else if (key === 'style' && typeof value === 'object') {
    // Style object
    for (const styleProp in value) {
      element.style[styleProp] = value[styleProp];
    }
  } else if (key === 'class' || key === 'className') {
    element.className = value;
  } else if (key in element) {
    // DOM properties
    element[key] = value;
  } else {
    // Attributes
    element.setAttribute(key, value);
  }
}

// Remove property
function removeProp(element, key, oldValue) {
  if (key.startsWith('on') && typeof oldValue === 'function') {
    const eventName = key.slice(2).toLowerCase();
    element.removeEventListener(eventName, oldValue);
  } else if (key === 'style') {
    element.style.cssText = '';
  } else if (key === 'class' || key === 'className') {
    element.className = '';
  } else if (key in element) {
    element[key] = '';
  } else {
    element.removeAttribute(key);
  }
}

// Set all properties on element
function setProps(element, props) {
  for (const key in props) {
    setProp(element, key, props[key]);
  }
}

// Patch children using simple algorithm
function patchChildren(oldVNode, newVNode) {
  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;
  const commonLength = Math.min(oldChildren.length, newChildren.length);

  // Patch common children
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], oldVNode.element);
  }

  // Remove extra old children
  for (let i = commonLength; i < oldChildren.length; i++) {
    oldVNode.element.removeChild(oldChildren[i].element);
  }

  // Add new children
  for (let i = commonLength; i < newChildren.length; i++) {
    mount(newChildren[i], oldVNode.element);
  }
}

// Query utilities
export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Event delegation
const delegatedEvents = new Map();

export function delegate(container, eventType, selector, handler) {
  const key = `${eventType}:${selector}`;

  if (!delegatedEvents.has(key)) {
    const delegateHandler = event => {
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

// DOM ready utility
export function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// Async DOM operations
export function nextTick(fn) {
  return Promise.resolve().then(fn);
}

// Element utilities
export function addClass(element, className) {
  element.classList.add(className);
}

export function removeClass(element, className) {
  element.classList.remove(className);
}

export function toggleClass(element, className) {
  element.classList.toggle(className);
}

export function hasClass(element, className) {
  return element.classList.contains(className);
}

// Animation utilities
export function animate(element, keyframes, options) {
  return element.animate(keyframes, options);
}

export function fadeIn(element, duration = 300) {
  return animate(element, [{ opacity: 0 }, { opacity: 1 }], {
    duration,
    fill: 'forwards',
  });
}

export function fadeOut(element, duration = 300) {
  return animate(element, [{ opacity: 1 }, { opacity: 0 }], {
    duration,
    fill: 'forwards',
  });
}
