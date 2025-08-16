// @rn-primitives polyfills for web
const React = require('react');

// Avatar primitives
const AvatarRoot = ({ children, ...props }) => {
  return React.createElement('div', { 
    ...props, 
    style: { 
      position: 'relative', 
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      verticalAlign: 'middle',
      overflow: 'hidden',
      userSelect: 'none',
      width: 40,
      height: 40,
      borderRadius: '50%',
      backgroundColor: '#f0f0f0',
      ...props.style 
    } 
  }, children);
};

const AvatarImage = ({ src, alt, ...props }) => {
  return React.createElement('img', { 
    src, 
    alt, 
    ...props, 
    style: { 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover',
      borderRadius: 'inherit',
      ...props.style 
    } 
  });
};

const AvatarFallback = ({ children, ...props }) => {
  return React.createElement('div', { 
    ...props, 
    style: { 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e0e0e0',
      color: '#666',
      fontSize: '14px',
      fontWeight: 'bold',
      ...props.style 
    } 
  }, children);
};

// Checkbox primitives
const CheckboxRoot = ({ children, checked, onCheckedChange, ...props }) => {
  return React.createElement('button', {
    ...props,
    type: 'button',
    role: 'checkbox',
    'aria-checked': checked,
    onClick: () => onCheckedChange && onCheckedChange(!checked),
    style: {
      width: 20,
      height: 20,
      border: '2px solid #ccc',
      borderRadius: '4px',
      backgroundColor: checked ? '#007AFF' : 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...props.style
    }
  }, children);
};

const CheckboxIndicator = ({ children, ...props }) => {
  return React.createElement('div', {
    ...props,
    style: {
      color: 'white',
      fontSize: '12px',
      ...props.style
    }
  }, children || '✓');
};

// Label primitives
const LabelRoot = ({ children, htmlFor, ...props }) => {
  return React.createElement('label', { 
    htmlFor, 
    ...props, 
    style: { 
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      ...props.style 
    } 
  }, children);
};

const LabelText = ({ children, ...props }) => {
  return React.createElement('span', props, children);
};

// Progress primitives
const ProgressRoot = ({ children, value, max = 100, ...props }) => {
  return React.createElement('div', {
    ...props,
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': value,
    style: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#e0e0e0',
      borderRadius: '4px',
      width: '100%',
      height: '8px',
      ...props.style
    }
  }, children);
};

const ProgressIndicator = ({ value, max = 100, ...props }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return React.createElement('div', {
    ...props,
    style: {
      height: '100%',
      backgroundColor: '#007AFF',
      borderRadius: 'inherit',
      transition: 'width 0.3s ease',
      width: `${percentage}%`,
      ...props.style
    }
  });
};

// Select primitives (simplified)
const SelectRoot = ({ children, value, onValueChange, ...props }) => {
  return React.createElement('div', { 
    ...props, 
    style: { 
      position: 'relative', 
      display: 'inline-block',
      ...props.style 
    } 
  }, children);
};

const SelectTrigger = ({ children, ...props }) => {
  return React.createElement('button', { 
    ...props, 
    style: { 
      padding: '8px 12px', 
      border: '1px solid #ccc', 
      borderRadius: '4px', 
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '120px',
      ...props.style 
    } 
  }, children);
};

const SelectValue = ({ children, placeholder, ...props }) => {
  return React.createElement('span', props, children || placeholder);
};

const SelectContent = ({ children, ...props }) => {
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
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxHeight: '200px',
      overflowY: 'auto',
      ...props.style 
    } 
  }, children);
};

const SelectItem = ({ children, value, onSelect, ...props }) => {
  return React.createElement('div', { 
    ...props, 
    onClick: () => onSelect && onSelect(value),
    style: { 
      padding: '8px 12px', 
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0',
      ...props.style 
    } 
  }, children);
};

const SelectItemText = ({ children, ...props }) => {
  return React.createElement('span', props, children);
};

// Separator primitives
const SeparatorRoot = ({ orientation = 'horizontal', ...props }) => {
  return React.createElement('div', {
    ...props,
    role: 'separator',
    'aria-orientation': orientation,
    style: {
      backgroundColor: '#e0e0e0',
      ...(orientation === 'horizontal' 
        ? { height: '1px', width: '100%' }
        : { width: '1px', height: '100%' }
      ),
      ...props.style
    }
  });
};

// Switch primitives
const SwitchRoot = ({ children, checked, onCheckedChange, ...props }) => {
  return React.createElement('button', {
    ...props,
    type: 'button',
    role: 'switch',
    'aria-checked': checked,
    onClick: () => onCheckedChange && onCheckedChange(!checked),
    style: {
      position: 'relative',
      width: '44px',
      height: '24px',
      backgroundColor: checked ? '#007AFF' : '#ccc',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ...props.style
    }
  }, children);
};

const SwitchThumb = ({ ...props }) => {
  return React.createElement('div', {
    ...props,
    style: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: 'transform 0.2s',
      transform: 'translateX(0)',
      ...props.style
    }
  });
};

// Export individual primitives as named exports (what the mobile app expects)
const Root = AvatarRoot; // Default to Avatar root, will be overridden by specific modules
const Image = AvatarImage;
const Fallback = AvatarFallback;
const Indicator = CheckboxIndicator;
const Text = LabelText;
const Trigger = SelectTrigger;
const Value = SelectValue;
const Content = SelectContent;
const Item = SelectItem;
const ItemText = SelectItemText;
const ItemIndicator = CheckboxIndicator;
const Thumb = SwitchThumb;
const Group = SelectRoot;
const Portal = ({ children }) => children;
const Overlay = ({ children }) => children;
const Viewport = ({ children }) => children;
const Label = LabelRoot;
const Separator = SeparatorRoot;
const ScrollUpButton = ({ children }) => children;
const ScrollDownButton = ({ children }) => children;
const useRootContext = () => ({});
const View = ({ children, ...props }) => React.createElement('div', props, children);

// Export all primitives with their expected names as default
const primitives = {
  // Avatar
  Avatar: {
    Root: AvatarRoot,
    Image: AvatarImage,
    Fallback: AvatarFallback
  },
  // Checkbox
  Checkbox: {
    Root: CheckboxRoot,
    Indicator: CheckboxIndicator
  },
  // Label
  Label: {
    Root: LabelRoot,
    Text: LabelText
  },
  // Progress
  Progress: {
    Root: ProgressRoot,
    Indicator: ProgressIndicator
  },
  // Select
  Select: {
    Root: SelectRoot,
    Trigger: SelectTrigger,
    Value: SelectValue,
    Content: SelectContent,
    Item: SelectItem,
    ItemText: SelectItemText
  },
  // Separator
  Separator: {
    Root: SeparatorRoot
  },
  // Switch
  Switch: {
    Root: SwitchRoot,
    Thumb: SwitchThumb
  }
};

// CommonJS exports
module.exports = primitives;
module.exports.default = primitives;

// Export individual components
module.exports.Root = Root;
module.exports.Image = Image;
module.exports.Fallback = Fallback;
module.exports.Indicator = Indicator;
module.exports.Text = Text;
module.exports.Trigger = Trigger;
module.exports.Value = Value;
module.exports.Content = Content;
module.exports.Item = Item;
module.exports.ItemText = ItemText;
module.exports.ItemIndicator = ItemIndicator;
module.exports.Thumb = Thumb;
module.exports.Group = Group;
module.exports.Portal = Portal;
module.exports.Overlay = Overlay;
module.exports.Viewport = Viewport;
module.exports.Label = Label;
module.exports.Separator = Separator;
module.exports.ScrollUpButton = ScrollUpButton;
module.exports.ScrollDownButton = ScrollDownButton;
module.exports.useRootContext = useRootContext;
module.exports.View = View;
