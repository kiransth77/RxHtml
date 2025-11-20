// Global test setup for RxHtmx
import { JSDOM } from 'jsdom';

// Set up a DOM environment for tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
});
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
global.location = dom.window.location;
global.history = dom.window.history;
global.navigator = dom.window.navigator;

// Mock htmx globally before any other imports
import mockHtmx from './mocks/htmx.js';

// Set htmx globally
global.htmx = mockHtmx;
globalThis.htmx = mockHtmx;

console.log('Test setup complete - HTMX mocked globally');
