/**
 * ProductGrid - Web-specific product grid component
 * 
 * Handles product display in a responsive grid layout for web platform
 */

import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, Dimensions } from 'react-native';
import { ProductCard } from './ProductCard';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import type { WixProduct } from '@mobile/utils/wixApiClient';
import { useTheme } from '../../context/ThemeContext';
import { createWebProductStyles, getResponsiveColumns } from '../../styles/WebProductStyles';

interface ProductGridProps {
  products: WixProduct[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onProductPress: (product: WixProduct) => void;
  onAddToCart: (product: WixProduct) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  refreshing,
  loadingMore,
  hasMore,
  onProductPress,
  onAddToCart,
  onRefresh,
  onLoadMore,
  onRetry,
  emptyTitle = 'No Products Found',
  emptySubtitle = 'Try adjusting your search or filters',
}) => {
  const { theme } = useTheme();
  const [numColumns, setNumColumns] = useState(getResponsiveColumns());
  const styles = createWebProductStyles(theme);
  


  // Handle window resize for responsive grid
  useEffect(() => {
    const handleResize = () => {
      const newColumns = getResponsiveColumns();
      if (newColumns !== numColumns) {
        setNumColumns(newColumns);
      }
    };

    // For web, listen for window resize events
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      // Also trigger on initial load to ensure correct sizing
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }

    // For React Native, listen to dimension changes
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription?.remove();
  }, [numColumns]);

  // Ensure products is always an array
  const safeProducts = products || [];

  // Show error state
  if (error && safeProducts.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={onRetry}
      />
    );
  }

  // Show loading state for initial load
  if (loading && safeProducts.length === 0) {
    return <LoadingState message="Loading products..." />;
  }

  // Show empty state
  if (!loading && safeProducts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        subtitle={emptySubtitle}
      />
    );
  }

  const renderProduct = ({ item, index }: { item: WixProduct; index: number }) => (
    <ProductCard
      product={item}
      onPress={onProductPress}
      onAddToCart={onAddToCart}
      style={[
        styles.productCardContainer,
        numColumns === 2 && {
          marginRight: index % 2 === 0 ? 8 : 0,
          marginLeft: index % 2 === 1 ? 8 : 0,
        }
      ]}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <LoadingState message="Loading more products..." />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loadingMore && !loading) {
      onLoadMore();
    }
  };

  console.log('🎯 [PRODUCT GRID] Rendering with:', {
    numColumns,
    hasColumnWrapper: numColumns > 1,
    productsCount: safeProducts.length,
    columnWrapperStyle: numColumns > 1 ? 'styles.productRow' : 'undefined'
  });

  // For web, React Native Web's FlatList numColumns might not work properly
  // Let's implement a manual grid for 2 columns
  if (typeof window !== 'undefined' && numColumns === 2) {
    const rows = [];
    for (let i = 0; i < safeProducts.length; i += 2) {
      rows.push(safeProducts.slice(i, i + 2));
    }
    
    console.log('🌐 [WEB GRID DEBUG] Manual grid implementation:', {
      'numColumns': numColumns,
      'safeProducts.length': safeProducts.length,
      'rows.length': rows.length,
      'window.innerWidth': window.innerWidth,
      'Dimensions.width': Dimensions.get('window').width
    });
    
    return (
      <FlatList
        data={rows}
        renderItem={({ item: rowProducts, index: rowIndex }) => (
          <View style={styles.productRow}>
            {rowProducts.map((product, colIndex) => (
              <ProductCard
                key={product._id || product.id || `product-${rowIndex}-${colIndex}`}
                product={product}
                onPress={onProductPress}
                onAddToCart={onAddToCart}
                style={[
                  styles.productCardContainer,
                  {
                    marginRight: colIndex === 0 ? 8 : 0,
                    marginLeft: colIndex === 1 ? 8 : 0,
                  }
                ]}
              />
            ))}
          </View>
        )}
        keyExtractor={(item, index) => `row-${index}`}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={false}
      />
    );
  }

  return (
    <FlatList
      data={safeProducts}
      renderItem={renderProduct}
      keyExtractor={(item, index) => item._id || item.id || `product-${index}`}
      numColumns={numColumns}
      key={`grid-${numColumns}`} // Force re-render when columns change
      columnWrapperStyle={numColumns > 1 ? styles.productRow : undefined}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      removeClippedSubviews={false} // Better for web
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={6}
    />
  );
};

export default ProductGrid;
