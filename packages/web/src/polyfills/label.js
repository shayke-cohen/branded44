// @rn-primitives/label polyfill for web
import React from 'react';
import { View, Text as RNText } from 'react-native-web';

export const Root = ({ children, ...props }) => (
  <View {...props}>
    {children}
  </View>
);

export const Text = ({ children, ...props }) => (
  <RNText {...props}>
    {children}
  </RNText>
);

// TypeScript types (dummy for JS compatibility)
export const TextProps = {};
export const TextRef = {};
