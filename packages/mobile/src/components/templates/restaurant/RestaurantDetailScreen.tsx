/**
 * RestaurantDetailScreen Template - AI-Optimized React Native Component
 * 
 * A comprehensive restaurant detail screen template that displays restaurant information,
 * reviews, photos, menu highlights, and quick actions. Perfect for restaurant discovery apps.
 * 
 * @category Restaurant Templates
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  RefreshControl, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import {
  RestaurantHeader,
  MenuCard,
  type Restaurant,
  type MenuItem,
  type RestaurantHeaderData 
} from '../../blocks/restaurant';
import { ImageGallery, type GalleryImage } from '../../blocks/media';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps } from '../../../lib/types';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Restaurant detail screen configuration
 */
export interface RestaurantDetailScreenConfig {
  /** Screen title */
  title?: string;
  /** Show photo gallery */
  showGallery?: boolean;
  /** Show menu highlights */
  showMenuHighlights?: boolean;
  /** Number of menu highlights to show */
  menuHighlightsCount?: number;
  /** Show reviews section */
  showReviews?: boolean;
  /** Number of reviews to show */
  reviewsCount?: number;
  /** Show restaurant info section */
  showRestaurantInfo?: boolean;
  /** Show operating hours */
  showOperatingHours?: boolean;
  /** Show contact information */
  showContactInfo?: boolean;
  /** Show delivery information */
  showDeliveryInfo?: boolean;
  /** Show social media links */
  showSocialLinks?: boolean;
}

/**
 * Review data structure
 */
export interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  rating: number;
  title?: string;
  content: string;
  date: Date;
  helpful?: number;
  photos?: string[];
  orderItems?: string[];
}

/**
 * Operating hours structure
 */
export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

/**
 * Contact information structure
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

/**
 * Properties for the RestaurantDetailScreen template
 */
export interface RestaurantDetailScreenProps extends BaseComponentProps {
  /** Restaurant information */
  restaurant: Restaurant;
  /** Restaurant photos */
  photos?: GalleryImage[];
  /** Menu highlights */
  menuHighlights?: MenuItem[];
  /** Restaurant reviews */
  reviews?: Review[];
  /** Operating hours */
  operatingHours?: OperatingHours[];
  /** Contact information */
  contactInfo?: ContactInfo;
  /** Callback when menu is viewed */
  onViewMenu?: () => void;
  /** Callback when order is started */
  onStartOrder?: () => void;
  /** Callback when restaurant is favorited */
  onToggleFavorite?: () => Promise<void>;
  /** Callback when directions are requested */
  onGetDirections?: () => void;
  /** Callback when restaurant is called */
  onCallRestaurant?: () => void;
  /** Callback when reservation is made */
  onMakeReservation?: () => void;
  /** Callback when menu item is selected */
  onMenuItemSelect?: (item: MenuItem) => void;
  /** Callback when item is added to cart */
  onAddToCart?: (item: MenuItem, quantity: number) => Promise<void>;
  /** Callback when review is viewed */
  onViewReview?: (review: Review) => void;
  /** Callback when all reviews are viewed */
  onViewAllReviews?: () => void;
  /** Callback when photo is viewed */
  onViewPhoto?: (photo: GalleryImage, index: number) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void>;
  /** Configuration for the screen */
  config?: RestaurantDetailScreenConfig;
  /** Loading state */
  loading?: boolean;
  /** Whether restaurant is favorited */
  isFavorited?: boolean;
  /** Favorited menu items */
  favoritedItems?: Set<string>;
}

/**
 * Default configuration
 */
const defaultConfig: RestaurantDetailScreenConfig = {
  title: 'Restaurant Details',
  showGallery: true,
  showMenuHighlights: true,
  menuHighlightsCount: 6,
  showReviews: true,
  reviewsCount: 3,
  showRestaurantInfo: true,
  showOperatingHours: true,
  showContactInfo: true,
  showDeliveryInfo: true,
  showSocialLinks: true,
};

/**
 * RestaurantDetailScreen - Complete restaurant information interface
 * 
 * @example
 * ```tsx
 * <RestaurantDetailScreen
 *   restaurant={restaurantData}
 *   photos={restaurantPhotos}
 *   menuHighlights={popularItems}
 *   reviews={recentReviews}
 *   operatingHours={hours}
 *   contactInfo={contact}
 *   onViewMenu={handleViewMenu}
 *   onStartOrder={handleStartOrder}
 *   onToggleFavorite={handleToggleFavorite}
 *   onCallRestaurant={handleCall}
 *   onGetDirections={handleDirections}
 *   config={{
 *     showGallery: true,
 *     showMenuHighlights: true,
 *     showReviews: true
 *   }}
 * />
 * ```
 */
export default function RestaurantDetailScreen({
  restaurant,
  photos = [],
  menuHighlights = [],
  reviews = [],
  operatingHours = [],
  contactInfo,
  onViewMenu,
  onStartOrder,
  onToggleFavorite,
  onGetDirections,
  onCallRestaurant,
  onMakeReservation,
  onMenuItemSelect,
  onAddToCart,
  onViewReview,
  onViewAllReviews,
  onViewPhoto,
  onRefresh,
  config = defaultConfig,
  loading = false,
  isFavorited = false,
  favoritedItems = new Set(),
  testID = 'restaurant-detail-screen',
}: RestaurantDetailScreenProps) {

  // Merge with default config
  const screenConfig = { ...defaultConfig, ...config };

  // Internal state
  const [refreshing, setRefreshing] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (item: MenuItem, quantity: number = 1) => {
    try {
      await onAddToCart?.(item, quantity);
      Alert.alert('Added to Cart', `${item.name} has been added to your cart!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  }, [onAddToCart]);

  // Convert restaurant to header data
  const restaurantHeaderData: RestaurantHeaderData = {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    bannerImage: restaurant.images[0] || '',
    logo: restaurant.logo,
    cuisines: restaurant.cuisines,
    priceRange: restaurant.priceRange,
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
    address: `${restaurant.location.address}, ${restaurant.location.city}`,
    distance: restaurant.location.distance,
    isOpen: restaurant.isOpen,
    contact: contactInfo,
    deliveryTime: restaurant.delivery.estimatedTime,
    deliveryFee: restaurant.delivery.fee,
    minimumOrder: restaurant.delivery.minimumOrder,
  };

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* Restaurant Header */}
        <RestaurantHeader
          restaurant={restaurantHeaderData}
          onBack={() => {}} // Will be handled by navigation
          onFavorite={onToggleFavorite}
          onCall={onCallRestaurant}
          onDirections={onGetDirections}
          onStartOrder={onStartOrder}
          onReservation={onMakeReservation}
          isFavorite={isFavorited}
          showContactOptions={true}
          showDeliveryInfo={screenConfig.showDeliveryInfo}
          showHours={screenConfig.showOperatingHours}
          height={300}
        />

        {/* Photo Gallery */}
        {screenConfig.showGallery && photos.length > 0 && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ImageGallery
              images={photos}
              onImagePress={(image, index) => onViewPhoto?.(image, index)}
              layout="grid"
              columns={3}


              style={styles.gallery}
            />
          </View>
        )}

        {/* Menu Highlights */}
        {screenConfig.showMenuHighlights && menuHighlights.length > 0 && (
          <View style={styles.menuSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Items</Text>
              {onViewMenu && (
                <TouchableOpacity onPress={onViewMenu}>
                  <Text style={styles.sectionAction}>View Full Menu</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.menuHighlightsContainer}
            >
              {menuHighlights.slice(0, screenConfig.menuHighlightsCount).map((item) => (
                <View key={item.id} style={styles.menuHighlightItem}>
                  <MenuCard
                    item={item}
                    onPress={() => onMenuItemSelect?.(item)}
                    onAddToCart={(quantity) => handleAddToCart(item, quantity || 1)}
                    onFavorite={() => {}} // TODO: Add item favorite handling
                    isFavorite={favoritedItems.has(item.id)}
                    showDietaryTags={true}
                    showAddToCart={true}
                    layout="compact"
                    width={screenWidth * 0.7}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Restaurant Information */}
        {screenConfig.showRestaurantInfo && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>About This Restaurant</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.restaurantDescription}>
                {restaurant.description}
              </Text>
              
              {/* Cuisine Tags */}
              <View style={styles.cuisineContainer}>
                {restaurant.cuisines.slice(0, 5).map((cuisine, index) => (
                  <View key={index} style={styles.cuisineTag}>
                    <Text style={styles.cuisineText}>{cuisine}</Text>
                  </View>
                ))}
              </View>

              {/* Features */}
              {restaurant.serviceTypes && restaurant.serviceTypes.length > 0 && (
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>Available Services</Text>
                  <View style={styles.featuresList}>
                    {restaurant.serviceTypes.map((service, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureIcon}>
                          {service === 'delivery' ? '🚚' : 
                           service === 'pickup' ? '📦' : 
                           service === 'dine-in' ? '🍽️' : '🛎️'}
                        </Text>
                        <Text style={styles.featureText}>
                          {service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Operating Hours */}
        {screenConfig.showOperatingHours && operatingHours.length > 0 && (
          <View style={styles.hoursSection}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <View style={styles.hoursCard}>
              {operatingHours.map((hours, index) => (
                <View key={index} style={styles.hoursRow}>
                  <Text style={styles.dayText}>{hours.day}</Text>
                  <Text style={[styles.hoursText, hours.isClosed && styles.closedText]}>
                    {hours.isClosed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Information */}
        {screenConfig.showContactInfo && contactInfo && (
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactCard}>
              
              {contactInfo.phone && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={onCallRestaurant}
                >
                  <Text style={styles.contactIcon}>📞</Text>
                  <Text style={styles.contactText}>{contactInfo.phone}</Text>
                </TouchableOpacity>
              )}

              {contactInfo.website && (
                <TouchableOpacity style={styles.contactItem}>
                  <Text style={styles.contactIcon}>🌐</Text>
                  <Text style={styles.contactText}>{contactInfo.website}</Text>
                </TouchableOpacity>
              )}

              {contactInfo.email && (
                <TouchableOpacity style={styles.contactItem}>
                  <Text style={styles.contactIcon}>✉️</Text>
                  <Text style={styles.contactText}>{contactInfo.email}</Text>
                </TouchableOpacity>
              )}

              {/* Social Media */}
              {screenConfig.showSocialLinks && contactInfo.social && (
                <View style={styles.socialContainer}>
                  <Text style={styles.socialTitle}>Follow Us</Text>
                  <View style={styles.socialLinks}>
                    {contactInfo.social.facebook && (
                      <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialIcon}>📘</Text>
                      </TouchableOpacity>
                    )}
                    {contactInfo.social.instagram && (
                      <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialIcon}>📷</Text>
                      </TouchableOpacity>
                    )}
                    {contactInfo.social.twitter && (
                      <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialIcon}>🐦</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Reviews Section */}
        {screenConfig.showReviews && reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              {onViewAllReviews && (
                <TouchableOpacity onPress={onViewAllReviews}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {reviews.slice(0, screenConfig.reviewsCount).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <TouchableOpacity onPress={() => onViewReview?.(review)}>
                  <View style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.author.name}</Text>
                      <View style={styles.reviewRating}>
                        <Text style={styles.reviewStars}>
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewContent} numberOfLines={3}>
                      {review.content}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {review.date.toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  gallerySection: {
    padding: SPACING.md,
  },
  gallery: {
    marginTop: SPACING.sm,
  },
  menuSection: {
    padding: SPACING.md,
  },
  menuHighlightsContainer: {
    paddingLeft: SPACING.md,
  },
  menuHighlightItem: {
    marginRight: SPACING.md,
  },
  infoSection: {
    padding: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  restaurantDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cuisineTag: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cuisineText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary[700],
    textTransform: 'capitalize',
  },
  featuresContainer: {
    marginTop: SPACING.sm,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  hoursSection: {
    padding: SPACING.md,
  },
  hoursCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  hoursText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  closedText: {
    color: COLORS.error[500],
    fontStyle: 'italic',
  },
  contactSection: {
    padding: SPACING.md,
  },
  contactCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.primary[600],
    flex: 1,
  },
  socialContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 20,
  },
  reviewsSection: {
    padding: SPACING.md,
  },
  reviewItem: {
    marginBottom: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewStars: {
    fontSize: 12,
    color: '#FFD700',
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  bottomSpacer: {
    height: 50,
  },
});

// === EXPORTS ===
