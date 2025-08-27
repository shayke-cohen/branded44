/**
 * WixMemberService - Service layer for member authentication operations
 * 
 * Centralizes all member auth API calls and business logic
 * Provides clean interface for authentication management
 */

import { wixAuthenticationClient } from '../../../../utils/wix';

export interface MemberCredentials {
  email: string;
  password: string;
}

export interface MemberRegistrationData extends MemberCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface MemberProfile {
  id?: string;
  email?: string;
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
}

export interface AuthResult {
  success: boolean;
  member?: MemberProfile;
  error?: string;
  state?: string;
}

class WixMemberService {
  private static instance: WixMemberService;

  public static getInstance(): WixMemberService {
    if (!WixMemberService.instance) {
      WixMemberService.instance = new WixMemberService();
    }
    return WixMemberService.instance;
  }

  /**
   * Login member with email and password
   */
  public async login(credentials: MemberCredentials): Promise<AuthResult> {
    try {
      console.log('🔄 [MEMBER SERVICE] Attempting login for:', credentials.email);
      console.log('🌐 [MEMBER SERVICE] Using new REST-based authentication client');

      const response = await wixAuthenticationClient.loginMember(credentials.email, credentials.password);

      if (response.success && response.member) {
        console.log('✅ [MEMBER SERVICE] Login successful via REST API');
        
        return {
          success: true,
          member: {
            id: response.member.id,
            email: response.member.email || credentials.email,
            firstName: response.member.firstName,
            lastName: response.member.lastName,
            profilePhoto: response.member.picture ? { url: response.member.picture } : undefined,
          },
          state: 'SUCCESS'
        };
      }

      const errorMessage = response.error || 'Login failed';
      console.warn('⚠️ [MEMBER SERVICE] Login failed via REST API:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        state: 'FAILED'
      };
    } catch (error) {
      console.error('❌ [MEMBER SERVICE] Login error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
        state: 'FAILED'
      };
    }
  }

  /**
   * Register new member
   */
  public async register(registrationData: MemberRegistrationData): Promise<AuthResult> {
    try {
      console.log('🔄 [MEMBER SERVICE] Attempting registration for:', registrationData.email);

      // Validate passwords match
      if (registrationData.password !== registrationData.confirmPassword) {
        return {
          success: false,
          error: 'Passwords do not match'
        };
      }

      // Validate password strength
      if (registrationData.password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters'
        };
      }

      const response = await wixAuthenticationClient.registerMember({
        email: registrationData.email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
      });

      if (response.success && response.member) {
        console.log('✅ [MEMBER SERVICE] Registration and login successful via REST API');
        
        return {
          success: true,
          state: 'SUCCESS',
          member: {
            id: response.member.id,
            email: response.member.email || registrationData.email,
            firstName: response.member.firstName || registrationData.firstName,
            lastName: response.member.lastName || registrationData.lastName,
            profilePhoto: response.member.picture ? { url: response.member.picture } : undefined,
          }
        };
      }

      const errorMessage = response.error || 'Registration failed';
      console.warn('⚠️ [MEMBER SERVICE] Registration failed:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        state: response?.state
      };
    } catch (error) {
      console.error('❌ [MEMBER SERVICE] Registration error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Logout current member
   */
  public async logout(): Promise<AuthResult> {
    try {
      console.log('🔄 [MEMBER SERVICE] Attempting logout...');
      console.log('🌐 [MEMBER SERVICE] Using new REST-based authentication client');

      const response = await wixAuthenticationClient.logoutMember();

      if (response.success) {
        console.log('✅ [MEMBER SERVICE] Logout successful via REST API');
        
        return {
          success: true,
          state: 'SUCCESS'
        };
      }

      const errorMessage = response.error || 'Logout failed';
      console.warn('⚠️ [MEMBER SERVICE] Logout failed via REST API:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        state: 'FAILED'
      };
    } catch (error) {
      console.error('❌ [MEMBER SERVICE] Logout error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
        state: 'FAILED'
      };
    }
  }

  /**
   * Get current member status
   */
  public async getCurrentMember(): Promise<AuthResult> {
    try {
      console.log('🔄 [MEMBER SERVICE] Getting current member...');

      const isLoggedIn = await wixApiClient.isMemberLoggedIn();

      if (!isLoggedIn) {
        return {
          success: false,
          error: 'No member logged in'
        };
      }

      const memberData = await wixApiClient.getCurrentMember();

      if (memberData) {
        console.log('✅ [MEMBER SERVICE] Current member retrieved');
        
        return {
          success: true,
          member: memberData
        };
      }

      return {
        success: false,
        error: 'Failed to get member data'
      };
    } catch (error) {
      console.error('❌ [MEMBER SERVICE] Error getting current member:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get member'
      };
    }
  }

  /**
   * Update member profile
   */
  public async updateProfile(profileData: Partial<MemberProfile>): Promise<AuthResult> {
    try {
      console.log('🔄 [MEMBER SERVICE] Updating member profile...');

      const response = await wixApiClient.updateMemberProfile(profileData);

      if (response && response.member) {
        console.log('✅ [MEMBER SERVICE] Profile updated successfully');
        
        return {
          success: true,
          member: response.member
        };
      }

      return {
        success: false,
        error: 'Failed to update profile'
      };
    } catch (error) {
      console.error('❌ [MEMBER SERVICE] Profile update error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  /**
   * Request password reset
   */
  public async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      console.log('🔄 [MEMBER SERVICE] Requesting password reset for:', email);

      const response = await wixApiClient.requestPasswordReset(email);

      if (response && response.state === 'EMAIL_SENT') {
        console.log('✅ [MEMBER SERVICE] Password reset email sent');
        
        return {
          success: true,
          state: response.state
        };
      }

      const errorMessage = response?.errorDescription || 'Failed to send reset email';
      console.warn('⚠️ [MEMBER SERVICE] Password reset failed:', errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    } catch (error) {
      console.error('❌ [MEMBER SERVICE] Password reset error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request password reset'
      };
    }
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  public validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters'
      };
    }

    if (password.length > 100) {
      return {
        isValid: false,
        message: 'Password is too long'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate registration data
   */
  public validateRegistration(data: MemberRegistrationData): { isValid: boolean; message?: string } {
    // Check email
    if (!this.validateEmail(data.email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address'
      };
    }

    // Check password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    // Check password confirmation
    if (data.password !== data.confirmPassword) {
      return {
        isValid: false,
        message: 'Passwords do not match'
      };
    }

    // Check names
    if (!data.firstName.trim()) {
      return {
        isValid: false,
        message: 'First name is required'
      };
    }

    if (!data.lastName.trim()) {
      return {
        isValid: false,
        message: 'Last name is required'
      };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const memberService = WixMemberService.getInstance();
