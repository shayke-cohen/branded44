/**
 * Shared Wix Utilities
 * 
 * Common utilities, types, and constants used across all Wix screens
 */

// Export types
export * from './types';

// Export constants
export * from './constants';

// Re-export commonly used utilities
export { wixApiClient } from '../../../utils/wixApiClient';
export { wixServiceAdapter } from '../../../utils/wixServiceAdapter';
export { typeGuards } from '../../../utils/typeGuards';
