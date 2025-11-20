// RxHtmx Framework - Main Entry Point
// A modern, signal-based frontend framework

// Dynamic import for htmx in browser environment
let htmx;
async function loadHtmx() {
  try {
    if (typeof window !== 'undefined') {
      htmx = await import('./htmxWrapper.js').then(m => m.default);
      if (!htmx) {
        throw new Error('HTMX failed to load.');
      }
      console.info('[RxHtmx] HTMX loaded successfully.');
    }
  } catch (error) {
    console.error('[RxHtmx] HTMX not available or failed to load:', error);
  }
}
if (typeof window !== 'undefined') {
  loadHtmx();
}

// Core framework exports
export * from './core/signal.js';
export * from './core/component.js';
export * from './core/dom.js';
export * from './router/router.js';
export * from './state/store.js';

// Legacy signal support (for backward compatibility)
import { signal, effect } from './signal.js';

/**
 * Creates a reactive signal for an HTML input element.
 * @param {string} selector - The CSS selector for the target element.
 * @returns {object} - A signal for the element's value.
 */
export function createStream(selector) {
  const element = document.querySelector(selector);
  const sig = signal(element ? element.value || '' : '');
  if (!element) {
    console.warn(`[RxHtmx] Element not found for selector: ${selector}`);
    return sig;
  }
  const handler = event => {
    sig.value = event.target.value;
  };
  element.addEventListener('input', handler);
  // Cleanup
  sig.unsubscribe = () => {
    element.removeEventListener('input', handler);
  };
  return sig;
}

/**
 * Integrates htmx events with signals.
 * @returns {object} - A signal that updates with htmx events.
 */
export function integrateHtmxWithSignals() {
  const htmxSig = signal(null);
  if (typeof window === 'undefined' || !document.body) {
    console.warn(
      '[RxHtmx] integrateHtmxWithSignals called outside browser environment.'
    );
    return htmxSig;
  }
  const afterSwapHandler = event => {
    htmxSig.value = { type: 'afterSwap', detail: event.detail };
  };
  const beforeRequestHandler = event => {
    htmxSig.value = { type: 'beforeRequest', detail: event.detail };
  };
  document.body.addEventListener('htmx:afterSwap', afterSwapHandler);
  document.body.addEventListener('htmx:beforeRequest', beforeRequestHandler);
  htmxSig.unsubscribe = () => {
    document.body.removeEventListener('htmx:afterSwap', afterSwapHandler);
    document.body.removeEventListener(
      'htmx:beforeRequest',
      beforeRequestHandler
    );
  };
  return htmxSig;
}

// Utility to bind RxJS signals to DOM elements
export function bindSignalToDom(sig, selector, updateFn) {
  if (!sig || typeof sig.subscribe !== 'function') {
    throw new Error('[RxHtmx] bindSignalToDom: sig must be a signal');
  }
  let lastElement = null;
  const unsubscribe = sig.subscribe(value => {
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
      console.error('[RxHtmx] Error in updateFn:', err);
    }
  });
  return unsubscribe;
}
