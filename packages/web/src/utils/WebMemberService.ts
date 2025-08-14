/**
 * WebMemberService - Web-specific override for member authentication operations
 * 
 * This service overrides the mobile WixMemberService to use the webWixApiClient
 * which handles CORS issues by proxying requests through our server.
 */

import { webWixApiClient } from './webWixApiClient';

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

class WebMemberService {
  private static instance: WebMemberService;

  public static getInstance(): WebMemberService {
    if (!WebMemberService.instance) {
      WebMemberService.instance = new WebMemberService();
    }
    return WebMemberService.instance;
  }

  /**
   * Login member with email and password using web-compatible API client
   */
  public async login(credentials: MemberCredentials): Promise<AuthResult> {
    try {
      console.log('🌐 [WEB MEMBER SERVICE] *** USING WEB SERVICE (NOT MOBILE) *** Attempting login for:', credentials.email);

      const response = await webWixApiClient.loginMember(credentials.email, credentials.password);

      if (response && response.state === 'SUCCESS') {
        console.log('✅ [WEB MEMBER SERVICE] Login successful');
        
        return {
          success: true,
          member: response.identity,
          state: response.state
        };
      }

      const errorMessage = response?.message || 'Login failed';
      console.warn('⚠️ [WEB MEMBER SERVICE] Login failed:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        state: response?.state
      };
    } catch (error) {
      console.error('❌ [WEB MEMBER SERVICE] Login error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Register new member using web-compatible API client
   */
  public async register(registrationData: MemberRegistrationData): Promise<AuthResult> {
    try {
      console.log('🌐 [WEB MEMBER SERVICE] Attempting registration for:', registrationData.email);

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

      const response = await webWixApiClient.registerMember(
        registrationData.email,
        registrationData.password,
        {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
        }
      );

      if (response && response.state === 'PENDING_EMAIL_VERIFICATION') {
        console.log('✅ [WEB MEMBER SERVICE] Registration successful, pending verification');
        
        return {
          success: true,
          state: response.state,
          member: response.identity
        };
      }

      if (response && response.state === 'SUCCESS') {
        console.log('✅ [WEB MEMBER SERVICE] Registration and login successful');
        
        return {
          success: true,
          state: response.state,
          member: response.identity
        };
      }

      const errorMessage = response?.message || 'Registration failed';
      console.warn('⚠️ [WEB MEMBER SERVICE] Registration failed:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        state: response?.state
      };
    } catch (error) {
      console.error('❌ [WEB MEMBER SERVICE] Registration error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Logout current member using web-compatible API client
   */
  public async logout(): Promise<AuthResult> {
    try {
      console.log('🌐 [WEB MEMBER SERVICE] Attempting logout...');

      await webWixApiClient.logoutMember();

      console.log('✅ [WEB MEMBER SERVICE] Logout successful');
      
      return {
        success: true,
        state: 'SUCCESS'
      };
    } catch (error) {
      console.error('❌ [WEB MEMBER SERVICE] Logout error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  /**
   * Get current member status using web-compatible API client
   */
  public async getCurrentMember(): Promise<AuthResult> {
    try {
      console.log('🌐 [WEB MEMBER SERVICE] Getting current member...');

      const isLoggedIn = await webWixApiClient.isMemberLoggedIn();

      if (!isLoggedIn) {
        return {
          success: false,
          error: 'No member logged in'
        };
      }

      const memberData = await webWixApiClient.getCurrentMember();

      if (memberData) {
        console.log('✅ [WEB MEMBER SERVICE] Current member retrieved');
        
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
      console.error('❌ [WEB MEMBER SERVICE] Error getting current member:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get member'
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
export const webMemberService = WebMemberService.getInstance();
export default webMemberService;
