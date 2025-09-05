import { JSDOM } from 'jsdom';
import { Subject } from 'rxjs';

// Set up a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;

// Import our main module functions
import { createStream, integrateHtmxWithSignals, bindSignalToDom } from '../src/index.js';

describe('RxHtmx Integration Tests', () => {
  describe('createStream', () => {
    let warnMock;

    beforeEach(() => {
      // Manual mock for console.warn
      warnMock = { calls: [] };
      global.console = { warn: (message) => warnMock.calls.push(message) };
    });

    test('should create a stream for an existing element', () => {
      // Set up a mock DOM element
      document.body.innerHTML = '<input id="test-element" />';
      const stream = createStream('#test-element');

      // Subscribe to the stream and simulate an input event
      let receivedValue = null;
      stream.subscribe(value => {
        receivedValue = value;
      });

      const inputElement = document.querySelector('#test-element');
      inputElement.value = 'test';
      inputElement.dispatchEvent(new Event('input'));

      // Assert the received value
      expect(receivedValue).toBe('test');
    });

    test('should warn if the element does not exist', () => {
      const stream = createStream('#nonexistent-element');

      // Check that a warning was logged
      expect(warnMock.calls).toContain('Element not found for selector: #nonexistent-element');
    });
  });

  describe('HTMX Integration', () => {
    test('should integrate with signals (mock environment)', () => {
      // In test environment, the function should still work for DOM events
      const htmxSignal = integrateHtmxWithSignals();
      
      const mockEvent = new CustomEvent('htmx:afterSwap', {
        detail: { message: 'HTMX swap occurred' },
      });

      let receivedEvent = null;
      htmxSignal.subscribe((event) => {
        receivedEvent = event;
      });

      document.body.dispatchEvent(mockEvent);

      expect(receivedEvent).toEqual({
        type: 'afterSwap',
        detail: { message: 'HTMX swap occurred' }
      });
    });

    test('should bind signal to DOM', () => {
      document.body.innerHTML = '<div id="test-element"></div>';

      const signal$ = new Subject();
      const updateFn = (element, value) => {
        element.textContent = value;
      };

      bindSignalToDom(signal$, '#test-element', updateFn);

      signal$.next('Updated content');

      const element = document.querySelector('#test-element');
      expect(element.textContent).toBe('Updated content');
    });
  });
});
