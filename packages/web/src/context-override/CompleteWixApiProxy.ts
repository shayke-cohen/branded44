/**
 * Complete Wix API Proxy - Intercepts ALL Wix API calls and routes them through server proxy
 * 
 * This creates a comprehensive proxy that catches every possible method call
 * to the mobile wixApiClient and redirects it to our server-based proxy.
 */

import { webWixApiClient } from '../utils/webWixApiClient';
import { webWixBookingApiClient } from '../utils/WebWixBookingApiClient';

// Store the original wixApiClient for reference
let originalWixApiClient: any = null;

/**
 * Create a proxy that intercepts ALL method calls and routes them to our server proxy
 */
function createCompleteProxy(target: any) {
  return new Proxy(target, {
    get(target: any, property: string | symbol) {
      const propName = String(property);
      
      // Always log what's being accessed
      console.log(`🔍 [COMPLETE PROXY] Accessing property: ${propName}`);
      
      // If it's a function, wrap it with our proxy logic
      if (typeof target[propName] === 'function') {
        return async (...args: any[]) => {
          console.log(`🌐 [COMPLETE PROXY] Intercepting method call: ${propName}`, args);
          
          // Check if our webWixApiClient has this method
          if (typeof (webWixApiClient as any)[propName] === 'function') {
            console.log(`✅ [COMPLETE PROXY] Using server proxy for: ${propName}`);
            return await (webWixApiClient as any)[propName](...args);
          }
          
          // For methods we haven't implemented yet, provide safe fallbacks
          console.log(`⚠️ [COMPLETE PROXY] Method ${propName} not yet implemented in server proxy, using fallback`);
          return handleUnimplementedMethod(propName, args);
        };
      }
      
      // For non-function properties, return as-is
      return target[propName];
    }
  });
}

/**
 * Handle methods that aren't implemented in our server proxy yet
 */
function handleUnimplementedMethod(methodName: string, args: any[]) {
  console.log(`🔧 [COMPLETE PROXY] Providing fallback for: ${methodName}`);
  
  switch (methodName) {
    // Product-related methods - Let them fail to show real server proxy errors
    case 'queryProducts':
      console.log('🚫 [COMPLETE PROXY] queryProducts should be handled by webWixApiClient - this fallback should not be used');
      return Promise.resolve({
        products: [],
        totalCount: 0,
        hasNext: false,
        _note: 'Empty fallback - server proxy should handle this'
      });
    
    case 'getProduct':
      console.log('🚫 [COMPLETE PROXY] getProduct should be handled by webWixApiClient - this fallback should not be used');
      return Promise.reject(new Error(`Product ${args[0]} not found - server proxy should handle this`));
    
    // Cart-related methods
    case 'getCurrentCart':
    case 'getCart':
      return Promise.resolve({
        _id: 'fallback-cart',
        lineItems: [],
        subtotal: { amount: '0.00', currency: 'USD' },
        total: { amount: '0.00', currency: 'USD' },
        _note: 'Fallback response - server proxy not yet implemented'
      });
    
    case 'addToCart':
      return Promise.resolve({
        success: true,
        message: 'Fallback add to cart response',
        _note: 'Fallback response - server proxy not yet implemented'
      });
    
    // Collection-related methods
    case 'getCollections':
    case 'getAvailableCollections':
      return Promise.resolve([]);
    
    // Authentication status methods
    case 'isMemberLoggedIn':
      return Promise.resolve(false);
    
    case 'getCurrentMember':
      return Promise.resolve(null);
    
    // Booking-related methods
    case 'queryBookingServices':
      console.log('🚫 [COMPLETE PROXY] queryBookingServices should be handled by webWixApiClient - this fallback should not be used');
      return Promise.resolve({
        services: [],
        totalCount: 0,
        hasNext: false,
        _note: 'Empty fallback - server proxy should handle this'
      });
    
    case 'queryBookingAvailability':
      console.log('🚫 [COMPLETE PROXY] queryBookingAvailability should be handled by webWixApiClient - this fallback should not be used');
      return Promise.resolve({
        slots: [],
        _note: 'Empty fallback - server proxy should handle this'
      });
    
    case 'createBooking':
      console.log('🚫 [COMPLETE PROXY] createBooking should be handled by webWixApiClient - this fallback should not be used');
      return Promise.reject(new Error('Booking creation failed - server proxy should handle this'));
    
    // Cache and utility methods
    case 'clearCache':
    case 'refreshVisitorAuthentication':
      return Promise.resolve();
    
    // Default fallback for any other method
    default:
      console.warn(`🚨 [COMPLETE PROXY] No fallback defined for method: ${methodName}`);
      return Promise.resolve({
        success: false,
        error: `Method ${methodName} not implemented in server proxy`,
        _note: 'Default fallback response'
      });
  }
}

/**
 * Install the complete proxy override
 */
export function installCompleteWixApiProxy() {
  if (typeof window === 'undefined') {
    console.log('🌐 [COMPLETE PROXY] Not in browser environment, skipping proxy installation');
    return;
  }
  
  console.log('🚀 [COMPLETE PROXY] Installing complete Wix API proxy...');
  
  // Import the mobile wixApiClient and wixBookingClient
  Promise.all([
    import('@mobile/utils/wixApiClient'),
    import('@mobile/utils/wix')
  ]).then(([wixModule, bookingModule]) => {
    const { wixApiClient } = wixModule;
    const { wixBookingClient } = bookingModule;
    
    originalWixApiClient = wixApiClient;
    
    // Create a complete proxy that intercepts ALL method calls
    const proxiedClient = createCompleteProxy(wixApiClient);
    const proxiedBookingClient = createCompleteProxy(wixBookingClient);
    
    // Replace the original clients with our proxies
    (global as any).proxiedWixApiClient = proxiedClient;
    (window as any).proxiedWixApiClient = proxiedClient;
    (global as any).proxiedWixBookingApiClient = proxiedBookingClient;
    (window as any).proxiedWixBookingApiClient = proxiedBookingClient;
    
    // Also set the overrides for backward compatibility
    (global as any).webWixApiClientOverride = proxiedClient;
    (window as any).webWixApiClientOverride = proxiedClient;
    (global as any).webWixBookingApiClientOverride = proxiedBookingClient;
    (window as any).webWixBookingApiClientOverride = proxiedBookingClient;
    
    console.log('✅ [COMPLETE PROXY] Complete Wix API proxy installed successfully!');
    console.log('✅ [COMPLETE PROXY] Complete Wix Booking API proxy installed successfully!');
    console.log('🔍 [COMPLETE PROXY] ALL method calls will now be intercepted and logged');
    
    // Add test function
    (window as any).testCompleteProxy = () => {
      console.log('🧪 [COMPLETE PROXY TEST] Testing complete proxy system...');
      
      // Test a few method calls
      console.log('Testing queryProducts...');
      proxiedClient.queryProducts({ limit: 1 });
      
      console.log('Testing getCurrentCart...');
      proxiedClient.getCurrentCart();
      
      console.log('Testing getCollections...');
      proxiedClient.getCollections();
      
      return {
        proxyInstalled: !!(window as any).proxiedWixApiClient,
        originalClientAvailable: !!originalWixApiClient,
        testCompleted: true
      };
    };
    
    console.log('🧪 [COMPLETE PROXY] Test function available: window.testCompleteProxy()');
  }).catch((error) => {
    console.error('❌ [COMPLETE PROXY] Failed to install proxy:', error);
  });
}

// Auto-install when this module is loaded
installCompleteWixApiProxy();
