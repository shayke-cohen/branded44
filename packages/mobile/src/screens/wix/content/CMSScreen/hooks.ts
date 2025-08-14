/**
 * useCMS - Custom hook for CMS logic
 * 
 * Centralizes all CMS state management and business logic
 * Makes screens thin and focused on presentation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cmsService, CMSItem, CMSQueryOptions } from '../shared/WixCMSService';
import type { WixCollection } from '../../../../utils/wixApiClient';

interface UseCMSState {
  collections: WixCollection[];
  selectedCollection: string;
  items: CMSItem[];
  loading: boolean;
  refreshing: boolean;
  searchTerm: string;
  error: string | null;
  stats: {
    totalCollections: number;
    totalItems: number;
    recentItems: number;
  };
}

interface UseCMSActions {
  loadCollections: () => Promise<void>;
  loadItems: (collectionId?: string, options?: CMSQueryOptions) => Promise<void>;
  searchItems: (term: string) => Promise<void>;
  selectCollection: (collectionId: string) => void;
  setSearchTerm: (term: string) => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
  retryLoad: () => Promise<void>;
}

interface UseCMSReturn extends UseCMSState, UseCMSActions {
  isEmpty: boolean;
  hasSearchResults: boolean;
  canLoadMore: boolean;
}

const INITIAL_STATE: UseCMSState = {
  collections: [],
  selectedCollection: '',
  items: [],
  loading: true,
  refreshing: false,
  searchTerm: '',
  error: null,
  stats: {
    totalCollections: 0,
    totalItems: 0,
    recentItems: 0,
  },
};

export const useCMS = (): UseCMSReturn => {
  // State
  const [state, setState] = useState<UseCMSState>(INITIAL_STATE);
  
  // Refs
  const mounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseCMSState> | ((prev: UseCMSState) => UseCMSState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Load all available collections
   */
  const loadCollections = useCallback(async () => {
    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [CMS HOOK] Loading collections...');

      const collections = await cmsService.getCollections();

      if (mounted.current) {
        safeSetState(prev => ({
          collections,
          loading: false,
          stats: {
            ...prev.stats,
            totalCollections: collections.length,
          },
        }));

        console.log('✅ [CMS HOOK] Collections loaded successfully', {
          count: collections.length
        });

        // Auto-select first collection if none selected
        if (collections.length > 0 && !state.selectedCollection) {
          await loadItems(collections[0].id);
        }
      }
    } catch (error) {
      console.error('❌ [CMS HOOK] Error loading collections:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load collections',
        });
      }
    }
  }, [safeSetState, state.selectedCollection]);

  /**
   * Load items from a collection
   */
  const loadItems = useCallback(async (
    collectionId?: string, 
    options: CMSQueryOptions = {}
  ) => {
    const targetCollection = collectionId || state.selectedCollection;
    
    if (!targetCollection) {
      console.warn('⚠️ [CMS HOOK] No collection selected for loading items');
      return;
    }

    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [CMS HOOK] Loading items from collection:', targetCollection);

      const result = await cmsService.getCollectionItems(targetCollection, options);

      if (mounted.current) {
        safeSetState(prev => ({
          items: result.items,
          selectedCollection: targetCollection,
          loading: false,
          stats: {
            ...prev.stats,
            totalItems: result.totalCount,
          },
        }));

        console.log('✅ [CMS HOOK] Items loaded successfully', {
          count: result.items.length,
          totalCount: result.totalCount
        });
      }
    } catch (error) {
      console.error('❌ [CMS HOOK] Error loading items:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load items',
        });
      }
    }
  }, [state.selectedCollection, safeSetState]);

  /**
   * Search items
   */
  const searchItems = useCallback(async (term: string) => {
    try {
      safeSetState({ loading: true, error: null, searchTerm: term });

      console.log('🔄 [CMS HOOK] Searching items:', term);

      if (!term.trim()) {
        // If search term is empty, reload current collection
        await loadItems();
        return;
      }

      const result = await cmsService.searchItems(
        term.trim(),
        state.selectedCollection || undefined,
        { limit: 50 }
      );

      if (mounted.current) {
        safeSetState({
          items: result.items,
          loading: false,
        });

        console.log('✅ [CMS HOOK] Search completed', {
          term,
          resultsCount: result.items.length
        });
      }
    } catch (error) {
      console.error('❌ [CMS HOOK] Error searching items:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Search failed',
        });
      }
    }
  }, [state.selectedCollection, loadItems, safeSetState]);

  /**
   * Select a collection
   */
  const selectCollection = useCallback((collectionId: string) => {
    console.log('🔄 [CMS HOOK] Selecting collection:', collectionId);
    
    safeSetState({ selectedCollection: collectionId, searchTerm: '' });
    loadItems(collectionId);
  }, [loadItems, safeSetState]);

  /**
   * Set search term (for controlled input)
   */
  const setSearchTerm = useCallback((term: string) => {
    safeSetState({ searchTerm: term });
  }, [safeSetState]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    try {
      safeSetState({ refreshing: true, error: null });

      console.log('🔄 [CMS HOOK] Refreshing data...');

      // Reload collections first
      await loadCollections();

      // Then reload current collection items if we have one selected
      if (state.selectedCollection) {
        await loadItems(state.selectedCollection);
      }

      if (mounted.current) {
        safeSetState({ refreshing: false });
        console.log('✅ [CMS HOOK] Data refreshed successfully');
      }
    } catch (error) {
      console.error('❌ [CMS HOOK] Error refreshing data:', error);
      
      if (mounted.current) {
        safeSetState({
          refreshing: false,
          error: error instanceof Error ? error.message : 'Failed to refresh data',
        });
      }
    }
  }, [loadCollections, loadItems, state.selectedCollection, safeSetState]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Retry loading after error
   */
  const retryLoad = useCallback(async () => {
    if (state.selectedCollection) {
      await loadItems(state.selectedCollection);
    } else {
      await loadCollections();
    }
  }, [state.selectedCollection, loadItems, loadCollections]);

  /**
   * Auto-load collections when hook is first used
   */
  useEffect(() => {
    if (mounted.current && state.collections.length === 0 && !state.loading) {
      loadCollections();
    }
  }, []); // Only run once on mount

  /**
   * Update stats when items change
   */
  useEffect(() => {
    const recentItemsCount = state.items.filter(item => {
      const createdDate = new Date(item._createdDate || 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdDate > weekAgo;
    }).length;

    safeSetState(prev => ({
      stats: {
        ...prev.stats,
        recentItems: recentItemsCount,
      },
    }));
  }, [state.items, safeSetState]);

  /**
   * Derived state
   */
  const isEmpty = state.items.length === 0 && !state.loading;
  const hasSearchResults = state.searchTerm.trim().length > 0 && state.items.length > 0;
  const canLoadMore = false; // TODO: Implement pagination if needed

  return {
    // State
    collections: state.collections,
    selectedCollection: state.selectedCollection,
    items: state.items,
    loading: state.loading,
    refreshing: state.refreshing,
    searchTerm: state.searchTerm,
    error: state.error,
    stats: state.stats,

    // Actions
    loadCollections,
    loadItems,
    searchItems,
    selectCollection,
    setSearchTerm,
    refreshData,
    clearError,
    retryLoad,

    // Derived state
    isEmpty,
    hasSearchResults,
    canLoadMore,
  };
};
