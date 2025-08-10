/**
 * ProfileScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive profile screen template that combines the ProfileCard and ProfileEditForm blocks
 * with proper navigation, edit modes, and user profile management.
 * 
 * Features:
 * - ProfileCard display with user information
 * - Edit mode with ProfileEditForm integration
 * - Profile image upload and editing
 * - Social profile links and stats
 * - Activity history and achievements
 * - Settings and account navigation
 * - Share profile functionality
 * - Loading states and error handling
 * - Pull-to-refresh support
 * - SafeAreaView integration
 * - Accessibility support
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <ProfileScreen
 *   user={currentUser}
 *   onEditProfile={(data) => handleProfileUpdate(data)}
 *   onEditProfileImage={() => handleImageEdit()}
 *   onNavigateToSettings={() => navigation.navigate('Settings')}
 *   onShareProfile={() => handleProfileShare()}
 *   onRefresh={() => handleRefresh()}
 *   loading={profileLoading}
 *   error={profileError}
 *   isOwnProfile={true}
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
  Image,
  Alert 
} from 'react-native';
import { ProfileCard, ProfileEditForm } from '../../blocks/auth';
import type { 
  ProfileCardProps, 
  ProfileEditFormProps 
} from '../../blocks/auth';
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
 * Profile stats data
 */
export interface ProfileStats {
  /** Number of followers */
  followers?: number;
  /** Number of following */
  following?: number;
  /** Number of posts */
  posts?: number;
  /** Custom stats */
  custom?: Array<{
    label: string;
    value: string | number;
  }>;
}

/**
 * Profile activity item
 */
export interface ProfileActivity {
  /** Activity ID */
  id: string;
  /** Activity type */
  type: string;
  /** Activity title */
  title: string;
  /** Activity description */
  description?: string;
  /** Activity date */
  date: Date;
  /** Activity icon */
  icon?: string;
}

/**
 * Profile achievement
 */
export interface ProfileAchievement {
  /** Achievement ID */
  id: string;
  /** Achievement title */
  title: string;
  /** Achievement description */
  description: string;
  /** Achievement icon */
  icon?: string;
  /** Achievement badge */
  badge?: string;
  /** Is unlocked */
  unlocked: boolean;
  /** Unlock date */
  unlockedAt?: Date;
}

/**
 * Profile screen configuration
 */
export interface ProfileScreenConfig {
  /** Show edit button */
  showEditButton?: boolean;
  /** Show settings button */
  showSettingsButton?: boolean;
  /** Show share button */
  showShareButton?: boolean;
  /** Show stats section */
  showStats?: boolean;
  /** Show activity section */
  showActivity?: boolean;
  /** Show achievements section */
  showAchievements?: boolean;
  /** Show social links */
  showSocialLinks?: boolean;
  /** Default to edit mode */
  defaultEditMode?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the ProfileScreen template
 */
export interface ProfileScreenProps extends BaseComponentProps {
  /** User profile data */
  user: UserProfile;
  /** Callback when profile is edited */
  onEditProfile?: (data: UserProfile) => Promise<void> | void;
  /** Callback when profile image is edited */
  onEditProfileImage?: () => void;
  /** Callback when settings is pressed */
  onNavigateToSettings?: () => void;
  /** Callback when share is pressed */
  onShareProfile?: () => void;
  /** Callback when follow/unfollow is pressed */
  onToggleFollow?: (user: UserProfile) => Promise<void> | void;
  /** Callback when activity item is pressed */
  onActivityPress?: (activity: ProfileActivity) => void;
  /** Callback when achievement is pressed */
  onAchievementPress?: (achievement: ProfileAchievement) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Profile stats */
  stats?: ProfileStats;
  /** Recent activity */
  activity?: ProfileActivity[];
  /** User achievements */
  achievements?: ProfileAchievement[];
  /** Is this the current user's profile */
  isOwnProfile?: boolean;
  /** Is user following this profile */
  isFollowing?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the profile screen */
  config?: ProfileScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ProfileScreen - AI-optimized profile screen template
 * 
 * A comprehensive profile screen that displays user information,
 * stats, activity, and provides editing capabilities.
 */
const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onEditProfile,
  onEditProfileImage,
  onNavigateToSettings,
  onShareProfile,
  onToggleFollow,
  onActivityPress,
  onAchievementPress,
  onRefresh,
  stats,
  activity = [],
  achievements = [],
  isOwnProfile = false,
  isFollowing = false,
  loading = false,
  refreshing = false,
  error,
  config = {},
  style,
  testID = 'profile-screen',
  ...props
}) => {
  const [isEditMode, setIsEditMode] = useState(config.defaultEditMode || false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    showEditButton = isOwnProfile,
    showSettingsButton = isOwnProfile,
    showShareButton = true,
    showStats = true,
    showActivity = true,
    showAchievements = true,
    showSocialLinks = true,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleEditProfile = useCallback(async (profileData: UserProfile) => {
    if (!onEditProfile) return;

    try {
      setLocalError(null);
      setLocalLoading(true);
      await onEditProfile(profileData);
      setIsEditMode(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setLocalError(errorMessage);
      Alert.alert('Update Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onEditProfile]);

  const handleToggleFollow = useCallback(async () => {
    if (!onToggleFollow) return;

    try {
      setLocalLoading(true);
      await onToggleFollow(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Follow action failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onToggleFollow, user]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;

    try {
      await onRefresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
      Alert.alert('Error', errorMessage);
    }
  }, [onRefresh]);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setLocalError(null);
  }, []);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <View style={styles.headerActions}>
          {showSettingsButton && onNavigateToSettings && (
            <TouchableOpacity 
              onPress={onNavigateToSettings}
              style={styles.headerButton}
              testID={`${testID}-settings-button`}
            >
              <Text style={styles.headerButtonText}>Settings</Text>
            </TouchableOpacity>
          )}
          
          {showShareButton && onShareProfile && (
            <TouchableOpacity 
              onPress={onShareProfile}
              style={styles.headerButton}
              testID={`${testID}-share-button`}
            >
              <Text style={styles.headerButtonText}>Share</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderError = () => {
    const displayError = error || localError;
    if (!displayError) return null;

    return (
      <UIAlert 
        variant="destructive"
        style={styles.errorAlert}
        testID={`${testID}-error`}
      >
        <Text style={styles.errorText}>{displayError}</Text>
      </UIAlert>
    );
  };

  const renderProfileCard = () => {
    if (isEditMode) {
      return (
        <Card style={styles.editCard} testID={`${testID}-edit-card`}>
          <ProfileEditForm
            onSave={handleEditProfile}
            onCancel={handleCancelEdit}
            initialData={user}
            loading={localLoading}
            showCancelButton={true}
            style={styles.editForm}
            testID={`${testID}-edit-form`}
          />
        </Card>
      );
    }

    return (
      <Card style={styles.profileCard} testID={`${testID}-profile-card`}>
        <ProfileCard
          user={user}
          onEdit={showEditButton ? () => setIsEditMode(true) : undefined}
          onEditImage={onEditProfileImage}
          showStatus={true}
          showBio={true}
          showLocation={true}
          showWebsite={true}
          style={styles.profileCardContent}
          testID={`${testID}-profile-display`}
        />
        
        {/* Follow Button for other users */}
        {!isOwnProfile && onToggleFollow && (
          <View style={styles.followContainer}>
            <Button
              onPress={handleToggleFollow}
              variant={isFollowing ? 'outline' : 'default'}
              loading={localLoading}
              style={styles.followButton}
              testID={`${testID}-follow-button`}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </Button>
          </View>
        )}
      </Card>
    );
  };

  const renderStats = () => {
    if (!showStats || !stats) return null;

    return (
      <Card style={styles.statsCard} testID={`${testID}-stats`}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsContainer}>
          {stats.followers !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          )}
          
          {stats.following !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          )}
          
          {stats.posts !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          )}
          
          {stats.custom?.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderActivity = () => {
    if (!showActivity || activity.length === 0) return null;

    return (
      <Card style={styles.activityCard} testID={`${testID}-activity`}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          {activity.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onActivityPress?.(item)}
              style={styles.activityItem}
              testID={`${testID}-activity-${item.id}`}
            >
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.activityDescription}>{item.description}</Text>
                )}
                <Text style={styles.activityDate}>
                  {item.date.toLocaleDateString()}
                </Text>
              </View>
              <ChevronRight style={styles.activityChevron} />
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  const renderAchievements = () => {
    if (!showAchievements || achievements.length === 0) return null;

    const unlockedAchievements = achievements.filter(a => a.unlocked);

    return (
      <Card style={styles.achievementsCard} testID={`${testID}-achievements`}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsContainer}>
          {unlockedAchievements.slice(0, 6).map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              onPress={() => onAchievementPress?.(achievement)}
              style={styles.achievementItem}
              testID={`${testID}-achievement-${achievement.id}`}
            >
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementIconText}>🏆</Text>
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const isLoading = loading || localLoading;
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

        {/* Profile Card / Edit Form */}
        {renderProfileCard()}

        {/* Stats */}
        {renderStats()}

        {/* Activity */}
        {renderActivity()}

        {/* Achievements */}
        {renderAchievements()}

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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  headerButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  errorAlert: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  profileCard: {
    padding: SPACING.lg,
  },
  profileCardContent: {
    marginBottom: SPACING.md,
  },
  followContainer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  followButton: {
    minWidth: 120,
  },
  followButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  editCard: {
    padding: SPACING.lg,
  },
  editForm: {
    // No additional styles needed
  },
  statsCard: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  activityCard: {
    padding: SPACING.lg,
  },
  activityContainer: {
    gap: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  activityDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  activityDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  activityChevron: {
    width: 16,
    height: 16,
    color: COLORS.textSecondary,
  },
  achievementsCard: {
    padding: SPACING.lg,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  achievementItem: {
    alignItems: 'center',
    width: '30%',
    minWidth: 80,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  achievementIconText: {
    fontSize: 20,
  },
  achievementTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default ProfileScreen;
export type { 
  ProfileScreenProps, 
  ProfileScreenConfig, 
  ProfileStats, 
  ProfileActivity, 
  ProfileAchievement 
};
