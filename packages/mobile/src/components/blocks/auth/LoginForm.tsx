/**
 * LoginForm Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive login form component with email/password authentication,
 * validation, loading states, and social login integration.
 * 
 * Features:
 * - Email and password input with validation
 * - Real-time form validation
 * - Loading states with disabled inputs
 * - Social login buttons (Google, Apple, Facebook)
 * - Forgot password link
 * - Accessibility support
 * - Error handling and display
 * - Customizable styling and behavior
 * 
 * @example
 * ```tsx
 * <LoginForm
 *   onLogin={(data) => handleLogin(data)}
 *   onForgotPassword={() => navigation.navigate('ForgotPassword')}
 *   onSocialLogin={(provider) => handleSocialLogin(provider)}
 *   loading={false}
 *   socialLogin={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { validateEmail, validateField, cn } from '../../../lib/utils';
import type { 
  AuthData, 
  SocialProvider, 
  BaseComponentProps,
  ValidationRule 
} from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Props for the LoginForm component
 */
export interface LoginFormProps extends BaseComponentProps {
  /**
   * Callback function called when login form is submitted
   * @param data - Login form data containing email and password
   */
  onLogin?: (data: AuthData) => void;

  /**
   * Callback function called when forgot password link is pressed
   */
  onForgotPassword?: () => void;

  /**
   * Callback function called when social login button is pressed
   * @param provider - Social provider (google, apple, facebook, etc.)
   */
  onSocialLogin?: (provider: SocialProvider) => void;

  /**
   * Callback function called when signup link is pressed
   */
  onSignup?: () => void;

  /**
   * Whether the form is in loading state (disables inputs and shows spinner)
   */
  loading?: boolean;

  /**
   * Whether to show social login buttons
   */
  socialLogin?: boolean;

  /**
   * Whether to show the signup link
   */
  showSignup?: boolean;

  /**
   * Whether to show the forgot password link
   */
  showForgotPassword?: boolean;

  /**
   * Initial form values
   */
  initialValues?: Partial<AuthData>;

  /**
   * Custom validation rules for email and password fields
   */
  validationRules?: {
    email?: ValidationRule[];
    password?: ValidationRule[];
  };

  /**
   * Custom button text
   */
  buttonText?: string;

  /**
   * Custom title text
   */
  title?: string;

  /**
   * Custom subtitle text
   */
  subtitle?: string;

  /**
   * Whether to remember login state
   */
  rememberMe?: boolean;

  /**
   * Callback for remember me toggle
   */
  onRememberToggle?: (remember: boolean) => void;
}

/**
 * Form errors interface
 */
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Form data interface
 */
interface FormData {
  email: string;
  password: string;
}

// =============================================================================
// COMPONENT IMPLEMENTATION
// =============================================================================

/**
 * LoginForm - A comprehensive form component for user authentication
 * 
 * This component provides a complete login experience with validation,
 * error handling, loading states, and social login integration.
 * 
 * @param props - LoginForm props
 * @returns JSX.Element - Rendered LoginForm component
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onForgotPassword,
  onSocialLogin,
  onSignup,
  loading = false,
  socialLogin = true,
  showSignup = true,
  showForgotPassword = true,
  initialValues = {},
  validationRules = {},
  buttonText = 'Sign In',
  title = 'Welcome Back',
  subtitle = 'Sign in to your account to continue',
  rememberMe = false,
  onRememberToggle,
  className,
  style,
  testID = 'login-form',
  disabled = false,
  accessibilityLabel = 'Login Form',
  ...props
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [formData, setFormData] = useState<FormData>({
    email: initialValues.email || '',
    password: initialValues.password || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(rememberMe);

  // =============================================================================
  // VALIDATION RULES
  // =============================================================================

  const defaultEmailRules: ValidationRule[] = [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email address' },
  ];

  const defaultPasswordRules: ValidationRule[] = [
    { type: 'required', message: 'Password is required' },
    { type: 'min', value: 6, message: 'Password must be at least 6 characters' },
  ];

  const emailRules = validationRules.email || defaultEmailRules;
  const passwordRules = validationRules.password || defaultPasswordRules;

  // =============================================================================
  // VALIDATION FUNCTIONS
  // =============================================================================

  /**
   * Validates a single form field
   */
  const validateFormField = useCallback((field: keyof FormData, value: string): string | null => {
    const rules = field === 'email' ? emailRules : passwordRules;
    return validateField(value, rules);
  }, [emailRules, passwordRules]);

  /**
   * Validates the entire form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    const emailError = validateFormField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    const passwordError = validateFormField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateFormField]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handles input field changes
   */
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * Handles input field blur (validation on focus loss)
   */
  const handleInputBlur = useCallback((field: keyof FormData) => {
    const error = validateFormField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [formData, validateFormField]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async () => {
    if (loading || disabled || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({ general: undefined });

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const authData: AuthData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      await onLogin?.(authData);
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, loading, disabled, isSubmitting, validateForm, onLogin]);

  /**
   * Handles social login button press
   */
  const handleSocialLogin = useCallback((provider: SocialProvider) => {
    if (loading || disabled) return;
    onSocialLogin?.(provider);
  }, [loading, disabled, onSocialLogin]);

  /**
   * Handles remember me toggle
   */
  const handleRememberToggle = useCallback(() => {
    const newRemember = !remember;
    setRemember(newRemember);
    onRememberToggle?.(newRemember);
  }, [remember, onRememberToggle]);

  /**
   * Handles password visibility toggle
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders social login buttons
   */
  const renderSocialButtons = () => {
    if (!socialLogin || !onSocialLogin) return null;

    const socialProviders: { provider: SocialProvider; label: string; color: string }[] = [
      { provider: 'google', label: 'Continue with Google', color: COLORS.social.google },
      { provider: 'apple', label: 'Continue with Apple', color: COLORS.social.apple },
      { provider: 'facebook', label: 'Continue with Facebook', color: COLORS.social.facebook },
    ];

    return (
      <View style={{ gap: SPACING.sm }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginVertical: SPACING.md,
          gap: SPACING.md 
        }}>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.secondary[300] }} />
          <Text style={{ 
            color: COLORS.secondary[500], 
            fontSize: TYPOGRAPHY.fontSize.sm,
            fontWeight: TYPOGRAPHY.fontWeight.medium
          }}>
            Or continue with
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.secondary[300] }} />
        </View>

        {socialProviders.map(({ provider, label, color }) => (
          <Button
            key={provider}
            variant="outline"
            onPress={() => handleSocialLogin(provider)}
            disabled={loading || disabled}
            testID={`${testID}-social-${provider}`}
            accessibilityLabel={`${label} button`}
            style={{
              borderColor: COLORS.secondary[300],
              backgroundColor: COLORS.white,
            }}
          >
            <Text style={{ 
              color: COLORS.secondary[700],
              fontSize: TYPOGRAPHY.fontSize.base,
              fontWeight: TYPOGRAPHY.fontWeight.medium
            }}>
              {label}
            </Text>
          </Button>
        ))}
      </View>
    );
  };

  /**
   * Renders form footer with links
   */
  const renderFooter = () => (
    <View style={{ gap: SPACING.md }}>
      {/* Forgot Password Link */}
      {showForgotPassword && onForgotPassword && (
        <TouchableOpacity
          onPress={onForgotPassword}
          disabled={loading || disabled}
          testID={`${testID}-forgot-password`}
          accessibilityLabel="Forgot password link"
          accessibilityRole="button"
        >
          <Text style={{
            textAlign: 'center',
            color: COLORS.primary[600],
            fontSize: TYPOGRAPHY.fontSize.sm,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
          }}>
            Forgot your password?
          </Text>
        </TouchableOpacity>
      )}

      {/* Signup Link */}
      {showSignup && onSignup && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: SPACING.xs
        }}>
          <Text style={{
            color: COLORS.secondary[600],
            fontSize: TYPOGRAPHY.fontSize.sm,
          }}>
            Don't have an account?
          </Text>
          <TouchableOpacity
            onPress={onSignup}
            disabled={loading || disabled}
            testID={`${testID}-signup-link`}
            accessibilityLabel="Sign up link"
            accessibilityRole="button"
          >
            <Text style={{
              color: COLORS.primary[600],
              fontSize: TYPOGRAPHY.fontSize.sm,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
            }}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const isLoading = loading || isSubmitting;

  return (
    <Card
      style={[
        {
          padding: SPACING.lg,
          margin: SPACING.md,
          backgroundColor: COLORS.white,
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      {/* Header */}
      <View style={{ marginBottom: SPACING.lg, alignItems: 'center' }}>
        <Text style={{
          fontSize: TYPOGRAPHY.fontSize['2xl'],
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: COLORS.secondary[900],
          marginBottom: SPACING.xs,
          textAlign: 'center',
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            fontSize: TYPOGRAPHY.fontSize.base,
            color: COLORS.secondary[600],
            textAlign: 'center',
            lineHeight: TYPOGRAPHY.lineHeight.relaxed,
          }}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* General Error */}
      {errors.general && (
        <View style={{
          padding: SPACING.sm,
          backgroundColor: COLORS.error[50],
          borderRadius: 8,
          borderWidth: 1,
          borderColor: COLORS.error[200],
          marginBottom: SPACING.md,
        }}>
          <Text style={{
            color: COLORS.error[700],
            fontSize: TYPOGRAPHY.fontSize.sm,
            textAlign: 'center',
          }}>
            {errors.general}
          </Text>
        </View>
      )}

      {/* Form Fields */}
      <View style={{ gap: SPACING.md }}>
        {/* Email Field */}
        <View>
          <Label htmlFor="email">Email Address</Label>
          <Input
             placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            onBlur={() => handleInputBlur('email')}
            editable={!isLoading && !disabled}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            testID={`${testID}-email-input`}
            accessibilityLabel="Email address input"
            style={{
              borderColor: errors.email ? COLORS.error[500] : COLORS.secondary[300],
            }}
          />
          {errors.email && (
            <Text style={{
              color: COLORS.error[600],
              fontSize: TYPOGRAPHY.fontSize.sm,
              marginTop: SPACING.xs,
            }}>
              {errors.email}
            </Text>
          )}
        </View>

        {/* Password Field */}
        <View>
          <Label htmlFor="password">Password</Label>
          <View style={{ position: 'relative' }}>
            <Input
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              onBlur={() => handleInputBlur('password')}
              secureTextEntry={!showPassword}
              editable={!isLoading && !disabled}
              autoCapitalize="none"
              autoCorrect={false}
              testID={`${testID}-password-input`}
              accessibilityLabel="Password input"
              style={{
                borderColor: errors.password ? COLORS.error[500] : COLORS.secondary[300],
                paddingRight: 50,
              }}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: SPACING.sm,
                top: '50%',
                transform: [{ translateY: -12 }],
                padding: SPACING.xs,
              }}
              testID={`${testID}-password-toggle`}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
            >
              <Text style={{ 
                color: COLORS.secondary[500],
                fontSize: TYPOGRAPHY.fontSize.sm 
              }}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={{
              color: COLORS.error[600],
              fontSize: TYPOGRAPHY.fontSize.sm,
              marginTop: SPACING.xs,
            }}>
              {errors.password}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={isLoading || disabled}
          variant="default"
          testID={`${testID}-submit-button`}
          accessibilityLabel={`${buttonText} button`}
          style={{
            marginTop: SPACING.sm,
            backgroundColor: COLORS.primary[600],
          }}
        >
          <Text style={{
            color: COLORS.white,
            fontSize: TYPOGRAPHY.fontSize.base,
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
          }}>
            {isLoading ? 'Signing In...' : buttonText}
          </Text>
        </Button>
      </View>

      {/* Social Login Buttons */}
      {renderSocialButtons()}

      {/* Footer Links */}
      <View style={{ marginTop: SPACING.lg }}>
        {renderFooter()}
      </View>
    </Card>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default LoginForm;

// Type exports for external use
export type { FormErrors as LoginFormErrors }; 