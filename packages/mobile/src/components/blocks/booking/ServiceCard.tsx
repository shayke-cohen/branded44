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
    technology: COLORS.indigo[500],
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
      <Card style={{ width, padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 64, height: 64, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, width: '75%' }} />
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, width: '50%' }} />
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, width: '67%' }} />
          </View>
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isList = layout === 'list';

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.95}>
      <Card style={{ 
        width,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
        marginBottom: isList ? 12 : 16,
        padding: isCompact ? 12 : 0,
      }}>
        
        {/* Service Image */}
        <View style={{
          position: 'relative',
          height: isCompact ? 128 : isList ? 160 : 192,
        }}>
          <Image
            source={{ uri: service.images[0] || 'https://via.placeholder.com/400x200' }}
            style={{ 
              width: '100%', 
              height: '100%',
              borderTopLeftRadius: 16, 
              borderTopRightRadius: 16 
            }}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }} />
          
          {/* Category Badge */}
          <View style={{ position: 'absolute', top: 12, left: 12 }}>
            <View style={{ 
              backgroundColor: getCategoryColor(service.category),
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                {service.category}
              </Text>
            </View>
          </View>

          {/* Featured Badge */}
          {service.featured && (
            <View style={{ position: 'absolute', top: 12, right: 12 }}>
              <View style={{ 
                backgroundColor: '#FFD700',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#8B4513' }}>
                  ⭐ Featured
                </Text>
              </View>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              width: 40,
              height: 40,
              backgroundColor: 'white',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={onFavorite}
          >
            <Text style={{ fontSize: 18 }}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Service Content */}
        <View style={{ padding: 16 }}>
          
          {/* Service Name */}
          <Text 
            numberOfLines={isCompact ? 1 : 2}
            style={{ 
              fontWeight: 'bold',
              color: '#111827',
              fontSize: isCompact ? 14 : 18,
              lineHeight: isCompact ? 18 : 24,
              marginBottom: 8,
            }}
          >
            {service.name}
          </Text>

          {/* Service Description */}
          {!isCompact && (
            <Text 
              numberOfLines={2}
              style={{ 
                fontSize: 14,
                color: '#6B7280',
                lineHeight: 20,
                marginBottom: 12,
              }}
            >
              {service.description}
            </Text>
          )}

          {/* Service Details Row */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            gap: 8, 
            marginTop: 12, 
            marginBottom: 16 
          }}>
            
            {/* Duration */}
            {showDuration && (
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8F9FA', 
                paddingHorizontal: 10, 
                paddingVertical: 6, 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}>
                <Text style={{ fontSize: 12, marginRight: 4 }}>⏱️</Text>
                <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                  {formatDuration(service.duration, service.durationUnit)}
                </Text>
              </View>
            )}

            {/* Rating */}
            {showRating && (
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF9E6', 
                paddingHorizontal: 10, 
                paddingVertical: 6, 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#FCD34D',
              }}>
                <Text style={{ fontSize: 12, marginRight: 4 }}>⭐</Text>
                <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '600' }}>
                  {(service.rating ?? 0).toFixed(1)} ({service.reviewCount ?? 0})
                </Text>
              </View>
            )}

            {/* Location Type */}
            {showLocation && (
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#EFF6FF', 
                paddingHorizontal: 10, 
                paddingVertical: 6, 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#DBEAFE',
              }}>
                <Text style={{ fontSize: 12, marginRight: 4, color: '#3B82F6' }}>
                  {service.locationType === 'remote' ? '🌐' : 
                   service.locationType === 'hybrid' ? '🔄' : '📍'}
                </Text>
                <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '600', textTransform: 'capitalize' }}>
                  {service.locationType}
                </Text>
              </View>
            )}
          </View>

          {/* Provider Info */}
          {showProvider && !isCompact && service.provider && (
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
                padding: 12,
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#F3F4F6',
              }}
              onPress={onViewProvider}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginRight: 12,
                overflow: 'hidden',
              }}>
                <Image
                  source={{ uri: service.provider.image || 'https://via.placeholder.com/36x36' }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginRight: 4 }}>
                    {service.provider.name}
                  </Text>
                  {service.provider.verified && (
                    <View style={{
                      backgroundColor: '#10B981',
                      borderRadius: 8,
                      width: 16,
                      height: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                    </View>
                  )}
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, marginRight: 4 }}>⭐</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>
                    {(service.provider?.rating ?? 0).toFixed(1)} • {service.provider?.reviewCount ?? 0} reviews
                  </Text>
                </View>
              </View>
              
              <View style={{
                backgroundColor: '#EFF6FF',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 10, color: '#3B82F6', fontWeight: '600' }}>
                  VIEW PROFILE
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Availability Status */}
          {showAvailability && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginTop: 12,
              marginBottom: 8,
            }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginRight: 6,
                backgroundColor: service.availability.available ? '#10B981' : '#EF4444',
              }} />
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: service.availability.available ? '#059669' : '#DC2626',
              }}>
                {service.availability.available ? 'Available Now' : 'Not Available'}
              </Text>
              {service.availability.nextAvailable && !service.availability.available && (
                <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>
                  • Next: {service.availability.nextAvailable.toLocaleDateString()}
                </Text>
              )}
            </View>
          )}

          {/* Pricing and Actions */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}>
            
            {/* Pricing */}
            {showPricing && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827' }}>
                    {formatCurrency(service.pricing.basePrice, service.pricing.currency)}
                  </Text>
                  {service.pricing.originalPrice && service.pricing.onSale && (
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#9CA3AF', 
                      textDecorationLine: 'line-through', 
                      marginLeft: 8 
                    }}>
                      {formatCurrency(service.pricing.originalPrice, service.pricing.currency)}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  per {service.pricing.unit}
                </Text>
              </View>
            )}

            {/* Book Button */}
            {showBookingButton && (
              <TouchableOpacity
                onPress={onBook}
                disabled={!service.availability.available}
                style={{
                  backgroundColor: service.availability.available ? '#3B82F6' : '#9CA3AF',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 24,
                  shadowColor: service.availability.available ? '#3B82F6' : 'transparent',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 5,
                  minWidth: 100,
                  alignItems: 'center',
                }}
              >
                <Text style={{ 
                  color: 'white', 
                  fontWeight: '700', 
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}>
                  {service.availability.available ? 'Book Now' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
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
