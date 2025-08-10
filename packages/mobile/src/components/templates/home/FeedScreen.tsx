/**
 * FeedScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive social media feed screen template that displays an activity feed
 * with posts, stories, interactions, and real-time updates.
 * 
 * Features:
 * - ActivityFeed integration with social posts
 * - Stories carousel at the top
 * - Post creation and interaction
 * - Infinite scroll with pagination
 * - Pull-to-refresh functionality
 * - Real-time updates support
 * - Post filtering and sorting
 * - Search and discovery
 * - User interactions (like, comment, share)
 * - Media support (images, videos)
 * - Story viewing and creation
 * - Loading states and error handling
 * 
 * @example
 * ```tsx
 * <FeedScreen
 *   posts={feedPosts}
 *   stories={userStories}
 *   currentUser={currentUser}
 *   onPostPress={(post) => navigation.navigate('PostDetail', { post })}
 *   onLikePost={(postId) => handleLikePost(postId)}
 *   onCommentPost={(postId) => handleCommentPost(postId)}
 *   onSharePost={(postId) => handleSharePost(postId)}
 *   onCreatePost={() => navigation.navigate('CreatePost')}
 *   onRefresh={() => handleRefresh()}
 *   loading={feedLoading}
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
  FlatList 
} from 'react-native';
import { ActivityFeed } from '../../blocks/lists';
import type { ActivityFeedProps } from '../../blocks/lists';
import { SearchForm } from '../../blocks/forms';
import type { SearchFormProps, SearchFormData } from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Avatar } from '../../../../~/components/ui/avatar';
import { Input } from '../../../../~/components/ui/input';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps, UserProfile } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Social media post
 */
export interface SocialPost {
  /** Post ID */
  id: string;
  /** Post author */
  author: UserProfile;
  /** Post content */
  content: string;
  /** Post images */
  images?: string[];
  /** Post video */
  video?: string;
  /** Post timestamp */
  createdAt: Date;
  /** Like count */
  likeCount: number;
  /** Comment count */
  commentCount: number;
  /** Share count */
  shareCount: number;
  /** Is liked by current user */
  isLiked: boolean;
  /** Is saved by current user */
  isSaved: boolean;
  /** Post tags */
  tags?: string[];
  /** Post location */
  location?: string;
  /** Post type */
  type?: 'text' | 'image' | 'video' | 'link' | 'poll';
}

/**
 * User story
 */
export interface UserStory {
  /** Story ID */
  id: string;
  /** Story author */
  author: UserProfile;
  /** Story media */
  media: string;
  /** Story type */
  type: 'image' | 'video';
  /** Story timestamp */
  createdAt: Date;
  /** Is viewed by current user */
  isViewed: boolean;
  /** Story duration (for videos) */
  duration?: number;
}

/**
 * Feed filter options
 */
export interface FeedFilter {
  /** Filter type */
  type: 'all' | 'following' | 'trending' | 'recent' | 'saved';
  /** Filter label */
  label: string;
  /** Is active */
  active: boolean;
}

/**
 * Feed screen configuration
 */
export interface FeedScreenConfig {
  /** Show stories */
  showStories?: boolean;
  /** Show create post button */
  showCreatePost?: boolean;
  /** Show search bar */
  showSearch?: boolean;
  /** Show feed filters */
  showFilters?: boolean;
  /** Enable pull to refresh */
  enableRefresh?: boolean;
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean;
  /** Posts per page */
  postsPerPage?: number;
  /** Show trending hashtags */
  showTrending?: boolean;
  /** Show suggested users */
  showSuggested?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the FeedScreen template
 */
export interface FeedScreenProps extends BaseComponentProps {
  /** Current user */
  currentUser: UserProfile;
  /** Feed posts */
  posts?: SocialPost[];
  /** User stories */
  stories?: UserStory[];
  /** Feed filters */
  filters?: FeedFilter[];
  /** Trending hashtags */
  trendingHashtags?: string[];
  /** Suggested users */
  suggestedUsers?: UserProfile[];
  /** Callback when post is pressed */
  onPostPress?: (post: SocialPost) => void;
  /** Callback when post is liked */
  onLikePost?: (postId: string) => Promise<void> | void;
  /** Callback when post is commented */
  onCommentPost?: (postId: string) => void;
  /** Callback when post is shared */
  onSharePost?: (postId: string) => void;
  /** Callback when post is saved */
  onSavePost?: (postId: string) => Promise<void> | void;
  /** Callback when story is pressed */
  onStoryPress?: (story: UserStory) => void;
  /** Callback when create post is pressed */
  onCreatePost?: () => void;
  /** Callback when create story is pressed */
  onCreateStory?: () => void;
  /** Callback when user is followed */
  onFollowUser?: (userId: string) => Promise<void> | void;
  /** Callback when filter is changed */
  onFilterChange?: (filter: FeedFilter) => void;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback when hashtag is pressed */
  onHashtagPress?: (hashtag: string) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Callback for load more posts */
  onLoadMore?: () => Promise<void> | void;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Has more posts */
  hasMore?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the feed screen */
  config?: FeedScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * FeedScreen - AI-optimized social media feed screen template
 * 
 * A comprehensive feed screen that displays social media posts,
 * stories, and interactions with real-time updates.
 */
const FeedScreen: React.FC<FeedScreenProps> = ({
  currentUser,
  posts = [],
  stories = [],
  filters = [],
  trendingHashtags = [],
  suggestedUsers = [],
  onPostPress,
  onLikePost,
  onCommentPost,
  onSharePost,
  onSavePost,
  onStoryPress,
  onCreatePost,
  onCreateStory,
  onFollowUser,
  onFilterChange,
  onSearch,
  onHashtagPress,
  onRefresh,
  onLoadMore,
  loading = false,
  loadingMore = false,
  refreshing = false,
  hasMore = true,
  error,
  config = {},
  style,
  testID = 'feed-screen',
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const {
    showStories = true,
    showCreatePost = true,
    showSearch = true,
    showFilters = true,
    enableRefresh = true,
    enableInfiniteScroll = true,
    postsPerPage = 10,
    showTrending = true,
    showSuggested = true,
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

  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || loadingMore || !hasMore) return;
    try {
      await onLoadMore();
    } catch (err) {
      console.error('Load more failed:', err);
    }
  }, [onLoadMore, loadingMore, hasMore]);

  const handleFilterPress = useCallback((filter: FeedFilter) => {
    setActiveFilter(filter.type);
    onFilterChange?.(filter);
  }, [onFilterChange]);

  const handleLikePost = useCallback(async (postId: string) => {
    if (!onLikePost) return;
    try {
      await onLikePost(postId);
    } catch (err) {
      console.error('Like post failed:', err);
    }
  }, [onLikePost]);

  const handleSavePost = useCallback(async (postId: string) => {
    if (!onSavePost) return;
    try {
      await onSavePost(postId);
    } catch (err) {
      console.error('Save post failed:', err);
    }
  }, [onSavePost]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        {/* Search Bar */}
        {showSearch && (
          <SearchForm
            onSearch={handleSearch}
            placeholder="Search posts, people, hashtags..."
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
        )}

        {/* Feed Filters */}
        {showFilters && filters.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.type}
                onPress={() => handleFilterPress(filter)}
                style={[
                  styles.filterButton,
                  activeFilter === filter.type && styles.filterButtonActive
                ]}
                testID={`${testID}-filter-${filter.type}`}
              >
                <Text style={[
                  styles.filterText,
                  activeFilter === filter.type && styles.filterTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

  const renderStories = () => {
    if (!showStories || stories.length === 0) return null;

    const allStories = [
      // Add "Your Story" option if onCreateStory is provided
      ...(onCreateStory ? [{
        id: 'create-story',
        author: currentUser,
        media: '',
        type: 'image' as const,
        createdAt: new Date(),
        isViewed: false,
        isCreateStory: true
      }] : []),
      ...stories
    ];

    return (
      <View style={styles.storiesContainer} testID={`${testID}-stories`}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {allStories.map((story, index) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => {
                if ('isCreateStory' in story && story.isCreateStory) {
                  onCreateStory?.();
                } else {
                  onStoryPress?.(story);
                }
              }}
              style={styles.storyItem}
              testID={`${testID}-story-${story.id}`}
            >
              <View style={[
                styles.storyAvatar,
                !story.isViewed && styles.storyAvatarUnviewed,
                'isCreateStory' in story && story.isCreateStory && styles.storyAvatarCreate
              ]}>
                <Avatar style={styles.storyAvatarImage}>
                  {story.author.avatar ? (
                    <Image source={{ uri: story.author.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {(story.author.firstName?.[0] || story.author.email?.[0] || '?').toUpperCase()}
                    </Text>
                  )}
                </Avatar>
                {'isCreateStory' in story && story.isCreateStory && (
                  <View style={styles.storyCreateIcon}>
                    <Text style={styles.storyCreateText}>+</Text>
                  </View>
                )}
              </View>
              <Text style={styles.storyName}>
                {'isCreateStory' in story && story.isCreateStory ? 'Your Story' : story.author.firstName || 'User'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCreatePost = () => {
    if (!showCreatePost || !onCreatePost) return null;

    return (
      <Card style={styles.createPostCard} testID={`${testID}-create-post`}>
        <TouchableOpacity 
          onPress={onCreatePost}
          style={styles.createPostContainer}
        >
          <Avatar style={styles.createPostAvatar}>
            {currentUser.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {(currentUser.firstName?.[0] || currentUser.email?.[0] || '?').toUpperCase()}
              </Text>
            )}
          </Avatar>
          <View style={styles.createPostInput}>
            <Text style={styles.createPostPlaceholder}>
              What's on your mind, {currentUser.firstName || 'User'}?
            </Text>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderTrendingHashtags = () => {
    if (!showTrending || trendingHashtags.length === 0) return null;

    return (
      <Card style={styles.trendingCard} testID={`${testID}-trending`}>
        <Text style={styles.trendingTitle}>Trending</Text>
        <View style={styles.hashtagsContainer}>
          {trendingHashtags.slice(0, 6).map((hashtag, index) => (
            <TouchableOpacity
              key={hashtag}
              onPress={() => onHashtagPress?.(hashtag)}
              style={styles.hashtagButton}
              testID={`${testID}-hashtag-${index}`}
            >
              <Text style={styles.hashtagText}>#{hashtag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  const renderSuggestedUsers = () => {
    if (!showSuggested || suggestedUsers.length === 0) return null;

    return (
      <Card style={styles.suggestedCard} testID={`${testID}-suggested`}>
        <Text style={styles.suggestedTitle}>Suggested for You</Text>
        <View style={styles.suggestedContainer}>
          {suggestedUsers.slice(0, 3).map((user) => (
            <View key={user.id} style={styles.suggestedUser}>
              <Avatar style={styles.suggestedAvatar}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                  </Text>
                )}
              </Avatar>
              <View style={styles.suggestedInfo}>
                <Text style={styles.suggestedName}>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email
                  }
                </Text>
                <Text style={styles.suggestedBio}>{user.bio || 'User'}</Text>
              </View>
              <Button
                onPress={() => onFollowUser?.(user.id)}
                size="sm"
                style={styles.followButton}
                testID={`${testID}-follow-${user.id}`}
              >
                <Text style={styles.followButtonText}>Follow</Text>
              </Button>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderPost = ({ item: post }: { item: SocialPost }) => {
    return (
      <Card style={styles.postCard} testID={`${testID}-post-${post.id}`}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.postAuthor}
            onPress={() => onPostPress?.(post)}
          >
            <Avatar style={styles.postAvatar}>
              {post.author.avatar ? (
                <Image source={{ uri: post.author.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(post.author.firstName?.[0] || post.author.email?.[0] || '?').toUpperCase()}
                </Text>
              )}
            </Avatar>
            <View style={styles.postAuthorInfo}>
              <Text style={styles.postAuthorName}>
                {post.author.firstName && post.author.lastName 
                  ? `${post.author.firstName} ${post.author.lastName}`
                  : post.author.email
                }
              </Text>
              <Text style={styles.postTime}>
                {post.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <TouchableOpacity 
          onPress={() => onPostPress?.(post)}
          style={styles.postContent}
        >
          <Text style={styles.postText}>{post.content}</Text>
          
          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <View style={styles.postImages}>
              {post.images.slice(0, 4).map((image, index) => (
                <Image 
                  key={index}
                  source={{ uri: image }} 
                  style={[
                    styles.postImage,
                    post.images!.length === 1 && styles.postImageSingle,
                    post.images!.length === 2 && styles.postImageDouble,
                    post.images!.length > 2 && styles.postImageMultiple
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            onPress={() => handleLikePost(post.id)}
            style={[styles.actionButton, post.isLiked && styles.actionButtonLiked]}
          >
            <Text style={[styles.actionText, post.isLiked && styles.actionTextLiked]}>
              ♥ {post.likeCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onCommentPost?.(post.id)}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>💬 {post.commentCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onSharePost?.(post.id)}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>📤 {post.shareCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleSavePost(post.id)}
            style={[styles.actionButton, styles.actionButtonSave]}
          >
            <Text style={[styles.actionText, post.isSaved && styles.actionTextSaved]}>
              {post.isSaved ? '🔖' : '📌'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more posts...</Text>
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

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.feedList}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          enableRefresh && onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        onEndReached={enableInfiniteScroll ? handleLoadMore : undefined}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={() => (
          <View>
            {/* Error Display */}
            {renderError()}
            
            {/* Stories */}
            {renderStories()}
            
            {/* Create Post */}
            {renderCreatePost()}
            
            {/* Trending Hashtags */}
            {renderTrendingHashtags()}
            
            {/* Suggested Users */}
            {renderSuggestedUsers()}
          </View>
        )}
        ListFooterComponent={renderFooter}
        testID={`${testID}-list`}
      />

      {/* Footer */}
      {footerComponent && (
        <View style={styles.footerContainer}>
          {footerComponent}
        </View>
      )}
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
  searchForm: {
    marginBottom: SPACING.md,
  },
  filtersContainer: {
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.primaryForeground,
  },
  feedList: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  errorAlert: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  storiesContainer: {
    marginBottom: SPACING.lg,
  },
  storiesScroll: {
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    marginBottom: SPACING.xs,
    position: 'relative',
  },
  storyAvatarUnviewed: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  storyAvatarCreate: {
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  storyAvatarImage: {
    width: '100%',
    height: '100%',
  },
  storyCreateIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCreateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryForeground,
  },
  storyName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryForeground,
  },
  createPostCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  createPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  createPostInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: 25,
  },
  createPostPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  trendingCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  trendingTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  hashtagButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
  },
  hashtagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  suggestedCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  suggestedTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  suggestedContainer: {
    gap: SPACING.md,
  },
  suggestedUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedAvatar: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  suggestedBio: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  followButton: {
    paddingHorizontal: SPACING.lg,
  },
  followButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  postCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  postHeader: {
    marginBottom: SPACING.md,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  postTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  postContent: {
    marginBottom: SPACING.md,
  },
  postText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.md,
  },
  postImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  postImage: {
    borderRadius: 8,
  },
  postImageSingle: {
    width: '100%',
    height: 200,
  },
  postImageDouble: {
    width: '49%',
    height: 150,
  },
  postImageMultiple: {
    width: '24%',
    height: 80,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  actionButtonLiked: {
    backgroundColor: `${COLORS.destructive}20`,
  },
  actionButtonSave: {
    marginLeft: 'auto',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  actionTextLiked: {
    color: COLORS.destructive,
  },
  actionTextSaved: {
    color: COLORS.primary,
  },
  loadingFooter: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
});

export default FeedScreen;
export type { 
  FeedScreenProps, 
  FeedScreenConfig, 
  SocialPost, 
  UserStory, 
  FeedFilter 
};
