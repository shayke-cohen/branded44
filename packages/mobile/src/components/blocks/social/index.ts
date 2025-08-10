/**
 * Social & Communication Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all social and communication-related block components
 * with their TypeScript definitions. These components are optimized for
 * AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === USER PROFILE COMPONENTS ===

export { default as UserCard } from './UserCard';
export type { 
  UserCardProps,
  UserCardData,
  UserStats,
  UserStatus,
  VerificationLevel
} from './UserCard';

// === MESSAGING COMPONENTS ===

export { default as ChatBubble } from './ChatBubble';
export type { 
  ChatBubbleProps,
  ChatMessage,
  ChatUser,
  MessageAttachment,
  MessageReaction,
  MessageReply,
  MessageStatus,
  MessageType
} from './ChatBubble';

// === COMMENT COMPONENTS ===

export { default as CommentList } from './CommentList';
export type { 
  CommentListProps,
  Comment,
  CommentUser,
  CommentSortBy
} from './CommentList';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { formatDate, cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Social & Communication Blocks
 * 
 * Quick Selection Guide:
 * - UserCard: User profiles, friend lists, team member displays
 * - ChatBubble: Individual chat messages, messaging interfaces
 * - CommentList: Comments on posts, reviews, threaded discussions
 * 
 * Common Implementation Patterns:
 * 
 * 1. Social Profile Display:
 * ```tsx
 * <UserCard
 *   user={userData}
 *   onFollow={(userId) => followUser(userId)}
 *   showStats={true}
 *   variant="default"
 * />
 * ```
 * 
 * 2. Chat Interface:
 * ```tsx
 * <ChatBubble
 *   message={messageData}
 *   isOwn={message.senderId === currentUserId}
 *   onPress={(message) => handleMessagePress(message)}
 *   showTimestamp={true}
 * />
 * ```
 * 
 * 3. Comment System:
 * ```tsx
 * <CommentList
 *   comments={commentsData}
 *   onLike={(commentId) => likeComment(commentId)}
 *   onReply={(commentId) => replyToComment(commentId)}
 *   showReplies={true}
 *   maxDepth={3}
 * />
 * ```
 * 
 * Component Combinations:
 * - UserCard + CommentList: User profiles with their recent comments
 * - ChatBubble: Can be used standalone or in lists for full chat interfaces
 * - CommentList: Works with any content type (posts, articles, media)
 * 
 * Performance Tips:
 * - Use virtualizeWithIndex for large comment threads
 * - Implement pagination for UserCard lists
 * - Cache user data across components
 * - Use optimistic updates for likes and follows
 * 
 * Accessibility Features:
 * - Screen reader support for all interactions
 * - Keyboard navigation support
 * - High contrast mode compatibility
 * - Voice over announcements for actions
 */
