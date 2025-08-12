/**
 * Type Guards and Validation Utilities
 * 
 * Comprehensive utilities to validate data structures and prevent runtime errors.
 * These functions help ensure data integrity and provide safe fallbacks.
 */

import { BookingData, ServiceInfo, ProviderInfo } from '../components/blocks/booking/BookingSummary';

/**
 * Type guard to check if a value is defined and not null
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type guard to check if an object has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

/**
 * Validates if a service object has all required properties
 */
export function isValidService(service: unknown): service is ServiceInfo {
  if (!service || typeof service !== 'object') return false;
  
  return (
    hasProperty(service, 'id') &&
    hasProperty(service, 'name') &&
    hasProperty(service, 'duration') &&
    typeof service.id === 'string' &&
    typeof service.name === 'string' &&
    typeof service.duration === 'number'
  );
}

/**
 * Validates if a provider object has all required properties
 */
export function isValidProvider(provider: unknown): provider is ProviderInfo {
  if (!provider || typeof provider !== 'object') return false;
  
  return (
    hasProperty(provider, 'id') &&
    hasProperty(provider, 'name') &&
    hasProperty(provider, 'verified') &&
    typeof provider.id === 'string' &&
    typeof provider.name === 'string' &&
    typeof provider.verified === 'boolean'
  );
}

/**
 * Validates if a booking object has all required properties
 */
export function isValidBooking(booking: unknown): booking is BookingData {
  if (!booking || typeof booking !== 'object') return false;
  
  const hasBasicProps = (
    hasProperty(booking, 'id') &&
    hasProperty(booking, 'status') &&
    hasProperty(booking, 'service') &&
    hasProperty(booking, 'provider') &&
    typeof booking.id === 'string' &&
    typeof booking.status === 'string'
  );
  
  if (!hasBasicProps) return false;
  
  // Validate nested objects
  return isValidService(booking.service) && isValidProvider(booking.provider);
}

/**
 * Safe property accessor with default fallback
 */
export function safeGet<T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  defaultValue: T[K]
): T[K] {
  return obj?.[key] ?? defaultValue;
}

/**
 * Safe nested property accessor
 */
export function safeGetNested<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  obj: T | undefined | null,
  key1: K1,
  key2: K2,
  defaultValue: T[K1][K2]
): T[K1][K2] {
  return obj?.[key1]?.[key2] ?? defaultValue;
}

/**
 * Validates array and provides safe length
 */
export function safeArrayLength(arr: unknown[] | undefined | null): number {
  return Array.isArray(arr) ? arr.length : 0;
}

/**
 * Safe array accessor with bounds checking
 */
export function safeArrayGet<T>(
  arr: T[] | undefined | null,
  index: number,
  defaultValue: T
): T {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  return arr[index];
}

/**
 * Creates a safe booking object with all required properties
 */
export function createSafeBooking(booking: Partial<BookingData> | undefined | null): BookingData {
  const defaultService: ServiceInfo = {
    id: 'default-service',
    name: 'Service Name N/A',
    description: 'No description available',
    duration: 0,
    locationType: 'onsite',
    location: 'Location TBD',
  };

  const defaultProvider: ProviderInfo = {
    id: 'default-provider',
    name: 'Provider Name N/A',
    verified: false,
    rating: 0,
  };

  const defaultBooking: BookingData = {
    id: booking?.id || 'default-booking',
    confirmationNumber: booking?.confirmationNumber || 'N/A',
    status: booking?.status || 'pending',
    dateTime: booking?.dateTime || new Date(),
    endTime: booking?.endTime || new Date(),
    service: { ...defaultService, ...booking?.service },
    provider: { ...defaultProvider, ...booking?.provider },
    customer: booking?.customer || {
      id: 'default-customer',
      name: 'Customer Name N/A',
      email: 'email@example.com',
      phone: 'Phone N/A',
    },
    pricing: booking?.pricing || {
      basePrice: 0,
      currency: 'USD',
      fees: [],
      discounts: [],
      tax: 0,
      taxRate: 0,
      total: 0,
      paymentStatus: 'pending',
    },
    reminders: booking?.reminders || {
      timeBefore: 30,
      email: false,
      sms: false,
      push: false,
    },
    policies: booking?.policies || {
      cancellation: {
        allowedUntil: new Date(),
        description: 'Standard cancellation policy',
      },
      rescheduling: {
        allowedUntil: new Date(),
        description: 'Standard rescheduling policy',
      },
      noShow: {
        description: 'Standard no-show policy',
      },
    },
    createdAt: booking?.createdAt || new Date(),
  };

  return defaultBooking;
}

/**
 * Error boundary helper function
 */
export function withErrorBoundary<T>(
  fn: () => T,
  fallback: T,
  errorHandler?: (error: Error) => void
): T {
  try {
    return fn();
  } catch (error) {
    if (errorHandler && error instanceof Error) {
      errorHandler(error);
    }
    return fallback;
  }
}

/**
 * Runtime validation with detailed error messages
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateBookingData(booking: unknown): ValidationResult {
  const errors: string[] = [];

  if (!booking) {
    errors.push('Booking data is required');
    return { isValid: false, errors };
  }

  if (typeof booking !== 'object') {
    errors.push('Booking must be an object');
    return { isValid: false, errors };
  }

  // Check required string fields
  const requiredStringFields = ['id', 'status', 'confirmationNumber'];
  for (const field of requiredStringFields) {
    if (!hasProperty(booking, field) || typeof booking[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }
  }

  // Check required date fields
  const requiredDateFields = ['dateTime', 'endTime', 'createdAt'];
  for (const field of requiredDateFields) {
    if (hasProperty(booking, field)) {
      const date = booking[field];
      if (!(date instanceof Date) && typeof date !== 'string') {
        errors.push(`${field} must be a Date or date string`);
      }
    }
  }

  // Check nested objects
  if (hasProperty(booking, 'service') && !isValidService(booking.service)) {
    errors.push('Service object is invalid or missing required properties');
  }

  if (hasProperty(booking, 'provider') && !isValidProvider(booking.provider)) {
    errors.push('Provider object is invalid or missing required properties');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
