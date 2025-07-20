# Branded44 Web Preview

A React Native Web application for previewing mobile screens in the browser.

## Overview

This package allows you to preview your React Native mobile app screens, sample apps, and templates in a web browser using React Native Web. It provides a beautiful interface with device frames (iPhone/Android) and navigation to switch between different components.

## Features

- 📱 **Mobile Device Frames**: Preview your components in realistic iPhone and Android frames
- 🔄 **Multiple Preview Modes**: Switch between main screens, sample apps, and templates
- 🎨 **Beautiful UI**: Modern web interface with gradient backgrounds and shadows
- 🔥 **Hot Reload**: Development server with hot reload for fast iteration
- 📦 **Shared Components**: Directly imports and renders components from the mobile package

## Quick Start

### 1. Install Dependencies

```bash
# From the web package directory
yarn install

# Or from the root if using a monorepo with workspaces
yarn workspace @branded44/web install
```

### 2. Start Development Server

```bash
yarn dev
```

The app will open at `http://localhost:3000`

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start development server and open browser
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn clean` - Clean build directory
- `yarn install:clean` - Clean install (removes node_modules and package-lock.json)

## Project Structure

```
src/
├── components/           # Web-specific components
│   ├── MobileApp.tsx          # Main app wrapper
│   ├── MobilePreview.tsx      # Device frame container
│   ├── PreviewNavigation.tsx  # Navigation sidebar
│   ├── MobileScreens.tsx      # Main screens renderer
│   ├── MobileSampleApps.tsx   # Sample apps renderer
│   └── MobileTemplates.tsx    # Templates renderer
├── context/             # React contexts
│   └── PreviewContext.tsx     # Preview state management
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## How It Works

1. **React Native Web**: Translates React Native components to web-compatible equivalents
2. **Webpack Alias**: Maps `@mobile/*` imports to the mobile package source
3. **Device Frames**: CSS-based iPhone and Android device mockups
4. **Context Management**: Preview state for switching between components
5. **Lazy Loading**: Components are lazy-loaded to handle import dependencies

## Preview Modes

### Screens
Preview the main application screens:
- Home Screen
- Settings Screen  
- Template Index Screen

### Sample Apps
Preview complete sample applications:
- Todo App
- Notes App
- Weather App
- Calculator App

### Templates
Preview reusable screen templates:
- Auth Template
- Dashboard Template
- Form Template
- List Template (coming soon)
- Profile Template (coming soon)

## Development

### Adding New Components

To preview new mobile components:

1. Ensure they're exported from the mobile package
2. Add them to the appropriate renderer component:
   - `MobileScreens.tsx` for main screens
   - `MobileSampleApps.tsx` for sample apps
   - `MobileTemplates.tsx` for templates
3. Update the navigation options in `PreviewNavigation.tsx`
4. Add the new types to `PreviewContext.tsx`

### Troubleshooting

**Build Issues:**
- Ensure all mobile package dependencies are compatible with React Native Web
- Check that imports use the `@mobile/*` alias correctly
- Try `yarn install:clean` if you encounter dependency conflicts

**Component Not Rendering:**
- Verify the component is properly exported from the mobile package
- Check for platform-specific code that might not work on web
- Review browser console for import errors

**Styling Issues:**
- Some React Native styles may not translate perfectly to web
- Use web-specific style overrides when necessary

## Requirements

- Node.js 16.0.0+
- Yarn 1.22.0+

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Ensure your changes don't break the mobile package
2. Test across different browsers
3. Update this README for new features
4. Follow the existing code style
5. Use `yarn` for all package management

## Related Packages

- `@branded44/mobile` - The React Native mobile application
- `react-native-web` - React Native components for web platforms 