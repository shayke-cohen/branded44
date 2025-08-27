/**
 * Feature Flags Configuration
 * 
 * Centralized feature toggle system for the application
 */

// Environment variable helpers
function getEnvVar(key: string, defaultValue: string): string {
  // Try Node.js/React Native process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // For web environments, try window globals
  if (typeof globalThis !== 'undefined') {
    const globalWindow = globalThis as any;
    if (globalWindow.window && globalWindow.__ENV__) {
      const globalEnv = globalWindow.__ENV__;
      if (globalEnv && globalEnv[key]) {
        return globalEnv[key];
      }
    }
  }
  
  return defaultValue;
}

function getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
  const value = getEnvVar(key, defaultValue.toString()).toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

// === FEATURE FLAGS ===

export const FEATURES = {
  // Wix SDK Configuration
  WIX_SDK_ENABLED: getBooleanEnvVar('WIX_SDK_ENABLED', true),
  WIX_SDK_CART_ENABLED: getBooleanEnvVar('WIX_SDK_CART_ENABLED', false),
  WIX_SDK_AUTH_ENABLED: getBooleanEnvVar('WIX_SDK_AUTH_ENABLED', true), // ✅ Enable authentication SDK only
  WIX_SDK_RESTAURANTS_ENABLED: getBooleanEnvVar('WIX_SDK_RESTAURANTS_ENABLED', false),
  
  // API Configuration
  USE_REST_API_FALLBACK: getBooleanEnvVar('USE_REST_API_FALLBACK', true),
  ENABLE_API_CACHING: getBooleanEnvVar('ENABLE_API_CACHING', true),
  
  // Debug and Development
  DEBUG_API_CALLS: getBooleanEnvVar('DEBUG_API_CALLS', __DEV__),
  ENABLE_AUTH_DIAGNOSTICS: getBooleanEnvVar('ENABLE_AUTH_DIAGNOSTICS', __DEV__),
} as const;

// === RUNTIME FEATURE OVERRIDES ===

/**
 * Runtime feature flags that can be modified during execution
 * Useful for testing and gradual rollouts
 */
class FeatureManager {
  private overrides: Partial<typeof FEATURES> = {};

  /**
   * Override a feature flag at runtime
   */
  setFeature<K extends keyof typeof FEATURES>(key: K, value: typeof FEATURES[K]): void {
    this.overrides[key] = value;
    console.log(`🎛️ [FEATURES] Override set: ${key} = ${value}`);
  }

  /**
   * Get a feature flag value (with runtime overrides)
   */
  getFeature<K extends keyof typeof FEATURES>(key: K): typeof FEATURES[K] {
    return this.overrides[key] ?? FEATURES[key];
  }

  /**
   * Check if SDK is enabled for a specific domain
   */
  isSDKEnabled(): boolean {
    return this.getFeature('WIX_SDK_ENABLED');
  }

  isCartSDKEnabled(): boolean {
    return this.getFeature('WIX_SDK_ENABLED') && this.getFeature('WIX_SDK_CART_ENABLED');
  }

  isAuthSDKEnabled(): boolean {
    return this.getFeature('WIX_SDK_ENABLED') && this.getFeature('WIX_SDK_AUTH_ENABLED');
  }

  isRestaurantSDKEnabled(): boolean {
    return this.getFeature('WIX_SDK_ENABLED') && this.getFeature('WIX_SDK_RESTAURANTS_ENABLED');
  }

  isBookingSDKEnabled(): boolean {
    return this.getFeature('WIX_SDK_ENABLED'); // Booking doesn't have separate toggle yet
  }

  /**
   * Clear all runtime overrides
   */
  clearOverrides(): void {
    this.overrides = {};
    console.log('🎛️ [FEATURES] All overrides cleared');
  }

  /**
   * Get current configuration summary
   */
  getConfigSummary(): Record<string, any> {
    const config: Record<string, any> = {};
    
    for (const [key, defaultValue] of Object.entries(FEATURES)) {
      config[key] = this.overrides[key as keyof typeof FEATURES] ?? defaultValue;
    }
    
    return config;
  }
}

export const featureManager = new FeatureManager();

// === DEVELOPMENT HELPERS ===

if (__DEV__) {
  // Expose feature manager globally for debugging
  (globalThis as any).__FEATURES__ = featureManager;
  
  console.log('🎛️ [FEATURES] Feature flags initialized:');
  console.log('🎛️ [FEATURES] SDK Enabled:', FEATURES.WIX_SDK_ENABLED, '(✅ ENABLED but restaurant APIs disabled)');
  console.log('🎛️ [FEATURES] Cart SDK:', FEATURES.WIX_SDK_CART_ENABLED, '(disabled by default)');
  console.log('🎛️ [FEATURES] Auth SDK:', FEATURES.WIX_SDK_AUTH_ENABLED, '(✅ ENABLED for authentication)');
  console.log('🎛️ [FEATURES] Restaurant SDK:', FEATURES.WIX_SDK_RESTAURANTS_ENABLED, '(❌ DISABLED - using REST API fallback)');
  console.log('🎛️ [FEATURES] Restaurant SDK disabled, falling back to REST API endpoints');
  console.log('🎛️ [FEATURES] Use globalThis.__FEATURES__ to modify at runtime');
}
