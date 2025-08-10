/**
 * WaitlistCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive waitlist management card for fully booked services.
 * Features position tracking, notification preferences, and automatic booking.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar } from '../../../../~/components/ui/avatar';
import { Progress } from '../../../../~/components/ui/progress';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Waitlist status types
 */
export type WaitlistStatus = 'active' | 'notified' | 'expired' | 'converted' | 'cancelled';

/**
 * Notification preferences
 */
export type NotificationMethod = 'email' | 'sms' | 'push' | 'call';

/**
 * Waitlist priority levels
 */
export type WaitlistPriority = 'normal' | 'high' | 'urgent' | 'vip';

/**
 * Service information for waitlist context
 */
export interface WaitlistService {
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
  /** Service price */
  price: number;
  /** Currency code */
  currency: string;
  /** Service location */
  location?: string;
  /** Provider information */
  provider: {
    id: string;
    name: string;
    image?: string;
    rating: number;
  };
}

/**
 * Time slot information
 */
export interface WaitlistTimeSlot {
  /** Slot identifier */
  id: string;
  /** Start date and time */
  startTime: Date;
  /** End date and time */
  endTime: Date;
  /** Original capacity */
  capacity: number;
  /** Current enrollment */
  enrolled: number;
  /** Waitlist count */
  waitlistCount: number;
  /** Whether user is enrolled */
  userEnrolled: boolean;
}

/**
 * Waitlist entry data
 */
export interface WaitlistEntry {
  /** Waitlist entry identifier */
  id: string;
  /** User identifier */
  userId: string;
  /** Service information */
  service: WaitlistService;
  /** Time slot information */
  timeSlot: WaitlistTimeSlot;
  /** User's position in waitlist */
  position: number;
  /** Total people on waitlist */
  totalWaitlist: number;
  /** Waitlist status */
  status: WaitlistStatus;
  /** Priority level */
  priority: WaitlistPriority;
  /** Date joined waitlist */
  joinedDate: Date;
  /** Estimated conversion probability */
  conversionProbability: number;
  /** Historical data for this slot */
  historicalData?: {
    averageDropouts: number;
    conversionRate: number;
    averageWaitTime: number; // in hours
  };
  /** Notification preferences */
  notifications: {
    methods: NotificationMethod[];
    advanceNotice: number; // minutes before slot opens
    autoBook: boolean;
    maxPrice?: number; // auto-book only if price <= this
  };
  /** Expiration date */
  expiresAt?: Date;
  /** Notes from user */
  notes?: string;
}

/**
 * Waitlist statistics
 */
export interface WaitlistStats {
  /** Average wait time */
  averageWaitTime: number;
  /** Conversion rate percentage */
  conversionRate: number;
  /** Peak waitlist times */
  peakTimes: Array<{
    day: string;
    hour: number;
    averageWaitlist: number;
  }>;
  /** Success stories */
  recentConversions: number;
}

/**
 * Waitlist action configuration
 */
export interface WaitlistAction {
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
 * WaitlistCard component props
 */
export interface WaitlistCardProps {
  /** Waitlist entry data */
  waitlistEntry: WaitlistEntry;
  /** Waitlist statistics */
  stats?: WaitlistStats;
  /** Card press handler */
  onPress?: () => void;
  /** Leave waitlist handler */
  onLeaveWaitlist?: () => void;
  /** Update notifications handler */
  onUpdateNotifications?: (notifications: WaitlistEntry['notifications']) => void;
  /** View alternatives handler */
  onViewAlternatives?: () => void;
  /** Contact provider handler */
  onContactProvider?: () => void;
  /** Share waitlist handler */
  onShare?: () => void;
  /** Custom action buttons */
  actions?: WaitlistAction[];
  /** Card layout variant */
  layout?: 'compact' | 'standard' | 'detailed';
  /** Whether to show statistics */
  showStats?: boolean;
  /** Whether to show notification settings */
  showNotifications?: boolean;
  /** Whether to show historical data */
  showHistoricalData?: boolean;
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
 * Format date and time
 */
const formatDateTime = (date: Date): { date: string; time: string; dayOfWeek: string } => {
  return {
    date: date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    dayOfWeek: date.toLocaleDateString([], {
      weekday: 'short',
    }),
  };
};

/**
 * Calculate estimated wait time
 */
const calculateEstimatedWaitTime = (
  position: number,
  historicalData?: WaitlistEntry['historicalData']
): string => {
  if (!historicalData) {
    return position <= 3 ? 'Very likely' : position <= 7 ? 'Possible' : 'Unlikely';
  }
  
  const estimatedHours = (position / historicalData.averageDropouts) * historicalData.averageWaitTime;
  
  if (estimatedHours < 1) {
    return 'Within 1 hour';
  } else if (estimatedHours < 24) {
    return `~${Math.round(estimatedHours)} hours`;
  } else {
    const days = Math.round(estimatedHours / 24);
    return `~${days} day${days > 1 ? 's' : ''}`;
  }
};

/**
 * Get status color
 */
const getStatusColor = (status: WaitlistStatus): string => {
  const colors: Record<WaitlistStatus, string> = {
    active: COLORS.blue[500],
    notified: COLORS.yellow[500],
    expired: COLORS.gray[500],
    converted: COLORS.success[500],
    cancelled: COLORS.error[500],
  };
  return colors[status];
};

/**
 * Get priority color
 */
const getPriorityColor = (priority: WaitlistPriority): string => {
  const colors: Record<WaitlistPriority, string> = {
    normal: COLORS.gray[400],
    high: COLORS.orange[500],
    urgent: COLORS.red[500],
    vip: COLORS.purple[500],
  };
  return colors[priority];
};

/**
 * Calculate position progress percentage
 */
const calculatePositionProgress = (position: number, total: number): number => {
  return ((total - position + 1) / total) * 100;
};

// === COMPONENT ===

/**
 * WaitlistCard - Manage waitlist position and preferences
 * 
 * @example
 * ```tsx
 * const waitlistEntry = {
 *   id: 'wait_123',
 *   userId: 'user_456',
 *   service: {
 *     id: 'srv_789',
 *     name: 'Yoga Class',
 *     duration: 60,
 *     price: 25,
 *     currency: 'USD',
 *     provider: {
 *       id: 'prov_321',
 *       name: 'Sarah Chen',
 *       rating: 4.9
 *     }
 *   },
 *   timeSlot: {
 *     id: 'slot_654',
 *     startTime: new Date('2024-01-15T08:00:00'),
 *     endTime: new Date('2024-01-15T09:00:00'),
 *     capacity: 15,
 *     enrolled: 15,
 *     waitlistCount: 8
 *   },
 *   position: 3,
 *   totalWaitlist: 8,
 *   status: 'active',
 *   priority: 'normal',
 *   joinedDate: new Date('2024-01-10'),
 *   conversionProbability: 75,
 *   notifications: {
 *     methods: ['email', 'push'],
 *     advanceNotice: 30,
 *     autoBook: true
 *   }
 * };
 * 
 * <WaitlistCard
 *   waitlistEntry={waitlistEntry}
 *   onPress={() => viewWaitlistDetails(waitlistEntry.id)}
 *   onLeaveWaitlist={() => leaveWaitlist(waitlistEntry.id)}
 *   onUpdateNotifications={(notifications) => updateSettings(notifications)}
 *   showStats={true}
 *   showNotifications={true}
 * />
 * ```
 */
export default function WaitlistCard({
  waitlistEntry,
  stats,
  onPress,
  onLeaveWaitlist,
  onUpdateNotifications,
  onViewAlternatives,
  onContactProvider,
  onShare,
  actions = [],
  layout = 'standard',
  showStats = true,
  showNotifications = false,
  showHistoricalData = false,
  loading = false,
  width,
  testID = 'waitlist-card',
}: WaitlistCardProps) {
  
  // State
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(waitlistEntry.notifications);

  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" style={{ width }}>
        <View className="space-y-4">
          <View className="flex-row space-x-3">
            <View className="w-16 h-16 bg-gray-200 rounded-lg" />
            <View className="flex-1 space-y-2">
              <View className="h-4 bg-gray-200 rounded w-3/4" />
              <View className="h-3 bg-gray-200 rounded w-1/2" />
              <View className="h-3 bg-gray-200 rounded w-2/3" />
            </View>
          </View>
          <View className="h-12 bg-gray-200 rounded" />
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isDetailed = layout === 'detailed';
  const { date, time, dayOfWeek } = formatDateTime(waitlistEntry.timeSlot.startTime);
  const positionProgress = calculatePositionProgress(waitlistEntry.position, waitlistEntry.totalWaitlist);
  const estimatedWaitTime = calculateEstimatedWaitTime(waitlistEntry.position, waitlistEntry.historicalData);

  // Handle notification updates
  const handleNotificationUpdate = () => {
    onUpdateNotifications?.(localNotifications);
    setShowNotificationSettings(false);
  };

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.8}>
      <Card className={cn(
        'overflow-hidden mb-4',
        isCompact ? 'p-3' : 'p-4'
      )} style={{ width }}>
        
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className={cn(
                'font-semibold text-gray-900 mr-2',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                You're on the waitlist
              </Text>
              
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getStatusColor(waitlistEntry.status) }}
              >
                <Text className="text-white text-xs font-medium capitalize">
                  {waitlistEntry.status}
                </Text>
              </Badge>
              
              {waitlistEntry.priority !== 'normal' && (
                <Badge 
                  variant="secondary"
                  className="ml-1"
                  style={{ backgroundColor: getPriorityColor(waitlistEntry.priority) }}
                >
                  <Text className="text-white text-xs font-medium uppercase">
                    {waitlistEntry.priority}
                  </Text>
                </Badge>
              )}
            </View>
            
            <Text className={cn(
              'text-gray-600',
              isCompact ? 'text-xs' : 'text-sm'
            )}>
              Position #{waitlistEntry.position} of {waitlistEntry.totalWaitlist}
            </Text>
          </View>
        </View>

        {/* Service Info */}
        <View className="flex-row space-x-3 mb-4">
          <Image
            source={{ uri: waitlistEntry.service.image || 'https://via.placeholder.com/60x60' }}
            className={cn(isCompact ? 'w-14 h-14' : 'w-16 h-16', 'rounded-lg')}
            resizeMode="cover"
          />
          
          <View className="flex-1">
            <Text className={cn(
              'font-medium text-gray-900 mb-1',
              isCompact ? 'text-sm' : 'text-base'
            )}>
              {waitlistEntry.service.name}
            </Text>
            
            <Text className={cn(
              'text-gray-600 mb-1',
              isCompact ? 'text-xs' : 'text-sm'
            )} numberOfLines={isCompact ? 1 : 2}>
              {waitlistEntry.service.description}
            </Text>
            
            <View className="flex-row items-center space-x-3">
              <Text className={cn(
                'font-semibold text-gray-900',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                {formatCurrency(waitlistEntry.service.price, waitlistEntry.service.currency)}
              </Text>
              
              <Text className="text-xs text-gray-500">
                {waitlistEntry.service.duration}m
              </Text>
            </View>
          </View>
        </View>

        {/* Time Slot Info */}
        <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="text-sm font-medium text-blue-900 mb-1">
            {dayOfWeek}, {date} at {time}
          </Text>
          <Text className="text-xs text-blue-700">
            {waitlistEntry.timeSlot.enrolled}/{waitlistEntry.timeSlot.capacity} spots filled
            {waitlistEntry.service.location && ` • ${waitlistEntry.service.location}`}
          </Text>
        </View>

        {/* Position Progress */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-900">
              Waitlist Position
            </Text>
            <Text className="text-sm text-gray-600">
              {estimatedWaitTime}
            </Text>
          </View>
          
          <Progress 
            value={positionProgress} 
            className="h-3 mb-2"
            style={{
              backgroundColor: COLORS.gray[200],
            }}
          />
          
          <View className="flex-row justify-between text-xs text-gray-500">
            <Text>#{waitlistEntry.totalWaitlist}</Text>
            <Text className="font-medium text-blue-600">
              #{waitlistEntry.position} (You)
            </Text>
            <Text>#1</Text>
          </View>
        </View>

        {/* Conversion Probability */}
        <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-green-900">
              Booking Likelihood
            </Text>
            <Text className="text-sm font-bold text-green-900">
              {waitlistEntry.conversionProbability}%
            </Text>
          </View>
          <Text className="text-xs text-green-700 mt-1">
            Based on historical patterns and your position
          </Text>
        </View>

        {/* Provider Info */}
        {!isCompact && (
          <View className="flex-row items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <Image
                source={{ uri: waitlistEntry.service.provider.image || 'https://via.placeholder.com/40x40' }}
                className="w-full h-full rounded-full"
                alt={waitlistEntry.service.provider.name}
              />
            </Avatar>
            
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">
                {waitlistEntry.service.provider.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 mr-1 text-xs">⭐</Text>
                <Text className="text-xs text-gray-600">
                  {waitlistEntry.service.provider.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            
            {onContactProvider && (
              <TouchableOpacity
                onPress={onContactProvider}
                className="p-2 bg-blue-100 rounded-full"
              >
                <Text className="text-blue-600">💬</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Historical Data */}
        {showHistoricalData && waitlistEntry.historicalData && isDetailed && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Historical Data
            </Text>
            <View className="grid grid-cols-3 gap-2">
              <View className="bg-gray-50 p-2 rounded">
                <Text className="text-xs text-gray-500">Avg. Dropouts</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {waitlistEntry.historicalData.averageDropouts}
                </Text>
              </View>
              <View className="bg-gray-50 p-2 rounded">
                <Text className="text-xs text-gray-500">Success Rate</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {Math.round(waitlistEntry.historicalData.conversionRate)}%
                </Text>
              </View>
              <View className="bg-gray-50 p-2 rounded">
                <Text className="text-xs text-gray-500">Avg. Wait</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {Math.round(waitlistEntry.historicalData.averageWaitTime)}h
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Notification Settings */}
        {showNotifications && (
          <View className="mb-4">
            <TouchableOpacity
              onPress={() => setShowNotificationSettings(!showNotificationSettings)}
              className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <Text className="text-sm font-medium text-gray-900">
                Notification Settings
              </Text>
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-600 mr-2">
                  {localNotifications.methods.length} method{localNotifications.methods.length !== 1 ? 's' : ''}
                </Text>
                <Text className="text-gray-400">
                  {showNotificationSettings ? '▼' : '▶'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {showNotificationSettings && (
              <View className="mt-3 p-3 bg-white border border-gray-200 rounded-lg space-y-3">
                {/* Notification Methods */}
                <View>
                  <Text className="text-sm font-medium text-gray-900 mb-2">
                    Notify me via:
                  </Text>
                  <View className="space-y-2">
                    {(['email', 'sms', 'push', 'call'] as NotificationMethod[]).map((method) => (
                      <View key={method} className="flex-row items-center">
                        <Checkbox
                          checked={localNotifications.methods.includes(method)}
                          onCheckedChange={(checked) => {
                            const newMethods = checked
                              ? [...localNotifications.methods, method]
                              : localNotifications.methods.filter(m => m !== method);
                            setLocalNotifications({
                              ...localNotifications,
                              methods: newMethods,
                            });
                          }}
                        />
                        <Text className="text-sm text-gray-700 ml-2 capitalize">
                          {method === 'sms' ? 'Text message' : method}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Auto-booking */}
                <View>
                  <View className="flex-row items-center">
                    <Checkbox
                      checked={localNotifications.autoBook}
                      onCheckedChange={(checked) => {
                        setLocalNotifications({
                          ...localNotifications,
                          autoBook: checked,
                        });
                      }}
                    />
                    <Text className="text-sm text-gray-700 ml-2">
                      Automatically book when spot opens
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-1 ml-6">
                    You'll be charged immediately if a spot becomes available
                  </Text>
                </View>
                
                <Button
                  onPress={handleNotificationUpdate}
                  size="sm"
                  className="bg-blue-600"
                >
                  <Text className="text-white font-medium text-sm">
                    Update Settings
                  </Text>
                </Button>
              </View>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row space-x-2 mb-3">
          {onViewAlternatives && (
            <Button
              onPress={onViewAlternatives}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Text className="text-gray-700 font-medium text-xs">View Alternatives</Text>
            </Button>
          )}
          
          {onShare && (
            <Button
              onPress={onShare}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Text className="text-gray-700 font-medium text-xs">📤 Share</Text>
            </Button>
          )}
        </View>

        {/* Leave Waitlist */}
        {onLeaveWaitlist && (
          <Button
            onPress={onLeaveWaitlist}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <Text className="text-white font-medium text-sm">
              Leave Waitlist
            </Text>
          </Button>
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
                  'font-medium text-xs',
                  action.variant === 'outline' ? 'text-gray-700' : 'text-white'
                )}>
                  {action.icon && `${action.icon} `}{action.label}
                </Text>
              </Button>
            ))}
          </View>
        )}

        {/* Expiration Notice */}
        {waitlistEntry.expiresAt && (
          <View className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <Text className="text-xs text-yellow-800">
              ⏰ Waitlist expires on {waitlistEntry.expiresAt.toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Join Date */}
        <Text className="text-xs text-gray-400 text-center mt-3">
          Joined waitlist on {waitlistEntry.joinedDate.toLocaleDateString()}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  WaitlistCardProps,
  WaitlistEntry,
  WaitlistService,
  WaitlistTimeSlot,
  WaitlistStats,
  WaitlistAction,
  WaitlistStatus,
  NotificationMethod,
  WaitlistPriority,
};
