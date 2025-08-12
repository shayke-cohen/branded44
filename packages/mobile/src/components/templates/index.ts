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

// === BOOKING TEMPLATES ===
export * from './booking';

// === RESTAURANT TEMPLATES ===
export * from './restaurant';

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
 * ### Restaurant Templates:
 * - Use `MenuScreen` for restaurant menu browsing with cart functionality
 * - Use `RestaurantDetailScreen` for detailed restaurant information
 * - Use `OrderScreen` for cart review and order management
 * - Use `CheckoutScreen` for payment processing and order confirmation
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
 * 
 * ### Complete Restaurant Experience:
 * ```tsx
 * // Restaurant discovery
 * <RestaurantDetailScreen
 *   restaurant={restaurantData}
 *   photos={restaurantPhotos}
 *   menuHighlights={popularItems}
 *   onViewMenu={navigateToMenu}
 *   onStartOrder={navigateToMenu}
 * />
 * 
 * // Menu browsing
 * <MenuScreen
 *   restaurant={restaurantData}
 *   menuCategories={categorizedMenuItems}
 *   cartItems={currentCartItems}
 *   onAddToCart={handleAddToCart}
 *   onViewCart={navigateToOrder}
 * />
 * 
 * // Order management
 * <OrderScreen
 *   orderItems={cartItems}
 *   orderSummary={orderSummaryData}
 *   onProceedToCheckout={navigateToCheckout}
 * />
 * 
 * // Checkout process
 * <CheckoutScreen
 *   orderSummary={finalOrderSummary}
 *   onPlaceOrder={handleOrderPlacement}
 * />
 * ```
 */ 