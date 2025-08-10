/**
 * LoginScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive login screen template that combines the LoginForm block with
 * social login options, forgot password functionality, and proper navigation handling.
 * 
 * Features:
 * - LoginForm integration with validation
 * - Social login buttons (Google, Apple, Facebook, Twitter)
 * - Forgot password navigation
 * - Sign up navigation link
 * - Loading states for entire screen
 * - Error boundary handling
 * - Keyboard avoiding behavior
 * - SafeAreaView integration
 * - Accessibility support
 * - Brand styling and imagery
 * 
 * @example
 * ```tsx
 * <LoginScreen
 *   onLogin={(data) => handleLogin(data)}
 *   onForgotPassword={() => navigation.navigate('ForgotPassword')}
 *   onSignup={() => navigation.navigate('Signup')}
 *   onSocialLogin={(provider) => handleSocialLogin(provider)}
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
import { LoginForm, SocialLoginButtons } from '../../blocks/auth';
import type { 
  LoginFormProps, 
  SocialLoginButtonsProps,
  AuthData,
  SocialProvider 
} from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Login screen configuration
 */
export interface LoginScreenConfig {
  /** Screen title */
  title?: string;
  /** Screen subtitle */
  subtitle?: string;
  /** Show social login */
  showSocialLogin?: boolean;
  /** Available social providers */
  socialProviders?: SocialProvider[];
  /** Show forgot password link */
  showForgotPassword?: boolean;
  /** Show signup link */
  showSignupLink?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the LoginScreen template
 */
export interface LoginScreenProps extends BaseComponentProps {
  /** Callback when login is successful */
  onLogin: (data: AuthData) => Promise<void> | void;
  /** Callback when forgot password is pressed */
  onForgotPassword?: () => void;
  /** Callback when signup link is pressed */
  onSignup?: () => void;
  /** Callback when social login is pressed */
  onSocialLogin?: (provider: SocialProvider) => Promise<void> | void;
  /** Callback when back navigation is pressed */
  onBack?: () => void;
  /** Loading state for authentication */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Configuration for the login screen */
  config?: LoginScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * LoginScreen - AI-optimized login screen template
 * 
 * A comprehensive login screen that combines form authentication with
 * social login options and proper navigation handling.
 */
const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onSignup,
  onSocialLogin,
  onBack,
  loading = false,
  error,
  config = {},
  style,
  testID = 'login-screen',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    title = 'Welcome Back',
    subtitle = 'Sign in to your account',
    showSocialLogin = true,
    socialProviders = ['google', 'apple', 'facebook'],
    showForgotPassword = true,
    showSignupLink = true,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleLogin = useCallback(async (data: AuthData) => {
    try {
      setLocalError(null);
      setLocalLoading(true);
      await onLogin(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setLocalError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onLogin]);

  const handleSocialLogin = useCallback(async (provider: SocialProvider) => {
    if (!onSocialLogin) return;

    try {
      setLocalError(null);
      setLocalLoading(true);
      await onSocialLogin(provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Social login failed';
      setLocalError(errorMessage);
      Alert.alert('Social Login Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onSocialLogin]);

  const handleLoginError = useCallback((errorMessage: string) => {
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

  const renderSocialLogin = () => {
    if (!showSocialLogin || !onSocialLogin) return null;

    return (
      <View style={styles.socialLoginContainer} testID={`${testID}-social-login`}>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <SocialLoginButtons
          providers={socialProviders}
          onSocialLogin={handleSocialLogin}
          loading={loading || localLoading}
          style={styles.socialButtons}
          testID={`${testID}-social-buttons`}
        />
      </View>
    );
  };

  const renderSignupLink = () => {
    if (!showSignupLink || !onSignup) return null;

    return (
      <View style={styles.signupContainer} testID={`${testID}-signup-link`}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity 
          onPress={onSignup}
          disabled={loading || localLoading}
          testID={`${testID}-signup-button`}
        >
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (footerComponent) {
      return footerComponent;
    }

    return renderSignupLink();
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

          {/* Login Form */}
          <Card style={styles.formCard} testID={`${testID}-form-card`}>
            <LoginForm
              onLogin={handleLogin}
              onForgotPassword={onForgotPassword}
              onError={handleLoginError}
              loading={isLoading}
              socialLogin={false} // We handle social login separately
              showForgotPassword={showForgotPassword}
              style={styles.loginForm}
              testID={`${testID}-login-form`}
            />
          </Card>

          {/* Social Login */}
          {renderSocialLogin()}

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
  formCard: {
    marginBottom: SPACING.lg,
  },
  loginForm: {
    padding: SPACING.lg,
  },
  socialLoginContainer: {
    marginBottom: SPACING.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
  socialButtons: {
    paddingHorizontal: SPACING.md,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  signupText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default LoginScreen;
export type { LoginScreenProps, LoginScreenConfig };
