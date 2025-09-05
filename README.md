# RxHtmx

# RxHtmx

A reactive library that bridges RxJS and HTMX, enabling seamless integration between reactive programming and server-driven UI updates.

## Features

- **Stream Creation**: Create RxJS streams from DOM elements
- **HTMX Integration**: Listen to HTMX events as reactive streams
- **Signal Binding**: Bind RxJS signals to DOM elements
- **Test-Driven Development**: Comprehensive test coverage with Bun

## Installation

```bash
bun install
```

## Usage

### Creating Streams from DOM Elements

```javascript
import { createStream } from 'rxhtmx';

// Create a stream from an input element
const inputStream = createStream('#my-input');

// Subscribe to value changes
inputStream.subscribe(value => {
  console.log('Input value:', value);
});
```

### HTMX Event Integration

```javascript
import { integrateHtmxWithSignals } from 'rxhtmx';

// Create a stream that listens to HTMX events
const htmxSignal = integrateHtmxWithSignals();

// React to HTMX events
htmxSignal.subscribe(event => {
  if (event.type === 'afterSwap') {
    console.log('HTMX content swapped:', event.detail);
  }
});
```

### Binding Signals to DOM

```javascript
import { bindSignalToDom } from 'rxhtmx';
import { Subject } from 'rxjs';

// Create a signal
const dataSignal = new Subject();

// Bind the signal to a DOM element
bindSignalToDom(dataSignal, '#output', (element, value) => {
  element.textContent = value;
});

// Update the DOM through the signal
dataSignal.next('Hello, RxHtmx!');
```

## Testing

The project includes comprehensive tests that demonstrate the functionality:

```bash
# Run all tests
bun test tests/integration.test.js tests/createStream.standalone.test.js tests/htmxSignalIntegration.standalone.test.js

# Run specific test suites
bun test tests/integration.test.js
bun test tests/createStream.standalone.test.js
bun test tests/htmxSignalIntegration.standalone.test.js
```

### Test Architecture

- **Integration Tests**: Test the main module functions with graceful HTMX handling
- **Standalone Tests**: Test core functionality without external dependencies
- **DOM Simulation**: Uses JSDOM for testing in Node.js environment

## Development

### Project Structure

```
src/
  ├── index.js           # Main module exports
  ├── htmxWrapper.js     # HTMX wrapper for graceful import handling
tests/
  ├── integration.test.js                    # Main integration tests
  ├── createStream.standalone.test.js        # Standalone stream tests
  ├── htmxSignalIntegration.standalone.test.js # Standalone HTMX integration tests
  ├── setup.js           # Test environment setup
  └── mocks/
      └── htmx.js        # HTMX mock for testing
```

### Key Design Decisions

1. **Graceful HTMX Loading**: The library handles environments where HTMX is not available (like Node.js/testing)
2. **Test-Driven Development**: Comprehensive test coverage ensures reliability
3. **Modular Architecture**: Clean separation between core functionality and HTMX integration

## Browser Compatibility

This library is designed to work in modern browsers that support:
- ES6 modules
- DOM APIs
- RxJS
- HTMX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass with `bun test`
5. Submit a pull request

## License

MIT License

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for discussion.
