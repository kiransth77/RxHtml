// Test the fixed signal system
import { JSDOM } from 'jsdom';

// Set up minimal DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;

// Import FIXED core components
import { signal, computed, effect } from '../src/core/signal-fixed.js';

describe('Fixed Signal Tests', () => {
  test('should create and update signals without infinite loops', () => {
    console.log('🧪 Testing basic signal functionality...');
    
    const count = signal(0);
    console.log('📊 Initial value:', count.value);
    expect(count.value).toBe(0);
    
    count.value = 5;
    console.log('📊 Updated value:', count.value);
    expect(count.value).toBe(5);
    
    console.log('✅ Signal test passed');
  });
  
  test('should create computed signals without infinite loops', () => {
    console.log('🧪 Testing computed signals...');
    
    const count = signal(10);
    const doubled = computed(() => count.value * 2);
    
    console.log('📊 Count:', count.value);
    console.log('📊 Doubled:', doubled.value);
    expect(doubled.value).toBe(20);
    
    count.value = 15;
    console.log('📊 Count after update:', count.value);
    console.log('📊 Doubled after update:', doubled.value);
    expect(doubled.value).toBe(30);
    
    console.log('✅ Computed signal test passed');
  });
  
  test('should run effects without infinite loops', () => {
    console.log('🧪 Testing effects...');
    
    const count = signal(0);
    let effectRuns = 0;
    let lastValue = null;
    
    const cleanup = effect(() => {
      effectRuns++;
      lastValue = count.value;
      console.log('🔄 Effect run #' + effectRuns + ', value:', lastValue);
    });
    
    expect(effectRuns).toBe(1);
    expect(lastValue).toBe(0);
    
    console.log('📊 Updating signal to 1...');
    count.value = 1;
    console.log('📊 Effect runs after update:', effectRuns);
    expect(effectRuns).toBe(2);
    expect(lastValue).toBe(1);
    
    console.log('📊 Updating signal to 2...');
    count.value = 2;
    console.log('📊 Effect runs after second update:', effectRuns);
    expect(effectRuns).toBe(3);
    expect(lastValue).toBe(2);
    
    console.log('📊 Stopping effect...');
    cleanup.stop();
    count.value = 3;
    console.log('📊 Effect runs after stop (should be 3):', effectRuns);
    expect(effectRuns).toBe(3); // Should not increase after cleanup
    
    console.log('✅ Effect test passed');
  });
});