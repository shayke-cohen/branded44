// @rn-primitives/checkbox polyfill for web
import React from 'react';
import { View, Pressable } from 'react-native-web';

export const Root = ({ children, ...props }) => (
  <Pressable {...props} style={[{ flexDirection: 'row', alignItems: 'center' }, props.style]}>
    {children}
  </Pressable>
);

export const Indicator = ({ children, ...props }) => (
  <View {...props} style={[{ width: 20, height: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }, props.style]}>
    {children}
  </View>
);

// TypeScript types (dummy for JS compatibility)
export const TextProps = {};
export const TextRef = {};
