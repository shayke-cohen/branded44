/**
 * Server-based Wix API client that proxies requests through our server
 * to avoid CORS issues when making direct calls to Wix APIs from the browser
 */

const SERVER_BASE_URL = (typeof window !== 'undefined' && (window as any).REACT_APP_SERVER_URL) || 'http://localhost:3001';

interface VisitorTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expiresAt?: number;
}

interface AuthResponse {
  state: string;
  sessionToken?: string;
  identity?: any;
  errorCode?: string;
  message?: string;
}

class ServerWixApiClient {
  private visitorTokens: VisitorTokens | null = null;
  private tokenGenerationPromise: Promise<void> | null = null;

  constructor() {
    console.log('🌐 [SERVER API CLIENT] Initializing server-based Wix API client');
    this.loadStoredTokens();
  }

  /**
   * Load stored visitor tokens from localStorage
   */
  private loadStoredTokens(): void {
    try {
      const stored = localStorage.getItem('wix_visitor_tokens');
      if (stored) {
        this.visitorTokens = JSON.parse(stored);
        console.log('🔗 [SERVER API CLIENT] Loaded stored visitor tokens');
      }
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Failed to load stored tokens:', error);
    }
  }

  /**
   * Store visitor tokens in localStorage
   */
  private storeTokens(tokens: VisitorTokens): void {
    try {
      const tokensWithExpiry = {
        ...tokens,
        expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in
      };
      this.visitorTokens = tokensWithExpiry;
      localStorage.setItem('wix_visitor_tokens', JSON.stringify(tokensWithExpiry));
      console.log('✅ [SERVER API CLIENT] Visitor tokens stored successfully');
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Failed to store tokens:', error);
    }
  }

  /**
   * Check if visitor tokens are valid
   */
  private areTokensValid(): boolean {
    if (!this.visitorTokens?.access_token) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = this.visitorTokens.expiresAt || 0;
    
    // Consider tokens expired if they expire within the next 5 minutes
    return expiresAt > (now + 300);
  }

  /**
   * Generate new visitor tokens via server
   */
  private async generateVisitorTokens(): Promise<void> {
    try {
      console.log('🔄 [SERVER API CLIENT] Generating visitor tokens via server...');
      
      const response = await fetch(`${SERVER_BASE_URL}/api/wix/visitor-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error} - ${errorData.details}`);
      }

      const tokens = await response.json();
      this.storeTokens(tokens);
      
      console.log('✅ [SERVER API CLIENT] Visitor tokens generated successfully via server');
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Failed to generate visitor tokens:', error);
      throw error;
    }
  }

  /**
   * Refresh visitor tokens via server
   */
  private async refreshVisitorTokens(): Promise<boolean> {
    try {
      if (!this.visitorTokens?.refresh_token) {
        return false;
      }

      console.log('🔄 [SERVER API CLIENT] Refreshing visitor tokens via server...');

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/refresh-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: this.visitorTokens.refresh_token
        })
      });

      if (!response.ok) {
        console.warn('⚠️ [SERVER API CLIENT] Failed to refresh tokens, will generate new ones');
        return false;
      }

      const tokens = await response.json();
      this.storeTokens(tokens);
      
      console.log('✅ [SERVER API CLIENT] Visitor tokens refreshed successfully via server');
      return true;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Failed to refresh visitor tokens:', error);
      return false;
    }
  }

  /**
   * Ensure we have valid visitor tokens
   */
  private async ensureValidVisitorTokens(): Promise<void> {
    // If we already have a token generation in progress, wait for it
    if (this.tokenGenerationPromise) {
      await this.tokenGenerationPromise;
      return;
    }

    // If tokens are valid, we're good
    if (this.areTokensValid()) {
      return;
    }

    // Try to refresh first if we have a refresh token
    if (this.visitorTokens?.refresh_token) {
      const refreshed = await this.refreshVisitorTokens();
      if (refreshed && this.areTokensValid()) {
        return;
      }
    }

    // Generate new tokens
    this.tokenGenerationPromise = this.generateVisitorTokens();
    try {
      await this.tokenGenerationPromise;
    } finally {
      this.tokenGenerationPromise = null;
    }
  }

  /**
   * Login member via server
   */
  async loginMember(email: string, password: string): Promise<AuthResponse | null> {
    try {
      console.log('🔐 [SERVER API CLIENT] Logging in member via server...');
      
      // Ensure we have valid visitor tokens
      await this.ensureValidVisitorTokens();
      
      if (!this.visitorTokens?.access_token) {
        throw new Error('Missing visitor authentication context');
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/member/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          visitorToken: this.visitorTokens.access_token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] Member login failed:', errorData);
        throw new Error(`Login failed: ${errorData.error} - ${errorData.details}`);
      }

      const authResponse = await response.json();
      console.log('✅ [SERVER API CLIENT] Member login successful via server');
      
      return authResponse;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Member login error:', error);
      throw error;
    }
  }

  /**
   * Register member via server
   */
  async registerMember(email: string, password: string, profile?: any): Promise<AuthResponse | null> {
    try {
      console.log('🆕 [SERVER API CLIENT] Registering member via server...');
      
      // Ensure we have valid visitor tokens
      await this.ensureValidVisitorTokens();
      
      if (!this.visitorTokens?.access_token) {
        throw new Error('Missing visitor authentication context');
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/member/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          profile,
          visitorToken: this.visitorTokens.access_token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] Member registration failed:', errorData);
        throw new Error(`Registration failed: ${errorData.error} - ${errorData.details}`);
      }

      const authResponse = await response.json();
      console.log('✅ [SERVER API CLIENT] Member registration successful via server');
      
      return authResponse;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Member registration error:', error);
      throw error;
    }
  }

  // ===== PRODUCT METHODS =====

  /**
   * Query products via server proxy
   */
  async queryProducts(filters: any = {}): Promise<any> {
    console.log('🛍️ [SERVER API CLIENT] Querying products via server proxy...');
    
    try {
      await this.ensureValidVisitorTokens();
      
      const requestBody = {
        filters,
        visitorToken: this.visitorTokens?.access_token
      };

      console.log('🔍 [SERVER API CLIENT] Making products query request:', {
        endpoint: '/api/wix/products/query',
        filtersKeys: Object.keys(filters),
        hasVisitorToken: !!this.visitorTokens?.access_token
      });

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/products/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] Products query failed:', {
          status: response.status,
          error: errorData
        });
        throw new Error(`Products query failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [SERVER API CLIENT] Products query successful:', {
        productsCount: data.products?.length || 0,
        totalCount: data.totalCount
      });

      return data;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Products query error:', error);
      throw error;
    }
  }

  /**
   * Get single product via server proxy
   */
  async getProduct(productId: string): Promise<any> {
    console.log('🛍️ [SERVER API CLIENT] Getting product via server proxy:', productId);
    
    try {
      await this.ensureValidVisitorTokens();
      
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.visitorTokens?.access_token) {
        headers['Authorization'] = `Bearer ${this.visitorTokens.access_token}`;
      }

      console.log('🔍 [SERVER API CLIENT] Making product detail request:', {
        endpoint: `/api/wix/products/${productId}`,
        productId,
        hasVisitorToken: !!this.visitorTokens?.access_token
      });

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/products/${productId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] Product detail failed:', {
          productId,
          status: response.status,
          error: errorData
        });
        throw new Error(`Product detail failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [SERVER API CLIENT] Product detail successful:', {
        productId,
        productName: data.product?.name || 'Unknown'
      });

      return data.product || data;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Product detail error:', error);
      throw error;
    }
  }

  // ===== BOOKING METHODS =====
  
  /**
   * Query booking services via server proxy
   */
  async queryBookingServices(query: any = {}, fieldsets: string[] = ['FULL']): Promise<any> {
    try {
      console.log('📅 [SERVER API CLIENT] Querying booking services via server proxy...');
      
      // Ensure we have valid visitor tokens
      await this.ensureValidVisitorTokens();

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/bookings/services/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          fieldsets,
          visitorToken: this.visitorTokens?.access_token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] Booking services query failed:', errorData);
        throw new Error(`Booking services query failed: ${errorData.error} - ${errorData.details}`);
      }

      const result = await response.json();
      console.log('✅ [SERVER API CLIENT] Booking services query successful:', {
        servicesCount: result.data?.services?.length || 0
      });
      
      return result.data;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Booking services query error:', error);
      throw error;
    }
  }

  /**
   * Query booking availability via server proxy
   */
  async queryBookingAvailability(query: any): Promise<any> {
    try {
      console.log('📅 [SERVER API CLIENT] Querying booking availability via server proxy...');
      
      // Ensure we have valid visitor tokens
      await this.ensureValidVisitorTokens();

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/bookings/availability/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          visitorToken: this.visitorTokens?.access_token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] Booking availability query failed:', errorData);
        throw new Error(`Booking availability query failed: ${errorData.error} - ${errorData.details}`);
      }

      const result = await response.json();
      console.log('✅ [SERVER API CLIENT] Booking availability query successful:', {
        slotsCount: result.data?.slots?.length || 0
      });
      
      return result.data;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Booking availability query error:', error);
      throw error;
    }
  }

  /**
   * Create booking via server proxy
   */
  async createBooking(booking: any): Promise<any> {
    try {
      console.log('📅 [SERVER API CLIENT] Creating booking via server proxy...');
      
      // Ensure we have valid visitor tokens
      await this.ensureValidVisitorTokens();

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking,
          visitorToken: this.visitorTokens?.access_token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] Booking creation failed:', errorData);
        throw new Error(`Booking creation failed: ${errorData.error} - ${errorData.details}`);
      }

      const result = await response.json();
      console.log('✅ [SERVER API CLIENT] Booking creation successful:', {
        bookingId: result.data?.booking?.id
      });
      
      return result.data;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Booking creation error:', error);
      throw error;
    }
  }

  /**
   * Generic API proxy method
   */
  async proxyApiCall(url: string, method: string = 'GET', body?: any, headers?: Record<string, string>): Promise<any> {
    try {
      console.log('🌐 [SERVER API CLIENT] Proxying API call via server:', { url, method });
      
      // Ensure we have valid visitor tokens for authenticated calls
      await this.ensureValidVisitorTokens();

      const response = await fetch(`${SERVER_BASE_URL}/api/wix/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          method,
          body,
          headers,
          visitorToken: this.visitorTokens?.access_token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVER API CLIENT] API proxy call failed:', errorData);
        throw new Error(`API call failed: ${errorData.error} - ${errorData.details}`);
      }

      const result = await response.json();
      console.log('✅ [SERVER API CLIENT] API proxy call successful via server');
      
      return result;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] API proxy error:', error);
      throw error;
    }
  }

  /**
   * Check server health
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ [SERVER API CLIENT] Server health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const serverWixApiClient = new ServerWixApiClient();
export default serverWixApiClient;
