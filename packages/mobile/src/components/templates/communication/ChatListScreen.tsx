/**
 * ChatListScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive chat list screen template that displays conversations
 * with search, filtering, and management features.
 * 
 * Features:
 * - Chat conversation list with latest messages
 * - Real-time message updates and unread counts
 * - Search conversations and contacts
 * - Chat grouping (all, unread, archived, groups)
 * - Swipe actions (archive, delete, mute)
 * - New chat/group creation
 * - Online status indicators
 * - Message threading and sorting
 * - Infinite scroll with pagination
 * - Pull-to-refresh functionality
 * - Empty states and loading indicators
 * - Chat settings and management
 * 
 * @example
 * ```tsx
 * <ChatListScreen
 *   conversations={chatConversations}
 *   onConversationPress={(chat) => navigation.navigate('Chat', { chatId: chat.id })}
 *   onNewChat={() => navigation.navigate('NewChat')}
 *   onSearch={(query) => handleSearchChats(query)}
 *   onArchiveChat={(chatId) => handleArchiveChat(chatId)}
 *   loading={chatsLoading}
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
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { 
  UserCard,
  ChatBubble 
} from '../../blocks/social';
import type { 
  UserCardProps,
  ChatMessage,
  ChatUser
} from '../../blocks/social';
import { SearchForm } from '../../blocks/forms';
import type { SearchFormProps, SearchFormData } from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { Avatar } from '../../../../~/components/ui/avatar';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn, formatDate } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Chat conversation
 */
export interface ChatConversation {
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
  /** Latest message */
  lastMessage?: ChatMessage;
  /** Unread message count */
  unreadCount: number;
  /** Is muted */
  isMuted: boolean;
  /** Is archived */
  isArchived: boolean;
  /** Is pinned */
  isPinned: boolean;
  /** Last activity timestamp */
  lastActivity: Date;
  /** Online status (for direct chats) */
  isOnline?: boolean;
  /** Typing indicator */
  isTyping?: boolean;
  /** Who is typing */
  typingUsers?: ChatUser[];
  /** Conversation metadata */
  metadata?: Record<string, any>;
}

/**
 * Chat filter type
 */
export type ChatFilterType = 'all' | 'unread' | 'archived' | 'groups' | 'direct' | 'pinned';

/**
 * Chat filter
 */
export interface ChatFilter {
  /** Filter type */
  type: ChatFilterType;
  /** Filter label */
  label: string;
  /** Filter count */
  count?: number;
  /** Is active */
  active: boolean;
}

/**
 * Chat list screen configuration
 */
export interface ChatListScreenConfig {
  /** Show search */
  showSearch?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show online status */
  showOnlineStatus?: boolean;
  /** Show typing indicators */
  showTypingIndicators?: boolean;
  /** Enable swipe actions */
  enableSwipeActions?: boolean;
  /** Show new chat button */
  showNewChatButton?: boolean;
  /** Show group creation */
  enableGroupCreation?: boolean;
  /** Enable chat archiving */
  enableArchiving?: boolean;
  /** Enable chat pinning */
  enablePinning?: boolean;
  /** Enable chat muting */
  enableMuting?: boolean;
  /** Items per page */
  itemsPerPage?: number;
  /** Auto-refresh interval */
  autoRefreshInterval?: number;
  /** Available filters */
  availableFilters?: ChatFilterType[];
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the ChatListScreen template
 */
export interface ChatListScreenProps extends BaseComponentProps {
  /** Chat conversations */
  conversations?: ChatConversation[];
  /** Available filters */
  filters?: ChatFilter[];
  /** Current active filter */
  activeFilter?: ChatFilterType;
  /** Search query */
  searchQuery?: string;
  /** Callback when conversation is pressed */
  onConversationPress?: (conversation: ChatConversation) => void;
  /** Callback when new chat is pressed */
  onNewChat?: () => void;
  /** Callback when new group is pressed */
  onNewGroup?: () => void;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback when filter changes */
  onFilterChange?: (filter: ChatFilterType) => void;
  /** Callback when chat is archived */
  onArchiveChat?: (conversationId: string) => Promise<void> | void;
  /** Callback when chat is deleted */
  onDeleteChat?: (conversationId: string) => Promise<void> | void;
  /** Callback when chat is pinned */
  onPinChat?: (conversationId: string) => Promise<void> | void;
  /** Callback when chat is muted */
  onMuteChat?: (conversationId: string, duration?: number) => Promise<void> | void;
  /** Callback when settings is pressed */
  onNavigateToSettings?: () => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Callback for load more conversations */
  onLoadMore?: () => Promise<void> | void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Has more conversations */
  hasMore?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the chat list screen */
  config?: ChatListScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ChatListScreen - AI-optimized chat list screen template
 * 
 * A comprehensive chat list screen that displays conversations
 * with search, filtering, and management features.
 */
const ChatListScreen: React.FC<ChatListScreenProps> = ({
  conversations = [],
  filters = [],
  activeFilter = 'all',
  searchQuery = '',
  onConversationPress,
  onNewChat,
  onNewGroup,
  onSearch,
  onFilterChange,
  onArchiveChat,
  onDeleteChat,
  onPinChat,
  onMuteChat,
  onNavigateToSettings,
  onRefresh,
  onLoadMore,
  onBack,
  loading = false,
  loadingMore = false,
  refreshing = false,
  hasMore = true,
  error,
  config = {},
  style,
  testID = 'chat-list-screen',
  ...props
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const {
    showSearch = true,
    showFilters = true,
    showOnlineStatus = true,
    showTypingIndicators = true,
    enableSwipeActions = true,
    showNewChatButton = true,
    enableGroupCreation = true,
    enableArchiving = true,
    enablePinning = true,
    enableMuting = true,
    itemsPerPage = 20,
    autoRefreshInterval = 30000,
    availableFilters = ['all', 'unread', 'groups', 'direct', 'archived'],
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Apply search filter
    if (localSearchQuery.trim()) {
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        conv.lastMessage?.content.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        conv.participants.some(p => 
          p.name.toLowerCase().includes(localSearchQuery.toLowerCase())
        )
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'archived':
        filtered = filtered.filter(conv => conv.isArchived);
        break;
      case 'groups':
        filtered = filtered.filter(conv => conv.type === 'group' || conv.type === 'channel');
        break;
      case 'direct':
        filtered = filtered.filter(conv => conv.type === 'direct');
        break;
      case 'pinned':
        filtered = filtered.filter(conv => conv.isPinned);
        break;
      case 'all':
      default:
        filtered = filtered.filter(conv => !conv.isArchived); // Exclude archived from 'all'
        break;
    }

    // Sort conversations
    return filtered.sort((a, b) => {
      // Pinned chats first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by last activity
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    });
  }, [conversations, localSearchQuery, activeFilter]);

  const unreadCount = useMemo(() => {
    return conversations.reduce((count, conv) => count + conv.unreadCount, 0);
  }, [conversations]);

  const hasConversations = filteredConversations.length > 0;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSearch = useCallback((searchData: SearchFormData) => {
    setLocalSearchQuery(searchData.query || '');
    onSearch?.(searchData);
  }, [onSearch]);

  const handleFilterPress = useCallback((filterType: ChatFilterType) => {
    onFilterChange?.(filterType);
  }, [onFilterChange]);

  const handleConversationPress = useCallback((conversation: ChatConversation) => {
    onConversationPress?.(conversation);
  }, [onConversationPress]);

  const handleArchiveChat = useCallback(async (conversationId: string) => {
    if (!onArchiveChat) return;
    
    try {
      await onArchiveChat(conversationId);
    } catch (err) {
      console.error('Archive chat failed:', err);
      Alert.alert('Error', 'Failed to archive chat');
    }
  }, [onArchiveChat]);

  const handleDeleteChat = useCallback(async (conversationId: string) => {
    if (!onDeleteChat) return;
    
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteChat(conversationId);
            } catch (err) {
              console.error('Delete chat failed:', err);
              Alert.alert('Error', 'Failed to delete chat');
            }
          }
        }
      ]
    );
  }, [onDeleteChat]);

  const handlePinChat = useCallback(async (conversationId: string) => {
    if (!onPinChat) return;
    
    try {
      await onPinChat(conversationId);
    } catch (err) {
      console.error('Pin chat failed:', err);
      Alert.alert('Error', 'Failed to pin chat');
    }
  }, [onPinChat]);

  const handleMuteChat = useCallback(async (conversationId: string) => {
    if (!onMuteChat) return;
    
    try {
      await onMuteChat(conversationId);
    } catch (err) {
      console.error('Mute chat failed:', err);
      Alert.alert('Error', 'Failed to mute chat');
    }
  }, [onMuteChat]);

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

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <View style={styles.headerTop}>
          {onBack ? (
            <TouchableOpacity 
              onPress={onBack}
              style={styles.backButton}
              testID={`${testID}-back`}
            >
              <ChevronLeft style={styles.backIcon} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          
          <Text style={styles.headerTitle}>Messages</Text>
          
          <View style={styles.headerActions}>
            {onNavigateToSettings && (
              <TouchableOpacity 
                onPress={onNavigateToSettings}
                style={styles.headerAction}
                testID={`${testID}-settings`}
              >
                <Text style={styles.headerActionIcon}>⚙️</Text>
              </TouchableOpacity>
            )}
            
            {showNewChatButton && (
              <TouchableOpacity 
                onPress={onNewChat}
                style={styles.headerAction}
                testID={`${testID}-new-chat`}
              >
                <Text style={styles.headerActionIcon}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Unread Count */}
        {unreadCount > 0 && (
          <View style={styles.unreadContainer}>
            <Badge variant="destructive" style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </Text>
            </Badge>
          </View>
        )}

        {/* Search */}
        {showSearch && (
          <SearchForm
            onSearch={handleSearch}
            placeholder="Search conversations..."
            defaultValue={localSearchQuery}
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
        )}

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {availableFilters.map((filterType) => {
              const filter = filters.find(f => f.type === filterType) || {
                type: filterType,
                label: filterType.charAt(0).toUpperCase() + filterType.slice(1),
                active: activeFilter === filterType
              };

              return (
                <TouchableOpacity
                  key={filterType}
                  onPress={() => handleFilterPress(filterType)}
                  style={[
                    styles.filterButton,
                    filter.active && styles.filterButtonActive
                  ]}
                  testID={`${testID}-filter-${filterType}`}
                >
                  <Text style={[
                    styles.filterText,
                    filter.active && styles.filterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                  {filter.count !== undefined && filter.count > 0 && (
                    <Badge variant="secondary" style={styles.filterBadge}>
                      <Text style={styles.badgeText}>{filter.count}</Text>
                    </Badge>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* New Chat Options */}
        {(showNewChatButton || enableGroupCreation) && (
          <View style={styles.newChatOptions}>
            {showNewChatButton && (
              <Button
                onPress={onNewChat}
                variant="outline"
                size="sm"
                style={styles.newChatButton}
                testID={`${testID}-new-direct-chat`}
              >
                <Text style={styles.newChatButtonText}>New Chat</Text>
              </Button>
            )}
            
            {enableGroupCreation && (
              <Button
                onPress={onNewGroup}
                variant="outline"
                size="sm"
                style={styles.newChatButton}
                testID={`${testID}-new-group`}
              >
                <Text style={styles.newChatButtonText}>New Group</Text>
              </Button>
            )}
          </View>
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

  const renderEmptyState = () => {
    if (hasConversations || loading) return null;

    const isSearching = localSearchQuery.trim().length > 0;
    const isFiltered = activeFilter !== 'all';

    return (
      <View style={styles.emptyContainer} testID={`${testID}-empty`}>
        <Text style={styles.emptyTitle}>
          {isSearching 
            ? 'No conversations found'
            : isFiltered 
              ? `No ${activeFilter} conversations`
              : 'No conversations yet'
          }
        </Text>
        <Text style={styles.emptyDescription}>
          {isSearching 
            ? 'Try adjusting your search terms'
            : isFiltered 
              ? `You don't have any ${activeFilter} conversations`
              : 'Start a new conversation to get chatting!'
          }
        </Text>
        
        {!isSearching && !isFiltered && showNewChatButton && (
          <Button
            onPress={onNewChat}
            style={styles.emptyActionButton}
            testID={`${testID}-empty-new-chat`}
          >
            <Text style={styles.emptyActionText}>Start New Chat</Text>
          </Button>
        )}
      </View>
    );
  };

  const renderConversation = ({ item: conversation }: { item: ChatConversation }) => {
    const lastMessage = conversation.lastMessage;
    const isOnline = conversation.isOnline && conversation.type === 'direct';
    const isTyping = showTypingIndicators && conversation.isTyping;

    return (
      <TouchableOpacity
        onPress={() => handleConversationPress(conversation)}
        style={styles.conversationContainer}
        testID={`${testID}-conversation-${conversation.id}`}
      >
        <Card style={styles.conversationCard}>
          <View style={styles.conversationContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Avatar style={styles.conversationAvatar}>
                {conversation.avatar ? (
                  <Image source={{ uri: conversation.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {conversation.title[0]?.toUpperCase() || '?'}
                  </Text>
                )}
              </Avatar>
              
              {/* Online Indicator */}
              {showOnlineStatus && isOnline && (
                <View style={styles.onlineIndicator} />
              )}
              
              {/* Pinned Indicator */}
              {conversation.isPinned && (
                <View style={styles.pinnedIndicator}>
                  <Text style={styles.pinnedIcon}>📌</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationTitle} numberOfLines={1}>
                  {conversation.title}
                </Text>
                
                <View style={styles.conversationMeta}>
                  {conversation.isMuted && (
                    <Text style={styles.mutedIcon}>🔇</Text>
                  )}
                  
                  {lastMessage && (
                    <Text style={styles.conversationTime}>
                      {formatDate(lastMessage.timestamp, 'time')}
                    </Text>
                  )}
                </View>
              </View>

              {/* Last Message or Typing */}
              <View style={styles.lastMessageContainer}>
                {isTyping ? (
                  <Text style={styles.typingIndicator}>
                    {conversation.typingUsers && conversation.typingUsers.length > 0
                      ? `${conversation.typingUsers[0].name} is typing...`
                      : 'Someone is typing...'
                    }
                  </Text>
                ) : lastMessage ? (
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {conversation.type === 'group' && lastMessage.sender.id !== 'current-user' && (
                      <Text style={styles.senderName}>
                        {lastMessage.sender.name}: 
                      </Text>
                    )}
                    {lastMessage.content}
                  </Text>
                ) : (
                  <Text style={styles.noMessages}>No messages yet</Text>
                )}

                {/* Unread Count */}
                {conversation.unreadCount > 0 && (
                  <Badge variant="destructive" style={styles.unreadCountBadge}>
                    <Text style={styles.unreadCountText}>
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Text>
                  </Badge>
                )}
              </View>
            </View>
          </View>

          {/* Swipe Actions (if enabled) */}
          {enableSwipeActions && (
            <View style={styles.swipeActions}>
              {enableArchiving && (
                <TouchableOpacity
                  onPress={() => handleArchiveChat(conversation.id)}
                  style={[styles.swipeAction, styles.archiveAction]}
                  testID={`${testID}-archive-${conversation.id}`}
                >
                  <Text style={styles.swipeActionText}>📁</Text>
                </TouchableOpacity>
              )}
              
              {enablePinning && (
                <TouchableOpacity
                  onPress={() => handlePinChat(conversation.id)}
                  style={[styles.swipeAction, styles.pinAction]}
                  testID={`${testID}-pin-${conversation.id}`}
                >
                  <Text style={styles.swipeActionText}>
                    {conversation.isPinned ? '📌' : '📍'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {enableMuting && (
                <TouchableOpacity
                  onPress={() => handleMuteChat(conversation.id)}
                  style={[styles.swipeAction, styles.muteAction]}
                  testID={`${testID}-mute-${conversation.id}`}
                >
                  <Text style={styles.swipeActionText}>
                    {conversation.isMuted ? '🔊' : '🔇'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={() => handleDeleteChat(conversation.id)}
                style={[styles.swipeAction, styles.deleteAction]}
                testID={`${testID}-delete-${conversation.id}`}
              >
                <Text style={styles.swipeActionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more conversations...</Text>
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

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        contentContainerStyle={[
          styles.conversationsContent,
          !hasConversations && styles.conversationsContentEmpty
        ]}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  backIcon: {
    width: 24,
    height: 24,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  headerActionIcon: {
    fontSize: 20,
  },
  unreadContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  unreadBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  unreadText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  searchForm: {
    marginBottom: SPACING.md,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  filterBadge: {
    marginLeft: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  newChatOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  newChatButton: {
    flex: 1,
  },
  newChatButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  conversationsContentEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  emptyActionButton: {
    paddingHorizontal: SPACING.xl,
  },
  emptyActionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  conversationContainer: {
    marginBottom: SPACING.md,
  },
  conversationCard: {
    padding: SPACING.lg,
    position: 'relative',
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  conversationAvatar: {
    width: 50,
    height: 50,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryForeground,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  pinnedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedIcon: {
    fontSize: 10,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conversationTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  mutedIcon: {
    fontSize: 14,
  },
  conversationTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typingIndicator: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  lastMessage: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  senderName: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  noMessages: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  unreadCountBadge: {
    marginLeft: SPACING.sm,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCountText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.destructiveForeground,
  },
  swipeActions: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  swipeAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  archiveAction: {
    backgroundColor: COLORS.warning,
  },
  pinAction: {
    backgroundColor: COLORS.primary,
  },
  muteAction: {
    backgroundColor: COLORS.secondary,
  },
  deleteAction: {
    backgroundColor: COLORS.destructive,
  },
  swipeActionText: {
    fontSize: 16,
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

export default ChatListScreen;
export type { 
  ChatListScreenProps, 
  ChatListScreenConfig, 
  ChatConversation, 
  ChatFilter, 
  ChatFilterType 
};
