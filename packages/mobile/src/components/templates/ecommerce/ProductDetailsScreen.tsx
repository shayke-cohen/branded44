/**
 * ProductDetailsScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive product details screen template that displays complete product information
 * with image gallery, variants, reviews, and purchase functionality.
 * 
 * Features:
 * - Product image gallery with zoom and swipe
 * - Detailed product information and specifications
 * - Variant selection (color, size, etc.)
 * - Quantity selector with stock validation
 * - Customer reviews and ratings
 * - Related/recommended products
 * - Add to cart and wishlist functionality
 * - Social sharing capabilities
 * - Stock status and availability
 * - Shipping information and estimates
 * - Price breakdown and discounts
 * - Product comparison features
 * 
 * @example
 * ```tsx
 * <ProductDetailsScreen
 *   product={selectedProduct}
 *   reviews={productReviews}
 *   relatedProducts={relatedProducts}
 *   onAddToCart={(product, variant, quantity) => handleAddToCart(product, variant, quantity)}
 *   onToggleWishlist={(product) => handleToggleWishlist(product)}
 *   onShareProduct={(product) => handleShareProduct(product)}
 *   onVariantSelect={(variant) => handleVariantSelect(variant)}
 *   loading={productLoading}
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
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList 
} from 'react-native';
import { 
  ProductCard,
  CartItem 
} from '../../blocks/ecommerce';
import type { 
  Product,
  ProductCardProps,
  ProductVariant
} from '../../blocks/ecommerce';
import { RatingForm } from '../../blocks/forms';
import type { RatingFormProps } from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { Separator } from '../../../../~/components/ui/separator';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Product review
 */
export interface ProductReview {
  /** Review ID */
  id: string;
  /** Reviewer name */
  reviewerName: string;
  /** Reviewer avatar */
  reviewerAvatar?: string;
  /** Review rating (1-5) */
  rating: number;
  /** Review title */
  title: string;
  /** Review content */
  content: string;
  /** Review date */
  date: Date;
  /** Review images */
  images?: string[];
  /** Is verified purchase */
  verified: boolean;
  /** Helpful votes count */
  helpfulCount: number;
  /** Is marked as helpful by current user */
  isHelpful: boolean;
}

/**
 * Product specification
 */
export interface ProductSpecification {
  /** Specification category */
  category: string;
  /** Specification items */
  items: Array<{
    label: string;
    value: string;
  }>;
}

/**
 * Shipping information
 */
export interface ShippingInfo {
  /** Is free shipping available */
  isFree: boolean;
  /** Shipping cost */
  cost?: number;
  /** Estimated delivery days */
  estimatedDays: number;
  /** Delivery date range */
  deliveryDate?: string;
  /** Available shipping methods */
  methods?: Array<{
    id: string;
    name: string;
    cost: number;
    estimatedDays: number;
  }>;
}

/**
 * Product details screen configuration
 */
export interface ProductDetailsScreenConfig {
  /** Show product reviews */
  showReviews?: boolean;
  /** Show related products */
  showRelatedProducts?: boolean;
  /** Show specifications */
  showSpecifications?: boolean;
  /** Show shipping information */
  showShipping?: boolean;
  /** Show share functionality */
  showShare?: boolean;
  /** Show comparison feature */
  showComparison?: boolean;
  /** Enable image zoom */
  enableImageZoom?: boolean;
  /** Maximum quantity allowed */
  maxQuantity?: number;
  /** Show stock count */
  showStockCount?: boolean;
  /** Auto-select first variant */
  autoSelectVariant?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the ProductDetailsScreen template
 */
export interface ProductDetailsScreenProps extends BaseComponentProps {
  /** Product details */
  product: Product;
  /** Product reviews */
  reviews?: ProductReview[];
  /** Related products */
  relatedProducts?: Product[];
  /** Product specifications */
  specifications?: ProductSpecification[];
  /** Shipping information */
  shippingInfo?: ShippingInfo;
  /** Selected variant */
  selectedVariant?: ProductVariant;
  /** Selected quantity */
  selectedQuantity?: number;
  /** Is product in wishlist */
  inWishlist?: boolean;
  /** Callback when add to cart is pressed */
  onAddToCart?: (product: Product, variant?: ProductVariant, quantity?: number) => Promise<void> | void;
  /** Callback when buy now is pressed */
  onBuyNow?: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  /** Callback when wishlist is toggled */
  onToggleWishlist?: (product: Product) => Promise<void> | void;
  /** Callback when product is shared */
  onShareProduct?: (product: Product) => void;
  /** Callback when variant is selected */
  onVariantSelect?: (variant: ProductVariant) => void;
  /** Callback when quantity changes */
  onQuantityChange?: (quantity: number) => void;
  /** Callback when review is submitted */
  onSubmitReview?: (review: Partial<ProductReview>) => Promise<void> | void;
  /** Callback when review is marked helpful */
  onMarkReviewHelpful?: (reviewId: string) => Promise<void> | void;
  /** Callback when related product is pressed */
  onRelatedProductPress?: (product: Product) => void;
  /** Callback when specification is pressed */
  onSpecificationPress?: (specification: ProductSpecification) => void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the product details screen */
  config?: ProductDetailsScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

const { width: screenWidth } = Dimensions.get('window');

/**
 * ProductDetailsScreen - AI-optimized product details screen template
 * 
 * A comprehensive product details screen that displays complete product information
 * with purchase functionality and related features.
 */
const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  product,
  reviews = [],
  relatedProducts = [],
  specifications = [],
  shippingInfo,
  selectedVariant,
  selectedQuantity = 1,
  inWishlist = false,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onShareProduct,
  onVariantSelect,
  onQuantityChange,
  onSubmitReview,
  onMarkReviewHelpful,
  onRelatedProductPress,
  onSpecificationPress,
  onBack,
  loading = false,
  error,
  config = {},
  style,
  testID = 'product-details-screen',
  ...props
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(selectedQuantity);
  const [localSelectedVariant, setLocalSelectedVariant] = useState(selectedVariant);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const {
    showReviews = true,
    showRelatedProducts = true,
    showSpecifications = true,
    showShipping = true,
    showShare = true,
    showComparison = false,
    enableImageZoom = true,
    maxQuantity = 10,
    showStockCount = true,
    autoSelectVariant = true,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const hasImages = product.images && product.images.length > 0;
  const hasVariants = product.variants && product.variants.length > 0;
  const hasReviews = reviews.length > 0;
  const hasRelatedProducts = relatedProducts.length > 0;
  const hasSpecifications = specifications.length > 0;
  const averageRating = product.rating?.average || 0;
  const reviewsCount = product.rating?.count || reviews.length;
  
  const currentPrice = localSelectedVariant?.price || product.pricing?.current || 0;
  const originalPrice = localSelectedVariant?.originalPrice || product.pricing?.original;
  const isOnSale = product.pricing?.onSale || (originalPrice && originalPrice > currentPrice);
  const discountPercentage = isOnSale && originalPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const isInStock = product.inStock && (localSelectedVariant?.available !== false);
  const stockCount = localSelectedVariant?.stockCount || product.stockCount;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    setLocalSelectedVariant(variant);
    onVariantSelect?.(variant);
  }, [onVariantSelect]);

  const handleQuantityChange = useCallback((quantity: number) => {
    const validQuantity = Math.max(1, Math.min(quantity, maxQuantity, stockCount || maxQuantity));
    setLocalQuantity(validQuantity);
    onQuantityChange?.(validQuantity);
  }, [maxQuantity, stockCount, onQuantityChange]);

  const handleAddToCart = useCallback(async () => {
    if (!isInStock || !onAddToCart) return;
    
    try {
      await onAddToCart(product, localSelectedVariant, localQuantity);
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  }, [isInStock, onAddToCart, product, localSelectedVariant, localQuantity]);

  const handleBuyNow = useCallback(() => {
    if (!isInStock || !onBuyNow) return;
    onBuyNow(product, localSelectedVariant, localQuantity);
  }, [isInStock, onBuyNow, product, localSelectedVariant, localQuantity]);

  const handleToggleWishlist = useCallback(async () => {
    if (!onToggleWishlist) return;
    
    try {
      await onToggleWishlist(product);
    } catch (err) {
      console.error('Toggle wishlist failed:', err);
    }
  }, [onToggleWishlist, product]);

  const handleMarkReviewHelpful = useCallback(async (reviewId: string) => {
    if (!onMarkReviewHelpful) return;
    
    try {
      await onMarkReviewHelpful(reviewId);
    } catch (err) {
      console.error('Mark review helpful failed:', err);
    }
  }, [onMarkReviewHelpful]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
          testID={`${testID}-back`}
        >
          <ChevronLeft style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {showShare && (
            <TouchableOpacity 
              onPress={() => onShareProduct?.(product)}
              style={styles.headerAction}
              testID={`${testID}-share`}
            >
              <Text style={styles.headerActionIcon}>📤</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={handleToggleWishlist}
            style={styles.headerAction}
            testID={`${testID}-wishlist`}
          >
            <Text style={styles.headerActionIcon}>
              {inWishlist ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <UIAlert 
        variant="destructive"
        style={styles.errorAlert}
        testID={`${testID}-error`}
      >
        <Text style={styles.errorText}>{error}</Text>
      </UIAlert>
    );
  };

  const renderImageGallery = () => {
    if (!hasImages) return null;

    return (
      <View style={styles.imageGalleryContainer} testID={`${testID}-image-gallery`}>
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(index);
          }}
          renderItem={({ item: imageUrl }) => (
            <TouchableOpacity 
              style={styles.imageContainer}
              activeOpacity={enableImageZoom ? 0.9 : 1}
            >
              <Image source={{ uri: imageUrl }} style={styles.productImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `image-${index}`}
        />
        
        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {product.images!.map((_, index) => (
            <View
              key={index}
              style={[
                styles.imageIndicator,
                currentImageIndex === index && styles.imageIndicatorActive
              ]}
            />
          ))}
        </View>

        {/* Product Badges */}
        {product.badges && product.badges.length > 0 && (
          <View style={styles.badgesContainer}>
            {product.badges.map((badge, index) => (
              <Badge key={index} variant="default" style={styles.productBadge}>
                <Text style={styles.badgeText}>
                  {badge.icon} {badge.label}
                </Text>
              </Badge>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderProductInfo = () => {
    return (
      <View style={styles.productInfoContainer} testID={`${testID}-product-info`}>
        {/* Brand */}
        {product.brand && (
          <Text style={styles.brandText}>{product.brand}</Text>
        )}

        {/* Product Name */}
        <Text style={styles.productName}>{product.name}</Text>

        {/* Rating */}
        {averageRating > 0 && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={styles.star}>
                  {star <= averageRating ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {averageRating.toFixed(1)} ({reviewsCount} reviews)
            </Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {formatCurrency(currentPrice, product.pricing?.currency || 'USD')}
          </Text>
          {isOnSale && originalPrice && (
            <>
              <Text style={styles.originalPrice}>
                {formatCurrency(originalPrice, product.pricing?.currency || 'USD')}
              </Text>
              <Badge variant="destructive" style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercentage}%</Text>
              </Badge>
            </>
          )}
        </View>

        {/* Stock Status */}
        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockStatus,
            isInStock ? styles.inStock : styles.outOfStock
          ]}>
            {isInStock ? '✅ In Stock' : '❌ Out of Stock'}
          </Text>
          {showStockCount && stockCount && stockCount <= 5 && (
            <Text style={styles.lowStockText}>
              Only {stockCount} left!
            </Text>
          )}
        </View>

        {/* Description */}
        {product.description && (
          <Text style={styles.description}>{product.description}</Text>
        )}
      </View>
    );
  };

  const renderVariantSelector = () => {
    if (!hasVariants) return null;

    const variantsByType = product.variants!.reduce((acc, variant) => {
      if (!acc[variant.type]) {
        acc[variant.type] = [];
      }
      acc[variant.type].push(variant);
      return acc;
    }, {} as Record<string, ProductVariant[]>);

    return (
      <View style={styles.variantContainer} testID={`${testID}-variants`}>
        <Text style={styles.sectionTitle}>Options</Text>
        
        {Object.entries(variantsByType).map(([type, variants]) => (
          <View key={type} style={styles.variantTypeContainer}>
            <Text style={styles.variantTypeTitle}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.variantOptions}
            >
              {variants.map((variant) => {
                const isSelected = localSelectedVariant?.id === variant.id;
                
                return (
                  <TouchableOpacity
                    key={variant.id}
                    onPress={() => handleVariantSelect(variant)}
                    style={[
                      styles.variantOption,
                      isSelected && styles.variantOptionSelected,
                      !variant.available && styles.variantOptionDisabled
                    ]}
                    disabled={!variant.available}
                    testID={`${testID}-variant-${variant.id}`}
                  >
                    {variant.color && (
                      <View 
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: variant.color }
                        ]} 
                      />
                    )}
                    <Text style={[
                      styles.variantOptionText,
                      isSelected && styles.variantOptionTextSelected,
                      !variant.available && styles.variantOptionTextDisabled
                    ]}>
                      {variant.value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </View>
    );
  };

  const renderQuantitySelector = () => {
    return (
      <View style={styles.quantityContainer} testID={`${testID}-quantity`}>
        <Text style={styles.sectionTitle}>Quantity</Text>
        
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            onPress={() => handleQuantityChange(localQuantity - 1)}
            style={[
              styles.quantityButton,
              localQuantity <= 1 && styles.quantityButtonDisabled
            ]}
            disabled={localQuantity <= 1}
            testID={`${testID}-quantity-decrease`}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{localQuantity}</Text>
          
          <TouchableOpacity 
            onPress={() => handleQuantityChange(localQuantity + 1)}
            style={[
              styles.quantityButton,
              localQuantity >= (stockCount || maxQuantity) && styles.quantityButtonDisabled
            ]}
            disabled={localQuantity >= (stockCount || maxQuantity)}
            testID={`${testID}-quantity-increase`}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderShippingInfo = () => {
    if (!showShipping || !shippingInfo) return null;

    return (
      <Card style={styles.shippingCard} testID={`${testID}-shipping`}>
        <Text style={styles.sectionTitle}>Shipping</Text>
        
        <View style={styles.shippingInfo}>
          <Text style={styles.shippingText}>
            {shippingInfo.isFree ? '🚚 Free Shipping' : `🚚 Shipping: ${formatCurrency(shippingInfo.cost || 0, 'USD')}`}
          </Text>
          <Text style={styles.shippingText}>
            📅 Estimated delivery: {shippingInfo.estimatedDays} days
          </Text>
          {shippingInfo.deliveryDate && (
            <Text style={styles.shippingText}>
              📦 Arrives by {shippingInfo.deliveryDate}
            </Text>
          )}
        </View>
      </Card>
    );
  };

  const renderSpecifications = () => {
    if (!showSpecifications || !hasSpecifications) return null;

    return (
      <Card style={styles.specificationsCard} testID={`${testID}-specifications`}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        
        {specifications.map((spec, index) => (
          <View key={index} style={styles.specificationCategory}>
            <Text style={styles.specificationCategoryTitle}>{spec.category}</Text>
            {spec.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.specificationItem}>
                <Text style={styles.specificationLabel}>{item.label}</Text>
                <Text style={styles.specificationValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ))}
      </Card>
    );
  };

  const renderReviews = () => {
    if (!showReviews) return null;

    return (
      <Card style={styles.reviewsCard} testID={`${testID}-reviews`}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>
            Reviews ({reviewsCount})
          </Text>
          <Button
            onPress={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
            size="sm"
            testID={`${testID}-write-review`}
          >
            <Text style={styles.writeReviewText}>Write Review</Text>
          </Button>
        </View>

        {showReviewForm && (
          <View style={styles.reviewForm}>
            <RatingForm
              onSubmit={(rating) => {
                onSubmitReview?.({ rating: rating.rating, title: rating.title, content: rating.comment });
                setShowReviewForm(false);
              }}
              style={styles.ratingForm}
              testID={`${testID}-review-form`}
            />
          </View>
        )}

        {hasReviews ? (
          <View style={styles.reviewsList}>
            {reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                    {review.verified && (
                      <Badge variant="secondary" style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified</Text>
                      </Badge>
                    )}
                  </View>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} style={styles.reviewStar}>
                        {star <= review.rating ? '⭐' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
                
                <Text style={styles.reviewTitle}>{review.title}</Text>
                <Text style={styles.reviewContent}>{review.content}</Text>
                
                <View style={styles.reviewFooter}>
                  <Text style={styles.reviewDate}>
                    {review.date.toLocaleDateString()}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleMarkReviewHelpful(review.id)}
                    style={styles.helpfulButton}
                  >
                    <Text style={styles.helpfulText}>
                      👍 Helpful ({review.helpfulCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
        )}
      </Card>
    );
  };

  const renderRelatedProducts = () => {
    if (!showRelatedProducts || !hasRelatedProducts) return null;

    return (
      <View style={styles.relatedProductsContainer} testID={`${testID}-related-products`}>
        <Text style={styles.sectionTitle}>You might also like</Text>
        
        <FlatList
          data={relatedProducts.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedProductsList}
          renderItem={({ item: relatedProduct }) => (
            <ProductCard
              product={relatedProduct}
              onPress={() => onRelatedProductPress?.(relatedProduct)}
              onAddToCart={() => onAddToCart?.(relatedProduct)}
              onToggleWishlist={() => onToggleWishlist?.(relatedProduct)}
              layout="grid"
              style={styles.relatedProductCard}
              testID={`${testID}-related-product-${relatedProduct.id}`}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtonsContainer} testID={`${testID}-actions`}>
        <Button
          onPress={handleAddToCart}
          variant="outline"
          size="lg"
          disabled={!isInStock || loading}
          style={styles.addToCartButton}
          testID={`${testID}-add-to-cart`}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </Button>
        
        <Button
          onPress={handleBuyNow}
          variant="default"
          size="lg"
          disabled={!isInStock || loading}
          style={styles.buyNowButton}
          testID={`${testID}-buy-now`}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </Button>
      </View>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Product Image Gallery */}
        {renderImageGallery()}

        {/* Product Information */}
        {renderProductInfo()}

        <Separator style={styles.separator} />

        {/* Variant Selector */}
        {renderVariantSelector()}

        {/* Quantity Selector */}
        {renderQuantitySelector()}

        <Separator style={styles.separator} />

        {/* Shipping Information */}
        {renderShippingInfo()}

        {/* Specifications */}
        {renderSpecifications()}

        {/* Reviews */}
        {renderReviews()}

        {/* Related Products */}
        {renderRelatedProducts()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {renderActionButtons()}
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  backIcon: {
    width: 24,
    height: 24,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  headerActionIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for action buttons
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  imageGalleryContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    width: screenWidth,
    height: screenWidth,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  imageIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  badgesContainer: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    gap: SPACING.xs,
  },
  productBadge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  productInfoContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  brandText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  star: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  currentPrice: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  discountText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  stockStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  inStock: {
    color: COLORS.success,
  },
  outOfStock: {
    color: COLORS.destructive,
  },
  lowStockText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  separator: {
    marginVertical: SPACING.lg,
    marginHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  variantContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  variantTypeContainer: {
    marginBottom: SPACING.lg,
  },
  variantTypeTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  variantOptions: {
    gap: SPACING.sm,
  },
  variantOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  variantOptionSelected: {
    borderColor: COLORS.primary,
  },
  variantOptionDisabled: {
    opacity: 0.5,
    borderColor: COLORS.border,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  variantOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  variantOptionTextSelected: {
    color: COLORS.primary,
  },
  variantOptionTextDisabled: {
    color: COLORS.textSecondary,
  },
  quantityContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  quantityText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'center',
  },
  shippingCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  shippingInfo: {
    gap: SPACING.sm,
  },
  shippingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  specificationsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  specificationCategory: {
    marginBottom: SPACING.lg,
  },
  specificationCategoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  specificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specificationLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  specificationValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  reviewsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  writeReviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  reviewForm: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  ratingForm: {
    backgroundColor: 'transparent',
  },
  reviewsList: {
    gap: SPACING.lg,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reviewerName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  verifiedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewStar: {
    fontSize: 14,
  },
  reviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reviewContent: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  helpfulButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  helpfulText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  noReviewsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  relatedProductsContainer: {
    marginBottom: SPACING.lg,
  },
  relatedProductsList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  relatedProductCard: {
    width: 150,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  addToCartButton: {
    flex: 1,
  },
  addToCartText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  buyNowButton: {
    flex: 1,
  },
  buyNowText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
});

export default ProductDetailsScreen;
export type { 
  ProductDetailsScreenProps, 
  ProductDetailsScreenConfig, 
  ProductReview, 
  ProductSpecification, 
  ShippingInfo 
};
