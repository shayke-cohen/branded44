/**
 * Wix CMS Client
 * 
 * Handles all CMS and data collection operations including:
 * - Data collections querying
 * - Data items CRUD operations
 * - Collection schema management
 */

import { WixCoreClient, CACHE_KEYS, createWixFilter, createWixSort, createWixPaging } from './wixCoreClient';
import { featureManager } from '../../../config/features';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';

// === TYPES ===

export interface WixDataItem {
  _id: string;
  data: Record<string, any>;
  _createdDate: string;
  _updatedDate: string;
  _owner?: string;
}

export interface WixCollection {
  _id: string;
  displayName: string;
  fields: Array<{
    key: string;
    displayName: string;
    type: string;
  }>;
}

export interface WixDataQuery {
  filter?: Record<string, any>;
  sort?: Array<{ fieldName: string; order: 'ASC' | 'DESC' }>;
  limit?: number;
  skip?: number;
}

export interface WixDataResponse<T = WixDataItem> {
  items: T[];
  totalCount?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// === MAIN CLIENT CLASS ===

export class WixCMSClient extends WixCoreClient {
  private wixClient: any = null;

  constructor() {
    super('CMS');
    
    if (this.shouldUseSDK()) {
      this.initializeWixClient();
    }
  }

  // === SDK INITIALIZATION ===

  private initializeWixClient(): void {
    try {
      this.wixClient = createClient({
        modules: { items },
        auth: OAuthStrategy({
          clientId: this.clientId,
        }),
      });
      console.log('✅ [CMS SDK] Wix SDK client initialized');
    } catch (error) {
      console.error('❌ [CMS SDK] Failed to initialize Wix SDK client:', error);
    }
  }

  // === DATA COLLECTIONS ===

  async getAvailableCollections(): Promise<WixCollection[]> {
    console.log('📚 [CMS] Fetching available collections...');
    
    // For now, return known collections
    // In a real implementation, you might fetch this from the API
    const knownCollections: WixCollection[] = [
      {
        _id: 'SampleData',
        displayName: 'Sample Data',
        fields: [
          { key: 'title', displayName: 'Title', type: 'Text' },
          { key: 'description', displayName: 'Description', type: 'RichText' },
          { key: 'image', displayName: 'Image', type: 'MediaGallery' },
        ],
      },
      {
        _id: 'BlogPosts',
        displayName: 'Blog Posts',
        fields: [
          { key: 'title', displayName: 'Title', type: 'Text' },
          { key: 'content', displayName: 'Content', type: 'RichText' },
          { key: 'author', displayName: 'Author', type: 'Text' },
          { key: 'publishDate', displayName: 'Publish Date', type: 'DateTime' },
        ],
      },
    ];

    console.log(`✅ [CMS] Found ${knownCollections.length} available collections`);
    return knownCollections;
  }

  async getCollectionInfo(collectionId: string): Promise<WixCollection | null> {
    console.log(`📋 [CMS] Fetching collection info for: ${collectionId}`);
    
    try {
      const collections = await this.getAvailableCollections();
      const collection = collections.find(c => c._id === collectionId);
      
      if (collection) {
        console.log(`✅ [CMS] Found collection: ${collection.displayName}`);
        return collection;
      } else {
        console.warn(`⚠️ [CMS] Collection not found: ${collectionId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ [CMS] Error fetching collection info for ${collectionId}:`, error);
      return null;
    }
  }

  // === DATA QUERYING ===

  async queryCollection<T = WixDataItem>(
    collectionId: string,
    query: WixDataQuery = {}
  ): Promise<WixDataResponse<T>> {
    console.log(`🗄️ [CMS] Querying collection: ${collectionId}`);
    console.log(`🗄️ [CMS] Query parameters:`, JSON.stringify(query, null, 2));

    try {
      if (this.shouldUseSDK() && this.wixClient) {
        return await this._queryCollectionSDK<T>(collectionId, query);
      } else {
        return await this._queryCollectionREST<T>(collectionId, query);
      }
    } catch (error) {
      console.error(`❌ [CMS] Error querying collection ${collectionId}:`, error);
      throw this.createDomainError(`Failed to query collection: ${collectionId}`, undefined, `/wix-data/v2/items/query`);
    }
  }

  private async _queryCollectionSDK<T = WixDataItem>(
    collectionId: string,
    query: WixDataQuery
  ): Promise<WixDataResponse<T>> {
    console.log(`🔧 [CMS SDK] Querying collection via SDK: ${collectionId}`);
    
    // Build SDK query
    const queryBuilder = this.wixClient.items
      .queryDataItems()
      .dataCollectionId(collectionId);

    // Apply filters
    if (query.filter) {
      queryBuilder.filter(query.filter);
    }

    // Apply sorting
    if (query.sort && query.sort.length > 0) {
      const sortField = query.sort[0];
      if (sortField.order === 'ASC') {
        queryBuilder.ascending(sortField.fieldName);
      } else {
        queryBuilder.descending(sortField.fieldName);
      }
    }

    // Apply pagination
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.skip) {
      queryBuilder.skip(query.skip);
    }

    const response = await queryBuilder.find();
    
    console.log(`✅ [CMS SDK] Found ${response.items.length} items`);
    
    return {
      items: response.items as T[],
      totalCount: response.totalCount,
      hasNext: response.hasNext?.(),
      hasPrev: response.hasPrev?.(),
    };
  }

  private async _queryCollectionREST<T = WixDataItem>(
    collectionId: string,
    query: WixDataQuery
  ): Promise<WixDataResponse<T>> {
    console.log(`🌐 [CMS REST] Querying collection via REST API: ${collectionId}`);
    
    const endpoint = `/wix-data/v2/items/query`;
    
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

    const response = await this.makeRequest<{
      dataItems: T[];
      totalCount?: number;
      pagingMetadata?: any;
    }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log(`✅ [CMS REST] Found ${response.dataItems.length} items`);

    return {
      items: response.dataItems,
      totalCount: response.totalCount,
      hasNext: response.pagingMetadata?.hasNext,
      hasPrev: response.pagingMetadata?.hasPrev,
    };
  }

  // === DATA ITEM OPERATIONS ===

  async getDataItem<T = WixDataItem>(collectionId: string, itemId: string): Promise<T | null> {
    console.log(`📄 [CMS] Fetching data item: ${itemId} from ${collectionId}`);

    try {
      if (this.shouldUseSDK() && this.wixClient) {
        const response = await this.wixClient.items.getDataItem(itemId, {
          dataCollectionId: collectionId,
        });
        console.log(`✅ [CMS SDK] Retrieved data item: ${itemId}`);
        return response.dataItem as T;
      } else {
        // REST API implementation
        const endpoint = `/wix-data/v2/items/${itemId}`;
        const response = await this.makeRequest<{ dataItem: T }>(endpoint, {
          method: 'GET',
          headers: {
            'wix-data-collection-id': collectionId,
          },
        });
        console.log(`✅ [CMS REST] Retrieved data item: ${itemId}`);
        return response.dataItem;
      }
    } catch (error) {
      console.error(`❌ [CMS] Error fetching data item ${itemId}:`, error);
      return null;
    }
  }

  async createDataItem<T = WixDataItem>(
    collectionId: string,
    data: Record<string, any>
  ): Promise<T | null> {
    console.log(`📝 [CMS] Creating data item in ${collectionId}`);

    try {
      if (this.shouldUseSDK() && this.wixClient) {
        const response = await this.wixClient.items.insertDataItem({
          dataCollectionId: collectionId,
          dataItem: { data },
        });
        console.log(`✅ [CMS SDK] Created data item: ${response.dataItem._id}`);
        return response.dataItem as T;
      } else {
        // REST API implementation
        const endpoint = `/wix-data/v2/items`;
        const response = await this.makeRequest<{ dataItem: T }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            dataCollectionId: collectionId,
            dataItem: { data },
          }),
        });
        console.log(`✅ [CMS REST] Created data item: ${response.dataItem._id}`);
        return response.dataItem;
      }
    } catch (error) {
      console.error(`❌ [CMS] Error creating data item in ${collectionId}:`, error);
      return null;
    }
  }

  async updateDataItem<T = WixDataItem>(
    collectionId: string,
    itemId: string,
    data: Record<string, any>
  ): Promise<T | null> {
    console.log(`✏️ [CMS] Updating data item: ${itemId} in ${collectionId}`);

    try {
      if (this.shouldUseSDK() && this.wixClient) {
        const response = await this.wixClient.items.updateDataItem(itemId, {
          dataCollectionId: collectionId,
          dataItem: { data },
        });
        console.log(`✅ [CMS SDK] Updated data item: ${itemId}`);
        return response.dataItem as T;
      } else {
        // REST API implementation
        const endpoint = `/wix-data/v2/items/${itemId}`;
        const response = await this.makeRequest<{ dataItem: T }>(endpoint, {
          method: 'PATCH',
          body: JSON.stringify({
            dataCollectionId: collectionId,
            dataItem: { data },
          }),
        });
        console.log(`✅ [CMS REST] Updated data item: ${itemId}`);
        return response.dataItem;
      }
    } catch (error) {
      console.error(`❌ [CMS] Error updating data item ${itemId}:`, error);
      return null;
    }
  }

  async deleteDataItem(collectionId: string, itemId: string): Promise<boolean> {
    console.log(`🗑️ [CMS] Deleting data item: ${itemId} from ${collectionId}`);

    try {
      if (this.shouldUseSDK() && this.wixClient) {
        await this.wixClient.items.removeDataItem(itemId, {
          dataCollectionId: collectionId,
        });
        console.log(`✅ [CMS SDK] Deleted data item: ${itemId}`);
        return true;
      } else {
        // REST API implementation
        const endpoint = `/wix-data/v2/items/${itemId}`;
        await this.makeRequest(endpoint, {
          method: 'DELETE',
          headers: {
            'wix-data-collection-id': collectionId,
          },
        });
        console.log(`✅ [CMS REST] Deleted data item: ${itemId}`);
        return true;
      }
    } catch (error) {
      console.error(`❌ [CMS] Error deleting data item ${itemId}:`, error);
      return false;
    }
  }

  // === CONVENIENCE METHODS ===

  /**
   * Query collection with simple filters
   */
  async findItems<T = WixDataItem>(
    collectionId: string,
    filters: Record<string, any> = {},
    options: {
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<WixDataResponse<T>> {
    const query: WixDataQuery = {};

    // Apply filters
    if (Object.keys(filters).length > 0) {
      query.filter = createWixFilter(filters);
    }

    // Apply sorting
    if (options.sortBy) {
      query.sort = createWixSort(options.sortBy, options.sortOrder);
    }

    // Apply pagination
    if (options.limit !== undefined) {
      query.limit = options.limit;
    }
    if (options.skip !== undefined) {
      query.skip = options.skip;
    }

    return await this.queryCollection<T>(collectionId, query);
  }

  /**
   * Get all items from a collection (with automatic pagination)
   */
  async getAllItems<T = WixDataItem>(collectionId: string): Promise<T[]> {
    const allItems: T[] = [];
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await this.queryCollection<T>(collectionId, { limit, skip });
      
      allItems.push(...response.items);
      
      hasMore = response.hasNext === true && response.items.length === limit;
      skip += limit;
      
      // Safety check to prevent infinite loops
      if (skip > 10000) {
        console.warn(`⚠️ [CMS] Breaking getAllItems loop for ${collectionId} - too many items`);
        break;
      }
    }

    console.log(`✅ [CMS] Retrieved all ${allItems.length} items from ${collectionId}`);
    return allItems;
  }

  /**
   * Check if Wix Data is enabled for the site
   */
  async ensureWixDataEnabled(): Promise<void> {
    // This would typically make a test call to verify Wix Data is enabled
    // For now, we'll just log a warning if needed
    console.log('ℹ️ [CMS] Ensure the main wixApiClient has been initialized first.');
  }

  // === CACHE MANAGEMENT ===

  async clearCache(): Promise<void> {
    await Promise.all([
      this.clearCachedData(CACHE_KEYS.COLLECTIONS, CACHE_KEYS.COLLECTIONS_TIMESTAMP),
    ]);
    console.log('🗑️ [CMS CACHE] All CMS caches cleared');
  }

  async getCacheInfo(): Promise<{ collections: boolean }> {
    return {
      collections: await this.isCacheValid(CACHE_KEYS.COLLECTIONS_TIMESTAMP),
    };
  }
}

// Export singleton instance
export const wixCMSClient = new WixCMSClient();
