/**
 * BookingSummary Component - AI-Optimized React Native Component
 * 
 * A comprehensive booking summary for service appointments.
 * Features confirmation details, pricing breakdown, and next steps.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar } from '../../../../~/components/ui/avatar';
import { Separator } from '../../../../~/components/ui/separator';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Booking status types
 */
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';

/**
 * Payment status types
 */
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partial';

/**
 * Service information
 */
export interface ServiceInfo {
  /** Service identifier */
  id: string;
  /** Service name */
  name: string;
  /** Service description */
  description: string;
  /** Service image */
  image?: string;
  /** Service duration in minutes */
  duration: number;
  /** Service category */
  category: string;
  /** Service location */
  location?: string;
  /** Location type */
  locationType: 'onsite' | 'remote' | 'hybrid';
}

/**
 * Provider information
 */
export interface ProviderInfo {
  /** Provider identifier */
  id: string;
  /** Provider name */
  name: string;
  /** Provider title/role */
  title: string;
  /** Provider image */
  image?: string;
  /** Provider rating */
  rating: number;
  /** Provider phone */
  phone?: string;
  /** Provider email */
  email?: string;
  /** Provider location */
  location?: string;
  /** Years of experience */
  experience?: number;
  /** Verification status */
  verified: boolean;
}

/**
 * Customer information
 */
export interface CustomerInfo {
  /** Customer name */
  name: string;
  /** Customer email */
  email: string;
  /** Customer phone */
  phone: string;
  /** Customer notes */
  notes?: string;
}

/**
 * Pricing breakdown
 */
export interface PricingBreakdown {
  /** Base service price */
  basePrice: number;
  /** Additional fees */
  fees: Array<{
    name: string;
    amount: number;
    description?: string;
  }>;
  /** Discounts applied */
  discounts: Array<{
    name: string;
    amount: number;
    type: 'percentage' | 'fixed';
    description?: string;
  }>;
  /** Tax amount */
  tax: number;
  /** Tax rate */
  taxRate: number;
  /** Total amount */
  total: number;
  /** Currency code */
  currency: string;
  /** Payment method */
  paymentMethod?: string;
  /** Payment status */
  paymentStatus: PaymentStatus;
}

/**
 * Booking policies
 */
export interface BookingPolicies {
  /** Cancellation policy */
  cancellation: {
    allowedUntil: Date;
    fee?: number;
    feeType?: 'percentage' | 'fixed';
    description: string;
  };
  /** Rescheduling policy */
  rescheduling: {
    allowedUntil: Date;
    fee?: number;
    feeType?: 'percentage' | 'fixed';
    description: string;
  };
  /** No-show policy */
  noShow: {
    fee: number;
    feeType: 'percentage' | 'fixed';
    description: string;
  };
}

/**
 * Booking reminder settings
 */
export interface ReminderSettings {
  /** Email reminders */
  email: boolean;
  /** SMS reminders */
  sms: boolean;
  /** Push notifications */
  push: boolean;
  /** Time before appointment (minutes) */
  timeBefore: number;
}

/**
 * Main booking data
 */
export interface BookingData {
  /** Booking identifier */
  id: string;
  /** Booking confirmation number */
  confirmationNumber: string;
  /** Booking status */
  status: BookingStatus;
  /** Booking date and time */
  dateTime: Date;
  /** Booking end time */
  endTime: Date;
  /** Service information */
  service: ServiceInfo;
  /** Provider information */
  provider: ProviderInfo;
  /** Customer information */
  customer: CustomerInfo;
  /** Pricing breakdown */
  pricing: PricingBreakdown;
  /** Booking policies */
  policies: BookingPolicies;
  /** Reminder settings */
  reminders: ReminderSettings;
  /** Booking created date */
  createdAt: Date;
  /** Last updated date */
  updatedAt: Date;
  /** Special instructions */
  instructions?: string;
  /** Meeting/call link for remote services */
  meetingLink?: string;
  /** Location details for onsite services */
  locationDetails?: string;
}

/**
 * Action button configuration
 */
export interface SummaryAction {
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
 * BookingSummary component props
 */
export interface BookingSummaryProps {
  /** Booking data to display */
  booking: BookingData;
  /** Modify booking handler */
  onModify?: () => void;
  /** Cancel booking handler */
  onCancel?: () => void;
  /** Reschedule booking handler */
  onReschedule?: () => void;
  /** Contact provider handler */
  onContactProvider?: () => void;
  /** View location handler */
  onViewLocation?: () => void;
  /** Add to calendar handler */
  onAddToCalendar?: () => void;
  /** Share booking handler */
  onShare?: () => void;
  /** Join meeting handler (for remote services) */
  onJoinMeeting?: () => void;
  /** Custom action buttons */
  actions?: SummaryAction[];
  /** Whether to show pricing breakdown */
  showPricing?: boolean;
  /** Whether to show policies */
  showPolicies?: boolean;
  /** Whether to show provider contact info */
  showProviderContact?: boolean;
  /** Whether to show booking actions */
  showActions?: boolean;
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
 * Format date and time
 */
const formatDateTime = (date: Date): string => {
  return date.toLocaleString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date only
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time only
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format duration
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Get status color
 */
const getStatusColor = (status: BookingStatus): string => {
  const colors: Record<BookingStatus, string> = {
    confirmed: COLORS.success[500],
    pending: COLORS.yellow[500],
    cancelled: COLORS.error[500],
    completed: COLORS.green[600],
    no_show: COLORS.gray[500],
  };
  return colors[status];
};

/**
 * Get payment status color
 */
const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors: Record<PaymentStatus, string> = {
    paid: COLORS.success[500],
    pending: COLORS.yellow[500],
    failed: COLORS.error[500],
    refunded: COLORS.blue[500],
    partial: COLORS.orange[500],
  };
  return colors[status];
};

/**
 * Calculate time until booking
 */
const getTimeUntilBooking = (bookingTime: Date): string => {
  const now = new Date();
  const diffMs = bookingTime.getTime() - now.getTime();
  
  if (diffMs < 0) {
    return 'Booking has passed';
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
};

// === COMPONENT ===

/**
 * BookingSummary - Complete booking confirmation and details
 * 
 * @example
 * ```tsx
 * const booking = {
 *   id: 'book_123',
 *   confirmationNumber: 'CNF-789456',
 *   status: 'confirmed',
 *   dateTime: new Date('2024-01-15T10:00:00'),
 *   endTime: new Date('2024-01-15T11:00:00'),
 *   service: {
 *     id: 'srv_123',
 *     name: 'Personal Training Session',
 *     duration: 60,
 *     category: 'Fitness'
 *   },
 *   provider: {
 *     id: 'prov_456',
 *     name: 'Sarah Johnson',
 *     title: 'Certified Personal Trainer',
 *     rating: 4.9,
 *     verified: true
 *   },
 *   customer: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     phone: '+1234567890'
 *   },
 *   pricing: {
 *     basePrice: 100,
 *     total: 108,
 *     currency: 'USD',
 *     paymentStatus: 'paid'
 *   }
 * };
 * 
 * <BookingSummary
 *   booking={booking}
 *   onModify={() => navigateToModify(booking.id)}
 *   onCancel={() => showCancelDialog(booking.id)}
 *   onContactProvider={() => contactProvider(booking.provider.id)}
 *   showPricing={true}
 *   showActions={true}
 * />
 * ```
 */
export default function BookingSummary({
  booking,
  onModify,
  onCancel,
  onReschedule,
  onContactProvider,
  onViewLocation,
  onAddToCalendar,
  onShare,
  onJoinMeeting,
  actions = [],
  showPricing = true,
  showPolicies = true,
  showProviderContact = true,
  showActions = true,
  loading = false,
  testID = 'booking-summary',
}: BookingSummaryProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" testID={testID}>
        <View className="space-y-4">
          <View className="h-6 bg-gray-200 rounded w-3/4" />
          <View className="h-4 bg-gray-200 rounded w-1/2" />
          <View className="h-20 bg-gray-200 rounded" />
          <View className="h-16 bg-gray-200 rounded" />
        </View>
      </Card>
    );
  }

  const timeUntil = getTimeUntilBooking(booking.dateTime);
  const canModify = booking.status === 'confirmed' || booking.status === 'pending';
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <ScrollView className="flex-1" testID={testID}>
      <Card className="p-4 m-4">
        
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-gray-900">
              Booking Confirmed
            </Text>
            <Badge 
              variant="secondary"
              style={{ backgroundColor: getStatusColor(booking.status) }}
            >
              <Text className="text-white text-sm font-medium capitalize">
                {booking.status.replace('_', ' ')}
              </Text>
            </Badge>
          </View>
          
          <Text className="text-lg text-gray-600 mb-1">
            Confirmation: {booking.confirmationNumber}
          </Text>
          
          {timeUntil !== 'Booking has passed' && (
            <Text className="text-sm text-blue-600 font-medium">
              ⏰ {timeUntil} from now
            </Text>
          )}
        </View>

        {/* Service Details */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Service Details
          </Text>
          
          <View className="flex-row space-x-3">
            {booking.service.image && (
              <Image
                source={{ uri: booking.service.image }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
            )}
            
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {booking.service.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-1">
                {booking.service.description}
              </Text>
              <Text className="text-sm text-gray-500">
                Duration: {formatDuration(booking.service.duration)}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Date & Time
          </Text>
          
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-lg font-semibold text-blue-900 mb-1">
              {formatDate(booking.dateTime)}
            </Text>
            <Text className="text-base text-blue-700 mb-2">
              {formatTime(booking.dateTime)} - {formatTime(booking.endTime)}
            </Text>
            
            {/* Location Info */}
            <View className="flex-row items-center">
              <Text className="text-sm text-blue-600 mr-1">
                {booking.service.locationType === 'remote' ? '🌐' : 
                 booking.service.locationType === 'hybrid' ? '🔄' : '📍'}
              </Text>
              <Text className="text-sm text-blue-600">
                {booking.service.locationType === 'remote' ? 'Online/Remote' :
                 booking.service.locationType === 'hybrid' ? 'Hybrid' :
                 booking.service.location || 'In-person'}
              </Text>
            </View>
            
            {/* Meeting Link for Remote */}
            {booking.service.locationType === 'remote' && booking.meetingLink && (
              <TouchableOpacity
                className="mt-2 p-2 bg-blue-100 rounded border border-blue-300"
                onPress={onJoinMeeting}
              >
                <Text className="text-sm text-blue-700 font-medium text-center">
                  📞 Join Meeting
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Location Details for Onsite */}
            {booking.service.locationType === 'onsite' && booking.locationDetails && (
              <Text className="text-sm text-blue-600 mt-1">
                {booking.locationDetails}
              </Text>
            )}
          </View>
        </View>

        {/* Provider Info */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Service Provider
          </Text>
          
          <View className="flex-row items-center space-x-3">
            <Avatar className="w-16 h-16">
              <Image
                source={{ uri: booking.provider.image || 'https://via.placeholder.com/64x64' }}
                className="w-full h-full rounded-full"
                alt={booking.provider.name}
              />
            </Avatar>
            
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-base font-semibold text-gray-900 mr-2">
                  {booking.provider.name}
                </Text>
                {booking.provider.verified && (
                  <Text className="text-sm">✅</Text>
                )}
              </View>
              
              <Text className="text-sm text-gray-600 mb-1">
                {booking.provider.title}
              </Text>
              
              <View className="flex-row items-center">
                <Text className="text-yellow-500 mr-1">⭐</Text>
                <Text className="text-sm text-gray-700 mr-3">
                  {booking.provider.rating.toFixed(1)}
                </Text>
                
                {booking.provider.experience && (
                  <Text className="text-sm text-gray-500">
                    {booking.provider.experience} years exp.
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          {/* Contact Provider */}
          {showProviderContact && (booking.provider.phone || booking.provider.email) && (
            <View className="flex-row space-x-2 mt-3">
              {booking.provider.phone && (
                <Button
                  onPress={onContactProvider}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Text className="text-gray-700 font-medium">📞 Call</Text>
                </Button>
              )}
              {booking.provider.email && (
                <Button
                  onPress={onContactProvider}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Text className="text-gray-700 font-medium">✉️ Email</Text>
                </Button>
              )}
            </View>
          )}
        </View>

        {/* Pricing Breakdown */}
        {showPricing && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Pricing Details
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Service Fee</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatCurrency(booking.pricing.basePrice, booking.pricing.currency)}
                </Text>
              </View>
              
              {/* Additional Fees */}
              {booking.pricing.fees.map((fee, index) => (
                <View key={index} className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">{fee.name}</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {formatCurrency(fee.amount, booking.pricing.currency)}
                  </Text>
                </View>
              ))}
              
              {/* Discounts */}
              {booking.pricing.discounts.map((discount, index) => (
                <View key={index} className="flex-row justify-between">
                  <Text className="text-sm text-green-600">{discount.name}</Text>
                  <Text className="text-sm font-medium text-green-600">
                    -{formatCurrency(discount.amount, booking.pricing.currency)}
                  </Text>
                </View>
              ))}
              
              {/* Tax */}
              {booking.pricing.tax > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">
                    Tax ({(booking.pricing.taxRate * 100).toFixed(1)}%)
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricing.tax, booking.pricing.currency)}
                  </Text>
                </View>
              )}
              
              <Separator className="my-2" />
              
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-gray-900">Total</Text>
                <Text className="text-base font-bold text-gray-900">
                  {formatCurrency(booking.pricing.total, booking.pricing.currency)}
                </Text>
              </View>
            </View>
            
            {/* Payment Status */}
            <View className="flex-row items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm font-medium text-gray-700">Payment Status</Text>
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getPaymentStatusColor(booking.pricing.paymentStatus) }}
              >
                <Text className="text-white text-xs font-medium capitalize">
                  {booking.pricing.paymentStatus}
                </Text>
              </Badge>
            </View>
          </View>
        )}

        {/* Customer Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Customer Information
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Name</Text>
              <Text className="text-sm font-medium text-gray-900">
                {booking.customer.name}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Email</Text>
              <Text className="text-sm font-medium text-gray-900">
                {booking.customer.email}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Phone</Text>
              <Text className="text-sm font-medium text-gray-900">
                {booking.customer.phone}
              </Text>
            </View>
            
            {booking.customer.notes && (
              <View>
                <Text className="text-sm text-gray-600 mb-1">Notes</Text>
                <Text className="text-sm text-gray-900">
                  {booking.customer.notes}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Special Instructions */}
        {booking.instructions && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Special Instructions
            </Text>
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <Text className="text-sm text-yellow-800">
                {booking.instructions}
              </Text>
            </View>
          </View>
        )}

        {/* Reminders */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Reminders
          </Text>
          
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Text className="text-sm text-blue-900 mb-2">
              You will receive reminders {booking.reminders.timeBefore} minutes before your appointment via:
            </Text>
            <View className="space-y-1">
              {booking.reminders.email && (
                <Text className="text-sm text-blue-700">• Email notification</Text>
              )}
              {booking.reminders.sms && (
                <Text className="text-sm text-blue-700">• SMS text message</Text>
              )}
              {booking.reminders.push && (
                <Text className="text-sm text-blue-700">• Push notification</Text>
              )}
            </View>
          </View>
        </View>

        {/* Policies */}
        {showPolicies && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Booking Policies
            </Text>
            
            <View className="space-y-3">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Cancellation Policy
                </Text>
                <Text className="text-sm text-gray-600">
                  {booking.policies.cancellation.description}
                </Text>
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Rescheduling Policy
                </Text>
                <Text className="text-sm text-gray-600">
                  {booking.policies.rescheduling.description}
                </Text>
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  No-Show Policy
                </Text>
                <Text className="text-sm text-gray-600">
                  {booking.policies.noShow.description}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row space-x-2 mb-4">
          {onAddToCalendar && (
            <Button
              onPress={onAddToCalendar}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Text className="text-gray-700 font-medium">📅 Add to Calendar</Text>
            </Button>
          )}
          
          {onShare && (
            <Button
              onPress={onShare}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Text className="text-gray-700 font-medium">📤 Share</Text>
            </Button>
          )}
        </View>

        {/* Main Actions */}
        {showActions && canModify && (
          <View className="space-y-3">
            <View className="flex-row space-x-3">
              {onReschedule && (
                <Button
                  onPress={onReschedule}
                  variant="outline"
                  className="flex-1"
                >
                  <Text className="text-gray-700 font-medium">Reschedule</Text>
                </Button>
              )}
              
              {onModify && (
                <Button
                  onPress={onModify}
                  variant="outline"
                  className="flex-1"
                >
                  <Text className="text-gray-700 font-medium">Modify</Text>
                </Button>
              )}
            </View>
            
            {onCancel && canCancel && (
              <Button
                onPress={onCancel}
                variant="destructive"
                className="w-full"
              >
                <Text className="text-white font-medium">Cancel Booking</Text>
              </Button>
            )}
          </View>
        )}

        {/* Custom Actions */}
        {actions.length > 0 && (
          <View className="mt-4 space-y-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                onPress={action.onPress}
                variant={action.variant || 'outline'}
                disabled={action.disabled}
                className="w-full"
              >
                <Text className={cn(
                  'font-medium',
                  action.variant === 'destructive' ? 'text-white' : 'text-gray-700'
                )}>
                  {action.icon && `${action.icon} `}{action.label}
                </Text>
              </Button>
            ))}
          </View>
        )}

        {/* Booking Details Footer */}
        <View className="mt-6 pt-4 border-t border-gray-200">
          <Text className="text-xs text-gray-500 text-center">
            Booking created on {formatDate(booking.createdAt)}
          </Text>
          <Text className="text-xs text-gray-500 text-center mt-1">
            Need help? Contact support or your service provider
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

// === EXPORTS ===

export type {
  BookingSummaryProps,
  BookingData,
  BookingStatus,
  PaymentStatus,
  ServiceInfo,
  ProviderInfo,
  CustomerInfo,
  PricingBreakdown,
  BookingPolicies,
  ReminderSettings,
  SummaryAction,
};
