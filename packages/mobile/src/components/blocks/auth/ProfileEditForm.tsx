/**
 * ProfileEditForm - Comprehensive Profile Editing Block Component
 * 
 * A complete form for editing user profile information including personal details,
 * avatar upload, and account preferences. Optimized for AI agent code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Image } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { SimpleSelect } from '../../../../~/components/ui/simple-select';
import { Switch } from '../../../../~/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../~/components/ui/avatar';
import { Badge } from '../../../../~/components/ui/badge';
import { Separator } from '../../../../~/components/ui/separator';
import { Text } from '../../../../~/components/ui/text';
import { cn, validateEmail, validatePhone, formatDate } from '../../../lib/utils';
import { User, UserPreferences, FormErrors, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';

/**
 * Props interface for ProfileEditForm component
 */
export interface ProfileEditFormProps {
  /**
   * Current user data to populate the form
   */
  user: User;
  
  /**
   * Callback when form is submitted successfully
   * @param userData - Updated user data
   */
  onSave: (userData: Partial<User>) => Promise<void>;
  
  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;
  
  /**
   * Current loading state of the form
   */
  loading?: LoadingState;
  
  /**
   * Whether the form is read-only
   */
  readOnly?: boolean;
  
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
   * Whether to show the avatar upload section
   */
  showAvatarUpload?: boolean;
  
  /**
   * Whether to show the preferences section
   */
  showPreferences?: boolean;
  
  /**
   * Callback for avatar image selection
   */
  onAvatarSelect?: () => Promise<string>;
}

/**
 * Form data interface for profile editing
 */
interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatar: string;
  preferences: UserPreferences;
}

/**
 * ProfileEditForm Component
 * 
 * Provides a comprehensive form for editing user profile information with:
 * - Personal information fields
 * - Avatar upload capability
 * - User preferences and settings
 * - Form validation and error handling
 * - Loading states
 * 
 * @example
 * ```tsx
 * <ProfileEditForm
 *   user={currentUser}
 *   onSave={handleSaveProfile}
 *   onCancel={handleCancel}
 *   loading="idle"
 *   showAvatarUpload={true}
 *   showPreferences={true}
 * />
 * ```
 */
export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSave,
  onCancel,
  loading = 'idle',
  readOnly = false,
  style,
  className,
  testID = 'profile-edit-form',
  showAvatarUpload = true,
  showPreferences = true,
  onAvatarSelect,
}) => {
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    avatar: user.avatar || '',
    preferences: user.preferences || {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        security: true,
        mentions: true,
        comments: true,
        likes: true,
        follows: true,
      },
      privacy: {
        profileVisibility: 'public',
        searchable: true,
        showOnlineStatus: true,
        allowMessagesFromStrangers: false,
        showEmail: false,
        showPhone: false,
      },
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const hasChanged = 
      formData.firstName !== (user.firstName || '') ||
      formData.lastName !== (user.lastName || '') ||
      formData.username !== (user.username || '') ||
      formData.email !== (user.email || '') ||
      formData.phone !== (user.phone || '') ||
      formData.dateOfBirth !== (user.dateOfBirth || '') ||
      formData.avatar !== (user.avatar || '');
    
    setHasChanges(hasChanged);
  }, [formData, user]);

  /**
   * Updates form field value and clears related errors
   */
  const updateField = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Updates nested preference field
   */
  const updatePreference = (section: keyof UserPreferences, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: typeof prev.preferences[section] === 'object' 
          ? { ...prev.preferences[section], [field]: value }
          : value
      }
    }));
  };

  /**
   * Validates the form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    if (!validateForm() || readOnly) return;

    try {
      const updatedUser: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        avatar: formData.avatar || undefined,
        preferences: formData.preferences,
      };

      await onSave(updatedUser);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  /**
   * Handles avatar selection
   */
  const handleAvatarSelect = async () => {
    if (!onAvatarSelect || readOnly) return;

    try {
      const avatarUrl = await onAvatarSelect();
      if (avatarUrl) {
        updateField('avatar', avatarUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    }
  };

  /**
   * Gets user initials for avatar fallback
   */
  const getUserInitials = (): string => {
    const first = formData.firstName.charAt(0).toUpperCase();
    const last = formData.lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  const isLoading = loading === 'loading';

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('profile-edit-form', className)}
      testID={testID}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: SPACING.screen }}>
        {/* Avatar Section */}
        {showAvatarUpload && (
          <Card style={{ marginBottom: SPACING.section }}>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent style={{ alignItems: 'center' }}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
                <Avatar style={{ width: 100, height: 100, marginBottom: SPACING.md }}>
                  <AvatarImage source={{ uri: formData.avatar }} />
                  <AvatarFallback>
                    <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
                      {getUserInitials()}
                    </Text>
                  </AvatarFallback>
                </Avatar>
                
                {!readOnly && (
                  <Button
                    variant="outline"
                    onPress={handleAvatarSelect}
                    disabled={isLoading}
                  >
                    <Text>Change Photo</Text>
                  </Button>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card style={{ marginBottom: SPACING.section }}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: SPACING.formField }}>
            {/* Name Fields */}
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <View style={{ flex: 1 }}>
                <Label nativeID="firstName">First Name *</Label>
                <Input
                  aria-labelledby="firstName"
                  value={formData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="Enter first name"
                  editable={!readOnly && !isLoading}
                  style={errors.firstName ? { borderColor: COLORS.error[500] } : {}}
                />
                {errors.firstName && (
                  <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                    {errors.firstName}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Label nativeID="lastName">Last Name *</Label>
                <Input
                  aria-labelledby="lastName"
                  value={formData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Enter last name"
                  editable={!readOnly && !isLoading}
                  style={errors.lastName ? { borderColor: COLORS.error[500] } : {}}
                />
                {errors.lastName && (
                  <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                    {errors.lastName}
                  </Text>
                )}
              </View>
            </View>

            {/* Username */}
            <View>
              <Label nativeID="username">Username *</Label>
              <Input
                aria-labelledby="username"
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="Enter username"
                editable={!readOnly && !isLoading}
                style={errors.username ? { borderColor: COLORS.error[500] } : {}}
                autoCapitalize="none"
              />
              {errors.username && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.username}
                </Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Label nativeID="email">Email Address *</Label>
              <Input
                aria-labelledby="email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="Enter email address"
                editable={!readOnly && !isLoading}
                style={errors.email ? { borderColor: COLORS.error[500] } : {}}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Phone */}
            <View>
              <Label nativeID="phone">Phone Number</Label>
              <Input
                aria-labelledby="phone"
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="Enter phone number"
                editable={!readOnly && !isLoading}
                style={errors.phone ? { borderColor: COLORS.error[500] } : {}}
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.phone}
                </Text>
              )}
            </View>

            {/* Date of Birth */}
            <View>
              <Label nativeID="dateOfBirth">Date of Birth</Label>
              <Input
                aria-labelledby="dateOfBirth"
                value={formData.dateOfBirth}
                onChangeText={(value) => updateField('dateOfBirth', value)}
                placeholder="YYYY-MM-DD"
                editable={!readOnly && !isLoading}
              />
            </View>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        {showPreferences && (
          <Card style={{ marginBottom: SPACING.section }}>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent style={{ gap: SPACING.formField }}>
              {/* Theme */}
              <View>
                <Label nativeID="theme">Theme</Label>
                <SimpleSelect
                  value={formData.preferences.theme}
                  onValueChange={(value) => updatePreference('theme', '', value)}
                  disabled={readOnly || isLoading}
                  placeholder="Select theme"
                  options={[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                    { label: 'System', value: 'system' },
                  ]}
                />
              </View>

              {/* Language */}
              <View>
                <Label nativeID="language">Language</Label>
                <SimpleSelect
                  value={formData.preferences.language}
                  onValueChange={(value) => updatePreference('language', '', value)}
                  disabled={readOnly || isLoading}
                  placeholder="Select language"
                  options={[
                    { label: 'English', value: 'en' },
                    { label: 'Spanish', value: 'es' },
                    { label: 'French', value: 'fr' },
                    { label: 'German', value: 'de' },
                  ]}
                />
              </View>

              <Separator />

              {/* Privacy Settings */}
              <View style={{ gap: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
                  Privacy Settings
                </Text>

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
                    checked={formData.preferences.privacy.searchable}
                    onCheckedChange={(value) => updatePreference('privacy', 'searchable', value)}
                    disabled={readOnly || isLoading}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                      Show Online Status
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                      Let others see when you're online
                    </Text>
                  </View>
                  <Switch
                    checked={formData.preferences.privacy.showOnlineStatus}
                    onCheckedChange={(value) => updatePreference('privacy', 'showOnlineStatus', value)}
                    disabled={readOnly || isLoading}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                      Allow Messages from Strangers
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                      Receive messages from people you don't follow
                    </Text>
                  </View>
                  <Switch
                    checked={formData.preferences.privacy.allowMessagesFromStrangers}
                    onCheckedChange={(value) => updatePreference('privacy', 'allowMessagesFromStrangers', value)}
                    disabled={readOnly || isLoading}
                  />
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!readOnly && (
          <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
            {onCancel && (
              <Button
                variant="outline"
                onPress={onCancel}
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                <Text>Cancel</Text>
              </Button>
            )}
            
            <Button
              onPress={handleSubmit}
              style={{ flex: 1 }}
              disabled={!hasChanges || isLoading}
            >
              <Text>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </View>
        )}

        {/* Account Status */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          marginTop: SPACING.lg,
          gap: SPACING.md 
        }}>
          {user.isVerified && (
            <Badge variant="default">
              <Text style={{ color: COLORS.white }}>Verified</Text>
            </Badge>
          )}
          {user.role && user.role !== 'user' && (
            <Badge variant="secondary">
              <Text>{user.role.toUpperCase()}</Text>
            </Badge>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileEditForm;
