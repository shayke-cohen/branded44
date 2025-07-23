import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { wixApiClient, WixCart, WixCartItem } from '../utils/wixApiClient';

interface WixCartContextType {
  cart: WixCart | null;
  loading: boolean;
  addToCart: (item: WixCartItem) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineItemIds: string[]) => Promise<void>;
  refreshCart: () => Promise<void>;
  getItemCount: () => number;
  getTotal: () => string;
}

const WixCartContext = createContext<WixCartContextType | undefined>(undefined);

interface WixCartProviderProps {
  children: ReactNode;
}

export const WixCartProvider: React.FC<WixCartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<WixCart | null>(null);
  const [loading, setLoading] = useState(false);

  console.log('🛒 [DEBUG] WixCartProvider initialized');

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const currentCart = await wixApiClient.getCurrentCart();
      setCart(currentCart);
      console.log('✅ [CART] Cart refreshed:', currentCart ? `${currentCart.lineItems?.length || 0} items` : 'empty');
    } catch (error) {
      console.error('❌ [ERROR] Failed to refresh cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (item: WixCartItem) => {
    try {
      console.log('🛒 [CART] Adding item to cart:', item.catalogReference.catalogItemId);
      setLoading(true);
      const updatedCart = await wixApiClient.addToCart([item]);
      setCart(updatedCart);
      console.log('✅ [CART] Item added successfully. Cart now has:', updatedCart.lineItems?.length || 0, 'items');
    } catch (error) {
      console.error('❌ [ERROR] Failed to add item to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    try {
      console.log('🛒 [DEBUG] Updating cart item quantity:', { lineItemId, quantity });
      setLoading(true);
      
      if (quantity <= 0) {
        await removeFromCart([lineItemId]);
        return;
      }
      
      const updatedCart = await wixApiClient.updateCartItemQuantity(lineItemId, quantity);
      setCart(updatedCart);
      console.log('✅ [DEBUG] Cart item quantity updated successfully');
    } catch (error) {
      console.error('❌ [ERROR] Failed to update cart item quantity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (lineItemIds: string[]) => {
    try {
      console.log('🛒 [DEBUG] Removing items from cart:', lineItemIds);
      setLoading(true);
      const updatedCart = await wixApiClient.removeFromCart(lineItemIds);
      setCart(updatedCart);
      console.log('✅ [DEBUG] Items removed from cart successfully');
    } catch (error) {
      console.error('❌ [ERROR] Failed to remove items from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getItemCount = useCallback((): number => {
    if (!cart?.lineItems) return 0;
    return cart.lineItems.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotal = useCallback((): string => {
    if (!cart?.totals?.total) return '$0.00';
    
    try {
      const amount = parseFloat(cart.totals.total);
      const currency = cart.totals.currency || 'USD';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch {
      return `${cart.totals.currency || 'USD'} ${cart.totals.total}`;
    }
  }, [cart]);

  const contextValue: WixCartContextType = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    getItemCount,
    getTotal,
  };

  return (
    <WixCartContext.Provider value={contextValue}>
      {children}
    </WixCartContext.Provider>
  );
};

export const useWixCart = (): WixCartContextType => {
  const context = useContext(WixCartContext);
  if (!context) {
    throw new Error('useWixCart must be used within a WixCartProvider');
  }
  return context;
};

console.log('🛒 [DEBUG] WixCartContext module loaded'); 