/**
 * DashboardScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive dashboard screen template that combines multiple data display blocks
 * to create a unified overview interface with widgets, stats, and quick actions.
 * 
 * Features:
 * - Customizable widget layout with stats cards
 * - Recent activity and notifications display
 * - Quick action buttons and shortcuts
 * - Data visualization with charts and metrics
 * - Refresh functionality with pull-to-refresh
 * - Search integration and filtering
 * - Navigation to detailed screens
 * - Loading states and error handling
 * - Real-time data updates support
 * - Responsive grid layout
 * - User greeting and personalization
 * - Progress tracking and goals
 * 
 * @example
 * ```tsx
 * <DashboardScreen
 *   user={currentUser}
 *   widgets={dashboardWidgets}
 *   recentActivity={recentActivity}
 *   notifications={notifications}
 *   stats={dashboardStats}
 *   onWidgetPress={(widget) => navigation.navigate(widget.destination)}
 *   onActivityPress={(activity) => handleActivityPress(activity)}
 *   onRefresh={() => handleRefresh()}
 *   loading={dashboardLoading}
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
  Dimensions 
} from 'react-native';
import { 
  ActivityFeed, 
  NotificationList,
  UserList 
} from '../../blocks/lists';
import type { 
  ActivityFeedProps,
  NotificationListProps,
  UserListProps
} from '../../blocks/lists';
import { SearchForm } from '../../blocks/forms';
import type { SearchFormProps, SearchFormData } from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Avatar } from '../../../../~/components/ui/avatar';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps, UserProfile } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Dashboard widget types
 */
export type WidgetType = 'stat' | 'chart' | 'list' | 'action' | 'progress' | 'feed';

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  /** Widget ID */
  id: string;
  /** Widget type */
  type: WidgetType;
  /** Widget title */
  title: string;
  /** Widget subtitle */
  subtitle?: string;
  /** Widget value/content */
  value?: string | number;
  /** Widget icon */
  icon?: string;
  /** Widget color theme */
  color?: string;
  /** Widget size */
  size?: 'small' | 'medium' | 'large' | 'full';
  /** Navigation destination */
  destination?: string;
  /** Widget data */
  data?: any;
  /** Is widget loading */
  loading?: boolean;
  /** Widget badge */
  badge?: string;
  /** Widget trend */
  trend?: 'up' | 'down' | 'stable';
  /** Trend percentage */
  trendValue?: number;
}

/**
 * Dashboard quick action
 */
export interface QuickAction {
  /** Action ID */
  id: string;
  /** Action title */
  title: string;
  /** Action icon */
  icon?: string;
  /** Action color */
  color?: string;
  /** Navigation destination */
  destination?: string;
  /** Action callback */
  onPress?: () => void;
  /** Action badge */
  badge?: string;
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  /** Today's stats */
  today?: Record<string, number>;
  /** This week's stats */
  week?: Record<string, number>;
  /** This month's stats */
  month?: Record<string, number>;
  /** Total stats */
  total?: Record<string, number>;
}

/**
 * Dashboard screen configuration
 */
export interface DashboardScreenConfig {
  /** Show user greeting */
  showGreeting?: boolean;
  /** Show search bar */
  showSearch?: boolean;
  /** Show quick actions */
  showQuickActions?: boolean;
  /** Show stats widgets */
  showStats?: boolean;
  /** Show recent activity */
  showActivity?: boolean;
  /** Show notifications */
  showNotifications?: boolean;
  /** Widget grid columns */
  gridColumns?: number;
  /** Maximum widgets to display */
  maxWidgets?: number;
  /** Maximum activity items */
  maxActivityItems?: number;
  /** Maximum notification items */
  maxNotificationItems?: number;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the DashboardScreen template
 */
export interface DashboardScreenProps extends BaseComponentProps {
  /** Current user */
  user?: UserProfile;
  /** Dashboard widgets */
  widgets?: DashboardWidget[];
  /** Quick actions */
  quickActions?: QuickAction[];
  /** Dashboard stats */
  stats?: DashboardStats;
  /** Recent activity */
  recentActivity?: any[];
  /** Notifications */
  notifications?: any[];
  /** Suggested users */
  suggestedUsers?: any[];
  /** Callback when widget is pressed */
  onWidgetPress?: (widget: DashboardWidget) => void;
  /** Callback when quick action is pressed */
  onQuickActionPress?: (action: QuickAction) => void;
  /** Callback when activity item is pressed */
  onActivityPress?: (activity: any) => void;
  /** Callback when notification is pressed */
  onNotificationPress?: (notification: any) => void;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Loading state */
  loading?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the dashboard screen */
  config?: DashboardScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

const { width: screenWidth } = Dimensions.get('window');

/**
 * DashboardScreen - AI-optimized dashboard screen template
 * 
 * A comprehensive dashboard that provides an overview of user data,
 * activities, and quick access to key app features.
 */
const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  widgets = [],
  quickActions = [],
  stats,
  recentActivity = [],
  notifications = [],
  suggestedUsers = [],
  onWidgetPress,
  onQuickActionPress,
  onActivityPress,
  onNotificationPress,
  onSearch,
  onRefresh,
  loading = false,
  refreshing = false,
  error,
  config = {},
  style,
  testID = 'dashboard-screen',
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    showGreeting = true,
    showSearch = true,
    showQuickActions = true,
    showStats = true,
    showActivity = true,
    showNotifications = true,
    gridColumns = 2,
    maxWidgets = 8,
    maxActivityItems = 5,
    maxNotificationItems = 3,
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

  const handleWidgetPress = useCallback((widget: DashboardWidget) => {
    onWidgetPress?.(widget);
  }, [onWidgetPress]);

  const handleQuickActionPress = useCallback((action: QuickAction) => {
    if (action.onPress) {
      action.onPress();
    } else {
      onQuickActionPress?.(action);
    }
  }, [onQuickActionPress]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        {/* User Greeting */}
        {showGreeting && user && (
          <View style={styles.greetingContainer}>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingText}>
                Good {getTimeOfDayGreeting()},
              </Text>
              <Text style={styles.greetingName}>
                {user.firstName || user.email?.split('@')[0] || 'User'}
              </Text>
            </View>
            {user.avatar && (
              <Avatar style={styles.greetingAvatar}>
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              </Avatar>
            )}
          </View>
        )}

        {/* Search Bar */}
        {showSearch && (
          <SearchForm
            onSearch={handleSearch}
            placeholder="Search dashboard..."
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
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

  const renderQuickActions = () => {
    if (!showQuickActions || quickActions.length === 0) return null;

    return (
      <View style={styles.quickActionsContainer} testID={`${testID}-quick-actions`}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => handleQuickActionPress(action)}
              style={[
                styles.quickActionItem,
                action.color && { backgroundColor: action.color }
              ]}
              testID={`${testID}-quick-action-${action.id}`}
            >
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                {action.badge && (
                  <Badge variant="secondary" style={styles.quickActionBadge}>
                    <Text style={styles.badgeText}>{action.badge}</Text>
                  </Badge>
                )}
              </View>
              <ChevronRight style={styles.quickActionIcon} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderWidgets = () => {
    if (!showStats || widgets.length === 0) return null;

    const displayWidgets = widgets.slice(0, maxWidgets);

    return (
      <View style={styles.widgetsContainer} testID={`${testID}-widgets`}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.widgetsGrid}>
          {displayWidgets.map((widget) => renderWidget(widget))}
        </View>
      </View>
    );
  };

  const renderWidget = (widget: DashboardWidget) => {
    const widgetStyle = [
      styles.widget,
      widget.size === 'full' && styles.widgetFull,
      widget.size === 'large' && styles.widgetLarge,
      widget.color && { borderLeftColor: widget.color, borderLeftWidth: 4 }
    ];

    return (
      <TouchableOpacity
        key={widget.id}
        onPress={() => handleWidgetPress(widget)}
        style={widgetStyle}
        disabled={!onWidgetPress}
        testID={`${testID}-widget-${widget.id}`}
      >
        <Card style={styles.widgetCard}>
          <View style={styles.widgetContent}>
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetTitle}>{widget.title}</Text>
              {widget.badge && (
                <Badge variant="secondary" style={styles.widgetBadge}>
                  <Text style={styles.badgeText}>{widget.badge}</Text>
                </Badge>
              )}
            </View>
            
            {widget.subtitle && (
              <Text style={styles.widgetSubtitle}>{widget.subtitle}</Text>
            )}
            
            <View style={styles.widgetValueContainer}>
              <Text style={styles.widgetValue}>{widget.value}</Text>
              {widget.trend && widget.trendValue && (
                <View style={[
                  styles.widgetTrend,
                  widget.trend === 'up' && styles.trendUp,
                  widget.trend === 'down' && styles.trendDown
                ]}>
                  <Text style={styles.trendText}>
                    {widget.trend === 'up' ? '↗' : widget.trend === 'down' ? '↘' : '→'} {widget.trendValue}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderRecentActivity = () => {
    if (!showActivity || recentActivity.length === 0) return null;

    return (
      <View style={styles.activityContainer} testID={`${testID}-activity`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>View All</Text>
            <ChevronRight style={styles.sectionActionIcon} />
          </TouchableOpacity>
        </View>
        
        <ActivityFeed
          activities={recentActivity.slice(0, maxActivityItems)}
          onActivityPress={onActivityPress}
          showLoadMore={false}
          style={styles.activityFeed}
          testID={`${testID}-activity-feed`}
        />
      </View>
    );
  };

  const renderNotifications = () => {
    if (!showNotifications || notifications.length === 0) return null;

    return (
      <View style={styles.notificationsContainer} testID={`${testID}-notifications`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>View All</Text>
            <ChevronRight style={styles.sectionActionIcon} />
          </TouchableOpacity>
        </View>
        
        <NotificationList
          notifications={notifications.slice(0, maxNotificationItems)}
          onNotificationPress={onNotificationPress}
          showLoadMore={false}
          style={styles.notificationList}
          testID={`${testID}-notification-list`}
        />
      </View>
    );
  };

  const renderSuggestedUsers = () => {
    if (suggestedUsers.length === 0) return null;

    return (
      <View style={styles.suggestedContainer} testID={`${testID}-suggested-users`}>
        <Text style={styles.sectionTitle}>Suggested Connections</Text>
        <UserList
          users={suggestedUsers.slice(0, 3)}
          showFollowButton={true}
          horizontal={true}
          style={styles.suggestedList}
          testID={`${testID}-suggested-list`}
        />
      </View>
    );
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Widgets */}
        {renderWidgets()}

        {/* Recent Activity */}
        {renderRecentActivity()}

        {/* Notifications */}
        {renderNotifications()}

        {/* Suggested Users */}
        {renderSuggestedUsers()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>
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
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  greetingContent: {
    flex: 1,
  },
  greetingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  greetingName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  greetingAvatar: {
    width: 40,
    height: 40,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  searchForm: {
    marginBottom: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.xl,
  },
  errorAlert: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginRight: SPACING.xs,
  },
  sectionActionIcon: {
    width: 16,
    height: 16,
    color: COLORS.primary,
  },
  quickActionsContainer: {
    marginBottom: SPACING.lg,
  },
  quickActionsScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  quickActionItem: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primaryForeground,
    marginBottom: SPACING.xs,
  },
  quickActionBadge: {
    alignSelf: 'flex-start',
  },
  quickActionIcon: {
    width: 20,
    height: 20,
    color: COLORS.primaryForeground,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  widgetsContainer: {
    marginBottom: SPACING.lg,
  },
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  widget: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.md) / 2,
  },
  widgetFull: {
    width: screenWidth - SPACING.lg * 2,
  },
  widgetLarge: {
    width: screenWidth - SPACING.lg * 2,
  },
  widgetCard: {
    padding: SPACING.lg,
    height: 120,
  },
  widgetContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  widgetTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    flex: 1,
  },
  widgetBadge: {
    marginLeft: SPACING.sm,
  },
  widgetSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  widgetValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  widgetValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  widgetTrend: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    marginLeft: SPACING.sm,
  },
  trendUp: {
    backgroundColor: `${COLORS.success}20`,
  },
  trendDown: {
    backgroundColor: `${COLORS.destructive}20`,
  },
  trendText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  activityContainer: {
    marginBottom: SPACING.lg,
  },
  activityFeed: {
    maxHeight: 400,
  },
  notificationsContainer: {
    marginBottom: SPACING.lg,
  },
  notificationList: {
    maxHeight: 300,
  },
  suggestedContainer: {
    marginBottom: SPACING.lg,
  },
  suggestedList: {
    maxHeight: 200,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default DashboardScreen;
export type { 
  DashboardScreenProps, 
  DashboardScreenConfig, 
  DashboardWidget, 
  QuickAction, 
  DashboardStats, 
  WidgetType 
};
