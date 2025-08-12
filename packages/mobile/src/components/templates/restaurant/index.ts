/**
 * Restaurant Templates - AI-Optimized Component Library
 * 
 * A comprehensive collection of restaurant and food delivery screen templates.
 * Perfect for building complete food ordering experiences with pre-built screens
 * that integrate seamlessly with restaurant blocks.
 * 
 * @category Restaurant Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === COMPONENT EXPORTS ===

// Core Restaurant Templates
export { default as MenuScreen } from './MenuScreen';
export { default as RestaurantDetailScreen } from './RestaurantDetailScreen';
export { default as OrderScreen } from './OrderScreen';
export { default as CheckoutScreen } from './CheckoutScreen';

// Wix-Enhanced Templates
export { default as WixMenuScreen } from './WixMenuScreen';
export { default as WixRestaurantDetailScreen } from './WixRestaurantDetailScreen';

// === TYPE EXPORTS ===

// MenuScreen Types
export type {
  MenuScreenProps,
  MenuScreenConfig,
  MenuScreenState,
  CartItem,
} from './MenuScreen';

// RestaurantDetailScreen Types
export type {
  RestaurantDetailScreenProps,
  RestaurantDetailScreenConfig,
  Review,
  OperatingHours,
  ContactInfo,
} from './RestaurantDetailScreen';

// OrderScreen Types
export type {
  OrderScreenProps,
  OrderScreenConfig,
  OrderScreenState,
  DeliveryOption,
  RecommendationItem,
} from './OrderScreen';

// CheckoutScreen Types
export type {
  CheckoutScreenProps,
  CheckoutScreenConfig,
  CheckoutScreenState,
  CheckoutStep,
  DeliveryTimeSlot,
  PaymentMethodOption,
} from './CheckoutScreen';

// Wix-Enhanced Template Types
export type { WixMenuScreenProps } from './WixMenuScreen';
export type { WixRestaurantDetailScreenProps } from './WixRestaurantDetailScreen';

// === UTILITY EXPORTS ===

export { cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these restaurant and food delivery screen templates effectively.
 * 
 * ## Quick Template Selection Guide
 * 
 * ### For Restaurant Discovery & Browsing:
 * - Use `RestaurantDetailScreen` for complete restaurant information pages
 * - Displays restaurant header, photos, menu highlights, reviews, and contact info
 * - Perfect for restaurant discovery apps and detailed restaurant profiles
 * 
 * ### For Menu Navigation & Food Selection:
 * - Use `MenuScreen` for categorized menu browsing with search and cart functionality
 * - Integrates RestaurantHeader, MenuCategoryHeader, and MenuCard components
 * - Supports filtering, search, favorites, and cart management
 * 
 * ### For Order Management:
 * - Use `OrderScreen` for cart review and order customization
 * - Displays order items with quantity controls and customization options
 * - Includes recommendations, delivery options, and order summary
 * 
 * ### For Payment & Order Completion:
 * - Use `CheckoutScreen` for multi-step checkout process
 * - Handles delivery details, payment processing, and order confirmation
 * - Supports time slot selection, special instructions, and order tracking
 * 
 * ## Complete Restaurant App Flow
 * 
 * ### 1. Restaurant Discovery Flow:
 * ```tsx
 * // Start with restaurant list (use existing templates)
 * <RestaurantListScreen /> 
 * 
 * // Navigate to detailed restaurant view
 * <RestaurantDetailScreen
 *   restaurant={selectedRestaurant}
 *   photos={restaurantPhotos}
 *   menuHighlights={popularItems}
 *   reviews={recentReviews}
 *   operatingHours={hours}
 *   onViewMenu={() => navigateToMenu(restaurant.id)}
 *   onStartOrder={() => navigateToMenu(restaurant.id)}
 *   onCallRestaurant={() => callRestaurant(restaurant.contact.phone)}
 *   config={{
 *     showGallery: true,
 *     showMenuHighlights: true,
 *     showReviews: true,
 *     showContactInfo: true
 *   }}
 * />
 * ```
 * 
 * ### 2. Menu Browsing & Item Selection:
 * ```tsx
 * <MenuScreen
 *   restaurant={restaurantData}
 *   menuCategories={categorizedMenuItems}
 *   cartItems={currentCartItems}
 *   onAddToCart={handleAddToCart}
 *   onMenuItemSelect={handleItemDetails}
 *   onToggleItemFavorite={handleToggleFavorite}
 *   onSearch={handleMenuSearch}
 *   onViewCart={() => navigateToOrder()}
 *   config={{
 *     showSearch: true,
 *     showRestaurantHeader: true,
 *     showCategoryHeaders: true,
 *     menuLayout: 'card',
 *     showCustomization: true
 *   }}
 * />
 * ```
 * 
 * ### 3. Order Review & Management:
 * ```tsx
 * <OrderScreen
 *   orderItems={cartItems}
 *   orderSummary={orderSummaryData}
 *   deliveryOptions={availableDeliveryOptions}
 *   recommendations={recommendedItems}
 *   onItemQuantityChange={handleQuantityUpdate}
 *   onRemoveItem={handleItemRemoval}
 *   onEditItemCustomization={handleCustomization}
 *   onProceedToCheckout={() => navigateToCheckout()}
 *   onContinueShopping={() => navigateToMenu()}
 *   config={{
 *     allowItemEditing: true,
 *     showRecommendations: true,
 *     showDeliveryOptions: true,
 *     showOrderSummary: true
 *   }}
 * />
 * ```
 * 
 * ### 4. Checkout & Payment:
 * ```tsx
 * <CheckoutScreen
 *   orderSummary={finalOrderSummary}
 *   deliveryTimeSlots={availableTimeSlots}
 *   paymentMethods={paymentOptions}
 *   defaultDeliveryAddress={userAddress}
 *   restaurantInfo={restaurant}
 *   onPlaceOrder={handleOrderPlacement}
 *   onBackToCart={() => navigateToOrder()}
 *   onOrderConfirmed={handleOrderConfirmation}
 *   config={{
 *     showDeliveryAddress: true,
 *     showPaymentForm: true,
 *     enableOrderScheduling: true,
 *     showOrderConfirmation: true
 *   }}
 * />
 * ```
 * 
 * ## Data Flow & State Management
 * 
 * ### Restaurant Data Structure:
 * ```typescript
 * const restaurantData: Restaurant = {
 *   id: 'rest_123',
 *   name: 'Bella Vista Italian',
 *   description: 'Authentic Italian cuisine',
 *   images: ['hero.jpg', 'interior.jpg'],
 *   logo: 'logo.jpg',
 *   cuisines: ['italian', 'pizza'],
 *   priceRange: '$$',
 *   rating: 4.7,
 *   reviewCount: 345,
 *   location: {
 *     address: '123 Main Street',
 *     city: 'New York',
 *     state: 'NY',
 *     distance: 0.8
 *   },
 *   delivery: {
 *     available: true,
 *     estimatedTime: 30,
 *     fee: 2.99,
 *     minimumOrder: 15.00
 *   },
 *   isOpen: true,
 *   serviceTypes: ['delivery', 'pickup']
 * };
 * ```
 * 
 * ### Menu Categories with Items:
 * ```typescript
 * const menuCategories = [
 *   {
 *     id: 'appetizers',
 *     name: 'Appetizers',
 *     type: 'appetizers',
 *     itemCount: 8,
 *     availability: { available: true },
 *     items: [
 *       {
 *         id: 'item_1',
 *         name: 'Bruschetta',
 *         description: 'Toasted bread with tomatoes and basil',
 *         category: 'appetizers',
 *         pricing: { basePrice: 8.99, currency: 'USD' },
 *         images: ['bruschetta.jpg'],
 *         dietaryTags: ['vegetarian'],
 *         available: true,
 *         prepTime: 10
 *       }
 *     ]
 *   }
 * ];
 * ```
 * 
 * ### Cart & Order Management:
 * ```typescript
 * // Cart Item with Customizations
 * const cartItem: OrderItem = {
 *   id: 'cart_item_1',
 *   menuItemId: 'item_1',
 *   name: 'Margherita Pizza (Large)',
 *   quantity: 2,
 *   customizations: [
 *     {
 *       optionId: 'size',
 *       optionName: 'Size',
 *       choiceId: 'large',
 *       choiceName: 'Large',
 *       additionalPrice: 3.00
 *     }
 *   ],
 *   pricing: {
 *     basePrice: 16.99,
 *     customizationTotal: 3.00,
 *     itemSubtotal: 19.99,
 *     lineTotal: 39.98,
 *     currency: 'USD'
 *   },
 *   available: true
 * };
 * 
 * // Order Summary
 * const orderSummary: OrderSummaryData = {
 *   itemsSubtotal: 39.98,
 *   discounts: [
 *     {
 *       type: 'promo-code',
 *       name: 'WELCOME20',
 *       amount: -8.00,
 *       code: 'WELCOME20'
 *     }
 *   ],
 *   fees: [
 *     { type: 'delivery', name: 'Delivery Fee', amount: 2.99 },
 *     { type: 'service', name: 'Service Fee', amount: 1.50 }
 *   ],
 *   taxes: [
 *     { name: 'Sales Tax', rate: 8.5, amount: 2.89, included: false }
 *   ],
 *   tip: { amount: 7.00, percentage: 20 },
 *   total: 46.36,
 *   currency: 'USD',
 *   orderType: 'delivery'
 * };
 * ```
 * 
 * ## Navigation Integration
 * 
 * ### React Navigation Setup:
 * ```tsx
 * // Stack Navigator for Restaurant Flow
 * const RestaurantStack = createStackNavigator();
 * 
 * function RestaurantStackScreen() {
 *   return (
 *     <RestaurantStack.Navigator screenOptions={{ headerShown: false }}>
 *       <RestaurantStack.Screen name="RestaurantList" component={RestaurantListScreen} />
 *       <RestaurantStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
 *       <RestaurantStack.Screen name="Menu" component={MenuScreen} />
 *       <RestaurantStack.Screen name="Order" component={OrderScreen} />
 *       <RestaurantStack.Screen name="Checkout" component={CheckoutScreen} />
 *     </RestaurantStack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### Deep Linking:
 * ```tsx
 * // Deep link configuration
 * const linking = {
 *   prefixes: ['myapp://'],
 *   config: {
 *     screens: {
 *       RestaurantDetail: 'restaurant/:restaurantId',
 *       Menu: 'restaurant/:restaurantId/menu',
 *       Order: 'order',
 *       Checkout: 'checkout'
 *     }
 *   }
 * };
 * ```
 * 
 * ## State Management Patterns
 * 
 * ### Context-Based State:
 * ```tsx
 * // Restaurant Order Context
 * const RestaurantOrderContext = createContext({
 *   currentRestaurant: null,
 *   cartItems: [],
 *   orderSummary: null,
 *   addToCart: () => {},
 *   updateQuantity: () => {},
 *   removeFromCart: () => {},
 *   clearCart: () => {},
 *   placeOrder: () => {}
 * });
 * 
 * // Usage in templates
 * const { cartItems, addToCart, orderSummary } = useContext(RestaurantOrderContext);
 * ```
 * 
 * ### Redux/Zustand Store:
 * ```tsx
 * // Store slice for restaurant orders
 * const useRestaurantStore = create((set, get) => ({
 *   restaurants: [],
 *   currentRestaurant: null,
 *   cartItems: [],
 *   orderHistory: [],
 *   favorites: new Set(),
 *   
 *   setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),
 *   addToCart: (item, quantity, customizations) => {
 *     // Add item to cart logic
 *   },
 *   updateCartItemQuantity: (itemId, quantity) => {
 *     // Update quantity logic
 *   },
 *   toggleFavorite: (itemId) => {
 *     // Toggle favorite logic
 *   }
 * }));
 * ```
 * 
 * ## API Integration Patterns
 * 
 * ### Restaurant Service Client:
 * ```tsx
 * class RestaurantApiClient {
 *   async getRestaurants(filters?: RestaurantFilters) {
 *     // Fetch restaurants with filters
 *   }
 *   
 *   async getRestaurantDetails(restaurantId: string) {
 *     // Get detailed restaurant info
 *   }
 *   
 *   async getMenuItems(restaurantId: string) {
 *     // Fetch menu items by category
 *   }
 *   
 *   async placeOrder(orderData: OrderData) {
 *     // Submit order to restaurant
 *   }
 *   
 *   async trackOrder(orderId: string) {
 *     // Get order status and tracking
 *   }
 * }
 * ```
 * 
 * ### Real-time Updates:
 * ```tsx
 * // WebSocket integration for order tracking
 * useEffect(() => {
 *   const ws = new WebSocket('wss://api.restaurant.com/orders');
 *   
 *   ws.onmessage = (event) => {
 *     const orderUpdate = JSON.parse(event.data);
 *     updateOrderStatus(orderUpdate);
 *   };
 *   
 *   return () => ws.close();
 * }, [orderId]);
 * ```
 * 
 * ## Advanced Features
 * 
 * ### Push Notifications:
 * ```tsx
 * // Order status notifications
 * const scheduleOrderNotifications = (orderId: string, estimatedTime: number) => {
 *   // Schedule notifications for order updates
 *   PushNotification.localNotificationSchedule({
 *     message: 'Your order is being prepared!',
 *     date: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
 *   });
 * };
 * ```
 * 
 * ### Offline Support:
 * ```tsx
 * // Cache restaurant data for offline viewing
 * const cacheRestaurantData = async (restaurant: Restaurant) => {
 *   await AsyncStorage.setItem(
 *     `restaurant_${restaurant.id}`,
 *     JSON.stringify(restaurant)
 *   );
 * };
 * ```
 * 
 * ### Analytics Integration:
 * ```tsx
 * // Track user interactions
 * const trackRestaurantView = (restaurantId: string) => {
 *   analytics.track('Restaurant Viewed', {
 *     restaurantId,
 *     timestamp: new Date().toISOString()
 *   });
 * };
 * 
 * const trackOrderPlaced = (orderData: OrderSummaryData) => {
 *   analytics.track('Order Placed', {
 *     total: orderData.total,
 *     itemCount: orderData.itemsSubtotal,
 *     paymentMethod: orderData.paymentMethods?.[0]?.type
 *   });
 * };
 * ```
 * 
 * ## Performance Optimization
 * 
 * ### Image Optimization:
 * ```tsx
 * // Lazy loading for restaurant images
 * const RestaurantImage = React.memo(({ source, style }) => (
 *   <Image
 *     source={source}
 *     style={style}
 *     resizeMode="cover"
 *     loadingIndicatorSource={require('./placeholder.jpg')}
 *   />
 * ));
 * ```
 * 
 * ### List Virtualization:
 * ```tsx
 * // For large menu lists
 * <FlatList
 *   data={menuItems}
 *   renderItem={({ item }) => <MenuCard item={item} />}
 *   removeClippedSubviews={true}
 *   maxToRenderPerBatch={10}
 *   windowSize={10}
 *   initialNumToRender={5}
 * />
 * ```
 * 
 * ## Future Wix Integration
 * 
 * The restaurant templates are designed for seamless Wix integration:
 * 
 * ### Wix Restaurants API Compatibility:
 * - Generic data interfaces easily adapt to Wix API responses
 * - Adapter pattern ready for `wixRestaurantApiClient.ts`
 * - Built-in support for Wix authentication flows
 * - Compatible with existing Wix member context
 * 
 * ### Integration Points:
 * ```tsx
 * // Future Wix integration
 * import { wixRestaurantApiClient } from '../../utils/wix';
 * 
 * const MenuScreenWithWix = () => {
 *   const { data: menuData } = useWixQuery(
 *     ['menu', restaurantId],
 *     () => wixRestaurantApiClient.getMenu(restaurantId)
 *   );
 *   
 *   return (
 *     <MenuScreen
 *       restaurant={menuData.restaurant}
 *       menuCategories={menuData.categories}
 *       onAddToCart={wixRestaurantApiClient.addToCart}
 *       // ... other props
 *     />
 *   );
 * };
 * ```
 * 
 * ## Complete Template Library Stats
 * - **4 Restaurant Screen Templates** for complete food ordering experiences
 * - **100% TypeScript** with comprehensive type definitions
 * - **AI-Optimized** with detailed JSDoc documentation and usage examples
 * - **Production-Ready** with error handling, loading states, and accessibility
 * - **Flexible Configuration** supporting various restaurant business models
 * - **Real-time Ready** with order tracking and live updates
 * - **Payment Integration Ready** with support for multiple payment methods
 * - **Multi-platform Support** optimized for both iOS and Android
 * - **Wix Integration Ready** with adapter pattern for future API integration
 */
