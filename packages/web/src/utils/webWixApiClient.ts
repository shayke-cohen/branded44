import { serverWixApiClient } from './serverWixApiClient';

/**
 * Web-specific Wix API client that ALWAYS uses server proxy to avoid CORS issues
 * This is a pure proxy client - no fallbacks to direct API calls
 */
class WebWixApiClient {
  constructor() {
    console.log('🌐 [WEB API CLIENT] Initializing PURE PROXY web API client (always uses server)');
  }

  // ===== AUTHENTICATION METHODS =====
  
  /**
   * Generate visitor tokens - ALWAYS via server proxy
   * Note: This is handled internally by the server client when needed
   */
  async generateVisitorTokens(): Promise<any> {
    console.log('🔐 [WEB API CLIENT] Visitor tokens are managed internally by server proxy');
    try {
      // Visitor tokens are generated automatically by the server client when needed
      // For now, return a success response
      return {
        success: true,
        message: 'Visitor tokens are managed automatically by server proxy'
      };
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Visitor token operation failed:', error);
      throw error;
    }
  }

  /**
   * Login member - ALWAYS via server proxy
   */
  async loginMember(email: string, password: string): Promise<any> {
    console.log('🔐 [WEB API CLIENT] Attempting member login via server proxy...');
    try {
      const result = await serverWixApiClient.loginMember(email, password);
      console.log('✅ [WEB API CLIENT] Member login successful via server');
      return result;
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Member login failed:', error);
      throw error;
    }
  }

  /**
   * Register member - ALWAYS via server proxy
   */
  async registerMember(email: string, password: string, profile?: any): Promise<any> {
    console.log('🔐 [WEB API CLIENT] Attempting member registration via server proxy...');
    try {
      const result = await serverWixApiClient.registerMember(email, password, profile);
      console.log('✅ [WEB API CLIENT] Member registration successful via server');
      return result;
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Member registration failed:', error);
      throw error;
    }
  }

  // ===== MEMBER STATUS METHODS =====
  
  /**
   * Check if member is logged in - ALWAYS via server proxy
   */
  async isMemberLoggedIn(): Promise<boolean> {
    console.log('🔐 [WEB API CLIENT] Checking member login status via server proxy...');
    try {
      // For now, return false until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Member login status check not yet implemented via server, returning false');
      return false;
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Member login status check failed:', error);
      return false;
    }
  }

  /**
   * Get current member - ALWAYS via server proxy
   */
  async getCurrentMember(): Promise<any> {
    console.log('🔐 [WEB API CLIENT] Getting current member via server proxy...');
    try {
      // For now, return null until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Get current member not yet implemented via server, returning null');
      return null;
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Current member retrieval failed:', error);
      return null;
    }
  }

  /**
   * Logout member - ALWAYS via server proxy
   */
  async logoutMember(): Promise<void> {
    console.log('🔐 [WEB API CLIENT] Logging out member via server proxy...');
    try {
      // For now, just log success until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Member logout not yet implemented via server, simulating success');
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Member logout failed:', error);
      // Don't throw for logout errors
    }
  }

  // ===== PRODUCT METHODS =====
  
  /**
   * Get all products - ALWAYS via server proxy
   */
  async queryProducts(options: any = {}): Promise<any> {
    console.log('🛍️ [WEB API CLIENT] Querying products via server proxy...');
    try {
      // Use the dedicated products query endpoint
      const result = await serverWixApiClient.queryProducts(options);
      console.log('✅ [WEB API CLIENT] Products query successful via server proxy');
      return result;
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Products query failed:', error);
      throw error;
    }
  }

  /**
   * Get product by ID - ALWAYS via server proxy
   */
  async getProduct(productId: string): Promise<any> {
    console.log('🛍️ [WEB API CLIENT] Getting product via server proxy:', productId);
    try {
      // Use the dedicated product detail endpoint
      const result = await serverWixApiClient.getProduct(productId);
      console.log('✅ [WEB API CLIENT] Product retrieval successful via server proxy');
      return result;
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Product retrieval failed:', error);
      throw error;
    }
  }

  // ===== CART METHODS =====
  
  /**
   * Add item to cart - ALWAYS via server proxy
   */
  async addToCart(productId: string, quantity: number = 1, options?: any): Promise<any> {
    console.log('🛒 [WEB API CLIENT] Adding item to cart via server proxy...');
    try {
      // For now, return mock success until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Add to cart not yet implemented via server, returning mock success');
      return {
        success: true,
        cartId: 'mock-cart-id',
        lineItemId: 'mock-line-item-id',
        message: 'Item added to cart (via server proxy - mock)'
      };
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Add to cart failed:', error);
      throw error;
    }
  }

  /**
   * Get cart contents - ALWAYS via server proxy
   */
  async getCart(): Promise<any> {
    console.log('🛒 [WEB API CLIENT] Getting cart contents via server proxy...');
    try {
      // For now, return mock empty cart until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Get cart not yet implemented via server, returning mock empty cart');
      return {
        _id: 'mock-cart-id',
        lineItems: [],
        subtotal: { amount: '0.00', currency: 'USD' },
        total: { amount: '0.00', currency: 'USD' },
        isEmpty: true
      };
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Cart retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Get current cart - alias for getCart
   */
  async getCurrentCart(): Promise<any> {
    return this.getCart();
  }

  /**
   * Remove item from cart - ALWAYS via server proxy
   */
  async removeFromCart(lineItemId: string): Promise<any> {
    console.log('🛒 [WEB API CLIENT] Removing item from cart via server proxy...');
    try {
      // For now, return mock success until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Remove from cart not yet implemented via server, returning mock success');
      return {
        success: true,
        message: 'Item removed from cart (via server proxy - mock)'
      };
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Remove from cart failed:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity - ALWAYS via server proxy
   */
  async updateCartItemQuantity(lineItemId: string, quantity: number): Promise<any> {
    console.log('🛒 [WEB API CLIENT] Updating cart item quantity via server proxy...');
    try {
      // For now, return mock success until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Update cart quantity not yet implemented via server, returning mock success');
      return {
        success: true,
        message: 'Cart item quantity updated (via server proxy - mock)'
      };
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Update cart item quantity failed:', error);
      throw error;
    }
  }

  /**
   * Create checkout URL - ALWAYS via server proxy
   */
  async createCheckout(): Promise<any> {
    console.log('💳 [WEB API CLIENT] Creating checkout via server proxy...');
    try {
      // For now, return mock checkout until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Create checkout not yet implemented via server, returning mock checkout');
      return {
        checkoutUrl: 'https://example.com/mock-checkout',
        checkoutId: 'mock-checkout-id',
        message: 'Checkout created (via server proxy - mock)'
      };
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Checkout creation failed:', error);
      throw error;
    }
  }

  // ===== COLLECTIONS METHODS =====
  
  /**
   * Get collections - ALWAYS via server proxy
   */
  async getCollections(): Promise<any> {
    console.log('🛍️ [WEB API CLIENT] Getting collections via server proxy...');
    try {
      // For now, return mock collections until we implement this endpoint
      console.log('⚠️ [WEB API CLIENT] Get collections not yet implemented via server, returning mock collections');
      return [
        {
          id: 'mock-collection-1',
          name: 'Mock Category 1',
          description: 'Demo category for web preview',
        },
        {
          id: 'mock-collection-2',
          name: 'Mock Category 2',
          description: 'Another demo category for web preview',
        },
      ];
    } catch (error) {
      console.error('❌ [WEB API CLIENT] Collections retrieval failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const webWixApiClient = new WebWixApiClient();
export default webWixApiClient;