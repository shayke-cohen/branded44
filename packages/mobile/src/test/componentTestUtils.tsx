/**
 * Component Test Utilities
 * 
 * Specialized testing utilities for React Native components.
 * Provides helpers for testing error scenarios and edge cases.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { render, RenderResult } from '@testing-library/react-native';
// import { ThemeProvider } from '../context/ThemeContext';

/**
 * Custom render function with error boundary
 */
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error);
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View testID="error-boundary">
          <Text>Test Error Caught</Text>
          <Text>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Render component with error boundary for testing error scenarios
 */
export function renderWithErrorBoundary(
  ui: React.ReactElement,
  options: {
    onError?: (error: Error) => void;
    wrappers?: React.ComponentType<any>[];
  } = {}
): RenderResult & { errorBoundary: { hasError: boolean; error?: Error } } {
  const { onError, wrappers = [] } = options;
  let errorBoundaryRef: TestErrorBoundary | null = null;

  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    const wrapped = wrappers.reduce(
      (acc, Wrapper) => <Wrapper>{acc}</Wrapper>,
      children as React.ReactElement
    );
    
    return (
      <TestErrorBoundary 
        ref={(ref) => { errorBoundaryRef = ref; }}
        onError={onError}
      >
        {wrapped}
      </TestErrorBoundary>
    );
  };

  const result = render(ui, { wrapper: AllProviders });

  return {
    ...result,
    errorBoundary: {
      get hasError() {
        return errorBoundaryRef?.state.hasError ?? false;
      },
      get error() {
        return errorBoundaryRef?.state.error;
      }
    }
  };
}

/**
 * Test utility to verify component handles undefined props gracefully
 */
export function testUndefinedProps<TProps extends Record<string, any>>(
  Component: React.ComponentType<TProps>,
  requiredProps: Partial<TProps>,
  propsToTest: (keyof TProps)[]
): void {
  describe('Undefined Props Handling', () => {
    propsToTest.forEach((propName) => {
      it(`handles undefined ${String(propName)} gracefully`, () => {
        const props = { ...requiredProps, [propName]: undefined } as TProps;
        
        const { errorBoundary } = renderWithErrorBoundary(<Component {...props} />);
        
        // Should not crash
        expect(errorBoundary.hasError).toBe(false);
      });
    });
  });
}

/**
 * Test utility to verify component handles null props gracefully
 */
export function testNullProps<TProps extends Record<string, any>>(
  Component: React.ComponentType<TProps>,
  requiredProps: Partial<TProps>,
  propsToTest: (keyof TProps)[]
): void {
  describe('Null Props Handling', () => {
    propsToTest.forEach((propName) => {
      it(`handles null ${String(propName)} gracefully`, () => {
        const props = { ...requiredProps, [propName]: null } as TProps;
        
        const { errorBoundary } = renderWithErrorBoundary(<Component {...props} />);
        
        // Should not crash
        expect(errorBoundary.hasError).toBe(false);
      });
    });
  });
}

/**
 * Test utility for edge case data scenarios
 */
export interface EdgeCaseTestConfig<TProps> {
  component: React.ComponentType<TProps>;
  baseProps: TProps;
  edgeCases: Array<{
    name: string;
    props: Partial<TProps>;
    shouldCrash?: boolean;
    expectedError?: string;
  }>;
}

export function testEdgeCases<TProps extends Record<string, any>>(
  config: EdgeCaseTestConfig<TProps>
): void {
  describe('Edge Cases', () => {
    config.edgeCases.forEach(({ name, props, shouldCrash = false, expectedError }) => {
      it(`handles ${name}`, () => {
        const testProps = { ...config.baseProps, ...props };
        let caughtError: Error | undefined;

        const { errorBoundary } = renderWithErrorBoundary(
          <config.component {...testProps} />,
          {
            onError: (error) => {
              caughtError = error;
            }
          }
        );

        if (shouldCrash) {
          expect(errorBoundary.hasError).toBe(true);
          if (expectedError) {
            expect(caughtError?.message).toContain(expectedError);
          }
        } else {
          expect(errorBoundary.hasError).toBe(false);
        }
      });
    });
  });
}

/**
 * Property access safety test
 */
export function testPropertyAccess(
  testName: string,
  testFunction: () => void,
  expectedToThrow: boolean = false
): void {
  if (expectedToThrow) {
    it(`${testName} (should throw)`, () => {
      expect(testFunction).toThrow();
    });
  } else {
    it(`${testName} (should not throw)`, () => {
      expect(testFunction).not.toThrow();
    });
  }
}

/**
 * Async error testing utility
 */
export async function testAsyncError(
  asyncFunction: () => Promise<any>,
  expectedError?: string
): Promise<void> {
  try {
    await asyncFunction();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    if (expectedError && error instanceof Error) {
      expect(error.message).toContain(expectedError);
    }
  }
}

/**
 * Utility to test component with various data states
 */
export interface DataStateTestConfig<TData, TProps> {
  component: React.ComponentType<TProps>;
  getProps: (data: TData) => TProps;
  dataStates: Array<{
    name: string;
    data: TData;
    shouldRender: boolean;
    expectedElements?: string[];
    unexpectedElements?: string[];
  }>;
}

export function testDataStates<TData, TProps extends Record<string, any>>(
  config: DataStateTestConfig<TData, TProps>
): void {
  describe('Data States', () => {
    config.dataStates.forEach(({ 
      name, 
      data, 
      shouldRender, 
      expectedElements = [], 
      unexpectedElements = [] 
    }) => {
      it(`renders correctly with ${name}`, () => {
        const props = config.getProps(data);
        
        if (shouldRender) {
          const { getByText, queryByText, errorBoundary } = renderWithErrorBoundary(
            <config.component {...props} />
          );
          
          expect(errorBoundary.hasError).toBe(false);
          
          expectedElements.forEach((element) => {
            expect(getByText(element)).toBeTruthy();
          });
          
          unexpectedElements.forEach((element) => {
            expect(queryByText(element)).toBeFalsy();
          });
        } else {
          const { errorBoundary } = renderWithErrorBoundary(
            <config.component {...props} />
          );
          
          expect(errorBoundary.hasError).toBe(true);
        }
      });
    });
  });
}

/**
 * Performance test utility for components with large data sets
 */
export function testPerformance<TProps>(
  Component: React.ComponentType<TProps>,
  props: TProps,
  maxRenderTime: number = 100
): void {
  it('renders within acceptable time limits', () => {
    const startTime = performance.now();
    
    renderWithErrorBoundary(<Component {...props} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(maxRenderTime);
  });
}

/**
 * Memory leak detection for component unmounting
 */
export function testMemoryLeaks<TProps>(
  Component: React.ComponentType<TProps>,
  props: TProps
): void {
  it('cleans up properly on unmount', () => {
    const { unmount, errorBoundary } = renderWithErrorBoundary(<Component {...props} />);
    
    expect(errorBoundary.hasError).toBe(false);
    
    // Test unmounting doesn't cause errors
    expect(() => unmount()).not.toThrow();
  });
}
