// @rn-primitives/select polyfill for web
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native-web';

export const Root = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <View {...props} style={[{ position: 'relative' }, props.style]}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value, onValueChange, isOpen, setIsOpen })
      )}
    </View>
  );
};

export const Trigger = ({ children, isOpen, setIsOpen, ...props }) => (
  <Pressable
    {...props}
    onPress={() => setIsOpen(!isOpen)}
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        backgroundColor: '#ffffff',
        minHeight: 40,
      },
      props.style,
    ]}
  >
    {children}
  </Pressable>
);

export const Value = ({ placeholder, children, ...props }) => (
  <Text {...props} style={[{ flex: 1, color: children ? '#000000' : '#9ca3af' }, props.style]}>
    {children || placeholder}
  </Text>
);

export const Content = ({ children, isOpen, ...props }) =>
  isOpen ? (
    <View
      {...props}
      style={[
        {
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 6,
          marginTop: 4,
          maxHeight: 200,
          overflow: 'scroll',
        },
        props.style,
      ]}
    >
      {children}
    </View>
  ) : null;

export const Item = ({ children, value, onValueChange, ...props }) => (
  <Pressable
    {...props}
    onPress={() => onValueChange?.(value)}
    style={[
      {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      },
      props.style,
    ]}
  >
    <Text style={{ color: '#000000' }}>{children}</Text>
  </Pressable>
);

// Additional exports for compatibility
export const Group = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const ScrollUpButton = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const ScrollDownButton = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const useRootContext = () => ({});

export const Portal = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const Overlay = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const Viewport = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const Label = ({ children, ...props }) => (
  <Text {...props}>{children}</Text>
);

export const ItemIndicator = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const ItemText = ({ children, ...props }) => (
  <Text {...props}>{children}</Text>
);

export const Separator = ({ children, ...props }) => (
  <View {...props} style={[{ height: 1, backgroundColor: '#e5e7eb' }, props.style]}>
    {children}
  </View>
);

// TypeScript types (dummy for JS compatibility)
export const SelectProps = {};
export const SelectRef = {};
