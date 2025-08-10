/**
 * Screen Registry and Import Configuration
 * 
 * This file centralizes all screen imports and navigation configuration.
 * It provides a single source of truth for screen registration and metadata.
 */

import { registerScreen } from './registry';

// Import existing screens
import HomeNavigation from '../screens/HomeScreen/HomeNavigation'; // Use HomeNavigation instead of HomeScreen
import SettingsScreen from '../screens/SettingsScreen';
// import TemplateIndexScreen from '../screens/TemplateIndexScreen'; // Removed from navigation

// Import Wix screens
import CartScreen from '../screens/wix/CartScreen';
import MemberAuthScreen from '../screens/wix/MemberAuthScreen';
import ProductDetailScreen from '../screens/wix/ProductDetailScreen';
import ProductsNavigation from '../screens/wix/navigation/ProductsNavigation'; // Use ProductsNavigation instead of ProductListScreen

// Import demo screens

import ComponentsShowcaseScreen from '../screens/ComponentsShowcaseScreen';

// Register existing screens
registerScreen(HomeNavigation, {
  name: 'Home',
  shortName: 'Home',
  icon: '🏠',
  category: 'Main',
  hasTab: true,
  tabPosition: 1,
  description: 'Main dashboard with navigation',
  tags: ['main', 'dashboard', 'navigation']
});

// TemplateIndexScreen registration removed - not needed in bottom navigation
// registerScreen(TemplateIndexScreen, {
//   name: 'Templates',
//   shortName: 'Templates',
//   icon: '📱',
//   category: 'Core',
//   hasTab: true,
//   tabPosition: 2,
//   description: 'Browse available screen templates',
//   tags: ['templates', 'examples', 'screens']
// });

registerScreen(SettingsScreen, {
  name: 'Settings',
  shortName: 'Settings',
  icon: '⚙️',
  category: 'Core',
  hasTab: true,
  tabPosition: 7,
  description: 'App configuration and preferences',
  tags: ['settings', 'config', 'preferences']
});

// Register Wix screens
registerScreen(ProductsNavigation, {
  name: 'Wix Store',
  shortName: 'Store',
  icon: '🛍️',
  category: 'Wix',
  hasTab: true,
  tabPosition: 4,
  description: 'Wix e-commerce product listing with navigation',
  tags: ['wix', 'products', 'ecommerce', 'store', 'navigation']
});

registerScreen(CartScreen, {
  name: 'Wix Cart',
  shortName: 'Cart',
  icon: '🛒',
  category: 'Wix',
  hasTab: true,
  tabPosition: 5,
  description: 'Wix shopping cart functionality',
  tags: ['wix', 'cart', 'shopping']
});

registerScreen(MemberAuthScreen, {
  name: 'Wix Auth',
  shortName: 'Auth',
  icon: '👤',
  category: 'Wix',
  hasTab: true,
  tabPosition: 6,
  description: 'Wix member authentication',
  tags: ['wix', 'auth', 'members']
});



registerScreen(ComponentsShowcaseScreen, {
  name: 'Component Library',
  shortName: 'Library',
  icon: '🎨',
  category: 'Demo',
  hasTab: true,
  tabPosition: 8,
  description: 'Comprehensive showcase of all 15+ components and templates',
  tags: ['showcase', 'components', 'library', 'blocks', 'templates']
});

// Log registered screens summary
console.log('📱 Screen Registration Complete:');
console.log('   🏠  Home (1): Main dashboard and navigation hub');
console.log('   🛍️  Wix Store (4): E-commerce product listings');
console.log('   🛒  Wix Cart (5): Shopping cart and checkout');
console.log('   👤  Wix Auth (6): Member authentication and profiles');
console.log('   ⚙️  Settings (7): Configuration and preferences');
console.log('   🎨  Component Library (8): Complete component library showcase');
console.log('');
console.log('🎯 Total: 6 screens registered with updated navigation order'); 