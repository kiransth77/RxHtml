import { JSDOM } from 'jsdom';
import { Subject } from 'rxjs';

// Set up a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;

// Create standalone versions of the functions for testing without htmx dependency
function createTestIntegrateHtmxWithSignals() {
    const htmxSignal = new Subject();

    // Listen to HTMX events and emit them as signals
    document.body.addEventListener('htmx:afterSwap', (event) => {
        htmxSignal.next({ type: 'afterSwap', detail: event.detail });
    });

    document.body.addEventListener('htmx:beforeRequest', (event) => {
        htmxSignal.next({ type: 'beforeRequest', detail: event.detail });
    });

    return htmxSignal;
}

function createTestBindSignalToDom(signal$, selector, updateFn) {
    const subscription = signal$.subscribe((value) => {
        const element = document.querySelector(selector);
        if (element) {
            updateFn(element, value);
        }
    });

    return subscription;
}

describe('HTMX and RxJS Integration (Standalone)', () => {
    let htmxSignal;

    beforeEach(() => {
        // Set up the HTMX signal
        htmxSignal = createTestIntegrateHtmxWithSignals();
    });

    test('should emit signals on HTMX events', (done) => {
        const mockEvent = new CustomEvent('htmx:afterSwap', {
            detail: { message: 'HTMX swap occurred' },
        });

        htmxSignal.subscribe((event) => {
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

        createTestBindSignalToDom(signal$, '#test-element', updateFn);

        signal$.next('Updated content');

        const element = document.querySelector('#test-element');
        expect(element.textContent).toBe('Updated content');
    });
});
