/**
 * ReviewCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive review display card for services and providers.
 * Features ratings, photos, helpful votes, and response functionality.
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
import { Avatar } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Review verification status
 */
export type ReviewVerification = 'verified' | 'unverified' | 'pending';

/**
 * Review rating breakdown
 */
export interface RatingBreakdown {
  /** Overall rating (1-5) */
  overall: number;
  /** Service quality rating */
  serviceQuality?: number;
  /** Communication rating */
  communication?: number;
  /** Punctuality rating */
  punctuality?: number;
  /** Value for money rating */
  valueForMoney?: number;
  /** Professionalism rating */
  professionalism?: number;
}

/**
 * Review author information
 */
export interface ReviewAuthor {
  /** Author identifier */
  id: string;
  /** Author name */
  name: string;
  /** Author avatar image */
  avatar?: string;
  /** Author verification status */
  verified: boolean;
  /** Total reviews by author */
  totalReviews: number;
  /** Author's average rating given */
  averageRating?: number;
  /** Author location */
  location?: string;
  /** Whether author is anonymous */
  anonymous?: boolean;
}

/**
 * Review media attachments
 */
export interface ReviewMedia {
  /** Media identifier */
  id: string;
  /** Media type */
  type: 'image' | 'video';
  /** Media URL */
  url: string;
  /** Media thumbnail URL */
  thumbnail?: string;
  /** Media caption */
  caption?: string;
  /** Media alt text */
  alt?: string;
}

/**
 * Provider response to review
 */
export interface ProviderResponse {
  /** Response identifier */
  id: string;
  /** Response text */
  text: string;
  /** Response date */
  date: Date;
  /** Provider name */
  providerName: string;
  /** Provider title */
  providerTitle?: string;
  /** Whether response is from verified provider */
  verified: boolean;
}

/**
 * Review helpfulness votes
 */
export interface ReviewHelpfulness {
  /** Number of helpful votes */
  helpful: number;
  /** Number of not helpful votes */
  notHelpful: number;
  /** Whether current user voted helpful */
  userVotedHelpful?: boolean;
  /** Whether current user voted not helpful */
  userVotedNotHelpful?: boolean;
}

/**
 * Service information for review context
 */
export interface ReviewServiceInfo {
  /** Service identifier */
  id: string;
  /** Service name */
  name: string;
  /** Service date */
  serviceDate?: Date;
  /** Service price */
  price?: number;
  /** Currency code */
  currency?: string;
}

/**
 * Main review data
 */
export interface Review {
  /** Review identifier */
  id: string;
  /** Review title */
  title?: string;
  /** Review text content */
  content: string;
  /** Rating breakdown */
  rating: RatingBreakdown;
  /** Review author */
  author: ReviewAuthor;
  /** Review creation date */
  date: Date;
  /** Review verification status */
  verification: ReviewVerification;
  /** Review media attachments */
  media: ReviewMedia[];
  /** Provider response */
  response?: ProviderResponse;
  /** Review helpfulness */
  helpfulness: ReviewHelpfulness;
  /** Service information */
  service?: ReviewServiceInfo;
  /** Review tags/categories */
  tags: string[];
  /** Whether review is featured */
  featured?: boolean;
  /** Review language */
  language?: string;
  /** Review was edited */
  edited?: boolean;
  /** Last edit date */
  editDate?: Date;
  /** Review flagged status */
  flagged?: boolean;
}

/**
 * Review action configuration
 */
export interface ReviewAction {
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
 * ReviewCard component props
 */
export interface ReviewCardProps {
  /** Review data to display */
  review: Review;
  /** Card press handler */
  onPress?: () => void;
  /** Author profile press handler */
  onAuthorPress?: () => void;
  /** Helpful vote handler */
  onHelpfulVote?: () => void;
  /** Not helpful vote handler */
  onNotHelpfulVote?: () => void;
  /** Report review handler */
  onReport?: () => void;
  /** Share review handler */
  onShare?: () => void;
  /** Media press handler */
  onMediaPress?: (media: ReviewMedia, index: number) => void;
  /** Provider response press handler */
  onResponsePress?: () => void;
  /** Custom action buttons */
  actions?: ReviewAction[];
  /** Card layout variant */
  layout?: 'compact' | 'standard' | 'detailed';
  /** Whether to show rating breakdown */
  showRatingBreakdown?: boolean;
  /** Whether to show helpfulness votes */
  showHelpfulness?: boolean;
  /** Whether to show media */
  showMedia?: boolean;
  /** Whether to show provider response */
  showResponse?: boolean;
  /** Whether to show service info */
  showServiceInfo?: boolean;
  /** Whether to show tags */
  showTags?: boolean;
  /** Maximum lines for review content */
  maxContentLines?: number;
  /** Whether card is loading */
  loading?: boolean;
  /** Custom card width */
  width?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format date for display
 */
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

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
 * Render star rating
 */
const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md'): JSX.Element => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const starSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Text key={i} className={cn(starSize, 'text-yellow-500')}>⭐</Text>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Text key={i} className={cn(starSize, 'text-yellow-500')}>⭐</Text>
      );
    } else {
      stars.push(
        <Text key={i} className={cn(starSize, 'text-gray-300')}>⭐</Text>
      );
    }
  }
  
  return <View className="flex-row">{stars}</View>;
};

/**
 * Get verification badge color
 */
const getVerificationColor = (verification: ReviewVerification): string => {
  const colors: Record<ReviewVerification, string> = {
    verified: COLORS.success[500],
    unverified: COLORS.gray[400],
    pending: COLORS.yellow[500],
  };
  return colors[verification];
};

// === COMPONENT ===

/**
 * ReviewCard - Display customer review with ratings and media
 * 
 * @example
 * ```tsx
 * const review = {
 *   id: 'rev_123',
 *   title: 'Excellent service!',
 *   content: 'Sarah was amazing! Very professional and the results exceeded my expectations.',
 *   rating: {
 *     overall: 5,
 *     serviceQuality: 5,
 *     communication: 5,
 *     punctuality: 4
 *   },
 *   author: {
 *     id: 'user_456',
 *     name: 'John D.',
 *     verified: true,
 *     totalReviews: 12
 *   },
 *   date: new Date('2024-01-10'),
 *   verification: 'verified',
 *   media: [],
 *   helpfulness: {
 *     helpful: 5,
 *     notHelpful: 0
 *   },
 *   tags: ['professional', 'punctual', 'quality']
 * };
 * 
 * <ReviewCard
 *   review={review}
 *   onPress={() => viewReviewDetails(review.id)}
 *   onHelpfulVote={() => voteHelpful(review.id)}
 *   onAuthorPress={() => viewAuthorProfile(review.author.id)}
 *   showRatingBreakdown={true}
 *   showHelpfulness={true}
 * />
 * ```
 */
export default function ReviewCard({
  review,
  onPress,
  onAuthorPress,
  onHelpfulVote,
  onNotHelpfulVote,
  onReport,
  onShare,
  onMediaPress,
  onResponsePress,
  actions = [],
  layout = 'standard',
  showRatingBreakdown = false,
  showHelpfulness = true,
  showMedia = true,
  showResponse = true,
  showServiceInfo = false,
  showTags = true,
  maxContentLines = 4,
  loading = false,
  width,
  testID = 'review-card',
}: ReviewCardProps) {
  
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Handle loading state
  if (loading) {
    return (
      <Card className="p-4 animate-pulse" style={{ width }}>
        <View className="space-y-3">
          <View className="flex-row items-center space-x-3">
            <View className="w-12 h-12 bg-gray-200 rounded-full" />
            <View className="flex-1 space-y-2">
              <View className="h-4 bg-gray-200 rounded w-1/2" />
              <View className="h-3 bg-gray-200 rounded w-1/3" />
            </View>
          </View>
          <View className="space-y-2">
            <View className="h-3 bg-gray-200 rounded w-full" />
            <View className="h-3 bg-gray-200 rounded w-3/4" />
            <View className="h-3 bg-gray-200 rounded w-1/2" />
          </View>
        </View>
      </Card>
    );
  }

  const isCompact = layout === 'compact';
  const isDetailed = layout === 'detailed';
  const shouldTruncate = !isExpanded && maxContentLines > 0;

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.8}>
      <Card className={cn(
        'overflow-hidden mb-3',
        isCompact ? 'p-3' : 'p-4',
        review.featured && 'border-yellow-300 bg-yellow-50'
      )} style={{ width }}>
        
        {/* Featured Badge */}
        {review.featured && (
          <View className="absolute top-2 right-2">
            <Badge variant="secondary" style={{ backgroundColor: COLORS.yellow[500] }}>
              <Text className="text-white text-xs font-medium">Featured</Text>
            </Badge>
          </View>
        )}

        {/* Header */}
        <View className="flex-row items-start space-x-3 mb-3">
          
          {/* Author Avatar */}
          <TouchableOpacity onPress={onAuthorPress}>
            <Avatar className={cn(isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
              <Image
                source={{ 
                  uri: review.author.avatar || 'https://via.placeholder.com/48x48' 
                }}
                className="w-full h-full rounded-full"
                alt={review.author.name}
              />
            </Avatar>
          </TouchableOpacity>
          
          {/* Author Info & Rating */}
          <View className="flex-1">
            <TouchableOpacity onPress={onAuthorPress}>
              <View className="flex-row items-center mb-1">
                <Text className={cn(
                  'font-medium text-gray-900 mr-2',
                  isCompact ? 'text-sm' : 'text-base'
                )}>
                  {review.author.anonymous ? 'Anonymous' : review.author.name}
                </Text>
                
                {review.author.verified && (
                  <Text className="text-xs">✅</Text>
                )}
                
                <Badge 
                  variant="secondary"
                  className="ml-2"
                  style={{ backgroundColor: getVerificationColor(review.verification) }}
                >
                  <Text className="text-white text-xs font-medium">
                    {review.verification === 'verified' ? '✓' : review.verification}
                  </Text>
                </Badge>
              </View>
            </TouchableOpacity>
            
            {/* Rating and Date */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {renderStars(review.rating.overall, isCompact ? 'sm' : 'md')}
                <Text className={cn(
                  'ml-2 font-medium text-gray-900',
                  isCompact ? 'text-sm' : 'text-base'
                )}>
                  {review.rating.overall.toFixed(1)}
                </Text>
              </View>
              
              <Text className={cn(
                'text-gray-500',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                {formatDate(review.date)}
              </Text>
            </View>
            
            {/* Author Stats */}
            {!isCompact && (
              <Text className="text-xs text-gray-500 mt-1">
                {review.author.totalReviews} review{review.author.totalReviews !== 1 ? 's' : ''}
                {review.author.location && ` • ${review.author.location}`}
              </Text>
            )}
          </View>
        </View>

        {/* Service Info */}
        {showServiceInfo && review.service && (
          <View className="mb-3 p-2 bg-gray-50 rounded">
            <Text className="text-sm font-medium text-gray-900 mb-1">
              Service: {review.service.name}
            </Text>
            {review.service.serviceDate && (
              <Text className="text-xs text-gray-600">
                Service Date: {formatDate(review.service.serviceDate)}
              </Text>
            )}
            {review.service.price && (
              <Text className="text-xs text-gray-600">
                Price: {formatCurrency(review.service.price, review.service.currency)}
              </Text>
            )}
          </View>
        )}

        {/* Review Title */}
        {review.title && (
          <Text className={cn(
            'font-semibold text-gray-900 mb-2',
            isCompact ? 'text-sm' : 'text-base'
          )}>
            {review.title}
          </Text>
        )}

        {/* Review Content */}
        <View className="mb-3">
          <Text 
            className={cn(
              'text-gray-700 leading-relaxed',
              isCompact ? 'text-sm' : 'text-base'
            )}
            numberOfLines={shouldTruncate ? maxContentLines : undefined}
          >
            {review.content}
          </Text>
          
          {/* Expand/Collapse Button */}
          {review.content.length > 200 && (
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              className="mt-1"
            >
              <Text className="text-blue-600 text-sm font-medium">
                {isExpanded ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
          
          {review.edited && (
            <Text className="text-xs text-gray-500 mt-1">
              Edited {review.editDate ? formatDate(review.editDate) : ''}
            </Text>
          )}
        </View>

        {/* Rating Breakdown */}
        {showRatingBreakdown && isDetailed && (
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Rating Breakdown
            </Text>
            <View className="space-y-1">
              {review.rating.serviceQuality && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Service Quality</Text>
                  <View className="flex-row items-center">
                    {renderStars(review.rating.serviceQuality, 'sm')}
                    <Text className="text-sm text-gray-700 ml-1">
                      {review.rating.serviceQuality.toFixed(1)}
                    </Text>
                  </View>
                </View>
              )}
              {review.rating.communication && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Communication</Text>
                  <View className="flex-row items-center">
                    {renderStars(review.rating.communication, 'sm')}
                    <Text className="text-sm text-gray-700 ml-1">
                      {review.rating.communication.toFixed(1)}
                    </Text>
                  </View>
                </View>
              )}
              {review.rating.punctuality && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Punctuality</Text>
                  <View className="flex-row items-center">
                    {renderStars(review.rating.punctuality, 'sm')}
                    <Text className="text-sm text-gray-700 ml-1">
                      {review.rating.punctuality.toFixed(1)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Media */}
        {showMedia && review.media.length > 0 && (
          <View className="mb-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {review.media.slice(0, showAllPhotos ? undefined : 4).map((media, index) => (
                  <TouchableOpacity
                    key={media.id}
                    onPress={() => onMediaPress?.(media, index)}
                  >
                    <Image
                      source={{ uri: media.thumbnail || media.url }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                    {media.type === 'video' && (
                      <View className="absolute inset-0 bg-black bg-opacity-30 rounded-lg items-center justify-center">
                        <Text className="text-white text-lg">▶️</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                
                {!showAllPhotos && review.media.length > 4 && (
                  <TouchableOpacity
                    className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center"
                    onPress={() => setShowAllPhotos(true)}
                  >
                    <Text className="text-gray-600 text-sm font-medium">
                      +{review.media.length - 4}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Tags */}
        {showTags && review.tags.length > 0 && (
          <View className="mb-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {review.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-blue-100 px-2 py-1 rounded-full"
                  >
                    <Text className="text-blue-700 text-xs font-medium">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Provider Response */}
        {showResponse && review.response && (
          <TouchableOpacity
            onPress={onResponsePress}
            className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-sm font-medium text-blue-900">
                Response from {review.response.providerName}
              </Text>
              {review.response.verified && (
                <Text className="text-xs ml-1">✅</Text>
              )}
            </View>
            <Text className="text-sm text-blue-800">
              {review.response.text}
            </Text>
            <Text className="text-xs text-blue-600 mt-1">
              {formatDate(review.response.date)}
            </Text>
          </TouchableOpacity>
        )}

        {/* Helpfulness and Actions */}
        <View className="flex-row items-center justify-between">
          
          {/* Helpfulness Votes */}
          {showHelpfulness && (
            <View className="flex-row items-center space-x-4">
              <TouchableOpacity
                onPress={onHelpfulVote}
                className={cn(
                  'flex-row items-center',
                  review.helpfulness.userVotedHelpful && 'opacity-60'
                )}
                disabled={review.helpfulness.userVotedHelpful}
              >
                <Text className="text-green-600 mr-1">👍</Text>
                <Text className="text-sm text-gray-600">
                  {review.helpfulness.helpful}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={onNotHelpfulVote}
                className={cn(
                  'flex-row items-center',
                  review.helpfulness.userVotedNotHelpful && 'opacity-60'
                )}
                disabled={review.helpfulness.userVotedNotHelpful}
              >
                <Text className="text-red-600 mr-1">👎</Text>
                <Text className="text-sm text-gray-600">
                  {review.helpfulness.notHelpful}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row items-center space-x-2">
            {onShare && (
              <TouchableOpacity onPress={onShare}>
                <Text className="text-gray-500">📤</Text>
              </TouchableOpacity>
            )}
            
            {onReport && (
              <TouchableOpacity onPress={onReport}>
                <Text className="text-gray-500">🚩</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Custom Actions */}
        {actions.length > 0 && (
          <View className="mt-3 flex-row space-x-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                onPress={action.onPress}
                variant={action.variant || 'outline'}
                disabled={action.disabled}
                size="sm"
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

        {/* Flagged Warning */}
        {review.flagged && (
          <View className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <Text className="text-xs text-red-700">
              ⚠️ This review has been flagged and is under moderation.
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  ReviewCardProps,
  Review,
  ReviewVerification,
  RatingBreakdown,
  ReviewAuthor,
  ReviewMedia,
  ProviderResponse,
  ReviewHelpfulness,
  ReviewServiceInfo,
  ReviewAction,
};
