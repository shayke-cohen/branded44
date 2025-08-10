/**
 * UserCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive user card component for displaying user profiles,
 * social connections, and user information in a compact format.
 * 
 * Features:
 * - Profile picture with fallback
 * - User information display (name, handle, bio)
 * - Follow/unfollow functionality
 * - Social stats (followers, following, posts)
 * - Online status indicator
 * - Verification badge
 * - Custom action buttons
 * - Multiple layout variants
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <UserCard
 *   user={userData}
 *   onFollow={(userId) => followUser(userId)}
 *   onMessage={(userId) => openChat(userId)}
 *   showStats={true}
 *   showFollowButton={true}
 *   variant="default"
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * User online status
 */
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

/**
 * User verification level
 */
export type VerificationLevel = 'verified' | 'premium' | 'none';

/**
 * User social statistics
 */
export interface UserStats {
  /** Number of followers */
  followers: number;
  /** Number of following */
  following: number;
  /** Number of posts */
  posts: number;
  /** Number of likes received */
  likes?: number;
}

/**
 * User data structure
 */
export interface UserCardData {
  /** User ID */
  id: string;
  /** User's full name */
  name: string;
  /** Username/handle */
  username?: string;
  /** User bio/description */
  bio?: string;
  /** Profile picture URL */
  avatar?: string;
  /** Online status */
  status: UserStatus;
  /** Verification level */
  verification: VerificationLevel;
  /** Social statistics */
  stats: UserStats;
  /** Whether current user follows this user */
  isFollowing?: boolean;
  /** Whether this user follows current user */
  followsYou?: boolean;
  /** User location */
  location?: string;
  /** User website */
  website?: string;
  /** Last seen timestamp */
  lastSeen?: Date;
  /** User badges/achievements */
  badges?: string[];
  /** Whether user is blocked */
  isBlocked?: boolean;
  /** Whether user is muted */
  isMuted?: boolean;
}

/**
 * Props for the UserCard component
 */
export interface UserCardProps extends BaseComponentProps {
  /** User data to display */
  user: UserCardData;
  /** Callback when user card is pressed */
  onPress?: (user: UserCardData) => void;
  /** Callback when follow button is pressed */
  onFollow?: (userId: string) => void;
  /** Callback when unfollow button is pressed */
  onUnfollow?: (userId: string) => void;
  /** Callback when message button is pressed */
  onMessage?: (userId: string) => void;
  /** Callback when user avatar is pressed */
  onAvatarPress?: (user: UserCardData) => void;
  /** Whether to show follow/unfollow button */
  showFollowButton?: boolean;
  /** Whether to show message button */
  showMessageButton?: boolean;
  /** Whether to show social statistics */
  showStats?: boolean;
  /** Whether to show online status */
  showStatus?: boolean;
  /** Whether to show user bio */
  showBio?: boolean;
  /** Whether to show verification badge */
  showVerification?: boolean;
  /** Whether to show location */
  showLocation?: boolean;
  /** Layout variant */
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  /** Whether card is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom action buttons */
  customActions?: Array<{
    label: string;
    onPress: (user: UserCardData) => void;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * UserCard component for displaying user profiles
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  onFollow,
  onUnfollow,
  onMessage,
  onAvatarPress,
  showFollowButton = true,
  showMessageButton = false,
  showStats = true,
  showStatus = true,
  showBio = true,
  showVerification = true,
  showLocation = false,
  variant = 'default',
  disabled = false,
  loading = false,
  customActions = [],
  style,
  testID = 'user-card',
  ...props
}) => {
  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    onPress?.(user);
  }, [disabled, loading, onPress, user]);

  const handleFollow = useCallback(() => {
    if (disabled || loading) return;
    if (user.isFollowing) {
      onUnfollow?.(user.id);
    } else {
      onFollow?.(user.id);
    }
  }, [disabled, loading, user.isFollowing, user.id, onFollow, onUnfollow]);

  const handleMessage = useCallback(() => {
    if (disabled || loading) return;
    onMessage?.(user.id);
  }, [disabled, loading, onMessage, user.id]);

  const handleAvatarPress = useCallback(() => {
    if (disabled || loading) return;
    onAvatarPress?.(user);
  }, [disabled, loading, onAvatarPress, user]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getStatusColor = (status: UserStatus): string => {
    const colors: Record<UserStatus, string> = {
      online: COLORS.success[500],
      away: COLORS.warning[500],
      busy: COLORS.error[500],
      offline: COLORS.neutral[400],
    };
    return colors[status];
  };

  const getVerificationIcon = (level: VerificationLevel): string | null => {
    const icons: Record<VerificationLevel, string | null> = {
      verified: '✓',
      premium: '⭐',
      none: null,
    };
    return icons[level];
  };

  const formatStats = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderAvatar = () => (
    <TouchableOpacity
      onPress={handleAvatarPress}
      style={styles.avatarContainer}
      disabled={disabled || loading}
    >
      <Avatar style={[
        styles.avatar,
        variant === 'compact' && styles.compactAvatar,
        variant === 'minimal' && styles.minimalAvatar
      ]}>
        {user.avatar && (
          <AvatarImage source={{ uri: user.avatar }} />
        )}
        <AvatarFallback>
          <Text style={styles.avatarFallback}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </AvatarFallback>
      </Avatar>

      {/* Online Status Indicator */}
      {showStatus && (
        <View 
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(user.status) }
          ]} 
        />
      )}
    </TouchableOpacity>
  );

  const renderUserInfo = () => (
    <View style={styles.userInfo}>
      {/* Name and Verification */}
      <View style={styles.nameContainer}>
        <Text 
          style={[
            styles.userName,
            variant === 'compact' && styles.compactUserName
          ]}
          numberOfLines={1}
        >
          {user.name}
        </Text>
        
        {showVerification && getVerificationIcon(user.verification) && (
          <Text style={styles.verificationIcon}>
            {getVerificationIcon(user.verification)}
          </Text>
        )}
        
        {user.followsYou && (
          <Badge variant="secondary" style={styles.followsBadge}>
            Follows you
          </Badge>
        )}
      </View>

      {/* Username */}
      {user.username && (
        <Text style={styles.username}>@{user.username}</Text>
      )}

      {/* Bio */}
      {showBio && user.bio && variant !== 'minimal' && (
        <Text 
          style={styles.bio}
          numberOfLines={variant === 'compact' ? 2 : 3}
        >
          {user.bio}
        </Text>
      )}

      {/* Location */}
      {showLocation && user.location && variant === 'detailed' && (
        <Text style={styles.location}>📍 {user.location}</Text>
      )}

      {/* Stats */}
      {showStats && variant !== 'minimal' && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatStats(user.stats.followers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatStats(user.stats.following)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatStats(user.stats.posts)}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          {user.stats.likes !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatStats(user.stats.likes)}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          )}
        </View>
      )}

      {/* Badges */}
      {user.badges && user.badges.length > 0 && variant === 'detailed' && (
        <View style={styles.badgesContainer}>
          {user.badges.slice(0, 3).map((badge, index) => (
            <Badge key={index} variant="outline" style={styles.achievementBadge}>
              {badge}
            </Badge>
          ))}
        </View>
      )}
    </View>
  );

  const renderActions = () => {
    if (variant === 'minimal') return null;

    const actions = [];

    // Follow Button
    if (showFollowButton && !user.isBlocked) {
      actions.push(
        <Button
          key="follow"
          variant={user.isFollowing ? "outline" : "default"}
          onPress={handleFollow}
          disabled={disabled || loading}
          style={styles.actionButton}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </Button>
      );
    }

    // Message Button
    if (showMessageButton && !user.isBlocked) {
      actions.push(
        <Button
          key="message"
          variant="secondary"
          onPress={handleMessage}
          disabled={disabled || loading}
          style={styles.actionButton}
        >
          Message
        </Button>
      );
    }

    // Custom Actions
    customActions.forEach((action, index) => {
      actions.push(
        <Button
          key={`custom-${index}`}
          variant={action.variant || "outline"}
          onPress={() => action.onPress(user)}
          disabled={disabled || loading}
          style={styles.actionButton}
        >
          {action.label}
        </Button>
      );
    });

    if (actions.length === 0) return null;

    return (
      <View style={[
        styles.actionsContainer,
        variant === 'compact' && styles.compactActions
      ]}>
        {actions}
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const cardStyle = [
    styles.card,
    variant === 'compact' && styles.compactCard,
    variant === 'minimal' && styles.minimalCard,
    disabled && styles.disabledCard,
    style
  ];

  const contentStyle = [
    styles.content,
    variant === 'minimal' && styles.minimalContent
  ];

  return (
    <Card style={cardStyle} testID={testID} {...props}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading || !onPress}
        style={contentStyle}
        accessibilityRole="button"
        accessibilityLabel={`User card for ${user.name}`}
      >
        <View style={styles.header}>
          {renderAvatar()}
          {renderUserInfo()}
        </View>
        
        {renderActions()}

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Blocked/Muted Indicators */}
        {user.isBlocked && (
          <View style={styles.blockedOverlay}>
            <Text style={styles.blockedText}>User Blocked</Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    margin: 0,
  },
  compactCard: {
    marginBottom: SPACING.sm,
  },
  minimalCard: {
    marginBottom: SPACING.xs,
  },
  disabledCard: {
    opacity: 0.6,
  },
  content: {
    padding: SPACING.md,
  },
  minimalContent: {
    padding: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  compactAvatar: {
    width: 48,
    height: 48,
  },
  minimalAvatar: {
    width: 40,
    height: 40,
  },
  avatarFallback: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[600],
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginRight: SPACING.xs,
  },
  compactUserName: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  verificationIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info[500],
    marginRight: SPACING.xs,
  },
  followsBadge: {
    marginLeft: SPACING.xs,
  },
  username: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  bio: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[700],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  location: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginBottom: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  achievementBadge: {
    marginRight: SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  compactActions: {
    gap: SPACING.xs,
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  blockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default UserCard;
