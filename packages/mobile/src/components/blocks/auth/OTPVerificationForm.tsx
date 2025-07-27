import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Properties for the OTPVerificationForm component
 * @interface OTPVerificationFormProps
 */
export interface OTPVerificationFormProps extends BaseComponentProps {
  /** Callback when OTP is verified */
  onVerify: (otp: string) => Promise<void>;
  /** Callback when resend OTP is requested */
  onResendOTP?: () => Promise<void>;
  /** Callback when back button is pressed */
  onBack?: () => void;
  /** Callback for error handling */
  onError?: (error: string) => void;
  /** Loading state for verification */
  loading?: boolean;
  /** Loading state for resend */
  resendLoading?: boolean;
  /** Number of OTP digits (default: 6) */
  length?: number;
  /** Phone number or email for display */
  contactInfo?: string;
  /** Type of verification (phone/email) */
  verificationType?: 'phone' | 'email';
  /** Custom title text */
  title?: string;
  /** Auto-submit when all digits are entered */
  autoSubmit?: boolean;
  /** Resend cooldown in seconds */
  resendCooldown?: number;
}

/**
 * OTPVerificationForm - AI-optimized OTP verification component
 * 
 * A comprehensive OTP verification form with digit inputs, resend functionality,
 * cooldown timer, and validation. Designed for phone and email verification.
 * 
 * @example
 * ```tsx
 * <OTPVerificationForm
 *   onVerify={(otp) => handleOTPVerification(otp)}
 *   onResendOTP={() => handleResendOTP()}
 *   contactInfo="+1 (555) 123-4567"
 *   verificationType="phone"
 *   autoSubmit={true}
 * />
 * ```
 */
const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  onVerify,
  onResendOTP,
  onBack,
  onError,
  loading = false,
  resendLoading = false,
  length = 6,
  contactInfo,
  verificationType = 'phone',
  title,
  autoSubmit = true,
  resendCooldown = 30,
  style,
  testID = 'otp-verification-form',
  ...props
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const [error, setError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Auto-generated title based on verification type
  const defaultTitle = title || `Verify Your ${verificationType === 'phone' ? 'Phone Number' : 'Email Address'}`;

  /**
   * Start resend cooldown timer
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  /**
   * Handles OTP input change
   */
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }

    // Auto-submit when all digits are filled
    if (autoSubmit && newOtp.every(digit => digit !== '') && !loading) {
      handleVerify(newOtp.join(''));
    }
  };

  /**
   * Handles key press for navigation
   */
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    }
  };

  /**
   * Handles OTP verification
   */
  const handleVerify = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join('');
    
    if (codeToVerify.length !== length) {
      setError(`Please enter all ${length} digits`);
      return;
    }

    try {
      await onVerify(codeToVerify);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Clear OTP on error
      setOtp(new Array(length).fill(''));
      inputRefs.current[0]?.focus();
      setActiveInput(0);
    }
  };

  /**
   * Handles resend OTP
   */
  const handleResendOTP = async () => {
    if (!onResendOTP || resendTimer > 0) return;

    try {
      await onResendOTP();
      setResendTimer(resendCooldown);
      setError('');
      
      Alert.alert(
        'Code Sent',
        `A new verification code has been sent to your ${verificationType}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  /**
   * Clears OTP and focuses first input
   */
  const handleClear = () => {
    setOtp(new Array(length).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
    setActiveInput(0);
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    card: {
      padding: SPACING.lg,
      margin: SPACING.md,
      alignItems: 'center',
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
    contactInfo: {
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.primary[600],
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    otpInput: {
      width: 45,
      height: 55,
      borderWidth: 2,
      borderColor: COLORS.neutral[300],
      borderRadius: 8,
      textAlign: 'center',
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      backgroundColor: COLORS.neutral[50],
    },
    otpInputActive: {
      borderColor: COLORS.primary[500],
      backgroundColor: COLORS.primary[50],
    },
    otpInputFilled: {
      borderColor: COLORS.primary[600],
      backgroundColor: COLORS.primary[100],
    },
    errorText: {
              color: COLORS.error[600],
      fontSize: TYPOGRAPHY.fontSize.sm,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },
    buttonContainer: {
      width: '100%',
      gap: SPACING.sm,
    },
    verifyButton: {
      backgroundColor: COLORS.primary[600],
    },
    resendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.md,
      gap: SPACING.xs,
    },
    resendText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[600],
    },
    resendButton: {
      padding: 0,
      backgroundColor: 'transparent',
    },
    resendButtonText: {
      color: COLORS.primary[600],
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      textDecorationLine: 'underline',
    },
    resendButtonDisabled: {
      color: COLORS.neutral[400],
      textDecorationLine: 'none',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: SPACING.md,
    },
    clearButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.neutral[300],
      paddingHorizontal: SPACING.md,
    },
    clearButtonText: {
      color: COLORS.neutral[600],
    },
    backButton: {
      backgroundColor: 'transparent',
    },
    backButtonText: {
      color: COLORS.primary[600],
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      <Card style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{defaultTitle}</Text>
          <Text style={styles.description}>
            We've sent a {length}-digit code to{' '}
            {contactInfo && <Text style={styles.contactInfo}>{contactInfo}</Text>}
            {!contactInfo && `your ${verificationType}`}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                activeInput === index && styles.otpInputActive,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, '').slice(0, 1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setActiveInput(index)}
              keyboardType="numeric"
              maxLength={1}
              editable={!loading}
              testID={`otp-input-${index}`}
            />
          ))}
        </View>

        {/* Error Message */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Verify Button */}
        {!autoSubmit && (
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => handleVerify()}
              disabled={loading || otp.some(digit => !digit)}
              style={styles.verifyButton}
              testID="verify-button"
            >
              <Text>{loading ? 'Verifying...' : 'Verify Code'}</Text>
            </Button>
          </View>
        )}

        {/* Resend Code */}
        {onResendOTP && (
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendTimer > 0 || resendLoading}
              style={styles.resendButton}
              testID="resend-button"
            >
              <Text style={[
                styles.resendButtonText,
                (resendTimer > 0 || resendLoading) && styles.resendButtonDisabled
              ]}>
                {resendLoading ? 'Sending...' : 
                 resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            onPress={handleClear}
            disabled={loading}
            style={styles.clearButton}
            testID="clear-button"
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </Button>

          {onBack && (
            <Button
              onPress={onBack}
              disabled={loading}
              style={styles.backButton}
              testID="back-button"
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Button>
          )}
        </View>
      </Card>
    </View>
  );
};

export default OTPVerificationForm;
export type { OTPVerificationFormProps }; 