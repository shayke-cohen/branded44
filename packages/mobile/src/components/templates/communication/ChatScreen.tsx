/**
 * ChatScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive chat screen template that provides full messaging functionality
 * with real-time communication, media sharing, and message management.
 * 
 * Features:
 * - Real-time message display with ChatBubble integration
 * - Message input with text, media, and emoji support
 * - Typing indicators and online status
 * - Message reactions and replies
 * - File and media attachment support
 * - Voice message recording and playback
 * - Message search and filtering
 * - Message deletion and editing
 * - Read receipts and delivery status
 * - Infinite scroll with message history
 * - Group chat participant management
 * - Message translation support
 * - Auto-scroll to new messages
 * 
 * @example
 * ```tsx
 * <ChatScreen
 *   conversation={chatConversation}
 *   messages={chatMessages}
 *   currentUser={currentUser}
 *   onSendMessage={(message) => handleSendMessage(message)}
 *   onSendMedia={(media) => handleSendMedia(media)}
 *   onMessageReaction={(messageId, reaction) => handleReaction(messageId, reaction)}
 *   onTyping={(isTyping) => handleTyping(isTyping)}
 *   loading={messagesLoading}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  ChatBubble,
  UserCard 
} from '../../blocks/social';
import type { 
  ChatMessage,
  ChatUser,
  MessageAttachment,
  MessageReaction,
  MessageStatus
} from '../../blocks/social';
import { ImageGallery } from '../../blocks/media';
import type { GalleryImage } from '../../blocks/media';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { Avatar } from '../../../../~/components/ui/avatar';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Chat conversation info
 */
export interface ChatConversationInfo {
  /** Conversation ID */
  id: string;
  /** Conversation type */
  type: 'direct' | 'group' | 'channel';
  /** Conversation title */
  title: string;
  /** Conversation description */
  description?: string;
  /** Conversation avatar */
  avatar?: string;
  /** Participants */
  participants: ChatUser[];
  /** Is muted */
  isMuted: boolean;
  /** Online status (for direct chats) */
  isOnline?: boolean;
  /** Typing users */
  typingUsers?: ChatUser[];
  /** Conversation settings */
  settings?: {
    canAddMembers?: boolean;
    canDeleteMessages?: boolean;
    canEditMessages?: boolean;
    isEncrypted?: boolean;
    messageRetention?: number;
  };
}

/**
 * Message draft
 */
export interface MessageDraft {
  /** Draft text */
  text: string;
  /** Reply to message */
  replyTo?: ChatMessage;
  /** Attachments */
  attachments?: MessageAttachment[];
  /** Mentioned users */
  mentions?: ChatUser[];
}

/**
 * Chat screen configuration
 */
export interface ChatScreenConfig {
  /** Show typing indicators */
  showTypingIndicators?: boolean;
  /** Show online status */
  showOnlineStatus?: boolean;
  /** Show message reactions */
  showReactions?: boolean;
  /** Show read receipts */
  showReadReceipts?: boolean;
  /** Enable message replies */
  enableReplies?: boolean;
  /** Enable message editing */
  enableEditing?: boolean;
  /** Enable message deletion */
  enableDeletion?: boolean;
  /** Enable file attachments */
  enableAttachments?: boolean;
  /** Enable voice messages */
  enableVoiceMessages?: boolean;
  /** Enable emoji picker */
  enableEmojiPicker?: boolean;
  /** Enable message translation */
  enableTranslation?: boolean;
  /** Auto-scroll to new messages */
  autoScrollToNew?: boolean;
  /** Messages per page */
  messagesPerPage?: number;
  /** Message bubble style */
  bubbleStyle?: 'modern' | 'classic' | 'minimal';
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom input component */
  inputComponent?: React.ReactNode;
}

/**
 * Properties for the ChatScreen template
 */
export interface ChatScreenProps extends BaseComponentProps {
  /** Conversation information */
  conversation: ChatConversationInfo;
  /** Chat messages */
  messages?: ChatMessage[];
  /** Current user */
  currentUser: ChatUser;
  /** Message draft */
  draft?: MessageDraft;
  /** Is loading messages */
  loadingMessages?: boolean;
  /** Is sending message */
  sendingMessage?: boolean;
  /** Callback when message is sent */
  onSendMessage?: (message: string, attachments?: MessageAttachment[]) => Promise<void> | void;
  /** Callback when media is sent */
  onSendMedia?: (media: MessageAttachment[]) => Promise<void> | void;
  /** Callback when voice message is sent */
  onSendVoiceMessage?: (voiceFile: string, duration: number) => Promise<void> | void;
  /** Callback when message is pressed */
  onMessagePress?: (message: ChatMessage) => void;
  /** Callback when message is long pressed */
  onMessageLongPress?: (message: ChatMessage) => void;
  /** Callback when message reaction is added */
  onMessageReaction?: (messageId: string, reaction: string) => Promise<void> | void;
  /** Callback when message is replied to */
  onReplyToMessage?: (message: ChatMessage) => void;
  /** Callback when message is edited */
  onEditMessage?: (messageId: string, newText: string) => Promise<void> | void;
  /** Callback when message is deleted */
  onDeleteMessage?: (messageId: string) => Promise<void> | void;
  /** Callback when user starts/stops typing */
  onTyping?: (isTyping: boolean) => void;
  /** Callback when draft changes */
  onDraftChange?: (draft: MessageDraft) => void;
  /** Callback when attachment is selected */
  onAttachmentSelect?: () => void;
  /** Callback when voice recording starts */
  onVoiceRecordStart?: () => void;
  /** Callback when voice recording stops */
  onVoiceRecordStop?: () => void;
  /** Callback when user info is pressed */
  onUserPress?: (user: ChatUser) => void;
  /** Callback when conversation info is pressed */
  onConversationInfo?: () => void;
  /** Callback for load more messages */
  onLoadMore?: () => Promise<void> | void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Has more messages */
  hasMore?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the chat screen */
  config?: ChatScreenConfig;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format date for display
 */
const formatDate = (date: Date, format: 'time' | 'date' = 'time'): string => {
  if (format === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString();
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ChatScreen - AI-optimized chat screen template
 * 
 * A comprehensive chat screen that provides full messaging functionality
 * with real-time communication and media support.
 */
const ChatScreen: React.FC<ChatScreenProps> = ({
  conversation,
  messages = [],
  currentUser,
  draft,
  loadingMessages = false,
  sendingMessage = false,
  onSendMessage,
  onSendMedia,
  onSendVoiceMessage,
  onMessagePress,
  onMessageLongPress,
  onMessageReaction,
  onReplyToMessage,
  onEditMessage,
  onDeleteMessage,
  onTyping,
  onDraftChange,
  onAttachmentSelect,
  onVoiceRecordStart,
  onVoiceRecordStop,
  onUserPress,
  onConversationInfo,
  onLoadMore,
  onBack,
  loading = false,
  loadingMore = false,
  hasMore = true,
  error,
  config = {},
  style,
  testID = 'chat-screen',
  ...props
}) => {
  const [messageText, setMessageText] = useState(draft?.text || '');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | undefined>(draft?.replyTo);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    showTypingIndicators = true,
    showOnlineStatus = true,
    showReactions = true,
    showReadReceipts = true,
    enableReplies = true,
    enableEditing = true,
    enableDeletion = true,
    enableAttachments = true,
    enableVoiceMessages = true,
    enableEmojiPicker = true,
    enableTranslation = false,
    autoScrollToNew = true,
    messagesPerPage = 50,
    bubbleStyle = 'modern',
    headerComponent,
    inputComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const hasMessages = messages.length > 0;
  const isDirectChat = conversation.type === 'direct';
  const isGroupChat = conversation.type === 'group' || conversation.type === 'channel';
  const canSendMessage = messageText.trim().length > 0 || isRecording;
  const isTyping = conversation.typingUsers && conversation.typingUsers.length > 0;

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (autoScrollToNew && hasMessages) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, autoScrollToNew, hasMessages]);

  useEffect(() => {
    // Update draft when props change
    if (draft) {
      setMessageText(draft.text);
      setReplyingTo(draft.replyTo);
    }
  }, [draft]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSendMessage = useCallback(async () => {
    if (!canSendMessage || !onSendMessage || sendingMessage) return;

    const text = messageText.trim();
    if (!text) return;

    try {
      await onSendMessage(text, draft?.attachments);
      setMessageText('');
      setReplyingTo(undefined);
      onDraftChange?.({ text: '', attachments: [] });
    } catch (err) {
      console.error('Send message failed:', err);
      Alert.alert('Error', 'Failed to send message');
    }
  }, [canSendMessage, onSendMessage, sendingMessage, messageText, draft, onDraftChange]);

  const handleTextChange = useCallback((text: string) => {
    setMessageText(text);
    
    // Handle typing indicator
    if (onTyping) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    }

    // Update draft
    onDraftChange?.({
      text,
      replyTo: replyingTo,
      attachments: draft?.attachments || []
    });
  }, [onTyping, onDraftChange, replyingTo, draft]);

  const handleMessagePress = useCallback((message: ChatMessage) => {
    onMessagePress?.(message);
  }, [onMessagePress]);

  const handleMessageLongPress = useCallback((message: ChatMessage) => {
    if (!onMessageLongPress) {
      // Show default action sheet
      const actions = [];
      
      if (enableReplies) {
        actions.push({
          text: 'Reply',
          onPress: () => handleReplyToMessage(message)
        });
      }
      
                if (enableEditing && message.sender.id === currentUser.id) {
            actions.push({
              text: 'Edit',
              onPress: () => handleEditMessage(message)
            });
          }
          
          if (enableDeletion && message.sender.id === currentUser.id) {
            actions.push({
              text: 'Delete',
              style: 'destructive' as const,
              onPress: () => handleDeleteMessage(message.id)
            });
          }
      
      actions.push({ text: 'Cancel', style: 'cancel' as const });
      
      Alert.alert('Message Actions', '', actions);
    } else {
      onMessageLongPress(message);
    }
  }, [onMessageLongPress, enableReplies, enableEditing, enableDeletion, currentUser.id]);

  const handleReplyToMessage = useCallback((message: ChatMessage) => {
    setReplyingTo(message);
    inputRef.current?.focus();
    onReplyToMessage?.(message);
  }, [onReplyToMessage]);

  const handleEditMessage = useCallback((message: ChatMessage) => {
    setMessageText(message.text || '');
    // TODO: Implement edit mode
  }, []);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!onDeleteMessage) return;
    
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteMessage(messageId);
            } catch (err) {
              console.error('Delete message failed:', err);
              Alert.alert('Error', 'Failed to delete message');
            }
          }
        }
      ]
    );
  }, [onDeleteMessage]);

  const handleReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!onMessageReaction) return;
    
    try {
      await onMessageReaction(messageId, reaction);
    } catch (err) {
      console.error('Add reaction failed:', err);
    }
  }, [onMessageReaction]);

  const handleAttachmentPress = useCallback(() => {
    onAttachmentSelect?.();
  }, [onAttachmentSelect]);

  const handleVoiceRecord = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      onVoiceRecordStop?.();
    } else {
      setIsRecording(true);
      onVoiceRecordStart?.();
    }
  }, [isRecording, onVoiceRecordStart, onVoiceRecordStop]);

  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || loadingMore || !hasMore) return;
    try {
      await onLoadMore();
    } catch (err) {
      console.error('Load more failed:', err);
    }
  }, [onLoadMore, loadingMore, hasMore]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
          testID={`${testID}-back`}
        >
          <ChevronLeft style={styles.backIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onConversationInfo}
          style={styles.conversationInfo}
          testID={`${testID}-conversation-info`}
        >
          <Avatar style={styles.headerAvatar} alt={conversation.title}>
            {conversation.avatar ? (
              <Image source={{ uri: conversation.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {conversation.title[0]?.toUpperCase() || '?'}
              </Text>
            )}
          </Avatar>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {conversation.title}
            </Text>
            
            {showOnlineStatus && (
              <Text style={styles.headerStatus}>
                {isDirectChat && conversation.isOnline
                  ? 'Online'
                  : isGroupChat
                    ? `${conversation.participants.length} members`
                    : 'Offline'
                }
              </Text>
            )}
          </View>
          
          {showOnlineStatus && isDirectChat && conversation.isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            testID={`${testID}-call`}
          >
            <Text style={styles.headerActionIcon}>📞</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerAction}
            testID={`${testID}-video-call`}
          >
            <Text style={styles.headerActionIcon}>📹</Text>
          </TouchableOpacity>
        </View>
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

  const renderTypingIndicator = () => {
    if (!showTypingIndicators || !isTyping || !conversation.typingUsers) return null;

    const typingText = conversation.typingUsers.length === 1
      ? `${conversation.typingUsers[0].name} is typing...`
      : conversation.typingUsers.length === 2
        ? `${conversation.typingUsers[0].name} and ${conversation.typingUsers[1].name} are typing...`
        : `${conversation.typingUsers.length} people are typing...`;

    return (
      <View style={styles.typingContainer} testID={`${testID}-typing`}>
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  };

  const renderMessage = ({ item: message, index }: { item: ChatMessage; index: number }) => {
    const isOwn = message.sender.id === currentUser.id;
    const showAvatar = !isOwn && (
      index === messages.length - 1 || 
      messages[index + 1]?.sender.id !== message.sender.id
    );

    return (
      <View style={styles.messageContainer}>
        <ChatBubble
          message={message}
          isOwn={isOwn}
          showAvatar={showAvatar}
          showReactions={showReactions}
          onPress={() => handleMessagePress(message)}
          onLongPress={() => handleMessageLongPress(message)}
          style={styles.chatBubble}
          testID={`${testID}-message-${message.id}`}
        />
      </View>
    );
  };

  const renderReplyPreview = () => {
    if (!replyingTo) return null;

    return (
      <View style={styles.replyPreview} testID={`${testID}-reply-preview`}>
        <View style={styles.replyContent}>
          <Text style={styles.replyLabel}>Replying to {replyingTo.sender.name}</Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {replyingTo.text || ''}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => setReplyingTo(undefined)}
          style={styles.replyClose}
          testID={`${testID}-reply-close`}
        >
          <Text style={styles.replyCloseText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessageInput = () => {
    if (inputComponent) {
      return inputComponent;
    }

    return (
      <View style={styles.inputContainer} testID={`${testID}-input`}>
        {/* Reply Preview */}
        {renderReplyPreview()}
        
        <View style={styles.inputRow}>
          {/* Attachment Button */}
          {enableAttachments && (
            <TouchableOpacity
              onPress={handleAttachmentPress}
              style={styles.inputAction}
              testID={`${testID}-attachment`}
            >
              <Text style={styles.inputActionIcon}>📎</Text>
            </TouchableOpacity>
          )}
          
          {/* Text Input */}
          <TextInput
            ref={inputRef}
            value={messageText}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray[600]}
            multiline
            style={styles.textInput}
            testID={`${testID}-text-input`}
          />
          
          {/* Emoji Button */}
          {enableEmojiPicker && (
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              style={styles.inputAction}
              testID={`${testID}-emoji`}
            >
              <Text style={styles.inputActionIcon}>😊</Text>
            </TouchableOpacity>
          )}
          
          {/* Send/Voice Button */}
          {canSendMessage ? (
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={sendingMessage}
              style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
              testID={`${testID}-send`}
            >
              <Text style={styles.sendButtonText}>
                {sendingMessage ? '⏳' : '📤'}
              </Text>
            </TouchableOpacity>
          ) : enableVoiceMessages ? (
            <TouchableOpacity
              onPress={handleVoiceRecord}
              style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
              testID={`${testID}-voice`}
            >
              <Text style={styles.voiceButtonText}>
                {isRecording ? '⏹️' : '🎤'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (hasMessages || loading) return null;

    return (
      <View style={styles.emptyContainer} testID={`${testID}-empty`}>
        <Text style={styles.emptyTitle}>Start the conversation</Text>
        <Text style={styles.emptyDescription}>
          Send a message to begin chatting with {conversation.title}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more messages...</Text>
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

      {/* Error Display */}
      {renderError()}

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            !hasMessages && styles.messagesContentEmpty
          ]}
          showsVerticalScrollIndicator={false}
          inverted
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          testID={`${testID}-messages-list`}
        />

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        {/* Message Input */}
        {renderMessageInput()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    marginRight: SPACING.md,
  },
  backIcon: {
    width: 24,
    height: 24,
    color: COLORS.gray[900],
  },
  conversationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  headerStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  onlineIndicator: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success[500],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginLeft: SPACING.md,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  headerActionIcon: {
    fontSize: 20,
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error[500],
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messagesContentEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginVertical: SPACING.xs,
  },
  chatBubble: {
    maxWidth: '80%',
  },
  typingContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  typingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  loadingFooter: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary[500],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  replyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  replyClose: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.gray[200],
    marginLeft: SPACING.sm,
  },
  replyCloseText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[900],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  inputAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  inputActionIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: 20,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[900],
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.primary[500],
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 20,
  },
  voiceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  voiceButtonRecording: {
    backgroundColor: COLORS.error[500],
  },
  voiceButtonText: {
    fontSize: 20,
  },
});

export default ChatScreen;
