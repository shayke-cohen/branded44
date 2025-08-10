// @rn-primitives/slot polyfill for web
import React from 'react';
import { View, Text as RNText } from 'react-native-web';

export const Root = ({ children, ...props }) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, ...children.props });
  }
  return <View {...props}>{children}</View>;
};

export const Text = ({ children, ...props }) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, ...children.props });
  }
  return <RNText {...props}>{children}</RNText>;
};

// TypeScript types (dummy for JS compatibility)
export const TextProps = {};
export const TextRef = {};
