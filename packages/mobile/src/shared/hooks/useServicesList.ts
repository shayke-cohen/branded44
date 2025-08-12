/**
 * useServicesList - Custom hook for services list logic
 * 
 * Centralizes all services list state management and business logic
 * Makes screens thin and focused on presentation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { bookingService, type ServiceQuery } from '../../screens/wix/services/shared/WixBookingService';
import type { WixService } from '../../utils/wixBookingApiClient';

interface UseServicesListState {
  services: WixService[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  categories: string[];
  selectedCategory: string | null;
  searchTerm: string;
}

interface UseServicesListActions {
  loadServices: (reset?: boolean) => Promise<void>;
  refreshServices: () => Promise<void>;
  searchServices: (searchTerm: string) => void;
  filterByCategory: (category: string | null) => void;
  retryLoad: () => Promise<void>;
  clearSearch: () => void;
}

interface UseServicesListReturn extends UseServicesListState, UseServicesListActions {}

const INITIAL_STATE: UseServicesListState = {
  services: [],
  loading: true,
  error: null,
  refreshing: false,
  categories: [],
  selectedCategory: null,
  searchTerm: '',
};

export const useServicesList = (): UseServicesListReturn => {
  // State
  const [state, setState] = useState<UseServicesListState>(INITIAL_STATE);
  
  // Refs
  const mounted = useRef(true);
  const allServices = useRef<WixService[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseServicesListState> | ((prev: UseServicesListState) => UseServicesListState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Filter services based on search term and category
   */
  const filterServices = useCallback((
    services: WixService[], 
    searchTerm: string | undefined, 
    category: string | null | undefined
  ): WixService[] => {
    console.log('🔍 [SERVICES FILTER] Input:', { 
      servicesCount: services.length, 
      searchTerm, 
      category 
    });

    let filtered = services;

    // Filter by category
    if (category) {
      filtered = filtered.filter(service => {
        // Handle category as object or string
        const serviceCategoryName = typeof service.category === 'object' && service.category?.name 
          ? service.category.name 
          : (typeof service.category === 'string' ? service.category : '');
        
        return serviceCategoryName === category;
      });
      console.log('🔍 [SERVICES FILTER] After category filter:', filtered.length);
    }

    // Filter by search term
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(service => {
        // Handle category as object or string for search
        const serviceCategoryName = typeof service.category === 'object' && service.category?.name 
          ? service.category.name 
          : (typeof service.category === 'string' ? service.category : '');
        
        const nameMatch = service.name && service.name.toLowerCase().includes(term);
        const descMatch = service.description && service.description.toLowerCase().includes(term);
        const catMatch = serviceCategoryName && serviceCategoryName.toLowerCase().includes(term);
        const tagMatch = service.tags && service.tags.some(tag => 
          tag && tag.toLowerCase().includes(term)
        );
        
        console.log('🔍 [SERVICES FILTER] Service match check:', {
          serviceName: service.name,
          term,
          nameMatch,
          descMatch,
          catMatch,
          tagMatch
        });
        
        return nameMatch || descMatch || catMatch || tagMatch;
      });
      console.log('🔍 [SERVICES FILTER] After search filter:', filtered.length);
    }

    console.log('🔍 [SERVICES FILTER] Final result:', filtered.length);
    return filtered;
  }, []);

  /**
   * Extract unique categories from services
   */
  const extractCategories = useCallback((services: WixService[]): string[] => {
    const categorySet = new Set<string>();
    
    services.forEach(service => {
      // Handle category as object or string
      if (service.category) {
        if (typeof service.category === 'object' && service.category.name) {
          categorySet.add(service.category.name);
        } else if (typeof service.category === 'string') {
          categorySet.add(service.category);
        }
        // Only use ID as fallback if name is not available
        else if (typeof service.category === 'object' && service.category?.id && !service.category.name) {
          categorySet.add(service.category.id);
        }
      }
    });

    return Array.from(categorySet).sort();
  }, []);

  /**
   * Load services from API
   */
  const loadServices = useCallback(async (reset: boolean = false) => {
    try {
      safeSetState(prev => ({
        loading: reset,
        refreshing: !reset && (!prev.services || prev.services.length === 0),
        error: null,
      }));

      console.log('🔄 [SERVICES LIST HOOK] Loading services');

      const query: ServiceQuery = {
        includeProviders: true, // Include providers for better filtering
        forceRefresh: reset, // Force refresh when reset is true
      };

      const services = await bookingService.getServices(query);
      console.log('🔄 [SERVICES LIST HOOK] Raw services loaded:', services.length);
      console.log('🔄 [SERVICES LIST HOOK] First service sample:', services[0] ? {
        id: services[0].id,
        name: services[0].name,
        description: services[0].description,
        category: services[0].category,
        tags: services[0].tags
      } : 'No services');

      if (mounted.current) {
        // Store all services for filtering
        allServices.current = services;

        // Extract categories
        const categories = extractCategories(services);

        // Get current state to apply filters
        safeSetState(currentState => {
          console.log('🔄 [SERVICES LIST HOOK] Current state for filtering:', {
            searchTerm: currentState.searchTerm,
            selectedCategory: currentState.selectedCategory
          });
          
          // Apply current filters
          const filteredServices = filterServices(
            services, 
            currentState.searchTerm, 
            currentState.selectedCategory
          );

          console.log('🔄 [SERVICES LIST HOOK] Filtered services:', filteredServices.length);

          return {
            services: filteredServices,
            loading: false,
            refreshing: false,
            error: null,
            categories,
          };
        });

        console.log('✅ [SERVICES LIST HOOK] Services loaded successfully');
      }
    } catch (error) {
      console.error('❌ [SERVICES LIST HOOK] Error loading services:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          refreshing: false,
          error: error instanceof Error ? error.message : 'Failed to load services',
        });
      }
    }
  }, [extractCategories, filterServices, safeSetState]);

  /**
   * Refresh services (pull to refresh)
   */
  const refreshServices = useCallback(async () => {
    await loadServices(true);
  }, [loadServices]);

  /**
   * Search services
   */
  const searchServices = useCallback((searchTerm: string) => {
    safeSetState(prev => {
      const filteredServices = filterServices(
        allServices.current, 
        searchTerm, 
        prev.selectedCategory
      );

      return {
        searchTerm,
        services: filteredServices,
      };
    });
  }, [filterServices, safeSetState]);

  /**
   * Filter by category
   */
  const filterByCategory = useCallback((category: string | null) => {
    safeSetState(prev => {
      const filteredServices = filterServices(
        allServices.current, 
        prev.searchTerm, 
        category
      );

      return {
        selectedCategory: category,
        services: filteredServices,
      };
    });
  }, [filterServices, safeSetState]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    safeSetState(prev => {
      const filteredServices = filterServices(
        allServices.current, 
        '', 
        prev.selectedCategory
      );

      return {
        searchTerm: '',
        services: filteredServices,
      };
    });
  }, [filterServices, safeSetState]);

  /**
   * Retry loading after error
   */
  const retryLoad = useCallback(async () => {
    await loadServices(true);
  }, [loadServices]);

  /**
   * Auto-load services when hook is first used
   */
  useEffect(() => {
    console.log('🔄 [SERVICES LIST HOOK] Hook mounted, initial state:', {
      searchTerm: state.searchTerm,
      selectedCategory: state.selectedCategory,
      loading: state.loading
    });
    
    if (mounted.current) {
      loadServices(true);
    }
  }, []); // Only run once on mount

  return {
    // State
    services: state.services,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    categories: state.categories,
    selectedCategory: state.selectedCategory,
    searchTerm: state.searchTerm,

    // Actions
    loadServices,
    refreshServices,
    searchServices,
    filterByCategory,
    retryLoad,
    clearSearch,
  };
};
