/**
 * DevTools Panel Integration Tests
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { JSDOM } from 'jsdom';
import { signal } from '../src/core/signals.js';

describe('DevTools Panel', () => {
  let dom;
  let document;
  let devtools;

  beforeEach(async () => {
    // Setup DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });

    global.document = dom.window.document;
    global.window = dom.window;
    global.requestAnimationFrame = cb => setTimeout(cb, 16);

    // Mock import.meta.env
    global.import = {
      meta: {
        env: { DEV: true },
      },
    };

    // Dynamically import devtools to get fresh instance
    const module = await import('../src/devtools/panel.js');
    devtools = module.devtools;
  });

  afterEach(() => {
    devtools.hide();
    if (devtools.panel) {
      devtools.panel.remove();
      devtools.panel = null;
      devtools.enabled = false;
    }
    delete global.document;
    delete global.window;
    delete global.import;
  });

  test('should initialize panel on first init', () => {
    devtools.init();

    expect(devtools.enabled).toBe(true);
    expect(devtools.panel).toBeTruthy();
    expect(devtools.panel.id).toBe('__rxhtmx_devtools');
  });

  test('should create panel with correct structure', () => {
    devtools.init();

    const panel = document.getElementById('__rxhtmx_devtools');
    expect(panel).toBeTruthy();

    // Check for header
    const header = panel.querySelector('div');
    expect(header.textContent).toContain('RxHtmx DevTools');

    // Check for tabs
    const tabs = panel.querySelectorAll('.devtools-tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0].dataset.tab).toBe('signals');
    expect(tabs[1].dataset.tab).toBe('components');
    expect(tabs[2].dataset.tab).toBe('performance');

    // Check for content area
    const content = panel.querySelector('#__rxhtmx_devtools_content');
    expect(content).toBeTruthy();
  });

  test('should register and display signals', () => {
    const testSignal = signal(42);

    devtools.init();
    devtools.registerSignal('testCounter', testSignal);

    expect(devtools.signals.has('testCounter')).toBe(true);
    expect(devtools.signals.get('testCounter')).toBe(testSignal);

    // Render signals tab
    devtools.show();
    const content = document.getElementById('__rxhtmx_devtools_content');
    expect(content.innerHTML).toContain('testCounter');
    expect(content.innerHTML).toContain('42');
  });

  test('should register and display components', () => {
    const testComponent = {
      props: { id: 'test', name: 'TestComponent' },
    };

    devtools.init();
    devtools.registerComponent('comp-1', testComponent);

    expect(devtools.components.has('comp-1')).toBe(true);
    expect(devtools.components.get('comp-1')).toBe(testComponent);
  });

  test('should toggle visibility', () => {
    devtools.init();

    // Initially hidden
    expect(devtools.panel.style.display).toBe('none');

    // Show
    devtools.show();
    expect(devtools.panel.style.display).toBe('flex');

    // Hide
    devtools.hide();
    expect(devtools.panel.style.display).toBe('none');

    // Toggle
    devtools.toggle();
    expect(devtools.panel.style.display).toBe('flex');

    devtools.toggle();
    expect(devtools.panel.style.display).toBe('none');
  });

  test('should switch between tabs', () => {
    devtools.init();
    devtools.show();

    const tabs = document.querySelectorAll('.devtools-tab');
    const signalsTab = tabs[0];
    const componentsTab = tabs[1];

    // Initially on signals tab
    expect(signalsTab.classList.contains('active')).toBe(true);

    // Click components tab
    componentsTab.click();

    expect(componentsTab.classList.contains('active')).toBe(true);
    expect(signalsTab.classList.contains('active')).toBe(false);
  });

  test('should close panel on close button click', () => {
    devtools.init();
    devtools.show();

    expect(devtools.panel.style.display).toBe('flex');

    const closeButton = document.getElementById('__rxhtmx_devtools_close');
    closeButton.click();

    expect(devtools.panel.style.display).toBe('none');
  });

  test('should escape HTML in signal values', () => {
    const maliciousSignal = signal('<script>alert("xss")</script>');

    devtools.init();
    devtools.registerSignal('dangerous', maliciousSignal);
    devtools.show();

    const content = document.getElementById('__rxhtmx_devtools_content');
    expect(content.innerHTML).toContain('&lt;script&gt;');
    expect(content.innerHTML).not.toContain('<script>alert');
  });

  test('should handle object signal values', () => {
    const objSignal = signal({ count: 5, name: 'test' });

    devtools.init();
    devtools.registerSignal('objectSignal', objSignal);
    devtools.show();

    const content = document.getElementById('__rxhtmx_devtools_content');
    expect(content.innerHTML).toContain('count');
    expect(content.innerHTML).toContain('test');
  });

  test('should display empty state when no signals registered', () => {
    devtools.init();
    devtools.show();

    const content = document.getElementById('__rxhtmx_devtools_content');
    expect(content.innerHTML).toContain('No signals registered');
  });

  test('should display empty state when no components registered', () => {
    devtools.init();
    devtools.show();

    // Switch to components tab
    const tabs = document.querySelectorAll('.devtools-tab');
    tabs[1].click();

    const content = document.getElementById('__rxhtmx_devtools_content');
    expect(content.innerHTML).toContain('No components registered');
  });

  test('should not initialize twice', () => {
    devtools.init();
    const firstPanel = devtools.panel;

    devtools.init();

    expect(devtools.panel).toBe(firstPanel);
    expect(document.querySelectorAll('#__rxhtmx_devtools').length).toBe(1);
  });

  test('should handle keyboard shortcut', () => {
    devtools.init();

    // Initially hidden
    expect(devtools.panel.style.display).toBe('none');

    // Simulate Ctrl+Shift+D
    const event = new dom.window.KeyboardEvent('keydown', {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    // Should toggle visibility
    expect(devtools.panel.style.display).toBe('flex');
  });
});
