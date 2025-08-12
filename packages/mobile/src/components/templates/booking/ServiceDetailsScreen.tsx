/**
 * ServiceDetailsScreen Template Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive service details screen with provider info, reviews, and booking CTA.
 * Designed for detailed service exploration and booking initiation.
 * 
 * Features:
 * - Service overview with images
 * - Provider profile and credentials
 * - Service pricing and packages
 * - Customer reviews and ratings
 * - Availability calendar
 * - Direct booking button
 * - Service features and inclusions
 * - Similar services suggestions
 * 
 * @example
 * ```tsx
 * <ServiceDetailsScreen
 *   service={serviceData}
 *   provider={providerData}
 *   reviews={serviceReviews}
 *   onBookNow={(service) => startBookingFlow(service)}
 *   onProviderPress={(provider) => viewProviderProfile(provider)}
 * />
 * ```
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { ServiceCard, ReviewCard, BookingCalendar } from '../../blocks/booking';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar } from '../../../../~/components/ui/avatar';
import { Separator } from '../../../../~/components/ui/separator';
import { LoadingCard, ErrorCard } from '../../blocks/utility';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

const { width: screenWidth } = Dimensions.get('window');

// === TYPES ===

/**
 * Service package option
 */
export interface ServicePackage {
  /** Package unique identifier */
  id: string;
  /** Package name */
  name: string;
  /** Package description */
  description: string;
  /** Number of sessions */
  sessions: number;
  /** Package price */
  price: number;
  /** Savings amount */
  savings: number;
  /** Package validity period */
  validityDays: number;
  /** Package features */
  features: string[];
}

/**
 * Similar service
 */
export interface SimilarService {
  /** Service identifier */
  id: string;
  /** Service name */
  name: string;
  /** Service image */
  image: string;
  /** Service price */
  price: number;
  /** Service rating */
  rating: number;
  /** Provider name */
  providerName: string;
}

/**
 * Service feature
 */
export interface ServiceFeature {
  /** Feature identifier */
  id: string;
  /** Feature icon */
  icon: string;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Whether feature is included */
  included: boolean;
}

/**
 * ServiceDetailsScreen component props
 */
export interface ServiceDetailsScreenProps {
  /** Service data */
  service: Service;
  /** Provider data */
  provider?: ServiceProvider;
  /** Service reviews */
  reviews?: Review[];
  /** Service packages */
  packages?: ServicePackage[];
  /** Similar services */
  similarServices?: SimilarService[];
  /** Service features */
  features?: ServiceFeature[];
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** User's favorite status */
  isFavorite?: boolean;
  /** Book now handler */
  onBookNow?: (service: Service) => void;
  /** Provider press handler */
  onProviderPress?: (provider: ServiceProvider) => void;
  /** Review press handler */
  onReviewPress?: (review: Review) => void;
  /** Package selection handler */
  onPackageSelect?: (servicePackage: ServicePackage) => void;
  /** Similar service press handler */
  onSimilarServicePress?: (service: SimilarService) => void;
  /** Favorite toggle handler */
  onFavoriteToggle?: () => void;
  /** Share handler */
  onShare?: () => void;
  /** Navigation handlers */
  onBack?: () => void;
  onViewAllReviews?: () => void;
  onViewProvider?: () => void;
  /** Screen customization */
  showProvider?: boolean;
  showReviews?: boolean;
  showPackages?: boolean;
  showSimilar?: boolean;
  showFeatures?: boolean;
  /** Accessibility */
  testID?: string;
}

// === COMPONENT ===

/**
 * ServiceDetailsScreen - Detailed service view
 * 
 * @example
 * ```tsx
 * const service = {
 *   id: 'svc_1',
 *   name: 'Personal Training Session',
 *   description: 'One-on-one fitness training with certified trainer',
 *   images: ['https://example.com/image1.jpg'],
 *   pricing: { basePrice: 85, currency: 'USD' },
 *   duration: 60,
 *   rating: 4.8,
 *   reviewCount: 124
 * };
 * 
 * <ServiceDetailsScreen
 *   service={service}
 *   provider={provider}
 *   reviews={reviews}
 *   onBookNow={(service) => navigation.navigate('Booking', { serviceId: service.id })}
 * />
 * ```
 */
export default function ServiceDetailsScreen({
  service,
  provider,
  reviews = [],
  packages = [],
  similarServices = [],
  features = [],
  loading = false,
  error,
  isFavorite = false,
  onBookNow,
  onProviderPress,
  onReviewPress,
  onPackageSelect,
  onSimilarServicePress,
  onFavoriteToggle,
  onShare,
  onBack,
  onViewAllReviews,
  onViewProvider,
  showProvider = true,
  showReviews = true,
  showPackages = true,
  showSimilar = true,
  showFeatures = true,
  testID = 'service-details-screen',
}: ServiceDetailsScreenProps) {
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this service: ${service.name}`,
        title: service.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
    onShare?.();
  };

  // Handle book now
  const handleBookNow = () => {
    onBookNow?.(service);
  };

  // Handle provider press
  const handleProviderPress = () => {
    if (provider) {
      onProviderPress?.(provider);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Render image gallery
  const renderImageGallery = () => (
    <View style={styles.imageGallery}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / screenWidth
          );
          setSelectedImageIndex(index);
        }}
      >
        {service.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      
      {/* Image Indicators */}
      {service.images.length > 1 && (
        <View style={styles.imageIndicators}>
          {service.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.imageIndicator,
                index === selectedImageIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.imageActions}>
        <TouchableOpacity
          onPress={onFavoriteToggle}
          style={styles.actionButton}
        >
          <Text style={styles.actionIcon}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleShare}
          style={styles.actionButton}
        >
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render service info
  const renderServiceInfo = () => (
    <View style={styles.serviceInfo}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceTitleSection}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.serviceMetrics}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingText}>⭐ {service.rating}</Text>
              <Text style={styles.reviewCount}>({service.reviewCount} reviews)</Text>
            </View>
            <Badge variant="secondary">
              <Text style={styles.categoryText}>{service.category}</Text>
            </Badge>
          </View>
        </View>
        
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {formatCurrency(service.pricing.basePrice, service.pricing.currency)}
          </Text>
          <Text style={styles.priceUnit}>per {service.pricing.unit}</Text>
        </View>
      </View>

      <Text style={styles.duration}>
        🕒 {service.duration} {service.durationUnit}
      </Text>

      <View style={styles.descriptionSection}>
        <Text
          style={styles.description}
          numberOfLines={showFullDescription ? undefined : 3}
        >
          {service.description}
        </Text>
        {service.description.length > 150 && (
          <TouchableOpacity
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <Text style={styles.readMoreButton}>
              {showFullDescription ? 'Read less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render features
  const renderFeatures = () => (
    showFeatures && features.length > 0 && (
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        {features.map((feature) => (
          <View key={feature.id} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <Text style={styles.featureStatus}>
              {feature.included ? '✅' : '❌'}
            </Text>
          </View>
        ))}
      </View>
    )
  );

  // Render provider section
  const renderProvider = () => (
    showProvider && provider && (
      <View style={styles.providerSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service Provider</Text>
          <TouchableOpacity onPress={onViewProvider}>
            <Text style={styles.viewAllButton}>View Profile</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={handleProviderPress}
          style={styles.providerCard}
          activeOpacity={0.7}
        >
          <Avatar style={styles.providerAvatar}>
            <Image
              source={{ uri: provider.image || 'https://via.placeholder.com/60x60' }}
              style={styles.providerImage}
              alt={provider.name}
            />
          </Avatar>
          
          <View style={styles.providerInfo}>
            <View style={styles.providerHeader}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.verified && <Text style={styles.verifiedBadge}>✅</Text>}
            </View>
            <Text style={styles.providerTitle}>{provider.title}</Text>
            <View style={styles.providerStats}>
              <Text style={styles.providerRating}>
                ⭐ {provider.rating} • {provider.reviewCount} reviews
              </Text>
              <Text style={styles.providerExperience}>
                {provider.experience}+ years experience
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  );

  // Render packages
  const renderPackages = () => (
    showPackages && packages.length > 0 && (
      <View style={styles.packagesSection}>
        <Text style={styles.sectionTitle}>Service Packages</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              onPress={() => onPackageSelect?.(pkg)}
              style={styles.packageCard}
              activeOpacity={0.7}
            >
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Badge variant="default">
                  <Text style={styles.packageSavings}>Save ${pkg.savings}</Text>
                </Badge>
              </View>
              <Text style={styles.packageDescription}>{pkg.description}</Text>
              <Text style={styles.packageSessions}>{pkg.sessions} sessions</Text>
              <Text style={styles.packagePrice}>
                {formatCurrency(pkg.price, service.pricing.currency)}
              </Text>
              <Text style={styles.packageValidity}>
                Valid for {pkg.validityDays} days
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  );

  // Render reviews
  const renderReviews = () => (
    showReviews && reviews.length > 0 && (
      <View style={styles.reviewsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Reviews ({reviews.length})
          </Text>
          <TouchableOpacity onPress={onViewAllReviews}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {reviews.slice(0, 3).map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onPress={() => onReviewPress?.(review)}
            layout="compact"
            showActions={false}
          />
        ))}
      </View>
    )
  );

  // Render similar services
  const renderSimilarServices = () => (
    showSimilar && similarServices.length > 0 && (
      <View style={styles.similarSection}>
        <Text style={styles.sectionTitle}>Similar Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {similarServices.map((similarService) => (
            <TouchableOpacity
              key={similarService.id}
              onPress={() => onSimilarServicePress?.(similarService)}
              style={styles.similarCard}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: similarService.image }}
                style={styles.similarImage}
                resizeMode="cover"
              />
              <Text style={styles.similarName} numberOfLines={2}>
                {similarService.name}
              </Text>
              <Text style={styles.similarProvider}>
                by {similarService.providerName}
              </Text>
              <View style={styles.similarFooter}>
                <Text style={styles.similarRating}>
                  ⭐ {similarService.rating}
                </Text>
                <Text style={styles.similarPrice}>
                  {formatCurrency(similarService.price)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  );

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingCard message="Loading service details..." />
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorCard
          title="Unable to load service"
          message={error}
          onRetry={() => {}}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderImageGallery()}
        {renderServiceInfo()}
        <Separator />
        {renderFeatures()}
        <Separator />
        {renderProvider()}
        <Separator />
        {renderPackages()}
        <Separator />
        {renderReviews()}
        <Separator />
        {renderSimilarServices()}
        
        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookingFooter}>
        <View style={styles.footerPricing}>
          <Text style={styles.footerPrice}>
            {formatCurrency(service.pricing.basePrice, service.pricing.currency)}
          </Text>
          <Text style={styles.footerPriceUnit}>per {service.pricing.unit}</Text>
        </View>
        
        <Button
          onPress={handleBookNow}
          style={styles.bookButton}
          disabled={!service.availability.available}
        >
          <Text style={styles.bookButtonText}>
            {service.availability.available ? 'Book Now' : 'Unavailable'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

// === STYLES ===

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.gray[600],
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.gray[900],
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative' as const,
  },
  serviceImage: {
    width: screenWidth,
    height: 250,
  },
  imageIndicators: {
    position: 'absolute' as const,
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: SPACING.xs,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  activeIndicator: {
    opacity: 1,
  },
  imageActions: {
    position: 'absolute' as const,
    top: SPACING.md,
    right: SPACING.md,
    gap: SPACING.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 18,
  },
  serviceInfo: {
    padding: SPACING.md,
  },
  serviceHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: SPACING.sm,
  },
  serviceTitleSection: {
    flex: 1,
    marginRight: SPACING.md,
  },
  serviceName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  serviceMetrics: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
  },
  ratingSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[900],
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[700],
    textTransform: 'capitalize' as const,
  },
  priceSection: {
    alignItems: 'flex-end' as const,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.primary[600],
  },
  priceUnit: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  duration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  descriptionSection: {
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray[700],
    lineHeight: 24,
  },
  readMoreButton: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    marginTop: SPACING.xs,
  },
  featuresSection: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  featureIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[900],
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  featureStatus: {
    fontSize: 16,
  },
  providerSection: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.md,
  },
  viewAllButton: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  providerCard: {
    flexDirection: 'row' as const,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
  },
  providerAvatar: {
    marginRight: SPACING.md,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  providerInfo: {
    flex: 1,
  },
  providerHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.xs,
  },
  providerName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.gray[900],
    marginRight: SPACING.xs,
  },
  verifiedBadge: {
    fontSize: 14,
  },
  providerTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  providerStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  providerRating: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
  },
  providerExperience: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  packagesSection: {
    padding: SPACING.md,
  },
  packageCard: {
    width: 200,
    padding: SPACING.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  packageHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.sm,
  },
  packageName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.gray[900],
  },
  packageSavings: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.green[700],
  },
  packageDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  packageSessions: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  packagePrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.primary[600],
    marginBottom: SPACING.xs,
  },
  packageValidity: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[500],
  },
  reviewsSection: {
    padding: SPACING.md,
  },
  similarSection: {
    padding: SPACING.md,
  },
  similarCard: {
    width: 150,
    marginRight: SPACING.md,
  },
  similarImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  similarName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  similarProvider: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  similarFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  similarRating: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[700],
  },
  similarPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.primary[600],
  },
  bottomPadding: {
    height: 100,
  },
  bookingFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerPricing: {
    flex: 1,
    marginRight: SPACING.md,
  },
  footerPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
  },
  footerPriceUnit: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  bookButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary[600],
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.white,
  },
};

// === EXPORTS ===

export type {
  ServiceDetailsScreenProps,
  ServicePackage,
  SimilarService,
  ServiceFeature,
};
