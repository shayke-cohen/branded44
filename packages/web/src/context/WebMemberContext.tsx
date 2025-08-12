import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wixApiClient } from '@mobile/utils/wixApiClient';

// Member data interface - same as mobile
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

// Member context interface - extended for web
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
  
  // Web-specific properties
  visitorMode?: boolean;
  toggleVisitorMode?: () => void;
}

// Create the context
const MemberContext = createContext<MemberContextType | undefined>(undefined);

// Provider props interface
interface MemberProviderProps {
  children: ReactNode;
}

// Real Member provider component using Wix API
export const WebMemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitorMode, setVisitorMode] = useState(false);

  // Check if visitor mode is enabled via URL parameter or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const visitorModeParam = urlParams.get('visitor');
    const storedVisitorMode = localStorage.getItem('web_visitor_mode');
    
    if (visitorModeParam === 'true' || storedVisitorMode === 'true') {
      console.log('🌐 [WEB MEMBER CONTEXT] Visitor mode enabled');
      setVisitorMode(true);
      setIsLoggedIn(false);
      setMember(null);
      setLoading(false);
      localStorage.setItem('web_visitor_mode', 'true');
      return;
    }
    
    // Normal member initialization
    initializeMemberStatus();
  }, []);

  // Initialize member status from stored auth
  const initializeMemberStatus = async () => {
    try {
      console.log('🌐 [WEB MEMBER CONTEXT] Initializing member status...');
      setLoading(true);
      
      // Check if user is already logged in
      const isUserLoggedIn = await wixApiClient.isMemberLoggedIn();
      
      if (isUserLoggedIn) {
        const currentMember = await wixApiClient.getCurrentMember();
        if (currentMember) {
          console.log('🌐 [WEB MEMBER CONTEXT] Found existing member session:', currentMember.id);
          setIsLoggedIn(true);
          setMember(currentMember);
        }
      } else {
        console.log('🌐 [WEB MEMBER CONTEXT] No existing member session found');
        setIsLoggedIn(false);
        setMember(null);
      }
    } catch (error) {
      console.error('🌐 [WEB MEMBER CONTEXT] Error initializing member status:', error);
      setIsLoggedIn(false);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh member status
  const refreshMemberStatus = async () => {
    try {
      console.log('🌐 [WEB MEMBER CONTEXT] Refreshing member status...');
      setLoading(true);
      
      const isUserLoggedIn = await wixApiClient.isMemberLoggedIn();
      
      if (isUserLoggedIn) {
        const currentMember = await wixApiClient.getCurrentMember();
        if (currentMember) {
          console.log('🌐 [WEB MEMBER CONTEXT] Member status refreshed:', currentMember.id);
          setIsLoggedIn(true);
          setMember(currentMember);
        } else {
          setIsLoggedIn(false);
          setMember(null);
        }
      } else {
        setIsLoggedIn(false);
        setMember(null);
      }
    } catch (error) {
      console.error('🌐 [WEB MEMBER CONTEXT] Error refreshing member status:', error);
      setIsLoggedIn(false);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout member
  const logout = async (): Promise<void> => {
    try {
      console.log('🌐 [WEB MEMBER CONTEXT] Logging out member...');
      setLoading(true);
      
      await wixApiClient.logoutMember();
      
      setIsLoggedIn(false);
      setMember(null);
      
      console.log('🌐 [WEB MEMBER CONTEXT] Member logged out successfully');
    } catch (error) {
      console.error('🌐 [WEB MEMBER CONTEXT] Error logging out member:', error);
      // Even if logout fails, clear local state
      setIsLoggedIn(false);
      setMember(null);
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

  // Toggle visitor mode
  const toggleVisitorMode = () => {
    const newVisitorMode = !visitorMode;
    setVisitorMode(newVisitorMode);
    
    if (newVisitorMode) {
      console.log('🌐 [WEB MEMBER CONTEXT] Switching to visitor mode');
      setIsLoggedIn(false);
      setMember(null);
      localStorage.setItem('web_visitor_mode', 'true');
    } else {
      console.log('🌐 [WEB MEMBER CONTEXT] Switching to member mode');
      localStorage.removeItem('web_visitor_mode');
      initializeMemberStatus();
    }
  };

  // Context value
  const value: MemberContextType = {
    // State
    isLoggedIn: visitorMode ? false : isLoggedIn,
    member: visitorMode ? null : member,
    loading,
    
    // Actions
    refreshMemberStatus,
    logout,
    
    // Helper functions
    getMemberDisplayName,
    getMemberInitials,
    isMemberVerified,
    
    // Web-specific
    visitorMode,
    toggleVisitorMode,
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
    throw new Error('useMember must be used within a WebMemberProvider');
  }
  
  return context;
};

// Higher-order component for member-only screens (web-compatible)
export const withMemberAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithMemberAuthComponent: React.FC<P> = (props) => {
    const { isLoggedIn, loading } = useMember();
    
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
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
          display: 'flex', 
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

// Export for compatibility
export { WebMemberProvider as MemberProvider };
export default MemberContext; 