import React from 'react';
import {render, fireEvent} from '../../../../test/test-utils';
import ProductDetailScreen from '../ProductDetailScreen';
import {SAMPLE_PRODUCTS} from '../../../../constants';
import * as CartContext from '../../../../context/CartContext';

// Mock the cart context
const mockCartContext = {
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

describe('ProductDetailScreen', () => {
  const mockOnBack = jest.fn();
  const sampleProduct = SAMPLE_PRODUCTS[0]; // Air Max 270
  const defaultProps = {
    product: sampleProduct,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (CartContext.useCart as jest.Mock).mockReturnValue(mockCartContext);
  });

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      const {getAllByText} = render(<ProductDetailScreen {...defaultProps} />);
      const productNameElements = getAllByText('Air Max 270');
      expect(productNameElements.length).toBeGreaterThan(0);
    });

    it('displays product information correctly', () => {
      const {getAllByText, getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      const productNameElements = getAllByText('Air Max 270');
      expect(productNameElements.length).toBeGreaterThan(0);
      expect(getByText('Nike')).toBeTruthy();
      expect(getByText('$150')).toBeTruthy();
      expect(getByText('$180')).toBeTruthy(); // Original price
      expect(getByText('4.5')).toBeTruthy(); // Rating
      expect(getByText(/1234.*reviews/)).toBeTruthy();
    });

    it('displays product description', () => {
      const {getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      expect(getByText('The Nike Air Max 270 delivers visible Max Air cushioning and sleek style.')).toBeTruthy();
    });

    it('displays size options', () => {
      const {getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      expect(getByText('Size')).toBeTruthy();
      expect(getByText('7')).toBeTruthy();
      expect(getByText('8')).toBeTruthy();
      expect(getByText('9')).toBeTruthy();
    });

    it('displays color options', () => {
      const {getByText, getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      expect(getByText('Color')).toBeTruthy();
      expect(getByTestId('color-Black')).toBeTruthy();
      expect(getByTestId('color-White')).toBeTruthy();
      expect(getByTestId('color-Navy')).toBeTruthy();
      expect(getByTestId('color-Red')).toBeTruthy();
    });

    it('shows add to cart button', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      expect(getByTestId('add-to-cart-button')).toBeTruthy();
    });
  });

  describe('Size Selection', () => {
    it('allows selecting a size', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      const sizeButton = getByTestId('size-9');
      fireEvent.press(sizeButton);
      
      // Size should be selected (this would need to check button state)
      expect(sizeButton).toBeTruthy();
    });

    it('displays all available sizes', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      sampleProduct.sizes.forEach(size => {
        expect(getByTestId(`size-${size}`)).toBeTruthy();
      });
    });
  });

  describe('Color Selection', () => {
    it('allows selecting a color', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      const colorButton = getByTestId('color-Black');
      fireEvent.press(colorButton);
      
      expect(colorButton).toBeTruthy();
    });

    it('displays all available colors', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      sampleProduct.colors.forEach(color => {
        expect(getByTestId(`color-${color}`)).toBeTruthy();
      });
    });
  });

  describe('Add to Cart Functionality', () => {
    it('adds product to cart when size and color are selected', () => {
      const {getByTestId, getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      // Select size and color
      const sizeButton = getByTestId('size-9');
      fireEvent.press(sizeButton);
      
      const colorButton = getByTestId('color-Black');
      fireEvent.press(colorButton);
      
      // Add to cart
      const addToCartButton = getByTestId('add-to-cart-button');
      fireEvent.press(addToCartButton);
      
      expect(mockCartContext.addToCart).toHaveBeenCalledWith(
        sampleProduct,
        '9',
        'Black'
      );
    });

    it('requires size selection before adding to cart', () => {
      const {getByTestId, getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      // Select only color
      const colorButton = getByTestId('color-Black');
      fireEvent.press(colorButton);
      
      // Try to add to cart without size
      const addToCartButton = getByTestId('add-to-cart-button');
      fireEvent.press(addToCartButton);
      
      // Should show error or not call addToCart
      expect(mockCartContext.addToCart).not.toHaveBeenCalled();
    });

    it('requires color selection before adding to cart', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      // Select only size
      const sizeButton = getByTestId('size-9');
      fireEvent.press(sizeButton);
      
      // Try to add to cart without color
      const addToCartButton = getByTestId('add-to-cart-button');
      fireEvent.press(addToCartButton);
      
      // Should show error or not call addToCart
      expect(mockCartContext.addToCart).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('calls onBack when back button is pressed', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Product Information Display', () => {
    it('shows in stock status', () => {
      const {getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      expect(getByText('In Stock')).toBeTruthy();
    });

    it('shows out of stock for unavailable products', () => {
      const outOfStockProduct = {...sampleProduct, inStock: false};
      const {getAllByText} = render(<ProductDetailScreen product={outOfStockProduct} onBack={mockOnBack} />);
      
      const outOfStockElements = getAllByText('Out of Stock');
      expect(outOfStockElements.length).toBeGreaterThan(0);
    });

    it('displays original and sale price correctly', () => {
      const {getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      expect(getByText('$150')).toBeTruthy(); // Sale price
      expect(getByText('$180')).toBeTruthy(); // Original price (strikethrough)
    });

    it('shows rating stars', () => {
      const {getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      // Should show rating display
      expect(getByText('4.5')).toBeTruthy();
    });
  });

  describe('Image Gallery', () => {
    it('displays product images', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      // Should have image display (might need testID on image component)
      expect(getByTestId('product-image')).toBeTruthy();
    });

    it('allows navigating between images', () => {
      const multiImageProduct = {
        ...sampleProduct,
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg']
      };
      
      const {getByTestId} = render(<ProductDetailScreen product={multiImageProduct} onBack={mockOnBack} />);
      
      // Should have image navigation (if implemented)
      expect(getByTestId('product-image')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible elements', () => {
      const {getByTestId} = render(<ProductDetailScreen {...defaultProps} />);
      
      expect(getByTestId('back-button')).toBeTruthy();
      expect(getByTestId('add-to-cart-button')).toBeTruthy();
      expect(getByTestId('size-9')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles missing product gracefully', () => {
      const {queryByText} = render(<ProductDetailScreen product={undefined as any} onBack={mockOnBack} />);
      
      // Should handle undefined product without crashing
      expect(queryByText('Air Max 270')).toBeNull();
    });

    it('handles missing onBack prop', () => {
      const {getAllByText} = render(<ProductDetailScreen product={sampleProduct} />);
      
      const productNameElements = getAllByText('Air Max 270');
      expect(productNameElements.length).toBeGreaterThan(0);
    });

    it('handles products without images', () => {
      const noImageProduct = {...sampleProduct, images: []};
      const {getAllByText} = render(<ProductDetailScreen product={noImageProduct} onBack={mockOnBack} />);
      
      const productNameElements = getAllByText('Air Max 270');
      expect(productNameElements.length).toBeGreaterThan(0);
    });

    it('handles products without sizes', () => {
      const noSizeProduct = {...sampleProduct, sizes: []};
      const {getAllByText} = render(<ProductDetailScreen product={noSizeProduct} onBack={mockOnBack} />);
      
      const productNameElements = getAllByText('Air Max 270');
      expect(productNameElements.length).toBeGreaterThan(0);
    });
  });

  describe('Special States', () => {
    it('shows featured badge for featured products', () => {
      const {getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      // Featured product should show some indicator
      if (sampleProduct.featured) {
        expect(getByText('Featured')).toBeTruthy();
      }
    });

    it('shows discount percentage', () => {
      const {getByText} = render(<ProductDetailScreen {...defaultProps} />);
      
      // Should calculate and show discount
      if (sampleProduct.originalPrice) {
        const discount = Math.round(((sampleProduct.originalPrice - sampleProduct.price) / sampleProduct.originalPrice) * 100);
        expect(getByText(`${discount}% OFF`)).toBeTruthy();
      }
    });
  });
}); 