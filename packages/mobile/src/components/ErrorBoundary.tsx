/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '../../~/components/ui/button';
import { Card } from '../../~/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="p-6 m-4 bg-red-50 border-red-200">
          <View className="items-center">
            <Text className="text-2xl mb-2">⚠️</Text>
            <Text className="text-lg font-semibold text-red-900 mb-2 text-center">
              Something went wrong
            </Text>
            <Text className="text-sm text-red-700 mb-4 text-center">
              We encountered an unexpected error. Please try again.
            </Text>
            
            <Button 
              onPress={this.handleRetry}
              variant="outline"
              className="mb-4"
            >
              <Text>Try Again</Text>
            </Button>

            {this.props.showErrorDetails && this.state.error && (
              <ScrollView className="max-h-40 w-full">
                <Card className="p-3 bg-gray-100">
                  <Text className="text-xs font-mono text-gray-800">
                    {this.state.error.message}
                  </Text>
                  {this.state.error.stack && (
                    <Text className="text-xs font-mono text-gray-600 mt-2">
                      {this.state.error.stack}
                    </Text>
                  )}
                </Card>
              </ScrollView>
            )}
          </View>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook to handle errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

/**
 * Safe component wrapper that catches and handles errors
 */
export function SafeComponent<P extends object>({
  component: Component,
  props,
  fallback,
  onError,
}: {
  component: React.ComponentType<P>;
  props: P;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}) {
  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={onError ? (error) => onError(error) : undefined}
    >
      <Component {...props} />
    </ErrorBoundary>
  );
}
