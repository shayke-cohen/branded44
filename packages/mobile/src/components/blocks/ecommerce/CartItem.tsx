/**
 * CartItem Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive shopping cart item component for e-commerce applications,
 * displaying product information with quantity controls and customization options.
 * 
 * Features:
 * - Product image with fallback support
 * - Quantity selector with validation
 * - Price display with discounts
 * - Variant information (size, color, etc.)
 * - Stock availability indicators
 * - Remove/save for later actions
 * - Shipping information
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <CartItem
 *   item={cartItem}
 *   onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
 *   onRemove={() => removeFromCart(item.id)}
 *   onSaveForLater={() => saveForLater(item.id)}
 *   showVariants={true}
 *   allowQuantityChange={true}
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
  Alert
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatCurrency, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Product variant information
 */
export interface ProductVariant {
  /** Variant type */
  type: 'size' | 'color' | 'style' | 'material' | 'other';
  /** Variant label */
  label: string;
  /** Variant value */
  value: string;
  /** Variant display color (for color variants) */
  color?: string;
}

/**
 * Cart item data structure
 */
export interface CartItemData {
  /** Unique item identifier */
  id: string;
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Product image URL */
  image?: string;
  /** Item price per unit */
  price: number;
  /** Original price (for discounts) */
  originalPrice?: number;
  /** Item quantity */
  quantity: number;
  /** Maximum allowed quantity */
  maxQuantity?: number;
  /** Minimum allowed quantity */
  minQuantity?: number;
  /** Currency code */
  currency: string;
  /** Product variants */
  variants?: ProductVariant[];
  /** Product SKU */
  sku?: string;
  /** Stock availability */
  inStock: boolean;
  /** Available stock count */
  stockCount?: number;
  /** Shipping information */
  shipping?: {
    eligible: boolean;
    cost: number;
    estimatedDays?: number;
  };
  /** Whether item is on sale */
  onSale?: boolean;
  /** Sale percentage */
  salePercentage?: number;
  /** Whether item can be removed */
  removable?: boolean;
  /** Whether item can be saved for later */
  saveable?: boolean;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for the CartItem component
 */
export interface CartItemProps extends BaseComponentProps {
  /** Cart item data */
  item: CartItemData;
  /** Callback when quantity changes */
  onQuantityChange?: (quantity: number) => void;
  /** Callback when item is removed */
  onRemove?: () => void;
  /** Callback when item is saved for later */
  onSaveForLater?: () => void;
  /** Callback when item is moved to wishlist */
  onMoveToWishlist?: () => void;
  /** Callback when product is pressed */
  onProductPress?: () => void;
  /** Whether to show product variants */
  showVariants?: boolean;
  /** Whether to show shipping info */
  showShipping?: boolean;
  /** Whether to show stock status */
  showStock?: boolean;
  /** Whether to allow quantity changes */
  allowQuantityChange?: boolean;
  /** Whether to show remove button */
  showRemoveButton?: boolean;
  /** Whether to show save for later button */
  showSaveForLater?: boolean;
  /** Whether item is selected (for bulk operations) */
  selected?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selected: boolean) => void;
  /** Loading state for quantity changes */
  loading?: boolean;
  /** Layout variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Custom action buttons */
  actionButtons?: Array<{
    id: string;
    label: string;
    icon?: string;
    onPress: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  }>;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CartItem component for shopping cart display
 */
export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  onMoveToWishlist,
  onProductPress,
  showVariants = true,
  showShipping = true,
  showStock = true,
  allowQuantityChange = true,
  showRemoveButton = true,
  showSaveForLater = true,
  selected = false,
  onSelectionChange,
  loading = false,
  variant = 'default',
  actionButtons = [],
  style,
  testID = 'cart-item',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [isUpdating, setIsUpdating] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const totalPrice = item.price * item.quantity;
  const originalTotalPrice = item.originalPrice ? item.originalPrice * item.quantity : totalPrice;
  const savings = originalTotalPrice - totalPrice;
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    if (!allowQuantityChange || isUpdating || loading) return;

    // Validate quantity
    if (item.minQuantity && newQuantity < item.minQuantity) return;
    if (item.maxQuantity && newQuantity > item.maxQuantity) return;
    if (item.stockCount && newQuantity > item.stockCount) return;

    setIsUpdating(true);
    try {
      await onQuantityChange?.(newQuantity);
    } finally {
      setIsUpdating(false);
    }
  }, [allowQuantityChange, isUpdating, loading, item.minQuantity, item.maxQuantity, item.stockCount, onQuantityChange]);

  const handleIncrement = useCallback(() => {
    handleQuantityChange(item.quantity + 1);
  }, [handleQuantityChange, item.quantity]);

  const handleDecrement = useCallback(() => {
    if (item.quantity > (item.minQuantity || 1)) {
      handleQuantityChange(item.quantity - 1);
    }
  }, [handleQuantityChange, item.quantity, item.minQuantity]);

  const handleRemove = useCallback(() => {
    if (!item.removable) return;

    Alert.alert(
      'Remove Item',
      `Remove ${item.name} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onRemove },
      ]
    );
  }, [item.removable, item.name, onRemove]);

  const handleSaveForLater = useCallback(() => {
    onSaveForLater?.();
  }, [onSaveForLater]);

  const handleProductPress = useCallback(() => {
    onProductPress?.();
  }, [onProductPress]);

  const handleSelectionChange = useCallback(() => {
    onSelectionChange?.(!selected);
  }, [onSelectionChange, selected]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const canIncrement = (): boolean => {
    if (!allowQuantityChange || isUpdating || loading) return false;
    if (item.maxQuantity && item.quantity >= item.maxQuantity) return false;
    if (item.stockCount && item.quantity >= item.stockCount) return false;
    return true;
  };

  const canDecrement = (): boolean => {
    if (!allowQuantityChange || isUpdating || loading) return false;
    if (item.quantity <= (item.minQuantity || 1)) return false;
    return true;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderProductImage = () => {
    if (!item.image) {
      return (
        <View style={[styles.imagePlaceholder, variant === 'compact' && styles.compactImage]}>
          <Text style={styles.imagePlaceholderText}>📦</Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: item.image }}
        style={[styles.productImage, variant === 'compact' && styles.compactImage]}
        resizeMode="cover"
      />
    );
  };

  const renderVariants = () => {
    if (!showVariants || !item.variants || item.variants.length === 0) return null;

    return (
      <View style={styles.variantsContainer}>
        {item.variants.map((variant, index) => (
          <View key={index} style={styles.variant}>
            {variant.type === 'color' && variant.color && (
              <View 
                style={[styles.colorSwatch, { backgroundColor: variant.color }]} 
              />
            )}
            <Text style={styles.variantText}>
              {variant.label}: {variant.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderQuantitySelector = () => {
    if (!allowQuantityChange) {
      return (
        <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
      );
    }

    return (
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={!canDecrement()}
          style={[
            styles.quantityButton,
            !canDecrement() && styles.quantityButtonDisabled
          ]}
          accessibilityRole="button"
          accessibilityLabel="Decrease quantity"
        >
          <Text style={[
            styles.quantityButtonText,
            !canDecrement() && styles.quantityButtonTextDisabled
          ]}>
            −
          </Text>
        </TouchableOpacity>

        <Text style={styles.quantityValue}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={!canIncrement()}
          style={[
            styles.quantityButton,
            !canIncrement() && styles.quantityButtonDisabled
          ]}
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
        >
          <Text style={[
            styles.quantityButtonText,
            !canIncrement() && styles.quantityButtonTextDisabled
          ]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPriceInfo = () => {
    return (
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>
            {formatCurrency(totalPrice, item.currency)}
          </Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              {formatCurrency(originalTotalPrice, item.currency)}
            </Text>
          )}
        </View>
        
        {hasDiscount && savings > 0 && (
          <Text style={styles.savings}>
            Save {formatCurrency(savings, item.currency)}
          </Text>
        )}

        {item.onSale && item.salePercentage && (
          <Badge variant="destructive"  style={styles.saleBadge}>
            {item.salePercentage}% OFF
          </Badge>
        )}
      </View>
    );
  };

  const renderStockStatus = () => {
    if (!showStock) return null;

    if (!item.inStock) {
      return (
        <Badge variant="destructive"  style={styles.stockBadge}>
          Out of Stock
        </Badge>
      );
    }

    if (item.stockCount && item.stockCount <= 5) {
      return (
        <Badge variant="secondary"  style={styles.stockBadge}>
          Only {item.stockCount} left
        </Badge>
      );
    }

    return (
      <Badge variant="secondary"  style={styles.stockBadge}>
        In Stock
      </Badge>
    );
  };

  const renderShippingInfo = () => {
    if (!showShipping || !item.shipping) return null;

    if (!item.shipping.eligible) {
      return (
        <Text style={styles.shippingText}>
          🚫 Not eligible for shipping
        </Text>
      );
    }

    if (item.shipping.cost === 0) {
      return (
        <Text style={styles.freeShippingText}>
          🚚 Free shipping
          {item.shipping.estimatedDays && ` • ${item.shipping.estimatedDays} days`}
        </Text>
      );
    }

    return (
      <Text style={styles.shippingText}>
        🚚 Shipping: {formatCurrency(item.shipping.cost, item.currency)}
        {item.shipping.estimatedDays && ` • ${item.shipping.estimatedDays} days`}
      </Text>
    );
  };

  const renderActions = () => {
    const actions = [];

    if (showRemoveButton && item.removable) {
      actions.push(
        <Button
          key="remove"
          variant="ghost"
          
          onPress={handleRemove}
          style={styles.actionButton}
        >
          🗑️ Remove
        </Button>
      );
    }

    if (showSaveForLater && item.saveable) {
      actions.push(
        <Button
          key="save"
          variant="ghost"
          
          onPress={handleSaveForLater}
          style={styles.actionButton}
        >
          💾 Save for Later
        </Button>
      );
    }

    if (onMoveToWishlist) {
      actions.push(
        <Button
          key="wishlist"
          variant="ghost"
          
          onPress={onMoveToWishlist}
          style={styles.actionButton}
        >
          ❤️ Wishlist
        </Button>
      );
    }

    // Add custom action buttons
    actionButtons.forEach(button => {
      actions.push(
        <Button
          key={button.id}
          variant={button.variant || 'ghost'}
          
          onPress={button.onPress}
          style={styles.actionButton}
        >
          {button.icon} {button.label}
        </Button>
      );
    });

    if (actions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {actions}
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[
        styles.container,
        variant === 'compact' && styles.compactContainer,
        !item.inStock && styles.outOfStockContainer,
        selected && styles.selectedContainer,
        style
      ]}
      testID={testID}
      {...props}
    >
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

      <View style={styles.content}>
        {/* Product Image */}
        <TouchableOpacity
          onPress={handleProductPress}
          style={styles.imageContainer}
          disabled={!onProductPress}
        >
          {renderProductImage()}
        </TouchableOpacity>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <TouchableOpacity
            onPress={handleProductPress}
            disabled={!onProductPress}
            style={styles.productInfo}
          >
            <Text 
              style={styles.productName} 
              numberOfLines={variant === 'compact' ? 1 : 2}
            >
              {item.name}
            </Text>
            
            {item.description && variant === 'detailed' && (
              <Text style={styles.productDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {item.sku && variant === 'detailed' && (
              <Text style={styles.sku}>SKU: {item.sku}</Text>
            )}
          </TouchableOpacity>

          {/* Variants */}
          {renderVariants()}

          {/* Stock Status */}
          {renderStockStatus()}

          {/* Shipping Info */}
          {renderShippingInfo()}

          {/* Price and Quantity Row */}
          <View style={styles.priceQuantityRow}>
            {renderPriceInfo()}
            {renderQuantitySelector()}
          </View>

          {/* Actions */}
          {variant !== 'compact' && renderActions()}
        </View>
      </View>

      {/* Loading overlay */}
      {(isUpdating || loading) && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Updating...</Text>
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
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  compactContainer: {
    marginBottom: SPACING.xs,
  },
  outOfStockContainer: {
    opacity: 0.6,
  },
  selectedContainer: {
    borderColor: COLORS.info[500],
    borderWidth: 2,
  },
  selectionButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    zIndex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.white,
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
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  imageContainer: {
    marginRight: SPACING.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  compactImage: {
    width: 60,
    height: 60,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  detailsContainer: {
    flex: 1,
  },
  productInfo: {
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.xs,
  },
  sku: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    fontFamily: 'monospace',
  },
  variantsContainer: {
    marginBottom: SPACING.sm,
  },
  variant: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  variantText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  stockBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  shippingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginBottom: SPACING.sm,
  },
  freeShippingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success[600],
    marginBottom: SPACING.sm,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  currentPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginRight: SPACING.sm,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[500],
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success[600],
    marginBottom: SPACING.xs,
  },
  saleBadge: {
    alignSelf: 'flex-start',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: SPACING.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.neutral[200],
  },
  quantityButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral[700],
  },
  quantityButtonTextDisabled: {
    color: COLORS.neutral[400],
  },
  quantityValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: 'center',
  },
  quantityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    marginRight: SPACING.sm,
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

export default CartItem;