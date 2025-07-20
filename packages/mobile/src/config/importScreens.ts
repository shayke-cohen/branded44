/**
 * Screen Imports
 * 
 * Import all screens to trigger their registerScreen() calls.
 * To add a new screen: 1) Create YourScreen.tsx with registerScreen() 2) Add import below
 */

console.log('📱 Importing all screens...');

// Import all screens - each will self-register SYNCHRONOUSLY
import '../screens/HomeScreen/HomeScreen';
import '../screens/SettingsScreen/SettingsScreen';
import '../screens/ProfileScreen/ProfileScreen';
import '../screens/MessagesScreen/MessagesScreen';
import '../screens/NotificationsScreen';
import '../screens/ContactsScreen';

// Note: TemplateIndexScreen registered separately to avoid circular dependencies

// Add new screen imports here:
// import '../screens/YourNewScreen';

console.log('✅ All screens imported - registerScreen calls executed!'); 