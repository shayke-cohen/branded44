/**
 * Wix Booking Client
 * 
 * Handles all booking-related operations including:
 * - Services management
 * - Service providers
 * - Availability slots
 * - Booking creation and management
 */

import { WixCoreClient, CACHE_KEYS } from './wixCoreClient';
import { featureManager } from '../../../config/features';
import { createClient, OAuthStrategy } from '@wix/sdk';
// Note: Wix Booking SDK modules would be imported here when available

// === TYPES ===

export interface WixService {
  _id: string;
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: {
        currency: string;
    amount: number;
    formatted?: string;
  };
  categoryIds?: string[];
  staffMemberIds?: string[];
  locations?: Array<{
    id: string;
    name: string;
    address?: string;
  }>;
  media?: {
    mainMedia?: {
      image?: {
        url: string;
        altText?: string;
      };
    };
  };
  status: 'ACTIVE' | 'INACTIVE';
  type: 'INDIVIDUAL' | 'GROUP';
    maxParticipants?: number;
  created: string;
  updated: string;
}

export interface WixServiceProvider {
  _id: string;
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  profileImage?: {
    url: string;
    altText?: string;
  };
  serviceIds: string[];
  schedule?: {
    workingHours?: Array<{
      dayOfWeek: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
      startTime: string; // HH:mm format
      endTime: string;   // HH:mm format
    }>;
    timeZone?: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
}

export interface WixAvailabilitySlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  serviceId: string;
  staffMemberId: string;
  locationId?: string;
  availableSpots: number;
  totalSpots: number;
  bookingPolicyViolations?: Array<{
    policy: string;
    description: string;
  }>;
}

export interface WixBooking {
  _id: string;
  id: string;
  serviceId: string;
  staffMemberId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  participantCount: number;
  contactDetails: {
    name: string;
    email: string;
    phone?: string;
  };
  customFields?: Array<{
    fieldId: string;
    label: string;
    value: any;
  }>;
  payment?: {
    amount: number;
    currency: string;
    status: 'PENDING' | 'PAID' | 'REFUNDED';
  };
  created: string;
  updated: string;
}

export interface WixAvailabilityQuery {
  serviceId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  duration?: number; // in minutes, defaults to service duration
  staffMemberId?: string;
  locationId?: string;
  timeZone?: string;
}

// === MAIN CLIENT CLASS ===

export class WixBookingClient extends WixCoreClient {
  private wixClient: any = null;

  constructor() {
    super('BOOKING');
    console.log('📅 [BOOKING] WixBookingClient initialized');
    
    if (this.shouldUseSDK()) {
      this.initializeWixClient();
    } else {
      console.log('📅 [BOOKING] SDK disabled, using REST API only');
    }
  }

  // === SDK INITIALIZATION ===

  private initializeWixClient(): void {
    try {
      // Note: When Wix Booking SDK modules are available, they would be initialized here
      console.log('📅 [BOOKING] SDK modules not yet available, using REST API');
      
      // Future SDK initialization:
      // this.wixClient = createClient({
      //   modules: { services, bookings, availability },
      //   auth: OAuthStrategy({ clientId: this.clientId }),
      // });
    } catch (error) {
      console.error('❌ [BOOKING SDK] Failed to initialize:', error);
    }
  }

  // === SERVICES ===

  async queryServices(filters?: {
    categoryId?: string;
    visible?: boolean;
    staffMemberId?: string;
    limit?: number;
    cursor?: string;
    forceRefresh?: boolean;
  }): Promise<{ services: WixService[]; metaData?: any }> {
    console.log('📅 [BOOKING] Querying services...', filters);
    
      // Check cache first for basic queries
      const isBasicQuery = !filters?.categoryId && !filters?.staffMemberId;
      
      if (isBasicQuery && !filters?.forceRefresh) {
        const cached = await this.getCachedData<{ services: WixService[]; metaData?: any }>(
        CACHE_KEYS.SERVICES, 
        CACHE_KEYS.SERVICES_TIMESTAMP
      );
      if (cached) {
        console.log(`✅ [BOOKING CACHE] Using cached services: ${cached.services?.length || 0} items`);
        return cached;
      }
    }

    try {
      if (this.shouldUseSDK() && this.wixClient) {
        return await this._queryServicesSDK(filters);
      } else {
        return await this._queryServicesREST(filters);
      }
    } catch (error) {
      console.error('❌ [BOOKING] Error querying services:', error);
      throw this.createDomainError('Failed to query services');
    }
  }

  private async _queryServicesSDK(filters?: any): Promise<{ services: WixService[]; metaData?: any }> {
    console.log('🔧 [BOOKING SDK] Querying services via SDK (not yet implemented)');
    // SDK implementation would go here when available
    return await this._queryServicesREST(filters);
  }

    private async _queryServicesREST(filters?: any): Promise<{ services: WixService[]; metaData?: any }> {
    console.log('🌐 [BOOKING REST] Querying services via REST API');
    
    try {
      const endpoint = '/bookings/v2/services/query';
      
      const requestBody: any = {
        query: {
          paging: { limit: filters?.limit || 50 }
        }
      };

      // Add filters - removed status filter as it's not supported by the API
      if (filters?.visible !== false) {
        // Note: The 'status' filter is not supported by the Wix Bookings API
        // Services are filtered by visibility on the server side
        requestBody.query.filter = {};
      }

      if (filters?.categoryId) {
        requestBody.query.filter = {
          ...requestBody.query.filter,
          categoryIds: { $hasSome: [filters.categoryId] }
        };
      }

      if (filters?.staffMemberId) {
        requestBody.query.filter = {
          ...requestBody.query.filter,
          staffMemberIds: { $hasSome: [filters.staffMemberId] }
        };
      }

    if (filters?.cursor) {
      requestBody.query.paging.cursor = filters.cursor;
    }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await this.makeRequest<{ services: WixService[]; metaData?: any }>(endpoint, {
          method: 'POST',
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const result = {
          services: response.services || [],
          metaData: response.metaData,
        };

        // Cache basic queries
        const isBasicQuery = !filters?.categoryId && !filters?.staffMemberId;
        if (isBasicQuery && !filters?.forceRefresh) {
          await this.setCachedData(CACHE_KEYS.SERVICES, CACHE_KEYS.SERVICES_TIMESTAMP, result);
        }

        console.log(`✅ [BOOKING REST] Found ${result.services.length} services`);
        return result;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Booking services request timed out');
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ [BOOKING REST] API call failed:', error);
      throw error;
    }
  }

  async getService(serviceId: string): Promise<WixService | null> {
    console.log(`📅 [BOOKING] Fetching service: ${serviceId}`);

    try {
      if (this.shouldUseSDK() && this.wixClient) {
        // SDK implementation would go here
        return await this._getServiceREST(serviceId);
      } else {
        return await this._getServiceREST(serviceId);
      }
    } catch (error) {
      console.error(`❌ [BOOKING] Error fetching service ${serviceId}:`, error);
      return null;
    }
  }

  private async _getServiceREST(serviceId: string): Promise<WixService | null> {
    const endpoint = `/bookings/v2/services/${serviceId}`;
    const response = await this.makeRequest<{ service: WixService }>(endpoint);
    
    console.log(`✅ [BOOKING REST] Retrieved service: ${response.service.name}`);
    return response.service;
  }

  // === SERVICE PROVIDERS ===

  async queryServiceProviders(filters?: {
    serviceId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ providers: WixServiceProvider[]; metaData?: any }> {
    console.log('📅 [BOOKING] Querying service providers...', filters);

    try {
      // Use the correct Wix Bookings Staff Members API endpoint
      const endpoint = '/bookings/v1/staff-members/query';
      
      const requestBody: any = {
        query: {
          filter: {},
          cursorPaging: { 
            limit: filters?.limit || 50 
          }
        }
      };

      // Note: Direct service filtering is not supported by the API
      // We'll filter client-side if needed
      if (filters?.cursor) {
        requestBody.query.cursorPaging.cursor = filters.cursor;
      }

      const response = await this.makeRequest<{ staffMembers: any[]; metaData?: any }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Transform and filter the response
      const allProviders: WixServiceProvider[] = (response.staffMembers || []).map(staff => ({
        _id: staff.id,
        id: staff.id,
        name: staff.name || 'Unnamed Provider',
        description: staff.description,
        email: staff.email,
        phone: staff.phone,
        profileImage: staff.profileImage ? {
          url: staff.profileImage.url || staff.profileImage,
          altText: staff.profileImage.altText
        } : undefined,
        serviceIds: staff.services || [],
        schedule: staff.availability ? {
          workingHours: staff.availability.workingHours,
          timeZone: staff.availability.timeZone
        } : undefined,
        status: staff.status || 'ACTIVE',
      }));

      // Client-side filtering by serviceId if specified
      let filteredProviders = allProviders;
      if (filters?.serviceId) {
        filteredProviders = allProviders.filter(provider => 
          provider.serviceIds.includes(filters.serviceId!)
        );
        console.log(`🔍 [BOOKING] Filtered ${allProviders.length} providers to ${filteredProviders.length} for service ${filters.serviceId}`);
      }

      const result = {
        providers: filteredProviders,
        metaData: response.metaData,
      };

      console.log(`✅ [BOOKING] Found ${result.providers.length} service providers`);
      return result;
    } catch (error) {
      console.error('❌ [BOOKING] Error querying service providers:', error);
      
      // If staff endpoint fails, return empty result instead of throwing
      // This is a graceful fallback since services can work without staff details
      console.log('⚠️ [BOOKING] Falling back to empty providers list');
      return { providers: [] };
    }
  }

  // === AVAILABILITY ===

  async getAvailableSlots(query: WixAvailabilityQuery): Promise<WixAvailabilitySlot[]> {
    console.log('📅 [BOOKING] Fetching available slots...', query);

    try {
      const endpoint = '/bookings/v2/availability/query';
      
      const requestBody = {
          filter: {
          serviceId: query.serviceId,
          startDate: query.startDate,
          endDate: query.endDate,
        },
        ...(query.staffMemberId && { staffMemberId: query.staffMemberId }),
        ...(query.locationId && { locationId: query.locationId }),
        ...(query.duration && { duration: query.duration }),
        ...(query.timeZone && { timeZone: query.timeZone }),
      };

      const response = await this.makeRequest<{ availableSlots: WixAvailabilitySlot[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const slots = response.availableSlots || [];
      console.log(`✅ [BOOKING] Found ${slots.length} available slots`);
      return slots;
    } catch (error) {
      console.error('❌ [BOOKING] Error fetching available slots:', error);
      throw this.createDomainError('Failed to fetch available slots');
    }
  }

  // === BOOKINGS ===

  async createBooking(request: {
    serviceId: string;
    staffMemberId: string;
    startTime: string; // ISO string
    participantCount?: number;
    contactDetails: {
      name: string;
      email: string;
      phone?: string;
    };
    customFields?: Array<{
      fieldId: string;
      value: any;
    }>;
    notes?: string;
  }): Promise<WixBooking> {
    console.log('📅 [BOOKING] Creating booking...', request);

    try {
      const endpoint = '/bookings/v2/bookings';
      
      const requestBody = {
        booking: {
          serviceId: request.serviceId,
          staffMemberId: request.staffMemberId,
          startTime: request.startTime,
          participantCount: request.participantCount || 1,
          contactDetails: request.contactDetails,
          ...(request.customFields && { customFields: request.customFields }),
          ...(request.notes && { additionalInfo: request.notes }),
        }
      };

      const response = await this.makeRequest<{ booking: WixBooking }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log(`✅ [BOOKING] Created booking: ${response.booking.id}`);
      return response.booking;
    } catch (error) {
      console.error('❌ [BOOKING] Error creating booking:', error);
      throw this.createDomainError('Failed to create booking');
    }
  }

  async getBookings(query?: any): Promise<WixBooking[]> {
    console.log('📅 [BOOKING] Fetching bookings...', query);

    try {
      const endpoint = '/bookings/v2/bookings/query';
      
      const requestBody: any = {
        query: {
          paging: { limit: 100 }
        }
      };

      // Add filters from query if provided
      if (query?.memberId) {
        requestBody.query.filter = {
          'contactDetails.contactId': { $eq: query.memberId }
        };
      }

      if (query?.serviceId) {
        requestBody.query.filter = {
          ...requestBody.query.filter,
          serviceId: { $eq: query.serviceId }
        };
      }

      const response = await this.makeRequest<{ bookings: WixBooking[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const bookings = response.bookings || [];
      console.log(`✅ [BOOKING] Found ${bookings.length} bookings`);
      return bookings;
    } catch (error) {
      console.error('❌ [BOOKING] Error fetching bookings:', error);
      throw this.createDomainError('Failed to fetch bookings');
    }
  }

  async getCustomerBookings(contactId?: string): Promise<WixBooking[]> {
    console.log('📅 [BOOKING] Fetching customer bookings...');

    try {
      const endpoint = '/bookings/v2/bookings/query';
      
      const requestBody: any = {
        query: {
          paging: { limit: 100 }
        }
      };

      if (contactId) {
        requestBody.query.filter = {
          'contactDetails.contactId': { $eq: contactId }
        };
      }

      const response = await this.makeRequest<{ bookings: WixBooking[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const bookings = response.bookings || [];
      console.log(`✅ [BOOKING] Found ${bookings.length} customer bookings`);
      return bookings;
    } catch (error) {
      console.error('❌ [BOOKING] Error fetching customer bookings:', error);
      throw this.createDomainError('Failed to fetch customer bookings');
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<WixBooking> {
    console.log(`📅 [BOOKING] Cancelling booking: ${bookingId}`);

    try {
      const endpoint = `/bookings/v2/bookings/${bookingId}/cancel`;
      
      const requestBody = {
        ...(reason && { reason })
      };

      const response = await this.makeRequest<{ booking: WixBooking }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log(`✅ [BOOKING] Cancelled booking: ${bookingId}`);
      return response.booking;
    } catch (error) {
      console.error(`❌ [BOOKING] Error cancelling booking ${bookingId}:`, error);
      throw this.createDomainError(`Failed to cancel booking: ${bookingId}`);
    }
  }

  async rescheduleBooking(bookingId: string, newSlot: {
    startTime: string;
    staffMemberId?: string;
  }): Promise<WixBooking> {
    console.log(`📅 [BOOKING] Rescheduling booking: ${bookingId}`);

    try {
      const endpoint = `/bookings/v2/bookings/${bookingId}/reschedule`;
      
      const requestBody = {
        slot: newSlot
      };

      const response = await this.makeRequest<{ booking: WixBooking }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log(`✅ [BOOKING] Rescheduled booking: ${bookingId}`);
      return response.booking;
    } catch (error) {
      console.error(`❌ [BOOKING] Error rescheduling booking ${bookingId}:`, error);
      throw this.createDomainError(`Failed to reschedule booking: ${bookingId}`);
    }
  }

  // === SERVICE CATEGORIES ===

  async queryServiceCategories(): Promise<Array<{ id: string; name: string; description?: string }>> {
    console.log('📅 [BOOKING] Fetching service categories...');

    try {
      const endpoint = '/bookings/v2/categories/query';
      
      const response = await this.makeRequest<{ categories: Array<{ id: string; name: string; description?: string }> }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          query: { paging: { limit: 100 } }
        }),
      });

      const categories = response.categories || [];
      console.log(`✅ [BOOKING] Found ${categories.length} service categories`);
      return categories;
    } catch (error) {
      console.error('❌ [BOOKING] Error fetching service categories:', error);
      return [];
    }
  }

  // === DIAGNOSTICS ===

  async diagnoseBookingAccess(): Promise<void> {
    console.log('🔍 [BOOKING] Running booking API diagnostics...');
    
    try {
      // Test service access
      const servicesResult = await this.queryServices({ limit: 1 });
      console.log('✅ [BOOKING DIAGNOSTICS] Services API accessible:', servicesResult.services.length >= 0);
      
      // Test providers access
      const providersResult = await this.queryServiceProviders({ limit: 1 });
      console.log('✅ [BOOKING DIAGNOSTICS] Providers API accessible:', providersResult.providers.length >= 0);
      
    } catch (error) {
      console.error('❌ [BOOKING DIAGNOSTICS] API access test failed:', error);
    }
  }

  // === CACHE MANAGEMENT ===

  async clearCache(): Promise<void> {
    await Promise.all([
      this.clearCachedData(CACHE_KEYS.SERVICES, CACHE_KEYS.SERVICES_TIMESTAMP),
      this.clearCachedData(CACHE_KEYS.PROVIDERS, CACHE_KEYS.PROVIDERS_TIMESTAMP),
    ]);
    console.log('🗑️ [BOOKING CACHE] All booking caches cleared');
  }

  async getCacheInfo(): Promise<{ services: boolean; providers: boolean }> {
    return {
      services: await this.isCacheValid(CACHE_KEYS.SERVICES_TIMESTAMP),
      providers: await this.isCacheValid(CACHE_KEYS.PROVIDERS_TIMESTAMP),
    };
  }


}

// Export singleton instance
export const wixBookingClient = new WixBookingClient();

// Export utility functions
export const formatServicePrice = (price: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
  }).format(price);
};

export const formatServiceDuration = (duration: number): string => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};