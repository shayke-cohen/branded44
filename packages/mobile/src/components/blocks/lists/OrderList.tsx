/**
 * OrderList Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive order listing component for e-commerce applications,
 * displaying purchase history, order status, and order management actions.
 * 
 * Features:
 * - Order status indicators with color coding
 * - Order timeline and tracking information
 * - Product thumbnails and quantities
 * - Price breakdown and totals
 * - Quick actions (reorder, track, cancel, return)
 * - Filtering by status and date range
 * - Search functionality
 * - Real-time status updates
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <OrderList
 *   orders={orderHistory}
 *   onOrderPress={(order) => navigateToOrderDetails(order)}
 *   onTrackOrder={(orderId) => showTrackingInfo(orderId)}
 *   onReorder={(order) => handleReorder(order)}
 *   showProductImages={true}
 *   allowReorder={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Image
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, formatCurrency, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Order status types
 */
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned' 
  | 'refunded';

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';

/**
 * Order item information
 */
export interface OrderItem {
  /** Item ID */
  id: string;
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Product image URL */
  image?: string;
  /** Item quantity */
  quantity: number;
  /** Unit price */
  price: number;
  /** Item variant info */
  variant?: {
    size?: string;
    color?: string;
    style?: string;
  };
  /** Product SKU */
  sku?: string;
}

/**
 * Shipping address
 */
export interface ShippingAddress {
  /** Recipient name */
  name: string;
  /** Street address */
  street: string;
  /** City */
  city: string;
  /** State/Province */
  state: string;
  /** Postal code */
  zipCode: string;
  /** Country */
  country: string;
}

/**
 * Order tracking information
 */
export interface OrderTracking {
  /** Tracking number */
  trackingNumber: string;
  /** Carrier name */
  carrier: string;
  /** Current location */
  currentLocation?: string;
  /** Estimated delivery date */
  estimatedDelivery?: Date;
  /** Tracking events */
  events: Array<{
    timestamp: Date;
    status: string;
    location?: string;
    description: string;
  }>;
}

/**
 * Order data structure
 */
export interface Order {
  /** Unique order identifier */
  id: string;
  /** Order number for display */
  orderNumber: string;
  /** Order status */
  status: OrderStatus;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Order date */
  orderDate: Date;
  /** Expected delivery date */
  deliveryDate?: Date;
  /** Order items */
  items: OrderItem[];
  /** Subtotal amount */
  subtotal: number;
  /** Tax amount */
  tax: number;
  /** Shipping cost */
  shipping: number;
  /** Discount amount */
  discount: number;
  /** Total amount */
  total: number;
  /** Currency code */
  currency: string;
  /** Shipping address */
  shippingAddress: ShippingAddress;
  /** Tracking information */
  tracking?: OrderTracking;
  /** Payment method */
  paymentMethod?: {
    type: string;
    last4?: string;
  };
  /** Notes or special instructions */
  notes?: string;
  /** Whether order can be cancelled */
  cancellable?: boolean;
  /** Whether order can be returned */
  returnable?: boolean;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Order action configuration
 */
export interface OrderAction {
  /** Action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon (emoji or icon name) */
  icon: string;
  /** Action handler */
  onPress: (order: Order) => void;
  /** Whether action is destructive */
  destructive?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Show only for specific statuses */
  showForStatus?: OrderStatus[];
}

/**
 * Props for the OrderList component
 */
export interface OrderListProps extends BaseComponentProps {
  /** Array of orders to display */
  orders: Order[];
  /** Callback when an order is selected */
  onOrderPress?: (order: Order) => void;
  /** Callback for tracking an order */
  onTrackOrder?: (orderId: string) => void;
  /** Callback for reordering */
  onReorder?: (order: Order) => void;
  /** Callback for canceling order */
  onCancelOrder?: (orderId: string) => void;
  /** Callback for returning order */
  onReturnOrder?: (orderId: string) => void;
  /** Callback for order actions */
  onOrderAction?: (action: string, order: Order) => void;
  /** Available actions for each order */
  actions?: OrderAction[];
  /** Whether to show product images */
  showProductImages?: boolean;
  /** Whether to show order timeline */
  showTimeline?: boolean;
  /** Whether to show price breakdown */
  showPriceBreakdown?: boolean;
  /** Whether to allow reordering */
  allowReorder?: boolean;
  /** Whether to allow order cancellation */
  allowCancel?: boolean;
  /** Whether to allow returns */
  allowReturns?: boolean;
  /** Status filter */
  statusFilter?: OrderStatus[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of orders to show initially */
  initialNumToRender?: number;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Load more orders handler */
  onLoadMore?: () => void;
  /** Whether there are more orders to load */
  hasMore?: boolean;
  /** Order filtering function */
  filterOrders?: (order: Order) => boolean;
  /** Order sorting function */
  sortOrders?: (a: Order, b: Order) => number;
  /** Layout variant */
  variant?: 'compact' | 'detailed' | 'minimal';
  /** Custom order renderer */
  renderOrder?: (order: Order, index: number) => React.ReactElement;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * OrderList component for displaying order history
 */
export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onOrderPress,
  onTrackOrder,
  onReorder,
  onCancelOrder,
  onReturnOrder,
  onOrderAction,
  actions = [],
  showProductImages = true,
  showTimeline = true,
  showPriceBreakdown = false,
  allowReorder = true,
  allowCancel = true,
  allowReturns = true,
  statusFilter,
  loading = false,
  error,
  emptyMessage = 'No orders found',
  initialNumToRender = 10,
  onRefresh,
  onLoadMore,
  hasMore = false,
  filterOrders,
  sortOrders,
  variant = 'detailed',
  renderOrder,
  style,
  testID = 'order-list',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [refreshing, setRefreshing] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const processedOrders = useMemo(() => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter && statusFilter.length > 0) {
      filtered = filtered.filter(order => statusFilter.includes(order.status));
    }

    // Apply custom filter
    if (filterOrders) {
      filtered = filtered.filter(filterOrders);
    }

    // Apply custom sort or default sort by order date (newest first)
    if (sortOrders) {
      filtered = filtered.sort(sortOrders);
    } else {
      filtered = filtered.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
    }

    return filtered;
  }, [orders, statusFilter, filterOrders, sortOrders]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleOrderPress = useCallback((order: Order) => {
    onOrderPress?.(order);
  }, [onOrderPress]);

  const handleTrackOrder = useCallback((orderId: string) => {
    onTrackOrder?.(orderId);
  }, [onTrackOrder]);

  const handleReorder = useCallback((order: Order) => {
    onReorder?.(order);
  }, [onReorder]);

  const handleCancelOrder = useCallback((orderId: string) => {
    onCancelOrder?.(orderId);
  }, [onCancelOrder]);

  const handleReturnOrder = useCallback((orderId: string) => {
    onReturnOrder?.(orderId);
  }, [onReturnOrder]);

  const handleAction = useCallback((action: OrderAction, order: Order) => {
    action.onPress(order);
    onOrderAction?.(action.id, order);
  }, [onOrderAction]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      pending: COLORS.warning[500],
      confirmed: COLORS.info[500],
      processing: COLORS.warning[500],
      shipped: COLORS.primary[500],
      delivered: COLORS.success[500],
      cancelled: COLORS.error[500],
      returned: COLORS.neutral[500],
      refunded: COLORS.neutral[600],
    };
    return colors[status];
  };

  const getPaymentStatusColor = (status: PaymentStatus): string => {
    const colors: Record<PaymentStatus, string> = {
      pending: COLORS.warning[500],
      paid: COLORS.success[500],
      failed: COLORS.error[500],
      refunded: COLORS.neutral[500],
      partial: COLORS.warning[500],
    };
    return colors[status];
  };

  const getStatusDisplay = (status: OrderStatus): string => {
    const displays: Record<OrderStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      refunded: 'Refunded',
    };
    return displays[status];
  };

  const canPerformAction = (action: OrderAction, order: Order): boolean => {
    if (action.disabled) return false;
    if (action.showForStatus && !action.showForStatus.includes(order.status)) return false;
    return true;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderProductThumbnails = useCallback((items: OrderItem[], maxShow: number = 3) => {
    const visibleItems = items.slice(0, maxShow);
    const remainingCount = items.length - maxShow;

    return (
      <View style={styles.productThumbnails}>
        {visibleItems.map((item, index) => (
          <View key={item.id} style={[styles.thumbnailContainer, { marginLeft: index > 0 ? -8 : 0 }]}>
            {showProductImages && item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.productThumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.productThumbnail, styles.placeholderThumbnail]}>
                <Text style={styles.placeholderText}>📦</Text>
              </View>
            )}
            {item.quantity > 1 && (
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </View>
            )}
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.productThumbnail, styles.remainingBadge]}>
            <Text style={styles.remainingText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  }, [showProductImages]);

  const renderOrderTimeline = useCallback((order: Order) => {
    if (!showTimeline) return null;

    const timelineItems = [
      { status: 'confirmed', label: 'Confirmed', date: order.orderDate },
      { status: 'processing', label: 'Processing', date: order.orderDate },
      { status: 'shipped', label: 'Shipped', date: order.tracking?.events.find(e => e.status.toLowerCase().includes('ship'))?.timestamp },
      { status: 'delivered', label: 'Delivered', date: order.deliveryDate },
    ];

    const currentStatusIndex = timelineItems.findIndex(item => item.status === order.status);

    return (
      <View style={styles.timeline}>
        {timelineItems.map((item, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          
          return (
            <View key={item.status} style={styles.timelineItem}>
              <View style={[
                styles.timelineIndicator,
                isCompleted && styles.timelineIndicatorCompleted,
                isCurrent && styles.timelineIndicatorCurrent
              ]} />
              <View style={styles.timelineContent}>
                <Text style={[
                  styles.timelineLabel,
                  isCompleted && styles.timelineLabelCompleted
                ]}>
                  {item.label}
                </Text>
                {item.date && (
                  <Text style={styles.timelineDate}>
                    {formatDate(item.date, 'MMM DD')}
                  </Text>
                )}
              </View>
              {index < timelineItems.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  isCompleted && styles.timelineLineCompleted
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  }, [showTimeline]);

  const renderPriceBreakdown = useCallback((order: Order) => {
    if (!showPriceBreakdown) return null;

    return (
      <View style={styles.priceBreakdown}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(order.subtotal, order.currency)}
          </Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={[styles.priceValue, styles.discountValue]}>
              -{formatCurrency(order.discount, order.currency)}
            </Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Shipping</Text>
          <Text style={styles.priceValue}>
            {order.shipping > 0 ? formatCurrency(order.shipping, order.currency) : 'Free'}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(order.tax, order.currency)}
          </Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(order.total, order.currency)}
          </Text>
        </View>
      </View>
    );
  }, [showPriceBreakdown]);

  const renderOrderItem = useCallback(({ item: order, index }: { item: Order; index: number }) => {
    if (renderOrder) {
      return renderOrder(order, index);
    }

    const availableActions = actions.filter(action => canPerformAction(action, order));

    return (
      <Card 
        style={[
          styles.orderCard,
          variant === 'compact' && styles.compactCard
        ]}
        testID={`${testID}-item-${index}`}
      >
        <TouchableOpacity
          onPress={() => handleOrderPress(order)}
          style={styles.orderContent}
          accessibilityRole="button"
          accessibilityLabel={`Order ${order.orderNumber}`}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {formatDate(order.orderDate, 'MMM DD, YYYY')}
              </Text>
            </View>
            <View style={styles.orderStatus}>
              <Badge 
                variant="secondary"
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) }
                ]}
              >
                {getStatusDisplay(order.status)}
              </Badge>
              <Badge 
                variant="outline"
                style={[
                  styles.paymentBadge,
                  { borderColor: getPaymentStatusColor(order.paymentStatus) }
                ]}
              >
                {order.paymentStatus}
              </Badge>
            </View>
          </View>

          {/* Products */}
          <View style={styles.orderProducts}>
            {renderProductThumbnails(order.items)}
            <View style={styles.productInfo}>
              <Text style={styles.itemCount}>
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.orderTotal}>
                {formatCurrency(order.total, order.currency)}
              </Text>
            </View>
          </View>

          {/* Timeline */}
          {variant === 'detailed' && renderOrderTimeline(order)}

          {/* Price Breakdown */}
          {variant === 'detailed' && renderPriceBreakdown(order)}

          {/* Delivery Info */}
          {order.deliveryDate && (
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>
                {order.status === 'delivered' ? 'Delivered on' : 'Expected delivery'}
              </Text>
              <Text style={styles.deliveryDate}>
                {formatDate(order.deliveryDate, 'MMM DD, YYYY')}
              </Text>
            </View>
          )}

          {/* Tracking */}
          {order.tracking && (
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>Tracking</Text>
              <TouchableOpacity
                onPress={() => handleTrackOrder(order.id)}
                style={styles.trackingLink}
              >
                <Text style={styles.trackingNumber}>
                  {order.tracking.trackingNumber}
                </Text>
                <Text style={styles.trackingCarrier}>
                  via {order.tracking.carrier}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {allowReorder && ['delivered', 'returned'].includes(order.status) && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleReorder(order)}
                style={styles.actionButton}
              >
                🔄 Reorder
              </Button>
            )}
            {order.tracking && ['shipped', 'processing'].includes(order.status) && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleTrackOrder(order.id)}
                style={styles.actionButton}
              >
                📦 Track
              </Button>
            )}
            {allowCancel && order.cancellable && order.status === 'pending' && (
              <Button
                variant="destructive"
                size="sm"
                onPress={() => handleCancelOrder(order.id)}
                style={styles.actionButton}
              >
                ❌ Cancel
              </Button>
            )}
            {allowReturns && order.returnable && order.status === 'delivered' && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleReturnOrder(order.id)}
                style={styles.actionButton}
              >
                ↩️ Return
              </Button>
            )}
          </View>

          {/* Custom Actions */}
          {availableActions.length > 0 && (
            <View style={styles.customActions}>
              {availableActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.destructive ? "destructive" : "ghost"}
                  size="sm"
                  onPress={() => handleAction(action, order)}
                  style={styles.actionButton}
                >
                  {action.icon} {action.label}
                </Button>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  }, [
    variant,
    actions,
    allowReorder,
    allowCancel,
    allowReturns,
    renderOrder,
    handleOrderPress,
    handleReorder,
    handleTrackOrder,
    handleCancelOrder,
    handleReturnOrder,
    handleAction,
    renderProductThumbnails,
    renderOrderTimeline,
    renderPriceBreakdown,
    testID
  ]);

  // =============================================================================
  // ERROR & EMPTY STATES
  // =============================================================================

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  if (!loading && processedOrders.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.emptyText}>📦 {emptyMessage}</Text>
      </View>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  ) : undefined;

  return (
    <FlatList
      data={processedOrders}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={refreshControl}
      initialNumToRender={initialNumToRender}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      testID={testID}
      {...props}
    />
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  contentContainer: {
    padding: SPACING.md,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    marginBottom: SPACING.md,
  },
  compactCard: {
    marginBottom: SPACING.sm,
  },
  orderContent: {
    padding: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  orderDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  orderStatus: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  statusBadge: {
    color: COLORS.white,
  },
  paymentBadge: {
    backgroundColor: 'transparent',
  },
  orderProducts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productThumbnails: {
    flexDirection: 'row',
    marginRight: SPACING.md,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  productThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  placeholderThumbnail: {
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  quantityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error[500],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  remainingBadge: {
    backgroundColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  productInfo: {
    flex: 1,
  },
  itemCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[700],
  },
  orderTotal: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginTop: SPACING.xs,
  },
  timeline: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  timelineItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  timelineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[300],
    marginBottom: SPACING.xs,
  },
  timelineIndicatorCompleted: {
    backgroundColor: COLORS.success[500],
  },
  timelineIndicatorCurrent: {
    backgroundColor: COLORS.info[500],
  },
  timelineContent: {
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
  timelineLabelCompleted: {
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[400],
    marginTop: SPACING.xs,
  },
  timelineLine: {
    position: 'absolute',
    top: 6,
    left: '50%',
    right: -50,
    height: 2,
    backgroundColor: COLORS.neutral[200],
    zIndex: -1,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success[300],
  },
  priceBreakdown: {
    marginBottom: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[900],
  },
  discountValue: {
    color: COLORS.success[600],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.success[50],
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
  },
  deliveryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success[700],
  },
  deliveryDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.success[800],
  },
  trackingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trackingLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  trackingLink: {
    alignItems: 'flex-end',
  },
  trackingNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.info[600],
  },
  trackingCarrier: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  customActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error[500],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
});

export default OrderList;
