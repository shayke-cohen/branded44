// @rn-primitives/slot polyfill for web
import React from 'react';
import { View as RNView, Text as RNText } from 'react-native-web';

export const Root = ({ children, ...props }) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, ...children.props });
  }
  return <RNView {...props}>{children}</RNView>;
};

export const Text = ({ children, ...props }) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, ...children.props });
  }
  return <RNText {...props}>{children}</RNText>;
};

export const View = ({ children, ...props }) => (
  <RNView {...props}>
    {children}
  </RNView>
);

// TypeScript types (dummy for JS compatibility)
export const TextProps = {};
export const TextRef = {};
