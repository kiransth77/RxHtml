// Simplified integration test to debug issues
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

// Import core components
import { signal, computed, effect } from '../src/core/signal.js';

describe('Simple Integration Tests', () => {
  test('should create and update signals', () => {
    console.log('🧪 Testing basic signal functionality...');

    const count = signal(0);
    console.log('📊 Initial value:', count.value);
    expect(count.value).toBe(0);

    count.value = 5;
    console.log('📊 Updated value:', count.value);
    expect(count.value).toBe(5);

    console.log('✅ Signal test passed');
  });

  test('should create computed signals', () => {
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

  test('should run effects', () => {
    console.log('🧪 Testing effects...');

    const count = signal(0);
    let effectRuns = 0;
    let lastValue = null;

    const effectInstance = effect(() => {
      effectRuns++;
      lastValue = count.value;
      console.log('🔄 Effect run #' + effectRuns + ', value:', lastValue);
    });

    expect(effectRuns).toBe(1);
    expect(lastValue).toBe(0);

    count.value = 1;
    expect(effectRuns).toBe(2);
    expect(lastValue).toBe(1);

    count.value = 2;
    expect(effectRuns).toBe(3);
    expect(lastValue).toBe(2);

    effectInstance.stop();
    count.value = 3;
    expect(effectRuns).toBe(3); // Should not increase after cleanup

    console.log('✅ Effect test passed');
  });

  test('should handle basic DOM manipulation', () => {
    console.log('🧪 Testing basic DOM...');

    const app = document.getElementById('app');
    expect(app).toBeTruthy();

    app.innerHTML = '<div data-testid="test">Hello World</div>';
    const testEl = app.querySelector('[data-testid="test"]');
    expect(testEl.textContent).toBe('Hello World');

    console.log('✅ DOM test passed');
  });
});
