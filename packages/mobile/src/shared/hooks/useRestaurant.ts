/**
 * useRestaurant - Custom hook for restaurant logic
 * 
 * Centralizes all restaurant state management and business logic
 * Makes screens thin and focused on presentation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { restaurantService, RestaurantOrder } from '../../screens/wix/restaurant/shared/WixRestaurantService';
import type { Restaurant, MenuItem, MenuCategoryData, OrderItem } from '../../components/blocks/restaurant';

export type FoodScreenView = 'menu' | 'restaurant' | 'order' | 'checkout';

interface UseRestaurantState {
  currentView: FoodScreenView;
  restaurant: Restaurant | null;
  menuCategories: MenuCategoryData[];
  popularItems: MenuItem[];
  featuredItems: MenuItem[];
  cart: OrderItem[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  searchResults: MenuItem[];
  error: string | null;
  orderSubmitting: boolean;
}

interface UseRestaurantActions {
  loadRestaurant: (restaurantId?: string) => Promise<void>;
  loadMenu: (restaurantId?: string) => Promise<void>;
  loadPopularItems: (restaurantId?: string) => Promise<void>;
  loadFeaturedItems: (restaurantId?: string) => Promise<void>;
  searchItems: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  addToCart: (item: MenuItem, quantity?: number, customizations?: any) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  submitOrder: (customerInfo: any, orderType: 'delivery' | 'pickup') => Promise<boolean>;
  setCurrentView: (view: FoodScreenView) => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
  retryLoad: () => Promise<void>;
}

interface UseRestaurantReturn extends UseRestaurantState, UseRestaurantActions {
  cartItemCount: number;
  cartTotal: number;
  isRestaurantOpen: boolean;
  estimatedDeliveryTime: string;
  canCheckout: boolean;
}

const INITIAL_STATE: UseRestaurantState = {
  currentView: 'menu',
  restaurant: null,
  menuCategories: [],
  popularItems: [],
  featuredItems: [],
  cart: [],
  loading: true, // Start as true to show loading screen
  refreshing: false,
  searchQuery: '',
  searchResults: [],
  error: null,
  orderSubmitting: false,
};

export const useRestaurant = (): UseRestaurantReturn => {
  // State
  const [state, setState] = useState<UseRestaurantState>(INITIAL_STATE);
  
  // Refs
  const mounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseRestaurantState> | ((prev: UseRestaurantState) => UseRestaurantState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Load restaurant information
   */
  const loadRestaurant = useCallback(async (restaurantId?: string) => {
    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [RESTAURANT HOOK] Loading restaurant...');

      const restaurant = await restaurantService.getRestaurant(restaurantId);

      if (mounted.current) {
        safeSetState({
          restaurant,
          loading: false,
        });

        console.log('✅ [RESTAURANT HOOK] Restaurant loaded successfully');
      }
    } catch (error) {
      console.error('❌ [RESTAURANT HOOK] Error loading restaurant:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load restaurant',
        });
      }
    }
  }, [safeSetState]);

  /**
   * Load menu categories and items
   */
  const loadMenu = useCallback(async (restaurantId?: string) => {
    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [RESTAURANT HOOK] Loading menu...');

      const menuCategories = await restaurantService.getMenu(restaurantId);

      if (mounted.current) {
        safeSetState({
          menuCategories,
          loading: false,
        });

        console.log('✅ [RESTAURANT HOOK] Menu loaded successfully');
      }
    } catch (error) {
      console.error('❌ [RESTAURANT HOOK] Error loading menu:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load menu',
        });
      }
    }
  }, [safeSetState]);

  /**
   * Load popular items
   */
  const loadPopularItems = useCallback(async (restaurantId?: string) => {
    try {
      console.log('🔄 [RESTAURANT HOOK] Loading popular items...');

      const popularItems = await restaurantService.getPopularItems(restaurantId);

      if (mounted.current) {
        safeSetState({ popularItems });
        console.log('✅ [RESTAURANT HOOK] Popular items loaded');
      }
    } catch (error) {
      console.error('❌ [RESTAURANT HOOK] Error loading popular items:', error);
    }
  }, [safeSetState]);

  /**
   * Load featured items
   */
  const loadFeaturedItems = useCallback(async (restaurantId?: string) => {
    try {
      console.log('🔄 [RESTAURANT HOOK] Loading featured items...');

      const featuredItems = await restaurantService.getFeaturedItems(restaurantId);

      if (mounted.current) {
        safeSetState({ featuredItems });
        console.log('✅ [RESTAURANT HOOK] Featured items loaded');
      }
    } catch (error) {
      console.error('❌ [RESTAURANT HOOK] Error loading featured items:', error);
    }
  }, [safeSetState]);

  /**
   * Search menu items
   */
  const searchItems = useCallback(async (query: string) => {
    try {
      console.log('🔄 [RESTAURANT HOOK] Searching items:', query);

      if (!query.trim()) {
        safeSetState({ searchResults: [], searchQuery: '' });
        return;
      }

      const searchResults = await restaurantService.searchMenuItems(query.trim());

      if (mounted.current) {
        safeSetState({
          searchResults,
          searchQuery: query,
        });

        console.log('✅ [RESTAURANT HOOK] Search completed', {
          query,
          resultsCount: searchResults.length
        });
      }
    } catch (error) {
      console.error('❌ [RESTAURANT HOOK] Error searching items:', error);
      
      if (mounted.current) {
        safeSetState({
          error: error instanceof Error ? error.message : 'Search failed',
        });
      }
    }
  }, [safeSetState]);

  /**
   * Set search query (for controlled input)
   */
  const setSearchQuery = useCallback((query: string) => {
    safeSetState({ searchQuery: query });
  }, [safeSetState]);

  /**
   * Add item to cart
   */
  const addToCart = useCallback((item: MenuItem, quantity: number = 1, customizations?: any) => {
    safeSetState(prev => {
      const existingItemIndex = prev.cart.findIndex(cartItem => 
        cartItem.id === item.id && 
        JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
      );

      let newCart: OrderItem[];

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newCart = [...prev.cart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item to cart
        const cartItem: OrderItem = {
          id: item.id || Math.random().toString(),
          name: item.name || 'Item',
          price: item.price || 0,
          quantity,
          customizations,
          imageUrl: item.imageUrl,
        };
        newCart = [...prev.cart, cartItem];
      }

      console.log('🛒 [RESTAURANT HOOK] Item added to cart', {
        itemName: item.name,
        quantity,
        cartSize: newCart.length
      });

      return { cart: newCart };
    });
  }, [safeSetState]);

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback((itemId: string, quantity: number) => {
    safeSetState(prev => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          cart: prev.cart.filter(item => item.id !== itemId)
        };
      }

      return {
        cart: prev.cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      };
    });
  }, [safeSetState]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback((itemId: string) => {
    safeSetState(prev => ({
      cart: prev.cart.filter(item => item.id !== itemId)
    }));
  }, [safeSetState]);

  /**
   * Clear cart
   */
  const clearCart = useCallback(() => {
    safeSetState({ cart: [] });
  }, [safeSetState]);

  /**
   * Submit order
   */
  const submitOrder = useCallback(async (customerInfo: any, orderType: 'delivery' | 'pickup'): Promise<boolean> => {
    try {
      safeSetState({ orderSubmitting: true, error: null });

      console.log('🔄 [RESTAURANT HOOK] Submitting order...', {
        itemCount: state.cart.length,
        orderType
      });

      const totals = restaurantService.calculateOrderTotals(state.cart, orderType === 'delivery' ? 5 : 0);

      const order: RestaurantOrder = {
        items: state.cart,
        subtotal: totals.subtotal,
        tax: totals.tax,
        deliveryFee: orderType === 'delivery' ? 5 : 0,
        total: totals.total,
        customerInfo,
        orderType,
      };

      const validation = restaurantService.validateOrder(order);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const result = await restaurantService.submitOrder(order);

      if (result.success) {
        console.log('✅ [RESTAURANT HOOK] Order submitted successfully');
        
        if (mounted.current) {
          safeSetState({
            orderSubmitting: false,
            cart: [], // Clear cart after successful order
          });
        }

        return true;
      }

      throw new Error(result.error || 'Failed to submit order');
    } catch (error) {
      console.error('❌ [RESTAURANT HOOK] Error submitting order:', error);
      
      if (mounted.current) {
        safeSetState({
          orderSubmitting: false,
          error: error instanceof Error ? error.message : 'Failed to submit order',
        });
      }

      return false;
    }
  }, [state.cart, safeSetState]);

  /**
   * Set current view
   */
  const setCurrentView = useCallback((view: FoodScreenView) => {
    safeSetState({ currentView: view });
  }, [safeSetState]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async (restaurantId?: string) => {
    try {
      console.log('🔄 [RESTAURANT HOOK] Starting refreshData...');
      safeSetState({ refreshing: true, error: null });

      console.log('🔄 [RESTAURANT HOOK] Refreshing data...');

      console.log('🔄 [RESTAURANT HOOK] Loading restaurant...');
      await loadRestaurant(restaurantId);
      
      console.log('🔄 [RESTAURANT HOOK] Loading menu...');
      await loadMenu(restaurantId);
      
      console.log('🔄 [RESTAURANT HOOK] Loading popular items...');
      await loadPopularItems(restaurantId);
      
      console.log('🔄 [RESTAURANT HOOK] Loading featured items...');
      await loadFeaturedItems(restaurantId);

      if (mounted.current) {
        safeSetState({ refreshing: false });
        console.log('✅ [RESTAURANT HOOK] Data refreshed successfully');
      }
    } catch (error) {
      console.error('❌ [RESTAURANT HOOK] Error refreshing data:', error);
      
      if (mounted.current) {
        safeSetState({
          refreshing: false,
          error: error instanceof Error ? error.message : 'Failed to refresh data',
        });
      }
    }
  }, [loadRestaurant, loadMenu, loadPopularItems, loadFeaturedItems, safeSetState]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Retry loading after error
   */
  const retryLoad = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  /**
   * Auto-load data when hook is first used
   */
  useEffect(() => {
    console.log('🔄 [RESTAURANT HOOK] Hook mounted, auto-loading data...');
    if (mounted.current) {
      refreshData();
    }
  }, []); // Only run once on mount

  /**
   * Derived state
   */
  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = restaurantService.calculateOrderTotals(state.cart).total;
  const isRestaurantOpen = state.restaurant ? restaurantService.isRestaurantOpen(state.restaurant) : true;
  const estimatedDeliveryTime = state.restaurant 
    ? restaurantService.getEstimatedDeliveryTime(state.restaurant, 'delivery')
    : '30-45 min';
  const canCheckout = cartItemCount > 0 && !state.orderSubmitting;

  return {
    // State
    currentView: state.currentView,
    restaurant: state.restaurant,
    menuCategories: state.menuCategories,
    popularItems: state.popularItems,
    featuredItems: state.featuredItems,
    cart: state.cart,
    loading: state.loading,
    refreshing: state.refreshing,
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    error: state.error,
    orderSubmitting: state.orderSubmitting,

    // Actions
    loadRestaurant,
    loadMenu,
    loadPopularItems,
    loadFeaturedItems,
    searchItems,
    setSearchQuery,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    submitOrder,
    setCurrentView,
    refreshData,
    clearError,
    retryLoad,

    // Derived state
    cartItemCount,
    cartTotal,
    isRestaurantOpen,
    estimatedDeliveryTime,
    canCheckout,
  };
};
