import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Initialize React Native Web
import 'react-native-web/dist/exports/AppRegistry';

console.log('🎨 [Visual Editor] Starting Visual Editor...');

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('🎨 [Visual Editor] Visual Editor started successfully');
