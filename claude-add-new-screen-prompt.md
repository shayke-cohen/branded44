# Claude Code Prompt: Add New Screen to React Native App

I want you to add a new screen to my React Native application. This app uses a unified registry system for automatic screen registration and navigation.

## 📋 Requirements

### 1. Create the Screen File
- **Location**: `branded44/packages/mobile/src/screens/[ScreenName].tsx` (or in a subfolder if complex)
- **Pattern**: Follow the existing pattern from `HomeScreen.tsx`
- **Required Imports**:
  ```typescript
  import React from 'react';
  import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
  import {useTheme} from '../../context'; // or '../context' if in subfolder
  import {registerScreen} from '../../config/registry'; // or '../config/registry' if in subfolder
  ```

### 2. Screen Component Structure
- Export as default
- Use `useTheme()` hook for consistent styling
- Follow responsive design patterns
- Include proper TypeScript types
- Use `SafeAreaView` for proper layout

### 3. Self-Registration (CRITICAL)
Add `registerScreen()` call at the bottom of the file:

```typescript
registerScreen(YourScreenComponent, {
  name: 'Display Name',        // Required - shown in UI
  icon: '🎯',                 // Emoji icon for navigation
  category: 'Category',        // Grouping (e.g., 'Navigation', 'User', 'Communication')
  hasTab: true,               // true = appears in bottom navigation
  tabPosition: 7,             // Position in navigation (1-N, choose available slot)
  description: 'Screen purpose...', // Help text
  tags: ['tag1', 'tag2']      // Search/filtering tags
});
```

### 4. Add Import Registration
- **File**: `branded44/packages/mobile/src/config/importScreens.ts`
- **Action**: Add import line: `import '../screens/YourNewScreen';` (adjust path as needed)
- **Location**: Place in the appropriate section with other screen imports

## 🗂️ Tab Positions (Avoid Conflicts)

| Position | Screen | Icon |
|----------|--------|------|
| 1 | Home | 🏠 |
| 2 | Messages | 💬 |
| 3 | Notifications | 🔔 |
| 4 | Profile | 👤 |
| 5 | Settings | ⚙️ |
| 6 | Contacts | 👥 |
| 7 | Templates | 📋 |
| **8+** | **Available for new screens** | |

## 🎨 Style Guidelines

### Theme Colors
- `theme.colors.background` - Main background
- `theme.colors.text` - Primary text
- `theme.colors.textSecondary` - Secondary text

### Spacing & Typography
- **Container padding**: 20px
- **Element padding**: 16px
- **Title font size**: 24px
- **Body font size**: 16px
- **Layout**: Use flexbox
- **Accessibility**: Follow best practices

## 📝 Example Template

```typescript
import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {useTheme} from '../../context';
import {registerScreen} from '../../config/registry';

const ExampleScreen = () => {
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
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    // Add more styles as needed...
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Screen Title</Text>
      <Text style={styles.subtitle}>Your screen content goes here</Text>
      {/* Add your screen content */}
    </SafeAreaView>
  );
};

// Self-register this screen
registerScreen(ExampleScreen, {
  name: 'Example',
  icon: '🎯',
  category: 'Demo',
  hasTab: true,
  tabPosition: 8, // Choose next available position
  description: 'Example screen description',
  tags: ['example', 'demo']
});

export default ExampleScreen;
```

## 🚀 What Happens Automatically

✅ **Screen appears in mobile bottom navigation** (if `hasTab: true`)  
✅ **Screen appears in web preview automatically**  
✅ **Navigation routing is handled automatically**  
✅ **No manual configuration needed anywhere else**  

## 📋 Screen Specification

**Please specify the following for your new screen:**

- **Screen Name**: _[What should it be called?]_
- **Purpose**: _[What does this screen do?]_
- **Content Requirements**: _[What should be displayed?]_
- **Navigation Tab**: _[Should it have a bottom tab? If yes, what icon?]_
- **Category**: _[Navigation, User, Communication, etc.]_
- **Special Features**: _[Any specific functionality needed?]_

## 🔄 Two-Step Process

1. **Create Screen File** with `registerScreen()` call
2. **Add Import** to `config/importScreens.ts`

That's it! The unified registry system handles everything else automatically. 