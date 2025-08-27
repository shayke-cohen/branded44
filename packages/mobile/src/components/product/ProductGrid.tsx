/**
 * ProductGrid - Reusable product grid component
 * 
 * Handles product display in a responsive grid layout
 */

import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { ProductCard } from './ProductCard';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import type { WixProduct } from '../../utils/wixApiClient';
import { useTheme } from '../../context/ThemeContext';
import { createProductListStyles } from '../../shared/styles/ProductListStyles';

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
  const styles = createProductListStyles(theme);
  
  // Platform detection and web grid setup
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  
  if (isWeb) {
    console.log('🌐 [WEB GRID] Using manual 2-column grid for web');
  } else {
    console.log('📱 [MOBILE GRID] Using mobile layout');
  }

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
      style={{
        marginRight: index % 2 === 0 ? 8 : 0,
        marginLeft: index % 2 === 1 ? 8 : 0,
        marginBottom: 16,
      }}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={{ paddingVertical: 20 }}>
        <LoadingState message="Loading more products..." />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loadingMore && !loading) {
      onLoadMore();
    }
  };

  // Manual 2-column grid for web (with proper spacing)
  if (isWeb && safeProducts.length > 0) {
    const rows = [];
    for (let i = 0; i < safeProducts.length; i += 2) {
      rows.push(safeProducts.slice(i, i + 2));
    }
    
    console.log('🌐 [WEB MANUAL GRID] Creating', rows.length, 'rows for', safeProducts.length, 'products');

    return (
      <FlatList
        data={rows}
        renderItem={({ item: rowProducts, index: rowIndex }) => (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around', // Even spacing around items
            marginBottom: 12,
            paddingHorizontal: 8, // Less padding, more space for cards
          }}>
            {rowProducts.map((product, colIndex) => (
              <View
                key={product._id || product.id || `product-${rowIndex}-${colIndex}`}
                style={{
                  width: '42%', // Even smaller to ensure no overlap
                  maxWidth: '42%',
                  alignSelf: 'center',
                }}
              >
                <ProductCard
                  product={product}
                  onPress={onProductPress}
                  onAddToCart={onAddToCart}
                />
              </View>
            ))}
            {/* Fill empty space if odd number */}
            {rowProducts.length === 1 && <View style={{ width: '42%' }} />}
          </View>
        )}
        keyExtractor={(item, index) => `row-${index}`}
        contentContainerStyle={{ paddingBottom: 20 }}
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
      numColumns={2}
      columnWrapperStyle={styles.productRow}
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
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={6}
    />
  );
};

export default ProductGrid;
