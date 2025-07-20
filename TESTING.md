# Testing Documentation

This document outlines the testing strategy and implementation for the React Native Todo App.

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Native Testing Library**: Component testing utilities
- **@testing-library/jest-native**: Additional Jest matchers for React Native

## Test Structure

```
__tests__/                    # Integration tests
├── App.test.tsx             # Main app integration tests

src/
├── test/                    # Test utilities
│   ├── setup.ts            # Jest setup and mocks
│   └── test-utils.tsx      # Custom render functions and helpers
├── components/
│   └── BottomNavigation/
│       └── __tests__/
│           └── BottomNavigation.test.tsx
├── screens/
│   ├── TodoScreen/
│   │   └── __tests__/
│   │       └── TodoScreen.test.tsx
│   └── SettingsScreen/
│       └── __tests__/
│           └── SettingsScreen.test.tsx
└── context/
    └── __tests__/
        └── ThemeContext.test.tsx
```

## Test Categories

### 1. Unit Tests
- **Component Rendering**: Verify components render without errors
- **User Interactions**: Test button clicks, form inputs, etc.
- **State Management**: Test local component state changes
- **Props Handling**: Test component behavior with different props

### 2. Integration Tests
- **Navigation Flow**: Test screen transitions
- **Cross-Screen State**: Verify state persistence across navigation
- **Theme Integration**: Test theme changes across components
- **End-to-End Workflows**: Complete user journeys

### 3. Context Tests
- **Theme Provider**: Test theme context functionality
- **Theme Switching**: Test light/dark/system mode changes
- **Error Boundaries**: Test context error handling

## Test Coverage

Current test coverage targets:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Patterns
```bash
# Run specific test file
npm test TodoScreen.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="navigation"

# Run tests for specific component
npm test -- --testPathPattern="BottomNavigation"
```

## Test Utilities

### Custom Render Function
```typescript
import {render} from '../src/test/test-utils';

// Automatically wraps components with ThemeProvider
const {getByText} = render(<MyComponent />);
```

### Mock Helpers
```typescript
import {createMockTodo, createMockTodos} from '../src/test/test-utils';

const todo = createMockTodo({text: 'Custom todo'});
const todos = createMockTodos(5); // Creates 5 mock todos
```

## Test Examples

### Component Rendering Test
```typescript
it('renders without crashing', () => {
  const {getByText} = render(<TodoScreen />);
  expect(getByText('Todo App')).toBeTruthy();
});
```

### User Interaction Test
```typescript
it('adds a new todo when button is pressed', async () => {
  const {getByPlaceholderText, getByText} = render(<TodoScreen />);
  
  const input = getByPlaceholderText('Add a new todo...');
  const addButton = getByText('Add');

  fireEvent.changeText(input, 'Test todo');
  fireEvent.press(addButton);

  await waitFor(() => {
    expect(getByText('Test todo')).toBeTruthy();
  });
});
```

### Navigation Test
```typescript
it('navigates from Home to Settings', async () => {
  const {getByText} = render(<App />);
  
  const settingsTab = getByText('Settings');
  fireEvent.press(settingsTab);
  
  await waitFor(() => {
    expect(getByText('Appearance')).toBeTruthy();
  });
});
```

## Mocking Strategy

### React Native Modules
- `useColorScheme`: Mocked to return predictable values
- `Alert`: Mocked to capture alert calls
- `Animated`: Mocked to prevent animation warnings

### Custom Mocks
- Theme context mocking for isolated component tests
- Navigation state mocking for complex flows

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// Good: Test user-visible behavior
expect(getByText('1 of 3 completed')).toBeTruthy();

// Avoid: Testing internal state
expect(component.state.todos).toHaveLength(3);
```

### 2. Use Descriptive Test Names
```typescript
// Good
it('shows error message when trying to add empty todo')

// Avoid
it('handles empty input')
```

### 3. Group Related Tests
```typescript
describe('Todo Interactions', () => {
  it('toggles todo completion when pressed');
  it('deletes todo when delete button is pressed');
});
```

### 4. Clean Up After Tests
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 5. Test Edge Cases
- Empty states
- Error conditions
- Rapid user interactions
- Invalid inputs

## Continuous Integration

Tests are configured to run in CI with:
- Coverage reporting
- Fail on coverage below thresholds
- Parallel test execution
- Proper timeout handling

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` for async state changes
2. **Theme Context**: Ensure components are wrapped with ThemeProvider
3. **Mock Cleanup**: Clear mocks between tests
4. **Timing Issues**: Increase timeout for slow operations

### Debug Commands
```bash
# Run single test with verbose output
npm test -- --verbose TodoScreen.test.tsx

# Debug specific test
npm test -- --testNamePattern="adds todo" --verbose
```

## Future Improvements

- [ ] Add snapshot testing for UI consistency
- [ ] Add performance testing for large todo lists
- [ ] Add accessibility testing
- [ ] Add visual regression testing
- [ ] Add E2E testing with Detox