# Mobile App Tests

This directory contains tests for the React Native mobile application.

## Overview

The mobile app tests validate:

1. **Component Rendering**: Basic component smoke tests
2. **App Integration**: App structure and initialization
3. **Navigation**: Screen transitions and routing

## Prerequisites

```bash
cd packages/mobile
npm install
```

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

## Available Tests

Currently includes:
- `App.test.tsx` - Basic smoke tests for the main App component
- `Navigation.integration.test.tsx` - Navigation integration tests

## Visual Editor Integration Tests

**Note**: The Visual Editor integration tests have been moved to the Visual Editor package at:
```
packages/visual-editor/__tests__/
```

To run the Visual Editor integration tests:
```bash
cd packages/visual-editor
npm run test:integration
```

## Test Configuration

The mobile app uses:
- **Jest**: Test runner
- **React Native Testing Library**: Component testing utilities
- **Test Environment**: Node.js (for React Native components)
- **Timeout**: 10 seconds default

## Contributing

When adding new mobile app tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Test component behavior, not implementation
4. Include proper cleanup
5. Mock external dependencies appropriately
