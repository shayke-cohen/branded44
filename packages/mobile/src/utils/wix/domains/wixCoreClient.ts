/**
 * Wix Core Client
 * 
 * Shared base functionality for all Wix API clients including:
 * - HTTP request utilities
 * - Configuration management
 * - Caching utilities
 * - Error handling
 * - Common types and interfaces
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId, getSiteId, getStoresAppId, getApiBaseUrl } from '../../../config/wixConfig';
import { featureManager } from '../../../config/features';
import { wixAuthenticationClient } from './wixAuthenticationClient';

// === SHARED CACHE CONFIGURATION ===

export const CACHE_KEYS = {
  PRODUCTS: 'wix_products_cache',
  COLLECTIONS: 'wix_collections_cache',
  SERVICES: 'wix_services_cache',
  PROVIDERS: 'wix_providers_cache',
  MENUS: 'wix_menus_cache',
  PRODUCTS_TIMESTAMP: 'wix_products_timestamp',
  COLLECTIONS_TIMESTAMP: 'wix_collections_timestamp',
  SERVICES_TIMESTAMP: 'wix_services_timestamp',
  PROVIDERS_TIMESTAMP: 'wix_providers_timestamp',
  MENUS_TIMESTAMP: 'wix_menus_timestamp',
} as const;

export const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// === ERROR TYPES ===

export class WixAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'WixAPIError';
  }
}

// === BASE CLIENT CLASS ===

export class WixCoreClient {
  protected baseURL = getApiBaseUrl();
  protected siteId = getSiteId();
  protected clientId = getClientId();
  protected storesAppId = getStoresAppId();

  constructor(protected domain: string) {
    console.log(`🔧 [${domain.toUpperCase()}] Core client initialized`);
  }

  // === CONFIGURATION GETTERS ===

  getSiteId(): string {
    return this.siteId;
  }

  getClientId(): string {
    return this.clientId;
  }

  getStoresAppId(): string {
    return this.storesAppId;
  }



  getBaseURL(): string {
    return this.baseURL;
  }

  // === HTTP REQUEST UTILITIES ===

  protected async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get authentication headers
    let authHeaders: Record<string, string> = {};
    
    if (requireAuth) {
      // Always use the same authentication approach (visitor/member tokens)
      // whether using SDK or REST API - mobile apps should never use API Keys
      authHeaders = await wixAuthenticationClient.getAuthHeaders();
    }
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    if (featureManager.getFeature('DEBUG_API_CALLS')) {
      console.log(`🌐 [${this.domain.toUpperCase()} API] ${options.method || 'GET'} ${endpoint}`);
      if (config.body) {
        console.log(`📤 [${this.domain.toUpperCase()} API] Request body:`, config.body);
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [${this.domain.toUpperCase()} API ERROR] ${endpoint}: ${response.status} ${response.statusText}`);
        console.error(`❌ [${this.domain.toUpperCase()} API ERROR] Response: ${errorText}`);
        
        throw new WixAPIError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          endpoint,
          errorText
        );
      }

      const data = await response.json();
      
      if (featureManager.getFeature('DEBUG_API_CALLS')) {
        console.log(`✅ [${this.domain.toUpperCase()} API SUCCESS] ${endpoint}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof WixAPIError) {
        throw error;
      }
      
      console.error(`❌ [${this.domain.toUpperCase()} API] Network error:`, error);
      throw new WixAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        endpoint
      );
    }
  }

  protected async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    requireAuth: boolean = true
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest<T>(endpoint, options, requireAuth);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) {
          console.error(`❌ [${this.domain.toUpperCase()}] All ${maxRetries} attempts failed for ${endpoint}`);
          break;
        }
        
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        console.warn(`⚠️ [${this.domain.toUpperCase()}] Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // === CACHING UTILITIES ===

  protected async getCachedData<T>(cacheKey: string, timestampKey: string): Promise<T | null> {
    if (!featureManager.getFeature('ENABLE_API_CACHING')) {
      return null;
    }
    
    try {
      const [cachedData, cachedTimestamp] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(timestampKey),
      ]);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        if (now - timestamp < CACHE_DURATION) {
          const data = JSON.parse(cachedData);
          console.log(`📦 [${this.domain.toUpperCase()} CACHE] Cache hit for ${cacheKey}`);
          return data;
        } else {
          console.log(`⏰ [${this.domain.toUpperCase()} CACHE] Cache expired for ${cacheKey}`);
          // Clean up expired cache
          await this.clearCachedData(cacheKey, timestampKey);
        }
      }
    } catch (error) {
      console.error(`❌ [${this.domain.toUpperCase()} CACHE] Error reading cache for ${cacheKey}:`, error);
      // Clear potentially corrupted cache
      await this.clearCachedData(cacheKey, timestampKey);
    }

    return null;
  }

  protected async setCachedData(cacheKey: string, timestampKey: string, data: any): Promise<void> {
    if (!featureManager.getFeature('ENABLE_API_CACHING')) {
      return;
    }
    
    try {
      const timestamp = Date.now().toString();
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(data)),
        AsyncStorage.setItem(timestampKey, timestamp),
      ]);
      console.log(`💾 [${this.domain.toUpperCase()} CACHE] Cached data for ${cacheKey}`);
    } catch (error) {
      console.error(`❌ [${this.domain.toUpperCase()} CACHE] Error caching data for ${cacheKey}:`, error);
    }
  }

  protected async clearCachedData(cacheKey: string, timestampKey: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(cacheKey),
        AsyncStorage.removeItem(timestampKey),
      ]);
      console.log(`🗑️ [${this.domain.toUpperCase()} CACHE] Cleared cache for ${cacheKey}`);
    } catch (error) {
      console.error(`❌ [${this.domain.toUpperCase()} CACHE] Error clearing cache for ${cacheKey}:`, error);
    }
  }

  protected async isCacheValid(timestampKey: string): Promise<boolean> {
    if (!featureManager.getFeature('ENABLE_API_CACHING')) {
      return false;
    }
    
    try {
      const cachedTimestamp = await AsyncStorage.getItem(timestampKey);
      if (cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        return (now - timestamp) < CACHE_DURATION;
      }
    } catch (error) {
      console.error(`❌ [${this.domain.toUpperCase()} CACHE] Error checking cache validity:`, error);
    }
    return false;
  }

  // === CACHE MANAGEMENT ===

  async clearCache(): Promise<void> {
    const cacheKeys = Object.values(CACHE_KEYS).filter(key => 
      key.includes(this.domain.toLowerCase()) || 
      (this.domain === 'ECOMMERCE' && (key.includes('products') || key.includes('collections')))
    );
    
    try {
      await Promise.all(cacheKeys.map(key => AsyncStorage.removeItem(key)));
      console.log(`🗑️ [${this.domain.toUpperCase()} CACHE] All caches cleared`);
    } catch (error) {
      console.error(`❌ [${this.domain.toUpperCase()} CACHE] Error clearing caches:`, error);
    }
  }

  async getCacheInfo(): Promise<Record<string, boolean>> {
    const info: Record<string, boolean> = {};
    const cacheKeys = Object.entries(CACHE_KEYS);
    
    await Promise.all(cacheKeys.map(async ([name, key]) => {
      if (key.includes(this.domain.toLowerCase()) || 
          (this.domain === 'ECOMMERCE' && (key.includes('products') || key.includes('collections')))) {
        info[name.toLowerCase()] = await this.isCacheValid(key);
      }
    }));
    
    return info;
  }

  // === IMAGE UTILITIES ===

  getOptimizedImageUrl(imageUrl: string, width?: number, height?: number): string {
    if (!imageUrl) return '';
    
    // If it's already a Wix media URL, add optimization parameters
    if (imageUrl.includes('wixmp.com') || imageUrl.includes('wixstatic.com')) {
      const url = new URL(imageUrl);
      
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      
      // Add optimization flags
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('auto', 'compress,format');
      
      return url.toString();
    }
    
    return imageUrl;
  }

  // === UTILITY METHODS ===

  protected formatQueryParams(params: Record<string, any>): URLSearchParams {
    const urlParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          urlParams.append(key, JSON.stringify(value));
        } else {
          urlParams.append(key, value.toString());
        }
      }
    }
    
    return urlParams;
  }

  protected handleAPIResponse<T>(response: any, dataKey?: string): T {
    // Many Wix APIs wrap data in a specific key
    if (dataKey && response[dataKey]) {
      return response[dataKey];
    }
    
    // Some APIs return data directly
    if (response.data) {
      return response.data;
    }
    
    // Return the response as-is if no wrapper is found
    return response;
  }

  // === ERROR HANDLING ===

  protected createDomainError(message: string, statusCode?: number, endpoint?: string): WixAPIError {
    return new WixAPIError(`[${this.domain}] ${message}`, statusCode, endpoint);
  }

  // === HTTP CONVENIENCE METHODS ===

  protected async get<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, requireAuth);
  }

  protected async post<T>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    };
    return this.makeRequest<T>(endpoint, options, requireAuth);
  }

  protected async patch<T>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
    const options: RequestInit = {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    };
    return this.makeRequest<T>(endpoint, options, requireAuth);
  }

  protected async delete<T>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
    const options: RequestInit = {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    };
    return this.makeRequest<T>(endpoint, options, requireAuth);
  }

  // === FEATURE FLAG HELPERS ===

  protected isSDKEnabled(): boolean {
    return featureManager.isSDKEnabled();
  }

  protected shouldUseSDK(): boolean {
    return this.isSDKEnabled();
  }

  protected shouldUseRESTFallback(): boolean {
    return featureManager.getFeature('USE_REST_API_FALLBACK');
  }
}

// === UTILITY FUNCTIONS ===

/**
 * Create a standardized filter object for Wix queries
 */
export function createWixFilter(conditions: Record<string, any>): any {
  const filter: any = {};
  
  for (const [field, value] of Object.entries(conditions)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        filter[field] = { $in: value };
      } else if (typeof value === 'boolean') {
        filter[field] = { $eq: value };
      } else if (typeof value === 'string' && value.includes('*')) {
        filter[field] = { $contains: value.replace(/\*/g, '') };
      } else {
        filter[field] = { $eq: value };
      }
    }
  }
  
  return filter;
}

/**
 * Create a standardized sort object for Wix queries
 */
export function createWixSort(sortBy: string, order: 'asc' | 'desc' = 'asc'): any[] {
  return [{
    fieldName: sortBy,
    order: order.toUpperCase(),
  }];
}

/**
 * Create pagination parameters for Wix queries
 */
export function createWixPaging(limit?: number, offset?: number): any {
  const paging: any = {};
  
  if (limit !== undefined) {
    paging.limit = Math.max(1, Math.min(limit, 100)); // Limit between 1-100
  }
  
  if (offset !== undefined) {
    paging.offset = Math.max(0, offset);
  }
  
  return Object.keys(paging).length > 0 ? paging : undefined;
}
