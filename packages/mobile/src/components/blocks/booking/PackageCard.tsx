/**
 * PackageCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive package display card for service bundles and memberships.
 * Features package details, savings calculation, and subscription management.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Progress } from '../../../../~/components/ui/progress';
import { Separator } from '../../../../~/components/ui/separator';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Package types
 */
export type PackageType = 'session_bundle' | 'membership' | 'subscription' | 'unlimited' | 'trial';

/**
 * Package status
 */
export type PackageStatus = 'active' | 'inactive' | 'expired' | 'cancelled' | 'pending';

/**
 * Billing cycle for recurring packages
 */
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'one_time';

/**
 * Package pricing structure
 */
export interface PackagePricing {
  /** Package price */
  price: number;
  /** Original/individual price for comparison */
  originalPrice: number;
  /** Currency code */
  currency: string;
  /** Billing cycle */
  billingCycle: BillingCycle;
  /** Setup fee */
  setupFee?: number;
  /** Trial period */
  trialPeriod?: {
    duration: number;
    unit: 'days' | 'weeks' | 'months';
    price: number;
  };
  /** Auto-renewal */
  autoRenewal: boolean;
  /** Price per session (calculated) */
  pricePerSession?: number;
}

/**
 * Package usage tracking
 */
export interface PackageUsage {
  /** Sessions included */
  totalSessions: number;
  /** Sessions used */
  usedSessions: number;
  /** Sessions remaining */
  remainingSessions: number;
  /** Rollover allowed */
  allowRollover: boolean;
  /** Expiration date */
  expiresAt?: Date;
  /** Last used date */
  lastUsed?: Date;
  /** Usage history */
  recentUsage: Array<{
    date: Date;
    service: string;
    provider: string;
  }>;
}

/**
 * Package benefits and features
 */
export interface PackageBenefit {
  /** Benefit identifier */
  id: string;
  /** Benefit title */
  title: string;
  /** Benefit description */
  description: string;
  /** Benefit icon */
  icon?: string;
  /** Whether included in package */
  included: boolean;
  /** Additional cost if not included */
  additionalCost?: number;
}

/**
 * Package restrictions and terms
 */
export interface PackageRestrictions {
  /** Valid days of week */
  validDays?: number[];
  /** Valid times */
  validTimes?: {
    start: string;
    end: string;
  };
  /** Blackout dates */
  blackoutDates?: Date[];
  /** Booking advance notice */
  advanceBooking?: {
    min: number;
    max: number;
    unit: 'hours' | 'days';
  };
  /** Cancellation policy */
  cancellationPolicy: string;
  /** Transfer restrictions */
  transferable: boolean;
  /** Sharing allowed */
  shareable: boolean;
}

/**
 * Service provider information
 */
export interface PackageProvider {
  /** Provider identifier */
  id: string;
  /** Provider name */
  name: string;
  /** Provider image */
  image?: string;
  /** Provider rating */
  rating: number;
  /** Number of locations */
  locationCount: number;
  /** Available services */
  serviceCount: number;
}

/**
 * Main package data
 */
export interface ServicePackage {
  /** Package identifier */
  id: string;
  /** Package name */
  name: string;
  /** Package description */
  description: string;
  /** Package type */
  type: PackageType;
  /** Package status */
  status: PackageStatus;
  /** Package image */
  image?: string;
  /** Package pricing */
  pricing: PackagePricing;
  /** Package usage (if active) */
  usage?: PackageUsage;
  /** Package benefits */
  benefits: PackageBenefit[];
  /** Package restrictions */
  restrictions: PackageRestrictions;
  /** Service provider */
  provider: PackageProvider;
  /** Package popularity */
  popularity?: {
    rank: number;
    salesCount: number;
    rating: number;
    reviewCount: number;
  };
  /** Package tags */
  tags: string[];
  /** Featured package */
  featured?: boolean;
  /** Best value indicator */
  bestValue?: boolean;
  /** Limited time offer */
  limitedTime?: {
    endsAt: Date;
    reason: string;
  };
  /** Package created date */
  createdAt: Date;
  /** Last updated date */
  updatedAt: Date;
}

/**
 * Package comparison data
 */
export interface PackageComparison {
  /** Total savings amount */
  totalSavings: number;
  /** Savings percentage */
  savingsPercentage: number;
  /** Cost per session */
  costPerSession: number;
  /** Individual session price */
  individualSessionPrice: number;
  /** Break-even point */
  breakEvenSessions: number;
}

/**
 * Package action configuration
 */
export interface PackageAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: string;
  /** Action press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  /** Whether action is loading */
  loading?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * PackageCard component props
 */
export interface PackageCardProps {
  /** Package data to display */
  package: ServicePackage;
  /** Package comparison data */
  comparison?: PackageComparison;
  /** Card press handler */
  onPress?: () => void;
  /** Purchase package handler */
  onPurchase?: () => void;
  /** View package details handler */
  onViewDetails?: () => void;
  /** Manage package handler (for active packages) */
  onManage?: () => void;
  /** Cancel package handler */
  onCancel?: () => void;
  /** Renew package handler */
  onRenew?: () => void;
  /** Gift package handler */
  onGift?: () => void;
  /** Share package handler */
  onShare?: () => void;
  /** Custom action buttons */
  actions?: PackageAction[];
  /** Card layout variant */
  layout?: 'compact' | 'standard' | 'detailed' | 'comparison';
  /** Whether to show usage tracking */
  showUsage?: boolean;
  /** Whether to show benefits */
  showBenefits?: boolean;
  /** Whether to show restrictions */
  showRestrictions?: boolean;
  /** Whether to show comparison data */
  showComparison?: boolean;
  /** Whether card is loading */
  loading?: boolean;
  /** Custom card width */
  width?: number;
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
 * Calculate savings
 */
const calculateSavings = (packagePrice: number, originalPrice: number): {
  savings: number;
  percentage: number;
} => {
  const savings = originalPrice - packagePrice;
  const percentage = (savings / originalPrice) * 100;
  return { savings, percentage };
};

/**
 * Format billing cycle
 */
const formatBillingCycle = (cycle: BillingCycle): string => {
  const cycles: Record<BillingCycle, string> = {
    weekly: 'per week',
    monthly: 'per month',
    quarterly: 'per quarter',
    annually: 'per year',
    one_time: 'one-time',
  };
  return cycles[cycle];
};

/**
 * Get package type color
 */
const getPackageTypeColor = (type: PackageType): string => {
  const colors: Record<PackageType, string> = {
    session_bundle: COLORS.blue[500],
    membership: COLORS.purple[500],
    subscription: COLORS.green[500],
    unlimited: COLORS.yellow[500],
    trial: COLORS.orange[500],
  };
  return colors[type];
};

/**
 * Get status color
 */
const getStatusColor = (status: PackageStatus): string => {
  const colors: Record<PackageStatus, string> = {
    active: COLORS.success[500],
    inactive: COLORS.gray[400],
    expired: COLORS.error[500],
    cancelled: COLORS.red[600],
    pending: COLORS.yellow[500],
  };
  return colors[status];
};

/**
 * Calculate usage percentage
 */
const calculateUsagePercentage = (used: number, total: number): number => {
  return (used / total) * 100;
};

// === COMPONENT ===

/**
 * PackageCard - Display service packages and memberships
 * 
 * @example
 * ```tsx
 * const package = {
 *   id: 'pkg_123',
 *   name: '10-Session Yoga Package',
 *   description: 'Flexible yoga sessions with any instructor',
 *   type: 'session_bundle',
 *   status: 'active',
 *   pricing: {
 *     price: 200,
 *     originalPrice: 250,
 *     currency: 'USD',
 *     billingCycle: 'one_time',
 *     autoRenewal: false,
 *     pricePerSession: 20
 *   },
 *   usage: {
 *     totalSessions: 10,
 *     usedSessions: 3,
 *     remainingSessions: 7,
 *     allowRollover: true,
 *     expiresAt: new Date('2024-06-15')
 *   },
 *   benefits: [
 *     {
 *       id: 'benefit_1',
 *       title: 'Flexible Scheduling',
 *       description: 'Book any available class',
 *       included: true
 *     }
 *   ],
 *   provider: {
 *     id: 'prov_456',
 *     name: 'ZenFlow Studio',
 *     rating: 4.8,
 *     locationCount: 3,
 *     serviceCount: 12
 *   }
 * };
 * 
 * <PackageCard
 *   package={package}
 *   onPress={() => navigateToPackage(package.id)}
 *   onPurchase={() => purchasePackage(package.id)}
 *   onManage={() => managePackage(package.id)}
 *   showUsage={true}
 *   showBenefits={true}
 *   showComparison={true}
 * />
 * ```
 */
export default function PackageCard({
  package: pkg,
  comparison,
  onPress,
  onPurchase,
  onViewDetails,
  onManage,
  onCancel,
  onRenew,
  onGift,
  onShare,
  actions = [],
  layout = 'standard',
  showUsage = true,
  showBenefits = true,
  showRestrictions = false,
  showComparison = true,
  loading = false,
  width,
  testID = 'package-card',
}: PackageCardProps) {
  
  // State
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [showRestrictionsDetail, setShowRestrictionsDetail] = useState(false);

  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" style={{ width }}>
        <View className="space-y-4">
          <View className="flex-row justify-between">
            <View className="h-6 bg-gray-200 rounded w-1/2" />
            <View className="h-6 bg-gray-200 rounded w-1/4" />
          </View>
          <View className="space-y-2">
            <View className="h-4 bg-gray-200 rounded w-full" />
            <View className="h-4 bg-gray-200 rounded w-3/4" />
          </View>
          <View className="h-12 bg-gray-200 rounded" />
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isDetailed = layout === 'detailed';
  const isComparison = layout === 'comparison';
  const isActive = pkg.status === 'active';
  const savings = calculateSavings(pkg.pricing.price, pkg.pricing.originalPrice);

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.8}>
      <Card className={cn(
        'overflow-hidden mb-4',
        isCompact ? 'p-3' : 'p-4',
        pkg.featured && 'border-yellow-300 bg-yellow-50',
        pkg.bestValue && 'border-green-300 bg-green-50'
      )} style={{ width }}>
        
        {/* Header Badges */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center space-x-2">
            <Badge 
              variant="secondary"
              style={{ backgroundColor: getPackageTypeColor(pkg.type) }}
            >
              <Text className="text-white text-xs font-medium capitalize">
                {pkg.type.replace('_', ' ')}
              </Text>
            </Badge>
            
            {pkg.featured && (
              <Badge variant="secondary" style={{ backgroundColor: COLORS.yellow[500] }}>
                <Text className="text-white text-xs font-medium">Featured</Text>
              </Badge>
            )}
            
            {pkg.bestValue && (
              <Badge variant="secondary" style={{ backgroundColor: COLORS.green[500] }}>
                <Text className="text-white text-xs font-medium">Best Value</Text>
              </Badge>
            )}
          </View>
          
          {isActive && (
            <Badge 
              variant="secondary"
              style={{ backgroundColor: getStatusColor(pkg.status) }}
            >
              <Text className="text-white text-xs font-medium capitalize">
                {pkg.status}
              </Text>
            </Badge>
          )}
        </View>

        {/* Package Info */}
        <View className="flex-row space-x-3 mb-4">
          {pkg.image && (
            <Image
              source={{ uri: pkg.image }}
              className={cn(isCompact ? 'w-16 h-16' : 'w-20 h-20', 'rounded-lg')}
              resizeMode="cover"
            />
          )}
          
          <View className="flex-1">
            <Text className={cn(
              'font-semibold text-gray-900 mb-1',
              isCompact ? 'text-sm' : 'text-base'
            )}>
              {pkg.name}
            </Text>
            
            <Text className={cn(
              'text-gray-600 mb-2',
              isCompact ? 'text-xs' : 'text-sm'
            )} numberOfLines={isCompact ? 1 : 2}>
              {pkg.description}
            </Text>
            
            {/* Provider Info */}
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 mr-3">
                📍 {pkg.provider.locationCount} location{pkg.provider.locationCount !== 1 ? 's' : ''}
              </Text>
              <Text className="text-xs text-gray-500 mr-3">
                ⭐ {pkg.provider.rating.toFixed(1)}
              </Text>
              <Text className="text-xs text-gray-500">
                {pkg.provider.serviceCount} services
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View className="mb-4">
          <View className="flex-row items-baseline justify-between mb-2">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {formatCurrency(pkg.pricing.price, pkg.pricing.currency)}
              </Text>
              <Text className="text-sm text-gray-600">
                {formatBillingCycle(pkg.pricing.billingCycle)}
              </Text>
            </View>
            
            {savings.savings > 0 && (
              <View className="items-end">
                <Text className="text-sm line-through text-gray-500">
                  {formatCurrency(pkg.pricing.originalPrice, pkg.pricing.currency)}
                </Text>
                <Text className="text-sm font-semibold text-green-600">
                  Save {formatCurrency(savings.savings, pkg.pricing.currency)} ({Math.round(savings.percentage)}%)
                </Text>
              </View>
            )}
          </View>
          
          {pkg.pricing.pricePerSession && (
            <Text className="text-sm text-gray-600">
              {formatCurrency(pkg.pricing.pricePerSession, pkg.pricing.currency)} per session
            </Text>
          )}
          
          {pkg.pricing.setupFee && (
            <Text className="text-xs text-gray-500">
              + {formatCurrency(pkg.pricing.setupFee, pkg.pricing.currency)} setup fee
            </Text>
          )}
        </View>

        {/* Usage Tracking (for active packages) */}
        {showUsage && pkg.usage && isActive && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-900">
                Session Usage
              </Text>
              <Text className="text-sm text-gray-600">
                {pkg.usage.usedSessions} of {pkg.usage.totalSessions} used
              </Text>
            </View>
            
            <Progress 
              value={calculateUsagePercentage(pkg.usage.usedSessions, pkg.usage.totalSessions)} 
              className="h-2 mb-2"
              style={{
                backgroundColor: COLORS.gray[200],
              }}
            />
            
            <View className="flex-row justify-between text-xs text-gray-500">
              <Text>{pkg.usage.remainingSessions} remaining</Text>
              {pkg.usage.expiresAt && (
                <Text>Expires {pkg.usage.expiresAt.toLocaleDateString()}</Text>
              )}
            </View>
            
            {pkg.usage.lastUsed && (
              <Text className="text-xs text-gray-500 mt-1">
                Last used: {pkg.usage.lastUsed.toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Limited Time Offer */}
        {pkg.limitedTime && new Date() < pkg.limitedTime.endsAt && (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-sm font-medium text-red-900 mb-1">
              🚨 Limited Time Offer
            </Text>
            <Text className="text-xs text-red-700">
              {pkg.limitedTime.reason} • Ends {pkg.limitedTime.endsAt.toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Benefits */}
        {showBenefits && pkg.benefits.length > 0 && !isCompact && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              What's Included
            </Text>
            
            <View className="space-y-1">
              {pkg.benefits.slice(0, showAllBenefits ? undefined : 3).map((benefit) => (
                <View key={benefit.id} className="flex-row items-start">
                  <Text className={cn(
                    'text-sm mr-2',
                    benefit.included ? 'text-green-600' : 'text-gray-400'
                  )}>
                    {benefit.included ? '✓' : '✗'}
                  </Text>
                  <View className="flex-1">
                    <Text className={cn(
                      'text-sm',
                      benefit.included ? 'text-gray-900' : 'text-gray-500'
                    )}>
                      {benefit.title}
                    </Text>
                    {benefit.description && (
                      <Text className="text-xs text-gray-500">
                        {benefit.description}
                      </Text>
                    )}
                    {!benefit.included && benefit.additionalCost && (
                      <Text className="text-xs text-orange-600">
                        +{formatCurrency(benefit.additionalCost, pkg.pricing.currency)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
              
              {pkg.benefits.length > 3 && !showAllBenefits && (
                <TouchableOpacity onPress={() => setShowAllBenefits(true)}>
                  <Text className="text-blue-600 text-sm font-medium">
                    View {pkg.benefits.length - 3} more benefits →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Restrictions */}
        {showRestrictions && !isCompact && (
          <View className="mb-4">
            <TouchableOpacity
              onPress={() => setShowRestrictionsDetail(!showRestrictionsDetail)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-sm font-medium text-gray-900">
                Terms & Restrictions
              </Text>
              <Text className="text-gray-400">
                {showRestrictionsDetail ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {showRestrictionsDetail && (
              <View className="mt-2 space-y-1">
                <Text className="text-xs text-gray-600">
                  • {pkg.restrictions.cancellationPolicy}
                </Text>
                <Text className="text-xs text-gray-600">
                  • {pkg.restrictions.transferable ? 'Transferable' : 'Non-transferable'}
                </Text>
                <Text className="text-xs text-gray-600">
                  • {pkg.restrictions.shareable ? 'Shareable' : 'Personal use only'}
                </Text>
                {pkg.restrictions.validDays && (
                  <Text className="text-xs text-gray-600">
                    • Valid on selected days only
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Comparison Data */}
        {showComparison && comparison && !isCompact && (
          <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-sm font-medium text-blue-900 mb-2">
              Value Comparison
            </Text>
            <View className="space-y-1">
              <View className="flex-row justify-between">
                <Text className="text-xs text-blue-700">Cost per session</Text>
                <Text className="text-xs font-medium text-blue-900">
                  {formatCurrency(comparison.costPerSession, pkg.pricing.currency)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-blue-700">Individual price</Text>
                <Text className="text-xs text-blue-700">
                  {formatCurrency(comparison.individualSessionPrice, pkg.pricing.currency)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-blue-700">Break-even point</Text>
                <Text className="text-xs font-medium text-blue-900">
                  {comparison.breakEvenSessions} sessions
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Popularity */}
        {pkg.popularity && !isCompact && (
          <View className="mb-4 flex-row items-center space-x-4">
            <Text className="text-xs text-gray-500">
              🔥 #{pkg.popularity.rank} most popular
            </Text>
            <Text className="text-xs text-gray-500">
              {pkg.popularity.salesCount} sold
            </Text>
            {pkg.popularity.reviewCount > 0 && (
              <Text className="text-xs text-gray-500">
                ⭐ {pkg.popularity.rating.toFixed(1)} ({pkg.popularity.reviewCount})
              </Text>
            )}
          </View>
        )}

        <Separator className="my-4" />

        {/* Action Buttons */}
        <View className="space-y-2">
          {isActive ? (
            <View className="flex-row space-x-2">
              {onManage && (
                <Button
                  onPress={onManage}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Text className="text-white font-medium">Manage Package</Text>
                </Button>
              )}
              
              {onRenew && pkg.pricing.billingCycle !== 'one_time' && (
                <Button
                  onPress={onRenew}
                  variant="outline"
                  className="flex-1"
                >
                  <Text className="text-gray-700 font-medium">Renew</Text>
                </Button>
              )}
            </View>
          ) : (
            <Button
              onPress={onPurchase}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Text className="text-white font-medium text-lg">
                {pkg.pricing.billingCycle === 'one_time' ? 'Purchase Package' : 'Start Subscription'}
              </Text>
            </Button>
          )}
          
          {/* Secondary Actions */}
          <View className="flex-row space-x-2">
            {onViewDetails && (
              <Button
                onPress={onViewDetails}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Text className="text-gray-700 font-medium">Details</Text>
              </Button>
            )}
            
            {onGift && !isActive && (
              <Button
                onPress={onGift}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Text className="text-gray-700 font-medium">🎁 Gift</Text>
              </Button>
            )}
            
            {onShare && (
              <Button
                onPress={onShare}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Text className="text-gray-700 font-medium">📤 Share</Text>
              </Button>
            )}
          </View>
          
          {/* Cancel Button for Active */}
          {isActive && onCancel && (
            <Button
              onPress={onCancel}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Text className="text-white font-medium">Cancel Package</Text>
            </Button>
          )}
        </View>

        {/* Custom Actions */}
        {actions.length > 0 && (
          <View className="mt-3 space-y-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                onPress={action.onPress}
                variant={action.variant || 'outline'}
                disabled={action.disabled}
                size="sm"
              >
                <Text className={cn(
                  'font-medium text-sm',
                  action.variant === 'outline' ? 'text-gray-700' : 'text-white'
                )}>
                  {action.icon && `${action.icon} `}{action.label}
                </Text>
              </Button>
            ))}
          </View>
        )}

        {/* Trial Period */}
        {pkg.pricing.trialPeriod && !isActive && (
          <View className="mt-4 p-2 bg-green-50 border border-green-200 rounded">
            <Text className="text-xs text-green-700 font-medium">
              🎯 Try free for {pkg.pricing.trialPeriod.duration} {pkg.pricing.trialPeriod.unit}
              {pkg.pricing.trialPeriod.price > 0 && 
                ` (then ${formatCurrency(pkg.pricing.trialPeriod.price, pkg.pricing.currency)})`
              }
            </Text>
          </View>
        )}

        {/* Package Tags */}
        {pkg.tags.length > 0 && !isCompact && (
          <View className="mt-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {pkg.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-full"
                  >
                    <Text className="text-xs text-gray-600">
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  PackageCardProps,
  ServicePackage,
  PackageType,
  PackageStatus,
  BillingCycle,
  PackagePricing,
  PackageUsage,
  PackageBenefit,
  PackageRestrictions,
  PackageProvider,
  PackageComparison,
  PackageAction,
};
