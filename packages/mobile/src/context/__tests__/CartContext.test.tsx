import React from 'react';
import {render, fireEvent, waitFor} from '../../test/test-utils';
import {render as renderWithoutProvider} from '@testing-library/react-native';
import {CartProvider, useCart} from '../CartContext';
import {SAMPLE_PRODUCTS} from '../../constants';
import {Text, TouchableOpacity, View} from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Test component that uses the cart context
const TestCartComponent = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
  } = useCart();

  const testProduct = SAMPLE_PRODUCTS[0];

  return (
    <View>
      <Text testID="cart-count">{getCartItemCount()}</Text>
      <Text testID="cart-total">${getCartTotal().toFixed(2)}</Text>
      <Text testID="cart-items-length">{cart.items.length}</Text>
      
      <TouchableOpacity
        testID="add-to-cart"
        onPress={() => addToCart(testProduct, '9', 'Black', 1)}>
        <Text>Add to Cart</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="add-multiple"
        onPress={() => addToCart(testProduct, '9', 'Black', 2)}>
        <Text>Add Multiple</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="remove-from-cart"
        onPress={() => removeFromCart(testProduct.id, '9', 'Black')}>
        <Text>Remove from Cart</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="update-quantity"
        onPress={() => updateQuantity(testProduct.id, '9', 'Black', 3)}>
        <Text>Update Quantity</Text>
      </TouchableOpacity>
      
      <TouchableOpacity testID="clear-cart" onPress={clearCart}>
        <Text>Clear Cart</Text>
      </TouchableOpacity>
      
      {cart.items.map((item, index) => (
        <View key={index} testID={`cart-item-${index}`}>
          <Text testID={`item-name-${index}`}>{item.product.name}</Text>
          <Text testID={`item-size-${index}`}>{item.size}</Text>
          <Text testID={`item-color-${index}`}>{item.color}</Text>
          <Text testID={`item-quantity-${index}`}>{item.quantity}</Text>
        </View>
      ))}
    </View>
  );
};

const renderWithCartProvider = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>);
};

describe('CartContext', () => {
  describe('Initial State', () => {
    it('starts with empty cart', () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      expect(getByTestId('cart-count')).toHaveTextContent('0');
      expect(getByTestId('cart-total')).toHaveTextContent('$0.00');
      expect(getByTestId('cart-items-length')).toHaveTextContent('0');
    });
  });

  describe('Adding Items', () => {
    it('adds item to cart', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      const addButton = getByTestId('add-to-cart');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('1');
        expect(getByTestId('cart-items-length')).toHaveTextContent('1');
        expect(getByTestId('item-name-0')).toHaveTextContent('Air Max 270');
        expect(getByTestId('item-size-0')).toHaveTextContent('9');
        expect(getByTestId('item-color-0')).toHaveTextContent('Black');
        expect(getByTestId('item-quantity-0')).toHaveTextContent('1');
      });
    });

    it('adds multiple quantities of same item', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      const addButton = getByTestId('add-multiple');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('2');
        expect(getByTestId('cart-items-length')).toHaveTextContent('1');
        expect(getByTestId('item-quantity-0')).toHaveTextContent('2');
      });
    });

    it('increases quantity when adding existing item', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      const addButton = getByTestId('add-to-cart');
      
      // Add item twice
      fireEvent.press(addButton);
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('2');
        expect(getByTestId('cart-items-length')).toHaveTextContent('1');
        expect(getByTestId('item-quantity-0')).toHaveTextContent('2');
      });
    });

    it('calculates total correctly', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      const addButton = getByTestId('add-to-cart');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        // Air Max 270 costs $150
        expect(getByTestId('cart-total')).toHaveTextContent('$150.00');
      });
      
      // Add another one
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-total')).toHaveTextContent('$300.00');
      });
    });
  });

  describe('Removing Items', () => {
    it('removes item from cart', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      // First add an item
      const addButton = getByTestId('add-to-cart');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('1');
      });
      
      // Then remove it
      const removeButton = getByTestId('remove-from-cart');
      fireEvent.press(removeButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('0');
        expect(getByTestId('cart-items-length')).toHaveTextContent('0');
        expect(getByTestId('cart-total')).toHaveTextContent('$0.00');
      });
    });
  });

  describe('Updating Quantities', () => {
    it('updates item quantity', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      // First add an item
      const addButton = getByTestId('add-to-cart');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('item-quantity-0')).toHaveTextContent('1');
      });
      
      // Update quantity to 3
      const updateButton = getByTestId('update-quantity');
      fireEvent.press(updateButton);
      
      await waitFor(() => {
        expect(getByTestId('item-quantity-0')).toHaveTextContent('3');
        expect(getByTestId('cart-count')).toHaveTextContent('3');
        expect(getByTestId('cart-total')).toHaveTextContent('$450.00');
      });
    });

    it('removes item when quantity is set to 0', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      // First add an item
      const addButton = getByTestId('add-to-cart');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('1');
      });
      
      // Update quantity to 0 (should remove item)
      const TestComponent = () => {
        const {updateQuantity} = useCart();
        return (
          <TouchableOpacity
            testID="set-zero"
            onPress={() => updateQuantity(SAMPLE_PRODUCTS[0].id, '9', 'Black', 0)}>
            <Text>Set Zero</Text>
          </TouchableOpacity>
        );
      };
      
      const {getByTestId: getByTestIdWithZero} = renderWithCartProvider(
        <View>
          <TestCartComponent />
          <TestComponent />
        </View>
      );
      
      const setZeroButton = getByTestIdWithZero('set-zero');
      fireEvent.press(setZeroButton);
      
      await waitFor(() => {
        expect(getByTestIdWithZero('cart-count')).toHaveTextContent('0');
        expect(getByTestIdWithZero('cart-items-length')).toHaveTextContent('0');
      });
    });
  });

  describe('Clearing Cart', () => {
    it('clears all items from cart', async () => {
      const {getByTestId} = renderWithCartProvider(<TestCartComponent />);
      
      // Add multiple items
      const addButton = getByTestId('add-to-cart');
      fireEvent.press(addButton);
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('2');
      });
      
      // Clear cart
      const clearButton = getByTestId('clear-cart');
      fireEvent.press(clearButton);
      
      await waitFor(() => {
        expect(getByTestId('cart-count')).toHaveTextContent('0');
        expect(getByTestId('cart-items-length')).toHaveTextContent('0');
        expect(getByTestId('cart-total')).toHaveTextContent('$0.00');
      });
    });
  });

  describe('Error Handling', () => {
    it('throws error when useCart is used outside CartProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        renderWithoutProvider(<TestCartComponent />);
      }).toThrow('useCart must be used within a CartProvider');
      
      console.error = originalError;
    });
  });
});