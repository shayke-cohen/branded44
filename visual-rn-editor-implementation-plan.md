# Visual React Native Editor Implementation Plan
## React Native CLI Integration (Non-Expo)

Based on analysis of the architecture document and current project structure, this plan outlines the implementation of a visual editor for your React Native CLI-based Branded44 project.

## 📋 Project Analysis Summary

### Current Architecture Strengths
- **Rich Component Ecosystem**: 71+ block components across 13 categories
- **Template System**: Comprehensive screen templates with registry-based loading
- **Web Preview Infrastructure**: Existing MobileApp.tsx renders RN components in web
- **Server API Framework**: Express server with Wix integration and real-time capabilities
- **Metro Workspace Configuration**: Already supports monorepo structure
- **React Native CLI Setup**: Standard RN CLI with Android/iOS native projects

### Key Differences from Expo Setup
- No Expo Updates for OTA deployment
- Standard Metro bundler with React Native CLI
- Native Android/iOS projects for production builds
- Manual deployment pipeline for mobile apps
- Environment variable handling via Metro configuration

## 🏗️ Updated Architecture Integration

### Enhanced Project Structure
```
branded44/
├── packages/
│   ├── mobile/              # ✅ React Native CLI app
│   │   ├── src/            # ✅ Original source (read-only in editor)
│   │   ├── src2/           # 🆕 Editing copy (created by visual editor)
│   │   ├── App.tsx         # 🔄 Smart switching between src/src2
│   │   ├── metro.config.js # 🔄 Enhanced to watch src/src2 conditionally
│   │   ├── android/        # ✅ Native Android project
│   │   └── ios/            # ✅ Native iOS project
│   ├── web/                # ✅ Existing preview infrastructure
│   │   └── src/App.tsx     # 🔄 Link to visual editor
│   ├── server/             # ✅ Existing API framework
│   │   └── src/index.js    # 🔄 Add editor endpoints
│   └── visual-editor/      # 🆕 New visual editor package
│       ├── src/
│       │   ├── components/ # Visual editor UI components
│       │   ├── services/   # Core editor services
│       │   └── utils/      # Helper utilities
│       ├── package.json
│       └── webpack.config.js
└── package.json            # 🔄 Add development scripts
```

## 📝 Implementation Phases

### Phase 1: Foundation & Core Services

#### 1.1 Create Visual Editor Package
**Location**: `packages/visual-editor/`

**Key Components**:
```typescript
// packages/visual-editor/src/App.tsx
- Visual Editor Interface (Port 3002)
- Component Palette (using existing block components)
- Phone Frame Renderer (React Native Web)
- Property Inspector & Style Editor
- File Tree Browser
```

**Dependencies**:
```json
{
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-native-web": "^0.19.0",
  "socket.io-client": "^4.7.0",
  "@monaco-editor/react": "^4.6.0",
  "react-dnd": "^16.0.0",
  "react-dnd-html5-backend": "^16.0.0"
}
```

#### 1.2 Implement Src2Manager Service
**Location**: `packages/visual-editor/src/services/Src2Manager.ts`

```typescript
export class Src2Manager {
  private src2Path = './packages/mobile/src2';
  private srcPath = './packages/mobile/src';

  async initializeEditingEnvironment() {
    // 1. Backup check - ensure src2 doesn't exist
    if (await fs.pathExists(this.src2Path)) {
      throw new Error('src2 already exists. Close other editor instances.');
    }
    
    // 2. Copy src to src2
    await fs.copy(this.srcPath, this.src2Path);
    
    // 3. Set up file watchers
    this.setupFileWatchers();
    
    // 4. Notify Metro to switch to src2
    await this.notifyMetroSwitch();
  }

  async cleanupEditingEnvironment() {
    // 1. Stop file watchers
    this.stopFileWatchers();
    
    // 2. Remove src2 directory
    await fs.remove(this.src2Path);
    
    // 3. Notify Metro to switch back to src
    await this.notifyMetroSwitch(false);
  }
}
```

#### 1.3 Extend Server APIs
**Location**: `packages/server/src/index.js` (extend existing server)

**New Endpoints**:
```javascript
// Editor initialization
app.post('/api/editor/init', async (req, res) => {
  // Initialize src2 environment
  // Start file watchers
  // Setup Socket.IO broadcasting
});

// File operations
app.post('/api/editor/files/write', async (req, res) => {
  // Write to src2 files
  // Trigger HMR updates
  // Broadcast changes via Socket.IO
});

// Component metadata
app.get('/api/editor/components', async (req, res) => {
  // Return available components from registry
  // Include component metadata and props
});

// Mobile deployment (React Native CLI)
app.post('/api/editor/deploy/mobile', async (req, res) => {
  // Generate production bundle
  // Create APK/IPA builds
  // Deploy to app stores or internal distribution
});
```

#### 1.4 Enhance Metro Configuration
**Location**: `packages/mobile/metro.config.js`

```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Check environment variable for src2 usage
const useSrc2 = process.env.RN_USE_SRC2 === 'true';
const sourceDir = useSrc2 ? 'src2' : 'src';

console.log(`📱 Metro: Using source directory: ${sourceDir}`);

const config = {
  watchFolders: [
    path.resolve(__dirname, '../..'),
    path.resolve(__dirname, '~'),
    // Conditionally watch src or src2
    path.resolve(__dirname, sourceDir),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    alias: {
      crypto: 'react-native-get-random-values',
      '~': path.resolve(__dirname, '~'),
      // Dynamic source alias
      '@mobile': path.resolve(__dirname, sourceDir),
    },
    unstable_enablePackageExports: true,
    platforms: ['ios', 'android', 'native', 'web'],
  },
  transformer: {
    unstable_allowRequireContext: true,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### Phase 2: Core Editor Features

#### 2.1 Implement LiveRenderer Service
**Location**: `packages/visual-editor/src/services/LiveRenderer.ts`

```typescript
export class LiveRenderer {
  private container: HTMLElement;
  private currentComponent: React.ComponentType | null = null;

  async updateComponent(filePath: string, newContent: string) {
    // 1. Write to physical src2 file
    await this.writeToSrc2(filePath, newContent);
    
    // 2. Parse and validate component
    const component = await this.parseComponent(newContent);
    
    // 3. Hot reload in visual editor
    this.hotReloadComponent(component);
    
    // 4. Notify other environments via Socket.IO
    this.broadcastUpdate(filePath, newContent);
  }

  private hotReloadComponent(component: React.ComponentType) {
    // Use React Native Web to render component in phone frame
    const PhoneFrame = this.createPhoneFrame();
    ReactDOM.render(
      <PhoneFrame>
        <component />
      </PhoneFrame>,
      this.container
    );
  }
}
```

#### 2.2 Add Component Inspector
**Location**: `packages/visual-editor/src/services/ComponentInspector.ts`

```typescript
export class ComponentInspector {
  private selectedElement: HTMLElement | null = null;
  private componentMetadata: Map<string, ComponentMetadata> = new Map();

  enableInspection() {
    // Add click handlers to phone frame
    this.phoneFrame.addEventListener('click', this.handleElementClick);
    
    // Add hover effects
    this.phoneFrame.addEventListener('mouseover', this.handleElementHover);
  }

  private handleElementClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target as HTMLElement;
    const componentInfo = this.getComponentInfo(element);
    
    if (componentInfo) {
      this.selectComponent(componentInfo);
      this.showPropertyEditor(componentInfo);
    }
  };

  private getComponentInfo(element: HTMLElement): ComponentInfo | null {
    // Extract React component information from DOM element
    // Use React DevTools-like approach to identify components
    return this.extractReactComponentInfo(element);
  }
}
```

#### 2.3 Create Drag-Drop System
**Location**: `packages/visual-editor/src/services/DragDropManager.ts`

```typescript
export class AdvancedDragDrop {
  private componentPalette: ComponentPaletteItem[] = [];
  private dropZones: DropZone[] = [];

  initializePalette() {
    // Load components from existing registry
    const blockComponents = this.loadBlockComponents();
    const templates = this.loadTemplates();
    
    this.componentPalette = [
      ...this.createPaletteItems(blockComponents, 'blocks'),
      ...this.createPaletteItems(templates, 'templates')
    ];
  }

  private loadBlockComponents() {
    // Import from existing component blocks
    return {
      auth: require('@mobile/components/blocks/auth'),
      booking: require('@mobile/components/blocks/booking'),
      ecommerce: require('@mobile/components/blocks/ecommerce'),
      forms: require('@mobile/components/blocks/forms'),
      lists: require('@mobile/components/blocks/lists'),
      // ... all 13 categories
    };
  }

  handleDrop(item: ComponentPaletteItem, dropZone: DropZone) {
    // 1. Generate component code
    const componentCode = this.generateComponentCode(item, dropZone);
    
    // 2. Insert into target file
    const updatedFileContent = this.insertComponent(
      dropZone.filePath,
      componentCode,
      dropZone.insertionPoint
    );
    
    // 3. Update src2 file
    this.liveRenderer.updateComponent(dropZone.filePath, updatedFileContent);
  }
}
```

### Phase 3: Real-time Updates & Integration

#### 3.1 Implement File Watcher System
**Location**: `packages/server/src/services/FileWatcher.js`

```javascript
const chokidar = require('chokidar');
const { Server } = require('socket.io');

class FileWatcher {
  constructor(io) {
    this.io = io;
    this.watchers = new Map();
  }

  startWatching() {
    // Watch src2 directory for changes
    const src2Watcher = chokidar.watch('./packages/mobile/src2/**/*', {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    src2Watcher
      .on('change', (path) => this.handleFileChange(path))
      .on('add', (path) => this.handleFileAdd(path))
      .on('unlink', (path) => this.handleFileDelete(path));

    this.watchers.set('src2', src2Watcher);
  }

  handleFileChange(filePath) {
    console.log(`📁 File changed: ${filePath}`);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Broadcast to all connected clients
    this.io.emit('file-changed', {
      filePath,
      content,
      timestamp: Date.now()
    });

    // Trigger Metro HMR
    this.triggerMetroHMR(filePath);
  }

  triggerMetroHMR(filePath) {
    // Send HMR signal to Metro bundler
    // This will update the mobile app automatically
    fetch('http://localhost:8081/hmr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath })
    });
  }
}
```

#### 3.2 Update Mobile App for src2 Support
**Location**: `packages/mobile/src/App.tsx`

```typescript
// Add environment detection at the top
const isUsingSrc2 = process.env.RN_USE_SRC2 === 'true';
console.log(`📱 [DEBUG] Using src2 mode: ${isUsingSrc2}`);

// The rest of the App.tsx remains the same since Metro handles the aliasing
// through the enhanced metro.config.js configuration

// Optional: Add visual indicator for development mode
const AppContent = () => {
  const navTabs = getNavTabs();
  const [activeTab, setActiveTab] = useState<string>(navTabs[0]?.id || 'home-tab');

  return (
    <View style={styles.container}>
      {/* Development mode indicator */}
      {__DEV__ && isUsingSrc2 && (
        <View style={styles.devIndicator}>
          <Text style={styles.devText}>🎨 Visual Editor Mode</Text>
        </View>
      )}
      
      {renderScreen()}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={(tab: string) => setActiveTab(tab)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  devIndicator: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
    padding: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  devText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
```

#### 3.3 Integrate Web Preview
**Location**: `packages/web/src/components/MobilePreview.tsx` (enhance existing)

```typescript
// Add Socket.IO connection for real-time updates
import { io } from 'socket.io-client';

const MobilePreview: React.FC = () => {
  const [bundleKey, setBundleKey] = useState(Date.now());
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to server for file change notifications
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('file-changed', (data) => {
      console.log('📱 File changed, refreshing preview:', data.filePath);
      // Force re-render by updating bundle key
      setBundleKey(Date.now());
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="mobile-preview">
      {/* Add visual editor integration button */}
      <div className="preview-controls">
        <button onClick={() => window.open('http://localhost:3002', '_blank')}>
          🎨 Open Visual Editor
        </button>
      </div>
      
      {/* Existing preview iframe with dynamic bundle key */}
      <iframe
        key={bundleKey}
        src={`http://localhost:8081/index.bundle?platform=web&dev=true&minify=false&t=${bundleKey}`}
        className="phone-frame"
      />
    </div>
  );
};
```

### Phase 4: Development Workflow & Deployment

#### 4.1 Enhanced Development Scripts
**Location**: `package.json` (root)

```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev:web\" \"npm run dev:editor\" \"npm run dev:mobile:src2\"",
    "dev:server": "cd packages/server && npm run dev",
    "dev:web": "cd packages/web && npm start",
    "dev:editor": "cd packages/visual-editor && npm run dev",
    "dev:mobile": "cd packages/mobile && npm run start",
    "dev:mobile:src2": "cd packages/mobile && RN_USE_SRC2=true npm run start",
    
    "editor:init": "curl -X POST http://localhost:3001/api/editor/init",
    "editor:cleanup": "curl -X POST http://localhost:3001/api/editor/cleanup",
    
    "build:all": "npm run build --workspaces",
    "build:mobile:android": "cd packages/mobile && npm run build:android",
    "build:mobile:ios": "cd packages/mobile && npm run build:ios",
    
    "deploy:mobile:android": "cd packages/mobile && ./android/gradlew assembleRelease",
    "deploy:mobile:ios": "cd packages/mobile && xcodebuild -workspace ios/HelloReactNative.xcworkspace -scheme HelloReactNative -configuration Release"
  }
}
```

#### 4.2 Mobile Deployment Pipeline (React Native CLI)
**Location**: `packages/visual-editor/src/services/MobileDeployment.ts`

```typescript
export class MobileDeployment {
  async deployAndroid() {
    // 1. Copy src2 to src for production build
    await this.prepareProdBuild();
    
    // 2. Build Android APK
    const buildResult = await this.runCommand(
      'cd packages/mobile && ./android/gradlew assembleRelease'
    );
    
    // 3. Sign APK (if configured)
    if (this.hasSigningConfig()) {
      await this.signAPK();
    }
    
    // 4. Deploy to distribution platform
    await this.deployToDistribution('android');
    
    // 5. Cleanup - restore src
    await this.cleanupProdBuild();
  }

  async deployIOS() {
    // 1. Copy src2 to src for production build
    await this.prepareProdBuild();
    
    // 2. Build iOS archive
    const buildResult = await this.runCommand(
      'cd packages/mobile && xcodebuild -workspace ios/HelloReactNative.xcworkspace -scheme HelloReactNative -configuration Release archive'
    );
    
    // 3. Export IPA
    await this.exportIPA();
    
    // 4. Deploy to App Store Connect or TestFlight
    await this.deployToAppStore();
    
    // 5. Cleanup - restore src
    await this.cleanupProdBuild();
  }

  private async prepareProdBuild() {
    // Copy src2 changes to src for production build
    await fs.copy('./packages/mobile/src2', './packages/mobile/src');
  }

  private async cleanupProdBuild() {
    // Restore original src from git
    await this.runCommand('cd packages/mobile && git checkout -- src/');
  }
}
```

## 🔄 Real-time Update Flow (React Native CLI)

```
Developer/AI Edit → src2 File Write → File Watcher → Socket.IO Broadcast
                                                            ↓
                    ┌─────────────────┬─────────────────────┼─────────────────┐
                    ↓                 ↓                     ↓                 ↓
            Visual Editor      Web Preview           Mobile App         Metro Dev
            React Native Web   Metro Bundle          Fast Refresh       Server HMR
            Hot Replacement    Auto-reload           Auto-reload        Broadcasts
            (instant)          (instant)             (instant)          (instant)
```

## 🚀 Development Workflow

### Starting Development Environment
```bash
# Start all services
npm run dev:all

# Or start individually
npm run dev:server    # Server on :3001
npm run dev:web       # Web preview on :3000  
npm run dev:editor    # Visual editor on :3002
npm run dev:mobile:src2  # Mobile with src2 support
```

### Using Visual Editor
1. **Initialize Editor**: `npm run editor:init`
2. **Access Interfaces**:
   - Visual Editor: `http://localhost:3002`
   - Web Preview: `http://localhost:3000`
   - Mobile App: Connect device/emulator to Metro on :8081
3. **Edit Components**:
   - Drag components from palette
   - Click to select and edit properties
   - See instant updates across all environments
4. **Deploy Changes**: Use mobile deployment commands

### Production Deployment
```bash
# Build for production
npm run build:all

# Deploy mobile apps
npm run deploy:mobile:android
npm run deploy:mobile:ios

# Deploy web/server (existing process)
```

## 🎯 Key Advantages of React Native CLI Integration

1. **Native Performance**: Full access to native iOS/Android capabilities
2. **Custom Native Modules**: Can add platform-specific functionality
3. **Flexible Deployment**: Control over build process and distribution
4. **Production Ready**: Standard React Native CLI setup for enterprise apps
5. **Existing Infrastructure**: Leverages current Metro, Gradle, and Xcode configurations

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Create `packages/visual-editor` package
- [ ] Implement `Src2Manager` service
- [ ] Extend server with editor APIs
- [ ] Enhance `metro.config.js` for src2 support
- [ ] Update mobile `App.tsx` for environment detection

### Phase 2: Core Features  
- [ ] Implement `LiveRenderer` service
- [ ] Add `ComponentInspector` functionality
- [ ] Create drag-drop system with existing components
- [ ] Implement file watcher with Socket.IO

### Phase 3: Integration
- [ ] Connect web preview to visual editor
- [ ] Add real-time updates across environments
- [ ] Implement AI integration for component generation
- [ ] Create development scripts

### Phase 4: Deployment
- [ ] Set up mobile deployment pipeline
- [ ] Add error handling and recovery
- [ ] Implement testing framework
- [ ] Create production deployment process

This implementation plan provides a comprehensive roadmap for integrating the visual editor with your React Native CLI-based project while leveraging all existing infrastructure and components.
