/**
 * TransactionCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive financial transaction card component for banking, fintech,
 * and e-commerce apps, displaying transaction details, status, and actions.
 * 
 * Features:
 * - Transaction details with amount, date, description
 * - Multiple transaction types (payment, transfer, refund, etc.)
 * - Status indicators and visual feedback
 * - Category icons and merchant information
 * - Security and verification badges
 * - Receipt and documentation links
 * - Dispute and support actions
 * - Balance and account information
 * 
 * @example
 * ```tsx
 * <TransactionCard
 *   transaction={transactionData}
 *   onPress={handleTransactionPress}
 *   onReceiptPress={handleReceiptPress}
 *   onDisputePress={handleDisputePress}
 *   showActions={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { Button } from '../../../../~/components/ui/button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, formatCurrency, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Transaction type
 */
export type TransactionType = 
  | 'payment' 
  | 'transfer' 
  | 'deposit' 
  | 'withdrawal' 
  | 'refund' 
  | 'charge' 
  | 'fee' 
  | 'interest' 
  | 'dividend' 
  | 'cashback';

/**
 * Transaction status
 */
export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'disputed' 
  | 'refunded';

/**
 * Transaction category
 */
export type TransactionCategory = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'entertainment' 
  | 'utilities' 
  | 'health' 
  | 'education' 
  | 'travel' 
  | 'business' 
  | 'other';

/**
 * Payment method
 */
export interface PaymentMethod {
  /** Payment method ID */
  id: string;
  /** Method type */
  type: 'card' | 'bank' | 'wallet' | 'crypto' | 'cash';
  /** Method name/label */
  name: string;
  /** Last 4 digits or identifier */
  last4?: string;
  /** Brand (Visa, Mastercard, etc.) */
  brand?: string;
  /** Icon or emoji */
  icon?: string;
}

/**
 * Merchant information
 */
export interface MerchantInfo {
  /** Merchant ID */
  id: string;
  /** Merchant name */
  name: string;
  /** Merchant category */
  category: TransactionCategory;
  /** Merchant logo URL */
  logo?: string;
  /** Merchant location */
  location?: string;
  /** Merchant website */
  website?: string;
  /** Merchant phone */
  phone?: string;
}

/**
 * Transaction fees
 */
export interface TransactionFees {
  /** Processing fee */
  processing?: number;
  /** Foreign exchange fee */
  forex?: number;
  /** ATM fee */
  atm?: number;
  /** Service fee */
  service?: number;
  /** Total fees */
  total: number;
}

/**
 * Security information
 */
export interface SecurityInfo {
  /** Transaction is secure */
  isSecure: boolean;
  /** Verification method */
  verification?: 'pin' | 'biometric' | '2fa' | 'sms';
  /** Risk level */
  riskLevel?: 'low' | 'medium' | 'high';
  /** Fraud alert */
  fraudAlert?: boolean;
}

/**
 * Transaction data
 */
export interface TransactionData {
  /** Transaction ID */
  id: string;
  /** Transaction type */
  type: TransactionType;
  /** Transaction status */
  status: TransactionStatus;
  /** Transaction amount */
  amount: number;
  /** Currency code */
  currency: string;
  /** Transaction description */
  description: string;
  /** Transaction date */
  date: Date;
  /** Merchant information */
  merchant?: MerchantInfo;
  /** Payment method used */
  paymentMethod?: PaymentMethod;
  /** Transaction category */
  category: TransactionCategory;
  /** Transaction fees */
  fees?: TransactionFees;
  /** Security information */
  security?: SecurityInfo;
  /** Reference number */
  reference?: string;
  /** Transaction notes */
  notes?: string;
  /** Receipt URL */
  receiptUrl?: string;
  /** Recurring transaction */
  isRecurring?: boolean;
  /** Account balance after transaction */
  balanceAfter?: number;
  /** Exchange rate (for foreign transactions) */
  exchangeRate?: number;
  /** Original amount (for foreign transactions) */
  originalAmount?: {
    amount: number;
    currency: string;
  };
}

/**
 * Props for the TransactionCard component
 */
export interface TransactionCardProps extends BaseComponentProps {
  /** Transaction data */
  transaction: TransactionData;
  /** Whether to show detailed information */
  showDetails?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Whether to show security info */
  showSecurity?: boolean;
  /** Whether to show fees breakdown */
  showFees?: boolean;
  /** Whether transaction is selectable */
  selectable?: boolean;
  /** Whether transaction is selected */
  selected?: boolean;
  /** Card size variant */
  size?: 'small' | 'medium' | 'large';
  /** Callback when transaction is pressed */
  onPress?: (transaction: TransactionData) => void;
  /** Callback when receipt is requested */
  onReceiptPress?: (transaction: TransactionData) => void;
  /** Callback when dispute is initiated */
  onDisputePress?: (transaction: TransactionData) => void;
  /** Callback when refund is requested */
  onRefundPress?: (transaction: TransactionData) => void;
  /** Callback when merchant is pressed */
  onMerchantPress?: (merchant: MerchantInfo) => void;
  /** Callback when payment method is pressed */
  onPaymentMethodPress?: (method: PaymentMethod) => void;
  /** Callback when support is contacted */
  onContactSupport?: (transaction: TransactionData) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TransactionCard component for displaying financial transaction information
 */
export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  showDetails = false,
  showActions = true,
  showSecurity = true,
  showFees = false,
  selectable = false,
  selected = false,
  size = 'medium',
  onPress,
  onReceiptPress,
  onDisputePress,
  onRefundPress,
  onMerchantPress,
  onPaymentMethodPress,
  onContactSupport,
  style,
  testID = 'transaction-card',
  ...props
}) => {
  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getTransactionTypeIcon = (type: TransactionType): string => {
    const icons: Record<TransactionType, string> = {
      payment: '💳',
      transfer: '↔️',
      deposit: '⬇️',
      withdrawal: '⬆️',
      refund: '↩️',
      charge: '💰',
      fee: '📋',
      interest: '💹',
      dividend: '📈',
      cashback: '🔄',
    };
    return icons[type];
  };

  const getCategoryIcon = (category: TransactionCategory): string => {
    const icons: Record<TransactionCategory, string> = {
      food: '🍽️',
      transport: '🚗',
      shopping: '🛒',
      entertainment: '🎬',
      utilities: '⚡',
      health: '🏥',
      education: '📚',
      travel: '✈️',
      business: '💼',
      other: '📦',
    };
    return icons[category];
  };

  const getStatusColor = (status: TransactionStatus): string => {
    const colors: Record<TransactionStatus, string> = {
      pending: COLORS.warning[500],
      processing: COLORS.info[500],
      completed: COLORS.success[500],
      failed: COLORS.error[500],
      cancelled: COLORS.neutral[500],
      disputed: COLORS.error[600],
      refunded: COLORS.info[600],
    };
    return colors[status];
  };

  const getStatusLabel = (status: TransactionStatus): string => {
    const labels: Record<TransactionStatus, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
      refunded: 'Refunded',
    };
    return labels[status];
  };

  const isDebitTransaction = (): boolean => {
    return ['payment', 'transfer', 'withdrawal', 'charge', 'fee'].includes(transaction.type);
  };

  const getAmountColor = (): string => {
    if (transaction.status === 'failed' || transaction.status === 'cancelled') {
      return COLORS.neutral[500];
    }
    return isDebitTransaction() ? COLORS.error[600] : COLORS.success[600];
  };

  const formatAmount = (): string => {
    const prefix = isDebitTransaction() ? '-' : '+';
    return `${prefix}${formatCurrency(transaction.amount, transaction.currency)}`;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.iconContainer}>
        <Text style={styles.typeIcon}>
          {getTransactionTypeIcon(transaction.type)}
        </Text>
        {transaction.category && (
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(transaction.category)}
          </Text>
        )}
      </View>
      
      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={[styles.amount, { color: getAmountColor() }]}>
            {formatAmount()}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Text style={styles.date}>
            {formatDate(transaction.date, 'MMM DD, HH:mm')}
          </Text>
          <Badge 
            variant="outline"
            style={[styles.statusBadge, { borderColor: getStatusColor(transaction.status) }]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
              {getStatusLabel(transaction.status)}
            </Text>
          </Badge>
        </View>
      </View>
      
      {selectable && (
        <View style={[styles.checkbox, selected && styles.checkedBox]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}
    </View>
  );

  const renderMerchant = () => {
    if (!showDetails || !transaction.merchant) return null;

    return (
      <TouchableOpacity
        style={styles.merchantContainer}
        onPress={() => onMerchantPress?.(transaction.merchant!)}
      >
        <Text style={styles.merchantIcon}>🏪</Text>
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName}>{transaction.merchant.name}</Text>
          {transaction.merchant.location && (
            <Text style={styles.merchantLocation}>{transaction.merchant.location}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPaymentMethod = () => {
    if (!showDetails || !transaction.paymentMethod) return null;

    return (
      <TouchableOpacity
        style={styles.paymentMethodContainer}
        onPress={() => onPaymentMethodPress?.(transaction.paymentMethod!)}
      >
        <Text style={styles.paymentIcon}>
          {transaction.paymentMethod.icon || '💳'}
        </Text>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentName}>{transaction.paymentMethod.name}</Text>
          {transaction.paymentMethod.last4 && (
            <Text style={styles.paymentDetails}>
              •••• {transaction.paymentMethod.last4}
            </Text>
          )}
        </View>
        {transaction.paymentMethod.brand && (
          <Text style={styles.paymentBrand}>{transaction.paymentMethod.brand}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSecurity = () => {
    if (!showSecurity || !transaction.security) return null;

    return (
      <View style={styles.securityContainer}>
        <Text style={styles.securityTitle}>Security</Text>
        <View style={styles.securityInfo}>
          <Text style={styles.securityIcon}>
            {transaction.security.isSecure ? '🔒' : '⚠️'}
          </Text>
          <Text style={styles.securityText}>
            {transaction.security.isSecure ? 'Secure Transaction' : 'Security Warning'}
          </Text>
          {transaction.security.verification && (
            <Badge variant="outline" style={styles.verificationBadge}>
              {transaction.security.verification.toUpperCase()}
            </Badge>
          )}
        </View>
      </View>
    );
  };

  const renderFees = () => {
    if (!showFees || !transaction.fees || transaction.fees.total === 0) return null;

    return (
      <View style={styles.feesContainer}>
        <Text style={styles.feesTitle}>Fees</Text>
        <View style={styles.feesBreakdown}>
          {transaction.fees.processing && (
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Processing</Text>
              <Text style={styles.feeAmount}>
                {formatCurrency(transaction.fees.processing, transaction.currency)}
              </Text>
            </View>
          )}
          {transaction.fees.forex && (
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Foreign Exchange</Text>
              <Text style={styles.feeAmount}>
                {formatCurrency(transaction.fees.forex, transaction.currency)}
              </Text>
            </View>
          )}
          <View style={[styles.feeItem, styles.totalFeeItem]}>
            <Text style={styles.totalFeeLabel}>Total Fees</Text>
            <Text style={styles.totalFeeAmount}>
              {formatCurrency(transaction.fees.total, transaction.currency)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDetails = () => {
    if (!showDetails) return null;

    return (
      <View style={styles.detailsContainer}>
        {transaction.reference && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Reference</Text>
            <Text style={styles.detailValue}>{transaction.reference}</Text>
          </View>
        )}
        
        {transaction.balanceAfter !== undefined && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Balance After</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(transaction.balanceAfter, transaction.currency)}
            </Text>
          </View>
        )}
        
        {transaction.originalAmount && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Original Amount</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(transaction.originalAmount.amount, transaction.originalAmount.currency)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    const canDispute = transaction.status === 'completed' && isDebitTransaction();
    const canRefund = transaction.status === 'completed' && !isDebitTransaction();
    const canViewReceipt = transaction.receiptUrl || transaction.status === 'completed';

    return (
      <View style={styles.actionsContainer}>
        <View style={styles.actionButtons}>
          {canViewReceipt && onReceiptPress && (
            <Button
              variant="outline"
              onPress={() => onReceiptPress(transaction)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>📧 Receipt</Text>
            </Button>
          )}
          
          {canDispute && onDisputePress && (
            <Button
              variant="outline"
              onPress={() => onDisputePress(transaction)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>⚠️ Dispute</Text>
            </Button>
          )}
          
          {canRefund && onRefundPress && (
            <Button
              variant="outline"
              onPress={() => onRefundPress(transaction)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>↩️ Refund</Text>
            </Button>
          )}
        </View>
        
        {onContactSupport && (
          <TouchableOpacity
            onPress={() => onContactSupport(transaction)}
            style={styles.supportButton}
          >
            <Text style={styles.supportText}>💬 Contact Support</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[
        styles.card,
        size === 'small' && styles.smallCard,
        size === 'large' && styles.largeCard,
        selected && styles.selectedCard,
        style
      ]} 
      testID={testID}
      onPress={() => onPress?.(transaction)}
      {...props}
    >
      <View style={styles.content}>
        {renderHeader()}
        {renderMerchant()}
        {renderPaymentMethod()}
        {renderSecurity()}
        {renderFees()}
        {renderDetails()}
        {renderActions()}
        
        {/* Status indicator border */}
        <View style={[styles.statusBorder, { backgroundColor: getStatusColor(transaction.status) }]} />
      </View>
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    margin: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  smallCard: {
    minHeight: 80,
  },
  largeCard: {
    minHeight: 200,
  },
  selectedCard: {
    borderColor: COLORS.primary[500],
    borderWidth: 2,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  typeIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.xs,
  },
  categoryIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  amount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  checkedBox: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  checkmark: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  merchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    marginTop: SPACING.sm,
  },
  merchantIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginRight: SPACING.sm,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  merchantLocation: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  paymentIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginRight: SPACING.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  paymentDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  paymentBrand: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
  },
  securityContainer: {
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  securityTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.xs,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  securityIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  securityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    flex: 1,
  },
  verificationBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  feesContainer: {
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  feesTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.xs,
  },
  feesBreakdown: {
    gap: SPACING.xs,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalFeeItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  feeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  feeAmount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[900],
  },
  totalFeeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  totalFeeAmount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error[600],
  },
  detailsContainer: {
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    gap: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  actionsContainer: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    marginTop: SPACING.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  supportButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  supportText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    textDecorationLine: 'underline',
  },
  statusBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default TransactionCard;
