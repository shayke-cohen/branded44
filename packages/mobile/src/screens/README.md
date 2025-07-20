# 📱 Mobile Screens

This directory contains all mobile screens for the Branded44 app.

## 🎯 **ULTRA-SIMPLE: Array-Based Screen Creation!**

To add a new screen, **create the file and add it to the config** - that's it!

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

### ✅ **Step 2: Add to Config**

Add your screen name to `src/config/screens.ts`:

```typescript
export const SCREENS_TO_IMPORT = [
  'HomeScreen',
  'SettingsScreen', 
  'ProfileScreen',
  'MessagesScreen',
  'NotificationsScreen',
  'TemplateIndexScreen',
  'ExampleScreen'  // ← Just add this line!
];
```

### ✅ **Step 3: That's It!** 

**Clean, simple, organized!** The screen will automatically:

- ✅ Be discovered and imported
- ✅ Register itself in the navigation
- ✅ Appear in the correct tab order
- ✅ Work on both mobile and web

## 🔧 **How It Works**

1. **Simple Config**: `src/config/screens.ts` lists all screens to import
2. **Auto-Import**: System imports each screen from the array
3. **Self-Registration**: Each screen's `registerScreen` call executes on import
4. **Navigation**: Registry system creates navigation tabs automatically

## 🎯 **Screen File Patterns**

Place your screen file in any of these patterns:
- ✅ `screens/ExampleScreen.tsx` (direct file)
- ✅ `screens/ExampleScreen/ExampleScreen.tsx` (folder + file)

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
│   └── screens.ts          ← Screen configuration (add new screens here)
├── screens/
│   ├── ExampleScreen.tsx   ← Your screen files
│   └── ...
└── screen-templates/
    └── templateConfig.ts   ← Auto-imports from config
```

## 🎉 **Result: Clean & Simple Screen Creation!**

1. **Create screen file** with `registerScreen` call
2. **Add name to config array**  
3. **Done!** Screen appears in navigation! 🚀

**Simple array-based configuration - easy to understand and maintain!** 