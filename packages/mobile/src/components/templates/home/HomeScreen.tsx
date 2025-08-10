/**
 * HomeScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive home screen template that serves as the primary landing page
 * with navigation, featured content, and user-specific recommendations.
 * 
 * Features:
 * - Primary app navigation and menu
 * - Featured content and highlights
 * - Personalized recommendations
 * - Quick access to key features
 * - Search functionality
 * - User greeting and status
 * - Category navigation
 * - Recent items and history
 * - Promotional banners and announcements
 * - Social features integration
 * - Loading states and error handling
 * - Pull-to-refresh support
 * 
 * @example
 * ```tsx
 * <HomeScreen
 *   user={currentUser}
 *   featuredContent={featuredItems}
 *   recommendations={recommendations}
 *   categories={appCategories}
 *   recentItems={recentItems}
 *   onNavigate={(destination) => navigation.navigate(destination)}
 *   onSearch={(query) => handleSearch(query)}
 *   onRefresh={() => handleRefresh()}
 *   loading={homeLoading}
 * />
 * ```
 * 
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
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions 
} from 'react-native';
import { 
  ArticleList, 
  ProductGrid,
  UserList 
} from '../../blocks/lists';
import type { 
  ArticleListProps,
  Article,
  ProductGridProps,
  Product,
  UserListProps
} from '../../blocks/lists';
import { SearchForm } from '../../blocks/forms';
import type { SearchFormProps, SearchFormData } from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Avatar } from '../../../../~/components/ui/avatar';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps, UserProfile } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Navigation category
 */
export interface NavigationCategory {
  /** Category ID */
  id: string;
  /** Category title */
  title: string;
  /** Category description */
  description?: string;
  /** Category icon */
  icon?: string;
  /** Category image */
  image?: any;
  /** Category color */
  color?: string;
  /** Navigation destination */
  destination: string;
  /** Item count */
  count?: number;
  /** Is featured */
  featured?: boolean;
  /** Badge text */
  badge?: string;
}

/**
 * Featured content item
 */
export interface FeaturedContent {
  /** Content ID */
  id: string;
  /** Content type */
  type: 'article' | 'product' | 'video' | 'event' | 'offer';
  /** Content title */
  title: string;
  /** Content description */
  description?: string;
  /** Content image */
  image?: any;
  /** Content author/creator */
  author?: string;
  /** Content date */
  date?: Date;
  /** Content tags */
  tags?: string[];
  /** Navigation destination */
  destination?: string;
  /** Content data */
  data?: any;
}

/**
 * Promotional banner
 */
export interface PromoBanner {
  /** Banner ID */
  id: string;
  /** Banner title */
  title: string;
  /** Banner message */
  message: string;
  /** Banner image */
  image?: any;
  /** Banner color */
  color?: string;
  /** Call-to-action text */
  ctaText?: string;
  /** Navigation destination */
  destination?: string;
  /** Banner action */
  onPress?: () => void;
  /** Banner priority */
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Home screen configuration
 */
export interface HomeScreenConfig {
  /** Show user greeting */
  showGreeting?: boolean;
  /** Show search bar */
  showSearch?: boolean;
  /** Show categories */
  showCategories?: boolean;
  /** Show featured content */
  showFeatured?: boolean;
  /** Show recommendations */
  showRecommendations?: boolean;
  /** Show recent items */
  showRecent?: boolean;
  /** Show promotional banners */
  showPromoBanners?: boolean;
  /** Categories display style */
  categoriesStyle?: 'grid' | 'list' | 'carousel';
  /** Featured content style */
  featuredStyle?: 'carousel' | 'grid' | 'list';
  /** Maximum categories to display */
  maxCategories?: number;
  /** Maximum featured items */
  maxFeatured?: number;
  /** Maximum recommendations */
  maxRecommendations?: number;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the HomeScreen template
 */
export interface HomeScreenProps extends BaseComponentProps {
  /** Current user */
  user?: UserProfile;
  /** Navigation categories */
  categories?: NavigationCategory[];
  /** Featured content */
  featuredContent?: FeaturedContent[];
  /** Recommended content */
  recommendations?: any[];
  /** Recent items */
  recentItems?: any[];
  /** Promotional banners */
  promoBanners?: PromoBanner[];
  /** Suggested users */
  suggestedUsers?: any[];
  /** Callback when navigation item is pressed */
  onNavigate?: (destination: string, data?: any) => void;
  /** Callback when category is pressed */
  onCategoryPress?: (category: NavigationCategory) => void;
  /** Callback when featured content is pressed */
  onFeaturedPress?: (content: FeaturedContent) => void;
  /** Callback when recommendation is pressed */
  onRecommendationPress?: (item: any) => void;
  /** Callback when recent item is pressed */
  onRecentPress?: (item: any) => void;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Loading state */
  loading?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the home screen */
  config?: HomeScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

const { width: screenWidth } = Dimensions.get('window');

/**
 * HomeScreen - AI-optimized home screen template
 * 
 * A comprehensive home screen that serves as the primary landing page
 * with navigation, content discovery, and personalization features.
 */
const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  categories = [],
  featuredContent = [],
  recommendations = [],
  recentItems = [],
  promoBanners = [],
  suggestedUsers = [],
  onNavigate,
  onCategoryPress,
  onFeaturedPress,
  onRecommendationPress,
  onRecentPress,
  onSearch,
  onRefresh,
  loading = false,
  refreshing = false,
  error,
  config = {},
  style,
  testID = 'home-screen',
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    showGreeting = true,
    showSearch = true,
    showCategories = true,
    showFeatured = true,
    showRecommendations = true,
    showRecent = true,
    showPromoBanners = true,
    categoriesStyle = 'grid',
    featuredStyle = 'carousel',
    maxCategories = 8,
    maxFeatured = 5,
    maxRecommendations = 6,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSearch = useCallback((searchData: SearchFormData) => {
    setSearchQuery(searchData.query || '');
    onSearch?.(searchData);
  }, [onSearch]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    try {
      await onRefresh();
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  }, [onRefresh]);

  const handleCategoryPress = useCallback((category: NavigationCategory) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else if (onNavigate) {
      onNavigate(category.destination, category);
    }
  }, [onCategoryPress, onNavigate]);

  const handleFeaturedPress = useCallback((content: FeaturedContent) => {
    if (onFeaturedPress) {
      onFeaturedPress(content);
    } else if (onNavigate && content.destination) {
      onNavigate(content.destination, content);
    }
  }, [onFeaturedPress, onNavigate]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        {/* User Greeting */}
        {showGreeting && user && (
          <View style={styles.greetingContainer}>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingText}>
                Welcome back,
              </Text>
              <Text style={styles.greetingName}>
                {user.firstName || user.email?.split('@')[0] || 'User'}
              </Text>
            </View>
            {user.avatar && (
              <Avatar style={styles.greetingAvatar}>
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              </Avatar>
            )}
          </View>
        )}

        {/* Search Bar */}
        {showSearch && (
          <SearchForm
            onSearch={handleSearch}
            placeholder="Search everything..."
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
        )}
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <UIAlert 
        variant="destructive"
        style={styles.errorAlert}
        testID={`${testID}-error`}
      >
        <Text style={styles.errorText}>{error}</Text>
      </UIAlert>
    );
  };

  const renderPromoBanners = () => {
    if (!showPromoBanners || promoBanners.length === 0) return null;

    const highPriorityBanners = promoBanners
      .filter(banner => banner.priority === 'high')
      .slice(0, 2);

    if (highPriorityBanners.length === 0) return null;

    return (
      <View style={styles.promoBannersContainer} testID={`${testID}-promo-banners`}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoBannersScroll}
        >
          {highPriorityBanners.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              onPress={banner.onPress || (() => onNavigate?.(banner.destination || ''))}
              style={[
                styles.promoBanner,
                banner.color && { backgroundColor: banner.color }
              ]}
              testID={`${testID}-promo-banner-${banner.id}`}
            >
              {banner.image && (
                <Image source={banner.image} style={styles.promoBannerImage} />
              )}
              <View style={styles.promoBannerContent}>
                <Text style={styles.promoBannerTitle}>{banner.title}</Text>
                <Text style={styles.promoBannerMessage}>{banner.message}</Text>
                {banner.ctaText && (
                  <Text style={styles.promoBannerCTA}>{banner.ctaText}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCategories = () => {
    if (!showCategories || categories.length === 0) return null;

    const displayCategories = categories.slice(0, maxCategories);

    return (
      <View style={styles.categoriesContainer} testID={`${testID}-categories`}>
        <Text style={styles.sectionTitle}>Explore</Text>
        
        {categoriesStyle === 'grid' ? (
          <View style={styles.categoriesGrid}>
            {displayCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                style={styles.categoryItem}
                testID={`${testID}-category-${category.id}`}
              >
                <Card style={styles.categoryCard}>
                  {category.image && (
                    <Image source={category.image} style={styles.categoryImage} />
                  )}
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    {category.count && (
                      <Text style={styles.categoryCount}>{category.count} items</Text>
                    )}
                    {category.badge && (
                      <Badge variant="secondary" style={styles.categoryBadge}>
                        <Text style={styles.badgeText}>{category.badge}</Text>
                      </Badge>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {displayCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                style={styles.categoryCarouselItem}
                testID={`${testID}-category-${category.id}`}
              >
                <Card style={styles.categoryCarouselCard}>
                  {category.image && (
                    <Image source={category.image} style={styles.categoryCarouselImage} />
                  )}
                  <Text style={styles.categoryCarouselTitle}>{category.title}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderFeaturedContent = () => {
    if (!showFeatured || featuredContent.length === 0) return null;

    const displayFeatured = featuredContent.slice(0, maxFeatured);

    return (
      <View style={styles.featuredContainer} testID={`${testID}-featured`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <TouchableOpacity style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>View All</Text>
            <ChevronRight style={styles.sectionActionIcon} />
          </TouchableOpacity>
        </View>

        {featuredStyle === 'carousel' ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {displayFeatured.map((content) => (
              <TouchableOpacity
                key={content.id}
                onPress={() => handleFeaturedPress(content)}
                style={styles.featuredItem}
                testID={`${testID}-featured-${content.id}`}
              >
                <Card style={styles.featuredCard}>
                  {content.image && (
                    <Image source={content.image} style={styles.featuredImage} />
                  )}
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle}>{content.title}</Text>
                    {content.description && (
                      <Text style={styles.featuredDescription}>{content.description}</Text>
                    )}
                    {content.author && (
                      <Text style={styles.featuredAuthor}>by {content.author}</Text>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <ArticleList
            articles={displayFeatured.map(content => ({
              id: content.id,
              title: content.title,
              excerpt: content.description || '',
              author: content.author || '',
              publishedAt: content.date || new Date(),
              imageUrl: content.image,
              tags: content.tags || []
            }))}
            onArticlePress={(article) => {
              const content = displayFeatured.find(c => c.id === article.id);
              if (content) handleFeaturedPress(content);
            }}
            showLoadMore={false}
            style={styles.featuredList}
            testID={`${testID}-featured-list`}
          />
        )}
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!showRecommendations || recommendations.length === 0) return null;

    return (
      <View style={styles.recommendationsContainer} testID={`${testID}-recommendations`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <TouchableOpacity style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>View All</Text>
            <ChevronRight style={styles.sectionActionIcon} />
          </TouchableOpacity>
        </View>

        <ProductGrid
          products={recommendations.slice(0, maxRecommendations)}
          onProductPress={onRecommendationPress}
          numColumns={2}
          showLoadMore={false}
          style={styles.recommendationsGrid}
          testID={`${testID}-recommendations-grid`}
        />
      </View>
    );
  };

  const renderRecentItems = () => {
    if (!showRecent || recentItems.length === 0) return null;

    return (
      <View style={styles.recentContainer} testID={`${testID}-recent`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Where You Left Off</Text>
          <TouchableOpacity style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>View All</Text>
            <ChevronRight style={styles.sectionActionIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentScroll}
        >
          {recentItems.slice(0, 5).map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              onPress={() => onRecentPress?.(item)}
              style={styles.recentItem}
              testID={`${testID}-recent-${index}`}
            >
              <Card style={styles.recentCard}>
                {item.image && (
                  <Image source={item.image} style={styles.recentImage} />
                )}
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>{item.title}</Text>
                  <Text style={styles.recentSubtitle}>{item.subtitle}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSuggestedUsers = () => {
    if (suggestedUsers.length === 0) return null;

    return (
      <View style={styles.suggestedContainer} testID={`${testID}-suggested-users`}>
        <Text style={styles.sectionTitle}>People You May Know</Text>
        <UserList
          users={suggestedUsers.slice(0, 3)}
          showFollowButton={true}
          horizontal={true}
          style={styles.suggestedList}
          testID={`${testID}-suggested-list`}
        />
      </View>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Promotional Banners */}
        {renderPromoBanners()}

        {/* Categories */}
        {renderCategories()}

        {/* Featured Content */}
        {renderFeaturedContent()}

        {/* Recommendations */}
        {renderRecommendations()}

        {/* Recent Items */}
        {renderRecentItems()}

        {/* Suggested Users */}
        {renderSuggestedUsers()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  greetingContent: {
    flex: 1,
  },
  greetingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  greetingName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  greetingAvatar: {
    width: 40,
    height: 40,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  searchForm: {
    marginBottom: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.xl,
  },
  errorAlert: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginRight: SPACING.xs,
  },
  sectionActionIcon: {
    width: 16,
    height: 16,
    color: COLORS.primary,
  },
  promoBannersContainer: {
    marginBottom: SPACING.lg,
  },
  promoBannersScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  promoBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    minWidth: screenWidth - SPACING.lg * 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoBannerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  promoBannerContent: {
    flex: 1,
  },
  promoBannerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryForeground,
    marginBottom: SPACING.xs,
  },
  promoBannerMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primaryForeground,
    marginBottom: SPACING.sm,
  },
  promoBannerCTA: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primaryForeground,
    textDecorationLine: 'underline',
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryItem: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.md) / 2,
  },
  categoryCard: {
    padding: SPACING.md,
    height: 120,
  },
  categoryImage: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  categoriesScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  categoryCarouselItem: {
    width: 100,
  },
  categoryCarouselCard: {
    padding: SPACING.md,
    alignItems: 'center',
    height: 100,
  },
  categoryCarouselImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  categoryCarouselTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  featuredContainer: {
    marginBottom: SPACING.lg,
  },
  featuredScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  featuredItem: {
    width: 250,
  },
  featuredCard: {
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  featuredContent: {
    padding: SPACING.md,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featuredDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  featuredAuthor: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  featuredList: {
    maxHeight: 400,
  },
  recommendationsContainer: {
    marginBottom: SPACING.lg,
  },
  recommendationsGrid: {
    maxHeight: 300,
  },
  recentContainer: {
    marginBottom: SPACING.lg,
  },
  recentScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  recentItem: {
    width: 160,
  },
  recentCard: {
    overflow: 'hidden',
  },
  recentImage: {
    width: '100%',
    height: 80,
  },
  recentContent: {
    padding: SPACING.sm,
  },
  recentTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recentSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  suggestedContainer: {
    marginBottom: SPACING.lg,
  },
  suggestedList: {
    maxHeight: 200,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default HomeScreen;
export type { 
  HomeScreenProps, 
  HomeScreenConfig, 
  NavigationCategory, 
  FeaturedContent, 
  PromoBanner 
};
