/**
 * Wix Screens Main Index
 * 
 * Centralized exports for all Wix-related screens, utilities, types, and constants.
 * Organized by business domain for better developer experience.
 * 
 * Usage Examples:
 * import { CartScreen, ProductListScreen } from '@/screens/wix';
 * import { WixApiResponse, BaseWixScreenProps } from '@/screens/wix';
 * import { WIX_SCREEN_IDS, PAGINATION } from '@/screens/wix';
 */

// === DOMAIN MODULES ===

// Auth module
export * from './auth';

// E-commerce module  
export * from './ecommerce';

// Services & Booking module
export * from './services';

// Restaurant & Food module
export * from './restaurant';

// Content Management module
export * from './content';

// Navigation components
export * from './navigation';

// Shared utilities, types, and constants
export * from './shared';

// === DIRECT EXPORTS (Backwards Compatibility) ===

// Screens
export { MemberAuthScreen } from './auth';
export { ProductListScreen, ProductDetailScreen, CartScreen } from './ecommerce';
export { ServicesListScreen, ServiceDetailScreen, BookingScreen, MyBookingsScreen } from './services';
export { FoodScreen } from './restaurant';
export { CMSScreen } from './content';

// Navigation
export { ProductsNavigation, ServicesNavigation } from './navigation';