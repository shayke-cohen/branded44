/**
 * ServiceProviderCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive service provider profile card for booking and service-based applications.
 * Perfect for displaying provider information, ratings, specialties, and availability.
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
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Provider verification levels
 */
export type VerificationLevel = 'none' | 'basic' | 'verified' | 'premium' | 'expert';

/**
 * Provider availability status
 */
export type ProviderStatus = 'available' | 'busy' | 'offline' | 'on_break' | 'booked';

/**
 * Provider specialties and skills
 */
export interface ProviderSpecialty {
  /** Specialty identifier */
  id: string;
  /** Specialty name */
  name: string;
  /** Years of experience in this specialty */
  experience: number;
  /** Specialty certification */
  certified?: boolean;
  /** Specialty level */
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * Provider certifications and credentials
 */
export interface ProviderCertification {
  /** Certification identifier */
  id: string;
  /** Certification name */
  name: string;
  /** Issuing organization */
  issuer: string;
  /** Issue date */
  issueDate: Date;
  /** Expiry date */
  expiryDate?: Date;
  /** Certification number */
  number?: string;
  /** Whether certification is verified */
  verified: boolean;
}

/**
 * Provider working hours
 */
export interface WorkingHours {
  /** Day of week (0 = Sunday, 6 = Saturday) */
  day: number;
  /** Start time (24-hour format) */
  startTime: string;
  /** End time (24-hour format) */
  endTime: string;
  /** Whether available on this day */
  available: boolean;
  /** Break times */
  breaks?: Array<{
    startTime: string;
    endTime: string;
    reason?: string;
  }>;
}

/**
 * Provider pricing structure
 */
export interface ProviderPricing {
  /** Base hourly rate */
  hourlyRate: number;
  /** Currency code */
  currency: string;
  /** Minimum booking duration */
  minimumDuration: number;
  /** Duration unit */
  durationUnit: string;
  /** Package deals */
  packages?: Array<{
    id: string;
    name: string;
    sessions: number;
    price: number;
    savings: number;
  }>;
  /** Travel fee for onsite services */
  travelFee?: number;
  /** Emergency/rush fee */
  rushFee?: number;
}

/**
 * Provider statistics
 */
export interface ProviderStats {
  /** Total services completed */
  completedServices: number;
  /** Total clients served */
  totalClients: number;
  /** Response time in minutes */
  averageResponseTime: number;
  /** Booking acceptance rate */
  acceptanceRate: number;
  /** No-show rate */
  noShowRate: number;
  /** Cancellation rate */
  cancellationRate: number;
  /** On-time rate */
  onTimeRate: number;
}

/**
 * Service provider data structure
 */
export interface ServiceProvider {
  /** Provider unique identifier */
  id: string;
  /** Provider full name */
  name: string;
  /** Provider profile image */
  image?: string;
  /** Provider bio/description */
  bio: string;
  /** Provider title/role */
  title: string;
  /** Provider location */
  location: string;
  /** Years of total experience */
  experience: number;
  /** Provider rating average */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Verification level */
  verification: VerificationLevel;
  /** Current availability status */
  status: ProviderStatus;
  /** Provider specialties */
  specialties?: ProviderSpecialty[];
  /** Provider certifications */
  certifications?: ProviderCertification[];
  /** Working hours */
  workingHours?: WorkingHours[];
  /** Pricing information */
  pricing?: ProviderPricing;
  /** Provider statistics */
  stats?: ProviderStats;
  /** Languages spoken */
  languages?: string[];
  /** Services offered */
  services?: string[];
  /** Provider badges */
  badges?: string[];
  /** Whether provider is featured */
  featured?: boolean;
  /** Provider portfolio images */
  portfolio?: string[];
  /** Response time description */
  responseTime: string;
  /** Booking policies */
  policies: {
    cancellation: string;
    rescheduling: string;
    noShow: string;
  };
  /** Next available slot */
  nextAvailable?: Date;
  /** Whether provider offers remote services */
  offersRemote: boolean;
  /** Travel radius for onsite services */
  travelRadius?: number;
}

/**
 * Action button configuration
 */
export interface ProviderAction {
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
 * ServiceProviderCard component props
 */
export interface ServiceProviderCardProps {
  /** Provider data to display */
  provider: ServiceProvider;
  /** Card press handler */
  onPress?: () => void;
  /** Book with provider handler */
  onBook?: () => void;
  /** Contact provider handler */
  onContact?: () => void;
  /** View provider details handler */
  onViewDetails?: () => void;
  /** Add to favorites handler */
  onFavorite?: () => void;
  /** Share provider handler */
  onShare?: () => void;
  /** Whether provider is favorited */
  isFavorite?: boolean;
  /** Custom action buttons */
  actions?: ProviderAction[];
  /** Card layout variant */
  layout?: 'card' | 'list' | 'compact' | 'detailed';
  /** Whether to show rating */
  showRating?: boolean;
  /** Whether to show specialties */
  showSpecialties?: boolean;
  /** Whether to show pricing */
  showPricing?: boolean;
  /** Whether to show availability */
  showAvailability?: boolean;
  /** Whether to show stats */
  showStats?: boolean;
  /** Whether to show portfolio */
  showPortfolio?: boolean;
  /** Whether to show book button */
  showBookButton?: boolean;
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
 * Get verification badge color
 */
const getVerificationColor = (level: VerificationLevel): string => {
  const colors: Record<VerificationLevel, string> = {
    none: COLORS.gray[400],
    basic: COLORS.blue[500],
    verified: COLORS.green[500],
    premium: COLORS.purple[500],
    expert: COLORS.yellow[500],
  };
  return colors[level];
};

/**
 * Get status indicator color
 */
const getStatusColor = (status: ProviderStatus): string => {
  const colors: Record<ProviderStatus, string> = {
    available: COLORS.green[500],
    busy: COLORS.yellow[500],
    offline: COLORS.gray[400],
    on_break: COLORS.orange[500],
    booked: COLORS.red[500],
  };
  return colors[status];
};

/**
 * Format status display text
 */
const formatStatus = (status: ProviderStatus): string => {
  const statusText: Record<ProviderStatus, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
    on_break: 'On Break',
    booked: 'Fully Booked',
  };
  return statusText[status];
};

// === COMPONENT ===

/**
 * ServiceProviderCard - Display service provider with booking functionality
 * 
 * @example
 * ```tsx
 * const provider = {
 *   id: 'prov_123',
 *   name: 'Dr. Sarah Johnson',
 *   title: 'Licensed Physical Therapist',
 *   bio: 'Specialized in sports injury rehabilitation with 10+ years experience',
 *   location: 'New York, NY',
 *   experience: 12,
 *   rating: 4.9,
 *   reviewCount: 245,
 *   verification: 'verified',
 *   status: 'available',
 *   specialties: [
 *     { id: '1', name: 'Sports Therapy', experience: 10, level: 'expert' }
 *   ],
 *   pricing: {
 *     hourlyRate: 120,
 *     currency: 'USD',
 *     minimumDuration: 60,
 *     durationUnit: 'minutes'
 *   },
 *   responseTime: 'Usually responds within 1 hour'
 * };
 * 
 * <ServiceProviderCard
 *   provider={provider}
 *   onPress={() => navigateToProvider(provider.id)}
 *   onBook={() => startBookingFlow(provider.id)}
 *   onContact={() => contactProvider(provider.id)}
 *   showRating={true}
 *   showSpecialties={true}
 *   showBookButton={true}
 * />
 * ```
 */
export default function ServiceProviderCard({
  provider,
  onPress,
  onBook,
  onContact,
  onViewDetails,
  onFavorite,
  onShare,
  isFavorite = false,
  actions = [],
  layout = 'card',
  showRating = true,
  showSpecialties = true,
  showPricing = true,
  showAvailability = true,
  showStats = false,
  showPortfolio = false,
  showBookButton = true,
  loading = false,
  width,
  testID = 'service-provider-card',
}: ServiceProviderCardProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" style={{ width }}>
        <View className="flex-row space-x-3">
          <View className="w-16 h-16 bg-gray-200 rounded-full" />
          <View className="flex-1 space-y-2">
            <View className="h-4 bg-gray-200 rounded w-3/4" />
            <View className="h-3 bg-gray-200 rounded w-1/2" />
            <View className="h-3 bg-gray-200 rounded w-2/3" />
          </View>
        </View>
      </Card>
    );
  }

  // Early safety check for provider data
  if (!provider || !provider.id || !provider.name) {
    return (
      <Card style={{ width, padding: 16, marginBottom: 12 }}>
        <Text style={{ color: '#EF4444', fontSize: 14, textAlign: 'center' }}>
          Invalid provider data
        </Text>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isList = layout === 'list';
  const isDetailed = layout === 'detailed';

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.8}>
      <Card className={cn(
        'overflow-hidden',
        isCompact ? 'p-3' : 'p-4',
        isList ? 'mb-2' : 'mb-4'
      )} style={{ width }}>
        
        {/* Provider Header */}
        <View className="flex-row items-start space-x-3">
          
          {/* Provider Avatar */}
          <View className="relative">
            <Avatar className={cn(
              isCompact ? 'w-12 h-12' : 'w-16 h-16'
            )}>
              <Image
                source={{ uri: provider.image || 'https://via.placeholder.com/64x64' }}
                className="w-full h-full rounded-full"
                alt={provider.name}
              />
            </Avatar>
            
            {/* Status Indicator */}
            <View 
              className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                `bg-[${getStatusColor(provider.status)}]`
              )}
              style={{ backgroundColor: getStatusColor(provider.status) }}
            />

            {/* Favorite Button */}
            {!isCompact && (
              <TouchableOpacity
                className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full items-center justify-center shadow-sm"
                onPress={onFavorite}
              >
                <Text className="text-sm">
                  {isFavorite ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Provider Info */}
          <View className="flex-1">
            
            {/* Name and Verification */}
            <View className="flex-row items-center space-x-2">
              <Text className={cn(
                'font-semibold text-gray-900',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                {provider.name}
              </Text>
              
              {provider.verification !== 'none' && (
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: getVerificationColor(provider.verification) }}
                >
                  <Text className="text-white text-xs font-medium capitalize">
                    {provider.verification === 'verified' ? '✓' : provider.verification}
                  </Text>
                </Badge>
              )}

              {provider.featured && (
                <Badge variant="default">
                  <Text className="text-xs font-medium">⭐</Text>
                </Badge>
              )}
            </View>

            {/* Title */}
            <Text className={cn(
              'text-gray-600 mt-1',
              isCompact ? 'text-xs' : 'text-sm'
            )}>
              {provider.title}
            </Text>

            {/* Rating and Reviews */}
            {showRating && (
              <View className="flex-row items-center mt-1">
                <Text className="text-yellow-500 mr-1">⭐</Text>
                <Text className={cn(
                  'font-medium text-gray-900 mr-1',
                  isCompact ? 'text-xs' : 'text-sm'
                )}>
                  {provider.rating.toFixed(1)}
                </Text>
                <Text className={cn(
                  'text-gray-500',
                  isCompact ? 'text-xs' : 'text-sm'
                )}>
                  ({provider.reviewCount} reviews)
                </Text>
              </View>
            )}

            {/* Experience and Location */}
            <View className="flex-row items-center mt-1 space-x-3">
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-1">🎓</Text>
                <Text className="text-xs text-gray-600">
                  {provider.experience} years exp.
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-1">📍</Text>
                <Text className="text-xs text-gray-600">
                  {provider.location}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Provider Bio */}
        {!isCompact && (
          <Text 
            className="text-sm text-gray-600 mt-3" 
            numberOfLines={isDetailed ? undefined : 2}
          >
            {provider.bio}
          </Text>
        )}

        {/* Specialties */}
        {showSpecialties && provider.specialties && provider.specialties.length > 0 && (
          <View className="mt-3">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Specialties
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {provider.specialties?.slice(0, isCompact ? 2 : 4).map((specialty) => (
                  <View
                    key={specialty.id}
                    className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
                  >
                    <Text className="text-xs text-blue-700 font-medium">
                      {specialty.name}
                    </Text>
                  </View>
                )) || []}
                {(provider.specialties?.length || 0) > (isCompact ? 2 : 4) && (
                  <View className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-xs text-gray-600">
                      +{(provider.specialties?.length || 0) - (isCompact ? 2 : 4)} more
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Availability Status */}
        {showAvailability && (
          <View className="flex-row items-center justify-between mt-3 p-2 bg-gray-50 rounded-lg">
            <View className="flex-row items-center">
              <View className={cn(
                'w-2 h-2 rounded-full mr-2'
              )} style={{ backgroundColor: getStatusColor(provider.status) }} />
              <Text className="text-sm font-medium text-gray-900">
                {formatStatus(provider.status)}
              </Text>
            </View>
            
            {provider.nextAvailable && (
              <Text className="text-xs text-gray-500">
                Next: {provider.nextAvailable.toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Response Time */}
        {!isCompact && (
          <View className="flex-row items-center mt-2">
            <Text className="text-xs text-gray-500 mr-1">💬</Text>
            <Text className="text-xs text-gray-600">
              {provider.responseTime}
            </Text>
          </View>
        )}

        {/* Statistics */}
        {showStats && isDetailed && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Performance Stats
            </Text>
            <View className="grid grid-cols-2 gap-2">
              <View className="bg-gray-50 p-2 rounded-lg">
                <Text className="text-xs text-gray-500">Completed Services</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {provider.stats?.completedServices || 0}
                </Text>
              </View>
              <View className="bg-gray-50 p-2 rounded-lg">
                <Text className="text-xs text-gray-500">On-Time Rate</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {((provider.stats?.onTimeRate || 0) * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Portfolio Preview */}
        {showPortfolio && provider.portfolio && (provider.portfolio?.length || 0) > 0 && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Portfolio
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {(provider.portfolio || []).slice(0, 5).map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Pricing and Actions */}
        <View className="flex-row items-center justify-between mt-4">
          
          {/* Pricing */}
          {showPricing && provider.pricing && (
            <View>
              <Text className="text-lg font-bold text-gray-900">
                {formatCurrency(provider.pricing.hourlyRate || 0, provider.pricing.currency || 'USD')}
              </Text>
              <Text className="text-xs text-gray-600">
                per {(provider.pricing.durationUnit || 'hours').slice(0, -1)} • {provider.pricing.minimumDuration || 60} min min
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-2">
            {!isCompact && onContact && (
              <Button
                onPress={onContact}
                variant="outline"
                size="sm"
              >
                <Text className="text-gray-700 font-medium text-sm">
                  💬 Contact
                </Text>
              </Button>
            )}

            {showBookButton && onBook && (
              <Button
                onPress={onBook}
                disabled={provider.status === 'offline' || provider.status === 'booked'}
                size="sm"
                className={cn(
                  provider.status === 'available' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400'
                )}
              >
                <Text className="text-white font-medium text-sm">
                  {provider.status === 'available' ? 'Book Now' : 'Unavailable'}
                </Text>
              </Button>
            )}
          </View>
        </View>

        {/* Custom Actions */}
        {(actions?.length || 0) > 0 && (
          <View className="flex-row space-x-2 mt-3">
            {(actions || []).map((action) => (
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

        {/* Languages */}
        {!isCompact && (provider.languages?.length || 0) > 0 && (
          <View className="mt-3">
            <Text className="text-xs text-gray-500 mb-1">Languages:</Text>
            <Text className="text-xs text-gray-600">
              {(provider.languages || []).join(', ')}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  ServiceProviderCardProps,
  ServiceProvider,
  VerificationLevel,
  ProviderStatus,
  ProviderSpecialty,
  ProviderCertification,
  WorkingHours,
  ProviderPricing,
  ProviderStats,
  ProviderAction,
};
