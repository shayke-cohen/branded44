# LLM Guidelines for React Native App Development

This document provides comprehensive guidelines for AI language models to effectively develop React Native applications using this scaffold. Follow these patterns and conventions to ensure consistency, maintainability, and quality.

## 📚 Table of Contents

- [Project Structure](#project-structure)
- [Adding New Screens](#adding-new-screens)
- [Navigation Management](#navigation-management)
- [Testing Guidelines](#testing-guidelines)
- [Styling and Theming](#styling-and-theming)
- [State Management](#state-management)
- [Component Patterns](#component-patterns)
- [TypeScript Best Practices](#typescript-best-practices)
- [Performance Guidelines](#performance-guidelines)
- [Accessibility](#accessibility)

## 🏗️ Project Structure

### Core Architecture
```
src/
├── App.tsx                    # Main app entry point
├── components/                # Reusable UI components
├── constants/                 # App-wide constants
├── context/                   # React Context providers
├── screens/                   # Screen components
│   ├── HomeScreen/           # Active screens
│   ├── SettingsScreen/       
│   └── templates/            # Reference implementations
├── test/                     # Testing utilities
├── types/                    # TypeScript definitions
└── index.ts                  # Barrel export
```

### File Organization Principles
1. **One component per file**: Each component gets its own `.tsx` file
2. **Co-located tests**: Place `__tests__/` folders alongside components
3. **Barrel exports**: Use `index.ts` files for clean imports
4. **Consistent naming**: Use PascalCase for components, camelCase for files/variables

## 📱 Adding New Screens

### Step-by-Step Process

#### 1. Create Screen Directory
```bash
mkdir src/screens/YourScreen
mkdir src/screens/YourScreen/__tests__
```

#### 2. Create Screen Component
```typescript
// src/screens/YourScreen/YourScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context';

interface YourScreenProps {
  // Define props interface
  onAction?: () => void;
}

const YourScreen: React.FC<YourScreenProps> = ({onAction}) => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Screen</Text>
      {/* Screen content */}
    </View>
  );
};

export default YourScreen;
```

#### 3. Create Index File
```typescript
// src/screens/YourScreen/index.ts
export {default} from './YourScreen';
```

#### 4. Create Tests
```typescript
// src/screens/YourScreen/__tests__/YourScreen.test.tsx
import React from 'react';
import {render, fireEvent} from '../../../test/test-utils';
import YourScreen from '../YourScreen';

describe('YourScreen', () => {
  const mockOnAction = jest.fn();
  const defaultProps = {
    onAction: mockOnAction,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<YourScreen {...defaultProps} />);
      expect(getByText('Your Screen')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onAction when triggered', () => {
      const {getByTestId} = render(<YourScreen {...defaultProps} />);
      
      const button = getByTestId('action-button');
      fireEvent.press(button);
      
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });
  });
});
```

## 🧭 Navigation Management

### Adding New Tab Navigation

#### 1. Update Constants
```typescript
// src/constants/index.ts
export const TABS: Tab[] = [
  {key: 'home', label: 'Home', icon: '🏠'},
  {key: 'your-screen', label: 'Your Screen', icon: '✨'}, // Add new tab
  {key: 'settings', label: 'Settings', icon: '⚙️'},
];
```

#### 2. Update Screen Exports
```typescript
// src/screens/index.ts
export {default as HomeScreen} from './HomeScreen';
export {default as YourScreen} from './YourScreen'; // Add export
export {default as SettingsScreen} from './SettingsScreen';
```

#### 3. Update App Navigation
```typescript
// src/App.tsx
import {HomeScreen, SettingsScreen, YourScreen} from './screens';

type AppScreen = 'home' | 'your-screen' | 'settings'; // Add to union

const renderScreen = () => {
  switch (activeTab) {
    case 'home':
      return <HomeScreen />;
    case 'your-screen':
      return <YourScreen />; // Add case
    case 'settings':
      return <SettingsScreen />;
    default:
      return <HomeScreen />;
  }
};
```

### Modal/Stack Navigation Pattern
For screens that don't need tabs (modals, detail views):

```typescript
// In parent component
const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
const [showModal, setShowModal] = useState(false);

const handleItemPress = (item: ItemType) => {
  setSelectedItem(item);
  setShowModal(true);
};

return (
  <View>
    {showModal && selectedItem && (
      <YourModalScreen 
        item={selectedItem}
        onClose={() => setShowModal(false)}
      />
    )}
  </View>
);
```

## 🧪 Testing Guidelines

### Test Structure Standards

#### Component Tests
```typescript
describe('ComponentName', () => {
  // Group tests logically
  describe('Rendering', () => {
    it('renders without crashing', () => {});
    it('displays correct content', () => {});
  });

  describe('Interactions', () => {
    it('handles user input', () => {});
    it('calls callbacks correctly', () => {});
  });

  describe('Error Handling', () => {
    it('handles missing props', () => {});
    it('handles edge cases', () => {});
  });
});
```

#### Required Test Categories
1. **Rendering Tests**: Basic component rendering
2. **Interaction Tests**: User interactions and callbacks
3. **Accessibility Tests**: TestIDs and accessibility props
4. **Error Handling**: Edge cases and missing props
5. **State Tests**: Component state changes

#### Context Mocking Pattern
```typescript
// For components using context
import * as ContextModule from '../../context/SomeContext';

jest.mock('../../context/SomeContext', () => ({
  ...jest.requireActual('../../context/SomeContext'),
  useContext: jest.fn(),
}));

beforeEach(() => {
  (ContextModule.useContext as jest.Mock).mockReturnValue(mockContextValue);
});
```

### Test Coverage Requirements
- **Minimum 80%** coverage for new components
- **All user interactions** must be tested
- **Error scenarios** must be covered
- **Accessibility** features must be verified

## 🎨 Styling and Theming

### Theme Usage
**ALWAYS** use theme context for colors:

```typescript
const {theme} = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background, // ✅ Correct
    // backgroundColor: '#fff', // ❌ Wrong
  },
  text: {
    color: theme.colors.text, // ✅ Correct
  },
});
```

### Available Theme Colors
```typescript
theme.colors.primary          // Primary brand color
theme.colors.background       // Main background
theme.colors.surface         // Card/surface background
theme.colors.text            // Primary text
theme.colors.textSecondary   // Secondary text
theme.colors.border          // Border color
theme.colors.error           // Error color
theme.colors.success         // Success color
theme.colors.tabBarBackground // Navigation background
theme.colors.tabBarActive    // Active tab color
theme.colors.tabBarInactive  // Inactive tab color
```

### Styling Best Practices
1. **Use StyleSheet.create()** for performance
2. **Avoid inline styles** except for dynamic values
3. **Group related styles** in logical sections
4. **Use consistent spacing** (multiples of 8: 8, 16, 24, 32)
5. **Responsive design** considerations

```typescript
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Layout styles
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  // Text styles
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  
  // Interactive styles
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
  },
});
```

## 🔄 State Management

### Local State Patterns
```typescript
// Simple state
const [value, setValue] = useState<string>('');

// Object state
const [form, setForm] = useState<FormData>({
  name: '',
  email: '',
});

// Update object state
const updateForm = (field: keyof FormData, value: string) => {
  setForm(prev => ({...prev, [field]: value}));
};

// Array state
const [items, setItems] = useState<Item[]>([]);

const addItem = (item: Item) => {
  setItems(prev => [...prev, item]);
};

const removeItem = (id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
};
```

### Context Usage
For global state, use existing contexts or create new ones:

```typescript
// src/context/YourContext.tsx
import React, {createContext, useContext, useState} from 'react';

interface YourContextType {
  data: YourData[];
  addData: (item: YourData) => void;
  removeData: (id: string) => void;
}

const YourContext = createContext<YourContextType | undefined>(undefined);

export const YourProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [data, setData] = useState<YourData[]>([]);

  const addData = (item: YourData) => {
    setData(prev => [...prev, item]);
  };

  const removeData = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  return (
    <YourContext.Provider value={{data, addData, removeData}}>
      {children}
    </YourContext.Provider>
  );
};

export const useYourContext = () => {
  const context = useContext(YourContext);
  if (!context) {
    throw new Error('useYourContext must be used within YourProvider');
  }
  return context;
};
```

## 🧩 Component Patterns

### Reusable Component Structure
```typescript
interface ComponentProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
}

const Component: React.FC<ComponentProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  testID,
}) => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    button: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: variant === 'primary' 
        ? theme.colors.primary 
        : theme.colors.surface,
      opacity: disabled ? 0.6 : 1,
    },
    text: {
      color: variant === 'primary' 
        ? '#fff' 
        : theme.colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      activeOpacity={0.8}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
```

### List Component Pattern
```typescript
interface ListItemProps {
  item: ItemType;
  onPress: (item: ItemType) => void;
}

const ListItem: React.FC<ListItemProps> = ({item, onPress}) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      {/* Item content */}
    </TouchableOpacity>
  );
};

const List: React.FC<ListProps> = ({data, onItemPress}) => {
  const renderItem = ({item}: {item: ItemType}) => (
    <ListItem item={item} onPress={onItemPress} />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};
```

## 📝 TypeScript Best Practices

### Interface Definitions
```typescript
// Props interfaces
interface ScreenProps {
  title: string;
  subtitle?: string;
  onAction?: () => void;
}

// Data interfaces
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Union types for variants
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Callback types
type onChangeCallback = (value: string) => void;
type onSelectCallback = (item: Item) => void;
```

### Generic Patterns
```typescript
// Generic list component
interface ListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  onItemPress?: (item: T) => void;
}

function List<T extends {id: string}>({data, renderItem, onItemPress}: ListProps<T>) {
  // Implementation
}
```

### Type Guards
```typescript
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const hasProperty = <T extends object>(obj: T, key: string): key is keyof T => {
  return key in obj;
};
```

## ⚡ Performance Guidelines

### Optimization Techniques
1. **Use React.memo()** for expensive components
2. **useCallback()** for event handlers
3. **useMemo()** for expensive calculations
4. **Avoid inline functions** in render
5. **Optimize FlatList** with getItemLayout

```typescript
// Memoized component
const ExpensiveComponent = React.memo<Props>(({data}) => {
  return <View>{/* Expensive rendering */}</View>;
});

// Memoized callbacks
const handlePress = useCallback((item: Item) => {
  onItemPress(item);
}, [onItemPress]);

// Memoized calculations
const processedData = useMemo(() => {
  return data.filter(item => item.active).sort((a, b) => a.name.localeCompare(b.name));
}, [data]);
```

### FlatList Optimization
```typescript
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

## ♿ Accessibility

### Required Accessibility Props
```typescript
<TouchableOpacity
  testID="action-button"
  accessibilityLabel="Perform action"
  accessibilityHint="Double tap to perform the action"
  accessibilityRole="button">
  <Text>Action</Text>
</TouchableOpacity>

<TextInput
  testID="email-input"
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email address"
  placeholder="Enter email"
/>
```

### TestID Naming Convention
- Use descriptive, hierarchical names
- Format: `component-action-identifier`
- Examples: `product-card-1`, `add-to-cart-button`, `search-input`

## 📋 Development Checklist

### Before Creating a New Screen
- [ ] Plan the component structure
- [ ] Define TypeScript interfaces
- [ ] Identify required props and state
- [ ] Plan navigation integration
- [ ] Consider accessibility requirements

### During Development
- [ ] Use theme context for all colors
- [ ] Add proper TypeScript types
- [ ] Include testIDs for testing
- [ ] Handle loading and error states
- [ ] Implement accessibility features

### After Implementation
- [ ] Write comprehensive tests
- [ ] Test on both light and dark themes
- [ ] Verify accessibility
- [ ] Test error scenarios
- [ ] Update navigation if needed

## 🔍 Code Review Checklist

### Code Quality
- [ ] No hardcoded colors (use theme)
- [ ] Proper TypeScript types
- [ ] Consistent naming conventions
- [ ] No inline styles (except dynamic)
- [ ] Error handling implemented

### Testing
- [ ] All interactions tested
- [ ] Edge cases covered
- [ ] Accessibility verified
- [ ] Error scenarios tested
- [ ] Minimum 80% coverage

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper use of memoization
- [ ] Optimized list rendering
- [ ] No memory leaks

### Accessibility
- [ ] TestIDs added
- [ ] Accessibility labels
- [ ] Screen reader support
- [ ] Touch targets adequate

## 📚 References

### Template Examples
- Use `src/screen-templates/` for all templates and examples
- **Basic Templates**: Simple starting points (ListScreenTemplate, FormScreenTemplate, etc.)
- **Complex Examples** (`examples/` folder): Full implementations (ProductListScreen, CartScreen, etc.)
- All templates include comprehensive testing and documentation

### Key Files to Reference
- `src/context/ThemeContext.tsx` - Theme implementation
- `src/test/test-utils.tsx` - Testing utilities
- `src/types/index.ts` - Type definitions
- `src/constants/index.ts` - App constants

### External Documentation
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [TypeScript React Cheatsheet](https://github.com/typescript-cheatsheets/react)

---

Following these guidelines ensures consistent, maintainable, and high-quality React Native applications. Always prioritize user experience, accessibility, and code quality in your implementations. 