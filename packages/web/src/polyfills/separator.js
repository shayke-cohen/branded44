// @rn-primitives/separator polyfill for web
import React from 'react';
import { View } from 'react-native-web';

export const Root = ({ orientation = 'horizontal', ...props }) => (
  <View
    {...props}
    style={[
      orientation === 'horizontal'
        ? {
            height: 1,
            width: '100%',
            backgroundColor: '#e5e7eb',
          }
        : {
            width: 1,
            height: '100%',
            backgroundColor: '#e5e7eb',
          },
      props.style,
    ]}
  />
);

// For compatibility with different import patterns
export default Root;

// TypeScript types (dummy for JS compatibility)
export const SeparatorProps = {};
export const SeparatorRef = {};
