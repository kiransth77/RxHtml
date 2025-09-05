import { describe, it, expect, beforeEach } from 'bun:test';
import { JSDOM } from 'jsdom';
import { Subject } from 'rxjs';

// Standalone implementation of createStream for testing
function createTestStream(selector) {
  const element = document.querySelector(selector);
  const subject = new Subject();

  if (element) {
    element.addEventListener('input', (event) => {
      subject.next(event.target.value);
    });
  } else {
    console.warn(`Element not found for selector: ${selector}`);
  }

  return subject;
}

describe('createStream (Standalone)', () => {
  let dom;
  let warnMock;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    global.Event = dom.window.Event;

    // Manual mock for console.warn
    warnMock = { calls: [] };
    global.console = { warn: (message) => warnMock.calls.push(message) };
  });

  it('should create a stream for an existing element', () => {
    // Set up a mock DOM element
    document.body.innerHTML = '<input id="test-element" />';
    const stream = createTestStream('#test-element');

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

  it('should warn if the element does not exist', () => {
    const stream = createTestStream('#nonexistent-element');

    // Check that a warning was logged
    expect(warnMock.calls).toContain('Element not found for selector: #nonexistent-element');
  });

  it('should handle multiple values', () => {
    document.body.innerHTML = '<input id="test-element" />';
    const stream = createTestStream('#test-element');

    const receivedValues = [];
    stream.subscribe(value => {
      receivedValues.push(value);
    });

    const inputElement = document.querySelector('#test-element');

    // Simulate multiple input events
    inputElement.value = 'first';
    inputElement.dispatchEvent(new Event('input'));

    inputElement.value = 'second';
    inputElement.dispatchEvent(new Event('input'));

    expect(receivedValues).toEqual(['first', 'second']);
  });
});
