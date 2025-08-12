/**
 * AppointmentCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive appointment display card for booking and service applications.
 * Features appointment details, status indicators, and quick actions.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn, formatDate, formatTime } from '../../../lib/utils';

// === TYPES ===

/**
 * Appointment status types
 */
export type AppointmentStatus = 'upcoming' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

/**
 * Appointment priority levels
 */
export type AppointmentPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Payment status for appointments
 */
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partial';

/**
 * Service provider information
 */
export interface Provider {
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
  /** Verification status */
  verified: boolean;
  /** Provider phone */
  phone?: string;
  /** Provider location */
  location?: string;
}

/**
 * Service information
 */
export interface Service {
  /** Service identifier */
  id: string;
  /** Service name */
  name: string;
  /** Service description */
  description: string;
  /** Service duration in minutes */
  duration: number;
  /** Service price */
  price: number;
  /** Currency code */
  currency: string;
  /** Service location type */
  locationType: 'onsite' | 'remote' | 'hybrid';
  /** Service category */
  category: string;
}

/**
 * Customer information
 */
export interface Customer {
  /** Customer identifier */
  id: string;
  /** Customer name */
  name: string;
  /** Customer email */
  email: string;
  /** Customer phone */
  phone: string;
  /** Customer image */
  image?: string;
}

/**
 * Appointment reminder settings
 */
export interface ReminderSettings {
  /** Whether reminders are enabled */
  enabled: boolean;
  /** Time before appointment (minutes) */
  timeBefore: number;
  /** Reminder methods */
  methods: ('email' | 'sms' | 'push')[];
}

/**
 * Main appointment data
 */
export interface Appointment {
  /** Appointment identifier */
  id: string;
  /** Appointment title */
  title: string;
  /** Start date and time */
  startTime: Date | undefined | null;
  /** End date and time */
  endTime: Date | undefined | null;
  /** Appointment status */
  status: AppointmentStatus;
  /** Appointment priority */
  priority?: AppointmentPriority;
  /** Service information */
  service: Service;
  /** Provider information */
  provider: Provider;
  /** Customer information */
  customer?: Customer;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Appointment notes */
  notes?: string;
  /** Location details */
  location?: string;
  /** Meeting link for remote appointments */
  meetingLink?: string;
  /** Confirmation number */
  confirmationNumber?: string;
  /** Reminder settings */
  reminders: ReminderSettings;
  /** Created date */
  createdAt: Date;
  /** Last updated date */
  updatedAt: Date;
  /** Whether appointment can be modified */
  canModify: boolean;
  /** Whether appointment can be cancelled */
  canCancel: boolean;
  /** Special instructions */
  instructions?: string;
}

/**
 * Action button configuration
 */
export interface AppointmentAction {
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
 * AppointmentCard component props
 */
export interface AppointmentCardProps {
  /** Appointment data to display */
  appointment: Appointment;
  /** Card press handler */
  onPress?: () => void;
  /** Join meeting handler */
  onJoinMeeting?: () => void;
  /** Call provider handler */
  onCallProvider?: () => void;
  /** Reschedule handler */
  onReschedule?: () => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** View details handler */
  onViewDetails?: () => void;
  /** Add to calendar handler */
  onAddToCalendar?: () => void;
  /** Share appointment handler */
  onShare?: () => void;
  /** Custom action buttons */
  actions?: AppointmentAction[];
  /** Card layout variant */
  layout?: 'compact' | 'standard' | 'detailed';
  /** Whether to show provider info */
  showProvider?: boolean;
  /** Whether to show customer info (for provider view) */
  showCustomer?: boolean;
  /** Whether to show payment status */
  showPaymentStatus?: boolean;
  /** Whether to show pricing */
  showPricing?: boolean;
  /** Whether to show quick actions */
  showQuickActions?: boolean;
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
 * Format date and time using the safer utility functions
 */
const formatDateTime = (date: Date | undefined | null): { date: string; time: string } => {
  return {
    date: formatDate(date, 'MMM DD'),
    time: formatTime(date || new Date()),
  };
};

/**
 * Format duration
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Get status color
 */
const getStatusColor = (status: AppointmentStatus): string => {
  const colors: Record<AppointmentStatus, string> = {
    upcoming: COLORS.blue[500],
    confirmed: COLORS.green[500],
    in_progress: COLORS.yellow[500],
    completed: COLORS.green[600],
    cancelled: COLORS.error[500],
    no_show: COLORS.gray[500],
    rescheduled: COLORS.orange[500],
  };
  return colors[status];
};

/**
 * Get priority color
 */
const getPriorityColor = (priority: AppointmentPriority): string => {
  const colors: Record<AppointmentPriority, string> = {
    low: COLORS.gray[400],
    medium: COLORS.yellow[500],
    high: COLORS.orange[500],
    urgent: COLORS.error[500],
  };
  return colors[priority];
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
 * Get time until appointment
 */
const getTimeUntilAppointment = (appointmentTime: Date | undefined | null): string => {
  if (!appointmentTime || !(appointmentTime instanceof Date) || isNaN(appointmentTime.getTime())) {
    return 'Unknown';
  }
  
  const now = new Date();
  const diffMs = appointmentTime.getTime() - now.getTime();
  
  if (diffMs < 0) {
    return 'Past';
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else {
    return `${diffMinutes}m`;
  }
};

/**
 * Check if appointment is soon (within 1 hour)
 */
const isAppointmentSoon = (appointmentTime: Date | undefined | null): boolean => {
  if (!appointmentTime || !(appointmentTime instanceof Date) || isNaN(appointmentTime.getTime())) {
    return false;
  }
  
  const now = new Date();
  const diffMs = appointmentTime.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= 60 * 60 * 1000; // 1 hour
};

// === COMPONENT ===

/**
 * AppointmentCard - Display appointment with actions
 * 
 * @example
 * ```tsx
 * const appointment = {
 *   id: 'apt_123',
 *   title: 'Personal Training Session',
 *   startTime: new Date('2024-01-15T10:00:00'),
 *   endTime: new Date('2024-01-15T11:00:00'),
 *   status: 'confirmed',
 *   service: {
 *     id: 'srv_123',
 *     name: 'Personal Training',
 *     duration: 60,
 *     price: 100,
 *     currency: 'USD',
 *     locationType: 'onsite'
 *   },
 *   provider: {
 *     id: 'prov_456',
 *     name: 'Sarah Johnson',
 *     title: 'Personal Trainer',
 *     rating: 4.9,
 *     verified: true
 *   },
 *   paymentStatus: 'paid',
 *   canModify: true,
 *   canCancel: true,
 *   reminders: { enabled: true, timeBefore: 60, methods: ['email', 'push'] }
 * };
 * 
 * <AppointmentCard
 *   appointment={appointment}
 *   onPress={() => navigateToDetails(appointment.id)}
 *   onReschedule={() => rescheduleAppointment(appointment.id)}
 *   onCancel={() => cancelAppointment(appointment.id)}
 *   onCallProvider={() => callProvider(appointment.provider.id)}
 *   showProvider={true}
 *   showQuickActions={true}
 * />
 * ```
 */
export default function AppointmentCard({
  appointment,
  onPress,
  onJoinMeeting,
  onCallProvider,
  onReschedule,
  onCancel,
  onViewDetails,
  onAddToCalendar,
  onShare,
  actions = [],
  layout = 'standard',
  showProvider = true,
  showCustomer = false,
  showPaymentStatus = true,
  showPricing = true,
  showQuickActions = true,
  loading = false,
  width,
  testID = 'appointment-card',
}: AppointmentCardProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" style={{ width }}>
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <View className="h-4 bg-gray-200 rounded w-1/2" />
            <View className="h-4 bg-gray-200 rounded w-1/4" />
          </View>
          <View className="h-3 bg-gray-200 rounded w-3/4" />
          <View className="flex-row space-x-3">
            <View className="w-12 h-12 bg-gray-200 rounded-full" />
            <View className="flex-1 space-y-2">
              <View className="h-3 bg-gray-200 rounded w-2/3" />
              <View className="h-3 bg-gray-200 rounded w-1/2" />
            </View>
          </View>
        </View>
      </Card>
    );
  }

  // Early safety check for appointment data
  if (!appointment || !appointment.id || !appointment.title) {
    return (
      <Card style={{ width, padding: 16, marginBottom: 12 }}>
        <Text style={{ color: '#EF4444', fontSize: 14, textAlign: 'center' }}>
          Invalid appointment data
        </Text>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isDetailed = layout === 'detailed';
  const { date, time } = formatDateTime(appointment.startTime);
  const timeUntil = getTimeUntilAppointment(appointment.startTime);
  const isSoon = isAppointmentSoon(appointment.startTime);

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.8}>
      <Card className={cn(
        'overflow-hidden mb-3',
        isCompact ? 'p-3' : 'p-4',
        isSoon && appointment.status === 'confirmed' && 'border-orange-300 bg-orange-50'
      )} style={{ width }}>
        
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className={cn(
                'font-semibold text-gray-900 mr-2',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                {appointment.title || appointment.service.name}
              </Text>
              
              {appointment.priority && appointment.priority !== 'low' && (
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: getPriorityColor(appointment.priority) }}
                >
                  <Text className="text-white text-xs font-medium uppercase">
                    {appointment.priority}
                  </Text>
                </Badge>
              )}
            </View>
            
            <Text className={cn(
              'text-gray-600 mb-1',
              isCompact ? 'text-xs' : 'text-sm'
            )}>
              {appointment.service.description}
            </Text>
            
            {appointment.confirmationNumber && !isCompact && (
              <Text className="text-xs text-gray-500">
                Confirmation: {appointment.confirmationNumber}
              </Text>
            )}
          </View>
          
          {/* Status Badge */}
          <Badge 
            variant="secondary"
            style={{ backgroundColor: getStatusColor(appointment.status) }}
          >
            <Text className="text-white text-xs font-medium capitalize">
              {appointment.status.replace('_', ' ')}
            </Text>
          </Badge>
        </View>

        {/* Date & Time */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-gray-900 mr-2">
              {time}
            </Text>
            <Text className="text-sm text-gray-600">
              {date}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 mr-2">
              {formatDuration(appointment.service.duration)}
            </Text>
            {timeUntil !== 'Past' && (
              <Text className={cn(
                'text-xs font-medium',
                isSoon ? 'text-orange-600' : 'text-gray-500'
              )}>
                in {timeUntil}
              </Text>
            )}
          </View>
        </View>

        {/* Location/Service Type */}
        <View className="flex-row items-center mb-3">
          <Text className="text-sm text-gray-500 mr-1">
            {appointment.service.locationType === 'remote' ? '🌐' : 
             appointment.service.locationType === 'hybrid' ? '🔄' : '📍'}
          </Text>
          <Text className="text-sm text-gray-600">
            {appointment.service.locationType === 'remote' ? 'Online/Remote' :
             appointment.service.locationType === 'hybrid' ? 'Hybrid' :
             appointment.location || appointment.provider.location || 'In-person'}
          </Text>
        </View>

        {/* Provider Info */}
        {showProvider && (
          <View className="flex-row items-center space-x-3 mb-3">
            <Avatar className={cn(isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
              <Image
                source={{ uri: appointment.provider.image || 'https://via.placeholder.com/48x48' }}
                className="w-full h-full rounded-full"
                alt={appointment.provider.name}
              />
            </Avatar>
            
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className={cn(
                  'font-medium text-gray-900 mr-1',
                  isCompact ? 'text-sm' : 'text-base'
                )}>
                  {appointment.provider.name}
                </Text>
                {appointment.provider.verified && (
                  <Text className="text-xs">✅</Text>
                )}
              </View>
              
              <Text className={cn(
                'text-gray-600',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                {appointment.provider.title}
              </Text>
              
              <View className="flex-row items-center mt-1">
                <Text className="text-yellow-500 mr-1 text-xs">⭐</Text>
                <Text className="text-xs text-gray-600">
                  {appointment.provider.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            
            {/* Quick Call Button */}
            {appointment.provider.phone && onCallProvider && !isCompact && (
              <TouchableOpacity
                className="p-2 bg-blue-100 rounded-full"
                onPress={onCallProvider}
              >
                <Text className="text-blue-600">📞</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Customer Info (for provider view) */}
        {showCustomer && appointment.customer && (
          <View className="flex-row items-center space-x-3 mb-3">
            <Avatar className={cn(isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
              <Image
                source={{ uri: appointment.customer.image || 'https://via.placeholder.com/48x48' }}
                className="w-full h-full rounded-full"
                alt={appointment.customer.name}
              />
            </Avatar>
            
            <View className="flex-1">
              <Text className={cn(
                'font-medium text-gray-900',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                {appointment.customer.name}
              </Text>
              <Text className={cn(
                'text-gray-600',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                {appointment.customer.email}
              </Text>
              <Text className={cn(
                'text-gray-600',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                {appointment.customer.phone}
              </Text>
            </View>
          </View>
        )}

        {/* Pricing and Payment Status */}
        {(showPricing || showPaymentStatus) && (
          <View className="flex-row items-center justify-between mb-3">
            {showPricing && (
              <Text className="text-lg font-bold text-gray-900">
                {formatCurrency(appointment.service.price, appointment.service.currency)}
              </Text>
            )}
            
            {showPaymentStatus && (
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getPaymentStatusColor(appointment.paymentStatus) }}
              >
                <Text className="text-white text-xs font-medium capitalize">
                  {appointment.paymentStatus}
                </Text>
              </Badge>
            )}
          </View>
        )}

        {/* Notes/Instructions */}
        {!isCompact && (appointment.notes || appointment.instructions) && (
          <View className="mb-3 p-2 bg-gray-50 rounded">
            <Text className="text-xs text-gray-600">
              {appointment.notes || appointment.instructions}
            </Text>
          </View>
        )}

        {/* Reminder Info */}
        {!isCompact && appointment.reminders.enabled && (
          <View className="flex-row items-center mb-3">
            <Text className="text-xs text-gray-500 mr-1">🔔</Text>
            <Text className="text-xs text-gray-600">
              Reminder set for {appointment.reminders.timeBefore} min before
            </Text>
          </View>
        )}

        {/* Join Meeting Button (for remote appointments) */}
        {appointment.service.locationType === 'remote' && appointment.meetingLink && isSoon && (
          <Button
            onPress={onJoinMeeting}
            className="w-full mb-3 bg-green-600 hover:bg-green-700"
          >
            <Text className="text-white font-medium">
              🎥 Join Meeting
            </Text>
          </Button>
        )}

        {/* Quick Actions */}
        {showQuickActions && !isCompact && (
          <View className="flex-row space-x-2">
            {onViewDetails && (
              <Button
                onPress={onViewDetails}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Text className="text-gray-700 text-xs font-medium">Details</Text>
              </Button>
            )}
            
            {onReschedule && appointment.canModify && (
              <Button
                onPress={onReschedule}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Text className="text-gray-700 text-xs font-medium">Reschedule</Text>
              </Button>
            )}
            
            {onCancel && appointment.canCancel && (
              <Button
                onPress={onCancel}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Text className="text-red-600 text-xs font-medium">Cancel</Text>
              </Button>
            )}
          </View>
        )}

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
                  'text-xs font-medium',
                  action.variant === 'destructive' ? 'text-white' : 'text-gray-700'
                )}>
                  {action.icon && `${action.icon} `}{action.label}
                </Text>
              </Button>
            ))}
          </View>
        )}

        {/* Urgent Indicator */}
        {isSoon && appointment.status === 'confirmed' && (
          <View className="absolute top-2 right-2">
            <View className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  AppointmentCardProps,
  Appointment,
  AppointmentStatus,
  AppointmentPriority,
  PaymentStatus,
  Provider,
  Service,
  Customer,
  ReminderSettings,
  AppointmentAction,
};
