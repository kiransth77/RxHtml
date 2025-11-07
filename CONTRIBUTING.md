# Contributing to RxHtml Framework

Thank you for your interest in contributing to RxHtml! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Good First Issues](#good-first-issues)
- [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please treat all contributors with respect and professionalism.

### Our Standards

- **Be Respectful**: Value diverse perspectives and experiences
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Collaborative**: Work together toward common goals
- **Be Patient**: Help newcomers learn and grow

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **bun** (package manager)
- **Git** (version control)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/RxHtml.git
cd RxHtml
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/kiransth77/RxHtml.git
```

### Install Dependencies

```bash
npm install
```

### Verify Your Setup

Run the tests to ensure everything is working:

```bash
npm test
```

Run linting to check code style:

```bash
npm run lint
```

## Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or improvements

### Making Changes

1. **Write Clean Code**: Follow our coding standards (see below)
2. **Test Your Changes**: Add tests for new features
3. **Document Your Work**: Update relevant documentation
4. **Commit Regularly**: Make small, focused commits

### Commit Message Guidelines

We follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or tooling changes

**Examples:**

```bash
git commit -m "feat(signals): add batch update function"
git commit -m "fix(router): resolve navigation guard issue"
git commit -m "docs(readme): add TypeScript examples"
```

### Keeping Your Branch Updated

Regularly sync your branch with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### JavaScript Style

We use ESLint and Prettier for code formatting:

```bash
# Check formatting
npm run format:check

# Auto-fix formatting issues
npm run format

# Run linting
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Code Style Guidelines

1. **Use Modern JavaScript**: ES6+ features are encouraged
2. **Prefer Const**: Use `const` by default, `let` when necessary
3. **Descriptive Names**: Use clear, descriptive variable and function names
4. **Comment Complex Logic**: Add comments for non-obvious code
5. **Keep Functions Small**: Each function should do one thing well

### Documentation Standards

1. **JSDoc Comments**: Add JSDoc comments to all public APIs

```javascript
/**
 * Creates a reactive signal with the given initial value.
 * @param {*} initialValue - The initial value of the signal
 * @returns {Signal} A reactive signal object
 * @example
 * const count = signal(0);
 * count.value = 5; // Updates all dependent computations
 */
export function signal(initialValue) {
  // implementation
}
```

2. **Type Hints**: Include type information in JSDoc
3. **Examples**: Provide usage examples in documentation
4. **Keep It Updated**: Update docs when changing code

## Testing Guidelines

### Writing Tests

We use the Bun test framework. Tests should be:

1. **Clear**: Test names should describe what is being tested
2. **Isolated**: Each test should be independent
3. **Comprehensive**: Cover happy paths and edge cases
4. **Fast**: Tests should run quickly

### Test Structure

```javascript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { signal, effect } from '../src/core/signal.js';

describe('Signal System', () => {
  let cleanup;

  beforeEach(() => {
    cleanup = [];
  });

  afterEach(() => {
    cleanup.forEach(fn => fn());
  });

  test('should create signal with initial value', () => {
    const count = signal(0);
    expect(count.value).toBe(0);
  });

  test('should trigger effect on value change', () => {
    const count = signal(0);
    let effectRan = false;

    const dispose = effect(() => {
      const val = count.value;
      effectRan = true;
    });
    cleanup.push(dispose);

    count.value = 1;
    expect(effectRan).toBe(true);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/core-signal.test.js

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

Aim for high test coverage:
- New features should include tests
- Bug fixes should include regression tests
- Maintain or improve existing coverage

## Submitting Changes

### Before Submitting

1. **Run All Tests**: Ensure all tests pass
2. **Run Linting**: Fix all linting errors
3. **Update Documentation**: Update relevant docs
4. **Check Formatting**: Ensure code is properly formatted
5. **Review Your Changes**: Do a self-review of your code

```bash
# Quick pre-submit checklist
npm test && npm run lint && npm run format:check
```

### Creating a Pull Request

1. **Push Your Branch**:

```bash
git push origin feature/your-feature-name
```

2. **Open a Pull Request**: Go to GitHub and create a PR

3. **Fill Out the PR Template**: Provide detailed information:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Any breaking changes

4. **Link Related Issues**: Reference any related issues (e.g., "Closes #123")

### PR Review Process

1. **Automated Checks**: CI will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Address Feedback**: Make requested changes
4. **Approval**: Once approved, your PR will be merged

### PR Guidelines

- Keep PRs focused on a single feature or fix
- Make small, incremental PRs rather than large ones
- Respond to review comments promptly
- Be open to feedback and suggestions

## Good First Issues

Looking to make your first contribution? Here are some areas where you can help:

### Documentation

- **Improve Examples**: Add more code examples to documentation
- **Fix Typos**: Correct spelling and grammar errors
- **Add Tutorials**: Create step-by-step guides for common tasks
- **Translate Docs**: Help translate documentation to other languages

Example issues:
- Add TypeScript usage examples to README
- Create a "Quick Start" video tutorial
- Document common pitfalls and solutions

### Testing

- **Add Test Cases**: Improve test coverage
- **Test Edge Cases**: Add tests for boundary conditions
- **E2E Tests**: Create end-to-end test scenarios

Example issues:
- Add tests for error handling in signal system
- Create E2E tests for routing navigation
- Test memory cleanup in component lifecycle

### Code Improvements

- **Refactoring**: Improve code structure and readability
- **Performance**: Optimize hot code paths
- **Error Messages**: Make error messages more helpful

Example issues:
- Refactor signal dependency tracking logic
- Add better error messages for component lifecycle
- Optimize computed signal recalculation

### Examples and Templates

- **Example Apps**: Create example applications
- **Component Library**: Build reusable components
- **Templates**: Add CLI project templates

Example issues:
- Create a todo app example with routing
- Build a data table component with sorting
- Add a dashboard template to CLI

### Finding Issues

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - Community help needed
- `documentation` - Documentation improvements
- `beginner friendly` - Suitable for beginners

## Community

### Getting Help

- **GitHub Discussions**: Ask questions and share ideas
- **Issue Tracker**: Report bugs and request features
- **Discord/Slack**: Join our community chat (if available)

### Asking Questions

When asking for help:
1. Search existing issues first
2. Provide a clear description
3. Include code samples
4. Share error messages
5. Describe what you've tried

### Reporting Bugs

Use the bug report template and include:
- Clear bug description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, version)
- Code samples or screenshots

### Suggesting Features

Use the feature request template and include:
- Clear feature description
- Use cases and benefits
- Possible implementation approach
- Willingness to contribute

## Development Tips

### Project Structure

```
src/
├── core/           # Core framework (signals, components, DOM)
├── router/         # Routing system
├── state/          # State management
├── index.js        # Main entry point
tests/              # Test files
docs/               # Documentation
examples/           # Example applications
cli/                # CLI tools
```

### Debugging

Enable verbose logging:

```javascript
// Set environment variable
process.env.RXHTML_DEBUG = 'true';
```

Use browser DevTools:
- Set breakpoints in source code
- Use `console.log` for debugging
- Check network tab for HTMX requests

### Performance Testing

Run benchmarks to test performance:

```bash
# Run benchmark tests
npm run benchmark
```

### Building for Production

```bash
# Build the framework
npm run build

# Test the production build
npm run serve
```

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub contributors page

## Questions?

If you have any questions not covered here:
1. Check the [documentation](docs/README.md)
2. Search [existing issues](https://github.com/kiransth77/RxHtml/issues)
3. Open a new discussion or issue

Thank you for contributing to RxHtml Framework! 🚀
