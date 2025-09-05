// Minimal signal implementation for RxHtmx
// Usage: const count = signal(0); count.value = 1; effect(() => console.log(count.value));

export function signal(initialValue) {
  let _value = initialValue;
  const subscribers = new Set();
  const sig = {
    get value() { return _value; },
    set value(v) {
      if (_value !== v) {
        _value = v;
        subscribers.forEach(fn => fn(_value));
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

export function effect(fn) {
  // For simplicity, just run the effect once per subscription
  fn();
}
