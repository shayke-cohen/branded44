/**
 * PermissionsScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive permissions screen template that requests app permissions
 * with clear explanations, user benefits, and proper handling of permission states.
 * 
 * Features:
 * - Multiple permission types (camera, location, notifications, etc.)
 * - Clear permission explanations and benefits
 * - Individual permission controls
 * - Permission status tracking
 * - Skip and continue options
 * - System permission dialogs integration
 * - Permission denied handling
 * - Settings navigation for denied permissions
 * - Progress tracking for multiple permissions
 * - Accessibility support
 * - Custom permission icons and descriptions
 * 
 * @example
 * ```tsx
 * <PermissionsScreen
 *   permissions={[
 *     {
 *       type: 'camera',
 *       title: 'Camera Access',
 *       description: 'Take photos and scan QR codes',
 *       icon: 'camera',
 *       required: true
 *     },
 *     {
 *       type: 'location',
 *       title: 'Location Services',
 *       description: 'Find nearby places and get directions',
 *       icon: 'location',
 *       required: false
 *     }
 *   ]}
 *   onPermissionRequest={(type) => handlePermissionRequest(type)}
 *   onComplete={(permissions) => handlePermissionsComplete(permissions)}
 *   onSkip={() => navigation.navigate('Dashboard')}
 *   showSkip={true}
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
  TouchableOpacity,
  Alert,
  Linking 
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Switch } from '../../../../~/components/ui/switch';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { Check } from '../../../../~/lib/icons/Check';
import { X } from '../../../../~/lib/icons/X';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Permission types
 */
export type PermissionType = 
  | 'camera' 
  | 'microphone' 
  | 'location' 
  | 'notifications' 
  | 'photos' 
  | 'contacts' 
  | 'calendar' 
  | 'storage'
  | 'health'
  | 'motion';

/**
 * Permission status
 */
export type PermissionStatus = 'not_requested' | 'granted' | 'denied' | 'blocked';

/**
 * Permission configuration
 */
export interface PermissionConfig {
  /** Permission type */
  type: PermissionType;
  /** Permission title */
  title: string;
  /** Permission description */
  description: string;
  /** Permission icon */
  icon?: string;
  /** Is this permission required */
  required?: boolean;
  /** Current permission status */
  status?: PermissionStatus;
  /** Custom benefits list */
  benefits?: string[];
}

/**
 * Permission result
 */
export interface PermissionResult {
  /** Permission type */
  type: PermissionType;
  /** Granted status */
  granted: boolean;
  /** Permission status */
  status: PermissionStatus;
}

/**
 * Permissions screen configuration
 */
export interface PermissionsScreenConfig {
  /** Screen title */
  title?: string;
  /** Screen subtitle */
  subtitle?: string;
  /** Show skip option */
  showSkip?: boolean;
  /** Show individual toggles */
  showIndividualControls?: boolean;
  /** Request all at once */
  requestAllAtOnce?: boolean;
  /** Skip button text */
  skipButtonText?: string;
  /** Continue button text */
  continueButtonText?: string;
  /** Request button text */
  requestButtonText?: string;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the PermissionsScreen template
 */
export interface PermissionsScreenProps extends BaseComponentProps {
  /** Array of permissions to request */
  permissions: PermissionConfig[];
  /** Callback when permission is requested */
  onPermissionRequest: (type: PermissionType) => Promise<PermissionResult>;
  /** Callback when all permissions are handled */
  onComplete: (results: PermissionResult[]) => void;
  /** Callback when skip is pressed */
  onSkip?: () => void;
  /** Configuration for the permissions screen */
  config?: PermissionsScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * PermissionsScreen - AI-optimized permissions screen template
 * 
 * A comprehensive permissions screen that handles app permission requests
 * with clear explanations and proper user experience.
 */
const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  permissions: initialPermissions,
  onPermissionRequest,
  onComplete,
  onSkip,
  config = {},
  style,
  testID = 'permissions-screen',
  ...props
}) => {
  const [permissions, setPermissions] = useState<PermissionConfig[]>(initialPermissions);
  const [loading, setLoading] = useState(false);
  const [requestingType, setRequestingType] = useState<PermissionType | null>(null);

  const {
    title = 'App Permissions',
    subtitle = 'Enable features to get the best experience',
    showSkip = true,
    showIndividualControls = true,
    requestAllAtOnce = false,
    skipButtonText = 'Skip',
    continueButtonText = 'Continue',
    requestButtonText = 'Request Permissions',
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const requiredPermissions = permissions.filter(p => p.required);
  const optionalPermissions = permissions.filter(p => !p.required);
  const grantedPermissions = permissions.filter(p => p.status === 'granted');
  const allRequiredGranted = requiredPermissions.every(p => p.status === 'granted');
  const hasBlockedPermissions = permissions.some(p => p.status === 'blocked');

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handlePermissionRequest = useCallback(async (type: PermissionType) => {
    try {
      setRequestingType(type);
      setLoading(true);
      
      const result = await onPermissionRequest(type);
      
      // Update permission status
      setPermissions(prev => 
        prev.map(p => 
          p.type === type 
            ? { ...p, status: result.status }
            : p
        )
      );
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Permission request failed';
      Alert.alert('Permission Error', errorMessage);
      throw err;
    } finally {
      setRequestingType(null);
      setLoading(false);
    }
  }, [onPermissionRequest]);

  const handleRequestAll = useCallback(async () => {
    if (requestAllAtOnce) {
      try {
        setLoading(true);
        const results: PermissionResult[] = [];
        
        for (const permission of permissions) {
          if (permission.status !== 'granted') {
            const result = await handlePermissionRequest(permission.type);
            results.push(result);
          }
        }
        
        onComplete(results);
      } catch (err) {
        // Error already handled in handlePermissionRequest
      } finally {
        setLoading(false);
      }
    }
  }, [permissions, requestAllAtOnce, handlePermissionRequest, onComplete]);

  const handleContinue = useCallback(() => {
    const results: PermissionResult[] = permissions.map(p => ({
      type: p.type,
      granted: p.status === 'granted',
      status: p.status || 'not_requested'
    }));
    
    onComplete(results);
  }, [permissions, onComplete]);

  const handleOpenSettings = useCallback(() => {
    Alert.alert(
      'Open Settings',
      'To enable permissions, please open Settings and grant access manually.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {grantedPermissions.length} of {permissions.length} permissions enabled
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(grantedPermissions.length / permissions.length) * 100}%` }
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderPermissionStatus = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return (
          <Badge variant="default" style={styles.statusBadge}>
            <Check style={styles.statusIcon} />
            <Text style={styles.statusText}>Granted</Text>
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive" style={styles.statusBadge}>
            <X style={styles.statusIcon} />
            <Text style={styles.statusText}>Denied</Text>
          </Badge>
        );
      case 'blocked':
        return (
          <Badge variant="secondary" style={styles.statusBadge}>
            <Text style={styles.statusText}>Blocked</Text>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" style={styles.statusBadge}>
            <Text style={styles.statusText}>Not Requested</Text>
          </Badge>
        );
    }
  };

  const renderPermissionCard = (permission: PermissionConfig, index: number) => {
    const isRequesting = requestingType === permission.type;
    const canRequest = permission.status !== 'granted' && permission.status !== 'blocked';
    
    return (
      <Card 
        key={permission.type}
        style={styles.permissionCard}
        testID={`${testID}-permission-${permission.type}`}
      >
        <View style={styles.permissionContent}>
          {/* Permission Info */}
          <View style={styles.permissionInfo}>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionTitle}>{permission.title}</Text>
              {permission.required && (
                <Badge variant="secondary" style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </Badge>
              )}
            </View>
            
            <Text style={styles.permissionDescription}>
              {permission.description}
            </Text>

            {/* Benefits */}
            {permission.benefits && permission.benefits.length > 0 && (
              <View style={styles.benefitsContainer}>
                {permission.benefits.map((benefit, benefitIndex) => (
                  <View key={benefitIndex} style={styles.benefitItem}>
                    <Text style={styles.benefitText}>• {benefit}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Permission Control */}
          <View style={styles.permissionControl}>
            {/* Status */}
            <View style={styles.statusContainer}>
              {renderPermissionStatus(permission.status || 'not_requested')}
            </View>

            {/* Action Button */}
            {canRequest && showIndividualControls && (
              <Button
                onPress={() => handlePermissionRequest(permission.type)}
                loading={isRequesting}
                disabled={loading}
                size="sm"
                style={styles.requestButton}
                testID={`${testID}-request-${permission.type}`}
              >
                <Text style={styles.requestButtonText}>
                  {isRequesting ? 'Requesting...' : 'Allow'}
                </Text>
              </Button>
            )}

            {/* Settings link for blocked permissions */}
            {permission.status === 'blocked' && (
              <TouchableOpacity 
                onPress={handleOpenSettings}
                style={styles.settingsLink}
                testID={`${testID}-settings-${permission.type}`}
              >
                <Text style={styles.settingsLinkText}>Open Settings</Text>
                <ChevronRight style={styles.settingsIcon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderPermissionsList = () => {
    return (
      <View style={styles.permissionsContainer} testID={`${testID}-permissions-list`}>
        {/* Required Permissions */}
        {requiredPermissions.length > 0 && (
          <View style={styles.permissionSection}>
            <Text style={styles.sectionTitle}>Required Permissions</Text>
            {requiredPermissions.map(renderPermissionCard)}
          </View>
        )}

        {/* Optional Permissions */}
        {optionalPermissions.length > 0 && (
          <View style={styles.permissionSection}>
            <Text style={styles.sectionTitle}>Optional Permissions</Text>
            {optionalPermissions.map(renderPermissionCard)}
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (footerComponent) {
      return footerComponent;
    }

    return (
      <View style={styles.footerContainer} testID={`${testID}-footer`}>
        {/* Blocked permissions warning */}
        {hasBlockedPermissions && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Some permissions were denied. You can enable them later in Settings.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {requestAllAtOnce && !allRequiredGranted && (
            <Button
              onPress={handleRequestAll}
              loading={loading}
              style={styles.actionButton}
              testID={`${testID}-request-all`}
            >
              <Text style={styles.actionButtonText}>{requestButtonText}</Text>
            </Button>
          )}

          <Button
            onPress={handleContinue}
            disabled={!allRequiredGranted}
            style={styles.actionButton}
            testID={`${testID}-continue`}
          >
            <Text style={styles.actionButtonText}>{continueButtonText}</Text>
          </Button>

          {showSkip && onSkip && (
            <TouchableOpacity 
              onPress={onSkip}
              style={styles.skipButton}
              testID={`${testID}-skip`}
            >
              <Text style={styles.skipText}>{skipButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        {/* Header */}
        {renderHeader()}

        {/* Permissions List */}
        {renderPermissionsList()}

        {/* Footer */}
        {renderFooter()}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
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
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  permissionsContainer: {
    marginBottom: SPACING.xl,
  },
  permissionSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  permissionCard: {
    marginBottom: SPACING.md,
  },
  permissionContent: {
    padding: SPACING.lg,
  },
  permissionInfo: {
    marginBottom: SPACING.md,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    flex: 1,
  },
  requiredBadge: {
    marginLeft: SPACING.sm,
  },
  requiredText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  permissionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  benefitsContainer: {
    marginTop: SPACING.sm,
  },
  benefitItem: {
    marginBottom: SPACING.xs,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  permissionControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusIcon: {
    width: 16,
    height: 16,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  requestButton: {
    marginLeft: SPACING.md,
  },
  requestButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginLeft: SPACING.md,
  },
  settingsLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginRight: SPACING.xs,
  },
  settingsIcon: {
    width: 16,
    height: 16,
    color: COLORS.primary,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  warningContainer: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  actionsContainer: {
    gap: SPACING.md,
  },
  actionButton: {
    paddingVertical: SPACING.lg,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default PermissionsScreen;
export type { 
  PermissionsScreenProps, 
  PermissionsScreenConfig, 
  PermissionConfig, 
  PermissionResult, 
  PermissionType, 
  PermissionStatus 
};
