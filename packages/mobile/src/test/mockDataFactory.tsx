/**
 * Mock Data Factory with Validation
 * 
 * Creates validated mock data for testing components.
 * Ensures all mock data matches expected interfaces and prevents runtime errors.
 */

import { BookingData, ServiceInfo, ProviderInfo } from '../components/blocks/booking/BookingSummary';
import { validateBookingData, createSafeBooking } from '../utils/typeGuards';

export interface MockDataOptions {
  /**
   * Whether to include all optional properties
   */
  includeOptionals?: boolean;
  /**
   * Whether to validate the created data
   */
  validate?: boolean;
  /**
   * Custom overrides for any properties
   */
  overrides?: Partial<BookingData>;
}

/**
 * Creates a complete, validated service mock
 */
export function createMockService(overrides: Partial<ServiceInfo> = {}): ServiceInfo {
  const service: ServiceInfo = {
    id: 'service_001',
    name: 'Professional Yoga Session',
    description: 'Relaxing and rejuvenating yoga session for all levels',
    duration: 60,
    locationType: 'onsite',
    location: '123 Wellness Street, Healthy City',
    image: 'https://example.com/yoga-session.jpg',
    ...overrides,
  };

  // Validate the service
  if (!service.id || !service.name || !service.duration) {
    throw new Error('Invalid service mock data: missing required properties');
  }

  return service;
}

/**
 * Creates a complete, validated provider mock
 */
export function createMockProvider(overrides: Partial<ProviderInfo> = {}): ProviderInfo {
  const provider: ProviderInfo = {
    id: 'provider_001',
    name: 'Sarah Johnson',
    title: 'Certified Yoga Instructor',
    verified: true,
    rating: 4.8,
    experience: 5,
    image: 'https://example.com/sarah-johnson.jpg',
    phone: '+1-555-0123',
    email: 'sarah@example.com',
    ...overrides,
  };

  // Validate the provider
  if (!provider.id || !provider.name || typeof provider.verified !== 'boolean') {
    throw new Error('Invalid provider mock data: missing required properties');
  }

  return provider;
}

/**
 * Creates a complete, validated booking mock
 */
export function createMockBooking(options: MockDataOptions = {}): BookingData {
  const {
    includeOptionals = true,
    validate = true,
    overrides = {}
  } = options;

  const baseBooking: BookingData = {
    id: 'booking_123',
    confirmationNumber: 'CONF-789456',
    status: 'confirmed',
    dateTime: new Date('2024-03-15T14:00:00Z'),
    endTime: new Date('2024-03-15T15:00:00Z'),
    service: createMockService(overrides.service),
    provider: createMockProvider(overrides.provider),
    customer: {
      id: 'customer_001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0456',
      notes: includeOptionals ? 'First-time client, prefers gentle sessions' : undefined,
      ...overrides.customer,
    },
    pricing: {
      basePrice: 75.00,
      currency: 'USD',
      fees: includeOptionals ? [
        { name: 'Service Fee', amount: 5.00, type: 'service' },
        { name: 'Platform Fee', amount: 2.50, type: 'platform' },
      ] : [],
      discounts: includeOptionals ? [
        { name: 'First Time Discount', amount: 10.00, type: 'first_time' },
      ] : [],
      tax: 6.30,
      taxRate: 0.09,
      total: 78.80,
      paymentStatus: 'paid',
      ...overrides.pricing,
    },
    reminders: {
      timeBefore: 30,
      email: true,
      sms: true,
      push: false,
      ...overrides.reminders,
    },
    policies: {
      cancellation: {
        allowedUntil: new Date('2024-03-14T14:00:00Z'),
        fee: includeOptionals ? 15.00 : undefined,
        feeType: includeOptionals ? 'fixed' : undefined,
        description: '24-hour cancellation policy applies',
      },
      rescheduling: {
        allowedUntil: new Date('2024-03-14T14:00:00Z'),
        fee: includeOptionals ? 10.00 : undefined,
        feeType: includeOptionals ? 'fixed' : undefined,
        description: 'Rescheduling allowed up to 24 hours before',
      },
      noShow: {
        fee: includeOptionals ? 25.00 : undefined,
        feeType: includeOptionals ? 'fixed' : undefined,
        description: 'No-show fee applies if you miss your appointment',
      },
      ...overrides.policies,
    },
    instructions: includeOptionals ? 'Please arrive 10 minutes early. Bring your own yoga mat if you have one.' : undefined,
    createdAt: new Date('2024-02-15T10:00:00Z'),
    meetingLink: undefined,
    locationDetails: undefined,
    ...overrides,
  };

  // Create safe booking to ensure all required properties
  const safeBooking = createSafeBooking(baseBooking);

  // Validate if requested
  if (validate) {
    const validation = validateBookingData(safeBooking);
    if (!validation.isValid) {
      throw new Error(`Invalid booking mock data: ${validation.errors.join(', ')}`);
    }
  }

  return safeBooking;
}

/**
 * Creates booking mock with undefined/null properties for error testing
 */
export function createIncompleteBooking(missingFields: string[] = []): Partial<BookingData> {
  const completeBooking = createMockBooking({ validate: false });
  const incompleteBooking: any = { ...completeBooking };

  // Remove specified fields to simulate missing data
  missingFields.forEach(field => {
    if (field.includes('.')) {
      // Handle nested properties like 'service.name'
      const [parent, child] = field.split('.');
      if (incompleteBooking[parent]) {
        delete incompleteBooking[parent][child];
      }
    } else {
      delete incompleteBooking[field];
    }
  });

  return incompleteBooking;
}

/**
 * Creates booking with specific undefined nested objects for testing
 */
export function createBookingWithMissingNested(options: {
  missingService?: boolean;
  missingProvider?: boolean;
  missingPricing?: boolean;
  missingCustomer?: boolean;
} = {}): Partial<BookingData> {
  const booking = createMockBooking({ validate: false });
  
  if (options.missingService) {
    booking.service = undefined as any;
  }
  
  if (options.missingProvider) {
    booking.provider = undefined as any;
  }
  
  if (options.missingPricing) {
    booking.pricing = undefined as any;
  }
  
  if (options.missingCustomer) {
    booking.customer = undefined as any;
  }

  return booking;
}

/**
 * Creates remote booking mock for testing location types
 */
export function createRemoteBooking(overrides: Partial<BookingData> = {}): BookingData {
  return createMockBooking({
    overrides: {
      service: {
        locationType: 'remote',
        location: undefined,
        ...overrides.service,
      },
      meetingLink: 'https://zoom.us/j/123456789',
      locationDetails: undefined,
      ...overrides,
    },
  });
}

/**
 * Creates hybrid booking mock for testing location types
 */
export function createHybridBooking(overrides: Partial<BookingData> = {}): BookingData {
  return createMockBooking({
    overrides: {
      service: {
        locationType: 'hybrid',
        location: 'Flexible location options available',
        ...overrides.service,
      },
      meetingLink: 'https://zoom.us/j/123456789',
      locationDetails: 'Building A, Room 205 or Online',
      ...overrides,
    },
  });
}

/**
 * Creates array of booking mocks for list testing
 */
export function createMockBookingList(count: number = 3): BookingData[] {
  return Array.from({ length: count }, (_, index) => 
    createMockBooking({
      overrides: {
        id: `booking_${index + 1}`,
        confirmationNumber: `CONF-${(index + 1).toString().padStart(6, '0')}`,
        status: index % 3 === 0 ? 'confirmed' : index % 3 === 1 ? 'pending' : 'completed',
      },
    })
  );
}

/**
 * Validates mock data matches component expectations
 */
export function validateMockData<T>(
  data: T,
  validator: (data: T) => boolean,
  errorMessage: string
): T {
  if (!validator(data)) {
    throw new Error(`Mock data validation failed: ${errorMessage}`);
  }
  return data;
}
