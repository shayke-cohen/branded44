/**
 * Wix E-commerce API Client
 * 
 * Extracted from main wixApiClient for better organization and maintainability.
 * Handles all e-commerce related operations: products, cart, checkout, orders.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId, getSiteId, getStoresAppId, getApiBaseUrl } from '../../config/wixConfig';
import { createClient, OAuthStrategy } from '@wix/sdk';
// SDK imports removed - using REST API fallback only  
// import { currentCart } from '@wix/ecom';
// import { redirects } from '@wix/redirects';

// === TYPES ===

export interface WixProduct {
  id: string;
  name: string;
  description?: string;
  priceData?: {
    currency: string;
    price: number;
    discountedPrice?: number;
    formatted?: {
      price: string;
      discountedPrice: string;
    };
  };
  price?: {
    currency: string;
    price: string;
    discountedPrice?: string;
  };
  media?: {
    mainMedia?: {
      image?: {
        url: string;
        width?: number;
        height?: number;
      };
      url?: string;
    };
    items?: Array<{
      image?: {
        url: string;
        width?: number;
        height?: number;
      };
      url?: string;
    }>;
  } | Array<{
    id: string;
    url: string;
    altText?: string;
  }>;
  stock?: {
    inventoryStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PARTIALLY_OUT_OF_STOCK';
    inStock?: boolean;
    quantity?: number;
    trackInventory?: boolean;
  };
  options?: Array<{
    id: string;
    name: string;
    choices: Array<{
      id: string;
      value: string;
      inStock: boolean;
    }>;
  }>;
  visible: boolean;
  inStock?: boolean;
  categoryIds?: string[];
  lastUpdated?: string;
  createdDate?: string;
  slug?: string;
  ribbon?: string;
}

export interface WixCategory {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  slug?: string;
  numberOfProducts?: number;
  media?: {
    mainMedia?: {
      image?: {
        url: string;
        width?: number;
        height?: number;
      };
    };
  };
}

export interface WixCartItem {
  catalogReference: {
    appId: string;
    catalogItemId: string;
    options?: Record<string, string>;
  };
  quantity: number;
}

export interface WixCart {
  id: string;
  lineItems: Array<{
    id: string;
    quantity: number;
    catalogReference?: {
      appId: string;
      catalogItemId: string;
    };
    price: {
      amount: string;
      currency: string;
    };
    productName?: {
      original: string;
    };
  }>;
  totals: {
    subtotal: string;
    total: string;
    currency: string;
  };
  buyerInfo?: {
    visitorId?: string;
    memberId?: string;
  };
}

// === CACHE CONFIGURATION ===

const ECOMMERCE_CACHE_KEYS = {
  PRODUCTS: 'wix_products_cache',
  COLLECTIONS: 'wix_collections_cache',
  PRODUCTS_TIMESTAMP: 'wix_products_timestamp',
  COLLECTIONS_TIMESTAMP: 'wix_collections_timestamp',
};

const ECOMMERCE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// === WIX E-COMMERCE CLIENT ===

class WixEcommerceClient {
  private baseURL = getApiBaseUrl();
  private siteId = getSiteId();
  private storesAppId = getStoresAppId();
  private clientId = getClientId();
  private wixClient: any = null;

  constructor() {
    console.log('🛍️ [ECOMMERCE] WixEcommerceClient initialized');
    this.initializeWixClient();
  }

  private initializeWixClient(): void {
    try {
      this.wixClient = createClient({
        modules: {
          currentCart,
          redirects,
        },
        auth: OAuthStrategy({
          clientId: this.clientId,
        }),
      });
      console.log('✅ [ECOMMERCE] Wix SDK client initialized');
    } catch (error) {
      console.error('❌ [ECOMMERCE] Failed to initialize Wix SDK client:', error);
    }
  }

  // === CACHE HELPERS ===

  private async isCacheValid(timestampKey: string): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem(timestampKey);
      if (!timestamp) return false;
      
      const cacheAge = Date.now() - parseInt(timestamp);
      return cacheAge < ECOMMERCE_CACHE_DURATION;
    } catch {
      return false;
    }
  }

  private async getCachedData<T>(cacheKey: string, timestampKey: string): Promise<T | null> {
    try {
      if (await this.isCacheValid(timestampKey)) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          console.log(`✅ [ECOMMERCE CACHE] Using cached data for ${cacheKey}`);
          return JSON.parse(cached);
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private async setCachedData(cacheKey: string, timestampKey: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(timestampKey, Date.now().toString());
      console.log(`💾 [ECOMMERCE CACHE] Stored data in cache: ${cacheKey}`);
    } catch (err) {
      console.warn('⚠️ [ECOMMERCE CACHE] Error storing cache:', err);
    }
  }

  // === REQUEST HELPER ===

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // This should use the authentication from the main API client
    // For now, we'll use a simplified version
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    console.log(`🌐 [ECOMMERCE API] ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [ECOMMERCE API ERROR] ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ [ECOMMERCE API SUCCESS] ${endpoint}`);
    return data;
  }

  // === PRODUCTS API ===

  async queryProducts(filters?: {
    categoryIds?: string[];
    visible?: boolean;
    inStock?: boolean;
    searchQuery?: string;
    limit?: number;
    cursor?: string;
    sort?: string;
    forceRefresh?: boolean;
  }): Promise<{ products: WixProduct[]; metaData?: any }> {
    
    // Check cache first for basic queries
    const isBasicQuery = !filters?.categoryIds?.length && !filters?.searchQuery && !filters?.sort;
    
    if (isBasicQuery && !filters?.forceRefresh) {
      const cached = await this.getCachedData<{ products: WixProduct[]; metaData?: any }>(
        ECOMMERCE_CACHE_KEYS.PRODUCTS, 
        ECOMMERCE_CACHE_KEYS.PRODUCTS_TIMESTAMP
      );
      if (cached) return cached;
    }

    if (filters?.forceRefresh) {
      console.log('🔄 [ECOMMERCE] Bypassing cache and fetching fresh data');
    }
    
    // Use Catalog V1 endpoint
    const endpoint = `/stores-reader/v1/products/query`;
    
    const requestBody: any = {
      query: {
        paging: {
          limit: filters?.limit || 50,
          offset: 0
        }
      },
      includeVariants: true
    };

    // Add filter for visible products
    if (filters?.visible !== false) {
      requestBody.query.filter = '{"visible": "true"}';
    }

    // Add sort parameter if provided
    if (filters?.sort) {
      try {
        const sortObj = JSON.parse(filters.sort);
        const sortString = `[${JSON.stringify(sortObj)}]`;
        requestBody.query.sort = sortString;
        console.log('🔄 [ECOMMERCE SORT] Applied sort:', sortString);
      } catch (err) {
        console.warn('⚠️ [ECOMMERCE SORT] Invalid sort format:', filters.sort);
      }
    }

    console.log('🛍️ [ECOMMERCE] Request body:', JSON.stringify(requestBody, null, 2));

    const result = await this.makeRequest<{ products: WixProduct[]; metaData?: any }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    // Cache the result if it's a basic query
    if (isBasicQuery && result) {
      await this.setCachedData(ECOMMERCE_CACHE_KEYS.PRODUCTS, ECOMMERCE_CACHE_KEYS.PRODUCTS_TIMESTAMP, result);
    }

    return result;
  }

  async getProduct(productId: string): Promise<WixProduct> {
    const endpoint = `/stores-reader/v1/products/${productId}`;
    const response = await this.makeRequest<{ product: WixProduct }>(endpoint);
    return response.product;
  }

  // === CATEGORIES API ===

  async queryCategories(forceRefresh = false): Promise<{ categories: WixCategory[] }> {
    try {
      if (!forceRefresh) {
        const cached = await this.getCachedData<{ categories: WixCategory[] }>(
          ECOMMERCE_CACHE_KEYS.COLLECTIONS, 
          ECOMMERCE_CACHE_KEYS.COLLECTIONS_TIMESTAMP
        );
        if (cached) return cached;
      }

      console.log('📂 [ECOMMERCE] Loading collections from V1 API...');
      const endpoint = '/stores-reader/v1/collections/query';
      const requestBody = {
        query: {
          paging: { limit: 100, offset: 0 },
          filter: '{"visible": "true"}'
        }
      };
      
      const response = await this.makeRequest<{ collections: any[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      // Convert collections to categories format
      const categories = (response.collections || []).map(collection => ({
        id: collection.id,
        name: collection.name || 'Unnamed Collection',
        description: collection.description,
        visible: collection.visible !== false,
        slug: collection.slug
      }));
      
      const result = { categories };
      await this.setCachedData(ECOMMERCE_CACHE_KEYS.COLLECTIONS, ECOMMERCE_CACHE_KEYS.COLLECTIONS_TIMESTAMP, result);
      
      console.log(`✅ [ECOMMERCE] Loaded ${categories.length} collections as categories`);
      return result;
    } catch (error) {
      console.warn('⚠️ [ECOMMERCE] Failed to load collections:', error);
      return { categories: [] };
    }
  }

  // === CART API ===

  async getCurrentCart(): Promise<WixCart | null> {
    try {
      if (!this.wixClient) {
        console.error('❌ [ECOMMERCE CART] Wix SDK client not initialized');
        return null;
      }

      console.log('🛒 [ECOMMERCE] Getting current cart...');
      const cart = await this.wixClient.currentCart.getCurrentCart();
      
      if (cart) {
        // Convert to our cart format
        return {
          id: cart._id || '',
          lineItems: cart.lineItems?.map((item: any) => ({
            id: item._id || '',
            quantity: item.quantity || 0,
            catalogReference: item.catalogReference,
            price: {
              amount: item.price?.amount?.toString() || '0',
              currency: item.price?.currency || 'USD',
            },
            productName: item.productName,
          })) || [],
          totals: {
            subtotal: cart.priceSummary?.subtotal?.amount?.toString() || '0',
            total: cart.priceSummary?.total?.amount?.toString() || '0',
            currency: cart.currency || 'USD',
          },
          buyerInfo: cart.buyerInfo,
        } as WixCart;
      }
      
      return null;
    } catch (error: any) {
      if (error?.message?.includes('OWNED_CART_NOT_FOUND') || 
          error?.message?.includes('Cart not found')) {
        console.log('ℹ️ [ECOMMERCE CART] No current cart found');
        return null;
      }
      
      console.warn('⚠️ [ECOMMERCE CART] Error getting current cart:', error);
      return null;
    }
  }

  async addToCart(items: WixCartItem[]): Promise<WixCart> {
    try {
      if (!this.wixClient) {
        throw new Error('Wix SDK client not initialized');
      }

      const lineItems = items.map(item => ({
        catalogReference: {
          appId: this.storesAppId,
          catalogItemId: item.catalogReference.catalogItemId,
          options: item.catalogReference.options || {}
        },
        quantity: item.quantity
      }));

      console.log('🛒 [ECOMMERCE] Adding items to cart:', lineItems.length);
      
      const response = await this.wixClient.currentCart.addToCurrentCart({ 
        lineItems: lineItems 
      });
      const cart = response.cart;

      // Convert to our cart format
      return {
        id: cart._id || '',
        lineItems: cart.lineItems?.map((item: any) => ({
          id: item._id || '',
          quantity: item.quantity || 0,
          catalogReference: item.catalogReference,
          price: {
            amount: item.price?.amount?.toString() || '0',
            currency: item.price?.currency || 'USD',
          },
          productName: item.productName,
        })) || [],
        totals: {
          subtotal: cart.priceSummary?.subtotal?.amount?.toString() || '0',
          total: cart.priceSummary?.total?.amount?.toString() || '0',
          currency: cart.currency || 'USD',
        },
        buyerInfo: cart.buyerInfo,
      } as WixCart;
    } catch (error) {
      console.error('❌ [ECOMMERCE] Failed to add to cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(lineItemId: string, quantity: number): Promise<WixCart> {
    try {
      if (!this.wixClient) {
        throw new Error('Wix SDK client not initialized');
      }

      console.log('🛒 [ECOMMERCE] Updating cart item quantity...');
      const response = await this.wixClient.currentCart.updateCurrentCartLineItemQuantity([
        { _id: lineItemId, quantity }
      ]);
      const cart = response.cart;

      // Convert to our cart format
      return {
        id: cart._id || '',
        lineItems: cart.lineItems?.map((item: any) => ({
          id: item._id || '',
          quantity: item.quantity || 0,
          catalogReference: item.catalogReference,
          price: {
            amount: item.price?.amount?.toString() || '0',
            currency: item.price?.currency || 'USD',
          },
          productName: item.productName,
        })) || [],
        totals: {
          subtotal: cart.priceSummary?.subtotal?.amount?.toString() || '0',
          total: cart.priceSummary?.total?.amount?.toString() || '0',
          currency: cart.currency || 'USD',
        },
        buyerInfo: cart.buyerInfo,
      } as WixCart;
    } catch (error) {
      console.error('❌ [ECOMMERCE] Failed to update cart item:', error);
      throw error;
    }
  }

  async removeFromCart(lineItemIds: string[]): Promise<WixCart> {
    try {
      if (!this.wixClient) {
        throw new Error('Wix SDK client not initialized');
      }

      console.log('🛒 [ECOMMERCE] Removing items from cart...');
      const response = await this.wixClient.currentCart.removeLineItemsFromCurrentCart(lineItemIds);
      const cart = response.cart;

      // Convert to our cart format
      return {
        id: cart._id || '',
        lineItems: cart.lineItems?.map((item: any) => ({
          id: item._id || '',
          quantity: item.quantity || 0,
          catalogReference: item.catalogReference,
          price: {
            amount: item.price?.amount?.toString() || '0',
            currency: item.price?.currency || 'USD',
          },
          productName: item.productName,
        })) || [],
        totals: {
          subtotal: cart.priceSummary?.subtotal?.amount?.toString() || '0',
          total: cart.priceSummary?.total?.amount?.toString() || '0',
          currency: cart.currency || 'USD',
        },
        buyerInfo: cart.buyerInfo,
      } as WixCart;
    } catch (error) {
      console.error('❌ [ECOMMERCE] Failed to remove from cart:', error);
      throw error;
    }
  }

  // === CHECKOUT API ===

  async createCheckout(cartId?: string): Promise<{ checkoutId: string; checkoutUrl: string }> {
    try {
      if (!this.wixClient) {
        throw new Error('Wix SDK client not initialized');
      }

      console.log('🛒 [ECOMMERCE] Creating checkout...');
      const response = await this.wixClient.currentCart.createCheckoutFromCurrentCart({
        channelType: this.wixClient.currentCart.ChannelType.OTHER_PLATFORM,
      });

      // Create redirect session for checkout URL
      const redirectResponse = await this.wixClient.redirects.createRedirectSession({
        ecomCheckout: {
          checkoutId: response.checkoutId,
        },
        callbacks: {
          postFlowUrl: 'https://your-site.com/thank-you',
          thankYouPageUrl: 'https://your-site.com/thank-you',
        },
      });

      const checkoutUrl = redirectResponse.redirectSession?.fullUrl || '';
      
      console.log('✅ [ECOMMERCE] Checkout created successfully');
      
      return {
        checkoutId: response.checkoutId,
        checkoutUrl: checkoutUrl,
      };
    } catch (error) {
      console.error('❌ [ECOMMERCE] Failed to create checkout:', error);
      throw error;
    }
  }

  // === UTILITY METHODS ===

  getOptimizedImageUrl(mediaUrl: string, width: number = 400, height: number = 400): string {
    if (!mediaUrl) return '';
    
    try {
      if (mediaUrl.includes('static.wixstatic.com')) {
        const baseUrl = mediaUrl.split('?')[0];
        return `${baseUrl}/v1/fit/w_${width},h_${height},q_90/file.jpg`;
      }
      
      const url = new URL(mediaUrl);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('h', height.toString());
      url.searchParams.set('fit', 'cover');
      return url.toString();
    } catch (err) {
      console.warn('⚠️ [ECOMMERCE] Error optimizing image URL:', err);
      return mediaUrl;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        ECOMMERCE_CACHE_KEYS.PRODUCTS,
        ECOMMERCE_CACHE_KEYS.COLLECTIONS,
        ECOMMERCE_CACHE_KEYS.PRODUCTS_TIMESTAMP,
        ECOMMERCE_CACHE_KEYS.COLLECTIONS_TIMESTAMP,
      ]);
      console.log('🗑️ [ECOMMERCE CACHE] Cache cleared successfully');
    } catch (err) {
      console.warn('⚠️ [ECOMMERCE CACHE] Error clearing cache:', err);
    }
  }

  async getCacheInfo(): Promise<{ products: boolean; collections: boolean }> {
    return {
      products: await this.isCacheValid(ECOMMERCE_CACHE_KEYS.PRODUCTS_TIMESTAMP),
      collections: await this.isCacheValid(ECOMMERCE_CACHE_KEYS.COLLECTIONS_TIMESTAMP),
    };
  }

  // === GETTERS ===

  getSiteId(): string {
    return this.siteId;
  }

  getStoresAppId(): string {
    return this.storesAppId;
  }

  getClientId(): string {
    return this.clientId;
  }
}

// === EXPORTS ===

export const wixEcommerceClient = new WixEcommerceClient();

// Helper functions
export const formatPrice = (price?: { currency: string; price: string; discountedPrice?: string }): string => {
  if (!price || !price.price) return 'Price unavailable';
  
  const amount = price.discountedPrice || price.price;
  const currency = price.currency || 'USD';
  
  try {
    const numericPrice = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numericPrice);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.original) return String(value.original);
  return String(value);
};

console.log('🛍️ [ECOMMERCE] WixEcommerceClient module loaded');
