/**
 * RestaurantCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive restaurant display card for food delivery and restaurant discovery applications.
 * Perfect for displaying restaurants with photos, cuisine, ratings, delivery info, and ordering options.
 * 
 * @category Restaurant Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Restaurant cuisine types for categorization
 */
export type CuisineType = 
  | 'american' 
  | 'italian' 
  | 'chinese' 
  | 'mexican' 
  | 'indian' 
  | 'japanese' 
  | 'thai' 
  | 'mediterranean'
  | 'french'
  | 'korean'
  | 'vietnamese'
  | 'greek'
  | 'pizza'
  | 'burgers'
  | 'sushi'
  | 'seafood'
  | 'vegetarian'
  | 'vegan'
  | 'fast-food'
  | 'fine-dining'
  | 'cafe'
  | 'bakery'
  | 'other';

/**
 * Restaurant price range indicator
 */
export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

/**
 * Restaurant service types
 */
export type ServiceType = 'delivery' | 'pickup' | 'dine-in' | 'catering';

/**
 * Restaurant operating hours
 */
export interface OperatingHours {
  /** Day of week */
  day: string;
  /** Opening time */
  open: string;
  /** Closing time */
  close: string;
  /** Whether restaurant is closed this day */
  isClosed: boolean;
}

/**
 * Delivery information
 */
export interface DeliveryInfo {
  /** Whether delivery is available */
  available: boolean;
  /** Estimated delivery time in minutes */
  estimatedTime?: number;
  /** Delivery fee */
  fee?: number;
  /** Minimum order for delivery */
  minimumOrder?: number;
  /** Maximum delivery distance in miles/km */
  maxDistance?: number;
  /** Delivery zones served */
  zones?: string[];
}

/**
 * Restaurant location information
 */
export interface RestaurantLocation {
  /** Street address */
  address: string;
  /** City */
  city: string;
  /** State/Province */
  state: string;
  /** Postal code */
  postalCode: string;
  /** Country */
  country: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
  /** Distance from user in miles/km */
  distance?: number;
}

/**
 * Restaurant promotional offers
 */
export interface RestaurantPromotion {
  /** Promotion ID */
  id: string;
  /** Promotion title */
  title: string;
  /** Promotion description */
  description: string;
  /** Discount percentage */
  discountPercentage?: number;
  /** Fixed discount amount */
  discountAmount?: number;
  /** Promotion code */
  code?: string;
  /** Expiration date */
  expiresAt?: Date;
  /** Minimum order amount */
  minimumOrder?: number;
}

/**
 * Restaurant data structure
 */
export interface Restaurant {
  /** Restaurant unique identifier */
  id: string;
  /** Restaurant name */
  name: string;
  /** Restaurant description */
  description: string;
  /** Restaurant images */
  images: string[];
  /** Restaurant logo */
  logo?: string;
  /** Cuisine types */
  cuisines: CuisineType[];
  /** Price range indicator */
  priceRange: PriceRange;
  /** Restaurant rating average */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Restaurant location */
  location: RestaurantLocation;
  /** Operating hours */
  hours: OperatingHours[];
  /** Available service types */
  serviceTypes: ServiceType[];
  /** Delivery information */
  delivery: DeliveryInfo;
  /** Whether restaurant is currently open */
  isOpen: boolean;
  /** Whether restaurant is featured */
  featured?: boolean;
  /** Whether restaurant is new */
  isNew?: boolean;
  /** Special badges */
  badges?: string[];
  /** Current promotions */
  promotions?: RestaurantPromotion[];
  /** Popular dishes */
  popularDishes?: string[];
  /** Restaurant phone number */
  phone?: string;
  /** Restaurant website */
  website?: string;
  /** Social media links */
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  /** Health score or certification */
  healthScore?: number;
  /** Sustainability rating */
  sustainabilityRating?: number;
  /** Estimated wait time for dine-in */
  waitTime?: number;
  /** Table reservation availability */
  reservationAvailable?: boolean;
}

/**
 * Action button configuration
 */
export interface RestaurantAction {
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
 * RestaurantCard component props
 */
export interface RestaurantCardProps {
  /** Restaurant data to display */
  restaurant: Restaurant;
  /** Card press handler */
  onPress?: () => void;
  /** View menu handler */
  onViewMenu?: () => void;
  /** Start order handler */
  onOrder?: () => void;
  /** Add to favorites handler */
  onFavorite?: () => void;
  /** View directions handler */
  onDirections?: () => void;
  /** Call restaurant handler */
  onCall?: () => void;
  /** Make reservation handler */
  onReservation?: () => void;
  /** Whether restaurant is favorited */
  isFavorite?: boolean;
  /** Custom action buttons */
  actions?: RestaurantAction[];
  /** Card layout variant */
  layout?: 'card' | 'list' | 'compact';
  /** Whether to show delivery info */
  showDeliveryInfo?: boolean;
  /** Whether to show distance */
  showDistance?: boolean;
  /** Whether to show promotions */
  showPromotions?: boolean;
  /** Whether to show operating hours */
  showHours?: boolean;
  /** Whether to show cuisines */
  showCuisines?: boolean;
  /** Whether to show order button */
  showOrderButton?: boolean;
  /** Whether card is loading */
  loading?: boolean;
  /** Custom card width */
  width?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Get cuisine display color
 */
const getCuisineColor = (cuisine: CuisineType): { bg: string; text: string } => {
  const cuisineColors: Record<string, { bg: string; text: string }> = {
    italian: { bg: '#FEF2F2', text: '#DC2626' },
    chinese: { bg: '#FEF3C7', text: '#D97706' },
    mexican: { bg: '#ECFDF5', text: '#059669' },
    indian: { bg: '#FDF4FF', text: '#C026D3' },
    japanese: { bg: '#EFF6FF', text: '#2563EB' },
    thai: { bg: '#F0FDF4', text: '#16A34A' },
    american: { bg: '#F8FAFC', text: '#475569' },
    pizza: { bg: '#FEF2F2', text: '#EF4444' },
    default: { bg: '#F3F4F6', text: '#374151' },
  };
  return cuisineColors[cuisine] || cuisineColors.default;
};

/**
 * Get price range display
 */
const getPriceRangeDisplay = (priceRange: PriceRange): string => {
  return priceRange;
};

/**
 * Format delivery time
 */
const formatDeliveryTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Format distance
 */
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)} mi`;
};

// === COMPONENT ===

/**
 * RestaurantCard - Display restaurant with ordering functionality
 * 
 * @example
 * ```tsx
 * const restaurant = {
 *   id: 'rest_123',
 *   name: 'Mama Mia Pizzeria',
 *   description: 'Authentic Italian pizza made with fresh ingredients',
 *   cuisines: ['italian', 'pizza'],
 *   priceRange: '$$',
 *   rating: 4.7,
 *   reviewCount: 345,
 *   location: {
 *     address: '123 Main St',
 *     city: 'New York',
 *     state: 'NY',
 *     distance: 0.8
 *   },
 *   delivery: {
 *     available: true,
 *     estimatedTime: 30,
 *     fee: 2.99
 *   },
 *   isOpen: true,
 *   images: ['restaurant.jpg']
 * };
 * 
 * <RestaurantCard
 *   restaurant={restaurant}
 *   onPress={() => navigateToRestaurant(restaurant.id)}
 *   onViewMenu={() => viewMenu(restaurant.id)}
 *   onOrder={() => startOrder(restaurant.id)}
 *   onFavorite={() => toggleFavorite(restaurant.id)}
 *   showDeliveryInfo={true}
 *   showOrderButton={true}
 * />
 * ```
 */
export default function RestaurantCard({
  restaurant,
  onPress,
  onViewMenu,
  onOrder,
  onFavorite,
  onDirections,
  onCall,
  onReservation,
  isFavorite = false,
  actions = [],
  layout = 'card',
  showDeliveryInfo = true,
  showDistance = true,
  showPromotions = true,
  showHours = false,
  showCuisines = true,
  showOrderButton = true,
  loading = false,
  width,
  testID = 'restaurant-card',
}: RestaurantCardProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card style={{ width, padding: 16 }}>
        <View style={{ gap: 12 }}>
          <View style={{ height: 120, backgroundColor: '#E5E7EB', borderRadius: 12 }} />
          <View style={{ gap: 8 }}>
            <View style={{ height: 18, backgroundColor: '#E5E7EB', borderRadius: 4, width: '70%' }} />
            <View style={{ height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, width: '90%' }} />
            <View style={{ height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, width: '60%' }} />
            <View style={{ height: 32, backgroundColor: '#E5E7EB', borderRadius: 4, width: '50%' }} />
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
      }}>
        
        {/* Restaurant Image */}
        <View style={{
          position: 'relative',
          height: isCompact ? 120 : isList ? 140 : 180,
        }}>
          <Image
            source={{ uri: restaurant.images[0] || 'https://via.placeholder.com/400x200' }}
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
          
          {/* Status Badges */}
          <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 }}>
            {restaurant.featured && (
              <View style={{ 
                backgroundColor: '#FFD700',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#8B4513' }}>
                  ⭐ Featured
                </Text>
              </View>
            )}
            
            {restaurant.isNew && (
              <View style={{ 
                backgroundColor: '#10B981',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>
                  ✨ New
                </Text>
              </View>
            )}
          </View>

          {/* Operating Status */}
          <View style={{ position: 'absolute', top: 12, right: 12 }}>
            <View style={{ 
              backgroundColor: restaurant.isOpen ? '#10B981' : '#EF4444',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'white',
                marginRight: 6,
              }} />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

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

          {/* Promotion Banner */}
          {showPromotions && restaurant.promotions && restaurant.promotions.length > 0 && (
            <View style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: '#EF4444',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              maxWidth: '60%',
            }}>
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
                🎉 {restaurant.promotions[0].title}
              </Text>
            </View>
          )}
        </View>

        {/* Restaurant Content */}
        <View style={{ padding: 16 }}>
          
          {/* Restaurant Name and Rating */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text 
                numberOfLines={isCompact ? 1 : 2}
                style={{ 
                  fontWeight: 'bold',
                  color: '#111827',
                  fontSize: isCompact ? 16 : 20,
                  lineHeight: isCompact ? 20 : 26,
                  marginBottom: 4,
                }}
              >
                {restaurant.name}
              </Text>
              
              {/* Cuisines */}
              {showCuisines && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {restaurant.cuisines.slice(0, isCompact ? 2 : 3).map((cuisine, index) => {
                    const colors = getCuisineColor(cuisine);
                    return (
                      <View
                        key={index}
                        style={{ 
                          backgroundColor: colors.bg,
                          paddingHorizontal: 8, 
                          paddingVertical: 3, 
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: colors.text + '20',
                        }}
                      >
                        <Text style={{ 
                          fontSize: 10, 
                          color: colors.text, 
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}>
                          {cuisine.replace('-', ' ')}
                        </Text>
                      </View>
                    );
                  })}
                  {restaurant.cuisines.length > (isCompact ? 2 : 3) && (
                    <View style={{ 
                      backgroundColor: '#F3F4F6',
                      paddingHorizontal: 8, 
                      paddingVertical: 3, 
                      borderRadius: 8,
                    }}>
                      <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600' }}>
                        +{restaurant.cuisines.length - (isCompact ? 2 : 3)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            {/* Rating and Price Range */}
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF9E6', 
                paddingHorizontal: 10, 
                paddingVertical: 6, 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#FCD34D',
                marginBottom: 6,
              }}>
                <Text style={{ fontSize: 12, marginRight: 4 }}>⭐</Text>
                <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '600' }}>
                  {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
                </Text>
              </View>
              
              <View style={{ 
                backgroundColor: '#F3F4F6',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                  {getPriceRangeDisplay(restaurant.priceRange)}
                </Text>
              </View>
            </View>
          </View>

          {/* Restaurant Description */}
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
              {restaurant.description}
            </Text>
          )}

          {/* Delivery Info */}
          {showDeliveryInfo && restaurant.delivery.available && (
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 8, 
              marginTop: 8,
              marginBottom: 16 
            }}>
              
              {/* Delivery Time */}
              {restaurant.delivery.estimatedTime && (
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
                  <Text style={{ fontSize: 12, marginRight: 4 }}>🚚</Text>
                  <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '600' }}>
                    {formatDeliveryTime(restaurant.delivery.estimatedTime)}
                  </Text>
                </View>
              )}

              {/* Delivery Fee */}
              {restaurant.delivery.fee !== undefined && (
                <View style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: restaurant.delivery.fee === 0 ? '#ECFDF5' : '#F8F9FA', 
                  paddingHorizontal: 10, 
                  paddingVertical: 6, 
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: restaurant.delivery.fee === 0 ? '#D1FAE5' : '#E5E7EB',
                }}>
                  <Text style={{ fontSize: 12, marginRight: 4 }}>💰</Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: restaurant.delivery.fee === 0 ? '#059669' : '#374151', 
                    fontWeight: '600' 
                  }}>
                    {restaurant.delivery.fee === 0 ? 'Free delivery' : `$${restaurant.delivery.fee.toFixed(2)} fee`}
                  </Text>
                </View>
              )}

              {/* Distance */}
              {showDistance && restaurant.location.distance && (
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
                  <Text style={{ fontSize: 12, marginRight: 4 }}>📍</Text>
                  <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                    {formatDistance(restaurant.location.distance)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}>
            
            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {onViewMenu && (
                <TouchableOpacity
                  onPress={onViewMenu}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                    📋 Menu
                  </Text>
                </TouchableOpacity>
              )}
              
              {onDirections && (
                <TouchableOpacity
                  onPress={onDirections}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                    🗺️ Directions
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Order Button */}
            {showOrderButton && (
              <TouchableOpacity
                onPress={onOrder}
                disabled={!restaurant.isOpen}
                style={{
                  backgroundColor: restaurant.isOpen ? '#3B82F6' : '#9CA3AF',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 24,
                  shadowColor: restaurant.isOpen ? '#3B82F6' : 'transparent',
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
                  {restaurant.isOpen ? 'Order Now' : 'Closed'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Custom Actions */}
          {actions.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: action.variant === 'default' ? '#3B82F6' : '#F9FAFB',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: action.variant === 'default' ? 'white' : '#374151',
                  }}>
                    {action.icon && `${action.icon} `}{action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Popular Dishes */}
          {!isCompact && restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 6 }}>
                Popular: 
              </Text>
              <Text style={{ fontSize: 12, color: '#374151', lineHeight: 16 }}>
                {restaurant.popularDishes.slice(0, 3).join(' • ')}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  RestaurantCardProps,
  Restaurant,
  CuisineType,
  PriceRange,
  ServiceType,
  OperatingHours,
  DeliveryInfo,
  RestaurantLocation,
  RestaurantPromotion,
  RestaurantAction,
};
