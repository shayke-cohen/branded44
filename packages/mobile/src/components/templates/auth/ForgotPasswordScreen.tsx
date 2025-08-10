/**
 * ForgotPasswordScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive forgot password screen template that combines the ForgotPasswordForm block
 * with proper navigation handling and user feedback for password recovery flow.
 * 
 * Features:
 * - ForgotPasswordForm integration with validation
 * - Email validation and submission
 * - Loading states for reset process
 * - Success confirmation display
 * - Back to login navigation
 * - Error handling and display
 * - Keyboard avoiding behavior
 * - SafeAreaView integration
 * - Accessibility support
 * - Multiple reset options (email/phone)
 * 
 * @example
 * ```tsx
 * <ForgotPasswordScreen
 *   onResetRequest={(email) => handlePasswordReset(email)}
 *   onBack={() => navigation.goBack()}
 *   onLoginReturn={() => navigation.navigate('Login')}
 *   loading={resetLoading}
 *   error={resetError}
 *   resetMethods={['email', 'phone']}
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
import { ForgotPasswordForm } from '../../blocks/auth';
import type { ForgotPasswordFormProps } from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Button } from '../../../../~/components/ui/button';
import { Check } from '../../../../~/lib/icons/Check';
import { ChevronDown } from '../../../../~/lib/icons/ChevronDown';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Password reset method types
 */
export type ResetMethod = 'email' | 'phone' | 'security_questions';

/**
 * Reset request data
 */
export interface ResetRequestData {
  /** Email or phone number */
  contact: string;
  /** Reset method used */
  method: ResetMethod;
}

/**
 * Forgot password screen configuration
 */
export interface ForgotPasswordScreenConfig {
  /** Screen title */
  title?: string;
  /** Screen subtitle */
  subtitle?: string;
  /** Available reset methods */
  resetMethods?: ResetMethod[];
  /** Success message */
  successMessage?: string;
  /** Instructions text */
  instructions?: string;
  /** Show back button */
  showBackButton?: boolean;
  /** Show login return button */
  showLoginReturn?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom success component */
  successComponent?: React.ReactNode;
}

/**
 * Properties for the ForgotPasswordScreen template
 */
export interface ForgotPasswordScreenProps extends BaseComponentProps {
  /** Callback when password reset is requested */
  onResetRequest: (data: ResetRequestData) => Promise<void> | void;
  /** Callback when back button is pressed */
  onBack?: () => void;
  /** Callback when return to login is pressed */
  onLoginReturn?: () => void;
  /** Loading state for reset process */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Configuration for the forgot password screen */
  config?: ForgotPasswordScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ForgotPasswordScreen - AI-optimized forgot password screen template
 * 
 * A comprehensive forgot password screen that handles the password reset
 * flow with proper user feedback and navigation.
 */
const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onResetRequest,
  onBack,
  onLoginReturn,
  loading = false,
  error,
  success = false,
  config = {},
  style,
  testID = 'forgot-password-screen',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const {
    title = 'Reset Password',
    subtitle = 'Enter your email to receive reset instructions',
    resetMethods = ['email'],
    successMessage = 'Password reset instructions have been sent to your email',
    instructions = 'Please check your email and follow the instructions to reset your password.',
    showBackButton = true,
    showLoginReturn = true,
    headerComponent,
    successComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleResetRequest = useCallback(async (email: string) => {
    try {
      setLocalError(null);
      setLocalLoading(true);
      
      const resetData: ResetRequestData = {
        contact: email,
        method: 'email' // Default to email for now
      };
      
      await onResetRequest(resetData);
      setLocalSuccess(true);
      setResetSent(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setLocalError(errorMessage);
      Alert.alert('Reset Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onResetRequest]);

  const handleResetError = useCallback((errorMessage: string) => {
    setLocalError(errorMessage);
  }, []);

  const handleTryAgain = useCallback(() => {
    setLocalSuccess(false);
    setLocalError(null);
    setResetSent(false);
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
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {resetSent ? instructions : subtitle}
        </Text>
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

  const renderSuccessContent = () => {
    const isSuccess = success || localSuccess || resetSent;
    
    if (!isSuccess) return null;

    if (successComponent) {
      return successComponent;
    }

    return (
      <Card style={styles.successCard} testID={`${testID}-success`}>
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <Check style={styles.successIcon} />
          </View>
          
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>{successMessage}</Text>
          
          <View style={styles.successActions}>
            <Button
              onPress={handleTryAgain}
              variant="outline"
              style={styles.tryAgainButton}
              testID={`${testID}-try-again`}
            >
              <Text style={styles.tryAgainText}>Send Again</Text>
            </Button>
            
            {showLoginReturn && onLoginReturn && (
              <Button
                onPress={onLoginReturn}
                style={styles.loginReturnButton}
                testID={`${testID}-return-login`}
              >
                <Text style={styles.loginReturnText}>Back to Login</Text>
              </Button>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderResetForm = () => {
    const isSuccess = success || localSuccess || resetSent;
    
    if (isSuccess) return null;

    return (
      <Card style={styles.formCard} testID={`${testID}-form-card`}>
        <ForgotPasswordForm
          onResetRequest={handleResetRequest}
          onBack={onBack}
          onError={handleResetError}
          loading={loading || localLoading}
          style={styles.resetForm}
          testID={`${testID}-reset-form`}
        />
      </Card>
    );
  };

  const renderLoginReturn = () => {
    const isSuccess = success || localSuccess || resetSent;
    
    if (isSuccess || !showLoginReturn || !onLoginReturn) return null;

    return (
      <View style={styles.loginReturnContainer} testID={`${testID}-login-return`}>
        <Text style={styles.loginReturnPrompt}>Remember your password? </Text>
        <TouchableOpacity 
          onPress={onLoginReturn}
          disabled={loading || localLoading}
          testID={`${testID}-login-return-button`}
        >
          <Text style={styles.loginReturnLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    );
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

          {/* Success Content */}
          {renderSuccessContent()}

          {/* Reset Form */}
          {renderResetForm()}

          {/* Login Return Link */}
          <View style={styles.footerContainer}>
            {renderLoginReturn()}
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
    paddingHorizontal: SPACING.sm,
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
  resetForm: {
    padding: SPACING.lg,
  },
  successCard: {
    marginBottom: SPACING.lg,
  },
  successContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.success,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successIcon: {
    width: 40,
    height: 40,
    color: COLORS.background,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  successMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.xl,
  },
  successActions: {
    width: '100%',
    gap: SPACING.md,
  },
  tryAgainButton: {
    paddingVertical: SPACING.lg,
  },
  tryAgainText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  loginReturnButton: {
    paddingVertical: SPACING.lg,
  },
  loginReturnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  loginReturnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  loginReturnPrompt: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  loginReturnLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default ForgotPasswordScreen;
export type { 
  ForgotPasswordScreenProps, 
  ForgotPasswordScreenConfig, 
  ResetRequestData, 
  ResetMethod 
};
