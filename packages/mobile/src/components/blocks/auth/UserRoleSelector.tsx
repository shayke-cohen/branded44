/**
 * UserRoleSelector - Admin/User Role Management Block Component
 * 
 * A comprehensive role selection and management interface with permissions
 * display and role change functionality. Optimized for AI agents.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { Separator } from '../../../../~/components/ui/separator';
import { Text } from '../../../../~/components/ui/text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../~/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../~/components/ui/avatar';
import { cn, formatDate } from '../../../lib/utils';
import { User, UserRole, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Shield, Users, Crown, Key, Check, X } from 'lucide-react-native';

/**
 * Role permission interface
 */
export interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'users' | 'system' | 'billing' | 'analytics';
}

/**
 * Role configuration interface
 */
export interface RoleConfig {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

/**
 * Props interface for UserRoleSelector component
 */
export interface UserRoleSelectorProps {
  /**
   * User whose role is being managed
   */
  user: User;
  
  /**
   * Available roles configuration
   */
  availableRoles?: RoleConfig[];
  
  /**
   * All available permissions
   */
  permissions?: RolePermission[];
  
  /**
   * Current user making the changes (for permission check)
   */
  currentUser?: User;
  
  /**
   * Callback when role is changed
   */
  onRoleChange?: (userId: string, newRole: UserRole, reason?: string) => Promise<void>;
  
  /**
   * Callback when permissions are viewed in detail
   */
  onViewPermissions?: (role: UserRole) => void;
  
  /**
   * Current loading state
   */
  loading?: LoadingState;
  
  /**
   * Custom styling for the container
   */
  style?: any;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Test identifier for automated testing
   */
  testID?: string;
  
  /**
   * Whether to show detailed permissions
   */
  showPermissions?: boolean;
  
  /**
   * Whether to show role change history
   */
  showHistory?: boolean;
  
  /**
   * Role change history
   */
  roleHistory?: Array<{
    id: string;
    fromRole: UserRole;
    toRole: UserRole;
    changedBy: string;
    changedAt: string;
    reason?: string;
  }>;
}

/**
 * UserRoleSelector Component
 * 
 * Provides comprehensive role management with:
 * - Role selection and assignment
 * - Permission display and comparison
 * - Role change history
 * - Permission validation
 * - Audit trail
 * 
 * @example
 * ```tsx
 * <UserRoleSelector
 *   user={targetUser}
 *   currentUser={adminUser}
 *   availableRoles={roleConfigurations}
 *   permissions={allPermissions}
 *   onRoleChange={handleRoleChange}
 *   showPermissions={true}
 *   showHistory={true}
 * />
 * ```
 */
export const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  user,
  availableRoles = [],
  permissions = [],
  currentUser,
  onRoleChange,
  onViewPermissions,
  loading = 'idle',
  style,
  className,
  testID = 'user-role-selector',
  showPermissions = true,
  showHistory = false,
  roleHistory = [],
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [changeReason, setChangeReason] = useState('');
  const [changingRole, setChangingRole] = useState(false);

  const isLoading = loading === 'loading';

  /**
   * Default role configurations
   */
  const defaultRoles: RoleConfig[] = [
    {
      role: 'guest',
      name: 'Guest',
      description: 'Limited access to public content only',
      permissions: ['view_public'],
      icon: <Users size={20} color={COLORS.neutral[500]} />,
      color: COLORS.neutral[500],
    },
    {
      role: 'user',
      name: 'User',
      description: 'Standard user with basic features',
      permissions: ['view_public', 'create_content', 'edit_own', 'delete_own'],
      icon: <Users size={20} color={COLORS.primary[600]} />,
      color: COLORS.primary[600],
    },
    {
      role: 'premium',
      name: 'Premium User',
      description: 'Enhanced features and priority support',
      permissions: ['view_public', 'create_content', 'edit_own', 'delete_own', 'premium_features'],
      icon: <Crown size={20} color={COLORS.warning[500]} />,
      color: COLORS.warning[500],
      badge: 'Premium',
    },
    {
      role: 'moderator',
      name: 'Moderator',
      description: 'Can moderate content and manage users',
      permissions: ['view_public', 'create_content', 'edit_own', 'delete_own', 'moderate_content', 'manage_users'],
      icon: <Shield size={20} color={COLORS.info[600]} />,
      color: COLORS.info[600],
      badge: 'Mod',
    },
    {
      role: 'admin',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      permissions: ['*'],
      icon: <Key size={20} color={COLORS.error[600]} />,
      color: COLORS.error[600],
      badge: 'Admin',
    },
  ];

  const roleConfigs = availableRoles.length > 0 ? availableRoles : defaultRoles;
  const currentRoleConfig = roleConfigs.find(r => r.role === user.role);
  const selectedRoleConfig = roleConfigs.find(r => r.role === selectedRole);

  /**
   * Checks if current user can change roles
   */
  const canChangeRole = (): boolean => {
    if (!currentUser || !onRoleChange) return false;
    
    // Only admins and moderators can change roles
    if (!['admin', 'moderator'].includes(currentUser.role)) return false;
    
    // Moderators cannot assign admin role or modify other admins
    if (currentUser.role === 'moderator') {
      if (selectedRole === 'admin' || user.role === 'admin') return false;
    }
    
    // Users cannot change their own role
    if (currentUser.id === user.id) return false;
    
    return true;
  };

  /**
   * Handles role change submission
   */
  const handleRoleChange = async () => {
    if (!onRoleChange || !canChangeRole() || selectedRole === user.role) return;

    setChangingRole(true);
    try {
      await onRoleChange(user.id, selectedRole, changeReason || undefined);
      setChangeReason('');
    } catch (error) {
      Alert.alert('Error', 'Failed to change user role. Please try again.');
      setSelectedRole(user.role); // Reset selection
    } finally {
      setChangingRole(false);
    }
  };

  /**
   * Gets user initials for avatar fallback
   */
  const getUserInitials = (): string => {
    const first = user.firstName?.charAt(0).toUpperCase() || '';
    const last = user.lastName?.charAt(0).toUpperCase() || '';
    return `${first}${last}`;
  };

  /**
   * Checks if a permission is included in a role
   */
  const hasPermission = (rolePermissions: string[], permissionId: string): boolean => {
    return rolePermissions.includes('*') || rolePermissions.includes(permissionId);
  };

  /**
   * Groups permissions by category
   */
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, RolePermission[]>);

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('user-role-selector', className)}
      testID={testID}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: SPACING.screen }}>
        {/* User Header */}
        <Card style={{ marginBottom: SPACING.section }}>
          <CardContent style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
              <Avatar style={{ width: 60, height: 60 }}>
                <AvatarImage source={{ uri: user.avatar }} />
                <AvatarFallback>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {getUserInitials()}
                  </Text>
                </AvatarFallback>
              </Avatar>
              
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.lg, 
                  fontWeight: TYPOGRAPHY.fontWeight.semibold 
                }}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.sm, 
                  color: COLORS.neutral[600] 
                }}>
                  {user.email}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs }}>
                  {currentRoleConfig?.icon}
                  <Text style={{ 
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    fontWeight: TYPOGRAPHY.fontWeight.medium,
                    color: currentRoleConfig?.color
                  }}>
                    {currentRoleConfig?.name}
                  </Text>
                  {currentRoleConfig?.badge && (
                    <Badge variant="secondary">
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                        {currentRoleConfig.badge}
                      </Text>
                    </Badge>
                  )}
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card style={{ marginBottom: SPACING.section }}>
          <CardHeader>
            <CardTitle>Change Role</CardTitle>
            {!canChangeRole() && (
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.error[600] }}>
                You don't have permission to change this user's role
              </Text>
            )}
          </CardHeader>
          
          <CardContent style={{ gap: SPACING.formField }}>
            {/* Role Selector */}
            <View>
              <Text style={{ 
                fontSize: TYPOGRAPHY.fontSize.base, 
                fontWeight: TYPOGRAPHY.fontWeight.medium,
                marginBottom: SPACING.sm
              }}>
                Select New Role
              </Text>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
                disabled={!canChangeRole() || changingRole || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleConfigs.map((roleConfig) => (
                    <SelectItem 
                      key={roleConfig.role}
                      label={roleConfig.name}
                      value={roleConfig.role}
                    />
                  ))}
                </SelectContent>
              </Select>
            </View>

            {/* Role Description */}
            {selectedRoleConfig && (
              <Card style={{ backgroundColor: COLORS.neutral[100], borderColor: selectedRoleConfig.color }}>
                <CardContent style={{ padding: SPACING.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm }}>
                    {selectedRoleConfig.icon}
                    <Text style={{ 
                      fontSize: TYPOGRAPHY.fontSize.base, 
                      fontWeight: TYPOGRAPHY.fontWeight.semibold,
                      color: selectedRoleConfig.color
                    }}>
                      {selectedRoleConfig.name}
                    </Text>
                    {selectedRoleConfig.badge && (
                      <Badge variant="secondary">
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                          {selectedRoleConfig.badge}
                        </Text>
                      </Badge>
                    )}
                  </View>
                  <Text style={{ 
                    fontSize: TYPOGRAPHY.fontSize.sm, 
                    color: COLORS.neutral[600] 
                  }}>
                    {selectedRoleConfig.description}
                  </Text>
                </CardContent>
              </Card>
            )}

            {/* Change Reason */}
            {selectedRole !== user.role && canChangeRole() && (
              <View>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.base, 
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                  marginBottom: SPACING.sm
                }}>
                  Reason for Change (Optional)
                </Text>
                <Text 
                  style={{ 
                    borderWidth: 1,
                    borderColor: COLORS.neutral[300],
                    borderRadius: 8,
                    padding: SPACING.md,
                    fontSize: TYPOGRAPHY.fontSize.base,
                    minHeight: 80,
                    textAlignVertical: 'top'
                  }}
                  onChangeText={setChangeReason}
                  placeholder="Enter reason for role change..."
                  multiline
                  numberOfLines={3}
                  editable={!changingRole && !isLoading}
                />
              </View>
            )}

            {/* Action Button */}
            {selectedRole !== user.role && canChangeRole() && (
              <Button
                onPress={handleRoleChange}
                disabled={changingRole || isLoading}
              >
                <Text>
                  {changingRole 
                    ? 'Changing Role...' 
                    : `Change to ${selectedRoleConfig?.name}`
                  }
                </Text>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Permissions Comparison */}
        {showPermissions && selectedRoleConfig && Object.keys(groupedPermissions).length > 0 && (
          <Card style={{ marginBottom: SPACING.section }}>
            <CardHeader>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle>Permissions</CardTitle>
                {onViewPermissions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => onViewPermissions(selectedRole)}
                  >
                    <Text style={{ color: COLORS.primary[600] }}>View Details</Text>
                  </Button>
                )}
              </View>
            </CardHeader>
            
            <CardContent style={{ padding: 0 }}>
              {Object.entries(groupedPermissions).map(([category, categoryPermissions], categoryIndex) => (
                <View key={category}>
                  <View style={{ padding: SPACING.md, backgroundColor: COLORS.neutral[50] }}>
                    <Text style={{ 
                      fontSize: TYPOGRAPHY.fontSize.sm, 
                      fontWeight: TYPOGRAPHY.fontWeight.semibold,
                      color: COLORS.neutral[700],
                      textTransform: 'uppercase'
                    }}>
                      {category}
                    </Text>
                  </View>
                  
                  {categoryPermissions.map((permission, permissionIndex) => (
                    <View key={permission.id}>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        padding: SPACING.md,
                        gap: SPACING.md 
                      }}>
                        <View style={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: 10,
                          backgroundColor: hasPermission(selectedRoleConfig.permissions, permission.id) 
                            ? COLORS.success[500] 
                            : COLORS.neutral[300],
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {hasPermission(selectedRoleConfig.permissions, permission.id) ? (
                            <Check size={12} color={COLORS.white} />
                          ) : (
                            <X size={12} color={COLORS.white} />
                          )}
                        </View>
                        
                        <View style={{ flex: 1 }}>
                          <Text style={{ 
                            fontSize: TYPOGRAPHY.fontSize.base, 
                            fontWeight: TYPOGRAPHY.fontWeight.medium 
                          }}>
                            {permission.name}
                          </Text>
                          <Text style={{ 
                            fontSize: TYPOGRAPHY.fontSize.sm, 
                            color: COLORS.neutral[600] 
                          }}>
                            {permission.description}
                          </Text>
                        </View>
                      </View>
                      {permissionIndex < categoryPermissions.length - 1 && (
                        <Separator style={{ marginLeft: 52 }} />
                      )}
                    </View>
                  ))}
                  
                  {categoryIndex < Object.entries(groupedPermissions).length - 1 && (
                    <Separator />
                  )}
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Role History */}
        {showHistory && roleHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Role Change History</CardTitle>
            </CardHeader>
            
            <CardContent style={{ padding: 0 }}>
              {roleHistory.slice(0, 5).map((change, index) => (
                <View key={change.id}>
                  <View style={{ padding: SPACING.md, gap: SPACING.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ 
                        fontSize: TYPOGRAPHY.fontSize.base, 
                        fontWeight: TYPOGRAPHY.fontWeight.medium 
                      }}>
                        {change.fromRole} → {change.toRole}
                      </Text>
                      <Text style={{ 
                        fontSize: TYPOGRAPHY.fontSize.sm, 
                        color: COLORS.neutral[600] 
                      }}>
                        {formatDate(change.changedAt, 'short')}
                      </Text>
                    </View>
                    <Text style={{ 
                      fontSize: TYPOGRAPHY.fontSize.sm, 
                      color: COLORS.neutral[600] 
                    }}>
                      Changed by {change.changedBy}
                    </Text>
                    {change.reason && (
                      <Text style={{ 
                        fontSize: TYPOGRAPHY.fontSize.sm, 
                        color: COLORS.neutral[500],
                        fontStyle: 'italic'
                      }}>
                        "{change.reason}"
                      </Text>
                    )}
                  </View>
                  {index < roleHistory.slice(0, 5).length - 1 && <Separator />}
                </View>
              ))}
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

export default UserRoleSelector;
