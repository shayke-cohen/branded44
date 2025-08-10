/**
 * CartSummary Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive cart summary component for e-commerce applications,
 * displaying order totals, taxes, discounts, and shipping costs.
 * 
 * Features:
 * - Detailed price breakdown (subtotal, tax, shipping, discounts)
 * - Coupon code application
 * - Shipping options selection
 * - Order total calculation
 * - Currency formatting
 * - Loading states for calculations
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <CartSummary
 *   cartData={cartSummaryData}
 *   onApplyCoupon={(code) => applyCouponCode(code)}
 *   onSelectShipping={(option) => selectShippingOption(option)}
 *   onCheckout={() => proceedToCheckout()}
 *   showShippingOptions={true}
 *   allowCoupons={true}
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
  TouchableOpacity,
  TextInput
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
 * Shipping option data
 */
export interface ShippingOption {
  /** Option ID */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Shipping cost */
  cost: number;
  /** Estimated delivery time */
  deliveryTime: string;
  /** Whether this option is selected */
  selected?: boolean;
}

/**
 * Applied coupon data
 */
export interface AppliedCoupon {
  /** Coupon code */
  code: string;
  /** Coupon description */
  description: string;
  /** Discount amount */
  discountAmount: number;
  /** Discount type */
  discountType: 'fixed' | 'percentage';
  /** Discount percentage (if applicable) */
  discountPercentage?: number;
}

/**
 * Cart summary data structure
 */
export interface CartSummaryData {
  /** Cart subtotal (before taxes and fees) */
  subtotal: number;
  /** Tax amount */
  tax: number;
  /** Tax rate */
  taxRate?: number;
  /** Shipping cost */
  shipping: number;
  /** Handling fees */
  handling?: number;
  /** Total discount amount */
  discount: number;
  /** Final total */
  total: number;
  /** Currency code */
  currency: string;
  /** Number of items in cart */
  itemCount: number;
  /** Applied coupons */
  appliedCoupons?: AppliedCoupon[];
  /** Available shipping options */
  shippingOptions?: ShippingOption[];
  /** Selected shipping option ID */
  selectedShippingId?: string;
  /** Estimated delivery date */
  estimatedDelivery?: Date;
  /** Minimum order for free shipping */
  freeShippingThreshold?: number;
}

/**
 * Props for the CartSummary component
 */
export interface CartSummaryProps extends BaseComponentProps {
  /** Cart summary data */
  cartData: CartSummaryData;
  /** Callback when proceeding to checkout */
  onCheckout?: () => void;
  /** Callback when coupon is applied */
  onApplyCoupon?: (couponCode: string) => void;
  /** Callback when coupon is removed */
  onRemoveCoupon?: (couponCode: string) => void;
  /** Callback when shipping option is selected */
  onSelectShipping?: (optionId: string) => void;
  /** Whether to show shipping options */
  showShippingOptions?: boolean;
  /** Whether to allow coupon codes */
  allowCoupons?: boolean;
  /** Whether to show detailed breakdown */
  showBreakdown?: boolean;
  /** Whether to show free shipping progress */
  showFreeShippingProgress?: boolean;
  /** Checkout button text */
  checkoutButtonText?: string;
  /** Whether checkout is disabled */
  checkoutDisabled?: boolean;
  /** Loading state for calculations */
  calculating?: boolean;
  /** Loading state for checkout */
  checkingOut?: boolean;
  /** Custom fees to display */
  customFees?: Array<{
    label: string;
    amount: number;
    description?: string;
  }>;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CartSummary component for displaying cart totals and checkout
 */
export const CartSummary: React.FC<CartSummaryProps> = ({
  cartData,
  onCheckout,
  onApplyCoupon,
  onRemoveCoupon,
  onSelectShipping,
  showShippingOptions = true,
  allowCoupons = true,
  showBreakdown = true,
  showFreeShippingProgress = true,
  checkoutButtonText = 'Proceed to Checkout',
  checkoutDisabled = false,
  calculating = false,
  checkingOut = false,
  customFees = [],
  style,
  testID = 'cart-summary',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleCheckout = useCallback(() => {
    if (checkoutDisabled || checkingOut || cartData.itemCount === 0) return;
    onCheckout?.();
  }, [checkoutDisabled, checkingOut, cartData.itemCount, onCheckout]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim() || applyingCoupon) return;
    
    setApplyingCoupon(true);
    try {
      await onApplyCoupon?.(couponCode.trim());
      setCouponCode('');
    } finally {
      setApplyingCoupon(false);
    }
  }, [couponCode, applyingCoupon, onApplyCoupon]);

  const handleRemoveCoupon = useCallback((code: string) => {
    onRemoveCoupon?.(code);
  }, [onRemoveCoupon]);

  const handleSelectShipping = useCallback((optionId: string) => {
    onSelectShipping?.(optionId);
  }, [onSelectShipping]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getFreeShippingProgress = (): number => {
    if (!cartData.freeShippingThreshold) return 0;
    return Math.min(cartData.subtotal / cartData.freeShippingThreshold, 1);
  };

  const getFreeShippingRemaining = (): number => {
    if (!cartData.freeShippingThreshold) return 0;
    return Math.max(cartData.freeShippingThreshold - cartData.subtotal, 0);
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderFreeShippingProgress = () => {
    if (!showFreeShippingProgress || !cartData.freeShippingThreshold) return null;

    const progress = getFreeShippingProgress();
    const remaining = getFreeShippingRemaining();

    if (progress >= 1) {
      return (
        <View style={styles.freeShippingContainer}>
          <Text style={styles.freeShippingText}>
            🎉 You qualify for free shipping!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.freeShippingContainer}>
        <Text style={styles.freeShippingText}>
          Add {formatCurrency(remaining, cartData.currency)} more for free shipping
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderShippingOptions = () => {
    if (!showShippingOptions || !cartData.shippingOptions || cartData.shippingOptions.length === 0) {
      return null;
    }

    return (
      <View style={styles.shippingSection}>
        <Text style={styles.sectionTitle}>Shipping Options</Text>
        {cartData.shippingOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => handleSelectShipping(option.id)}
            style={[
              styles.shippingOption,
              option.id === cartData.selectedShippingId && styles.selectedShippingOption
            ]}
          >
            <View style={styles.shippingOptionContent}>
              <View style={styles.shippingOptionInfo}>
                <Text style={styles.shippingOptionName}>{option.name}</Text>
                <Text style={styles.shippingOptionDescription}>
                  {option.description || option.deliveryTime}
                </Text>
              </View>
              <Text style={styles.shippingOptionCost}>
                {option.cost === 0 ? 'Free' : formatCurrency(option.cost, cartData.currency)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCouponSection = () => {
    if (!allowCoupons) return null;

    return (
      <View style={styles.couponSection}>
        <Text style={styles.sectionTitle}>Coupon Code</Text>
        
        {/* Applied Coupons */}
        {cartData.appliedCoupons && cartData.appliedCoupons.map((coupon) => (
          <View key={coupon.code} style={styles.appliedCoupon}>
            <View style={styles.couponInfo}>
              <Text style={styles.couponCode}>{coupon.code}</Text>
              <Text style={styles.couponDescription}>{coupon.description}</Text>
            </View>
            <View style={styles.couponActions}>
              <Text style={styles.couponDiscount}>
                -{formatCurrency(coupon.discountAmount, cartData.currency)}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveCoupon(coupon.code)}
                style={styles.removeCouponButton}
              >
                <Text style={styles.removeCouponText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Coupon Input */}
        <View style={styles.couponInput}>
          <TextInput
            style={styles.couponTextInput}
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Enter coupon code"
            placeholderTextColor={COLORS.neutral[400]}
            autoCapitalize="characters"
          />
          <Button
            onPress={handleApplyCoupon}
            disabled={!couponCode.trim() || applyingCoupon}
            style={styles.applyCouponButton}
          >
            {applyingCoupon ? 'Applying...' : 'Apply'}
          </Button>
        </View>
      </View>
    );
  };

  const renderPriceBreakdown = () => {
    if (!showBreakdown) return null;

    return (
      <View style={styles.breakdownSection}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        {/* Subtotal */}
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            Subtotal ({cartData.itemCount} item{cartData.itemCount !== 1 ? 's' : ''})
          </Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(cartData.subtotal, cartData.currency)}
          </Text>
        </View>

        {/* Discount */}
        {cartData.discount > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Discount</Text>
            <Text style={[styles.breakdownValue, styles.discountValue]}>
              -{formatCurrency(cartData.discount, cartData.currency)}
            </Text>
          </View>
        )}

        {/* Custom Fees */}
        {customFees.map((fee, index) => (
          <View key={index} style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{fee.label}</Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency(fee.amount, cartData.currency)}
            </Text>
          </View>
        ))}

        {/* Shipping */}
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Shipping</Text>
          <Text style={styles.breakdownValue}>
            {cartData.shipping === 0 ? 'Free' : formatCurrency(cartData.shipping, cartData.currency)}
          </Text>
        </View>

        {/* Handling */}
        {cartData.handling && cartData.handling > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Handling</Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency(cartData.handling, cartData.currency)}
            </Text>
          </View>
        )}

        {/* Tax */}
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            Tax{cartData.taxRate ? ` (${(cartData.taxRate * 100).toFixed(1)}%)` : ''}
          </Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(cartData.tax, cartData.currency)}
          </Text>
        </View>

        {/* Total */}
        <View style={[styles.breakdownRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {calculating ? 'Calculating...' : formatCurrency(cartData.total, cartData.currency)}
          </Text>
        </View>

        {/* Estimated Delivery */}
        {cartData.estimatedDelivery && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryText}>
              Estimated delivery: {cartData.estimatedDelivery.toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card style={[styles.container, style]} testID={testID} {...props}>
      <View style={styles.content}>
        {/* Free Shipping Progress */}
        {renderFreeShippingProgress()}

        {/* Shipping Options */}
        {renderShippingOptions()}

        {/* Coupon Section */}
        {renderCouponSection()}

        {/* Price Breakdown */}
        {renderPriceBreakdown()}

        {/* Checkout Button */}
        <Button
          onPress={handleCheckout}
          disabled={checkoutDisabled || checkingOut || cartData.itemCount === 0}
          style={styles.checkoutButton}
        >
          {checkingOut ? 'Processing...' : checkoutButtonText}
        </Button>

        {/* Empty Cart Message */}
        {cartData.itemCount === 0 && (
          <Text style={styles.emptyCartText}>
            Your cart is empty
          </Text>
        )}
      </View>
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    margin: 0,
  },
  content: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  freeShippingContainer: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.success[50],
    borderRadius: 8,
  },
  freeShippingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success[700],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.success[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success[500],
  },
  shippingSection: {
    marginBottom: SPACING.md,
  },
  shippingOption: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  selectedShippingOption: {
    borderColor: COLORS.info[500],
    backgroundColor: COLORS.info[50],
  },
  shippingOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingOptionInfo: {
    flex: 1,
  },
  shippingOptionName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  shippingOptionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  shippingOptionCost: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  couponSection: {
    marginBottom: SPACING.md,
  },
  appliedCoupon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.success[50],
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success[700],
  },
  couponDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success[600],
  },
  couponActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponDiscount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success[700],
    marginRight: SPACING.sm,
  },
  removeCouponButton: {
    padding: SPACING.xs,
  },
  removeCouponText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.neutral[500],
  },
  couponInput: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  couponTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[900],
  },
  applyCouponButton: {
    paddingHorizontal: SPACING.md,
  },
  breakdownSection: {
    marginBottom: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[900],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  discountValue: {
    color: COLORS.success[600],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral[900],
  },
  deliveryInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.info[50],
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info[700],
    textAlign: 'center',
  },
  checkoutButton: {
    marginTop: SPACING.md,
  },
  emptyCartText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default CartSummary;
