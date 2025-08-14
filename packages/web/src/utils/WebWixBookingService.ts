import { webWixApiClient } from './webWixApiClient';

// Types for booking services (matching mobile types)
export interface WixService {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  price?: {
    amount: string;
    currency: string;
  };
  category?: {
    id: string;
    name: string;
  };
  provider?: {
    id: string;
    name: string;
  };
  media?: {
    image?: {
      url: string;
    };
  };
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
  image?: {
    url: string;
  };
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
  contactDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  totalPrice?: {
    amount: string;
    currency: string;
  };
  notes?: string;
  created: string;
  updated: string;
}

export interface ServiceQuery {
  categoryId?: string;
  providerId?: string;
  tagIds?: string[];
  locationId?: string;
  limit?: number;
  offset?: number;
}

export interface ServiceListResponse {
  services: WixService[];
  hasMore: boolean;
  totalCount?: number;
  nextCursor?: string;
}

/**
 * Web-specific Wix Booking Service that uses server proxy for all API calls
 */
class WebWixBookingService {
  private static instance: WebWixBookingService;

  static getInstance(): WebWixBookingService {
    if (!WebWixBookingService.instance) {
      WebWixBookingService.instance = new WebWixBookingService();
    }
    return WebWixBookingService.instance;
  }

  /**
   * Get booking services
   */
  async getServices(query: ServiceQuery = {}): Promise<ServiceListResponse> {
    console.log('📅 [WEB BOOKING SERVICE] Fetching services (web fallback mode):', query);
    
    try {
      // Use web API client which will proxy through server
      const response = await webWixApiClient.queryBookingServices({
        filter: {
          ...(query.categoryId && { categoryId: query.categoryId }),
          ...(query.providerId && { providerId: query.providerId }),
          ...(query.tagIds && { tagIds: query.tagIds }),
          ...(query.locationId && { locationId: query.locationId })
        },
        paging: {
          limit: query.limit || 50,
          offset: query.offset || 0
        }
      }, ['FULL']);

      console.log('✅ [WEB BOOKING SERVICE] Real services loaded via API:', {
        servicesCount: response.services?.length || 0,
        hasMore: response.pagingMetadata?.hasNext || false
      });

      return {
        services: response.services || [],
        hasMore: response.pagingMetadata?.hasNext || false,
        totalCount: response.pagingMetadata?.total,
        nextCursor: response.pagingMetadata?.cursors?.next
      };
    } catch (error) {
      console.error('❌ [WEB BOOKING SERVICE] Failed to load services:', error);
      
      // Return empty array on error - let the UI handle the error state
      return {
        services: [],
        hasMore: false,
        totalCount: 0
      };
    }
  }

  /**
   * Get single service by ID
   */
  async getService(serviceId: string): Promise<WixService | null> {
    console.log('📅 [WEB BOOKING SERVICE] Fetching service:', serviceId);
    
    try {
      // Query services with specific ID filter
      const response = await webWixApiClient.queryBookingServices({
        filter: { serviceId }
      }, ['FULL']);

      const service = response.services?.[0];
      if (service) {
        console.log('✅ [WEB BOOKING SERVICE] Service loaded:', service.name);
        return service;
      } else {
        console.warn('⚠️ [WEB BOOKING SERVICE] Service not found:', serviceId);
        return null;
      }
    } catch (error) {
      console.error('❌ [WEB BOOKING SERVICE] Failed to load service:', error);
      return null;
    }
  }

  /**
   * Get available time slots for a service
   */
  async getAvailableSlots(query: WixAvailabilityQuery): Promise<WixBookingSlot[]> {
    console.log('📅 [WEB BOOKING SERVICE] Fetching available slots:', query);
    
    try {
      const response = await webWixApiClient.queryBookingAvailability({
        serviceId: query.serviceId,
        providerId: query.providerId,
        startDate: query.startDate,
        endDate: query.endDate,
        timezone: query.timezone || 'UTC',
        ...(query.slotDuration && { slotDuration: query.slotDuration })
      });

      const slots = response.slots || [];
      console.log('✅ [WEB BOOKING SERVICE] Available slots loaded:', {
        slotsCount: slots.length
      });

      return slots;
    } catch (error) {
      console.error('❌ [WEB BOOKING SERVICE] Failed to load available slots:', error);
      return [];
    }
  }

  /**
   * Create a booking
   */
  async createBooking(request: WixBookingRequest): Promise<WixBooking | null> {
    console.log('📅 [WEB BOOKING SERVICE] Creating booking:', request);
    
    try {
      const response = await webWixApiClient.createBooking({
        bookedEntity: {
          serviceId: request.serviceId,
          ...(request.sessionId && { sessionId: request.sessionId }),
          ...(request.providerId && { providerId: request.providerId })
        },
        contactDetails: request.contactDetails,
        ...(request.additionalFields && { additionalFields: request.additionalFields }),
        ...(request.paymentSelection && { paymentSelection: request.paymentSelection }),
        ...(request.notes && { notes: request.notes })
      });

      const booking = response.booking;
      if (booking) {
        console.log('✅ [WEB BOOKING SERVICE] Booking created:', booking.id);
        return booking;
      } else {
        console.warn('⚠️ [WEB BOOKING SERVICE] Booking creation returned no booking');
        return null;
      }
    } catch (error) {
      console.error('❌ [WEB BOOKING SERVICE] Failed to create booking:', error);
      return null;
    }
  }

  /**
   * Get service categories
   */
  async getServiceCategories(): Promise<WixServiceCategory[]> {
    console.log('📅 [WEB BOOKING SERVICE] Fetching service categories...');
    
    try {
      // For now, we'll extract categories from services
      // In the future, we might add a dedicated categories endpoint
      const servicesResponse = await this.getServices({ limit: 100 });
      
      const categoriesMap = new Map<string, WixServiceCategory>();
      
      servicesResponse.services.forEach(service => {
        if (service.category && service.category.id) {
          categoriesMap.set(service.category.id, {
            id: service.category.id,
            name: service.category.name,
            description: `Category for ${service.category.name} services`
          });
        }
      });

      const categories = Array.from(categoriesMap.values());
      console.log('✅ [WEB BOOKING SERVICE] Service categories loaded:', {
        categoriesCount: categories.length
      });

      return categories;
    } catch (error) {
      console.error('❌ [WEB BOOKING SERVICE] Failed to load service categories:', error);
      return [];
    }
  }

  /**
   * Get service providers
   */
  async getServiceProviders(serviceId?: string): Promise<WixServiceProvider[]> {
    console.log('📅 [WEB BOOKING SERVICE] Fetching service providers...', { serviceId });
    
    try {
      // For now, we'll extract providers from services
      // In the future, we might add a dedicated providers endpoint
      const query = serviceId ? { serviceId } : { limit: 100 };
      const servicesResponse = await this.getServices(query);
      
      const providersMap = new Map<string, WixServiceProvider>();
      
      servicesResponse.services.forEach(service => {
        if (service.provider && service.provider.id) {
          providersMap.set(service.provider.id, {
            id: service.provider.id,
            name: service.provider.name,
            description: `Provider for ${service.provider.name} services`
          });
        }
      });

      const providers = Array.from(providersMap.values());
      console.log('✅ [WEB BOOKING SERVICE] Service providers loaded:', {
        providersCount: providers.length
      });

      return providers;
    } catch (error) {
      console.error('❌ [WEB BOOKING SERVICE] Failed to load service providers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const webWixBookingService = WebWixBookingService.getInstance();
export default webWixBookingService;
