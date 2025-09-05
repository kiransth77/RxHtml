# Examples Overview

This directory contains practical examples demonstrating different aspects of RxHtmx in action.

## Available Examples

### 1. [Form Validation](./form-validation/)
**Real-time form validation with reactive feedback**

- ✅ Debounced input validation
- ✅ Cross-field validation (password confirmation)
- ✅ Visual feedback with color-coded fields
- ✅ Form-wide state management
- ✅ Complex validation rules

**Key Learning**: How to create responsive forms with immediate user feedback using reactive streams.

### 2. [Search with Autocomplete](./search/)
**Interactive search with suggestions and real-time results**

- ✅ Debounced search queries
- ✅ Autocomplete suggestions
- ✅ Loading states and error handling
- ✅ Click-to-select suggestions
- ✅ Search performance metrics

**Key Learning**: Implementing search UX patterns with reactive programming for optimal performance.

### 3. [Real-time Chat](./chat/)
**Simulated real-time chat application**

- ✅ Message streams and state management
- ✅ Typing indicators
- ✅ Multi-user simulation
- ✅ Real-time UI updates
- ✅ User switching and message ownership

**Key Learning**: Managing complex application state and real-time interactions with RxJS.

## Running the Examples

Each example is a standalone HTML file that can be opened directly in a web browser:

1. Navigate to the example directory
2. Open `index.html` in your browser
3. Interact with the application to see RxHtmx in action

## Example Features

### Common Patterns Demonstrated

- **Debouncing**: Preventing excessive API calls or validations
- **Stream Composition**: Combining multiple reactive streams
- **State Management**: Using BehaviorSubjects for application state
- **Error Handling**: Graceful degradation and error recovery
- **UI Binding**: Reactive DOM updates with `bindSignalToDom`

### Code Structure

Each example follows a similar structure:

```javascript
// 1. Create input streams
const inputStream = createStream('#input').pipe(
    debounceTime(300),
    distinctUntilChanged()
);

// 2. Transform data
const processedStream = inputStream.pipe(
    map(transformData),
    filter(validateData)
);

// 3. Bind to UI
bindSignalToDom(processedStream, '#output', updateFunction);
```

## Learning Path

**Beginner**: Start with [Form Validation](./form-validation/) to understand basic reactive concepts.

**Intermediate**: Try [Search](./search/) to learn about async operations and user experience patterns.

**Advanced**: Explore [Chat](./chat/) for complex state management and real-time interactions.

## Customization

All examples use mock data and simulated backends. You can easily adapt them to work with real APIs by:

1. Replacing mock functions with actual HTTP calls
2. Adding authentication and error handling
3. Integrating with your backend services
4. Adding more complex business logic

## Browser Compatibility

Examples work in all modern browsers that support:
- ES6 modules
- Async/await
- DOM APIs
- CSS Grid/Flexbox

## Next Steps

After exploring these examples, check out:
- [Documentation](../docs/) for detailed API reference
- [Advanced Patterns](../docs/advanced.md) for complex use cases
- Create your own examples and contribute back to the project!

Each example includes detailed comments explaining the reactive patterns and RxHtmx usage. Feel free to modify and experiment with the code to deepen your understanding!
