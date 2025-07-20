import React from 'react';
import {render, fireEvent, waitFor} from '../../../../test/test-utils';
import ProductListScreen from '../ProductListScreen';
import {SAMPLE_PRODUCTS} from '../../../../constants';

describe('ProductListScreen', () => {
  const mockOnProductPress = jest.fn();

  beforeEach(() => {
    mockOnProductPress.mockClear();
  });

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<ProductListScreen />);
      expect(getByText('SoleStyle')).toBeTruthy();
    });

    it('displays the main title and subtitle', () => {
      const {getByText} = render(<ProductListScreen />);
      expect(getByText('SoleStyle')).toBeTruthy();
      expect(getByText('Find your perfect pair')).toBeTruthy();
    });

    it('displays search input', () => {
      const {getByTestId} = render(<ProductListScreen />);
      expect(getByTestId('search-input')).toBeTruthy();
    });

    it('displays categories section', () => {
      const {getByText} = render(<ProductListScreen />);
      expect(getByText('Categories')).toBeTruthy();
      expect(getByText('👟 All')).toBeTruthy();
      expect(getByText('🏃 Running')).toBeTruthy();
      expect(getByText('👟 Casual')).toBeTruthy();
    });

    it('displays featured products section', () => {
      const {getByText} = render(<ProductListScreen />);
      expect(getByText('Featured')).toBeTruthy();
    });

    it('displays all products section', () => {
      const {getByText} = render(<ProductListScreen />);
      expect(getByText('All Products')).toBeTruthy();
    });
  });

  describe('Product Display', () => {
    it('displays sample products', () => {
      const {getAllByText} = render(<ProductListScreen />);
      
      // Check for some sample products (may appear multiple times in featured and main list)
      expect(getAllByText('Air Max 270').length).toBeGreaterThan(0);
      expect(getAllByText('Nike').length).toBeGreaterThan(0);
      expect(getAllByText('Chuck Taylor All Star').length).toBeGreaterThan(0);
      expect(getAllByText('Converse').length).toBeGreaterThan(0);
    });

    it('displays product prices correctly', () => {
      const {getAllByText} = render(<ProductListScreen />);
      
      // Check for prices (may appear multiple times)
      expect(getAllByText('$150').length).toBeGreaterThan(0);
      expect(getAllByText('$65').length).toBeGreaterThan(0);
    });

    it('displays product ratings', () => {
      const {getAllByText} = render(<ProductListScreen />);
      
      // Check for ratings (may appear multiple times)
      expect(getAllByText('4.5 (1234)').length).toBeGreaterThan(0);
      expect(getAllByText('4.3 (2156)').length).toBeGreaterThan(0);
    });

    it('calls onProductPress when product is tapped', () => {
      const {getByTestId} = render(
        <ProductListScreen onProductPress={mockOnProductPress} />
      );
      
      const productCard = getByTestId('product-1');
      fireEvent.press(productCard);
      
      expect(mockOnProductPress).toHaveBeenCalledWith(SAMPLE_PRODUCTS[0]);
    });
  });

  describe('Search Functionality', () => {
    it('filters products by search query', async () => {
      const {getByTestId, getByText, queryByText} = render(<ProductListScreen />);
      
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'Nike');
      
      await waitFor(() => {
        expect(getByText('Search Results')).toBeTruthy();
        expect(getByText('Air Max 270')).toBeTruthy();
        expect(queryByText('Chuck Taylor All Star')).toBeNull();
      });
    });

    it('shows no results message when search yields no products', async () => {
      const {getByTestId, getByText} = render(<ProductListScreen />);
      
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'NonexistentProduct');
      
      await waitFor(() => {
        expect(getByText('No products found!')).toBeTruthy();
        expect(getByText('Try adjusting your search or filters')).toBeTruthy();
      });
    });

    it('clears search and shows all products', async () => {
      const {getByTestId, getByText, queryByText} = render(<ProductListScreen />);
      
      const searchInput = getByTestId('search-input');
      
      // Search for Nike
      fireEvent.changeText(searchInput, 'Nike');
      await waitFor(() => {
        expect(queryByText('Chuck Taylor All Star')).toBeNull();
      });
      
      // Clear search
      fireEvent.changeText(searchInput, '');
      await waitFor(() => {
        expect(getByText('Chuck Taylor All Star')).toBeTruthy();
        expect(getByText('Featured')).toBeTruthy();
      });
    });
  });

  describe('Category Filtering', () => {
    it('filters products by category', async () => {
      const {getByText, queryByText, getAllByText} = render(<ProductListScreen />);
      
      // Click on Running category
      const runningCategory = getByText('🏃 Running');
      fireEvent.press(runningCategory);
      
      await waitFor(() => {
        expect(getByText('Running')).toBeTruthy();
        expect(getAllByText('Air Max 270').length).toBeGreaterThan(0);
        expect(queryByText('Chuck Taylor All Star')).toBeNull();
      });
    });

    it('shows all products when All category is selected', async () => {
      const {getByText, getAllByText} = render(<ProductListScreen />);
      
      // First select a specific category
      const runningCategory = getByText('🏃 Running');
      fireEvent.press(runningCategory);
      
      await waitFor(() => {
        expect(getByText('Running')).toBeTruthy();
      });
      
      // Then select All category
      const allCategory = getByText('👟 All');
      fireEvent.press(allCategory);
      
      await waitFor(() => {
        expect(getByText('All Products')).toBeTruthy();
        expect(getAllByText('Air Max 270').length).toBeGreaterThan(0);
        expect(getAllByText('Chuck Taylor All Star').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Featured Products', () => {
    it('displays only featured products in featured section', () => {
      const {getByText, getByTestId} = render(<ProductListScreen />);
      
      expect(getByText('Featured')).toBeTruthy();
      
      // Check that featured products are displayed using unique testIds
      const featuredProducts = SAMPLE_PRODUCTS.filter(p => p.featured);
      featuredProducts.forEach(product => {
        expect(getByTestId(`featured-product-${product.id}`)).toBeTruthy();
      });
    });

    it('hides featured section when searching', async () => {
      const {getByTestId, getByText, queryByText} = render(<ProductListScreen />);
      
      // Initially featured section should be visible
      expect(getByText('Featured')).toBeTruthy();
      
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'Nike');
      
      await waitFor(() => {
        expect(queryByText('Featured')).toBeNull();
        expect(getByText('Search Results')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper test IDs for testing', () => {
      const {getByTestId} = render(<ProductListScreen />);
      
      expect(getByTestId('search-input')).toBeTruthy();
      expect(getByTestId('product-list')).toBeTruthy();
      expect(getByTestId('product-1')).toBeTruthy();
    });
  });
});