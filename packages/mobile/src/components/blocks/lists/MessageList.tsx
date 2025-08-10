/**
 * MessageList Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive message listing component for chat applications,
 * displaying conversations with message bubbles, timestamps, and status indicators.
 * 
 * Features:
 * - Message bubbles with sent/received styling
 * - Read receipts and delivery status
 * - Typing indicators and online status
 * - Message reactions and replies
 * - Media message support (images, videos, files)
 * - Message grouping by sender and time
 * - Search and filter capabilities
 * - Real-time message updates
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <MessageList
 *   messages={chatMessages}
 *   currentUserId="user123"
 *   onMessagePress={(message) => handleMessageAction(message)}
 *   onReaction={(messageId, reaction) => addReaction(messageId, reaction)}
 *   showReactions={true}
 *   enableReply={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Dimensions,
  Animated
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Avatar } from '../../../../~/components/ui/avatar';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatTime, formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// TYPES
// =============================================================================

/**
 * Message types
 */
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'voice' | 'location' | 'system';

/**
 * Message delivery status
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Message reaction
 */
export interface MessageReaction {
  /** Reaction emoji */
  emoji: string;
  /** User IDs who reacted */
  userIds: string[];
  /** Reaction count */
  count: number;
}

/**
 * Message attachment
 */
export interface MessageAttachment {
  /** Attachment ID */
  id: string;
  /** File name */
  name: string;
  /** File URL */
  url: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Image/video dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Thumbnail URL for media */
  thumbnail?: string;
}

/**
 * Message reply information
 */
export interface MessageReply {
  /** Original message ID */
  messageId: string;
  /** Original message text preview */
  text: string;
  /** Original message sender */
  senderName: string;
  /** Original message type */
  type: MessageType;
}

/**
 * Message data structure
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  /** Message content */
  text: string;
  /** Message type */
  type: MessageType;
  /** Sender user ID */
  senderId: string;
  /** Sender display name */
  senderName: string;
  /** Sender avatar URL */
  senderAvatar?: string;
  /** Message timestamp */
  timestamp: Date;
  /** Delivery status */
  status: MessageStatus;
  /** Message attachments */
  attachments?: MessageAttachment[];
  /** Message reactions */
  reactions?: MessageReaction[];
  /** Reply information */
  reply?: MessageReply;
  /** Whether message is edited */
  isEdited?: boolean;
  /** Edit timestamp */
  editedAt?: Date;
  /** Whether message is pinned */
  isPinned?: boolean;
  /** Message thread ID */
  threadId?: string;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Typing indicator data
 */
export interface TypingIndicator {
  /** User ID */
  userId: string;
  /** User name */
  userName: string;
  /** User avatar */
  userAvatar?: string;
}

/**
 * Props for the MessageList component
 */
export interface MessageListProps extends BaseComponentProps {
  /** Array of messages to display */
  messages: Message[];
  /** Current user ID for styling sent/received messages */
  currentUserId: string;
  /** Callback when a message is pressed */
  onMessagePress?: (message: Message) => void;
  /** Callback when a message is long pressed */
  onMessageLongPress?: (message: Message) => void;
  /** Callback when a reaction is added */
  onReaction?: (messageId: string, emoji: string) => void;
  /** Callback when reply is initiated */
  onReply?: (message: Message) => void;
  /** Callback when attachment is pressed */
  onAttachmentPress?: (attachment: MessageAttachment, message: Message) => void;
  /** Whether to show message reactions */
  showReactions?: boolean;
  /** Whether to enable reply functionality */
  enableReply?: boolean;
  /** Whether to show avatars for all messages */
  showAvatars?: boolean;
  /** Whether to show timestamps */
  showTimestamps?: boolean;
  /** Whether to show read receipts */
  showReadReceipts?: boolean;
  /** Whether to group consecutive messages from same sender */
  groupMessages?: boolean;
  /** Maximum message bubble width ratio */
  maxBubbleWidth?: number;
  /** Typing indicators */
  typingUsers?: TypingIndicator[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Load more messages handler */
  onLoadMore?: () => void;
  /** Whether there are more messages to load */
  hasMore?: boolean;
  /** Message filtering function */
  filterMessages?: (message: Message) => boolean;
  /** Custom message renderer */
  renderMessage?: (message: Message, index: number, isGrouped: boolean) => React.ReactElement;
  /** Custom typing indicator renderer */
  renderTypingIndicator?: (users: TypingIndicator[]) => React.ReactElement;
  /** Available reaction emojis */
  reactionEmojis?: string[];
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * MessageList component for displaying chat messages
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onMessagePress,
  onMessageLongPress,
  onReaction,
  onReply,
  onAttachmentPress,
  showReactions = true,
  enableReply = true,
  showAvatars = true,
  showTimestamps = true,
  showReadReceipts = true,
  groupMessages = true,
  maxBubbleWidth = 0.75,
  typingUsers = [],
  loading = false,
  error,
  emptyMessage = 'No messages yet',
  onLoadMore,
  hasMore = false,
  filterMessages,
  renderMessage,
  renderTypingIndicator,
  reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'],
  style,
  testID = 'message-list',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const processedMessages = useMemo(() => {
    let filtered = messages;

    // Apply custom filter
    if (filterMessages) {
      filtered = filtered.filter(filterMessages);
    }

    // Sort by timestamp (newest at bottom)
    filtered = filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Add grouping information
    return filtered.map((message, index) => {
      const prevMessage = index > 0 ? filtered[index - 1] : null;
      const nextMessage = index < filtered.length - 1 ? filtered[index + 1] : null;
      
      const isGrouped = groupMessages && 
        prevMessage &&
        prevMessage.senderId === message.senderId &&
        message.timestamp.getTime() - prevMessage.timestamp.getTime() < 5 * 60 * 1000; // 5 minutes

      const isLastInGroup = !nextMessage ||
        nextMessage.senderId !== message.senderId ||
        nextMessage.timestamp.getTime() - message.timestamp.getTime() > 5 * 60 * 1000;

      return {
        ...message,
        isGrouped,
        isLastInGroup,
      };
    });
  }, [messages, filterMessages, groupMessages]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleMessagePress = useCallback((message: Message) => {
    setSelectedMessage(selectedMessage === message.id ? null : message.id);
    onMessagePress?.(message);
  }, [selectedMessage, onMessagePress]);

  const handleMessageLongPress = useCallback((message: Message) => {
    onMessageLongPress?.(message);
  }, [onMessageLongPress]);

  const handleReaction = useCallback((message: Message, emoji: string) => {
    onReaction?.(message.id, emoji);
  }, [onReaction]);

  const handleReply = useCallback((message: Message) => {
    onReply?.(message);
  }, [onReply]);

  const handleAttachmentPress = useCallback((attachment: MessageAttachment, message: Message) => {
    onAttachmentPress?.(attachment, message);
  }, [onAttachmentPress]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const isOwnMessage = (message: Message): boolean => {
    return message.senderId === currentUserId;
  };

  const getMessageStatusIcon = (status: MessageStatus): string => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '👁️';
      case 'failed': return '❌';
      default: return '';
    }
  };

  const shouldShowTimestamp = (message: any, index: number): boolean => {
    if (!showTimestamps) return false;
    
    const prevMessage = index > 0 ? processedMessages[index - 1] : null;
    if (!prevMessage) return true;
    
    // Show timestamp if more than 10 minutes passed
    return message.timestamp.getTime() - prevMessage.timestamp.getTime() > 10 * 60 * 1000;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderAttachment = useCallback((attachment: MessageAttachment, message: Message) => {
    const isImage = attachment.mimeType.startsWith('image/');
    const isVideo = attachment.mimeType.startsWith('video/');

    if (isImage || isVideo) {
      const imageUri = attachment.thumbnail || attachment.url;
      const aspectRatio = attachment.dimensions 
        ? attachment.dimensions.width / attachment.dimensions.height 
        : 1;
      
      const maxWidth = SCREEN_WIDTH * maxBubbleWidth - SPACING.lg * 2;
      const height = Math.min(200, maxWidth / aspectRatio);

      return (
        <TouchableOpacity
          onPress={() => handleAttachmentPress(attachment, message)}
          style={styles.mediaAttachment}
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.mediaImage, { height, aspectRatio }]}
            resizeMode="cover"
          />
          {isVideo && (
            <View style={styles.videoOverlay}>
              <Text style={styles.playIcon}>▶️</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => handleAttachmentPress(attachment, message)}
        style={styles.fileAttachment}
      >
        <Text style={styles.fileIcon}>📁</Text>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {attachment.name}
          </Text>
          <Text style={styles.fileSize}>
            {(attachment.size / 1024 / 1024).toFixed(1)} MB
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [maxBubbleWidth, handleAttachmentPress]);

  const renderReactions = useCallback((message: Message) => {
    if (!showReactions || !message.reactions?.length) return null;

    return (
      <View style={styles.reactionsContainer}>
        {message.reactions.map((reaction, index) => (
          <TouchableOpacity
            key={`${reaction.emoji}-${index}`}
            onPress={() => handleReaction(message, reaction.emoji)}
            style={[
              styles.reactionBadge,
              reaction.userIds.includes(currentUserId) && styles.myReaction
            ]}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={styles.reactionCount}>{reaction.count}</Text>
          </TouchableOpacity>
        ))}
        
        {/* Add reaction button */}
        <TouchableOpacity
          style={styles.addReactionButton}
          onPress={() => {
            // Show reaction picker - this would typically open a modal
            // For now, just add a default reaction
            handleReaction(message, reactionEmojis[0]);
          }}
        >
          <Text style={styles.addReactionIcon}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }, [showReactions, currentUserId, handleReaction, reactionEmojis]);

  const renderReply = useCallback((reply: MessageReply) => {
    return (
      <View style={styles.replyContainer}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={styles.replySender}>{reply.senderName}</Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {reply.type === 'text' ? reply.text : `[${reply.type}]`}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderMessageItem = useCallback(({ item: message, index }: { item: any; index: number }) => {
    if (renderMessage) {
      return renderMessage(message, index, message.isGrouped);
    }

    const isOwn = isOwnMessage(message);
    const showAvatar = showAvatars && !isOwn && !message.isGrouped;
    const showName = !isOwn && !message.isGrouped;
    const showStatus = isOwn && showReadReceipts && message.isLastInGroup;

    return (
      <View style={styles.messageContainer} testID={`${testID}-item-${index}`}>
        {shouldShowTimestamp(message, index) && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              {formatDate(message.timestamp, 'MMM DD, HH:mm')}
            </Text>
          </View>
        )}

        <View style={[
          styles.messageRow,
          isOwn ? styles.ownMessageRow : styles.otherMessageRow
        ]}>
          {/* Avatar */}
          {showAvatar && (
            <Avatar
              source={message.senderAvatar ? { uri: message.senderAvatar } : undefined}
              fallback={message.senderName.charAt(0)}
              size="sm"
              style={styles.messageAvatar}
            />
          )}

          {/* Message bubble */}
          <View style={[
            styles.messageBubbleContainer,
            !showAvatar && !isOwn && styles.messageBubbleWithoutAvatar,
            { maxWidth: SCREEN_WIDTH * maxBubbleWidth }
          ]}>
            {/* Sender name */}
            {showName && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}

            <TouchableOpacity
              onPress={() => handleMessagePress(message)}
              onLongPress={() => handleMessageLongPress(message)}
              style={[
                styles.messageBubble,
                isOwn ? styles.ownMessageBubble : styles.otherMessageBubble,
                message.isGrouped && isOwn && styles.groupedOwnMessage,
                message.isGrouped && !isOwn && styles.groupedOtherMessage,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Message from ${message.senderName}: ${message.text}`}
            >
              {/* Reply */}
              {message.reply && renderReply(message.reply)}

              {/* Message content */}
              {message.text && (
                <Text style={[
                  styles.messageText,
                  isOwn ? styles.ownMessageText : styles.otherMessageText
                ]}>
                  {message.text}
                </Text>
              )}

              {/* Attachments */}
              {message.attachments?.map((attachment) => (
                <View key={attachment.id} style={styles.attachmentContainer}>
                  {renderAttachment(attachment, message)}
                </View>
              ))}

              {/* Message info */}
              <View style={styles.messageInfo}>
                {message.isEdited && (
                  <Text style={styles.editedText}>edited</Text>
                )}
                <Text style={[
                  styles.messageTime,
                  isOwn ? styles.ownMessageTime : styles.otherMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
                {showStatus && (
                  <Text style={styles.messageStatus}>
                    {getMessageStatusIcon(message.status)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Reactions */}
            {renderReactions(message)}

            {/* Reply button */}
            {enableReply && selectedMessage === message.id && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => handleReply(message)}
                style={styles.replyButton}
              >
                💬 Reply
              </Button>
            )}
          </View>
        </View>
      </View>
    );
  }, [
    renderMessage,
    showAvatars,
    showReadReceipts,
    enableReply,
    selectedMessage,
    maxBubbleWidth,
    currentUserId,
    shouldShowTimestamp,
    handleMessagePress,
    handleMessageLongPress,
    handleReply,
    renderAttachment,
    renderReactions,
    renderReply,
    testID
  ]);

  const renderTypingIndicatorDefault = useCallback(() => {
    if (!typingUsers.length) return null;

    if (renderTypingIndicator) {
      return renderTypingIndicator(typingUsers);
    }

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingAvatars}>
          {typingUsers.slice(0, 3).map((user, index) => (
            <Avatar
              key={user.userId}
              source={user.userAvatar ? { uri: user.userAvatar } : undefined}
              fallback={user.userName.charAt(0)}
              size="sm"
              style={[styles.typingAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
            />
          ))}
        </View>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, styles.typingDot1]} />
            <Animated.View style={[styles.typingDot, styles.typingDot2]} />
            <Animated.View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  }, [typingUsers, renderTypingIndicator]);

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

  if (!loading && processedMessages.length === 0) {
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
    <View style={[styles.container, style]} testID={testID}>
      <FlatList
        ref={flatListRef}
        data={processedMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        {...props}
      />
      {renderTypingIndicatorDefault()}
    </View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageContainer: {
    marginBottom: SPACING.xs,
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  timestampText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  messageBubbleContainer: {
    maxWidth: '75%',
  },
  messageBubbleWithoutAvatar: {
    marginLeft: 32, // Avatar width + margin
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  messageBubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 18,
    marginBottom: SPACING.xs,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.info[500],
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupedOwnMessage: {
    borderBottomRightRadius: 18,
    marginBottom: 2,
  },
  groupedOtherMessage: {
    borderBottomLeftRadius: 18,
    marginBottom: 2,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.neutral[900],
  },
  attachmentContainer: {
    marginTop: SPACING.xs,
  },
  mediaAttachment: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    borderRadius: 8,
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
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  fileSize: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  editedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[400],
    marginRight: SPACING.xs,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  ownMessageTime: {
    color: COLORS.info[100],
  },
  otherMessageTime: {
    color: COLORS.neutral[500],
  },
  messageStatus: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginLeft: SPACING.xs,
    color: COLORS.info[100],
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  replyBar: {
    width: 3,
    backgroundColor: COLORS.info[500],
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  replyContent: {
    flex: 1,
  },
  replySender: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.info[500],
  },
  replyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  myReaction: {
    backgroundColor: COLORS.info[100],
  },
  reactionEmoji: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  reactionCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  addReactionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 12,
    width: 24,
    height: 24,
  },
  addReactionIcon: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  replyButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  typingAvatars: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  typingAvatar: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  typingBubble: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neutral[400],
    marginHorizontal: 2,
  },
  typingDot1: {},
  typingDot2: {},
  typingDot3: {},
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

export default MessageList;
