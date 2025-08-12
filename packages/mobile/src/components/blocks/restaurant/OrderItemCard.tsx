/**
 * OrderItemCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive order item display card for shopping cart and order management.
 * Perfect for displaying cart items with customization options, quantity controls, and pricing.
 * 
 * @category Restaurant Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Selected customization for an order item
 */
export interface SelectedCustomization {
  /** Customization option ID */
  optionId: string;
  /** Option name */
  optionName: string;
  /** Selected choice ID */
  choiceId: string;
  /** Selected choice name */
  choiceName: string;
  /** Additional price for this customization */
  additionalPrice: number;
}

/**
 * Order item pricing breakdown
 */
export interface OrderItemPricing {
  /** Base item price */
  basePrice: number;
  /** Total customization costs */
  customizationTotal: number;
  /** Item subtotal (base + customizations) */
  itemSubtotal: number;
  /** Total for this line item (subtotal * quantity) */
  lineTotal: number;
  /** Currency code */
  currency: string;
  /** Whether item is on sale */
  onSale?: boolean;
  /** Discount amount if applicable */
  discount?: number;
}

/**
 * Order item data structure
 */
export interface OrderItem {
  /** Unique identifier for this order line item */
  id: string;
  /** Menu item ID this order item is based on */
  menuItemId: string;
  /** Item name */
  name: string;
  /** Item description */
  description?: string;
  /** Item image */
  image: string;
  /** Quantity ordered */
  quantity: number;
  /** Selected customizations */
  customizations: SelectedCustomization[];
  /** Pricing breakdown */
  pricing: OrderItemPricing;
  /** Special instructions */
  specialInstructions?: string;
  /** Whether item is available */
  available: boolean;
  /** Estimated preparation time */
  prepTime?: number;
  /** Item category for organization */
  category?: string;
  /** Restaurant/vendor ID */
  restaurantId?: string;
  /** Size variant if applicable */
  size?: string;
}

/**
 * Action button configuration
 */
export interface OrderItemAction {
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
 * OrderItemCard component props
 */
export interface OrderItemCardProps {
  /** Order item data to display */
  item: OrderItem;
  /** Card press handler */
  onPress?: () => void;
  /** Quantity change handler */
  onQuantityChange?: (newQuantity: number) => void;
  /** Remove item handler */
  onRemove?: () => void;
  /** Edit customizations handler */
  onEditCustomizations?: () => void;
  /** Add special instructions handler */
  onAddInstructions?: () => void;
  /** Custom action buttons */
  actions?: OrderItemAction[];
  /** Card layout variant */
  layout?: 'card' | 'list' | 'compact';
  /** Whether to show quantity controls */
  showQuantityControls?: boolean;
  /** Whether to show customizations */
  showCustomizations?: boolean;
  /** Whether to show pricing breakdown */
  showPricingBreakdown?: boolean;
  /** Whether to show remove button */
  showRemoveButton?: boolean;
  /** Whether to show edit options */
  showEditOptions?: boolean;
  /** Whether item can be edited */
  editable?: boolean;
  /** Whether card is loading */
  loading?: boolean;
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
 * Generate customization display text
 */
const formatCustomizations = (customizations: SelectedCustomization[]): string => {
  if (customizations.length === 0) return '';
  
  return customizations
    .map(custom => {
      const priceText = custom.additionalPrice > 0 
        ? ` (+$${custom.additionalPrice.toFixed(2)})` 
        : '';
      return `${custom.optionName}: ${custom.choiceName}${priceText}`;
    })
    .join('\n');
};

// === COMPONENT ===

/**
 * OrderItemCard - Display cart/order item with management controls
 * 
 * @example
 * ```tsx
 * const orderItem = {
 *   id: 'order_item_123',
 *   menuItemId: 'menu_123',
 *   name: 'Margherita Pizza',
 *   image: 'pizza.jpg',
 *   quantity: 2,
 *   customizations: [
 *     {
 *       optionId: 'size',
 *       optionName: 'Size',
 *       choiceId: 'large',
 *       choiceName: 'Large',
 *       additionalPrice: 3.00
 *     }
 *   ],
 *   pricing: {
 *     basePrice: 14.99,
 *     customizationTotal: 3.00,
 *     itemSubtotal: 17.99,
 *     lineTotal: 35.98,
 *     currency: 'USD'
 *   },
 *   available: true
 * };
 * 
 * <OrderItemCard
 *   item={orderItem}
 *   onQuantityChange={(qty) => updateQuantity(orderItem.id, qty)}
 *   onRemove={() => removeFromCart(orderItem.id)}
 *   onEditCustomizations={() => editItem(orderItem.id)}
 *   showQuantityControls={true}
 *   showCustomizations={true}
 * />
 * ```
 */
export default function OrderItemCard({
  item,
  onPress,
  onQuantityChange,
  onRemove,
  onEditCustomizations,
  onAddInstructions,
  actions = [],
  layout = 'list',
  showQuantityControls = true,
  showCustomizations = true,
  showPricingBreakdown = false,
  showRemoveButton = true,
  showEditOptions = true,
  editable = true,
  loading = false,
  width,
  testID = 'order-item-card',
}: OrderItemCardProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card style={{ width, padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 60, height: 60, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, width: '70%' }} />
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, width: '50%' }} />
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, width: '40%' }} />
          </View>
          <View style={{ width: 80, height: 20, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isCard = layout === 'card';

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.95}>
      <Card style={{ 
        width,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 8,
        opacity: item.available ? 1 : 0.6,
      }}>
        <View style={{ padding: 16 }}>
          
          {/* Main Item Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            
            {/* Item Image */}
            <View style={{
              width: isCompact ? 50 : 70,
              height: isCompact ? 50 : 70,
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#F3F4F6',
            }}>
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/70x70' }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              
              {/* Unavailable Overlay */}
              {!item.available && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>
                    N/A
                  </Text>
                </View>
              )}
            </View>

            {/* Item Details */}
            <View style={{ flex: 1 }}>
              
              {/* Item Name and Remove Button */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text 
                  numberOfLines={isCompact ? 1 : 2}
                  style={{ 
                    fontWeight: '600',
                    color: '#111827',
                    fontSize: isCompact ? 14 : 16,
                    lineHeight: isCompact ? 18 : 20,
                    flex: 1,
                    marginRight: 8,
                  }}
                >
                  {item.name}
                </Text>
                
                {/* Remove Button */}
                {showRemoveButton && onRemove && (
                  <TouchableOpacity
                    onPress={onRemove}
                    style={{
                      padding: 4,
                      borderRadius: 12,
                      backgroundColor: '#FEE2E2',
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#DC2626' }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Item Description */}
              {!isCompact && item.description && (
                <Text 
                  numberOfLines={1}
                  style={{ 
                    fontSize: 12,
                    color: '#6B7280',
                    lineHeight: 16,
                    marginBottom: 6,
                  }}
                >
                  {item.description}
                </Text>
              )}

              {/* Size Variant */}
              {item.size && (
                <View style={{ marginBottom: 6 }}>
                  <View style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>
                      Size: {item.size}
                    </Text>
                  </View>
                </View>
              )}

              {/* Customizations */}
              {showCustomizations && item.customizations.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ 
                    fontSize: 11, 
                    color: '#6B7280', 
                    lineHeight: 14,
                    marginBottom: 2,
                  }}>
                    Customizations:
                  </Text>
                  {item.customizations.slice(0, isCompact ? 2 : 4).map((custom, index) => (
                    <Text 
                      key={index}
                      style={{ 
                        fontSize: 11, 
                        color: '#374151', 
                        lineHeight: 14,
                      }}
                    >
                      • {custom.optionName}: {custom.choiceName}
                      {custom.additionalPrice > 0 && (
                        <Text style={{ color: '#059669', fontWeight: '600' }}>
                          {' '}(+{formatCurrency(custom.additionalPrice, item.pricing.currency)})
                        </Text>
                      )}
                    </Text>
                  ))}
                  {item.customizations.length > (isCompact ? 2 : 4) && (
                    <Text style={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic' }}>
                      +{item.customizations.length - (isCompact ? 2 : 4)} more...
                    </Text>
                  )}
                </View>
              )}

              {/* Special Instructions */}
              {item.specialInstructions && (
                <View style={{ 
                  backgroundColor: '#FFFBEB',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#FCD34D',
                  marginBottom: 8,
                }}>
                  <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '500' }}>
                    📝 {item.specialInstructions}
                  </Text>
                </View>
              )}

              {/* Edit Options */}
              {showEditOptions && editable && (onEditCustomizations || onAddInstructions) && (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {onEditCustomizations && (
                    <TouchableOpacity
                      onPress={onEditCustomizations}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <Text style={{ fontSize: 10, color: '#374151', fontWeight: '600' }}>
                        🔧 Edit
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {onAddInstructions && !item.specialInstructions && (
                    <TouchableOpacity
                      onPress={onAddInstructions}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <Text style={{ fontSize: 10, color: '#374151', fontWeight: '600' }}>
                        📝 Add Note
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Price and Quantity Section */}
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 80 }}>
              
              {/* Line Total */}
              <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: '#111827',
                }}>
                  {formatCurrency(item.pricing.lineTotal, item.pricing.currency)}
                </Text>
                
                {/* Price Breakdown */}
                {showPricingBreakdown && (
                  <View style={{ alignItems: 'flex-end', marginTop: 2 }}>
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>
                      {formatCurrency(item.pricing.itemSubtotal, item.pricing.currency)} × {item.quantity}
                    </Text>
                    {item.pricing.customizationTotal > 0 && (
                      <Text style={{ fontSize: 10, color: '#059669' }}>
                        +{formatCurrency(item.pricing.customizationTotal, item.pricing.currency)} custom
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Quantity Controls */}
              {showQuantityControls && onQuantityChange && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 16,
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                }}>
                  <TouchableOpacity
                    onPress={() => onQuantityChange(Math.max(0, item.quantity - 1))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: item.quantity > 1 ? '#3B82F6' : '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    disabled={item.quantity <= 1}
                  >
                    <Text style={{ 
                      color: item.quantity > 1 ? 'white' : '#9CA3AF', 
                      fontSize: 16, 
                      fontWeight: 'bold',
                    }}>
                      −
                    </Text>
                  </TouchableOpacity>
                  
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: '#111827',
                    marginHorizontal: 12,
                    minWidth: 20,
                    textAlign: 'center',
                  }}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => onQuantityChange(item.quantity + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#3B82F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 16, 
                      fontWeight: 'bold',
                    }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Custom Actions */}
          {actions.length > 0 && (
            <View style={{ 
              flexDirection: 'row', 
              gap: 8, 
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: action.variant === 'destructive' ? '#EF4444' : '#D1D5DB',
                    backgroundColor: 
                      action.variant === 'default' ? '#3B82F6' :
                      action.variant === 'destructive' ? '#FEE2E2' :
                      '#F9FAFB',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: 
                      action.variant === 'default' ? 'white' :
                      action.variant === 'destructive' ? '#DC2626' :
                      '#374151',
                  }}>
                    {action.icon && `${action.icon} `}{action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Preparation Time */}
          {item.prepTime && (
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}>
              <Text style={{ fontSize: 11, color: '#6B7280' }}>
                ⏱️ Prep time: {item.prepTime} min
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  OrderItemCardProps,
  OrderItem,
  SelectedCustomization,
  OrderItemPricing,
  OrderItemAction,
};
