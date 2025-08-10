/**
 * TransactionList Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive transaction listing component for financial applications,
 * displaying payment history, transfers, and financial activities.
 * 
 * Features:
 * - Transaction categories with icons and colors
 * - Income vs expense indicators
 * - Amount formatting with currency support
 * - Date grouping and filtering
 * - Search and category filtering
 * - Transaction status indicators
 * - Quick actions (view details, dispute, export)
 * - Balance tracking and running totals
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <TransactionList
 *   transactions={transactionHistory}
 *   onTransactionPress={(transaction) => showDetails(transaction)}
 *   showRunningBalance={true}
 *   groupByDate={true}
 *   allowDispute={true}
 *   categoryFilter={['income', 'transfer']}
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
  SectionList
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
 * Transaction types/categories
 */
export type TransactionCategory = 
  | 'income' 
  | 'expense' 
  | 'transfer' 
  | 'investment' 
  | 'refund' 
  | 'fee' 
  | 'interest' 
  | 'dividend' 
  | 'bonus' 
  | 'subscription' 
  | 'bill' 
  | 'shopping' 
  | 'food' 
  | 'transport' 
  | 'entertainment' 
  | 'health' 
  | 'education' 
  | 'other';

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'disputed';

/**
 * Transaction type for flow direction
 */
export type TransactionType = 'credit' | 'debit';

/**
 * Payment method information
 */
export interface PaymentMethod {
  /** Payment method type */
  type: 'card' | 'bank' | 'wallet' | 'cash' | 'crypto' | 'other';
  /** Provider name */
  provider: string;
  /** Last 4 digits or identifier */
  identifier: string;
  /** Icon or emoji */
  icon?: string;
}

/**
 * Transaction participant (sender/receiver)
 */
export interface TransactionParticipant {
  /** Participant ID */
  id: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatar?: string;
  /** Account identifier */
  account?: string;
}

/**
 * Transaction data structure
 */
export interface Transaction {
  /** Unique transaction identifier */
  id: string;
  /** Transaction title/description */
  title: string;
  /** Additional description */
  description?: string;
  /** Transaction amount (positive for credit, negative for debit) */
  amount: number;
  /** Currency code */
  currency: string;
  /** Transaction type */
  type: TransactionType;
  /** Transaction category */
  category: TransactionCategory;
  /** Transaction status */
  status: TransactionStatus;
  /** Transaction date */
  date: Date;
  /** Payment method used */
  paymentMethod?: PaymentMethod;
  /** Transaction sender */
  sender?: TransactionParticipant;
  /** Transaction receiver */
  receiver?: TransactionParticipant;
  /** Running balance after transaction */
  balance?: number;
  /** Transaction reference number */
  reference?: string;
  /** Transaction fees */
  fee?: number;
  /** Exchange rate for currency conversion */
  exchangeRate?: number;
  /** Original amount in different currency */
  originalAmount?: {
    amount: number;
    currency: string;
  };
  /** Transaction tags */
  tags?: string[];
  /** Receipt URL */
  receipt?: string;
  /** Whether transaction can be disputed */
  disputable?: boolean;
  /** Whether transaction is recurring */
  recurring?: boolean;
  /** Location where transaction occurred */
  location?: {
    name: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Transaction action configuration
 */
export interface TransactionAction {
  /** Action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon (emoji or icon name) */
  icon: string;
  /** Action handler */
  onPress: (transaction: Transaction) => void;
  /** Whether action is destructive */
  destructive?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Show only for specific statuses */
  showForStatus?: TransactionStatus[];
  /** Show only for specific types */
  showForType?: TransactionType[];
}

/**
 * Transaction group for sectioned display
 */
export interface TransactionGroup {
  /** Group title */
  title: string;
  /** Group transactions */
  data: Transaction[];
  /** Group total */
  total?: number;
}

/**
 * Props for the TransactionList component
 */
export interface TransactionListProps extends BaseComponentProps {
  /** Array of transactions to display */
  transactions: Transaction[];
  /** Callback when a transaction is selected */
  onTransactionPress?: (transaction: Transaction) => void;
  /** Callback for transaction actions */
  onTransactionAction?: (action: string, transaction: Transaction) => void;
  /** Callback for disputing a transaction */
  onDispute?: (transactionId: string) => void;
  /** Callback for exporting transactions */
  onExport?: (transactions: Transaction[]) => void;
  /** Available actions for each transaction */
  actions?: TransactionAction[];
  /** Whether to show running balance */
  showRunningBalance?: boolean;
  /** Whether to show payment method info */
  showPaymentMethod?: boolean;
  /** Whether to show transaction categories */
  showCategories?: boolean;
  /** Whether to show participant info */
  showParticipants?: boolean;
  /** Whether to group transactions by date */
  groupByDate?: boolean;
  /** Whether to show daily totals */
  showDailyTotals?: boolean;
  /** Whether to allow dispute actions */
  allowDispute?: boolean;
  /** Category filter */
  categoryFilter?: TransactionCategory[];
  /** Status filter */
  statusFilter?: TransactionStatus[];
  /** Type filter */
  typeFilter?: TransactionType[];
  /** Date range filter */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of transactions to show initially */
  initialNumToRender?: number;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Load more transactions handler */
  onLoadMore?: () => void;
  /** Whether there are more transactions to load */
  hasMore?: boolean;
  /** Transaction filtering function */
  filterTransactions?: (transaction: Transaction) => boolean;
  /** Transaction sorting function */
  sortTransactions?: (a: Transaction, b: Transaction) => number;
  /** Layout variant */
  variant?: 'compact' | 'detailed' | 'minimal';
  /** Custom transaction renderer */
  renderTransaction?: (transaction: Transaction, index: number) => React.ReactElement;
  /** Custom group header renderer */
  renderGroupHeader?: (title: string, transactions: Transaction[], total?: number) => React.ReactElement;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TransactionList component for displaying financial transactions
 */
export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  onTransactionAction,
  onDispute,
  onExport,
  actions = [],
  showRunningBalance = false,
  showPaymentMethod = true,
  showCategories = true,
  showParticipants = true,
  groupByDate = false,
  showDailyTotals = false,
  allowDispute = true,
  categoryFilter,
  statusFilter,
  typeFilter,
  dateRange,
  loading = false,
  error,
  emptyMessage = 'No transactions found',
  initialNumToRender = 20,
  onRefresh,
  onLoadMore,
  hasMore = false,
  filterTransactions,
  sortTransactions,
  variant = 'detailed',
  renderTransaction,
  renderGroupHeader,
  style,
  testID = 'transaction-list',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [refreshing, setRefreshing] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const processedTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply category filter
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter(transaction => categoryFilter.includes(transaction.category));
    }

    // Apply status filter
    if (statusFilter && statusFilter.length > 0) {
      filtered = filtered.filter(transaction => statusFilter.includes(transaction.status));
    }

    // Apply type filter
    if (typeFilter && typeFilter.length > 0) {
      filtered = filtered.filter(transaction => typeFilter.includes(transaction.type));
    }

    // Apply date range filter
    if (dateRange) {
      filtered = filtered.filter(transaction => 
        transaction.date >= dateRange.start && transaction.date <= dateRange.end
      );
    }

    // Apply custom filter
    if (filterTransactions) {
      filtered = filtered.filter(filterTransactions);
    }

    // Apply custom sort or default sort by date (newest first)
    if (sortTransactions) {
      filtered = filtered.sort(sortTransactions);
    } else {
      filtered = filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    return filtered;
  }, [transactions, categoryFilter, statusFilter, typeFilter, dateRange, filterTransactions, sortTransactions]);

  const groupedTransactions = useMemo(() => {
    if (!groupByDate) return null;

    const groups: { [key: string]: Transaction[] } = {};
    
    processedTransactions.forEach(transaction => {
      const dateKey = formatDate(transaction.date, 'YYYY-MM-DD');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups).map(([date, transactionList]) => {
      const total = showDailyTotals 
        ? transactionList.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0)
        : undefined;

      return {
        title: formatDate(new Date(date), 'MMM DD, YYYY'),
        data: transactionList,
        total,
      };
    });
  }, [processedTransactions, groupByDate, showDailyTotals]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    onTransactionPress?.(transaction);
  }, [onTransactionPress]);

  const handleAction = useCallback((action: TransactionAction, transaction: Transaction) => {
    action.onPress(transaction);
    onTransactionAction?.(action.id, transaction);
  }, [onTransactionAction]);

  const handleDispute = useCallback((transactionId: string) => {
    onDispute?.(transactionId);
  }, [onDispute]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getCategoryIcon = (category: TransactionCategory): string => {
    const icons: Record<TransactionCategory, string> = {
      income: '💰',
      expense: '💸',
      transfer: '🔄',
      investment: '📈',
      refund: '↩️',
      fee: '📋',
      interest: '🏦',
      dividend: '💎',
      bonus: '🎁',
      subscription: '🔄',
      bill: '📄',
      shopping: '🛒',
      food: '🍽️',
      transport: '🚗',
      entertainment: '🎬',
      health: '🏥',
      education: '📚',
      other: '📁',
    };
    return icons[category];
  };

  const getCategoryColor = (category: TransactionCategory): string => {
    const colors: Record<TransactionCategory, string> = {
      income: COLORS.success[500],
      expense: COLORS.error[500],
      transfer: COLORS.info[500],
      investment: COLORS.primary[500],
      refund: COLORS.success[400],
      fee: COLORS.warning[500],
      interest: COLORS.info[400],
      dividend: COLORS.primary[400],
      bonus: COLORS.success[600],
      subscription: COLORS.warning[400],
      bill: COLORS.error[400],
      shopping: COLORS.primary[500],
      food: COLORS.warning[500],
      transport: COLORS.info[600],
      entertainment: COLORS.primary[600],
      health: COLORS.error[600],
      education: COLORS.indigo[500],
      other: COLORS.neutral[500],
    };
    return colors[category];
  };

  const getStatusColor = (status: TransactionStatus): string => {
    const colors: Record<TransactionStatus, string> = {
      pending: COLORS.warning[500],
      completed: COLORS.success[500],
      failed: COLORS.error[500],
      cancelled: COLORS.neutral[500],
      disputed: COLORS.warning[500],
    };
    return colors[status];
  };

  const canPerformAction = (action: TransactionAction, transaction: Transaction): boolean => {
    if (action.disabled) return false;
    if (action.showForStatus && !action.showForStatus.includes(transaction.status)) return false;
    if (action.showForType && !action.showForType.includes(transaction.type)) return false;
    return true;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderTransactionItem = useCallback(({ item: transaction, index }: { item: Transaction; index: number }) => {
    if (renderTransaction) {
      return renderTransaction(transaction, index);
    }

    const isCredit = transaction.type === 'credit';
    const availableActions = actions.filter(action => canPerformAction(action, transaction));

    return (
      <Card 
        style={[
          styles.transactionCard,
          variant === 'compact' && styles.compactCard,
          variant === 'minimal' && styles.minimalCard
        ]}
        testID={`${testID}-item-${index}`}
      >
        <TouchableOpacity
          onPress={() => handleTransactionPress(transaction)}
          style={styles.transactionContent}
          accessibilityRole="button"
          accessibilityLabel={`Transaction: ${transaction.title}`}
        >
          {/* Main Content */}
          <View style={styles.transactionHeader}>
            {/* Left - Icon/Category */}
            <View style={styles.transactionLeft}>
              <View style={[
                styles.categoryIcon,
                { backgroundColor: getCategoryColor(transaction.category) }
              ]}>
                <Text style={styles.categoryIconText}>
                  {getCategoryIcon(transaction.category)}
                </Text>
              </View>
            </View>

            {/* Center - Info */}
            <View style={styles.transactionBody}>
              <View style={styles.titleRow}>
                <Text 
                  style={styles.transactionTitle} 
                  numberOfLines={variant === 'compact' ? 1 : 2}
                >
                  {transaction.title}
                </Text>
                {transaction.status !== 'completed' && (
                  <Badge 
                    variant="outline"
                    size="sm"
                    style={[
                      styles.statusBadge,
                      { borderColor: getStatusColor(transaction.status) }
                    ]}
                  >
                    {transaction.status}
                  </Badge>
                )}
              </View>

              {/* Description */}
              {transaction.description && variant !== 'minimal' && (
                <Text style={styles.transactionDescription} numberOfLines={1}>
                  {transaction.description}
                </Text>
              )}

              {/* Metadata */}
              <View style={styles.transactionMeta}>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date, 'MMM DD, HH:mm')}
                </Text>
                
                {showCategories && variant === 'detailed' && (
                  <Badge variant="secondary" size="sm" style={styles.categoryBadge}>
                    {transaction.category}
                  </Badge>
                )}

                {showPaymentMethod && transaction.paymentMethod && (
                  <Text style={styles.paymentMethod}>
                    {transaction.paymentMethod.icon} {transaction.paymentMethod.provider}
                  </Text>
                )}
              </View>

              {/* Participants */}
              {showParticipants && (transaction.sender || transaction.receiver) && variant === 'detailed' && (
                <View style={styles.participantsContainer}>
                  {transaction.sender && (
                    <Text style={styles.participant}>
                      From: {transaction.sender.name}
                    </Text>
                  )}
                  {transaction.receiver && (
                    <Text style={styles.participant}>
                      To: {transaction.receiver.name}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Right - Amount */}
            <View style={styles.transactionRight}>
              <Text style={[
                styles.transactionAmount,
                isCredit ? styles.creditAmount : styles.debitAmount
              ]}>
                {isCredit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
              </Text>
              
              {showRunningBalance && transaction.balance !== undefined && (
                <Text style={styles.runningBalance}>
                  Balance: {formatCurrency(transaction.balance, transaction.currency)}
                </Text>
              )}

              {transaction.fee && transaction.fee > 0 && (
                <Text style={styles.feeAmount}>
                  Fee: {formatCurrency(transaction.fee, transaction.currency)}
                </Text>
              )}
            </View>
          </View>

          {/* Reference */}
          {transaction.reference && variant === 'detailed' && (
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceLabel}>Ref:</Text>
              <Text style={styles.referenceNumber}>{transaction.reference}</Text>
            </View>
          )}

          {/* Location */}
          {transaction.location && variant === 'detailed' && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{transaction.location.name}</Text>
            </View>
          )}

          {/* Actions */}
          {variant !== 'minimal' && (
            <View style={styles.actionsContainer}>
              {allowDispute && transaction.disputable && transaction.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleDispute(transaction.id)}
                  style={styles.actionButton}
                >
                  ⚠️ Dispute
                </Button>
              )}
              
              {availableActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.destructive ? "destructive" : "ghost"}
                  size="sm"
                  onPress={() => handleAction(action, transaction)}
                  style={styles.actionButton}
                >
                  {action.icon} {action.label}
                </Button>
              ))}
            </View>
          )}

          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && variant === 'detailed' && (
            <View style={styles.tagsContainer}>
              {transaction.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" size="sm" style={styles.tag}>
                  {tag}
                </Badge>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  }, [
    variant,
    actions,
    showRunningBalance,
    showPaymentMethod,
    showCategories,
    showParticipants,
    allowDispute,
    renderTransaction,
    handleTransactionPress,
    handleAction,
    handleDispute,
    testID
  ]);

  const renderGroupHeaderDefault = useCallback(({ section: { title, data, total } }: any) => {
    if (renderGroupHeader) {
      return renderGroupHeader(title, data, total);
    }

    return (
      <View style={styles.groupHeader}>
        <Text style={styles.groupHeaderText}>{title}</Text>
        <View style={styles.groupHeaderMeta}>
          {showDailyTotals && total !== undefined && (
            <Text style={[
              styles.groupTotal,
              total >= 0 ? styles.positiveTotal : styles.negativeTotal
            ]}>
              {total >= 0 ? '+' : ''}{formatCurrency(total, data[0]?.currency || 'USD')}
            </Text>
          )}
          <Badge variant="outline" size="sm">
            {data.length}
          </Badge>
        </View>
      </View>
    );
  }, [renderGroupHeader, showDailyTotals]);

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

  if (!loading && processedTransactions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.emptyText}>💳 {emptyMessage}</Text>
      </View>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  ) : undefined;

  if (groupByDate && groupedTransactions) {
    return (
      <SectionList
        sections={groupedTransactions}
        renderItem={renderTransactionItem}
        renderSectionHeader={renderGroupHeaderDefault}
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
  }

  return (
    <FlatList
      data={processedTransactions}
      renderItem={renderTransactionItem}
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
  transactionCard: {
    marginBottom: SPACING.sm,
  },
  compactCard: {
    marginBottom: SPACING.xs,
  },
  minimalCard: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: SPACING.xs,
  },
  transactionContent: {
    padding: SPACING.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transactionLeft: {
    marginRight: SPACING.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  transactionBody: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  transactionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: 'transparent',
  },
  transactionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  categoryBadge: {
    backgroundColor: COLORS.neutral[100],
    color: COLORS.neutral[700],
  },
  paymentMethod: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  participantsContainer: {
    marginTop: SPACING.xs,
  },
  participant: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  creditAmount: {
    color: COLORS.success[600],
  },
  debitAmount: {
    color: COLORS.error[600],
  },
  runningBalance: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    marginTop: SPACING.xs,
  },
  feeAmount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning[600],
    marginTop: SPACING.xs,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
  },
  referenceLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    marginRight: SPACING.xs,
  },
  referenceNumber: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[700],
    fontFamily: 'monospace',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  locationIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.info[100],
    color: COLORS.info[700],
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  groupHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  groupHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  groupTotal: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  positiveTotal: {
    color: COLORS.success[600],
  },
  negativeTotal: {
    color: COLORS.error[600],
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

export default TransactionList;
