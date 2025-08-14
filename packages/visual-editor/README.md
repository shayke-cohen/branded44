# Visual React Native Editor

A web-based visual development environment for React Native applications that integrates with the Branded44 monorepo structure.

## Features

- 🎨 **Visual Component Editor**: Drag-and-drop interface for React Native components
- 📱 **Live Phone Preview**: Real-time preview in a phone frame with device simulation
- 🔍 **Component Inspector**: Click-to-select and edit component properties
- 📁 **Safe Editing**: Uses src2 directory for safe editing without affecting original source
- 🔄 **Real-time Updates**: Instant updates across Visual Editor, Web Preview, and Mobile App
- 🧩 **Component Library**: Access to 71+ block components and screen templates
- 🤖 **AI Integration**: AI-powered component generation and modifications (planned)

## Quick Start

### Prerequisites

- Node.js 18+
- React Native CLI project (not Expo)
- Existing Branded44 monorepo structure

### Installation

1. Install dependencies:
```bash
cd packages/visual-editor
npm install
```

2. Initialize src2 environment:
```bash
npm run init:src2
```

3. Start the visual editor:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3002`

## Development Workflow

### Starting All Services

From the root of the monorepo:
```bash
npm run dev:all
```

This starts:
- Visual Editor on port 3002
- Server on port 3001  
- Web Preview on port 3000
- Mobile App with src2 support

### Using the Visual Editor

1. **Select a Screen**: Choose a screen from the dropdown in the header
2. **Inspect Components**: Click the "Inspect" button and click on components in the phone frame
3. **Edit Properties**: Use the property panel on the right to modify component properties
4. **Drag Components**: Drag components from the palette on the left to add new elements
5. **See Live Updates**: Changes appear instantly across all environments

### Component Library

The visual editor provides access to your existing component library:

#### Block Components (71+ components)
- **Authentication**: LoginForm, SignupForm, ProfileCard, SocialLoginButtons
- **Forms**: ContactForm, SearchForm, FeedbackForm
- **Lists & Data**: UserList, ProductGrid, ArticleList, MessageList
- **E-commerce**: ProductCard, CartItem, CartSummary
- **Booking**: ServiceCard, BookingCalendar, TimeSlotGrid, AppointmentCard
- **And many more across 13 categories**

#### Screen Templates
- **Basic Templates**: HomeScreen, LoginScreen, ProfileScreen, SettingsScreen
- **E-commerce Templates**: ProductListScreen, ProductDetailScreen, CartScreen, CheckoutScreen
- **Booking Templates**: ServicesScreen, BookingScreen, MyBookingsScreen

## Architecture

### File Structure
```
packages/visual-editor/
├── src/
│   ├── components/          # UI components
│   │   ├── Header/         # Top navigation bar
│   │   ├── PhoneFrame/     # Mobile preview frame
│   │   ├── ComponentPalette/ # Drag-drop component library
│   │   ├── PropertyPanel/  # Component property editor
│   │   └── StatusBar/      # Bottom status information
│   ├── contexts/           # React contexts
│   │   ├── EditorContext.tsx # Main editor state
│   │   └── SocketContext.tsx # Real-time communication
│   ├── services/           # Core services
│   │   ├── Src2Manager.ts  # src2 file management
│   │   └── LiveRenderer.ts # React Native Web rendering
│   └── App.tsx            # Main application
├── public/                # Static assets
├── scripts/               # Utility scripts
└── webpack.config.js      # Build configuration
```

### src2 System

The visual editor uses a "src2" system for safe editing:

1. **Original Source (`src/`)**: Your original React Native source code (read-only)
2. **Editing Copy (`src2/`)**: A copy created for safe editing
3. **Smart Switching**: Metro bundler switches between src and src2 based on environment variables

### Real-time Updates

```
Visual Editor Edit → src2 File Write → File Watcher → Socket.IO Broadcast
                                                            ↓
                    ┌─────────────────┬─────────────────────┼─────────────────┐
                    ↓                 ↓                     ↓                 ↓
            Visual Editor      Web Preview           Mobile App         Metro Dev
            React Native Web   Metro HMR Bundle      Fast Refresh       Server HMR
            Hot Replacement    Auto-reload           Auto-reload        Broadcasts
            (instant)          (instant)             (instant)          (instant)
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run init:src2` - Initialize src2 environment
- `npm run cleanup:src2` - Clean up src2 environment
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `REACT_APP_SERVER_URL` - Server URL (default: http://localhost:3001)

### Webpack Configuration

The webpack configuration includes:
- React Native Web aliases
- Mobile component access via `@mobile` alias
- Hot Module Replacement for development
- Production optimizations

## Integration with Existing Project

The visual editor integrates seamlessly with your existing Branded44 project:

### Mobile App Integration
- Enhances existing `metro.config.js` for src2 support
- Adds environment variable detection to `App.tsx`
- Preserves all existing functionality and context providers

### Web Preview Integration
- Connects to existing `MobilePreview.tsx` component
- Adds real-time update capabilities via Socket.IO
- Maintains existing preview functionality

### Server Integration
- Extends existing Express server with editor APIs
- Adds file watching and real-time communication
- Preserves all existing API endpoints

## Troubleshooting

### Common Issues

1. **src2 directory already exists**
   ```bash
   npm run cleanup:src2
   npm run init:src2
   ```

2. **Connection errors**
   - Ensure server is running on port 3001
   - Check firewall settings
   - Verify WebSocket support

3. **Component not rendering**
   - Check browser console for errors
   - Verify component exists in src2
   - Check file permissions

### Debug Mode

Enable verbose logging:
```bash
DEBUG=visual-editor:* npm run dev
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Update tests for changes
4. Run linting before committing

## License

MIT License - see LICENSE file for details
