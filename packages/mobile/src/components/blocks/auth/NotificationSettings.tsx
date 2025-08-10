/**
 * NotificationSettings - Push Notification Preferences Block Component
 * 
 * A comprehensive notification settings interface with granular controls
 * for different types of notifications. Optimized for AI agents.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Switch } from '../../../../~/components/ui/switch';
import { Badge } from '../../../../~/components/ui/badge';
import { Separator } from '../../../../~/components/ui/separator';
import { Text } from '../../../../~/components/ui/text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../~/components/ui/select';
import { cn } from '../../../lib/utils';
import { NotificationPreferences, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Bell, Mail, MessageSquare, Heart, Users } from 'lucide-react-native';

/**
 * Props interface for NotificationSettings component
 */
export interface NotificationSettingsProps {
  /**
   * Current notification preferences
   */
  preferences: NotificationPreferences;
  
  /**
   * Callback when preferences are updated
   */
  onPreferencesUpdate: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  
  /**
   * Callback to test notification delivery
   */
  onTestNotification?: (type: 'push' | 'email' | 'sms') => Promise<void>;
  
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
   * Whether to show advanced options
   */
  showAdvancedOptions?: boolean;
}

/**
 * Notification setting configuration interface
 */
interface NotificationSetting {
  id: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'delivery' | 'social' | 'security' | 'marketing';
  testable?: boolean;
}

/**
 * NotificationSettings Component
 * 
 * Provides comprehensive notification preference management with:
 * - Delivery method toggles (push, email, SMS)
 * - Social interaction notifications
 * - Security alerts
 * - Marketing communications
 * - Test notification functionality
 * 
 * @example
 * ```tsx
 * <NotificationSettings
 *   preferences={userNotificationPreferences}
 *   onPreferencesUpdate={handlePreferencesUpdate}
 *   onTestNotification={handleTestNotification}
 *   showAdvancedOptions={true}
 * />
 * ```
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  onPreferencesUpdate,
  onTestNotification,
  loading = 'idle',
  style,
  className,
  testID = 'notification-settings',
  showAdvancedOptions = false,
}) => {
  const [updatingPreference, setUpdatingPreference] = useState<string | null>(null);
  const [testingNotification, setTestingNotification] = useState<string | null>(null);

  const isLoading = loading === 'loading';

  /**
   * Handles preference toggle updates
   */
  const handlePreferenceToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    setUpdatingPreference(key);
    
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      await onPreferencesUpdate(updatedPreferences);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preference. Please try again.');
    } finally {
      setUpdatingPreference(null);
    }
  };

  /**
   * Handles test notification
   */
  const handleTestNotification = async (type: 'push' | 'email' | 'sms') => {
    if (!onTestNotification) return;

    setTestingNotification(type);
    try {
      await onTestNotification(type);
      Alert.alert('Test Sent', `A test ${type} notification has been sent.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification. Please try again.');
    } finally {
      setTestingNotification(null);
    }
  };

  /**
   * Configuration for all notification settings
   */
  const notificationSettings: NotificationSetting[] = [
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      icon: <Bell size={20} color={COLORS.primary[600]} />,
      category: 'delivery',
      testable: true,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Mail size={20} color={COLORS.primary[600]} />,
      category: 'delivery',
      testable: true,
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Receive important notifications via text message',
      icon: <MessageSquare size={20} color={COLORS.primary[600]} />,
      category: 'delivery',
      testable: true,
    },
    {
      id: 'marketing',
      title: 'Marketing Communications',
      description: 'Receive promotional content and product updates',
      icon: <Mail size={20} color={COLORS.warning[600]} />,
      category: 'marketing',
    },
    {
      id: 'security',
      title: 'Security Alerts',
      description: 'Important security-related notifications',
      icon: <Bell size={20} color={COLORS.error[600]} />,
      category: 'security',
    },
    {
      id: 'mentions',
      title: 'Mentions',
      description: 'When someone mentions you in a post or comment',
      icon: <MessageSquare size={20} color={COLORS.info[600]} />,
      category: 'social',
    },
    {
      id: 'comments',
      title: 'Comments',
      description: 'When someone comments on your posts',
      icon: <MessageSquare size={20} color={COLORS.info[600]} />,
      category: 'social',
    },
    {
      id: 'likes',
      title: 'Likes & Reactions',
      description: 'When someone likes or reacts to your content',
      icon: <Heart size={20} color={COLORS.error[500]} />,
      category: 'social',
    },
    {
      id: 'follows',
      title: 'New Followers',
      description: 'When someone starts following you',
      icon: <Users size={20} color={COLORS.success[600]} />,
      category: 'social',
    },
  ];

  /**
   * Groups settings by category
   */
  const groupedSettings = notificationSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  /**
   * Category display configuration
   */
  const categoryConfig = {
    delivery: { title: 'Delivery Methods', description: 'How you receive notifications' },
    security: { title: 'Security & Important', description: 'Critical account notifications' },
    social: { title: 'Social Interactions', description: 'Activity from other users' },
    marketing: { title: 'Marketing & Updates', description: 'Promotional content' },
  };

  /**
   * Renders a notification setting item
   */
  const renderNotificationSetting = (setting: NotificationSetting) => {
    const isUpdating = updatingPreference === setting.id;
    const isTesting = testingNotification === setting.id;
    const value = preferences[setting.id];

    return (
      <View key={setting.id}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.md,
          gap: SPACING.md,
        }}>
          {setting.icon}
          
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Text style={{ 
                fontSize: TYPOGRAPHY.fontSize.base, 
                fontWeight: TYPOGRAPHY.fontWeight.medium 
              }}>
                {setting.title}
              </Text>
              {setting.category === 'security' && (
                <Badge variant="default">
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.white }}>
                    Required
                  </Text>
                </Badge>
              )}
            </View>
            <Text style={{ 
              fontSize: TYPOGRAPHY.fontSize.sm, 
              color: COLORS.neutral[600],
              marginTop: 2 
            }}>
              {setting.description}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: SPACING.xs }}>
            <Switch
              checked={value}
              onCheckedChange={(newValue) => handlePreferenceToggle(setting.id, newValue)}
              disabled={isUpdating || isLoading || (setting.category === 'security')}
            />
            
            {setting.testable && value && onTestNotification && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => handleTestNotification(setting.id as 'push' | 'email' | 'sms')}
                disabled={isTesting || isLoading}
                style={{ minHeight: 28, paddingHorizontal: SPACING.sm }}
              >
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  color: COLORS.primary[600] 
                }}>
                  {isTesting ? 'Testing...' : 'Test'}
                </Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    );
  };

  /**
   * Gets the total number of enabled notifications
   */
  const getEnabledCount = (): number => {
    return Object.values(preferences).filter(Boolean).length;
  };

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('notification-settings', className)}
      testID={testID}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: SPACING.screen }}>
        {/* Overview */}
        <Card style={{ marginBottom: SPACING.section }}>
          <CardHeader>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>Notification Preferences</CardTitle>
              <Badge variant="secondary">
                <Text>{getEnabledCount()} enabled</Text>
              </Badge>
            </View>
          </CardHeader>
          <CardContent>
            <Text style={{ 
              fontSize: TYPOGRAPHY.fontSize.sm, 
              color: COLORS.neutral[600],
              lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm
            }}>
              Customize how and when you receive notifications. You can always change these settings later.
            </Text>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        {Object.entries(categoryConfig).map(([category, config]) => {
          const settings = groupedSettings[category];
          if (!settings || settings.length === 0) return null;

          return (
            <Card key={category} style={{ marginBottom: SPACING.section }}>
              <CardHeader>
                <CardTitle>{config.title}</CardTitle>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.sm, 
                  color: COLORS.neutral[600] 
                }}>
                  {config.description}
                </Text>
              </CardHeader>
              <CardContent style={{ padding: 0 }}>
                {settings.map((setting, index) => (
                  <View key={setting.id}>
                    {renderNotificationSetting(setting)}
                    {index < settings.length - 1 && <Separator style={{ marginLeft: 52 }} />}
                  </View>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <Card style={{ marginBottom: SPACING.section }}>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent style={{ gap: SPACING.md }}>
              <View>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.base, 
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                  marginBottom: SPACING.sm
                }}>
                  Notification Frequency
                </Text>
                <Select
                  value="immediate"
                  onValueChange={() => {}}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem label="Immediate" value="immediate" />
                    <SelectItem label="Hourly Digest" value="hourly" />
                    <SelectItem label="Daily Digest" value="daily" />
                    <SelectItem label="Weekly Digest" value="weekly" />
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.base, 
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                  marginBottom: SPACING.sm
                }}>
                  Quiet Hours
                </Text>
                <View style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'center' }}>
                  <Select
                    value="22:00"
                    onValueChange={() => {}}
                    disabled={isLoading}
                  >
                    <SelectTrigger style={{ flex: 1 }}>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem label="9:00 PM" value="21:00" />
                      <SelectItem label="10:00 PM" value="22:00" />
                      <SelectItem label="11:00 PM" value="23:00" />
                    </SelectContent>
                  </Select>
                  
                  <Text style={{ color: COLORS.neutral[600] }}>to</Text>
                  
                  <Select
                    value="08:00"
                    onValueChange={() => {}}
                    disabled={isLoading}
                  >
                    <SelectTrigger style={{ flex: 1 }}>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem label="7:00 AM" value="07:00" />
                      <SelectItem label="8:00 AM" value="08:00" />
                      <SelectItem label="9:00 AM" value="09:00" />
                    </SelectContent>
                  </Select>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: SPACING.md }}>
            <Button
              variant="outline"
              onPress={() => {
                const allDisabled = { ...preferences };
                Object.keys(allDisabled).forEach(key => {
                  if (key !== 'security') {
                    allDisabled[key as keyof NotificationPreferences] = false;
                  }
                });
                onPreferencesUpdate(allDisabled);
              }}
              disabled={isLoading}
            >
              <Text>Disable All (except Security)</Text>
            </Button>
            
            <Button
              variant="outline"
              onPress={() => {
                const allEnabled = { ...preferences };
                Object.keys(allEnabled).forEach(key => {
                  allEnabled[key as keyof NotificationPreferences] = true;
                });
                onPreferencesUpdate(allEnabled);
              }}
              disabled={isLoading}
            >
              <Text>Enable All</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export default NotificationSettings;
