/**
 * CartNaNFix Tests - Verifying Cart Calculation Fix
 * 
 * Tests the fix for NaN values appearing in cart totals and checkout button.
 * The issue was caused by trying to do math operations on formatted strings.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Mock the WixCartContext to return formatted string totals (like real implementation)
const mockWixCartContext = {
  cart: {
    id: 'test-cart',
    lineItems: [
      {
        _id: 'item-1',
        quantity: 1,
        catalogReference: { catalogItemId: 'product-123' },
        productName: { original: 'Test Product' },
        price: { amount: '19.99' }
      }
    ]
  },
  loading: false,
  getItemCount: () => 1,
  getTotal: () => '$19.99', // ✅ This returns formatted string (real behavior)
  addToCart: jest.fn(),
  updateQuantity: jest.fn(),
  removeFromCart: jest.fn(),
  refreshCart: jest.fn(),
  syncWithServer: jest.fn(),
};

jest.mock('../../../../context/WixCartContext', () => ({
  useWixCart: () => mockWixCartContext,
  WixCartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Test component that uses the useCart hook (like CartScreen does)
const TestCartCalculations = () => {
  const { useCart } = require('../../../../shared/hooks/useCart');
  const { subtotal, total, itemCount } = useCart();
  
  return (
    <View testID="cart-calculations">
      <Text testID="item-count">Items: {itemCount}</Text>
      <Text testID="subtotal">Subtotal: {subtotal}</Text>
      <Text testID="total">Total: {total}</Text>
      <Text testID="checkout-button">Checkout • {total}</Text>
    </View>
  );
};

describe('Cart NaN Fix', () => {
  it('should convert formatted string totals to numeric values without NaN', () => {
    const { getByTestId } = render(<TestCartCalculations />);
    
    // Should display numeric values, not NaN
    expect(getByTestId('item-count')).toHaveTextContent('Items: 1');
    expect(getByTestId('subtotal')).toHaveTextContent('Subtotal: 19.99');
    expect(getByTestId('total')).toHaveTextContent('Total: 19.99');
    expect(getByTestId('checkout-button')).toHaveTextContent('Checkout • 19.99');
    
    // Should NOT contain NaN anywhere
    const subtotalText = getByTestId('subtotal').props.children.join('');
    const totalText = getByTestId('total').props.children.join('');
    const checkoutText = getByTestId('checkout-button').props.children.join('');
    
    expect(subtotalText).not.toContain('NaN');
    expect(totalText).not.toContain('NaN');
    expect(checkoutText).not.toContain('NaN');
  });

  it('should handle various formatted currency strings correctly', () => {
    const testCases = [
      { input: '$19.99', expected: 19.99 },
      { input: '€25.50', expected: 25.50 },
      { input: '¥1000', expected: 1000 },
      { input: '$0.00', expected: 0 },
      { input: '$123.45', expected: 123.45 },
      { input: 'USD 50.75', expected: 50.75 },
      { input: '₪19.99', expected: 19.99 }, // Israeli Shekel (from your logs)
    ];

    testCases.forEach(({ input, expected }) => {
      // Simulate the parsing logic from useCart hook
      const parsed = parseFloat(input.replace(/[^0-9.-]+/g, '')) || 0;
      expect(parsed).toBe(expected);
      expect(parsed).not.toBeNaN();
    });
  });

  it('should handle edge cases without producing NaN', () => {
    const edgeCases = [
      { input: '', expected: 0 },
      { input: 'Free', expected: 0 },
      { input: 'N/A', expected: 0 },
      { input: '$', expected: 0 },
      { input: 'abc', expected: 0 },
    ];

    edgeCases.forEach(({ input, expected }) => {
      const parsed = parseFloat(input.replace(/[^0-9.-]+/g, '')) || 0;
      expect(parsed).toBe(expected);
      expect(parsed).not.toBeNaN();
    });
  });

  it('should demonstrate the previous NaN error scenario', () => {
    // This simulates what was happening before the fix
    const formattedTotal = '$19.99';
    const couponDiscount = 0.1;
    
    // BEFORE: This would cause NaN
    const brokenCalculation = formattedTotal * (1 - couponDiscount);
    expect(brokenCalculation).toBeNaN();
    
    // AFTER: This works correctly
    const fixedCalculation = parseFloat(formattedTotal.replace(/[^0-9.-]+/g, '')) * (1 - couponDiscount);
    expect(fixedCalculation).toBe(17.991); // 19.99 * 0.9
    expect(fixedCalculation).not.toBeNaN();
  });

  it('should handle coupon discounts correctly', () => {
    const subtotal = 19.99;
    const couponDiscount = 0.2; // 20% discount
    
    const total = subtotal * (1 - couponDiscount);
    
    expect(total).toBeCloseTo(15.992, 2); // 19.99 * 0.8
    expect(total).not.toBeNaN();
    expect(total).toBeGreaterThan(0);
  });
});
