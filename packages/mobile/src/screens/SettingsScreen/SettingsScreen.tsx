import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Alert } from '../../utils/alert';
import {useTheme} from '../../context/ThemeContext';
import {useMember} from '../../context';
import {wixApiClient} from '../../utils/wixApiClient';
import {THEME_OPTIONS} from '../../constants';


const SettingsScreen = () => {
  const {theme, themeMode, setThemeMode, isDark} = useTheme();
  const {isLoggedIn, member, getMemberDisplayName, logout, refreshMemberStatus} = useMember();
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      `Are you sure you want to logout, ${getMemberDisplayName()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', 'You have been logged out successfully.');
            } catch (error) {
              console.error('❌ [SETTINGS] Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoginLoading(true);
    try {
      console.log('👤 [SETTINGS] Attempting login...');
      const response = await wixApiClient.loginMember(email, password);
      
      if (response && response.state === 'SUCCESS') {
        refreshMemberStatus();
        setEmail('');
        setPassword('');
        Alert.alert('Success', `Welcome back, ${getMemberDisplayName()}!`);
      } else if (response && response.state === 'REQUIRE_EMAIL_VERIFICATION') {
        Alert.alert('Email Verification Required', 'Please check your email and verify your account before logging in.');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('❌ [SETTINGS] Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 15,
    },
    optionContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    radioButtonInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    infoSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    currentThemeIndicator: {
      backgroundColor: isDark ? theme.colors.primary : theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 10,
    },
    currentThemeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    // Member Account Styles
    memberInfoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    memberInfoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memberInfoAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    memberInfoAvatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    memberInfoDetails: {
      flex: 1,
    },
    memberInfoName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    memberInfoEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    memberInfoBadge: {
      alignSelf: 'flex-start',
      backgroundColor: isDark ? theme.colors.primary + '30' : theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    memberInfoBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    logoutButton: {
      backgroundColor: '#fee',
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#fcc',
      shadowColor: '#f44',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#d32f2f',
      marginBottom: 2,
    },
    logoutButtonDescription: {
      fontSize: 14,
      color: '#d32f2f',
      opacity: 0.8,
    },
    // Login Section Styles
    loginCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
    },
    loginHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    loginTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    loginSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    loginForm: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    loginInput: {
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      marginBottom: 4,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginTop: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    loginButtonContent: {
      alignItems: 'center',
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 2,
    },
    loginButtonDescription: {
      fontSize: 12,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    loginFooter: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    loginFooterText: {
      fontSize: 12,
      color: theme.colors.primary,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section - Only show if member is logged in */}
        {isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <View style={styles.memberInfoCard}>
              <View style={styles.memberInfoHeader}>
                <View style={styles.memberInfoAvatar}>
                  <Text style={styles.memberInfoAvatarText}>
                    {member?.identityProfile?.firstName?.charAt(0)?.toUpperCase() || 
                     member?.email?.address?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.memberInfoDetails}>
                  <Text style={styles.memberInfoName}>{getMemberDisplayName()}</Text>
                  <Text style={styles.memberInfoEmail}>{member?.email?.address}</Text>
                  <View style={styles.memberInfoBadge}>
                    <Text style={styles.memberInfoBadgeText}>
                      {member?.email?.isVerified ? '✅ Verified' : '⚠️ Unverified'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <View style={styles.option}>
                <View style={styles.optionContent}>
                  <Text style={styles.logoutButtonText}>🚪 Logout</Text>
                  <Text style={styles.logoutButtonDescription}>
                    Sign out of your account
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Login Section - Only show if member is logged out */}
        {!isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <View style={styles.loginCard}>
              <View style={styles.loginHeader}>
                <Text style={styles.loginTitle}>🔐 Member Login</Text>
                <Text style={styles.loginSubtitle}>
                  Sign in to access your personalized settings
                </Text>
              </View>

              <View style={styles.loginForm}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.loginInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.loginInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View style={styles.loginButtonContent}>
                      <Text style={styles.loginButtonText}>🔐 Login</Text>
                      <Text style={styles.loginButtonDescription}>
                        Access your account
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.loginFooter}>
                <Text style={styles.loginFooterText}>
                  💡 Don't have an account? Use the Account tab to sign up.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          {THEME_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={styles.optionContainer}
              onPress={() => setThemeMode(option.key)}>
              <View style={styles.option}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    themeMode === option.key && styles.radioButtonSelected,
                  ]}>
                  {themeMode === option.key && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Current Theme</Text>
          <Text style={styles.infoText}>
            You are currently using the{' '}
            <Text style={{fontWeight: '600'}}>
              {themeMode === 'system' 
                ? `system (${isDark ? 'dark' : 'light'})` 
                : themeMode}
            </Text>{' '}
            theme. The app will automatically adapt its colors and appearance
            based on your selection.
          </Text>
          <View style={styles.currentThemeIndicator}>
            <Text style={styles.currentThemeText}>
              {isDark ? 'DARK MODE' : 'LIGHT MODE'}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About</Text>
          <Text style={styles.infoText}>
            This is a simple todo app with dark mode support. The app respects
            your system preferences when set to "System" mode and provides
            manual override options for light and dark themes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;