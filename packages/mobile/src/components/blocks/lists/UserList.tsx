import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card } from '../../../../~/components/ui/card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps, User } from '../../../lib/types';

/**
 * User list item data
 */
export interface UserListItem extends User {
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
  mutual?: number;
  stats?: {
    postsCount?: number;
    followersCount?: number;
    followingCount?: number;
  };
}

/**
 * User action configuration
 */
export interface UserAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onPress: (user: UserListItem) => void;
}

/**
 * Properties for the UserList component
 */
export interface UserListProps extends BaseComponentProps {
  /** Array of users to display */
  users: UserListItem[];
  /** Callback when user is selected */
  onUserSelect?: (user: UserListItem) => void;
  /** Available user actions */
  actions?: UserAction[];
  /** Show search functionality */
  showSearch?: boolean;
  /** Layout mode */
  layout?: 'list' | 'grid';
  /** Allow layout switching */
  allowLayoutSwitch?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of columns for grid layout */
  numColumns?: number;
  /** Show user status */
  showStatus?: boolean;
  /** Show user stats */
  showStats?: boolean;
  /** Callback for pull to refresh */
  onRefresh?: () => void;
  /** Refreshing state */
  refreshing?: boolean;
}

/**
 * UserList - AI-optimized user list component
 * 
 * A comprehensive user list with search, filtering, multiple layouts,
 * and customizable actions. Perfect for social apps and user management.
 * 
 * @example
 * ```tsx
 * <UserList
 *   users={userList}
 *   onUserSelect={(user) => navigateToProfile(user)}
 *   actions={[
 *     { id: 'message', label: 'Message', icon: '💬', onPress: sendMessage },
 *     { id: 'follow', label: 'Follow', icon: '👥', onPress: followUser }
 *   ]}
 *   showSearch={true}
 *   layout="list"
 *   allowLayoutSwitch={true}
 * />
 * ```
 */
const UserList: React.FC<UserListProps> = ({
  users,
  onUserSelect,
  actions = [],
  showSearch = true,
  layout = 'list',
  allowLayoutSwitch = true,
  loading = false,
  emptyMessage = "No users found",
  numColumns = 2,
  showStatus = true,
  showStats = false,
  onRefresh,
  refreshing = false,
  style,
  testID = 'user-list',
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Filter users based on search query
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = user.email?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  /**
   * Renders user avatar with status
   */
  const renderAvatar = (user: UserListItem, size: number = 50) => {
    const initials = user.firstName && user.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.email?.[0]?.toUpperCase() || '?';

    return (
      <View style={[styles.avatarContainer, { width: size, height: size }]}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={[styles.avatar, { width: size, height: size }]} />
        ) : (
          <View style={[styles.avatarPlaceholder, { width: size, height: size }]}>
            <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{initials}</Text>
          </View>
        )}
        
        {showStatus && user.status && (
          <View style={[
            styles.statusIndicator,
            { 
              backgroundColor: user.status === 'online' ? COLORS.success[500] :
                              user.status === 'away' ? COLORS.warning[500] :
                              COLORS.neutral[400]
            }
          ]} />
        )}
      </View>
    );
  };

  /**
   * Renders user actions
   */
  const renderActions = (user: UserListItem) => {
    if (actions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {actions.slice(0, 2).map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton,
              { backgroundColor: action.color || COLORS.primary[600] }
            ]}
            onPress={() => action.onPress(user)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
          </TouchableOpacity>
        ))}
        {actions.length > 2 && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => showMoreActions(user)}
          >
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Shows more actions for user
   */
  const showMoreActions = (user: UserListItem) => {
    const actionLabels = actions.slice(2).map(action => action.label);
    Alert.alert(
      'User Actions',
      `Choose an action for ${user.firstName} ${user.lastName}`,
      [
        ...actions.slice(2).map(action => ({
          text: action.label,
          onPress: () => action.onPress(user)
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  /**
   * Renders user in list layout
   */
  const renderUserList = ({ item: user }: { item: UserListItem }) => {
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email;

    return (
      <TouchableOpacity
        style={styles.userItemList}
        onPress={() => onUserSelect?.(user)}
        testID={`user-item-${user.id}`}
      >
        <Card style={styles.userCard}>
          <View style={styles.userContent}>
            {renderAvatar(user, 60)}
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              
              {showStatus && user.lastSeen && (
                <Text style={styles.lastSeen}>
                  {user.status === 'online' ? 'Online' : `Last seen ${user.lastSeen}`}
                </Text>
              )}
              
              {user.mutual && (
                <Text style={styles.mutualText}>{user.mutual} mutual connections</Text>
              )}
            </View>
            
            {renderActions(user)}
          </View>
          
          {showStats && user.stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.postsCount || 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  /**
   * Renders user in grid layout
   */
  const renderUserGrid = ({ item: user }: { item: UserListItem }) => {
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email;

    return (
      <TouchableOpacity
        style={styles.userItemGrid}
        onPress={() => onUserSelect?.(user)}
        testID={`user-grid-${user.id}`}
      >
        <Card style={styles.userCardGrid}>
          <View style={styles.userContentGrid}>
            {renderAvatar(user, 80)}
            
            <Text style={styles.userNameGrid} numberOfLines={1}>{fullName}</Text>
            <Text style={styles.userEmailGrid} numberOfLines={1}>{user.email}</Text>
            
            {showStatus && (
              <Text style={[
                styles.statusText,
                { color: user.status === 'online' ? COLORS.success[600] : COLORS.neutral[500] }
              ]}>
                {user.status === 'online' ? '● Online' : '○ Offline'}
              </Text>
            )}
            
            {actions.length > 0 && (
              <View style={styles.actionsContainerGrid}>
                {actions.slice(0, 1).map((action) => (
                  <Button
                    key={action.id}
                    onPress={() => action.onPress(user)}
                    style={[styles.actionButtonGrid, { backgroundColor: action.color || COLORS.primary[600] }]}
                  >
                    <Text style={styles.actionTextGrid}>{action.icon} {action.label}</Text>
                  </Button>
                ))}
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: SPACING.md,
      backgroundColor: COLORS.neutral[50],
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    searchInput: {
      flex: 1,
    },
    layoutControls: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    layoutButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      backgroundColor: COLORS.neutral[200],
    },
    layoutButtonActive: {
      backgroundColor: COLORS.primary[600],
    },
    layoutText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    layoutTextActive: {
      color: '#ffffff',
    },
    listContainer: {
      flex: 1,
      padding: SPACING.sm,
    },
    userItemList: {
      marginBottom: SPACING.sm,
    },
    userItemGrid: {
      flex: 1,
      margin: SPACING.xs,
      maxWidth: '48%',
    },
    userCard: {
      padding: SPACING.md,
    },
    userCardGrid: {
      padding: SPACING.md,
      alignItems: 'center',
    },
    userContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userContentGrid: {
      alignItems: 'center',
      width: '100%',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: SPACING.md,
    },
    avatar: {
      borderRadius: 30,
    },
    avatarPlaceholder: {
      borderRadius: 30,
      backgroundColor: COLORS.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.primary[700],
    },
    statusIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.xs,
    },
    userNameGrid: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
      marginTop: SPACING.sm,
      textAlign: 'center',
    },
    userEmail: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[600],
      marginBottom: SPACING.xs,
    },
    userEmailGrid: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[600],
      textAlign: 'center',
      marginTop: SPACING.xs,
    },
    lastSeen: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[500],
      marginBottom: SPACING.xs,
    },
    mutualText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.primary[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    statusText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      marginTop: SPACING.xs,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: SPACING.xs,
    },
    actionsContainerGrid: {
      marginTop: SPACING.sm,
      width: '100%',
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonGrid: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.sm,
      borderRadius: 6,
    },
    actionIcon: {
      fontSize: TYPOGRAPHY.fontSize.base,
    },
    actionTextGrid: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: '#ffffff',
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    moreButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.neutral[300],
      justifyContent: 'center',
      alignItems: 'center',
    },
    moreIcon: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: COLORS.neutral[600],
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: COLORS.neutral[200],
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
    },
    statLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[600],
      marginTop: SPACING.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral[500],
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      {/* Header with Search and Layout Controls */}
      {(showSearch || allowLayoutSwitch) && (
        <View style={styles.header}>
          {showSearch && (
            <View style={styles.searchContainer}>
              <Input
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                testID="user-search-input"
              />
              
              {allowLayoutSwitch && (
                <View style={styles.layoutControls}>
                  <TouchableOpacity
                    style={[
                      styles.layoutButton,
                      currentLayout === 'list' && styles.layoutButtonActive
                    ]}
                    onPress={() => setCurrentLayout('list')}
                    testID="list-layout-button"
                  >
                    <Text style={[
                      styles.layoutText,
                      currentLayout === 'list' && styles.layoutTextActive
                    ]}>
                      ☰
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.layoutButton,
                      currentLayout === 'grid' && styles.layoutButtonActive
                    ]}
                    onPress={() => setCurrentLayout('grid')}
                    testID="grid-layout-button"
                  >
                    <Text style={[
                      styles.layoutText,
                      currentLayout === 'grid' && styles.layoutTextActive
                    ]}>
                      ▦
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* User List */}
      <View style={styles.listContainer}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={currentLayout === 'grid' ? renderUserGrid : renderUserList}
            keyExtractor={(item) => item.id}
            numColumns={currentLayout === 'grid' ? numColumns : 1}
            key={currentLayout} // Force re-render when layout changes
            onRefresh={onRefresh}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SPACING.lg }}
            testID="users-flatlist"
          />
        )}
      </View>
    </View>
  );
};

export default UserList; 