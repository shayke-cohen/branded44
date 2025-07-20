# React Native App Scaffold

A modern, clean React Native application scaffold designed as a starting point for LLM-generated applications. This project provides a solid foundation with essential features and best practices while maintaining simplicity for rapid development.

## 🚀 Features

### Core Structure
- **Clean Architecture**: Modular structure with clear separation of concerns
- **TypeScript**: Full type safety throughout the application
- **Theme Support**: Light, Dark, and System theme modes with consistent styling
- **Navigation**: Simple bottom tab navigation system
- **Testing Setup**: Comprehensive testing configuration and utilities

### Starting Point Features
- **Home Screen**: Simple welcome screen ready for customization
- **Settings Screen**: Complete theme management and app configuration
- **Template Library**: Reference implementations in `screens/templates/` folder

### Technical Features
- **Context API**: Centralized theme management
- **Modern React Patterns**: Hooks, functional components, and best practices
- **Testing Framework**: Jest and React Native Testing Library setup
- **Type Safety**: Comprehensive TypeScript coverage

## 📱 Screens

### 1. Home Screen
- **Purpose**: Main entry point for your application
- **Features**:
  - Simple welcome message
  - Clean, centered layout
  - Theme-aware styling
  - Ready for customization

### 2. Settings Screen
- **Purpose**: App configuration and theme management
- **Features**:
  - Theme selection (System, Light, Dark)
  - Visual theme preview
  - Current theme indicator
  - Appearance customization

### 3. Template Screens (Reference)
Located in `src/screens/templates/`, these provide examples of:
- **ProductListScreen**: E-commerce product listing
- **ProductDetailScreen**: Product detail view
- **CartScreen**: Shopping cart functionality
- **SearchScreen**: Search interface
- **CheckoutScreen**: Checkout flow

## 🏗️ Source Structure

```
src/
├── App.tsx                    # Main app component with navigation
├── components/                # Reusable UI components
│   ├── BottomNavigation/      # Tab navigation component
│   │   ├── BottomNavigation.tsx
│   │   └── index.ts           # Export file
│   └── index.ts               # Components barrel export
├── constants/                 # App-wide constants
│   └── index.ts               # Navigation, theme, validation constants
├── context/                   # React Context providers
│   ├── ThemeContext.tsx       # Theme management context
│   ├── __tests__/             # Context tests
│   └── index.ts               # Context barrel export
├── screens/                   # Screen components
│   ├── HomeScreen/            # Main home interface
│   │   ├── HomeScreen.tsx
│   │   └── index.ts
│   ├── SettingsScreen/        # Settings interface
│   │   ├── SettingsScreen.tsx
│   │   ├── __tests__/         # Screen tests
│   │   └── index.ts
│   ├── templates/             # Reference screen implementations
│   │   ├── ProductListScreen/ # E-commerce product list
│   │   ├── ProductDetailScreen/ # Product detail view
│   │   ├── CartScreen/        # Shopping cart
│   │   ├── SearchScreen/      # Search functionality
│   │   ├── CheckoutScreen/    # Checkout flow
│   │   └── index.ts           # Templates export
│   └── index.ts               # Screens barrel export
├── test/                      # Testing utilities
│   ├── setup.ts               # Jest test setup
│   └── test-utils.tsx         # Custom testing utilities
├── types/                     # TypeScript type definitions
│   └── index.ts               # App-wide type definitions
└── index.ts                   # Main barrel export
```

### Architecture Principles

1. **Modular Structure**: Each feature is self-contained with its own folder
2. **Barrel Exports**: Clean imports using index.ts files
3. **Co-located Tests**: Tests live alongside the code they test
4. **Type Safety**: Comprehensive TypeScript coverage
5. **Separation of Concerns**: Clear separation between UI, logic, and data
6. **Template Reference**: Complete examples in templates folder

## 🔧 Getting Started

### Prerequisites
- Node.js >= 18
- React Native CLI
- iOS: Xcode and iOS Simulator
- Android: Android Studio and Android SDK

### Installation
```bash
# Install dependencies
yarn install

# iOS setup (macOS only)
cd ios && pod install && cd ..
```

### Development
```bash
# Start Metro bundler
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android
```

## 📱 Adding New Screens

### Quick Start
1. **Create Screen Directory**
```bash
mkdir src/screens/YourScreen
```

2. **Create Screen Component**
```typescript
// src/screens/YourScreen/YourScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context';

const YourScreen = () => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your New Screen</Text>
    </View>
  );
};

export default YourScreen;
```

3. **Create Index File**
```typescript
// src/screens/YourScreen/index.ts
export {default} from './YourScreen';
```

4. **Update Navigation**
```typescript
// src/constants/index.ts - Add tab
export const TABS: Tab[] = [
  {key: 'home', label: 'Home', icon: '🏠'},
  {key: 'your-screen', label: 'Your Screen', icon: '✨'}, // Add this
  {key: 'settings', label: 'Settings', icon: '⚙️'},
];

// src/screens/index.ts - Export screen
export {default as YourScreen} from './YourScreen';

// src/App.tsx - Add to navigation
import {HomeScreen, SettingsScreen, YourScreen} from './screens';

// Add case in renderScreen()
case 'your-screen':
  return <YourScreen />;
```

### Using Template Examples
Reference the template screens for complex functionality:
- Copy from `src/screens/templates/`
- Adapt to your needs
- Full e-commerce, search, and cart examples available

## 🧪 Testing

### Running Tests
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run specific test
yarn test YourScreen.test.tsx
```

### Writing Tests
```typescript
// src/screens/YourScreen/__tests__/YourScreen.test.tsx
import React from 'react';
import {render} from '../../../test/test-utils';
import YourScreen from '../YourScreen';

describe('YourScreen', () => {
  it('renders correctly', () => {
    const {getByText} = render(<YourScreen />);
    expect(getByText('Your New Screen')).toBeTruthy();
  });
});
```

## 🎨 Theming

### Using Themes
```typescript
import {useTheme} from '../../context';

const MyComponent = () => {
  const {theme} = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.text,
    },
  });
  
  return <View style={styles.container}>...</View>;
};
```

### Available Theme Colors
- `theme.colors.primary` - Primary brand color
- `theme.colors.background` - Main background
- `theme.colors.surface` - Card/surface background
- `theme.colors.text` - Primary text
- `theme.colors.textSecondary` - Secondary text
- `theme.colors.border` - Border color
- `theme.colors.error` - Error color
- `theme.colors.success` - Success color

## 📦 Template Features

The templates folder contains fully functional examples:

### E-commerce Features (ProductListScreen, ProductDetailScreen, CartScreen)
- Product catalog with categories
- Product search and filtering
- Shopping cart functionality
- Product detail views
- Cart management

### Checkout Flow (CheckoutScreen)
- Order processing
- Form validation
- Payment flow simulation

### Search Interface (SearchScreen)
- Search functionality
- Filter and sort options
- Results display

## 📄 License

This project is private and not licensed for public use.