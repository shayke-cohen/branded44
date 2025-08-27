# Session-Based Mobile App Architecture

## 🎯 Overview

This document describes the **NEW session-based mobile app architecture** that replaces the fragmented DynamicScreenLoader approach with a comprehensive solution that follows your desired flow:

1. **Load mobile app session** (full app) into phone frame
2. **Enable loading updated screens** from server (hot-reload)
3. **Enable loading new screens** from server (dynamic injection) 
4. **Enable navigation changes** from server (App.tsx updates)

## 🏗️ Architecture Components

### 1. **MobileAppSessionLoader** 
`packages/visual-editor/src/services/MobileAppSessionLoader.ts`

**Purpose**: Core service that manages the mobile app session lifecycle

**Key Features**:
- ✅ **Full Mobile App Loading**: Loads complete mobile app with providers (like `packages/web`)
- ✅ **Screen Hot-Reload**: Replace individual screens without app reload
- ✅ **Dynamic Screen Injection**: Add new screens to running app
- ✅ **Live Navigation Updates**: Modify App.tsx navigation structure
- ✅ **Event-Driven Architecture**: Listeners for real-time updates

**Key Methods**:
```typescript
// Phase 1: Load full mobile app session
async loadMobileAppSession(): Promise<MobileAppSession>

// Phase 2: Hot-reload individual screens
async hotReloadScreen(screenId: string): Promise<void>

// Phase 3: Inject new screens dynamically
async injectNewScreen(screenDefinition: ScreenDefinition): Promise<void>

// Phase 4: Update navigation/routing
async updateNavigation(navigationConfig: Partial<NavigationConfig>): Promise<void>
```

### 2. **SessionWebSocketManager**
`packages/visual-editor/src/services/SessionWebSocketManager.ts`

**Purpose**: Real-time communication between visual editor and server

**Key Features**:
- ✅ **WebSocket Communication**: Real-time bidirectional communication
- ✅ **Auto-Reconnection**: Robust connection handling
- ✅ **Event Routing**: Routes different event types to appropriate handlers
- ✅ **File Change Detection**: Watches for file changes and triggers updates

**Event Types**:
```typescript
- 'screen_update'    // Screen file modified → hot-reload
- 'screen_injection' // New screen created → inject to app
- 'navigation_update' // App.tsx modified → update routing
- 'file_change'      // General file changes → selective updates
```

### 3. **SessionBasedPhoneFrame**
`packages/visual-editor/src/components/PhoneFrame/SessionBasedPhoneFrame.tsx`

**Purpose**: New UI component that displays the session-based mobile app

**Key Features**:
- ✅ **Full App Rendering**: Renders complete mobile app (not individual screens)
- ✅ **Real-Time Controls**: Session reload, WebSocket status, hot-reload counter
- ✅ **Status Monitoring**: Visual feedback for session state and updates
- ✅ **Error Handling**: Comprehensive error boundaries and messaging

## 🔄 Data Flow

### Initial Session Loading
```
Visual Editor → SessionLoader → Server → Bundle + Navigation + Screens → Mobile App
```

### Hot-Reload Flow
```
Server File Change → WebSocket → SessionLoader → Hot-Replace Screen → Live Update
```

### Screen Injection Flow
```
Server New Screen → WebSocket → SessionLoader → Inject Screen + Update Nav → Live Update
```

### Navigation Update Flow
```
Server App.tsx Change → WebSocket → SessionLoader → Update Routing → Live Update
```

## 📊 Comparison: Old vs New Architecture

| Aspect | Old (DynamicScreenLoader) | New (Session-Based) |
|--------|--------------------------|---------------------|
| **Loading** | Individual screens only | Full mobile app + screens |
| **Context** | Mock hooks + evaluation context | Real app providers + context |
| **Updates** | Manual screen reload | Real-time hot-reload |
| **Navigation** | Static | Dynamic updates from server |
| **New Screens** | Not supported | Dynamic injection |
| **Communication** | HTTP requests only | WebSocket + HTTP |
| **Compatibility** | Limited screen support | Full mobile app compatibility |
| **Development UX** | Fragmented | True development environment |

## 🚀 Integration Steps

### Step 1: Update App.tsx
Replace DynamicPhoneFrame with SessionBasedPhoneFrame:

```tsx
// OLD
import DynamicPhoneFrame from './components/PhoneFrame/DynamicPhoneFrame';

// NEW  
import SessionBasedPhoneFrame from './components/PhoneFrame/SessionBasedPhoneFrame';

// In render:
<SessionBasedPhoneFrame 
  onSessionLoaded={(session) => console.log('Session loaded:', session)}
  onError={(error) => console.error('Session error:', error)}
/>
```

### Step 2: Server-Side Implementation
The server needs to provide new endpoints:

```
GET /api/editor/session/{sessionId}/app-bundle     // Full app bundle
GET /api/editor/session/{sessionId}/navigation     // Navigation config  
GET /api/editor/session/{sessionId}/screens        // All available screens
WS  /session/{sessionId}/ws                        // WebSocket connection
```

### Step 3: Bundle Integration
Integrate with existing `BundleExecutor` for JavaScript evaluation:

```typescript
// In MobileAppSessionLoader.ts
private async executeBundleCode(bundleCode: string): Promise<React.ComponentType<any>> {
  // Use existing BundleExecutor logic
  return this.bundleExecutor.executeBundleCode(bundleCode, this.sessionInfo.sessionId);
}
```

### Step 4: WebSocket Server Implementation
Server needs WebSocket endpoint for real-time updates:

```javascript
// Example server-side WebSocket handler
wss.on('connection', (ws, sessionId) => {
  // Watch for file changes
  fileWatcher.on('change', (filePath) => {
    ws.send(JSON.stringify({
      type: 'screen_update',
      payload: { screenId: getScreenIdFromPath(filePath) },
      sessionId,
      timestamp: Date.now()
    }));
  });
});
```

## 🎯 Benefits of New Architecture

### **1. True Development Environment**
- Full mobile app loaded with real providers
- Hot-reload individual screens instantly
- Add new screens without app restart
- Modify navigation structure live

### **2. Better Performance**  
- Single app load vs multiple screen loads
- WebSocket for efficient real-time updates
- Intelligent caching and update strategies

### **3. Enhanced Developer Experience**
- Real-time visual feedback
- Status monitoring and controls
- Comprehensive error handling
- Seamless integration with existing tools

### **4. Scalability**
- Supports any mobile app complexity
- Extensible event system
- Modular architecture
- Future-proof design

## 🔮 Future Enhancements

- **Multi-Session Support**: Handle multiple concurrent sessions
- **Screen Versioning**: Version control for screen updates
- **Rollback Capability**: Undo screen changes instantly
- **Performance Metrics**: Monitor hot-reload performance
- **Team Collaboration**: Multiple users editing same session

## 📋 Next Steps

1. ✅ **Architecture Designed**: Core services and components created
2. 🔄 **Integration Required**: Update App.tsx to use new components
3. ⏳ **Server Implementation**: Add new endpoints and WebSocket support
4. ⏳ **Bundle Integration**: Connect with existing BundleExecutor
5. ⏳ **Testing & Refinement**: Test with real mobile app sessions

This new architecture provides the sophisticated, session-based development environment you envisioned! 🚀
