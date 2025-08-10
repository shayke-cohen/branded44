/**
 * Finance Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all finance-related block components with their TypeScript definitions.
 * These components are optimized for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === TRANSACTION COMPONENTS ===

export { default as TransactionCard } from './TransactionCard';
export type { 
  TransactionCardProps,
  TransactionData,
  PaymentMethod,
  MerchantInfo,
  TransactionFees,
  SecurityInfo,
  TransactionType,
  TransactionStatus,
  TransactionCategory
} from './TransactionCard';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { formatDate, formatCurrency, cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Finance Blocks
 * 
 * Quick Selection Guide:
 * - TransactionCard: Financial transaction display, payment history, banking
 * 
 * Common Implementation Patterns:
 * 
 * 1. Transaction History:
 * ```tsx
 * <TransactionCard
 *   transaction={transactionData}
 *   showDetails={true}
 *   showActions={true}
 *   onPress={handleTransactionPress}
 *   onReceiptPress={handleReceiptPress}
 * />
 * ```
 * 
 * 2. Payment Processing:
 * ```tsx
 * <TransactionCard
 *   transaction={paymentData}
 *   showSecurity={true}
 *   showFees={true}
 *   onDisputePress={handleDispute}
 *   onRefundPress={handleRefund}
 * />
 * ```
 * 
 * 3. Banking Interface:
 * ```tsx
 * <TransactionCard
 *   transaction={bankTransaction}
 *   selectable={true}
 *   selected={isSelected}
 *   onMerchantPress={handleMerchantPress}
 *   onPaymentMethodPress={handlePaymentMethod}
 * />
 * ```
 * 
 * Performance Tips:
 * - Cache transaction data for offline viewing
 * - Implement efficient search and filtering
 * - Use appropriate formatting for currencies
 * - Optimize for large transaction lists
 * 
 * Accessibility Features:
 * - Screen reader support for transaction amounts
 * - Clear status indicators for visually impaired
 * - Voice commands for transaction actions
 * - High contrast mode for financial data
 */
