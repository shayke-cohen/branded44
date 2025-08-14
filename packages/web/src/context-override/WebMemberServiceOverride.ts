/**
 * WebMemberServiceOverride - Override mobile member service with web-compatible version
 * 
 * This module replaces the mobile member service with a web-compatible version
 * that uses server-proxied API calls to avoid CORS issues.
 */

import { webMemberService } from '../utils/WebMemberService';
import { webWixApiClient } from '../utils/webWixApiClient';
import { webWixBookingApiClient } from '../utils/WebWixBookingApiClient';
import './CompleteWixApiProxy'; // This will install the complete proxy automatically

// Override the mobile member service when running in web environment
if (typeof window !== 'undefined') {
  console.log('🌐 [WEB OVERRIDE] Replacing mobile services with PURE PROXY web versions');
  
  // Set the member service override
  (global as any).webMemberServiceOverride = webMemberService;
  (window as any).webMemberServiceOverride = webMemberService;
  
  // Set the booking API client override
  (global as any).webWixBookingApiClientOverride = webWixBookingApiClient;
  (window as any).webWixBookingApiClientOverride = webWixBookingApiClient;
  
  // Create a complete API client override that ALWAYS uses server proxy
  const webCompatibleApiClient = {
    // Authentication methods
    loginMember: async (email: string, password: string) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting loginMember - using PURE PROXY');
      return await webWixApiClient.loginMember(email, password);
    },
    registerMember: async (email: string, password: string, profile?: any) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting registerMember - using PURE PROXY');
      return await webWixApiClient.registerMember(email, password, profile);
    },
    generateVisitorTokens: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting generateVisitorTokens - using PURE PROXY');
      return await webWixApiClient.generateVisitorTokens();
    },
    
    // Member status methods
    isMemberLoggedIn: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting isMemberLoggedIn - using PURE PROXY');
      return await webWixApiClient.isMemberLoggedIn();
    },
    getCurrentMember: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting getCurrentMember - using PURE PROXY');
      return await webWixApiClient.getCurrentMember();
    },
    logoutMember: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting logoutMember - using PURE PROXY');
      return await webWixApiClient.logoutMember();
    },
    
    // Product methods
    queryProducts: async (options?: any) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting queryProducts - using PURE PROXY');
      return await webWixApiClient.queryProducts(options);
    },
    getProduct: async (productId: string) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting getProduct - using PURE PROXY');
      return await webWixApiClient.getProduct(productId);
    },
    getCollections: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting getCollections - using PURE PROXY');
      return await webWixApiClient.getCollections();
    },
    
    // Cart methods
    addToCart: async (productId: string, quantity: number = 1, options?: any) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting addToCart - using PURE PROXY');
      return await webWixApiClient.addToCart(productId, quantity, options);
    },
    getCart: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting getCart - using PURE PROXY');
      return await webWixApiClient.getCart();
    },
    getCurrentCart: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting getCurrentCart - using PURE PROXY');
      return await webWixApiClient.getCurrentCart();
    },
    removeFromCart: async (lineItemId: string) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting removeFromCart - using PURE PROXY');
      return await webWixApiClient.removeFromCart(lineItemId);
    },
    updateCartItemQuantity: async (lineItemId: string, quantity: number) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting updateCartItemQuantity - using PURE PROXY');
      return await webWixApiClient.updateCartItemQuantity(lineItemId, quantity);
    },
    createCheckout: async () => {
      console.log('🌐 [WEB OVERRIDE] Intercepting createCheckout - using PURE PROXY');
      return await webWixApiClient.createCheckout();
    },

    // Booking methods
    queryBookingServices: async (query?: any, fieldsets?: string[]) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting queryBookingServices - using PURE PROXY');
      return await webWixApiClient.queryBookingServices(query, fieldsets);
    },
    queryBookingAvailability: async (query: any) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting queryBookingAvailability - using PURE PROXY');
      return await webWixApiClient.queryBookingAvailability(query);
    },
    createBooking: async (booking: any) => {
      console.log('🌐 [WEB OVERRIDE] Intercepting createBooking - using PURE PROXY');
      return await webWixApiClient.createBooking(booking);
    }
  };
  
  // Set the API client override
  (global as any).webWixApiClientOverride = webCompatibleApiClient;
  (window as any).webWixApiClientOverride = webCompatibleApiClient;
  
  console.log('✅ [WEB OVERRIDE] Web member service override installed globally');
  console.log('✅ [WEB OVERRIDE] Web API client override installed globally');
  console.log('✅ [WEB OVERRIDE] Web booking API client override installed globally');
  console.log('🔍 [WEB OVERRIDE] Override available at:', {
    memberService: !!(global as any).webMemberServiceOverride,
    apiClient: !!(global as any).webWixApiClientOverride,
    window: !!(window as any).webMemberServiceOverride
  });

  // Add a test function to the window for easy testing
  (window as any).testWebOverride = () => {
    console.log('🧪 [TEST] Testing PURE PROXY web override system...');
    console.log('🔍 [TEST] Available overrides:', {
      memberService: !!(global as any).webMemberServiceOverride,
      apiClient: !!(global as any).webWixApiClientOverride,
      window: !!(window as any).webMemberServiceOverride
    });
    
    // Test the member service
    const memberService = (global as any).webMemberServiceOverride;
    if (memberService) {
      console.log('✅ [TEST] Member service override is available');
      console.log('🔍 [TEST] Member service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(memberService)));
    }
    
    // Test the API client
    const apiClient = (global as any).webWixApiClientOverride;
    if (apiClient) {
      console.log('✅ [TEST] PURE PROXY API client override is available');
      console.log('🔍 [TEST] API client methods:', Object.keys(apiClient));
      console.log('🌐 [TEST] All methods will use server proxy - NO direct Wix API calls!');
    }
    
    return {
      memberServiceAvailable: !!memberService,
      apiClientAvailable: !!apiClient,
      ready: !!(memberService && apiClient),
      isPureProxy: true
    };
  };
  
  console.log('🧪 [WEB OVERRIDE] Test function available: window.testWebOverride()');
}

export { webMemberService };
export default webMemberService;
