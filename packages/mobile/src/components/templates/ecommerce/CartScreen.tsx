import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { CartItem, type CartItemData } from '../../blocks/ecommerce';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Cart summary data
 */
export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  itemCount: number;
}

/**
 * Properties for the CartScreen template
 */
export interface CartScreenProps extends BaseComponentProps {
  /** Array of cart items */
  cartItems: CartItemData[];
  /** Callback when quantity changes */
  onQuantityChange?: (itemId: string, newQuantity: number) => Promise<void>;
  /** Callback when item is removed */
  onRemoveItem?: (itemId: string) => Promise<void>;
  /** Callback when item is moved to wishlist */
  onMoveToWishlist?: (itemId: string) => Promise<void>;
  /** Callback when item is saved for later */
  onSaveForLater?: (itemId: string) => Promise<void>;
  /** Callback when checkout is pressed */
  onCheckout?: (items: CartItemData[], summary: CartSummary) => void;
  /** Callback when continue shopping is pressed */
  onContinueShopping?: () => void;
  /** Callback when item is pressed */
  onItemPress?: (item: CartItemData) => void;
  /** Tax rate for calculations */
  taxRate?: number;
  /** Shipping cost */
  shippingCost?: number;
  /** Free shipping threshold */
  freeShippingThreshold?: number;
  /** Applied discount amount */
  discountAmount?: number;
  /** Currency symbol */
  currency?: string;
  /** Loading state */
  loading?: boolean;
  /** Show saved for later section */
  showSavedForLater?: boolean;
  /** Saved for later items */
  savedForLaterItems?: CartItemData[];
}

/**
 * CartScreen - AI-optimized shopping cart template
 * 
 * A comprehensive shopping cart screen with item management, price calculations,
 * and checkout functionality. Perfect for e-commerce apps.
 * 
 * @example
 * ```tsx
 * <CartScreen
 *   cartItems={cartItemList}
 *   onQuantityChange={(id, qty) => updateQuantity(id, qty)}
 *   onRemoveItem={(id) => removeFromCart(id)}
 *   onCheckout={(items, summary) => proceedToCheckout(items, summary)}
 *   onContinueShopping={() => navigation.navigate('Shop')}
 *   taxRate={0.08}
 *   shippingCost={5.99}
 *   freeShippingThreshold={50}
 * />
 * ```
 */
const CartScreen: React.FC<CartScreenProps> = ({
  cartItems,
  onQuantityChange,
  onRemoveItem,
  onMoveToWishlist,
  onSaveForLater,
  onCheckout,
  onContinueShopping,
  onItemPress,
  taxRate = 0.08,
  shippingCost = 5.99,
  freeShippingThreshold = 50,
  discountAmount = 0,
  currency = '$',
  loading = false,
  showSavedForLater = true,
  savedForLaterItems = [],
  style,
  testID = 'cart-screen',
  ...props
}) => {
  const [processingCheckout, setProcessingCheckout] = useState(false);

  /**
   * Calculate cart summary
   */
  const cartSummary: CartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
    const tax = (subtotal - discountAmount) * taxRate;
    const total = subtotal + tax + calculatedShipping - discountAmount;

    return {
      subtotal,
      tax,
      shipping: calculatedShipping,
      discount: discountAmount,
      total: Math.max(0, total),
      currency,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cartItems, taxRate, shippingCost, freeShippingThreshold, discountAmount, currency]);

  /**
   * Formats price with currency
   */
  const formatPrice = (price: number) => {
    return `${currency}${price.toFixed(2)}`;
  };

  /**
   * Handles checkout process
   */
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some items before checkout.', [
        { text: 'OK' }
      ]);
      return;
    }

    // Check for out of stock items
    const outOfStockItems = cartItems.filter(item => !item.inStock);
    if (outOfStockItems.length > 0) {
      Alert.alert(
        'Items Out of Stock',
        `Some items in your cart are no longer available. Please remove them before checkout.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setProcessingCheckout(true);
    
    try {
      onCheckout?.(cartItems, cartSummary);
    } catch (error) {
      Alert.alert('Checkout Error', 'Failed to proceed to checkout. Please try again.', [
        { text: 'OK' }
      ]);
    } finally {
      setProcessingCheckout(false);
    }
  };

  /**
   * Renders cart item
   */
  const renderCartItem = ({ item }: { item: CartItemData }) => (
    <CartItem
      item={item}
      onQuantityChange={onQuantityChange}
      onRemove={onRemoveItem}
      onPress={onItemPress}
      onMoveToWishlist={onMoveToWishlist}
      onSaveForLater={onSaveForLater}
      showMoveToWishlist={true}
      showSaveForLater={showSavedForLater}
    />
  );

  /**
   * Renders saved for later item
   */
  const renderSavedItem = ({ item }: { item: CartItemData }) => (
    <CartItem
      item={item}
      onPress={onItemPress}
      compact={true}
      showRemoveButton={false}
      showMoveToWishlist={false}
      showSaveForLater={false}
    />
  );

  /**
   * Renders empty cart state
   */
  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyDescription}>
        Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
      </Text>
      <Button
        onPress={onContinueShopping}
        style={styles.continueShoppingButton}
        testID="continue-shopping-empty"
      >
        <Text style={styles.continueShoppingText}>Continue Shopping</Text>
      </Button>
    </View>
  );

  /**
   * Renders cart summary
   */
  const renderCartSummary = () => (
    <Card style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Subtotal ({cartSummary.itemCount} item{cartSummary.itemCount !== 1 ? 's' : ''})
        </Text>
        <Text style={styles.summaryValue}>{formatPrice(cartSummary.subtotal)}</Text>
      </View>
      
      {cartSummary.discount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={[styles.summaryValue, styles.discountValue]}>
            -{formatPrice(cartSummary.discount)}
          </Text>
        </View>
      )}
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Shipping {cartSummary.shipping === 0 && '(Free)'}
        </Text>
        <Text style={styles.summaryValue}>
          {cartSummary.shipping === 0 ? 'FREE' : formatPrice(cartSummary.shipping)}
        </Text>
      </View>
      
      {cartSummary.shipping > 0 && cartSummary.subtotal < freeShippingThreshold && (
        <Text style={styles.freeShippingNote}>
          Add {formatPrice(freeShippingThreshold - cartSummary.subtotal)} more for free shipping!
        </Text>
      )}
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tax</Text>
        <Text style={styles.summaryValue}>{formatPrice(cartSummary.tax)}</Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(cartSummary.total)}</Text>
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.neutral[50],
    },
    header: {
      padding: SPACING.lg,
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.neutral[200],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize['2xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      textAlign: 'center',
    },
    itemCount: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral[600],
      textAlign: 'center',
      marginTop: SPACING.xs,
    },
    content: {
      flex: 1,
    },
    cartItems: {
      padding: SPACING.md,
    },
    emptyContainer: {
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
      marginBottom: SPACING.xl,
    },
    continueShoppingButton: {
      backgroundColor: COLORS.primary[600],
      paddingHorizontal: SPACING.xl,
    },
    continueShoppingText: {
      color: '#ffffff',
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    summaryCard: {
      margin: SPACING.md,
      padding: SPACING.lg,
    },
    summaryTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.md,
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    summaryLabel: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral[700],
    },
    summaryValue: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.neutral[900],
    },
    discountValue: {
      color: COLORS.success[600],
    },
    freeShippingNote: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.success[600],
      textAlign: 'center',
      marginBottom: SPACING.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    totalRow: {
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: COLORS.neutral[200],
    },
    totalLabel: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
    },
    totalValue: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.primary[600],
    },
    checkoutContainer: {
      padding: SPACING.lg,
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: COLORS.neutral[200],
    },
    checkoutButton: {
      backgroundColor: COLORS.primary[600],
      paddingVertical: SPACING.lg,
      borderRadius: 8,
      marginBottom: SPACING.md,
    },
    checkoutButtonDisabled: {
      backgroundColor: COLORS.neutral[300],
    },
    checkoutButtonText: {
      color: '#ffffff',
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      textAlign: 'center',
    },
    checkoutButtonTextDisabled: {
      color: COLORS.neutral[600],
    },
    continueShoppingButtonSmall: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.neutral[300],
      paddingVertical: SPACING.md,
      borderRadius: 8,
    },
    continueShoppingTextSmall: {
      color: COLORS.neutral[700],
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textAlign: 'center',
    },
    savedForLaterSection: {
      marginTop: SPACING.xl,
      padding: SPACING.md,
    },
    savedForLaterTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.md,
    },
  });

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, style]} testID={testID} {...props}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Cart</Text>
        </View>
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]} testID={testID} {...props}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>
          {cartSummary.itemCount} item{cartSummary.itemCount !== 1 ? 's' : ''} in cart
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cartItems}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View>
              {/* Cart Summary */}
              {renderCartSummary()}
              
              {/* Saved for Later */}
              {showSavedForLater && savedForLaterItems.length > 0 && (
                <View style={styles.savedForLaterSection}>
                  <Text style={styles.savedForLaterTitle}>
                    Saved for Later ({savedForLaterItems.length})
                  </Text>
                  <FlatList
                    data={savedForLaterItems}
                    renderItem={renderSavedItem}
                    keyExtractor={(item) => `saved-${item.id}`}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )}
            </View>
          }
        />
      </View>

      {/* Checkout Section */}
      <View style={styles.checkoutContainer}>
        <Button
          onPress={handleCheckout}
          disabled={cartItems.length === 0 || processingCheckout}
          style={[
            styles.checkoutButton,
            (cartItems.length === 0 || processingCheckout) && styles.checkoutButtonDisabled
          ]}
          testID="checkout-button"
        >
          <Text style={[
            styles.checkoutButtonText,
            (cartItems.length === 0 || processingCheckout) && styles.checkoutButtonTextDisabled
          ]}>
            {processingCheckout ? 'Processing...' : `Checkout • ${formatPrice(cartSummary.total)}`}
          </Text>
        </Button>
        
        <Button
          onPress={onContinueShopping}
          style={styles.continueShoppingButtonSmall}
          testID="continue-shopping"
        >
          <Text style={styles.continueShoppingTextSmall}>Continue Shopping</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen; 