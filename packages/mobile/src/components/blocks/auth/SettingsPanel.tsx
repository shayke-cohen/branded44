/**
 * SettingsPanel - Account Settings with Toggles Block Component
 * 
 * A comprehensive settings panel with categorized options, toggles, and actions.
 * Optimized for AI agent code generation with clear structure and documentation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Switch } from '../../../../~/components/ui/switch';
import { Separator } from '../../../../~/components/ui/separator';
import { Badge } from '../../../../~/components/ui/badge';
import { Text } from '../../../../~/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../~/components/ui/avatar';
import { cn } from '../../../lib/utils';
import { User, UserPreferences, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { ChevronRight } from 'lucide-react-native';

/**
 * Props interface for SettingsPanel component
 */
export interface SettingsPanelProps {
  /**
   * Current user data
   */
  user: User;
  
  /**
   * Current user preferences
   */
  preferences: UserPreferences;
  
  /**
   * Callback when preferences are updated
   */
  onPreferencesUpdate: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  /**
   * Navigation callbacks for different settings sections
   */
  onNavigate?: {
    profile?: () => void;
    security?: () => void;
    notifications?: () => void;
    privacy?: () => void;
    subscription?: () => void;
    help?: () => void;
    about?: () => void;
  };
  
  /**
   * Account action callbacks
   */
  onActions?: {
    logout?: () => void;
    deleteAccount?: () => void;
    exportData?: () => void;
  };
  
  /**
   * Current loading state
   */
  loading?: LoadingState;
  
  /**
   * Custom styling for the container
   */
  style?: any;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Test identifier for automated testing
   */
  testID?: string;
  
  /**
   * Whether to show the user profile header
   */
  showProfileHeader?: boolean;
  
  /**
   * Whether to show dangerous actions (delete account, etc.)
   */
  showDangerousActions?: boolean;
}

/**
 * Setting item configuration interface
 */
interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'navigation' | 'action' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  badge?: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * SettingsPanel Component
 * 
 * Provides a comprehensive settings interface with:
 * - User profile header
 * - Categorized settings sections
 * - Toggle switches for preferences
 * - Navigation to detailed settings
 * - Account actions
 * 
 * @example
 * ```tsx
 * <SettingsPanel
 *   user={currentUser}
 *   preferences={userPreferences}
 *   onPreferencesUpdate={handlePreferencesUpdate}
 *   onNavigate={{
 *     profile: () => navigation.navigate('Profile'),
 *     security: () => navigation.navigate('Security'),
 *   }}
 *   onActions={{
 *     logout: handleLogout,
 *     deleteAccount: handleDeleteAccount,
 *   }}
 * />
 * ```
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  user,
  preferences,
  onPreferencesUpdate,
  onNavigate = {},
  onActions = {},
  loading = 'idle',
  style,
  className,
  testID = 'settings-panel',
  showProfileHeader = true,
  showDangerousActions = false,
}) => {
  const [updatingPreference, setUpdatingPreference] = useState<string | null>(null);

  const isLoading = loading === 'loading';

  /**
   * Handles preference toggle updates
   */
  const handlePreferenceToggle = async (key: string, section: keyof UserPreferences, field: string, value: boolean) => {
    setUpdatingPreference(key);
    
    try {
      const updatedPreferences = {
        ...preferences,
        [section]: {
          ...preferences[section],
          [field]: value,
        },
      };
      
      await onPreferencesUpdate(updatedPreferences);
    } catch (error) {
      Alert.alert('Error', 'Failed to update preference. Please try again.');
    } finally {
      setUpdatingPreference(null);
    }
  };

  /**
   * Handles dangerous actions with confirmation
   */
  const handleDangerousAction = (action: () => void, title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: action },
      ]
    );
  };

  /**
   * Gets user initials for avatar fallback
   */
  const getUserInitials = (): string => {
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || 'U';
  };

  /**
   * Configuration for all settings sections
   */
  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          description: 'Update your personal information',
          type: 'navigation' as const,
          onPress: onNavigate.profile,
          icon: <ChevronRight size={20} color={COLORS.neutral[400]} />,
        },
        {
          id: 'security',
          title: 'Security & Privacy',
          description: 'Password, 2FA, and privacy settings',
          type: 'navigation' as const,
          onPress: onNavigate.security,
          icon: <ChevronRight size={20} color={COLORS.neutral[400]} />,
        },
        {
          id: 'subscription',
          title: 'Subscription',
          description: 'Manage your plan and billing',
          type: 'navigation' as const,
          onPress: onNavigate.subscription,
          badge: user?.role === 'premium' ? 'Premium' : undefined,
          icon: <ChevronRight size={20} color={COLORS.neutral[400]} />,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          description: `Current: ${preferences.theme}`,
          type: 'info' as const,
          value: preferences.theme !== 'light',
        },
        {
          id: 'notifications-email',
          title: 'Email Notifications',
          description: 'Receive notifications via email',
          type: 'toggle' as const,
          value: preferences.notifications?.email,
          onToggle: (value) => handlePreferenceToggle('notifications-email', 'notifications', 'email', value),
          disabled: updatingPreference === 'notifications-email',
        },
        {
          id: 'notifications-push',
          title: 'Push Notifications',
          description: 'Receive push notifications on your device',
          type: 'toggle' as const,
          value: preferences.notifications?.push,
          onToggle: (value) => handlePreferenceToggle('notifications-push', 'notifications', 'push', value),
          disabled: updatingPreference === 'notifications-push',
        },
        {
          id: 'notifications-marketing',
          title: 'Marketing Communications',
          description: 'Receive promotional emails and updates',
          type: 'toggle' as const,
          value: preferences.notifications?.marketing,
          onToggle: (value) => handlePreferenceToggle('notifications-marketing', 'notifications', 'marketing', value),
          disabled: updatingPreference === 'notifications-marketing',
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'privacy-searchable',
          title: 'Profile Discoverable',
          description: 'Allow others to find your profile in search',
          type: 'toggle' as const,
          value: preferences.privacy?.searchable,
          onToggle: (value) => handlePreferenceToggle('privacy-searchable', 'privacy', 'searchable', value),
          disabled: updatingPreference === 'privacy-searchable',
        },
        {
          id: 'privacy-online-status',
          title: 'Show Online Status',
          description: 'Let others see when you\'re active',
          type: 'toggle' as const,
          value: preferences.privacy?.showOnlineStatus,
          onToggle: (value) => handlePreferenceToggle('privacy-online-status', 'privacy', 'showOnlineStatus', value),
          disabled: updatingPreference === 'privacy-online-status',
        },
        {
          id: 'privacy-messages',
          title: 'Messages from Strangers',
          description: 'Allow messages from people you don\'t follow',
          type: 'toggle' as const,
          value: preferences.privacy?.allowMessagesFromStrangers,
          onToggle: (value) => handlePreferenceToggle('privacy-messages', 'privacy', 'allowMessagesFromStrangers', value),
          disabled: updatingPreference === 'privacy-messages',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          description: 'Get help and contact support',
          type: 'navigation' as const,
          onPress: onNavigate.help,
          icon: <ChevronRight size={20} color={COLORS.neutral[400]} />,
        },
        {
          id: 'about',
          title: 'About',
          description: 'App version and legal information',
          type: 'navigation' as const,
          onPress: onNavigate.about,
          icon: <ChevronRight size={20} color={COLORS.neutral[400]} />,
        },
      ],
    },
  ];

  /**
   * Dangerous actions section (conditionally shown)
   */
  const dangerousActions = showDangerousActions ? {
    title: 'Danger Zone',
    items: [
      {
        id: 'export-data',
        title: 'Export My Data',
        description: 'Download a copy of your data',
        type: 'action' as const,
        onPress: onActions.exportData,
      },
      {
        id: 'delete-account',
        title: 'Delete Account',
        description: 'Permanently delete your account and all data',
        type: 'action' as const,
        destructive: true,
        onPress: () => onActions.deleteAccount && handleDangerousAction(
          onActions.deleteAccount,
          'Delete Account',
          'This action cannot be undone. All your data will be permanently deleted.'
        ),
      },
    ],
  } : null;

  /**
   * Renders a settings item based on its type
   */
  const renderSettingItem = (item: SettingItem) => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
      minHeight: 60,
    };

    const contentStyle = {
      flex: 1,
      marginRight: SPACING.md,
    };

    return (
      <View key={item.id}>
        {item.type === 'toggle' ? (
          <View style={baseStyle}>
            <View style={contentStyle}>
              <Text style={{ 
                fontSize: TYPOGRAPHY.fontSize.base, 
                fontWeight: TYPOGRAPHY.fontWeight.medium,
                color: item.destructive ? COLORS.error[600] : COLORS.neutral[900]
              }}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.sm, 
                  color: COLORS.neutral[600],
                  marginTop: 2 
                }}>
                  {item.description}
                </Text>
              )}
            </View>
            <Switch
              checked={item.value || false}
              onCheckedChange={item.onToggle}
              disabled={item.disabled || isLoading}
            />
          </View>
        ) : (
          <Button
            variant="ghost"
            style={[baseStyle, { justifyContent: 'flex-start' }]}
            onPress={item.onPress}
            disabled={item.disabled || isLoading}
          >
            <View style={contentStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.base, 
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                  color: item.destructive ? COLORS.error[600] : COLORS.neutral[900]
                }}>
                  {item.title}
                </Text>
                {item.badge && (
                  <Badge variant={item.badge === 'Premium' ? 'default' : 'secondary'}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                      {item.badge}
                    </Text>
                  </Badge>
                )}
              </View>
              {item.description && (
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.sm, 
                  color: COLORS.neutral[600],
                  marginTop: 2 
                }}>
                  {item.description}
                </Text>
              )}
            </View>
            {item.icon}
          </Button>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('settings-panel', className)}
      testID={testID}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: SPACING.screen }}>
        {/* Profile Header */}
        {showProfileHeader && (
          <Card style={{ marginBottom: SPACING.section }}>
            <CardContent style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                <Avatar style={{ width: 60, height: 60 }}>
                  <AvatarImage source={{ uri: user.avatar }} />
                  <AvatarFallback>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {getUserInitials()}
                    </Text>
                  </AvatarFallback>
                </Avatar>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: TYPOGRAPHY.fontSize.lg, 
                    fontWeight: TYPOGRAPHY.fontWeight.semibold 
                  }}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={{ 
                    fontSize: TYPOGRAPHY.fontSize.sm, 
                    color: COLORS.neutral[600] 
                  }}>
                    {user.email}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs }}>
                    {user.isVerified && (
                      <Badge variant="default">
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.white }}>
                          Verified
                        </Text>
                      </Badge>
                    )}
                    {user.role !== 'user' && (
                      <Badge variant="secondary">
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                          {user.role.toUpperCase()}
                        </Text>
                      </Badge>
                    )}
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Card key={section.title} style={{ marginBottom: SPACING.section }}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <Separator style={{ marginLeft: SPACING.md }} />
                  )}
                </View>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Dangerous Actions */}
        {dangerousActions && (
          <Card style={{ marginBottom: SPACING.section, borderColor: COLORS.error[200] }}>
            <CardHeader>
              <CardTitle style={{ color: COLORS.error[600] }}>
                {dangerousActions.title}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              {dangerousActions.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < dangerousActions.items.length - 1 && (
                    <Separator style={{ marginLeft: SPACING.md }} />
                  )}
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Logout Button */}
        {onActions.logout && (
          <Button
            variant="outline"
            onPress={onActions.logout}
            disabled={isLoading}
            style={{ marginTop: SPACING.lg }}
          >
            <Text>Sign Out</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default SettingsPanel;
