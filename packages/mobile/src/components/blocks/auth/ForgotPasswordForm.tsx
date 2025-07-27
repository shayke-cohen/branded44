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
  title = "Forgot Password?",
  description = "Enter your email address and we'll send you a link to reset your password.",
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
      padding: SPACING.lg,
      margin: SPACING.md,
    },
    header: {
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
          description: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.neutral[600],
        textAlign: 'center',
        lineHeight: TYPOGRAPHY.lineHeight.relaxed,
      },
    inputContainer: {
      marginBottom: SPACING.md,
    },
    label: {
      marginBottom: SPACING.xs,
    },
    input: {
      marginBottom: SPACING.xs,
    },
          errorText: {
        color: COLORS.error[600],
        fontSize: TYPOGRAPHY.fontSize.sm,
        marginTop: SPACING.xs,
      },
    buttonContainer: {
      marginTop: SPACING.md,
      gap: SPACING.sm,
    },
    resetButton: {
      backgroundColor: COLORS.primary[600],
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
      <Card style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
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