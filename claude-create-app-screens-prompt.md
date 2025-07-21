# Claude Code Prompt: Generate Multiple App Screens from Description

I want you to create all the necessary screens for a complete React Native application. This app uses a unified registry system for automatic screen registration and navigation.

## 🎯 Start Here: Ask for App Description

**FIRST, ask the user for a simple app description:**

```
Hi! I'll help you create a complete React Native app with multiple screens. 

Please describe the app you want me to build - just tell me what it is and what it does:

📱 **App Description**: _[Tell me about your app idea - what is it and what does it do?]_
```

**After getting their description, analyze it and deduce:**
- App name and purpose
- Target users and audience  
- Core features needed
- Logical user flow
- Required screens
- Navigation structure
- Content and functionality

**Then proceed to build the complete app based on your analysis.**

## 🏗️ What You'll Create

Based on the app description, you should:

1. **Analyze Requirements** - Identify all needed screens
2. **Plan Navigation Flow** - Design logical user journeys  
3. **Create Screen Files** - Generate complete React Native screens
4. **Configure Navigation** - Set up bottom tabs and screen order
5. **Add Import Registration** - Register all screens in the system

## 📋 Screen Creation Requirements

### For Each Screen You Create:

#### 1. File Structure
```
branded44/packages/mobile/src/screens/
├── [ScreenName]/
│   ├── [ScreenName].tsx          # Main screen component
│   └── index.ts                  # Export file (optional)
└── [SimpleScreen].tsx            # For simple screens
```

#### 2. Required Template Per Screen
```typescript
import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import {useTheme} from '../../context';
import {registerScreen} from '../../config/registry';

const [ScreenName]Screen = () => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 24,
      lineHeight: 24,
    },
    // Add screen-specific styles...
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>[Screen Title]</Text>
        <Text style={styles.subtitle}>[Screen Description]</Text>
        
        {/* Add screen-specific content here */}
        
      </ScrollView>
    </SafeAreaView>
  );
};

// Self-register this screen
registerScreen([ScreenName]Screen, {
  name: '[Display Name]',
  icon: '[Emoji]',
  category: '[Category]',
  hasTab: [true/false],
  tabPosition: [Number],
  description: '[Purpose description]',
  tags: ['tag1', 'tag2', 'tag3']
});

export default [ScreenName]Screen;
```

#### 3. Navigation Planning
- **Main Navigation Screens** (hasTab: true) - Core app sections
- **Secondary Screens** (hasTab: false) - Detail/modal screens
- **Tab Positions** - Logical order (8+ available, 1-7 used)

## 🗂️ Tab Positions (Reference Only)

**Current example positions** - you can completely replace these with your app's screens:

| Position | Current Screen | Icon | Status |
|----------|----------------|------|--------|
| 1 | Home (example) | 🏠 | **Replaceable** |
| 2 | Messages (example) | 💬 | **Replaceable** |
| 3 | Notifications (example) | 🔔 | **Replaceable** |
| 4 | Profile (example) | 👤 | **Replaceable** |
| 5 | Settings (example) | ⚙️ | **Replaceable** |
| 6 | Contacts (example) | 👥 | **Replaceable** |
| 7 | Templates (example) | 📋 | **Replaceable** |
| 8+ | Available | | **Open** |

### 🎯 **Your App Navigation**
- **Replace ALL positions** with screens that fit your app
- **Start with position 1** for your main/home screen
- **Order logically** based on user flow
- **Use 3-7 tabs maximum** for best UX

## 📦 Categories for Organization

Choose appropriate categories:
- **Navigation** - Core app navigation
- **User** - User account, profile, auth
- **Content** - Main app content areas
- **Commerce** - Shopping, payments, orders
- **Communication** - Chat, messaging, social
- **Productivity** - Tasks, notes, planning
- **Entertainment** - Media, games, fun
- **Utility** - Tools, settings, help
- **Custom** - App-specific categories

## 🎨 Content Guidelines

### Create Meaningful Content
- **Don't use placeholder text** - Write realistic content
- **Add Interactive Elements** - Buttons, forms, lists
- **Include State Management** - Use useState/useContext where needed
- **Style Appropriately** - Make it look professional
- **Add Navigation Logic** - Link related screens

### Common Patterns to Include
```typescript
// Lists with TouchableOpacity items
// Form inputs with validation
// Modal/alert functionality  
// Loading states
// Error handling
// Empty states
// Search functionality
// Filter/sort options
```

## 📁 Import Registration

**IMPORTANT**: You should **completely replace** `branded44/packages/mobile/src/config/importScreens.ts` with only the screens needed for your specific app:

```typescript
/**
 * Screen Imports
 * 
 * Import all screens to trigger their registerScreen() calls.
 * Only include screens that are relevant to this specific app.
 */

console.log('📱 Importing app screens...');

// Your App Screens (replace everything with these)
import '../screens/[YourScreen1]';
import '../screens/[YourScreen2]';
import '../screens/[YourScreen3]';
// ... add only the screens your app needs

console.log('✅ App screens imported!');
```

### ✅ **Full Screen Control**
- **Remove ALL existing screens** that don't fit your app concept
- **Only keep screens** that make sense for your specific app
- **Existing screens are REFERENCE ONLY** - not requirements
- **You have complete control** over the final screen list

## 🚀 Expected Outcome

You should create a **complete, functional app** with:

✅ **Multiple related screens** based on the app concept  
✅ **Logical navigation flow** with proper tab organization  
✅ **Realistic content** (not placeholder text)  
✅ **Consistent styling** using the theme system  
✅ **Interactive elements** (buttons, forms, navigation)  
✅ **Proper TypeScript types** throughout  
✅ **Self-registering screens** that appear automatically  

---

## 🗑️ Existing Screens Are Reference Only

**IMPORTANT**: All existing screens are just **reference examples** - you can and should remove any that don't fit your app:

### 🔍 **Current Reference Screens** (Remove Any/All):
- `HomeScreen` - Basic welcome screen example
- `SettingsScreen` - Configuration screen pattern  
- `ProfileScreen` - User profile example
- `MessagesScreen` - Communication screen pattern
- `NotificationsScreen` - Alert system example
- `ContactsScreen` - Contact management pattern
- `TemplateIndexScreen` - Development tool (usually remove)

### 📝 **How to Remove Screens**:

#### Option 1: Complete Replacement (Recommended)
Replace the entire `importScreens.ts` with only your app's screens:
```typescript
// Only import screens your app actually needs
import '../screens/YourScreen1';
import '../screens/YourScreen2';
// etc...
```

**ALSO** remove TemplateIndexScreen from `App.tsx`:
```typescript
// Remove or comment out this line in App.tsx:
// import './config/registerTemplateScreen';
```

#### Option 2: Selective Removal
1. **Remove Import**: Delete line from `importScreens.ts`
2. **Delete Files**: Remove screen files you don't need
3. **Automatic Cleanup**: Registry handles the rest

### ✅ **Complete Freedom**
- **Remove ALL existing screens** if they don't fit your app
- **Keep only what makes sense** for your specific use case
- **Start fresh** with a clean screen slate
- **Use existing screens as patterns/inspiration only**

---

## 🎯 Two-Step Process

### Step 1: Ask for App Description
Ask the user for a simple description of their app idea - what it is and what it does.

### Step 2: Analyze & Generate Complete App
Based on their description, automatically deduce all requirements and create:
- ✅ **Multiple related screens** based on their concept
- ✅ **Complete importScreens.ts replacement** with only relevant screens  
- ✅ **Logical navigation structure** with proper tab organization
- ✅ **Realistic, interactive content** (forms, buttons, lists, etc.)
- ✅ **Professional styling** using the theme system
- ✅ **TypeScript throughout** with proper types

**Start by asking for their simple app description, analyze it, then build their complete React Native app!** 