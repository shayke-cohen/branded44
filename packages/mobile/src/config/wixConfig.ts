// Wix Headless Configuration
// This file contains all Wix-related configuration settings

// OAuth Client Configuration
const WIX_CLIENT_ID = '6bfa6d89-e039-4145-ad77-948605cfc694';

// Site Configuration
// ⚠️ IMPORTANT: Replace with your actual Site ID from Wix Dashboard
// 1. Go to https://manage.wix.com
// 2. Navigate to your site 
// 3. Look at the URL: https://manage.wix.com/dashboard/[YOUR-SITE-ID]/...
// 4. Copy the Site ID and paste it below
const WIX_SITE_ID = '975ab44d-feb8-4af0-bec1-ca5ef2519316'; // ✅ Updated with actual site ID

// Stores App Configuration
// This is the standard Wix Stores app ID used for all Wix Stores sites
const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';



// API Configuration
// Use proxy when running in browser (visual editor) to avoid CORS issues
const WIX_API_BASE_URL = typeof window !== 'undefined' && window.location?.hostname === 'localhost'
  ? 'http://localhost:3001/api/wix-proxy'  // Use proxy for browser/visual editor
  : 'https://www.wixapis.com';             // Use direct API for React Native

// Wix Configuration Interface
export interface WixConfig {
  clientId: string;
  siteId: string;
  storesAppId: string;
  apiBaseUrl: string;
  redirectUrl?: string;
  scopes?: string[];
}

// Default configuration object
const defaultConfig: WixConfig = {
  clientId: WIX_CLIENT_ID,
  siteId: WIX_SITE_ID,
  storesAppId: WIX_STORES_APP_ID,
  apiBaseUrl: WIX_API_BASE_URL,
  scopes: ['STORES.READ_PRODUCTS', 'ECOM.MODIFY_CARTS'],
};

/**
 * Get the Wix OAuth Client ID
 * Used for visitor authentication and API access
 */
export const getClientId = (): string => {
  return WIX_CLIENT_ID;
};

/**
 * Get the Wix Site ID  
 * Used to identify which specific Wix site we're working with
 * Extract this from your dashboard URL: /dashboard/[SITE_ID]/
 */
export const getSiteId = (): string => {
  return WIX_SITE_ID;
};

/**
 * Get the Wix Stores App ID  
 * Used for eCommerce catalog operations (standard for all Wix Stores sites)
 */
export const getStoresAppId = (): string => {
  return WIX_STORES_APP_ID;
};




/**
 * Get the Wix API base URL
 */
export const getApiBaseUrl = (): string => {
  return WIX_API_BASE_URL;
};

/**
 * Get the complete Wix configuration object
 */
export const getWixConfig = (): WixConfig => {
  return { ...defaultConfig };
};

/**
 * Update configuration at runtime if needed
 * Useful for switching between development and production environments
 */
export const updateWixConfig = (newConfig: Partial<WixConfig>): WixConfig => {
  Object.assign(defaultConfig, newConfig);
  return { ...defaultConfig };
};

/**
 * Validates the Wix configuration and provides helpful error messages
 */
export const validateWixConfig = (): boolean => {
  const config = defaultConfig;
  
  if (!config.clientId || config.clientId.length === 0) {
    console.error('❌ [CONFIG ERROR] Wix Client ID is missing');
    return false;
  }
  
  if (!config.siteId || config.siteId === 'YOUR_SITE_ID_HERE' || config.siteId.length === 0) {
    console.error('❌ [CONFIG ERROR] Wix Site ID is missing or not configured');
    console.error('📋 [HELP] To fix this:');
    console.error('  1. Go to https://manage.wix.com');
    console.error('  2. Navigate to your site');
    console.error('  3. Look at the URL: https://manage.wix.com/dashboard/[YOUR-SITE-ID]/...');
    console.error('  4. Copy the Site ID and update WIX_SITE_ID in wixConfig.ts');
    return false;
  }
  
  if (!config.storesAppId || config.storesAppId.length === 0) {
    console.error('❌ [CONFIG ERROR] Wix Stores App ID is missing');
    return false;
  }
  
  if (!config.apiBaseUrl || config.apiBaseUrl.length === 0) {
    console.error('❌ [CONFIG ERROR] Wix API Base URL is missing');
    return false;
  }
  
  return true;
};

/**
 * Debug helper to log current configuration
 */
export const logWixConfig = (): void => {
  if (validateWixConfig()) {
    console.log('✅ [CONFIG] Wix configuration is valid');
    console.log('🔧 [DEBUG] Wix configuration loaded:');
    console.log(`   - Client ID: ${getClientId()}`);
    console.log(`   - Site ID: ${getSiteId()}`);
    console.log(`   - Stores App ID: ${getStoresAppId()}`);
    console.log(`   - API Base URL: ${getApiBaseUrl()}`);
  }
};

// Auto-validate configuration when module loads
// Use cross-platform development mode detection
const isDevelopment = (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development';
if (isDevelopment) {
  logWixConfig();
}

/**
 * Get OAuth authorization URL for visitor authentication
 * This would be used for implementing login flows
 */
export const getOAuthAuthorizationUrl = (redirectUri: string, state?: string): string => {
  const config = getWixConfig();
  const baseUrl = 'https://www.wix.com/oauth/authorize';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scopes?.join(' ') || 'STORES.READ_PRODUCTS ECOM.MODIFY_CARTS',
    ...(state && { state }),
  });
  
  return `${baseUrl}?${params.toString()}`;
}; 