// dedupSignalContainer.js
// Signal container that deduplicates by value (not just key)
// Usage:
//   import { createDedupSignalContainer } from './dedupSignalContainer.js';
//   const dedupSignals = createDedupSignalContainer();
//   const sig = dedupSignals.getForValue({foo: 1});

import { signal } from './signal.js';

export function createDedupSignalContainer() {
  // Map from stringified value to signal
  const valueMap = new Map();

  function serialize(val) {
    // Use stable stringify for objects, fallback to String for primitives
    try {
      return typeof val === 'object' && val !== null
        ? JSON.stringify(val, Object.keys(val).sort())
        : String(val);
    } catch (e) {
      return String(val);
    }
  }

  return {
    getForValue(value) {
      const key = serialize(value);
      if (!valueMap.has(key)) {
        valueMap.set(key, signal(value));
      }
      return valueMap.get(key);
    },
    hasValue(value) {
      return valueMap.has(serialize(value));
    },
    deleteValue(value) {
      return valueMap.delete(serialize(value));
    },
    clear() {
      valueMap.clear();
    },
    size() {
      return valueMap.size;
    },
    entries() {
      return Array.from(valueMap.entries());
    }
  };
}
