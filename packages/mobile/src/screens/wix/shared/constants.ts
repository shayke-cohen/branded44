/**
 * Shared Wix Constants
 * 
 * Common constants used across all Wix screens and components
 */

// Screen identifiers
export const WIX_SCREEN_IDS = {
  MEMBER_AUTH: 'wix-member-auth',
  PRODUCT_LIST: 'wix-product-list',
  PRODUCT_DETAIL: 'wix-product-detail',
  CART: 'wix-cart',
  SERVICES_LIST: 'wix-services-list',
  SERVICE_DETAIL: 'wix-service-detail',
  BOOKING: 'wix-booking',
  MY_BOOKINGS: 'wix-my-bookings',
  FOOD: 'wix-food',
  CMS: 'wix-cms',
} as const;

// Common pagination limits
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INITIAL_PAGE: 1,
} as const;

// Common loading timeouts
export const TIMEOUTS = {
  API_TIMEOUT: 10000, // 10 seconds
  RETRY_DELAY: 2000,  // 2 seconds
  DEBOUNCE_SEARCH: 300, // 300ms
} as const;

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NO_DATA: 'No data available.',
  LOADING_FAILED: 'Failed to load data. Pull to refresh.',
} as const;

// Common success messages
export const SUCCESS_MESSAGES = {
  ITEM_ADDED_TO_CART: 'Item added to cart',
  BOOKING_CONFIRMED: 'Booking confirmed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// Feature flags for different screens
export const FEATURE_FLAGS = {
  ENABLE_ADVANCED_FILTERS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
} as const;
