import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps, SocialProvider } from '../../../lib/types';

/**
 * Properties for the SocialLoginButtons component
 */
export interface SocialLoginButtonsProps extends Omit<BaseComponentProps, 'loading'> {
  /** Callback when social login is pressed */
  onSocialLogin: (provider: SocialProvider) => void;
  /** Loading states for each provider */
  loading?: Partial<Record<SocialProvider, boolean>>;
  /** Which providers to show */
  providers?: SocialProvider[];
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Show divider with "or" text */
  showDivider?: boolean;
}

/**
 * SocialLoginButtons - AI-optimized social authentication component
 * 
 * A comprehensive social login component with multiple providers,
 * loading states, and customizable layout.
 * 
 * @example
 * ```tsx
 * <SocialLoginButtons
 *   onSocialLogin={(provider) => handleSocialAuth(provider)}
 *   providers={['google', 'apple', 'facebook']}
 *   loading={{ google: isGoogleLoading }}
 *   orientation="vertical"
 *   showDivider={true}
 * />
 * ```
 */
const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSocialLogin,
  loading = {},
  providers = ['google', 'apple', 'facebook', 'twitter'],
  orientation = 'vertical',
  showDivider = true,
  style,
  testID = 'social-login-buttons',
  ...props
}) => {
  const providerConfig = {
    google: {
      name: 'Google',
      icon: 'G',
      backgroundColor: '#4285f4',
      textColor: '#ffffff',
    },
    apple: {
      name: 'Apple',
      icon: '',
      backgroundColor: '#000000',
      textColor: '#ffffff',
    },
    facebook: {
      name: 'Facebook',
      icon: 'f',
      backgroundColor: '#1877f2',
      textColor: '#ffffff',
    },
    twitter: {
      name: 'Twitter',
      icon: '𝕏',
      backgroundColor: '#000000',
      textColor: '#ffffff',
    },
    github: {
      name: 'GitHub',
      icon: '',
      backgroundColor: '#24292e',
      textColor: '#ffffff',
    },
    linkedin: {
      name: 'LinkedIn',
      icon: 'in',
      backgroundColor: '#0077b5',
      textColor: '#ffffff',
    },
  };

  const handleProviderPress = (provider: SocialProvider) => {
    if (!loading[provider]) {
      onSocialLogin(provider);
    }
  };

  const renderButton = (provider: SocialProvider) => {
    const config = providerConfig[provider];
    if (!config) return null;

    const isLoading = loading[provider];
    
    return (
      <TouchableOpacity
        key={provider}
        style={[
          styles.socialButton,
          { backgroundColor: config.backgroundColor },
          isLoading && styles.socialButtonLoading,
          orientation === 'horizontal' && styles.socialButtonHorizontal,
        ]}
        onPress={() => handleProviderPress(provider)}
        disabled={isLoading}
        testID={`${provider}-login-button`}
      >
        <Text style={[styles.socialIcon, { color: config.textColor }]}>
          {config.icon}
        </Text>
        <Text style={[styles.socialText, { color: config.textColor }]}>
          {isLoading ? 'Loading...' : `Continue with ${config.name}`}
        </Text>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: SPACING.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: COLORS.neutral[300],
    },
    dividerText: {
      marginHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[500],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    buttonsContainer: {
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      gap: SPACING.sm,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: 8,
      marginBottom: orientation === 'vertical' ? SPACING.sm : 0,
    },
    socialButtonHorizontal: {
      flex: 1,
      paddingHorizontal: SPACING.sm,
    },
    socialButtonLoading: {
      opacity: 0.7,
    },
    socialIcon: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      marginRight: SPACING.sm,
      minWidth: 20,
      textAlign: 'center',
    },
    socialText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textAlign: 'center',
      flex: orientation === 'horizontal' ? 0 : 1,
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      {/* Divider */}
      {showDivider && (
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      {/* Social Buttons */}
      <View style={styles.buttonsContainer}>
        {providers.map(renderButton)}
      </View>
    </View>
  );
};

export default SocialLoginButtons; 