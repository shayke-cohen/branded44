/**
 * Web-compatible Wix Booking API Client
 * 
 * This replaces the mobile wixBookingApiClient with a web-compatible version
 * that uses server proxy for all API calls to avoid CORS issues.
 */

import { webWixApiClient } from './webWixApiClient';

// Types to match the mobile booking API client interface
export interface WixService {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  price?: {
    amount: string;
    currency: string;
  };
  category?: any;
  provider?: any;
  media?: any;
  tags?: string[];
  locations?: any[];
  customFields?: any[];
}

export interface WixServiceProvider {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  image?: any;
}

export interface WixServiceCategory {
  id: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface WixBookingSlot {
  sessionId: string;
  serviceId: string;
  providerId?: string;
  startTime: string;
  endTime: string;
  available: boolean;
  timezone?: string;
}

export interface WixAvailabilityQuery {
  serviceId: string;
  providerId?: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  slotDuration?: number;
}

export interface WixBookingRequest {
  serviceId: string;
  sessionId?: string;
  providerId?: string;
  contactDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  additionalFields?: Record<string, any>;
  paymentSelection?: any;
  notes?: string;
}

export interface WixBooking {
  id: string;
  serviceId: string;
  providerId?: string;
  sessionId?: string;
  startTime: string;
  endTime: string;
  status: string;
  contactDetails: any;
  totalPrice?: any;
  notes?: string;
  created: string;
  updated: string;
}

/**
 * Web-compatible Wix Booking API Client
 * Matches the mobile client interface but uses server proxy
 */
class WebWixBookingApiClient {
  /**
   * Query services - primary method used by useServicesList hook
   */
  async queryServices(filters?: {
    categoryId?: string;
    visible?: boolean;
    staffMemberId?: string;
    limit?: number;
    cursor?: string;
    forceRefresh?: boolean;
  }): Promise<{ services: WixService[]; metaData?: any }> {
    try {
      console.log('📅 [WEB BOOKING API] Loading services from server proxy...', filters);
      
      // Build query object to match server API
      const query: any = {
        filter: {},
        paging: {
          limit: filters?.limit || 50,
          offset: 0
        }
      };

      // Add filters
      if (filters?.categoryId) {
        query.filter.categoryId = { $eq: filters.categoryId };
      }
      if (filters?.staffMemberId) {
        query.filter.staffMembers = { $hasAll: [filters.staffMemberId] };
      }

      console.log('📅 [WEB BOOKING API] Request body:', JSON.stringify({ query, fieldsets: ['FULL'] }, null, 2));
      console.log('📅 [WEB BOOKING API] Calling endpoint: /bookings/v2/services/query');

      // Use webWixApiClient which will proxy through server
      const response = await webWixApiClient.queryBookingServices(query, ['FULL']);

      console.log('📅 [WEB BOOKING API] Raw services response:', response);

      if (!response || !response.services) {
        console.log('📅 [WEB BOOKING API] No services found in response');
        return { services: [] };
      }

      console.log(`✅ [WEB BOOKING API] Loaded ${response.services.length} services via server proxy`);
      
      return {
        services: response.services,
        metaData: response.pagingMetadata
      };
    } catch (error) {
      console.error('❌ [WEB BOOKING API] Failed to load services:', error);
      
      // Run diagnostics on error
      console.log('💡 [WEB BOOKING API] 403 Error detected - running diagnostics...');
      await this.diagnoseBookingAccess();
      
      return { services: [] };
    }
  }

  /**
   * Get available slots for booking
   */
  async getAvailableSlots(query: WixAvailabilityQuery): Promise<WixBookingSlot[]> {
    try {
      console.log('📅 [WEB BOOKING API] Loading available slots via server proxy...', query);
      
      const response = await webWixApiClient.queryBookingAvailability(query);
      
      const slots = response.slots || [];
      console.log(`✅ [WEB BOOKING API] Loaded ${slots.length} available slots via server proxy`);
      
      return slots;
    } catch (error) {
      console.error('❌ [WEB BOOKING API] Failed to load available slots:', error);
      return [];
    }
  }

  /**
   * Create booking
   */
  async createBooking(booking: WixBookingRequest): Promise<WixBooking | null> {
    try {
      console.log('📅 [WEB BOOKING API] Creating booking via server proxy...', booking);
      
      const response = await webWixApiClient.createBooking({
        bookedEntity: {
          serviceId: booking.serviceId,
          ...(booking.sessionId && { sessionId: booking.sessionId }),
          ...(booking.providerId && { providerId: booking.providerId })
        },
        contactDetails: booking.contactDetails,
        ...(booking.additionalFields && { additionalFields: booking.additionalFields }),
        ...(booking.paymentSelection && { paymentSelection: booking.paymentSelection }),
        ...(booking.notes && { notes: booking.notes })
      });

      const createdBooking = response.booking;
      if (createdBooking) {
        console.log(`✅ [WEB BOOKING API] Booking created via server proxy: ${createdBooking.id}`);
        return createdBooking;
      } else {
        console.warn('⚠️ [WEB BOOKING API] Booking creation returned no booking');
        return null;
      }
    } catch (error) {
      console.error('❌ [WEB BOOKING API] Failed to create booking:', error);
      return null;
    }
  }

  /**
   * Query service categories
   */
  async queryServiceCategories(forceRefresh = false): Promise<{ categories: WixServiceCategory[] }> {
    try {
      console.log('📅 [WEB BOOKING API] Loading service categories via service query...');
      
      // Since we don't have a dedicated categories endpoint, extract from services
      const servicesResponse = await this.queryServices({ limit: 100, forceRefresh });
      
      const categoriesMap = new Map<string, WixServiceCategory>();
      servicesResponse.services.forEach(service => {
        if (service.category && service.category.id) {
          categoriesMap.set(service.category.id, {
            id: service.category.id,
            name: service.category.name || 'Unknown Category',
            description: service.category.description || `Category for ${service.category.name} services`
          });
        }
      });

      const categories = Array.from(categoriesMap.values());
      console.log(`✅ [WEB BOOKING API] Extracted ${categories.length} categories from services`);
      
      return { categories };
    } catch (error) {
      console.error('❌ [WEB BOOKING API] Failed to load service categories:', error);
      return { categories: [] };
    }
  }

  /**
   * Query service providers
   */
  async queryServiceProviders(filters?: { serviceId?: string }): Promise<{ providers: WixServiceProvider[] }> {
    try {
      console.log('📅 [WEB BOOKING API] Loading service providers via service query...', filters);
      
      // Since we don't have a dedicated providers endpoint, extract from services
      const servicesResponse = await this.queryServices({ 
        limit: 100,
        ...(filters?.serviceId && { serviceId: filters.serviceId })
      });
      
      const providersMap = new Map<string, WixServiceProvider>();
      servicesResponse.services.forEach(service => {
        if (service.provider && service.provider.id) {
          providersMap.set(service.provider.id, {
            id: service.provider.id,
            name: service.provider.name || 'Unknown Provider',
            description: service.provider.description || `Provider for ${service.provider.name}`,
            email: service.provider.email,
            phone: service.provider.phone,
            image: service.provider.image
          });
        }
      });

      const providers = Array.from(providersMap.values());
      console.log(`✅ [WEB BOOKING API] Extracted ${providers.length} providers from services`);
      
      return { providers };
    } catch (error) {
      console.error('❌ [WEB BOOKING API] Failed to load service providers:', error);
      return { providers: [] };
    }
  }

  /**
   * Get service for booking (individual service lookup)
   */
  async getServiceForBooking(serviceId: string): Promise<{ success: boolean; data?: WixService; error?: string }> {
    try {
      console.log('📅 [WEB BOOKING API] Loading individual service for booking:', serviceId);
      
      const servicesResponse = await this.queryServices({ limit: 100 });
      const service = servicesResponse.services.find(s => s.id === serviceId);
      
      if (service) {
        console.log(`✅ [WEB BOOKING API] Service found for booking: ${service.name}`);
        return { success: true, data: service };
      } else {
        console.warn(`⚠️ [WEB BOOKING API] Service not found: ${serviceId}`);
        return { success: false, error: 'Service not found' };
      }
    } catch (error) {
      console.error('❌ [WEB BOOKING API] Failed to load service for booking:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get service reviews (placeholder)
   */
  async getServiceReviews(serviceId: string): Promise<any[]> {
    console.log('📅 [WEB BOOKING API] Service reviews not yet implemented, returning empty array');
    return [];
  }

  /**
   * Diagnose booking access issues (matching mobile client)
   */
  async diagnoseBookingAccess(): Promise<void> {
    console.log('🔍 [WEB BOOKING API DIAGNOSTICS] Starting booking access diagnostics...');
    
    console.log('🔍 [WEB BOOKING API DIAGNOSTICS] Testing basic API connectivity...');
    try {
      const testResponse = await webWixApiClient.queryBookingServices({
        filter: {},
        paging: { limit: 1, offset: 0 }
      }, ['BASIC']);
      
      console.log('✅ [WEB BOOKING API DIAGNOSTICS] Basic API connectivity successful');
    } catch (error) {
      console.error('❌ [WEB BOOKING API DIAGNOSTICS] API access failed:', error);
      
      console.log('🚨 [WEB BOOKING API DIAGNOSTICS] 403 Forbidden Error Detected');
      console.log('📋 [WEB BOOKING API DIAGNOSTICS] Possible causes:');
      console.log('   1. Wix Bookings app is not installed on this site');
      console.log('   2. Booking services are not published or publicly accessible');
      console.log('   3. Site owner has not enabled visitor/public access to booking services');
      console.log('   4. No booking services have been created on the site');
      console.log('   5. Site permissions do not allow API access to booking data');
      console.log('');
      console.log('🛠️ [WEB BOOKING API DIAGNOSTICS] Recommended actions:');
      console.log('   1. Install Wix Bookings app from the Wix App Market');
      console.log('   2. Create at least one booking service in the Wix dashboard');
      console.log('   3. Publish the booking services and make them publicly accessible');
      console.log('   4. Check site permissions and API access settings');
    }
  }

  /**
   * Generic request method to match mobile interface
   */
  async makeRequest<T>(endpoint: string, options: any = {}): Promise<T> {
    console.log('📅 [WEB BOOKING API] Making request via server proxy:', endpoint);
    
    // For booking endpoints, route through our web API client
    if (endpoint.includes('/bookings/v2/services/query')) {
      const body = JSON.parse(options.body || '{}');
      const response = await webWixApiClient.queryBookingServices(body.query, body.fieldsets);
      return response as T;
    }
    
    if (endpoint.includes('/bookings/v2/availability/query')) {
      const body = JSON.parse(options.body || '{}');
      const response = await webWixApiClient.queryBookingAvailability(body.query);
      return response as T;
    }
    
    if (endpoint.includes('/bookings/v1/bookings')) {
      const body = JSON.parse(options.body || '{}');
      const response = await webWixApiClient.createBooking(body.booking);
      return response as T;
    }
    
    // Fallback for other endpoints
    throw new Error(`Booking endpoint not implemented in web client: ${endpoint}`);
  }
}

// Export singleton instance
export const webWixBookingApiClient = new WebWixBookingApiClient();
export default webWixBookingApiClient;
