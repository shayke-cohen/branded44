/**
 * SubscriptionCard - Plan Details with Upgrade/Cancel Block Component
 * 
 * A comprehensive subscription management card with plan details,
 * billing information, and upgrade/cancel actions. Optimized for AI agents.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { Separator } from '../../../../~/components/ui/separator';
import { Text } from '../../../../~/components/ui/text';
import { Progress } from '../../../../~/components/ui/progress';
import { cn, formatCurrency, formatDate } from '../../../lib/utils';
import { LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Crown, Calendar, CreditCard, Package, Zap, Users, Shield } from 'lucide-react-native';

/**
 * Subscription plan interface
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits?: {
    [key: string]: number | string;
  };
  popular?: boolean;
}

/**
 * Subscription data interface
 */
export interface SubscriptionData {
  id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd?: boolean;
  usage?: {
    [key: string]: {
      used: number;
      limit: number;
      label: string;
    };
  };
  paymentMethod?: {
    type: 'card' | 'paypal' | 'bank';
    last4?: string;
    brand?: string;
  };
}

/**
 * Props interface for SubscriptionCard component
 */
export interface SubscriptionCardProps {
  /**
   * Current subscription data
   */
  subscription?: SubscriptionData;
  
  /**
   * Available plans for upgrade/downgrade
   */
  availablePlans?: SubscriptionPlan[];
  
  /**
   * Callback when plan is changed
   */
  onPlanChange?: (planId: string) => Promise<void>;
  
  /**
   * Callback when subscription is canceled
   */
  onCancel?: () => Promise<void>;
  
  /**
   * Callback when subscription is reactivated
   */
  onReactivate?: () => Promise<void>;
  
  /**
   * Callback to update payment method
   */
  onUpdatePayment?: () => void;
  
  /**
   * Callback to view billing history
   */
  onViewBilling?: () => void;
  
  /**
   * Current loading state
   */
  loading?: LoadingState;
  
  /**
   * Custom styling for the container
   */
  style?: any;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Test identifier for automated testing
   */
  testID?: string;
  
  /**
   * Whether to show usage information
   */
  showUsage?: boolean;
  
  /**
   * Whether to show upgrade options
   */
  showUpgradeOptions?: boolean;
}

/**
 * SubscriptionCard Component
 * 
 * Provides comprehensive subscription management with:
 * - Current plan details and status
 * - Usage tracking and limits
 * - Billing information
 * - Plan upgrade/downgrade options
 * - Cancellation and reactivation
 * 
 * @example
 * ```tsx
 * <SubscriptionCard
 *   subscription={userSubscription}
 *   availablePlans={availablePlans}
 *   onPlanChange={handlePlanChange}
 *   onCancel={handleCancel}
 *   onUpdatePayment={handleUpdatePayment}
 *   showUsage={true}
 *   showUpgradeOptions={true}
 * />
 * ```
 */
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  availablePlans = [],
  onPlanChange,
  onCancel,
  onReactivate,
  onUpdatePayment,
  onViewBilling,
  loading = 'idle',
  style,
  className,
  testID = 'subscription-card',
  showUsage = true,
  showUpgradeOptions = true,
}) => {
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const isLoading = loading === 'loading';
  const isFreePlan = !subscription || subscription.plan.price === 0;

  /**
   * Handles plan change with confirmation
   */
  const handlePlanChange = async (planId: string) => {
    if (!onPlanChange) return;

    const newPlan = availablePlans.find(p => p.id === planId);
    if (!newPlan) return;

    const isUpgrade = newPlan.price > (subscription?.plan.price || 0);
    const actionText = isUpgrade ? 'upgrade to' : 'downgrade to';

    Alert.alert(
      `${isUpgrade ? 'Upgrade' : 'Downgrade'} Plan`,
      `Are you sure you want to ${actionText} ${newPlan.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setChangingPlan(planId);
            try {
              await onPlanChange(planId);
            } catch (error) {
              Alert.alert('Error', 'Failed to change plan. Please try again.');
            } finally {
              setChangingPlan(null);
            }
          },
        },
      ]
    );
  };

  /**
   * Handles subscription cancellation
   */
  const handleCancel = async () => {
    if (!onCancel) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You can continue using the service until the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setCanceling(true);
            try {
              await onCancel();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Gets status badge configuration
   */
  const getStatusBadge = () => {
    if (!subscription) return null;

    switch (subscription.status) {
      case 'active':
        return { variant: 'default' as const, text: 'Active', color: COLORS.success[600] };
      case 'trialing':
        return { variant: 'secondary' as const, text: 'Trial', color: COLORS.info[600] };
      case 'canceled':
        return { variant: 'secondary' as const, text: 'Canceled', color: COLORS.warning[600] };
      case 'past_due':
        return { variant: 'secondary' as const, text: 'Past Due', color: COLORS.error[600] };
      case 'paused':
        return { variant: 'secondary' as const, text: 'Paused', color: COLORS.neutral[600] };
      default:
        return { variant: 'secondary' as const, text: subscription.status, color: COLORS.neutral[600] };
    }
  };

  /**
   * Gets plan icon based on plan name/type
   */
  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) {
      return <Crown size={20} color={COLORS.warning[500]} />;
    }
    if (name.includes('team') || name.includes('business')) {
      return <Users size={20} color={COLORS.primary[600]} />;
    }
    if (name.includes('enterprise')) {
      return <Shield size={20} color={COLORS.neutral[700]} />;
    }
    return <Package size={20} color={COLORS.neutral[500]} />;
  };

  /**
   * Calculates usage percentage
   */
  const getUsagePercentage = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const statusBadge = getStatusBadge();

  // Free plan or no subscription
  if (isFreePlan) {
    return (
      <Card
        style={[{ borderColor: COLORS.primary[200] }, style]}
        className={cn('subscription-card', className)}
        testID={testID}
      >
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
            <Package size={24} color={COLORS.neutral[500]} />
            <View style={{ flex: 1 }}>
              <CardTitle>Free Plan</CardTitle>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                Get started with basic features
              </Text>
            </View>
            <Badge variant="secondary">
              <Text>Free</Text>
            </Badge>
          </View>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.md }}>
          <Text style={{ 
            fontSize: TYPOGRAPHY.fontSize.sm, 
            color: COLORS.neutral[600],
            lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm
          }}>
            Upgrade to unlock premium features, increased limits, and priority support.
          </Text>

          {showUpgradeOptions && availablePlans.length > 0 && (
            <View style={{ gap: SPACING.sm }}>
              {availablePlans.slice(0, 2).map((plan) => (
                <Button
                  key={plan.id}
                  variant={plan.popular ? "default" : "outline"}
                  onPress={() => handlePlanChange(plan.id)}
                  disabled={changingPlan === plan.id || isLoading}
                  style={{ justifyContent: 'space-between' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    {getPlanIcon(plan.name)}
                    <Text>{plan.name}</Text>
                    {plan.popular && (
                      <Badge variant="secondary">
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>Popular</Text>
                      </Badge>
                    )}
                  </View>
                  <Text style={{ fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
                    {formatCurrency(plan.price, plan.currency)}/{plan.interval === 'monthly' ? 'mo' : 'yr'}
                  </Text>
                </Button>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
    );
  }

  // Active subscription
  return (
    <Card
      style={[{ borderColor: COLORS.primary[200] }, style]}
      className={cn('subscription-card', className)}
      testID={testID}
    >
      <CardHeader>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          {getPlanIcon(subscription.plan.name)}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <CardTitle>{subscription.plan.name}</CardTitle>
              {statusBadge && (
                <Badge variant={statusBadge.variant}>
                  <Text style={{ color: statusBadge.color }}>{statusBadge.text}</Text>
                </Badge>
              )}
            </View>
            <Text style={{ 
              fontSize: TYPOGRAPHY.fontSize.lg, 
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.primary[600]
            }}>
              {formatCurrency(subscription.plan.price, subscription.plan.currency)}
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                /{subscription.plan.interval === 'monthly' ? 'month' : 'year'}
              </Text>
            </Text>
          </View>
        </View>
      </CardHeader>

      <CardContent style={{ gap: SPACING.section }}>
        {/* Billing Information */}
        <View style={{ gap: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Calendar size={16} color={COLORS.neutral[500]} />
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
              {subscription.status === 'trialing' && subscription.trialEnd
                ? `Trial ends ${formatDate(subscription.trialEnd, 'short')}`
                : subscription.cancelAtPeriodEnd
                ? `Cancels ${formatDate(subscription.currentPeriodEnd, 'short')}`
                : `Renews ${formatDate(subscription.currentPeriodEnd, 'short')}`
              }
            </Text>
          </View>

          {subscription.paymentMethod && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <CreditCard size={16} color={COLORS.neutral[500]} />
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
              </Text>
              {onUpdatePayment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={onUpdatePayment}
                  style={{ marginLeft: 'auto', minHeight: 28 }}
                >
                  <Text style={{ color: COLORS.primary[600], fontSize: TYPOGRAPHY.fontSize.sm }}>
                    Update
                  </Text>
                </Button>
              )}
            </View>
          )}
        </View>

        {/* Usage Information */}
        {showUsage && subscription.usage && Object.keys(subscription.usage).length > 0 && (
          <View style={{ gap: SPACING.md }}>
            <Text style={{ 
              fontSize: TYPOGRAPHY.fontSize.base, 
              fontWeight: TYPOGRAPHY.fontWeight.semibold 
            }}>
              Usage This Period
            </Text>
            
            {Object.entries(subscription.usage).map(([key, usage]) => (
              <View key={key} style={{ gap: SPACING.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                    {usage.label}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                    {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
                  </Text>
                </View>
                <Progress 
                  value={getUsagePercentage(usage.used, usage.limit)} 
                  style={{ height: 6 }}
                />
              </View>
            ))}
          </View>
        )}

        <Separator />

        {/* Plan Features */}
        <View style={{ gap: SPACING.md }}>
          <Text style={{ 
            fontSize: TYPOGRAPHY.fontSize.base, 
            fontWeight: TYPOGRAPHY.fontWeight.semibold 
          }}>
            Plan Features
          </Text>
          
          <View style={{ gap: SPACING.sm }}>
            {subscription.plan.features.slice(0, 4).map((feature, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Zap size={14} color={COLORS.success[600]} />
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[700] }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Separator />

        {/* Actions */}
        <View style={{ gap: SPACING.md }}>
          {/* Upgrade Options */}
          {showUpgradeOptions && availablePlans.length > 0 && (
            <View style={{ gap: SPACING.sm }}>
              {availablePlans
                .filter(plan => plan.price > subscription.plan.price)
                .slice(0, 1)
                .map((plan) => (
                  <Button
                    key={plan.id}
                    variant="default"
                    onPress={() => handlePlanChange(plan.id)}
                    disabled={changingPlan === plan.id || isLoading}
                  >
                    <Text>
                      {changingPlan === plan.id 
                        ? 'Upgrading...' 
                        : `Upgrade to ${plan.name}`
                      }
                    </Text>
                  </Button>
                ))}
            </View>
          )}

          {/* Management Actions */}
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            {onViewBilling && (
              <Button
                variant="outline"
                onPress={onViewBilling}
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                <Text>Billing History</Text>
              </Button>
            )}

            {subscription.status === 'canceled' && subscription.cancelAtPeriodEnd && onReactivate ? (
              <Button
                variant="default"
                onPress={onReactivate}
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                <Text>Reactivate</Text>
              </Button>
            ) : onCancel && subscription.status === 'active' && (
              <Button
                variant="outline"
                onPress={handleCancel}
                style={{ flex: 1 }}
                disabled={canceling || isLoading}
              >
                <Text style={{ color: COLORS.error[600] }}>
                  {canceling ? 'Canceling...' : 'Cancel Plan'}
                </Text>
              </Button>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
