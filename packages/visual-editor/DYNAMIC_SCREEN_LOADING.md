# Dynamic Screen Loading System

## Overview

We've successfully integrated a comprehensive **Dynamic Screen Loading System** into the visual editor. This new system provides a third rendering mode alongside the existing Bundle and Iframe modes, enabling live loading of individual screen files from the server with intelligent caching and real-time updates.

## 🎯 Key Features Implemented

### ✅ Core Components
- **DynamicScreenLoader Service**: File-based screen loading with caching
- **useDynamicScreen Hook**: React integration for screen loading
- **DynamicPhoneFrame Component**: New UI renderer for dynamic screens
- **Server API Endpoints**: Backend support for screen serving
- **UI Integration**: New "🎭 Dynamic" mode toggle in visual editor

### ✅ Caching System
- **Multi-level caching**: Memory + localStorage
- **Intelligent eviction**: LRU (Least Recently Used)
- **Cache invalidation**: Session-based and manual clearing
- **Performance metrics**: Hit rates and usage statistics

### ✅ Security & Error Handling
- **Secure code evaluation**: Sandboxed execution context
- **Graceful fallbacks**: Error boundaries and placeholder components
- **Session isolation**: Per-session caching and loading

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Visual Editor UI                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ ⚡ Bundle    │  │ 🖼️ Iframe    │  │ 🎭 Dynamic (NEW)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Dynamic Screen Loader                          │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Screen Cache   │  │   File Loading  │  │  Code Execution │ │
│  │                 │  │                 │  │                 │ │
│  │ • Memory Cache  │  │ • Individual    │  │ • React Native │ │
│  │ • LocalStorage  │  │   Screen Files  │  │   Web Context   │ │
│  │ • LRU Eviction  │  │ • Dependencies  │  │ • Secure Eval   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Server API Endpoints                         │
│                                                                 │
│  • GET /session/:id/screen/:screenId                           │
│  • GET /session/:id/screen-file/:screenId/:fileName            │
│  • GET /session/:id/dependency/:depName                        │
│  • GET /session/:id/screens                                    │
│  • PUT /session/:id/screen-file/:screenId/:fileName            │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 How to Use

### 1. Access Dynamic Mode
1. Open the Visual Editor
2. Look for the view toggle controls at the top
3. Click **🎭 Dynamic** to switch to dynamic screen loading mode

### 2. Screen Selection
- Use the dropdown to select from available screens
- Screens are automatically discovered from your `src/screens/` directory
- Supports both directory-based and single-file screens

### 3. Development Controls
- **🚀 Preload**: Preload critical screens for better performance
- **🧹 Clear Cache**: Clear cache for current session
- **🔍 Debug**: Show debug information and cache statistics

## 📁 Supported Screen Structures

### Directory-based Screens
```
src/screens/ProfileScreen/
├── ProfileScreen.tsx       # Main component
├── hooks/
│   ├── useProfile.ts      # Custom hooks
│   └── useUserData.ts
├── utils/
│   ├── validation.ts      # Utility functions
│   └── formatting.ts
└── styles.ts              # Screen-specific styles
```

### Single-file Screens
```
src/screens/
├── HomeScreen.tsx
├── SettingsScreen.tsx
└── LoginScreen.tsx
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/session/:sessionId/screen/:screenId` | Get complete screen definition |
| GET | `/session/:sessionId/screen-file/:screenId/:fileName` | Get individual screen file |
| GET | `/session/:sessionId/dependency/:depName` | Load screen dependency |
| GET | `/session/:sessionId/screens` | List available screens |
| PUT | `/session/:sessionId/screen-file/:screenId/:fileName` | Update screen file |
| GET | `/session/:sessionId/screen/:screenId/metadata` | Get screen metadata only |
| DELETE | `/session/:sessionId/screen-cache` | Clear screen cache |

## 📊 Performance Features

### Caching Strategy
- **Memory Cache**: 50 entries, LRU eviction
- **Storage Cache**: 200 entries, persistent across sessions
- **TTL**: 24 hours default, configurable
- **Garbage Collection**: Automatic cleanup every hour

### Load Optimization
- **Preloading**: Critical screens loaded in background
- **Lazy Loading**: Dependencies loaded on demand
- **Code Splitting**: Separate hooks, utils, and styles
- **Bundle Size**: Optimized individual file loading vs full bundles

## 🐛 Development Tools

### Debug Information
```
Cache: 15 entries, 0.85 hit rate
Screen: ProfileScreen | Session: session_abc123
Status: Loaded
```

### Console Logging
```javascript
🎭 [DynamicScreenLoader] Loading screen: ProfileScreen
📡 [DynamicScreenLoader] Fetching screen from server: ProfileScreen
💾 [DynamicScreenLoader] Using cached screen: ProfileScreen
✅ [DynamicScreenLoader] Screen loaded and cached: ProfileScreen
```

### Error Handling
- **Screen Load Errors**: Fallback to error component with details
- **Render Errors**: Graceful error boundaries
- **Network Errors**: Retry mechanisms and offline support
- **Cache Errors**: Automatic cache recovery

## 🔒 Security Features

### Code Execution Safety
- **Sandboxed Context**: Restricted global access
- **Allowed Modules**: Whitelist of safe imports
- **Blocked Patterns**: Prevention of dangerous code execution
- **Input Validation**: Server-side security checks

### Session Isolation
- **Per-session Caching**: No cross-session data leakage
- **Workspace Boundaries**: File access restricted to session workspace
- **Path Validation**: Prevention of directory traversal attacks

## 📈 Monitoring & Analytics

### Cache Statistics
```javascript
const stats = getCacheStats();
// Returns: { memorySize: 15, hitRate: 0.85, totalUsage: 120 }
```

### Performance Metrics
- Screen load time tracking
- Cache hit/miss ratios
- Bundle size comparisons
- Render performance monitoring

## 🛠️ Example Screen Definition

When you create a screen, the system automatically generates a screen definition like this:

```typescript
{
  id: "ProfileScreen",
  version: "1.0.0",
  platform: "universal",
  dependencies: ["react-navigation", "async-storage"],
  metadata: {
    title: "ProfileScreen",
    description: "User profile management screen",
    author: "Visual Editor",
    tags: ["dynamic", "screen", "profile"],
    minAppVersion: "1.0.0"
  },
  code: {
    component: "import React from 'react'; export default function ProfileScreen() { ... }",
    styles: "export const styles = StyleSheet.create({ ... });",
    hooks: ["export function useProfile() { ... }"],
    utils: ["export function validateProfile() { ... }"]
  },
  configuration: {
    screenId: "ProfileScreen",
    sessionId: "session_abc123",
    loadedAt: "2024-01-15T10:30:00.000Z"
  }
}
```

## 🚀 Next Steps

### Immediate Benefits
1. **Live Updates**: Change screen files and see updates instantly
2. **Faster Development**: No need to rebuild entire bundles
3. **Granular Control**: Load and test individual screens
4. **Better Debugging**: Clear error messages and debug tools

### Future Enhancements
1. **Hot Module Replacement**: Real-time code updates
2. **Visual Screen Builder**: Drag-and-drop interface
3. **A/B Testing**: Multiple screen variants
4. **Performance Analytics**: Detailed metrics dashboard

## 🔍 Testing the System

### Quick Test
1. Switch to Dynamic mode in the visual editor
2. Select "HomeScreen" from the dropdown
3. Watch the console for loading messages
4. Try the preload and cache controls

### Advanced Testing
1. Create a new screen in `src/screens/TestScreen.tsx`
2. Refresh the screen list
3. Select your new screen
4. Modify the screen file and test live updates

## 📝 Troubleshooting

### Common Issues
- **Screen not found**: Check file paths and naming conventions
- **Render errors**: Check component exports and dependencies
- **Cache issues**: Use the clear cache button
- **Session errors**: Verify session is active and valid

### Debug Steps
1. Enable debug mode in the UI
2. Check browser console for detailed logs
3. Verify server endpoints are responding
4. Test with simple screen components first

---

This dynamic screen loading system represents a significant advancement in the visual editor's capabilities, providing developers with unprecedented flexibility and real-time development capabilities.

