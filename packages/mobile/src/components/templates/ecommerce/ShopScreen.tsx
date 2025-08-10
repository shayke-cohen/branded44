import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { SearchForm, type SearchFormData } from '../../blocks/forms';
import { ProductGrid, type Product } from '../../blocks/lists';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Shop screen configuration
 */
export interface ShopScreenConfig {
  /** Shop title */
  title?: string;
  /** Show search functionality */
  showSearch?: boolean;
  /** Show categories */
  showCategories?: boolean;
  /** Available categories */
  categories?: { id: string; label: string }[];
  /** Available sort options */
  sortOptions?: Array<{
    id: string;
    label: string;
    field: string;
    direction: 'asc' | 'desc';
  }>;
  /** Product grid columns */
  gridColumns?: number;
}

/**
 * Properties for the ShopScreen template
 */
export interface ShopScreenProps extends BaseComponentProps {
  /** Array of products to display */
  products: Product[];
  /** Callback when product is selected */
  onProductSelect?: (product: Product) => void;
  /** Callback when add to cart is pressed */
  onAddToCart?: (product: Product) => Promise<void>;
  /** Callback when wishlist is toggled */
  onToggleWishlist?: (product: Product) => Promise<void>;
  /** Callback when search is performed */
  onSearch?: (searchData: SearchFormData) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => void;
  /** Configuration for the shop screen */
  config?: ShopScreenConfig;
  /** Loading state */
  loading?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
}

/**
 * ShopScreen - AI-optimized e-commerce shop template
 * 
 * A comprehensive shop screen template that combines search functionality,
 * product filtering, and product grid display. Perfect for e-commerce apps.
 * 
 * @example
 * ```tsx
 * <ShopScreen
 *   products={productList}
 *   onProductSelect={(product) => navigateToProduct(product)}
 *   onAddToCart={(product) => addToCart(product)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   onSearch={(data) => handleSearch(data)}
 *   config={{
 *     title: "Our Store",
 *     showSearch: true,
 *     showCategories: true,
 *     categories: categoryList,
 *     gridColumns: 2
 *   }}
 * />
 * ```
 */
const ShopScreen: React.FC<ShopScreenProps> = ({
  products,
  onProductSelect,
  onAddToCart,
  onToggleWishlist,
  onSearch,
  onRefresh,
  config = {},
  loading = false,
  refreshing = false,
  style,
  testID = 'shop-screen',
  ...props
}) => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentSearch, setCurrentSearch] = useState<SearchFormData | null>(null);

  // Default configuration
  const {
    title = "Shop",
    showSearch = true,
    showCategories = true,
    categories = [
      { id: 'electronics', label: 'Electronics' },
      { id: 'clothing', label: 'Clothing' },
      { id: 'home', label: 'Home & Garden' },
      { id: 'books', label: 'Books' },
      { id: 'sports', label: 'Sports' }
    ],
    sortOptions = [
      { id: 'relevance', label: 'Relevance', field: 'score', direction: 'desc' },
      { id: 'price-low', label: 'Price: Low to High', field: 'price', direction: 'asc' },
      { id: 'price-high', label: 'Price: High to Low', field: 'price', direction: 'desc' },
      { id: 'newest', label: 'Newest', field: 'createdAt', direction: 'desc' },
      { id: 'rating', label: 'Customer Rating', field: 'rating', direction: 'desc' }
    ],
    gridColumns = 2
  } = config;

  // Filter and sort products based on search criteria
  useEffect(() => {
    let filtered = [...products];

    if (currentSearch) {
      // Filter by search query
      if (currentSearch.query) {
        const query = currentSearch.query.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Filter by category
      if (currentSearch.category) {
        filtered = filtered.filter(product => 
          product.category?.toLowerCase() === currentSearch.category?.toLowerCase()
        );
      }

      // Apply filters
      if (currentSearch.filters) {
        Object.entries(currentSearch.filters).forEach(([filterId, filterValue]) => {
          if (filterValue !== undefined && filterValue !== null) {
            switch (filterId) {
              case 'inStock':
                if (filterValue) {
                  filtered = filtered.filter(product => product.inStock);
                }
                break;
              case 'brand':
                filtered = filtered.filter(product => 
                  product.brand?.toLowerCase() === filterValue.toLowerCase()
                );
                break;
              case 'minPrice':
                filtered = filtered.filter(product => product.price >= filterValue);
                break;
              case 'maxPrice':
                filtered = filtered.filter(product => product.price <= filterValue);
                break;
              case 'minRating':
                filtered = filtered.filter(product => 
                  product.rating && product.rating >= filterValue
                );
                break;
            }
          }
        });
      }

      // Apply sorting
      if (currentSearch.sort) {
        const { field, direction } = currentSearch.sort;
        filtered.sort((a, b) => {
          let aValue: any = a[field as keyof Product];
          let bValue: any = b[field as keyof Product];

          // Handle special cases
          if (field === 'price') {
            aValue = a.price;
            bValue = b.price;
          } else if (field === 'rating') {
            aValue = a.rating || 0;
            bValue = b.rating || 0;
          } else if (field === 'name') {
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
          }

          if (direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }
    }

    setFilteredProducts(filtered);
  }, [products, currentSearch]);

  /**
   * Handles search form submission
   */
  const handleSearch = (searchData: SearchFormData) => {
    setCurrentSearch(searchData);
    onSearch?.(searchData);
  };

  /**
   * Handles search form clear
   */
  const handleSearchClear = () => {
    setCurrentSearch(null);
    setFilteredProducts(products);
  };

  /**
   * Enhanced add to cart with feedback
   */
  const handleAddToCart = async (product: Product) => {
    if (!onAddToCart) return;

    try {
      await onAddToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  /**
   * Enhanced wishlist toggle with feedback
   */
  const handleToggleWishlist = async (product: Product) => {
    if (!onToggleWishlist) return;

    try {
      await onToggleWishlist(product);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  // Create search filters based on available products
  const searchFilters = [
    {
      id: 'inStock',
      label: 'In Stock Only',
      type: 'boolean' as const,
      value: false
    },
    {
      id: 'brand',
      label: 'Brand',
      type: 'select' as const,
      value: undefined,
      options: [...new Set(products.map(p => p.brand).filter(Boolean))]
        .map(brand => ({ label: brand!, value: brand! }))
    },
    {
      id: 'minRating',
      label: 'Minimum Rating',
      type: 'select' as const,
      value: undefined,
      options: [
        { label: '4+ Stars', value: 4 },
        { label: '3+ Stars', value: 3 },
        { label: '2+ Stars', value: 2 },
        { label: '1+ Stars', value: 1 }
      ]
    }
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary[50],
    },
    header: {
      padding: SPACING.xl,
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.secondary[100],
      shadowColor: COLORS.secondary[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize['3xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.secondary[900],
      textAlign: 'center',
      marginBottom: SPACING.sm,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: COLORS.secondary[500],
      textAlign: 'center',
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    searchContainer: {
      backgroundColor: '#ffffff',
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.secondary[100],
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.neutral[200],
    },
    resultsCount: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    activeFilters: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    content: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: SPACING.lg,
    },
    emptyTitle: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral[600],
      textAlign: 'center',
      lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    loadingText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral[600],
      marginTop: SPACING.md,
    },
  });

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]} testID={testID} {...props}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Discover amazing products at great prices
        </Text>
      </View>

      {/* Search Form */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchForm
            onSearch={handleSearch}
            onClear={handleSearchClear}
            filters={searchFilters}
            sortOptions={sortOptions}
            categories={showCategories ? categories : []}
            showFilters={true}
            showSort={true}
            placeholder="Search products..."
            autoSearch={false}
          />
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>
        
        {currentSearch && (currentSearch.query || currentSearch.category || 
         Object.keys(currentSearch.filters || {}).length > 0) && (
          <Text style={styles.activeFilters}>
            {Object.keys(currentSearch.filters || {}).filter(key => 
              currentSearch.filters?.[key] !== undefined && currentSearch.filters?.[key] !== null
            ).length + (currentSearch.category ? 1 : 0)} filter{
              (Object.keys(currentSearch.filters || {}).length + (currentSearch.category ? 1 : 0)) !== 1 ? 's' : ''
            } active
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyDescription}>
              {currentSearch?.query 
                ? `No products match "${currentSearch.query}". Try adjusting your search or filters.`
                : "No products are currently available. Please check back later."
              }
            </Text>
          </View>
        ) : (
          <ProductGrid
            products={filteredProducts}
            onProductSelect={onProductSelect}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            numColumns={gridColumns}
            showWishlist={true}
            showAddToCart={true}
            showRating={true}
            showDiscount={true}
            onRefresh={onRefresh}
            refreshing={refreshing}
            cardStyle="detailed"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ShopScreen; 