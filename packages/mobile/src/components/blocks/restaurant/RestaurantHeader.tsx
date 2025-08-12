/**
 * RestaurantHeader Component - AI-Optimized React Native Component
 * 
 * A comprehensive restaurant header section for restaurant detail pages.
 * Perfect for displaying restaurant hero images, basic info, ratings, and quick actions.
 * 
 * @category Restaurant Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Restaurant header action button
 */
export interface HeaderAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: string;
  /** Action press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Whether action is loading */
  loading?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Custom color */
  color?: string;
}

/**
 * Operating hours for a day
 */
export interface DayHours {
  /** Day of week */
  day: string;
  /** Opening time */
  open: string;
  /** Closing time */
  close: string;
  /** Whether closed this day */
  isClosed: boolean;
}

/**
 * Restaurant contact information
 */
export interface ContactInfo {
  /** Phone number */
  phone?: string;
  /** Website URL */
  website?: string;
  /** Email address */
  email?: string;
  /** Social media handles */
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

/**
 * Restaurant header data structure
 */
export interface RestaurantHeaderData {
  /** Restaurant ID */
  id: string;
  /** Restaurant name */
  name: string;
  /** Restaurant description/tagline */
  description?: string;
  /** Hero banner image */
  bannerImage: string;
  /** Restaurant logo */
  logo?: string;
  /** Cuisine types */
  cuisines: string[];
  /** Price range indicator */
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  /** Average rating */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Address */
  address: string;
  /** Distance from user */
  distance?: number;
  /** Operating hours today */
  hoursToday?: DayHours;
  /** Whether currently open */
  isOpen: boolean;
  /** Contact information */
  contact?: ContactInfo;
  /** Special badges */
  badges?: string[];
  /** Current promotions */
  promotions?: string[];
  /** Popular items preview */
  popularItems?: string[];
  /** Estimated delivery time */
  deliveryTime?: number;
  /** Delivery fee */
  deliveryFee?: number;
  /** Minimum order amount */
  minimumOrder?: number;
  /** Restaurant features */
  features?: string[];
}

/**
 * RestaurantHeader component props
 */
export interface RestaurantHeaderProps {
  /** Restaurant header data */
  restaurant: RestaurantHeaderData;
  /** Back navigation handler */
  onBack?: () => void;
  /** Share restaurant handler */
  onShare?: () => void;
  /** Add to favorites handler */
  onFavorite?: () => void;
  /** Call restaurant handler */
  onCall?: () => void;
  /** Get directions handler */
  onDirections?: () => void;
  /** View full hours handler */
  onViewHours?: () => void;
  /** View all reviews handler */
  onViewReviews?: () => void;
  /** Start order handler */
  onStartOrder?: () => void;
  /** Make reservation handler */
  onReservation?: () => void;
  /** Whether restaurant is favorited */
  isFavorite?: boolean;
  /** Custom action buttons */
  actions?: HeaderAction[];
  /** Whether to show contact options */
  showContactOptions?: boolean;
  /** Whether to show delivery info */
  showDeliveryInfo?: boolean;
  /** Whether to show operating hours */
  showHours?: boolean;
  /** Whether to show popular items */
  showPopularItems?: boolean;
  /** Header height */
  height?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format distance display
 */
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)} mi`;
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
 * Format operating hours
 */
const formatHours = (hours: DayHours): string => {
  if (hours.isClosed) return 'Closed';
  return `${hours.open} - ${hours.close}`;
};

// === COMPONENT ===

/**
 * RestaurantHeader - Display restaurant hero section with key information
 * 
 * @example
 * ```tsx
 * const restaurantData = {
 *   id: 'rest_123',
 *   name: 'Bella Vista Italian',
 *   description: 'Authentic Italian cuisine in the heart of downtown',
 *   bannerImage: 'restaurant-banner.jpg',
 *   logo: 'restaurant-logo.jpg',
 *   cuisines: ['Italian', 'Pizza', 'Pasta'],
 *   priceRange: '$$',
 *   rating: 4.7,
 *   reviewCount: 1247,
 *   address: '123 Main Street, Downtown',
 *   distance: 0.8,
 *   isOpen: true,
 *   deliveryTime: 30,
 *   deliveryFee: 2.99
 * };
 * 
 * <RestaurantHeader
 *   restaurant={restaurantData}
 *   onBack={() => navigation.goBack()}
 *   onFavorite={() => toggleFavorite(restaurantData.id)}
 *   onStartOrder={() => startOrder(restaurantData.id)}
 *   onCall={() => callRestaurant(restaurantData.contact.phone)}
 *   showDeliveryInfo={true}
 *   showContactOptions={true}
 * />
 * ```
 */
export default function RestaurantHeader({
  restaurant,
  onBack,
  onShare,
  onFavorite,
  onCall,
  onDirections,
  onViewHours,
  onViewReviews,
  onStartOrder,
  onReservation,
  isFavorite = false,
  actions = [],
  showContactOptions = true,
  showDeliveryInfo = true,
  showHours = true,
  showPopularItems = false,
  height = 280,
  testID = 'restaurant-header',
}: RestaurantHeaderProps) {
  // Ensure safe access to restaurant properties
  const safeRestaurant = restaurant || {};

  return (
    <View style={{ height }} testID={testID}>
      
      {/* Hero Banner */}
      <ImageBackground
        source={{ uri: restaurant?.bannerImage || 'https://via.placeholder.com/400x200' }}
        style={{ 
          flex: 1,
          position: 'relative',
        }}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
        }} />
        
        {/* Top Action Bar */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 50,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}>
          
          {/* Back Button */}
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 18, color: '#374151' }}>←</Text>
            </TouchableOpacity>
          )}
          
          {/* Right Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Share Button */}
            {onShare && (
              <TouchableOpacity
                onPress={onShare}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ fontSize: 16 }}>📤</Text>
              </TouchableOpacity>
            )}
            
            {/* Favorite Button */}
            {onFavorite && (
              <TouchableOpacity
                onPress={onFavorite}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ fontSize: 18 }}>
                  {isFavorite ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Restaurant Info Overlay */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255,255,255,0.95)',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}>
          
          {/* Restaurant Name and Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            
            {/* Restaurant Logo */}
            {restaurant.logo && (
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                marginRight: 16,
                overflow: 'hidden',
                backgroundColor: '#F3F4F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <Image
                  source={{ uri: restaurant.logo }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            )}
            
            {/* Restaurant Name and Status */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#111827',
                  flex: 1,
                  marginRight: 12,
                }}>
                  {restaurant.name}
                </Text>
                
                {/* Operating Status */}
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: restaurant.isOpen ? '#ECFDF5' : '#FEE2E2',
                  borderWidth: 1,
                  borderColor: restaurant.isOpen ? '#10B981' : '#EF4444',
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: restaurant.isOpen ? '#059669' : '#DC2626',
                  }}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
              
              {/* Description */}
              {restaurant.description && (
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6B7280', 
                  lineHeight: 18,
                  marginBottom: 8,
                }}>
                  {restaurant.description}
                </Text>
              )}
              
              {/* Cuisines and Price Range */}
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                {(restaurant.cuisines || []).slice(0, 3).map((cuisine, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: '#EFF6FF',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#DBEAFE',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: '#1D4ED8', fontWeight: '600' }}>
                      {cuisine}
                    </Text>
                  </View>
                ))}
                
                <View style={{
                  backgroundColor: '#F3F4F6',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}>
                  <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>
                    {restaurant.priceRange}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Rating and Address */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            
            {/* Rating */}
            <TouchableOpacity onPress={onViewReviews} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                backgroundColor: '#FFF9E6',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#FCD34D',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 14, marginRight: 4 }}>⭐</Text>
                <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '600' }}>
                  {restaurant.rating.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 12, color: '#92400E', marginLeft: 4 }}>
                  ({restaurant.reviewCount})
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Address and Distance */}
            <TouchableOpacity onPress={onDirections} style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#374151', textAlign: 'right' }}>
                📍 {restaurant.address}
              </Text>
              {restaurant.distance && (
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'right', marginTop: 2 }}>
                  {formatDistance(restaurant.distance)} away
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Delivery Info */}
          {showDeliveryInfo && (restaurant.deliveryTime || restaurant.deliveryFee !== undefined) && (
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 16,
            }}>
              
              {/* Delivery Time */}
              {restaurant.deliveryTime && (
                <View style={{
                  backgroundColor: '#EFF6FF',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#DBEAFE',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 12, marginRight: 4 }}>🚚</Text>
                  <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '600' }}>
                    {formatDeliveryTime(restaurant.deliveryTime)}
                  </Text>
                </View>
              )}
              
              {/* Delivery Fee */}
              {restaurant.deliveryFee !== undefined && (
                <View style={{
                  backgroundColor: restaurant.deliveryFee === 0 ? '#ECFDF5' : '#F8F9FA',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: restaurant.deliveryFee === 0 ? '#D1FAE5' : '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 12, marginRight: 4 }}>💰</Text>
                  <Text style={{
                    fontSize: 12,
                    color: restaurant.deliveryFee === 0 ? '#059669' : '#374151',
                    fontWeight: '600',
                  }}>
                    {restaurant.deliveryFee === 0 ? 'Free delivery' : `$${restaurant.deliveryFee.toFixed(2)} fee`}
                  </Text>
                </View>
              )}
              
              {/* Minimum Order */}
              {restaurant.minimumOrder && (
                <View style={{
                  backgroundColor: '#F8F9FA',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 12, marginRight: 4 }}>📦</Text>
                  <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                    ${restaurant.minimumOrder.toFixed(2)} min
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Operating Hours */}
          {showHours && restaurant.hoursToday && (
            <TouchableOpacity 
              onPress={onViewHours}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, marginRight: 8 }}>🕒</Text>
                <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                  Today: {formatHours(restaurant.hoursToday)}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>View all →</Text>
            </TouchableOpacity>
          )}
          
          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            
            {/* Quick Contact Actions */}
            {showContactOptions && (
              <>
                {onCall && restaurant.contact?.phone && (
                  <TouchableOpacity
                    onPress={onCall}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F9FAFB',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 4 }}>📞</Text>
                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                      Call
                    </Text>
                  </TouchableOpacity>
                )}
                
                {onDirections && (
                  <TouchableOpacity
                    onPress={onDirections}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F9FAFB',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 4 }}>🗺️</Text>
                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                      Directions
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            
            {/* Primary Action Button */}
            {onStartOrder && (
              <TouchableOpacity
                onPress={onStartOrder}
                disabled={!restaurant.isOpen}
                style={{
                  flex: 1,
                  backgroundColor: restaurant.isOpen ? '#3B82F6' : '#9CA3AF',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: restaurant.isOpen ? '#3B82F6' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ 
                  color: 'white', 
                  fontWeight: '700', 
                  fontSize: 16,
                }}>
                  {restaurant.isOpen ? 'Start Order' : 'Currently Closed'}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Reservation Button */}
            {onReservation && (
              <TouchableOpacity
                onPress={onReservation}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#3B82F6',
                  backgroundColor: 'white',
                  alignItems: 'center',
                }}
              >
                <Text style={{ 
                  color: '#3B82F6', 
                  fontWeight: '600', 
                  fontSize: 14,
                }}>
                  🪑 Reserve Table
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
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: action.variant === 'primary' ? '#3B82F6' : '#F9FAFB',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: action.variant === 'primary' ? 'white' : '#374151',
                  }}>
                    {action.icon && `${action.icon} `}{action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

// All types are exported inline with their interface declarations
