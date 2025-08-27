import React, {useState, useEffect, Suspense, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { useEditor } from '../contexts/EditorContext';
import { useSession } from '../contexts/SessionContext';
import BundleErrorBoundary from './BundleErrorBoundary';

// Type declarations for React Native Web compatibility
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Type assertion helper for React components
const asReactFC = <T extends any>(Component: T) => Component as React.FC<any>;

// Import session bundle loader for real-time editing
import { useSessionBundle } from '../services/useSessionBundle';

// Fallback imports from original package (used when session workspace fails)
import {
  getScreenComponent as originalGetScreenComponent,
  getNavTabs as originalGetNavTabs,
  getScreenIdForTab as originalGetScreenIdForTab,
  type ScreenConfig,
  type NavTabConfig
} from '@mobile/screen-templates/templateConfig';

// TouchableOpacity imported above with other RN components

// Import real mobile context providers
import {
  ThemeProvider, 
  CartProvider,
  WixCartProvider,
  MemberProvider,
  AlertProvider, 
  ProductCacheProvider
} from '@mobile/context';

// Import bottom navigation
import {BottomNavigation} from '@mobile/components';

interface MobileAppRendererProps {
  selectedScreen?: string;
}

const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading Your Mobile App...</Text>
  </View>
);

/**
 * MobileAppRenderer - Renders the REAL mobile app using the same approach as the web package
 * Now supports real-time editing by loading from session workspace
 */
const MobileAppRenderer: React.FC<MobileAppRendererProps> = ({
  selectedScreen
}) => {
  // ALL HOOKS MUST BE CALLED FIRST (Rules of Hooks)
  
  // Get session info for bundle loading
  const { currentSession } = useSession();
  
  // Load session bundle for real-time editing
  const { isLoaded, appComponent, error, isLoading } = useSessionBundle(currentSession);
  
  // Add aggressive reload listener
  const [reloadKey, setReloadKey] = useState(0);
  
  useEffect(() => {
    const handleAppReload = (event: CustomEvent) => {
      console.log('🔥 [MobileAppRenderer] Received app reload event:', event.detail);
      console.log('🔄 [MobileAppRenderer] Forcing component re-render...');
      setReloadKey(prev => prev + 1);
    };

    window.addEventListener('fileWatcher:appReload', handleAppReload as EventListener);
    
    return () => {
      window.removeEventListener('fileWatcher:appReload', handleAppReload as EventListener);
    };
  }, []);
  
  // Initialize loading state
  const [renderError, setRenderError] = useState<string | null>(null);

  // CONDITIONAL LOGIC AND RETURNS AFTER ALL HOOKS
  
  console.log('📱 [MobileAppRenderer] Rendering bundled mobile app');
  console.log('📱 [MobileAppRenderer] Bundle status:', { isLoaded, isLoading, hasError: !!error });
  console.log('📱 [MobileAppRenderer] App component available:', !!appComponent);
  console.log('📱 [MobileAppRenderer] Selected screen (legacy):', selectedScreen);
  console.log('📱 [MobileAppRenderer] Session info:', currentSession?.sessionId);

  // Show loading while bundle is loading
  if (isLoading && !isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Session Bundle...</Text>
        <Text style={[styles.loadingText, { fontSize: 12, opacity: 0.7 }]}>
          Preparing bundled mobile app
        </Text>
      </View>
    );
  }

  // Show error if bundle failed to load
  if (error && !appComponent) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.placeholderTitle, { color: '#ff4444' }]}>Bundle Load Failed</Text>
        <Text style={styles.placeholderText}>{error}</Text>
        <Text style={styles.placeholderSubtext}>
          Check the server console for build errors
        </Text>
      </View>
    );
  }

  // Render the bundled app component
  const renderBundledApp = () => {
    if (!appComponent) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>No App Component</Text>
          <Text style={styles.placeholderText}>Bundle loaded but no app component found</Text>
          <Text style={styles.placeholderSubtext}>
            Check that your App.tsx exports a default component
          </Text>
        </View>
      );
    }

    try {
      console.log('📱 [MobileAppRenderer] Rendering bundled app component');
      const BundledApp = asReactFC(appComponent);
      
      return (
        <View style={styles.bundledAppContainer}>
          <BundleErrorBoundary
            onError={(error, errorInfo) => {
              console.error('🚨 [MobileAppRenderer] Bundle error boundary caught:', error);
              console.error('🚨 [MobileAppRenderer] Component stack:', errorInfo.componentStack);
              
              // Set error state for UI feedback
              setRenderError(`Bundle runtime error: ${error.message}`);
            }}
          >
            <BundledApp />
          </BundleErrorBoundary>
        </View>
      );
    } catch (renderErr: any) {
      console.error('❌ [MobileAppRenderer] Error rendering bundled app:', renderErr);
      setRenderError(renderErr.message);
      
      return (
        <View style={styles.placeholderContainer}>
          <Text style={[styles.placeholderTitle, { color: '#ff4444' }]}>Render Error</Text>
          <Text style={styles.placeholderText}>{renderErr.message}</Text>
          <Text style={styles.placeholderSubtext}>
            Check the browser console for details
          </Text>
        </View>
      );
    }
  };

  return (
    <View key={reloadKey} style={styles.container}>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Error Boundary for Render Errors */}
        {renderError ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.placeholderTitle, { color: '#ff4444' }]}>Render Error</Text>
            <Text style={styles.placeholderText}>{renderError}</Text>
            <Text style={styles.placeholderSubtext}>
              Check the browser console for details
            </Text>
          </View>
        ) : (
          /* Main Bundled App Container */
          <View style={styles.contentWrapper}>
            <View style={styles.bundleStatusBar}>
              <Text style={styles.statusText}>
                📦 Bundle Status: {isLoaded ? '✅ Loaded' : isLoading ? '⏳ Loading' : '❌ Not Loaded'}
              </Text>
              {currentSession?.sessionId && (
                <Text style={styles.statusText}>
                  🔧 Session: {currentSession.sessionId.slice(0, 8)}...
                </Text>
              )}
            </View>
            
            {/* Render the bundled app directly */}
            <View style={styles.bundledAppWrapper}>
              {renderBundledApp()}
            </View>
          </View>
        )}
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: '100%',
    width: '100%',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#fafafa',
    position: 'relative',
  },
  bundleStatusBar: {
    backgroundColor: '#f0f7ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  bundledAppWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  bundledAppContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MobileAppRenderer;
