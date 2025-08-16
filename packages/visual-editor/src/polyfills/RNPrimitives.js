/**
 * React Native Primitives Polyfill for Web
 * 
 * This provides basic polyfill implementations for @rn-primitives components
 * to prevent import errors in the visual editor. These are simplified versions
 * that return basic React Native Web components.
 */

import React from 'react';
import { View, Text } from 'react-native';

// Basic polyfill that returns a View component
const createBasicComponent = (displayName) => {
  const Component = React.forwardRef((props, ref) => (
    <View ref={ref} {...props} />
  ));
  Component.displayName = displayName;
  return Component;
};

// Basic text polyfill
const createBasicTextComponent = (displayName) => {
  const Component = React.forwardRef((props, ref) => (
    <Text ref={ref} {...props} />
  ));
  Component.displayName = displayName;
  return Component;
};

// Avatar components (these will be imported individually by modules)
export const AvatarRoot = createBasicComponent('Avatar.Root');
export const AvatarImage = createBasicComponent('Avatar.Image');
export const AvatarFallback = createBasicTextComponent('Avatar.Fallback');

// Select components - create individual exports AND grouped object
const SelectRoot = createBasicComponent('Select.Root');
const SelectGroup = createBasicComponent('Select.Group');
const SelectValue = createBasicTextComponent('Select.Value');
const SelectTrigger = createBasicComponent('Select.Trigger');
const SelectScrollUpButton = createBasicComponent('Select.ScrollUpButton');
const SelectScrollDownButton = createBasicComponent('Select.ScrollDownButton');
const SelectPortal = createBasicComponent('Select.Portal');
const SelectOverlay = createBasicComponent('Select.Overlay');
const SelectContent = createBasicComponent('Select.Content');
const SelectViewport = createBasicComponent('Select.Viewport');
const SelectLabel = createBasicTextComponent('Select.Label');
const SelectItem = createBasicComponent('Select.Item');
const SelectItemIndicator = createBasicComponent('Select.ItemIndicator');
const SelectItemText = createBasicTextComponent('Select.ItemText');
const SelectSeparator = createBasicComponent('Select.Separator');
const SelectUseRootContext = () => ({});

// Note: Direct named exports removed to avoid conflicts
// All exports are available through the default export object
// This allows imports like: import * as AvatarPrimitive from '@rn-primitives/avatar'

// Export grouped Select object
export const Select = {
  Root: SelectRoot,
  Group: SelectGroup,
  Value: SelectValue,
  Trigger: SelectTrigger,
  ScrollUpButton: SelectScrollUpButton,
  ScrollDownButton: SelectScrollDownButton,
  Portal: SelectPortal,
  Overlay: SelectOverlay,
  Content: SelectContent,
  Viewport: SelectViewport,
  Label: SelectLabel,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  ItemText: SelectItemText,
  Separator: SelectSeparator,
  useRootContext: SelectUseRootContext,
};

// Checkbox components
export const CheckboxRoot = createBasicComponent('Checkbox.Root');
export const CheckboxIndicator = createBasicComponent('Checkbox.Indicator');
// Also export with expected names
export { CheckboxIndicator as Indicator }; // For CheckboxPrimitive.Indicator

// Progress components
export const ProgressRoot = createBasicComponent('Progress.Root');
export const ProgressIndicator = createBasicComponent('Progress.Indicator');

// Switch components  
export const SwitchRoot = createBasicComponent('Switch.Root');
export const SwitchThumb = createBasicComponent('Switch.Thumb');
// Also export with expected names
export { SwitchThumb as Thumb }; // For SwitchPrimitives.Thumb

// Label components
export const LabelRoot = createBasicComponent('Label.Root');
export const LabelText = createBasicTextComponent('Label.Text');

// Separator components
export const SeparatorRoot = createBasicComponent('Separator.Root');

// Slot components - used for composition (avoid conflict with React Native View/Text)
export const SlotView = createBasicComponent('Slot.View');
export const SlotText = createBasicTextComponent('Slot.Text');

// Default exports for each primitive module
// Create namespace exports for each RN primitive package
export const Avatar = { Root: AvatarRoot, Image: AvatarImage, Fallback: AvatarFallback };
export const Slot = { View: SlotView, Text: SlotText };
export const Checkbox = { Root: CheckboxRoot, Indicator: CheckboxIndicator };
export const Progress = { Root: ProgressRoot, Indicator: ProgressIndicator };
export const Switch = { Root: SwitchRoot, Thumb: SwitchThumb };
export const Label = { Root: LabelRoot, Text: LabelText };
export const Separator = { Root: SeparatorRoot };

export default {
  // Avatar
  Avatar: {
    Root: AvatarRoot,
    Image: AvatarImage,
    Fallback: AvatarFallback,
  },
  
  // Select 
  Select,
  
  // Checkbox
  Checkbox: {
    Root: CheckboxRoot,
    Indicator: CheckboxIndicator,
  },
  
  // Progress
  Progress: {
    Root: ProgressRoot,
    Indicator: ProgressIndicator,
  },
  
  // Switch
  Switch: {
    Root: SwitchRoot,
    Thumb: SwitchThumb,
  },
  
  // Label
  Label: {
    Root: LabelRoot,
    Text: LabelText,
  },
  
  // Separator
  Separator: {
    Root: SeparatorRoot,
  },
  
  // Slot
  Slot: {
    View: SlotView,
    Text: SlotText,
  },
};