/**
 * React Native Safe Area Context Web Polyfill
 * 
 * Provides a web-compatible implementation of react-native-safe-area-context
 * for React Native Web environments.
 */

import React, { createContext, useContext, forwardRef } from 'react';
import { View } from 'react-native';

// Default safe area insets for web
const DEFAULT_INSETS = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

// Safe Area Context
const SafeAreaContext = createContext(DEFAULT_INSETS);

// SafeAreaProvider - provides safe area context
export const SafeAreaProvider = ({ children, initialMetrics = DEFAULT_INSETS }) => {
  // For web, we can use default insets or try to detect safe areas
  const safeAreaInsets = initialMetrics || DEFAULT_INSETS;
  
  return (
    <SafeAreaContext.Provider value={safeAreaInsets}>
      {children}
    </SafeAreaContext.Provider>
  );
};

// Hook to get safe area insets
export const useSafeAreaInsets = () => {
  const context = useContext(SafeAreaContext);
  if (!context) {
    console.warn('useSafeAreaInsets called outside of SafeAreaProvider, returning default insets');
    return DEFAULT_INSETS;
  }
  return context;
};

// Hook to get safe area frame
export const useSafeAreaFrame = () => {
  // For web, return window dimensions
  return {
    x: 0,
    y: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 812,
  };
};

// SafeAreaView component
export const SafeAreaView = forwardRef(({ style, children, edges, mode = 'padding', ...props }, ref) => {
  const insets = useSafeAreaInsets();
  
  // Calculate safe area style based on edges and mode
  let safeAreaStyle = {};
  
  if (mode === 'padding') {
    if (!edges || edges.includes('top')) {
      safeAreaStyle.paddingTop = insets.top;
    }
    if (!edges || edges.includes('bottom')) {
      safeAreaStyle.paddingBottom = insets.bottom;
    }
    if (!edges || edges.includes('left')) {
      safeAreaStyle.paddingLeft = insets.left;
    }
    if (!edges || edges.includes('right')) {
      safeAreaStyle.paddingRight = insets.right;
    }
  } else if (mode === 'margin') {
    if (!edges || edges.includes('top')) {
      safeAreaStyle.marginTop = insets.top;
    }
    if (!edges || edges.includes('bottom')) {
      safeAreaStyle.marginBottom = insets.bottom;
    }
    if (!edges || edges.includes('left')) {
      safeAreaStyle.marginLeft = insets.left;
    }
    if (!edges || edges.includes('right')) {
      safeAreaStyle.marginRight = insets.right;
    }
  }
  
  return (
    <View
      ref={ref}
      style={[safeAreaStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
});

SafeAreaView.displayName = 'SafeAreaView';

// SafeAreaInsetsContext (alias for backward compatibility)
export const SafeAreaInsetsContext = SafeAreaContext;

// Default export for common usage
export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext,
};
