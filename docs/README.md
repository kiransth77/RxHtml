# RxHtmx Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [API Reference](#api-reference)
4. [Examples](#examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Getting Started

RxHtmx is a reactive library that bridges RxJS and HTMX, enabling you to create reactive, server-driven applications with minimal complexity.

### Prerequisites

- Basic knowledge of JavaScript
- Familiarity with RxJS concepts (Observables, Subjects)
- Understanding of HTMX for server-driven UI updates

### Installation

```bash
# Using Bun
bun add rxhtmx rxjs htmx.org

# Using npm
npm install rxhtmx rxjs htmx.org

# Using yarn
yarn add rxhtmx rxjs htmx.org
```

### Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/htmx.org@1.9.6"></script>
    <script type="module">
        import { createStream, integrateHtmxWithSignals } from './path/to/rxhtmx.js';
        
        // Create a reactive stream from an input
        const inputStream = createStream('#user-input');
        inputStream.subscribe(value => console.log('Input:', value));
        
        // Listen to HTMX events
        const htmxSignal = integrateHtmxWithSignals();
        htmxSignal.subscribe(event => console.log('HTMX Event:', event));
    </script>
</head>
<body>
    <input id="user-input" type="text" placeholder="Type something...">
    <button hx-get="/api/data" hx-target="#result">Load Data</button>
    <div id="result"></div>
</body>
</html>
```

## Core Concepts

### Reactive Streams

RxHtmx creates RxJS streams from DOM elements, allowing you to react to user interactions in a functional, declarative way.

```javascript
import { createStream } from 'rxhtmx';

const stream = createStream('#my-input');
stream.subscribe(value => {
    // React to input changes
    console.log('User typed:', value);
});
```

### HTMX Integration

HTMX events are converted into reactive streams, enabling you to respond to server interactions using RxJS operators.

```javascript
import { integrateHtmxWithSignals } from 'rxhtmx';

const htmxSignal = integrateHtmxWithSignals();
htmxSignal
    .filter(event => event.type === 'afterSwap')
    .subscribe(event => {
        console.log('Content updated:', event.detail);
    });
```

### Signal Binding

Bind RxJS signals directly to DOM elements for reactive UI updates.

```javascript
import { bindSignalToDom } from 'rxhtmx';
import { Subject } from 'rxjs';

const dataSignal = new Subject();
bindSignalToDom(dataSignal, '#output', (element, value) => {
    element.innerHTML = `<p>Data: ${value}</p>`;
});

dataSignal.next('Hello World!');
```

## API Reference

### `createStream(selector)`

Creates an RxJS Subject that emits values when the specified element receives input events.

**Parameters:**
- `selector` (string): CSS selector for the target element

**Returns:**
- `Subject`: RxJS Subject that emits input values

**Example:**
```javascript
const inputStream = createStream('#email-input');
inputStream
    .debounce(300)
    .filter(email => email.includes('@'))
    .subscribe(email => validateEmail(email));
```

### `integrateHtmxWithSignals()`

Creates an RxJS Subject that emits HTMX events as reactive signals.

**Returns:**
- `Subject`: RxJS Subject that emits HTMX event objects

**Event Object Structure:**
```javascript
{
    type: 'afterSwap' | 'beforeRequest' | /* other HTMX events */,
    detail: /* HTMX event detail object */
}
```

**Example:**
```javascript
const htmxSignal = integrateHtmxWithSignals();
htmxSignal
    .filter(event => event.type === 'afterSwap')
    .map(event => event.detail)
    .subscribe(detail => {
        console.log('New content loaded:', detail);
    });
```

### `bindSignalToDom(signal$, selector, updateFn)`

Binds an RxJS observable to a DOM element with a custom update function.

**Parameters:**
- `signal$` (Observable): RxJS observable to bind
- `selector` (string): CSS selector for the target element
- `updateFn` (function): Function to update the element `(element, value) => void`

**Returns:**
- `Subscription`: RxJS subscription that can be unsubscribed

**Example:**
```javascript
import { interval } from 'rxjs';

const timer$ = interval(1000);
const subscription = bindSignalToDom(timer$, '#timer', (el, count) => {
    el.textContent = `Timer: ${count}`;
});

// Later: subscription.unsubscribe();
```

## Examples

See the [examples](./examples/) directory for complete working examples:

- [Basic Form Validation](./examples/form-validation/)
- [Real-time Chat](./examples/chat/)
- [Search with Autocomplete](./examples/search/)
- [Shopping Cart](./examples/shopping-cart/)

## Best Practices

### 1. Memory Management

Always unsubscribe from streams to prevent memory leaks:

```javascript
const stream = createStream('#input');
const subscription = stream.subscribe(value => {
    // Handle value
});

// Clean up when component unmounts
subscription.unsubscribe();
```

### 2. Error Handling

Use RxJS error handling operators:

```javascript
const stream = createStream('#input')
    .pipe(
        catchError(error => {
            console.error('Stream error:', error);
            return of(''); // Provide fallback value
        })
    );
```

### 3. Debouncing User Input

Debounce rapid user input to improve performance:

```javascript
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

createStream('#search-input')
    .pipe(
        debounceTime(300),
        distinctUntilChanged()
    )
    .subscribe(query => performSearch(query));
```

### 4. Combining Streams

Combine multiple streams for complex interactions:

```javascript
import { combineLatest } from 'rxjs';

const nameStream = createStream('#name');
const emailStream = createStream('#email');

combineLatest([nameStream, emailStream])
    .pipe(
        map(([name, email]) => ({ name, email })),
        filter(({ name, email }) => name && email)
    )
    .subscribe(user => enableSubmitButton());
```

## Troubleshooting

### Common Issues

**1. "Element not found" warning**
```javascript
// Ensure the element exists before creating the stream
if (document.querySelector('#my-input')) {
    const stream = createStream('#my-input');
}
```

**2. HTMX events not firing**
```javascript
// Make sure HTMX is loaded before integrating signals
document.addEventListener('DOMContentLoaded', () => {
    const htmxSignal = integrateHtmxWithSignals();
});
```

**3. Memory leaks**
```javascript
// Always store subscriptions and unsubscribe
const subscriptions = [];
subscriptions.push(stream.subscribe(...));

// Clean up
subscriptions.forEach(sub => sub.unsubscribe());
```

### Browser Compatibility

RxHtmx requires:
- ES6 module support
- Modern DOM APIs
- RxJS 7+
- HTMX 1.8+

### Testing

For testing RxHtmx applications:

```javascript
// Use the standalone test implementations
import { createTestStream } from 'rxhtmx/testing';

// Mock DOM environment
import { JSDOM } from 'jsdom';
const dom = new JSDOM();
global.document = dom.window.document;
```

## Performance Tips

1. **Use operators wisely**: Leverage RxJS operators like `debounceTime`, `throttleTime`, and `distinctUntilChanged`
2. **Unsubscribe properly**: Always clean up subscriptions
3. **Batch DOM updates**: Use `bindSignalToDom` for efficient DOM manipulation
4. **Profile your streams**: Use RxJS debugging tools to identify bottlenecks

For more advanced usage and patterns, check out our [advanced guide](./advanced.md).
