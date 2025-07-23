/**
 * Screen Imports
 * 
 * Import all screens to trigger their registerScreen() calls.
 * Only include screens that are relevant to this specific app.
 */

console.log('📱 [DEBUG] Starting screen imports...');

// Fitness App Screens
console.log('📱 [DEBUG] About to import SettingsScreen...');
import '../screens/SettingsScreen';
console.log('📱 [DEBUG] SettingsScreen imported successfully');

console.log('📱 [DEBUG] About to import HomeScreen...');
import '../screens/HomeScreen';
console.log('📱 [DEBUG] HomeScreen imported successfully');

console.log('✅ [DEBUG] All fitness app screens imported successfully!'); 