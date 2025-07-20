import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useTheme} from '../context';

type AuthMode = 'login' | 'signup' | 'forgot-password';

interface AuthData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthScreenTemplateProps {
  mode?: AuthMode;
  appName?: string;
  onAuth?: (data: AuthData, mode: AuthMode) => void;
  onModeChange?: (mode: AuthMode) => void;
  loading?: boolean;
  socialLogin?: boolean;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => void;
  testIDPrefix?: string;
}

const AuthScreenTemplate: React.FC<AuthScreenTemplateProps> = ({
  mode = 'login',
  appName = 'Your App',
  onAuth,
  onModeChange,
  loading = false,
  socialLogin = true,
  onSocialLogin,
  testIDPrefix = '',
}) => {
  const {theme} = useTheme();
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Partial<AuthData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    logo: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
    },
    formContainer: {
      marginBottom: 30,
    },
    nameContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    nameInput: {
      width: '48%',
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      minHeight: 48,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
    },
    eyeButton: {
      position: 'absolute',
      right: 12,
      padding: 4,
    },
    eyeIcon: {
      fontSize: 20,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 8,
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: theme.colors.primary,
      fontSize: 14,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
      opacity: loading ? 0.6 : 1,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    socialContainer: {
      marginBottom: 30,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: 16,
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    socialIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    switchModeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    switchModeText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    switchModeButton: {
      marginLeft: 4,
    },
    switchModeButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  const updateField = (field: keyof AuthData, value: string) => {
    setAuthData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AuthData> = {};

    // Email validation
    if (!authData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (except for forgot password)
    if (mode !== 'forgot-password') {
      if (!authData.password) {
        newErrors.password = 'Password is required';
      } else if (authData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      // Signup specific validation
      if (mode === 'signup') {
        if (!authData.firstName?.trim()) {
          newErrors.firstName = 'First name is required';
        }

        if (!authData.lastName?.trim()) {
          newErrors.lastName = 'Last name is required';
        }

        if (!authData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (authData.password !== authData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (loading) return;

    if (validateForm()) {
      onAuth?.(authData, mode);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your account';
      case 'signup': return 'Join us today';
      case 'forgot-password': return 'Enter your email to reset password';
      default: return '';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    switch (mode) {
      case 'login': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Send Reset Link';
      default: return 'Submit';
    }
  };

  const renderSocialLogin = () => {
    if (!socialLogin || mode === 'forgot-password') return null;

    return (
      <View style={styles.socialContainer}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => onSocialLogin?.('google')}
          testID={`${testIDPrefix}google-login`}>
          <Text style={styles.socialIcon}>🔍</Text>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => onSocialLogin?.('apple')}
          testID={`${testIDPrefix}apple-login`}>
          <Text style={styles.socialIcon}>🍎</Text>
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderModeSwitch = () => {
    if (mode === 'forgot-password') {
      return (
        <View style={styles.switchModeContainer}>
          <Text style={styles.switchModeText}>Remember your password?</Text>
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => onModeChange?.('login')}
            testID={`${testIDPrefix}back-to-login`}>
            <Text style={styles.switchModeButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mode === 'login') {
      return (
        <View style={styles.switchModeContainer}>
          <Text style={styles.switchModeText}>Don't have an account?</Text>
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => onModeChange?.('signup')}
                            testID={`${testIDPrefix}switch-to-signup`}>
            <Text style={styles.switchModeButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.switchModeContainer}>
        <Text style={styles.switchModeText}>Already have an account?</Text>
        <TouchableOpacity
          style={styles.switchModeButton}
          onPress={() => onModeChange?.('login')}
                        testID={`${testIDPrefix}switch-to-login`}>
          <Text style={styles.switchModeButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        <Text style={styles.logo}>{appName}</Text>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        <View style={styles.formContainer}>
          {/* Name fields for signup */}
          {mode === 'signup' && (
            <View style={styles.nameContainer}>
              <View style={[styles.inputContainer, styles.nameInput]}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={authData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="First name"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="words"
                  testID={`${testIDPrefix}first-name-input`}
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={[styles.inputContainer, styles.nameInput]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={authData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Last name"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="words"
                  testID={`${testIDPrefix}last-name-input`}
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
            </View>
          )}

          {/* Email field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={authData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
                              testID={`${testIDPrefix}email-input`}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password fields */}
          {mode !== 'forgot-password' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    value={authData.password}
                    onChangeText={(value) => updateField('password', value)}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showPassword}
                    testID={`${testIDPrefix}password-input`}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                                          testID={`${testIDPrefix}toggle-password`}>
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm password for signup */}
              {mode === 'signup' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    value={authData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    placeholder="Confirm your password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showPassword}
                    testID={`${testIDPrefix}confirm-password-input`}
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>
              )}

              {/* Forgot password link */}
              {mode === 'login' && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => onModeChange?.('forgot-password')}
                  testID={`${testIDPrefix}forgot-password`}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          disabled={loading}
                          testID={`${testIDPrefix}submit-button`}>
          <Text style={styles.primaryButtonText}>{getButtonText()}</Text>
        </TouchableOpacity>

        {/* Social login */}
        {renderSocialLogin()}

        {/* Mode switch */}
        {renderModeSwitch()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreenTemplate; 