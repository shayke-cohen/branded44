# @branded44/web

The intelligent web development interface for Branded44's AI-powered mobile app ecosystem. This React Web application provides a comprehensive development environment with real-time mobile screen previewing, Claude Code prompt generation, and seamless integration with the mobile development workflow.

## 🚀 Overview

### Vision & Purpose
**Branded44 Web** serves as the command center for AI-powered mobile development, offering:
- **Visual Development Interface**: Preview mobile screens in realistic device frames
- **AI Integration Hub**: Generate and execute Claude Code prompts with advanced configuration
- **Real-time Development**: Hot reload preview of mobile app changes
- **Comprehensive Tooling**: Complete development workflow management

### Core Philosophy
1. **AI-First Development**: Streamlined interface for Claude Code and LLM interactions
2. **Visual Feedback**: Immediate preview of mobile development changes
3. **Developer Productivity**: Reduce context switching between tools
4. **Professional Workflow**: Production-ready development environment

## ✨ Key Features

### 🤖 Claude Code Integration
- **Prompt Generator**: Visual interface for creating Claude Code prompts
- **Advanced Configuration**: Full Claude Code CLI parameter support
- **Real-time Execution**: Direct execution with streaming feedback
- **Conversation Tracking**: Complete conversation history and debugging
- **Multiple Models**: Support for Claude Sonnet 4, Opus 4, and 3.7 Sonnet

### 📱 Mobile Preview System
- **Device Frames**: Realistic iPhone and Android device mockups
- **Hot Reload**: Instant reflection of mobile app changes
- **Multiple Preview Modes**: Screens, templates, and example apps
- **Cross-Platform**: Unified preview for iOS and Android designs

### 🎛️ Development Tools
- **Prompt Engineering**: Visual prompt builder with templates
- **SDK Testing**: Quick Claude Code SDK testing interface
- **Configuration Management**: Advanced options for fine-tuning
- **Error Handling**: Comprehensive error reporting and debugging

### 🔄 Real-time Workflow
- **Streaming Execution**: Live Claude Code execution feedback
- **Auto-detection**: Automatic server availability detection
- **Cross-package Integration**: Seamless mobile and server communication

## 🏗️ Architecture & Structure

### Project Structure
```
src/
├── App.tsx                      # Main application component
├── components/                  # Web interface components
│   ├── PromptGenerator.tsx     # Claude Code prompt interface (1000+ lines)
│   ├── PreviewNavigation.tsx   # Mobile preview navigation (1300+ lines)
│   ├── MobileApp.tsx           # Mobile app wrapper component
│   ├── MobilePreview.tsx       # Device frame container
│   ├── MobileScreens.tsx       # Screen preview renderer
│   ├── MobileTemplates.tsx     # Template preview renderer
│   ├── PhoneStatusBar.tsx      # Device status bar simulation
│   ├── WebAppContainer.tsx     # Web app layout container
│   └── WebTemplateIndexScreen.tsx # Template browser interface
├── context/                     # React Context providers
│   ├── PreviewContext.tsx      # Preview state management
│   ├── WebMemberContext.tsx    # Web member authentication
│   └── WebWixCartContext.tsx   # Web Wix cart integration
├── polyfills/                   # React Native Web compatibility
│   └── AsyncStorage.js         # AsyncStorage polyfill for web
├── utils/                       # Utility functions
│   ├── claudePrompts.ts        # Centralized prompt generation
│   ├── initializeScreens.ts    # Screen initialization system
│   ├── logger.ts               # Logging utilities
│   └── robustHttpClient.ts     # HTTP client with retry logic
├── screens/                     # Web-specific screens
└── index.tsx                    # Application entry point
```

### Key Components Deep Dive

#### PromptGenerator (40KB, 1046 lines)
The heart of the AI development interface:
- **Dual Mode Support**: Single screen and complete app generation
- **Advanced Configuration**: 20+ Claude Code parameters
- **Real-time Streaming**: Live execution feedback
- **Conversation Display**: Complete Claude interaction history
- **SDK Testing**: Quick Claude Code functionality testing

#### PreviewNavigation (50KB, 1376 lines)
Comprehensive mobile preview management:
- **Multi-mode Preview**: Screens, templates, examples
- **Template Browser**: Interactive template exploration
- **App Generation**: Direct complete app creation
- **Update System**: In-place app modification capabilities

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: ≥16.0.0
- **Yarn**: ≥1.22.0
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Quick Start
```bash
# Install dependencies
yarn install

# Start development server
yarn dev
# Opens at http://localhost:3000

# Production build
yarn build

# Serve production build
yarn start
```

### Available Scripts
```bash
# Development
yarn dev              # Start webpack dev server
yarn start            # Start dev server and open browser

# Build & Production
yarn build            # Production webpack build
yarn clean            # Clean build directory

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Auto-fix ESLint issues

# Maintenance
yarn install:clean    # Clean install (removes node_modules)
```

## 🤖 Claude Code Integration

### Prompt Generation Interface
The web interface provides a sophisticated prompt generation system:

```typescript
// Single Screen Mode
{
  screenName: 'UserProfileScreen',
  description: 'User profile management with avatar upload',
  category: 'User Management',
  icon: '👤'
}

// Complete App Mode
{
  appDescription: 'A fitness tracking app with workout logging, progress tracking, and social features'
}
```

### Advanced Configuration Options
```typescript
// Full Claude Code parameter support
{
  maxTurns: 100,                    // Execution turn limit (default: 100)
  model: 'claude-sonnet-4-20250514', // AI model selection
  systemPrompt: 'Custom instructions...',
  allowedTools: ['Read', 'Write', 'Bash'],
  workingDirectory: '/project/path',
  dangerouslySkipPermissions: true,
  anthropicBaseUrl: 'http://localhost:3003/api/anthropic-proxy',
  streamingEnabled: true            // Real-time execution feedback
}
```

### Execution Modes
1. **CLI Generation**: Copy generated claude-code commands
2. **Direct Execution**: Execute through integrated server
3. **Streaming Mode**: Real-time execution with live feedback
4. **Test Mode**: Quick SDK functionality testing

### Real-time Streaming
```typescript
// Live execution feedback
const executeClaudeCodeStreaming = async () => {
  // Server-Sent Events for real-time updates
  // Complete conversation tracking
  // Error handling and recovery
  // Auto-scroll message display
};
```

## 📱 Mobile Preview System

### Device Frame Support
- **iPhone Frame**: Realistic iOS device mockup with status bar
- **Android Frame**: Material Design device frame
- **Responsive**: Adapts to different screen sizes
- **Status Bar**: Simulated device status indicators

### Preview Modes

#### 1. Screens Preview
Preview main application screens:
```typescript
// Available screens
- HomeScreen          // App welcome interface
- SettingsScreen      // Configuration and theming
- TemplateIndexScreen // Template browser
```

#### 2. Template Gallery
Explore screen templates:
```typescript
// Template categories
- AuthScreenTemplate     // Authentication flows
- DashboardScreenTemplate // Dashboard layouts
- FormScreenTemplate     // Form interfaces
- ListScreenTemplate     // List/grid layouts
```

#### 3. Example Applications
Complete app examples:
```typescript
// E-commerce suite
- ProductListScreen      // Product catalog
- ProductDetailScreen    // Product details
- CartScreen            // Shopping cart
- CheckoutScreen        // Purchase flow
- SearchScreen          // Search interface
```

### Hot Reload Integration
- **Webpack Alias**: Maps `@mobile/*` to mobile package source
- **React Native Web**: Translates RN components for web
- **Live Updates**: Changes reflect immediately in preview
- **Error Boundaries**: Graceful error handling for broken components

## 🔄 Integration Ecosystem

### Server Integration (`@branded44/server`)
- **Auto-detection**: Automatic server availability checking
- **Claude Code Execution**: Direct command execution through HTTP API
- **Streaming Support**: Real-time execution feedback via SSE
- **Error Handling**: Comprehensive error reporting and recovery

### Mobile Integration (`@branded44/mobile`)
- **Component Import**: Direct import of mobile components
- **Type Safety**: Shared TypeScript definitions
- **Context Sharing**: Unified state management
- **Build Pipeline**: Webpack configuration for RN components

### Workflow Integration
```bash
# Complete development workflow
1. yarn workspace @branded44/server dev     # Start Claude Code server
2. yarn workspace @branded44/web dev        # Start web interface
3. yarn workspace @branded44/mobile start   # Start mobile development

# AI-powered development cycle
1. Generate prompts in web interface
2. Execute through server integration
3. Preview results in mobile frames
4. Iterate and refine
```

## 📦 Dependencies & Technology

### Core Web Technologies
- **React**: 18.2.0 - Modern React features
- **React DOM**: 18.2.0 - Web rendering
- **React Native Web**: 0.19.12 - RN component translation
- **TypeScript**: 5.0.4 - Type safety

### Build & Development
- **Webpack**: 5.95.0 - Module bundling
- **Webpack Dev Server**: 4.15.2 - Development server
- **Babel**: 7.25.2 - JavaScript/TypeScript compilation
- **ESLint**: 9.15.0 - Code linting

### React Native Web Support
- **@react-native-async-storage/async-storage**: Storage polyfill
- **Babel Presets**: React Native compatibility
- **CSS Loader**: Style processing for RN components

### Development Tools
- **Hot Module Replacement**: Fast development iteration
- **Source Maps**: Debugging support
- **CSS Processing**: Style-loader and css-loader
- **File Processing**: url-loader and file-loader

## 🎨 User Interface Design

### Design Principles
1. **Developer-Focused**: Optimized for development workflows
2. **Information Dense**: Maximum information in minimal space
3. **Visual Hierarchy**: Clear navigation and priority
4. **Responsive**: Works on all screen sizes

### Interface Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Branded44 Mobile Development                        │
├─────────────────────────────────────────────────────────────┤
│ Tabs: [📱 Preview Screens] [🤖 Generate Prompts]          │
├─────────────────────────────────────────────────────────────┤
│ Preview Mode:                    │ Prompt Mode:             │
│ ┌─ Navigation ─┐ ┌─ Device ────┐ │ ┌─ Generator ───────────┐ │
│ │ • Screens    │ │ ┌─────────┐ │ │ │ Mode: [Single][App]   │ │
│ │ • Templates  │ │ │ iPhone  │ │ │ │                       │ │
│ │ • Examples   │ │ │ Frame   │ │ │ │ Screen Name: ________ │ │
│ │              │ │ │         │ │ │ │ Description: ________ │ │
│ │ [Generate]   │ │ │ Content │ │ │ │                       │ │
│ │ [Update]     │ │ │         │ │ │ │ [Advanced Options]    │ │
│ └──────────────┘ │ └─────────┘ │ │ │                       │ │
│                  └─────────────┘ │ │ [Execute] [Copy CLI]  │ │
│                                  │ └───────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Theme Support
- **Consistent Styling**: Unified design language
- **Dark/Light Modes**: System theme detection
- **Accessible**: WCAG compliant color schemes
- **Mobile-First**: Responsive design patterns

## 🔧 Configuration & Customization

### Webpack Configuration
```javascript
// Optimized for React Native Web
module.exports = {
  resolve: {
    alias: {
      '@mobile': path.resolve(__dirname, '../mobile/src'),
      'react-native$': 'react-native-web'
    },
    extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx']
  },
  module: {
    rules: [
      // Babel processing for React Native components
      // CSS processing for styling
      // Asset handling for images and fonts
    ]
  }
};
```

### Environment Configuration
```bash
# Development
NODE_ENV=development
PORT=3000
MOBILE_PACKAGE_PATH=../mobile/src

# Production
NODE_ENV=production
PUBLIC_URL=/
BUILD_PATH=dist
```

## 🧪 Testing & Quality

### Testing Strategy
- **Component Testing**: React Testing Library
- **Integration Testing**: Cross-package functionality
- **Visual Testing**: Screenshot comparison
- **Performance Testing**: Bundle size and load time

### Code Quality
- **ESLint**: Strict linting rules
- **TypeScript**: Full type coverage
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit quality checks

### Performance Optimization
- **Code Splitting**: Lazy loading of heavy components
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and font compression
- **Caching**: Aggressive browser caching strategy

## 🚀 Deployment & Production

### Build Process
```bash
# Production build with optimizations
yarn build

# Output structure
dist/
├── index.html           # Main HTML file
├── static/
│   ├── js/             # JavaScript bundles
│   ├── css/            # CSS bundles
│   └── media/          # Optimized assets
└── manifest.json       # PWA manifest
```

### Deployment Options
1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **CDN**: CloudFront, CloudFlare
3. **Docker**: Containerized deployment
4. **Self-hosted**: Express server for custom needs

### Performance Metrics
- **Bundle Size**: Optimized for fast loading
- **First Contentful Paint**: < 2s on 3G
- **Time to Interactive**: < 4s on mobile
- **Lighthouse Score**: 90+ across all metrics

## 🔒 Security & Privacy

### Security Measures
- **CSP Headers**: Content Security Policy protection
- **HTTPS Only**: Secure connection enforcement
- **Input Validation**: XSS prevention
- **Dependency Auditing**: Regular vulnerability scanning

### Privacy Compliance
- **No Tracking**: No analytics or tracking scripts
- **Local Storage Only**: No external data transmission
- **Transparent**: Open source security model

## 🤝 Contributing & Development

### Development Guidelines
1. **Component Structure**: Follow React best practices
2. **Type Safety**: Comprehensive TypeScript usage
3. **Testing**: Test all new functionality
4. **Documentation**: Update README for changes
5. **Performance**: Monitor bundle size impact

### Adding New Features
```typescript
// 1. Create component
const NewFeature: React.FC = () => {
  // Implementation
};

// 2. Add to appropriate section
// 3. Update navigation if needed
// 4. Add tests
// 5. Update documentation
```

### Code Style
- **ESLint Config**: Strict React/TypeScript rules
- **Prettier**: Auto-formatting on save
- **Naming**: Descriptive, consistent naming
- **Structure**: Logical component organization

## 📊 Analytics & Monitoring

### Development Metrics
- **Build Time**: Webpack build performance
- **Bundle Analysis**: Size and dependency tracking
- **Error Monitoring**: Console error tracking
- **Performance**: Runtime performance monitoring

### Usage Analytics
- **Feature Usage**: Most used development features
- **Error Rates**: Common user interaction errors
- **Performance**: Real-world usage performance

## 🔄 Future Roadmap

### Planned Features
- **Multi-project Support**: Manage multiple mobile projects
- **Template Marketplace**: Share and discover templates
- **Collaboration Tools**: Team development features
- **Enhanced AI Integration**: More AI model support
- **Performance Profiling**: Advanced debugging tools

### Integration Expansions
- **VS Code Extension**: Direct IDE integration
- **GitHub Actions**: CI/CD automation
- **Design Tools**: Figma/Sketch integration
- **Analytics**: Usage and performance tracking

## 📄 License

This project is private and proprietary. All rights reserved.

---

**Branded44 Web** - Your AI-Powered Mobile Development Interface 🌟 