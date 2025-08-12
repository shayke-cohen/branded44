/**
 * Wix API Clients - Domain-Organized Architecture
 * 
 * This file exports all Wix API clients organized by domain.
 * Each domain client handles its specific functionality while sharing
 * common authentication and request infrastructure.
 */

// === DOMAIN CLIENTS ===

import { wixEcommerceClient } from './wixEcommerceClient';
import { wixBookingApiClient } from '../wixBookingApiClient';
import { wixRestaurantSdkClient } from './wixRestaurantSdkClient';

export { wixEcommerceClient } from './wixEcommerceClient';
export { wixBookingApiClient } from '../wixBookingApiClient';
export { wixRestaurantSdkClient as wixRestaurantApiClient } from './wixRestaurantSdkClient';

// === SHARED TYPES ===

export type {
  WixProduct,
  WixCategory,
  WixCart,
  WixCartItem,
} from './wixEcommerceClient';

export type {
  WixService,
  WixServiceProvider,
  WixServiceCategory,
  WixBooking,
  WixBookingSlot,
  WixBookingRequest,
  WixAvailabilityQuery,
} from '../wixBookingApiClient';

export type {
  RestaurantMenu as WixMenu,
  MenuSection as WixMenuSection,
  MenuItem as WixMenuItem,
  ItemVariant as WixItemVariant,
  ItemLabel as WixItemLabel,
} from './wixRestaurantSdkClient';

export type { WixRestaurantAdapterContext } from './wixRestaurantAdapter';

// === SHARED UTILITIES ===

export { formatPrice, safeString } from './wixEcommerceClient';
export { 
  formatServicePrice, 
  formatServiceDuration 
} from '../wixBookingApiClient';
export { 
  formatRestaurantPrice, 
  safeRestaurantString,
  extractCurrency
} from './wixRestaurantApiClient';

// === ADAPTERS ===

export {
  adaptWixService,
  adaptWixServices,
  adaptWixServiceProvider,
  adaptWixSlotToTimeSlot,
  adaptGenericBookingToWix,
  adaptAvailabilityQuery,
  formatBookingStatus,
  getBookingStatusColor,
  canModifyBooking,
  canCancelBooking,
} from '../wixServiceAdapter';

export {
  adaptWixRestaurant,
  adaptWixRestaurantHeader,
  adaptWixMenuSection,
  adaptWixMenuItem,
  adaptWixVariantsToCustomizations,
  adaptWixLabelsToTags,
  adaptWixItemToOrderItem,
} from './wixRestaurantAdapter';

// === UNIFIED CLIENT (OPTIONAL) ===

/**
 * Unified Wix client that provides access to all domain clients
 * Use this when you need multiple domains in one place
 */
class WixUnifiedClient {
  readonly ecommerce = wixEcommerceClient;
  readonly booking = wixBookingApiClient;
  
  // Use getter for restaurant to support lazy initialization
  get restaurant() {
    return wixRestaurantSdkClient;
  }

  /**
   * Clear all caches across domains
   */
  async clearAllCaches(): Promise<void> {
    await Promise.all([
      this.ecommerce.clearCache(),
      this.booking.clearCache(),
      // Note: REST client doesn't have clearCache method yet
    ]);
    console.log('🗑️ [WIX UNIFIED] All domain caches cleared');
  }

  /**
   * Get cache info across all domains
   */
  async getAllCacheInfo(): Promise<{
    ecommerce: { products: boolean; collections: boolean };
    booking: { services: boolean; categories: boolean; providers: boolean };
    restaurant: { menus: boolean; sections: boolean; items: boolean };
  }> {
    const [ecommerceCache] = await Promise.all([
      this.ecommerce.getCacheInfo(),
      // REST client cache info would go here when implemented
    ]);

    return {
      ecommerce: ecommerceCache,
      booking: { services: false, categories: false, providers: false }, // Placeholder
      restaurant: { menus: false, sections: false, items: false }, // Placeholder for REST client
    };
  }

  /**
   * Get all site configuration
   */
  getSiteConfiguration() {
    return {
      siteId: this.ecommerce.getSiteId(),
      clientId: this.ecommerce.getClientId(),
      storesAppId: this.ecommerce.getStoresAppId(),
    };
  }
}

export const wixUnifiedClient = new WixUnifiedClient();

// === LEGACY COMPATIBILITY ===

/**
 * Legacy exports for backward compatibility
 * These maintain compatibility with existing code that imports from wixApiClient
 */
export const wixApiClient = {
  // E-commerce methods
  queryProducts: wixEcommerceClient.queryProducts.bind(wixEcommerceClient),
  getProduct: wixEcommerceClient.getProduct.bind(wixEcommerceClient),
  queryCategories: wixEcommerceClient.queryCategories.bind(wixEcommerceClient),
  getCurrentCart: wixEcommerceClient.getCurrentCart.bind(wixEcommerceClient),
  addToCart: wixEcommerceClient.addToCart.bind(wixEcommerceClient),
  updateCartItemQuantity: wixEcommerceClient.updateCartItemQuantity.bind(wixEcommerceClient),
  removeFromCart: wixEcommerceClient.removeFromCart.bind(wixEcommerceClient),
  createCheckout: wixEcommerceClient.createCheckout.bind(wixEcommerceClient),
  getOptimizedImageUrl: wixEcommerceClient.getOptimizedImageUrl.bind(wixEcommerceClient),
  clearCache: wixEcommerceClient.clearCache.bind(wixEcommerceClient),
  getCacheInfo: wixEcommerceClient.getCacheInfo.bind(wixEcommerceClient),
  getSiteId: wixEcommerceClient.getSiteId.bind(wixEcommerceClient),
  getClientId: wixEcommerceClient.getClientId.bind(wixEcommerceClient),
  getStoresAppId: wixEcommerceClient.getStoresAppId.bind(wixEcommerceClient),

  // Booking methods (new)
  queryServices: wixBookingApiClient.queryServices.bind(wixBookingApiClient),
  getService: wixBookingApiClient.getService.bind(wixBookingApiClient),
  queryServiceCategories: wixBookingApiClient.queryServiceCategories.bind(wixBookingApiClient),
  queryServiceProviders: wixBookingApiClient.queryServiceProviders.bind(wixBookingApiClient),
  getAvailableSlots: wixBookingApiClient.getAvailableSlots.bind(wixBookingApiClient),
  createBooking: wixBookingApiClient.createBooking.bind(wixBookingApiClient),
  getCustomerBookings: wixBookingApiClient.getCustomerBookings.bind(wixBookingApiClient),
  cancelBooking: wixBookingApiClient.cancelBooking.bind(wixBookingApiClient),
  rescheduleBooking: wixBookingApiClient.rescheduleBooking.bind(wixBookingApiClient),
};

console.log('🔗 [WIX] Unified Wix API clients loaded');
console.log('🛍️ [WIX] E-commerce client available');
console.log('📅 [WIX] Booking client available');
console.log('🍽️ [WIX] Restaurant client available');
console.log('🔄 [WIX] Legacy compatibility layer active');
