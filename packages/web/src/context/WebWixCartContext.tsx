import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { WixCart, WixCartItem } from '@mobile/utils/wixApiClient';
import { webWixApiClient } from '../utils/webWixApiClient';
import { useMember } from './WebMemberContext';

interface WixCartContextType {
  cart: WixCart | null;
  loading: boolean;
  addToCart: (item: WixCartItem) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineItemIds: string[]) => Promise<void>;
  refreshCart: () => Promise<void>;
  getItemCount: () => number;
  getTotal: () => string;
  // Member cart helpers
  isMemberCart: () => boolean;
  getCartOwnerInfo: () => { isLoggedIn: boolean; memberEmail?: string };
}

interface WixCartProviderProps {
  children: ReactNode;
}

const WixCartContext = createContext<WixCartContextType | undefined>(undefined);

export const WixCartProvider: React.FC<WixCartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<WixCart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, member } = useMember();

  console.log('🛒 [DEBUG] WixCartProvider initialized');

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const currentCart = await webWixApiClient.getCurrentCart();
      setCart(currentCart);
      console.log('✅ [CART] Cart refreshed:', currentCart ? `${currentCart.lineItems?.length || 0} items` : 'empty');
      console.log('🛒 [MEMBER CART] Cart context:', {
        isLoggedIn,
        memberEmail: member?.email?.address,
        cartId: currentCart?.id,
        itemCount: currentCart?.lineItems?.length || 0,
      });
    } catch (error) {
      console.error('❌ [CART] Failed to refresh cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, member?.email?.address]);

  const addToCart = useCallback(async (item: WixCartItem) => {
    try {
      setLoading(true);
      const updatedCart = await webWixApiClient.addToCart([item]);
      setCart(updatedCart);
      console.log('✅ [CART] Item added to cart:', item.catalogReference.catalogItemId);
    } catch (error) {
      console.error('❌ [CART] Failed to add item to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    try {
      setLoading(true);
      // For now, we'll refresh the cart - specific update methods would need to be implemented
      await refreshCart();
      console.log('✅ [CART] Item quantity updated:', { lineItemId, quantity });
    } catch (error) {
      console.error('❌ [CART] Failed to update item quantity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const removeFromCart = useCallback(async (lineItemIds: string[]) => {
    try {
      setLoading(true);
      const updatedCart = await webWixApiClient.removeFromCart(lineItemIds);
      setCart(updatedCart);
      console.log('✅ [CART] Items removed from cart:', lineItemIds);
    } catch (error) {
      console.error('❌ [CART] Failed to remove items from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getItemCount = useCallback(() => {
    return cart?.lineItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  }, [cart]);

  const getTotal = useCallback(() => {
    return cart?.totals?.total || '$0.00';
  }, [cart]);

  const isMemberCart = useCallback(() => {
    return isLoggedIn && !!member;
  }, [isLoggedIn, member]);

  const getCartOwnerInfo = useCallback(() => {
    return {
      isLoggedIn,
      memberEmail: member?.email?.address,
    };
  }, [isLoggedIn, member]);

  // Initialize cart on mount and when member status changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const contextValue: WixCartContextType = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    getItemCount,
    getTotal,
    isMemberCart,
    getCartOwnerInfo,
  };

  return (
    <WixCartContext.Provider value={contextValue}>
      {children}
    </WixCartContext.Provider>
  );
};

export const useWixCart = () => {
  const context = useContext(WixCartContext);
  if (context === undefined) {
    throw new Error('useWixCart must be used within a WixCartProvider');
  }
  return context;
};

export default WixCartContext; 