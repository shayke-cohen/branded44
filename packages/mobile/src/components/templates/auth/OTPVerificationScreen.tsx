/**
 * OTPVerificationScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive OTP verification screen template that combines the OTPVerificationForm block
 * with proper navigation handling, resend functionality, and user feedback.
 * 
 * Features:
 * - OTPVerificationForm integration with validation
 * - Phone/email verification support
 * - Auto-detection and validation of OTP
 * - Resend OTP functionality with countdown
 * - Loading states for verification process
 * - Error handling and display
 * - Back navigation support
 * - Keyboard avoiding behavior
 * - SafeAreaView integration
 * - Accessibility support
 * - Auto-submission on complete code
 * 
 * @example
 * ```tsx
 * <OTPVerificationScreen
 *   onVerify={(otp) => handleOTPVerification(otp)}
 *   onResendOTP={() => handleResendOTP()}
 *   onBack={() => navigation.goBack()}
 *   contactInfo="+1 (555) 123-4567"
 *   verificationType="phone"
 *   loading={verificationLoading}
 *   error={verificationError}
 *   resendCooldown={30}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
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
import { OTPVerificationForm } from '../../blocks/auth';
import type { OTPVerificationFormProps } from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Button } from '../../../../~/components/ui/button';
import { ChevronDown } from '../../../../~/lib/icons/ChevronDown';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Verification types
 */
export type VerificationType = 'phone' | 'email' | 'two_factor';

/**
 * OTP verification data
 */
export interface OTPVerificationData {
  /** OTP code entered by user */
  otp: string;
  /** Contact info (phone/email) */
  contact: string;
  /** Verification type */
  type: VerificationType;
}

/**
 * OTP verification screen configuration
 */
export interface OTPVerificationScreenConfig {
  /** Screen title */
  title?: string;
  /** Screen subtitle */
  subtitle?: string;
  /** OTP code length */
  codeLength?: number;
  /** Resend cooldown in seconds */
  resendCooldown?: number;
  /** Auto-submit when code is complete */
  autoSubmit?: boolean;
  /** Show back button */
  showBackButton?: boolean;
  /** Custom instructions text */
  instructions?: string;
  /** Custom header component */
  headerComponent?: React.ReactNode;
}

/**
 * Properties for the OTPVerificationScreen template
 */
export interface OTPVerificationScreenProps extends BaseComponentProps {
  /** Callback when OTP is verified */
  onVerify: (data: OTPVerificationData) => Promise<void> | void;
  /** Callback when resend OTP is requested */
  onResendOTP?: () => Promise<void> | void;
  /** Callback when back button is pressed */
  onBack?: () => void;
  /** Contact information (phone/email) to display */
  contactInfo: string;
  /** Type of verification */
  verificationType: VerificationType;
  /** Loading state for verification */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Resend cooldown in seconds */
  resendCooldown?: number;
  /** Configuration for the OTP verification screen */
  config?: OTPVerificationScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * OTPVerificationScreen - AI-optimized OTP verification screen template
 * 
 * A comprehensive OTP verification screen that handles code input,
 * validation, and resend functionality with proper user feedback.
 */
const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  onVerify,
  onResendOTP,
  onBack,
  contactInfo,
  verificationType,
  loading = false,
  error,
  resendCooldown = 30,
  config = {},
  style,
  testID = 'otp-verification-screen',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    title = 'Verify Your Account',
    subtitle,
    codeLength = 6,
    resendCooldown: configCooldown = resendCooldown,
    autoSubmit = true,
    showBackButton = true,
    instructions,
    headerComponent
  } = config;

  // Generate subtitle based on verification type
  const defaultSubtitle = `We sent a ${codeLength}-digit code to your ${verificationType === 'phone' ? 'phone' : 'email'}`;
  const displaySubtitle = subtitle || defaultSubtitle;

  // Generate instructions based on verification type
  const defaultInstructions = instructions || `Enter the ${codeLength}-digit code sent to ${contactInfo}`;

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleVerify = useCallback(async (otp: string) => {
    try {
      setLocalError(null);
      setLocalLoading(true);
      
      const verificationData: OTPVerificationData = {
        otp,
        contact: contactInfo,
        type: verificationType
      };
      
      await onVerify(verificationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setLocalError(errorMessage);
      Alert.alert('Verification Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [onVerify, contactInfo, verificationType]);

  const handleResendOTP = useCallback(async () => {
    if (!onResendOTP || countdown > 0) return;

    try {
      setLocalError(null);
      setResendLoading(true);
      await onResendOTP();
      setCountdown(configCooldown);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      setLocalError(errorMessage);
      Alert.alert('Resend Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  }, [onResendOTP, countdown, configCooldown]);

  const handleVerifyError = useCallback((errorMessage: string) => {
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
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
        <Text style={styles.instructions}>{defaultInstructions}</Text>
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

  const renderContactInfo = () => {
    return (
      <View style={styles.contactContainer} testID={`${testID}-contact-info`}>
        <Text style={styles.contactLabel}>
          Code sent to:
        </Text>
        <Text style={styles.contactInfo}>{contactInfo}</Text>
      </View>
    );
  };

  const renderResendSection = () => {
    if (!onResendOTP) return null;

    const canResend = countdown === 0;
    const isResendLoading = resendLoading;

    return (
      <View style={styles.resendContainer} testID={`${testID}-resend`}>
        <Text style={styles.resendText}>
          Didn't receive the code?
        </Text>
        
        {canResend ? (
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={isResendLoading || loading || localLoading}
            style={styles.resendButton}
            testID={`${testID}-resend-button`}
          >
            <Text style={[
              styles.resendLink,
              (isResendLoading || loading || localLoading) && styles.resendLinkDisabled
            ]}>
              {isResendLoading ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.resendCountdown}>
            Resend in {countdown}s
          </Text>
        )}
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

          {/* Contact Info */}
          {renderContactInfo()}

          {/* OTP Form */}
          <Card style={styles.formCard} testID={`${testID}-form-card`}>
            <OTPVerificationForm
              onVerify={handleVerify}
              onResendOTP={onResendOTP ? handleResendOTP : undefined}
              onError={handleVerifyError}
              contactInfo={contactInfo}
              verificationType={verificationType}
              loading={isLoading}
              codeLength={codeLength}
              autoSubmit={autoSubmit}
              style={styles.otpForm}
              testID={`${testID}-otp-form`}
            />
          </Card>

          {/* Resend Section */}
          <View style={styles.footerContainer}>
            {renderResendSection()}
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
    marginBottom: SPACING.sm,
  },
  instructions: {
    fontSize: TYPOGRAPHY.fontSize.sm,
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
  contactContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  contactLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  contactInfo: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  otpForm: {
    padding: SPACING.lg,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  resendContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  resendButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  resendLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  resendLinkDisabled: {
    color: COLORS.textSecondary,
  },
  resendCountdown: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default OTPVerificationScreen;
export type { 
  OTPVerificationScreenProps, 
  OTPVerificationScreenConfig, 
  OTPVerificationData, 
  VerificationType 
};
