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

export { default as ProductDetailsScreen } from './ProductDetailsScreen';
export type { 
  ProductDetailsScreenProps, 
  ProductDetailsScreenConfig, 
  ProductReview, 
  ProductSpecification, 
  ShippingInfo 
} from './ProductDetailsScreen';

export { default as CheckoutScreen } from './CheckoutScreen';
export type { 
  CheckoutScreenProps, 
  CheckoutScreenConfig, 
  CheckoutStep, 
  ShippingAddress, 
  PaymentMethod, 
  OrderData 
} from './CheckoutScreen';

export { default as WishlistScreen } from './WishlistScreen';
export type { 
  WishlistScreenProps, 
  WishlistScreenConfig, 
  WishlistItem, 
  WishlistMetadata, 
  WishlistFilter 
} from './WishlistScreen';

// === SHARED TYPES AND CONSTANTS ===
export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these e-commerce templates effectively.
 * 
 * ## Quick Template Selection Guide
 * 
 * ### For Product Shopping:
 * - Use `ShopScreen` for complete shopping experience
 * - Includes search, filters, categories, and product grid
 * - Built-in pagination and sorting
 * 
 * ### For Product Details:
 * - Use `ProductDetailsScreen` for individual product pages
 * - Includes image gallery, variants, reviews, and specifications
 * - Built-in add to cart and wishlist functionality
 * 
 * ### For Cart Management:
 * - Use `CartScreen` for shopping cart functionality
 * - Quantity controls, pricing calculations
 * - Checkout flow with validation
 * 
 * ### For Checkout Process:
 * - Use `CheckoutScreen` for complete purchase flow
 * - Multi-step process with shipping, payment, and confirmation
 * - Built-in form validation and order processing
 * 
 * ### For Wishlist Management:
 * - Use `WishlistScreen` for saved products
 * - Bulk actions, price alerts, and sharing functionality
 * - Integration with cart and product details
 * 
 * ## Complete E-commerce Flow Implementation
 * 
 * ### Product Discovery & Shopping:
 * ```tsx
 * // Main shop screen
 * <ShopScreen
 *   products={productList}
 *   onProductSelect={(product) => navigation.navigate('ProductDetails', { product })}
 *   onAddToCart={(product) => addToCart(product)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   config={{
 *     title: "Our Store",
 *     showSearch: true,
 *     showFilters: true,
 *     gridColumns: 2
 *   }}
 * />
 * 
 * // Product details screen
 * <ProductDetailsScreen
 *   product={selectedProduct}
 *   reviews={productReviews}
 *   relatedProducts={relatedProducts}
 *   specifications={productSpecs}
 *   onAddToCart={(product, variant, quantity) => addToCart(product, variant, quantity)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   onVariantSelect={(variant) => setSelectedVariant(variant)}
 *   config={{
 *     showReviews: true,
 *     showRelatedProducts: true,
 *     showSpecifications: true,
 *     enableImageZoom: true
 *   }}
 * />
 * ```
 * 
 * ### Shopping Cart & Checkout:
 * ```tsx
 * // Shopping cart screen
 * <CartScreen
 *   cartItems={cartItems}
 *   onQuantityChange={(id, qty) => updateQuantity(id, qty)}
 *   onRemoveItem={(id) => removeFromCart(id)}
 *   onCheckout={(items, summary) => navigation.navigate('Checkout', { items, summary })}
 *   taxRate={0.08}
 *   freeShippingThreshold={50}
 *   shippingOptions={shippingOptions}
 * />
 * 
 * // Multi-step checkout process
 * <CheckoutScreen
 *   cartItems={checkoutItems}
 *   shippingAddresses={userAddresses}
 *   paymentMethods={savedPaymentMethods}
 *   shippingOptions={availableShipping}
 *   onPlaceOrder={(orderData) => processOrder(orderData)}
 *   onUpdateShippingAddress={(address) => saveShippingAddress(address)}
 *   onSelectPaymentMethod={(method) => setPaymentMethod(method)}
 *   onApplyCoupon={(code) => applyCouponCode(code)}
 *   taxRate={0.08}
 *   config={{
 *     showProgress: true,
 *     enableGuestCheckout: true,
 *     showDeliveryEstimate: true
 *   }}
 * />
 * ```
 * 
 * ### Wishlist Management:
 * ```tsx
 * // Wishlist screen
 * <WishlistScreen
 *   wishlistItems={userWishlist}
 *   wishlistMetadata={wishlistInfo}
 *   onRemoveFromWishlist={(productId) => removeFromWishlist(productId)}
 *   onAddToCart={(product) => addToCart(product)}
 *   onProductPress={(product) => navigation.navigate('ProductDetails', { product })}
 *   onShareWishlist={() => shareWishlist()}
 *   onBulkAction={(action, productIds) => handleBulkAction(action, productIds)}
 *   config={{
 *     layout: 'grid',
 *     showSearch: true,
 *     showBulkActions: true,
 *     showPriceAlerts: true
 *   }}
 * />
 * ```
 * 
 * ## Navigation Integration
 * 
 * ### React Navigation Stack:
 * ```tsx
 * const ShopStack = createStackNavigator();
 * 
 * function ShopNavigator() {
 *   return (
 *     <ShopStack.Navigator screenOptions={{ headerShown: false }}>
 *       <ShopStack.Screen name="Shop" component={ShopScreen} />
 *       <ShopStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
 *       <ShopStack.Screen name="Cart" component={CartScreen} />
 *       <ShopStack.Screen name="Checkout" component={CheckoutScreen} />
 *       <ShopStack.Screen name="Wishlist" component={WishlistScreen} />
 *     </ShopStack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### Tab Navigation Integration:
 * ```tsx
 * const MainTabs = createBottomTabNavigator();
 * 
 * function MainNavigator() {
 *   return (
 *     <MainTabs.Navigator>
 *       <MainTabs.Screen name="Shop" component={ShopScreen} />
 *       <MainTabs.Screen 
 *         name="Cart" 
 *         component={CartScreen}
 *         options={{
 *           tabBarBadge: cartItemsCount > 0 ? cartItemsCount : undefined
 *         }}
 *       />
 *       <MainTabs.Screen name="Wishlist" component={WishlistScreen} />
 *     </MainTabs.Navigator>
 *   );
 * }
 * ```
 * 
 * ## State Management Integration
 * 
 * ### With Redux/Context:
 * ```tsx
 * // Cart management with Redux
 * function CartContainer() {
 *   const dispatch = useDispatch();
 *   const { items, loading, summary } = useSelector(state => state.cart);
 * 
 *   return (
 *     <CartScreen
 *       cartItems={items}
 *       loading={loading}
 *       onQuantityChange={(id, qty) => dispatch(updateCartItem({ id, quantity: qty }))}
 *       onRemoveItem={(id) => dispatch(removeCartItem(id))}
 *       onCheckout={(items, summary) => dispatch(initiateCheckout({ items, summary }))}
 *     />
 *   );
 * }
 * 
 * // Wishlist management with Context
 * function WishlistContainer() {
 *   const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
 *   const { addToCart } = useCart();
 * 
 *   return (
 *     <WishlistScreen
 *       wishlistItems={wishlist}
 *       onRemoveFromWishlist={removeFromWishlist}
 *       onAddToCart={addToCart}
 *       onBulkAction={handleBulkWishlistAction}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Advanced Configuration Examples
 * 
 * ### Customized Product Details:
 * ```tsx
 * <ProductDetailsScreen
 *   product={product}
 *   config={{
 *     showReviews: true,
 *     showRelatedProducts: true,
 *     showSpecifications: true,
 *     enableImageZoom: true,
 *     maxQuantity: 10,
 *     showStockCount: true,
 *     autoSelectVariant: true
 *   }}
 *   reviews={productReviews}
 *   relatedProducts={relatedProducts}
 *   specifications={[
 *     {
 *       category: 'Dimensions',
 *       items: [
 *         { label: 'Width', value: '10 cm' },
 *         { label: 'Height', value: '15 cm' }
 *       ]
 *     }
 *   ]}
 *   shippingInfo={{
 *     isFree: true,
 *     estimatedDays: 2,
 *     deliveryDate: 'Dec 25, 2023'
 *   }}
 * />
 * ```
 * 
 * ### Multi-step Checkout Configuration:
 * ```tsx
 * <CheckoutScreen
 *   cartItems={items}
 *   config={{
 *     showProgress: true,
 *     enableGuestCheckout: true,
 *     showDeliveryEstimate: true,
 *     showOrderNotes: true,
 *     requirePhone: true,
 *     enableBillingAddress: true,
 *     availablePaymentMethods: ['card', 'paypal', 'apple_pay'],
 *     autoAdvance: false
 *   }}
 *   shippingOptions={[
 *     {
 *       id: 'standard',
 *       name: 'Standard Shipping',
 *       description: '5-7 business days',
 *       cost: 5.99,
 *       estimatedDays: 6
 *     },
 *     {
 *       id: 'express',
 *       name: 'Express Shipping',
 *       description: '2-3 business days',
 *       cost: 12.99,
 *       estimatedDays: 2
 *     }
 *   ]}
 * />
 * ```
 * 
 * ### Advanced Wishlist Features:
 * ```tsx
 * <WishlistScreen
 *   wishlistItems={wishlistItems}
 *   config={{
 *     layout: 'grid',
 *     gridColumns: 2,
 *     showSearch: true,
 *     showFilters: true,
 *     showBulkActions: true,
 *     showPriceAlerts: true,
 *     enableMultipleWishlists: true,
 *     showRecentlyViewed: true,
 *     enableExport: true
 *   }}
 *   filters={[
 *     {
 *       key: 'priceRange',
 *       label: 'Price Range',
 *       type: 'range',
 *       value: [0, 1000]
 *     },
 *     {
 *       key: 'inStock',
 *       label: 'In Stock Only',
 *       type: 'toggle',
 *       value: false
 *     }
 *   ]}
 * />
 * ```
 */ 