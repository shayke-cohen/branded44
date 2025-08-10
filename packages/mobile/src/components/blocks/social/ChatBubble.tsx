/**
 * ChatBubble Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive chat bubble component for messaging interfaces,
 * supporting text, images, files, reactions, and message states.
 * 
 * Features:
 * - Text and media message support
 * - Own vs other user styling
 * - Message status indicators (sent, delivered, read)
 * - Timestamp display
 * - Message reactions
 * - Reply to messages
 * - Message editing indicators
 * - File attachments
 * - Long press actions
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <ChatBubble
 *   message={messageData}
 *   isOwn={message.senderId === currentUserId}
 *   onPress={(message) => handleMessagePress(message)}
 *   onLongPress={(message) => showMessageActions(message)}
 *   showTimestamp={true}
 *   showStatus={true}
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
  Image,
  StyleSheet 
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Message status
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Message type
 */
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';

/**
 * Message reaction
 */
export interface MessageReaction {
  /** Reaction emoji */
  emoji: string;
  /** User IDs who reacted */
  userIds: string[];
  /** Total count */
  count: number;
}

/**
 * Message attachment
 */
export interface MessageAttachment {
  /** Attachment ID */
  id: string;
  /** Attachment type */
  type: 'image' | 'file' | 'audio' | 'video';
  /** File URL */
  url: string;
  /** Thumbnail URL */
  thumbnail?: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** File dimensions for images/videos */
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * User information
 */
export interface ChatUser {
  /** User ID */
  id: string;
  /** Display name */
  name: string;
  /** Profile picture URL */
  avatar?: string;
  /** Online status */
  isOnline?: boolean;
}

/**
 * Reply to message reference
 */
export interface MessageReply {
  /** Original message ID */
  messageId: string;
  /** Original message text */
  text: string;
  /** Original message sender */
  sender: ChatUser;
  /** Original message type */
  type: MessageType;
}

/**
 * Chat message data structure
 */
export interface ChatMessage {
  /** Message ID */
  id: string;
  /** Message text content */
  text: string;
  /** Message type */
  type: MessageType;
  /** Message sender */
  sender: ChatUser;
  /** Message timestamp */
  timestamp: Date;
  /** Message status */
  status: MessageStatus;
  /** Message attachments */
  attachments?: MessageAttachment[];
  /** Message reactions */
  reactions?: MessageReaction[];
  /** Reply to message */
  replyTo?: MessageReply;
  /** Whether message was edited */
  isEdited?: boolean;
  /** Edit timestamp */
  editedAt?: Date;
  /** Whether message is forwarded */
  isForwarded?: boolean;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for the ChatBubble component
 */
export interface ChatBubbleProps extends BaseComponentProps {
  /** Message data */
  message: ChatMessage;
  /** Whether this is current user's message */
  isOwn: boolean;
  /** Callback when message is pressed */
  onPress?: (message: ChatMessage) => void;
  /** Callback when message is long pressed */
  onLongPress?: (message: ChatMessage) => void;
  /** Callback when avatar is pressed */
  onAvatarPress?: (user: ChatUser) => void;
  /** Callback when attachment is pressed */
  onAttachmentPress?: (attachment: MessageAttachment) => void;
  /** Callback when reaction is pressed */
  onReactionPress?: (emoji: string, message: ChatMessage) => void;
  /** Callback when reply is pressed */
  onReplyPress?: (message: ChatMessage) => void;
  /** Whether to show timestamp */
  showTimestamp?: boolean;
  /** Whether to show avatar */
  showAvatar?: boolean;
  /** Whether to show sender name */
  showSenderName?: boolean;
  /** Whether to show message status */
  showStatus?: boolean;
  /** Whether to show reactions */
  showReactions?: boolean;
  /** Whether message is part of a group */
  isGrouped?: boolean;
  /** Whether message is first in group */
  isFirstInGroup?: boolean;
  /** Whether message is last in group */
  isLastInGroup?: boolean;
  /** Maximum width for bubble */
  maxWidth?: number;
  /** Current user ID for reaction highlighting */
  currentUserId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ChatBubble component for displaying chat messages
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  onPress,
  onLongPress,
  onAvatarPress,
  onAttachmentPress,
  onReactionPress,
  onReplyPress,
  showTimestamp = true,
  showAvatar = true,
  showSenderName = false,
  showStatus = true,
  showReactions = true,
  isGrouped = false,
  isFirstInGroup = true,
  isLastInGroup = true,
  maxWidth = 280,
  currentUserId,
  style,
  testID = 'chat-bubble',
  ...props
}) => {
  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handlePress = useCallback(() => {
    onPress?.(message);
  }, [onPress, message]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(message);
  }, [onLongPress, message]);

  const handleAvatarPress = useCallback(() => {
    onAvatarPress?.(message.sender);
  }, [onAvatarPress, message.sender]);

  const handleAttachmentPress = useCallback((attachment: MessageAttachment) => {
    onAttachmentPress?.(attachment);
  }, [onAttachmentPress]);

  const handleReactionPress = useCallback((emoji: string) => {
    onReactionPress?.(emoji, message);
  }, [onReactionPress, message]);

  const handleReplyPress = useCallback(() => {
    onReplyPress?.(message);
  }, [onReplyPress, message]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getStatusIcon = (status: MessageStatus): string => {
    const icons: Record<MessageStatus, string> = {
      sending: '⏳',
      sent: '✓',
      delivered: '✓✓',
      read: '✓✓',
      failed: '❌',
    };
    return icons[status];
  };

  const getStatusColor = (status: MessageStatus): string => {
    const colors: Record<MessageStatus, string> = {
      sending: COLORS.neutral[400],
      sent: COLORS.neutral[500],
      delivered: COLORS.neutral[500],
      read: COLORS.info[500],
      failed: COLORS.error[500],
    };
    return colors[status];
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderAvatar = () => {
    if (!showAvatar || isOwn || (isGrouped && !isLastInGroup)) return null;

    return (
      <TouchableOpacity
        onPress={handleAvatarPress}
        style={styles.avatarContainer}
      >
        <Avatar style={styles.avatar}>
          {message.sender.avatar && (
            <AvatarImage source={{ uri: message.sender.avatar }} />
          )}
          <AvatarFallback>
            <Text style={styles.avatarFallback}>
              {message.sender.name.charAt(0).toUpperCase()}
            </Text>
          </AvatarFallback>
        </Avatar>
        {message.sender.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSenderName = () => {
    if (!showSenderName || isOwn || (isGrouped && !isFirstInGroup)) return null;

    return (
      <Text style={styles.senderName}>{message.sender.name}</Text>
    );
  };

  const renderReplyTo = () => {
    if (!message.replyTo) return null;

    return (
      <TouchableOpacity
        onPress={handleReplyPress}
        style={styles.replyContainer}
      >
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={styles.replyAuthor}>{message.replyTo.sender.name}</Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {message.replyTo.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <View style={styles.attachmentsContainer}>
        {message.attachments.map((attachment) => (
          <TouchableOpacity
            key={attachment.id}
            onPress={() => handleAttachmentPress(attachment)}
            style={styles.attachmentItem}
          >
            {attachment.type === 'image' && (
              <Image
                source={{ uri: attachment.thumbnail || attachment.url }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
            )}
            
            {attachment.type !== 'image' && (
              <View style={styles.fileAttachment}>
                <Text style={styles.fileName}>{attachment.name}</Text>
                <Text style={styles.fileSize}>
                  {(attachment.size / 1024 / 1024).toFixed(1)} MB
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReactions = () => {
    if (!showReactions || !message.reactions || message.reactions.length === 0) {
      return null;
    }

    return (
      <View style={styles.reactionsContainer}>
        {message.reactions.map((reaction, index) => {
          const hasReacted = currentUserId && reaction.userIds.includes(currentUserId);
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleReactionPress(reaction.emoji)}
              style={[
                styles.reactionBubble,
                hasReacted && styles.myReaction
              ]}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderMessageContent = () => (
    <View style={styles.messageContent}>
      {renderReplyTo()}
      
      {/* Message Text */}
      {message.text && (
        <Text style={[
          styles.messageText,
          isOwn ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {message.text}
        </Text>
      )}

      {/* Attachments */}
      {renderAttachments()}

      {/* Message Info */}
      <View style={styles.messageInfo}>
        {/* Edited Indicator */}
        {message.isEdited && (
          <Text style={styles.editedText}>edited</Text>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <Text style={[
            styles.timestamp,
            isOwn ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {formatDate(message.timestamp, 'time')}
          </Text>
        )}

        {/* Status (only for own messages) */}
        {showStatus && isOwn && (
          <Text style={[
            styles.status,
            { color: getStatusColor(message.status) }
          ]}>
            {getStatusIcon(message.status)}
          </Text>
        )}
      </View>
    </View>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const containerStyle = [
    styles.container,
    isOwn ? styles.ownContainer : styles.otherContainer,
    style
  ];

  const bubbleStyle = [
    styles.bubble,
    isOwn ? styles.ownBubble : styles.otherBubble,
    isGrouped && !isFirstInGroup && (isOwn ? styles.groupedOwnBubble : styles.groupedOtherBubble),
    { maxWidth }
  ];

  return (
    <View style={containerStyle} testID={testID} {...props}>
      {!isOwn && renderAvatar()}
      
      <View style={styles.messageContainer}>
        {renderSenderName()}
        
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={bubbleStyle}
          accessibilityRole="button"
          accessibilityLabel={`Message from ${message.sender.name}`}
        >
          {renderMessageContent()}
        </TouchableOpacity>

        {renderReactions()}
      </View>

      {/* Spacer for own messages */}
      {isOwn && <View style={styles.spacer} />}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
  },
  avatarFallback: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[600],
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success[500],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  messageContainer: {
    flex: 1,
    maxWidth: '85%',
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ownBubble: {
    backgroundColor: COLORS.info[500],
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  groupedOwnBubble: {
    borderBottomRightRadius: 16,
  },
  groupedOtherBubble: {
    borderBottomLeftRadius: 16,
  },
  messageContent: {
    // No additional styles needed
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
  replyAuthor: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.info[500],
    marginBottom: SPACING.xs,
  },
  replyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
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
  attachmentsContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  attachmentItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
  },
  fileName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    flex: 1,
  },
  fileSize: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  editedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[400],
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  ownTimestamp: {
    color: COLORS.info[100],
  },
  otherTimestamp: {
    color: COLORS.neutral[500],
  },
  status: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  reactionBubble: {
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
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  spacer: {
    width: 40,
  },
});

export default ChatBubble;
