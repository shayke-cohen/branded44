// @rn-primitives/switch polyfill for web
import React from 'react';
import { View, Pressable } from 'react-native-web';

export const Root = ({ checked, onCheckedChange, disabled, ...props }) => (
  <Pressable
    {...props}
    disabled={disabled}
    onPress={() => !disabled && onCheckedChange?.(!checked)}
    style={[
      {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: checked ? '#3b82f6' : '#d1d5db',
        padding: 2,
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      },
      props.style,
    ]}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        transform: [{ translateX: checked ? 20 : 0 }],
        transition: 'transform 0.2s ease',
      }}
    />
  </Pressable>
);

export const Thumb = ({ ...props }) => (
  <View
    {...props}
    style={[
      {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
      },
      props.style,
    ]}
  />
);

// For compatibility with different import patterns
export default Root;

// TypeScript types (dummy for JS compatibility)
export const SwitchProps = {};
export const SwitchRef = {};
