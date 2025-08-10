/**
 * ActivityFeed Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive activity feed component for displaying social media style updates,
 * user activities, and timeline events with rich interaction capabilities.
 * 
 * Features:
 * - Social media style posts with images and videos
 * - Like, comment, and share functionality
 * - User interactions and mentions
 * - Real-time activity updates
 * - Infinite scroll with pull-to-refresh
 * - Activity grouping and filtering
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <ActivityFeed
 *   activities={feedData}
 *   onLike={(activityId) => likeActivity(activityId)}
 *   onComment={(activityId) => openComments(activityId)}
 *   onShare={(activityId) => shareActivity(activityId)}
 *   showInteractions={true}
 *   allowGrouping={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Image
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Activity types
 */
export type ActivityType = 
  | 'post' 
  | 'like' 
  | 'comment' 
  | 'share' 
  | 'follow' 
  | 'mention' 
  | 'achievement' 
  | 'system' 
  | 'group';

/**
 * Media attachment for activities
 */
export interface ActivityMedia {
  /** Media ID */
  id: string;
  /** Media type */
  type: 'image' | 'video' | 'document';
  /** Media URL */
  url: string;
  /** Thumbnail URL */
  thumbnail?: string;
  /** Media dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Activity user information
 */
export interface ActivityUser {
  /** User ID */
  id: string;
  /** Display name */
  name: string;
  /** Username/handle */
  username?: string;
  /** Profile picture URL */
  avatar?: string;
  /** Whether user is verified */
  verified?: boolean;
}

/**
 * Activity interaction data
 */
export interface ActivityInteractions {
  /** Number of likes */
  likes: number;
  /** Number of comments */
  comments: number;
  /** Number of shares */
  shares: number;
  /** Whether current user liked */
  isLiked: boolean;
  /** Whether current user commented */
  isCommented: boolean;
  /** Whether current user shared */
  isShared: boolean;
}

/**
 * Activity data structure
 */
export interface Activity {
  /** Unique activity identifier */
  id: string;
  /** Activity type */
  type: ActivityType;
  /** Activity user/author */
  user: ActivityUser;
  /** Activity content/text */
  content: string;
  /** Activity timestamp */
  timestamp: Date;
  /** Media attachments */
  media?: ActivityMedia[];
  /** Interaction counts and states */
  interactions: ActivityInteractions;
  /** Referenced users (mentions, tags) */
  mentionedUsers?: ActivityUser[];
  /** Activity location */
  location?: string;
  /** Whether activity is promoted/sponsored */
  promoted?: boolean;
  /** Activity tags/hashtags */
  tags?: string[];
  /** Original activity (for shares/reposts) */
  originalActivity?: Activity;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for the ActivityFeed component
 */
export interface ActivityFeedProps extends BaseComponentProps {
  /** Array of activities to display */
  activities: Activity[];
  /** Callback when activity is pressed */
  onActivityPress?: (activity: Activity) => void;
  /** Callback when like button is pressed */
  onLike?: (activityId: string) => void;
  /** Callback when comment button is pressed */
  onComment?: (activityId: string) => void;
  /** Callback when share button is pressed */
  onShare?: (activityId: string) => void;
  /** Callback when user profile is pressed */
  onUserPress?: (user: ActivityUser) => void;
  /** Callback when media is pressed */
  onMediaPress?: (media: ActivityMedia, activity: Activity) => void;
  /** Whether to show interaction buttons */
  showInteractions?: boolean;
  /** Whether to show media attachments */
  showMedia?: boolean;
  /** Whether to show user avatars */
  showAvatars?: boolean;
  /** Whether to show timestamps */
  showTimestamps?: boolean;
  /** Whether to allow activity grouping */
  allowGrouping?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of activities to show initially */
  initialNumToRender?: number;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Load more activities handler */
  onLoadMore?: () => void;
  /** Whether there are more activities to load */
  hasMore?: boolean;
  /** Activity filtering function */
  filterActivities?: (activity: Activity) => boolean;
  /** Activity sorting function */
  sortActivities?: (a: Activity, b: Activity) => number;
  /** Layout variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Custom activity renderer */
  renderActivity?: (activity: Activity, index: number) => React.ReactElement;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ActivityFeed component for displaying social media style activities
 */
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onActivityPress,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onMediaPress,
  showInteractions = true,
  showMedia = true,
  showAvatars = true,
  showTimestamps = true,
  allowGrouping = false,
  loading = false,
  error,
  emptyMessage = 'No activities to show',
  initialNumToRender = 10,
  onRefresh,
  onLoadMore,
  hasMore = false,
  filterActivities,
  sortActivities,
  variant = 'default',
  renderActivity,
  style,
  testID = 'activity-feed',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [refreshing, setRefreshing] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const processedActivities = useMemo(() => {
    let filtered = activities;

    // Apply custom filter
    if (filterActivities) {
      filtered = filtered.filter(filterActivities);
    }

    // Apply custom sort or default sort by timestamp (newest first)
    if (sortActivities) {
      filtered = filtered.sort(sortActivities);
    } else {
      filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    return filtered;
  }, [activities, filterActivities, sortActivities]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleActivityPress = useCallback((activity: Activity) => {
    onActivityPress?.(activity);
  }, [onActivityPress]);

  const handleLike = useCallback((activityId: string) => {
    onLike?.(activityId);
  }, [onLike]);

  const handleComment = useCallback((activityId: string) => {
    onComment?.(activityId);
  }, [onComment]);

  const handleShare = useCallback((activityId: string) => {
    onShare?.(activityId);
  }, [onShare]);

  const handleUserPress = useCallback((user: ActivityUser) => {
    onUserPress?.(user);
  }, [onUserPress]);

  const handleMediaPress = useCallback((media: ActivityMedia, activity: Activity) => {
    onMediaPress?.(media, activity);
  }, [onMediaPress]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getActivityTypeIcon = (type: ActivityType): string => {
    const icons: Record<ActivityType, string> = {
      post: '📝',
      like: '❤️',
      comment: '💬',
      share: '🔄',
      follow: '👥',
      mention: '@',
      achievement: '🏆',
      system: '⚙️',
      group: '👥',
    };
    return icons[type];
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderMedia = useCallback((media: ActivityMedia[], activity: Activity) => {
    if (!showMedia || !media || media.length === 0) return null;

    const mainMedia = media[0];
    const hasMultiple = media.length > 1;

    return (
      <TouchableOpacity
        onPress={() => handleMediaPress(mainMedia, activity)}
        style={styles.mediaContainer}
      >
        <Image
          source={{ uri: mainMedia.thumbnail || mainMedia.url }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
        {hasMultiple && (
          <View style={styles.mediaOverlay}>
            <Text style={styles.mediaCount}>+{media.length - 1}</Text>
          </View>
        )}
        {mainMedia.type === 'video' && (
          <View style={styles.videoOverlay}>
            <Text style={styles.playIcon}>▶️</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [showMedia, handleMediaPress]);

  const renderInteractions = useCallback((activity: Activity) => {
    if (!showInteractions) return null;

    const { interactions } = activity;

    return (
      <View style={styles.interactionsContainer}>
        <View style={styles.interactionStats}>
          {interactions.likes > 0 && (
            <Text style={styles.statText}>
              {interactions.likes} like{interactions.likes !== 1 ? 's' : ''}
            </Text>
          )}
          {interactions.comments > 0 && (
            <Text style={styles.statText}>
              {interactions.comments} comment{interactions.comments !== 1 ? 's' : ''}
            </Text>
          )}
          {interactions.shares > 0 && (
            <Text style={styles.statText}>
              {interactions.shares} share{interactions.shares !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.interactionButtons}>
          <Button
            variant="ghost"
            onPress={() => handleLike(activity.id)}
            style={[
              styles.interactionButton,
              interactions.isLiked && styles.likedButton
            ]}
          >
            {interactions.isLiked ? '❤️' : '🤍'} Like
          </Button>

          <Button
            variant="ghost"
            onPress={() => handleComment(activity.id)}
            style={[
              styles.interactionButton,
              interactions.isCommented && styles.commentedButton
            ]}
          >
            💬 Comment
          </Button>

          <Button
            variant="ghost"
            onPress={() => handleShare(activity.id)}
            style={[
              styles.interactionButton,
              interactions.isShared && styles.sharedButton
            ]}
          >
            🔄 Share
          </Button>
        </View>
      </View>
    );
  }, [showInteractions, handleLike, handleComment, handleShare]);

  const renderActivityItem = useCallback(({ item: activity, index }: { item: Activity; index: number }) => {
    if (renderActivity) {
      return renderActivity(activity, index);
    }

    const isCompact = variant === 'compact';
    const isDetailed = variant === 'detailed';

    return (
      <Card 
        style={[
          styles.activityCard,
          isCompact && styles.compactCard
        ]}
        testID={`${testID}-item-${index}`}
      >
        <TouchableOpacity
          onPress={() => handleActivityPress(activity)}
          style={styles.activityContent}
          accessibilityRole="button"
          accessibilityLabel={`Activity by ${activity.user.name}`}
        >
          {/* Header */}
          <View style={styles.activityHeader}>
            {/* User Avatar */}
            {showAvatars && (
              <TouchableOpacity
                onPress={() => handleUserPress(activity.user)}
                style={styles.userContainer}
              >
                <Avatar style={styles.userAvatar}>
                  {activity.user.avatar && (
                    <AvatarImage source={{ uri: activity.user.avatar }} />
                  )}
                  <AvatarFallback>
                    <Text style={styles.avatarFallback}>
                      {activity.user.name.charAt(0)}
                    </Text>
                  </AvatarFallback>
                </Avatar>
              </TouchableOpacity>
            )}

            {/* User Info */}
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => handleUserPress(activity.user)}>
                <View style={styles.userNameContainer}>
                  <Text style={styles.userName}>{activity.user.name}</Text>
                  {activity.user.verified && (
                    <Text style={styles.verifiedIcon}>✓</Text>
                  )}
                </View>
                {activity.user.username && (
                  <Text style={styles.userHandle}>@{activity.user.username}</Text>
                )}
              </TouchableOpacity>

              {showTimestamps && (
                <Text style={styles.timestamp}>
                  {formatDate(activity.timestamp, 'relative')}
                </Text>
              )}
            </View>

            {/* Activity Type */}
            <View style={styles.activityType}>
              <Text style={styles.typeIcon}>
                {getActivityTypeIcon(activity.type)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text 
              style={styles.activityContent} 
              numberOfLines={isCompact ? 2 : undefined}
            >
              {activity.content}
            </Text>

            {/* Location */}
            {activity.location && isDetailed && (
              <Text style={styles.location}>📍 {activity.location}</Text>
            )}

            {/* Tags */}
            {activity.tags && activity.tags.length > 0 && isDetailed && (
              <View style={styles.tagsContainer}>
                {activity.tags.slice(0, 3).map((tag, idx) => (
                  <Text key={idx} style={styles.tag}>#{tag}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Media */}
          {renderMedia(activity.media || [], activity)}

          {/* Original Activity (for shares) */}
          {activity.originalActivity && (
            <Card style={styles.originalActivity}>
              <Text style={styles.originalUser}>
                @{activity.originalActivity.user.username}
              </Text>
              <Text style={styles.originalContent} numberOfLines={3}>
                {activity.originalActivity.content}
              </Text>
            </Card>
          )}

          {/* Interactions */}
          {renderInteractions(activity)}
        </TouchableOpacity>
      </Card>
    );
  }, [
    variant,
    showAvatars,
    showTimestamps,
    renderActivity,
    handleActivityPress,
    handleUserPress,
    renderMedia,
    renderInteractions,
    testID
  ]);

  // =============================================================================
  // ERROR & EMPTY STATES
  // =============================================================================

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  if (!loading && processedActivities.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.emptyText}>📱 {emptyMessage}</Text>
      </View>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  ) : undefined;

  return (
    <FlatList
      data={processedActivities}
      renderItem={renderActivityItem}
      keyExtractor={(item) => item.id}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={refreshControl}
      initialNumToRender={initialNumToRender}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      testID={testID}
      {...props}
    />
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  contentContainer: {
    padding: SPACING.md,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCard: {
    marginBottom: SPACING.md,
  },
  compactCard: {
    marginBottom: SPACING.sm,
  },
  activityContent: {
    padding: SPACING.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  userContainer: {
    marginRight: SPACING.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
  },
  avatarFallback: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[600],
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginRight: SPACING.xs,
  },
  verifiedIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info[500],
  },
  userHandle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  activityType: {
    marginLeft: SPACING.sm,
  },
  typeIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  contentContainer: {
    marginBottom: SPACING.sm,
  },
  activityContent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[900],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  location: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tag: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  mediaContainer: {
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  mediaOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  mediaCount: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIcon: {
    fontSize: 32,
  },
  originalActivity: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[100],
  },
  originalUser: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.info[600],
    marginBottom: SPACING.xs,
  },
  originalContent: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[700],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  interactionsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: SPACING.sm,
  },
  interactionStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  interactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  interactionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  likedButton: {
    backgroundColor: COLORS.error[50],
  },
  commentedButton: {
    backgroundColor: COLORS.info[50],
  },
  sharedButton: {
    backgroundColor: COLORS.success[50],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error[500],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
});

export default ActivityFeed;
