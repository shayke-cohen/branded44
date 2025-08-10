/**
 * NotificationList Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive notification listing component for displaying system notifications,
 * alerts, and updates with categorization and action management.
 * 
 * Features:
 * - Notification categories with icons and colors
 * - Read/unread states with visual indicators
 * - Priority levels and urgency indicators
 * - Action buttons for each notification
 * - Bulk actions (mark all read, clear all)
 * - Time-based grouping and sorting
 * - Real-time updates and badges
 * - Swipe actions for quick management
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <NotificationList
 *   notifications={notificationList}
 *   onNotificationPress={(notification) => handleNotification(notification)}
 *   onMarkAsRead={(id) => markAsRead(id)}
 *   onMarkAllRead={() => markAllAsRead()}
 *   showCategories={true}
 *   groupByDate={true}
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
  SectionList,
  Alert
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatTime, formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Notification types/categories
 */
export type NotificationType = 
  | 'message' 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'mention' 
  | 'system' 
  | 'update' 
  | 'security' 
  | 'payment' 
  | 'reminder' 
  | 'achievement' 
  | 'promotion';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification action configuration
 */
export interface NotificationAction {
  /** Action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Action type */
  type: 'primary' | 'secondary' | 'destructive';
  /** Action handler */
  onPress: (notification: Notification) => void;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * Notification data structure
 */
export interface Notification {
  /** Unique notification identifier */
  id: string;
  /** Notification title */
  title: string;
  /** Notification message/body */
  message: string;
  /** Notification type/category */
  type: NotificationType;
  /** Priority level */
  priority: NotificationPriority;
  /** Whether notification is read */
  isRead: boolean;
  /** Creation timestamp */
  timestamp: Date;
  /** Sender/source information */
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  /** Associated image */
  image?: string;
  /** Action buttons */
  actions?: NotificationAction[];
  /** Deep link URL */
  deepLink?: string;
  /** Custom data payload */
  data?: Record<string, any>;
  /** Whether notification can be dismissed */
  dismissible?: boolean;
  /** Expiration date */
  expiresAt?: Date;
}

/**
 * Notification group for sectioned display
 */
export interface NotificationGroup {
  /** Group title */
  title: string;
  /** Group notifications */
  data: Notification[];
}

/**
 * Props for the NotificationList component
 */
export interface NotificationListProps extends BaseComponentProps {
  /** Array of notifications to display */
  notifications: Notification[];
  /** Callback when a notification is pressed */
  onNotificationPress?: (notification: Notification) => void;
  /** Callback when notification is marked as read */
  onMarkAsRead?: (notificationId: string) => void;
  /** Callback when notification is dismissed */
  onDismiss?: (notificationId: string) => void;
  /** Callback for notification actions */
  onAction?: (action: NotificationAction, notification: Notification) => void;
  /** Callback to mark all notifications as read */
  onMarkAllRead?: () => void;
  /** Callback to clear all notifications */
  onClearAll?: () => void;
  /** Whether to show notification categories */
  showCategories?: boolean;
  /** Whether to show sender avatars */
  showAvatars?: boolean;
  /** Whether to show timestamps */
  showTimestamps?: boolean;
  /** Whether to group notifications by date */
  groupByDate?: boolean;
  /** Whether to show unread badge count */
  showUnreadCount?: boolean;
  /** Whether to auto-mark as read on press */
  autoMarkRead?: boolean;
  /** Whether to show bulk action buttons */
  showBulkActions?: boolean;
  /** Maximum number of actions to show inline */
  maxInlineActions?: number;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of notifications to show initially */
  initialNumToRender?: number;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Load more notifications handler */
  onLoadMore?: () => void;
  /** Whether there are more notifications to load */
  hasMore?: boolean;
  /** Notification filtering function */
  filterNotifications?: (notification: Notification) => boolean;
  /** Notification sorting function */
  sortNotifications?: (a: Notification, b: Notification) => number;
  /** Layout variant */
  variant?: 'compact' | 'detailed' | 'minimal';
  /** Custom notification renderer */
  renderNotification?: (notification: Notification, index: number) => React.ReactElement;
  /** Custom group header renderer */
  renderGroupHeader?: (title: string, notifications: Notification[]) => React.ReactElement;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * NotificationList component for displaying system notifications
 */
export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationPress,
  onMarkAsRead,
  onDismiss,
  onAction,
  onMarkAllRead,
  onClearAll,
  showCategories = true,
  showAvatars = true,
  showTimestamps = true,
  groupByDate = false,
  showUnreadCount = true,
  autoMarkRead = true,
  showBulkActions = true,
  maxInlineActions = 2,
  loading = false,
  error,
  emptyMessage = 'No notifications',
  initialNumToRender = 10,
  onRefresh,
  onLoadMore,
  hasMore = false,
  filterNotifications,
  sortNotifications,
  variant = 'detailed',
  renderNotification,
  renderGroupHeader,
  style,
  testID = 'notification-list',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const processedNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply custom filter
    if (filterNotifications) {
      filtered = filtered.filter(filterNotifications);
    }

    // Filter out expired notifications
    const now = new Date();
    filtered = filtered.filter(notification => 
      !notification.expiresAt || notification.expiresAt > now
    );

    // Apply custom sort or default sort by timestamp (newest first)
    if (sortNotifications) {
      filtered = filtered.sort(sortNotifications);
    } else {
      filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    return filtered;
  }, [notifications, filterNotifications, sortNotifications]);

  const groupedNotifications = useMemo(() => {
    if (!groupByDate) return null;

    const groups: { [key: string]: Notification[] } = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    processedNotifications.forEach(notification => {
      const notificationDate = new Date(
        notification.timestamp.getFullYear(),
        notification.timestamp.getMonth(),
        notification.timestamp.getDate()
      );
      
      let groupKey: string;
      if (notificationDate.getTime() === today.getTime()) {
        groupKey = 'Today';
      } else if (notificationDate.getTime() === yesterday.getTime()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = formatDate(notification.timestamp, 'MMM DD, YYYY');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    // Sort groups by date (newest first)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return sortedGroups.map(([title, data]) => ({ title, data }));
  }, [processedNotifications, groupByDate]);

  const unreadCount = useMemo(() => {
    return processedNotifications.filter(n => !n.isRead).length;
  }, [processedNotifications]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (autoMarkRead && !notification.isRead) {
      onMarkAsRead?.(notification.id);
    }
    onNotificationPress?.(notification);
  }, [autoMarkRead, onMarkAsRead, onNotificationPress]);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    onMarkAsRead?.(notificationId);
  }, [onMarkAsRead]);

  const handleDismiss = useCallback((notificationId: string) => {
    onDismiss?.(notificationId);
  }, [onDismiss]);

  const handleAction = useCallback((action: NotificationAction, notification: Notification) => {
    action.onPress(notification);
    onAction?.(action, notification);
  }, [onAction]);

  const handleMarkAllRead = useCallback(() => {
    Alert.alert(
      'Mark All Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All Read', onPress: onMarkAllRead },
      ]
    );
  }, [onMarkAllRead]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: onClearAll },
      ]
    );
  }, [onClearAll]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getNotificationIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      message: '💬',
      like: '❤️',
      comment: '💭',
      follow: '👥',
      mention: '@',
      system: '⚙️',
      update: '🔄',
      security: '🔒',
      payment: '💳',
      reminder: '⏰',
      achievement: '🏆',
      promotion: '🎉',
    };
    return icons[type];
  };

  const getPriorityColor = (priority: NotificationPriority): string => {
    const colors: Record<NotificationPriority, string> = {
      low: COLORS.neutral[400],
      normal: COLORS.info[500],
      high: COLORS.warning[500],
      urgent: COLORS.error[500],
    };
    return colors[priority];
  };

  const getRelativeTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return formatDate(timestamp, 'MMM DD');
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderBulkActions = useCallback(() => {
    if (!showBulkActions || processedNotifications.length === 0) return null;

    return (
      <View style={styles.bulkActionsContainer}>
        {showUnreadCount && unreadCount > 0 && (
          <Badge variant="secondary" style={styles.unreadBadge}>
            {unreadCount} unread
          </Badge>
        )}
        <View style={styles.bulkActionButtons}>
          {unreadCount > 0 && onMarkAllRead && (
            <Button
              variant="ghost"
              
              onPress={handleMarkAllRead}
            >
              Mark All Read
            </Button>
          )}
          {onClearAll && (
            <Button
              variant="ghost"
              
              onPress={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </View>
      </View>
    );
  }, [
    showBulkActions,
    showUnreadCount,
    processedNotifications.length,
    unreadCount,
    onMarkAllRead,
    onClearAll,
    handleMarkAllRead,
    handleClearAll
  ]);

  const renderNotificationItem = useCallback(({ item: notification, index }: { item: Notification; index: number }) => {
    if (renderNotification) {
      return renderNotification(notification, index);
    }

    const inlineActions = notification.actions?.slice(0, maxInlineActions) || [];
    const hasMoreActions = notification.actions && notification.actions.length > maxInlineActions;

    return (
      <Card 
        style={[
          styles.notificationCard,
          !notification.isRead && styles.unreadCard,
          variant === 'compact' && styles.compactCard,
          variant === 'minimal' && styles.minimalCard
        ]}
        testID={`${testID}-item-${index}`}
      >
        <TouchableOpacity
          onPress={() => handleNotificationPress(notification)}
          style={styles.notificationContent}
          accessibilityRole="button"
          accessibilityLabel={`Notification: ${notification.title}`}
        >
          {/* Header */}
          <View style={styles.notificationHeader}>
            {/* Left side - Icon/Avatar */}
            <View style={styles.notificationLeft}>
              {showAvatars && notification.sender?.avatar ? (
                <Avatar
                  source={{ uri: notification.sender.avatar }}
                  fallback={notification.sender.name.charAt(0)}
                  
                  style={styles.senderAvatar}
                />
              ) : (
                <View style={[
                  styles.typeIcon,
                  { backgroundColor: getPriorityColor(notification.priority) }
                ]}>
                  <Text style={styles.typeIconText}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.notificationBody}>
              <View style={styles.notificationTitleRow}>
                <Text 
                  style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadTitle
                  ]} 
                  numberOfLines={variant === 'compact' ? 1 : 2}
                >
                  {notification.title}
                </Text>
                {showTimestamps && (
                  <Text style={styles.notificationTime}>
                    {getRelativeTime(notification.timestamp)}
                  </Text>
                )}
              </View>

              {variant !== 'minimal' && (
                <Text 
                  style={styles.notificationMessage} 
                  numberOfLines={variant === 'compact' ? 1 : 3}
                >
                  {notification.message}
                </Text>
              )}

              {/* Metadata */}
              {(showCategories || notification.priority !== 'normal') && (
                <View style={styles.notificationMeta}>
                  {showCategories && (
                    <Badge 
                      variant="secondary" 
                      
                      style={styles.categoryBadge}
                    >
                      {notification.type}
                    </Badge>
                  )}
                  {notification.priority !== 'normal' && (
                    <Badge 
                      variant="outline"
                      
                      style={[
                        styles.priorityBadge,
                        { borderColor: getPriorityColor(notification.priority) }
                      ]}
                    >
                      {notification.priority}
                    </Badge>
                  )}
                </View>
              )}
            </View>

            {/* Right side - Status indicator */}
            <View style={styles.notificationRight}>
              {!notification.isRead && (
                <View style={styles.unreadIndicator} />
              )}
              {notification.dismissible && (
                <TouchableOpacity
                  onPress={() => handleDismiss(notification.id)}
                  style={styles.dismissButton}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss notification"
                >
                  <Text style={styles.dismissIcon}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Actions */}
          {inlineActions.length > 0 && variant !== 'minimal' && (
            <View style={styles.actionsContainer}>
              {inlineActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.type === 'primary' ? 'default' : 
                           action.type === 'destructive' ? 'destructive' : 'outline'}
                  
                  onPress={() => handleAction(action, notification)}
                  disabled={action.disabled}
                  style={styles.actionButton}
                >
                  {action.label}
                </Button>
              ))}
              {hasMoreActions && (
                <Button
                  variant="ghost"
                  
                  onPress={() => {
                    // Show more actions - typically opens a modal or sheet
                    console.log('Show more actions for notification:', notification.id);
                  }}
                  style={styles.actionButton}
                >
                  More
                </Button>
              )}
            </View>
          )}

          {/* Quick actions */}
          {!notification.isRead && onMarkAsRead && variant !== 'minimal' && (
            <TouchableOpacity
              onPress={() => handleMarkAsRead(notification.id)}
              style={styles.quickAction}
            >
              <Text style={styles.quickActionText}>Mark as read</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Card>
    );
  }, [
    variant,
    maxInlineActions,
    showAvatars,
    showCategories,
    showTimestamps,
    renderNotification,
    handleNotificationPress,
    handleAction,
    handleMarkAsRead,
    handleDismiss,
    onMarkAsRead,
    testID
  ]);

  const renderGroupHeaderDefault = useCallback(({ section: { title, data } }: any) => {
    if (renderGroupHeader) {
      return renderGroupHeader(title, data);
    }

    const unreadInGroup = data.filter((n: Notification) => !n.isRead).length;

    return (
      <View style={styles.groupHeader}>
        <Text style={styles.groupHeaderText}>{title}</Text>
        <View style={styles.groupHeaderMeta}>
          {unreadInGroup > 0 && (
            <Badge variant="secondary"  style={styles.groupUnreadBadge}>
              {unreadInGroup} new
            </Badge>
          )}
          <Badge variant="outline" >
            {data.length}
          </Badge>
        </View>
      </View>
    );
  }, [renderGroupHeader]);

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

  if (!loading && processedNotifications.length === 0) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        {renderBulkActions()}
        <View style={[styles.centerContent, styles.emptyContainer]}>
          <Text style={styles.emptyText}>🔔 {emptyMessage}</Text>
        </View>
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
    <View style={[styles.container, style]} testID={testID}>
      {renderBulkActions()}
      
      {groupByDate && groupedNotifications ? (
        <SectionList
          sections={groupedNotifications}
          renderItem={renderNotificationItem}
          renderSectionHeader={renderGroupHeaderDefault}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          refreshControl={refreshControl}
          initialNumToRender={initialNumToRender}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          {...props}
        />
      ) : (
        <FlatList
          data={processedNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          refreshControl={refreshControl}
          initialNumToRender={initialNumToRender}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          {...props}
        />
      )}
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
  emptyContainer: {
    flex: 1,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  unreadBadge: {
    backgroundColor: COLORS.info[100],
    color: COLORS.info[700],
  },
  bulkActionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    padding: SPACING.md,
  },
  notificationCard: {
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    borderLeftColor: COLORS.info[500],
    backgroundColor: COLORS.info[50],
  },
  compactCard: {
    marginBottom: SPACING.xs,
  },
  minimalCard: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  notificationContent: {
    padding: SPACING.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    marginRight: SPACING.sm,
  },
  senderAvatar: {
    marginTop: SPACING.xs,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  typeIconText: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  notificationBody: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadTitle: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  notificationMeta: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.neutral[100],
    color: COLORS.neutral[700],
  },
  priorityBadge: {
    backgroundColor: 'transparent',
  },
  notificationRight: {
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.info[500],
    marginBottom: SPACING.sm,
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  dismissIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.neutral[400],
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  quickAction: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  groupHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  groupHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  groupUnreadBadge: {
    backgroundColor: COLORS.warning[100],
    color: COLORS.warning[700],
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

export default NotificationList;
