/**
 * ClassScheduleCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive class schedule card for group services and workshops.
 * Features capacity management, enrollment tracking, and recurring schedule display.
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
import { Progress } from '../../../../~/components/ui/progress';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Class difficulty levels
 */
export type ClassDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

/**
 * Class enrollment status
 */
export type EnrollmentStatus = 'open' | 'full' | 'waitlist' | 'closed' | 'cancelled';

/**
 * Recurring schedule pattern
 */
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * Class pricing structure
 */
export interface ClassPricing {
  /** Drop-in price */
  dropIn: number;
  /** Package price (if applicable) */
  package?: {
    sessions: number;
    price: number;
    savings: number;
  };
  /** Membership price */
  membership?: {
    monthly: number;
    unlimited: boolean;
  };
  /** Currency code */
  currency: string;
  /** Early bird discount */
  earlyBird?: {
    discountPercentage: number;
    validUntil: Date;
  };
}

/**
 * Class instructor information
 */
export interface ClassInstructor {
  /** Instructor identifier */
  id: string;
  /** Instructor name */
  name: string;
  /** Instructor title */
  title: string;
  /** Instructor image */
  image?: string;
  /** Instructor bio */
  bio: string;
  /** Years of experience */
  experience: number;
  /** Instructor rating */
  rating: number;
  /** Certifications */
  certifications: string[];
  /** Specialties */
  specialties: string[];
  /** Verification status */
  verified: boolean;
}

/**
 * Class equipment requirements
 */
export interface ClassEquipment {
  /** Equipment name */
  name: string;
  /** Whether required or optional */
  required: boolean;
  /** Where to get it */
  available: 'provided' | 'bring_own' | 'rental';
  /** Rental cost if applicable */
  rentalCost?: number;
}

/**
 * Class schedule occurrence
 */
export interface ClassOccurrence {
  /** Occurrence identifier */
  id: string;
  /** Start date and time */
  startTime: Date;
  /** End date and time */
  endTime: Date;
  /** Current enrollment count */
  enrolled: number;
  /** Maximum capacity */
  maxCapacity: number;
  /** Waitlist count */
  waitlistCount: number;
  /** Enrollment status */
  status: EnrollmentStatus;
  /** Instructor for this occurrence */
  instructor?: ClassInstructor;
  /** Special notes for this occurrence */
  notes?: string;
  /** Whether user is enrolled */
  userEnrolled?: boolean;
  /** Whether user is on waitlist */
  userOnWaitlist?: boolean;
}

/**
 * Main class schedule data
 */
export interface ClassSchedule {
  /** Class identifier */
  id: string;
  /** Class name */
  name: string;
  /** Class description */
  description: string;
  /** Class category */
  category: string;
  /** Class difficulty level */
  difficulty: ClassDifficulty;
  /** Class duration in minutes */
  duration: number;
  /** Class image */
  image?: string;
  /** Class pricing */
  pricing: ClassPricing;
  /** Primary instructor */
  instructor: ClassInstructor;
  /** Substitute instructors */
  substitutes?: ClassInstructor[];
  /** Equipment requirements */
  equipment: ClassEquipment[];
  /** Class location */
  location: string;
  /** Room or space details */
  room?: string;
  /** Recurrence pattern */
  recurrence: {
    pattern: RecurrencePattern;
    daysOfWeek?: number[]; // 0=Sunday, 6=Saturday
    frequency?: number; // Every N weeks/months
    endDate?: Date;
  };
  /** Upcoming occurrences */
  occurrences: ClassOccurrence[];
  /** Prerequisites */
  prerequisites?: string[];
  /** Class benefits */
  benefits: string[];
  /** Class tags */
  tags: string[];
  /** Age restrictions */
  ageRestriction?: {
    min?: number;
    max?: number;
  };
  /** Class policies */
  policies: {
    cancellation: string;
    lateArrival: string;
    makeupClass: string;
  };
  /** Average rating */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Whether class is featured */
  featured?: boolean;
}

/**
 * Action button configuration
 */
export interface ClassAction {
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
 * ClassScheduleCard component props
 */
export interface ClassScheduleCardProps {
  /** Class schedule data */
  classSchedule: ClassSchedule;
  /** Card press handler */
  onPress?: () => void;
  /** Enroll in class handler */
  onEnroll?: (occurrence: ClassOccurrence) => void;
  /** Join waitlist handler */
  onJoinWaitlist?: (occurrence: ClassOccurrence) => void;
  /** View instructor handler */
  onViewInstructor?: (instructor: ClassInstructor) => void;
  /** Share class handler */
  onShare?: () => void;
  /** Add to favorites handler */
  onFavorite?: () => void;
  /** Whether class is favorited */
  isFavorite?: boolean;
  /** Custom action buttons */
  actions?: ClassAction[];
  /** Card layout variant */
  layout?: 'compact' | 'standard' | 'detailed';
  /** Number of occurrences to show */
  maxOccurrences?: number;
  /** Whether to show instructor info */
  showInstructor?: boolean;
  /** Whether to show pricing */
  showPricing?: boolean;
  /** Whether to show equipment */
  showEquipment?: boolean;
  /** Whether to show class benefits */
  showBenefits?: boolean;
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
const formatDateTime = (date: Date): { date: string; time: string; day: string } => {
  return {
    date: date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    day: date.toLocaleDateString([], {
      weekday: 'short',
    }),
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
 * Get difficulty color
 */
const getDifficultyColor = (difficulty: ClassDifficulty): string => {
  const colors: Record<ClassDifficulty, string> = {
    beginner: COLORS.success[500],
    intermediate: COLORS.yellow[500],
    advanced: COLORS.orange[500],
    all_levels: COLORS.blue[500],
  };
  return colors[difficulty];
};

/**
 * Get enrollment status color
 */
const getEnrollmentStatusColor = (status: EnrollmentStatus): string => {
  const colors: Record<EnrollmentStatus, string> = {
    open: COLORS.success[500],
    full: COLORS.error[500],
    waitlist: COLORS.orange[500],
    closed: COLORS.gray[500],
    cancelled: COLORS.red[600],
  };
  return colors[status];
};

/**
 * Calculate enrollment percentage
 */
const calculateEnrollmentPercentage = (enrolled: number, capacity: number): number => {
  return Math.min((enrolled / capacity) * 100, 100);
};

/**
 * Get recurrence display text
 */
const getRecurrenceText = (recurrence: ClassSchedule['recurrence']): string => {
  switch (recurrence.pattern) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = recurrence.daysOfWeek.map(day => dayNames[day]).join(', ');
        return `Weekly on ${days}`;
      }
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'custom':
      return 'Custom schedule';
    default:
      return 'See schedule';
  }
};

// === COMPONENT ===

/**
 * ClassScheduleCard - Display class schedule with enrollment
 * 
 * @example
 * ```tsx
 * const classSchedule = {
 *   id: 'class_123',
 *   name: 'Morning Yoga Flow',
 *   description: 'Start your day with energizing yoga sequences',
 *   category: 'Yoga',
 *   difficulty: 'all_levels',
 *   duration: 60,
 *   pricing: {
 *     dropIn: 25,
 *     package: { sessions: 10, price: 200, savings: 50 },
 *     currency: 'USD'
 *   },
 *   instructor: {
 *     id: 'inst_456',
 *     name: 'Sarah Chen',
 *     title: 'Certified Yoga Instructor',
 *     rating: 4.9,
 *     experience: 8,
 *     verified: true
 *   },
 *   occurrences: [
 *     {
 *       id: 'occ_1',
 *       startTime: new Date('2024-01-15T08:00:00'),
 *       endTime: new Date('2024-01-15T09:00:00'),
 *       enrolled: 12,
 *       maxCapacity: 15,
 *       status: 'open'
 *     }
 *   ],
 *   location: 'Studio A',
 *   rating: 4.8,
 *   reviewCount: 156
 * };
 * 
 * <ClassScheduleCard
 *   classSchedule={classSchedule}
 *   onPress={() => navigateToClass(classSchedule.id)}
 *   onEnroll={(occurrence) => enrollInClass(occurrence.id)}
 *   onViewInstructor={(instructor) => viewInstructor(instructor.id)}
 *   showInstructor={true}
 *   showPricing={true}
 * />
 * ```
 */
export default function ClassScheduleCard({
  classSchedule,
  onPress,
  onEnroll,
  onJoinWaitlist,
  onViewInstructor,
  onShare,
  onFavorite,
  isFavorite = false,
  actions = [],
  layout = 'standard',
  maxOccurrences = 3,
  showInstructor = true,
  showPricing = true,
  showEquipment = false,
  showBenefits = false,
  loading = false,
  width,
  testID = 'class-schedule-card',
}: ClassScheduleCardProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" style={{ width }}>
        <View className="space-y-4">
          <View className="flex-row space-x-3">
            <View className="w-20 h-20 bg-gray-200 rounded-lg" />
            <View className="flex-1 space-y-2">
              <View className="h-4 bg-gray-200 rounded w-3/4" />
              <View className="h-3 bg-gray-200 rounded w-1/2" />
              <View className="h-3 bg-gray-200 rounded w-2/3" />
            </View>
          </View>
          <View className="space-y-2">
            <View className="h-16 bg-gray-200 rounded" />
            <View className="h-10 bg-gray-200 rounded" />
          </View>
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isDetailed = layout === 'detailed';
  const upcomingOccurrences = classSchedule.occurrences
    .filter(occ => occ.startTime > new Date())
    .slice(0, maxOccurrences);

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.8}>
      <Card className={cn(
        'overflow-hidden mb-4',
        isCompact ? 'p-3' : 'p-4',
        classSchedule.featured && 'border-yellow-300 bg-yellow-50'
      )} style={{ width }}>
        
        {/* Header */}
        <View className="flex-row space-x-3 mb-4">
          
          {/* Class Image */}
          <View className="relative">
            <Image
              source={{ uri: classSchedule.image || 'https://via.placeholder.com/80x80' }}
              className={cn(isCompact ? 'w-16 h-16' : 'w-20 h-20', 'rounded-lg')}
              resizeMode="cover"
            />
            
            {/* Favorite Button */}
            <TouchableOpacity
              className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full items-center justify-center shadow-sm"
              onPress={onFavorite}
            >
              <Text className="text-sm">
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Class Info */}
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text className={cn(
                'font-semibold text-gray-900 flex-1',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                {classSchedule.name}
              </Text>
              
              {classSchedule.featured && (
                <Badge variant="secondary" style={{ backgroundColor: COLORS.yellow[500] }}>
                  <Text className="text-white text-xs font-medium">Featured</Text>
                </Badge>
              )}
            </View>
            
            <Text className={cn(
              'text-gray-600 mb-2',
              isCompact ? 'text-xs' : 'text-sm'
            )} numberOfLines={isCompact ? 1 : 2}>
              {classSchedule.description}
            </Text>
            
            {/* Class Details */}
            <View className="flex-row items-center space-x-4">
              {/* Difficulty */}
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getDifficultyColor(classSchedule.difficulty) }}
              >
                <Text className="text-white text-xs font-medium capitalize">
                  {classSchedule.difficulty.replace('_', ' ')}
                </Text>
              </Badge>
              
              {/* Duration */}
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-1">⏱️</Text>
                <Text className="text-xs text-gray-600">
                  {formatDuration(classSchedule.duration)}
                </Text>
              </View>
              
              {/* Location */}
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-1">📍</Text>
                <Text className="text-xs text-gray-600">
                  {classSchedule.location}
                </Text>
              </View>
            </View>
            
            {/* Rating */}
            <View className="flex-row items-center mt-1">
              <Text className="text-yellow-500 mr-1 text-xs">⭐</Text>
              <Text className="text-xs text-gray-700 font-medium">
                {classSchedule.rating.toFixed(1)}
              </Text>
              <Text className="text-xs text-gray-500 ml-1">
                ({classSchedule.reviewCount} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Instructor Info */}
        {showInstructor && !isCompact && (
          <TouchableOpacity
            onPress={() => onViewInstructor?.(classSchedule.instructor)}
            className="flex-row items-center space-x-3 mb-4 p-2 bg-gray-50 rounded-lg"
          >
            <Avatar className="w-10 h-10">
              <Image
                source={{ uri: classSchedule.instructor.image || 'https://via.placeholder.com/40x40' }}
                className="w-full h-full rounded-full"
                alt={classSchedule.instructor.name}
              />
            </Avatar>
            
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-sm font-medium text-gray-900 mr-1">
                  {classSchedule.instructor.name}
                </Text>
                {classSchedule.instructor.verified && (
                  <Text className="text-xs">✅</Text>
                )}
              </View>
              <Text className="text-xs text-gray-600">
                {classSchedule.instructor.title} • {classSchedule.instructor.experience} years
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-yellow-500 mr-1 text-xs">⭐</Text>
              <Text className="text-xs text-gray-700">
                {classSchedule.instructor.rating.toFixed(1)}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Upcoming Occurrences */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900">
              Upcoming Classes
            </Text>
            <Text className="text-xs text-gray-500">
              {getRecurrenceText(classSchedule.recurrence)}
            </Text>
          </View>
          
          {upcomingOccurrences.length > 0 ? (
            <View className="space-y-3">
              {upcomingOccurrences.map((occurrence) => {
                const { date, time, day } = formatDateTime(occurrence.startTime);
                const enrollmentPercentage = calculateEnrollmentPercentage(
                  occurrence.enrolled, 
                  occurrence.maxCapacity
                );
                
                return (
                  <View
                    key={occurrence.id}
                    className="flex-row items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    {/* Date & Time */}
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {day}, {date}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {time} - {formatDateTime(occurrence.endTime).time}
                      </Text>
                      
                      {/* Enrollment Progress */}
                      <View className="mt-2">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-xs text-gray-600">
                            {occurrence.enrolled}/{occurrence.maxCapacity} enrolled
                          </Text>
                          <Badge 
                            variant="secondary"
                            style={{ backgroundColor: getEnrollmentStatusColor(occurrence.status) }}
                          >
                            <Text className="text-white text-xs font-medium capitalize">
                              {occurrence.status}
                            </Text>
                          </Badge>
                        </View>
                        <Progress 
                          value={enrollmentPercentage} 
                          className="h-2"
                          style={{
                            backgroundColor: COLORS.gray[200],
                          }}
                        />
                        
                        {occurrence.waitlistCount > 0 && (
                          <Text className="text-xs text-orange-600 mt-1">
                            {occurrence.waitlistCount} on waitlist
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {/* Action Button */}
                    <View className="ml-3">
                      {occurrence.userEnrolled ? (
                        <Badge variant="secondary" style={{ backgroundColor: COLORS.success[500] }}>
                          <Text className="text-white text-xs font-medium">Enrolled</Text>
                        </Badge>
                      ) : occurrence.userOnWaitlist ? (
                        <Badge variant="secondary" style={{ backgroundColor: COLORS.orange[500] }}>
                          <Text className="text-white text-xs font-medium">Waitlisted</Text>
                        </Badge>
                      ) : occurrence.status === 'open' ? (
                        <Button
                          onPress={() => onEnroll?.(occurrence)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Text className="text-white font-medium text-xs">Enroll</Text>
                        </Button>
                      ) : occurrence.status === 'full' && onJoinWaitlist ? (
                        <Button
                          onPress={() => onJoinWaitlist?.(occurrence)}
                          size="sm"
                          variant="outline"
                        >
                          <Text className="text-gray-700 font-medium text-xs">Waitlist</Text>
                        </Button>
                      ) : (
                        <Text className="text-xs text-gray-500">Unavailable</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center py-4">
              <Text className="text-gray-500 text-sm">No upcoming classes scheduled</Text>
            </View>
          )}
        </View>

        {/* Pricing */}
        {showPricing && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Pricing Options
            </Text>
            
            <View className="space-y-2">
              {/* Drop-in Price */}
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">Drop-in</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatCurrency(classSchedule.pricing.dropIn, classSchedule.pricing.currency)}
                </Text>
              </View>
              
              {/* Package Price */}
              {classSchedule.pricing.package && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">
                    {classSchedule.pricing.package.sessions} Class Package
                  </Text>
                  <View className="items-end">
                    <Text className="text-sm font-medium text-gray-900">
                      {formatCurrency(classSchedule.pricing.package.price, classSchedule.pricing.currency)}
                    </Text>
                    <Text className="text-xs text-green-600">
                      Save {formatCurrency(classSchedule.pricing.package.savings, classSchedule.pricing.currency)}
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Membership Price */}
              {classSchedule.pricing.membership && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">
                    Monthly {classSchedule.pricing.membership.unlimited ? 'Unlimited' : 'Membership'}
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {formatCurrency(classSchedule.pricing.membership.monthly, classSchedule.pricing.currency)}/month
                  </Text>
                </View>
              )}
            </View>
            
            {/* Early Bird Discount */}
            {classSchedule.pricing.earlyBird && new Date() < classSchedule.pricing.earlyBird.validUntil && (
              <View className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <Text className="text-xs text-green-700 font-medium">
                  🎉 Early Bird: {classSchedule.pricing.earlyBird.discountPercentage}% off until{' '}
                  {classSchedule.pricing.earlyBird.validUntil.toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Equipment Requirements */}
        {showEquipment && classSchedule.equipment.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Equipment
            </Text>
            <View className="space-y-1">
              {classSchedule.equipment.map((equipment, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <Text className={cn(
                    'text-sm',
                    equipment.required ? 'text-gray-900 font-medium' : 'text-gray-600'
                  )}>
                    {equipment.name} {equipment.required && '*'}
                  </Text>
                  <Text className={cn(
                    'text-xs',
                    equipment.available === 'provided' ? 'text-green-600' :
                    equipment.available === 'rental' ? 'text-blue-600' : 'text-gray-600'
                  )}>
                    {equipment.available === 'provided' ? 'Provided' :
                     equipment.available === 'rental' ? `Rental ${formatCurrency(equipment.rentalCost!, classSchedule.pricing.currency)}` :
                     'Bring own'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Class Benefits */}
        {showBenefits && classSchedule.benefits.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              What You'll Gain
            </Text>
            <View className="space-y-1">
              {classSchedule.benefits.slice(0, 3).map((benefit, index) => (
                <Text key={index} className="text-sm text-gray-600">
                  • {benefit}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Age Restrictions */}
        {classSchedule.ageRestriction && (
          <View className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <Text className="text-xs text-blue-700">
              👥 Age requirement: {classSchedule.ageRestriction.min && `${classSchedule.ageRestriction.min}+`}
              {classSchedule.ageRestriction.min && classSchedule.ageRestriction.max && ' - '}
              {classSchedule.ageRestriction.max && `under ${classSchedule.ageRestriction.max}`}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row space-x-2">
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
          
          <Button
            onPress={onPress}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Text className="text-gray-700 font-medium text-xs">View Details</Text>
          </Button>
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
                  'font-medium text-xs',
                  action.variant === 'outline' ? 'text-gray-700' : 'text-white'
                )}>
                  {action.icon && `${action.icon} `}{action.label}
                </Text>
              </Button>
            ))}
          </View>
        )}

        {/* Class Tags */}
        {!isCompact && classSchedule.tags.length > 0 && (
          <View className="mt-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {classSchedule.tags.map((tag, index) => (
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
  ClassScheduleCardProps,
  ClassSchedule,
  ClassDifficulty,
  EnrollmentStatus,
  RecurrencePattern,
  ClassPricing,
  ClassInstructor,
  ClassEquipment,
  ClassOccurrence,
  ClassAction,
};
