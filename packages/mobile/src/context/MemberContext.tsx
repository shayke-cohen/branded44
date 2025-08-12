import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { wixApiClient } from '../utils/wixApiClient';

// Member data interface
interface MemberData {
  id: string;
  email: {
    address: string;
    isVerified: boolean;
  };
  identityProfile: {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    picture?: string;
    privacyStatus?: 'PUBLIC' | 'PRIVATE' | 'UNDEFINED';
  };
  status: {
    name: string;
    reasons: string[];
  };
}

// Member context interface
interface MemberContextType {
  // State
  isLoggedIn: boolean;
  member: MemberData | null;
  loading: boolean;
  
  // Actions
  refreshMemberStatus: () => void;
  logout: () => Promise<void>;
  
  // Helper functions
  getMemberDisplayName: () => string;
  getMemberInitials: () => string;
  isMemberVerified: () => boolean;
}

// Create the context
const MemberContext = createContext<MemberContextType | undefined>(undefined);

// Provider props interface
interface MemberProviderProps {
  children: ReactNode;
}

// Member provider component
export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check member login status
  const checkMemberStatus = () => {
    try {
      const loggedIn = wixApiClient.isMemberLoggedIn();
      const memberData = wixApiClient.getCurrentMember();
      
      setIsLoggedIn(loggedIn);
      setMember(memberData);
      
      console.log('👤 [MEMBER CONTEXT] Status checked:', {
        loggedIn,
        memberEmail: memberData?.email?.address,
        memberId: memberData?.id,
        hasStoredMember: !!memberData,
      });
      
      // Additional debug info for persistence troubleshooting
      if (loggedIn && memberData) {
        console.log('✅ [MEMBER PERSISTENCE] Member successfully restored from storage');
      } else {
        console.log('ℹ️ [MEMBER PERSISTENCE] No stored member found or member not logged in');
      }
    } catch (error) {
      console.error('❌ [MEMBER CONTEXT] Error checking member status:', error);
      setIsLoggedIn(false);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh member status (public method)
  const refreshMemberStatus = () => {
    console.log('🔄 [MEMBER CONTEXT] Refreshing member status...');
    checkMemberStatus();
  };

  // Logout member
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await wixApiClient.logoutMember();
      setIsLoggedIn(false);
      setMember(null);
      console.log('🚪 [MEMBER CONTEXT] Member logged out successfully');
    } catch (error) {
      console.error('❌ [MEMBER CONTEXT] Error during logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get member display name
  const getMemberDisplayName = (): string => {
    if (!member) return 'Guest';
    
    const { firstName, lastName, nickname } = member.identityProfile;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (nickname) {
      return nickname;
    } else {
      return member.email?.address?.split('@')[0] || 'Member';
    }
  };

  // Get member initials for avatar
  const getMemberInitials = (): string => {
    if (!member) return '?';
    
    const { firstName, lastName } = member.identityProfile;
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (member.email?.address) {
      return member.email.address.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Check if member email is verified
  const isMemberVerified = (): boolean => {
    return member?.email?.isVerified || false;
  };

  // Initialize member status on mount and listen for changes
  useEffect(() => {
    console.log('👤 [MEMBER CONTEXT] Initializing member context...');
    
    // Check initial status
    checkMemberStatus();
    
    // Add listener for member state changes (if available)
    const handleMemberStateChange = () => {
      console.log('👤 [MEMBER CONTEXT] Member state changed, refreshing...');
      checkMemberStatus();
    };
    
    // Check if the listener methods exist (for backward compatibility and testing)
    if (typeof wixApiClient.addMemberStateChangeListener === 'function') {
      wixApiClient.addMemberStateChangeListener(handleMemberStateChange);
      
      return () => {
        if (typeof wixApiClient.removeMemberStateChangeListener === 'function') {
          wixApiClient.removeMemberStateChangeListener(handleMemberStateChange);
        }
      };
    }
  }, []);

  // Context value
  const value: MemberContextType = {
    // State
    isLoggedIn,
    member,
    loading,
    
    // Actions
    refreshMemberStatus,
    logout,
    
    // Helper functions
    getMemberDisplayName,
    getMemberInitials,
    isMemberVerified,
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
};

// Custom hook to use member context
export const useMember = (): MemberContextType => {
  const context = useContext(MemberContext);
  
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  
  return context;
};

// Higher-order component for member-only screens
export const withMemberAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithMemberAuthComponent: React.FC<P> = (props) => {
    const { isLoggedIn, loading } = useMember();
    
    if (loading) {
      return (
        <div style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 20 
        }}>
          <div>Loading...</div>
        </div>
      );
    }
    
    if (!isLoggedIn) {
      return (
        <div style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 20 
        }}>
          <div>Please log in to access this content.</div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
  
  WithMemberAuthComponent.displayName = `withMemberAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithMemberAuthComponent;
};

// Export default context for direct access if needed
export default MemberContext; 