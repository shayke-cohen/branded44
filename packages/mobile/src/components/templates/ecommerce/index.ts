/**
 * E-commerce Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all e-commerce template components with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category E-commerce Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === E-COMMERCE TEMPLATES ===
export { default as ShopScreen } from './ShopScreen';
export type { ShopScreenProps, ShopScreenConfig } from './ShopScreen';

export { default as CartScreen } from './CartScreen';
export type { CartScreenProps, CartSummary } from './CartScreen';

// === SHARED TYPES AND CONSTANTS ===
export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * ## E-commerce Template Components
 * 
 * ### For Product Shopping:
 * - Use `ShopScreen` for complete shopping experience
 * - Includes search, filters, categories, and product grid
 * - Built-in pagination and sorting
 * 
 * ### For Cart Management:
 * - Use `CartScreen` for shopping cart functionality
 * - Quantity controls, pricing calculations
 * - Checkout flow with validation
 * 
 * ## Common Implementation Patterns
 * 
 * ### Complete Shop Flow:
 * ```tsx
 * <ShopScreen
 *   products={productList}
 *   onProductSelect={(product) => navigateToProduct(product)}
 *   onAddToCart={(product) => addToCart(product)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   config={{
 *     title: "Our Store",
 *     showSearch: true,
 *     gridColumns: 2
 *   }}
 * />
 * ```
 * 
 * ### Shopping Cart:
 * ```tsx
 * <CartScreen
 *   cartItems={cartItems}
 *   onQuantityChange={(id, qty) => updateQuantity(id, qty)}
 *   onCheckout={(items, summary) => proceedToCheckout(items, summary)}
 *   taxRate={0.08}
 *   freeShippingThreshold={50}
 * />
 * ```
 */ 