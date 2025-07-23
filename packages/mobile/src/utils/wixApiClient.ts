import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId, getSiteId, getStoresAppId, getApiBaseUrl } from '../config/wixConfig';

// Cache configuration
const CACHE_KEYS = {
  PRODUCTS: 'wix_products_cache',
  COLLECTIONS: 'wix_collections_cache',
  PRODUCTS_TIMESTAMP: 'wix_products_timestamp',
  COLLECTIONS_TIMESTAMP: 'wix_collections_timestamp',
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds (increased for better performance)

// Types for API responses - Updated to match actual Wix V1 API
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
}

// Visitor token types
interface VisitorTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in seconds
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds until expiry
  token_type: string;
}

class WixApiClient {
  private baseURL = getApiBaseUrl();
  private siteId = getSiteId();
  private storesAppId = getStoresAppId();
  private clientId = getClientId();
  private authToken: string | null = null;
  private visitorTokens: VisitorTokens | null = null;

  constructor() {
    console.log('🔗 [DEBUG] WixApiClient initialized');
    console.log(`🔗 [DEBUG] Using Client ID: ${this.clientId}`);
    console.log(`🔗 [DEBUG] Using Site ID: ${this.siteId}`);
    console.log(`🔗 [DEBUG] Using Stores App ID: ${this.storesAppId}`);
    this.loadStoredAuth();
    this.initializeVisitorAuthentication();
  }

  private async loadStoredAuth() {
    try {
      const storedVisitorTokens = await AsyncStorage.getItem('wix_visitor_tokens');

      if (storedVisitorTokens) {
        this.visitorTokens = JSON.parse(storedVisitorTokens);
        console.log('🔗 [DEBUG] Loaded stored visitor tokens');
      }
    } catch (error) {
      console.error('❌ [ERROR] Failed to load stored auth:', error);
    }
  }

  // Clean up old unused method - visitor auth handles everything now
  async setSiteCredentials(siteId: string, authToken?: string) {
    console.log('⚠️ [DEPRECATED] setSiteCredentials is no longer needed with visitor authentication');
    // This method is kept for backward compatibility but does nothing
  }

  // Initialize visitor authentication
  private async initializeVisitorAuthentication(): Promise<void> {
    try {
      console.log('🔗 [DEBUG] Initializing visitor authentication...');
      
      // Check if we have valid visitor tokens
      if (this.visitorTokens && this.isTokenValid(this.visitorTokens)) {
        console.log('✅ [AUTH] Using existing valid visitor tokens');
        return;
      }

      // Try to refresh tokens if we have a refresh token
      if (this.visitorTokens?.refreshToken) {
        console.log('🔄 [AUTH] Attempting to refresh visitor tokens...');
        const refreshed = await this.refreshVisitorTokens();
        if (refreshed) {
          console.log('✅ [AUTH] Successfully refreshed visitor tokens');
          return;
        }
      }

      // Generate new visitor tokens
      console.log('🆕 [AUTH] Generating new visitor tokens...');
      await this.generateVisitorTokens();
      console.log('✅ [AUTH] Successfully generated new visitor tokens');
    } catch (error) {
      console.error('❌ [AUTH ERROR] Failed to initialize visitor authentication:', error);
    }
  }

  // Check if token is valid (not expired)
  private isTokenValid(tokens: VisitorTokens): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return tokens.expiresAt > currentTime + 300; // 5 minute buffer
  }

  // Generate new visitor tokens
  private async generateVisitorTokens(): Promise<void> {
    try {
      console.log('🌐 [API] POST /oauth2/token (anonymous visitor tokens)');
      
      const response = await fetch('https://www.wixapis.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          grantType: 'anonymous'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      
      this.visitorTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000) + data.expires_in
      };

      // Store tokens for future use
      await AsyncStorage.setItem('wix_visitor_tokens', JSON.stringify(this.visitorTokens));
      console.log('✅ [AUTH] Visitor tokens generated and stored successfully');
    } catch (error) {
      console.error('❌ [AUTH ERROR] Failed to generate visitor tokens:', error);
      throw error;
    }
  }

  // Refresh visitor tokens using refresh token
  private async refreshVisitorTokens(): Promise<boolean> {
    try {
      if (!this.visitorTokens?.refreshToken) {
        return false;
      }

      console.log('🌐 [API] POST /oauth2/token (refresh visitor tokens)');
      
      const response = await fetch('https://www.wixapis.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.visitorTokens.refreshToken,
          grantType: 'refresh_token'
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ [AUTH] Failed to refresh tokens, will generate new ones');
        return false;
      }

      const data: TokenResponse = await response.json();
      
      this.visitorTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000) + data.expires_in
      };

      // Store refreshed tokens
      await AsyncStorage.setItem('wix_visitor_tokens', JSON.stringify(this.visitorTokens));
      console.log('✅ [AUTH] Visitor tokens refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ [AUTH ERROR] Failed to refresh visitor tokens:', error);
      return false;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Ensure we have valid visitor tokens
    await this.ensureValidVisitorTokens();

    // Add visitor auth token
    if (this.visitorTokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
    }

    console.log(`🌐 [API] ${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check for expected cart "not found" errors (normal for new users)
        const isExpectedCartError = response.status === 404 && 
          endpoint.includes('/carts/current') && 
          (errorText.includes('OWNED_CART_NOT_FOUND') || errorText.includes('Cart not found'));
        
        if (isExpectedCartError) {
          // Log expected cart errors more quietly
          console.log(`ℹ️ [CART] ${response.status}: Cart not found (normal for new users)`);
        } else {
          // Log unexpected errors with full details
          console.error(`❌ [API ERROR] ${response.status}:`, errorText);
          console.error('🔍 [DEBUG] Failed request details:');
          console.error('🔍 [DEBUG] - URL:', url);
          console.error('🔍 [DEBUG] - Method:', options.method);
          console.error('🔍 [DEBUG] - Body:', options.body);
          console.error('🔍 [DEBUG] - Headers:', JSON.stringify(options.headers || {}, null, 2));
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [API SUCCESS] ${endpoint}:`, Object.keys(data).join(', '));
      return data;
    } catch (error) {
      // Check if this is an expected cart error
      const isExpectedCartError = endpoint.includes('/carts/current') && 
        error instanceof Error && 
        (error.message.includes('OWNED_CART_NOT_FOUND') || error.message.includes('Cart not found'));
      
      if (!isExpectedCartError) {
        // Only log unexpected errors with full details
        console.error(`❌ [API FAILED] ${endpoint}:`, error);
        console.error('🔍 [DEBUG] Exception details:', {
          url,
          method: options.method,
          body: options.body,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      throw error;
    }
  }



  // Ensure we have valid visitor tokens before making API calls
  private async ensureValidVisitorTokens(): Promise<void> {
    if (this.visitorTokens && this.isTokenValid(this.visitorTokens)) {
      return; // Tokens are still valid
    }

    console.log('🔄 [AUTH] Refreshing visitor tokens for API call...');
    await this.initializeVisitorAuthentication();
  }

  // Check if cached data is still valid
  private async isCacheValid(timestampKey: string): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem(timestampKey);
      if (!timestamp) return false;
      
      const cacheAge = Date.now() - parseInt(timestamp);
      const isValid = cacheAge < CACHE_DURATION;
      
      console.log(`🗂️ [CACHE] Cache age: ${Math.round(cacheAge / 1000)}s, Valid: ${isValid}`);
      return isValid;
    } catch {
      return false;
    }
  }

  // Get cached data if valid
  private async getCachedData<T>(cacheKey: string, timestampKey: string): Promise<T | null> {
    try {
      if (await this.isCacheValid(timestampKey)) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          console.log(`✅ [CACHE] Using cached data for ${cacheKey}`);
          return JSON.parse(cached);
        }
      }
      return null;
    } catch (err) {
      console.warn('⚠️ [CACHE] Error reading cache:', err);
      return null;
    }
  }

  // Store data in cache
  private async setCachedData(cacheKey: string, timestampKey: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(timestampKey, Date.now().toString());
      console.log(`💾 [CACHE] Stored data in cache: ${cacheKey}`);
    } catch (err) {
      console.warn('⚠️ [CACHE] Error storing cache:', err);
    }
  }

  // Products API - Catalog V1 (updated with sort support and caching)
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
    
    // Check cache first for basic queries (no search, no complex filters, no force refresh)
    const isBasicQuery = !filters?.categoryIds?.length && !filters?.searchQuery && 
                        !filters?.sort;
    
    // Skip cache check if forceRefresh is true
    if (isBasicQuery && !filters?.forceRefresh) {
      const cached = await this.getCachedData<{ products: WixProduct[]; metaData?: any }>(
        CACHE_KEYS.PRODUCTS, 
        CACHE_KEYS.PRODUCTS_TIMESTAMP
      );
      if (cached) {
        console.log(`✅ [CACHE] Using cached products: ${cached.products?.length || 0} items`);
        return cached;
      }
    }

    // Log force refresh attempts
    if (filters?.forceRefresh) {
      console.log('🔄 [FORCE REFRESH] Bypassing cache and fetching fresh data');
    }
    
    const queryParams = new URLSearchParams();
    
    if (filters?.limit) {
      queryParams.append('query.limit', filters.limit.toString());
    } else {
      queryParams.append('query.limit', '50');
    }

    if (filters?.cursor) {
      queryParams.append('query.cursorPaging.cursor', filters.cursor);
    }

    // Add visibility filter (default to visible products)
    if (filters?.visible !== false) {
      queryParams.append('query.filter', JSON.stringify({ visible: { $eq: true } }));
    }

    // Use Catalog V1 endpoint (your site uses Catalog V1, not V3)
    const endpoint = `/stores-reader/v1/products/query`;
    
    // Build request body for Catalog V1 API (correct format from documentation)
    const requestBody: any = {
      query: {
        paging: {
          limit: filters?.limit || 50,
          offset: 0
        }
      },
      includeVariants: true
    };

    // Add filter for visible products (V1 API expects string values)
    if (filters?.visible !== false) {
      requestBody.query.filter = '{"visible": "true"}';
    }

    // Add sort parameter if provided (V1 API expects simple field:order format)
    if (filters?.sort) {
      try {
        // V1 API expects sort as a STRING in array format: [{"fieldName": "order"}]
        const sortObj = JSON.parse(filters.sort);
        const sortString = `[${JSON.stringify(sortObj)}]`;
        requestBody.query.sort = sortString;
        console.log('🔄 [SORT] Applied sort as string:', sortString);
      } catch (err) {
        console.warn('⚠️ [SORT] Invalid sort format:', filters.sort);
        // Don't include sort if parsing fails
      }
    }

    // Add search query if provided
    if (filters?.searchQuery) {
      // For V1 API, search might need to be handled differently
      console.log('🔍 [SEARCH] Search query provided:', filters.searchQuery);
      // Note: V1 API may not support search in the same way as V3
    }

    console.log('🛍️ [DEBUG] Full API request details:');
    console.log('🛍️ [DEBUG] - Endpoint:', endpoint);
    console.log('🛍️ [DEBUG] - Request body:', JSON.stringify(requestBody, null, 2));
    console.log('🛍️ [DEBUG] - Original filters:', JSON.stringify(filters, null, 2));

    const result = await this.makeRequest<{ products: WixProduct[]; metaData?: any }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    // Debug: Check if products have app information
    if (result.products && result.products.length > 0) {
      console.log('🛍️ [DEBUG] First product full data (checking for appId):', JSON.stringify(result.products[0], null, 2));
      console.log('🛍️ [DEBUG] Product eCommerce status check for:', result.products[0].id);
      console.log('🛍️ [DEBUG] Product visible status:', result.products[0].visible);
      console.log('🛍️ [DEBUG] Product in stock status:', result.products[0].inStock);
    }

    // Cache the result if it's a basic query (including force refresh results)
    if (isBasicQuery && result) {
      await this.setCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP, result);
      console.log('💾 [CACHE] Updated cache with fresh data');
    }

    return result;
  }

  // Client-side filtering method to reduce API calls
  async queryProductsWithClientFiltering(filters?: {
    categoryIds?: string[];
    visible?: boolean;
    inStock?: boolean;
    searchQuery?: string;
    limit?: number;
    cursor?: string;
    sort?: string;
    forceRefresh?: boolean;
  }): Promise<{ products: WixProduct[]; metaData?: any }> {
    
    // For search queries, always hit the API (search needs server-side processing)
    if (filters?.searchQuery?.trim()) {
      console.log('🔍 [SEARCH] Search query detected, using server filtering');
      return this.queryProducts(filters);
    }

    // Get all products from cache or API
    const allProductsResult = await this.queryProducts({
      visible: filters?.visible,
      limit: 100, // Get more products to enable better client-side filtering
      forceRefresh: filters?.forceRefresh
    });

    let filteredProducts = allProductsResult.products || [];

    // Apply client-side category filtering
    if (filters?.categoryIds?.length) {
      filteredProducts = filteredProducts.filter(product => 
        filters.categoryIds!.some(catId => 
          product.categoryIds?.includes(catId) || // Match by category IDs
          product.ribbon?.includes(catId) || // Basic category matching
          catId === '00000000-000000-000000-000000000001' // "All Products" category
        )
      );
      console.log(`📂 [CLIENT FILTER] Filtered by category: ${filteredProducts.length} products`);
    }

    // Apply client-side stock filtering
    if (filters?.inStock) {
      filteredProducts = filteredProducts.filter(product => {
        const stock = product.stock;
        return stock?.inStock || 
               (stock?.quantity && stock.quantity > 0) || 
               stock?.inventoryStatus === 'IN_STOCK' ||
               !stock; // Include products without stock info
      });
      console.log(`📦 [CLIENT FILTER] Filtered by stock: ${filteredProducts.length} products`);
    }

    // Apply client-side sorting
    if (filters?.sort) {
      try {
        const sortObj = JSON.parse(filters.sort);
        const fieldName = Object.keys(sortObj)[0];
        const order = sortObj[fieldName];
        
        filteredProducts.sort((a, b) => {
          let aValue: any, bValue: any;
          
          if (fieldName === 'name') {
            aValue = a.name || '';
            bValue = b.name || '';
          } else if (fieldName === 'priceData.price' || fieldName === 'price') {
            aValue = a.priceData?.price || 0;
            bValue = b.priceData?.price || 0;
          } else {
            return 0; // Unknown field
          }
          
          if (order === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
        console.log(`🔄 [CLIENT SORT] Sorted by ${fieldName} ${order}: ${filteredProducts.length} products`);
      } catch (err) {
        console.warn('⚠️ [CLIENT SORT] Invalid sort format:', filters.sort);
      }
    }

    // Apply limit
    if (filters?.limit && filteredProducts.length > filters.limit) {
      filteredProducts = filteredProducts.slice(0, filters.limit);
    }

    console.log(`✅ [CLIENT FILTER] Final result: ${filteredProducts.length} products`);
    
    return {
      products: filteredProducts,
      metaData: allProductsResult.metaData
    };
  }

  async getProduct(productId: string): Promise<WixProduct> {
    const endpoint = `/stores-reader/v1/products/${productId}`;
    const response = await this.makeRequest<{ product: WixProduct }>(endpoint);
    console.log('🛍️ [DEBUG] Product details response:', JSON.stringify(response, null, 2));
    return response.product;
  }

  // Collections API - V1 uses "collections" not "categories" (with caching)
  async queryCategories(forceRefresh = false): Promise<{ categories: WixCategory[] }> {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = await this.getCachedData<{ categories: WixCategory[] }>(
          CACHE_KEYS.COLLECTIONS, 
          CACHE_KEYS.COLLECTIONS_TIMESTAMP
        );
        if (cached) {
          return cached;
        }
      }

      console.log('📂 [COLLECTIONS] Loading collections from V1 API...');
      const endpoint = '/stores-reader/v1/collections/query';
      const requestBody = {
        query: {
          paging: { limit: 100, offset: 0 },
          filter: '{"visible": "true"}'
        }
      };
      
      console.log('📂 [COLLECTIONS] Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await this.makeRequest<{ collections: any[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      // Convert collections to categories format for compatibility
      const categories = (response.collections || []).map(collection => ({
        id: collection.id,
        name: collection.name || 'Unnamed Collection',
        description: collection.description,
        visible: collection.visible !== false,
        slug: collection.slug
      }));
      
      console.log(`✅ [COLLECTIONS] Loaded ${categories.length} collections as categories`);
      
      const result = { categories };
      
      // Cache the result
      await this.setCachedData(CACHE_KEYS.COLLECTIONS, CACHE_KEYS.COLLECTIONS_TIMESTAMP, result);
      
      return result;
    } catch (error) {
      console.warn('⚠️ [COLLECTIONS] Failed to load collections, returning empty categories:', error);
      return { categories: [] };
    }
  }

  // Cart API - eCommerce
  async getCurrentCart(): Promise<WixCart | null> {
    try {
      const endpoint = '/ecom/v1/carts/current';
      const response = await this.makeRequest<{ cart: WixCart }>(endpoint);
      return response.cart;
    } catch (error: any) {
      // Handle expected "no cart" scenarios gracefully
      if (error?.message?.includes('OWNED_CART_NOT_FOUND') || 
          error?.message?.includes('Cart not found')) {
        console.log('ℹ️ [CART] No current cart found (this is normal for new users)');
        return null;
      }
      
      // Log unexpected cart errors
      console.warn('⚠️ [CART] Unexpected error getting current cart:', error);
      return null;
    }
  }

  async addToCart(items: WixCartItem[]): Promise<WixCart> {
    // First try to get current cart, if none exists, it will be created automatically
    const cartEndpoint = '/ecom/v1/carts/current/add-to-cart';
    
    const lineItems = items.map(item => ({
      catalogReference: {
        appId: this.storesAppId, // Use the Wix Stores app ID for catalog operations
        catalogItemId: item.catalogReference.catalogItemId,
        options: item.catalogReference.options || {}
      },
      quantity: item.quantity
    }));

    console.log('🛒 [API] Adding to cart - Items:', lineItems.length);
    console.log('🛒 [DEBUG] Site ID:', this.siteId, 'Stores App ID:', this.storesAppId);
    console.log('🛒 [DEBUG] Line items structure:', JSON.stringify(lineItems, null, 2));

    const requestBody = { lineItems };

    const response = await this.makeRequest<{ cart: WixCart }>(cartEndpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    console.log('🛒 [API] Add to cart response - Line items:', response.cart.lineItems?.length || 0);
    return response.cart;
  }

  async updateCartItemQuantity(lineItemId: string, quantity: number): Promise<WixCart> {
    const endpoint = '/ecom/v1/carts/current/update-line-items-quantity';
    
    const response = await this.makeRequest<{ cart: WixCart }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        lineItems: [{ id: lineItemId, quantity }]
      })
    });

    return response.cart;
  }

  async removeFromCart(lineItemIds: string[]): Promise<WixCart> {
    const endpoint = '/ecom/v1/carts/current/remove-line-items';
    
    const response = await this.makeRequest<{ cart: WixCart }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ lineItemIds })
    });

    return response.cart;
  }

  // Checkout API
  async createCheckout(cartId?: string): Promise<{ checkoutId: string; checkoutUrl: string }> {
    const endpoint = '/ecom/v1/checkouts';
    
    const response = await this.makeRequest<{ 
      checkout: { 
        id: string; 
        checkoutUrl: string; 
      } 
    }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        channelType: 'WEB',
        ...(cartId ? { cartId } : {})
      })
    });

    return {
      checkoutId: response.checkout.id,
      checkoutUrl: response.checkout.checkoutUrl
    };
  }

  // Helper method to get optimized media URL for Wix images
  getOptimizedImageUrl(mediaUrl: string, width: number = 400, height: number = 400): string {
    if (!mediaUrl) return '';
    
    try {
      // Check if URL is already a Wix static media URL
      if (mediaUrl.includes('static.wixstatic.com')) {
        // For Wix static URLs, use path-based optimization instead of query params
        const baseUrl = mediaUrl.split('?')[0]; // Remove any existing query params
        
        // Check if it already has optimization path parameters
        if (baseUrl.includes('/v1/fit/') || baseUrl.includes('/v1/fill/')) {
          // Already optimized, use as-is but ensure it ends properly
          return baseUrl.replace(/\/$/, ''); // Remove trailing slash
        }
        
        // Add Wix path-based optimization
        const optimizedUrl = `${baseUrl}/v1/fit/w_${width},h_${height},q_90/file.jpg`;
        return optimizedUrl;
      }
      
      // For non-Wix URLs, use query parameters
      const url = new URL(mediaUrl);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('h', height.toString());
      url.searchParams.set('fit', 'cover');
      return url.toString();
    } catch (err) {
      console.warn('⚠️ [IMAGE] Error optimizing image URL:', err);
      return mediaUrl;
    }
  }

  // Cache management methods
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.PRODUCTS,
        CACHE_KEYS.COLLECTIONS,
        CACHE_KEYS.PRODUCTS_TIMESTAMP,
        CACHE_KEYS.COLLECTIONS_TIMESTAMP,
      ]);
      console.log('🗑️ [CACHE] Cache cleared successfully');
    } catch (err) {
      console.warn('⚠️ [CACHE] Error clearing cache:', err);
    }
  }

  async getCacheInfo(): Promise<{ products: boolean; collections: boolean }> {
    return {
      products: await this.isCacheValid(CACHE_KEYS.PRODUCTS_TIMESTAMP),
      collections: await this.isCacheValid(CACHE_KEYS.COLLECTIONS_TIMESTAMP),
    };
  }

  // Public getter methods
  getSiteId(): string {
    return this.siteId;
  }

  getClientId(): string {
    return getClientId();
  }

  // Legacy method - kept for backward compatibility
  getStoresAppId(): string {
    return this.storesAppId;
  }
}

// Export singleton instance
export const wixApiClient = new WixApiClient();

// Helper function to safely render product price
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

// Helper function to safely render product name
export const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.original) return String(value.original);
  return String(value);
};

console.log('🛍️ [DEBUG] Wix API Client module loaded with configuration from wixConfig'); 