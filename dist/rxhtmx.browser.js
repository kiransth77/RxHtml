// RxHtmx Browser Bundle - Simple version that works directly in the browser
(function(global) {
    'use strict';
    
    // Ensure RxJS is available
    if (typeof rxjs === 'undefined') {
        throw new Error('RxJS must be loaded before RxHtmx');
    }
    
    const { Subject, BehaviorSubject } = rxjs;
    
    /**
     * Creates a reactive stream for an HTML element.
     * @param {string} selector - The CSS selector for the target element.
     * @returns {Subject} - An RxJS Subject for the element's events.
     */
    function createStream(selector) {
        const element = document.querySelector(selector);
        const subject = new Subject();
        
        if (!element) {
            console.warn(`Element not found for selector: ${selector}`);
            return subject;
        }
        
        // Listen to input events
        element.addEventListener('input', (event) => {
            subject.next(event.target.value);
        });
        
        // Listen to change events
        element.addEventListener('change', (event) => {
            subject.next(event.target.value);
        });
        
        return subject;
    }
    
    /**
     * Binds an RxJS signal to DOM updates.
     * @param {Observable} signal - The RxJS observable to subscribe to.
     * @param {string} selector - The CSS selector for the target element.
     * @param {function} updateFn - Function to update the DOM element.
     */
    function bindSignalToDom(signal, selector, updateFn) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found for selector: ${selector}`);
            return;
        }
        
        return signal.subscribe({
            next: (value) => updateFn(element, value),
            error: (err) => console.error('Signal error:', err)
        });
    }
    
    /**
     * Integrates HTMX with RxJS signals.
     * @param {Observable} signal - The RxJS observable to integrate.
     * @param {string} selector - The CSS selector for the HTMX element.
     * @param {Object} config - Configuration for HTMX integration.
     */
    function integrateHtmxWithSignals(signal, selector, config = {}) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found for selector: ${selector}`);
            return;
        }
        
        return signal.subscribe({
            next: (value) => {
                if (typeof htmx !== 'undefined') {
                    // Update element attributes based on signal value
                    if (config.attribute) {
                        element.setAttribute(config.attribute, value);
                    }
                    
                    // Trigger HTMX request if configured
                    if (config.trigger) {
                        htmx.trigger(element, config.trigger, { value });
                    }
                    
                    // Swap content if configured
                    if (config.swap && config.content) {
                        element.innerHTML = config.content(value);
                    }
                } else {
                    console.warn('HTMX not available');
                }
            },
            error: (err) => console.error('Integration error:', err)
        });
    }
    
    // Export functions to global scope
    global.RxHtmx = {
        createStream,
        bindSignalToDom,
        integrateHtmxWithSignals,
        version: '1.0.0'
    };
    
    // Also export individual functions for convenience
    global.createStream = createStream;
    global.bindSignalToDom = bindSignalToDom;
    global.integrateHtmxWithSignals = integrateHtmxWithSignals;
    
})(window);