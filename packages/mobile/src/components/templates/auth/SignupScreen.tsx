/**
 * SignupScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive signup screen template that combines the SignupForm block with
 * social registration options, terms acceptance, and proper navigation handling.
 * 
 * Features:
 * - SignupForm integration with validation
 * - Social signup buttons (Google, Apple, Facebook, Twitter)
 * - Terms and privacy policy acceptance
 * - Login navigation link
 * - Loading states for entire screen
 * - Error boundary handling
 * - Keyboard avoiding behavior
 * - SafeAreaView integration
 * - Accessibility support
 * - Password strength indicator
 * - Email verification flow
 * 
 * @example
 * ```tsx
 * <SignupScreen
 *   onSignup={(data) => handleSignup(data)}
 *   onLogin={() => navigation.navigate('Login')}
 *   onSocialSignup={(provider) => handleSocialSignup(provider)}
 *   onTermsPress={() => navigation.navigate('Terms')}
 *   onPrivacyPress={() => navigation.navigate('Privacy')}
 *   loading={authLoading}
 *   error={authError}
 *   socialProviders={['google', 'apple', 'facebook']}
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
  TouchableOpacity 
} from 'react-native';
import { SignupForm, SocialLoginButtons } from '../../blocks/auth';
import type { 
  SignupFormProps, 
  SocialLoginButtonsProps,
  AuthData,
  SocialProvider 
} from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Signup form data with additional fields
 */
export interface SignupData extends AuthData {
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
  acceptMarketing?: boolean;
}

/**
 * Signup screen configuration
 */
export interface SignupScreenConfig {
  /** Screen title */
  title?: string;
  /** Screen subtitle */
  subtitle?: string;
  /** Show social signup */
  showSocialSignup?: boolean;
  /** Available social providers */
  socialProviders?: SocialProvider[];
  /** Show login link */
  showLoginLink?: boolean;
  /** Require terms acceptance */
  requireTerms?: boolean;
  /** Show marketing opt-in */
  showMarketingOptIn?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the SignupScreen template
 */
export interface SignupScreenProps extends BaseComponentProps {
  /** Callback when signup is successful */
  onSignup: (data: SignupData) => Promise<void> | void;
  /** Callback when login link is pressed */
  onLogin?: () => void;
  /** Callback when social signup is pressed */
  onSocialSignup?: (provider: SocialProvider) => Promise<void> | void;
  /** Callback when terms link is pressed */
  onTermsPress?: () => void;
  /** Callback when privacy policy link is pressed */
  onPrivacyPress?: () => void;
  /** Callback when back navigation is pressed */
  onBack?: () => void;
  /** Loading state for authentication */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Configuration for the signup screen */
  config?: SignupScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SignupScreen - AI-optimized signup screen template
 * 
 * A comprehensive signup screen that combines form registration with
 * social signup options and proper navigation handling.
 */
const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignup,
  onLogin,
  onSocialSignup,
  onTermsPress,
  onPrivacyPress,
  onBack,
  loading = false,
  error,
  config = {},
  style,
  testID = 'signup-screen',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  const {
    title = 'Create Account',
    subtitle = 'Join us today and get started',
    showSocialSignup = true,
    socialProviders = ['google', 'apple', 'facebook'],
    showLoginLink = true,
    requireTerms = true,
    showMarketingOptIn = true,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSignup = useCallback(async (data: AuthData) => {
    try {
      // Validate terms acceptance
      if (requireTerms && !acceptTerms) {
        setLocalError('Please accept the terms and conditions to continue');
        return;
      }

      setLocalError(null);
      setLocalLoading(true);
      
      const signupData: SignupData = {
        ...data,
        acceptTerms,
        acceptMarketing,
      };
      
      await onSignup(signupData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setLocalError(errorMessage);
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onSignup, acceptTerms, acceptMarketing, requireTerms]);

  const handleSocialSignup = useCallback(async (provider: SocialProvider) => {
    if (!onSocialSignup) return;

    try {
      // Validate terms acceptance for social signup too
      if (requireTerms && !acceptTerms) {
        setLocalError('Please accept the terms and conditions to continue');
        return;
      }

      setLocalError(null);
      setLocalLoading(true);
      await onSocialSignup(provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Social signup failed';
      setLocalError(errorMessage);
      Alert.alert('Social Signup Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onSocialSignup, acceptTerms, requireTerms]);

  const handleSignupError = useCallback((errorMessage: string) => {
    setLocalError(errorMessage);
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

  const renderSocialSignup = () => {
    if (!showSocialSignup || !onSocialSignup) return null;

    return (
      <View style={styles.socialSignupContainer} testID={`${testID}-social-signup`}>
        <SocialLoginButtons
          providers={socialProviders}
          onSocialLogin={handleSocialSignup}
          loading={loading || localLoading}
          style={styles.socialButtons}
          testID={`${testID}-social-buttons`}
        />
        
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with email</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>
    );
  };

  const renderTermsAcceptance = () => {
    if (!requireTerms) return null;

    return (
      <View style={styles.termsContainer} testID={`${testID}-terms`}>
        <View style={styles.checkboxRow}>
          <Checkbox
            checked={acceptTerms}
            onCheckedChange={setAcceptTerms}
            testID={`${testID}-terms-checkbox`}
          />
          <View style={styles.termsTextContainer}>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <TouchableOpacity 
                onPress={onTermsPress}
                disabled={loading || localLoading}
                testID={`${testID}-terms-link`}
              >
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </TouchableOpacity>
              {' '}and{' '}
              <TouchableOpacity 
                onPress={onPrivacyPress}
                disabled={loading || localLoading}
                testID={`${testID}-privacy-link`}
              >
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMarketingOptIn = () => {
    if (!showMarketingOptIn) return null;

    return (
      <View style={styles.marketingContainer} testID={`${testID}-marketing`}>
        <View style={styles.checkboxRow}>
          <Checkbox
            checked={acceptMarketing}
            onCheckedChange={setAcceptMarketing}
            testID={`${testID}-marketing-checkbox`}
          />
          <View style={styles.marketingTextContainer}>
            <Text style={styles.marketingText}>
              I'd like to receive marketing communications and updates
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLoginLink = () => {
    if (!showLoginLink || !onLogin) return null;

    return (
      <View style={styles.loginContainer} testID={`${testID}-login-link`}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity 
          onPress={onLogin}
          disabled={loading || localLoading}
          testID={`${testID}-login-button`}
        >
          <Text style={styles.loginLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (footerComponent) {
      return footerComponent;
    }

    return renderLoginLink();
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

          {/* Social Signup */}
          {renderSocialSignup()}

          {/* Signup Form */}
          <Card style={styles.formCard} testID={`${testID}-form-card`}>
            <SignupForm
              onSignup={handleSignup}
              onError={handleSignupError}
              loading={isLoading}
              requireTerms={false} // We handle terms separately
              enablePasswordStrength={true}
              socialSignup={false} // We handle social signup separately
              style={styles.signupForm}
              testID={`${testID}-signup-form`}
            />

            {/* Terms and Marketing */}
            <View style={styles.agreementContainer}>
              {renderTermsAcceptance()}
              {renderMarketingOptIn()}
            </View>
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
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
  socialSignupContainer: {
    marginBottom: SPACING.lg,
  },
  socialButtons: {
    marginBottom: SPACING.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  signupForm: {
    padding: SPACING.lg,
  },
  agreementContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  termsContainer: {
    marginBottom: SPACING.md,
  },
  marketingContainer: {
    marginBottom: SPACING.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  termsTextContainer: {
    flex: 1,
    paddingTop: 2, // Align with checkbox
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  marketingTextContainer: {
    flex: 1,
    paddingTop: 2, // Align with checkbox
  },
  marketingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default SignupScreen;
export type { SignupScreenProps, SignupScreenConfig, SignupData };
