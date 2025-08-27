import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary specifically designed to catch bundle execution and rendering errors
 * Provides detailed error information and graceful fallbacks
 */
export class BundleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with detailed information
    console.group('🚨 [BundleErrorBoundary] Caught bundle execution error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Stack:', error.stack);
    console.groupEnd();

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '10px',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h2 style={{ 
            color: '#cc0000', 
            marginTop: 0,
            fontSize: '18px',
            fontWeight: 600
          }}>
            📱 Bundle Execution Error
          </h2>
          
          <p style={{ 
            color: '#666', 
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            The mobile app encountered a runtime error and couldn't render properly.
          </p>

          <details style={{ marginTop: '12px' }}>
            <summary style={{ 
              cursor: 'pointer',
              color: '#cc0000',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '8px'
            }}>
              🔍 Error Details
            </summary>
            
            <div style={{
              backgroundColor: '#f8f8f8',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'Monaco, Consolas, monospace',
              overflow: 'auto',
              marginTop: '8px'
            }}>
              <strong>Error:</strong> {this.state.error?.message}<br/>
              <strong>Type:</strong> {this.state.error?.name}<br/>
              {this.state.error?.stack && (
                <>
                  <strong>Stack:</strong>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    margin: '4px 0 0 0',
                    fontSize: '11px',
                    lineHeight: '1.2'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </>
              )}
            </div>
          </details>

          <div style={{ 
            marginTop: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={() => {
                // Reset error boundary state
                this.setState({
                  hasError: false,
                  error: null,
                  errorInfo: null
                });
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              🔄 Try Again
            </button>
            
            <button
              onClick={() => {
                // Reload the page
                window.location.reload();
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              🔄 Reload Page
            </button>

            <span style={{ 
              fontSize: '11px', 
              color: '#999',
              marginLeft: '8px'
            }}>
              Check the console for details
            </span>
          </div>

          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#f0f8ff',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#0066cc'
          }}>
            💡 <strong>Common fixes:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              <li>Missing React Native module mocks</li>
              <li>Incompatible style properties for web</li>
              <li>Unsupported native API calls</li>
            </ul>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BundleErrorBoundary;
