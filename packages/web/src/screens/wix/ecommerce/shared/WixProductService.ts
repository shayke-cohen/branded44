/**
 * Web-specific WixProductService - Overrides the mobile version for web compatibility
 * 
 * This file is placed in the exact same location as the mobile version to ensure
 * that relative imports work correctly in the web build.
 */

// Re-export everything from our web-specific implementation
export * from '../../../../utils/WebWixProductService';
