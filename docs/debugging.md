# VS Code Debug Configuration Guide

This guide explains how to use the VS Code debugging configurations for the RxHtmx project.

## 🚀 Available Launch Configurations

### Example Applications

#### 🎯 Debug Form Validation Example
- **Purpose**: Debug the reactive form validation example
- **File**: `examples/form-validation/index.html`
- **Usage**: Set breakpoints in the JavaScript code and debug form validation logic
- **Features**: Real-time validation, cross-field validation, reactive UI updates

#### 🔍 Debug Search Example  
- **Purpose**: Debug the search with autocomplete example
- **File**: `examples/search/index.html`
- **Usage**: Debug search streams, autocomplete logic, and API simulation
- **Features**: Debounced search, suggestions, loading states

#### 💬 Debug Chat Example
- **Purpose**: Debug the real-time chat application
- **File**: `examples/chat/index.html` 
- **Usage**: Debug message streams, typing indicators, and state management
- **Features**: Real-time messaging, user simulation, reactive state

### Testing Configurations

#### 🧪 Debug Tests
- **Purpose**: Debug all test suites
- **Usage**: Set breakpoints in test files and debug test logic
- **Includes**: Integration tests, standalone tests, mock implementations

#### 🧪 Debug Specific Test
- **Purpose**: Debug the currently open test file
- **Usage**: Open a test file and run this configuration to debug just that test

### Development Server

#### 🚀 Launch with Live Server
- **Purpose**: Debug examples with live reload
- **URL**: `http://localhost:5500/`
- **Usage**: Requires Live Server extension, provides hot reload during development

## 🛠️ How to Debug

### 1. Debugging Examples

1. **Open an example file** (e.g., `examples/form-validation/index.html`)
2. **Set breakpoints** in the JavaScript code by clicking in the gutter
3. **Press F5** or go to Run & Debug panel
4. **Select the appropriate configuration** (e.g., "🎯 Debug Form Validation Example")
5. **Chrome will launch** with the debugger attached
6. **Interact with the page** to trigger your breakpoints

### 2. Debugging Tests

1. **Open a test file** (e.g., `tests/integration.test.js`)
2. **Set breakpoints** in the test code
3. **Select "🧪 Debug Tests"** configuration
4. **Run the debugger** - tests will run with breakpoints active

### 3. Common Debugging Scenarios

#### Debugging Reactive Streams
```javascript
// Set breakpoints in pipe operations
const stream = createStream('#input').pipe(
    debounceTime(300),        // ← Breakpoint here
    map(value => {            // ← Breakpoint here
        console.log('Processing:', value);
        return value.toUpperCase();
    }),
    filter(value => {         // ← Breakpoint here
        return value.length > 2;
    })
);
```

#### Debugging DOM Bindings
```javascript
// Set breakpoints in update functions
bindSignalToDom(stream, '#output', (element, value) => {
    console.log('Updating DOM:', element, value);  // ← Breakpoint here
    element.textContent = value;
});
```

#### Debugging Event Handling
```javascript
// Set breakpoints in event handlers
htmxSignal.subscribe(event => {
    console.log('HTMX Event:', event);  // ← Breakpoint here
    // Process event...
});
```

## 🔧 Available Tasks

Access these through **Terminal > Run Task** or **Ctrl+Shift+P > Tasks: Run Task**:

### Testing Tasks
- **🧪 Run All Tests** - Execute the complete test suite
- **🧪 Run Tests (Watch Mode)** - Continuously run tests when files change

### Development Tasks  
- **🚀 Start Live Server** - Launch development server with hot reload
- **📦 Install Dependencies** - Install/update project dependencies
- **🔍 Check Package Versions** - List installed packages
- **📝 Validate Examples** - Check all examples are working

## 💡 Debugging Tips

### 1. Browser DevTools Integration
- Use Chrome DevTools alongside VS Code debugger
- Network tab for API calls (in search example)
- Console for RxJS stream debugging
- Elements tab for DOM changes

### 2. RxJS Stream Debugging
```javascript
// Add tap operators for debugging
const stream = createStream('#input').pipe(
    tap(value => console.log('Input:', value)),
    debounceTime(300),
    tap(value => console.log('After debounce:', value)),
    map(value => value.toUpperCase()),
    tap(value => console.log('After map:', value))
);
```

### 3. Conditional Breakpoints
- Right-click on breakpoint → Edit Breakpoint
- Add conditions like `value.length > 5`
- Useful for debugging specific stream values

### 4. Watch Expressions
- Add variables to Watch panel
- Monitor RxJS Subject values
- Track DOM element states

## 🐛 Troubleshooting

### Common Issues

**Breakpoints not hitting**
- Ensure source maps are enabled
- Check file paths in launch configuration
- Verify Chrome security settings

**CORS errors in examples**
- Use the Live Server configuration
- Or add `--disable-web-security` flag (already included)

**Module import errors**
- Check relative paths in examples
- Ensure VS Code workspace is set to project root

**Test debugging not working**
- Verify Bun is installed and accessible
- Check test file paths in launch configuration

### Browser Security Settings

The launch configurations include these Chrome flags for local development:
- `--disable-web-security` - Allows file:// protocol access
- `--disable-features=VizDisplayCompositor` - Improves debugging
- `--allow-file-access-from-files` - Enables local file imports

## 📋 Quick Reference

| Key | Action |
|-----|--------|
| `F5` | Start debugging |
| `Ctrl+F5` | Start without debugging |
| `F9` | Toggle breakpoint |
| `F10` | Step over |
| `F11` | Step into |
| `Shift+F11` | Step out |
| `Ctrl+Shift+F5` | Restart debugger |

## 🎯 Example Debugging Workflow

1. **Open** `examples/form-validation/index.html`
2. **Set breakpoint** in the validation function
3. **Launch** "🎯 Debug Form Validation Example"
4. **Type** in the form fields to trigger validation
5. **Step through** the reactive stream transformations
6. **Inspect** DOM updates in real-time
7. **Modify** code and reload to test changes

This setup provides a complete debugging environment for developing and understanding RxHtmx applications!
