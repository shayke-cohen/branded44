/**
 * OrderSummary Component - AI-Optimized React Native Component
 * 
 * A comprehensive order summary display for restaurant and food delivery checkout.
 * Perfect for showing order totals, fees, taxes, discounts, and payment breakdowns.
 * 
 * @category Restaurant Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Fee types for order pricing
 */
export type FeeType = 
  | 'delivery' 
  | 'service' 
  | 'processing' 
  | 'convenience' 
  | 'small-order' 
  | 'bag' 
  | 'regulatory'
  | 'other';

/**
 * Discount types
 */
export type DiscountType = 
  | 'percentage' 
  | 'fixed-amount' 
  | 'free-delivery' 
  | 'buy-one-get-one' 
  | 'loyalty-points'
  | 'first-time'
  | 'promo-code'
  | 'other';

/**
 * Tax information
 */
export interface TaxInfo {
  /** Tax name/description */
  name: string;
  /** Tax rate as percentage */
  rate: number;
  /** Tax amount */
  amount: number;
  /** Whether tax is included in item prices */
  included: boolean;
}

/**
 * Fee information
 */
export interface FeeInfo {
  /** Fee type */
  type: FeeType;
  /** Fee name/description */
  name: string;
  /** Fee amount */
  amount: number;
  /** Fee description */
  description?: string;
  /** Whether fee is optional/removable */
  optional?: boolean;
  /** Whether fee is percentage-based */
  isPercentage?: boolean;
  /** Base amount for percentage fees */
  baseAmount?: number;
}

/**
 * Discount information
 */
export interface DiscountInfo {
  /** Discount type */
  type: DiscountType;
  /** Discount name/title */
  name: string;
  /** Discount amount (negative value) */
  amount: number;
  /** Discount code if applicable */
  code?: string;
  /** Discount description */
  description?: string;
  /** Original amount before discount */
  originalAmount?: number;
  /** Savings amount (positive value) */
  savings?: number;
}

/**
 * Tip information
 */
export interface TipInfo {
  /** Tip amount */
  amount: number;
  /** Tip percentage if applicable */
  percentage?: number;
  /** Whether tip is pre-calculated suggestion */
  suggested?: boolean;
  /** Available tip percentage options */
  options?: number[];
}

/**
 * Payment method information
 */
export interface PaymentMethodInfo {
  /** Payment method type */
  type: 'credit-card' | 'debit-card' | 'digital-wallet' | 'cash' | 'gift-card' | 'loyalty-points' | 'other';
  /** Last 4 digits or identifier */
  identifier: string;
  /** Brand name (Visa, MasterCard, etc.) */
  brand?: string;
  /** Amount charged to this method */
  amount: number;
}

/**
 * Order summary data structure
 */
export interface OrderSummaryData {
  /** Items subtotal */
  itemsSubtotal: number;
  /** Applied discounts */
  discounts: DiscountInfo[];
  /** Additional fees */
  fees: FeeInfo[];
  /** Tax information */
  taxes: TaxInfo[];
  /** Tip information */
  tip?: TipInfo;
  /** Final order total */
  total: number;
  /** Currency code */
  currency: string;
  /** Payment methods used */
  paymentMethods?: PaymentMethodInfo[];
  /** Estimated delivery/pickup time */
  estimatedTime?: {
    min: number;
    max: number;
    unit: 'minutes' | 'hours';
  };
  /** Delivery address if applicable */
  deliveryAddress?: string;
  /** Order type */
  orderType: 'delivery' | 'pickup' | 'dine-in';
  /** Special instructions */
  specialInstructions?: string;
  /** Loyalty points earned */
  pointsEarned?: number;
  /** Order number/reference */
  orderNumber?: string;
}

/**
 * Action button configuration
 */
export interface OrderSummaryAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: string;
  /** Action press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Whether action is loading */
  loading?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * OrderSummary component props
 */
export interface OrderSummaryProps {
  /** Order summary data */
  orderData: OrderSummaryData;
  /** Apply promo code handler */
  onApplyPromoCode?: () => void;
  /** Edit tip handler */
  onEditTip?: () => void;
  /** Change payment method handler */
  onChangePaymentMethod?: () => void;
  /** Add special instructions handler */
  onAddInstructions?: () => void;
  /** Custom action buttons */
  actions?: OrderSummaryAction[];
  /** Whether to show detailed breakdown */
  showDetailedBreakdown?: boolean;
  /** Whether to show payment methods */
  showPaymentMethods?: boolean;
  /** Whether to show delivery info */
  showDeliveryInfo?: boolean;
  /** Whether to show loyalty points */
  showLoyaltyPoints?: boolean;
  /** Whether component is in read-only mode */
  readOnly?: boolean;
  /** Whether order is being processed */
  processing?: boolean;
  /** Custom card width */
  width?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format currency display
 */
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
};

/**
 * Format time range
 */
const formatTimeRange = (estimatedTime: { min: number; max: number; unit: string }): string => {
  const { min, max, unit } = estimatedTime;
  if (min === max) {
    return `${min} ${unit}`;
  }
  return `${min}-${max} ${unit}`;
};

/**
 * Get fee icon
 */
const getFeeIcon = (type: FeeType): string => {
  const icons: Record<FeeType, string> = {
    delivery: '🚚',
    service: '⚡',
    processing: '💳',
    convenience: '🛒',
    'small-order': '📦',
    bag: '🛍️',
    regulatory: '📋',
    other: '💰',
  };
  return icons[type] || '💰';
};

/**
 * Get discount icon
 */
const getDiscountIcon = (type: DiscountType): string => {
  const icons: Record<DiscountType, string> = {
    percentage: '💯',
    'fixed-amount': '💰',
    'free-delivery': '🚚',
    'buy-one-get-one': '🎁',
    'loyalty-points': '⭐',
    'first-time': '🎉',
    'promo-code': '🎫',
    other: '💸',
  };
  return icons[type] || '💸';
};

// === COMPONENT ===

/**
 * OrderSummary - Display comprehensive order pricing breakdown
 * 
 * @example
 * ```tsx
 * const orderSummary = {
 *   itemsSubtotal: 42.50,
 *   discounts: [
 *     {
 *       type: 'promo-code',
 *       name: 'SAVE10',
 *       amount: -4.25,
 *       code: 'SAVE10'
 *     }
 *   ],
 *   fees: [
 *     {
 *       type: 'delivery',
 *       name: 'Delivery Fee',
 *       amount: 3.99
 *     },
 *     {
 *       type: 'service',
 *       name: 'Service Fee',
 *       amount: 2.50
 *     }
 *   ],
 *   taxes: [
 *     {
 *       name: 'Sales Tax',
 *       rate: 8.5,
 *       amount: 3.61,
 *       included: false
 *     }
 *   ],
 *   tip: {
 *     amount: 8.50,
 *     percentage: 20
 *   },
 *   total: 56.85,
 *   currency: 'USD',
 *   orderType: 'delivery'
 * };
 * 
 * <OrderSummary
 *   orderData={orderSummary}
 *   onApplyPromoCode={() => showPromoCodeModal()}
 *   onEditTip={() => showTipModal()}
 *   showDetailedBreakdown={true}
 *   showDeliveryInfo={true}
 * />
 * ```
 */
export default function OrderSummary({
  orderData,
  onApplyPromoCode,
  onEditTip,
  onChangePaymentMethod,
  onAddInstructions,
  actions = [],
  showDetailedBreakdown = true,
  showPaymentMethods = true,
  showDeliveryInfo = true,
  showLoyaltyPoints = true,
  readOnly = false,
  processing = false,
  width,
  testID = 'order-summary',
}: OrderSummaryProps) {

  const totalDiscountAmount = orderData.discounts.reduce((sum, discount) => sum + Math.abs(discount.amount), 0);
  const totalFeesAmount = orderData.fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalTaxAmount = orderData.taxes.reduce((sum, tax) => sum + tax.amount, 0);

  return (
    <Card style={{ 
      width,
      borderRadius: 16,
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    }} testID={testID}>
      
      <View style={{ padding: 20 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: 4,
          }}>
            Order Summary
          </Text>
          {orderData.orderNumber && (
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Order #{orderData.orderNumber}
            </Text>
          )}
        </View>

        {/* Items Subtotal */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 16, color: '#374151', fontWeight: '500' }}>
            Items Subtotal
          </Text>
          <Text style={{ fontSize: 16, color: '#111827', fontWeight: '600' }}>
            {formatCurrency(orderData.itemsSubtotal, orderData.currency)}
          </Text>
        </View>

        {/* Discounts */}
        {orderData.discounts.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            {orderData.discounts.map((discount, index) => (
              <View 
                key={index}
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: '#ECFDF5',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#D1FAE5',
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>
                      {getDiscountIcon(discount.type)}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
                      {discount.name}
                    </Text>
                  </View>
                  {discount.code && (
                    <Text style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                      Code: {discount.code}
                    </Text>
                  )}
                  {discount.description && (
                    <Text style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
                      {discount.description}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 16, color: '#059669', fontWeight: '600' }}>
                  -{formatCurrency(Math.abs(discount.amount), orderData.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Promo Code Input */}
        {!readOnly && onApplyPromoCode && (
          <TouchableOpacity
            onPress={onApplyPromoCode}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#D1D5DB',
              backgroundColor: '#F9FAFB',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 14, color: '#374151', fontWeight: '600', marginRight: 8 }}>
              🎫 Add Promo Code
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              →
            </Text>
          </TouchableOpacity>
        )}

        {/* Fees */}
        {orderData.fees.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            {orderData.fees.map((fee, index) => (
              <View 
                key={index}
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>
                      {getFeeIcon(fee.type)}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                      {fee.name}
                    </Text>
                    {fee.optional && (
                      <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>
                        (optional)
                      </Text>
                    )}
                  </View>
                  {fee.description && (
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {fee.description}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500' }}>
                  {formatCurrency(fee.amount, orderData.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Taxes */}
        {orderData.taxes.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            {orderData.taxes.map((tax, index) => (
              <View 
                key={index}
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                    📊 {tax.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {tax.rate}%{tax.included ? ' (included)' : ''}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500' }}>
                  {formatCurrency(tax.amount, orderData.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tip */}
        {orderData.tip && (
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16,
            paddingVertical: 12,
            paddingHorizontal: 12,
            backgroundColor: '#FFFBEB',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FCD34D',
          }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, marginRight: 6 }}>💝</Text>
                <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '600' }}>
                  Tip
                </Text>
                {orderData.tip.percentage && (
                  <Text style={{ fontSize: 12, color: '#92400E', marginLeft: 4 }}>
                    ({orderData.tip.percentage}%)
                  </Text>
                )}
                {!readOnly && onEditTip && (
                  <TouchableOpacity onPress={onEditTip} style={{ marginLeft: 8 }}>
                    <Text style={{ fontSize: 12, color: '#D97706', fontWeight: '600' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {orderData.tip.suggested && (
                <Text style={{ fontSize: 11, color: '#92400E', marginTop: 2 }}>
                  Suggested tip
                </Text>
              )}
            </View>
            <Text style={{ fontSize: 16, color: '#92400E', fontWeight: '600' }}>
              {formatCurrency(orderData.tip.amount, orderData.currency)}
            </Text>
          </View>
        )}

        {/* Order Total */}
        <View style={{ 
          paddingTop: 16,
          borderTopWidth: 2,
          borderTopColor: '#E5E7EB',
          marginBottom: 20,
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 18, color: '#111827', fontWeight: 'bold' }}>
              Total
            </Text>
            <Text style={{ fontSize: 24, color: '#111827', fontWeight: 'bold' }}>
              {formatCurrency(orderData.total, orderData.currency)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        {showPaymentMethods && orderData.paymentMethods && orderData.paymentMethods.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, color: '#111827', fontWeight: '600' }}>
                Payment Methods
              </Text>
              {!readOnly && onChangePaymentMethod && (
                <TouchableOpacity onPress={onChangePaymentMethod}>
                  <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '600' }}>
                    Change
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {orderData.paymentMethods.map((method, index) => (
              <View 
                key={index}
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: '#F8F9FA',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, marginRight: 8 }}>💳</Text>
                  <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                    {method.brand} •••• {method.identifier}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}>
                  {formatCurrency(method.amount, orderData.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Delivery Information */}
        {showDeliveryInfo && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, color: '#111827', fontWeight: '600', marginBottom: 12 }}>
              {orderData.orderType === 'delivery' ? 'Delivery Info' : 
               orderData.orderType === 'pickup' ? 'Pickup Info' : 'Order Info'}
            </Text>
            
            {orderData.estimatedTime && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Text style={{ fontSize: 14, marginRight: 8 }}>⏱️</Text>
                <Text style={{ fontSize: 14, color: '#374151' }}>
                  Estimated {orderData.orderType} time: {formatTimeRange(orderData.estimatedTime)}
                </Text>
              </View>
            )}
            
            {orderData.deliveryAddress && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'flex-start',
                marginBottom: 8,
              }}>
                <Text style={{ fontSize: 14, marginRight: 8, marginTop: 2 }}>📍</Text>
                <Text style={{ fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 }}>
                  {orderData.deliveryAddress}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Special Instructions */}
        {orderData.specialInstructions && (
          <View style={{ 
            backgroundColor: '#FFFBEB',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FCD34D',
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '600', marginBottom: 4 }}>
              📝 Special Instructions
            </Text>
            <Text style={{ fontSize: 14, color: '#92400E', lineHeight: 20 }}>
              {orderData.specialInstructions}
            </Text>
          </View>
        )}

        {/* Loyalty Points */}
        {showLoyaltyPoints && orderData.pointsEarned && (
          <View style={{ 
            backgroundColor: '#F0FDF4',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#BBF7D0',
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
              ⭐ You'll earn {orderData.pointsEarned} loyalty points with this order!
            </Text>
          </View>
        )}

        {/* Custom Actions */}
        {actions.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={action.onPress}
                disabled={action.disabled || processing}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 
                    action.variant === 'destructive' ? '#EF4444' :
                    action.variant === 'outline' ? '#D1D5DB' :
                    'transparent',
                  backgroundColor: 
                    action.variant === 'default' ? '#3B82F6' :
                    action.variant === 'destructive' ? '#FEE2E2' :
                    action.variant === 'outline' ? 'transparent' :
                    '#F9FAFB',
                  alignItems: 'center',
                  opacity: (action.disabled || processing) ? 0.6 : 1,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: 
                    action.variant === 'default' ? 'white' :
                    action.variant === 'destructive' ? '#DC2626' :
                    '#374151',
                }}>
                  {processing && action.loading ? '⏳ ' : (action.icon ? `${action.icon} ` : '')}
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}

// === EXPORTS ===

export type {
  OrderSummaryProps,
  OrderSummaryData,
  TaxInfo,
  FeeInfo,
  DiscountInfo,
  TipInfo,
  PaymentMethodInfo,
  OrderSummaryAction,
  FeeType,
  DiscountType,
};
