/**
 * CreateProfileScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive profile creation screen template that combines the ProfileEditForm block
 * with onboarding flow, image upload, and step-by-step guidance.
 * 
 * Features:
 * - ProfileEditForm integration with validation
 * - Profile image upload with camera/gallery options
 * - Multi-step profile creation flow
 * - Skip options for optional fields
 * - Progress indicator
 * - Loading states for profile creation
 * - Error handling and validation
 * - Keyboard avoiding behavior
 * - SafeAreaView integration
 * - Accessibility support
 * - Welcome message and guidance
 * 
 * @example
 * ```tsx
 * <CreateProfileScreen
 *   onCreateProfile={(data) => handleProfileCreation(data)}
 *   onSkip={() => navigation.navigate('Dashboard')}
 *   onBack={() => navigation.goBack()}
 *   loading={profileLoading}
 *   error={profileError}
 *   isOnboarding={true}
 *   step={1}
 *   totalSteps={3}
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
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image 
} from 'react-native';
import { ProfileEditForm } from '../../blocks/auth';
import type { ProfileEditFormProps } from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Button } from '../../../../~/components/ui/button';
import { Progress } from '../../../../~/components/ui/progress';
import { Avatar } from '../../../../~/components/ui/avatar';
import { ChevronDown } from '../../../../~/lib/icons/ChevronDown';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps, UserProfile } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Profile creation data
 */
export interface ProfileCreationData extends UserProfile {
  /** Profile completion step */
  step?: number;
  /** Skip optional fields */
  skipOptional?: boolean;
}

/**
 * Create profile screen configuration
 */
export interface CreateProfileScreenConfig {
  /** Screen title */
  title?: string;
  /** Screen subtitle */
  subtitle?: string;
  /** Welcome message */
  welcomeMessage?: string;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Show skip option */
  showSkip?: boolean;
  /** Show back button */
  showBackButton?: boolean;
  /** Required fields */
  requiredFields?: string[];
  /** Optional fields */
  optionalFields?: string[];
  /** Step-by-step mode */
  isStepByStep?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the CreateProfileScreen template
 */
export interface CreateProfileScreenProps extends BaseComponentProps {
  /** Callback when profile is created */
  onCreateProfile: (data: ProfileCreationData) => Promise<void> | void;
  /** Callback when skip is pressed */
  onSkip?: () => void;
  /** Callback when back button is pressed */
  onBack?: () => void;
  /** Callback when next step is requested */
  onNext?: (data: Partial<ProfileCreationData>) => void;
  /** Loading state for profile creation */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Current step in onboarding */
  step?: number;
  /** Total number of steps */
  totalSteps?: number;
  /** Is part of onboarding flow */
  isOnboarding?: boolean;
  /** Initial profile data */
  initialData?: Partial<UserProfile>;
  /** Configuration for the create profile screen */
  config?: CreateProfileScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CreateProfileScreen - AI-optimized profile creation screen template
 * 
 * A comprehensive profile creation screen that guides users through
 * setting up their profile with proper validation and user experience.
 */
const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({
  onCreateProfile,
  onSkip,
  onBack,
  onNext,
  loading = false,
  error,
  step = 1,
  totalSteps = 1,
  isOnboarding = false,
  initialData,
  config = {},
  style,
  testID = 'create-profile-screen',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    initialData?.avatar || null
  );

  const {
    title = isOnboarding ? 'Set Up Your Profile' : 'Create Profile',
    subtitle = 'Tell us a bit about yourself',
    welcomeMessage = isOnboarding ? 'Welcome! Let\'s personalize your experience.' : undefined,
    showProgress = isOnboarding && totalSteps > 1,
    showSkip = isOnboarding,
    showBackButton = !isOnboarding,
    requiredFields = ['firstName', 'lastName'],
    optionalFields = ['bio', 'location', 'website'],
    isStepByStep = totalSteps > 1,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleCreateProfile = useCallback(async (profileData: UserProfile) => {
    try {
      setLocalError(null);
      setLocalLoading(true);
      
      const creationData: ProfileCreationData = {
        ...profileData,
        avatar: profileImage || profileData.avatar,
        step,
      };
      
      await onCreateProfile(creationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile creation failed';
      setLocalError(errorMessage);
      Alert.alert('Profile Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onCreateProfile, profileImage, step]);

  const handleNext = useCallback(async (profileData: Partial<UserProfile>) => {
    if (onNext) {
      const stepData: Partial<ProfileCreationData> = {
        ...profileData,
        avatar: profileImage || profileData.avatar,
        step,
      };
      onNext(stepData);
    }
  }, [onNext, profileImage, step]);

  const handleProfileError = useCallback((errorMessage: string) => {
    setLocalError(errorMessage);
  }, []);

  const handleImageUpload = useCallback(() => {
    // This would typically open image picker
    // For now, just show alert with options
    Alert.alert(
      'Profile Photo',
      'Choose how you\'d like to add your profile photo',
      [
        { text: 'Camera', onPress: () => {/* Handle camera */ } },
        { text: 'Photo Library', onPress: () => {/* Handle gallery */ } },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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
        {showBackButton && onBack && (
          <TouchableOpacity 
            onPress={onBack}
            style={styles.backButton}
            testID={`${testID}-back-button`}
          >
            <ChevronDown style={styles.backIcon} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {showProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Step {step} of {totalSteps}</Text>
            <Progress 
              value={(step / totalSteps) * 100} 
              style={styles.progressBar}
              testID={`${testID}-progress`}
            />
          </View>
        )}

        {welcomeMessage && (
          <Text style={styles.welcomeMessage}>{welcomeMessage}</Text>
        )}
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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

  const renderProfileImage = () => {
    return (
      <View style={styles.imageContainer} testID={`${testID}-profile-image`}>
        <TouchableOpacity 
          onPress={handleImageUpload}
          style={styles.imageButton}
          testID={`${testID}-image-button`}
        >
          <Avatar style={styles.avatar} size="xl">
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {(initialData?.firstName?.[0] || '?').toUpperCase()}
              </Text>
            )}
          </Avatar>
          <View style={styles.imageOverlay}>
            <Text style={styles.imageOverlayText}>
              {profileImage ? 'Change Photo' : 'Add Photo'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSkipOption = () => {
    if (!showSkip || !onSkip) return null;

    return (
      <View style={styles.skipContainer} testID={`${testID}-skip`}>
        <TouchableOpacity 
          onPress={onSkip}
          style={styles.skipButton}
          disabled={loading || localLoading}
          testID={`${testID}-skip-button`}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (footerComponent) {
      return footerComponent;
    }

    return renderSkipOption();
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const isLoading = loading || localLoading;
  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID={`${testID}-scroll`}
        >
          {/* Header */}
          {renderHeader()}

          {/* Error Display */}
          {renderError()}

          {/* Profile Image */}
          {renderProfileImage()}

          {/* Profile Form */}
          <Card style={styles.formCard} testID={`${testID}-form-card`}>
            <ProfileEditForm
              onSave={isStepByStep && onNext ? handleNext : handleCreateProfile}
              onError={handleProfileError}
              initialData={initialData}
              loading={isLoading}
              saveButtonText={isStepByStep && onNext ? 'Next' : 'Create Profile'}
              showCancelButton={false}
              requiredFields={requiredFields}
              style={styles.profileForm}
              testID={`${testID}-profile-form`}
            />
          </Card>

          {/* Footer */}
          <View style={styles.footerContainer}>
            {renderFooter()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  headerContainer: {
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backIcon: {
    width: 20,
    height: 20,
    color: COLORS.textSecondary,
    transform: [{ rotate: '90deg' }],
    marginRight: SPACING.xs,
  },
  backText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 4,
  },
  welcomeMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  errorAlert: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  imageButton: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryForeground,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    alignItems: 'center',
  },
  imageOverlayText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  profileForm: {
    padding: SPACING.lg,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default CreateProfileScreen;
export type { 
  CreateProfileScreenProps, 
  CreateProfileScreenConfig, 
  ProfileCreationData 
};
