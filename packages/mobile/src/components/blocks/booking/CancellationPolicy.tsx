/**
 * CancellationPolicy Component - AI-Optimized React Native Component
 * 
 * A comprehensive cancellation policy display and management component.
 * Features policy details, fee calculations, and cancellation actions.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Separator } from '../../../../~/components/ui/separator';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Cancellation fee types
 */
export type CancellationFeeType = 'none' | 'fixed' | 'percentage' | 'full_charge' | 'sliding_scale';

/**
 * Cancellation time windows
 */
export type CancellationWindow = 'immediate' | 'same_day' | 'hours_before' | 'days_before' | 'weeks_before';

/**
 * Refund processing methods
 */
export type RefundMethod = 'original_payment' | 'store_credit' | 'bank_transfer' | 'cash' | 'no_refund';

/**
 * Policy severity levels
 */
export type PolicySeverity = 'flexible' | 'moderate' | 'strict' | 'no_refund';

/**
 * Cancellation fee structure
 */
export interface CancellationFee {
  /** Fee type */
  type: CancellationFeeType;
  /** Fixed amount (if type is 'fixed') */
  amount?: number;
  /** Percentage (if type is 'percentage') */
  percentage?: number;
  /** Currency code */
  currency?: string;
  /** Minimum fee */
  minimumFee?: number;
  /** Maximum fee */
  maximumFee?: number;
}

/**
 * Time-based cancellation rule
 */
export interface CancellationRule {
  /** Rule identifier */
  id: string;
  /** Time window before appointment */
  windowType: CancellationWindow;
  /** Specific hours/days before */
  timeBeforeHours?: number;
  /** Fee structure for this window */
  fee: CancellationFee;
  /** Refund method */
  refundMethod: RefundMethod;
  /** Rule description */
  description: string;
  /** Whether rule allows reschedule instead */
  allowReschedule?: boolean;
  /** Reschedule fee (if different from cancellation) */
  rescheduleFee?: CancellationFee;
}

/**
 * Special circumstances and exceptions
 */
export interface PolicyException {
  /** Exception identifier */
  id: string;
  /** Exception type */
  type: 'emergency' | 'illness' | 'weather' | 'provider_cancellation' | 'technical_issue' | 'force_majeure';
  /** Exception description */
  description: string;
  /** Whether fee is waived */
  feeWaived: boolean;
  /** Required documentation */
  documentationRequired?: string[];
  /** Approval process */
  requiresApproval?: boolean;
}

/**
 * No-show policy
 */
export interface NoShowPolicy {
  /** No-show fee */
  fee: CancellationFee;
  /** Grace period in minutes */
  gracePeriodMinutes: number;
  /** Whether no-show affects future bookings */
  affectsFutureBookings: boolean;
  /** Number of no-shows before restrictions */
  maxNoShows?: number;
  /** Consequences of repeated no-shows */
  consequences: string[];
}

/**
 * Refund processing details
 */
export interface RefundProcessing {
  /** Processing time in business days */
  processingDays: number;
  /** Processing fee */
  processingFee?: CancellationFee;
  /** Supported refund methods */
  supportedMethods: RefundMethod[];
  /** Additional notes */
  notes?: string[];
}

/**
 * Main cancellation policy data
 */
export interface CancellationPolicy {
  /** Policy identifier */
  id: string;
  /** Service or provider this policy applies to */
  serviceId?: string;
  /** Provider identifier */
  providerId?: string;
  /** Policy name */
  name: string;
  /** Policy description */
  description: string;
  /** Policy severity level */
  severity: PolicySeverity;
  /** Cancellation rules by time window */
  rules: CancellationRule[];
  /** No-show policy */
  noShowPolicy: NoShowPolicy;
  /** Policy exceptions */
  exceptions: PolicyException[];
  /** Refund processing details */
  refundProcessing: RefundProcessing;
  /** Last updated date */
  lastUpdated: Date;
  /** Whether policy allows modifications */
  allowModifications: boolean;
  /** Contact information for disputes */
  disputeContact?: {
    email: string;
    phone?: string;
    hours: string;
  };
  /** Additional terms */
  additionalTerms: string[];
}

/**
 * Booking details for fee calculation
 */
export interface BookingDetails {
  /** Booking identifier */
  id: string;
  /** Appointment date and time */
  appointmentTime: Date;
  /** Service price */
  servicePrice: number;
  /** Currency code */
  currency: string;
  /** Booking date */
  bookingDate: Date;
  /** Payment method used */
  paymentMethod: string;
  /** Whether booking is part of package */
  isPackage?: boolean;
  /** Package details */
  packageDetails?: {
    totalSessions: number;
    usedSessions: number;
    packagePrice: number;
  };
}

/**
 * Cancellation fee calculation result
 */
export interface FeeCalculation {
  /** Applicable rule */
  rule: CancellationRule;
  /** Calculated fee amount */
  feeAmount: number;
  /** Refund amount */
  refundAmount: number;
  /** Currency */
  currency: string;
  /** Refund method */
  refundMethod: RefundMethod;
  /** Processing time */
  processingDays: number;
  /** Whether reschedule is allowed */
  canReschedule: boolean;
  /** Reschedule fee amount */
  rescheduleFeeAmount?: number;
}

/**
 * CancellationPolicy component props
 */
export interface CancellationPolicyProps {
  /** Policy data to display */
  policy: CancellationPolicy;
  /** Booking details for fee calculation */
  bookingDetails?: BookingDetails;
  /** Cancel booking handler */
  onCancel?: (confirmed: boolean) => void;
  /** Reschedule booking handler */
  onReschedule?: () => void;
  /** View full terms handler */
  onViewFullTerms?: () => void;
  /** Contact support handler */
  onContactSupport?: () => void;
  /** Whether to show booking-specific calculations */
  showCalculations?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Whether to show policy details */
  showDetails?: boolean;
  /** Component layout variant */
  layout?: 'summary' | 'detailed' | 'calculator';
  /** Whether component is loading */
  loading?: boolean;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Calculate time until appointment
 */
const calculateTimeUntilAppointment = (appointmentTime: Date): {
  hours: number;
  days: number;
  text: string;
} => {
  const now = new Date();
  const diffMs = appointmentTime.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  let text = '';
  if (days > 0) {
    text = `${days} day${days > 1 ? 's' : ''} and ${hours % 24} hour${(hours % 24) > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    text = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    text = 'Less than 1 hour';
  }
  
  return { hours, days, text };
};

/**
 * Find applicable cancellation rule
 */
const findApplicableRule = (
  rules: CancellationRule[],
  hoursUntilAppointment: number
): CancellationRule | null => {
  // Sort rules by time requirement (most restrictive first)
  const sortedRules = [...rules].sort((a, b) => {
    const aHours = a.timeBeforeHours || 0;
    const bHours = b.timeBeforeHours || 0;
    return bHours - aHours;
  });
  
  for (const rule of sortedRules) {
    if (!rule.timeBeforeHours) continue;
    
    if (hoursUntilAppointment >= rule.timeBeforeHours) {
      return rule;
    }
  }
  
  // If no rule matches, return the most restrictive (immediate cancellation)
  return sortedRules[sortedRules.length - 1] || null;
};

/**
 * Calculate cancellation fee
 */
const calculateCancellationFee = (
  fee: CancellationFee,
  servicePrice: number
): number => {
  switch (fee.type) {
    case 'none':
      return 0;
    case 'fixed':
      return fee.amount || 0;
    case 'percentage':
      const percentageFee = (servicePrice * (fee.percentage || 0)) / 100;
      return Math.min(
        Math.max(percentageFee, fee.minimumFee || 0),
        fee.maximumFee || percentageFee
      );
    case 'full_charge':
      return servicePrice;
    default:
      return 0;
  }
};

/**
 * Get severity color
 */
const getSeverityColor = (severity: PolicySeverity): string => {
  const colors: Record<PolicySeverity, string> = {
    flexible: COLORS.success[500],
    moderate: COLORS.yellow[500],
    strict: COLORS.orange[500],
    no_refund: COLORS.error[500],
  };
  return colors[severity];
};

/**
 * Get severity description
 */
const getSeverityDescription = (severity: PolicySeverity): string => {
  const descriptions: Record<PolicySeverity, string> = {
    flexible: 'Generous cancellation terms with minimal fees',
    moderate: 'Balanced policy with reasonable notice requirements',
    strict: 'Requires advance notice with higher cancellation fees',
    no_refund: 'No refunds or very limited refund conditions',
  };
  return descriptions[severity];
};

// === COMPONENT ===

/**
 * CancellationPolicy - Display and manage cancellation terms
 * 
 * @example
 * ```tsx
 * const policy = {
 *   id: 'policy_123',
 *   name: 'Standard Cancellation Policy',
 *   description: 'Our flexible cancellation policy designed for your convenience',
 *   severity: 'moderate',
 *   rules: [
 *     {
 *       id: 'rule_1',
 *       windowType: 'hours_before',
 *       timeBeforeHours: 24,
 *       fee: { type: 'none' },
 *       refundMethod: 'original_payment',
 *       description: 'Free cancellation with 24+ hours notice'
 *     },
 *     {
 *       id: 'rule_2',
 *       windowType: 'same_day',
 *       timeBeforeHours: 2,
 *       fee: { type: 'percentage', percentage: 50 },
 *       refundMethod: 'store_credit',
 *       description: '50% fee for same-day cancellation'
 *     }
 *   ],
 *   noShowPolicy: {
 *     fee: { type: 'full_charge' },
 *     gracePeriodMinutes: 15,
 *     affectsFutureBookings: true
 *   }
 * };
 * 
 * const booking = {
 *   id: 'book_456',
 *   appointmentTime: new Date('2024-01-15T14:00:00'),
 *   servicePrice: 100,
 *   currency: 'USD',
 *   bookingDate: new Date('2024-01-10T10:00:00'),
 *   paymentMethod: 'credit_card'
 * };
 * 
 * <CancellationPolicy
 *   policy={policy}
 *   bookingDetails={booking}
 *   onCancel={(confirmed) => handleCancellation(confirmed)}
 *   onReschedule={() => navigateToReschedule()}
 *   showCalculations={true}
 *   showActions={true}
 * />
 * ```
 */
export default function CancellationPolicy({
  policy,
  bookingDetails,
  onCancel,
  onReschedule,
  onViewFullTerms,
  onContactSupport,
  showCalculations = true,
  showActions = true,
  showDetails = true,
  layout = 'detailed',
  loading = false,
  testID = 'cancellation-policy',
}: CancellationPolicyProps) {
  
  // State
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  
  // Calculate fee if booking details provided
  const feeCalculation: FeeCalculation | null = bookingDetails ? (() => {
    const timeUntil = calculateTimeUntilAppointment(bookingDetails.appointmentTime);
    const applicableRule = findApplicableRule(policy.rules, timeUntil.hours);
    
    if (!applicableRule) return null;
    
    const feeAmount = calculateCancellationFee(applicableRule.fee, bookingDetails.servicePrice);
    const refundAmount = bookingDetails.servicePrice - feeAmount;
    const rescheduleFeeAmount = applicableRule.rescheduleFee ? 
      calculateCancellationFee(applicableRule.rescheduleFee, bookingDetails.servicePrice) : feeAmount;
    
    return {
      rule: applicableRule,
      feeAmount,
      refundAmount,
      currency: bookingDetails.currency,
      refundMethod: applicableRule.refundMethod,
      processingDays: policy.refundProcessing.processingDays,
      canReschedule: applicableRule.allowReschedule || false,
      rescheduleFeeAmount,
    };
  })() : null;

  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" testID={testID}>
        <View className="space-y-4">
          <View className="h-6 bg-gray-200 rounded w-3/4" />
          <View className="h-4 bg-gray-200 rounded w-1/2" />
          <View className="space-y-2">
            <View className="h-3 bg-gray-200 rounded w-full" />
            <View className="h-3 bg-gray-200 rounded w-3/4" />
            <View className="h-3 bg-gray-200 rounded w-1/2" />
          </View>
        </View>
      </Card>
    );
  }

  const isSummary = layout === 'summary';
  const isCalculator = layout === 'calculator';

  return (
    <Card className="p-4" testID={testID}>
      
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">
          {policy.name}
        </Text>
        
        <Badge 
          variant="secondary"
          style={{ backgroundColor: getSeverityColor(policy.severity) }}
        >
          <Text className="text-white text-xs font-medium capitalize">
            {policy.severity.replace('_', ' ')}
          </Text>
        </Badge>
      </View>

      {/* Description */}
      <Text className="text-sm text-gray-600 mb-4">
        {policy.description}
      </Text>
      
      <Text className="text-xs text-gray-500 mb-4">
        {getSeverityDescription(policy.severity)}
      </Text>

      {/* Fee Calculation (if booking provided) */}
      {showCalculations && feeCalculation && bookingDetails && (
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Cancellation Impact
          </Text>
          
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-blue-900">
                Time until appointment:
              </Text>
              <Text className="text-sm font-medium text-blue-900">
                {calculateTimeUntilAppointment(bookingDetails.appointmentTime).text}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-blue-900">
                Applicable rule:
              </Text>
              <Text className="text-sm font-medium text-blue-900">
                {feeCalculation.rule.description}
              </Text>
            </View>
            
            <Separator className="my-3" />
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Service price</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatCurrency(bookingDetails.servicePrice, bookingDetails.currency)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Cancellation fee</Text>
                <Text className="text-sm font-medium text-red-600">
                  -{formatCurrency(feeCalculation.feeAmount, feeCalculation.currency)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-gray-900">Refund amount</Text>
                <Text className="text-base font-bold text-green-600">
                  {formatCurrency(feeCalculation.refundAmount, feeCalculation.currency)}
                </Text>
              </View>
            </View>
            
            <Separator className="my-3" />
            
            <View className="space-y-1">
              <Text className="text-xs text-blue-700">
                Refund method: {feeCalculation.refundMethod.replace('_', ' ')}
              </Text>
              <Text className="text-xs text-blue-700">
                Processing time: {feeCalculation.processingDays} business days
              </Text>
              {feeCalculation.canReschedule && (
                <Text className="text-xs text-blue-700">
                  Reschedule fee: {formatCurrency(feeCalculation.rescheduleFeeAmount || 0, feeCalculation.currency)}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Policy Rules */}
      {showDetails && !isSummary && (
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Cancellation Rules
          </Text>
          
          <View className="space-y-3">
            {policy.rules.map((rule) => (
              <View key={rule.id} className="p-3 bg-gray-50 rounded-lg">
                <Text className="text-sm font-medium text-gray-900 mb-1">
                  {rule.description}
                </Text>
                
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-600">
                    {rule.timeBeforeHours ? `${rule.timeBeforeHours}+ hours before` : 'Immediate'}
                  </Text>
                  
                  <View className="flex-row items-center space-x-2">
                    {rule.fee.type === 'none' ? (
                      <Badge variant="secondary" style={{ backgroundColor: COLORS.success[500] }}>
                        <Text className="text-white text-xs">Free</Text>
                      </Badge>
                    ) : (
                      <Badge variant="secondary" style={{ backgroundColor: COLORS.orange[500] }}>
                        <Text className="text-white text-xs">
                          {rule.fee.type === 'percentage' ? `${rule.fee.percentage}%` :
                           rule.fee.type === 'fixed' ? formatCurrency(rule.fee.amount || 0, rule.fee.currency || 'USD') :
                           'Full charge'}
                        </Text>
                      </Badge>
                    )}
                    
                    {rule.allowReschedule && (
                      <Badge variant="secondary" style={{ backgroundColor: COLORS.blue[500] }}>
                        <Text className="text-white text-xs">Reschedule OK</Text>
                      </Badge>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* No-Show Policy */}
      {showDetails && !isSummary && (
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            No-Show Policy
          </Text>
          
          <View className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-sm text-red-900 mb-2">
              <Text className="font-medium">Grace period:</Text> {policy.noShowPolicy.gracePeriodMinutes} minutes
            </Text>
            
            <Text className="text-sm text-red-900 mb-2">
              <Text className="font-medium">No-show fee:</Text>{' '}
              {policy.noShowPolicy.fee.type === 'full_charge' ? 'Full service price' :
               policy.noShowPolicy.fee.type === 'percentage' ? `${policy.noShowPolicy.fee.percentage}% of service price` :
               policy.noShowPolicy.fee.type === 'fixed' ? formatCurrency(policy.noShowPolicy.fee.amount || 0, policy.noShowPolicy.fee.currency || 'USD') :
               'No fee'}
            </Text>
            
            {policy.noShowPolicy.affectsFutureBookings && (
              <Text className="text-sm text-red-900">
                <Text className="font-medium">Impact:</Text> May affect future booking privileges
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Exceptions */}
      {showDetails && !isSummary && policy.exceptions.length > 0 && (
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Policy Exceptions
          </Text>
          
          <View className="space-y-2">
            {policy.exceptions.map((exception) => (
              <View key={exception.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <Text className="text-sm font-medium text-green-900 mb-1 capitalize">
                  {exception.type.replace('_', ' ')}
                </Text>
                <Text className="text-sm text-green-800">
                  {exception.description}
                </Text>
                {exception.feeWaived && (
                  <Badge variant="secondary" className="mt-2" style={{ backgroundColor: COLORS.success[500] }}>
                    <Text className="text-white text-xs">Fee waived</Text>
                  </Badge>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Toggle Full Policy */}
      {!showFullPolicy && policy.additionalTerms.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowFullPolicy(true)}
          className="mb-4"
        >
          <Text className="text-blue-600 text-sm font-medium">
            View complete terms and conditions →
          </Text>
        </TouchableOpacity>
      )}

      {/* Full Policy Terms */}
      {showFullPolicy && (
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Additional Terms
          </Text>
          
          <View className="space-y-2">
            {policy.additionalTerms.map((term, index) => (
              <Text key={index} className="text-sm text-gray-600">
                • {term}
              </Text>
            ))}
          </View>
          
          <TouchableOpacity
            onPress={() => setShowFullPolicy(false)}
            className="mt-3"
          >
            <Text className="text-blue-600 text-sm font-medium">
              ← Hide additional terms
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Checkbox */}
      {showActions && feeCalculation && (
        <View className="mb-4">
          <View className="flex-row items-start space-x-3">
            <Checkbox
              checked={confirmationChecked}
              onCheckedChange={setConfirmationChecked}
            />
            <Text className="text-sm text-gray-700 flex-1">
              I understand the cancellation policy and agree to the{' '}
              {feeCalculation.feeAmount > 0 ? (
                <Text className="font-medium text-red-600">
                  {formatCurrency(feeCalculation.feeAmount, feeCalculation.currency)} cancellation fee
                </Text>
              ) : (
                <Text className="font-medium text-green-600">no-fee cancellation</Text>
              )}
              {' '}for this booking.
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && (
        <View className="space-y-3">
          {feeCalculation?.canReschedule && onReschedule && (
            <Button
              onPress={onReschedule}
              variant="outline"
              className="w-full"
            >
              <Text className="text-gray-700 font-medium">
                Reschedule Instead ({formatCurrency(feeCalculation.rescheduleFeeAmount || 0, feeCalculation.currency)} fee)
              </Text>
            </Button>
          )}
          
          {onCancel && (
            <Button
              onPress={() => {
                if (feeCalculation && feeCalculation.feeAmount > 0 && !confirmationChecked) {
                  Alert.alert(
                    'Confirmation Required',
                    'Please confirm that you understand the cancellation policy before proceeding.'
                  );
                  return;
                }
                onCancel(confirmationChecked);
              }}
              variant="destructive"
              className="w-full"
            >
              <Text className="text-white font-medium">
                Cancel Booking
                {feeCalculation && feeCalculation.feeAmount > 0 && 
                  ` (${formatCurrency(feeCalculation.feeAmount, feeCalculation.currency)} fee)`
                }
              </Text>
            </Button>
          )}
        </View>
      )}

      {/* Support Contact */}
      {policy.disputeContact && (
        <View className="mt-6 pt-4 border-t border-gray-200">
          <Text className="text-sm font-medium text-gray-900 mb-2">
            Questions about this policy?
          </Text>
          <TouchableOpacity onPress={onContactSupport}>
            <Text className="text-blue-600 text-sm">
              Contact support: {policy.disputeContact.email}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 mt-1">
            Available {policy.disputeContact.hours}
          </Text>
        </View>
      )}

      {/* Last Updated */}
      <Text className="text-xs text-gray-400 text-center mt-4">
        Policy last updated: {policy.lastUpdated.toLocaleDateString()}
      </Text>
    </Card>
  );
}

// === EXPORTS ===

export type {
  CancellationPolicyProps,
  CancellationPolicy,
  CancellationFee,
  CancellationRule,
  PolicyException,
  NoShowPolicy,
  RefundProcessing,
  BookingDetails,
  FeeCalculation,
  CancellationFeeType,
  CancellationWindow,
  RefundMethod,
  PolicySeverity,
};
