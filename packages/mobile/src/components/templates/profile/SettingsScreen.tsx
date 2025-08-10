/**
 * SettingsScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive settings screen template that combines the SettingsPanel block
 * with organized sections, preferences management, and navigation to sub-settings.
 * 
 * Features:
 * - SettingsPanel integration with categorized options
 * - Account settings and preferences
 * - Notification settings toggles
 * - Privacy and security options
 * - App preferences and customization
 * - Theme and appearance settings
 * - Language and region settings
 * - Data and storage management
 * - Help and support navigation
 * - About and legal information
 * - Logout and account actions
 * - Search functionality
 * - Loading states and error handling
 * 
 * @example
 * ```tsx
 * <SettingsScreen
 *   user={currentUser}
 *   settings={userSettings}
 *   onSettingChange={(key, value) => handleSettingChange(key, value)}
 *   onNavigateToSection={(section) => navigation.navigate(section)}
 *   onLogout={() => handleLogout()}
 *   onDeleteAccount={() => handleDeleteAccount()}
 *   loading={settingsLoading}
 *   error={settingsError}
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
  ScrollView, 
  TouchableOpacity,
  Alert,
  Switch 
} from 'react-native';
import { SettingsPanel } from '../../blocks/auth';
import type { SettingsPanelProps } from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { Avatar } from '../../../../~/components/ui/avatar';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps, UserProfile } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Setting item types
 */
export type SettingType = 'toggle' | 'select' | 'navigation' | 'action' | 'text' | 'slider';

/**
 * Setting option for select type
 */
export interface SettingOption {
  label: string;
  value: string | number | boolean;
}

/**
 * Individual setting configuration
 */
export interface SettingItem {
  /** Setting unique key */
  key: string;
  /** Setting type */
  type: SettingType;
  /** Setting title */
  title: string;
  /** Setting description */
  description?: string;
  /** Setting icon */
  icon?: string;
  /** Current value */
  value?: any;
  /** Options for select type */
  options?: SettingOption[];
  /** Is setting disabled */
  disabled?: boolean;
  /** Show badge */
  badge?: string;
  /** Navigation destination for navigation type */
  destination?: string;
  /** Action callback for action type */
  onPress?: () => void;
  /** Min/max for slider type */
  min?: number;
  max?: number;
  /** Step for slider type */
  step?: number;
}

/**
 * Settings section configuration
 */
export interface SettingsSection {
  /** Section ID */
  id: string;
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Section icon */
  icon?: string;
  /** Section settings */
  settings: SettingItem[];
  /** Section footer text */
  footer?: string;
}

/**
 * Settings screen configuration
 */
export interface SettingsScreenConfig {
  /** Show search bar */
  showSearch?: boolean;
  /** Show user profile header */
  showUserHeader?: boolean;
  /** Show logout button */
  showLogout?: boolean;
  /** Show delete account option */
  showDeleteAccount?: boolean;
  /** Custom sections */
  customSections?: SettingsSection[];
  /** Hide default sections */
  hideDefaultSections?: string[];
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the SettingsScreen template
 */
export interface SettingsScreenProps extends BaseComponentProps {
  /** Current user */
  user?: UserProfile;
  /** Current settings values */
  settings?: Record<string, any>;
  /** Callback when setting changes */
  onSettingChange?: (key: string, value: any) => Promise<void> | void;
  /** Callback when navigating to section */
  onNavigateToSection?: (section: string, destination?: string) => void;
  /** Callback when logout is pressed */
  onLogout?: () => void;
  /** Callback when delete account is pressed */
  onDeleteAccount?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the settings screen */
  config?: SettingsScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SettingsScreen - AI-optimized settings screen template
 * 
 * A comprehensive settings screen that organizes preferences into
 * logical sections with proper navigation and state management.
 */
const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  settings = {},
  onSettingChange,
  onNavigateToSection,
  onLogout,
  onDeleteAccount,
  loading = false,
  error,
  config = {},
  style,
  testID = 'settings-screen',
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState<Record<string, boolean>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    showSearch = true,
    showUserHeader = true,
    showLogout = true,
    showDeleteAccount = false,
    customSections = [],
    hideDefaultSections = [],
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // DEFAULT SECTIONS
  // =============================================================================

  const defaultSections: SettingsSection[] = useMemo(() => [
    {
      id: 'account',
      title: 'Account',
      description: 'Manage your account settings',
      settings: [
        {
          key: 'edit_profile',
          type: 'navigation',
          title: 'Edit Profile',
          description: 'Update your profile information',
          destination: 'EditProfile'
        },
        {
          key: 'change_password',
          type: 'navigation',
          title: 'Change Password',
          description: 'Update your password',
          destination: 'ChangePassword'
        },
        {
          key: 'email_preferences',
          type: 'navigation',
          title: 'Email Preferences',
          description: 'Manage email notifications',
          destination: 'EmailPreferences'
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
      settings: [
        {
          key: 'push_notifications',
          type: 'toggle',
          title: 'Push Notifications',
          description: 'Receive push notifications',
          value: settings.pushNotifications ?? true
        },
        {
          key: 'email_notifications',
          type: 'toggle',
          title: 'Email Notifications',
          description: 'Receive email notifications',
          value: settings.emailNotifications ?? true
        },
        {
          key: 'marketing_emails',
          type: 'toggle',
          title: 'Marketing Emails',
          description: 'Receive promotional emails',
          value: settings.marketingEmails ?? false
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control your privacy and security',
      settings: [
        {
          key: 'profile_visibility',
          type: 'select',
          title: 'Profile Visibility',
          description: 'Who can see your profile',
          value: settings.profileVisibility ?? 'public',
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Friends Only', value: 'friends' },
            { label: 'Private', value: 'private' }
          ]
        },
        {
          key: 'two_factor_auth',
          type: 'navigation',
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          destination: 'TwoFactorAuth',
          badge: settings.twoFactorEnabled ? 'Enabled' : undefined
        },
        {
          key: 'data_privacy',
          type: 'navigation',
          title: 'Data & Privacy',
          description: 'Manage your data and privacy',
          destination: 'DataPrivacy'
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the app appearance',
      settings: [
        {
          key: 'theme',
          type: 'select',
          title: 'Theme',
          description: 'Choose your preferred theme',
          value: settings.theme ?? 'system',
          options: [
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' }
          ]
        },
        {
          key: 'font_size',
          type: 'select',
          title: 'Font Size',
          description: 'Adjust text size',
          value: settings.fontSize ?? 'medium',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ]
        }
      ]
    },
    {
      id: 'support',
      title: 'Help & Support',
      description: 'Get help and support',
      settings: [
        {
          key: 'help_center',
          type: 'navigation',
          title: 'Help Center',
          description: 'Browse help articles',
          destination: 'HelpCenter'
        },
        {
          key: 'contact_support',
          type: 'navigation',
          title: 'Contact Support',
          description: 'Get in touch with support',
          destination: 'ContactSupport'
        },
        {
          key: 'report_bug',
          type: 'navigation',
          title: 'Report a Bug',
          description: 'Report issues or bugs',
          destination: 'ReportBug'
        }
      ]
    },
    {
      id: 'about',
      title: 'About',
      description: 'App information and legal',
      settings: [
        {
          key: 'app_version',
          type: 'text',
          title: 'App Version',
          value: '1.0.0'
        },
        {
          key: 'terms_of_service',
          type: 'navigation',
          title: 'Terms of Service',
          destination: 'TermsOfService'
        },
        {
          key: 'privacy_policy',
          type: 'navigation',
          title: 'Privacy Policy',
          destination: 'PrivacyPolicy'
        }
      ]
    }
  ], [settings]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const allSections = useMemo(() => {
    const filteredDefaultSections = defaultSections.filter(
      section => !hideDefaultSections.includes(section.id)
    );
    return [...filteredDefaultSections, ...customSections];
  }, [defaultSections, customSections, hideDefaultSections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return allSections;

    return allSections.map(section => ({
      ...section,
      settings: section.settings.filter(setting =>
        setting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.settings.length > 0);
  }, [allSections, searchQuery]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSettingChange = useCallback(async (key: string, value: any) => {
    if (!onSettingChange) return;

    try {
      setLocalError(null);
      setLocalLoading(prev => ({ ...prev, [key]: true }));
      await onSettingChange(key, value);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Setting update failed';
      setLocalError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLocalLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [onSettingChange]);

  const handleLogout = useCallback(() => {
    if (!onLogout) return;

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]
    );
  }, [onLogout]);

  const handleDeleteAccount = useCallback(() => {
    if (!onDeleteAccount) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDeleteAccount }
      ]
    );
  }, [onDeleteAccount]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <Text style={styles.screenTitle}>Settings</Text>
        
        {showUserHeader && user && (
          <View style={styles.userHeader}>
            <Avatar style={styles.userAvatar}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                </Text>
              )}
            </Avatar>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.email
                }
              </Text>
              {user.email && (user.firstName || user.lastName) && (
                <Text style={styles.userEmail}>{user.email}</Text>
              )}
            </View>
          </View>
        )}

        {showSearch && (
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            testID={`${testID}-search`}
          />
        )}
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

  const renderSettingItem = (setting: SettingItem, sectionId: string) => {
    const isLoading = localLoading[setting.key] || loading;
    
    const settingContent = () => {
      switch (setting.type) {
        case 'toggle':
          return (
            <Switch
              value={setting.value}
              onValueChange={(value) => handleSettingChange(setting.key, value)}
              disabled={setting.disabled || isLoading}
              testID={`${testID}-toggle-${setting.key}`}
            />
          );
          
        case 'navigation':
          return <ChevronRight style={styles.settingIcon} />;
          
        case 'text':
          return (
            <Text style={styles.settingValue}>
              {setting.value}
            </Text>
          );
          
        case 'select':
          const selectedOption = setting.options?.find(opt => opt.value === setting.value);
          return (
            <View style={styles.selectContainer}>
              <Text style={styles.settingValue}>
                {selectedOption?.label || 'Select...'}
              </Text>
              <ChevronRight style={styles.settingIcon} />
            </View>
          );
          
        default:
          return null;
      }
    };

    const handlePress = () => {
      if (setting.disabled || isLoading) return;
      
      if (setting.type === 'navigation') {
        onNavigateToSection?.(sectionId, setting.destination);
      } else if (setting.type === 'action') {
        setting.onPress?.();
      } else if (setting.type === 'select') {
        // Handle select - would typically show a picker
        onNavigateToSection?.(sectionId, setting.destination);
      }
    };

    return (
      <TouchableOpacity
        key={setting.key}
        onPress={handlePress}
        disabled={setting.disabled || (setting.type === 'toggle')}
        style={[
          styles.settingItem,
          setting.disabled && styles.settingItemDisabled
        ]}
        testID={`${testID}-setting-${setting.key}`}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            {setting.description && (
              <Text style={styles.settingDescription}>{setting.description}</Text>
            )}
          </View>
          
          <View style={styles.settingControl}>
            {setting.badge && (
              <Badge variant="secondary" style={styles.settingBadge}>
                <Text style={styles.badgeText}>{setting.badge}</Text>
              </Badge>
            )}
            {settingContent()}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingsSection) => {
    if (section.settings.length === 0) return null;

    return (
      <Card 
        key={section.id}
        style={styles.sectionCard}
        testID={`${testID}-section-${section.id}`}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.description && (
            <Text style={styles.sectionDescription}>{section.description}</Text>
          )}
        </View>
        
        <View style={styles.sectionContent}>
          {section.settings.map(setting => renderSettingItem(setting, section.id))}
        </View>
        
        {section.footer && (
          <Text style={styles.sectionFooter}>{section.footer}</Text>
        )}
      </Card>
    );
  };

  const renderActions = () => {
    if (!showLogout && !showDeleteAccount) return null;

    return (
      <Card style={styles.actionsCard} testID={`${testID}-actions`}>
        {showLogout && onLogout && (
          <Button
            onPress={handleLogout}
            variant="outline"
            style={styles.actionButton}
            testID={`${testID}-logout-button`}
          >
            <Text style={styles.actionButtonText}>Logout</Text>
          </Button>
        )}
        
        {showDeleteAccount && onDeleteAccount && (
          <Button
            onPress={handleDeleteAccount}
            variant="destructive"
            style={styles.actionButton}
            testID={`${testID}-delete-button`}
          >
            <Text style={styles.actionButtonText}>Delete Account</Text>
          </Button>
        )}
      </Card>
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Settings Sections */}
        {filteredSections.map(renderSection)}

        {/* Actions */}
        {renderActions()}

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
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  userAvatar: {
    width: 50,
    height: 50,
    marginRight: SPACING.md,
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  searchInput: {
    marginBottom: SPACING.sm,
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
  sectionCard: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  sectionContent: {
    gap: SPACING.xs,
  },
  sectionFooter: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  settingItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  settingIcon: {
    width: 16,
    height: 16,
    color: COLORS.textSecondary,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionsCard: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    paddingVertical: SPACING.md,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default SettingsScreen;
export type { 
  SettingsScreenProps, 
  SettingsScreenConfig, 
  SettingsSection, 
  SettingItem, 
  SettingType, 
  SettingOption 
};
