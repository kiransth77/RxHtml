import './mocks/htmx.js';
import { JSDOM } from 'jsdom';
import { integrateHtmxWithSignals } from '../src/index.js';
import { Subject } from 'rxjs';

// Set up a DOM environment for HTMX
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;

// Mock the HTMX wrapper module
jest.mock('../src/htmxWrapper.js', () => require('./mocks/htmx.js'));

describe('HTMX and RxJS Integration', () => {
  let htmxSignal;

  beforeEach(() => {
    // Set up the HTMX signal
    htmxSignal = integrateHtmxWithSignals();
  });

  test('should emit signals on HTMX events', done => {
    const mockEvent = new CustomEvent('htmx:afterSwap', {
      detail: { message: 'HTMX swap occurred' },
    });

    htmxSignal.subscribe(event => {
      try {
        expect(event.type).toBe('afterSwap');
        expect(event.detail.message).toBe('HTMX swap occurred');
        done();
      } catch (error) {
        done(error);
      }
    });

    document.body.dispatchEvent(mockEvent);
  });

  test('should bind signal to DOM and update element', () => {
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
