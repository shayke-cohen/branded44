/**
 * AccountScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive account management screen template that combines profile editing,
 * account settings, subscription management, and security options.
 * 
 * Features:
 * - Account information display and editing
 * - Subscription management with SubscriptionCard
 * - Security settings integration
 * - Account verification status
 * - Connected accounts and social links
 * - Data export and backup options
 * - Account deactivation and deletion
 * - Billing history and payment methods
 * - Email and phone verification
 * - Account activity monitoring
 * - Loading states and error handling
 * - Navigation to detailed settings
 * 
 * @example
 * ```tsx
 * <AccountScreen
 *   user={currentUser}
 *   subscription={userSubscription}
 *   accountSettings={accountSettings}
 *   onUpdateAccount={(data) => handleAccountUpdate(data)}
 *   onManageSubscription={() => navigation.navigate('Subscription')}
 *   onVerifyEmail={() => handleEmailVerification()}
 *   onVerifyPhone={() => handlePhoneVerification()}
 *   onNavigateToSecurity={() => navigation.navigate('Security')}
 *   loading={accountLoading}
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
  Image 
} from 'react-native';
import { 
  ProfileEditForm, 
  SubscriptionCard,
  SecuritySettings 
} from '../../blocks/auth';
import type { 
  ProfileEditFormProps, 
  SubscriptionCardProps,
  SubscriptionData,
  SecuritySettingsProps 
} from '../../blocks/auth';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Avatar } from '../../../../~/components/ui/avatar';
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
 * Account verification status
 */
export interface VerificationStatus {
  /** Email verification status */
  email: boolean;
  /** Phone verification status */
  phone: boolean;
  /** Identity verification status */
  identity?: boolean;
  /** Two-factor authentication status */
  twoFactor?: boolean;
}

/**
 * Connected account information
 */
export interface ConnectedAccount {
  /** Account ID */
  id: string;
  /** Provider name */
  provider: string;
  /** Account name/email */
  accountName: string;
  /** Connection date */
  connectedAt: Date;
  /** Provider icon */
  icon?: string;
  /** Is primary account */
  isPrimary?: boolean;
}

/**
 * Account activity item
 */
export interface AccountActivity {
  /** Activity ID */
  id: string;
  /** Activity type */
  type: string;
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
}

/**
 * Account screen configuration
 */
export interface AccountScreenConfig {
  /** Show profile edit section */
  showProfileEdit?: boolean;
  /** Show subscription section */
  showSubscription?: boolean;
  /** Show security section */
  showSecurity?: boolean;
  /** Show verification section */
  showVerification?: boolean;
  /** Show connected accounts */
  showConnectedAccounts?: boolean;
  /** Show account activity */
  showActivity?: boolean;
  /** Show data management */
  showDataManagement?: boolean;
  /** Show account actions */
  showAccountActions?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the AccountScreen template
 */
export interface AccountScreenProps extends BaseComponentProps {
  /** Current user profile */
  user: UserProfile;
  /** Subscription data */
  subscription?: SubscriptionData;
  /** Account verification status */
  verification?: VerificationStatus;
  /** Connected accounts */
  connectedAccounts?: ConnectedAccount[];
  /** Recent account activity */
  activity?: AccountActivity[];
  /** Callback when account is updated */
  onUpdateAccount?: (data: UserProfile) => Promise<void> | void;
  /** Callback when subscription is managed */
  onManageSubscription?: () => void;
  /** Callback when email verification is requested */
  onVerifyEmail?: () => Promise<void> | void;
  /** Callback when phone verification is requested */
  onVerifyPhone?: () => Promise<void> | void;
  /** Callback when navigating to security settings */
  onNavigateToSecurity?: () => void;
  /** Callback when connecting account */
  onConnectAccount?: (provider: string) => Promise<void> | void;
  /** Callback when disconnecting account */
  onDisconnectAccount?: (accountId: string) => Promise<void> | void;
  /** Callback when exporting data */
  onExportData?: () => Promise<void> | void;
  /** Callback when deactivating account */
  onDeactivateAccount?: () => Promise<void> | void;
  /** Callback when deleting account */
  onDeleteAccount?: () => Promise<void> | void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the account screen */
  config?: AccountScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * AccountScreen - AI-optimized account management screen template
 * 
 * A comprehensive account screen that provides complete account
 * management functionality with proper organization and navigation.
 */
const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  subscription,
  verification,
  connectedAccounts = [],
  activity = [],
  onUpdateAccount,
  onManageSubscription,
  onVerifyEmail,
  onVerifyPhone,
  onNavigateToSecurity,
  onConnectAccount,
  onDisconnectAccount,
  onExportData,
  onDeactivateAccount,
  onDeleteAccount,
  loading = false,
  error,
  config = {},
  style,
  testID = 'account-screen',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState<Record<string, boolean>>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const {
    showProfileEdit = true,
    showSubscription = true,
    showSecurity = true,
    showVerification = true,
    showConnectedAccounts = true,
    showActivity = true,
    showDataManagement = true,
    showAccountActions = true,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleUpdateAccount = useCallback(async (profileData: UserProfile) => {
    if (!onUpdateAccount) return;

    try {
      setLocalError(null);
      setLocalLoading(prev => ({ ...prev, profile: true }));
      await onUpdateAccount(profileData);
      setEditMode(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Account update failed';
      setLocalError(errorMessage);
      Alert.alert('Update Error', errorMessage);
    } finally {
      setLocalLoading(prev => ({ ...prev, profile: false }));
    }
  }, [onUpdateAccount]);

  const handleVerifyEmail = useCallback(async () => {
    if (!onVerifyEmail) return;

    try {
      setLocalLoading(prev => ({ ...prev, email: true }));
      await onVerifyEmail();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed';
      Alert.alert('Verification Error', errorMessage);
    } finally {
      setLocalLoading(prev => ({ ...prev, email: false }));
    }
  }, [onVerifyEmail]);

  const handleVerifyPhone = useCallback(async () => {
    if (!onVerifyPhone) return;

    try {
      setLocalLoading(prev => ({ ...prev, phone: true }));
      await onVerifyPhone();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Phone verification failed';
      Alert.alert('Verification Error', errorMessage);
    } finally {
      setLocalLoading(prev => ({ ...prev, phone: false }));
    }
  }, [onVerifyPhone]);

  const handleConnectAccount = useCallback(async (provider: string) => {
    if (!onConnectAccount) return;

    try {
      setLocalLoading(prev => ({ ...prev, [`connect_${provider}`]: true }));
      await onConnectAccount(provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Account connection failed';
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLocalLoading(prev => ({ ...prev, [`connect_${provider}`]: false }));
    }
  }, [onConnectAccount]);

  const handleDisconnectAccount = useCallback(async (accountId: string) => {
    if (!onDisconnectAccount) return;

    Alert.alert(
      'Disconnect Account',
      'Are you sure you want to disconnect this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLocalLoading(prev => ({ ...prev, [`disconnect_${accountId}`]: true }));
              await onDisconnectAccount(accountId);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Disconnection failed';
              Alert.alert('Error', errorMessage);
            } finally {
              setLocalLoading(prev => ({ ...prev, [`disconnect_${accountId}`]: false }));
            }
          }
        }
      ]
    );
  }, [onDisconnectAccount]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <Text style={styles.screenTitle}>Account</Text>
        <Text style={styles.screenSubtitle}>Manage your account settings</Text>
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

  const renderProfileSection = () => {
    if (!showProfileEdit) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-profile-section`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!editMode && (
            <TouchableOpacity 
              onPress={() => setEditMode(true)}
              style={styles.editButton}
              testID={`${testID}-edit-profile`}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editMode ? (
          <ProfileEditForm
            onSave={handleUpdateAccount}
            onCancel={() => setEditMode(false)}
            initialData={user}
            loading={localLoading.profile || loading}
            showCancelButton={true}
            testID={`${testID}-profile-edit-form`}
          />
        ) : (
          <View style={styles.profileDisplay}>
            <View style={styles.profileRow}>
              <Avatar style={styles.profileAvatar}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                  </Text>
                )}
              </Avatar>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : 'No name set'
                  }
                </Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderVerificationSection = () => {
    if (!showVerification || !verification) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-verification-section`}>
        <Text style={styles.sectionTitle}>Account Verification</Text>
        
        <View style={styles.verificationContainer}>
          {/* Email Verification */}
          <View style={styles.verificationItem}>
            <View style={styles.verificationInfo}>
              <Text style={styles.verificationTitle}>Email Address</Text>
              <Text style={styles.verificationSubtitle}>{user.email}</Text>
            </View>
            <View style={styles.verificationStatus}>
              {verification.email ? (
                <Badge variant="default" style={styles.verifiedBadge}>
                  <Check style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>Verified</Text>
                </Badge>
              ) : (
                <Button
                  onPress={handleVerifyEmail}
                  loading={localLoading.email}
                  size="sm"
                  style={styles.verifyButton}
                  testID={`${testID}-verify-email`}
                >
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </Button>
              )}
            </View>
          </View>

          {/* Phone Verification */}
          {user.phone && (
            <View style={styles.verificationItem}>
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationTitle}>Phone Number</Text>
                <Text style={styles.verificationSubtitle}>{user.phone}</Text>
              </View>
              <View style={styles.verificationStatus}>
                {verification.phone ? (
                  <Badge variant="default" style={styles.verifiedBadge}>
                    <Check style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>Verified</Text>
                  </Badge>
                ) : (
                  <Button
                    onPress={handleVerifyPhone}
                    loading={localLoading.phone}
                    size="sm"
                    style={styles.verifyButton}
                    testID={`${testID}-verify-phone`}
                  >
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  </Button>
                )}
              </View>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderSubscriptionSection = () => {
    if (!showSubscription || !subscription) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-subscription-section`}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          {onManageSubscription && (
            <TouchableOpacity 
              onPress={onManageSubscription}
              style={styles.manageButton}
              testID={`${testID}-manage-subscription`}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
              <ChevronRight style={styles.manageIcon} />
            </TouchableOpacity>
          )}
        </View>

        <SubscriptionCard
          subscription={subscription}
          onUpgrade={onManageSubscription}
          onCancel={onManageSubscription}
          showActions={false}
          testID={`${testID}-subscription-card`}
        />
      </Card>
    );
  };

  const renderSecuritySection = () => {
    if (!showSecurity) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-security-section`}>
        <TouchableOpacity 
          onPress={onNavigateToSecurity}
          style={styles.navigationItem}
          testID={`${testID}-security-navigation`}
        >
          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>Security Settings</Text>
            <Text style={styles.navigationSubtitle}>
              Password, two-factor authentication, and more
            </Text>
          </View>
          <ChevronRight style={styles.navigationIcon} />
        </TouchableOpacity>
      </Card>
    );
  };

  const renderConnectedAccounts = () => {
    if (!showConnectedAccounts) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-connected-accounts`}>
        <Text style={styles.sectionTitle}>Connected Accounts</Text>
        
        <View style={styles.connectedContainer}>
          {connectedAccounts.map((account) => (
            <View key={account.id} style={styles.connectedItem}>
              <View style={styles.connectedInfo}>
                <Text style={styles.connectedProvider}>{account.provider}</Text>
                <Text style={styles.connectedAccount}>{account.accountName}</Text>
              </View>
              <Button
                onPress={() => handleDisconnectAccount(account.id)}
                loading={localLoading[`disconnect_${account.id}`]}
                variant="outline"
                size="sm"
                style={styles.disconnectButton}
                testID={`${testID}-disconnect-${account.id}`}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </Button>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderDataManagement = () => {
    if (!showDataManagement) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-data-management`}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <View style={styles.dataContainer}>
          <TouchableOpacity 
            onPress={onExportData}
            style={styles.dataItem}
            testID={`${testID}-export-data`}
          >
            <View style={styles.dataInfo}>
              <Text style={styles.dataTitle}>Export Data</Text>
              <Text style={styles.dataSubtitle}>Download your account data</Text>
            </View>
            <ChevronRight style={styles.dataIcon} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderAccountActions = () => {
    if (!showAccountActions) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-account-actions`}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <View style={styles.actionsContainer}>
          {onDeactivateAccount && (
            <Button
              onPress={onDeactivateAccount}
              variant="outline"
              style={styles.actionButton}
              testID={`${testID}-deactivate-account`}
            >
              <Text style={styles.actionButtonText}>Deactivate Account</Text>
            </Button>
          )}
          
          {onDeleteAccount && (
            <Button
              onPress={onDeleteAccount}
              variant="destructive"
              style={styles.actionButton}
              testID={`${testID}-delete-account`}
            >
              <Text style={styles.actionButtonText}>Delete Account</Text>
            </Button>
          )}
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
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Profile Section */}
        {renderProfileSection()}

        {/* Verification Section */}
        {renderVerificationSection()}

        {/* Subscription Section */}
        {renderSubscriptionSection()}

        {/* Security Section */}
        {renderSecuritySection()}

        {/* Connected Accounts */}
        {renderConnectedAccounts()}

        {/* Data Management */}
        {renderDataManagement()}

        {/* Account Actions */}
        {renderAccountActions()}

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
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  profileDisplay: {
    marginTop: SPACING.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    marginRight: SPACING.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryForeground,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  verificationContainer: {
    gap: SPACING.md,
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  verificationSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  verificationStatus: {
    marginLeft: SPACING.md,
  },
  verifiedBadge: {
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
  verifyButton: {
    minWidth: 80,
  },
  verifyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  manageButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginRight: SPACING.xs,
  },
  manageIcon: {
    width: 16,
    height: 16,
    color: COLORS.primary,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  navigationContent: {
    flex: 1,
  },
  navigationTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  navigationSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  navigationIcon: {
    width: 20,
    height: 20,
    color: COLORS.textSecondary,
  },
  connectedContainer: {
    gap: SPACING.md,
  },
  connectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  connectedInfo: {
    flex: 1,
  },
  connectedProvider: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  connectedAccount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  disconnectButton: {
    marginLeft: SPACING.md,
  },
  disconnectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dataContainer: {
    gap: SPACING.sm,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  dataInfo: {
    flex: 1,
  },
  dataTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dataSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  dataIcon: {
    width: 20,
    height: 20,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    gap: SPACING.md,
  },
  actionButton: {
    paddingVertical: SPACING.md,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default AccountScreen;
export type { 
  AccountScreenProps, 
  AccountScreenConfig, 
  VerificationStatus, 
  ConnectedAccount, 
  AccountActivity 
};
