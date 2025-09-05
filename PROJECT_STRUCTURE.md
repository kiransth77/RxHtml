# RxHtmx Project Structure

```
RxHtmx/
├── 📁 src/                          # Source code
│   ├── index.js                     # Main module exports
│   └── htmxWrapper.js              # HTMX wrapper for graceful imports
│
├── 📁 tests/                        # Test suite
│   ├── integration.test.js          # Integration tests
│   ├── createStream.standalone.test.js # Standalone stream tests
│   ├── htmxSignalIntegration.standalone.test.js # HTMX integration tests
│   ├── setup.js                     # Test environment setup
│   └── 📁 mocks/                    # Mock implementations
│       └── htmx.js                  # HTMX mock for testing
│
├── 📁 docs/                         # Documentation
│   ├── README.md                    # Complete API documentation
│   ├── getting-started.md          # Quick start guide
│   └── advanced.md                 # Advanced patterns and techniques
│
├── 📁 examples/                     # Working examples
│   ├── README.md                    # Examples overview
│   ├── 📁 form-validation/          # Real-time form validation
│   │   ├── index.html
│   │   └── README.md
│   ├── 📁 search/                   # Search with autocomplete
│   │   └── index.html
│   └── 📁 chat/                     # Real-time chat demo
│       └── index.html
│
├── package.json                     # Project dependencies
├── bun.lock                        # Lock file
└── README.md                       # Project overview
```

## Quick Navigation

### 🚀 **Getting Started**
- [Project README](../README.md) - Project overview and installation
- [Getting Started Guide](./docs/getting-started.md) - Quick start tutorial
- [Form Validation Example](./examples/form-validation/) - Your first RxHtmx app

### 📚 **Documentation**
- [Complete API Reference](./docs/README.md) - Full documentation
- [Advanced Patterns](./docs/advanced.md) - Complex use cases and patterns
- [Test Suite](./tests/) - Comprehensive test examples

### 💡 **Examples**
- [Form Validation](./examples/form-validation/) - Real-time form validation
- [Search & Autocomplete](./examples/search/) - Interactive search experience  
- [Real-time Chat](./examples/chat/) - Simulated chat application

### 🔧 **Development**
- [Source Code](./src/) - Main implementation
- [Tests](./tests/) - Test-driven development examples
- [Build & Test](../package.json) - Development scripts

## Key Files

| File | Purpose | Description |
|------|---------|-------------|
| `src/index.js` | Main API | Core RxHtmx functions: `createStream`, `integrateHtmxWithSignals`, `bindSignalToDom` |
| `tests/integration.test.js` | Integration tests | Tests using the main module with graceful error handling |
| `tests/*.standalone.test.js` | Standalone tests | Tests without external dependencies for core logic validation |
| `examples/*/index.html` | Working examples | Complete, runnable examples demonstrating different use cases |
| `docs/getting-started.md` | Tutorial | Step-by-step introduction to RxHtmx concepts |

## Development Workflow

1. **Start with examples** - See RxHtmx in action
2. **Read getting started** - Learn core concepts  
3. **Review tests** - Understand usage patterns
4. **Build your app** - Apply RxHtmx to your project
5. **Reference docs** - Deep dive into advanced features

This structure supports both learning and development, with clear separation between implementation, testing, documentation, and examples.
