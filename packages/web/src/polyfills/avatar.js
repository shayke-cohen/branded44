// @rn-primitives/avatar polyfill for web
import React from 'react';
import { View, Image as RNImage, Text } from 'react-native-web';

export const Root = ({ children, ...props }) => (
  <View {...props} style={[{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }, props.style]}>
    {children}
  </View>
);

export const Image = React.forwardRef(({ source, style, ...props }, ref) => (
  <RNImage
    ref={ref}
    source={source}
    {...props}
    style={[
      {
        width: 40,
        height: 40,
        borderRadius: 20,
        objectFit: 'cover',
      },
      style,
    ]}
  />
));

export const Fallback = ({ children, ...props }) => (
  <View
    {...props}
    style={[
      {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      props.style,
    ]}
  >
    {typeof children === 'string' ? (
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
        {children}
      </Text>
    ) : (
      children
    )}
  </View>
);

// TypeScript types (dummy for JS compatibility)
export const AvatarProps = {};
export const AvatarRef = {};
