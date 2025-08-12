/**
 * Restaurant Blocks - AI-Optimized Component Library
 * 
 * A comprehensive collection of restaurant and food delivery components.
 * Perfect for building food ordering apps, restaurant discovery platforms,
 * and dining service applications.
 * 
 * @category Restaurant Blocks
 * @author AI Component System
 * @version 1.0.0
 */

// === COMPONENT EXPORTS ===

// Core Restaurant Components
export { default as MenuCard } from './MenuCard';
export { default as RestaurantCard } from './RestaurantCard';
export { default as OrderItemCard } from './OrderItemCard';
export { default as OrderSummary } from './OrderSummary';
export { default as RestaurantHeader } from './RestaurantHeader';
export { default as MenuCategoryHeader } from './MenuCategoryHeader';

// === TYPE EXPORTS ===

// MenuCard Types
export type {
  MenuCardProps,
  MenuItem,
  MenuCategory,
  DietaryTag,
  SpiceLevel,
  MenuItemPricing,
  NutritionInfo,
  CustomizationOption,
  MenuItemAction,
} from './MenuCard';

// RestaurantCard Types
export type {
  RestaurantCardProps,
  Restaurant,
  CuisineType,
  PriceRange,
  ServiceType,
  OperatingHours,
  DeliveryInfo,
  RestaurantLocation,
  RestaurantPromotion,
  RestaurantAction,
} from './RestaurantCard';

// OrderItemCard Types
export type {
  OrderItemCardProps,
  OrderItem,
  SelectedCustomization,
  OrderItemPricing,
  OrderItemAction,
} from './OrderItemCard';

// OrderSummary Types
export type {
  OrderSummaryProps,
  OrderSummaryData,
  TaxInfo,
  FeeInfo,
  DiscountInfo,
  TipInfo,
  PaymentMethodInfo,
  OrderSummaryAction,
  FeeType,
  DiscountType,
} from './OrderSummary';

// RestaurantHeader Types
export type {
  RestaurantHeaderProps,
  RestaurantHeaderData,
  HeaderAction,
  DayHours,
  ContactInfo,
} from './RestaurantHeader';

// MenuCategoryHeader Types
export type {
  MenuCategoryHeaderProps,
  MenuCategoryData,
  MenuCategoryType,
  CategoryAvailability,
  CategoryHeaderAction,
} from './MenuCategoryHeader';

// === UTILITY EXPORTS ===

export { cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these restaurant and food delivery components effectively.
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For Menu Display:
 * - Use `MenuCard` for individual food items with photos, pricing, and customization options
 * - Use `MenuCategoryHeader` for organizing menu sections (appetizers, mains, desserts, etc.)
 * - Both support dietary tags, allergen info, and availability status
 * 
 * ### For Restaurant Discovery:
 * - Use `RestaurantCard` for restaurant listings with cuisine, ratings, delivery info
 * - Use `RestaurantHeader` for detailed restaurant pages with hero images and contact info
 * - Perfect for restaurant discovery, search results, and featured restaurant displays
 * 
 * ### For Order Management:
 * - Use `OrderItemCard` for shopping cart items with quantity controls and customizations
 * - Use `OrderSummary` for checkout with pricing breakdown, taxes, fees, and payment info
 * - Supports complex pricing scenarios including tips, discounts, and multiple payment methods
 * 
 * ## Common Implementation Patterns
 * 
 * ### Restaurant Discovery Flow:
 * ```tsx
 * // Restaurant listing screen
 * <FlatList
 *   data={restaurants}
 *   renderItem={({ item }) => (
 *     <RestaurantCard
 *       restaurant={item}
 *       onPress={() => navigateToRestaurant(item.id)}
 *       onOrder={() => startOrder(item.id)}
 *       onFavorite={() => toggleFavorite(item.id)}
 *       showDeliveryInfo={true}
 *       showCuisines={true}
 *       showOrderButton={true}
 *     />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 * 
 * ### Restaurant Detail Page:
 * ```tsx
 * // Restaurant profile with hero section
 * <RestaurantHeader
 *   restaurant={restaurantData}
 *   onBack={() => navigation.goBack()}
 *   onFavorite={() => toggleFavorite(restaurantData.id)}
 *   onStartOrder={() => navigateToMenu(restaurantData.id)}
 *   onCall={() => Linking.openURL(`tel:${restaurantData.contact.phone}`)}
 *   onDirections={() => openMaps(restaurantData.location)}
 *   showContactOptions={true}
 *   showDeliveryInfo={true}
 * />
 * ```
 * 
 * ### Menu Display:
 * ```tsx
 * // Menu with categorized items
 * <ScrollView>
 *   {menuCategories.map((category) => (
 *     <View key={category.id}>
 *       <MenuCategoryHeader
 *         category={category}
 *         onPress={() => scrollToCategory(category.id)}
 *         showItemCount={true}
 *         showPriceRange={true}
 *         layout="standard"
 *       />
 *       
 *       {category.items.map((item) => (
 *         <MenuCard
 *           key={item.id}
 *           item={item}
 *           onPress={() => viewItemDetails(item.id)}
 *           onAddToCart={(quantity) => addToCart(item.id, quantity)}
 *           onFavorite={() => toggleFavorite(item.id)}
 *           showDietaryTags={true}
 *           showAddToCart={true}
 *           layout="list"
 *         />
 *       ))}
 *     </View>
 *   ))}
 * </ScrollView>
 * ```
 * 
 * ### Shopping Cart:
 * ```tsx
 * // Cart with order items and summary
 * <ScrollView>
 *   {cartItems.map((item) => (
 *     <OrderItemCard
 *       key={item.id}
 *       item={item}
 *       onQuantityChange={(qty) => updateQuantity(item.id, qty)}
 *       onRemove={() => removeFromCart(item.id)}
 *       onEditCustomizations={() => editItem(item.id)}
 *       showQuantityControls={true}
 *       showCustomizations={true}
 *       editable={true}
 *     />
 *   ))}
 *   
 *   <OrderSummary
 *     orderData={orderSummary}
 *     onApplyPromoCode={() => showPromoModal()}
 *     onEditTip={() => showTipModal()}
 *     showDetailedBreakdown={true}
 *     showPaymentMethods={true}
 *     actions={[
 *       {
 *         id: 'checkout',
 *         label: 'Place Order',
 *         onPress: () => proceedToCheckout(),
 *         variant: 'default'
 *       }
 *     ]}
 *   />
 * </ScrollView>
 * ```
 * 
 * ## Data Structure Examples
 * 
 * ### Restaurant Data:
 * ```typescript
 * const restaurantData: Restaurant = {
 *   id: 'rest_123',
 *   name: 'Mama Mia Pizzeria',
 *   description: 'Authentic Italian pizza made with fresh ingredients',
 *   images: ['restaurant_hero.jpg', 'interior.jpg'],
 *   logo: 'restaurant_logo.jpg',
 *   cuisines: ['italian', 'pizza'],
 *   priceRange: '$$',
 *   rating: 4.7,
 *   reviewCount: 345,
 *   location: {
 *     address: '123 Main Street, Downtown',
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
 *   hours: [...],
 *   serviceTypes: ['delivery', 'pickup']
 * };
 * ```
 * 
 * ### Menu Item Data:
 * ```typescript
 * const menuItem: MenuItem = {
 *   id: 'item_123',
 *   name: 'Margherita Pizza',
 *   description: 'Fresh mozzarella, tomato sauce, basil, and olive oil',
 *   category: 'mains',
 *   pricing: {
 *     basePrice: 16.99,
 *     currency: 'USD',
 *     sizeVariants: [
 *       { size: 'Small', price: 14.99 },
 *       { size: 'Medium', price: 16.99 },
 *       { size: 'Large', price: 19.99 }
 *     ]
 *   },
 *   images: ['pizza_margherita.jpg'],
 *   dietaryTags: ['vegetarian'],
 *   available: true,
 *   prepTime: 15,
 *   customizations: [
 *     {
 *       id: 'crust',
 *       name: 'Crust Type',
 *       type: 'single',
 *       required: true,
 *       choices: [
 *         { id: 'thin', name: 'Thin Crust' },
 *         { id: 'thick', name: 'Thick Crust', price: 2.00 }
 *       ]
 *     }
 *   ]
 * };
 * ```
 * 
 * ### Order Summary Data:
 * ```typescript
 * const orderSummary: OrderSummaryData = {
 *   itemsSubtotal: 42.50,
 *   discounts: [
 *     {
 *       type: 'promo-code',
 *       name: 'SAVE10',
 *       amount: -4.25,
 *       code: 'SAVE10'
 *     }
 *   ],
 *   fees: [
 *     {
 *       type: 'delivery',
 *       name: 'Delivery Fee',
 *       amount: 3.99
 *     },
 *     {
 *       type: 'service',
 *       name: 'Service Fee',
 *       amount: 2.50
 *     }
 *   ],
 *   taxes: [
 *     {
 *       name: 'Sales Tax',
 *       rate: 8.5,
 *       amount: 3.61,
 *       included: false
 *     }
 *   ],
 *   tip: {
 *     amount: 8.50,
 *     percentage: 20
 *   },
 *   total: 56.85,
 *   currency: 'USD',
 *   orderType: 'delivery',
 *   estimatedTime: { min: 25, max: 35, unit: 'minutes' }
 * };
 * ```
 * 
 * ## Advanced Usage Patterns
 * 
 * ### Dynamic Menu with Filters:
 * ```tsx
 * <MenuCategoryHeader
 *   category={category}
 *   onFilter={() => setActiveFilter(category.type)}
 *   isActive={activeFilter === category.type}
 *   showItemCount={true}
 *   showDietaryTags={true}
 *   layout="card"
 * />
 * ```
 * 
 * ### Restaurant Search Results:
 * ```tsx
 * <RestaurantCard
 *   restaurant={restaurant}
 *   onPress={() => viewRestaurant(restaurant.id)}
 *   onOrder={() => quickOrder(restaurant.id)}
 *   onDirections={() => getDirections(restaurant.location)}
 *   layout="list"
 *   showDistance={true}
 *   showPromotions={true}
 * />
 * ```
 * 
 * ### Order Customization:
 * ```tsx
 * <OrderItemCard
 *   item={cartItem}
 *   onEditCustomizations={() => showCustomizationModal(cartItem)}
 *   onAddInstructions={() => showInstructionsModal(cartItem)}
 *   showCustomizations={true}
 *   showPricingBreakdown={true}
 *   editable={true}
 * />
 * ```
 * 
 * ## Integration Patterns
 * 
 * ### State Management:
 * - Use React Context or Zustand for cart state management
 * - Implement optimistic updates for favorites and ratings
 * - Cache restaurant and menu data for offline access
 * 
 * ### Navigation:
 * - Deep link to specific restaurants and menu items
 * - Implement cart persistence across navigation
 * - Use modals for item customization and checkout flows
 * 
 * ### API Integration:
 * - Support for real-time menu updates and availability
 * - Integration with payment processors (Stripe, PayPal)
 * - Location-based restaurant discovery
 * - Order tracking and status updates
 * 
 * ### Wix API Compatibility:
 * - Components designed for future Wix Restaurants API integration
 * - Generic data interfaces that adapt to Wix response formats
 * - Adapter pattern ready for `wixRestaurantApiClient.ts`
 * - Compatible with existing Wix authentication flows
 * 
 * ## Complete Library Stats
 * - **6 Restaurant Block Components** for comprehensive food ordering experiences
 * - **100% TypeScript** with extensive type definitions for all restaurant scenarios
 * - **AI-Optimized** with detailed JSDoc documentation and usage examples
 * - **Production-Ready** with error handling, loading states, and accessibility
 * - **Flexible Layouts** supporting card, list, and compact display modes
 * - **Real-time Ready** with availability updates and order status tracking
 * - **Payment Ready** with comprehensive pricing breakdowns and fee handling
 * - **Multi-cuisine Support** with dietary tags and allergen information
 * - **Wix Integration Ready** with adapter pattern for future API integration
 */
