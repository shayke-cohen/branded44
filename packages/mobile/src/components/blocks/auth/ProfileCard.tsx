import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps, User } from '../../../lib/types';

/**
 * Properties for the ProfileCard component
 */
export interface ProfileCardProps extends BaseComponentProps {
  /** User data to display */
  user: User;
  /** Callback when edit button is pressed */
  onEdit?: () => void;
  /** Callback when avatar is pressed */
  onAvatarPress?: () => void;
  /** Show edit button */
  showEditButton?: boolean;
  /** Show status indicators */
  showStatus?: boolean;
  /** Custom avatar size */
  avatarSize?: number;
}

/**
 * ProfileCard - AI-optimized user profile display component
 * 
 * A comprehensive profile card component with avatar, user information,
 * and edit capabilities. Designed for easy AI code generation.
 * 
 * @example
 * ```tsx
 * <ProfileCard
 *   user={currentUser}
 *   onEdit={() => navigation.navigate('EditProfile')}
 *   showEditButton={true}
 *   showStatus={true}
 * />
 * ```
 */
const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onEdit,
  onAvatarPress,
  showEditButton = true,
  showStatus = false,
  avatarSize = 80,
  style,
  testID = 'profile-card',
  ...props
}) => {
  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.email?.[0]?.toUpperCase() || '?';

  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    card: {
      padding: SPACING.lg,
      margin: SPACING.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    avatarContainer: {
      marginRight: SPACING.md,
    },
    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: COLORS.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    avatarText: {
      fontSize: avatarSize * 0.3,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.primary[700],
    },
    userInfo: {
      flex: 1,
    },
    name: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.xs,
    },
    email: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[600],
      marginBottom: SPACING.xs,
    },
    status: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.success[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    editButton: {
      backgroundColor: COLORS.primary[600],
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: COLORS.neutral[200],
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
    },
    statLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.neutral[600],
      marginTop: SPACING.xs,
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      <Card style={styles.card}>
        {/* Header with Avatar and Info */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={onAvatarPress}
            disabled={!onAvatarPress}
            testID="avatar-button"
          >
            <View style={styles.avatar}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {showStatus && (
              <Text style={styles.status}>● Online</Text>
            )}
          </View>

          {showEditButton && onEdit && (
            <Button
              onPress={onEdit}
              style={styles.editButton}
              testID="edit-button"
            >
              <Text>Edit</Text>
            </Button>
          )}
        </View>

        {/* Stats (if available) */}
        {user.stats && (
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
    </View>
  );
};

export default ProfileCard; 