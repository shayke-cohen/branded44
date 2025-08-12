/**
 * CartSummary - Reusable cart summary component
 * 
 * Displays order summary with totals, discounts, and coupon functionality
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createCartStyles } from '../../shared/styles/CartStyles';

interface CartSummaryProps {
  itemCount: number;
  subtotal: number;
  total: number;
  appliedCoupon?: string | null;
  couponDiscount?: number;
  onApplyCoupon: (couponCode: string) => void;
  onRemoveCoupon: () => void;
  currency?: string;
  style?: any;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  itemCount,
  subtotal,
  total,
  appliedCoupon,
  couponDiscount = 0,
  onApplyCoupon,
  onRemoveCoupon,
  currency = 'USD',
  style,
}) => {
  const { theme } = useTheme();
  const styles = createCartStyles(theme);
  const [couponCode, setCouponCode] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  const discountAmount = subtotal * couponDiscount;
  const savings = subtotal - total;

  return (
    <View style={[styles.summarySection, style]}>
      <Text style={styles.summaryTitle}>Order Summary</Text>

      {/* Items Count */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Items ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </Text>
        <Text style={styles.summaryValue}>
          {formatPrice(subtotal)}
        </Text>
      </View>

      {/* Discount */}
      {couponDiscount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>
            Discount ({appliedCoupon})
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
            -{formatPrice(discountAmount)}
          </Text>
        </View>
      )}

      {/* Total */}
      <View style={[styles.summaryRow, styles.summaryTotal]}>
        <Text style={styles.summaryTotalLabel}>Total</Text>
        <Text style={styles.summaryTotalValue}>
          {formatPrice(total)}
        </Text>
      </View>

      {/* Savings */}
      {savings > 0 && (
        <Text style={[styles.summaryValue, { 
          textAlign: 'center', 
          color: theme.colors.success,
          fontSize: 14,
          marginTop: 8 
        }]}>
          You saved {formatPrice(savings)}!
        </Text>
      )}

      {/* Coupon Section */}
      <View style={styles.couponSection}>
        <Text style={styles.couponTitle}>Promo Code</Text>
        
        {appliedCoupon ? (
          <View style={styles.appliedCoupon}>
            <Text style={styles.appliedCouponText}>
              ✅ {appliedCoupon} applied
            </Text>
            <TouchableOpacity
              style={styles.removeCouponButton}
              onPress={onRemoveCoupon}
            >
              <Text style={styles.removeCouponText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.couponInputContainer}>
            <TextInput
              style={styles.couponInput}
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter promo code"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[
                styles.couponButton,
                !couponCode.trim() && { opacity: 0.5 }
              ]}
              onPress={handleApplyCoupon}
              disabled={!couponCode.trim()}
            >
              <Text style={styles.couponButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default CartSummary;
