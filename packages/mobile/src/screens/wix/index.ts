// Wix Store Screens Index
// This file exports all Wix-related screens for easy importing

// Import screens to trigger their registration
import ProductListScreen from './ProductListScreen';
import ProductDetailScreen from './ProductDetailScreen';
import CartScreen from './CartScreen';
import ProductsNavigation from './navigation/ProductsNavigation';
import CMSScreen from './CMSScreen';

// Export screens for external use
export { default as CartScreen } from './CartScreen';
export { default as ProductDetailScreen } from './ProductDetailScreen';
export { default as ProductListScreen } from './ProductListScreen';
export { default as CMSScreen } from './CMSScreen';

console.log('🛍️ [DEBUG] Wix screens index loaded'); 