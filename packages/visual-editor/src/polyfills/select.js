// @rn-primitives/select polyfill for web
import React from 'react';

// Basic select components that work in web environment
export const Root = ({ children, ...props }) => {
  return React.createElement('div', { ...props, style: { position: 'relative', ...props.style } }, children);
};

export const Trigger = ({ children, ...props }) => {
  return React.createElement('button', { 
    ...props, 
    style: { 
      padding: '8px 12px', 
      border: '1px solid #ccc', 
      borderRadius: '4px', 
      backgroundColor: 'white',
      cursor: 'pointer',
      ...props.style 
    } 
  }, children);
};

export const Value = ({ children, placeholder, ...props }) => {
  return React.createElement('span', props, children || placeholder);
};

export const Content = ({ children, ...props }) => {
  return React.createElement('div', { 
    ...props, 
    style: { 
      position: 'absolute', 
      top: '100%', 
      left: 0, 
      right: 0, 
      backgroundColor: 'white', 
      border: '1px solid #ccc', 
      borderRadius: '4px', 
      zIndex: 1000,
      ...props.style 
    } 
  }, children);
};

export const Item = ({ children, ...props }) => {
  return React.createElement('div', { 
    ...props, 
    style: { 
      padding: '8px 12px', 
      cursor: 'pointer', 
      ':hover': { backgroundColor: '#f5f5f5' },
      ...props.style 
    } 
  }, children);
};

export const ItemText = ({ children, ...props }) => {
  return React.createElement('span', props, children);
};

// Stub components for other exports
export const ScrollUpButton = ({ children, ...props }) => React.createElement('div', props, children);
export const ScrollDownButton = ({ children, ...props }) => React.createElement('div', props, children);
export const useRootContext = () => ({});
export const Portal = ({ children }) => children;
export const Overlay = ({ children, ...props }) => React.createElement('div', props, children);
export const Viewport = ({ children, ...props }) => React.createElement('div', props, children);
export const Label = ({ children, ...props }) => React.createElement('label', props, children);
export const ItemIndicator = ({ children, ...props }) => React.createElement('span', props, children);
export const Separator = ({ ...props }) => React.createElement('hr', props);

export default {
  Root,
  Trigger,
  Value,
  Content,
  Item,
  ItemText,
  ScrollUpButton,
  ScrollDownButton,
  useRootContext,
  Portal,
  Overlay,
  Viewport,
  Label,
  ItemIndicator,
  Separator,
};
