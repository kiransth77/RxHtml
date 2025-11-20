import { describe, it, expect, beforeEach } from 'bun:test';
import { createStream } from '../src/index';
import { JSDOM } from 'jsdom';

describe('createStream', () => {
  let dom;
  let warnMock;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    global.Event = dom.window.Event;

    // Manual mock for console.warn
    warnMock = () => {};
    warnMock.calls = [];
    global.console = { warn: message => warnMock.calls.push(message) };
  });

  it('should create a stream for an existing element', () => {
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

  it('should warn if the element does not exist', () => {
    createStream('#non-existent-element');

    expect(warnMock.calls).toContain(
      'Element not found for selector: #non-existent-element'
    );
  });
});
