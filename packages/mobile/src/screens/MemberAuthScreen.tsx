import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Alert } from '../utils/alert';
import { useTheme } from '../context/ThemeContext';
import { wixApiClient } from '../utils/wixApiClient';
import { useMember } from '../context';

interface MemberAuthScreenProps {
  // Add any props if needed
}

const MemberAuthScreen: React.FC<MemberAuthScreenProps> = () => {
  const { theme } = useTheme();
  const { isLoggedIn, member, loading: memberLoading, refreshMemberStatus, logout } = useMember();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const styles = createStyles(theme);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('👤 [MEMBER AUTH SCREEN] Attempting login...');
      const response = await wixApiClient.loginMember(email, password);
      
      if (response && response.state === 'SUCCESS') {
        // Immediate refresh for faster UI update
        setTimeout(refreshMemberStatus, 50);
        
        Alert.alert('Success', 'Logged in successfully!', [
          { text: 'OK', onPress: () => {
            // Additional refresh to ensure state is updated
            setTimeout(refreshMemberStatus, 100);
          }}
        ]);
        setEmail('');
        setPassword('');
      } else if (response && response.state === 'REQUIRE_EMAIL_VERIFICATION') {
        Alert.alert('Email Verification Required', 'Please check your email and verify your account before logging in.');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('❌ [MEMBER AUTH SCREEN] Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      console.log('👤 [MEMBER AUTH SCREEN] Attempting signup...');
      const response = await wixApiClient.registerMember(email, password, {
        firstName,
        lastName,
        privacyStatus: 'PRIVATE',
      });
      
      if (response && response.state === 'SUCCESS') {
        // Immediate refresh for faster UI update
        setTimeout(refreshMemberStatus, 50);
        
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => {
            // Additional refresh to ensure state is updated
            setTimeout(refreshMemberStatus, 100);
          }}
        ]);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
      } else if (response && response.state === 'REQUIRE_EMAIL_VERIFICATION') {
        Alert.alert('Email Verification Required', 'Please check your email and verify your account to complete registration.');
      } else {
        Alert.alert('Signup Failed', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('❌ [MEMBER AUTH SCREEN] Signup error:', error);
      Alert.alert('Error', 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', 'Logged out successfully!');
            } catch (error) {
              console.error('❌ [MEMBER AUTH SCREEN] Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
  };

  if (isLoggedIn && member) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <ScrollView style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>👤 Member Profile</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {member.identityProfile?.firstName?.charAt(0)?.toUpperCase() || 
                   member.email?.address?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {member.identityProfile?.firstName && member.identityProfile?.lastName
                    ? `${member.identityProfile.firstName} ${member.identityProfile.lastName}`
                    : member.identityProfile?.firstName || member.identityProfile?.lastName || 'User'
                  }
                </Text>
                <Text style={styles.profileEmail}>{member.email?.address}</Text>
                <View style={[
                  styles.statusBadge,
                  member.email?.isVerified ? styles.verifiedBadge : styles.unverifiedBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    member.email?.isVerified ? styles.verifiedText : styles.unverifiedText
                  ]}>
                    {member.email?.isVerified ? '✅ Verified' : '⚠️ Unverified'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Member ID</Text>
                <Text style={styles.detailValue}>{member.id?.slice(-8) || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{member.status?.name || 'Unknown'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Privacy</Text>
                <Text style={styles.detailValue}>
                  {member.identityProfile?.privacyStatus || 'Not Set'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {isLogin ? '🔐 Member Login' : '✨ Join as Member'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin 
                ? 'Access your personalized experience'
                : 'Create your account to get started'
              }
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <>
                <View style={styles.nameRow}>
                  <View style={styles.nameInput}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="John"
                      placeholderTextColor="#999"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.nameInput}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Doe"
                      placeholderTextColor="#999"
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={isLogin ? "Enter your password" : "Create a password (8+ characters)"}
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={isLogin ? handleLogin : handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? '🔐 Login' : '✨ Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchModeButton} onPress={toggleMode}>
              <Text style={styles.switchModeText}>
                {isLogin 
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Login"
                }
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              🔒 Your data is protected with enterprise-grade security
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 4,
    marginBottom: 20,
    shadowColor: theme.colors.text + '40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nameInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchModeText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: theme.colors.primary + '20',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Profile styles
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 4,
    marginBottom: 20,
    shadowColor: theme.colors.text + '40',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    paddingTop: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
    lineHeight: 28,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: theme.colors.success + '20',
  },
  unverifiedBadge: {
    backgroundColor: theme.colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedText: {
    color: theme.colors.success,
  },
  unverifiedText: {
    color: theme.colors.error,
  },
  profileDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    marginTop: 8,
    marginHorizontal: 4,
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default MemberAuthScreen; 