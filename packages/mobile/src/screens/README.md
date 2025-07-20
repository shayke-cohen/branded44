# 📱 Mobile Screens

This directory contains all mobile screens for the Branded44 app.

## 🎯 **TRULY GENERIC: Registry-Based Screen System!**

To add a new screen, **create the file and add one import** - everything else is automatic!

### ✅ **Step 1: Create Screen File**

Create your screen file anywhere in the `screens/` directory:

```typescript
// src/screens/ExampleScreen.tsx
import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {useTheme} from '../context';
import {registerScreen} from '../config/registry';

const ExampleScreen = () => {
  const {theme} = useTheme();
  
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Text style={{color: theme.colors.text}}>Hello from Example Screen!</Text>
    </SafeAreaView>
  );
};

// 🎯 SINGLE FILE REGISTRATION - THIS IS ALL YOU NEED!
registerScreen(ExampleScreen, {
  name: 'Example',
  icon: '🎯',
  category: 'Demo',
  hasTab: true,
  tabPosition: 7, // Choose position in navigation
  description: 'An example screen',
  tags: ['demo', 'example']
});

export default ExampleScreen;
```

### ✅ **Step 2: Add Import**

Add your screen import to `src/config/importScreens.ts`:

```typescript
// Import all screens - each will self-register SYNCHRONOUSLY
import '../screens/HomeScreen/HomeScreen';
import '../screens/SettingsScreen/SettingsScreen';
import '../screens/ProfileScreen/ProfileScreen';
import '../screens/MessagesScreen/MessagesScreen';
import '../screens/NotificationsScreen';
import '../screens/ContactsScreen';
import '../screens/ExampleScreen';  // ← Just add this line!
import '../screens/TemplateIndexScreen/TemplateIndexScreen';
```

### ✅ **Step 3: That's It!** 

**100% Generic System!** The screen will automatically:

- ✅ **Register itself** in the unified registry
- ✅ **Appear in mobile navigation** (if hasTab: true)
- ✅ **Appear in web preview** automatically
- ✅ **Be discoverable** via getScreens()
- ✅ **Render dynamically** via getScreenComponent()
- ✅ **Work everywhere** with zero additional configuration

## 🚀 **How The Generic System Works**

### **📱 Mobile:**
- Imports `config/importScreens.ts`
- Uses `getNavTabs()` and `getScreenComponent()` from registry
- Navigation tabs appear automatically in correct order

### **🌐 Web:**
- Imports same `@mobile/config/importScreens` 
- Uses `getScreens()` and `getScreenComponent()` from registry
- Screens appear in preview automatically

### **🎯 Registry System:**
```typescript
// Everything is automatic via the registry:
const screens = getScreens();           // Get all registered screens
const tabs = getNavTabs();             // Get navigation tabs
const Component = getScreenComponent(id); // Get screen component
```

## 📋 **Screen Metadata**

Configure your screen behavior with metadata:

```typescript
registerScreen(MyScreen, {
  name: 'Display Name',        // Required
  icon: '🎯',                 // Tab icon
  category: 'Navigation',      // Grouping
  hasTab: true,               // Show in navigation?
  tabPosition: 5,             // Tab order (1-N)
  description: 'Purpose...',   // Help text
  tags: ['tag1', 'tag2']      // Search/filtering
});
```

## 📁 **File Structure**

```
src/
├── config/
│   └── importScreens.ts    ← 🎯 ONLY place to add imports
├── screens/
│   ├── ExampleScreen.tsx   ← 📱 Create screens here
│   └── ...
└── screen-templates/
    └── templateConfig.ts   ← 🔧 Uses registry automatically
```

## 🎉 **Result: True Generic Screen System!**

1. **Create screen file** with `registerScreen` call
2. **Add import line** to `config/importScreens.ts`  
3. **Done!** Screen appears everywhere automatically! 🚀

**No hardcoded lists, no manual navigation setup, no platform-specific code!**

## ✅ **Benefits:**

- ✅ **Single source of truth** - only imports need manual maintenance
- ✅ **Platform agnostic** - same system for mobile and web
- ✅ **Registry-driven** - everything else is automatic
- ✅ **Type-safe** - full TypeScript support
- ✅ **Extensible** - easy to add new screen types
- ✅ **Maintainable** - minimal boilerplate code

**The screen system is now 100% generic and platform-agnostic!** 🎯 