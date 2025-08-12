/**
 * useProductList - Custom hook for product list logic
 * 
 * Centralizes all product list state management and business logic
 * Makes screens thin and focused on presentation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { productService, type SortOption, type FilterOption, type ProductQuery, SORT_OPTIONS, FILTER_OPTIONS } from '../../screens/wix/ecommerce/shared/WixProductService';
import type { WixProduct } from '../../utils/wixApiClient';

interface UseProductListState {
  products: WixProduct[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
}

interface UseProductListActions {
  loadProducts: (reset?: boolean) => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<void>;
  setSortOption: (option: SortOption) => void;
  setFilterOption: (option: FilterOption) => void;
  clearSearch: () => void;
  retryLoad: () => Promise<void>;
}

interface UseProductListFilters {
  sortBy: SortOption;
  filterBy: FilterOption;
  searchTerm: string;
}

interface UseProductListReturn extends UseProductListState, UseProductListActions, UseProductListFilters {}

const INITIAL_STATE: UseProductListState = {
  products: [],
  loading: true,
  error: null,
  refreshing: false,
  loadingMore: false,
  hasMore: true,
  totalCount: 0,
};

export const useProductList = (initialQuery: Partial<ProductQuery> = {}): UseProductListReturn => {
  // State
  const [state, setState] = useState<UseProductListState>(INITIAL_STATE);
  const [sortBy, setSortBy] = useState<SortOption>(initialQuery.sortBy || (SORT_OPTIONS && SORT_OPTIONS[0]) || { label: 'Name A-Z', value: 'name_asc', field: 'name', order: 'ASC' });
  const [filterBy, setFilterBy] = useState<FilterOption>(initialQuery.filterBy || (FILTER_OPTIONS && FILTER_OPTIONS[0]) || { label: 'All Products', value: 'all' });
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery.searchTerm || '');

  // Refs
  const currentQuery = useRef<ProductQuery>({});
  const mounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * Build current query from filters
   */
  const buildQuery = useCallback((options: { reset?: boolean; offset?: number } = {}): ProductQuery => {
    const { reset = false, offset } = options;
    
    // Ensure safe access to products array
    const safeProducts = state?.products || [];
    const currentOffset = reset ? 0 : (offset ?? safeProducts.length);
    
    return {
      sortBy,
      filterBy,
      searchTerm: searchTerm.trim() || undefined,
      limit: 20,
      offset: currentOffset,
      ...(initialQuery || {}),
    };
  }, [sortBy, filterBy, searchTerm, state?.products?.length || 0, initialQuery]);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseProductListState> | ((prev: UseProductListState) => UseProductListState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Load products with current filters
   */
  const loadProducts = useCallback(async (reset: boolean = false) => {
    try {
      safeSetState(prev => ({
        ...prev,
        loading: reset,
        refreshing: !reset && (prev?.products || []).length === 0,
        error: null,
      }));

      const query = buildQuery({ reset });
      currentQuery.current = query;

      console.log('🔄 [PRODUCT LIST HOOK] Loading products:', query);

      const response = await productService.getProducts(query);

      // Check if this is still the current query (avoid race conditions)
      if (currentQuery.current !== query || !mounted.current) {
        return;
      }

              safeSetState(prev => ({
          ...prev,
          products: reset ? (response.products || []) : [...(prev.products || []), ...(response.products || [])],
          loading: false,
          refreshing: false,
          error: null,
          hasMore: response.hasMore,
          totalCount: response.totalCount,
          loadingMore: false,
        }));

      console.log('✅ [PRODUCT LIST HOOK] Products loaded successfully');
    } catch (error) {
      console.error('❌ [PRODUCT LIST HOOK] Error loading products:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          refreshing: false,
          error: error instanceof Error ? error.message : 'Failed to load products',
        });
      }
    }
  }, [buildQuery, safeSetState]);

  /**
   * Load more products (pagination)
   */
  const loadMoreProducts = useCallback(async () => {
    if (state.loadingMore || !state.hasMore || state.loading) {
      return;
    }

    try {
      safeSetState({ loadingMore: true, error: null });

      const query = buildQuery({ offset: (state?.products || []).length });
      const response = await productService.getProducts(query);

      if (mounted.current) {
        safeSetState(prev => ({
          ...prev,
          products: [...(prev.products || []), ...(response.products || [])],
          loadingMore: false,
          hasMore: response.hasMore,
          totalCount: response.totalCount,
        }));
      }
    } catch (error) {
      console.error('❌ [PRODUCT LIST HOOK] Error loading more products:', error);
      
      if (mounted.current) {
        safeSetState({
          loadingMore: false,
          error: error instanceof Error ? error.message : 'Failed to load more products',
        });
      }
    }
  }, [state.loadingMore, state.hasMore, state.loading, (state?.products || []).length, buildQuery, safeSetState]);

  /**
   * Refresh products (pull to refresh)
   */
  const refreshProducts = useCallback(async () => {
    await loadProducts(true);
  }, [loadProducts]);

  /**
   * Search products
   */
  const searchProducts = useCallback(async (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // loadProducts will be called by useEffect when searchTerm changes
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  /**
   * Set sort option
   */
  const setSortOption = useCallback((option: SortOption) => {
    setSortBy(option);
    // loadProducts will be called by useEffect when sortBy changes
  }, []);

  /**
   * Set filter option
   */
  const setFilterOption = useCallback((option: FilterOption) => {
    setFilterBy(option);
    // loadProducts will be called by useEffect when filterBy changes
  }, []);

  /**
   * Retry loading after error
   */
  const retryLoad = useCallback(async () => {
    await loadProducts(true);
  }, [loadProducts]);

  /**
   * Load products when filters change
   */
  useEffect(() => {
    loadProducts(true);
  }, [sortBy, filterBy, searchTerm]); // Don't include loadProducts to avoid infinite loop

  /**
   * Initial load
   */
  useEffect(() => {
    loadProducts(true);
  }, []); // Only run once on mount

  return {
    // State
    products: state.products || [],
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    loadingMore: state.loadingMore,
    hasMore: state.hasMore,
    totalCount: state.totalCount,

    // Filters
    sortBy,
    filterBy,
    searchTerm,

    // Actions
    loadProducts,
    loadMoreProducts,
    refreshProducts,
    searchProducts,
    setSortOption,
    setFilterOption,
    clearSearch,
    retryLoad,
  };
};
