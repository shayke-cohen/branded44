import React, {createContext, useContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Cart, CartItem, Product} from '../types';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

interface CartAction {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'UPDATE_QUANTITY' | 'CLEAR_CART' | 'LOAD_CART';
  payload?: any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@cart_data';

const initialCart: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
};

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const {product, size, color, quantity = 1} = action.payload;
      const existingItemIndex = state.items.findIndex(
        item =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color,
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        const newItem: CartItem = {product, size, color, quantity};
        newItems = [...state.items, newItem];
      }

      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {items: newItems, total, itemCount};
    }

    case 'REMOVE_ITEM': {
      const {productId, size, color} = action.payload;
      const newItems = state.items.filter(
        item =>
          !(
            item.product.id === productId &&
            item.size === size &&
            item.color === color
          ),
      );

      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {items: newItems, total, itemCount};
    }

    case 'UPDATE_QUANTITY': {
      const {productId, size, color, quantity} = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, {
          type: 'REMOVE_ITEM',
          payload: {productId, size, color},
        });
      }

      const newItems = state.items.map(item =>
        item.product.id === productId &&
        item.size === size &&
        item.color === color
          ? {...item, quantity}
          : item,
      );

      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {items: newItems, total, itemCount};
    }

    case 'CLEAR_CART':
      return initialCart;

    case 'LOAD_CART':
      return action.payload || initialCart;

    default:
      return state;
  }
};

export const CartProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Load cart from storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCartToStorage();
  }, [cart]);

  const loadCartFromStorage = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        dispatch({type: 'LOAD_CART', payload: parsedCart});
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const addToCart = (
    product: Product,
    size: string,
    color: string,
    quantity = 1,
  ) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {product, size, color, quantity},
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: {productId, size, color},
    });
  };

  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {productId, size, color, quantity},
    });
  };

  const clearCart = () => {
    dispatch({type: 'CLEAR_CART'});
  };

  const getCartItemCount = () => cart.itemCount;

  const getCartTotal = () => cart.total;

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};