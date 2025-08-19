/**
 * OrderScreen Template - AI-Optimized React Native Component
 * 
 * A comprehensive order management screen template that displays cart items,
 * order customization, and provides order management functionality.
 * 
 * @category Restaurant Templates
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import { 
  OrderItemCard,
  OrderSummary,
  type OrderItem,
  type OrderSummaryData,
  type SelectedCustomization 
} from '../../blocks/restaurant';
import { SearchForm, type SearchFormData } from '../../blocks/forms';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Order screen configuration
 */
export interface OrderScreenConfig {
  /** Screen title */
  title?: string;
  /** Show search in order items */
  showSearch?: boolean;
  /** Show order summary */
  showOrderSummary?: boolean;
  /** Show item recommendations */
  showRecommendations?: boolean;
  /** Allow item editing */
  allowItemEditing?: boolean;
  /** Allow special instructions */
  allowSpecialInstructions?: boolean;
  /** Show delivery options */
  showDeliveryOptions?: boolean;
  /** Show payment options */
  showPaymentOptions?: boolean;
  /** Show estimated time */
  showEstimatedTime?: boolean;
  /** Minimum order amount */
  minimumOrderAmount?: number;
  /** Maximum items per order */
  maxItemsPerOrder?: number;
}

/**
 * Delivery option data
 */
export interface DeliveryOption {
  id: string;
  type: 'delivery' | 'pickup' | 'dine-in';
  name: string;
  description: string;
  estimatedTime: number;
  fee: number;
  available: boolean;
}

/**
 * Recommendation item
 */
export interface RecommendationItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  popular?: boolean;
  discounted?: boolean;
}

/**
 * Order screen state
 */
export interface OrderScreenState {
  /** Current search query */
  searchQuery: string;
  /** Selected delivery option */
  selectedDeliveryOption?: string;
  /** Order special instructions */
  specialInstructions: string;
  /** Loading states */
  loading: {
    order: boolean;
    update: boolean;
    refresh: boolean;
    checkout: boolean;
  };
  /** Show customization modal for item */
  customizingItem?: string;
}

/**
 * Properties for the OrderScreen template
 */
export interface OrderScreenProps extends BaseComponentProps {
  /** Current order items */
  orderItems: OrderItem[];
  /** Order summary data */
  orderSummary: OrderSummaryData;
  /** Available delivery options */
  deliveryOptions?: DeliveryOption[];
  /** Recommended items */
  recommendations?: RecommendationItem[];
  /** Restaurant ID */
  restaurantId?: string;
  /** Restaurant name */
  restaurantName?: string;
  /** Callback when item quantity is changed */
  onItemQuantityChange?: (itemId: string, newQuantity: number) => Promise<void>;
  /** Callback when item is removed */
  onRemoveItem?: (itemId: string) => Promise<void>;
  /** Callback when item customization is edited */
  onEditItemCustomization?: (itemId: string) => void;
  /** Callback when special instructions are added */
  onAddSpecialInstructions?: (itemId: string, instructions: string) => Promise<void>;
  /** Callback when delivery option is selected */
  onDeliveryOptionSelect?: (optionId: string) => void;
  /** Callback when promo code is applied */
  onApplyPromoCode?: () => void;
  /** Callback when tip is edited */
  onEditTip?: () => void;
  /** Callback when payment method is changed */
  onChangePaymentMethod?: () => void;
  /** Callback when recommendation is added */
  onAddRecommendation?: (item: RecommendationItem) => Promise<void>;
  /** Callback when search is performed */
  onSearch?: (query: string) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void>;
  /** Callback to proceed to checkout */
  onProceedToCheckout?: () => void;
  /** Callback to continue shopping */
  onContinueShopping?: () => void;
  /** Callback to clear cart */
  onClearCart?: () => Promise<void>;
  /** Configuration for the screen */
  config?: OrderScreenConfig;
  /** Loading state */
  loading?: boolean;
  /** Whether order can be placed */
  canPlaceOrder?: boolean;
}

/**
 * Default configuration
 */
const defaultConfig: OrderScreenConfig = {
  title: 'Your Order',
  showSearch: true,
  showOrderSummary: true,
  showRecommendations: true,
  allowItemEditing: true,
  allowSpecialInstructions: true,
  showDeliveryOptions: true,
  showPaymentOptions: true,
  showEstimatedTime: true,
  minimumOrderAmount: 10,
  maxItemsPerOrder: 50,
};

/**
 * OrderScreen - Complete order management interface
 * 
 * @example
 * ```tsx
 * <OrderScreen
 *   orderItems={cartItems}
 *   orderSummary={orderSummaryData}
 *   deliveryOptions={availableDeliveryOptions}
 *   recommendations={recommendedItems}
 *   onItemQuantityChange={handleQuantityChange}
 *   onRemoveItem={handleRemoveItem}
 *   onProceedToCheckout={handleCheckout}
 *   onContinueShopping={handleContinueShopping}
 *   config={{
 *     allowItemEditing: true,
 *     showRecommendations: true,
 *     showOrderSummary: true
 *   }}
 * />
 * ```
 */
export default function OrderScreen({
  orderItems,
  orderSummary,
  deliveryOptions = [],
  recommendations = [],
  restaurantId,
  restaurantName,
  onItemQuantityChange,
  onRemoveItem,
  onEditItemCustomization,
  onAddSpecialInstructions,
  onDeliveryOptionSelect,
  onApplyPromoCode,
  onEditTip,
  onChangePaymentMethod,
  onAddRecommendation,
  onSearch,
  onRefresh,
  onProceedToCheckout,
  onContinueShopping,
  onClearCart,
  config = defaultConfig,
  loading = false,
  canPlaceOrder = true,
  testID = 'order-screen',
}: OrderScreenProps) {

  // Merge with default config
  const screenConfig = { ...defaultConfig, ...config };

  // Internal state
  const [state, setState] = useState<OrderScreenState>({
    searchQuery: '',
    selectedDeliveryOption: deliveryOptions[0]?.id,
    specialInstructions: '',
    loading: {
      order: false,
      update: false,
      refresh: false,
      checkout: false,
    },
  });

  // Handle search
  const handleSearch = useCallback(async (searchData: SearchFormData) => {
    const query = searchData.query || '';
    setState(prev => ({ ...prev, searchQuery: query }));
    onSearch?.(query);
  }, [onSearch]);

  // Handle item quantity change
  const handleQuantityChange = useCallback(async (itemId: string, newQuantity: number) => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, update: true } }));
      await onItemQuantityChange?.(itemId, newQuantity);
    } catch (error) {
      Alert.alert('Error', 'Failed to update item quantity. Please try again.');
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, update: false } }));
    }
  }, [onItemQuantityChange]);

  // Handle item removal
  const handleRemoveItem = useCallback(async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setState(prev => ({ ...prev, loading: { ...prev.loading, update: true } }));
              await onRemoveItem?.(itemId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            } finally {
              setState(prev => ({ ...prev, loading: { ...prev.loading, update: false } }));
            }
          },
        },
      ]
    );
  }, [onRemoveItem]);

  // Handle add recommendation
  const handleAddRecommendation = useCallback(async (item: RecommendationItem) => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, update: true } }));
      await onAddRecommendation?.(item);
      Alert.alert('Added', `${item.name} has been added to your order!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to order. Please try again.');
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, update: false } }));
    }
  }, [onAddRecommendation]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setState(prev => ({ ...prev, loading: { ...prev.loading, refresh: true } }));
      try {
        await onRefresh();
      } finally {
        setState(prev => ({ ...prev, loading: { ...prev.loading, refresh: false } }));
      }
    }
  }, [onRefresh]);

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    if (!canPlaceOrder) {
      Alert.alert('Cannot Place Order', 'Please check your order and try again.');
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, checkout: true } }));
      await onProceedToCheckout?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to proceed to checkout. Please try again.');
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, checkout: false } }));
    }
  }, [canPlaceOrder, onProceedToCheckout]);

  // Handle clear cart
  const handleClearCart = useCallback(async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await onClearCart?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cart. Please try again.');
            }
          },
        },
      ]
    );
  }, [onClearCart]);

  // Filter order items by search
  const filteredOrderItems = useMemo(() => {
    if (!state.searchQuery) return orderItems;
    
    const query = state.searchQuery.toLowerCase();
    return orderItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [orderItems, state.searchQuery]);

  // Check if order meets minimum amount
  const meetsMinimumOrder = orderSummary.total >= (screenConfig.minimumOrderAmount || 0);

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{screenConfig.title}</Text>
          {restaurantName && (
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          )}
        </View>
        
        {orderItems.length > 0 && onClearCart && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={state.loading.refresh}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* Empty State */}
        {orderItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🛒</Text>
            <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
            <Text style={styles.emptyStateMessage}>
              Add some delicious items to get started!
            </Text>
            {onContinueShopping && (
              <TouchableOpacity 
                style={styles.continueShoppingButton}
                onPress={onContinueShopping}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Search Section */}
            {screenConfig.showSearch && (
              <View style={styles.searchSection}>
                <SearchForm
                  onSubmit={handleSearch}
                  placeholder="Search your order..."
                  showFilters={false}
                  loading={state.loading.update}
                />
              </View>
            )}

            {/* Order Stats */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{orderItems.length}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </Text>
                <Text style={styles.statLabel}>Quantity</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.totalValue]}>
                  ${orderSummary.total.toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            {/* Delivery Options */}
            {screenConfig.showDeliveryOptions && deliveryOptions.length > 0 && (
              <View style={styles.deliverySection}>
                <Text style={styles.sectionTitle}>Delivery Options</Text>
                <View style={styles.deliveryOptions}>
                  {deliveryOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.deliveryOption,
                        state.selectedDeliveryOption === option.id && styles.selectedDeliveryOption
                      ]}
                      onPress={() => {
                        setState(prev => ({ ...prev, selectedDeliveryOption: option.id }));
                        onDeliveryOptionSelect?.(option.id);
                      }}
                      disabled={!option.available}
                    >
                      <View style={styles.deliveryOptionContent}>
                        <Text style={[
                          styles.deliveryOptionName,
                          !option.available && styles.unavailableText
                        ]}>
                          {option.name}
                        </Text>
                        <Text style={[
                          styles.deliveryOptionDescription,
                          !option.available && styles.unavailableText
                        ]}>
                          {option.description}
                        </Text>
                        <Text style={styles.deliveryOptionDetails}>
                          {option.estimatedTime} min • ${option.fee.toFixed(2)}
                        </Text>
                      </View>
                      {state.selectedDeliveryOption === option.id && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.selectedIndicatorText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Order Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {filteredOrderItems.map((item) => (
                <OrderItemCard
                  key={item.id}
                  item={item}
                  onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
                  onRemove={() => handleRemoveItem(item.id)}
                  onEditCustomizations={() => onEditItemCustomization?.(item.id)}
                  onAddInstructions={(instructions) => onAddSpecialInstructions?.(item.id, instructions)}
                  showQuantityControls={screenConfig.allowItemEditing}
                  showCustomizations={true}
                  showRemoveButton={screenConfig.allowItemEditing}
                  showEditOptions={screenConfig.allowItemEditing}
                  editable={screenConfig.allowItemEditing}
                  layout="list"
                />
              ))}
            </View>

            {/* Recommendations */}
            {screenConfig.showRecommendations && recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>You might also like</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recommendationsContainer}
                >
                  {recommendations.map((item) => (
                    <View key={item.id} style={styles.recommendationItem}>
                      <View style={styles.recommendationCard}>
                        <Text style={styles.recommendationName}>{item.name}</Text>
                        <Text style={styles.recommendationDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                        <View style={styles.recommendationFooter}>
                          <Text style={styles.recommendationPrice}>
                            ${item.price.toFixed(2)}
                          </Text>
                          <TouchableOpacity
                            style={styles.addRecommendationButton}
                            onPress={() => handleAddRecommendation(item)}
                          >
                            <Text style={styles.addRecommendationText}>Add</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Order Summary */}
            {screenConfig.showOrderSummary && (
              <View style={styles.summarySection}>
                <OrderSummary
                  orderData={orderSummary}
                  onApplyPromoCode={onApplyPromoCode}
                  onEditTip={onEditTip}
                  onChangePaymentMethod={onChangePaymentMethod}
                  showDetailedBreakdown={true}
                  showPaymentMethods={screenConfig.showPaymentOptions}
                  showDeliveryInfo={screenConfig.showEstimatedTime}
                  readOnly={false}
                  processing={state.loading.checkout}
                />
              </View>
            )}

            {/* Minimum Order Warning */}
            {!meetsMinimumOrder && screenConfig.minimumOrderAmount && (
              <View style={styles.warningSection}>
                <Text style={styles.warningText}>
                  Minimum order amount: ${screenConfig.minimumOrderAmount.toFixed(2)}
                  {'\n'}Add ${(screenConfig.minimumOrderAmount - orderSummary.total).toFixed(2)} more to place your order
                </Text>
              </View>
            )}
          </>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Checkout Button */}
      {orderItems.length > 0 && (
        <View style={styles.checkoutSection}>
          {onContinueShopping && (
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={onContinueShopping}
            >
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              (!canPlaceOrder || !meetsMinimumOrder || state.loading.checkout) && styles.disabledButton
            ]}
            onPress={handleCheckout}
            disabled={!canPlaceOrder || !meetsMinimumOrder || state.loading.checkout}
          >
            <Text style={styles.checkoutButtonText}>
              {state.loading.checkout ? 'Processing...' : 
               `Checkout • $${orderSummary.total.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// === STYLES ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  restaurantName: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error[500],
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  totalValue: {
    color: COLORS.primary[600],
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deliverySection: {
    padding: SPACING.md,
  },
  deliveryOptions: {
    gap: SPACING.sm,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDeliveryOption: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  deliveryOptionContent: {
    flex: 1,
  },
  deliveryOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  deliveryOptionDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  deliveryOptionDetails: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  unavailableText: {
    opacity: 0.5,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  itemsSection: {
    padding: SPACING.md,
  },
  recommendationsSection: {
    padding: SPACING.md,
  },
  recommendationsContainer: {
    paddingLeft: SPACING.md,
  },
  recommendationItem: {
    marginRight: SPACING.md,
    width: 200,
  },
  recommendationCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  addRecommendationButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addRecommendationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  summarySection: {
    padding: SPACING.md,
  },
  warningSection: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning[200],
  },
  warningText: {
    fontSize: 14,
    color: COLORS.warning[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 120,
  },
  checkoutSection: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: COLORS.primary[500],
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: COLORS.primary[600],
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    boxShadow: '0 2px 4px rgba(99, 102, 241, 0.25)',
  },
  disabledButton: {
    backgroundColor: COLORS.gray[400],
    elevation: 0,
    boxShadow: 'none',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

// === EXPORTS ===

export type {
  OrderScreenProps,
  OrderScreenConfig,
  OrderScreenState,
  DeliveryOption,
  RecommendationItem,
};
