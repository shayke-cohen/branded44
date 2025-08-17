# Session-to-Mobile Bundle Demo

This demonstrates how to create React Native bundles from visual editor sessions and send them to the mobile app for hot reloading.

## Architecture Overview

```
Visual Editor Session → Metro Bundle Builder → Mobile App
       ↓                        ↓                   ↓
  Session Workspace    →  React Native Bundle  →  Hot Reload
```

## Components

### 1. Server-Side Bundle Builder

- **`SessionMobileBundleBuilder`**: Creates React Native bundles from session workspaces using Metro
- **`SessionMobileBundleAPI`**: Provides HTTP endpoints and WebSocket events for bundle management
- **Metro Configuration**: Session-specific Metro config for proper React Native bundling

### 2. Mobile App Integration

- **`SessionBundleLoader`**: Service that connects to the server and manages bundle loading
- **`SessionBundleSection`**: Settings UI component for session selection and bundle management

## Demo Instructions

### Step 1: Start the Development Environment

```bash
# Terminal 1: Start the server
cd packages/server
yarn start

# Terminal 2: Start the mobile app
cd packages/mobile
yarn start

# Terminal 3: Run mobile app
yarn ios  # or yarn android

# Terminal 4: Start visual editor
cd packages/visual-editor
yarn start
```

### Step 2: Create a Visual Editor Session

1. Open the Visual Editor at `http://localhost:3002`
2. Click "Create New Session" or use existing session
3. Make some changes to the mobile app code in the session workspace
4. Note the Session ID (shown in the session selector)

### Step 3: Connect Mobile App to Session

1. Open the mobile app
2. Go to Settings screen
3. In the "Visual Editor Session" section:
   - Toggle "Enable Session Bundles" to ON
   - Click "Browse Available Sessions" or "Enter Session ID Manually"
   - Select your session from the list
4. The app will connect and start listening for bundle updates

### Step 4: Build and Deploy Bundle

**Option A: Automatic (Visual Editor)**
- Make changes in the visual editor
- Bundle builds automatically when session changes

**Option B: Manual API Call**
```bash
# Build bundle for specific session
curl -X POST http://localhost:3001/api/editor/session/SESSION_ID/build-mobile \
  -H "Content-Type: application/json" \
  -d '{"platform": "android", "dev": true}'

# Check bundle status
curl http://localhost:3001/api/editor/session/SESSION_ID/mobile-bundle/android/info
```

### Step 5: Load Bundle in Mobile App

1. When a bundle is ready, you'll see a notification in the mobile app
2. The bundle loads automatically if "Auto Reload" is enabled
3. Or manually click "Reload Current Bundle" in settings

## API Endpoints

### Bundle Management

```
POST /api/editor/session/:sessionId/build-mobile
- Build mobile bundle for session
- Body: { platform: 'android'|'ios', dev: boolean, minify: boolean }

GET /api/editor/session/:sessionId/mobile-bundle/:platform
- Download compiled bundle file

GET /api/editor/session/:sessionId/mobile-bundle/:platform/info
- Get bundle information and status

POST /api/editor/session/:sessionId/build-mobile-all
- Build bundles for multiple platforms
- Body: { platforms: ['android', 'ios'], dev: boolean }

DELETE /api/editor/session/:sessionId/mobile-build
- Clean up mobile build artifacts
```

### Session Management

```
GET /api/sessions
- List all active sessions

GET /api/sessions/:sessionId
- Get specific session info

DELETE /api/sessions/:sessionId
- Clean up specific session
```

## WebSocket Events

### Client → Server

```javascript
// Request bundle for session
socket.emit('request-mobile-bundle', {
  sessionId: 'session-123',
  platform: 'android'
});
```

### Server → Client

```javascript
// Bundle building started
socket.on('mobile-bundle-building', (data) => {
  console.log('Building bundle for', data.sessionId);
});

// Bundle ready for download
socket.on('mobile-bundle-ready', (data) => {
  console.log('Bundle ready:', data.bundleUrl);
});

// Bundle available (already built)
socket.on('mobile-bundle-available', (data) => {
  console.log('Bundle available:', data.bundleUrl);
});

// Bundle build error
socket.on('mobile-bundle-error', (data) => {
  console.error('Bundle error:', data.error);
});
```

## Configuration

### Server Configuration

```javascript
// packages/server/src/sessions/metro.session.config.js
function createSessionMetroConfig(workspacePath, options = {}) {
  // Metro configuration for session workspace bundling
  // Includes proper React Native aliases and polyfills
}
```

### Mobile App Configuration

```typescript
// packages/mobile/src/services/SessionBundleLoader.ts
const sessionBundleLoader = new SessionBundleLoader({
  serverUrl: 'http://localhost:3001',
  enableAutoReload: true,
  platform: Platform.OS
});
```

## File Structure

```
packages/
├── server/src/sessions/
│   ├── SessionMobileBundleBuilder.js    # Metro bundle builder
│   ├── SessionMobileBundleAPI.js        # HTTP/WebSocket API
│   └── metro.session.config.js         # Metro configuration
├── mobile/src/
│   ├── services/SessionBundleLoader.ts  # Bundle loading service
│   ├── components/SessionBundleSection.tsx # Settings UI
│   └── screens/SettingsScreen/          # Updated settings
└── visual-editor/                       # Visual editor integration
```

## Troubleshooting

### Common Issues

1. **Bundle Build Fails**
   - Check Metro configuration paths
   - Ensure session workspace has valid React Native code
   - Check server logs for detailed error messages

2. **Mobile App Can't Connect**
   - Verify server URL in mobile app settings
   - Check if server is running on correct port (3001)
   - Ensure network connectivity (use device IP for physical devices)

3. **Bundle Not Loading**
   - Check if bundle file exists at the URL
   - Verify bundle format is correct UMD module
   - Check mobile app console for loading errors

### Debug Mode

Enable debug logging in the mobile app:

```typescript
// In your app initialization
if (__DEV__) {
  sessionBundleLoader.on('*', (event, data) => {
    console.log(`📱 SessionBundle: ${event}`, data);
  });
}
```

## Production Considerations

⚠️ **This is a development feature only!**

For production apps, consider:

1. **Security**: Session bundles should only be enabled in development
2. **Code Signing**: Production bundles need proper signing
3. **Distribution**: Use proper app stores or MDM solutions
4. **Permissions**: Implement proper authentication for session access

## Next Steps

1. **Enhanced UI**: Add progress indicators and better error handling
2. **Bundle Caching**: Implement local bundle storage and versioning
3. **Multi-Platform**: Support iOS and Android specific bundles
4. **Integration**: Connect with visual editor rebuild triggers
5. **Analytics**: Track bundle usage and performance metrics

## Example Session Workflow

```bash
# 1. Create and modify session in visual editor
echo "Created session: session-1641234567-abc123"

# 2. Build mobile bundle
curl -X POST http://localhost:3001/api/editor/session/session-1641234567-abc123/build-mobile

# 3. Mobile app receives WebSocket notification
# 4. Bundle downloads and loads automatically
# 5. App hot reloads with new code from session

echo "✅ Session-to-Mobile bundle flow complete!"
```

This creates a powerful development workflow where code changes in the visual editor can be instantly deployed to mobile devices for testing and validation.
