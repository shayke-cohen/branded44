/**
 * WixCMSService - Service layer for CMS operations
 * 
 * Centralizes all CMS/Data Collection API calls and business logic
 * Provides clean interface for CMS data management
 */

import { wixCmsClient, WixDataItem, WixCollection, WixDataResponse } from '../utils/wixApiClient';

export interface CMSItem extends WixDataItem {
  title?: string;
  content?: string;
  author?: string;
  publishDate?: string;
  category?: string;
}

export interface CMSQueryOptions {
  limit?: number;
  offset?: number;
  sort?: string;
  filter?: Record<string, any>;
  search?: string;
}

export interface CMSOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

class WixCMSService {
  private static instance: WixCMSService;

  public static getInstance(): WixCMSService {
    if (!WixCMSService.instance) {
      WixCMSService.instance = new WixCMSService();
    }
    return WixCMSService.instance;
  }

  /**
   * Get all available collections
   */
  public async getCollections(): Promise<WixCollection[]> {
    try {
      console.log('🔄 [CMS SERVICE] Loading collections...');

      const response = await wixCmsClient.getCollections();
      
      if (response?.success && response?.collections) {
        console.log('✅ [CMS SERVICE] Collections loaded successfully', {
          count: response.collections.length
        });
        return response.collections;
      }

      throw new Error('Failed to load collections');
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error loading collections:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load collections');
    }
  }

  /**
   * Get items from a specific collection
   */
  public async getCollectionItems(
    collectionId: string, 
    options: CMSQueryOptions = {}
  ): Promise<{ items: CMSItem[]; totalCount: number }> {
    try {
      console.log('🔄 [CMS SERVICE] Loading collection items:', {
        collectionId,
        options
      });

      const { limit = 50, offset = 0, sort, filter, search } = options;

      // Build query parameters
      const queryParams: any = {
        limit,
        offset,
      };

      if (sort) {
        queryParams.sort = sort;
      }

      if (filter && Object.keys(filter).length > 0) {
        queryParams.filter = filter;
      }

      if (search) {
        queryParams.search = search;
      }

      const response: WixDataResponse = await wixCmsClient.getCollectionItems(
        collectionId,
        queryParams
      );

      if (response?.success && response?.items) {
        console.log('✅ [CMS SERVICE] Collection items loaded successfully', {
          count: response.items.length,
          totalCount: response.totalCount || response.items.length
        });

        return {
          items: response.items,
          totalCount: response.totalCount || response.items.length
        };
      }

      throw new Error('Failed to load collection items');
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error loading collection items:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load collection items');
    }
  }

  /**
   * Search items across collections
   */
  public async searchItems(
    searchTerm: string,
    collectionId?: string,
    options: CMSQueryOptions = {}
  ): Promise<{ items: CMSItem[]; totalCount: number }> {
    try {
      console.log('🔄 [CMS SERVICE] Searching items:', {
        searchTerm,
        collectionId,
        options
      });

      const searchOptions = {
        ...options,
        search: searchTerm,
      };

      if (collectionId) {
        return await this.getCollectionItems(collectionId, searchOptions);
      }

      // If no specific collection, search across all collections
      const collections = await this.getCollections();
      const allResults: CMSItem[] = [];

      for (const collection of collections) {
        try {
          const result = await this.getCollectionItems(collection.id, {
            ...searchOptions,
            limit: 10, // Limit per collection when searching all
          });
          allResults.push(...result.items);
        } catch (error) {
          console.warn('⚠️ [CMS SERVICE] Failed to search in collection:', collection.id);
        }
      }

      console.log('✅ [CMS SERVICE] Search completed', {
        totalResults: allResults.length
      });

      return {
        items: allResults,
        totalCount: allResults.length
      };
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error searching items:', error);
      throw new Error(error instanceof Error ? error.message : 'Search failed');
    }
  }

  /**
   * Get a specific item by ID
   */
  public async getItem(collectionId: string, itemId: string): Promise<CMSItem> {
    try {
      console.log('🔄 [CMS SERVICE] Loading item:', { collectionId, itemId });

      const response = await wixCmsClient.getItem(collectionId, itemId);

      if (response?.success && response?.item) {
        console.log('✅ [CMS SERVICE] Item loaded successfully');
        return response.item;
      }

      throw new Error('Item not found');
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error loading item:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load item');
    }
  }

  /**
   * Create a new item in a collection
   */
  public async createItem(
    collectionId: string, 
    itemData: Partial<CMSItem>
  ): Promise<CMSOperationResult> {
    try {
      console.log('🔄 [CMS SERVICE] Creating item:', {
        collectionId,
        itemData: { ...itemData, content: itemData.content ? '[content]' : undefined }
      });

      const response = await wixCmsClient.createItem(collectionId, itemData);

      if (response?.success) {
        console.log('✅ [CMS SERVICE] Item created successfully');
        return {
          success: true,
          data: response.item
        };
      }

      throw new Error('Failed to create item');
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error creating item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create item'
      };
    }
  }

  /**
   * Update an existing item
   */
  public async updateItem(
    collectionId: string,
    itemId: string,
    itemData: Partial<CMSItem>
  ): Promise<CMSOperationResult> {
    try {
      console.log('🔄 [CMS SERVICE] Updating item:', {
        collectionId,
        itemId,
        itemData: { ...itemData, content: itemData.content ? '[content]' : undefined }
      });

      const response = await wixCmsClient.updateItem(collectionId, itemId, itemData);

      if (response?.success) {
        console.log('✅ [CMS SERVICE] Item updated successfully');
        return {
          success: true,
          data: response.item
        };
      }

      throw new Error('Failed to update item');
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error updating item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item'
      };
    }
  }

  /**
   * Delete an item
   */
  public async deleteItem(
    collectionId: string,
    itemId: string
  ): Promise<CMSOperationResult> {
    try {
      console.log('🔄 [CMS SERVICE] Deleting item:', { collectionId, itemId });

      const response = await wixCmsClient.deleteItem(collectionId, itemId);

      if (response?.success) {
        console.log('✅ [CMS SERVICE] Item deleted successfully');
        return {
          success: true
        };
      }

      throw new Error('Failed to delete item');
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error deleting item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete item'
      };
    }
  }

  /**
   * Get recent items across all collections
   */
  public async getRecentItems(limit: number = 10): Promise<CMSItem[]> {
    try {
      console.log('🔄 [CMS SERVICE] Loading recent items...', { limit });

      const collections = await this.getCollections();
      const allItems: CMSItem[] = [];

      for (const collection of collections) {
        try {
          const result = await this.getCollectionItems(collection.id, {
            limit: Math.ceil(limit / collections.length),
            sort: '-_createdDate' // Sort by creation date, newest first
          });
          allItems.push(...result.items);
        } catch (error) {
          console.warn('⚠️ [CMS SERVICE] Failed to load recent items from collection:', collection.id);
        }
      }

      // Sort all items by creation date and limit
      const sortedItems = allItems
        .sort((a, b) => {
          const dateA = new Date(a._createdDate || 0).getTime();
          const dateB = new Date(b._createdDate || 0).getTime();
          return dateB - dateA; // Newest first
        })
        .slice(0, limit);

      console.log('✅ [CMS SERVICE] Recent items loaded', {
        count: sortedItems.length
      });

      return sortedItems;
    } catch (error) {
      console.error('❌ [CMS SERVICE] Error loading recent items:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load recent items');
    }
  }
}

// Export singleton instance
export const cmsService = WixCMSService.getInstance();
