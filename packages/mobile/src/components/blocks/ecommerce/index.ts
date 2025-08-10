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

// === CORE E-COMMERCE COMPONENTS ===

export { default as ProductCard } from './ProductCard';
export type { 
  ProductCardProps, 
  Product, 
  ProductVariantPreview, 
  ProductRating, 
  ProductPricing, 
  ProductBadge 
} from './ProductCard';

export { default as CartItem } from './CartItem';
export type { 
  CartItemProps, 
  CartItemData, 
  ProductVariant 
} from './CartItem';

export { default as CartSummary } from './CartSummary';
export type { 
  CartSummaryProps, 
  CartSummaryData, 
  ShippingOption, 
  AppliedCoupon 
} from './CartSummary';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { formatCurrency, cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these e-commerce components effectively.
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For Product Display:
 * - Use `ProductCard` for product catalogs and listings
 * - Supports grid, list, and compact layouts
 * - Built-in wishlist, ratings, and cart functionality
 * 
 * ### For Shopping Cart:
 * - Use `CartItem` for shopping cart display
 * - Supports quantity controls and variant display
 * - Built-in stock validation and pricing
 * 
 * ## Common Implementation Patterns
 * 
 * ### Product Grid:
 * ```tsx
 * <View style={styles.productGrid}>
 *   {products.map((product) => (
 *     <ProductCard
 *       key={product.id}
 *       product={product}
 *       onPress={() => navigateToProduct(product.id)}
 *       onAddToCart={() => addToCart(product.id)}
 *       onToggleWishlist={() => toggleWishlist(product.id)}
 *       layout="grid"
 *       showRating={true}
 *       showWishlist={true}
 *       width={(screenWidth - 48) / 2}
 *     />
 *   ))}
 * </View>
 * ```
 * 
 * ### Product List:
 * ```tsx
 * <FlatList
 *   data={products}
 *   renderItem={({ item }) => (
 *     <ProductCard
 *       product={item}
 *       onPress={() => navigateToProduct(item.id)}
 *       onAddToCart={() => addToCart(item.id)}
 *       layout="list"
 *       showRating={true}
 *       showVariants={true}
 *     />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 * 
 * ### Shopping Cart:
 * ```tsx
 * <FlatList
 *   data={cartItems}
 *   renderItem={({ item }) => (
 *     <CartItem
 *       item={item}
 *       onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
 *       onRemove={() => removeFromCart(item.id)}
 *       onSaveForLater={() => saveForLater(item.id)}
 *       showVariants={true}
 *       allowQuantityChange={true}
 *     />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 * 
 * ### Compact Product Display:
 * ```tsx
 * <ProductCard
 *   product={featuredProduct}
 *   layout="compact"
 *   showRating={false}
 *   showAddToCart={false}
 *   onPress={() => navigateToProduct(featuredProduct.id)}
 * />
 * ```
 * 
 * ## Data Structure Examples
 * 
 * ### Product Data:
 * ```typescript
 * const productData: Product = {
 *   id: 'prod_123',
 *   name: 'Premium Wireless Headphones',
 *   description: 'High-quality wireless headphones with noise cancellation',
 *   images: ['url1', 'url2', 'url3'],
 *   pricing: {
 *     current: 199.99,
 *     original: 249.99,
 *     currency: 'USD',
 *     discountPercentage: 20,
 *     onSale: true
 *   },
 *   rating: {
 *     average: 4.5,
 *     count: 1234
 *   },
 *   variants: [
 *     { id: 'color1', type: 'color', value: 'Black', color: '#000000', available: true },
 *     { id: 'color2', type: 'color', value: 'White', color: '#FFFFFF', available: true }
 *   ],
 *   badges: [
 *     { type: 'bestseller', label: 'Bestseller', icon: '🏆' }
 *   ],
 *   inStock: true,
 *   stockCount: 15,
 *   brand: 'TechBrand',
 *   shipping: {
 *     free: true,
 *     estimatedDays: 2
 *   }
 * };
 * ```
 * 
 * ### Cart Item Data:
 * ```typescript
 * const cartItemData: CartItemData = {
 *   id: 'cart_item_123',
 *   productId: 'prod_123',
 *   name: 'Premium Wireless Headphones',
 *   image: 'product_image_url',
 *   price: 199.99,
 *   originalPrice: 249.99,
 *   quantity: 2,
 *   maxQuantity: 5,
 *   currency: 'USD',
 *   variants: [
 *     { type: 'color', label: 'Color', value: 'Black' },
 *     { type: 'size', label: 'Size', value: 'Large' }
 *   ],
 *   inStock: true,
 *   stockCount: 15,
 *   shipping: {
 *     eligible: true,
 *     cost: 0,
 *     estimatedDays: 2
 *   },
 *   onSale: true,
 *   salePercentage: 20,
 *   removable: true,
 *   saveable: true
 * };
 * ```
 * 
 * ## Advanced Usage Patterns
 * 
 * ### Product Card with Custom Actions:
 * ```tsx
 * <ProductCard
 *   product={product}
 *   actionButtons={[
 *     {
 *       id: 'compare',
 *       label: 'Compare',
 *       icon: '⚖️',
 *       onPress: () => addToComparison(product.id),
 *       variant: 'outline'
 *     },
 *     {
 *       id: 'share',
 *       label: 'Share',
 *       icon: '📤',
 *       onPress: () => shareProduct(product.id),
 *       variant: 'ghost'
 *     }
 *   ]}
 * />
 * ```
 * 
 * ### Cart Item with Selection:
 * ```tsx
 * <CartItem
 *   item={cartItem}
 *   selected={selectedItems.includes(cartItem.id)}
 *   onSelectionChange={(selected) => handleSelection(cartItem.id, selected)}
 *   actionButtons={[
 *     {
 *       id: 'edit',
 *       label: 'Edit',
 *       icon: '✏️',
 *       onPress: () => editCartItem(cartItem.id)
 *     }
 *   ]}
 * />
 * ```
 */

/**
 * === VALIDATION UTILITIES ===
 * 
 * These utilities are commonly used with e-commerce components:
 * 
 * - `formatCurrency(amount: number, currency: string): string` - Format currency display
 * - `validateQuantity(quantity: number, min?: number, max?: number): boolean` - Validate quantity
 * - `calculateDiscount(original: number, current: number): number` - Calculate discount percentage
 */

/**
 * === STYLING SYSTEM ===
 * 
 * All components use the centralized design system:
 * 
 * - `COLORS` - Comprehensive color palette with semantic meanings
 * - `SPACING` - Consistent spacing scale (xs, sm, md, lg, xl, etc.)
 * - `TYPOGRAPHY` - Font sizes, weights, and line heights
 * 
 * Components accept custom styles via the `style` prop and can be
 * easily themed by modifying the constants file.
 */ 