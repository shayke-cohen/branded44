/**
 * SecurityScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive security settings screen template that combines the SecuritySettings block
 * with password management, two-factor authentication, and security monitoring.
 * 
 * Features:
 * - SecuritySettings integration with comprehensive options
 * - Password change and strength requirements
 * - Two-factor authentication setup and management
 * - Security notifications and alerts
 * - Active sessions monitoring and management
 * - Login history and activity tracking
 * - App-specific passwords management
 * - Security questions setup
 * - Device trust management
 * - Account recovery options
 * - Privacy controls and data protection
 * - Suspicious activity monitoring
 * - Security recommendations
 * 
 * @example
 * ```tsx
 * <SecurityScreen
 *   user={currentUser}
 *   securitySettings={securitySettings}
 *   activeSessions={activeSessions}
 *   loginHistory={loginHistory}
 *   onUpdateSecurity={(setting, value) => handleSecurityUpdate(setting, value)}
 *   onChangePassword={() => navigation.navigate('ChangePassword')}
 *   onSetupTwoFactor={() => navigation.navigate('TwoFactorSetup')}
 *   onRevokeSession={(sessionId) => handleRevokeSession(sessionId)}
 *   loading={securityLoading}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl 
} from 'react-native';
import { SecuritySettings } from '../../blocks/auth';
import type { SecuritySettingsProps } from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Switch } from '../../../../~/components/ui/switch';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { Check } from '../../../../~/lib/icons/Check';
import { X } from '../../../../~/lib/icons/X';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps, UserProfile } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Security setting types
 */
export type SecuritySettingKey = 
  | 'twoFactorAuth'
  | 'loginNotifications'
  | 'securityAlerts'
  | 'sessionTimeout'
  | 'deviceTrust'
  | 'appPasswords'
  | 'recoveryEmail'
  | 'securityQuestions';

/**
 * Security setting configuration
 */
export interface SecuritySetting {
  /** Setting key */
  key: SecuritySettingKey;
  /** Setting title */
  title: string;
  /** Setting description */
  description: string;
  /** Current value */
  value: any;
  /** Setting type */
  type: 'toggle' | 'navigation' | 'select' | 'action';
  /** Is enabled */
  enabled?: boolean;
  /** Navigation destination */
  destination?: string;
  /** Action callback */
  onPress?: () => void;
  /** Badge text */
  badge?: string;
  /** Is recommended */
  recommended?: boolean;
}

/**
 * Active session information
 */
export interface ActiveSession {
  /** Session ID */
  id: string;
  /** Device name */
  device: string;
  /** Device type */
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'other';
  /** Browser/app information */
  browser?: string;
  /** IP address */
  ipAddress: string;
  /** Location */
  location?: string;
  /** Last activity */
  lastActivity: Date;
  /** Is current session */
  isCurrent: boolean;
  /** Session creation date */
  createdAt: Date;
}

/**
 * Login history item
 */
export interface LoginHistoryItem {
  /** Activity ID */
  id: string;
  /** Activity type */
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'device_added';
  /** Activity description */
  description: string;
  /** Activity timestamp */
  timestamp: Date;
  /** IP address */
  ipAddress?: string;
  /** Device information */
  device?: string;
  /** Location */
  location?: string;
  /** Success status */
  success: boolean;
}

/**
 * Security recommendation
 */
export interface SecurityRecommendation {
  /** Recommendation ID */
  id: string;
  /** Recommendation title */
  title: string;
  /** Recommendation description */
  description: string;
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
  /** Action text */
  actionText: string;
  /** Action callback */
  onAction: () => void;
  /** Is completed */
  completed?: boolean;
}

/**
 * Security screen configuration
 */
export interface SecurityScreenConfig {
  /** Show password section */
  showPasswordSection?: boolean;
  /** Show two-factor section */
  showTwoFactorSection?: boolean;
  /** Show sessions section */
  showSessionsSection?: boolean;
  /** Show login history */
  showLoginHistory?: boolean;
  /** Show security recommendations */
  showRecommendations?: boolean;
  /** Show privacy controls */
  showPrivacyControls?: boolean;
  /** Maximum sessions to display */
  maxSessionsDisplay?: number;
  /** Maximum history items to display */
  maxHistoryDisplay?: number;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the SecurityScreen template
 */
export interface SecurityScreenProps extends BaseComponentProps {
  /** Current user */
  user: UserProfile;
  /** Security settings */
  securitySettings?: Record<SecuritySettingKey, any>;
  /** Active sessions */
  activeSessions?: ActiveSession[];
  /** Login history */
  loginHistory?: LoginHistoryItem[];
  /** Security recommendations */
  recommendations?: SecurityRecommendation[];
  /** Callback when security setting changes */
  onUpdateSecurity?: (key: SecuritySettingKey, value: any) => Promise<void> | void;
  /** Callback when password change is requested */
  onChangePassword?: () => void;
  /** Callback when two-factor setup is requested */
  onSetupTwoFactor?: () => void;
  /** Callback when session is revoked */
  onRevokeSession?: (sessionId: string) => Promise<void> | void;
  /** Callback when all sessions are revoked */
  onRevokeAllSessions?: () => Promise<void> | void;
  /** Callback when recommendation action is taken */
  onRecommendationAction?: (recommendationId: string) => Promise<void> | void;
  /** Callback for refresh */
  onRefresh?: () => Promise<void> | void;
  /** Loading state */
  loading?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the security screen */
  config?: SecurityScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SecurityScreen - AI-optimized security settings screen template
 * 
 * A comprehensive security screen that provides complete security
 * management with monitoring, recommendations, and best practices.
 */
const SecurityScreen: React.FC<SecurityScreenProps> = ({
  user,
  securitySettings = {},
  activeSessions = [],
  loginHistory = [],
  recommendations = [],
  onUpdateSecurity,
  onChangePassword,
  onSetupTwoFactor,
  onRevokeSession,
  onRevokeAllSessions,
  onRecommendationAction,
  onRefresh,
  loading = false,
  refreshing = false,
  error,
  config = {},
  style,
  testID = 'security-screen',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState<Record<string, boolean>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    showPasswordSection = true,
    showTwoFactorSection = true,
    showSessionsSection = true,
    showLoginHistory = true,
    showRecommendations = true,
    showPrivacyControls = true,
    maxSessionsDisplay = 5,
    maxHistoryDisplay = 10,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSecurityUpdate = useCallback(async (key: SecuritySettingKey, value: any) => {
    if (!onUpdateSecurity) return;

    try {
      setLocalError(null);
      setLocalLoading(prev => ({ ...prev, [key]: true }));
      await onUpdateSecurity(key, value);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Security update failed';
      setLocalError(errorMessage);
      Alert.alert('Security Error', errorMessage);
    } finally {
      setLocalLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [onUpdateSecurity]);

  const handleRevokeSession = useCallback(async (sessionId: string) => {
    if (!onRevokeSession) return;

    Alert.alert(
      'Revoke Session',
      'This will sign out this device. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLocalLoading(prev => ({ ...prev, [`session_${sessionId}`]: true }));
              await onRevokeSession(sessionId);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Session revoke failed';
              Alert.alert('Error', errorMessage);
            } finally {
              setLocalLoading(prev => ({ ...prev, [`session_${sessionId}`]: false }));
            }
          }
        }
      ]
    );
  }, [onRevokeSession]);

  const handleRevokeAllSessions = useCallback(async () => {
    if (!onRevokeAllSessions) return;

    Alert.alert(
      'Revoke All Sessions',
      'This will sign out all devices except this one. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke All', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLocalLoading(prev => ({ ...prev, revokeAll: true }));
              await onRevokeAllSessions();
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to revoke sessions';
              Alert.alert('Error', errorMessage);
            } finally {
              setLocalLoading(prev => ({ ...prev, revokeAll: false }));
            }
          }
        }
      ]
    );
  }, [onRevokeAllSessions]);

  const handleRecommendationAction = useCallback(async (recommendationId: string) => {
    if (!onRecommendationAction) return;

    try {
      setLocalLoading(prev => ({ ...prev, [`rec_${recommendationId}`]: true }));
      await onRecommendationAction(recommendationId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLocalLoading(prev => ({ ...prev, [`rec_${recommendationId}`]: false }));
    }
  }, [onRecommendationAction]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;

    try {
      await onRefresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
      Alert.alert('Error', errorMessage);
    }
  }, [onRefresh]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <Text style={styles.screenTitle}>Security</Text>
        <Text style={styles.screenSubtitle}>Protect your account and data</Text>
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

  const renderRecommendations = () => {
    if (!showRecommendations || recommendations.length === 0) return null;

    const activeRecommendations = recommendations.filter(r => !r.completed);
    if (activeRecommendations.length === 0) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-recommendations`}>
        <Text style={styles.sectionTitle}>Security Recommendations</Text>
        
        <View style={styles.recommendationsContainer}>
          {activeRecommendations.map((rec) => (
            <View 
              key={rec.id}
              style={[
                styles.recommendationItem,
                rec.priority === 'high' && styles.recommendationHigh,
                rec.priority === 'medium' && styles.recommendationMedium
              ]}
            >
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
              </View>
              <Button
                onPress={() => handleRecommendationAction(rec.id)}
                loading={localLoading[`rec_${rec.id}`]}
                size="sm"
                style={styles.recommendationButton}
                testID={`${testID}-recommendation-${rec.id}`}
              >
                <Text style={styles.recommendationButtonText}>{rec.actionText}</Text>
              </Button>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderPasswordSection = () => {
    if (!showPasswordSection) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-password-section`}>
        <Text style={styles.sectionTitle}>Password & Authentication</Text>
        
        <View style={styles.settingsContainer}>
          {/* Change Password */}
          <TouchableOpacity 
            onPress={onChangePassword}
            style={styles.settingItem}
            testID={`${testID}-change-password`}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your account password</Text>
            </View>
            <ChevronRight style={styles.settingIcon} />
          </TouchableOpacity>

          {/* Two-Factor Authentication */}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
              <Text style={styles.settingDescription}>
                Add an extra layer of security to your account
              </Text>
            </View>
            <View style={styles.settingControl}>
              {securitySettings.twoFactorAuth ? (
                <Badge variant="default" style={styles.enabledBadge}>
                  <Check style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>Enabled</Text>
                </Badge>
              ) : (
                <Button
                  onPress={onSetupTwoFactor}
                  size="sm"
                  style={styles.setupButton}
                  testID={`${testID}-setup-2fa`}
                >
                  <Text style={styles.setupButtonText}>Setup</Text>
                </Button>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderSecuritySettings = () => {
    return (
      <Card style={styles.sectionCard} testID={`${testID}-security-settings`}>
        <SecuritySettings
          onSettingChange={handleSecurityUpdate}
          settings={securitySettings}
          loading={loading}
          testID={`${testID}-security-settings-component`}
        />
      </Card>
    );
  };

  const renderActiveSessions = () => {
    if (!showSessionsSection || activeSessions.length === 0) return null;

    const displaySessions = activeSessions.slice(0, maxSessionsDisplay);

    return (
      <Card style={styles.sectionCard} testID={`${testID}-active-sessions`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Sessions</Text>
          {activeSessions.length > 1 && onRevokeAllSessions && (
            <Button
              onPress={handleRevokeAllSessions}
              loading={localLoading.revokeAll}
              variant="outline"
              size="sm"
              style={styles.revokeAllButton}
              testID={`${testID}-revoke-all-sessions`}
            >
              <Text style={styles.revokeAllButtonText}>Revoke All</Text>
            </Button>
          )}
        </View>
        
        <View style={styles.sessionsContainer}>
          {displaySessions.map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDevice}>{session.device}</Text>
                  {session.isCurrent && (
                    <Badge variant="default" style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </Badge>
                  )}
                </View>
                <Text style={styles.sessionDetails}>
                  {session.browser && `${session.browser} • `}
                  {session.location || session.ipAddress}
                </Text>
                <Text style={styles.sessionActivity}>
                  Last active: {session.lastActivity.toLocaleDateString()}
                </Text>
              </View>
              {!session.isCurrent && (
                <Button
                  onPress={() => handleRevokeSession(session.id)}
                  loading={localLoading[`session_${session.id}`]}
                  variant="outline"
                  size="sm"
                  style={styles.revokeButton}
                  testID={`${testID}-revoke-session-${session.id}`}
                >
                  <Text style={styles.revokeButtonText}>Revoke</Text>
                </Button>
              )}
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderLoginHistory = () => {
    if (!showLoginHistory || loginHistory.length === 0) return null;

    const displayHistory = loginHistory.slice(0, maxHistoryDisplay);

    return (
      <Card style={styles.sectionCard} testID={`${testID}-login-history`}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.historyContainer}>
          {displayHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyContent}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDescription}>{item.description}</Text>
                  <View style={[
                    styles.historyStatus,
                    item.success ? styles.historySuccess : styles.historyFailure
                  ]}>
                    {item.success ? (
                      <Check style={styles.historyStatusIcon} />
                    ) : (
                      <X style={styles.historyStatusIcon} />
                    )}
                  </View>
                </View>
                <Text style={styles.historyDetails}>
                  {item.device && `${item.device} • `}
                  {item.location || item.ipAddress}
                </Text>
                <Text style={styles.historyTimestamp}>
                  {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Security Recommendations */}
        {renderRecommendations()}

        {/* Password Section */}
        {renderPasswordSection()}

        {/* Security Settings */}
        {renderSecuritySettings()}

        {/* Active Sessions */}
        {renderActiveSessions()}

        {/* Login History */}
        {renderLoginHistory()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>
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
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  screenSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  errorAlert: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  sectionCard: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  recommendationsContainer: {
    gap: SPACING.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recommendationHigh: {
    borderColor: COLORS.destructive,
    backgroundColor: `${COLORS.destructive}10`,
  },
  recommendationMedium: {
    borderColor: COLORS.warning,
    backgroundColor: `${COLORS.warning}10`,
  },
  recommendationContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  recommendationTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recommendationDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  recommendationButton: {
    minWidth: 80,
  },
  recommendationButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  settingsContainer: {
    gap: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  settingControl: {
    marginLeft: SPACING.md,
  },
  settingIcon: {
    width: 20,
    height: 20,
    color: COLORS.textSecondary,
  },
  enabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeIcon: {
    width: 14,
    height: 14,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  setupButton: {
    minWidth: 80,
  },
  setupButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  revokeAllButton: {
    marginLeft: SPACING.md,
  },
  revokeAllButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  sessionsContainer: {
    gap: SPACING.md,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sessionDevice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  currentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  currentBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  sessionDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  sessionActivity: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  revokeButton: {
    marginLeft: SPACING.md,
    minWidth: 80,
  },
  revokeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  historyContainer: {
    gap: SPACING.sm,
  },
  historyItem: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  historyDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    flex: 1,
  },
  historyStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySuccess: {
    backgroundColor: COLORS.success,
  },
  historyFailure: {
    backgroundColor: COLORS.destructive,
  },
  historyStatusIcon: {
    width: 12,
    height: 12,
    color: COLORS.background,
  },
  historyDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  historyTimestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default SecurityScreen;
export type { 
  SecurityScreenProps, 
  SecurityScreenConfig, 
  SecuritySetting, 
  SecuritySettingKey, 
  ActiveSession, 
  LoginHistoryItem, 
  SecurityRecommendation 
};
