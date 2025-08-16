/**
 * React Native Primitives Polyfill for Web
 * 
 * This provides basic polyfill implementations for @rn-primitives components
 * to prevent import errors in the visual editor. These are simplified versions
 * that return basic React Native Web components.
 */

import React from 'react';
import { View as RNView, Text as RNText } from 'react-native';

// Basic polyfill that returns a View component
const createBasicComponent = (displayName) => {
  const Component = React.forwardRef((props, ref) => (
    <RNView ref={ref} {...props} />
  ));
  Component.displayName = displayName;
  return Component;
};

// Basic text polyfill
const createBasicTextComponent = (displayName) => {
  const Component = React.forwardRef((props, ref) => (
    <RNText ref={ref} {...props} />
  ));
  Component.displayName = displayName;
  return Component;
};

// Create all primitive components
const AvatarRoot = createBasicComponent('Avatar.Root');
const AvatarImage = createBasicComponent('Avatar.Image');
const AvatarFallback = createBasicTextComponent('Avatar.Fallback');

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

const CheckboxRoot = createBasicComponent('Checkbox.Root');
const CheckboxIndicator = createBasicComponent('Checkbox.Indicator');

const ProgressRoot = createBasicComponent('Progress.Root');
const ProgressIndicator = createBasicComponent('Progress.Indicator');

const SwitchRoot = createBasicComponent('Switch.Root');
const SwitchThumb = createBasicComponent('Switch.Thumb');

const LabelRoot = createBasicComponent('Label.Root');
const LabelText = createBasicTextComponent('Label.Text');

const SeparatorRoot = createBasicComponent('Separator.Root');

const SlotView = createBasicComponent('Slot.View');
const SlotText = createBasicTextComponent('Slot.Text');

// Export individual primitives to satisfy different import patterns
// For Avatar: import * as AvatarPrimitive from '@rn-primitives/avatar'
export const Root = AvatarRoot;
export const Image = AvatarImage; 
export const Fallback = AvatarFallback;

// For Checkbox: import * as CheckboxPrimitive from '@rn-primitives/checkbox'  
export const Indicator = CheckboxIndicator;

// For Switch: import * as SwitchPrimitives from '@rn-primitives/switch'
export const Thumb = SwitchThumb;

// For Select: import * as SelectPrimitive from '@rn-primitives/select'
export const Group = SelectGroup;
export const Value = SelectValue;
export const Trigger = SelectTrigger;
export const ScrollUpButton = SelectScrollUpButton;
export const ScrollDownButton = SelectScrollDownButton;
export const Portal = SelectPortal;
export const Overlay = SelectOverlay;
export const Content = SelectContent;
export const Viewport = SelectViewport;
export const Label = SelectLabel;
export const Item = SelectItem;
export const ItemIndicator = SelectItemIndicator;
export const ItemText = SelectItemText;
export const Separator = SelectSeparator;
export const useRootContext = SelectUseRootContext;

// For Slot: import { View, Text } from '@rn-primitives/slot'
export const View = SlotView;
export const Text = SlotText;

// Legacy exports for backwards compatibility
export {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  CheckboxRoot,
  CheckboxIndicator,
  ProgressRoot,
  ProgressIndicator,
  SwitchRoot,
  SwitchThumb,
  LabelRoot,
  LabelText,
  SeparatorRoot,
  SlotView,
  SlotText
};

// Grouped exports for structured access
export const Avatar = { Root: AvatarRoot, Image: AvatarImage, Fallback: AvatarFallback };
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
export const Checkbox = { Root: CheckboxRoot, Indicator: CheckboxIndicator };
export const Progress = { Root: ProgressRoot, Indicator: ProgressIndicator };
export const Switch = { Root: SwitchRoot, Thumb: SwitchThumb };
export const Slot = { View: SlotView, Text: SlotText };

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