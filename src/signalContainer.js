// signalContainer.js
// Utilities for global and scoped signal containers
// Usage:
//   import { createGlobalSignalContainer, createScopedSignalContainer } from './signalContainer.js';
//   const globalSignals = createGlobalSignalContainer();
//   const pageSignals = createScopedSignalContainer();

import { signal } from './signal.js';

// Global container singleton
let _globalContainer = null;

export function createGlobalSignalContainer() {
  if (!_globalContainer) {
    _globalContainer = createScopedSignalContainer();
  }
  return _globalContainer;
}

// Factory for scoped containers
export function createScopedSignalContainer() {
  const signals = new Map();
  return {
    get(key, initialValue) {
      if (!signals.has(key)) {
        signals.set(key, signal(initialValue));
      }
      return signals.get(key);
    },
    set(key, value) {
      if (!signals.has(key)) {
        signals.set(key, signal(value));
      } else {
        signals.get(key).value = value;
      }
    },
    has(key) {
      return signals.has(key);
    },
    delete(key) {
      return signals.delete(key);
    },
    clear() {
      signals.clear();
    },
    keys() {
      return Array.from(signals.keys());
    },
    values() {
      return Array.from(signals.values());
    },
    entries() {
      return Array.from(signals.entries());
    },
    size() {
      return signals.size;
    }
  };
}
