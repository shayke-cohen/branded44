/**
 * Wix Restaurant Client
 * 
 * Handles all restaurant-related operations including:
 * - Menu management
 * - Menu items and sections
 * - Item variants and labels
 * - Restaurant orders (future)
 */

import { WixCoreClient, CACHE_KEYS } from './wixCoreClient';
import { featureManager } from '../../../config/features';
import { createClient, OAuthStrategy } from '@wix/sdk';
// SDK imports removed - restaurant SDK disabled, using REST API fallback  
// import { menus, sections, items, itemVariants, itemLabels } from '@wix/restaurants';

// === TYPES ===

export interface WixMenu {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  sectionIds?: string[];
  visible?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export interface WixMenuSection {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  itemIds?: string[];
  visible?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export interface WixMenuItem {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  priceInfo?: { 
    price?: string; 
    currency?: string; 
    discountedPrice?: string;
  };
  priceVariants?: { 
    variants?: Array<{ 
      variantId?: string; 
      priceInfo?: { 
        price?: string; 
        currency?: string; 
      } 
    }> 
  };
  image?: { url?: string; width?: number; height?: number };
  labels?: Array<{ id?: string; labelId?: string }>;
  visible?: boolean;
  nutritionalInfo?: Record<string, any>;
  allergens?: string[];
}

export interface WixItemVariant {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  choices?: Array<{
    id?: string;
    name?: string;
    priceChange?: { currency?: string; amount?: number };
  }>;
}

export interface WixItemLabel {
  _id?: string;
  id?: string;
  name?: string;
  colorInfo?: { background?: string; foreground?: string };
  iconUrl?: string;
}

export interface CompleteMenuStructure {
  menus: WixMenu[];
  sections: WixMenuSection[];
  items: WixMenuItem[];
  variants: WixItemVariant[];
  labels: WixItemLabel[];
}

// === MAIN CLIENT CLASS ===

export class WixRestaurantClient extends WixCoreClient {
  private wixClient: any = null;
  private isInitialized = false;

  constructor() {
    super('RESTAURANT');
    console.log('🍽️ [RESTAURANT] WixRestaurantClient initialized');
    
    if (featureManager.isRestaurantSDKEnabled()) {
      console.log('🍽️ [RESTAURANT] SDK enabled, will initialize client on first use');
      // Don't initialize in constructor - do it lazily on first use
    } else {
      console.log('🍽️ [RESTAURANT] SDK disabled, using REST API fallback');
      this.isInitialized = true; // Allow REST API usage
    }
  }

  // === SDK INITIALIZATION ===

  private async initializeClient() {
    try {
      console.log('🍽️ [RESTAURANT] Starting client initialization...');
      
      if (featureManager.isRestaurantSDKEnabled()) {
        this.wixClient = createClient({
          modules: {
            menus,
            sections,
            items,
            itemVariants,
            itemLabels,
          },
          auth: OAuthStrategy({
            clientId: this.clientId,
          }),
        });

        // Generate visitor tokens for SDK
        await this.generateVisitorTokens();
        this.isInitialized = true;
        console.log('✅ [RESTAURANT SDK] Client initialized successfully');
      } else {
        console.log('💡 [RESTAURANT] SDK disabled, initialized for REST API usage');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Failed to initialize client:', error);
      console.log('💡 [RESTAURANT] Will fall back to REST API for menu operations');
      this.isInitialized = true; // Allow fallback to REST
    }
  }

  private async generateVisitorTokens(): Promise<void> {
    if (!this.wixClient) return;
    
    try {
      const tokens = await this.wixClient.auth.generateVisitorTokens();
      console.log('✅ [RESTAURANT SDK] Generated visitor tokens');
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Failed to generate visitor tokens:', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized && featureManager.isRestaurantSDKEnabled()) {
      try {
        await this.initializeClient();
      } catch (error) {
        console.warn('⚠️ [RESTAURANT] SDK initialization failed, falling back to REST API:', error);
        this.isInitialized = true; // Mark as initialized to use REST API
      }
    }
  }

  // === MENU OPERATIONS ===

  async getMenus(forceRefresh: boolean = false): Promise<WixMenu[]> {
    console.log('🍽️ [RESTAURANT] Fetching menus...');

    // Ensure client is initialized
    await this.ensureInitialized();

    // Skip cache to ensure fresh data (no cache dependency)
    console.log('🔄 [RESTAURANT] Skipping cache, fetching fresh menu data');

    try {
      if (this.shouldUseSDK() && this.wixClient && this.isInitialized) {
        return await this._getMenusSDK();
      } else {
        return await this._getMenusREST();
      }
    } catch (error) {
      console.error('❌ [RESTAURANT] Error fetching menus:', error);
      throw this.createDomainError('Failed to fetch menus');
    }
  }

  private async _getMenusSDK(): Promise<WixMenu[]> {
    console.log('🔧 [RESTAURANT SDK] Fetching menus via SDK');
    
    const response = await this.wixClient.menus.listMenus();
    const menus = response.menus || [];
    
    // Cache the results
    await this.setCachedData(CACHE_KEYS.MENUS, CACHE_KEYS.MENUS_TIMESTAMP, menus);
    
    console.log(`✅ [RESTAURANT SDK] Found ${menus.length} menus`);
    return menus;
  }

  private async _getMenusREST(): Promise<WixMenu[]> {
    console.log('🌐 [RESTAURANT REST] Fetching menus via Wix Restaurant API');
    
    try {
      // Use the proper Wix Restaurant API endpoint
      const endpoint = `/restaurants/menus-menu/v1/menus`;
      
      const response = await this.makeRequest<{ menus: any[] }>(endpoint, {
        method: 'GET',
      }, true); // Restaurant API requires authentication

      const menus = response.menus || [];
      
      // Transform the data to WixMenu format (already in correct format from Restaurant API)
      const formattedMenus: WixMenu[] = menus.map(menu => ({
        _id: menu.id,
        id: menu.id,
        name: menu.name || 'Menu',
        description: menu.description || '',
        sectionIds: menu.sectionIds || [],
        visible: menu.visible !== false,
        createdDate: menu.createdDate,
        updatedDate: menu.updatedDate
      }));

      console.log(`✅ [RESTAURANT REST] Found ${formattedMenus.length} menus via Restaurant API`);
      return formattedMenus;
      
    } catch (error) {
      console.warn('⚠️ [RESTAURANT REST] Restaurant API failed:', error);
      
      try {
        // Fallback: try to use products API with restaurant-specific filters
        const endpoint = `/stores-reader/v1/products/query`;
        
        const response = await this.makeRequest<{ products: any[] }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            query: {
              filter: '{"productType": "menu"}',
              paging: { limit: 50 }
            }
          })
        }, false); // Try without authentication first (public API)

        const products = response.products || [];
        
        // Transform products to menus
        const menus: WixMenu[] = products.map(product => ({
          _id: product.id || product._id,
          id: product.id || product._id,
          name: product.name || 'Menu',
          description: product.description || product.shortDescription || '',
          sectionIds: product.categories || product.collections || [],
          visible: true
        }));

        console.log(`✅ [RESTAURANT REST] Found ${menus.length} menu products via Products API`);
        return menus;
        
      } catch (productError) {
        console.error('❌ [RESTAURANT REST] Both Collections and Products API failed:', productError);
        throw new Error('Unable to fetch restaurant menus - API endpoints not accessible');
      }
    }
  }

  async getMenu(menuId: string): Promise<WixMenu | null> {
    console.log(`🍽️ [RESTAURANT] Fetching menu: ${menuId}`);

    try {
      const menus = await this.getMenus();
      const menu = menus.find(m => m._id === menuId || m.id === menuId);
      
      if (menu) {
        console.log(`✅ [RESTAURANT] Found menu: ${menu.name}`);
        return menu;
      } else {
        console.warn(`⚠️ [RESTAURANT] Menu not found: ${menuId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ [RESTAURANT] Error fetching menu ${menuId}:`, error);
      return null;
    }
  }

  // === SECTION OPERATIONS ===

  async getSections(sectionIds: string[]): Promise<WixMenuSection[]> {
    console.log(`🍽️ [RESTAURANT] Fetching sections: ${sectionIds.join(', ')}`);

    try {
      if (this.shouldUseSDK() && this.wixClient && this.isInitialized) {
        return await this._getSectionsSDK(sectionIds);
      } else {
        return await this._getSectionsREST(sectionIds);
      }
    } catch (error) {
      console.error('❌ [RESTAURANT] Error fetching sections:', error);
      return [];
    }
  }

  private async _getSectionsSDK(sectionIds: string[]): Promise<WixMenuSection[]> {
    console.log('🔍 [RESTAURANT SDK] Debug: Requested section IDs:', sectionIds);
    
    // First, let's see what sections are available at all
    const allSectionsResponse = await this.wixClient.sections.querySections().find();
    console.log(`🔍 [RESTAURANT SDK] Total available sections: ${allSectionsResponse.sections?.length || 0}`);
    
    if (allSectionsResponse.sections?.length) {
      console.log('🔍 [RESTAURANT SDK] Available section IDs:', 
        allSectionsResponse.sections.map((s: any) => s._id).slice(0, 5)); // Show first 5 IDs
    }
    
    // Now try to find the specific sections
    const response = await this.wixClient.sections.querySections()
      .in('_id', sectionIds)
      .find();
    
    const sections = response.sections || [];
    console.log(`✅ [RESTAURANT SDK] Found ${sections.length} sections by ID`);
    
    if (sections.length === 0 && sectionIds.length > 0) {
      console.log('⚠️ [RESTAURANT SDK] No sections found by ID, trying alternative approach...');
      // Return all sections if none found by ID (for debugging)
      return allSectionsResponse.sections || [];
    }
    
    return sections;
  }

  private async _getSectionsREST(sectionIds: string[]): Promise<WixMenuSection[]> {
    console.log(`🌐 [RESTAURANT REST] Fetching sections via Restaurant API: ${sectionIds.join(', ')}`);
    
    try {
      // Use the proper Wix Restaurant Sections API endpoint
      const endpoint = `/restaurants/menus-section/v1/sections`;
      const params = new URLSearchParams();
      
      if (sectionIds?.length) {
        sectionIds.forEach(id => params.append('sectionIds', id));
      }
      params.append('onlyVisible', 'true');
      
      const url = `${endpoint}?${params.toString()}`;
      
      const response = await this.makeRequest<{ sections: any[] }>(url, {
        method: 'GET',
      }, true); // Restaurant API requires authentication

      const sections = response.sections || [];
      
      // Transform the data to WixMenuSection format (already in correct format from Restaurant API)
      const formattedSections: WixMenuSection[] = sections.map(section => ({
        _id: section.id,
        id: section.id,
        name: section.name || 'Section',
        description: section.description || '',
        itemIds: section.itemIds || [],
        visible: section.visible !== false,
        createdDate: section.createdDate,
        updatedDate: section.updatedDate
      }));

      console.log(`✅ [RESTAURANT REST] Found ${formattedSections.length} sections via Restaurant API`);
      return formattedSections;
      
    } catch (error) {
      console.warn('⚠️ [RESTAURANT REST] Sections Collections API failed, trying categories fallback');
      
      try {
        // Fallback: try to use categories/collections from stores API
        const endpoint = `/stores-reader/v1/collections/query`;
        
        const response = await this.makeRequest<{ collections: any[] }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            query: {
              filter: JSON.stringify({ _id: { $in: sectionIds } }),
              paging: { limit: 100 }
            }
          })
        }, false); // Try without authentication first (public API)

        const collections = response.collections || [];
        
        // Transform collections to sections
        const sections: WixMenuSection[] = collections.map(collection => ({
          _id: collection.id || collection._id,
          id: collection.id || collection._id,
          name: collection.name || 'Section',
          description: collection.description || '',
          itemIds: collection.productIds || [],
          visible: true
        }));

        console.log(`✅ [RESTAURANT REST] Found ${sections.length} sections via Collections fallback`);
        return sections;
        
      } catch (fallbackError) {
        console.error('❌ [RESTAURANT REST] Both section API calls failed:', fallbackError);
        throw new Error('Unable to fetch menu sections - API endpoints not accessible');
      }
    }
  }



  // === ITEM OPERATIONS ===

  async getItems(itemIds: string[]): Promise<WixMenuItem[]> {
    console.log(`🍽️ [RESTAURANT] Fetching items: ${itemIds.join(', ')}`);

    try {
      if (this.shouldUseSDK() && this.wixClient && this.isInitialized) {
        return await this._getItemsSDK(itemIds);
      } else {
        return await this._getItemsREST(itemIds);
      }
    } catch (error) {
      console.error('❌ [RESTAURANT] Error fetching items:', error);
      return [];
    }
  }

  private async _getItemsSDK(itemIds: string[]): Promise<WixMenuItem[]> {
    const response = await this.wixClient.items.queryItems()
      .in('_id', itemIds)
      .find();
    
    const items = response.items || [];
    console.log(`✅ [RESTAURANT SDK] Found ${items.length} items`);
    return items;
  }

  private async _getItemsREST(itemIds: string[]): Promise<WixMenuItem[]> {
    console.log(`🌐 [RESTAURANT REST] Fetching items via Restaurant API: ${itemIds.join(', ')}`);
    
    try {
      // Use the proper Wix Restaurant Items API endpoint
      const endpoint = `/restaurants/menus-item/v1/items`;
      const params = new URLSearchParams();
      
      if (itemIds?.length) {
        itemIds.forEach(id => params.append('itemIds', id));
      }
      params.append('onlyVisible', 'true');
      
      const url = `${endpoint}?${params.toString()}`;
      
      const response = await this.makeRequest<{ items: any[] }>(url, {
        method: 'GET',
      }, true); // Restaurant API requires authentication

      const items = response.items || [];
      
      // Transform the data to WixMenuItem format (already in correct format from Restaurant API)
      const menuItems: WixMenuItem[] = items.map(item => ({
        _id: item.id,
        id: item.id,
        name: item.name || 'Menu Item',
        description: item.description || '',
        priceInfo: item.priceInfo || undefined,
        priceVariants: item.priceVariants || undefined,
        visible: item.visible !== false,
        image: item.image,
        labels: item.labels || [],
        createdDate: item.createdDate,
        updatedDate: item.updatedDate
      }));

      console.log(`✅ [RESTAURANT REST] Found ${menuItems.length} items via Restaurant API`);
      return menuItems;
      
    } catch (error) {
      console.warn('⚠️ [RESTAURANT REST] Items Collections API failed, trying Products API fallback');
      
      try {
        // Fallback: try to use products API
        const endpoint = `/stores-reader/v1/products/query`;
        
        const response = await this.makeRequest<{ products: any[] }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            query: {
              filter: JSON.stringify({ _id: { $in: itemIds } }),
              paging: { limit: 100 }
            }
          })
        }, false); // Try without authentication first (public API)

        const products = response.products || [];
        
        // Transform products to menu items
        const menuItems: WixMenuItem[] = products.map(product => ({
          _id: product.id || product._id,
          id: product.id || product._id,
          name: product.name || 'Menu Item',
          description: product.description || product.shortDescription || '',
          priceInfo: {
            price: product.priceData?.price?.toString() || product.price?.price || '0',
            currency: product.priceData?.currency || product.price?.currency || 'USD'
          },
          visible: true,
          image: product.media?.mainMedia?.image
        }));

        console.log(`✅ [RESTAURANT REST] Found ${menuItems.length} items via Products API`);
        return menuItems;
        
      } catch (fallbackError) {
        console.error('❌ [RESTAURANT REST] Both item API calls failed:', fallbackError);
        throw new Error('Unable to fetch menu items - API endpoints not accessible');
      }
    }
  }



  async getItem(itemId: string): Promise<WixMenuItem | null> {
    console.log(`🍽️ [RESTAURANT] Fetching single item: ${itemId}`);

    try {
      const items = await this.getItems([itemId]);
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error(`❌ [RESTAURANT] Error fetching item ${itemId}:`, error);
      return null;
    }
  }

  // === VARIANT OPERATIONS ===

  async getItemVariants(variantIds?: string[]): Promise<WixItemVariant[]> {
    console.log('🍽️ [RESTAURANT] Fetching item variants...');

    // Ensure client is initialized
    await this.ensureInitialized();

    try {
      if (this.shouldUseSDK() && this.wixClient && this.isInitialized) {
        return await this._getItemVariantsSDK(variantIds);
      } else {
        return await this._getItemVariantsREST(variantIds);
      }
    } catch (error) {
      console.error('❌ [RESTAURANT] Error fetching variants:', error);
      return [];
    }
  }

  private async _getItemVariantsSDK(variantIds?: string[]): Promise<WixItemVariant[]> {
    const response = await this.wixClient.itemVariants.listVariants();
    let variants = response.variants || [];
    
    if (variantIds?.length) {
      variants = variants.filter((v: any) => variantIds.includes(v._id || v.id));
    }
    
    console.log(`✅ [RESTAURANT SDK] Found ${variants.length} variants`);
    return variants;
  }

  private async _getItemVariantsREST(variantIds?: string[]): Promise<WixItemVariant[]> {
    console.log('🌐 [RESTAURANT REST] Fetching item variants');
    
    try {
      // Try to fetch variants using the Wix collections API
      const endpoint = `/wix-data/v1/collections/ItemVariants/items`;
      
      const filterObj: any = {};
      if (variantIds?.length) {
        filterObj._id = { $in: variantIds };
      }
      
      const response = await this.makeRequest<{ items: any[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          filter: filterObj,
          paging: { limit: 100 }
        })
      }, false); // Try without authentication first (public API)

      const items = response.items || [];
      
      // Transform the data to WixItemVariant format
      const variants: WixItemVariant[] = items.map(item => ({
        _id: item._id || item.id,
        id: item.id || item._id,
        name: item.name || item.title || 'Variant',
        description: item.description || '',
        choices: item.choices || item.options || []
      }));

      console.log(`✅ [RESTAURANT REST] Found ${variants.length} variants via Collections API`);
      return variants;
      
    } catch (error) {
      console.warn('⚠️ [RESTAURANT REST] Variants Collections API failed, trying fallback');
      
      try {
        // Fallback: try product variants from stores API
        const endpoint = `/stores-reader/v1/product-variants/query`;
        
        const response = await this.makeRequest<{ variants: any[] }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            query: {
              filter: variantIds?.length ? JSON.stringify({ _id: { $in: variantIds } }) : '{}',
              paging: { limit: 100 }
            }
          })
        }, false); // Try without authentication first (public API)

        const variants = response.variants || [];
        
        console.log(`✅ [RESTAURANT REST] Found ${variants.length} variants via fallback API`);
        return variants.map(v => ({
          _id: v.id || v._id,
          id: v.id || v._id,
          name: v.name || 'Variant',
          description: v.description || '',
          choices: v.choices || []
        }));
        
      } catch (fallbackError) {
        console.error('❌ [RESTAURANT REST] Both variant API calls failed:', fallbackError);
        // Return empty array instead of throwing - variants are optional
        return [];
      }
    }
  }

  // === LABEL OPERATIONS ===

  async getItemLabels(): Promise<WixItemLabel[]> {
    console.log('🍽️ [RESTAURANT] Fetching item labels...');

    // Ensure client is initialized
    await this.ensureInitialized();

    try {
      if (this.shouldUseSDK() && this.wixClient && this.isInitialized) {
        return await this._getItemLabelsSDK();
      } else {
        return await this._getItemLabelsREST();
      }
    } catch (error) {
      console.error('❌ [RESTAURANT] Error fetching labels:', error);
      return [];
    }
  }

  private async _getItemLabelsSDK(): Promise<WixItemLabel[]> {
    const response = await this.wixClient.itemLabels.listLabels();
    const labels = response.labels || [];
    
    console.log(`✅ [RESTAURANT SDK] Found ${labels.length} labels`);
    return labels;
  }

  private async _getItemLabelsREST(): Promise<WixItemLabel[]> {
    console.log('🌐 [RESTAURANT REST] Fetching item labels');
    
    try {
      // Try to fetch labels using the Wix collections API
      const endpoint = `/wix-data/v1/collections/ItemLabels/items`;
      
      const response = await this.makeRequest<{ items: any[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          filter: {},
          paging: { limit: 100 }
        })
      }, false); // Try without authentication first (public API)

      const items = response.items || [];
      
      // Transform the data to WixItemLabel format
      const labels: WixItemLabel[] = items.map(item => ({
        _id: item._id || item.id,
        id: item.id || item._id,
        name: item.name || item.title || 'Label',
        colorInfo: item.colorInfo || item.colors || { background: '#666', foreground: '#FFF' },
        iconUrl: item.iconUrl || item.icon || item.image?.url
      }));

      console.log(`✅ [RESTAURANT REST] Found ${labels.length} labels via Collections API`);
      return labels;
      
    } catch (error) {
      console.warn('⚠️ [RESTAURANT REST] Labels Collections API failed, trying fallback');
      
      try {
        // Fallback: try to get labels from product tags or categories
        const endpoint = `/stores-reader/v1/collections/query`;
        
        const response = await this.makeRequest<{ collections: any[] }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            query: {
              filter: '{}',
              paging: { limit: 50 }
            }
          })
        }, false); // Try without authentication first (public API)

        const collections = response.collections || [];
        
        // Transform collections to labels
        const labels: WixItemLabel[] = collections.map((collection, index) => ({
          _id: collection.id || collection._id || `label-${index}`,
          id: collection.id || collection._id || `label-${index}`,
          name: collection.name || 'Label',
          colorInfo: { background: '#666', foreground: '#FFF' },
          iconUrl: collection.media?.mainMedia?.image?.url
        }));

        console.log(`✅ [RESTAURANT REST] Found ${labels.length} labels via fallback API`);
        return labels;
        
      } catch (fallbackError) {
        console.error('❌ [RESTAURANT REST] Both label API calls failed:', fallbackError);
        // Return empty array instead of throwing - labels are optional
        return [];
      }
    }
  }

  // === FIRST COMPLETE MENU STRUCTURE METHOD REMOVED (duplicate) ===

  // === UTILITY METHODS ===

  async testConnection(): Promise<boolean> {
    console.log('🔍 [RESTAURANT] Testing connection...');
    
    try {
      await this.getMenus();
      console.log('✅ [RESTAURANT] Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ [RESTAURANT] Connection test failed:', error);
      return false;
    }
  }

  // Override cache management for restaurant-specific keys
  async clearCache(): Promise<void> {
    await Promise.all([
      this.clearCachedData(CACHE_KEYS.MENUS, CACHE_KEYS.MENUS_TIMESTAMP),
    ]);
    console.log('🗑️ [RESTAURANT CACHE] All restaurant caches cleared');
  }

  async getCacheInfo(): Promise<{ menus: boolean; sections: boolean; items: boolean }> {
    return {
      menus: await this.isCacheValid(CACHE_KEYS.MENUS_TIMESTAMP),
      sections: false, // Sections are not cached individually
      items: false, // Items are not cached individually
    };
  }

  // === COMPLETE MENU STRUCTURE ===

  /**
   * Get a complete menu structure with menus, sections, and items
   * This method orchestrates multiple API calls to provide a complete view
   */
  async getCompleteMenuStructure(): Promise<{
    menus: WixMenu[];
    sections: WixMenuSection[];
    items: WixMenuItem[];
    variants?: WixItemVariant[];
    labels?: WixItemLabel[];
  }> {
    console.log('🍽️ [RESTAURANT] Fetching complete menu structure...');

    try {
      await this.ensureInitialized();

      // Check if SDK is enabled or if we should use REST API
      if (featureManager.isRestaurantSDKEnabled() && this.wixClient) {
        console.log('🔄 [RESTAURANT] Using SDK methods (Official Wix Recipe)...');
        return await this._getCompleteMenuStructureViaSDK();
      } else {
        console.log('🔄 [RESTAURANT] Using REST API fallback methods...');
        return await this._getCompleteMenuStructureViaREST();
      }

    } catch (error) {
      console.error('❌ [RESTAURANT] Error fetching complete menu structure:', error);
      throw this.createDomainError('Failed to fetch complete menu structure');
    }
  }

  private async _getCompleteMenuStructureViaSDK(): Promise<{
    menus: WixMenu[];
    sections: WixMenuSection[];
    items: WixMenuItem[];
    variants?: WixItemVariant[];
    labels?: WixItemLabel[];
  }> {
    // STEP 1: Fetch visible menus using Official Wix Recipe Pattern
    console.log('📋 [RESTAURANT SDK] Step 1: Fetching visible menus (Official Recipe)...');
    const menusRes = await this.wixClient.menus.listMenus({ onlyVisible: true });
    const menus = menusRes.menus || [];
    console.log(`✅ [RESTAURANT SDK] Found ${menus.length} visible menus`);

    if (menus.length === 0) {
      console.log('⚠️ [RESTAURANT SDK] No visible menus found - check if Wix Restaurants Menus (New) app is installed');
      return { menus: [], sections: [], items: [], variants: [], labels: [] };
    }

    // STEP 2: Collect sectionIds and fetch sections using Official Recipe Pattern
    console.log('📂 [RESTAURANT SDK] Step 2: Collecting section IDs and fetching sections...');
    const sectionIds = menus.flatMap((menu: any) => menu.sectionIds?.filter(Boolean) || []);
    console.log(`🔍 [RESTAURANT SDK] Found ${sectionIds.length} section IDs`);
    
    const sectionsRes = sectionIds.length > 0 
      ? await this.wixClient.sections.listSections({ sectionIds, onlyVisible: true })
      : { sections: [] };
    const sections = sectionsRes.sections || [];
    console.log(`✅ [RESTAURANT SDK] Found ${sections.length} visible sections`);

    // STEP 3: Collect itemIds and fetch items using Official Recipe Pattern
    console.log('🍽️ [RESTAURANT SDK] Step 3: Collecting item IDs and fetching items...');
    const itemIds = sections.flatMap((section: any) => section.itemIds?.filter(Boolean) || []);
    console.log(`🔍 [RESTAURANT SDK] Found ${itemIds.length} item IDs`);
    
    const itemsRes = itemIds.length > 0
      ? await this.wixClient.items.listItems({ itemIds, onlyVisible: true })
      : { items: [] };
    const items = itemsRes.items || [];
    console.log(`✅ [RESTAURANT SDK] Found ${items.length} visible items`);

    // STEP 4: Collect price variant IDs and fetch variants using Official Recipe Pattern
    console.log('💰 [RESTAURANT SDK] Step 4: Collecting variant IDs and fetching variants...');
    let variantIds = items.flatMap((item: any) =>
      item.priceVariants?.variants?.map((v: any) => v.variantId).filter(Boolean) || []
    );
    variantIds = variantIds.filter((id: any) => typeof id === 'string');
    console.log(`🔍 [RESTAURANT SDK] Found ${variantIds.length} variant IDs`);
    
    const variants = variantIds.length > 0
      ? (await this.wixClient.itemVariants.listVariants({ variantIds })).variants || []
      : [];
    console.log(`✅ [RESTAURANT SDK] Found ${variants.length} variants`);

    // STEP 5: Fetch all available item labels using Official Recipe Pattern
    console.log('🏷️ [RESTAURANT SDK] Step 5: Fetching all labels...');
    const labelsRes = await this.wixClient.itemLabels.listLabels();
    const labels = labelsRes.labels || [];
    console.log(`✅ [RESTAURANT SDK] Found ${labels.length} labels`);

    console.log('🎉 [RESTAURANT SDK] Complete menu structure loaded (Official Wix Recipe):', {
      menus: menus.length,
      sections: sections.length,
      items: items.length,
      variants: variants.length,
      labels: labels.length,
    });

    return { menus, sections, items, variants, labels };
  }

  private async _getCompleteMenuStructureViaREST(): Promise<{
    menus: WixMenu[];
    sections: WixMenuSection[];
    items: WixMenuItem[];
    variants?: WixItemVariant[];
    labels?: WixItemLabel[];
  }> {
    // STEP 1: Fetch menus using REST API
    console.log('📋 [RESTAURANT REST] Step 1: Fetching menus via REST API...');
    const menus = await this._getMenusREST();
    console.log(`✅ [RESTAURANT REST] Found ${menus.length} menus`);

    if (menus.length === 0) {
      console.log('⚠️ [RESTAURANT REST] No menus found');
      return { menus: [], sections: [], items: [], variants: [], labels: [] };
    }

    // STEP 2: Collect sectionIds and fetch sections
    console.log('📂 [RESTAURANT REST] Step 2: Collecting section IDs and fetching sections...');
    const sectionIds = menus.flatMap(menu => menu.sectionIds?.filter(Boolean) || []);
    console.log(`🔍 [RESTAURANT REST] Found ${sectionIds.length} section IDs`);
    
    const sections = sectionIds.length > 0 
      ? await this._getSectionsREST(sectionIds)
      : [];
    console.log(`✅ [RESTAURANT REST] Found ${sections.length} sections`);

    // STEP 3: Collect itemIds and fetch items
    console.log('🍽️ [RESTAURANT REST] Step 3: Collecting item IDs and fetching items...');
    const itemIds = sections.flatMap(section => section.itemIds?.filter(Boolean) || []);
    console.log(`🔍 [RESTAURANT REST] Found ${itemIds.length} item IDs`);
    
    const items = itemIds.length > 0
      ? await this._getItemsREST(itemIds)
      : [];
    console.log(`✅ [RESTAURANT REST] Found ${items.length} items`);

    console.log('🎉 [RESTAURANT REST] Complete menu structure loaded via REST API:', {
      menus: menus.length,
      sections: sections.length,
      items: items.length,
    });

    // For REST API, we don't have variants and labels support yet
    return { menus, sections, items, variants: [], labels: [] };
  }

}

// Export singleton instance
export const wixRestaurantClient = new WixRestaurantClient();

// Export utility functions
export const formatRestaurantPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export const safeRestaurantString = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return fallback;
};

export const extractCurrency = (priceString: string): string => {
  // Extract currency from formatted price string
  const match = priceString.match(/[A-Z]{3}/);
  return match ? match[0] : 'USD';
};
