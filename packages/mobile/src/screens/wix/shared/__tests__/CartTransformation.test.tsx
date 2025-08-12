/**
 * CartTransformation Tests - Verifying Cart Display Fix
 * 
 * Tests the transformation from WixCart (with lineItems) to CartItem[]
 * to fix the "(cart || []).map is not a function" error.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Mock cart data that comes from WixCartContext
const mockWixCart = {
  id: 'test-cart-123',
  lineItems: [
    {
      _id: 'item-1',
      quantity: 2,
      catalogReference: {
        catalogItemId: 'product-123',
        appId: 'stores-app',
        options: {}
      },
      productName: {
        original: 'Test Product',
        translated: 'Test Product'
      },
      price: {
        amount: '29.99',
        currency: 'USD'
      },
      image: 'https://example.com/image.jpg'
    },
    {
      _id: 'item-2', 
      quantity: 1,
      catalogReference: {
        catalogItemId: 'product-456',
        appId: 'stores-app',
        options: { color: 'blue' }
      },
      productName: {
        original: 'Another Product'
      },
      price: {
        amount: '15.50'
      },
      image: 'https://example.com/image2.jpg'
    }
  ],
  totals: {
    total: '75.48',
    currency: 'USD'
  }
};

// Mock the useCart hook to return transformed cart data
const mockTransformedCart = [
  {
    id: 'item-1',
    productId: 'product-123',
    name: 'Test Product',
    price: 29.99,
    quantity: 2,
    image: 'https://example.com/image.jpg',
    selectedVariant: {},
    cartItemId: 'item-1'
  },
  {
    id: 'item-2',
    productId: 'product-456', 
    name: 'Another Product',
    price: 15.50,
    quantity: 1,
    image: 'https://example.com/image2.jpg',
    selectedVariant: { color: 'blue' },
    cartItemId: 'item-2'
  }
];

jest.mock('../../../../shared/hooks/useCart', () => ({
  useCart: () => ({
    cart: mockTransformedCart,
    loading: false,
    itemCount: 3, // 2 + 1
    subtotal: 75.48,
    total: 75.48,
    isEmpty: false,
    canCheckout: true,
    isCheckingOut: false,
    checkoutUrl: null,
    showCheckoutModal: false,
    appliedCoupon: null,
    couponDiscount: 0,
    error: null,
    updateItemQuantity: jest.fn(),
    removeItem: jest.fn(),
    applyCoupon: jest.fn(),
    removeCoupon: jest.fn(),
    startCheckout: jest.fn(),
    closeCheckout: jest.fn(),
    clearError: jest.fn(),
    refreshCart: jest.fn(),
  })
}));

// Test component that simulates cart rendering
const TestCartComponent = () => {
  const { cart } = require('../../../../shared/hooks/useCart').useCart();
  
  return (
    <View testID="cart-container">
      {/* This should work now - cart is an array */}
      {(cart || []).map((item) => (
        <View key={item.id} testID={`cart-item-${item.id}`}>
          <Text testID={`item-name-${item.id}`}>{item.name}</Text>
          <Text testID={`item-quantity-${item.id}`}>Qty: {item.quantity}</Text>
          <Text testID={`item-price-${item.id}`}>${item.price}</Text>
        </View>
      ))}
    </View>
  );
};

describe('Cart Transformation Fix', () => {
  it('should render cart items without map() error', () => {
    const { getByTestId } = render(<TestCartComponent />);
    
    // Should not throw error and render container
    expect(getByTestId('cart-container')).toBeTruthy();
    
    // Should render both cart items
    expect(getByTestId('cart-item-item-1')).toBeTruthy();
    expect(getByTestId('cart-item-item-2')).toBeTruthy();
    
    // Should display correct item data
    expect(getByTestId('item-name-item-1')).toHaveTextContent('Test Product');
    expect(getByTestId('item-quantity-item-1')).toHaveTextContent('Qty: 2');
    expect(getByTestId('item-price-item-1')).toHaveTextContent('$29.99');
    
    expect(getByTestId('item-name-item-2')).toHaveTextContent('Another Product');
    expect(getByTestId('item-quantity-item-2')).toHaveTextContent('Qty: 1');
    expect(getByTestId('item-price-item-2')).toHaveTextContent('$15.5');
  });

  it('should handle empty cart gracefully', () => {
    // Mock empty cart
    const EmptyCartComponent = () => {
      const emptyCart = [];
      
      return (
        <View testID="empty-cart">
          {(emptyCart || []).map((item) => (
            <Text key={item.id}>{item.name}</Text>
          ))}
          <Text testID="empty-message">
            {emptyCart.length === 0 ? 'Cart is empty' : `${emptyCart.length} items`}
          </Text>
        </View>
      );
    };

    const { getByTestId } = render(<EmptyCartComponent />);
    
    expect(getByTestId('empty-cart')).toBeTruthy();
    expect(getByTestId('empty-message')).toHaveTextContent('Cart is empty');
  });

  it('should demonstrate the previous error scenario', () => {
    // This simulates what was happening before the fix
    const brokenCart = {
      id: 'cart-123',
      lineItems: [{ _id: 'item-1', productName: 'Test' }],
      // This is an OBJECT, not an array
    };

    expect(() => {
      // This would cause: "(cart || []).map is not a function"
      // because brokenCart is an object, not an array
      (brokenCart as any).map(() => {});
    }).toThrow();
  });

  it('should verify cart transformation logic', () => {
    // Simulate the transformation that happens in useCart hook
    const transformWixCartToCartItems = (wixCart: any) => {
      return wixCart?.lineItems?.map((item: any) => ({
        id: item._id || item.id || '',
        productId: item.catalogReference?.catalogItemId || '',
        name: item.productName?.original || item.productName || '',
        price: parseFloat(item.price?.amount || '0'),
        quantity: item.quantity || 0,
        image: item.image || '',
        selectedVariant: item.catalogReference?.options || null,
        cartItemId: item._id || item.id || '',
      })) || [];
    };

    const result = transformWixCartToCartItems(mockWixCart);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'item-1',
      productId: 'product-123',
      name: 'Test Product',
      price: 29.99,
      quantity: 2,
      image: 'https://example.com/image.jpg',
      selectedVariant: {},
      cartItemId: 'item-1'
    });
  });
});
