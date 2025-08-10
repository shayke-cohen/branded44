// @rn-primitives/progress polyfill for web
import React from 'react';
import { View } from 'react-native-web';

export const Root = ({ children, value = 0, max = 100, ...props }) => (
  <View {...props} style={[{ height: 4, backgroundColor: '#e5e5e5', borderRadius: 2, overflow: 'hidden' }, props.style]}>
    {children}
  </View>
);

export const Indicator = ({ value = 0, max = 100, ...props }) => (
  <View
    {...props}
    style={[
      {
        height: '100%',
        backgroundColor: '#007AFF',
        width: `${Math.min(100, Math.max(0, (value / max) * 100))}%`,
        transition: 'width 0.2s ease-in-out',
      },
      props.style
    ]}
  />
);

// TypeScript types (dummy for JS compatibility)
export const TextProps = {};
export const TextRef = {};
