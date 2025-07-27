import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Cart item data interface
 */
export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity?: number;
  currency?: string;
  image: string;
  brand?: string;
  variant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  inStock?: boolean;
  stockCount?: number;
}

/**
 * Properties for the CartItem component
 */
export interface CartItemProps extends BaseComponentProps {
  /** Cart item data */
  item: CartItemData;
  /** Callback when quantity changes */
  onQuantityChange?: (itemId: string, newQuantity: number) => Promise<void>;
  /** Callback when item is removed */
  onRemove?: (itemId: string) => Promise<void>;
  /** Callback when item is pressed */
  onPress?: (item: CartItemData) => void;
  /** Show remove button */
  showRemoveButton?: boolean;
  /** Show move to wishlist button */
  showMoveToWishlist?: boolean;
  /** Callback when moved to wishlist */
  onMoveToWishlist?: (itemId: string) => Promise<void>;
  /** Show save for later button */
  showSaveForLater?: boolean;
  /** Callback when saved for later */
  onSaveForLater?: (itemId: string) => Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Compact layout */
  compact?: boolean;
}

/**
 * CartItem - AI-optimized shopping cart item component
 * 
 * A comprehensive cart item with quantity controls, variant display,
 * remove functionality, and pricing calculations. Perfect for shopping carts.
 * 
 * @example
 * ```tsx
 * <CartItem
 *   item={cartItemData}
 *   onQuantityChange={(id, qty) => updateQuantity(id, qty)}
 *   onRemove={(id) => removeFromCart(id)}
 *   onPress={(item) => navigateToProduct(item)}
 *   showRemoveButton={true}
 *   showMoveToWishlist={true}
 * />
 * ```
 */
const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  onPress,
  showRemoveButton = true,
  showMoveToWishlist = false,
  onMoveToWishlist,
  showSaveForLater = false,
  onSaveForLater,
  loading = false,
  compact = false,
  style,
  testID = 'cart-item',
  ...props
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(item.quantity);

  /**
   * Formats price with currency
   */
  const formatPrice = (price: number, currency: string = '$') => {
    return `${currency}${price.toFixed(2)}`;
  };

  /**
   * Calculates total price for item
   */
  const getTotalPrice = () => {
    return item.price * item.quantity;
  };

  /**
   * Calculates savings if original price exists
   */
  const getSavings = () => {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return (item.originalPrice - item.price) * item.quantity;
  };

  /**
   * Handles quantity change with validation
   */
  const handleQuantityChange = async (newQuantity: number) => {
    if (!onQuantityChange || newQuantity < 1) return;
    
    // Check max quantity
    if (item.maxQuantity && newQuantity > item.maxQuantity) {
      Alert.alert('Quantity Limit', `Maximum quantity available is ${item.maxQuantity}`, [
        { text: 'OK' }
      ]);
      return;
    }

    // Check stock
    if (item.stockCount && newQuantity > item.stockCount) {
      Alert.alert('Insufficient Stock', `Only ${item.stockCount} items available`, [
        { text: 'OK' }
      ]);
      return;
    }

    setIsUpdating(true);
    setPendingQuantity(newQuantity);
    
    try {
      await onQuantityChange(item.id, newQuantity);
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity. Please try again.', [
        { text: 'OK' }
      ]);
      setPendingQuantity(item.quantity); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handles item removal with confirmation
   */
  const handleRemove = async () => {
    if (!onRemove) return;

    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${item.name}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await onRemove(item.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item. Please try again.', [
                { text: 'OK' }
              ]);
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  /**
   * Handles move to wishlist
   */
  const handleMoveToWishlist = async () => {
    if (!onMoveToWishlist) return;

    setIsUpdating(true);
    try {
      await onMoveToWishlist(item.id);
      Alert.alert('Moved to Wishlist', `${item.name} has been moved to your wishlist.`, [
        { text: 'OK' }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to move to wishlist. Please try again.', [
        { text: 'OK' }
      ]);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handles save for later
   */
  const handleSaveForLater = async () => {
    if (!onSaveForLater) return;

    setIsUpdating(true);
    try {
      await onSaveForLater(item.id);
      Alert.alert('Saved for Later', `${item.name} has been saved for later.`, [
        { text: 'OK' }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save for later. Please try again.', [
        { text: 'OK' }
      ]);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Renders quantity controls
   */
  const renderQuantityControls = () => {
    const currentQuantity = isUpdating ? pendingQuantity : item.quantity;
    
    return (
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={[
            styles.quantityButton,
            (currentQuantity <= 1 || isUpdating) && styles.quantityButtonDisabled
          ]}
          onPress={() => handleQuantityChange(currentQuantity - 1)}
          disabled={currentQuantity <= 1 || isUpdating}
          testID="decrease-quantity"
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </TouchableOpacity>
        
        <View style={styles.quantityDisplay}>
          <Text style={styles.quantityText}>{currentQuantity}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.quantityButton,
            isUpdating && styles.quantityButtonDisabled
          ]}
          onPress={() => handleQuantityChange(currentQuantity + 1)}
          disabled={isUpdating}
          testID="increase-quantity"
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders action buttons
   */
  const renderActions = () => {
    if (compact) return null;

    return (
      <View style={styles.actionsContainer}>
        {showMoveToWishlist && onMoveToWishlist && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMoveToWishlist}
            disabled={isUpdating}
            testID="move-to-wishlist"
          >
            <Text style={styles.actionText}>💝 Wishlist</Text>
          </TouchableOpacity>
        )}
        
        {showSaveForLater && onSaveForLater && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveForLater}
            disabled={isUpdating}
            testID="save-for-later"
          >
            <Text style={styles.actionText}>📌 Save for Later</Text>
          </TouchableOpacity>
        )}
        
        {showRemoveButton && onRemove && (
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={handleRemove}
            disabled={isUpdating}
            testID="remove-item"
          >
            <Text style={[styles.actionText, styles.removeText]}>🗑 Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING.md,
    },
    card: {
      padding: compact ? SPACING.md : SPACING.lg,
      opacity: isUpdating ? 0.7 : 1,
    },
    content: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    imageContainer: {
      width: compact ? 80 : 100,
      height: compact ? 80 : 100,
      borderRadius: 8,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    info: {
      flex: 1,
    },
    brand: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[500],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textTransform: 'uppercase',
      marginBottom: SPACING.xs,
    },
    name: {
      fontSize: compact ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.xs,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[600],
      marginBottom: SPACING.sm,
    },
    variants: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    variant: {
      backgroundColor: COLORS.neutral[100],
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 4,
    },
    variantText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    stockInfo: {
      marginBottom: SPACING.sm,
    },
    inStock: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.success[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    lowStock: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.warning[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    outOfStock: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.error[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    priceInfo: {
      alignItems: 'flex-start',
    },
    price: {
      fontSize: compact ? TYPOGRAPHY.fontSize.base : TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
    },
    originalPrice: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[500],
      textDecorationLine: 'line-through',
      marginTop: SPACING.xs,
    },
    savings: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.success[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      marginTop: SPACING.xs,
    },
    totalPrice: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.primary[600],
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
      borderRadius: 6,
      backgroundColor: COLORS.neutral[200],
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonDisabled: {
      backgroundColor: COLORS.neutral[100],
      opacity: 0.5,
    },
    quantityButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[700],
    },
    quantityDisplay: {
      minWidth: 40,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.sm,
    },
    quantityText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: COLORS.neutral[200],
    },
    actionButton: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 6,
      backgroundColor: COLORS.neutral[100],
    },
    removeButton: {
      backgroundColor: COLORS.error[50],
    },
    actionText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    removeText: {
      color: COLORS.error[600],
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.content}
          onPress={() => onPress?.(item)}
          disabled={!onPress || isUpdating}
        >
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          </View>
          
          {/* Product Info */}
          <View style={styles.info}>
            {/* Brand */}
            {item.brand && (
              <Text style={styles.brand}>{item.brand}</Text>
            )}
            
            {/* Product Name */}
            <Text style={styles.name} numberOfLines={compact ? 1 : 2}>
              {item.name}
            </Text>
            
            {/* Description */}
            {!compact && item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            {/* Variants */}
            {item.variant && Object.keys(item.variant).length > 0 && (
              <View style={styles.variants}>
                {Object.entries(item.variant).map(([key, value]) => (
                  <View key={key} style={styles.variant}>
                    <Text style={styles.variantText}>{key}: {value}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Stock Info */}
            <View style={styles.stockInfo}>
              {!item.inStock ? (
                <Text style={styles.outOfStock}>⚠️ Out of Stock</Text>
              ) : item.stockCount && item.stockCount < 10 ? (
                <Text style={styles.lowStock}>⚠️ Only {item.stockCount} left</Text>
              ) : (
                <Text style={styles.inStock}>✓ In Stock</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Price and Quantity */}
        <View style={styles.priceContainer}>
          <View style={styles.priceInfo}>
            <Text style={styles.price}>
              {formatPrice(item.price, item.currency)}
              {item.quantity > 1 && (
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm }}> each</Text>
              )}
            </Text>
            
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice, item.currency)}
              </Text>
            )}
            
            {getSavings() > 0 && (
              <Text style={styles.savings}>
                Save {formatPrice(getSavings(), item.currency)}
              </Text>
            )}
            
            {item.quantity > 1 && (
              <Text style={styles.totalPrice}>
                Total: {formatPrice(getTotalPrice(), item.currency)}
              </Text>
            )}
          </View>
          
          {renderQuantityControls()}
        </View>
        
        {/* Actions */}
        {renderActions()}
      </Card>
    </View>
  );
};

export default CartItem; 