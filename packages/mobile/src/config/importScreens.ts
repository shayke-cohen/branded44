/**
 * Screen Registry and Import Configuration
 * 
 * This file centralizes all screen imports and navigation configuration.
 * It provides a single source of truth for screen registration and metadata.
 */

import { registerScreen } from './registry';

// Import existing screens
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TemplateIndexScreen from '../screens/TemplateIndexScreen';

// Import Wix screens
import CartScreen from '../screens/wix/CartScreen';
import MemberAuthScreen from '../screens/wix/MemberAuthScreen';
import ProductDetailScreen from '../screens/wix/ProductDetailScreen';
import ProductListScreen from '../screens/wix/ProductListScreen';

// Import demo screens
import AuthDemoScreen from '../screens/AuthDemoScreen';
import ComponentsShowcaseScreen from '../screens/ComponentsShowcaseScreen';

// Register existing screens
registerScreen(HomeScreen, {
  name: 'Home',
  shortName: 'Home',
  icon: '🏠',
  category: 'Main',
  hasTab: true,
  tabPosition: 1,
  description: 'Main dashboard with navigation',
  tags: ['main', 'dashboard', 'navigation']
});

registerScreen(TemplateIndexScreen, {
  name: 'Templates',
  shortName: 'Templates',
  icon: '📱',
  category: 'Core',
  hasTab: true,
  tabPosition: 2,
  description: 'Browse available screen templates',
  tags: ['templates', 'examples', 'screens']
});

registerScreen(SettingsScreen, {
  name: 'Settings',
  shortName: 'Settings',
  icon: '⚙️',
  category: 'Core',
  hasTab: true,
  tabPosition: 3,
  description: 'App configuration and preferences',
  tags: ['settings', 'config', 'preferences']
});

// Register Wix screens
registerScreen(ProductListScreen, {
  name: 'Wix Products',
  shortName: 'Products',
  icon: '🛍️',
  category: 'Wix',
  hasTab: true,
  tabPosition: 4,
  description: 'Wix e-commerce product listing',
  tags: ['wix', 'products', 'ecommerce']
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

registerScreen(AuthDemoScreen, {
  name: 'Auth Demo',
  shortName: 'Auth', // Short text
  icon: '🔐',
  category: 'Demo',
  hasTab: true,
  tabPosition: 7,
  description: 'Showcase of new authentication block components',
  tags: ['demo', 'components', 'auth', 'forms', 'blocks']
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
console.log('   📱  Templates (2): Template system browser and examples');
console.log('   ⚙️  Settings (3): Configuration and preferences');
console.log('   🛍️  Wix Products (4): E-commerce product listings');
console.log('   🛒  Wix Cart (5): Shopping cart and checkout');
console.log('   👤  Wix Auth (6): Member authentication and profiles');
console.log('   🔐  Auth Demo (7): NEW! Authentication block components showcase');
console.log('   🎨  Component Library (8): NEW! Complete component library showcase');
console.log('');
console.log('🎯 Total: 8 screens registered (2 new component showcases)'); 