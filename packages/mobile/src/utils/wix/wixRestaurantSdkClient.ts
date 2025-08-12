import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId, getSiteId, getApiBaseUrl } from '../../config/wixConfig';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { menus, sections, items, itemVariants, itemLabels } from '@wix/restaurants';
import { wixApiClient } from '../wixApiClient';

// === TYPES (from Wix SDK) ===
export interface RestaurantMenu {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  sectionIds?: string[];
  visible?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export interface MenuSection {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  itemIds?: string[];
  visible?: boolean;
}

export interface MenuItem {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  priceInfo?: { price?: string; currency?: string };
  priceVariants?: { variants?: Array<{ variantId?: string; priceInfo?: { price?: string; currency?: string } }> };
  image?: { url?: string };
  labels?: Array<{ id?: string; labelId?: string }>;
  visible?: boolean;
}

export interface ItemVariant {
  _id?: string;
  id?: string;
  name?: string;
}

export interface ItemLabel {
  _id?: string;
  id?: string;
  name?: string;
}

// === CACHE CONFIGURATION ===
const RESTAURANT_CACHE_KEYS = {
  MENUS: 'wix_restaurant_sdk_menus_cache',
  SECTIONS: 'wix_restaurant_sdk_sections_cache',
  ITEMS: 'wix_restaurant_sdk_items_cache',
  VARIANTS: 'wix_restaurant_sdk_variants_cache',
  LABELS: 'wix_restaurant_sdk_labels_cache',
  VISITOR_TOKENS: 'wix_visitor_tokens',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class WixRestaurantSdkClient {
  private siteId = getSiteId();
  private clientId = getClientId();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private wixClient: any;
  private isInitialized = false;

  constructor() {
    console.log('🍽️ [RESTAURANT SDK] Initializing Wix Restaurant SDK client');
    console.log('🍽️ [RESTAURANT SDK] Site ID:', this.siteId);
    console.log('🍽️ [RESTAURANT SDK] Client ID:', this.clientId);
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // Use the existing wixApiClient for authentication
      console.log('🔑 [RESTAURANT SDK] Leveraging existing authentication...');
      
      // Create Wix client with restaurant modules, no initial auth
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

      // Generate visitor tokens using our own method
      await this.generateVisitorTokens();

      this.isInitialized = true;
      console.log('✅ [RESTAURANT SDK] Client initialized successfully');
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Failed to initialize client:', error);
      console.log('💡 [RESTAURANT SDK] Will fall back to mock data for demo purposes');
      this.isInitialized = false;
    }
  }

  private async generateVisitorTokens(): Promise<void> {
    try {
      console.log('🔄 [RESTAURANT SDK] Generating visitor tokens...');
      const tokens = await this.wixClient.auth.generateVisitorTokens();
      console.log('✅ [RESTAURANT SDK] Visitor tokens generated successfully');
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Failed to generate visitor tokens:', error);
      console.log('💡 [RESTAURANT SDK] This is expected in some environments, will use mock data');
      // Don't throw error, just log it and use mock data
    }
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  }

  private getCachedData<T>(key: string): T | null {
    if (this.isValidCache(key)) {
      console.log(`✅ [CACHE] Using cached data for ${key}`);
      return this.cache.get(key)?.data || null;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getMenus(): Promise<RestaurantMenu[]> {
    const cacheKey = RESTAURANT_CACHE_KEYS.MENUS;
    const cached = this.getCachedData<RestaurantMenu[]>(cacheKey);
    if (cached) return cached;

    if (!this.isInitialized) {
      console.log('⚠️ [RESTAURANT SDK] Client not initialized, using mock data');
      return this.getMockMenus();
    }

    try {
      console.log('📋 [RESTAURANT SDK] Fetching menus via SDK');
      const response = await this.wixClient.menus.listMenus();
      const menusData = response.menus || [];
      this.setCachedData(cacheKey, menusData);
      console.log(`📋 [RESTAURANT SDK] Fetched ${menusData.length} menus via SDK`);
      return menusData;
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Error fetching menus:', error);
      console.log('💡 [RESTAURANT SDK] Falling back to mock data');
      return this.getMockMenus();
    }
  }

  async getSections(sectionIds: string[]): Promise<MenuSection[]> {
    if (sectionIds.length === 0) return [];
    
    const cacheKey = `${RESTAURANT_CACHE_KEYS.SECTIONS}_${sectionIds.sort().join(',')}`;
    const cached = this.getCachedData<MenuSection[]>(cacheKey);
    if (cached) return cached;

    if (!this.isInitialized) {
      console.log('⚠️ [RESTAURANT SDK] Client not initialized, using mock data');
      return this.getMockSections();
    }

    try {
      console.log(`📂 [RESTAURANT SDK] Fetching ${sectionIds.length} sections via SDK`);
      const response = await this.wixClient.sections.querySections()
        .in('_id', sectionIds)
        .find();
      const sectionsData = response.items || [];
      this.setCachedData(cacheKey, sectionsData);
      console.log(`📂 [RESTAURANT SDK] Fetched ${sectionsData.length} sections via SDK`);
      return sectionsData;
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Error fetching sections:', error);
      console.log('💡 [RESTAURANT SDK] Falling back to mock sections');
      return this.getMockSections();
    }
  }

  async getItems(itemIds: string[]): Promise<MenuItem[]> {
    if (itemIds.length === 0) return [];
    
    const cacheKey = `${RESTAURANT_CACHE_KEYS.ITEMS}_${itemIds.sort().join(',')}`;
    const cached = this.getCachedData<MenuItem[]>(cacheKey);
    if (cached) return cached;

    if (!this.isInitialized) {
      console.log('⚠️ [RESTAURANT SDK] Client not initialized, using mock data');
      return this.getMockItems();
    }

    try {
      console.log(`🍽️ [RESTAURANT SDK] Fetching ${itemIds.length} items via SDK`);
      const response = await this.wixClient.items.queryItems()
        .in('_id', itemIds)
        .find();
      const itemsData = response.items || [];
      this.setCachedData(cacheKey, itemsData);
      console.log(`🍽️ [RESTAURANT SDK] Fetched ${itemsData.length} items via SDK`);
      
      // Debug: Log sample item image data
      if (itemsData.length > 0) {
        const sampleItem = itemsData[0];
        console.log(`🖼️ [RESTAURANT SDK] Sample item raw data:`, {
          name: sampleItem.name,
          image: sampleItem.image,
          imageUrl: sampleItem.image?.url
        });
      }
      return itemsData;
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Error fetching items:', error);
      console.log('💡 [RESTAURANT SDK] Falling back to mock items');
      return this.getMockItems();
    }
  }

  async getVariants(variantIds: string[]): Promise<ItemVariant[]> {
    if (variantIds.length === 0) return [];
    
    const cacheKey = `${RESTAURANT_CACHE_KEYS.VARIANTS}_${variantIds.sort().join(',')}`;
    const cached = this.getCachedData<ItemVariant[]>(cacheKey);
    if (cached) return cached;

    if (!this.isInitialized) {
      console.log('⚠️ [RESTAURANT SDK] Client not initialized, using mock data');
      return this.getMockItemVariants();
    }

    try {
      console.log(`🔧 [RESTAURANT SDK] Fetching ${variantIds.length} variants via SDK`);
      const response = await this.wixClient.itemVariants.listVariants();
      const allVariants = response.variants || [];
      // Filter to requested IDs
      const variantsData = allVariants.filter((variant: any) => 
        variantIds.includes(variant._id || variant.id)
      );
      this.setCachedData(cacheKey, variantsData);
      console.log(`🔧 [RESTAURANT SDK] Fetched ${variantsData.length} variants via SDK`);
      return variantsData;
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Error fetching variants:', error);
      console.log('💡 [RESTAURANT SDK] Falling back to mock variants');
      return this.getMockItemVariants();
    }
  }

  async getLabels(labelIds: string[]): Promise<ItemLabel[]> {
    if (labelIds.length === 0) return [];
    
    const cacheKey = `${RESTAURANT_CACHE_KEYS.LABELS}_${labelIds.sort().join(',')}`;
    const cached = this.getCachedData<ItemLabel[]>(cacheKey);
    if (cached) return cached;

    if (!this.isInitialized) {
      console.log('⚠️ [RESTAURANT SDK] Client not initialized, using mock data');
      return this.getMockItemLabels();
    }

    try {
      console.log(`🏷️ [RESTAURANT SDK] Fetching ${labelIds.length} labels via SDK`);
      const response = await this.wixClient.itemLabels.listLabels();
      const allLabels = response.labels || [];
      // Filter to requested IDs
      const labelsData = allLabels.filter((label: any) => 
        labelIds.includes(label._id || label.id)
      );
      this.setCachedData(cacheKey, labelsData);
      console.log(`🏷️ [RESTAURANT SDK] Fetched ${labelsData.length} labels via SDK`);
      return labelsData;
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Error fetching labels:', error);
      console.log('💡 [RESTAURANT SDK] Falling back to mock labels');
      return this.getMockItemLabels();
    }
  }

  async getCompleteMenuStructure(): Promise<{
    menus: RestaurantMenu[];
    sections: MenuSection[];
    items: MenuItem[];
    variants: ItemVariant[];
    labels: ItemLabel[];
  }> {
    try {
      console.log('🏗️ [RESTAURANT SDK] Fetching complete menu structure via SDK');
      
      const menus = await this.getMenus();
      const sectionIds = menus.flatMap(menu => menu.sectionIds?.filter(Boolean) || []);
      const sections = sectionIds.length > 0 ? await this.getSections(sectionIds) : [];
      const itemIds = sections.flatMap(section => section.itemIds?.filter(Boolean) || []);
      const items = itemIds.length > 0 ? await this.getItems(itemIds) : [];
      
      // Get variant and label IDs from items
      const variantIds = items.flatMap(item => 
        item.priceVariants?.variants?.map(v => v.variantId).filter(Boolean) || []
      );
      const labelIds = items.flatMap(item => 
        item.labels?.map(l => l.labelId).filter(Boolean) || []
      );
      
      const variants = variantIds.length > 0 ? await this.getVariants(variantIds) : [];
      const labels = labelIds.length > 0 ? await this.getLabels(labelIds) : [];

      console.log(`✅ [RESTAURANT SDK] Complete structure: ${menus.length} menus, ${sections.length} sections, ${items.length} items, ${variants.length} variants, ${labels.length} labels`);
      return { menus, sections, items, variants, labels };
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Error fetching complete menu structure:', error);
      console.log('🏗️ [RESTAURANT SDK] Using mock complete menu structure');
      return {
        menus: this.getMockMenus(),
        sections: this.getMockSections(),
        items: this.getMockItems(),
        variants: this.getMockItemVariants(),
        labels: this.getMockItemLabels(),
      };
    }
  }

  async testConnection(): Promise<boolean> {
    console.log('🔍 [RESTAURANT SDK] Testing SDK connection');
    try {
      if (!this.isInitialized) {
        await this.initializeClient();
      }
      
      const menus = await this.getMenus();
      console.log(`✅ [RESTAURANT SDK] Connection successful - found ${menus.length} menus`);
      return true;
    } catch (error) {
      console.error('❌ [RESTAURANT SDK] Connection failed:', error);
      return false;
    }
  }

  // Mock data methods (same as previous implementations)
  private getMockMenus(): RestaurantMenu[] {
    return [
      {
        _id: 'mock-menu-1',
        id: 'mock-menu-1',
        name: 'Main Menu',
        description: 'Our delicious main menu',
        sectionIds: ['mock-section-1', 'mock-section-2', 'mock-section-3'],
        visible: true,
      },
    ];
  }

  private getMockSections(): MenuSection[] {
    return [
      {
        _id: 'mock-section-1',
        id: 'mock-section-1',
        name: 'Appetizers',
        description: 'Start your meal right',
        itemIds: ['mock-item-1', 'mock-item-2'],
        visible: true,
      },
      {
        _id: 'mock-section-2',
        id: 'mock-section-2',
        name: 'Main Courses',
        description: 'Hearty main dishes',
        itemIds: ['mock-item-3', 'mock-item-4'],
        visible: true,
      },
      {
        _id: 'mock-section-3',
        id: 'mock-section-3',
        name: 'Desserts',
        description: 'Sweet endings',
        itemIds: ['mock-item-5', 'mock-item-6'],
        visible: true,
      },
    ];
  }

  private getMockItems(): MenuItem[] {
    return [
      {
        _id: 'mock-item-1',
        id: 'mock-item-1',
        name: 'Bruschetta',
        description: 'Fresh tomatoes on toasted bread',
        priceInfo: { price: '8.50', currency: 'USD' },
        image: { url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' },
        visible: true,
      },
      {
        _id: 'mock-item-2',
        id: 'mock-item-2',
        name: 'Caesar Salad',
        description: 'Classic caesar with parmesan',
        priceInfo: { price: '12.00', currency: 'USD' },
        image: { url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
        visible: true,
      },
      {
        _id: 'mock-item-3',
        id: 'mock-item-3',
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon',
        priceInfo: { price: '24.00', currency: 'USD' },
        image: { url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400' },
        visible: true,
      },
      {
        _id: 'mock-item-4',
        id: 'mock-item-4',
        name: 'Beef Ribeye',
        description: 'Premium 12oz ribeye steak',
        priceInfo: { price: '32.00', currency: 'USD' },
        image: { url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
        visible: true,
      },
      {
        _id: 'mock-item-5',
        id: 'mock-item-5',
        name: 'Chocolate Cake',
        description: 'Rich chocolate layer cake',
        priceInfo: { price: '8.00', currency: 'USD' },
        image: { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
        visible: true,
      },
      {
        _id: 'mock-item-6',
        id: 'mock-item-6',
        name: 'Tiramisu',
        description: 'Classic Italian dessert',
        priceInfo: { price: '9.50', currency: 'USD' },
        image: { url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
        visible: true,
      },
    ];
  }

  private getMockItemVariants(): ItemVariant[] {
    return [
      {
        _id: 'mock-variant-1',
        id: 'mock-variant-1',
        name: 'Small',
      },
      {
        _id: 'mock-variant-2',
        id: 'mock-variant-2',
        name: 'Large',
      },
    ];
  }

  private getMockItemLabels(): ItemLabel[] {
    return [
      {
        _id: 'mock-label-1',
        id: 'mock-label-1',
        name: 'Vegetarian',
      },
      {
        _id: 'mock-label-2',
        id: 'mock-label-2',
        name: 'Gluten Free',
      },
    ];
  }
}

export const wixRestaurantSdkClient = new WixRestaurantSdkClient();
