// Fixed signal system for RxHtmx framework
// Prevents infinite loops and provides stable reactivity

// Global effect tracking context
let activeEffect = null;
const effectStack = [];

export function signal(initialValue) {
  let _value = initialValue;
  const subscribers = new Set();
  
  const sig = {
    get value() {
      // Track this signal as a dependency if we're in an effect
      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.deps.add(sig);
      }
      return _value;
    },
    
    set value(newValue) {
      if (_value !== newValue) {
        _value = newValue;
        // Notify all subscribers synchronously
        const currentSubscribers = Array.from(subscribers);
        currentSubscribers.forEach(effect => {
          if (effect && typeof effect.run === 'function') {
            effect.run();
          } else if (typeof effect === 'function') {
            effect(_value);
          }
        });
      }
    },
    
    subscribe(fn) {
      subscribers.add(fn);
      fn(_value); // Call immediately with current value
      return () => subscribers.delete(fn);
    },
    
    // Internal methods for the effect system
    _addSubscriber(effect) {
      subscribers.add(effect);
    },
    
    _removeSubscriber(effect) {
      subscribers.delete(effect);
    }
  };
  
  return sig;
}

export function computed(fn) {
  let _value;
  let _dirty = true;
  let _computing = false;
  const dependencies = new Set();
  const subscribers = new Set();
  
  const computedSignal = {
    get value() {
      if (_computing) {
        console.warn('Computed recursion detected, returning cached value');
        return _value;
      }
      
      if (_dirty) {
        _computing = true;
        
        try {
          // Clear old dependencies
          dependencies.forEach(dep => {
            dep._removeSubscriber(computedSignal);
          });
          dependencies.clear();
          
          // Track dependencies during computation
          const prevEffect = activeEffect;
          activeEffect = {
            deps: dependencies,
            run: () => {
              _dirty = true;
              // Notify subscribers of this computed signal
              const currentSubscribers = Array.from(subscribers);
              currentSubscribers.forEach(effect => {
                if (effect && typeof effect.run === 'function') {
                  effect.run();
                } else if (typeof effect === 'function') {
                  effect(computedSignal.value);
                }
              });
            }
          };
          
          try {
            _value = fn();
            _dirty = false;
            
            // Subscribe to all dependencies
            dependencies.forEach(dep => {
              dep._addSubscriber(activeEffect);
            });
          } finally {
            activeEffect = prevEffect;
          }
        } finally {
          _computing = false;
        }
      }
      
      // If we're in another effect, track this computed as a dependency
      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.deps.add(computedSignal);
      }
      
      return _value;
    },
    
    _addSubscriber(effect) {
      subscribers.add(effect);
    },
    
    _removeSubscriber(effect) {
      subscribers.delete(effect);
    }
  };
  
  return computedSignal;
}

export function effect(fn, options = {}) {
  const { immediate = true } = options;
  const deps = new Set();
  let isActive = true;
  
  const effectInstance = {
    run() {
      if (!isActive) return; // Don't run if stopped
      
      // Clear old dependencies
      deps.forEach(dep => dep._removeSubscriber(effectInstance));
      deps.clear();
      
      // Set current effect context
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
      deps.forEach(dep => dep._removeSubscriber(effectInstance));
      deps.clear();
    },
    
    deps
  };
  
  if (immediate) {
    effectInstance.run();
  }
  
  return effectInstance;
}

// Batch updates to prevent excessive re-renders
let updateQueue = new Set();
let isFlushPending = false;

export function batch(fn) {
  const wasFlushPending = isFlushPending;
  isFlushPending = true;
  
  try {
    fn();
  } finally {
    if (!wasFlushPending) {
      flushUpdates();
      isFlushPending = false;
    }
  }
}

function flushUpdates() {
  const effects = Array.from(updateQueue);
  updateQueue.clear();
  
  effects.forEach(effect => {
    if (typeof effect.run === 'function') {
      effect.run();
    }
  });
}

// Reactive utilities
export function watch(source, callback, options = {}) {
  const { immediate = false } = options;
  let oldValue = immediate ? undefined : source.value;
  
  return effect(() => {
    const newValue = source.value;
    if (oldValue !== newValue || immediate) {
      callback(newValue, oldValue);
      oldValue = newValue;
    }
  }, { immediate });
}

export function reactive(target) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  
  const reactiveTarget = {};
  
  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      const sig = signal(target[key]);
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

// Utility to create a ref (mutable object with .value property)
export function ref(value) {
  return signal(value);
}

// Check if a value is a signal
export function isSignal(value) {
  return value && typeof value === 'object' && 'value' in value && 'subscribe' in value;
}