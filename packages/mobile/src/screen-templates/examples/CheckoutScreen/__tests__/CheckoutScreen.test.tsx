import React from 'react';
import {render, fireEvent} from '../../../../test/test-utils';
import CheckoutScreen from '../CheckoutScreen';

// Mock cart context with sample data
const mockCartContext = {
  cart: {
    items: [
      {
        product: {
          id: '1',
          name: 'Air Max 270',
          brand: 'Nike',
          price: 150,
          images: ['image1.jpg'],
          description: 'Great shoes',
          category: 'running',
          sizes: ['9'],
          colors: ['Black'],
          rating: 4.5,
          reviewCount: 1234,
          inStock: true,
        },
        size: '9',
        color: 'Black',
        quantity: 2,
      },
    ],
    total: 324,
    itemCount: 2,
  },
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  getCartItemCount: jest.fn(() => 2),
  getCartTotal: jest.fn(() => 300),
};

// Default props
const defaultProps = {
  onBack: jest.fn(),
  onOrderComplete: jest.fn(),
};

jest.mock('../../../../context', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#ffffff',
        text: '#000000',
        primary: '#007bff',
        border: '#cccccc',
        surface: '#f8f9fa',
        textSecondary: '#666666',
      },
    },
  }),
  useCart: () => mockCartContext,
}));

describe('CheckoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<CheckoutScreen {...defaultProps} />);
      expect(getByText('Checkout')).toBeTruthy();
    });

    it('displays shipping address section', () => {
      const {getByText} = render(<CheckoutScreen {...defaultProps} />);
      
      expect(getByText('Shipping Address')).toBeTruthy();
      expect(getByText('First Name *')).toBeTruthy();
      expect(getByText('Last Name *')).toBeTruthy();
      expect(getByText('Street Address *')).toBeTruthy();
      expect(getByText('City *')).toBeTruthy();
      expect(getByText('State *')).toBeTruthy();
      expect(getByText('ZIP Code *')).toBeTruthy();
    });

    it('displays payment method section', () => {
      const {getByText} = render(<CheckoutScreen {...defaultProps} />);
      
      expect(getByText('Payment Method')).toBeTruthy();
      expect(getByText('💳 Credit Card')).toBeTruthy();
      expect(getByText('💳 Debit Card')).toBeTruthy();
      expect(getByText('Card Number *')).toBeTruthy();
      expect(getByText('Expiry Date *')).toBeTruthy();
      expect(getByText('CVV *')).toBeTruthy();
    });

    it('displays order summary section', () => {
      const {getByText} = render(<CheckoutScreen {...defaultProps} />);
      
      expect(getByText('Order Summary')).toBeTruthy();
      expect(getByText(/Subtotal.*items/)).toBeTruthy();
      expect(getByText('Tax')).toBeTruthy();
      expect(getByText('Total')).toBeTruthy();
    });

    it('shows place order button', () => {
      const {getByText} = render(<CheckoutScreen {...defaultProps} />);
      
      expect(getByText(/Place Order/)).toBeTruthy();
    });

    it('shows back button', () => {
      const {getByTestId} = render(<CheckoutScreen {...defaultProps} />);
      
      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('Form Interactions', () => {
    it('allows typing in form fields', () => {
      const {getByTestId} = render(<CheckoutScreen {...defaultProps} />);
      
      const firstNameInput = getByTestId('first-name-input');
      const lastNameInput = getByTestId('last-name-input');
      const streetInput = getByTestId('street-input');
      
      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(streetInput, '123 Main St');
      
      expect(firstNameInput.props.value).toBe('John');
      expect(lastNameInput.props.value).toBe('Doe');
      expect(streetInput.props.value).toBe('123 Main St');
    });

    it('can select payment methods', () => {
      const {getByText} = render(<CheckoutScreen {...defaultProps} />);
      
      const creditCardOption = getByText('💳 Credit Card');
      const debitCardOption = getByText('💳 Debit Card');
      
      fireEvent.press(creditCardOption);
      fireEvent.press(debitCardOption);
      
      // Just verify they can be pressed without errors
      expect(creditCardOption).toBeTruthy();
      expect(debitCardOption).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('calls onBack when back button is pressed', () => {
      const {getByTestId} = render(<CheckoutScreen {...defaultProps} />);
      
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper test IDs for form elements', () => {
      const {getByTestId} = render(<CheckoutScreen {...defaultProps} />);
      
      expect(getByTestId('first-name-input')).toBeTruthy();
      expect(getByTestId('last-name-input')).toBeTruthy();
      expect(getByTestId('street-input')).toBeTruthy();
      expect(getByTestId('city-input')).toBeTruthy();
      expect(getByTestId('state-input')).toBeTruthy();
      expect(getByTestId('zip-input')).toBeTruthy();
      expect(getByTestId('card-number-input')).toBeTruthy();
      expect(getByTestId('expiry-input')).toBeTruthy();
      expect(getByTestId('cvv-input')).toBeTruthy();
      expect(getByTestId('place-order-button')).toBeTruthy();
      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles missing cart items gracefully', () => {
      const emptyCartContext = {
        ...mockCartContext,
        cart: {
          items: [],
          total: 0,
          itemCount: 0,
        },
      };

      jest.doMock('../../../../context', () => ({
        useTheme: () => ({
          theme: {
            colors: {
              background: '#ffffff',
              text: '#000000',
              primary: '#007bff',
              border: '#cccccc',
              surface: '#f8f9fa',
              textSecondary: '#666666',
            },
          },
        }),
        useCart: () => emptyCartContext,
      }));

      const {getByText} = render(<CheckoutScreen {...defaultProps} />);
      
      // Should still render the basic structure
      expect(getByText('Checkout')).toBeTruthy();
      expect(getByText('Order Summary')).toBeTruthy();
    });
  });
}); 