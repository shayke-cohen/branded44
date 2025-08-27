import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { WixCart, WixCartItem } from '@mobile/utils/wixApiClient';
import { wixApiClient } from '@mobile/utils/wixApiClient';
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
      const currentCart = await wixApiClient.getCurrentCart();
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

  const addToCart = useCallback(async (item: WixCartItem | any) => {
    try {
      setLoading(true);
      
      // Transform product to cart item if needed
      let cartItem: WixCartItem;
      if ('catalogReference' in item) {
        // Already a cart item
        cartItem = item;
      } else {
        // Transform product to cart item
        cartItem = {
          catalogReference: {
            appId: 'wix-stores', // Default Wix Stores app ID
            catalogItemId: item.catalogItemId || item.id,
            options: item.selectedVariant ? { variant: item.selectedVariant } : {}
          },
          quantity: item.quantity || 1
        };
      }
      
      console.log('🛒 [CART] Transforming item for cart:', {
        originalItem: item,
        cartItem: cartItem,
        catalogItemId: cartItem.catalogReference?.catalogItemId
      });
      
      // Extract the product ID and quantity for the web API client
      const productId = cartItem.catalogReference?.catalogItemId || item.id || item.catalogItemId;
      const quantity = cartItem.quantity || 1;
      const options = cartItem.catalogReference?.options;
      
      if (!productId) {
        throw new Error('Product ID is required to add item to cart');
      }
      
      console.log('🛒 [CART] Current cart before adding:', cart ? `${cart.lineItems?.length || 0} items` : 'empty');
      
      const updatedCart = await wixApiClient.addToCart([cartItem]);
      setCart(updatedCart);
      
      console.log('✅ [CART] Item added to cart:', productId);
      console.log('🛒 [CART] Updated cart after adding:', updatedCart ? `${updatedCart.lineItems?.length || 0} items` : 'empty');
      console.log('🎯 [CART] Skipping refresh - using updated cart from server response');
      
    } catch (error) {
      console.error('❌ [CART] Failed to add item to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cart, refreshCart]);

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
      
      // Use the consolidated API client that accepts array of lineItemIds
      const updatedCart = await wixApiClient.removeFromCart(lineItemIds);
      setCart(updatedCart);
      console.log('✅ [CART] Items removed from cart:', lineItemIds);
    } catch (error) {
      console.error('❌ [CART] Failed to remove items from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

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
    console.log('🔄 [CART] Initializing cart for member status change');
    refreshCart();
  }, [isLoggedIn, member?.email?.address]); // Only depend on actual member state changes

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