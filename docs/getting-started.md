# Getting Started with RxHtmx

Welcome to RxHtmx! This guide will help you get up and running with reactive programming for web applications.

## What is RxHtmx?

RxHtmx bridges the gap between RxJS (reactive programming) and HTMX (server-driven UI), enabling you to build dynamic, responsive web applications with minimal complexity.

## Quick Start

### 1. Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js"></script>
    <script src="https://unpkg.com/htmx.org@1.9.6"></script>
</head>
<body>
    <input id="user-input" type="text" placeholder="Type something...">
    <div id="output"></div>

    <script type="module">
        import { createStream, bindSignalToDom } from './path/to/rxhtmx.js';
        
        // Create a reactive stream from the input
        const inputStream = createStream('#user-input');
        
        // Transform the data
        const upperCaseStream = inputStream.pipe(
            rxjs.operators.map(text => text.toUpperCase())
        );
        
        // Bind to the output element
        bindSignalToDom(upperCaseStream, '#output', (element, value) => {
            element.textContent = `You typed: ${value}`;
        });
    </script>
</body>
</html>
```

### 2. Core Concepts

#### Creating Streams
```javascript
// Create a stream from any input element
const stream = createStream('#my-input');

// The stream emits values when the user types
stream.subscribe(value => {
    console.log('User typed:', value);
});
```

#### Transforming Data
```javascript
import { debounceTime, map, filter } from 'rxjs/operators';

const stream = createStream('#search-input').pipe(
    debounceTime(300),           // Wait 300ms after user stops typing
    map(text => text.trim()),    // Remove whitespace
    filter(text => text.length > 2) // Only search if 3+ characters
);
```

#### Binding to DOM
```javascript
// Update DOM elements reactively
bindSignalToDom(stream, '#result', (element, value) => {
    element.innerHTML = `<strong>${value}</strong>`;
});
```

### 3. Common Patterns

#### Form Validation
```javascript
const emailStream = createStream('#email');
const validationStream = emailStream.pipe(
    map(email => ({
        isValid: email.includes('@'),
        message: email.includes('@') ? 'Valid email' : 'Invalid email'
    }))
);

bindSignalToDom(validationStream, '#email-feedback', (el, validation) => {
    el.textContent = validation.message;
    el.className = validation.isValid ? 'success' : 'error';
});
```

#### Search with Debouncing
```javascript
const searchStream = createStream('#search').pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => fetch(`/api/search?q=${query}`).then(r => r.json()))
);

bindSignalToDom(searchStream, '#results', (el, results) => {
    el.innerHTML = results.map(r => `<div>${r.title}</div>`).join('');
});
```

#### HTMX Integration
```javascript
// Listen to HTMX events
const htmxSignal = integrateHtmxWithSignals();

htmxSignal
    .pipe(filter(event => event.type === 'afterSwap'))
    .subscribe(event => {
        console.log('HTMX updated content:', event.detail);
    });
```

## Examples

Explore our [examples](./examples/) to see RxHtmx in action:

1. **[Form Validation](./examples/form-validation/)** - Real-time form validation
2. **[Search](./examples/search/)** - Search with autocomplete
3. **[Chat](./examples/chat/)** - Real-time chat application

## Best Practices

### 1. Always Debounce User Input
```javascript
// ✅ Good - debounced
const stream = createStream('#input').pipe(debounceTime(300));

// ❌ Bad - fires on every keystroke
const stream = createStream('#input');
```

### 2. Unsubscribe to Prevent Memory Leaks
```javascript
const subscription = stream.subscribe(handleValue);

// Later, when component unmounts
subscription.unsubscribe();
```

### 3. Handle Errors Gracefully
```javascript
const stream = createStream('#input').pipe(
    catchError(error => {
        console.error('Stream error:', error);
        return of(''); // Provide fallback value
    })
);
```

### 4. Use Meaningful Transform Functions
```javascript
// ✅ Good - clear transformations
const validEmailStream = emailStream.pipe(
    map(email => email.trim().toLowerCase()),
    filter(email => email.length > 0),
    map(email => ({ email, isValid: isValidEmail(email) }))
);
```

## Operators Cheat Sheet

| Operator | Purpose | Example |
|----------|---------|---------|
| `map` | Transform values | `.pipe(map(x => x * 2))` |
| `filter` | Filter values | `.pipe(filter(x => x > 0))` |
| `debounceTime` | Delay emissions | `.pipe(debounceTime(300))` |
| `distinctUntilChanged` | Skip duplicates | `.pipe(distinctUntilChanged())` |
| `switchMap` | Switch to new observable | `.pipe(switchMap(x => fetch(x)))` |
| `combineLatest` | Combine streams | `combineLatest([stream1, stream2])` |

## Troubleshooting

### Common Issues

**Stream not emitting values**
- Check that the element exists when creating the stream
- Verify the CSS selector is correct
- Ensure the element can receive input events

**Memory leaks**
- Always unsubscribe from streams when done
- Use operators like `takeUntil` for automatic cleanup

**Performance issues**
- Add `debounceTime` to user input streams
- Use `distinctUntilChanged` to avoid duplicate processing
- Consider using `throttleTime` for high-frequency events

## Next Steps

1. **Read the [full documentation](./docs/README.md)** for detailed API reference
2. **Try the [examples](./examples/)** to see different patterns
3. **Check out [advanced patterns](./docs/advanced.md)** for complex use cases
4. **Build your own reactive application!**

## Need Help?

- Check the [documentation](./docs/)
- Look at the [examples](./examples/)
- Review the test files for usage patterns
- Create an issue on GitHub for bugs or questions

Happy coding with RxHtmx! 🚀
