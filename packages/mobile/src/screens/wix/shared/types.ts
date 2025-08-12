/**
 * Shared Wix Types
 * 
 * Common type definitions used across all Wix screens and components
 */

// Base screen props that all Wix screens should support
export interface BaseWixScreenProps {
  onBack?: () => void;
  testID?: string;
}

// Navigation callback types
export interface WixNavigationCallbacks {
  onProductPress?: (productId: string) => void;
  onServicePress?: (serviceId: string) => void;
  onCartPress?: () => void;
  onBookingPress?: (serviceId: string) => void;
  onMemberPress?: () => void;
}

// Common loading states
export interface WixLoadingState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

// Common pagination
export interface WixPaginationState {
  hasMore: boolean;
  loadingMore: boolean;
  currentPage: number;
}

// Screen configuration
export interface WixScreenConfig {
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSorting?: boolean;
  showEmptyState?: boolean;
  refreshOnMount?: boolean;
}

// Common response wrapper for Wix APIs
export interface WixApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Export commonly used types from other modules for convenience
export type { WixProduct } from '../../../utils/wixApiClient';
export type { WixService } from '../../../utils/wixBookingApiClient';
