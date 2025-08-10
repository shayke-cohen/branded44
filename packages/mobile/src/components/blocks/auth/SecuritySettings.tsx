/**
 * SecuritySettings - Password, 2FA, and Privacy Controls Block Component
 * 
 * A comprehensive security settings interface with password management,
 * two-factor authentication, and privacy controls. Optimized for AI agents.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Switch } from '../../../../~/components/ui/switch';
import { Badge } from '../../../../~/components/ui/badge';
import { Separator } from '../../../../~/components/ui/separator';
import { Text } from '../../../../~/components/ui/text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../~/components/ui/select';
import { cn, validatePassword, formatDate } from '../../../lib/utils';
import { User, LoadingState, FormErrors } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { ChevronRight, Shield, Key, Eye, EyeOff } from 'lucide-react-native';

/**
 * Props interface for SecuritySettings component
 */
export interface SecuritySettingsProps {
  /**
   * Current user data
   */
  user: User;
  
  /**
   * Security settings data
   */
  securitySettings?: {
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
    connectedDevices: ConnectedDevice[];
    loginHistory: LoginActivity[];
    recoveryMethods: RecoveryMethod[];
  };
  
  /**
   * Callback when password is changed
   */
  onPasswordChange?: (currentPassword: string, newPassword: string) => Promise<void>;
  
  /**
   * Callback when 2FA is toggled
   */
  onTwoFactorToggle?: (enabled: boolean) => Promise<void>;
  
  /**
   * Callback when device is removed
   */
  onRemoveDevice?: (deviceId: string) => Promise<void>;
  
  /**
   * Callback for privacy setting changes
   */
  onPrivacySettingChange?: (setting: string, value: any) => Promise<void>;
  
  /**
   * Navigation callbacks
   */
  onNavigate?: {
    setupTwoFactor?: () => void;
    recoveryMethods?: () => void;
    loginHistory?: () => void;
    connectedDevices?: () => void;
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
}

/**
 * Connected device interface
 */
interface ConnectedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet' | 'browser';
  lastActive: string;
  location?: string;
  isCurrent: boolean;
}

/**
 * Login activity interface
 */
interface LoginActivity {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  ipAddress: string;
  success: boolean;
}

/**
 * Recovery method interface
 */
interface RecoveryMethod {
  id: string;
  type: 'email' | 'phone' | 'backup_codes';
  value: string;
  verified: boolean;
  isPrimary: boolean;
}

/**
 * SecuritySettings Component
 * 
 * Provides comprehensive security management with:
 * - Password change functionality
 * - Two-factor authentication setup
 * - Connected devices management
 * - Privacy controls
 * - Security activity monitoring
 * 
 * @example
 * ```tsx
 * <SecuritySettings
 *   user={currentUser}
 *   securitySettings={userSecuritySettings}
 *   onPasswordChange={handlePasswordChange}
 *   onTwoFactorToggle={handleTwoFactorToggle}
 *   onNavigate={{
 *     setupTwoFactor: () => navigation.navigate('TwoFactorSetup'),
 *   }}
 * />
 * ```
 */
export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  user,
  securitySettings = {
    twoFactorEnabled: false,
    connectedDevices: [],
    loginHistory: [],
    recoveryMethods: [],
  },
  onPasswordChange,
  onTwoFactorToggle,
  onRemoveDevice,
  onPrivacySettingChange,
  onNavigate = {},
  loading = 'idle',
  style,
  className,
  testID = 'security-settings',
}) => {
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user.preferences?.privacy?.profileVisibility || 'public',
    searchable: user.preferences?.privacy?.searchable || true,
    showOnlineStatus: user.preferences?.privacy?.showOnlineStatus || true,
    allowMessagesFromStrangers: user.preferences?.privacy?.allowMessagesFromStrangers || false,
    showEmail: user.preferences?.privacy?.showEmail || false,
    showPhone: user.preferences?.privacy?.showPhone || false,
  });

  const [updatingPrivacy, setUpdatingPrivacy] = useState<string | null>(null);

  const isLoading = loading === 'loading';

  /**
   * Validates password change form
   */
  const validatePasswordForm = (): boolean => {
    const errors: FormErrors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(passwordForm.newPassword);
      if (!validation.isValid) {
        errors.newPassword = validation.feedback[0];
      }
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles password change submission
   */
  const handlePasswordChange = async () => {
    if (!validatePasswordForm() || !onPasswordChange) return;

    setChangingPassword(true);
    try {
      await onPasswordChange(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Your password has been changed successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please check your current password and try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  /**
   * Handles two-factor authentication toggle
   */
  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (!onTwoFactorToggle) return;

    try {
      if (enabled && !securitySettings.twoFactorEnabled) {
        // Navigate to setup flow
        if (onNavigate.setupTwoFactor) {
          onNavigate.setupTwoFactor();
        }
      } else {
        await onTwoFactorToggle(enabled);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update two-factor authentication settings.');
    }
  };

  /**
   * Handles privacy setting changes
   */
  const handlePrivacySettingChange = async (setting: string, value: any) => {
    if (!onPrivacySettingChange) return;

    setUpdatingPrivacy(setting);
    try {
      await onPrivacySettingChange(setting, value);
      setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy setting.');
    } finally {
      setUpdatingPrivacy(null);
    }
  };

  /**
   * Handles device removal with confirmation
   */
  const handleRemoveDevice = (device: ConnectedDevice) => {
    if (!onRemoveDevice || device.isCurrent) return;

    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove "${device.name}"? This will sign out this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemoveDevice(device.id),
        },
      ]
    );
  };

  /**
   * Gets device type icon
   */
  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📱';
      case 'desktop':
        return '🖥️';
      case 'browser':
        return '🌐';
      default:
        return '📱';
    }
  };

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('security-settings', className)}
      testID={testID}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: SPACING.screen }}>
        {/* Security Overview */}
        <Card style={{ marginBottom: SPACING.section }}>
          <CardHeader>
            <CardTitle style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Shield size={20} color={COLORS.primary[600]} />
              <Text>Security Overview</Text>
            </CardTitle>
          </CardHeader>
          <CardContent style={{ gap: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  Two-Factor Authentication
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  Add an extra layer of security to your account
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: SPACING.xs }}>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                  disabled={isLoading}
                />
                {securitySettings.twoFactorEnabled && (
                  <Badge variant="default">
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.white }}>
                      Enabled
                    </Text>
                  </Badge>
                )}
              </View>
            </View>

            <Separator />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  Password
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  {securitySettings.lastPasswordChange 
                    ? `Last changed ${formatDate(securitySettings.lastPasswordChange, 'relative')}`
                    : 'Never changed'
                  }
                </Text>
              </View>
              <Key size={20} color={COLORS.neutral[400]} />
            </View>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card style={{ marginBottom: SPACING.section }}>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: SPACING.formField }}>
            {/* Current Password */}
            <View>
              <Label nativeID="currentPassword">Current Password</Label>
              <View style={{ position: 'relative' }}>
                <Input
                  aria-labelledby="currentPassword"
                  value={passwordForm.currentPassword}
                  onChangeText={(value) => {
                    setPasswordForm(prev => ({ ...prev, currentPassword: value }));
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
                    }
                  }}
                  placeholder="Enter current password"
                  secureTextEntry={!showPasswords.current}
                  style={passwordErrors.currentPassword ? { borderColor: COLORS.error[500] } : {}}
                  editable={!changingPassword && !isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ 
                    position: 'absolute', 
                    right: 4, 
                    top: 4,
                    width: 32,
                    height: 32,
                  }}
                  onPress={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? (
                    <EyeOff size={16} color={COLORS.neutral[500]} />
                  ) : (
                    <Eye size={16} color={COLORS.neutral[500]} />
                  )}
                </Button>
              </View>
              {passwordErrors.currentPassword && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {passwordErrors.currentPassword}
                </Text>
              )}
            </View>

            {/* New Password */}
            <View>
              <Label nativeID="newPassword">New Password</Label>
              <View style={{ position: 'relative' }}>
                <Input
                  aria-labelledby="newPassword"
                  value={passwordForm.newPassword}
                  onChangeText={(value) => {
                    setPasswordForm(prev => ({ ...prev, newPassword: value }));
                    if (passwordErrors.newPassword) {
                      setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  placeholder="Enter new password"
                  secureTextEntry={!showPasswords.new}
                  style={passwordErrors.newPassword ? { borderColor: COLORS.error[500] } : {}}
                  editable={!changingPassword && !isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ 
                    position: 'absolute', 
                    right: 4, 
                    top: 4,
                    width: 32,
                    height: 32,
                  }}
                  onPress={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? (
                    <EyeOff size={16} color={COLORS.neutral[500]} />
                  ) : (
                    <Eye size={16} color={COLORS.neutral[500]} />
                  )}
                </Button>
              </View>
              {passwordErrors.newPassword && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {passwordErrors.newPassword}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Label nativeID="confirmPassword">Confirm New Password</Label>
              <View style={{ position: 'relative' }}>
                <Input
                  aria-labelledby="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChangeText={(value) => {
                    setPasswordForm(prev => ({ ...prev, confirmPassword: value }));
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  placeholder="Confirm new password"
                  secureTextEntry={!showPasswords.confirm}
                  style={passwordErrors.confirmPassword ? { borderColor: COLORS.error[500] } : {}}
                  editable={!changingPassword && !isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ 
                    position: 'absolute', 
                    right: 4, 
                    top: 4,
                    width: 32,
                    height: 32,
                  }}
                  onPress={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={16} color={COLORS.neutral[500]} />
                  ) : (
                    <Eye size={16} color={COLORS.neutral[500]} />
                  )}
                </Button>
              </View>
              {passwordErrors.confirmPassword && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {passwordErrors.confirmPassword}
                </Text>
              )}
            </View>

            <Button
              onPress={handlePasswordChange}
              disabled={changingPassword || isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              <Text>{changingPassword ? 'Changing Password...' : 'Change Password'}</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card style={{ marginBottom: SPACING.section }}>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: SPACING.md }}>
            {/* Profile Visibility */}
            <View>
              <Label nativeID="profileVisibility">Profile Visibility</Label>
              <Select
                value={privacySettings.profileVisibility}
                onValueChange={(value) => handlePrivacySettingChange('profileVisibility', value)}
                disabled={updatingPrivacy === 'profileVisibility' || isLoading}
              >
                <SelectTrigger aria-labelledby="profileVisibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem label="Public" value="public" />
                  <SelectItem label="Friends Only" value="friends" />
                  <SelectItem label="Private" value="private" />
                </SelectContent>
              </Select>
            </View>

            <Separator />

            {/* Privacy Toggles */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  Profile Searchable
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  Allow others to find your profile
                </Text>
              </View>
              <Switch
                checked={privacySettings.searchable}
                onCheckedChange={(value) => handlePrivacySettingChange('searchable', value)}
                disabled={updatingPrivacy === 'searchable' || isLoading}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  Show Online Status
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  Let others see when you're active
                </Text>
              </View>
              <Switch
                checked={privacySettings.showOnlineStatus}
                onCheckedChange={(value) => handlePrivacySettingChange('showOnlineStatus', value)}
                disabled={updatingPrivacy === 'showOnlineStatus' || isLoading}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  Messages from Strangers
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  Allow messages from people you don't follow
                </Text>
              </View>
              <Switch
                checked={privacySettings.allowMessagesFromStrangers}
                onCheckedChange={(value) => handlePrivacySettingChange('allowMessagesFromStrangers', value)}
                disabled={updatingPrivacy === 'allowMessagesFromStrangers' || isLoading}
              />
            </View>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        {securitySettings.connectedDevices.length > 0 && (
          <Card style={{ marginBottom: SPACING.section }}>
            <CardHeader>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle>Connected Devices</CardTitle>
                {onNavigate.connectedDevices && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={onNavigate.connectedDevices}
                  >
                    <Text style={{ color: COLORS.primary[600] }}>View All</Text>
                    <ChevronRight size={16} color={COLORS.primary[600]} />
                  </Button>
                )}
              </View>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              {securitySettings.connectedDevices.slice(0, 3).map((device, index) => (
                <View key={device.id}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    padding: SPACING.md,
                    gap: SPACING.md 
                  }}>
                    <Text style={{ fontSize: 24 }}>{getDeviceIcon(device.type)}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                          {device.name}
                        </Text>
                        {device.isCurrent && (
                          <Badge variant="default">
                            <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.white }}>
                              Current
                            </Text>
                          </Badge>
                        )}
                      </View>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                        {formatDate(device.lastActive, 'relative')}
                        {device.location && ` • ${device.location}`}
                      </Text>
                    </View>
                    {!device.isCurrent && onRemoveDevice && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleRemoveDevice(device)}
                        disabled={isLoading}
                      >
                        <Text style={{ color: COLORS.error[600] }}>Remove</Text>
                      </Button>
                    )}
                  </View>
                  {index < securitySettings.connectedDevices.slice(0, 3).length - 1 && <Separator />}
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Security Actions</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: SPACING.md }}>
            {onNavigate.recoveryMethods && (
              <Button
                variant="outline"
                onPress={onNavigate.recoveryMethods}
                style={{ justifyContent: 'space-between' }}
              >
                <Text>Recovery Methods</Text>
                <ChevronRight size={20} color={COLORS.neutral[400]} />
              </Button>
            )}
            
            {onNavigate.loginHistory && (
              <Button
                variant="outline"
                onPress={onNavigate.loginHistory}
                style={{ justifyContent: 'space-between' }}
              >
                <Text>Login History</Text>
                <ChevronRight size={20} color={COLORS.neutral[400]} />
              </Button>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export default SecuritySettings;
