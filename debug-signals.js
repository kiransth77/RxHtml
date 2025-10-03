// Debug test for computed signals
import { signal, computed } from './src/core/signal.js';

console.log('🧪 Creating signal...');
const count = signal(0);
console.log('Signal value:', count.value);
console.log('Signal type:', typeof count.value);

console.log('🧪 Creating computed...');
const doubled = computed(() => count.value * 2);
console.log('Computed value:', doubled.value);
console.log('Computed type:', typeof doubled.value);
console.log('Computed toString:', String(doubled.value));

console.log('🧪 Updating signal...');
count.value = 5;
console.log('Signal value after update:', count.value);
console.log('Computed value after update:', doubled.value);
console.log('Computed type after update:', typeof doubled.value);
console.log('Computed toString after update:', String(doubled.value));

// Test direct access
const contextObj = {
  count: count,
  doubled: doubled
};

console.log('🧪 Context test...');
console.log('Context count:', contextObj.count);
console.log('Context count value:', contextObj.count.value);
console.log('Context doubled:', contextObj.doubled);
console.log('Context doubled value:', contextObj.doubled.value);
console.log('Context doubled toString:', String(contextObj.doubled.value));