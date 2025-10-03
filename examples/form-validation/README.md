# Form Validation Example

This example demonstrates building a robust form validation system using the RxHtmx framework, showcasing component architecture, reactive signals, and state management.

## Framework Features Demonstrated

- **Component-based architecture** with lifecycle hooks
- **Reactive form validation** using framework signals
- **State management** with integrated stores
- **Custom validation components** and reusable patterns
- **Error boundaries** for graceful error handling
- **Performance optimization** with selective re-rendering

## Key Components

### 1. FormValidation Component

```javascript
class FormValidationComponent extends Component {
  constructor() {
    super();
    this.formStore = createStore({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      isValid: false
    });
  }

  onMount() {
    this.setupValidation();
  }

  setupValidation() {
    const username$ = this.formStore.select('username');
    const email$ = this.formStore.select('email');
    
    // Reactive validation with debouncing
    const usernameValidation$ = username$.pipe(
      debounceTime(300),
      map(this.validateUsername)
    );
  }
}
```

### 2. Custom Validation Components

```javascript
class PasswordStrengthComponent extends Component {
  render({ password, validation }) {
    const strengthClass = this.getStrengthClass(validation.score);
    return `
      <div class="password-strength ${strengthClass}">
        <div class="strength-meter"></div>
        <span class="strength-text">${validation.message}</span>
      </div>
    `;
  }
}
```

### 3. Form State Management

```javascript
// Framework store integration
const formStore = createStore({
  fields: {
    username: { value: '', validation: null },
    email: { value: '', validation: null },
    password: { value: '', validation: null }
  },
  isSubmitting: false,
  submitCount: 0
});

// Reactive selectors
const isFormValid$ = formStore.select(state => 
  Object.values(state.fields).every(field => field.validation?.valid)
);
```
## Running the Example

### Development Mode
```bash
# Using framework CLI
rxhtmx dev examples/form-validation

# Or using npm scripts
npm run dev:examples
```

### Production Build
```bash
rxhtmx build examples/form-validation
```

### Direct Browser Access
1. Open `index.html` in a web browser
2. Experience the component-based validation system
3. Observe reactive state updates and error boundaries
4. Test form submission and success handling

## Validation Architecture

### Component Hierarchy
```
FormValidationComponent
├── InputFieldComponent (username)
├── EmailFieldComponent 
├── PasswordFieldComponent
│   └── PasswordStrengthComponent
├── ConfirmPasswordComponent
└── SubmitButtonComponent
```

### Validation Rules
- **Username**: 3+ characters, alphanumeric + underscores, uniqueness check
- **Email**: RFC-compliant format validation with domain verification
- **Password**: 8+ characters, complexity requirements, common password detection
- **Confirm Password**: Real-time matching with original password
- **Form-level**: Cross-field validation and business rule checking

## Advanced Framework Features

### 1. Error Boundaries
```javascript
class FormErrorBoundary extends ErrorBoundary {
  handleError(error, errorInfo) {
    // Track validation errors
    this.setState({ hasError: true, error });
    // Send to monitoring service
    analytics.trackFormError(error, errorInfo);
  }
}
```

### 2. Performance Optimization
```javascript
// Selective re-rendering with memo
const MemoizedPasswordStrength = memo(PasswordStrengthComponent, 
  (prevProps, nextProps) => prevProps.score === nextProps.score
);

// Virtual scrolling for large option lists
const CountrySelectComponent = lazy(() => 
  import('./CountrySelectWithVirtualScrolling')
);
```

### 3. Testing Integration
```javascript
// Framework testing utilities
describe('Form Validation', () => {
  test('validates email format', () => {
    const component = mount(EmailFieldComponent);
    component.setProps({ value: 'invalid-email' });
    expect(component.find('.error-message')).toBeVisible();
  });
});
```

## Learning Outcomes

- **Component Architecture**: Building reusable validation components with lifecycle management
- **Reactive State**: Managing complex form state with framework stores and signals
- **Performance**: Optimizing validation performance with memoization and selective updates
- **Error Handling**: Implementing robust error boundaries and user feedback
- **Testing**: Writing comprehensive tests for validation logic and component behavior
- **Accessibility**: Creating accessible forms with ARIA attributes and keyboard navigation

This example demonstrates how the RxHtmx framework enables building sophisticated, production-ready form systems with excellent developer experience and user interface responsiveness.
