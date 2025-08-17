import { Platform } from 'react-native';

console.log('🧩 [DEBUG] Starting component exports...');

console.log('🧩 [DEBUG] About to export BottomNavigation...');
export {default as BottomNavigation} from './BottomNavigation';
console.log('🧩 [DEBUG] BottomNavigation export successful');

console.log('🧩 [DEBUG] About to export AppContainer...');
export {AppContainer} from './AppContainer';
console.log('🧩 [DEBUG] AppContainer export successful');

console.log('🧩 [DEBUG] About to export CustomAlert...');
export {CustomAlert} from './CustomAlert';
console.log('🧩 [DEBUG] CustomAlert export successful');

// Platform-aware CheckoutWebView export
let CheckoutWebView: any = null;

if (Platform.OS !== 'web') {
  console.log('🧩 [DEBUG] Loading CheckoutWebView for React Native platform...');
  try {
    CheckoutWebView = require('./CheckoutWebView').default;
    console.log('🧩 [DEBUG] CheckoutWebView loaded successfully');
  } catch (error) {
    console.error('❌ [DEBUG] Failed to load CheckoutWebView:', error);
  }
} else {
  console.log('🧩 [DEBUG] Skipping CheckoutWebView for web platform');
}

// Export CheckoutWebView (will be null on web)
export { CheckoutWebView };

console.log('🧩 [DEBUG] About to export DynamicComponentDemo...');
export { DynamicComponentDemo } from './DynamicComponentDemo';
console.log('🧩 [DEBUG] DynamicComponentDemo export successful');

console.log('✅ [DEBUG] All component exports completed successfully!');