# @branded44/mobile

A powerful React Native application designed as an AI-powered mobile app development platform. This package serves as both a functional app and a foundation for LLM-generated mobile applications, featuring template-based screen generation, Wix integration, and comprehensive testing infrastructure.

## 🚀 Overview

### Vision & Motivation
**Branded44 Mobile** is built to be the perfect canvas for AI-powered app development. It provides:
- **LLM-Ready Architecture**: Clean, modular structure ideal for Claude Code and other AI tools
- **Template-Based Development**: Rich collection of screen templates for rapid prototyping
- **Wix Platform Integration**: Native support for Wix e-commerce, CMS, and member systems
- **Production-Ready Foundation**: Complete testing, theming, and navigation infrastructure

### Core Philosophy
1. **AI-First Design**: Every component is structured for easy AI comprehension and modification
2. **Template-Driven**: Reusable screen templates accelerate development
3. **Platform Integration**: Deep Wix integration for real-world functionality
4. **Developer Experience**: Comprehensive testing and development tools

## ✨ Key Features

### 🤖 AI Development Ready
- **Clean Architecture**: Modular structure perfect for LLM understanding
- **Self-Documenting Code**: Comprehensive TypeScript types and clear naming
- **Template Library**: Pre-built screen templates for common use cases
- **Integration Points**: Well-defined APIs for adding new functionality

### 🏪 Wix Platform Integration
- **E-commerce Ready**: Product lists, shopping cart, checkout flows
- **Member Management**: Authentication, profiles, member-only content
- **CMS Integration**: Dynamic content from Wix collections
- **Real API Connections**: Production-ready Wix SDK integration

### 📱 Mobile-First Design
- **Bottom Tab Navigation**: Clean, intuitive navigation system
- **Theme Support**: Light, Dark, and System theme modes
- **Responsive Layouts**: Optimized for all screen sizes
- **Native Performance**: React Native 0.80.1 with latest optimizations

### 🧪 Development Excellence
- **Comprehensive Testing**: Jest + React Native Testing Library
- **TypeScript Coverage**: Full type safety throughout
- **Hot Reload**: Fast development iteration
- **Debugging Tools**: Flipper and React Native Debugger ready

## 📱 Application Structure

### Current Screens
```
🏠 HomeScreen          - Welcome hub with feature showcase
⚙️ SettingsScreen      - Theme management and app configuration
📚 TemplateIndexScreen - Browse available screen templates
```

### Template Gallery
Located in `src/screen-templates/examples/`:
```
🛍️ E-commerce Suite
├── ProductListScreen    - Product catalog with search/filter
├── ProductDetailScreen  - Detailed product view with images
├── CartScreen          - Shopping cart management
└── CheckoutScreen      - Complete checkout flow

🔍 SearchScreen         - Universal search interface
```

### Wix Integration Screens
Located in `src/screens/wix/`:
```
🛒 CartScreen          - Wix Stores shopping cart
📦 ProductListScreen   - Wix Stores product catalog
📄 ProductDetailScreen - Wix Stores product details
📝 CMSScreen          - Wix CMS content display
👤 MemberAuthScreen   - Wix Members authentication
```

## 🏗️ Architecture Deep Dive

### Project Structure
```
src/
├── App.tsx                     # Main app with navigation
├── components/                 # Reusable UI components
│   ├── AppContainer/          # Main app wrapper
│   ├── BottomNavigation/      # Tab navigation system
│   ├── CustomAlert/           # Alert system
│   └── index.ts               # Component exports
├── config/                    # App configuration
│   ├── importScreens.ts       # Dynamic screen importing
│   ├── registerTemplateScreen.ts # Template registration
│   ├── registry.ts            # Screen registry system
│   └── wixConfig.ts           # Wix platform setup
├── constants/                 # App-wide constants
├── context/                   # React Context providers
│   ├── AlertContext.tsx       # Global alert system
│   ├── CartContext.tsx        # Local cart state
│   ├── MemberContext.tsx      # Member authentication
│   ├── ProductCacheContext.tsx # Product caching
│   ├── ThemeContext.tsx       # Theme management
│   └── WixCartContext.tsx     # Wix cart integration
├── screen-templates/          # Template library
│   ├── AuthScreenTemplate.tsx
│   ├── DashboardScreenTemplate.tsx
│   ├── FormScreenTemplate.tsx
│   ├── ListScreenTemplate.tsx
│   ├── examples/              # Complete example screens
│   └── TemplateRenderer.tsx   # Template engine
├── screens/                   # Main application screens
│   ├── HomeScreen/            # App welcome screen
│   ├── SettingsScreen/        # Configuration screen
│   ├── TemplateIndexScreen/   # Template browser
│   └── wix/                   # Wix integration screens
├── test/                      # Testing utilities
├── types/                     # TypeScript definitions
└── utils/                     # Helper functions
```

### Key Design Patterns

#### 1. Template System
```typescript
// Easy template registration
import { registerTemplateScreen } from '../config/registerTemplateScreen';

registerTemplateScreen({
  name: 'YourNewScreen',
  category: 'Business',
  icon: '📊',
  component: YourNewScreen,
});
```

#### 2. Context-Driven State
```typescript
// Theme management
const { theme, toggleTheme } = useTheme();

// Member authentication
const { member, login, logout } = useMember();

// Shopping cart
const { cart, addToCart, removeFromCart } = useCart();
```

#### 3. Modular Screen Structure
```typescript
// Self-contained screen modules
src/screens/YourScreen/
├── YourScreen.tsx           # Main component
├── __tests__/
│   └── YourScreen.test.tsx  # Test suite
└── index.ts                 # Clean exports
```

## 🛠️ Development Workflow

### Prerequisites
- **Node.js**: ≥18.0.0
- **React Native CLI**: Latest
- **iOS**: Xcode 14+ (macOS only)
- **Android**: Android Studio + SDK 33+

### Quick Start
```bash
# Install dependencies
yarn install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
yarn start

# Run on iOS
yarn ios

# Run on Android  
yarn android
```

### Available Scripts
```bash
# Development
yarn dev              # Start Metro bundler
yarn ios              # Run on iOS simulator
yarn android          # Run on Android emulator

# Testing
yarn test             # Run all tests
yarn test:watch       # Watch mode testing
yarn test:coverage    # Generate coverage report
yarn test:ci          # CI-optimized testing

# Maintenance
yarn lint             # ESLint check
yarn lint:fix         # Auto-fix linting issues
yarn clean            # Clean build cache
yarn reset-cache      # Reset Metro cache
```

## 🎨 Adding New Screens

### Method 1: Using Templates (Recommended)
```typescript
// 1. Create screen using template
import { DashboardScreenTemplate } from '../screen-templates';

const MyDashboard = () => (
  <DashboardScreenTemplate
    title="My Dashboard"
    widgets={[
      { type: 'metric', title: 'Sales', value: '$12,345' },
      { type: 'chart', title: 'Growth', data: chartData },
    ]}
  />
);

// 2. Register the screen
registerTemplateScreen({
  name: 'MyDashboard',
  category: 'Business',
  icon: '📊',
  component: MyDashboard,
});
```

### Method 2: From Scratch
```typescript
// 1. Create component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context';

const NewScreen = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        New Screen
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600' },
});

export default NewScreen;

// 2. Add to navigation (src/constants/index.ts)
export const TABS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'new-screen', label: 'New', icon: '✨' }, // Add this
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];
```

## 🧪 Testing Strategy

### Test Structure
```bash
# Component tests
src/components/BottomNavigation/__tests__/BottomNavigation.test.tsx

# Screen tests  
src/screens/HomeScreen/__tests__/HomeScreen.test.tsx

# Context tests
src/context/__tests__/ThemeContext.test.tsx

# Integration tests
__tests__/Navigation.integration.test.tsx
```

### Test Utilities
```typescript
// Custom test utilities in src/test/test-utils.tsx
import { render } from '../test/test-utils'; // Pre-configured with providers

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });
});
```

### Running Tests
```bash
yarn test                    # All tests
yarn test MyComponent        # Specific test
yarn test:watch             # Watch mode
yarn test:coverage          # With coverage
```

## 🎨 Theming System

### Using Themes
```typescript
import { useTheme } from '../context';

const MyComponent = () => {
  const { theme, currentTheme, setTheme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    text: {
      color: theme.colors.text,
      fontSize: theme.fonts.body.fontSize,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed Content</Text>
    </View>
  );
};
```

### Available Theme Properties
```typescript
// Colors
theme.colors.primary         // Brand primary
theme.colors.background      // Main background
theme.colors.surface         // Card background
theme.colors.text           // Primary text
theme.colors.textSecondary  // Secondary text
theme.colors.border         // Border color
theme.colors.error          // Error color
theme.colors.success        // Success color

// Typography
theme.fonts.heading         // Heading styles
theme.fonts.body           // Body text styles
theme.fonts.caption        // Caption styles
```

## 🏪 Wix Integration

### E-commerce Features
```typescript
// Using Wix Stores
import { useWixCart } from '../context/WixCartContext';

const ProductScreen = () => {
  const { cart, addToCart } = useWixCart();
  
  const handleAddToCart = (product) => {
    addToCart(product);
  };
};
```

### Member Authentication
```typescript
// Using Wix Members
import { useMember } from '../context/MemberContext';

const AuthScreen = () => {
  const { member, login, logout } = useMember();
  
  if (member) {
    return <MemberDashboard />;
  }
  
  return <LoginForm onLogin={login} />;
};
```

### Configuration
```typescript
// src/config/wixConfig.ts
export const wixConfig = {
  clientId: 'your-wix-client-id',
  apiKey: 'your-wix-api-key',
  // Additional Wix configuration
};
```

## 🔄 Integration with Other Packages

### Web Preview (`@branded44/web`)
- **Screen Previewing**: All mobile screens can be previewed in web browser
- **Hot Reload**: Changes reflect immediately in web preview
- **Device Frames**: Realistic iPhone/Android preview frames

### Development Server (`@branded44/server`)
- **Claude Code Integration**: Direct AI-powered development
- **Prompt Generation**: Automated prompt creation for new features
- **Real-time Updates**: Live development with AI assistance

### Workflow Integration
```bash
# 1. Start development server
yarn workspace @branded44/server dev

# 2. Start web preview
yarn workspace @branded44/web dev

# 3. Start mobile development
yarn workspace @branded44/mobile start
```

## 📦 Dependencies

### Core Dependencies
- **React Native**: 0.80.1 - Latest stable version
- **React**: 19.1.0 - Latest React features
- **TypeScript**: 5.0.4 - Type safety
- **@react-native-async-storage/async-storage**: Persistent storage

### Wix Integration
- **@wix/sdk**: 1.15.24 - Wix platform SDK
- **@wix/data**: Wix data collections
- **@wix/ecom**: E-commerce functionality
- **@wix/data-collections**: CMS integration

### Development Tools
- **Jest**: Testing framework
- **@testing-library/react-native**: Component testing
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 🚀 Deployment

### Android Build
```bash
yarn build:android
# Output: android/app/build/outputs/apk/release/
```

### iOS Build
```bash
yarn build:ios
# Output: ios/build/Build/Products/Release-iphoneos/
```

### Release Preparation
1. Update version in `package.json`
2. Test all functionality
3. Run full test suite
4. Build for target platforms
5. Deploy through respective app stores

## 🤝 Contributing

### Development Guidelines
1. **Follow TypeScript**: Use strict type checking
2. **Write Tests**: Every component needs tests
3. **Use Templates**: Leverage existing templates when possible
4. **Document Changes**: Update README for new features
5. **Maintain Compatibility**: Ensure web preview still works

### Code Style
- **ESLint**: Follow configured rules
- **Prettier**: Auto-format code
- **Naming**: Use descriptive, clear names
- **Structure**: Keep components modular and focused

## 📊 Performance & Optimization

### Bundle Size Optimization
- **Metro**: Optimized bundling configuration
- **Tree Shaking**: Automatic dead code elimination
- **Asset Optimization**: Compressed images and resources

### Runtime Performance
- **React Native**: Latest performance optimizations
- **Memory Management**: Efficient context usage
- **Navigation**: Optimized screen transitions

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: Secure AsyncStorage usage
- **API Security**: Proper authentication tokens
- **Member Data**: Privacy-compliant member handling

### Wix Platform Security
- **OAuth**: Secure member authentication
- **API Keys**: Proper key management
- **Data Encryption**: Secure data transmission

## 📄 License

This project is private and proprietary. All rights reserved.

---

**Branded44 Mobile** - Your AI-Powered Mobile Development Platform 🚀 