/**
 * CommentList Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive comment list component for displaying threaded comments,
 * replies, and user interactions in social media and content applications.
 * 
 * Features:
 * - Threaded/nested comments support
 * - Like and reply functionality
 * - User avatars and verification badges
 * - Timestamp display with relative formatting
 * - Load more comments and replies
 * - Sort comments (newest, oldest, most liked)
 * - Comment moderation actions
 * - Accessibility support
 * - Optimized for large comment threads
 * 
 * @example
 * ```tsx
 * <CommentList
 *   comments={commentsData}
 *   onLike={(commentId) => likeComment(commentId)}
 *   onReply={(commentId) => replyToComment(commentId)}
 *   onLoadMore={() => loadMoreComments()}
 *   showReplies={true}
 *   maxDepth={3}
 *   sortBy="newest"
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
  StyleSheet 
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Comment sort options
 */
export type CommentSortBy = 'newest' | 'oldest' | 'most_liked' | 'controversial';

/**
 * User information for comments
 */
export interface CommentUser {
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
  /** User badge/role */
  badge?: string;
  /** Badge color */
  badgeColor?: string;
}

/**
 * Comment data structure with threading support
 */
export interface Comment {
  /** Comment ID */
  id: string;
  /** Comment text content */
  text: string;
  /** Comment author */
  author: CommentUser;
  /** Comment timestamp */
  timestamp: Date;
  /** Number of likes */
  likes: number;
  /** Whether current user liked this comment */
  isLiked: boolean;
  /** Whether current user can reply */
  canReply: boolean;
  /** Whether current user can edit */
  canEdit: boolean;
  /** Whether current user can delete */
  canDelete: boolean;
  /** Whether comment is edited */
  isEdited?: boolean;
  /** Edit timestamp */
  editedAt?: Date;
  /** Whether comment is pinned */
  isPinned?: boolean;
  /** Parent comment ID (for replies) */
  parentId?: string;
  /** Nested replies */
  replies?: Comment[];
  /** Total reply count (including nested) */
  replyCount: number;
  /** Comment depth level */
  depth: number;
  /** Whether comment is flagged/reported */
  isFlagged?: boolean;
  /** Whether comment is hidden */
  isHidden?: boolean;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for the CommentList component
 */
export interface CommentListProps extends BaseComponentProps {
  /** Array of comments to display */
  comments: Comment[];
  /** Callback when comment is pressed */
  onCommentPress?: (comment: Comment) => void;
  /** Callback when like button is pressed */
  onLike?: (commentId: string) => void;
  /** Callback when reply button is pressed */
  onReply?: (commentId: string) => void;
  /** Callback when user avatar/name is pressed */
  onUserPress?: (user: CommentUser) => void;
  /** Callback when edit is requested */
  onEdit?: (commentId: string) => void;
  /** Callback when delete is requested */
  onDelete?: (commentId: string) => void;
  /** Callback when report is requested */
  onReport?: (commentId: string) => void;
  /** Callback to load more comments */
  onLoadMore?: () => void;
  /** Callback to load replies for a comment */
  onLoadReplies?: (commentId: string) => void;
  /** Whether to show nested replies */
  showReplies?: boolean;
  /** Maximum nesting depth */
  maxDepth?: number;
  /** Whether to show user avatars */
  showAvatars?: boolean;
  /** Whether to show timestamps */
  showTimestamps?: boolean;
  /** Whether to show like counts */
  showLikes?: boolean;
  /** Whether to show reply buttons */
  showReplyButton?: boolean;
  /** Sort order for comments */
  sortBy?: CommentSortBy;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of comments to show initially */
  initialNumToRender?: number;
  /** Whether there are more comments to load */
  hasMore?: boolean;
  /** Current user ID for permissions */
  currentUserId?: string;
  /** Comment filtering function */
  filterComments?: (comment: Comment) => boolean;
  /** Layout variant */
  variant?: 'default' | 'compact' | 'minimal';
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CommentList component for displaying threaded comments
 */
export const CommentList: React.FC<CommentListProps> = ({
  comments,
  onCommentPress,
  onLike,
  onReply,
  onUserPress,
  onEdit,
  onDelete,
  onReport,
  onLoadMore,
  onLoadReplies,
  showReplies = true,
  maxDepth = 3,
  showAvatars = true,
  showTimestamps = true,
  showLikes = true,
  showReplyButton = true,
  sortBy = 'newest',
  loading = false,
  error,
  emptyMessage = 'No comments yet',
  initialNumToRender = 10,
  hasMore = false,
  currentUserId,
  filterComments,
  variant = 'default',
  style,
  testID = 'comment-list',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const processedComments = useMemo(() => {
    let filtered = comments;

    // Apply custom filter
    if (filterComments) {
      filtered = filtered.filter(filterComments);
    }

    // Apply sorting
    const sortFunctions: Record<CommentSortBy, (a: Comment, b: Comment) => number> = {
      newest: (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      oldest: (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      most_liked: (a, b) => b.likes - a.likes,
      controversial: (a, b) => {
        // Sort by engagement (likes + replies) but prefer contested comments
        const aEngagement = a.likes + a.replyCount;
        const bEngagement = b.likes + b.replyCount;
        return bEngagement - aEngagement;
      },
    };

    filtered = filtered.sort(sortFunctions[sortBy]);

    // Move pinned comments to top
    const pinned = filtered.filter(c => c.isPinned);
    const regular = filtered.filter(c => !c.isPinned);
    
    return [...pinned, ...regular];
  }, [comments, filterComments, sortBy]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleCommentPress = useCallback((comment: Comment) => {
    onCommentPress?.(comment);
  }, [onCommentPress]);

  const handleLike = useCallback((commentId: string) => {
    onLike?.(commentId);
  }, [onLike]);

  const handleReply = useCallback((commentId: string) => {
    onReply?.(commentId);
  }, [onReply]);

  const handleUserPress = useCallback((user: CommentUser) => {
    onUserPress?.(user);
  }, [onUserPress]);

  const handleEdit = useCallback((commentId: string) => {
    onEdit?.(commentId);
  }, [onEdit]);

  const handleDelete = useCallback((commentId: string) => {
    onDelete?.(commentId);
  }, [onDelete]);

  const handleReport = useCallback((commentId: string) => {
    onReport?.(commentId);
  }, [onReport]);

  const handleToggleReplies = useCallback((commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
        // Load replies if not already loaded
        onLoadReplies?.(commentId);
      }
      return newSet;
    });
  }, [onLoadReplies]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getIndentLevel = (depth: number): number => {
    return Math.min(depth, maxDepth) * 20;
  };

  const formatLikeCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderCommentActions = useCallback((comment: Comment) => {
    const actions = [];
    const isOwn = comment.author.id === currentUserId;

    // Like button
    if (showLikes) {
      actions.push(
        <TouchableOpacity
          key="like"
          onPress={() => handleLike(comment.id)}
          style={[styles.actionButton, comment.isLiked && styles.likedButton]}
        >
          <Text style={[
            styles.actionText,
            comment.isLiked && styles.likedText
          ]}>
            {comment.isLiked ? '❤️' : '🤍'} {showLikes && comment.likes > 0 ? formatLikeCount(comment.likes) : ''}
          </Text>
        </TouchableOpacity>
      );
    }

    // Reply button
    if (showReplyButton && comment.canReply && comment.depth < maxDepth) {
      actions.push(
        <TouchableOpacity
          key="reply"
          onPress={() => handleReply(comment.id)}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>💬 Reply</Text>
        </TouchableOpacity>
      );
    }

    // Edit button (own comments)
    if (isOwn && comment.canEdit) {
      actions.push(
        <TouchableOpacity
          key="edit"
          onPress={() => handleEdit(comment.id)}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>✏️ Edit</Text>
        </TouchableOpacity>
      );
    }

    // Delete button (own comments)
    if (isOwn && comment.canDelete) {
      actions.push(
        <TouchableOpacity
          key="delete"
          onPress={() => handleDelete(comment.id)}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, styles.deleteText]}>🗑️ Delete</Text>
        </TouchableOpacity>
      );
    }

    // Report button (others' comments)
    if (!isOwn && onReport) {
      actions.push(
        <TouchableOpacity
          key="report"
          onPress={() => handleReport(comment.id)}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, styles.reportText]}>🚩 Report</Text>
        </TouchableOpacity>
      );
    }

    if (actions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {actions}
      </View>
    );
  }, [
    showLikes,
    showReplyButton,
    maxDepth,
    currentUserId,
    handleLike,
    handleReply,
    handleEdit,
    handleDelete,
    handleReport,
    onReport
  ]);

  const renderReplies = useCallback((comment: Comment) => {
    if (!showReplies || !comment.replies || comment.replies.length === 0) {
      return null;
    }

    const isExpanded = expandedReplies.has(comment.id);

    return (
      <View style={styles.repliesContainer}>
        {/* Toggle Replies Button */}
        <TouchableOpacity
          onPress={() => handleToggleReplies(comment.id)}
          style={styles.toggleRepliesButton}
        >
          <Text style={styles.toggleRepliesText}>
            {isExpanded ? '▼' : '▶'} {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
          </Text>
        </TouchableOpacity>

        {/* Render Replies */}
        {isExpanded && comment.replies.map((reply) => (
          renderCommentItem({ item: reply, index: 0 })
        ))}
      </View>
    );
  }, [showReplies, expandedReplies, handleToggleReplies]);

  const renderCommentItem = useCallback(({ item: comment, index }: { item: Comment; index: number }) => {
    const isCompact = variant === 'compact';
    const isMinimal = variant === 'minimal';
    const indentLevel = getIndentLevel(comment.depth);

    return (
      <View
        key={comment.id}
        style={[
          styles.commentContainer,
          { marginLeft: indentLevel },
          comment.isPinned && styles.pinnedComment,
          comment.isHidden && styles.hiddenComment
        ]}
        testID={`${testID}-item-${index}`}
      >
        <TouchableOpacity
          onPress={() => handleCommentPress(comment)}
          style={styles.commentContent}
          accessibilityRole="button"
          accessibilityLabel={`Comment by ${comment.author.name}`}
        >
          {/* Header */}
          <View style={styles.commentHeader}>
            {/* Avatar */}
            {showAvatars && !isMinimal && (
              <TouchableOpacity
                onPress={() => handleUserPress(comment.author)}
                style={styles.avatarContainer}
              >
                <Avatar style={[styles.avatar, isCompact && styles.compactAvatar]}>
                  {comment.author.avatar && (
                    <AvatarImage source={{ uri: comment.author.avatar }} />
                  )}
                  <AvatarFallback>
                    <Text style={styles.avatarFallback}>
                      {comment.author.name.charAt(0).toUpperCase()}
                    </Text>
                  </AvatarFallback>
                </Avatar>
              </TouchableOpacity>
            )}

            {/* User Info */}
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => handleUserPress(comment.author)}>
                <View style={styles.userNameContainer}>
                  <Text style={styles.userName}>{comment.author.name}</Text>
                  
                  {showTimestamps && comment.author.verified && (
                    <Text style={styles.verifiedIcon}>✓</Text>
                  )}
                  
                  {comment.author.badge && (
                    <Badge 
                      variant="secondary" 
                      style={[styles.userBadge, { backgroundColor: comment.author.badgeColor }]}
                    >
                      {comment.author.badge}
                    </Badge>
                  )}

                  {comment.isPinned && (
                    <Badge variant="outline" style={styles.pinnedBadge}>
                      📌 Pinned
                    </Badge>
                  )}
                </View>
                
                {comment.author.username && !isMinimal && (
                  <Text style={styles.userHandle}>@{comment.author.username}</Text>
                )}
              </TouchableOpacity>

              {showTimestamps && (
                <Text style={styles.timestamp}>
                  {formatDate(comment.timestamp, 'relative')}
                  {comment.isEdited && ' (edited)'}
                </Text>
              )}
            </View>
          </View>

          {/* Comment Text */}
          <View style={styles.textContainer}>
            <Text style={styles.commentText}>{comment.text}</Text>
          </View>

          {/* Actions */}
          {!isMinimal && renderCommentActions(comment)}

          {/* Replies */}
          {renderReplies(comment)}
        </TouchableOpacity>
      </View>
    );
  }, [
    variant,
    showAvatars,
    showTimestamps,
    handleCommentPress,
    handleUserPress,
    renderCommentActions,
    renderReplies,
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

  if (!loading && processedComments.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.emptyText}>💬 {emptyMessage}</Text>
      </View>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <FlatList
      data={processedComments}
      renderItem={renderCommentItem}
      keyExtractor={(item) => item.id}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      initialNumToRender={initialNumToRender}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      testID={testID}
      ListFooterComponent={
        hasMore ? (
          <Button onPress={onLoadMore} style={styles.loadMoreButton}>
            Load More Comments
          </Button>
        ) : null
      }
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
  commentContainer: {
    marginBottom: SPACING.md,
  },
  pinnedComment: {
    backgroundColor: COLORS.warning[50],
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning[500],
    paddingLeft: SPACING.sm,
  },
  hiddenComment: {
    opacity: 0.5,
  },
  commentContent: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  compactAvatar: {
    width: 32,
    height: 32,
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
    flexWrap: 'wrap',
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
    marginRight: SPACING.xs,
  },
  userBadge: {
    marginRight: SPACING.xs,
  },
  pinnedBadge: {
    marginRight: SPACING.xs,
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
  textContainer: {
    marginBottom: SPACING.sm,
  },
  commentText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[900],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.lg,
  },
  actionButton: {
    paddingVertical: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  likedButton: {
    // No additional styles needed
  },
  likedText: {
    color: COLORS.error[500],
  },
  deleteText: {
    color: COLORS.error[600],
  },
  reportText: {
    color: COLORS.warning[600],
  },
  repliesContainer: {
    marginTop: SPACING.sm,
  },
  toggleRepliesButton: {
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  toggleRepliesText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  loadMoreButton: {
    marginTop: SPACING.md,
    alignSelf: 'center',
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

export default CommentList;
