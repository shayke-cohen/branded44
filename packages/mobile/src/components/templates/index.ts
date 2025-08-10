/**
 * Main Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all template components (full screens) with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === AUTHENTICATION TEMPLATES ===
export * from './auth';

// === PROFILE TEMPLATES ===
export * from './profile';

// === HOME TEMPLATES ===
export * from './home';

// === E-COMMERCE TEMPLATES ===
export * from './ecommerce';

// === COMMUNICATION TEMPLATES ===
export * from './communication';

// === BUSINESS TEMPLATES ===
export * from './business';

// === SHARED TYPES AND CONSTANTS ===
export { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';
export { cn } from '../../lib/utils';
export type { BaseComponentProps } from '../../lib/types';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * ## Template Categories
 * 
 * ### E-commerce Templates:
 * - Use `ShopScreen` for product browsing with search and filters
 * - Use `CartScreen` for shopping cart management
 * 
 * ## Usage Patterns
 * 
 * ### Complete Shopping Experience:
 * ```tsx
 * // Product browsing
 * <ShopScreen
 *   products={productList}
 *   onProductSelect={navigateToProduct}
 *   onAddToCart={addToCart}
 *   config={{ title: "Our Store", gridColumns: 2 }}
 * />
 * 
 * // Shopping cart
 * <CartScreen
 *   cartItems={cartItems}
 *   onQuantityChange={updateQuantity}
 *   onCheckout={proceedToCheckout}
 * />
 * ```
 */ 