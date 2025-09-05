# Form Validation Example

This example demonstrates real-time form validation using RxHtmx, combining reactive programming with immediate user feedback.

## Features

- **Real-time validation** as users type
- **Visual feedback** with color-coded input fields
- **Debounced input** to avoid excessive validation calls
- **Complex validation rules** including password strength and confirmation
- **Form-wide state management** with submit button control

## Key Concepts Demonstrated

### 1. Input Streams with Debouncing

```javascript
const usernameStream = createStream('#username').pipe(
    debounceTime(300),           // Wait 300ms after user stops typing
    distinctUntilChanged(),      // Only emit when value actually changes
    startWith('')                // Start with empty value
);
```

### 2. Validation Logic

```javascript
function validatePassword(password) {
    if (!password) return { valid: false, message: '' };
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return { valid: false, message: 'Password must contain uppercase, lowercase, and number' };
    }
    return { valid: true, message: 'Password is strong' };
}
```

### 3. Cross-field Validation

```javascript
const confirmPasswordValidation = combineLatest([passwordStream, confirmPasswordStream]).pipe(
    map(([password, confirmPassword]) => validateConfirmPassword(password, confirmPassword))
);
```

### 4. Reactive UI Updates

```javascript
bindSignalToDom(formValidation, '#submit-btn', (btn, validation) => {
    btn.disabled = !validation.isValid;
});
```

## Running the Example

1. Open `index.html` in a web browser
2. Start typing in the form fields
3. Watch the real-time validation feedback
4. Observe how the submit button becomes enabled only when all fields are valid

## Validation Rules

- **Username**: Minimum 3 characters, alphanumeric and underscores only
- **Email**: Valid email format
- **Password**: Minimum 8 characters with uppercase, lowercase, and number
- **Confirm Password**: Must match the password field

## Learning Outcomes

- How to create reactive streams from form inputs
- Implementing debounced validation to improve performance
- Combining multiple streams for complex validation logic
- Binding reactive state to DOM elements for immediate UI feedback
- Managing form-wide state with RxJS operators

This example showcases the power of reactive programming for creating responsive, user-friendly forms with minimal code complexity.
