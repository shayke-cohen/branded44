/**
 * ProductCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive product card component for e-commerce applications,
 * displaying product information, pricing, ratings, and purchase actions.
 * 
 * Features:
 * - Product image with multiple image support
 * - Price display with discounts and sales
 * - Star ratings and review counts
 * - Wishlist toggle functionality
 * - Add to cart with quick actions
 * - Stock availability indicators
 * - Product badges (new, sale, bestseller)
 * - Variant previews (colors, sizes)
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <ProductCard
 *   product={productData}
 *   onPress={() => navigateToProduct(product.id)}
 *   onAddToCart={() => addToCart(product.id)}
 *   onToggleWishlist={() => toggleWishlist(product.id)}
 *   showRating={true}
 *   showWishlist={true}
 *   layout="grid"
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatCurrency, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// TYPES
// =============================================================================

/**
 * Product variant preview
 */
export interface ProductVariantPreview {
  /** Variant ID */
  id: string;
  /** Variant type */
  type: 'color' | 'size' | 'style';
  /** Display value */
  value: string;
  /** Color hex code (for color variants) */
  color?: string;
  /** Available stock for this variant */
  stock?: number;
  /** Whether variant is available */
  available: boolean;
}

/**
 * Product rating information
 */
export interface ProductRating {
  /** Average rating (0-5) */
  average: number;
  /** Total number of reviews */
  count: number;
  /** Rating distribution */
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Product pricing information
 */
export interface ProductPricing {
  /** Current price */
  current: number;
  /** Original price (for discounts) */
  original?: number;
  /** Currency code */
  currency: string;
  /** Discount percentage */
  discountPercentage?: number;
  /** Whether product is on sale */
  onSale: boolean;
}

/**
 * Product badge information
 */
export interface ProductBadge {
  /** Badge type */
  type: 'new' | 'sale' | 'bestseller' | 'limited' | 'exclusive' | 'custom';
  /** Badge label */
  label: string;
  /** Badge color */
  color?: string;
  /** Badge icon */
  icon?: string;
}

/**
 * Product data structure
 */
export interface Product {
  /** Unique product identifier */
  id: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Product images */
  images: string[];
  /** Product pricing */
  pricing: ProductPricing;
  /** Product rating */
  rating?: ProductRating;
  /** Product variants */
  variants?: ProductVariantPreview[];
  /** Product badges */
  badges?: ProductBadge[];
  /** Stock availability */
  inStock: boolean;
  /** Available stock count */
  stockCount?: number;
  /** Product category */
  category?: string;
  /** Product brand */
  brand?: string;
  /** Product SKU */
  sku?: string;
  /** Whether product is in wishlist */
  inWishlist?: boolean;
  /** Whether product is new */
  isNew?: boolean;
  /** Whether product is featured */
  isFeatured?: boolean;
  /** Shipping information */
  shipping?: {
    free: boolean;
    cost?: number;
    estimatedDays?: number;
  };
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for the ProductCard component
 */
export interface ProductCardProps extends BaseComponentProps {
  /** Product data */
  product: Product;
  /** Callback when product is pressed */
  onPress?: () => void;
  /** Callback when add to cart is pressed */
  onAddToCart?: () => void;
  /** Callback when wishlist is toggled */
  onToggleWishlist?: () => void;
  /** Callback when quick view is requested */
  onQuickView?: () => void;
  /** Callback when variant is selected */
  onVariantSelect?: (variant: ProductVariantPreview) => void;
  /** Whether to show rating */
  showRating?: boolean;
  /** Whether to show wishlist button */
  showWishlist?: boolean;
  /** Whether to show add to cart button */
  showAddToCart?: boolean;
  /** Whether to show quick view button */
  showQuickView?: boolean;
  /** Whether to show product variants */
  showVariants?: boolean;
  /** Whether to show stock information */
  showStock?: boolean;
  /** Whether to show product badges */
  showBadges?: boolean;
  /** Whether to show shipping info */
  showShipping?: boolean;
  /** Layout type */
  layout?: 'grid' | 'list' | 'compact';
  /** Card width (for grid layout) */
  width?: number;
  /** Image aspect ratio */
  imageAspectRatio?: number;
  /** Loading state for actions */
  loading?: boolean;
  /** Whether product is selected (for bulk operations) */
  selected?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selected: boolean) => void;
  /** Custom action buttons */
  actionButtons?: Array<{
    id: string;
    label: string;
    icon?: string;
    onPress: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ProductCard component for displaying product information
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onVariantSelect,
  showRating = true,
  showWishlist = true,
  showAddToCart = true,
  showQuickView = false,
  showVariants = true,
  showStock = true,
  showBadges = true,
  showShipping = true,
  layout = 'grid',
  width,
  imageAspectRatio = 1,
  loading = false,
  selected = false,
  onSelectionChange,
  actionButtons = [],
  style,
  testID = 'product-card',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const cardWidth = width || (layout === 'grid' ? (SCREEN_WIDTH - SPACING.lg * 3) / 2 : SCREEN_WIDTH - SPACING.lg * 2);
  const imageHeight = cardWidth * imageAspectRatio;
  const isListLayout = layout === 'list';
  const isCompactLayout = layout === 'compact';

  const hasDiscount = product.pricing.original && product.pricing.original > product.pricing.current;
  const savings = hasDiscount ? product.pricing.original! - product.pricing.current : 0;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  const handleAddToCart = useCallback(async () => {
    if (isAddingToCart || loading) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart?.();
    } finally {
      setIsAddingToCart(false);
    }
  }, [isAddingToCart, loading, onAddToCart]);

  const handleToggleWishlist = useCallback(() => {
    onToggleWishlist?.();
  }, [onToggleWishlist]);

  const handleQuickView = useCallback(() => {
    onQuickView?.();
  }, [onQuickView]);

  const handleVariantSelect = useCallback((variant: ProductVariantPreview) => {
    onVariantSelect?.(variant);
  }, [onVariantSelect]);

  const handleSelectionChange = useCallback(() => {
    onSelectionChange?.(!selected);
  }, [onSelectionChange, selected]);

  const handleImagePress = useCallback(() => {
    if (product.images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % product.images.length;
      setCurrentImageIndex(nextIndex);
    } else {
      handlePress();
    }
  }, [currentImageIndex, product.images.length, handlePress]);

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderImage = () => {
    const imageUri = product.images[currentImageIndex] || product.images[0];

    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={handleImagePress}
          style={[styles.imageWrapper, { height: imageHeight }]}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { height: imageHeight }]}>
              <Text style={styles.imagePlaceholderText}>📦</Text>
            </View>
          )}

          {/* Image indicators */}
          {product.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === currentImageIndex && styles.imageIndicatorActive
                  ]}
                />
              ))}
            </View>
          )}

          {/* Selection checkbox */}
          {onSelectionChange && (
            <TouchableOpacity
              onPress={handleSelectionChange}
              style={styles.selectionButton}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          )}

          {/* Wishlist button */}
          {showWishlist && (
            <TouchableOpacity
              onPress={handleToggleWishlist}
              style={styles.wishlistButton}
              accessibilityRole="button"
              accessibilityLabel={product.inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Text style={[
                styles.wishlistIcon,
                product.inWishlist && styles.wishlistIconActive
              ]}>
                {product.inWishlist ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick view button */}
          {showQuickView && !isCompactLayout && (
            <TouchableOpacity
              onPress={handleQuickView}
              style={styles.quickViewButton}
              accessibilityRole="button"
              accessibilityLabel="Quick view"
            >
              <Text style={styles.quickViewIcon}>👁️</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Badges */}
        {showBadges && product.badges && product.badges.length > 0 && (
          <View style={styles.badgesContainer}>
            {product.badges.slice(0, 2).map((badge, index) => (
              <Badge
                key={index}
                variant={badge.type === 'sale' ? 'destructive' : 'secondary'}
                size="sm"
                style={[
                  styles.productBadge,
                  badge.color && { backgroundColor: badge.color }
                ]}
              >
                {badge.icon} {badge.label}
              </Badge>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderProductInfo = () => {
    return (
      <View style={[styles.productInfo, isListLayout && styles.listProductInfo]}>
        {/* Brand */}
        {product.brand && !isCompactLayout && (
          <Text style={styles.brandText}>{product.brand}</Text>
        )}

        {/* Product name */}
        <TouchableOpacity onPress={handlePress}>
          <Text 
            style={styles.productName} 
            numberOfLines={isCompactLayout ? 1 : 2}
          >
            {product.name}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        {product.description && !isCompactLayout && layout !== 'grid' && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        {/* Rating */}
        {showRating && product.rating && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= Math.round(product.rating!.average) && styles.starFilled
                  ]}
                >
                  ⭐
                </Text>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating.average.toFixed(1)} ({product.rating.count})
            </Text>
          </View>
        )}

        {/* Variants */}
        {showVariants && product.variants && product.variants.length > 0 && !isCompactLayout && (
          <View style={styles.variantsContainer}>
            {product.variants.slice(0, 5).map((variant) => (
              <TouchableOpacity
                key={variant.id}
                onPress={() => handleVariantSelect(variant)}
                style={[
                  styles.variantOption,
                  variant.type === 'color' && styles.colorVariant,
                  !variant.available && styles.variantDisabled
                ]}
                disabled={!variant.available}
              >
                {variant.type === 'color' && variant.color ? (
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: variant.color }
                    ]}
                  />
                ) : (
                  <Text style={styles.variantText}>{variant.value}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {formatCurrency(product.pricing.current, product.pricing.currency)}
          </Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              {formatCurrency(product.pricing.original!, product.pricing.currency)}
            </Text>
          )}
          {product.pricing.discountPercentage && (
            <Badge variant="destructive" size="sm" style={styles.discountBadge}>
              -{product.pricing.discountPercentage}%
            </Badge>
          )}
        </View>

        {/* Savings */}
        {hasDiscount && savings > 0 && !isCompactLayout && (
          <Text style={styles.savingsText}>
            Save {formatCurrency(savings, product.pricing.currency)}
          </Text>
        )}

        {/* Stock status */}
        {showStock && (
          <View style={styles.stockContainer}>
            {!product.inStock ? (
              <Badge variant="destructive" size="sm">
                Out of Stock
              </Badge>
            ) : product.stockCount && product.stockCount <= 5 ? (
              <Badge variant="secondary" size="sm">
                Only {product.stockCount} left
              </Badge>
            ) : (
              <Badge variant="secondary" size="sm">
                In Stock
              </Badge>
            )}
          </View>
        )}

        {/* Shipping */}
        {showShipping && product.shipping && !isCompactLayout && (
          <View style={styles.shippingContainer}>
            {product.shipping.free ? (
              <Text style={styles.freeShippingText}>
                🚚 Free shipping
                {product.shipping.estimatedDays && ` • ${product.shipping.estimatedDays} days`}
              </Text>
            ) : (
              <Text style={styles.shippingText}>
                🚚 Shipping: {formatCurrency(product.shipping.cost!, product.pricing.currency)}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderActions = () => {
    if (isCompactLayout) return null;

    return (
      <View style={styles.actionsContainer}>
        {/* Add to cart */}
        {showAddToCart && (
          <Button
            variant={product.inStock ? "default" : "outline"}
            size="sm"
            onPress={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            style={[styles.addToCartButton, isListLayout && styles.listActionButton]}
          >
            {isAddingToCart ? '⏳' : '🛒'} {product.inStock ? 'Add to Cart' : 'Notify When Available'}
          </Button>
        )}

        {/* Custom actions */}
        {actionButtons.map((button) => (
          <Button
            key={button.id}
            variant={button.variant || 'outline'}
            size="sm"
            onPress={button.onPress}
            style={styles.actionButton}
          >
            {button.icon} {button.label}
          </Button>
        ))}
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const containerStyle = [
    styles.container,
    isListLayout && styles.listContainer,
    isCompactLayout && styles.compactContainer,
    { width: cardWidth },
    selected && styles.selectedContainer,
    style
  ];

  const contentStyle = isListLayout ? styles.listContent : styles.gridContent;

  return (
    <Card style={containerStyle} testID={testID} {...props}>
      <View style={contentStyle}>
        {/* Product Image */}
        {renderImage()}

        {/* Product Info */}
        {renderProductInfo()}
      </View>

      {/* Actions */}
      {renderActions()}

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  listContainer: {
    marginBottom: SPACING.sm,
  },
  compactContainer: {
    marginBottom: SPACING.xs,
  },
  selectedContainer: {
    borderColor: COLORS.info[500],
    borderWidth: 2,
  },
  gridContent: {
    flexDirection: 'column',
  },
  listContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  imageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  imageIndicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  selectionButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.info[500],
    borderColor: COLORS.info[500],
  },
  checkmark: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  wishlistButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
  },
  wishlistIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  wishlistIconActive: {
    transform: [{ scale: 1.1 }],
  },
  quickViewButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: SPACING.xs,
  },
  quickViewIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  badgesContainer: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.xl * 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  productBadge: {
    color: COLORS.white,
  },
  productInfo: {
    padding: SPACING.md,
    flex: 1,
  },
  listProductInfo: {
    paddingLeft: SPACING.md,
    paddingTop: 0,
    flex: 1,
  },
  brandText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
    lineHeight: TYPOGRAPHY.lineHeight.snug,
  },
  productDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  star: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[300],
  },
  starFilled: {
    color: COLORS.warning[500],
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  variantOption: {
    padding: SPACING.xs,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.white,
  },
  colorVariant: {
    padding: SPACING.xs / 2,
  },
  variantDisabled: {
    opacity: 0.5,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  variantText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[700],
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  currentPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[500],
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    marginLeft: SPACING.xs,
  },
  savingsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success[600],
    marginBottom: SPACING.xs,
  },
  stockContainer: {
    marginBottom: SPACING.sm,
  },
  shippingContainer: {
    marginBottom: SPACING.sm,
  },
  freeShippingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success[600],
  },
  shippingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  actionsContainer: {
    padding: SPACING.md,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  addToCartButton: {
    width: '100%',
  },
  listActionButton: {
    flex: 1,
  },
  actionButton: {
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
});

export default ProductCard;