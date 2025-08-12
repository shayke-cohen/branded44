/**
 * AuthForm - Reusable authentication form component
 * 
 * Handles both login and registration forms with validation
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createAuthStyles } from '../../shared/styles/AuthStyles';

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onFirstNameChange: (name: string) => void;
  onLastNameChange: (name: string) => void;
  fieldErrors: Record<string, string | undefined>;
  passwordStrength: 'weak' | 'medium' | 'strong';
  style?: any;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  email,
  password,
  confirmPassword,
  firstName,
  lastName,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  fieldErrors,
  passwordStrength,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createAuthStyles(theme);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return styles.passwordStrengthWeak;
      case 'medium': return styles.passwordStrengthMedium;
      case 'strong': return styles.passwordStrengthStrong;
      default: return styles.passwordStrengthWeak;
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  };

  return (
    <View style={[styles.formContainer, style]}>
      {/* Name fields (registration only) */}
      {!isLogin && (
        <View style={styles.nameFieldsRow}>
          <View style={[styles.formField, styles.nameField]}>
            <Text style={styles.formLabel}>First Name</Text>
            <TextInput
              style={[
                styles.formInput,
                fieldErrors.firstName && styles.formInputError,
              ]}
              value={firstName}
              onChangeText={onFirstNameChange}
              placeholder="Enter first name"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {fieldErrors.firstName && (
              <Text style={styles.formErrorText}>{fieldErrors.firstName}</Text>
            )}
          </View>

          <View style={[styles.formField, styles.nameField]}>
            <Text style={styles.formLabel}>Last Name</Text>
            <TextInput
              style={[
                styles.formInput,
                fieldErrors.lastName && styles.formInputError,
              ]}
              value={lastName}
              onChangeText={onLastNameChange}
              placeholder="Enter last name"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {fieldErrors.lastName && (
              <Text style={styles.formErrorText}>{fieldErrors.lastName}</Text>
            )}
          </View>
        </View>
      )}

      {/* Email field */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Email Address</Text>
        <TextInput
          style={[
            styles.formInput,
            fieldErrors.email && styles.formInputError,
          ]}
          value={email}
          onChangeText={onEmailChange}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <Text style={styles.formErrorText}>{fieldErrors.email}</Text>
        )}
      </View>

      {/* Password field */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Password</Text>
        <TextInput
          style={[
            styles.formInput,
            fieldErrors.password && styles.formInputError,
          ]}
          value={password}
          onChangeText={onPasswordChange}
          placeholder={isLogin ? "Enter your password" : "Create a password"}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        {fieldErrors.password && (
          <Text style={styles.formErrorText}>{fieldErrors.password}</Text>
        )}

        {/* Password strength indicator (registration only) */}
        {!isLogin && password.length > 0 && (
          <View style={styles.passwordStrength}>
            <View style={styles.passwordStrengthBar}>
              <View 
                style={[
                  styles.passwordStrengthFill,
                  getPasswordStrengthColor(),
                  { width: getPasswordStrengthWidth() }
                ]} 
              />
            </View>
            <Text style={styles.passwordStrengthText}>
              Password strength: {passwordStrength}
            </Text>
          </View>
        )}
      </View>

      {/* Confirm password field (registration only) */}
      {!isLogin && (
        <View style={styles.formField}>
          <Text style={styles.formLabel}>Confirm Password</Text>
          <TextInput
            style={[
              styles.formInput,
              fieldErrors.confirmPassword && styles.formInputError,
            ]}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            placeholder="Confirm your password"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <Text style={styles.formErrorText}>{fieldErrors.confirmPassword}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default AuthForm;
