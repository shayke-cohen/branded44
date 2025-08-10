/**
 * ServiceCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive service display card for booking and service-based applications.
 * Perfect for displaying services with pricing, duration, provider info, and booking options.
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
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Service category types for consistent categorization
 */
export type ServiceCategory = 
  | 'health' 
  | 'beauty' 
  | 'fitness' 
  | 'education' 
  | 'professional' 
  | 'home' 
  | 'automotive' 
  | 'entertainment' 
  | 'technology'
  | 'other';

/**
 * Service difficulty or intensity levels
 */
export type ServiceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all';

/**
 * Service pricing structure
 */
export interface ServicePricing {
  /** Base price for the service */
  basePrice: number;
  /** Original price if on sale */
  originalPrice?: number;
  /** Currency code (USD, EUR, etc.) */
  currency: string;
  /** Pricing per unit (hour, session, etc.) */
  unit: string;
  /** Whether service is currently on sale */
  onSale?: boolean;
  /** Discount percentage if on sale */
  discountPercentage?: number;
  /** Price range for variable pricing */
  priceRange?: {
    min: number;
    max: number;
  };
}

/**
 * Service provider information
 */
export interface ServiceProvider {
  /** Provider unique identifier */
  id: string;
  /** Provider name */
  name: string;
  /** Provider profile image */
  image?: string;
  /** Provider rating average */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Provider verification status */
  verified: boolean;
  /** Provider specialties */
  specialties: string[];
  /** Years of experience */
  experience?: number;
}

/**
 * Service availability information
 */
export interface ServiceAvailability {
  /** Whether service is currently available */
  available: boolean;
  /** Next available slot */
  nextAvailable?: Date;
  /** Typical booking lead time */
  leadTime?: string;
  /** Available days of week */
  availableDays?: string[];
}

/**
 * Service data structure
 */
export interface Service {
  /** Service unique identifier */
  id: string;
  /** Service name/title */
  name: string;
  /** Service description */
  description: string;
  /** Service category */
  category: ServiceCategory;
  /** Service duration */
  duration: number;
  /** Duration unit (minutes, hours, days) */
  durationUnit: string;
  /** Service pricing */
  pricing: ServicePricing;
  /** Service provider */
  provider: ServiceProvider;
  /** Service images */
  images: string[];
  /** Service availability */
  availability: ServiceAvailability;
  /** Service level/difficulty */
  level?: ServiceLevel;
  /** Service location type */
  locationType: 'onsite' | 'remote' | 'hybrid';
  /** Service location if onsite */
  location?: string;
  /** Service tags */
  tags: string[];
  /** Service rating */
  rating: number;
  /** Number of service reviews */
  reviewCount: number;
  /** Whether service is featured */
  featured?: boolean;
  /** Service badges */
  badges?: string[];
  /** Maximum group size */
  maxGroupSize?: number;
  /** Minimum booking notice */
  minNotice?: string;
  /** Cancellation policy */
  cancellationPolicy?: string;
}

/**
 * Action button configuration
 */
export interface ServiceAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: string;
  /** Action press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  /** Whether action is loading */
  loading?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * ServiceCard component props
 */
export interface ServiceCardProps {
  /** Service data to display */
  service: Service;
  /** Card press handler */
  onPress?: () => void;
  /** Book service handler */
  onBook?: () => void;
  /** Add to favorites handler */
  onFavorite?: () => void;
  /** Share service handler */
  onShare?: () => void;
  /** View provider handler */
  onViewProvider?: () => void;
  /** Whether service is favorited */
  isFavorite?: boolean;
  /** Custom action buttons */
  actions?: ServiceAction[];
  /** Card layout variant */
  layout?: 'card' | 'list' | 'compact';
  /** Whether to show provider info */
  showProvider?: boolean;
  /** Whether to show pricing */
  showPricing?: boolean;
  /** Whether to show availability */
  showAvailability?: boolean;
  /** Whether to show rating */
  showRating?: boolean;
  /** Whether to show location */
  showLocation?: boolean;
  /** Whether to show duration */
  showDuration?: boolean;
  /** Whether to show booking button */
  showBookingButton?: boolean;
  /** Whether card is loading */
  loading?: boolean;
  /** Custom card width */
  width?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format currency display
 */
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
};

/**
 * Format duration display
 */
const formatDuration = (duration: number, unit: string): string => {
  if (duration === 1) {
    return `${duration} ${unit.slice(0, -1)}`; // Remove 's' for singular
  }
  return `${duration} ${unit}`;
};

/**
 * Get category display color
 */
const getCategoryColor = (category: ServiceCategory): string => {
  const categoryColors: Record<ServiceCategory, string> = {
    health: COLORS.success[500],
    beauty: COLORS.pink[500],
    fitness: COLORS.orange[500],
    education: COLORS.blue[500],
    professional: COLORS.purple[500],
    home: COLORS.green[500],
    automotive: COLORS.gray[600],
    entertainment: COLORS.yellow[500],
    technology: COLORS.cyan[500],
    other: COLORS.gray[500],
  };
  return categoryColors[category] || COLORS.gray[500];
};

// === COMPONENT ===

/**
 * ServiceCard - Display service with booking functionality
 * 
 * @example
 * ```tsx
 * const service = {
 *   id: 'srv_123',
 *   name: 'Personal Training Session',
 *   description: 'One-on-one fitness training with certified trainer',
 *   category: 'fitness',
 *   duration: 60,
 *   durationUnit: 'minutes',
 *   pricing: {
 *     basePrice: 80,
 *     currency: 'USD',
 *     unit: 'session'
 *   },
 *   provider: {
 *     id: 'prov_123',
 *     name: 'Sarah Johnson',
 *     rating: 4.8,
 *     reviewCount: 156,
 *     verified: true,
 *     specialties: ['Weight Training', 'Cardio']
 *   },
 *   availability: { available: true },
 *   rating: 4.9,
 *   reviewCount: 89,
 *   locationType: 'onsite',
 *   tags: ['fitness', 'training', 'health']
 * };
 * 
 * <ServiceCard
 *   service={service}
 *   onPress={() => navigateToService(service.id)}
 *   onBook={() => startBookingFlow(service.id)}
 *   onFavorite={() => toggleFavorite(service.id)}
 *   showProvider={true}
 *   showBookingButton={true}
 * />
 * ```
 */
export default function ServiceCard({
  service,
  onPress,
  onBook,
  onFavorite,
  onShare,
  onViewProvider,
  isFavorite = false,
  actions = [],
  layout = 'card',
  showProvider = true,
  showPricing = true,
  showAvailability = true,
  showRating = true,
  showLocation = true,
  showDuration = true,
  showBookingButton = true,
  loading = false,
  width,
  testID = 'service-card',
}: ServiceCardProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" style={{ width }}>
        <View className="flex-row space-x-3">
          <View className="w-16 h-16 bg-gray-200 rounded-lg" />
          <View className="flex-1 space-y-2">
            <View className="h-4 bg-gray-200 rounded w-3/4" />
            <View className="h-3 bg-gray-200 rounded w-1/2" />
            <View className="h-3 bg-gray-200 rounded w-2/3" />
          </View>
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isList = layout === 'list';

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.8}>
      <Card className={cn(
        'overflow-hidden',
        isCompact ? 'p-3' : 'p-4',
        isList ? 'mb-2' : 'mb-4'
      )} style={{ width }}>
        
        {/* Service Image */}
        <View className={cn(
          'relative',
          isCompact ? 'h-32' : isList ? 'h-40' : 'h-48'
        )}>
          <Image
            source={{ uri: service.images[0] || 'https://via.placeholder.com/400x200' }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
          
          {/* Category Badge */}
          <View className="absolute top-2 left-2">
            <Badge 
              variant="secondary" 
              style={{ backgroundColor: getCategoryColor(service.category) }}
            >
              <Text className="text-white text-xs font-medium capitalize">
                {service.category}
              </Text>
            </Badge>
          </View>

          {/* Featured Badge */}
          {service.featured && (
            <View className="absolute top-2 right-2">
              <Badge variant="default">
                <Text className="text-xs font-medium">⭐ Featured</Text>
              </Badge>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm"
            onPress={onFavorite}
          >
            <Text className="text-lg">
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Service Content */}
        <View className={cn('mt-3', isCompact ? 'space-y-1' : 'space-y-2')}>
          
          {/* Service Name */}
          <Text 
            className={cn(
              'font-semibold text-gray-900',
              isCompact ? 'text-sm' : 'text-base'
            )}
            numberOfLines={isCompact ? 1 : 2}
          >
            {service.name}
          </Text>

          {/* Service Description */}
          {!isCompact && (
            <Text 
              className="text-sm text-gray-600" 
              numberOfLines={2}
            >
              {service.description}
            </Text>
          )}

          {/* Service Details Row */}
          <View className="flex-row items-center justify-between">
            
            {/* Duration */}
            {showDuration && (
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-1">⏱️</Text>
                <Text className="text-xs text-gray-600">
                  {formatDuration(service.duration, service.durationUnit)}
                </Text>
              </View>
            )}

            {/* Location Type */}
            {showLocation && (
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-1">
                  {service.locationType === 'remote' ? '🌐' : 
                   service.locationType === 'hybrid' ? '🔄' : '📍'}
                </Text>
                <Text className="text-xs text-gray-600 capitalize">
                  {service.locationType}
                </Text>
              </View>
            )}

            {/* Rating */}
            {showRating && (
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-1">⭐</Text>
                <Text className="text-xs text-gray-600">
                  {service.rating.toFixed(1)} ({service.reviewCount})
                </Text>
              </View>
            )}
          </View>

          {/* Provider Info */}
          {showProvider && !isCompact && (
            <TouchableOpacity 
              className="flex-row items-center mt-2 p-2 bg-gray-50 rounded-lg"
              onPress={onViewProvider}
            >
              <Avatar className="w-8 h-8 mr-2">
                <Image
                  source={{ uri: service.provider.image || 'https://via.placeholder.com/32x32' }}
                  className="w-full h-full rounded-full"
                  alt={service.provider.name}
                />
              </Avatar>
              
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-gray-900 mr-1">
                    {service.provider.name}
                  </Text>
                  {service.provider.verified && (
                    <Text className="text-xs">✅</Text>
                  )}
                </View>
                
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500 mr-1">⭐</Text>
                  <Text className="text-xs text-gray-600">
                    {service.provider.rating.toFixed(1)} • {service.provider.reviewCount} reviews
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Availability Status */}
          {showAvailability && (
            <View className="flex-row items-center mt-1">
              <View className={cn(
                'w-2 h-2 rounded-full mr-2',
                service.availability.available ? 'bg-green-500' : 'bg-red-500'
              )} />
              <Text className={cn(
                'text-xs font-medium',
                service.availability.available ? 'text-green-600' : 'text-red-600'
              )}>
                {service.availability.available ? 'Available' : 'Unavailable'}
              </Text>
              {service.availability.nextAvailable && !service.availability.available && (
                <Text className="text-xs text-gray-500 ml-1">
                  • Next: {service.availability.nextAvailable.toLocaleDateString()}
                </Text>
              )}
            </View>
          )}

          {/* Pricing and Actions */}
          <View className="flex-row items-center justify-between mt-3">
            
            {/* Pricing */}
            {showPricing && (
              <View>
                <View className="flex-row items-baseline">
                  <Text className="text-lg font-bold text-gray-900">
                    {formatCurrency(service.pricing.basePrice, service.pricing.currency)}
                  </Text>
                  {service.pricing.originalPrice && service.pricing.onSale && (
                    <Text className="text-sm text-gray-500 line-through ml-2">
                      {formatCurrency(service.pricing.originalPrice, service.pricing.currency)}
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-gray-600">
                  per {service.pricing.unit}
                </Text>
              </View>
            )}

            {/* Book Button */}
            {showBookingButton && (
              <Button
                onPress={onBook}
                disabled={!service.availability.available}
                size="sm"
                className={cn(
                  service.availability.available 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400'
                )}
              >
                <Text className="text-white font-medium">
                  {service.availability.available ? 'Book Now' : 'Unavailable'}
                </Text>
              </Button>
            )}
          </View>

          {/* Custom Actions */}
          {actions.length > 0 && (
            <View className="flex-row space-x-2 mt-3">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  onPress={action.onPress}
                  variant={action.variant || 'outline'}
                  size="sm"
                  disabled={action.disabled}
                  className="flex-1"
                >
                  <Text className={cn(
                    'text-xs font-medium',
                    action.variant === 'outline' ? 'text-gray-700' : 'text-white'
                  )}>
                    {action.icon && `${action.icon} `}{action.label}
                  </Text>
                </Button>
              ))}
            </View>
          )}

          {/* Service Tags */}
          {!isCompact && service.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-2">
              {service.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded-full mr-1 mb-1"
                >
                  <Text className="text-xs text-gray-600">
                    #{tag}
                  </Text>
                </View>
              ))}
              {service.tags.length > 3 && (
                <View className="bg-gray-100 px-2 py-1 rounded-full mr-1 mb-1">
                  <Text className="text-xs text-gray-600">
                    +{service.tags.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  ServiceCardProps,
  Service,
  ServiceCategory,
  ServiceLevel,
  ServicePricing,
  ServiceProvider,
  ServiceAvailability,
  ServiceAction,
};
