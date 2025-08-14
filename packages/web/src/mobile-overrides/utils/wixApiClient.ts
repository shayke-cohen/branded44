/**
 * Web override for mobile wixApiClient
 * This file replaces the mobile wixApiClient when running on web
 * It uses the server proxy for all API calls to avoid CORS issues
 */

import { serverWixApiClient } from '../../utils/serverWixApiClient';
import type { 
  WixProduct, 
  WixCategory, 
  WixCart, 
  WixCartItem,
  WixService,
  WixServiceProvider,
  WixBooking,
  WixAvailabilitySlot,
  WixMember,
  MemberTokens,
  VisitorTokens
} from '@mobile/utils/wixApiClient';

/**
 * Web-specific Wix API client that uses server proxy for all operations
 * This maintains the same interface as the mobile client but routes everything through the server
 */
class WebWixApiClient {
  // Configuration properties (for compatibility)
  public siteId: string;
  public clientId: string;
  public storesAppId: string;

  constructor() {
    console.log('🚨🚨🚨 [WEB API CLIENT] *** USING WEB OVERRIDE WITH SERVER PROXY *** 🚨🚨🚨');
    console.log('🚨🚨🚨 [WEB API CLIENT] This should appear in browser console if override is working 🚨🚨🚨');
    console.log('🚨🚨🚨 [WEB API CLIENT] If you see direct Wix API calls, the override is NOT working! 🚨🚨🚨');
    
    // For web, we don't need these directly since we use server proxy
    // The server handles all Wix API authentication and configuration
    this.siteId = '';
    this.clientId = '';
    this.storesAppId = '';
  }

  // ===== PRODUCT METHODS =====
  
  async queryProducts(options: any = {}): Promise<{ products: WixProduct[]; totalCount: number }> {
    console.log('🛍️ [WEB API] Querying products via server proxy...');
    try {
      const result = await serverWixApiClient.queryProducts(options);
      console.log('✅ [WEB API] Products fetched successfully:', result.products?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ [WEB API] Failed to query products:', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<WixProduct | null> {
    console.log('🛍️ [WEB API] Getting product via server proxy:', productId);
    return await serverWixApiClient.getProduct(productId);
  }

  async queryCategories(options: any = {}): Promise<{ categories: WixCategory[]; totalCount: number }> {
    console.log('📂 [WEB API] Querying categories via server proxy...');
    // TODO: Implement categories endpoint in server
    return { categories: [], totalCount: 0 };
  }

  // ===== CART METHODS =====
  
  async getCurrentCart(): Promise<WixCart | null> {
    console.log('🛒 [WEB API] Getting current cart via server proxy...');
    try {
      // TODO: Implement cart endpoint in server
      return null;
    } catch (error) {
      console.error('❌ [WEB API] Failed to get cart:', error);
      return null;
    }
  }

  async addToCart(items: WixCartItem[]): Promise<WixCart> {
    console.log('🛒 [WEB API] Adding to cart via server proxy...', items.length, 'items');
    try {
      // TODO: Implement add to cart endpoint in server
      // For now, return a mock cart
      return {
        id: 'web-cart-' + Date.now(),
        lineItems: items.map((item, index) => ({
          id: 'line-item-' + index,
          quantity: item.quantity,
          catalogReference: item.catalogReference,
          price: {
            amount: '0',
            currency: 'USD'
          },
          productName: 'Product'
        })),
        totals: {
          subtotal: '0',
          total: '0',
          currency: 'USD'
        }
      };
    } catch (error) {
      console.error('❌ [WEB API] Failed to add to cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(lineItemId: string, quantity: number): Promise<WixCart> {
    console.log('🛒 [WEB API] Updating cart item quantity via server proxy...');
    // TODO: Implement update cart endpoint in server
    throw new Error('Update cart item not yet implemented for web');
  }

  async removeFromCart(lineItemIds: string[]): Promise<WixCart> {
    console.log('🛒 [WEB API] Removing from cart via server proxy...');
    // TODO: Implement remove from cart endpoint in server
    throw new Error('Remove from cart not yet implemented for web');
  }

  // ===== SERVICE METHODS (for booking) =====
  
  async queryServices(options: any = {}): Promise<{ services: WixService[]; totalCount: number }> {
    console.log('🔧 [WEB API] Querying services via server proxy...');
    // TODO: Implement services endpoint in server
    return { services: [], totalCount: 0 };
  }

  async getService(serviceId: string): Promise<WixService | null> {
    console.log('🔧 [WEB API] Getting service via server proxy:', serviceId);
    // TODO: Implement service endpoint in server
    return null;
  }

  // ===== UTILITY METHODS =====
  
  getSiteId(): string {
    return this.siteId;
  }

  getClientId(): string {
    return this.clientId;
  }

  getStoresAppId(): string {
    return this.storesAppId;
  }

  async clearCache(): Promise<void> {
    console.log('🧹 [WEB API] Cache clearing not needed for web (server handles caching)');
  }

  getCacheInfo(): any {
    return { message: 'Web client uses server-side caching' };
  }

  // ===== AUTHENTICATION METHODS (simplified for web) =====
  
  async generateVisitorTokens(): Promise<VisitorTokens | null> {
    console.log('🔐 [WEB API] Visitor tokens handled by server proxy');
    return null;
  }

  async loginMember(email: string, password: string): Promise<MemberTokens | null> {
    console.log('👤 [WEB API] Member login handled by server proxy');
    // TODO: Implement member login via server
    return null;
  }

  async getCurrentMember(): Promise<WixMember | null> {
    console.log('👤 [WEB API] Getting current member via server proxy');
    // TODO: Implement get member via server
    return null;
  }

  async isMemberLoggedIn(): Promise<boolean> {
    console.log('👤 [WEB API] Checking member login status via server proxy');
    // TODO: Implement member login check via server
    return false;
  }

  async logoutMember(): Promise<void> {
    console.log('👤 [WEB API] Logging out member via server proxy');
    // TODO: Implement member logout via server
  }

  // ===== IMAGE OPTIMIZATION =====
  
  getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    if (!originalUrl) return '';
    
    // For web, we can use Wix's image optimization directly
    if (width || height) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('fit', 'crop');
      
      return `${originalUrl}?${params.toString()}`;
    }
    
    return originalUrl;
  }
}

// Create and export the web API client instance
export const wixApiClient = new WebWixApiClient();

// Export types for compatibility
export type {
  WixProduct,
  WixCategory,
  WixCart,
  WixCartItem,
  WixService,
  WixServiceProvider,
  WixBooking,
  WixAvailabilitySlot,
  WixMember,
  MemberTokens,
  VisitorTokens
};

// Default export for compatibility
export default wixApiClient;

console.log('🌐 [WEB API CLIENT] Web API client initialized with server proxy routing');
