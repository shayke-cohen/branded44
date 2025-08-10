import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { validateEmail, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Properties for the ForgotPasswordForm component
 * @interface ForgotPasswordFormProps
 */
export interface ForgotPasswordFormProps extends BaseComponentProps {
  /** Callback when password reset is requested */
  onResetRequest: (email: string) => void;
  /** Callback when back button is pressed */
  onBack?: () => void;
  /** Callback for error handling */
  onError?: (error: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Custom title text */
  title?: string;
  /** Custom description text */
  description?: string;
  /** Show back button */
  showBackButton?: boolean;
}

/**
 * Form errors interface
 */
export interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

/**
 * ForgotPasswordForm - AI-optimized password reset component
 * 
 * A comprehensive password reset form with email validation, loading states,
 * and error handling. Designed for easy AI code generation and customization.
 * 
 * @example
 * ```tsx
 * <ForgotPasswordForm
 *   onResetRequest={(email) => handlePasswordReset(email)}
 *   onBack={() => navigation.goBack()}
 *   title="Reset Your Password"
 *   showBackButton={true}
 * />
 * ```
 */
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onResetRequest,
  onBack,
  onError,
  loading = false,
  title = "Reset Password",
  description = "Enter your email and we'll send you a recovery link",
  showBackButton = true,
  style,
  testID = 'forgot-password-form',
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Validates the email field
   */
  const validateForm = (): boolean => {
    const newErrors: ForgotPasswordFormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitted(true);
      await onResetRequest(email);
      
      // Show success message
      Alert.alert(
        'Reset Link Sent',
        'We\'ve sent a password reset link to your email address.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    }
  };

  /**
   * Handles back button press
   */
  const handleBack = () => {
    onBack?.();
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    card: {
      padding: SPACING.xl,
      margin: SPACING.md,
      borderRadius: 20,
      shadowColor: COLORS.secondary[900],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
      borderWidth: 1,
      borderColor: COLORS.secondary[100],
      backgroundColor: COLORS.white,
    },
    header: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
      width: '100%',
      paddingHorizontal: SPACING.sm,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize['3xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.secondary[900],
      letterSpacing: -0.5,
      marginBottom: SPACING.sm,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.secondary[500],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: 24,
      textAlign: 'center',
      backgroundColor: 'rgba(255,0,0,0.1)',
      padding: 8,
      marginTop: 8,
      flexWrap: 'wrap',
      alignSelf: 'center',
      maxWidth: '90%',
    },
    inputContainer: {
      marginBottom: SPACING.lg,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.secondary[700],
      marginBottom: SPACING.sm,
    },
    input: {
      borderWidth: 2,
      borderRadius: 12,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.base,
      backgroundColor: COLORS.secondary[50],
      marginBottom: SPACING.xs,
    },
          errorText: {
        color: COLORS.error[600],
        fontSize: TYPOGRAPHY.fontSize.sm,
        marginTop: SPACING.xs,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
      },
    buttonContainer: {
      marginTop: SPACING.lg,
      gap: SPACING.md,
    },
    resetButton: {
      backgroundColor: COLORS.primary[600],
      borderRadius: 12,
      paddingVertical: SPACING.md,
      shadowColor: COLORS.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    backButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.neutral[300],
    },
    backButtonText: {
      color: COLORS.neutral[700],
    },
          successMessage: {
        backgroundColor: COLORS.success[50],
        padding: SPACING.md,
        borderRadius: 8,
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.success[600],
      },
      successText: {
        color: COLORS.success[600],
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
      },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      <Card style={[styles.card, style]} testID={testID} {...props}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text 
            style={styles.description}
            numberOfLines={0}
            ellipsizeMode="clip"
          >
            {description}
          </Text>
        </View>

        {/* Success Message */}
        {isSubmitted && !errors.general && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>
              ✓ Reset instructions sent! Check your email.
            </Text>
          </View>
        )}

        {/* General Error */}
        {errors.general && (
          <Text style={styles.errorText}>{errors.general}</Text>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Label style={styles.label}>Email Address</Label>
          <Input
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading && !isSubmitted}
            testID="email-input"
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit}
            disabled={loading || isSubmitted}
            style={styles.resetButton}
            testID="reset-button"
          >
            <Text>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
          </Button>

          {showBackButton && (
            <Button
              onPress={handleBack}
              disabled={loading}
              style={styles.backButton}
              testID="back-button"
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </Button>
          )}
        </View>
      </Card>
    </View>
  );
};

export default ForgotPasswordForm; 