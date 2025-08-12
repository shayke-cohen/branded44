/**
 * Wix Restaurant REST API Client
 * 
 * Uses REST API calls instead of SDK modules for better React Native compatibility.
 * Follows the same pattern as the working WixEcommerceClient.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId, getSiteId, getApiBaseUrl } from '../../config/wixConfig';

// === CACHE CONFIGURATION ===

const RESTAURANT_CACHE_KEYS = {
  MENUS: 'wix_restaurant_menus_cache',
  SECTIONS: 'wix_restaurant_sections_cache',
  ITEMS: 'wix_restaurant_items_cache',
  MENUS_TIMESTAMP: 'wix_restaurant_menus_timestamp',
  SECTIONS_TIMESTAMP: 'wix_restaurant_sections_timestamp', 
  ITEMS_TIMESTAMP: 'wix_restaurant_items_timestamp',
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// === TYPES ===

export interface RestaurantMenu {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  sectionIds: string[];
  createdDate?: string;
  updatedDate?: string;
  urlQueryParam?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  itemIds: string[];
  createdDate?: string;
  updatedDate?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  priceInfo?: {
    price: number;
    currency: string;
  };
  priceVariants?: {
    variants: Array<{
      variantId: string;
      priceInfo: {
        price: number;
        currency: string;
      };
    }>;
  };
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  labels?: Array<{
    id: string;
  }>;
  createdDate?: string;
  updatedDate?: string;
}

export interface ItemVariant {
  id: string;
  name: string;
  description?: string;
}

export interface ItemLabel {
  id: string;
  name: string;
  icon?: {
    url: string;
  };
}

// === AUTHENTICATION TYPES ===

interface VisitorTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// === MAIN CLIENT CLASS ===

class WixRestaurantRestClient {
  private baseURL = getApiBaseUrl();
  private clientId = getClientId();
  private siteId = getSiteId();
  private visitorTokens: VisitorTokens | null = null;

  constructor() {
    console.log('🍽️ [RESTAURANT REST] Initializing REST API client');
    console.log('🍽️ [RESTAURANT REST] Base URL:', this.baseURL);
    console.log('🍽️ [RESTAURANT REST] Site ID:', this.siteId);
    this.initializeAuth();
  }

  // === AUTHENTICATION ===

  private async initializeAuth(): Promise<void> {
    try {
      // Load existing visitor tokens
      const stored = await AsyncStorage.getItem('wix_visitor_tokens');
      if (stored) {
        this.visitorTokens = JSON.parse(stored);
        console.log('🔗 [RESTAURANT REST] Loaded stored visitor tokens');
      }
      
      // Ensure we have valid tokens
      await this.ensureValidTokens();
    } catch (error) {
      console.error('❌ [RESTAURANT REST] Authentication initialization failed:', error);
    }
  }

  private async ensureValidTokens(): Promise<void> {
    if (!this.visitorTokens || this.isTokenExpired(this.visitorTokens)) {
      console.log('🔄 [RESTAURANT REST] Generating new visitor tokens');
      await this.generateVisitorTokens();
    }
  }

  private isTokenExpired(tokens: VisitorTokens): boolean {
    const now = Math.floor(Date.now() / 1000);
    const buffer = 300; // 5 minutes buffer
    return tokens.expiresAt <= (now + buffer);
  }

  private async generateVisitorTokens(): Promise<void> {
    try {
      console.log('🔑 [RESTAURANT REST] Generating visitor tokens');
      
      const response = await fetch(`${this.baseURL}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.clientId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      this.visitorTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000) + data.expires_in
      };

      // Store tokens for future use
      await AsyncStorage.setItem('wix_visitor_tokens', JSON.stringify(this.visitorTokens));
      console.log('✅ [RESTAURANT REST] Visitor tokens generated successfully');
    } catch (error) {
      console.error('❌ [RESTAURANT REST] Failed to generate visitor tokens:', error);
      throw error;
    }
  }

  // === CACHE MANAGEMENT ===

  private async getCachedData<T>(cacheKey: string, timestampKey: string): Promise<T | null> {
    try {
      const [cached, timestamp] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(timestampKey),
      ]);

      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        const isValid = cacheAge < CACHE_DURATION;

        console.log(`🗂️ [CACHE] Cache age: ${Math.floor(cacheAge / 1000)}s, Valid: ${isValid}`);

        if (isValid) {
          console.log(`✅ [CACHE] Using cached data for ${cacheKey}`);
          return JSON.parse(cached);
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ [CACHE] Error reading cache for ${cacheKey}:`, error);
      return null;
    }
  }

  private async setCachedData(cacheKey: string, timestampKey: string, data: any): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(data)),
        AsyncStorage.setItem(timestampKey, Date.now().toString()),
      ]);
    } catch (error) {
      console.error(`❌ [CACHE] Error setting cache for ${cacheKey}:`, error);
    }
  }

  // === API REQUEST HELPER ===

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureValidTokens();

    const url = `https://www.wixapis.com${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'wix-site-id': this.siteId,
    };

    if (this.visitorTokens?.accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log(`🌐 [RESTAURANT REST API] ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [RESTAURANT REST API ERROR] ${endpoint}: ${response.status} ${response.statusText}`);
      console.error(`❌ [RESTAURANT REST API ERROR] Response: ${errorText}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ [RESTAURANT REST API SUCCESS] ${endpoint}`);
    return data;
  }

  // === RESTAURANT API METHODS ===

  /**
   * Get all visible menus
   */
  async getMenus(forceRefresh: boolean = false): Promise<RestaurantMenu[]> {
    if (!forceRefresh) {
      const cached = await this.getCachedData<RestaurantMenu[]>(
        RESTAURANT_CACHE_KEYS.MENUS,
        RESTAURANT_CACHE_KEYS.MENUS_TIMESTAMP
      );
      if (cached) return cached;
    }

    try {
      console.log('🍽️ [RESTAURANT REST] Fetching menus from REST API');
      
      const endpoint = '/restaurants/menus-menu/v1/menus';
      const queryParams = new URLSearchParams({
        onlyVisible: 'true'
      });

      const response = await this.makeRequest<{ menus: RestaurantMenu[] }>(
        `${endpoint}?${queryParams}`
      );

      const menus = response.menus || [];
      
      // Cache the results
      await this.setCachedData(
        RESTAURANT_CACHE_KEYS.MENUS,
        RESTAURANT_CACHE_KEYS.MENUS_TIMESTAMP,
        menus
      );

      console.log(`✅ [RESTAURANT REST] Fetched ${menus.length} menus`);
      return menus;
    } catch (error) {
      console.error('❌ [RESTAURANT REST] Error fetching menus:', error);
      throw error;
    }
  }

  /**
   * Get sections for specific section IDs
   */
  async getSections(sectionIds: string[], forceRefresh: boolean = false): Promise<MenuSection[]> {
    const cacheKey = `${RESTAURANT_CACHE_KEYS.SECTIONS}_${sectionIds.sort().join(',')}`;
    const timestampKey = `${RESTAURANT_CACHE_KEYS.SECTIONS_TIMESTAMP}_${sectionIds.sort().join(',')}`;

    if (!forceRefresh) {
      const cached = await this.getCachedData<MenuSection[]>(cacheKey, timestampKey);
      if (cached) return cached;
    }

    try {
      console.log(`🍽️ [RESTAURANT REST] Fetching ${sectionIds.length} sections from REST API`);
      
      const endpoint = '/restaurants/menus-section/v1/sections';
      const queryParams = new URLSearchParams({
        onlyVisible: 'true'
      });

      // Add section IDs as query parameters
      sectionIds.forEach(id => {
        queryParams.append('sectionIds', id);
      });

      const response = await this.makeRequest<{ sections: MenuSection[] }>(
        `${endpoint}?${queryParams}`
      );

      const sections = response.sections || [];
      
      // Cache the results
      await this.setCachedData(cacheKey, timestampKey, sections);

      console.log(`✅ [RESTAURANT REST] Fetched ${sections.length} sections`);
      return sections;
    } catch (error) {
      console.error('❌ [RESTAURANT REST] Error fetching sections:', error);
      throw error;
    }
  }

  /**
   * Get items for specific item IDs
   */
  async getItems(itemIds: string[], forceRefresh: boolean = false): Promise<MenuItem[]> {
    const cacheKey = `${RESTAURANT_CACHE_KEYS.ITEMS}_${itemIds.sort().join(',')}`;
    const timestampKey = `${RESTAURANT_CACHE_KEYS.ITEMS_TIMESTAMP}_${itemIds.sort().join(',')}`;

    if (!forceRefresh) {
      const cached = await this.getCachedData<MenuItem[]>(cacheKey, timestampKey);
      if (cached) return cached;
    }

    try {
      console.log(`🍽️ [RESTAURANT REST] Fetching ${itemIds.length} items from REST API`);
      
      const endpoint = '/restaurants/menus-item/v1/items';
      const queryParams = new URLSearchParams({
        onlyVisible: 'true'
      });

      // Add item IDs as query parameters
      itemIds.forEach(id => {
        queryParams.append('itemIds', id);
      });

      const response = await this.makeRequest<{ items: MenuItem[] }>(
        `${endpoint}?${queryParams}`
      );

      const items = response.items || [];
      
      // Cache the results
      await this.setCachedData(cacheKey, timestampKey, items);

      console.log(`✅ [RESTAURANT REST] Fetched ${items.length} items`);
      return items;
    } catch (error) {
      console.error('❌ [RESTAURANT REST] Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Get complete menu structure (menus, sections, items)
   */
  async getCompleteMenuStructure(): Promise<{
    menus: RestaurantMenu[];
    sections: MenuSection[];
    items: MenuItem[];
  }> {
    try {
      console.log('🏗️ [RESTAURANT REST] Fetching complete menu structure');

      // Step 1: Get all menus
      const menus = await this.getMenus();
      
      if (menus.length === 0) {
        console.warn('⚠️ [RESTAURANT REST] No menus found');
        return { menus: [], sections: [], items: [] };
      }

      // Step 2: Get all sections
      const sectionIds = menus.flatMap(menu => menu.sectionIds || []).filter(Boolean);
      const sections = sectionIds.length > 0 ? await this.getSections(sectionIds) : [];

      // Step 3: Get all items  
      const itemIds = sections.flatMap(section => section.itemIds || []).filter(Boolean);
      const items = itemIds.length > 0 ? await this.getItems(itemIds) : [];

      console.log(`✅ [RESTAURANT REST] Complete structure: ${menus.length} menus, ${sections.length} sections, ${items.length} items`);

      return { menus, sections, items };
    } catch (error) {
      console.error('❌ [RESTAURANT REST] Error fetching complete menu structure:', error);
      throw error;
    }
  }

  /**
   * Test connection to restaurant API
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 [RESTAURANT REST] Testing REST API connection');
      
      const menus = await this.getMenus();
      console.log(`✅ [RESTAURANT REST] Connection successful - found ${menus.length} menus`);
      return true;
    } catch (error) {
      console.error('❌ [RESTAURANT REST] Connection test failed:', error);
      return false;
    }
  }
}

// === EXPORT SINGLETON INSTANCE ===

const wixRestaurantRestClient = new WixRestaurantRestClient();
export { wixRestaurantRestClient };
export default wixRestaurantRestClient;
