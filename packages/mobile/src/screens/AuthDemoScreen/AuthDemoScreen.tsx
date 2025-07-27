import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useTheme } from '../../context';
import { 
  LoginForm, 
  SignupForm, 
  ForgotPasswordForm, 
  OTPVerificationForm, 
  ProfileCard, 
  SocialLoginButtons,
  type LoginFormProps, 
  type SignupFormProps,
  type ForgotPasswordFormProps,
  type OTPVerificationFormProps,
  type ProfileCardProps,
  type SocialLoginButtonsProps,
  type SocialProvider,
  type User
} from '../../components/blocks/auth';

interface AuthDemoScreenProps {
  onBack?: () => void;
}

type DemoMode = 'login' | 'signup' | 'forgot' | 'otp' | 'profile' | 'social';

const AuthDemoScreen: React.FC<AuthDemoScreenProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [activeMode, setActiveMode] = useState<DemoMode>('login');
  const [loading, setLoading] = useState(false);

  // Mock user data for profile demo
  const mockUser: User = {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Demo handlers
  const handleLoginSuccess = async (data: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Login Success', `Welcome back! Email: ${data.email}`, [{ text: 'OK' }]);
    }, 1500);
  };

  const handleLoginError = (error: string) => {
    Alert.alert('Login Error', error, [{ text: 'OK' }]);
  };

  const handleSignupSuccess = async (data: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Signup Success', `Account created for ${data.email}!`, [{ text: 'OK' }]);
    }, 1500);
  };

  const handleSignupError = (error: string) => {
    Alert.alert('Signup Error', error, [{ text: 'OK' }]);
  };

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Reset Email Sent', `Password reset instructions sent to ${email}`, [{ text: 'OK' }]);
    }, 1500);
  };

  const handleOTPVerification = async (otp: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otp === '123456') {
        Alert.alert('Verification Success', 'Your account has been verified!', [{ text: 'OK' }]);
      } else {
        throw new Error('Invalid verification code. Try 123456.');
      }
    }, 1000);
  };

  const handleOTPResend = async () => {
    Alert.alert('Code Resent', 'A new verification code has been sent.', [{ text: 'OK' }]);
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    Alert.alert('Social Login', `Connecting with ${provider}...`, [{ text: 'OK' }]);
  };

  const handleProfileEdit = () => {
    Alert.alert('Profile Edit', 'Navigate to profile edit screen...', [{ text: 'OK' }]);
  };

  const handleAvatarPress = () => {
    Alert.alert('Avatar', 'Open avatar picker...', [{ text: 'OK' }]);
  };

  const demoModes = [
    { key: 'login', title: 'Login', icon: '🔐', description: 'Email/password authentication' },
    { key: 'signup', title: 'Signup', icon: '📝', description: 'User registration form' },
    { key: 'forgot', title: 'Reset', icon: '🔑', description: 'Password recovery' },
    { key: 'otp', title: 'OTP', icon: '📱', description: 'Code verification' },
    { key: 'profile', title: 'Profile', icon: '👤', description: 'User profile card' },
    { key: 'social', title: 'Social', icon: '🌐', description: 'Social login options' }
  ];

  const renderDemoComponent = () => {
    const componentStyle = { marginBottom: 40 };

    switch (activeMode) {
      case 'login':
        return (
          <View style={componentStyle}>
            <Text style={styles.componentTitle}>🔐 LoginForm Component</Text>
            <Text style={styles.componentDescription}>
              Complete login form with validation, social login, and forgot password options.
            </Text>
            <LoginForm
              onLogin={handleLoginSuccess}
              onError={handleLoginError}
              onSocialLogin={handleSocialLogin}
              socialLogin={true}
              showForgotPassword={true}
              showRememberMe={true}
              loading={loading}
            />
          </View>
        );

      case 'signup':
        return (
          <View style={componentStyle}>
            <Text style={styles.componentTitle}>📝 SignupForm Component</Text>
            <Text style={styles.componentDescription}>
              Comprehensive registration form with password strength, terms acceptance, and social signup.
            </Text>
            <SignupForm
              onSignup={handleSignupSuccess}
              onError={handleSignupError}
              onSocialSignup={handleSocialLogin}
              socialSignup={true}
              requireTerms={true}
              requireNames={true}
              enablePasswordStrength={true}
              loading={loading}
            />
          </View>
        );

      case 'forgot':
        return (
          <View style={componentStyle}>
            <Text style={styles.componentTitle}>🔑 ForgotPasswordForm Component</Text>
            <Text style={styles.componentDescription}>
              Password reset form with email validation and success/error states.
            </Text>
            <ForgotPasswordForm
              onResetRequest={handleForgotPassword}
              onBack={() => setActiveMode('login')}
              loading={loading}
              showBackButton={true}
            />
          </View>
        );

      case 'otp':
        return (
          <View style={componentStyle}>
            <Text style={styles.componentTitle}>📱 OTPVerificationForm Component</Text>
            <Text style={styles.componentDescription}>
              6-digit OTP verification with auto-submit, resend functionality, and timer.
              Try entering: 123456
            </Text>
            <OTPVerificationForm
              onVerify={handleOTPVerification}
              onResendOTP={handleOTPResend}
              onBack={() => setActiveMode('signup')}
              contactInfo="+1 (555) 123-4567"
              verificationType="phone"
              autoSubmit={true}
              loading={loading}
            />
          </View>
        );

      case 'profile':
        return (
          <View style={componentStyle}>
            <Text style={styles.componentTitle}>👤 ProfileCard Component</Text>
            <Text style={styles.componentDescription}>
              User profile display with avatar, information, edit button, and optional stats.
            </Text>
            <ProfileCard
              user={mockUser}
              onEdit={handleProfileEdit}
              onAvatarPress={handleAvatarPress}
              showEditButton={true}
              showStatus={true}
              avatarSize={100}
            />
          </View>
        );

      case 'social':
        return (
          <View style={componentStyle}>
            <Text style={styles.componentTitle}>🌐 SocialLoginButtons Component</Text>
            <Text style={styles.componentDescription}>
              Social authentication buttons with multiple providers, loading states, and layouts.
            </Text>
            <SocialLoginButtons
              onSocialLogin={handleSocialLogin}
              providers={['google', 'apple', 'facebook', 'twitter']}
              orientation="vertical"
              showDivider={true}
            />
            
            <Text style={[styles.componentDescription, { marginTop: 20, marginBottom: 10 }]}>
              Horizontal layout example:
            </Text>
            <SocialLoginButtons
              onSocialLogin={handleSocialLogin}
              providers={['google', 'apple']}
              orientation="horizontal"
              showDivider={false}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    tabContainer: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabScroll: {
      paddingHorizontal: 8,
    },
    tabsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 80,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabIcon: {
      fontSize: 16,
      marginBottom: 4,
    },
    tabText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    tabTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    tabDescription: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    tabDescriptionActive: {
      color: '#ffffff',
      opacity: 0.9,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    componentTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    componentDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
      paddingHorizontal: 16,
    },
    demoNote: {
      backgroundColor: theme.colors.primary + '10',
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    demoNoteTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    demoNoteText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    stats: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 8,
      marginTop: 20,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔐 Authentication Components</Text>
        <Text style={styles.headerSubtitle}>
          Complete showcase of our AI-optimized authentication block components
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          <View style={styles.tabsRow}>
            {demoModes.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.tab,
                  activeMode === mode.key && styles.tabActive,
                ]}
                onPress={() => setActiveMode(mode.key as DemoMode)}
              >
                <Text style={styles.tabIcon}>{mode.icon}</Text>
                <Text style={[
                  styles.tabText,
                  activeMode === mode.key && styles.tabTextActive,
                ]}>
                  {mode.title}
                </Text>
                <Text style={[
                  styles.tabDescription,
                  activeMode === mode.key && styles.tabDescriptionActive,
                ]}>
                  {mode.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Demo Instructions */}
        <View style={styles.demoNote}>
          <Text style={styles.demoNoteTitle}>🚀 Interactive Demo</Text>
          <Text style={styles.demoNoteText}>
            These are fully functional components! Try interacting with forms, buttons, and inputs. 
            All validation and state management works as expected in a real app.
          </Text>
        </View>

        {/* Active Component Demo */}
        {renderDemoComponent()}

        {/* Component Stats */}
        <View style={styles.stats}>
          <Text style={styles.statsTitle}>📊 Authentication Library Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Components</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>TypeScript</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15+</Text>
              <Text style={styles.statLabel}>Social Providers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>∞</Text>
              <Text style={styles.statLabel}>AI Ready</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthDemoScreen; 