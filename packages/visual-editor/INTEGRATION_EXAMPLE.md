# Integration Example: New Session-Based Architecture

## ✅ **IMPLEMENTATION COMPLETED!**

The session-based architecture has been successfully integrated into the visual editor!

## 🔄 What Was Changed

### ✅ Updated Imports (App.tsx):
```tsx
// OLD
import DynamicPhoneFrame from './components/PhoneFrame/DynamicPhoneFrame';

// NEW - IMPLEMENTED ✅
import SessionBasedPhoneFrame from './components/PhoneFrame/SessionBasedPhoneFrame';
import { MobileAppSession } from './services/MobileAppSessionLoader';
```

### ✅ Updated Component Usage (App.tsx):
```tsx
// OLD
<DynamicPhoneFrame src2Status={state.src2Status} />

// NEW - IMPLEMENTED ✅
<SessionBasedPhoneFrame 
  onSessionLoaded={(session: MobileAppSession) => {
    console.log('✅ [App] Mobile app session loaded successfully!');
    console.log(`📊 [App] Session contains ${session.screens.size} screens`);
    console.log(`🎯 [App] Session version: ${session.version}`);
  }}
  onError={(error: string) => {
    console.error('❌ [App] Session loading error:', error);
    // TODO: Show user-friendly error notification
  }}
/>
```

### ✅ Updated Header Text:
```tsx
// OLD
🎭 Dynamic Screen Loading

// NEW - IMPLEMENTED ✅  
📱 Mobile App Session
```

## 🎯 Complete Integration Steps

### 1. Update App.tsx Import
```tsx
// Remove old import
// import DynamicPhoneFrame from './components/PhoneFrame/DynamicPhoneFrame';

// Add new import
import SessionBasedPhoneFrame from './components/PhoneFrame/SessionBasedPhoneFrame';
```

### 2. Update JSX in AppContent Component
```tsx
const AppContent: React.FC = () => {
  // ... existing state and logic ...

  return (
    <AppContainer>
      <EditorContent>
        <ComponentPalette />
        <CenterPanel>
          <ViewToggle>
            <ToggleButton 
              $active={state.primaryView === 'session'} 
              onClick={() => handleViewChange('session')}
            >
              📱 Mobile App Session
            </ToggleButton>
          </ViewToggle>

          {/* NEW: Session-Based Mobile App Loading */}
          <SessionBasedPhoneFrame 
            onSessionLoaded={(session) => {
              console.log('✅ Mobile app session loaded:', session);
              // Optional: Update app state to reflect loaded session
            }}
            onError={(error) => {
              console.error('❌ Session loading error:', error);
              // Optional: Show error in UI
            }}
          />
        </CenterPanel>
        <PropertyPanel />
      </EditorContent>
      <StatusBar />
    </AppContainer>
  );
};
```

### 3. Optional: Update State Management
```tsx
// Add session-related state if needed
const [sessionState, setSessionState] = useState<{
  isLoaded: boolean;
  screenCount: number;
  hotReloadCount: number;
}>({
  isLoaded: false,
  screenCount: 0,
  hotReloadCount: 0,
});

// Update handlers
const handleSessionLoaded = (session: MobileAppSession) => {
  setSessionState({
    isLoaded: true,
    screenCount: session.screens.size,
    hotReloadCount: 0
  });
};
```

## 📋 Testing the New Architecture

### 1. Start the Visual Editor
```bash
cd packages/visual-editor
npm start
```

### 2. Expected Console Output
```
🚀 [SessionBasedPhoneFrame] Initializing session loader for: session-xxx
📱 [SessionBasedPhoneFrame] Loading mobile app session...
📱 [MobileAppSessionLoader] Loading full mobile app session...
🔌 [SessionBasedPhoneFrame] Setting up WebSocket connection...
✅ [SessionBasedPhoneFrame] Session-based mobile app loaded successfully!
```

### 3. Expected UI Features
- ✅ **Session Controls**: Reload session, WebSocket status
- ✅ **Status Info**: Session ID, screen count, version info  
- ✅ **Mobile App**: Full mobile app rendered in phone frame
- ✅ **Real-Time Updates**: Hot-reload counter, connection status

## 🔧 Server Integration Required

The new architecture requires server-side support. The server needs to provide:

### New API Endpoints:
```
GET /api/editor/session/{sessionId}/app-bundle     // Full mobile app bundle
GET /api/editor/session/{sessionId}/navigation     // Navigation configuration
GET /api/editor/session/{sessionId}/screens        // All available screens
WS  /session/{sessionId}/ws                        // WebSocket connection
```

### Example Server Implementation (Express.js):
```javascript
// App bundle endpoint
app.get('/api/editor/session/:sessionId/app-bundle', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    // Build mobile app bundle for session
    const bundle = await buildMobileAppBundle(sessionId);
    res.setHeader('Content-Type', 'application/javascript');
    res.send(bundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Navigation config endpoint
app.get('/api/editor/session/:sessionId/navigation', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const navigationConfig = await getNavigationConfig(sessionId);
    res.json(navigationConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket endpoint
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws, sessionId) => {
  console.log(`WebSocket connected for session: ${sessionId}`);
  
  // Watch for file changes and send updates
  fileWatcher.on('change', (filePath) => {
    const screenId = getScreenIdFromPath(filePath);
    ws.send(JSON.stringify({
      type: 'screen_update',
      payload: { screenId, changeType: 'modified' },
      sessionId,
      timestamp: Date.now()
    }));
  });
});
```

## 🎉 Benefits You'll Experience

### **Immediate Benefits:**
- ✅ **Full Mobile App**: Complete mobile app loaded (not fragmented screens)
- ✅ **Real Context**: Actual providers and context (not mocked)
- ✅ **Better UI**: Professional controls and status monitoring
- ✅ **Error Handling**: Comprehensive error boundaries and messaging

### **With Server Integration:**
- 🚀 **Hot-Reload**: Individual screens update instantly
- ➕ **Screen Injection**: New screens appear in running app
- 🧭 **Navigation Updates**: App.tsx changes reflected live
- 🔄 **Real-Time Sync**: File changes trigger immediate updates

This new architecture provides the true development environment you requested! 🎯
