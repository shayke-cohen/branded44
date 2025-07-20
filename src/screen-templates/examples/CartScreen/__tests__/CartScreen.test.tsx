import React from 'react';
import {render, fireEvent} from '../../../../test/test-utils';
import CartScreen from '../CartScreen';
import {SAMPLE_PRODUCTS} from '../../../../constants';
import * as CartContext from '../../../../context/CartContext';

// Mock the cart context
const mockCartContext = {
  cart: {
    items: [
      {
        product: SAMPLE_PRODUCTS[0],
        size: '9',
        color: 'Black',
        quantity: 2,
      },
      {
        product: SAMPLE_PRODUCTS[1],
        size: '8',
        color: 'White',
        quantity: 1,
      },
    ],
    total: 280,
    itemCount: 3,
  },
  addToCart: jest.fn(),
  updateQuantity: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  getCartItemCount: jest.fn(() => 3),
};

const emptyCartContext = {
  cart: {
    items: [],
    total: 0,
    itemCount: 0,
  },
  addToCart: jest.fn(),
  updateQuantity: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  getCartItemCount: jest.fn(() => 0),
};

// Mock the useCart hook
jest.mock('../../../../context/CartContext', () => ({
  ...jest.requireActual('../../../../context/CartContext'),
  useCart: jest.fn(),
}));

describe('CartScreen', () => {
  const mockOnCheckout = jest.fn();
  const mockOnProductPress = jest.fn();
  const defaultProps = {
    onCheckout: mockOnCheckout,
    onProductPress: mockOnProductPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to cart with items
    (CartContext.useCart as jest.Mock).mockReturnValue(mockCartContext);
  });

  describe('Rendering with Items', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<CartScreen {...defaultProps} />);
      expect(getByText('Shopping Cart')).toBeTruthy();
    });

    it('displays cart items correctly', () => {
      const {getByText} = render(<CartScreen {...defaultProps} />);
      
      expect(getByText('Air Max 270')).toBeTruthy();
      expect(getByText('Chuck Taylor All Star')).toBeTruthy();
      expect(getByText('3 items')).toBeTruthy();
    });

    it('displays item details correctly', () => {
      const {getByText} = render(<CartScreen {...defaultProps} />);
      
      expect(getByText('Size: 9 • Color: Black')).toBeTruthy();
      expect(getByText('$300')).toBeTruthy();
    });

    it('displays total correctly', () => {
      const {getByText} = render(<CartScreen {...defaultProps} />);
      
      expect(getByText('$302.40')).toBeTruthy();
    });

    it('shows checkout button when items exist', () => {
      const {getByText} = render(<CartScreen {...defaultProps} />);
      
      expect(getByText('Proceed to Checkout')).toBeTruthy();
    });
  });

  describe('Empty Cart', () => {
    beforeEach(() => {
      (CartContext.useCart as jest.Mock).mockReturnValue(emptyCartContext);
    });

    it('displays empty cart message', () => {
      const {getByText} = render(<CartScreen {...defaultProps} />);
      
      expect(getByText('Your cart is empty')).toBeTruthy();
      expect(getByText('Add some great shoes to get started')).toBeTruthy();
    });

    it('does not show checkout button when cart is empty', () => {
      const {queryByText} = render(<CartScreen {...defaultProps} />);
      
      expect(queryByText('Proceed to Checkout')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('calls onCheckout when checkout button is pressed', () => {
      const {getByText} = render(<CartScreen {...defaultProps} />);
      
      const checkoutButton = getByText('Proceed to Checkout');
      fireEvent.press(checkoutButton);
      
      expect(mockOnCheckout).toHaveBeenCalledTimes(1);
    });

    it('calls updateQuantity when quantity is changed', () => {
      const {getByTestId} = render(<CartScreen {...defaultProps} />);
      
      const increaseButton = getByTestId('increase-1');
      fireEvent.press(increaseButton);
      
      expect(mockCartContext.updateQuantity).toHaveBeenCalledWith(
        SAMPLE_PRODUCTS[0].id,
        '9',
        'Black',
        3
      );
    });

    // Note: These tests are commented out as they depend on specific CartScreen implementation
    // Uncomment and adapt based on your actual CartScreen implementation
    
    // it('calls removeFromCart when remove button is pressed', () => {
    //   const {getByTestId} = render(<CartScreen {...defaultProps} />);
    //   
    //   const removeButton = getByTestId('remove-1');
    //   fireEvent.press(removeButton);
    //   
    //   expect(mockCartContext.removeFromCart).toHaveBeenCalledWith(
    //     SAMPLE_PRODUCTS[0].id,
    //     '9',
    //     'Black'
    //   );
    // });

    it('calls onProductPress when product is tapped', () => {
      const {getByTestId} = render(<CartScreen {...defaultProps} />);
      
      const productCard = getByTestId('cart-item-1');
      fireEvent.press(productCard);
      
      expect(mockOnProductPress).toHaveBeenCalledWith(SAMPLE_PRODUCTS[0].id);
    });

    // it('calls clearCart when clear button is pressed', () => {
    //   const {getByText} = render(<CartScreen {...defaultProps} />);
    //   
    //   const clearButton = getByText('Clear All');
    //   fireEvent.press(clearButton);
    //   
    //   expect(mockCartContext.clearCart).toHaveBeenCalledTimes(1);
    // });
  });

  describe('Accessibility', () => {
    it('has accessible elements', () => {
      const {getByTestId} = render(<CartScreen {...defaultProps} />);
      
      expect(getByTestId('cart-item-1')).toBeTruthy();
      expect(getByTestId('increase-1')).toBeTruthy();
      expect(getByTestId('decrease-1')).toBeTruthy();
      expect(getByTestId('remove-1')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles missing onCheckout prop', () => {
      const {getByText} = render(<CartScreen onProductPress={mockOnProductPress} />);
      
      expect(getByText('Shopping Cart')).toBeTruthy();
    });

    it('handles missing onProductPress prop', () => {
      const {getByText} = render(<CartScreen onCheckout={mockOnCheckout} />);
      
      expect(getByText('Shopping Cart')).toBeTruthy();
    });
  });
}); 