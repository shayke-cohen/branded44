/**
 * E-commerce Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all e-commerce related block components with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category E-commerce
 * @author AI Component System
 * @version 1.0.0
 */

// === E-COMMERCE COMPONENTS ===

export { default as ProductCard } from './ProductCard';
export type { 
  ProductCardProps, 
  ProductCardData 
} from './ProductCard';

export { default as CartItem } from './CartItem';
export type { 
  CartItemProps, 
  CartItemData 
} from './CartItem';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For Product Display:
 * - Use `ProductCard` for individual product showcases
 * - Supports multiple variants (compact, standard, detailed)
 * - Built-in wishlist, cart, and rating functionality
 * 
 * ### For Shopping Cart:
 * - Use `CartItem` for shopping cart items
 * - Quantity controls with validation
 * - Move to wishlist and save for later options
 * 
 * ## Common Implementation Patterns
 * 
 * ### Product Showcase:
 * ```tsx
 * <ProductCard
 *   product={productData}
 *   onPress={() => navigateToProduct()}
 *   onAddToCart={(product) => addToCart(product)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   variant="detailed"
 *   showWishlist={true}
 *   showRating={true}
 *   showFeatures={true}
 * />
 * ```
 * 
 * ### Shopping Cart Item:
 * ```tsx
 * <CartItem
 *   item={cartItemData}
 *   onQuantityChange={(id, qty) => updateQuantity(id, qty)}
 *   onRemove={(id) => removeFromCart(id)}
 *   onPress={(item) => navigateToProduct(item)}
 *   showMoveToWishlist={true}
 *   showSaveForLater={true}
 * />
 * ```
 * 
 * ### Compact Product Grid:
 * ```tsx
 * <ProductCard
 *   product={productData}
 *   variant="compact"
 *   maxWidth={200}
 *   showWishlist={true}
 *   showAddToCart={true}
 * />
 * ```
 */ 