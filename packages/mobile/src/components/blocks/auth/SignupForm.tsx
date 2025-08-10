/**
 * SignupForm Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive signup/registration form component with validation,
 * password confirmation, terms acceptance, and social registration.
 * 
 * Features:
 * - Email, password, and password confirmation inputs
 * - First name and last name fields
 * - Real-time form validation with strength indicators
 * - Terms and conditions acceptance
 * - Marketing consent toggle
 * - Social signup buttons (Google, Apple, Facebook)
 * - Loading states with disabled inputs
 * - Accessibility support
 * - Error handling and display
 * - Customizable styling and behavior
 * 
 * @example
 * ```tsx
 * <SignupForm
 *   onSignup={(data) => handleSignup(data)}
 *   onLogin={() => navigation.navigate('Login')}
 *   onSocialSignup={(provider) => handleSocialSignup(provider)}
 *   loading={false}
 *   socialSignup={true}
 *   requireNames={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { Progress } from '../../../../~/components/ui/progress';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { validateEmail, validatePassword, validateField, cn } from '../../../lib/utils';
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
 * Props for the SignupForm component
 */
export interface SignupFormProps extends BaseComponentProps {
  /**
   * Callback function called when signup form is submitted
   * @param data - Signup form data containing all registration fields
   */
  onSignup?: (data: AuthData) => void;

  /**
   * Callback function called when login link is pressed
   */
  onLogin?: () => void;

  /**
   * Callback function called when social signup button is pressed
   * @param provider - Social provider (google, apple, facebook, etc.)
   */
  onSocialSignup?: (provider: SocialProvider) => void;

  /**
   * Callback function called when terms link is pressed
   */
  onTermsPress?: () => void;

  /**
   * Callback function called when privacy policy link is pressed
   */
  onPrivacyPress?: () => void;

  /**
   * Whether the form is in loading state (disables inputs and shows spinner)
   */
  loading?: boolean;

  /**
   * Whether to show social signup buttons
   */
  socialSignup?: boolean;

  /**
   * Whether to show the login link
   */
  showLogin?: boolean;

  /**
   * Whether to require first and last name fields
   */
  requireNames?: boolean;

  /**
   * Whether to show marketing consent checkbox
   */
  showMarketingConsent?: boolean;

  /**
   * Whether terms acceptance is required
   */
  requireTerms?: boolean;

  /**
   * Initial form values
   */
  initialValues?: Partial<AuthData>;

  /**
   * Custom validation rules for form fields
   */
  validationRules?: {
    email?: ValidationRule[];
    password?: ValidationRule[];
    firstName?: ValidationRule[];
    lastName?: ValidationRule[];
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
   * Password strength requirements
   */
  passwordRequirements?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  };
}

/**
 * Form errors interface
 */
interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  terms?: string;
  general?: string;
}

/**
 * Form data interface
 */
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
  marketingConsent: boolean;
}

// =============================================================================
// COMPONENT IMPLEMENTATION
// =============================================================================

/**
 * SignupForm - A comprehensive registration form component
 * 
 * This component provides a complete signup experience with validation,
 * password strength checking, terms acceptance, and social registration.
 * 
 * @param props - SignupForm props
 * @returns JSX.Element - Rendered SignupForm component
 */
export const SignupForm: React.FC<SignupFormProps> = ({
  onSignup,
  onLogin,
  onSocialSignup,
  onTermsPress,
  onPrivacyPress,
  loading = false,
  socialSignup = true,
  showLogin = true,
  requireNames = true,
  showMarketingConsent = true,
  requireTerms = true,
  initialValues = {},
  validationRules = {},
  buttonText = 'Create Account',
  title = 'Create Your Account',
  subtitle = 'Join us and start your journey today',
  passwordRequirements = {},
  className,
  style,
  testID = 'signup-form',
  disabled = false,
  accessibilityLabel = 'Signup Form',
  ...props
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [formData, setFormData] = useState<FormData>({
    email: initialValues.email || '',
    password: initialValues.password || '',
    confirmPassword: '',
    firstName: initialValues.firstName || '',
    lastName: initialValues.lastName || '',
    termsAccepted: initialValues.termsAccepted || false,
    marketingConsent: initialValues.marketingConsent || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =============================================================================
  // VALIDATION RULES
  // =============================================================================

  const defaultEmailRules: ValidationRule[] = [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email address' },
  ];

  const defaultPasswordRules: ValidationRule[] = [
    { type: 'required', message: 'Password is required' },
    { type: 'min', value: passwordRequirements.minLength || 8, message: `Password must be at least ${passwordRequirements.minLength || 8} characters` },
  ];

  const defaultNameRules: ValidationRule[] = [
    { type: 'required', message: 'This field is required' },
    { type: 'min', value: 2, message: 'Must be at least 2 characters' },
  ];

  const emailRules = validationRules.email || defaultEmailRules;
  const passwordRules = validationRules.password || defaultPasswordRules;
  const firstNameRules = validationRules.firstName || defaultNameRules;
  const lastNameRules = validationRules.lastName || defaultNameRules;

  // =============================================================================
  // PASSWORD STRENGTH CALCULATION
  // =============================================================================

  const passwordStrength = useMemo(() => {
    return validatePassword(formData.password, passwordRequirements);
  }, [formData.password, passwordRequirements]);

  // =============================================================================
  // VALIDATION FUNCTIONS
  // =============================================================================

  /**
   * Validates a single form field
   */
  const validateFormField = useCallback((field: keyof FormData, value: any): string | null => {
    switch (field) {
      case 'email':
        return validateField(value, emailRules);
      case 'password':
        return validateField(value, passwordRules);
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return null;
      case 'firstName':
        return requireNames ? validateField(value, firstNameRules) : null;
      case 'lastName':
        return requireNames ? validateField(value, lastNameRules) : null;
      case 'termsAccepted':
        return requireTerms && !value ? 'You must accept the terms and conditions' : null;
      default:
        return null;
    }
  }, [formData.password, emailRules, passwordRules, firstNameRules, lastNameRules, requireNames, requireTerms]);

  /**
   * Validates the entire form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate all fields
    const emailError = validateFormField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validateFormField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateFormField('confirmPassword', formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    if (requireNames) {
      const firstNameError = validateFormField('firstName', formData.firstName);
      if (firstNameError) newErrors.firstName = firstNameError;

      const lastNameError = validateFormField('lastName', formData.lastName);
      if (lastNameError) newErrors.lastName = lastNameError;
    }

    const termsError = validateFormField('termsAccepted', formData.termsAccepted);
    if (termsError) newErrors.terms = termsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateFormField, requireNames]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handles input field changes
   */
  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Also clear confirm password error when password changes
    if (field === 'password' && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
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
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        termsAccepted: formData.termsAccepted,
        marketingConsent: formData.marketingConsent,
      };

      await onSignup?.(authData);
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Signup failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, loading, disabled, isSubmitting, validateForm, onSignup]);

  /**
   * Handles social signup button press
   */
  const handleSocialSignup = useCallback((provider: SocialProvider) => {
    if (loading || disabled) return;
    onSocialSignup?.(provider);
  }, [loading, disabled, onSocialSignup]);

  /**
   * Handles password visibility toggle
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  /**
   * Handles confirm password visibility toggle
   */
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Renders password strength indicator
   */
  const renderPasswordStrength = () => {
    if (!formData.password) return null;

    const { strength, feedback } = passwordStrength;
    
    const strengthColor = 
      strength >= 80 ? COLORS.success[500] :
      strength >= 60 ? COLORS.warning[500] :
      strength >= 40 ? COLORS.warning[600] :
      COLORS.error[500];

    const strengthText = 
      strength >= 80 ? 'Strong' :
      strength >= 60 ? 'Good' :
      strength >= 40 ? 'Fair' :
      'Weak';

    return (
      <View style={{ marginTop: SPACING.xs }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: SPACING.xs 
        }}>
          <Text style={{ 
            fontSize: TYPOGRAPHY.fontSize.sm, 
            color: COLORS.secondary[600] 
          }}>
            Password strength:
          </Text>
          <Text style={{ 
            fontSize: TYPOGRAPHY.fontSize.sm, 
            color: strengthColor,
            fontWeight: TYPOGRAPHY.fontWeight.medium
          }}>
            {strengthText}
          </Text>
        </View>
        <Progress 
          value={strength} 
          style={{ 
            height: 4,
            backgroundColor: COLORS.secondary[200]
          }}
          indicatorClassName={`bg-[${strengthColor}]`}
        />
        {feedback.length > 0 && (
          <View style={{ marginTop: SPACING.xs }}>
            {feedback.map((item, index) => (
              <Text 
                key={index}
                style={{ 
                  fontSize: TYPOGRAPHY.fontSize.xs, 
                  color: COLORS.error[600],
                  marginBottom: 2
                }}
              >
                • {item}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  /**
   * Renders social signup buttons
   */
  const renderSocialButtons = () => {
    if (!socialSignup || !onSocialSignup) return null;

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
            Or sign up with
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.secondary[300] }} />
        </View>

        {socialProviders.map(({ provider, label, color }) => (
          <Button
            key={provider}
            variant="outline"
            onPress={() => handleSocialSignup(provider)}
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
   * Renders form footer with login link
   */
  const renderFooter = () => (
    <View style={{ gap: SPACING.md }}>
      {/* Login Link */}
      {showLogin && onLogin && (
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
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={onLogin}
            disabled={loading || disabled}
            testID={`${testID}-login-link`}
            accessibilityLabel="Sign in link"
            accessibilityRole="button"
          >
            <Text style={{
              color: COLORS.primary[600],
              fontSize: TYPOGRAPHY.fontSize.sm,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
            }}>
              Sign in
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

  const styles = StyleSheet.create({
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
    subtitle: {
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
    form: {
      width: '100%',
      gap: SPACING.lg,
    },
    checkboxLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.secondary[700],
      lineHeight: 20,
      flexWrap: 'wrap',
      flex: 1,
      backgroundColor: 'rgba(0,255,0,0.1)',
      padding: 4,
    },
  });

  return (
    <Card
      style={[styles.card, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text 
              style={styles.subtitle}
              numberOfLines={0}
              ellipsizeMode="clip"
            >
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
        <View style={styles.form}>
          {/* Name Fields */}
          {requireNames && (
            <View style={{ 
              flexDirection: 'row', 
              gap: SPACING.md 
            }}>
              {/* First Name */}
              <View style={{ flex: 1 }}>
                <Label htmlFor="firstName" style={{
                  fontSize: TYPOGRAPHY.fontSize.base,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.secondary[700],
                  marginBottom: SPACING.sm,
                }}>
                  First Name
                </Label>
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  onBlur={() => handleInputBlur('firstName')}
                  editable={!isLoading && !disabled}
                  autoCapitalize="words"
                  autoCorrect={false}
                  testID={`${testID}-firstname-input`}
                  accessibilityLabel="First name input"
                  style={{
                    borderColor: errors.firstName ? COLORS.error[500] : COLORS.secondary[300],
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.md,
                    fontSize: TYPOGRAPHY.fontSize.base,
                    backgroundColor: COLORS.secondary[50],
                  }}
                />
                {errors.firstName && (
                  <Text style={{
                    color: COLORS.error[600],
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    marginTop: SPACING.xs,
                    fontWeight: TYPOGRAPHY.fontWeight.medium,
                  }}>
                    {errors.firstName}
                  </Text>
                )}
              </View>

              {/* Last Name */}
              <View style={{ flex: 1 }}>
                <Label htmlFor="lastName" style={{
                  fontSize: TYPOGRAPHY.fontSize.base,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.secondary[700],
                  marginBottom: SPACING.sm,
                }}>
                  Last Name
                </Label>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  onBlur={() => handleInputBlur('lastName')}
                  editable={!isLoading && !disabled}
                  autoCapitalize="words"
                  autoCorrect={false}
                  testID={`${testID}-lastname-input`}
                  accessibilityLabel="Last name input"
                  style={{
                    borderColor: errors.lastName ? COLORS.error[500] : COLORS.secondary[300],
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.md,
                    fontSize: TYPOGRAPHY.fontSize.base,
                    backgroundColor: COLORS.secondary[50],
                  }}
                />
                {errors.lastName && (
                  <Text style={{
                    color: COLORS.error[600],
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    marginTop: SPACING.xs,
                    fontWeight: TYPOGRAPHY.fontWeight.medium,
                  }}>
                    {errors.lastName}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Email Field */}
          <View>
            <Label htmlFor="email" style={{
              fontSize: TYPOGRAPHY.fontSize.base,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.secondary[700],
              marginBottom: SPACING.sm,
            }}>
              Email Address
            </Label>
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
                borderWidth: 2,
                borderRadius: 12,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.md,
                fontSize: TYPOGRAPHY.fontSize.base,
                backgroundColor: COLORS.secondary[50],
              }}
            />
            {errors.email && (
              <Text style={{
                color: COLORS.error[600],
                fontSize: TYPOGRAPHY.fontSize.sm,
                marginTop: SPACING.xs,
                fontWeight: TYPOGRAPHY.fontWeight.medium,
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
                placeholder="Create a password"
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
            {renderPasswordStrength()}
          </View>

          {/* Confirm Password Field */}
          <View>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <View style={{ position: 'relative' }}>
              <Input
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading && !disabled}
                autoCapitalize="none"
                autoCorrect={false}
                testID={`${testID}-confirm-password-input`}
                accessibilityLabel="Confirm password input"
                style={{
                  borderColor: errors.confirmPassword ? COLORS.error[500] : COLORS.secondary[300],
                  paddingRight: 50,
                }}
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={{
                  position: 'absolute',
                  right: SPACING.sm,
                  top: '50%',
                  transform: [{ translateY: -12 }],
                  padding: SPACING.xs,
                }}
                testID={`${testID}-confirm-password-toggle`}
                accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
              >
                <Text style={{ 
                  color: COLORS.secondary[500],
                  fontSize: TYPOGRAPHY.fontSize.sm 
                }}>
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={{
                color: COLORS.error[600],
                fontSize: TYPOGRAPHY.fontSize.sm,
                marginTop: SPACING.xs,
              }}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Terms and Marketing Consent */}
          <View style={{ gap: SPACING.sm }}>
            {/* Terms Acceptance */}
            {requireTerms && (
              <View>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'flex-start',
                  gap: SPACING.sm 
                }}>
                  <Checkbox
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
                    disabled={isLoading || disabled}
                    testID={`${testID}-terms-checkbox`}
                    accessibilityLabel="Accept terms and conditions"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checkboxLabel}>
                      I agree to the{' '}
                      <TouchableOpacity
                        onPress={onTermsPress}
                        disabled={isLoading || disabled}
                        style={{ marginTop: -2 }}
                      >
                        <Text style={{
                          color: COLORS.primary[600],
                          fontWeight: TYPOGRAPHY.fontWeight.medium,
                          textDecorationLine: 'underline',
                        }}>
                          Terms and Conditions
                        </Text>
                      </TouchableOpacity>
                      {' '}and{' '}
                      <TouchableOpacity
                        onPress={onPrivacyPress}
                        disabled={isLoading || disabled}
                        style={{ marginTop: -2 }}
                      >
                        <Text style={{
                          color: COLORS.primary[600],
                          fontWeight: TYPOGRAPHY.fontWeight.medium,
                          textDecorationLine: 'underline',
                        }}>
                          Privacy Policy
                        </Text>
                      </TouchableOpacity>
                    </Text>
                  </View>
                </View>
                {errors.terms && (
                  <Text style={{
                    color: COLORS.error[600],
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    marginTop: SPACING.xs,
                    marginLeft: 28,
                  }}>
                    {errors.terms}
                  </Text>
                )}
              </View>
            )}

            {/* Marketing Consent */}
            {showMarketingConsent && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'flex-start',
                gap: SPACING.sm 
              }}>
                <Checkbox
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
                  disabled={isLoading || disabled}
                  testID={`${testID}-marketing-checkbox`}
                  accessibilityLabel="Subscribe to marketing communications"
                />
                <Text style={styles.checkboxLabel}>
                  I would like to receive marketing communications and updates
                </Text>
              </View>
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
              marginTop: SPACING.lg,
              backgroundColor: isLoading || disabled ? COLORS.secondary[400] : COLORS.primary[600],
              borderRadius: 12,
              paddingVertical: SPACING.md,
              shadowColor: COLORS.primary[600],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{
              color: COLORS.white,
              fontSize: TYPOGRAPHY.fontSize.lg,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              textAlign: 'center',
            }}>
              {isLoading ? 'Creating Account...' : buttonText}
            </Text>
          </Button>
        </View>

        {/* Social Signup Buttons */}
        {renderSocialButtons()}

        {/* Footer Links */}
        <View style={{ marginTop: SPACING.lg }}>
          {renderFooter()}
        </View>
      </ScrollView>
    </Card>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default SignupForm;

// Type exports for external use
export type { FormErrors as SignupFormErrors }; 