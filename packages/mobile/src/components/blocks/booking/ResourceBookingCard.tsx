/**
 * ResourceBookingCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive resource booking card for equipment, rooms, and facilities.
 * Features availability calendar, booking constraints, and resource management.
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
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Resource types
 */
export type ResourceType = 'equipment' | 'room' | 'facility' | 'vehicle' | 'tool' | 'space' | 'court' | 'studio';

/**
 * Resource availability status
 */
export type ResourceStatus = 'available' | 'booked' | 'maintenance' | 'out_of_order' | 'reserved';

/**
 * Resource condition ratings
 */
export type ResourceCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';

/**
 * Booking duration units
 */
export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks';

/**
 * Resource features and amenities
 */
export interface ResourceFeature {
  /** Feature identifier */
  id: string;
  /** Feature name */
  name: string;
  /** Feature description */
  description?: string;
  /** Feature icon */
  icon?: string;
  /** Whether feature is available */
  available: boolean;
  /** Additional cost for feature */
  cost?: number;
}

/**
 * Resource specifications
 */
export interface ResourceSpecs {
  /** Dimensions */
  dimensions?: {
    length: number;
    width: number;
    height?: number;
    unit: 'ft' | 'm' | 'in' | 'cm';
  };
  /** Capacity */
  capacity?: {
    maximum: number;
    recommended: number;
    unit: 'people' | 'items' | 'weight';
  };
  /** Technical specifications */
  technical?: Array<{
    name: string;
    value: string;
    unit?: string;
  }>;
  /** Safety features */
  safety?: string[];
  /** Accessibility features */
  accessibility?: string[];
}

/**
 * Resource pricing structure
 */
export interface ResourcePricing {
  /** Base hourly rate */
  hourlyRate: number;
  /** Daily rate */
  dailyRate?: number;
  /** Weekly rate */
  weeklyRate?: number;
  /** Currency code */
  currency: string;
  /** Minimum booking duration */
  minimumDuration: number;
  /** Maximum booking duration */
  maximumDuration: number;
  /** Duration unit */
  durationUnit: DurationUnit;
  /** Setup fee */
  setupFee?: number;
  /** Cleaning fee */
  cleaningFee?: number;
  /** Damage deposit */
  damageDeposit?: number;
  /** Overtime rate */
  overtimeRate?: number;
  /** Discounts for longer bookings */
  discounts?: Array<{
    minDuration: number;
    discountPercentage: number;
    description: string;
  }>;
}

/**
 * Resource booking constraints
 */
export interface BookingConstraints {
  /** Advance booking requirements */
  advanceBooking: {
    minimum: number;
    maximum: number;
    unit: 'hours' | 'days';
  };
  /** Operating hours */
  operatingHours: Array<{
    day: number; // 0=Sunday, 6=Saturday
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
  /** Blackout periods */
  blackoutPeriods?: Array<{
    start: Date;
    end: Date;
    reason: string;
  }>;
  /** Recurring maintenance */
  maintenanceSchedule?: Array<{
    day: number;
    startTime: string;
    endTime: string;
    frequency: 'weekly' | 'monthly';
  }>;
  /** User restrictions */
  userRestrictions?: {
    minimumAge?: number;
    requiresCertification?: boolean;
    requiresSupervision?: boolean;
    certificationTypes?: string[];
  };
}

/**
 * Resource location information
 */
export interface ResourceLocation {
  /** Building name */
  building: string;
  /** Floor number */
  floor?: string;
  /** Room/area number */
  room?: string;
  /** Full address */
  address: string;
  /** GPS coordinates */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Parking availability */
  parking?: {
    available: boolean;
    spaces: number;
    cost?: number;
  };
  /** Access instructions */
  accessInstructions?: string;
}

/**
 * Current booking slot
 */
export interface ResourceBookingSlot {
  /** Slot identifier */
  id: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime: Date;
  /** Booking status */
  status: ResourceStatus;
  /** Booked by (if booked) */
  bookedBy?: {
    name: string;
    contact?: string;
  };
  /** Booking purpose */
  purpose?: string;
  /** Setup requirements */
  setup?: string[];
  /** Special notes */
  notes?: string;
}

/**
 * Main resource data
 */
export interface Resource {
  /** Resource identifier */
  id: string;
  /** Resource name */
  name: string;
  /** Resource description */
  description: string;
  /** Resource type */
  type: ResourceType;
  /** Current status */
  status: ResourceStatus;
  /** Resource condition */
  condition: ResourceCondition;
  /** Resource images */
  images: string[];
  /** Resource specifications */
  specs: ResourceSpecs;
  /** Pricing information */
  pricing: ResourcePricing;
  /** Booking constraints */
  constraints: BookingConstraints;
  /** Resource location */
  location: ResourceLocation;
  /** Available features */
  features: ResourceFeature[];
  /** Current bookings */
  currentBookings: ResourceBookingSlot[];
  /** Upcoming maintenance */
  nextMaintenance?: Date;
  /** Resource manager */
  manager: {
    name: string;
    contact: string;
    email?: string;
  };
  /** Popularity metrics */
  popularity: {
    utilizationRate: number;
    averageRating: number;
    reviewCount: number;
    bookingCount: number;
  };
  /** Resource tags */
  tags: string[];
  /** Last updated */
  lastUpdated: Date;
}

/**
 * Booking request data
 */
export interface BookingRequest {
  /** Requested start time */
  startTime: Date;
  /** Requested duration */
  duration: number;
  /** Duration unit */
  durationUnit: DurationUnit;
  /** Booking purpose */
  purpose: string;
  /** Number of attendees */
  attendeeCount?: number;
  /** Setup requirements */
  setupRequirements: string[];
  /** Special requests */
  specialRequests?: string;
  /** Contact information */
  contact: {
    name: string;
    email: string;
    phone: string;
  };
}

/**
 * Resource action configuration
 */
export interface ResourceAction {
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
 * ResourceBookingCard component props
 */
export interface ResourceBookingCardProps {
  /** Resource data to display */
  resource: Resource;
  /** Booking request data */
  bookingRequest?: BookingRequest;
  /** Card press handler */
  onPress?: () => void;
  /** Book resource handler */
  onBook?: (request: BookingRequest) => void;
  /** Check availability handler */
  onCheckAvailability?: () => void;
  /** View resource details handler */
  onViewDetails?: () => void;
  /** Contact manager handler */
  onContactManager?: () => void;
  /** View location handler */
  onViewLocation?: () => void;
  /** Share resource handler */
  onShare?: () => void;
  /** Custom action buttons */
  actions?: ResourceAction[];
  /** Card layout variant */
  layout?: 'compact' | 'standard' | 'detailed';
  /** Whether to show pricing */
  showPricing?: boolean;
  /** Whether to show features */
  showFeatures?: boolean;
  /** Whether to show current bookings */
  showCurrentBookings?: boolean;
  /** Whether to show specifications */
  showSpecs?: boolean;
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
const formatDateTime = (date: Date): { date: string; time: string } => {
  return {
    date: date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

/**
 * Get resource type color
 */
const getResourceTypeColor = (type: ResourceType): string => {
  const colors: Record<ResourceType, string> = {
    equipment: COLORS.blue[500],
    room: COLORS.green[500],
    facility: COLORS.purple[500],
    vehicle: COLORS.orange[500],
    tool: COLORS.gray[600],
    space: COLORS.indigo[500],
    court: COLORS.yellow[500],
    studio: COLORS.pink[500],
  };
  return colors[type];
};

/**
 * Get status color
 */
const getStatusColor = (status: ResourceStatus): string => {
  const colors: Record<ResourceStatus, string> = {
    available: COLORS.success[500],
    booked: COLORS.error[500],
    maintenance: COLORS.orange[500],
    out_of_order: COLORS.red[600],
    reserved: COLORS.yellow[500],
  };
  return colors[status];
};

/**
 * Get condition color
 */
const getConditionColor = (condition: ResourceCondition): string => {
  const colors: Record<ResourceCondition, string> = {
    excellent: COLORS.success[500],
    good: COLORS.blue[500],
    fair: COLORS.yellow[500],
    needs_repair: COLORS.error[500],
  };
  return colors[condition];
};

/**
 * Calculate total booking cost
 */
const calculateBookingCost = (
  pricing: ResourcePricing,
  duration: number,
  durationUnit: DurationUnit
): number => {
  let baseCost = 0;
  
  switch (durationUnit) {
    case 'hours':
      baseCost = pricing.hourlyRate * duration;
      break;
    case 'days':
      if (pricing.dailyRate) {
        baseCost = pricing.dailyRate * duration;
      } else {
        baseCost = pricing.hourlyRate * 24 * duration;
      }
      break;
    case 'weeks':
      if (pricing.weeklyRate) {
        baseCost = pricing.weeklyRate * duration;
      } else if (pricing.dailyRate) {
        baseCost = pricing.dailyRate * 7 * duration;
      } else {
        baseCost = pricing.hourlyRate * 24 * 7 * duration;
      }
      break;
    default:
      baseCost = pricing.hourlyRate * (duration / 60); // minutes to hours
  }
  
  // Apply discounts
  if (pricing.discounts) {
    for (const discount of pricing.discounts) {
      if (duration >= discount.minDuration) {
        baseCost = baseCost * (1 - discount.discountPercentage / 100);
        break; // Apply only the first matching discount
      }
    }
  }
  
  // Add fees
  const totalCost = baseCost + 
    (pricing.setupFee || 0) + 
    (pricing.cleaningFee || 0);
  
  return totalCost;
};

// === COMPONENT ===

/**
 * ResourceBookingCard - Book equipment, rooms, and facilities
 * 
 * @example
 * ```tsx
 * const resource = {
 *   id: 'res_123',
 *   name: 'Conference Room A',
 *   description: 'Modern conference room with AV equipment',
 *   type: 'room',
 *   status: 'available',
 *   condition: 'excellent',
 *   images: ['room_a_1.jpg', 'room_a_2.jpg'],
 *   specs: {
 *     capacity: { maximum: 12, recommended: 10, unit: 'people' },
 *     dimensions: { length: 20, width: 15, unit: 'ft' }
 *   },
 *   pricing: {
 *     hourlyRate: 50,
 *     currency: 'USD',
 *     minimumDuration: 1,
 *     maximumDuration: 8,
 *     durationUnit: 'hours'
 *   },
 *   location: {
 *     building: 'Main Office',
 *     floor: '2nd Floor',
 *     room: 'Room A',
 *     address: '123 Business St'
 *   },
 *   features: [
 *     { id: 'f1', name: 'Projector', available: true },
 *     { id: 'f2', name: 'Whiteboard', available: true },
 *     { id: 'f3', name: 'Video Conferencing', available: true }
 *   ],
 *   manager: {
 *     name: 'John Smith',
 *     contact: '+1234567890'
 *   },
 *   popularity: {
 *     utilizationRate: 75,
 *     averageRating: 4.6,
 *     reviewCount: 28
 *   }
 * };
 * 
 * <ResourceBookingCard
 *   resource={resource}
 *   onPress={() => navigateToResource(resource.id)}
 *   onBook={(request) => bookResource(request)}
 *   onCheckAvailability={() => checkAvailability(resource.id)}
 *   showPricing={true}
 *   showFeatures={true}
 * />
 * ```
 */
export default function ResourceBookingCard({
  resource,
  bookingRequest,
  onPress,
  onBook,
  onCheckAvailability,
  onViewDetails,
  onContactManager,
  onViewLocation,
  onShare,
  actions = [],
  layout = 'standard',
  showPricing = true,
  showFeatures = true,
  showCurrentBookings = false,
  showSpecs = false,
  loading = false,
  width,
  testID = 'resource-booking-card',
}: ResourceBookingCardProps) {
  
  // State
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

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
          <View className="h-12 bg-gray-200 rounded" />
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isDetailed = layout === 'detailed';
  const isAvailable = resource.status === 'available';
  const estimatedCost = bookingRequest ? 
    calculateBookingCost(resource.pricing, bookingRequest.duration, bookingRequest.durationUnit) : 
    resource.pricing.hourlyRate;

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
                {resource.name}
              </Text>
              
              <Badge 
                variant="secondary"
                style={{ backgroundColor: getResourceTypeColor(resource.type) }}
              >
                <Text className="text-white text-xs font-medium capitalize">
                  {resource.type}
                </Text>
              </Badge>
            </View>
            
            <Text className={cn(
              'text-gray-600 mb-2',
              isCompact ? 'text-xs' : 'text-sm'
            )} numberOfLines={isCompact ? 1 : 2}>
              {resource.description}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-2">
            <Badge 
              variant="secondary"
              style={{ backgroundColor: getStatusColor(resource.status) }}
            >
              <Text className="text-white text-xs font-medium capitalize">
                {resource.status.replace('_', ' ')}
              </Text>
            </Badge>
            
            <Badge 
              variant="secondary"
              style={{ backgroundColor: getConditionColor(resource.condition) }}
            >
              <Text className="text-white text-xs font-medium capitalize">
                {resource.condition.replace('_', ' ')}
              </Text>
            </Badge>
          </View>
        </View>

        {/* Resource Images */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row space-x-2">
            {resource.images.slice(0, 5).map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                className={cn(isCompact ? 'w-16 h-16' : 'w-20 h-20', 'rounded-lg')}
                resizeMode="cover"
              />
            ))}
            {resource.images.length > 5 && (
              <View className={cn(
                isCompact ? 'w-16 h-16' : 'w-20 h-20',
                'bg-gray-100 rounded-lg items-center justify-center'
              )}>
                <Text className="text-gray-600 text-xs font-medium">
                  +{resource.images.length - 5}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Specifications */}
        {showSpecs && resource.specs && !isCompact && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Specifications
            </Text>
            <View className="grid grid-cols-2 gap-2">
              {resource.specs.capacity && (
                <View className="bg-gray-50 p-2 rounded">
                  <Text className="text-xs text-gray-500">Capacity</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {resource.specs.capacity.maximum} {resource.specs.capacity.unit}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    ({resource.specs.capacity.recommended} recommended)
                  </Text>
                </View>
              )}
              
              {resource.specs.dimensions && (
                <View className="bg-gray-50 p-2 rounded">
                  <Text className="text-xs text-gray-500">Size</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {resource.specs.dimensions.length} × {resource.specs.dimensions.width}
                    {resource.specs.dimensions.height && ` × ${resource.specs.dimensions.height}`}
                    {resource.specs.dimensions.unit}
                  </Text>
                </View>
              )}
            </View>
            
            {resource.specs.technical && resource.specs.technical.length > 0 && (
              <View className="mt-2 space-y-1">
                {resource.specs.technical.slice(0, 3).map((spec, index) => (
                  <View key={index} className="flex-row justify-between">
                    <Text className="text-xs text-gray-600">{spec.name}</Text>
                    <Text className="text-xs font-medium text-gray-900">
                      {spec.value} {spec.unit}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Location */}
        <TouchableOpacity
          onPress={onViewLocation}
          className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <Text className="text-sm font-medium text-blue-900 mb-1">
            📍 {resource.location.building}
          </Text>
          <Text className="text-xs text-blue-700">
            {resource.location.floor && `${resource.location.floor}, `}
            {resource.location.room && `${resource.location.room} • `}
            {resource.location.address}
          </Text>
          {resource.location.parking && (
            <Text className="text-xs text-blue-600 mt-1">
              🅿️ {resource.location.parking.spaces} parking spaces
              {resource.location.parking.cost && ` (${formatCurrency(resource.location.parking.cost, resource.pricing.currency)})`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Features */}
        {showFeatures && resource.features.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Available Features
            </Text>
            
            <View className="space-y-2">
              {resource.features.slice(0, showAllFeatures ? undefined : 4).map((feature) => (
                <View key={feature.id} className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Checkbox
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFeatures([...selectedFeatures, feature.id]);
                        } else {
                          setSelectedFeatures(selectedFeatures.filter(id => id !== feature.id));
                        }
                      }}
                      disabled={!feature.available}
                    />
                    <View className="ml-2 flex-1">
                      <Text className={cn(
                        'text-sm',
                        feature.available ? 'text-gray-900' : 'text-gray-500'
                      )}>
                        {feature.icon && `${feature.icon} `}{feature.name}
                      </Text>
                      {feature.description && (
                        <Text className="text-xs text-gray-500">
                          {feature.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {feature.cost && feature.cost > 0 && (
                    <Text className="text-xs text-orange-600">
                      +{formatCurrency(feature.cost, resource.pricing.currency)}
                    </Text>
                  )}
                </View>
              ))}
              
              {resource.features.length > 4 && !showAllFeatures && (
                <TouchableOpacity onPress={() => setShowAllFeatures(true)}>
                  <Text className="text-blue-600 text-sm font-medium">
                    View {resource.features.length - 4} more features →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Current Bookings */}
        {showCurrentBookings && resource.currentBookings.length > 0 && !isCompact && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Today's Schedule
            </Text>
            
            <View className="space-y-2">
              {resource.currentBookings.slice(0, 3).map((booking) => {
                const { time: startTime } = formatDateTime(booking.startTime);
                const { time: endTime } = formatDateTime(booking.endTime);
                
                return (
                  <View key={booking.id} className="flex-row items-center justify-between p-2 bg-gray-50 rounded">
                    <View>
                      <Text className="text-sm font-medium text-gray-900">
                        {startTime} - {endTime}
                      </Text>
                      <Text className="text-xs text-gray-600">
                        {booking.bookedBy?.name || 'Reserved'}
                        {booking.purpose && ` • ${booking.purpose}`}
                      </Text>
                    </View>
                    
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      <Text className="text-white text-xs">
                        {booking.status}
                      </Text>
                    </Badge>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Pricing */}
        {showPricing && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Pricing
            </Text>
            
            <View className="bg-green-50 border border-green-200 rounded-lg p-3">
              <View className="flex-row items-baseline justify-between mb-2">
                <Text className="text-lg font-bold text-green-900">
                  {formatCurrency(resource.pricing.hourlyRate, resource.pricing.currency)}
                </Text>
                <Text className="text-sm text-green-700">
                  per hour
                </Text>
              </View>
              
              {resource.pricing.dailyRate && (
                <Text className="text-sm text-green-700">
                  {formatCurrency(resource.pricing.dailyRate, resource.pricing.currency)} per day
                </Text>
              )}
              
              <Text className="text-xs text-green-600 mt-2">
                Min: {resource.pricing.minimumDuration} {resource.pricing.durationUnit} • 
                Max: {resource.pricing.maximumDuration} {resource.pricing.durationUnit}
              </Text>
              
              {bookingRequest && (
                <View className="mt-2 pt-2 border-t border-green-300">
                  <Text className="text-sm font-semibold text-green-900">
                    Estimated cost: {formatCurrency(estimatedCost, resource.pricing.currency)}
                  </Text>
                  <Text className="text-xs text-green-700">
                    For {bookingRequest.duration} {bookingRequest.durationUnit}
                  </Text>
                </View>
              )}
              
              {(resource.pricing.setupFee || resource.pricing.cleaningFee) && (
                <View className="mt-2 space-y-1">
                  {resource.pricing.setupFee && (
                    <Text className="text-xs text-green-600">
                      + {formatCurrency(resource.pricing.setupFee, resource.pricing.currency)} setup fee
                    </Text>
                  )}
                  {resource.pricing.cleaningFee && (
                    <Text className="text-xs text-green-600">
                      + {formatCurrency(resource.pricing.cleaningFee, resource.pricing.currency)} cleaning fee
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Popularity & Ratings */}
        {resource.popularity && !isCompact && (
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              <Text className="text-xs text-gray-500">
                📊 {resource.popularity.utilizationRate}% utilized
              </Text>
              <Text className="text-xs text-gray-500">
                ⭐ {(resource.popularity?.averageRating ?? 0).toFixed(1)} ({resource.popularity?.reviewCount ?? 0})
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              {resource.popularity.bookingCount} bookings
            </Text>
          </View>
        )}

        {/* Maintenance Notice */}
        {resource.nextMaintenance && (
          <View className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <Text className="text-xs text-yellow-800">
              🔧 Scheduled maintenance: {resource.nextMaintenance.toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="space-y-2">
          {isAvailable ? (
            <View className="flex-row space-x-2">
              <Button
                onPress={onCheckAvailability}
                variant="outline"
                className="flex-1"
              >
                <Text className="text-gray-700 font-medium">Check Availability</Text>
              </Button>
              
              {onBook && (
                <Button
                  onPress={() => {
                    if (bookingRequest) {
                      onBook(bookingRequest);
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!bookingRequest}
                >
                  <Text className="text-white font-medium">
                    {bookingRequest ? 'Book Now' : 'Select Time'}
                  </Text>
                </Button>
              )}
            </View>
          ) : (
            <Button
              onPress={onCheckAvailability}
              variant="outline"
              className="w-full"
              disabled={resource.status === 'out_of_order'}
            >
              <Text className="text-gray-700 font-medium">
                {resource.status === 'out_of_order' ? 'Out of Order' : 
                 resource.status === 'maintenance' ? 'In Maintenance' : 'View Schedule'}
              </Text>
            </Button>
          )}
          
          {/* Secondary Actions */}
          <View className="flex-row space-x-2">
            {onViewDetails && (
              <Button
                onPress={onViewDetails}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Text className="text-gray-700 font-medium text-xs">Details</Text>
              </Button>
            )}
            
            {onContactManager && (
              <Button
                onPress={onContactManager}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Text className="text-gray-700 font-medium text-xs">📞 Contact</Text>
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

        {/* Manager Contact */}
        <View className="mt-4 pt-4 border-t border-gray-200">
          <Text className="text-xs text-gray-500">
            Managed by {resource.manager.name} • {resource.manager.contact}
          </Text>
          <Text className="text-xs text-gray-400">
            Last updated: {resource.lastUpdated.toLocaleDateString()}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  ResourceBookingCardProps,
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceCondition,
  ResourceFeature,
  ResourceSpecs,
  ResourcePricing,
  BookingConstraints,
  ResourceLocation,
  ResourceBookingSlot,
  BookingRequest,
  ResourceAction,
  DurationUnit,
};
