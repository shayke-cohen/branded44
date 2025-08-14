// Initialize web-specific overrides FIRST to avoid CORS issues
import './context-override/WebMemberServiceOverride';

import React from 'react';
import {AppRegistry} from 'react-native';
import {createRoot} from 'react-dom/client';
import App from './App';

// Register the app for React Native Web
AppRegistry.registerComponent('App', () => App);

// Get the root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

// Create root and render the app
const root = createRoot(container);
root.render(<App />); 