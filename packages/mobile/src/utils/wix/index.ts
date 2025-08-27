/**
 * Wix API Clients - Domain-Organized Architecture
 * 
 * This file exports all Wix API clients organized by domain.
 * Each domain client handles its specific functionality while sharing
 * common authentication and request infrastructure.
 * 
 * NEW: Includes feature toggles to disable SDK usage selectively.
 */

// === FEATURE FLAGS ===
export { featureManager, FEATURES } from '../../config/features';

// === DOMAIN CLIENTS ===

import { wixEcommerceClient } from './domains/wixEcommerceClient';
import { wixBookingClient } from './domains/wixBookingClient';
import { wixRestaurantClient } from './domains/wixRestaurantClient';

// NEW: Import the main orchestrating client
import { wixMainClient } from './domains/wixMainClient';

export { wixEcommerceClient } from './domains/wixEcommerceClient';
export { wixBookingClient } from './domains/wixBookingClient';
export { wixRestaurantClient } from './domains/wixRestaurantClient';

// === SHARED TYPES ===

export type {
  WixProduct,
  WixCategory,
  WixCart,
  WixCartItem,
} from './domains/wixEcommerceClient';

export type {
  WixService,
  WixServiceProvider,
  WixBooking,
  WixAvailabilityQuery,
  WixAvailabilitySlot,
} from './domains/wixBookingClient';

export type {
  WixMenu,
  WixMenuSection,
  WixMenuItem,
  WixItemVariant,
  WixItemLabel,
} from './domains/wixRestaurantClient';

export type { WixRestaurantAdapterContext } from './wixRestaurantAdapter';

// === SHARED UTILITIES ===

export { formatPrice, safeString } from './domains/wixEcommerceClient';
export { 
  formatServicePrice, 
  formatServiceDuration 
} from './domains/wixBookingClient';
export { 
  formatRestaurantPrice, 
  safeRestaurantString,
  extractCurrency
} from './domains/wixRestaurantClient';

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
  readonly booking = wixBookingClient;
  readonly restaurant = wixRestaurantClient;

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
 * Now uses the new orchestrating main client that supports feature toggles
 */
export const wixApiClient = wixMainClient;

// === MODERN EXPORTS ===

/**
 * New domain-specific exports for cleaner architecture
 */
export { wixMainClient };
export { wixAuthenticationClient } from './domains/wixAuthenticationClient';
export { wixCMSClient } from './domains/wixCMSClient';

// Domain clients are already exported above

console.log('🔗 [WIX] Unified Wix API clients loaded');
console.log('🛍️ [WIX] E-commerce client available');
console.log('📅 [WIX] Booking client available');
console.log('🍽️ [WIX] Restaurant client available');
console.log('🔄 [WIX] Legacy compatibility layer active');
