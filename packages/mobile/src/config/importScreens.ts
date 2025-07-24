/**
 * Centralized Screen Registration
 * 
 * This is the SINGLE SOURCE OF TRUTH for all screen registration and navigation configuration.
 * All screen imports and registrations happen here - nowhere else.
 * 
 * ⚠️ IMPORTANT: Do not import screens or call registerScreen elsewhere!
 */

import { registerScreen } from './registry';

console.log('📱 [DEBUG] Starting centralized screen imports and registration...');

// =============================================================================
// CORE APP SCREENS
// =============================================================================
console.log('📱 [DEBUG] Importing and registering core app screens...');

import HomeNavigation from '../screens/HomeScreen/HomeNavigation';
import SettingsScreen from '../screens/SettingsScreen';
import MemberAuthScreen from '../screens/wix/MemberAuthScreen';

registerScreen(HomeNavigation, {
  name: 'Home',
  shortName: 'Home', // Short text
  icon: '🏠',
  category: 'Navigation',
  hasTab: true,
  tabPosition: 1,
  description: 'Welcome screen and app home with profile navigation',
  tags: ['home', 'main', 'default', 'profile']
});

registerScreen(SettingsScreen, {
  name: 'Settings',
  shortName: 'Settings', // Short text
  icon: '⚙️',
  category: 'App',
  hasTab: true,
  tabPosition: 6,
  description: 'App settings and configuration options',
  tags: ['settings', 'config', 'preferences']
});

registerScreen(MemberAuthScreen, {
  name: 'Profile',
  shortName: 'Profile', // Short text
  icon: '👤',
  category: 'App',
  hasTab: true,
  tabPosition: 5,
  description: 'Member login, signup, and profile management',
  tags: ['member', 'auth', 'login', 'signup', 'profile']
});

console.log('✅ [DEBUG] Core app screens registered');

// =============================================================================
// WIX STORE SCREENS (eCommerce + CMS) - PRIMARY TABS
// =============================================================================
console.log('📱 [DEBUG] Importing and registering Wix store screens...');

import ProductsNavigation from '../screens/wix/navigation/ProductsNavigation';
import CartScreen from '../screens/wix/CartScreen';
import CMSScreen from '../screens/wix/CMSScreen';

registerScreen(ProductsNavigation, {
  name: 'Store',
  shortName: 'Store', // Short text
  icon: '🛍️',
  category: 'Store',
  hasTab: true,
  tabPosition: 2,
  description: 'Browse and search store products with navigation to product details',
  tags: ['store', 'products', 'shop', 'wix', 'navigation']
});

registerScreen(CartScreen, {
  name: 'Cart',
  shortName: 'Cart', // Short text
  icon: '🛒',
  category: 'Store',
  hasTab: true,
  tabPosition: 3,
  description: 'View and manage shopping cart items',
  tags: ['store', 'cart', 'checkout', 'wix']
});

registerScreen(CMSScreen, {
  name: 'CMS',
  shortName: 'CMS', // Short text
  icon: '🗄️',
  category: 'Store',
  hasTab: true,
  tabPosition: 4,
  description: 'Browse and manage Wix data collections',
  tags: ['cms', 'data', 'collections', 'wix']
});

console.log('✅ [DEBUG] Wix store screens registered');


// =============================================================================
// SUMMARY
// =============================================================================
console.log('🎉 [DEBUG] All screens imported and registered successfully!');
console.log('📊 [DEBUG] Screen registration summary:');
console.log('   🏠  Home (1): Welcome and dashboard');
console.log('   🛍️  Products (2): Wix store product browsing');
console.log('   🛒  Cart (3): Shopping cart management');
console.log('   🗄️  CMS (4): Wix data collections');
console.log('   👤  Account (5): Member login, signup, and profile');
console.log('   ⚙️  Settings (6): App configuration');
console.log('');
console.log('✨ [SUCCESS] Navigation with icons + short text labels implemented!'); 