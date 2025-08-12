/**
 * useCart - Custom hook for cart logic
 * 
 * Centralizes all cart state management and business logic
 * Makes screens thin and focused on presentation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useWixCart } from '../../context/WixCartContext';
import type { WixProduct } from '../../utils/wixApiClient';

interface CartItem extends WixProduct {
  quantity: number;
  selectedVariant?: any;
  cartItemId?: string;
}

interface UseCartState {
  isCheckingOut: boolean;
  checkoutUrl: string | null;
  showCheckoutModal: boolean;
  appliedCoupon: string | null;
  couponDiscount: number;
  error: string | null;
}

interface UseCartActions {
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => void;
  startCheckout: () => Promise<void>;
  closeCheckout: () => void;
  clearError: () => void;
  refreshCart: () => Promise<void>;
}

interface UseCartReturn extends UseCartState, UseCartActions {
  cart: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  isEmpty: boolean;
  canCheckout: boolean;
}

const INITIAL_STATE: UseCartState = {
  isCheckingOut: false,
  checkoutUrl: null,
  showCheckoutModal: false,
  appliedCoupon: null,
  couponDiscount: 0,
  error: null,
};

export const useCart = (): UseCartReturn => {
  // State
  const [state, setState] = useState<UseCartState>(INITIAL_STATE);
  
  // Cart context
  const {
    cart,
    loading,
    updateQuantity,
    removeFromCart,
    refreshCart: contextRefreshCart,
    getItemCount,
    getTotal,
    syncWithServer,
  } = useWixCart();

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
  const safeSetState = useCallback((updater: Partial<UseCartState> | ((prev: UseCartState) => UseCartState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Update item quantity
   */
  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      safeSetState({ error: null });

      console.log('🔄 [CART HOOK] Updating item quantity:', { itemId, quantity });

      if (quantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await updateQuantity(itemId, quantity);
      }

      console.log('✅ [CART HOOK] Item quantity updated successfully');
    } catch (error) {
      console.error('❌ [CART HOOK] Error updating item quantity:', error);
      
      if (mounted.current) {
        safeSetState({
          error: error instanceof Error ? error.message : 'Failed to update quantity',
        });
      }
    }
  }, [updateQuantity, removeFromCart, safeSetState]);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(async (itemId: string) => {
    try {
      safeSetState({ error: null });

      console.log('🔄 [CART HOOK] Removing item:', itemId);

      await removeFromCart(itemId);

      console.log('✅ [CART HOOK] Item removed successfully');
    } catch (error) {
      console.error('❌ [CART HOOK] Error removing item:', error);
      
      if (mounted.current) {
        safeSetState({
          error: error instanceof Error ? error.message : 'Failed to remove item',
        });
      }
    }
  }, [removeFromCart, safeSetState]);

  /**
   * Apply coupon code
   */
  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      safeSetState({ error: null });

      console.log('🔄 [CART HOOK] Applying coupon:', couponCode);

      // Mock coupon logic - in real app, this would call API
      const mockDiscount = couponCode.toLowerCase() === 'save10' ? 0.1 : 0;
      
      if (mockDiscount > 0) {
        safeSetState({
          appliedCoupon: couponCode,
          couponDiscount: mockDiscount,
        });
        console.log('✅ [CART HOOK] Coupon applied successfully');
      } else {
        throw new Error('Invalid coupon code');
      }
    } catch (error) {
      console.error('❌ [CART HOOK] Error applying coupon:', error);
      
      if (mounted.current) {
        safeSetState({
          error: error instanceof Error ? error.message : 'Invalid coupon code',
        });
      }
    }
  }, [safeSetState]);

  /**
   * Remove applied coupon
   */
  const removeCoupon = useCallback(() => {
    safeSetState({
      appliedCoupon: null,
      couponDiscount: 0,
    });
  }, [safeSetState]);

  /**
   * Start checkout process
   */
  const startCheckout = useCallback(async () => {
    try {
      safeSetState({ isCheckingOut: true, error: null });

      console.log('🔄 [CART HOOK] Starting checkout process');

      // Sync cart with server first
      await syncWithServer();

      // Mock checkout URL generation - in real app, this would call Wix API
      const checkoutUrl = `https://checkout.wix.com/cart/${Date.now()}`;

      if (mounted.current) {
        safeSetState({
          isCheckingOut: false,
          checkoutUrl,
          showCheckoutModal: true,
        });

        console.log('✅ [CART HOOK] Checkout started successfully');
      }
    } catch (error) {
      console.error('❌ [CART HOOK] Error starting checkout:', error);
      
      if (mounted.current) {
        safeSetState({
          isCheckingOut: false,
          error: error instanceof Error ? error.message : 'Failed to start checkout',
        });
      }
    }
  }, [syncWithServer, safeSetState]);

  /**
   * Close checkout modal
   */
  const closeCheckout = useCallback(() => {
    safeSetState({
      showCheckoutModal: false,
      checkoutUrl: null,
    });
  }, [safeSetState]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Refresh cart data
   */
  const refreshCart = useCallback(async () => {
    try {
      safeSetState({ error: null });
      await contextRefreshCart();
    } catch (error) {
      console.error('❌ [CART HOOK] Error refreshing cart:', error);
      
      if (mounted.current) {
        safeSetState({
          error: error instanceof Error ? error.message : 'Failed to refresh cart',
        });
      }
    }
  }, [contextRefreshCart, safeSetState]);

  /**
   * Derived state
   */
  const itemCount = getItemCount();
  const subtotalString = getTotal(); // This returns formatted string like "$19.99"
  
  // Extract numeric value from formatted string for calculations
  const subtotalNumeric = parseFloat(subtotalString.replace(/[^0-9.-]+/g, '')) || 0;
  const totalNumeric = subtotalNumeric * (1 - state.couponDiscount);
  
  // Transform WixCart to CartItem[] for compatibility
  const cartItems: CartItem[] = cart?.lineItems?.map((item: any) => ({
    id: item._id || item.id || '',
    productId: item.catalogReference?.catalogItemId || '',
    name: item.productName?.original || item.productName || '',
    price: parseFloat(item.price?.amount || '0'),
    quantity: item.quantity || 0,
    image: item.image || '',
    selectedVariant: item.catalogReference?.options || null,
    cartItemId: item._id || item.id || '',
  })) || [];

  const isEmpty = cartItems.length === 0;
  const canCheckout = !isEmpty && !loading && !state.isCheckingOut;

  return {
    // Cart state from context (transformed)
    cart: cartItems,
    loading,
    itemCount,
    subtotal: subtotalNumeric,
    total: totalNumeric,
    isEmpty,
    canCheckout,

    // Local state
    isCheckingOut: state.isCheckingOut,
    checkoutUrl: state.checkoutUrl,
    showCheckoutModal: state.showCheckoutModal,
    appliedCoupon: state.appliedCoupon,
    couponDiscount: state.couponDiscount,
    error: state.error,

    // Actions
    updateItemQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    startCheckout,
    closeCheckout,
    clearError,
    refreshCart,
  };
};
