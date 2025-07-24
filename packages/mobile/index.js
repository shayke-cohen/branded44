/**
 * @format
 */

// Import polyfills first (before any other imports)
import 'react-native-get-random-values';
import 'text-encoding-polyfill';

// Setup global polyfills
import { polyfillGlobal } from 'react-native-polyfill-globals/auto';

console.log('🚀 [DEBUG] Starting React Native app entry point...');

import { AppRegistry } from 'react-native';
console.log('🚀 [DEBUG] AppRegistry imported successfully');

import App from './src/App';
console.log('🚀 [DEBUG] App component imported successfully (TYPESCRIPT VERSION)');

import { name as appName } from './app.json';
console.log('🚀 [DEBUG] App name imported:', appName);

console.log('🚀 [DEBUG] About to register component...');
AppRegistry.registerComponent(appName, () => App);
console.log('🚀 [DEBUG] Component registered successfully!');
