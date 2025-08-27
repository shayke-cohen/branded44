/**
 * Wix Authentication Client
 * 
 * Handles all authentication-related operations including:
 * - Member login/logout/registration
 * - Visitor token generation
 * - OAuth token management
 * - Session management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { getClientId, getSiteId, getApiBaseUrl } from '../../../config/wixConfig';
import { featureManager } from '../../../config/features';
import { acquireTokenGenerationLock } from '../shared/authLock';

// === TYPES ===

export interface MemberTokens {
  accessToken: {
    value: string;
    expiresAt: number;
  };
  refreshToken: {
    value: string;
  };
}

export interface VisitorTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface MemberIdentity {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  picture?: string;
  profile?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Member state change listeners
type MemberStateChangeListener = () => void;
const memberStateChangeListeners: MemberStateChangeListener[] = [];

// === MAIN CLIENT CLASS ===

export class WixAuthenticationClient {
  private baseURL = getApiBaseUrl();
  private siteId = getSiteId();
  private clientId = getClientId();
  private wixClient: any = null;
  private authToken: string | null = null;
  private visitorTokens: VisitorTokens | null = null;
  private memberTokens: MemberTokens | null = null;
  private currentMember: MemberIdentity | null = null;
  private sessionToken: string | null = null;

  constructor() {
    console.log('🔐 [AUTH] WixAuthenticationClient initialized');
    
    if (featureManager.isAuthSDKEnabled()) {
      console.log('✅ [AUTH] SDK enabled for authentication');
      this.initializeWixClient();
    } else {
      console.log('🔐 [AUTH] SDK disabled, using REST API only');
    }
    
    this.loadStoredAuth();
    this.loadStoredMemberAuth();
    this.initializeVisitorAuthentication();
  }

  // === SDK INITIALIZATION ===

  private initializeWixClient(): void {
    try {
      this.wixClient = createClient({
        modules: {},
        auth: OAuthStrategy({
          clientId: this.clientId,
        }),
      });
      console.log('✅ [AUTH SDK] Wix SDK client initialized with OAuth strategy');
    } catch (error) {
      console.error('❌ [AUTH SDK] Failed to initialize Wix SDK client:', error);
    }
  }

  private async updateWixClientAuth(): Promise<void> {
    if (!this.wixClient || !featureManager.isAuthSDKEnabled()) {
      return;
    }

    try {
      await this.ensureValidVisitorTokens();

      if (this.memberTokens && this.isMemberTokenValid(this.memberTokens)) {
        const tokens = {
          accessToken: {
            value: this.memberTokens.accessToken.value,
            expiresAt: this.memberTokens.accessToken.expiresAt,
          },
          refreshToken: {
            value: this.memberTokens.refreshToken.value,
            role: 'member' as const,
          },
        };
        this.wixClient.auth.setTokens(tokens);
        console.log('✅ [AUTH SDK] Updated client with member tokens');
      } else if (this.visitorTokens) {
        const tokens = {
          accessToken: {
            value: this.visitorTokens.accessToken,
            expiresAt: this.visitorTokens.expiresAt,
          },
          refreshToken: {
            value: this.visitorTokens.refreshToken,
            role: 'visitor' as const,
          },
        };
        this.wixClient.auth.setTokens(tokens);
        console.log('✅ [AUTH SDK] Updated client with visitor tokens');
      }
    } catch (error) {
      console.error('❌ [AUTH SDK] Failed to update client authentication:', error);
    }
  }

  // === VISITOR AUTHENTICATION ===

  async initializeVisitorAuthentication(): Promise<void> {
    try {
      await this.ensureValidVisitorTokens();
    } catch (error) {
      console.error('❌ [AUTH] Failed to initialize visitor authentication:', error);
    }
  }

  async generateVisitorTokens(): Promise<void> {
    // Use shared authentication lock to prevent race conditions
    await acquireTokenGenerationLock(
      () => this._generateVisitorTokensInternal(),
      { clientName: 'WixAuthenticationClient' }
    );
  }

  private async _generateVisitorTokensInternal(): Promise<void> {
    console.log('🔄 [AUTH] Generating new visitor tokens...');

    if (featureManager.isAuthSDKEnabled() && this.wixClient) {
      // Use SDK method
      const tokens = await this.wixClient.auth.generateVisitorTokens();
      
      // Fix timestamp conversion - ensure it's a proper Unix timestamp in milliseconds
      let expiresAt: number;
      if (typeof tokens.accessToken.expiresAt === 'number') {
        // If it's already a number, check if it's seconds or milliseconds
        expiresAt = tokens.accessToken.expiresAt > 9999999999 
          ? tokens.accessToken.expiresAt  // Already in milliseconds
          : tokens.accessToken.expiresAt * 1000; // Convert seconds to milliseconds
      } else {
        // If it's a string or Date, convert to timestamp
        expiresAt = new Date(tokens.accessToken.expiresAt).getTime();
      }
      
      this.visitorTokens = {
        accessToken: tokens.accessToken.value,
        refreshToken: tokens.refreshToken.value,
        expiresAt: expiresAt,
      };
      
      const now = Date.now();
      const expiresIn = Math.round((expiresAt - now) / 1000 / 60); // minutes
      console.log('✅ [AUTH SDK] Generated visitor tokens via SDK');
      console.log(`🕒 [AUTH SDK] Token expires in ${expiresIn} minutes (${new Date(expiresAt).toISOString()})`);
      
      if (expiresAt <= now) {
        console.warn('⚠️ [AUTH SDK] WARNING: Generated token is already expired!');
      }
    } else {
      // Use REST API fallback
      await this._generateVisitorTokensREST();
    }

    await this.storeVisitorTokens();
    await this.updateWixClientAuth();
  }

  private async _generateVisitorTokensREST(): Promise<void> {
    console.log('🌐 [AUTH REST] Generating visitor tokens via OAuth REST API...');
    
    try {
      // Step 1: Try client credentials flow for visitor access
      await this._tryClientCredentialsFlow();
      
    } catch (error) {
      console.warn('⚠️ [AUTH REST] Client credentials failed, trying implicit flow:', error);
      
      try {
        // Step 2: Try implicit flow for visitor tokens
        await this._tryImplicitFlow();
        
      } catch (implicitError) {
        console.warn('⚠️ [AUTH REST] Implicit flow failed, using anonymous access:', implicitError);
        
        // Step 3: Generate anonymous visitor session for public API access
        await this._generateAnonymousVisitorSession();
      }
    }
  }

  private async _tryClientCredentialsFlow(): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${this.baseURL}/oauth2/token`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          scope: 'offline_access',
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Client credentials flow failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        const now = Date.now();
        const expiresIn = data.expires_in || 3600;
        
        this.visitorTokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || `refresh_${now}`,
          expiresAt: now + (expiresIn * 1000),
        };
        
        console.log('✅ [AUTH REST] Generated visitor tokens via client credentials');
      } else {
        throw new Error('No access token in response');
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async _tryImplicitFlow(): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      // Try implicit flow without redirect (for visitor access)
      const response = await fetch(`${this.baseURL}/oauth2/token`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'wix-site-id': this.siteId,
        },
        body: JSON.stringify({
          grant_type: 'visitor_token',
          client_id: this.clientId,
          site_id: this.siteId,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Implicit flow failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        const now = Date.now();
        const expiresIn = data.expires_in || 3600;
        
        this.visitorTokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || `refresh_${now}`,
          expiresAt: now + (expiresIn * 1000),
        };
        
        console.log('✅ [AUTH REST] Generated visitor tokens via implicit flow');
      } else {
        throw new Error('No access token in implicit flow response');
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async _generateAnonymousVisitorSession(): Promise<void> {
    console.log('🔓 [AUTH REST] Generating anonymous visitor session...');
    
    // Generate a session-based visitor token for anonymous API access
    const now = Date.now();
    const sessionId = `anon_${now}_${Math.random().toString(36).slice(2)}`;
    
    this.visitorTokens = {
      accessToken: `visitor_session_${sessionId}`,
      refreshToken: `visitor_refresh_${sessionId}`,
      expiresAt: now + (2 * 60 * 60 * 1000), // 2 hours
    };
    
    console.log('🔓 [AUTH REST] Generated anonymous visitor session for public API access');
    console.log('📋 [AUTH REST] Note: This is for public APIs only - authenticated endpoints will fail');
  }

  async ensureValidVisitorTokens(): Promise<void> {
    // Quick check - if we have valid tokens, return immediately
    if (this.visitorTokens && !this.isVisitorTokenExpired()) {
      return;
    }

    // If tokens are needed, generate them
    if (!this.visitorTokens || this.isVisitorTokenExpired()) {
      await this.generateVisitorTokens();
    }
  }

  private isVisitorTokenExpired(): boolean {
    if (!this.visitorTokens) return true;
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minute buffer
    return now >= (this.visitorTokens.expiresAt - buffer);
  }

  // === MEMBER AUTHENTICATION ===

  async loginMember(email: string, password: string): Promise<{ success: boolean; member?: MemberIdentity; error?: string }> {
    try {
      console.log('🔐 [AUTH] Attempting member login...');
      
      if (featureManager.isAuthSDKEnabled() && this.wixClient) {
        console.log('✅ [AUTH SDK] Using Wix SDK for member authentication');
        return await this._loginMemberSDK(email, password);
      } else {
        console.log('🌐 [AUTH REST] Using REST API for member authentication');
        return await this._loginMemberREST(email, password);
      }
    } catch (error) {
      console.error('❌ [AUTH] Member login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async _loginMemberSDK(email: string, password: string): Promise<{ success: boolean; member?: MemberIdentity; error?: string }> {
    console.log('✅ [AUTH SDK] Using SDK-generated visitor tokens with REST login endpoint...');
    
    try {
      // Ensure we have SDK-generated visitor tokens first
      await this.ensureValidVisitorTokens();
      
      if (!this.visitorTokens?.accessToken) {
        throw new Error('Missing SDK-generated visitor authentication context');
      }
      
      const requestBody = {
        loginId: { email },
        password,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId,
        'Authorization': `Bearer ${this.visitorTokens.accessToken}`,
      };

      console.log('🌐 [AUTH SDK] Making login request with SDK visitor tokens to:', this.siteId);

      const response = await fetch(`${this.baseURL}/_api/iam/authentication/v2/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AUTH SDK] Login failed:', {
          status: response.status,
          error: errorText,
          siteId: this.siteId,
        });
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const authResponse = await response.json();
      
      if (authResponse.state === 'SUCCESS' && authResponse.sessionToken) {
        // Store session token for direct use
        this.sessionToken = authResponse.sessionToken;
        
        // Store member identity
        this.currentMember = {
          id: authResponse.identity?.id || authResponse.member?.id,
          email: authResponse.identity?.email || authResponse.member?.email || email,
          firstName: authResponse.identity?.firstName || authResponse.member?.profile?.firstName,
          lastName: authResponse.identity?.lastName || authResponse.member?.profile?.lastName,
          picture: authResponse.identity?.picture || authResponse.member?.profile?.photo?.url,
        };
        
        // Store session token for member authentication
        // For headless authentication, we'll use the session token directly
        this.memberTokens = {
          accessToken: {
            value: authResponse.sessionToken,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from login response
          },
          refreshToken: {
            value: authResponse.refreshToken || `refresh_${Date.now()}`,
          },
        };
        
        console.log('✅ [AUTH HEADLESS] Using session token for member authentication');
        console.log('📋 [AUTH HEADLESS] Session token preview:', authResponse.sessionToken?.substring(0, 20) + '...');
        
        await this.storeMemberAuth();
        this.notifyMemberStateChange();
        
        console.log('✅ [AUTH SDK] Member logged in successfully using SDK visitor tokens');
        return { success: true, member: this.currentMember };
      }

      return { success: false, error: authResponse.errorDescription || 'Login failed - invalid response' };
      
    } catch (error) {
      console.error('❌ [AUTH SDK] Member login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  private async _loginMemberREST(email: string, password: string): Promise<{ success: boolean; member?: MemberIdentity; error?: string }> {
    console.log('🌐 [AUTH REST] Attempting member login via REST API...');
    
    // Ensure we have visitor tokens first
    await this.ensureValidVisitorTokens();
    
    try {
      // Try Wix Identity authentication endpoint
      const response = await fetch(`${this.baseURL}/v1/authentication/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'wix-site-id': this.siteId,
          'Authorization': this.visitorTokens ? `Bearer ${this.visitorTokens.accessToken}` : '',
        },
        body: JSON.stringify({
          email,
          password,
          clientId: this.clientId,
        }),
      });

      if (!response.ok) {
        // Try alternative member authentication endpoint
        return await this._tryAlternativeMemberLogin(email, password);
      }

      const data = await response.json();
      
      if (data.accessToken || data.access_token) {
        const accessToken = data.accessToken || data.access_token;
        const expiresIn = data.expiresIn || data.expires_in || 3600;
        const now = Date.now();
        
        this.memberTokens = {
          accessToken: {
            value: accessToken,
            expiresAt: now + (expiresIn * 1000),
          },
          refreshToken: {
            value: data.refreshToken || data.refresh_token || `refresh_${now}`,
          },
        };
        
        // Try to fetch member details
        const member = await this.fetchCurrentMember();
        if (member) {
          this.currentMember = member;
          this.notifyMemberStateChange();
          await this.storeMemberAuth();
          console.log('✅ [AUTH REST] Member logged in via REST API');
          return { success: true, member };
        }
      }

      return { success: false, error: 'Invalid response from server' };
      
    } catch (error) {
      console.error('❌ [AUTH REST] Member login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  private async _tryAlternativeMemberLogin(email: string, password: string): Promise<{ success: boolean; member?: MemberIdentity; error?: string }> {
    console.log('🔄 [AUTH REST] Trying alternative member login endpoint...');
    
    try {
      const response = await fetch(`${this.baseURL}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'wix-site-id': this.siteId,
        },
        body: JSON.stringify({
          grant_type: 'password',
          username: email,
          password: password,
          client_id: this.clientId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Alternative login failed: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      
      if (data.access_token) {
        const now = Date.now();
        const expiresIn = data.expires_in || 3600;
        
        this.memberTokens = {
          accessToken: {
            value: data.access_token,
            expiresAt: now + (expiresIn * 1000),
          },
          refreshToken: {
            value: data.refresh_token || `refresh_${now}`,
          },
        };
        
        const member = await this.fetchCurrentMember();
        if (member) {
          this.currentMember = member;
          this.notifyMemberStateChange();
          await this.storeMemberAuth();
          console.log('✅ [AUTH REST] Member logged in via alternative REST endpoint');
          return { success: true, member };
        }
      }

      return { success: false, error: 'No access token in alternative login response' };
      
    } catch (error) {
      return { success: false, error: `Alternative login error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }



  async logoutMember(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚪 [AUTH] Logging out member...');
      
      // Clear stored auth
      await this.clearMemberAuth();
      
      // Reset state
      this.memberTokens = null;
      this.currentMember = null;
      this.sessionToken = null;
      
      this.notifyMemberStateChange();
      console.log('✅ [AUTH] Member logged out successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Member logout failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async registerMember(data: RegisterData): Promise<{ success: boolean; member?: MemberIdentity; error?: string }> {
    try {
      console.log('📝 [AUTH] Attempting member registration...');
      
      const response = await fetch(`${this.baseURL}/_api/iam/authentication/v2/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'wix-site-id': this.siteId,
          'Authorization': this.visitorTokens ? `Bearer ${this.visitorTokens.accessToken}` : '',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Registration failed: ${response.status} ${errorText}` };
      }

      const responseData = await response.json();
      
      if (responseData.sessionToken) {
        this.sessionToken = responseData.sessionToken;
        
        // Store session token for member authentication after registration
        this.memberTokens = {
          accessToken: {
            value: responseData.sessionToken,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          },
          refreshToken: {
            value: responseData.refreshToken || `refresh_${Date.now()}`,
          },
        };
        
        console.log('✅ [AUTH HEADLESS] Using session token for registration authentication');
        
        const member = await this.fetchCurrentMember();
        if (member) {
          this.currentMember = member;
          this.notifyMemberStateChange();
          await this.storeMemberAuth();
          console.log('✅ [AUTH] Member registered successfully');
          return { success: true, member };
        }
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('❌ [AUTH] Member registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // === TOKEN MANAGEMENT ===

  private isMemberTokenValid(tokens: MemberTokens): boolean {
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minute buffer
    const isValid = now < (tokens.accessToken.expiresAt - buffer);
    
    if (!isValid) {
      const expiredMinutesAgo = Math.round((now - tokens.accessToken.expiresAt) / 1000 / 60);
      console.log('⏰ [AUTH TOKEN] Member tokens expired', expiredMinutesAgo, 'minutes ago');
    }
    
    return isValid;
  }

  private isVisitorTokenValid(tokens: VisitorTokens): boolean {
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minute buffer
    return now < (tokens.expiresAt - buffer);
  }

  // === SESSION TOKEN HANDLING FOR HEADLESS AUTHENTICATION ===

  // === MEMBER STATE ===

  getCurrentMember(): MemberIdentity | null {
    return this.currentMember;
  }

  isMemberLoggedIn(): boolean {
    const hasCurrentMember = !!this.currentMember;
    const hasMemberTokens = !!this.memberTokens;
    const areTokensValid = this.memberTokens ? this.isMemberTokenValid(this.memberTokens) : false;
    const isLoggedIn = hasCurrentMember && hasMemberTokens && areTokensValid;
    
    console.log('🔍 [AUTH DEBUG] Member login check:', {
      hasCurrentMember,
      hasMemberTokens,
      areTokensValid,
      isLoggedIn,
      memberEmail: this.currentMember?.email
    });
    
    return isLoggedIn;
  }

  hasMemberTokens(): boolean {
    return !!(this.memberTokens && this.isMemberTokenValid(this.memberTokens));
  }

  private async fetchCurrentMember(): Promise<MemberIdentity | null> {
    if (!this.memberTokens) return null;

    try {
      // Implementation would fetch member details from API
      // This is a placeholder
      return {
        id: 'member_id',
        email: 'member@example.com',
      };
    } catch (error) {
      console.error('❌ [AUTH] Failed to fetch current member:', error);
      return null;
    }
  }

  // === MEMBER STATE LISTENERS ===

  addMemberStateChangeListener(listener: MemberStateChangeListener): void {
    memberStateChangeListeners.push(listener);
  }

  removeMemberStateChangeListener(listener: MemberStateChangeListener): void {
    const index = memberStateChangeListeners.indexOf(listener);
    if (index > -1) {
      memberStateChangeListeners.splice(index, 1);
    }
  }

  private notifyMemberStateChange(): void {
    memberStateChangeListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('❌ [AUTH] Error in member state change listener:', error);
      }
    });
  }

  // === STORAGE METHODS ===

  private async loadStoredAuth(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('wix_visitor_tokens');
      if (stored) {
        this.visitorTokens = JSON.parse(stored);
        console.log('✅ [AUTH] Loaded stored visitor tokens');
      }
    } catch (error) {
      console.error('❌ [AUTH] Failed to load stored auth:', error);
    }
  }

  private async storeVisitorTokens(): Promise<void> {
    if (!this.visitorTokens) return;
    
    try {
      await AsyncStorage.setItem('wix_visitor_tokens', JSON.stringify(this.visitorTokens));
      console.log('✅ [AUTH] Stored visitor tokens');
    } catch (error) {
      console.error('❌ [AUTH] Failed to store visitor tokens:', error);
    }
  }

  private async loadStoredMemberAuth(): Promise<void> {
    try {
      const [memberTokensStr, currentMemberStr] = await Promise.all([
        AsyncStorage.getItem('wix_member_tokens'),
        AsyncStorage.getItem('wix_current_member'),
      ]);

      if (memberTokensStr && currentMemberStr) {
        this.memberTokens = JSON.parse(memberTokensStr);
        this.currentMember = JSON.parse(currentMemberStr);
        
        if (this.memberTokens && this.isMemberTokenValid(this.memberTokens)) {
          console.log('✅ [AUTH] Loaded stored member auth');
          this.notifyMemberStateChange();
        } else {
          console.log('⚠️ [AUTH] Stored member tokens expired, clearing auth');
          await this.clearMemberAuth();
        }
      }
    } catch (error) {
      console.error('❌ [AUTH] Failed to load stored member auth:', error);
      await this.clearMemberAuth();
    }
  }

  private async storeMemberAuth(): Promise<void> {
    if (!this.memberTokens || !this.currentMember) return;
    
    try {
      await Promise.all([
        AsyncStorage.setItem('wix_member_tokens', JSON.stringify(this.memberTokens)),
        AsyncStorage.setItem('wix_current_member', JSON.stringify(this.currentMember)),
      ]);
      console.log('✅ [AUTH] Stored member authentication');
    } catch (error) {
      console.error('❌ [AUTH] Failed to store member auth:', error);
    }
  }

  private async clearMemberAuth(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem('wix_member_tokens'),
        AsyncStorage.removeItem('wix_current_member'),
      ]);
      console.log('✅ [AUTH] Cleared member authentication storage');
    } catch (error) {
      console.error('❌ [AUTH] Failed to clear member auth storage:', error);
    }
  }



  // === PUBLIC API FOR OTHER CLIENTS ===

  getVisitorTokens(): VisitorTokens | null {
    return this.visitorTokens;
  }

  getMemberTokens(): MemberTokens | null {
    return this.memberTokens;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'wix-site-id': this.siteId,
    };

    // Use existing valid tokens if available, otherwise try to generate new ones
    if (this.visitorTokens && this.isVisitorTokenValid(this.visitorTokens)) {
      console.log('✅ [AUTH] Using cached valid visitor tokens');
    } else {
      if (this.visitorTokens) {
        const expiresIn = Math.round((this.visitorTokens.expiresAt - Date.now()) / 1000 / 60); // minutes
        console.log(`⏰ [AUTH] Cached tokens expired ${Math.abs(expiresIn)} minutes ago - generating new ones`);
      } else {
        console.log('🔄 [AUTH] No cached tokens - generating new ones');
      }
      
      try {
        await this.ensureValidVisitorTokens();
      } catch (error) {
        console.warn('⚠️ [AUTH] Could not generate visitor tokens, continuing with existing tokens or no auth:', error);
      }
    }

    // Add authentication headers for headless authentication (visitor/member tokens)
    // Prioritize member tokens when logged in for member-specific API access
    if (this.memberTokens && this.isMemberTokenValid(this.memberTokens)) {
      headers['Authorization'] = `Bearer ${this.memberTokens.accessToken.value}`;
      console.log('🔑 [AUTH HEADLESS] Using member access token for authentication');
      console.log('📋 [AUTH HEADLESS] Member token preview:', this.memberTokens.accessToken.value.substring(0, 20) + '...');
    } else if (this.memberTokens) {
      console.log('⚠️ [AUTH HEADLESS] Member tokens exist but are invalid/expired, falling back to visitor');
      if (this.visitorTokens) {
        headers['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
        console.log('🔑 [AUTH HEADLESS] Using visitor token as fallback for expired member tokens');
      }
    } else if (this.visitorTokens) {
      headers['Authorization'] = `Bearer ${this.visitorTokens.accessToken}`;
      console.log('🔑 [AUTH HEADLESS] Using visitor token for authentication');
      console.log('📋 [AUTH HEADLESS] Visitor token preview:', this.visitorTokens.accessToken.substring(0, 20) + '...');
    } else {
      console.log('⚠️ [AUTH HEADLESS] No authentication tokens available - using public API access');
    }

    // Log final headers for debugging (without sensitive data)
    console.log('🔍 [AUTH HEADLESS] Auth headers prepared:', {
      hasWixSiteId: !!headers['wix-site-id'],
      hasAuthorization: !!headers['Authorization'],
      authType: headers['Authorization'] ? (this.memberTokens && this.isMemberTokenValid(this.memberTokens) ? 'member' : 'visitor') : 'none'
    });

    return headers;
  }
}

// Export singleton instance
export const wixAuthenticationClient = new WixAuthenticationClient();
