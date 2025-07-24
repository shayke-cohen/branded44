import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientId, getSiteId, getStoresAppId, getApiBaseUrl } from '../config/wixConfig';
import { createClient, ApiKeyStrategy, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';

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

// Member authentication types
interface MemberTokens {
  accessToken: {
    value: string;
    expiresAt: number;
  };
  refreshToken: {
    value: string;
  };
}

interface MemberProfile {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  picture?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  privacyStatus?: 'PUBLIC' | 'PRIVATE' | 'UNDEFINED';
}

interface MemberIdentity {
  id: string;
  email: {
    address: string;
    isVerified: boolean;
  };
  identityProfile: MemberProfile;
  status: {
    name: string;
    reasons: string[];
  };
}

interface AuthResponse {
  state: 'SUCCESS' | 'REQUIRE_EMAIL_VERIFICATION' | 'REQUIRE_OWNER_APPROVAL' | 'STATUS_CHECK';
  sessionToken?: string;
  stateToken?: string;
  identity: MemberIdentity;
}

// CMS Types for data collections
export interface WixDataItem {
  _id?: string;
  _createdDate?: string;
  _updatedDate?: string;
  [key: string]: any; // Allow dynamic fields
}

export interface WixCollection {
  id: string;
  displayName: string;
  fields: Array<{
    key: string;
    type: string;
    displayName: string;
  }>;
}

export interface WixDataQuery {
  filter?: Record<string, any>;
  sort?: Array<{ fieldName: string; order: 'asc' | 'desc' }>;
  limit?: number;
  skip?: number;
}

export interface WixDataResponse<T = WixDataItem> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class WixCmsClient {
  private wixClient: any;
  private siteId = getSiteId();
  private clientId = getClientId();
  private authToken: string | null = null;
  private visitorTokens: any = null;

  constructor() {
    console.log('🗄️ [DEBUG] WixCmsClient initialized');
    console.log(`🗄️ [DEBUG] Using Client ID: ${this.clientId}`);
    console.log(`🗄️ [DEBUG] Using Site ID: ${this.siteId}`);
    this.initializeClient();
    this.loadStoredAuth();
  }

  private async loadStoredAuth() {
    try {
      const storedVisitorTokens = await AsyncStorage.getItem('wix_visitor_tokens');
      if (storedVisitorTokens) {
        this.visitorTokens = JSON.parse(storedVisitorTokens);
        await this.updateClientAuth();
      }
    } catch (error) {
      console.error('❌ [CMS ERROR] Failed to load stored auth:', error);
    }
  }

  private initializeClient() {
    // Initialize the Wix SDK client
    this.wixClient = createClient({
      modules: { items },
    });
    console.log('✅ [CMS] Wix SDK client initialized');
  }

  private async updateClientAuth() {
    if (this.visitorTokens?.accessToken) {
      // Use OAuth strategy with visitor tokens
      this.wixClient = createClient({
        modules: { items },
        auth: OAuthStrategy({
          clientId: this.clientId,
          tokens: {
            accessToken: this.visitorTokens.accessToken,
            refreshToken: this.visitorTokens.refreshToken,
          },
        }),
      });
      console.log('✅ [CMS] Client authenticated with visitor tokens');
    }
  }

  // Ensure we have valid authentication before making CMS calls
  private async ensureAuthenticated(): Promise<void> {
    try {
      // Check if we have stored visitor tokens from the main API client
      const storedVisitorTokens = await AsyncStorage.getItem('wix_visitor_tokens');
      if (storedVisitorTokens) {
        const tokens = JSON.parse(storedVisitorTokens);
        
        // Check if tokens are still valid (basic check)
        const currentTime = Math.floor(Date.now() / 1000);
        if (tokens.expiresAt > currentTime + 300) { // 5 minute buffer
          this.visitorTokens = tokens;
          await this.updateClientAuth();
          return;
        }
      }

      console.warn('⚠️ [CMS] No valid visitor tokens found. CMS operations may require authentication.');
      console.warn('ℹ️ [CMS] Ensure the main wixApiClient has been initialized first.');
    } catch (error) {
      console.error('❌ [CMS ERROR] Failed to ensure authentication:', error);
    }
  }

  // Ensure Wix Data is enabled by provisioning Velo if needed
  async ensureWixDataEnabled(): Promise<void> {
    try {
      console.log('🔍 [CMS] Checking if Wix Data is enabled...');
      
      // Try to list collections first to see if Wix Data is enabled
      const testUrl = `https://www.wixapis.com/wix-data/v2/collections?paging.limit=1`;
      const testHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
      };

      if (this.visitorTokens?.accessToken) {
        testHeaders['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
      }

      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: testHeaders,
      });

      if (testResponse.ok) {
        console.log('✅ [CMS] Wix Data is already enabled');
        return;
      }

      if (testResponse.status === 404) {
        console.log('⚙️ [CMS] Wix Data not enabled, provisioning Velo...');
        
        // Provision Wix Code (Velo) to enable Wix Data
        const provisionUrl = `https://www.wixapis.com/mcp-serverless/v1/velo/provision/`;
        const provisionResponse = await fetch(provisionUrl, {
          method: 'POST',
          headers: testHeaders,
          body: '{}',
        });

        if (provisionResponse.ok) {
          console.log('✅ [CMS] Velo provisioned successfully, Wix Data is now enabled');
        } else {
          const errorText = await provisionResponse.text();
          console.warn(`⚠️ [CMS] Failed to provision Velo: ${provisionResponse.status}: ${errorText}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ [CMS] Failed to check/enable Wix Data:', error);
    }
  }



  // Get all collections in the site
  async getCollections(): Promise<WixCollection[]> {
    try {
      await this.ensureAuthenticated();
      await this.ensureWixDataEnabled();
      
      console.log('🗄️ [CMS] Fetching collections...');
      
      // Use correct Wix Data REST API endpoint
      const endpoint = `/wix-data/v2/collections`;
      const url = `https://www.wixapis.com${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
      };

      // Add visitor auth token
      if (this.visitorTokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
      }

      console.log(`🌐 [CMS API] GET ${endpoint}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [CMS API ERROR] ${response.status}:`, errorText);
        
        if (response.status === 403) {
          console.error('❌ [CMS] Insufficient permissions for CMS access. Visitor tokens cannot access data collections.');
          console.error('💡 [CMS] CMS operations require elevated permissions (admin/API key authentication).');
        } else if (response.status === 404) {
          console.error('❌ [CMS] Wix Data may not be enabled on this site');
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [CMS API SUCCESS] ${endpoint}:`, Object.keys(data).join(', '));
      
      const collections = (data.collections || []).map((collection: any) => ({
        id: collection.id,
        displayName: collection.displayName || collection.id,
        fields: collection.fields || [],
      }));

      console.log(`✅ [CMS] Found ${collections.length} collections`);
      return collections;
    } catch (error) {
      console.error('❌ [CMS ERROR] Failed to fetch collections:', error);
      return [];
    }
  }

  // Get available collections (read-only mode for visitor tokens)
  async getAvailableCollections(): Promise<WixCollection[]> {
    // Since visitor tokens can't list collections metadata (403 error),
    // we'll return the known collections that have public read access
    const knownCollections: WixCollection[] = [
      {
        id: 'demo-products',
        displayName: 'Demo Products',
        fields: [
          { key: 'name', displayName: 'Product Name', type: 'TEXT' },
          { key: 'description', displayName: 'Description', type: 'TEXT' },
          { key: 'price', displayName: 'Price', type: 'NUMBER' },
          { key: 'inStock', displayName: 'In Stock', type: 'BOOLEAN' },
        ],
      },
      {
        id: 'demo-blog-posts',
        displayName: 'Demo Blog Posts',
        fields: [
          { key: 'title', displayName: 'Title', type: 'TEXT' },
          { key: 'content', displayName: 'Content', type: 'RICH_TEXT' },
          { key: 'author', displayName: 'Author', type: 'TEXT' },
          { key: 'publishDate', displayName: 'Publish Date', type: 'DATE' },
          { key: 'published', displayName: 'Published', type: 'BOOLEAN' },
        ],
      },
    ];

    console.log('✅ [CMS] Using known collections with public read access');
    return knownCollections;
  }

  // Query items from a specific collection
  async queryCollection<T = WixDataItem>(
    collectionId: string,
    query: WixDataQuery = {}
  ): Promise<WixDataResponse<T>> {
    try {
      await this.ensureAuthenticated();
      await this.ensureWixDataEnabled();
      
      console.log(`🗄️ [CMS] Querying collection: ${collectionId}`);
      console.log(`🗄️ [CMS] Query parameters:`, JSON.stringify(query, null, 2));

      // Use correct Wix Data REST API endpoint
      const endpoint = `/wix-data/v2/items/query`;
      const url = `https://www.wixapis.com${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
      };

      // Add visitor auth token
      if (this.visitorTokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
      }

      // Build request body according to REST API schema
      const requestBody: any = {
        dataCollectionId: collectionId,
        query: {},
        returnTotalCount: true,
      };

      // Apply filters
      if (query.filter) {
        requestBody.query.filter = query.filter;
      }

      // Apply sorting
      if (query.sort && query.sort.length > 0) {
        requestBody.query.sort = query.sort.map(({ fieldName, order }) => ({
          fieldName,
          order: order.toUpperCase(),
        }));
      }

      // Apply pagination
      if (query.limit || query.skip) {
        requestBody.query.paging = {};
        if (query.limit) {
          requestBody.query.paging.limit = query.limit;
        }
        if (query.skip) {
          requestBody.query.paging.offset = query.skip;
        }
      }

      console.log(`🌐 [CMS API] POST ${endpoint}`);
      console.log(`🌐 [CMS API] Request body:`, JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [CMS API ERROR] ${response.status}:`, errorText);
        
        if (response.status === 404) {
          console.error('❌ [CMS] Collection not found or Wix Data may not be enabled');
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [CMS API SUCCESS] ${endpoint}:`, Object.keys(data).join(', '));
      
      console.log(`✅ [CMS] Found ${data.dataItems?.length || 0} items in collection ${collectionId}`);
      
      return {
        items: (data.dataItems || []).map((item: any) => item.data) as T[],
        totalCount: data.pagingMetadata?.total || data.dataItems?.length || 0,
        hasNext: !!data.pagingMetadata?.cursors?.next,
        hasPrev: !!data.pagingMetadata?.cursors?.prev,
      };
    } catch (error) {
      console.error(`❌ [CMS ERROR] Failed to query collection ${collectionId}:`, error);
      return {
        items: [],
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
      };
    }
  }

  // Get a single item by ID
  async getItem<T = WixDataItem>(collectionId: string, itemId: string): Promise<T | null> {
    try {
      await this.ensureAuthenticated();
      
      console.log(`🗄️ [CMS] Getting item ${itemId} from collection ${collectionId}`);
      
      const response = await this.wixClient.items.getDataItem(itemId, {
        dataCollectionId: collectionId,
      });
      
      console.log(`✅ [CMS] Retrieved item ${itemId}`);
      return response.dataItem as T;
    } catch (error) {
      console.error(`❌ [CMS ERROR] Failed to get item ${itemId}:`, error);
      return null;
    }
  }

  // Insert a new item
  async insertItem<T = WixDataItem>(collectionId: string, data: Partial<T>): Promise<T | null> {
    try {
      await this.ensureAuthenticated();
      await this.ensureWixDataEnabled();
      
      console.log(`🗄️ [CMS] Inserting item into collection ${collectionId}`);
      console.log(`🗄️ [CMS] Item data:`, JSON.stringify(data, null, 2));
      
      // Use correct Wix Data REST API endpoint
      const endpoint = `/wix-data/v2/items`;
      const url = `https://www.wixapis.com${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
      };

      // Add visitor auth token
      if (this.visitorTokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
      }

      // Build request body according to REST API schema
      const requestBody = {
        dataCollectionId: collectionId,
        dataItem: {
          data: data,
        },
      };

      console.log(`🌐 [CMS API] POST ${endpoint}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [CMS API ERROR] ${response.status}:`, errorText);
        
        if (response.status === 404) {
          console.error('❌ [CMS] Collection not found or Wix Data may not be enabled');
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log(`✅ [CMS API SUCCESS] ${endpoint}:`, Object.keys(responseData).join(', '));
      
      console.log(`✅ [CMS] Inserted item with ID: ${responseData.dataItem?.id}`);
      return responseData.dataItem?.data as T;
    } catch (error) {
      console.error(`❌ [CMS ERROR] Failed to insert item into collection ${collectionId}:`, error);
      return null;
    }
  }

  // Update an existing item
  async updateItem<T = WixDataItem>(
    collectionId: string,
    itemId: string,
    data: Partial<T>
  ): Promise<T | null> {
    try {
      await this.ensureAuthenticated();
      
      console.log(`🗄️ [CMS] Updating item ${itemId} in collection ${collectionId}`);
      console.log(`🗄️ [CMS] Update data:`, JSON.stringify(data, null, 2));
      
      const response = await this.wixClient.items.updateDataItem(itemId, {
        dataCollectionId: collectionId,
        dataItem: { ...data, _id: itemId },
      });
      
      console.log(`✅ [CMS] Updated item ${itemId}`);
      return response.dataItem as T;
    } catch (error) {
      console.error(`❌ [CMS ERROR] Failed to update item ${itemId}:`, error);
      return null;
    }
  }

  // Delete an item
  async deleteItem(collectionId: string, itemId: string): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      
      console.log(`🗄️ [CMS] Deleting item ${itemId} from collection ${collectionId}`);
      
      await this.wixClient.items.removeDataItem(itemId, {
        dataCollectionId: collectionId,
      });
      
      console.log(`✅ [CMS] Deleted item ${itemId}`);
      return true;
    } catch (error) {
      console.error(`❌ [CMS ERROR] Failed to delete item ${itemId}:`, error);
      return false;
    }
  }

  // Helper method to search items by text across multiple fields
  async searchItems<T = WixDataItem>(
    collectionId: string,
    searchTerm: string,
    searchFields: string[] = [],
    limit: number = 20
  ): Promise<WixDataResponse<T>> {
    try {
      if (!searchTerm.trim()) {
        return this.queryCollection<T>(collectionId, { limit });
      }

      // If no specific fields provided, search in common text fields
      if (searchFields.length === 0) {
        searchFields = ['title', 'name', 'description', 'content'];
      }

      // Build OR query for multiple fields
      const filters = searchFields.reduce((acc, field) => {
        acc[field] = { $contains: searchTerm };
        return acc;
      }, {} as Record<string, any>);

      return this.queryCollection<T>(collectionId, {
        filter: filters,
        limit,
        sort: [{ fieldName: '_createdDate', order: 'desc' }],
      });
    } catch (error) {
      console.error(`❌ [CMS ERROR] Failed to search items in collection ${collectionId}:`, error);
      return {
        items: [],
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
      };
    }
  }

  // Get collection info including field definitions
  async getCollectionInfo(collectionId: string): Promise<WixCollection | null> {
    try {
      await this.ensureAuthenticated();
      await this.ensureWixDataEnabled();
      
      console.log(`🗄️ [CMS] Getting collection info for: ${collectionId}`);
      
      // Use correct Wix Data REST API endpoint
      const endpoint = `/wix-data/v2/collections/${collectionId}`;
      const url = `https://www.wixapis.com${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
      };

      // Add visitor auth token
      if (this.visitorTokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
      }

      console.log(`🌐 [CMS API] GET ${endpoint}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [CMS API ERROR] ${response.status}:`, errorText);
        
        if (response.status === 404) {
          console.error('❌ [CMS] Collection not found or Wix Data may not be enabled');
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [CMS API SUCCESS] ${endpoint}:`, Object.keys(data).join(', '));
      
      const collection = {
        id: data.collection.id,
        displayName: data.collection.displayName || data.collection.id,
        fields: data.collection.fields || [],
      };

      console.log(`✅ [CMS] Retrieved collection info for ${collectionId}`);
      return collection;
    } catch (error) {
      console.error(`❌ [CMS ERROR] Failed to get collection info for ${collectionId}:`, error);
      return null;
    }
  }
}

class WixApiClient {
  private baseURL = getApiBaseUrl();
  private siteId = getSiteId();
  private storesAppId = getStoresAppId();
  private clientId = getClientId();
  private authToken: string | null = null;
  private visitorTokens: VisitorTokens | null = null;
  private memberTokens: MemberTokens | null = null;
  private currentMember: MemberIdentity | null = null;

  constructor() {
    console.log('🔗 [DEBUG] WixApiClient initialized');
    console.log(`🔗 [DEBUG] Using Client ID: ${this.clientId}`);
    console.log(`🔗 [DEBUG] Using Site ID: ${this.siteId}`);
    console.log(`🔗 [DEBUG] Using Stores App ID: ${this.storesAppId}`);
    this.loadStoredAuth();
    this.loadStoredMemberAuth();
    this.initializeVisitorAuthentication();
    
    // Run diagnostics in development mode
    if (__DEV__) {
      // Run diagnostics after a short delay to allow initialization to complete
      setTimeout(() => {
        this.diagnoseAuthenticationIssues().catch(error => {
          console.warn('⚠️ [DIAGNOSTICS] Authentication diagnostics failed:', error);
        });
      }, 1000);
    }
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
      console.log('🔧 [DEBUG] Generating tokens with site ID:', this.siteId);
      
      const requestBody = {
        clientId: this.clientId,
        grantType: 'anonymous'
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Include site ID in headers for proper context
      if (this.siteId) {
        headers['wix-site-id'] = this.siteId;
      }

      console.log('🔧 [DEBUG] Request headers:', JSON.stringify(headers, null, 2));
      console.log('🔧 [DEBUG] Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://www.wixapis.com/oauth2/token', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AUTH ERROR] Visitor token generation failed:', {
          status: response.status,
          error: errorText,
          siteId: this.siteId,
          clientId: this.clientId
        });
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
      console.log('🔧 [DEBUG] Token expiry:', new Date(this.visitorTokens.expiresAt * 1000).toISOString());
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

  // Member authentication methods
  
  // Store member tokens in AsyncStorage
  private async storeMemberTokens(tokens: MemberTokens): Promise<void> {
    try {
      await AsyncStorage.setItem('wix_member_tokens', JSON.stringify(tokens));
      console.log('✅ [MEMBER AUTH] Member tokens stored successfully');
    } catch (error) {
      console.error('❌ [MEMBER AUTH] Failed to store member tokens:', error);
    }
  }

  // Get stored member tokens
  private async getStoredMemberTokens(): Promise<MemberTokens | null> {
    try {
      const stored = await AsyncStorage.getItem('wix_member_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        console.log('🔗 [MEMBER AUTH] Loaded stored member tokens');
        return tokens;
      }
      return null;
    } catch (error) {
      console.error('❌ [MEMBER AUTH] Failed to load stored member tokens:', error);
      return null;
    }
  }

  // Clear member tokens and logout
  async logoutMember(): Promise<void> {
    try {
      await AsyncStorage.removeItem('wix_member_tokens');
      await AsyncStorage.removeItem('wix_current_member');
      this.memberTokens = null;
      this.currentMember = null;
      console.log('🗑️ [MEMBER AUTH] Member logged out successfully');
    } catch (error) {
      console.error('❌ [MEMBER AUTH] Failed to logout member:', error);
    }
  }

  // Load stored member data
  private async loadStoredMemberAuth(): Promise<void> {
    try {
      this.memberTokens = await this.getStoredMemberTokens();
      
      const storedMember = await AsyncStorage.getItem('wix_current_member');
      if (storedMember) {
        this.currentMember = JSON.parse(storedMember);
        console.log('👤 [MEMBER AUTH] Loaded stored member profile');
      }
    } catch (error) {
      console.error('❌ [MEMBER AUTH] Failed to load stored member auth:', error);
    }
  }

  // Check if member token is valid
  private isMemberTokenValid(tokens: MemberTokens): boolean {
    const now = Math.floor(Date.now() / 1000);
    return tokens.accessToken.expiresAt > now;
  }

  // Convert session token to member tokens (simplified for React Native)
  private async getMemberTokensFromSession(sessionToken: string): Promise<MemberTokens | null> {
    try {
      console.log('🔄 [MEMBER AUTH] Converting session token to member tokens...');
      
      // For React Native/mobile apps, the full OAuth flow with redirect sessions 
      // is complex and may not be necessary for basic member authentication.
      // We'll try a simplified approach first.
      
      // Attempt 1: Direct session token conversion (some Wix APIs support this)
      console.log('🔧 [MEMBER AUTH] Attempting direct session token conversion...');
      
      const directResponse = await fetch('https://www.wixapis.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'session_token',
          session_token: sessionToken,
          client_id: this.clientId,
        }),
      });

      if (directResponse.ok) {
        const tokenData = await directResponse.json();
        
        const memberTokens: MemberTokens = {
          accessToken: {
            value: tokenData.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          },
          refreshToken: {
            value: tokenData.refresh_token,
          },
        };

        await this.storeMemberTokens(memberTokens);
        this.memberTokens = memberTokens;
        
        console.log('✅ [MEMBER AUTH] Member tokens generated successfully (direct method)');
        return memberTokens;
      }

      // Attempt 2: JWT Bearer grant type
      console.log('🔧 [MEMBER AUTH] Trying JWT Bearer grant type...');
      
      const jwtResponse = await fetch('https://www.wixapis.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: sessionToken,
          client_id: this.clientId,
        }),
      });

      if (jwtResponse.ok) {
        const tokenData = await jwtResponse.json();
        
        const memberTokens: MemberTokens = {
          accessToken: {
            value: tokenData.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          },
          refreshToken: {
            value: tokenData.refresh_token,
          },
        };

        await this.storeMemberTokens(memberTokens);
        this.memberTokens = memberTokens;
        
        console.log('✅ [MEMBER AUTH] Member tokens generated successfully (JWT Bearer method)');
        return memberTokens;
      }

      // If both methods fail, log the errors but don't break the flow
      const directError = await directResponse.text();
      const jwtError = await jwtResponse.text();
      
      console.warn('⚠️ [MEMBER AUTH] Session token conversion failed, but registration was successful');
      console.warn('🔧 [MEMBER AUTH] Direct method error:', directError);
      console.warn('🔧 [MEMBER AUTH] JWT Bearer method error:', jwtError);
      console.log('ℹ️ [MEMBER AUTH] Member registration completed successfully without token conversion');
      console.log('ℹ️ [MEMBER AUTH] Member can still use the app with visitor-level permissions');
      
      return null;
    } catch (error) {
      console.error('❌ [MEMBER AUTH] Failed to convert session token:', error);
      console.warn('⚠️ [MEMBER AUTH] Continuing without member tokens - registration still successful');
      console.log('ℹ️ [MEMBER AUTH] Member can still use the app with visitor-level permissions');
      return null;
    }
  }



  // Public member authentication methods

  // Register a new member
  async registerMember(email: string, password: string, profile?: Partial<MemberProfile>): Promise<AuthResponse | null> {
    try {
      console.log('🆕 [MEMBER AUTH] Registering new member...');
      
      // Ensure we have valid visitor tokens with site context
      await this.ensureValidVisitorTokens();
      
      if (!this.visitorTokens?.accessToken) {
        throw new Error('Missing visitor authentication context. Please ensure visitor tokens are initialized.');
      }
      
      const requestBody = {
        loginId: { email },
        password,
        ...(profile && { profile }),
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
        'Authorization': `Bearer ${this.visitorTokens.accessToken}`,
      };

      console.log('🌐 [MEMBER AUTH] Making registration request with site ID:', this.siteId);

      const response = await fetch('https://www.wixapis.com/_api/iam/authentication/v2/register', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [MEMBER AUTH] Registration failed:', {
          status: response.status,
          error: errorText,
          siteId: this.siteId,
          hasVisitorToken: !!this.visitorTokens?.accessToken
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const authResponse: AuthResponse = await response.json();
      
      if (authResponse.state === 'SUCCESS' && authResponse.sessionToken) {
        // Store member profile first
        this.currentMember = authResponse.identity;
        await AsyncStorage.setItem('wix_current_member', JSON.stringify(this.currentMember));
        
        // Convert session token to member tokens (this may fail, but that's okay)
        await this.getMemberTokensFromSession(authResponse.sessionToken);
        
        console.log('✅ [MEMBER AUTH] Member registered successfully');
      }

      return authResponse;
    } catch (error) {
      console.error('❌ [MEMBER AUTH] Failed to register member:', error);
      return null;
    }
  }

  // Login an existing member
  async loginMember(email: string, password: string): Promise<AuthResponse | null> {
    try {
      console.log('🔐 [MEMBER AUTH] Logging in member...');
      
      // Ensure we have valid visitor tokens with site context
      await this.ensureValidVisitorTokens();
      
      if (!this.visitorTokens?.accessToken) {
        throw new Error('Missing visitor authentication context. Please ensure visitor tokens are initialized.');
      }
      
      const requestBody = {
        loginId: { email },
        password,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
        'Authorization': `Bearer ${this.visitorTokens.accessToken}`,
      };

      console.log('🌐 [MEMBER AUTH] Making login request with site ID:', this.siteId);

      const response = await fetch('https://www.wixapis.com/_api/iam/authentication/v2/login', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [MEMBER AUTH] Login failed:', {
          status: response.status,
          error: errorText,
          siteId: this.siteId,
          hasVisitorToken: !!this.visitorTokens?.accessToken
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const authResponse: AuthResponse = await response.json();
      
      if (authResponse.state === 'SUCCESS' && authResponse.sessionToken) {
        // Store member profile first
        this.currentMember = authResponse.identity;
        await AsyncStorage.setItem('wix_current_member', JSON.stringify(this.currentMember));
        
        // Convert session token to member tokens (this may fail, but that's okay)
        await this.getMemberTokensFromSession(authResponse.sessionToken);
        
        console.log('✅ [MEMBER AUTH] Member logged in successfully');
      }

      return authResponse;
    } catch (error) {
      console.error('❌ [MEMBER AUTH] Failed to login member:', error);
      return null;
    }
  }

  // Get current member info
  getCurrentMember(): MemberIdentity | null {
    return this.currentMember;
  }

  // Check if member is logged in
  isMemberLoggedIn(): boolean {
    // For React Native, we consider a member logged in if we have their identity
    // even if token conversion failed. This is practical for mobile apps where
    // session tokens work but full OAuth flow might be complex.
    if (this.currentMember) {
      // If we have member tokens and they're valid, definitely logged in
      if (this.memberTokens && this.isMemberTokenValid(this.memberTokens)) {
        return true;
      }
      
      // If we have member identity but no tokens (common in mobile),
      // still consider them logged in for practical purposes
      console.log('ℹ️ [MEMBER AUTH] Member logged in with identity only (no member tokens)');
      return true;
    }
    
    return false;
  }

  // Get member authentication header
  private getMemberAuthHeader(): string | null {
    if (this.memberTokens && this.isMemberTokenValid(this.memberTokens)) {
      return `Bearer ${this.memberTokens.accessToken.value}`;
    }
    return null;
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
        'wix_member_tokens',
        'wix_current_member',
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

  // Force refresh visitor authentication (useful for debugging auth issues)
  async refreshVisitorAuthentication(): Promise<void> {
    try {
      console.log('🔄 [AUTH] Force refreshing visitor authentication...');
      
      // Clear existing tokens
      this.visitorTokens = null;
      await AsyncStorage.removeItem('wix_visitor_tokens');
      
      // Generate new tokens
      await this.generateVisitorTokens();
      
      console.log('✅ [AUTH] Visitor authentication refreshed successfully');
    } catch (error) {
      console.error('❌ [AUTH ERROR] Failed to refresh visitor authentication:', error);
      throw error;
    }
  }

  // Diagnose authentication issues
  async diagnoseAuthenticationIssues(): Promise<void> {
    console.log('🔍 [DIAGNOSTICS] Running authentication diagnostics...');
    
    // Check site ID
    if (!this.siteId || this.siteId === 'YOUR_SITE_ID_HERE') {
      console.error('❌ [DIAGNOSTICS] Invalid site ID:', this.siteId);
      console.error('💡 [FIX] Update WIX_SITE_ID in wixConfig.ts with your actual site ID');
      return;
    }
    
    // Check client ID
    if (!this.clientId) {
      console.error('❌ [DIAGNOSTICS] Missing client ID');
      console.error('💡 [FIX] Update WIX_CLIENT_ID in wixConfig.ts');
      return;
    }
    
    // Check visitor tokens
    if (!this.visitorTokens) {
      console.warn('⚠️ [DIAGNOSTICS] No visitor tokens found');
      console.log('🔄 [DIAGNOSTICS] Attempting to generate visitor tokens...');
      try {
        await this.generateVisitorTokens();
        console.log('✅ [DIAGNOSTICS] Visitor tokens generated successfully');
      } catch (error) {
        console.error('❌ [DIAGNOSTICS] Failed to generate visitor tokens:', error);
        return;
      }
    }
    
    // Check token validity
    if (this.visitorTokens && !this.isTokenValid(this.visitorTokens)) {
      console.warn('⚠️ [DIAGNOSTICS] Visitor tokens are expired');
      console.log('🔄 [DIAGNOSTICS] Attempting to refresh visitor tokens...');
      try {
        await this.refreshVisitorTokens();
        console.log('✅ [DIAGNOSTICS] Visitor tokens refreshed successfully');
      } catch (error) {
        console.error('❌ [DIAGNOSTICS] Failed to refresh visitor tokens:', error);
        return;
      }
    }
    
    console.log('✅ [DIAGNOSTICS] Authentication diagnostics completed successfully');
    console.log('🔧 [DIAGNOSTICS] Current state:', {
      siteId: this.siteId,
      clientId: this.clientId,
      hasVisitorTokens: !!this.visitorTokens,
      tokenExpiry: this.visitorTokens ? new Date(this.visitorTokens.expiresAt * 1000).toISOString() : 'N/A'
    });
  }
}

// Export singleton instance
export const wixApiClient = new WixApiClient();

// Export CMS client singleton instance
export const wixCmsClient = new WixCmsClient();

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

// Export debugging helpers
export const debugWixAuth = async (): Promise<void> => {
  console.log('🔧 [DEBUG] Running Wix authentication diagnostics...');
  await wixApiClient.diagnoseAuthenticationIssues();
};

export const refreshWixAuth = async (): Promise<void> => {
  console.log('🔄 [DEBUG] Force refreshing Wix authentication...');
  await wixApiClient.refreshVisitorAuthentication();
};

console.log('🛍️ [DEBUG] Wix API Client module loaded with configuration from wixConfig');
console.log('🗄️ [DEBUG] Wix CMS Client ready for data collection operations'); 
console.log('🔧 [DEBUG] Debug helpers available: debugWixAuth(), refreshWixAuth()');

// For debugging in development console
if (__DEV__ && typeof global !== 'undefined') {
  (global as any).debugWixAuth = debugWixAuth;
  (global as any).refreshWixAuth = refreshWixAuth;
  console.log('🔧 [DEBUG] Global debug functions registered: global.debugWixAuth(), global.refreshWixAuth()');
}