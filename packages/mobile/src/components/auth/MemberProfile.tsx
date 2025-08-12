/**
 * MemberProfile - Reusable member profile display component
 * 
 * Shows logged-in member information and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createAuthStyles } from '../../shared/styles/AuthStyles';

interface MemberProfileProps {
  member: {
    id?: string;
    email?: string | { address: string; isVerified: boolean };
    firstName?: string;
    lastName?: string;
    loginEmail?: string;
    profilePhoto?: {
      url?: string;
    };
    contactDetails?: {
      firstName?: string;
      lastName?: string;
      emails?: Array<{ email: string }>;
    };
  };
  onLogout: () => void;
  onEditProfile?: () => void;
  loading?: boolean;
  style?: any;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({
  member,
  onLogout,
  onEditProfile,
  loading = false,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createAuthStyles(theme);

  // Extract member information
  const firstName = member.firstName || member.contactDetails?.firstName || '';
  const lastName = member.lastName || member.contactDetails?.lastName || '';
  
  // Handle email - it might be a string or an object with {address, isVerified}
  const emailValue = member.email;
  const email = typeof emailValue === 'string' 
    ? emailValue 
    : emailValue?.address || member.loginEmail || member.contactDetails?.emails?.[0]?.email || '';
  
  const fullName = `${firstName} ${lastName}`.trim();
  const displayName = fullName || email || 'Unknown User';
  const initials = fullName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : '👤';

  return (
    <View style={[styles.memberStatusSection, style]}>
      <Text style={styles.memberStatusTitle}>Member Profile</Text>

      {/* Member Info */}
      <View style={styles.memberInfo}>
        {/* Avatar */}
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{initials}</Text>
        </View>

        {/* Name and Email */}
        <Text style={styles.memberName}>{displayName}</Text>
        {email && fullName && (
          <Text style={styles.memberEmail}>{email}</Text>
        )}
      </View>

      {/* Member Stats */}
      <View style={styles.memberStats}>
        <View style={styles.memberStatItem}>
          <Text style={styles.memberStatValue}>🆔</Text>
          <Text style={styles.memberStatLabel}>Member</Text>
        </View>
        <View style={styles.memberStatItem}>
          <Text style={styles.memberStatValue}>✅</Text>
          <Text style={styles.memberStatLabel}>Verified</Text>
        </View>
        <View style={styles.memberStatItem}>
          <Text style={styles.memberStatValue}>🛡️</Text>
          <Text style={styles.memberStatLabel}>Secure</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {onEditProfile && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onEditProfile}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.primaryButtonDisabled,
          ]}
          onPress={onLogout}
          disabled={loading}
        >
          <Text
            style={[
              styles.primaryButtonText,
              loading && styles.primaryButtonTextDisabled,
            ]}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Member ID (for debugging/support) */}
      {member.id && (
        <Text style={[styles.memberEmail, { fontSize: 10, marginTop: 8 }]}>
          ID: {member.id.substring(0, 8)}...
        </Text>
      )}
    </View>
  );
};

export default MemberProfile;
