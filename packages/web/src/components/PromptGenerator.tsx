import React, {useState} from 'react';

interface PromptGeneratorProps {}

const PromptGenerator: React.FC<PromptGeneratorProps> = () => {
  const [promptType, setPromptType] = useState<'single' | 'full-app'>('full-app');
  const [appDescription, setAppDescription] = useState('');
  const [screenName, setScreenName] = useState('');
  const [screenPurpose, setScreenPurpose] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const singleScreenPrompt = `# Claude Code Prompt: Add New Screen to React Native App

I want you to add a new screen to my React Native application. This app uses a unified registry system for automatic screen registration and navigation.

## 📋 Requirements

### 1. Create the Screen File
- **Location**: \`branded44/packages/mobile/src/screens/[ScreenName].tsx\` (or in a subfolder if complex)
- **Pattern**: Follow the existing pattern from \`HomeScreen.tsx\`
- **Required Imports**:
  \`\`\`typescript
  import React from 'react';
  import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
  import {useTheme} from '../../context'; // or '../context' if in subfolder
  import {registerScreen} from '../../config/registry'; // or '../config/registry' if in subfolder
  \`\`\`

### 2. Screen Component Structure
- Export as default
- Use \`useTheme()\` hook for consistent styling
- Follow responsive design patterns
- Include proper TypeScript types
- Use \`SafeAreaView\` for proper layout

### 3. Self-Registration (CRITICAL)
Add \`registerScreen()\` call at the bottom of the file:

\`\`\`typescript
registerScreen(YourScreenComponent, {
  name: 'Display Name',        // Required - shown in UI
  icon: '🎯',                 // Emoji icon for navigation
  category: 'Category',        // Grouping (e.g., 'Navigation', 'User', 'Communication')
  hasTab: true,               // true = appears in bottom navigation
  tabPosition: 8,             // Position in navigation (use 8+ for new screens)
  description: 'Screen purpose...', // Help text
  tags: ['tag1', 'tag2']      // Search/filtering tags
});
\`\`\`

### 4. Add Import Registration
- **File**: \`branded44/packages/mobile/src/config/importScreens.ts\`
- **Action**: Add import line: \`import '../screens/YourNewScreen';\` (adjust path as needed)
- **Location**: Place in the appropriate section with other screen imports

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

## 🎨 Style Guidelines

### Theme Colors
- \`theme.colors.background\` - Main background
- \`theme.colors.text\` - Primary text
- \`theme.colors.textSecondary\` - Secondary text

### Spacing & Typography
- **Container padding**: 20px
- **Element padding**: 16px
- **Title font size**: 24px
- **Body font size**: 16px
- **Layout**: Use flexbox
- **Accessibility**: Follow best practices

## 📝 Example Template

\`\`\`typescript
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
\`\`\`

## 🚀 What Happens Automatically

✅ **Screen appears in mobile bottom navigation** (if \`hasTab: true\`)  
✅ **Screen appears in web preview automatically**  
✅ **Navigation routing is handled automatically**  
✅ **No manual configuration needed anywhere else**  

## 📋 Screen to Create

**Screen Name**: ${screenName || '_[Specify screen name]_'}
**Purpose**: ${screenPurpose || '_[Describe what this screen does]_'}

**Create the screen file with the above specifications and add the import to importScreens.ts.**`;

  const fullAppPrompt = `# Claude Code Prompt: Generate Multiple App Screens from Description

I want you to create all the necessary screens for a complete React Native application. This app uses a unified registry system for automatic screen registration and navigation.

## 🎯 Start Here: Ask for App Description

**FIRST, ask the user for a simple app description:**

\`\`\`
Hi! I'll help you create a complete React Native app with multiple screens. 

Please describe the app you want me to build - just tell me what it is and what it does:

📱 **App Description**: ${appDescription || '_[Tell me about your app idea - what is it and what it does?]_'}
\`\`\`

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
\`\`\`
branded44/packages/mobile/src/screens/
├── [ScreenName]/
│   ├── [ScreenName].tsx          # Main screen component
│   └── index.ts                  # Export file (optional)
└── [SimpleScreen].tsx            # For simple screens
\`\`\`

#### 2. Required Template Per Screen
\`\`\`typescript
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
\`\`\`

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
\`\`\`typescript
// Lists with TouchableOpacity items
// Form inputs with validation
// Modal/alert functionality  
// Loading states
// Error handling
// Empty states
// Search functionality
// Filter/sort options
\`\`\`

## 📁 Import Registration

**IMPORTANT**: You should **completely replace** \`branded44/packages/mobile/src/config/importScreens.ts\` with only the screens needed for your specific app:

\`\`\`typescript
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
\`\`\`

### ✅ **Full Screen Control**
- **Remove ALL existing screens** that don't fit your app concept
- **Only keep screens** that make sense for your specific app
- **Existing screens are REFERENCE ONLY** - not requirements
- **You have complete control** over the final screen list

## 🚀 Expected Outcome

You should create a **complete, functional app** with:

✅ **Multiple related screens** based on their concept
✅ **Complete importScreens.ts replacement** with only relevant screens  
✅ **Logical navigation structure** with proper tab organization
✅ **Realistic, interactive content** (forms, buttons, lists, etc.)
✅ **Professional styling** using the theme system
✅ **TypeScript throughout** with proper types

## 🗑️ Existing Screens Are Reference Only

**IMPORTANT**: All existing screens are just **reference examples** - you can and should remove any that don't fit your app:

### 🔍 **Current Reference Screens** (Remove Any/All):
- \`HomeScreen\` - Basic welcome screen example
- \`SettingsScreen\` - Configuration screen pattern  
- \`ProfileScreen\` - User profile example
- \`MessagesScreen\` - Communication screen pattern
- \`NotificationsScreen\` - Alert system example
- \`ContactsScreen\` - Contact management pattern
- \`TemplateIndexScreen\` - Development tool (usually remove)

### 📝 **How to Remove Screens**:

#### Option 1: Complete Replacement (Recommended)
Replace the entire \`importScreens.ts\` with only your app's screens:
\`\`\`typescript
// Only import screens your app actually needs
import '../screens/YourScreen1';
import '../screens/YourScreen2';
// etc...
\`\`\`

#### Option 2: Selective Removal
1. **Remove Import**: Delete line from \`importScreens.ts\`
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

**Start by asking for their simple app description, analyze it, then build their complete React Native app!**`;

  const generatePrompt = () => {
    if (promptType === 'single') {
      if (!screenName.trim()) {
        alert('Please provide a screen name');
        return;
      }
      setGeneratedPrompt(singleScreenPrompt);
    } else {
      if (!appDescription.trim()) {
        alert('Please provide an app description');
        return;
      }
      setGeneratedPrompt(fullAppPrompt);
    }
  };

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedPrompt);
      alert('Prompt copied to clipboard!');
    } else {
      alert('Please copy the prompt text manually');
    }
  };

  const clearForm = () => {
    setAppDescription('');
    setScreenName('');
    setScreenPurpose('');
    setGeneratedPrompt('');
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      height: 'fit-content'
    }}>
      <style>{`
        .prompt-container {
          max-height: 400px;
          overflow-y: auto;
          background-color: #f8f8f8;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
        }
        .prompt-text {
          font-family: monospace;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          white-space: pre-wrap;
          margin: 0;
        }
        .btn {
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          padding: 12px 16px;
        }
        .btn-primary {
          background-color: #007AFF;
          color: white;
          flex: 1;
        }
        .btn-secondary {
          background-color: #f0f0f0;
          color: #666;
        }
        .btn-success {
          background-color: #28a745;
          color: white;
          font-size: 14px;
          padding: 6px 12px;
        }
        .btn.active {
          background-color: #007AFF;
          color: white;
        }
        .form-input {
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          background-color: #f8f8f8;
          margin-bottom: 16px;
          font-family: inherit;
        }
        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }
      `}</style>

      <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '8px', textAlign: 'center'}}>
        Claude Code Prompt Generator
      </h1>
      <p style={{fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '24px', lineHeight: '1.4'}}>
        Generate prompts to send to Claude Code for creating React Native screens
      </p>

      {/* Prompt Type Selection */}
      <div style={{marginBottom: '24px'}}>
        <h3 style={{fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px'}}>
          What do you want to create?
        </h3>
        <div style={{display: 'flex', gap: '12px'}}>
          <button
            className={`btn ${promptType === 'single' ? 'active' : ''}`}
            style={{flex: 1, backgroundColor: promptType === 'single' ? '#007AFF' : '#f0f0f0', color: promptType === 'single' ? 'white' : '#333'}}
            onClick={() => setPromptType('single')}>
            📱 Single Screen
          </button>
          <button
            className={`btn ${promptType === 'full-app' ? 'active' : ''}`}
            style={{flex: 1, backgroundColor: promptType === 'full-app' ? '#007AFF' : '#f0f0f0', color: promptType === 'full-app' ? 'white' : '#333'}}
            onClick={() => setPromptType('full-app')}>
            🚀 Complete App
          </button>
        </div>
      </div>

      {/* Input Forms */}
      <div style={{marginBottom: '24px'}}>
        {promptType === 'single' ? (
          <>
            <h3 style={{fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px'}}>Screen Details</h3>
            <label style={{fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px', display: 'block'}}>
              Screen Name *
            </label>
            <input
              className="form-input"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              placeholder="e.g., Dashboard, Profile, Settings"
            />
            <label style={{fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px', display: 'block'}}>
              Screen Purpose
            </label>
            <textarea
              className="form-input form-textarea"
              value={screenPurpose}
              onChange={(e) => setScreenPurpose(e.target.value)}
              placeholder="Brief description of what this screen does"
              rows={3}
            />
          </>
        ) : (
          <>
            <h3 style={{fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px'}}>App Description</h3>
            <label style={{fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px', display: 'block'}}>
              Describe your app idea *
            </label>
            <textarea
              className="form-input form-textarea"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="e.g., A fitness tracking app for runners, A recipe sharing social platform, A personal expense tracker..."
              rows={4}
            />
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
        <button className="btn btn-primary" onClick={generatePrompt}>
          {promptType === 'single' ? '📱 Generate Screen Prompt' : '🚀 Generate App Prompt'}
        </button>
        <button className="btn btn-secondary" onClick={clearForm}>
          Clear
        </button>
      </div>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <div style={{marginBottom: '24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', color: '#333', margin: 0}}>Generated Prompt</h3>
            <button className="btn btn-success" onClick={copyToClipboard}>
              📋 Copy
            </button>
          </div>
          <div className="prompt-container">
            <pre className="prompt-text">{generatedPrompt}</pre>
          </div>
          <p style={{fontSize: '12px', color: '#007AFF', fontStyle: 'italic', marginTop: '8px', textAlign: 'center'}}>
            💡 Copy this prompt and send it to Claude Code to generate your React Native screens!
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptGenerator; 