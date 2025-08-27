# 🎯 Dynamic Screen Support Guide

## 🚀 Supporting Your Application Screens Generically

This guide explains how to extend the Dynamic Screen Loading System to support your real application screens (Home, Store, Services, etc.).

## 📊 Current Support Status

### ✅ **Fully Supported**
- **DynamicTestScreen** - Custom demo screen with hooks and utilities
- **Basic React Native Components** - View, Text, ScrollView, TouchableOpacity, etc.
- **Core React Hooks** - useState, useEffect, useCallback, useMemo, etc.
- **Basic Context System** - Theme, Member, Cart (mocked)
- **Design Tokens** - SPACING, COLORS constants

### ⚡ **Phase 1: Expanded Context (Implemented)**
```typescript
// Now available in evaluation context:
- 15+ React Native Components (SafeAreaView, Modal, FlatList, etc.)
- React Native APIs (StyleSheet, Platform, Dimensions, Alert)
- Context Hooks (useTheme, useMember, useCart)
- Design Tokens (SPACING, COLORS)
- Mock Components (LoginForm, ErrorCard, LoadingCard)
- Native Modules (AsyncStorage - mocked)
- Utility Functions (cn)
```

### 🔄 **Phase 2: Component Library Integration (Pending)**

To support your 70+ custom components from `components/blocks`:

```typescript
// Need to add to evaluation context:
import {
  // Auth Components
  LoginForm, SignupForm, ProfileCard, SocialLoginButtons,
  
  // List Components  
  UserList, ProductGrid, ProductList, ArticleList,
  
  // E-commerce Components
  ProductCard, CartItem, CartSummary,
  
  // Business Components
  StatsCard, ProgressCard,
  
  // Booking Components (from blocks/booking)
  ServiceCard, BookingCalendar, TimeSlotGrid,
  
  // Restaurant Components
  MenuCard, RestaurantCard, OrderItemCard,
  
  // 60+ more components...
} from '@mobile/components/blocks';
```

### 🏗️ **Phase 3: Advanced Context Providers (Pending)**

Your screens use complex contexts that need proper setup:

```typescript
// Required Context Providers:
- ThemeProvider (with light/dark theme support)
- MemberProvider (Wix member authentication)
- WixCartProvider (shopping cart state)
- WixBookingProvider (booking services)
- AlertProvider (custom alert system)
- PlatformContextResolver (cross-platform compatibility)
```

### 🔌 **Phase 4: External Dependencies (Pending)**

Your screens import external services that need mocking/proxying:

```typescript
// External Dependencies to Mock:
- Wix SDK clients (booking, ecommerce, CMS)
- AsyncStorage (@react-native-async-storage/async-storage)
- Navigation systems
- Push notification services
- Deep linking handlers
```

## 🎯 **Immediate Next Steps**

### **Step 1: Test HomeScreen**
```bash
# Refresh browser and try HomeScreen
# Look for console errors to identify missing dependencies
```

### **Step 2: Add Missing Components** 
When you see errors like `ProductCard is not defined`:

```typescript
// Add to createEvaluationContext():
ProductCard: ({ product }: any) => React.createElement(RNWeb.View, 
  { style: { padding: 16, backgroundColor: '#fff', margin: 8 } },
  React.createElement(RNWeb.Text, {}, `Product: ${product?.name || 'Loading...'}`)
),
```

### **Step 3: Add Missing Hooks**
When you see errors like `useNavigation is not defined`:

```typescript
// Add to createEvaluationContext():
useNavigation: () => ({
  navigate: (route: string, params?: any) => console.log(`[Nav] ${route}`, params),
  goBack: () => console.log('[Nav] Going back'),
  push: (route: string, params?: any) => console.log(`[Nav] Push ${route}`, params),
}),
```

## 🚀 **Advanced Configuration**

### **Enable Real Wix Integration** (Future)
```typescript
// Replace mocks with real Wix clients
const useWixBooking = () => {
  // Connect to real Wix Booking API
  return wixBookingClient.getServices();
};
```

### **Add Navigation Support**
```typescript
// Add React Navigation support
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
```

### **Performance Optimization**
```typescript
// Lazy-load heavy components
const ProductGrid = React.lazy(() => import('@mobile/components/blocks/ProductGrid'));
```

## 🎉 **Benefits of Generic Support**

1. **🚀 Live Development**: Edit any screen file and see instant updates
2. **🎯 Component Testing**: Test components in isolation
3. **📱 Cross-Platform Preview**: See mobile screens in web environment  
4. **🔧 Debugging**: Full access to React DevTools and console
5. **⚡ Hot Reload**: Faster iteration than mobile simulators
6. **🎨 Design System**: Visual testing of design tokens and themes

## 🔍 **Troubleshooting**

### **Common Errors & Solutions**

| Error | Solution |
|-------|----------|
| `Component is not defined` | Add component to evaluation context |
| `Hook is not defined` | Add hook mock to evaluation context |
| `Context provider error` | Add context provider to wrapper |
| `Module not found` | Add module to require() mock |
| `Platform specific code` | Add Platform.select() logic |

### **Debug Commands**
```javascript
// In browser console:
window.__DEBUG_SESSION__.testAll() // Test all dynamic loading
```

---

**🎯 Ready to support all your screens!** The foundation is in place - now we incrementally add what each screen needs as we encounter missing dependencies.
