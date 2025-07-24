import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { wixApiClient, WixCart, WixCartItem } from '../utils/wixApiClient';
import { useMember } from './MemberContext';

interface WixCartContextType {
  cart: WixCart | null;
  loading: boolean;
  addToCart: (item: WixCartItem) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineItemIds: string[]) => Promise<void>;
  refreshCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  getItemCount: () => number;
  getTotal: () => string;
  // Member cart helpers
  isMemberCart: () => boolean;
  getCartOwnerInfo: () => { isLoggedIn: boolean; memberEmail?: string };
}

const WixCartContext = createContext<WixCartContextType | undefined>(undefined);

interface WixCartProviderProps {
  children: ReactNode;
}

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
      
      console.log('✅ [CART CONTEXT] Cart refreshed:', {
        cartId: currentCart?.id || 'none',
        itemCount: currentCart?.lineItems?.length || 0,
        total: currentCart?.totals?.total || '0',
        isEmpty: !currentCart?.lineItems || currentCart.lineItems.length === 0
      });
      
      console.log('🛒 [CART CONTEXT] Member context:', {
        isLoggedIn,
        memberEmail: member?.email?.address,
        cartOwnership: isLoggedIn ? 'MEMBER' : 'VISITOR'
      });
    } catch (error) {
      console.error('❌ [CART CONTEXT] Failed to refresh cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, member?.email?.address]);

  // Force sync with server - bypasses any local caching
  const syncWithServer = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [CART SYNC] Force syncing cart with Wix server...');
      console.log('🔄 [CART SYNC] Current local cart state:', {
        localCartId: cart?.id || 'none',
        localItemCount: cart?.lineItems?.length || 0,
        localTotal: getTotal()
      });
      
      // Force fresh fetch from server
      const serverCart = await wixApiClient.getCurrentCart();
      setCart(serverCart);
      
      console.log('🔄 [CART SYNC] Server cart state:', {
        serverCartId: serverCart?.id || 'none',
        serverItemCount: serverCart?.lineItems?.length || 0,
        serverTotal: serverCart?.totals?.total || '0',
        serverIsEmpty: !serverCart?.lineItems || serverCart.lineItems.length === 0
      });
      
      // Compare local vs server state
      const localCount = cart?.lineItems?.length || 0;
      const serverCount = serverCart?.lineItems?.length || 0;
      
      if (localCount !== serverCount) {
        console.warn('⚠️ [CART SYNC] Mismatch detected!', {
          localItems: localCount,
          serverItems: serverCount,
          difference: localCount - serverCount
        });
      } else {
        console.log('✅ [CART SYNC] Local and server state match');
      }
      
             console.log('✅ [CART SYNC] Cart synchronized with server');
     } catch (error) {
       console.error('❌ [CART SYNC] Failed to sync cart with server:', error);
       setCart(null);
     } finally {
       setLoading(false);
     }
   }, [cart]);

  // Initialize cart on mount
  useEffect(() => {
    console.log('🛒 [INIT] Initializing cart on mount...');
    refreshCart();
  }, [refreshCart]); // Run once on mount when refreshCart is available

  // Refresh cart when member login status changes
  useEffect(() => {
    console.log('🛒 [MEMBER CART] Member status changed, refreshing cart...', {
      isLoggedIn,
      memberEmail: member?.email?.address,
    });
    
    // Refresh cart to get the member's cart or visitor cart
    refreshCart();
  }, [refreshCart, isLoggedIn, member?.id]); // Trigger when login status or member ID changes

  const addToCart = useCallback(async (item: WixCartItem) => {
    try {
      console.log('🛒 [CART CONTEXT] Adding item to cart:', {
        productId: item.catalogReference.catalogItemId,
        quantity: item.quantity
      });
      console.log('🛒 [CART CONTEXT] Member context during add:', {
        isLoggedIn,
        memberEmail: member?.email?.address,
        cartOwnership: isLoggedIn ? 'MEMBER' : 'VISITOR'
      });
      
      setLoading(true);
      const updatedCart = await wixApiClient.addToCart([item]);
      setCart(updatedCart);
      
      console.log('🛒 [CART CONTEXT] Add to cart result:', {
        cartId: updatedCart.id,
        itemCount: updatedCart.lineItems?.length || 0,
        total: updatedCart.totals?.total || '0',
        success: updatedCart.lineItems && updatedCart.lineItems.length > 0
      });
      
      // If cart is still empty after adding, run product debug
      if (!updatedCart.lineItems || updatedCart.lineItems.length === 0) {
        console.log('🔍 [CART CONTEXT] Item not added - running automatic product analysis...');
        // Import the debug function dynamically to avoid circular dependency
        import('../utils/wixApiClient').then(({ debugProduct }) => {
          debugProduct(item.catalogReference.catalogItemId);
        });
      }
    } catch (error) {
      console.error('❌ [CART CONTEXT] Failed to add item to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, member?.email?.address]);

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    try {
      console.log('🛒 [CONTEXT] updateQuantity called:', { 
        lineItemId, 
        quantity,
        currentCart: cart?.id,
        currentItems: cart?.lineItems?.length || 0
      });
      setLoading(true);
      
      if (quantity <= 0) {
        console.log('🛒 [CONTEXT] Quantity <= 0, removing item instead');
        await removeFromCart([lineItemId]);
        return;
      }
      
      console.log('🛒 [CONTEXT] Calling wixApiClient.updateCartItemQuantity...');
      const updatedCart = await wixApiClient.updateCartItemQuantity(lineItemId, quantity);
      console.log('🛒 [CONTEXT] API call successful, updating cart state:', {
        newCartId: updatedCart?.id,
        newItemCount: updatedCart?.lineItems?.length || 0,
        newTotal: updatedCart?.totals?.total
      });
      setCart(updatedCart);
      console.log('✅ [CONTEXT] Cart item quantity updated successfully');
    } catch (error) {
      console.error('❌ [CONTEXT] Failed to update cart item quantity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cart]);

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
    console.log('🛒 [TOTAL] getTotal called:', {
      hasCart: !!cart,
      hasLineItems: !!cart?.lineItems,
      lineItemCount: cart?.lineItems?.length || 0,
      wixTotal: cart?.totals?.total,
      wixCurrency: cart?.totals?.currency
    });
    
    if (!cart?.lineItems || cart.lineItems.length === 0) {
      console.log('🛒 [TOTAL] No cart or line items, returning $0.00');
      return '$0.00';
    }
    
    try {
      let amount = 0;
      let currency = 'USD';
      
      // Try to use Wix calculated total first
      if (cart.totals?.total && parseFloat(cart.totals.total) > 0) {
        amount = parseFloat(cart.totals.total);
        currency = cart.totals.currency || 'USD';
        console.log('🛒 [TOTAL] Using Wix calculated total:', { amount, currency });
      } else {
        // Fallback: Calculate manually from line items (for demo products)
        console.log('🛒 [TOTAL] Wix total is 0, calculating manually from line items...');
        
        amount = cart.lineItems.reduce((total, item) => {
          const itemPrice = parseFloat(item.price?.amount || '0');
          const itemTotal = itemPrice * item.quantity;
          console.log(`🛒 [TOTAL] Item: ${item.productName?.original || 'Unknown'}, Price: ${itemPrice}, Qty: ${item.quantity}, Total: ${itemTotal}`);
          return total + itemTotal;
        }, 0);
        
                 // Use currency from first item or cart totals or default to USD
         currency = cart.lineItems[0]?.price?.currency || cart.totals?.currency || 'USD';
        console.log(`🛒 [TOTAL] Manual calculation complete: ${amount} ${currency}`);
      }
      
      const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
      
      console.log('🛒 [TOTAL] Returning formatted total:', formattedTotal);
      return formattedTotal;
    } catch (error) {
      console.error('❌ [TOTAL ERROR] Failed to calculate total:', error);
      return '$0.00';
    }
  }, [cart]);

  const isMemberCart = useCallback((): boolean => {
    return isLoggedIn;
  }, [isLoggedIn]);

  const getCartOwnerInfo = useCallback(() => {
    return {
      isLoggedIn,
      memberEmail: member?.email?.address,
    };
  }, [isLoggedIn, member?.email?.address]);

  const contextValue: WixCartContextType = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    syncWithServer,
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

export const useWixCart = (): WixCartContextType => {
  const context = useContext(WixCartContext);
  if (!context) {
    throw new Error('useWixCart must be used within a WixCartProvider');
  }
  return context;
};

console.log('🛒 [DEBUG] WixCartContext module loaded'); 