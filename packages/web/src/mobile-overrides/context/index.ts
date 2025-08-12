/**
 * Web Override for Mobile Context
 * 
 * This file overrides the mobile context index when running on web.
 * It redirects all mobile context imports to use web-compatible contexts.
 */

// Re-export web contexts to match mobile context interface
export * from '../../context';
