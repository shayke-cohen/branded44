import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Product data interface (detailed version)
 */
export interface ProductCardData {
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
  features?: string[];
  variants?: {
    size?: string[];
    color?: string[];
  };
}

/**
 * Properties for the ProductCard component
 */
export interface ProductCardProps extends BaseComponentProps {
  /** Product data to display */
  product: ProductCardData;
  /** Callback when product is selected */
  onPress?: () => void;
  /** Callback when add to cart is pressed */
  onAddToCart?: (product: ProductCardData) => Promise<void>;
  /** Callback when wishlist is toggled */
  onToggleWishlist?: (product: ProductCardData) => Promise<void>;
  /** Callback when quick view is pressed */
  onQuickView?: (product: ProductCardData) => void;
  /** Card layout variant */
  variant?: 'compact' | 'standard' | 'detailed';
  /** Show wishlist button */
  showWishlist?: boolean;
  /** Show add to cart button */
  showAddToCart?: boolean;
  /** Show quick view button */
  showQuickView?: boolean;
  /** Show product rating */
  showRating?: boolean;
  /** Show product features */
  showFeatures?: boolean;
  /** Maximum width of card */
  maxWidth?: number;
}

/**
 * ProductCard - AI-optimized individual product card component
 * 
 * A comprehensive product card with multiple layouts, wishlist functionality,
 * ratings, stock indicators, and add to cart functionality. Perfect for e-commerce.
 * 
 * @example
 * ```tsx
 * <ProductCard
 *   product={productData}
 *   onPress={() => navigateToProduct()}
 *   onAddToCart={(product) => addToCart(product)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   variant="detailed"
 *   showWishlist={true}
 *   showRating={true}
 * />
 * ```
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  variant = 'standard',
  showWishlist = true,
  showAddToCart = true,
  showQuickView = false,
  showRating = true,
  showFeatures = false,
  maxWidth,
  style,
  testID = 'product-card',
  ...props
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  /**
   * Formats price with currency
   */
  const formatPrice = (price: number, currency: string = '$') => {
    return `${currency}${price.toFixed(2)}`;
  };

  /**
   * Calculates discount percentage
   */
  const getDiscountPercentage = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  /**
   * Handles add to cart action
   */
  const handleAddToCart = async () => {
    if (!onAddToCart || !product.inStock) return;

    setIsAddingToCart(true);
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
      setIsAddingToCart(false);
    }
  };

  /**
   * Handles wishlist toggle
   */
  const handleToggleWishlist = async () => {
    if (!onToggleWishlist) return;

    setIsTogglingWishlist(true);
    try {
      await onToggleWishlist(product);
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist. Please try again.', [
        { text: 'OK' }
      ]);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  /**
   * Renders star rating
   */
  const renderRating = () => {
    if (!showRating || !product.rating) return null;

    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;

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
        <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
        {product.reviewCount && (
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        )}
      </View>
    );
  };

  /**
   * Renders product features
   */
  const renderFeatures = () => {
    if (!showFeatures || !product.features || product.features.length === 0) return null;

    return (
      <View style={styles.featuresContainer}>
        {product.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>• {feature}</Text>
          </View>
        ))}
        {product.features.length > 3 && (
          <Text style={styles.moreFeatures}>+{product.features.length - 3} more</Text>
        )}
      </View>
    );
  };

  /**
   * Renders quick action buttons
   */
  const renderQuickActions = () => {
    if (variant === 'compact') return null;

    return (
      <View style={styles.quickActions}>
        {showQuickView && onQuickView && (
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => onQuickView(product)}
            testID="quick-view-button"
          >
            <Text style={styles.quickActionIcon}>👁</Text>
          </TouchableOpacity>
        )}
        
        {showWishlist && onToggleWishlist && (
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleToggleWishlist}
            disabled={isTogglingWishlist}
            testID="wishlist-button"
          >
            <Text style={[
              styles.quickActionIcon,
              product.isWishlisted && styles.wishlistActive
            ]}>
              {product.isWishlisted ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const discountPercentage = getDiscountPercentage();
  const cardWidth = maxWidth ? { maxWidth } : {};

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      ...cardWidth,
    },
    card: {
      overflow: 'hidden',
      ...(variant === 'compact' ? { padding: SPACING.sm } : { padding: 0 }),
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: variant === 'compact' ? 120 : variant === 'detailed' ? 250 : 200,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    badges: {
      position: 'absolute',
      top: SPACING.sm,
      left: SPACING.sm,
      flexDirection: 'row',
      gap: SPACING.xs,
    },
    discountBadge: {
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
    stockBadge: {
      backgroundColor: COLORS.warning[600],
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 12,
    },
    stockText: {
      color: '#ffffff',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    quickActions: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      flexDirection: 'column',
      gap: SPACING.xs,
    },
    quickActionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    quickActionIcon: {
      fontSize: 16,
    },
    wishlistActive: {
      transform: [{ scale: 1.1 }],
    },
    outOfStockOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingVertical: SPACING.sm,
      alignItems: 'center',
    },
    outOfStockText: {
      color: '#ffffff',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    productInfo: {
      padding: variant === 'compact' ? SPACING.sm : SPACING.md,
    },
    brand: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[500],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textTransform: 'uppercase',
      marginBottom: SPACING.xs,
    },
    productName: {
      fontSize: variant === 'compact' ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.xs,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[600],
      marginBottom: SPACING.sm,
      lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
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
    featuresContainer: {
      marginBottom: SPACING.sm,
    },
    featureTag: {
      marginBottom: SPACING.xs,
    },
    featureText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[600],
    },
    moreFeatures: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.primary[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: variant === 'compact' ? SPACING.xs : SPACING.md,
    },
    price: {
      fontSize: variant === 'compact' ? TYPOGRAPHY.fontSize.base : TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
    },
    originalPrice: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[500],
      textDecorationLine: 'line-through',
    },
    stockInfo: {
      marginBottom: SPACING.md,
    },
    lowStock: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.warning[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    inStock: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.success[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.sm,
    },
    addToCartButton: {
      flex: 1,
      backgroundColor: COLORS.primary[600],
      paddingVertical: variant === 'compact' ? SPACING.sm : SPACING.md,
      borderRadius: 8,
    },
    addToCartButtonDisabled: {
      backgroundColor: COLORS.neutral[300],
    },
    addToCartText: {
      color: '#ffffff',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textAlign: 'center',
    },
    addToCartTextDisabled: {
      color: COLORS.neutral[600],
    },
    wishlistButtonLarge: {
      paddingHorizontal: SPACING.md,
      paddingVertical: variant === 'compact' ? SPACING.sm : SPACING.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.neutral[300],
      backgroundColor: '#ffffff',
    },
    wishlistButtonActive: {
      borderColor: COLORS.error[600],
      backgroundColor: COLORS.error[50],
    },
    wishlistTextLarge: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.neutral[700],
    },
    wishlistTextActivearge: {
      color: COLORS.error[600],
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
      testID={testID}
      {...props}
    >
      <Card style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Badges */}
          <View style={styles.badges}>
            {discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercentage}%</Text>
              </View>
            )}
            
            {product.inStock && product.stockCount && product.stockCount < 10 && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>Low Stock</Text>
              </View>
            )}
          </View>
          
          {/* Quick Actions */}
          {renderQuickActions()}
          
          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
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
          <Text style={styles.productName} numberOfLines={variant === 'compact' ? 1 : 2}>
            {product.name}
          </Text>
          
          {/* Description (detailed view only) */}
          {variant === 'detailed' && product.description && (
            <Text style={styles.description} numberOfLines={3}>
              {product.description}
            </Text>
          )}
          
          {/* Rating */}
          {renderRating()}
          
          {/* Features */}
          {renderFeatures()}
          
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
          
          {/* Stock Info */}
          {product.inStock && (
            <View style={styles.stockInfo}>
              {product.stockCount && product.stockCount < 10 ? (
                <Text style={styles.lowStock}>
                  Only {product.stockCount} left in stock
                </Text>
              ) : (
                <Text style={styles.inStock}>✓ In Stock</Text>
              )}
            </View>
          )}
          
          {/* Action Buttons */}
          {(showAddToCart || (showWishlist && variant !== 'compact')) && (
            <View style={styles.actionsContainer}>
              {showAddToCart && onAddToCart && (
                <Button
                  onPress={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  style={[
                    styles.addToCartButton,
                    (!product.inStock || isAddingToCart) && styles.addToCartButtonDisabled
                  ]}
                  testID="add-to-cart-button"
                >
                  <Text style={[
                    styles.addToCartText,
                    (!product.inStock || isAddingToCart) && styles.addToCartTextDisabled
                  ]}>
                    {isAddingToCart ? 'Adding...' : 
                     !product.inStock ? 'Out of Stock' : 
                     '🛒 Add to Cart'}
                  </Text>
                </Button>
              )}
              
              {showWishlist && variant !== 'compact' && onToggleWishlist && (
                <TouchableOpacity
                  style={[
                    styles.wishlistButtonLarge,
                    product.isWishlisted && styles.wishlistButtonActive
                  ]}
                  onPress={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  testID="wishlist-button-large"
                >
                  <Text style={[
                    styles.wishlistTextLarge,
                    product.isWishlisted && styles.wishlistTextActivearge
                  ]}>
                    {product.isWishlisted ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default ProductCard; 