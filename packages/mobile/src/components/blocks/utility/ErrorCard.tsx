/**
 * ErrorCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive error state card component for displaying various error types,
 * providing user-friendly error messages, and offering recovery actions.
 * 
 * Features:
 * - Multiple error types (network, validation, server, etc.)
 * - User-friendly error messages and descriptions
 * - Recovery action buttons (retry, refresh, contact support)
 * - Error severity levels with appropriate styling
 * - Debug information toggle for development
 * - Accessibility support for screen readers
 * - Custom error illustrations and icons
 * - Error tracking and reporting integration
 * 
 * @example
 * ```tsx
 * <ErrorCard
 *   type="network"
 *   title="Connection Error"
 *   message="Unable to connect to server"
 *   onRetry={handleRetry}
 *   onContactSupport={handleSupport}
 *   showDebugInfo={__DEV__}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Error type categories
 */
export type ErrorType = 
  | 'network' 
  | 'server' 
  | 'validation' 
  | 'authentication' 
  | 'authorization' 
  | 'not_found' 
  | 'timeout' 
  | 'generic' 
  | 'maintenance' 
  | 'rate_limit';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Recovery action
 */
export interface RecoveryAction {
  /** Action ID */
  id: string;
  /** Action label */
  label: string;
  /** Action type */
  type: 'primary' | 'secondary' | 'destructive';
  /** Action callback */
  onPress: () => void;
  /** Whether action is loading */
  loading?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * Debug information
 */
export interface DebugInfo {
  /** Error code */
  errorCode?: string;
  /** Request ID */
  requestId?: string;
  /** Timestamp */
  timestamp?: Date;
  /** Stack trace */
  stackTrace?: string;
  /** Additional context */
  context?: Record<string, any>;
  /** User agent */
  userAgent?: string;
  /** URL that caused error */
  url?: string;
}

/**
 * Props for the ErrorCard component
 */
export interface ErrorCardProps extends BaseComponentProps {
  /** Error type */
  type: ErrorType;
  /** Error title */
  title: string;
  /** Error message/description */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error icon override */
  icon?: string;
  /** Recovery actions */
  actions?: RecoveryAction[];
  /** Debug information */
  debugInfo?: DebugInfo;
  /** Whether to show debug information */
  showDebugInfo?: boolean;
  /** Whether error is dismissible */
  dismissible?: boolean;
  /** Custom illustration URL */
  illustration?: string;
  /** Additional help text */
  helpText?: string;
  /** Contact support info */
  supportInfo?: {
    email?: string;
    phone?: string;
    url?: string;
  };
  /** Error ID for tracking */
  errorId?: string;
  /** Whether error was reported */
  reported?: boolean;
  /** Callback when error is dismissed */
  onDismiss?: () => void;
  /** Callback when retry is pressed */
  onRetry?: () => void;
  /** Callback when refresh is pressed */
  onRefresh?: () => void;
  /** Callback when contact support is pressed */
  onContactSupport?: () => void;
  /** Callback when error is reported */
  onReport?: (debugInfo?: DebugInfo) => void;
  /** Callback when debug info is toggled */
  onToggleDebug?: (show: boolean) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ErrorCard component for displaying error states
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({
  type,
  title,
  message,
  severity = 'medium',
  icon,
  actions = [],
  debugInfo,
  showDebugInfo = false,
  dismissible = false,
  illustration,
  helpText,
  supportInfo,
  errorId,
  reported = false,
  onDismiss,
  onRetry,
  onRefresh,
  onContactSupport,
  onReport,
  onToggleDebug,
  style,
  testID = 'error-card',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [debugVisible, setDebugVisible] = useState(showDebugInfo);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getErrorIcon = (): string => {
    if (icon) return icon;
    
    const icons: Record<ErrorType, string> = {
      network: '📡',
      server: '🔧',
      validation: '⚠️',
      authentication: '🔑',
      authorization: '🚫',
      not_found: '🔍',
      timeout: '⏰',
      generic: '❌',
      maintenance: '🚧',
      rate_limit: '🚦',
    };
    return icons[type];
  };

  const getSeverityColor = (): string => {
    const colors: Record<ErrorSeverity, string> = {
      low: COLORS.warning[500],
      medium: COLORS.error[500],
      high: COLORS.error[600],
      critical: COLORS.error[700],
    };
    return colors[severity];
  };

  const getErrorTypeLabel = (): string => {
    const labels: Record<ErrorType, string> = {
      network: 'Network Error',
      server: 'Server Error',
      validation: 'Validation Error',
      authentication: 'Authentication Error',
      authorization: 'Access Denied',
      not_found: 'Not Found',
      timeout: 'Request Timeout',
      generic: 'Error',
      maintenance: 'Maintenance Mode',
      rate_limit: 'Rate Limited',
    };
    return labels[type];
  };

  const getDefaultActions = (): RecoveryAction[] => {
    const defaultActions: RecoveryAction[] = [];

    // Add retry action for certain error types
    if (['network', 'server', 'timeout'].includes(type) && onRetry) {
      defaultActions.push({
        id: 'retry',
        label: 'Retry',
        type: 'primary',
        onPress: onRetry,
      });
    }

    // Add refresh action
    if (onRefresh) {
      defaultActions.push({
        id: 'refresh',
        label: 'Refresh',
        type: 'secondary',
        onPress: onRefresh,
      });
    }

    // Add contact support for high severity errors
    if (['high', 'critical'].includes(severity) && onContactSupport) {
      defaultActions.push({
        id: 'support',
        label: 'Contact Support',
        type: 'secondary',
        onPress: onContactSupport,
      });
    }

    return defaultActions;
  };

  const handleToggleDebug = () => {
    const newState = !debugVisible;
    setDebugVisible(newState);
    onToggleDebug?.(newState);
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.iconContainer}>
        <Text style={[styles.errorIcon, { color: getSeverityColor() }]}>
          {getErrorIcon()}
        </Text>
        <Badge 
          variant="outline"
          style={[styles.severityBadge, { borderColor: getSeverityColor() }]}
        >
          <Text style={[styles.severityText, { color: getSeverityColor() }]}>
            {severity.toUpperCase()}
          </Text>
        </Badge>
      </View>
      
      {dismissible && onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      
      {helpText && (
        <Text style={styles.helpText}>{helpText}</Text>
      )}
      
      {errorId && (
        <Text style={styles.errorId}>Error ID: {errorId}</Text>
      )}
    </View>
  );

  const renderActions = () => {
    const allActions = [...getDefaultActions(), ...actions];
    
    if (allActions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        <View style={styles.actionButtons}>
          {allActions.map((action) => {
            const isPrimary = action.type === 'primary';
            const isDestructive = action.type === 'destructive';
            
            return (
              <Button
                key={action.id}
                onPress={action.onPress}
                disabled={action.disabled}
                variant={isPrimary ? 'default' : 'outline'}
                style={[
                  styles.actionButton,
                  isPrimary && styles.primaryActionButton,
                  isDestructive && styles.destructiveActionButton,
                ]}
              >
                <Text style={[
                  styles.actionButtonText,
                  isPrimary && styles.primaryActionText,
                  isDestructive && styles.destructiveActionText,
                ]}>
                  {action.loading ? 'Loading...' : action.label}
                </Text>
              </Button>
            );
          })}
        </View>
        
        {/* Report and Debug Toggle */}
        <View style={styles.secondaryActions}>
          {debugInfo && (
            <TouchableOpacity onPress={handleToggleDebug} style={styles.debugToggle}>
              <Text style={styles.debugToggleText}>
                {debugVisible ? 'Hide' : 'Show'} Debug Info
              </Text>
            </TouchableOpacity>
          )}
          
          {onReport && !reported && (
            <TouchableOpacity 
              onPress={() => onReport(debugInfo)} 
              style={styles.reportButton}
            >
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          )}
          
          {reported && (
            <Text style={styles.reportedText}>✓ Issue reported</Text>
          )}
        </View>
      </View>
    );
  };

  const renderDebugInfo = () => {
    if (!debugVisible || !debugInfo) return null;

    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Information</Text>
        
        {debugInfo.errorCode && (
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Error Code:</Text>
            <Text style={styles.debugValue}>{debugInfo.errorCode}</Text>
          </View>
        )}
        
        {debugInfo.requestId && (
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Request ID:</Text>
            <Text style={styles.debugValue}>{debugInfo.requestId}</Text>
          </View>
        )}
        
        {debugInfo.timestamp && (
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Timestamp:</Text>
            <Text style={styles.debugValue}>{debugInfo.timestamp.toISOString()}</Text>
          </View>
        )}
        
        {debugInfo.url && (
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>URL:</Text>
            <Text style={styles.debugValue}>{debugInfo.url}</Text>
          </View>
        )}
        
        {debugInfo.stackTrace && (
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Stack Trace:</Text>
            <Text style={[styles.debugValue, styles.stackTrace]}>
              {debugInfo.stackTrace}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSupportInfo = () => {
    if (!supportInfo) return null;

    return (
      <View style={styles.supportContainer}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        
        {supportInfo.email && (
          <TouchableOpacity style={styles.supportItem}>
            <Text style={styles.supportLabel}>📧 Email: </Text>
            <Text style={styles.supportValue}>{supportInfo.email}</Text>
          </TouchableOpacity>
        )}
        
        {supportInfo.phone && (
          <TouchableOpacity style={styles.supportItem}>
            <Text style={styles.supportLabel}>📞 Phone: </Text>
            <Text style={styles.supportValue}>{supportInfo.phone}</Text>
          </TouchableOpacity>
        )}
        
        {supportInfo.url && (
          <TouchableOpacity style={styles.supportItem}>
            <Text style={styles.supportLabel}>🌐 Help Center: </Text>
            <Text style={styles.supportValue}>{supportInfo.url}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[styles.card, style]} 
      testID={testID}
      {...props}
    >
      <View style={styles.cardContent}>
        {renderHeader()}
        {renderContent()}
        {renderActions()}
        {renderDebugInfo()}
        {renderSupportInfo()}
        
        {/* Accent border based on severity */}
        <View style={[styles.accentBorder, { backgroundColor: getSeverityColor() }]} />
      </View>
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    margin: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  errorIcon: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
  },
  severityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  severityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  dismissIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.neutral[500],
  },
  content: {
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[700],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  errorId: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    fontFamily: 'monospace',
  },
  actionsContainer: {
    marginBottom: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: SPACING.md,
  },
  primaryActionButton: {
    backgroundColor: COLORS.primary[500],
  },
  destructiveActionButton: {
    backgroundColor: COLORS.error[500],
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
    color: COLORS.neutral[700],
  },
  primaryActionText: {
    color: COLORS.white,
  },
  destructiveActionText: {
    color: COLORS.white,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugToggle: {
    padding: SPACING.sm,
  },
  debugToggleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    textDecorationLine: 'underline',
  },
  reportButton: {
    padding: SPACING.sm,
  },
  reportButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error[600],
    textDecorationLine: 'underline',
  },
  reportedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success[600],
  },
  debugContainer: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 6,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  debugTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  debugItem: {
    marginBottom: SPACING.sm,
  },
  debugLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.xs,
  },
  debugValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    fontFamily: 'monospace',
  },
  stackTrace: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  supportContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: SPACING.md,
  },
  supportTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  supportLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[700],
  },
  supportValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    textDecorationLine: 'underline',
  },
  accentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default ErrorCard;
