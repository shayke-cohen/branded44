import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Product data interface
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  images: string[];
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stockCount?: number;
  tags?: string[];
  isWishlisted?: boolean;
  discount?: number;
}

/**
 * Properties for the ProductGrid component
 */
export interface ProductGridProps extends BaseComponentProps {
  /** Array of products to display */
  products: Product[];
  /** Callback when product is selected */
  onProductSelect?: (product: Product) => void;
  /** Callback when add to cart is pressed */
  onAddToCart?: (product: Product) => void;
  /** Callback when wishlist is toggled */
  onToggleWishlist?: (product: Product) => void;
  /** Number of columns */
  numColumns?: number;
  /** Show wishlist button */
  showWishlist?: boolean;
  /** Show add to cart button */
  showAddToCart?: boolean;
  /** Show product rating */
  showRating?: boolean;
  /** Show product discount */
  showDiscount?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback for pull to refresh */
  onRefresh?: () => void;
  /** Refreshing state */
  refreshing?: boolean;
  /** Card layout style */
  cardStyle?: 'compact' | 'detailed';
}

/**
 * ProductGrid - AI-optimized product grid component
 * 
 * A comprehensive product grid with wishlist, cart functionality,
 * ratings, discounts, and responsive layout. Perfect for e-commerce apps.
 * 
 * @example
 * ```tsx
 * <ProductGrid
 *   products={productList}
 *   onProductSelect={(product) => navigateToProduct(product)}
 *   onAddToCart={(product) => addToCart(product)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   numColumns={2}
 *   showWishlist={true}
 *   showRating={true}
 *   cardStyle="detailed"
 * />
 * ```
 */
const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductSelect,
  onAddToCart,
  onToggleWishlist,
  numColumns = 2,
  showWishlist = true,
  showAddToCart = true,
  showRating = true,
  showDiscount = true,
  loading = false,
  emptyMessage = "No products found",
  onRefresh,
  refreshing = false,
  cardStyle = 'detailed',
  style,
  testID = 'product-grid',
  ...props
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  /**
   * Formats price with currency
   */
  const formatPrice = (price: number, currency: string = '$') => {
    return `${currency}${price.toFixed(2)}`;
  };

  /**
   * Handles add to cart with loading state
   */
  const handleAddToCart = async (product: Product) => {
    if (!onAddToCart) return;

    setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: true }));
    
    try {
      await onAddToCart(product);
      Alert.alert('Added to Cart', `${product.name} has been added to your cart.`, [
        { text: 'OK' }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart. Please try again.', [
        { text: 'OK' }
      ]);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`cart-${product.id}`]: false }));
    }
  };

  /**
   * Handles wishlist toggle
   */
  const handleToggleWishlist = async (product: Product) => {
    if (!onToggleWishlist) return;

    setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: true }));
    
    try {
      await onToggleWishlist(product);
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist. Please try again.', [
        { text: 'OK' }
      ]);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`wishlist-${product.id}`]: false }));
    }
  };

  /**
   * Renders star rating
   */
  const renderRating = (rating: number, reviewCount?: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('☆');
      } else {
        stars.push('☆');
      }
    }

    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.stars}>{stars.join('')}</Text>
        <Text style={styles.rating}>{rating.toFixed(1)}</Text>
        {reviewCount && (
          <Text style={styles.reviewCount}>({reviewCount})</Text>
        )}
      </View>
    );
  };

  /**
   * Renders product item
   */
  const renderProduct = ({ item: product, index }: { item: Product; index: number }) => {
    const isLastColumn = numColumns > 1 && (index + 1) % numColumns === 0;
    const discountPercentage = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={[
          styles.productItem,
          { width: `${100 / numColumns - 2}%` },
          isLastColumn && { marginRight: 0 }
        ]}
        onPress={() => onProductSelect?.(product)}
        testID={`product-item-${product.id}`}
      >
        <Card style={styles.productCard}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
            
            {/* Discount Badge */}
            {showDiscount && discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercentage}%</Text>
              </View>
            )}
            
            {/* Wishlist Button */}
            {showWishlist && onToggleWishlist && (
              <TouchableOpacity
                style={styles.wishlistButton}
                onPress={() => handleToggleWishlist(product)}
                disabled={loadingStates[`wishlist-${product.id}`]}
                testID={`wishlist-${product.id}`}
              >
                <Text style={[
                  styles.wishlistIcon,
                  product.isWishlisted && styles.wishlistIconActive
                ]}>
                  {product.isWishlisted ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Stock Indicator */}
            {!product.inStock && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>Out of Stock</Text>
              </View>
            )}
          </View>
          
          {/* Product Info */}
          <View style={styles.productInfo}>
            {/* Brand */}
            {product.brand && (
              <Text style={styles.brand}>{product.brand}</Text>
            )}
            
            {/* Product Name */}
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            
            {/* Description (detailed view only) */}
            {cardStyle === 'detailed' && product.description && (
              <Text style={styles.description} numberOfLines={2}>
                {product.description}
              </Text>
            )}
            
            {/* Rating */}
            {showRating && product.rating && (
              <View style={styles.ratingWrapper}>
                {renderRating(product.rating, product.reviewCount)}
              </View>
            )}
            
            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatPrice(product.price, product.currency)}
              </Text>
              {product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.originalPrice}>
                  {formatPrice(product.originalPrice, product.currency)}
                </Text>
              )}
            </View>
            
            {/* Stock Count */}
            {product.inStock && product.stockCount && product.stockCount < 10 && (
              <Text style={styles.lowStock}>
                Only {product.stockCount} left in stock
              </Text>
            )}
            
            {/* Add to Cart Button */}
            {showAddToCart && onAddToCart && product.inStock && (
              <Button
                onPress={() => handleAddToCart(product)}
                disabled={loadingStates[`cart-${product.id}`]}
                style={styles.addToCartButton}
                testID={`add-to-cart-${product.id}`}
              >
                <Text style={styles.addToCartText}>
                  {loadingStates[`cart-${product.id}`] ? 'Adding...' : '🛒 Add to Cart'}
                </Text>
              </Button>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: SPACING.sm,
    },
    productItem: {
      marginBottom: SPACING.md,
      marginRight: '2%',
    },
    productCard: {
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 200,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    discountBadge: {
      position: 'absolute',
      top: SPACING.sm,
      left: SPACING.sm,
      backgroundColor: COLORS.error[600],
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 12,
    },
    discountText: {
      color: '#ffffff',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    wishlistButton: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wishlistIcon: {
      fontSize: 16,
    },
    wishlistIconActive: {
      transform: [{ scale: 1.1 }],
    },
    stockBadge: {
      position: 'absolute',
      bottom: SPACING.sm,
      left: SPACING.sm,
      right: SPACING.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingVertical: SPACING.xs,
      borderRadius: 4,
    },
    stockText: {
      color: '#ffffff',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textAlign: 'center',
    },
    productInfo: {
      padding: SPACING.md,
    },
    brand: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[500],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textTransform: 'uppercase',
      marginBottom: SPACING.xs,
    },
    productName: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.xs,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[600],
      marginBottom: SPACING.sm,
      lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    },
    ratingWrapper: {
      marginBottom: SPACING.sm,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    stars: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.warning[500],
    },
    rating: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    reviewCount: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[500],
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    price: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
    },
    originalPrice: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[500],
      textDecorationLine: 'line-through',
    },
    lowStock: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.warning[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      marginBottom: SPACING.sm,
    },
    addToCartButton: {
      backgroundColor: COLORS.primary[600],
      paddingVertical: SPACING.sm,
      borderRadius: 6,
    },
    addToCartText: {
      color: '#ffffff',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral[500],
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SPACING.lg }}
          testID="products-flatlist"
        />
      )}
    </View>
  );
};

export default ProductGrid; 