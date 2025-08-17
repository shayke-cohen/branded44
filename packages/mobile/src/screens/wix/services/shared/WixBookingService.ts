/**
 * WixBookingService - Service layer for booking-related operations
 * 
 * Centralizes all booking API calls, data transformations, and business logic
 * Keeps screens thin and focused on presentation
 */

import { wixBookingApiClient, type WixService, type WixServiceProvider, type WixBooking } from '../../../../utils/wixBookingApiClient';

export interface ServiceQuery {
  serviceId?: string;
  providerId?: string;
  categoryId?: string;
  includeProviders?: boolean;
  includeReviews?: boolean;
  includeSchedule?: boolean;
  forceRefresh?: boolean;
}

export interface BookingQuery {
  memberId?: string;
  serviceId?: string;
  providerId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
  providerId?: string;
  serviceId: string;
}

export interface BookingRequest {
  serviceId: string;
  providerId?: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

class WixBookingService {
  private static instance: WixBookingService;

  static getInstance(): WixBookingService {
    if (!WixBookingService.instance) {
      WixBookingService.instance = new WixBookingService();
    }
    return WixBookingService.instance;
  }

  /**
   * Get a single service with optional details
   */
  async getService(query: ServiceQuery): Promise<WixService> {
    try {
      const { serviceId, includeProviders = true, includeReviews = true } = query;
      
      if (!serviceId) {
        throw new Error('Service ID is required');
      }

      console.log('🎯 [BOOKING SERVICE] Fetching service:', { serviceId, includeProviders, includeReviews });

      const serviceResponse = await wixBookingApiClient.getServiceForBooking(serviceId);
      if (!serviceResponse || !serviceResponse.success || !serviceResponse.data) {
        throw new Error('Service not found');
      }

      let enrichedService = this.transformService(serviceResponse.data);

      // Optionally load providers
      if (includeProviders) {
        try {
          const providersResult = await wixBookingApiClient.queryServiceProviders({ serviceId });
          enrichedService.providers = providersResult?.providers?.map(this.transformProvider) || [];
        } catch (error) {
          console.warn('⚠️ [BOOKING SERVICE] Could not load providers:', error);
          enrichedService.providers = [];
        }
      }

      // Optionally load reviews
      if (includeReviews) {
        try {
          const reviews = await wixBookingApiClient.getServiceReviews(serviceId);
          enrichedService.reviews = reviews || [];
        } catch (error) {
          console.warn('⚠️ [BOOKING SERVICE] Could not load reviews:', error);
          enrichedService.reviews = [];
        }
      }

      console.log('✅ [BOOKING SERVICE] Service loaded successfully');
      return enrichedService;
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error fetching service:', error);
      throw new Error('Failed to load service details. Please try again.');
    }
  }

  /**
   * Get all services for booking
   */
  async getServices(query: ServiceQuery = {}): Promise<WixService[]> {
    try {
      const { categoryId, includeProviders = false, forceRefresh = false } = query;

      console.log('🎯 [BOOKING SERVICE] Fetching services:', { categoryId, includeProviders, forceRefresh });

      // Use queryServices directly to support forceRefresh
      const result = await wixBookingApiClient.queryServices({ forceRefresh });
      const response = { 
        success: true, 
        data: result.services || [],
        error: result.services ? undefined : 'No services found'
      };
      if (!response.success || !response.data || response.data.length === 0) {
        console.log('📅 [BOOKING SERVICE] No services found or error:', response.error);
        return [];
      }

      let filteredServices = response.data;

      // Filter by category if specified
      if (categoryId) {
        filteredServices = filteredServices.filter(service => 
          service.category === categoryId || service.categoryId === categoryId
        );
      }

      // Transform and optionally enrich with providers
      const transformedServices = await Promise.all(
        filteredServices.map(async (service) => {
          let transformedService = this.transformService(service);

          if (includeProviders) {
            try {
              const providersResult = await wixBookingApiClient.queryServiceProviders({ serviceId: service.id });
              transformedService.providers = providersResult?.providers?.map(this.transformProvider) || [];
            } catch (error) {
              console.warn(`⚠️ [BOOKING SERVICE] Could not load providers for service ${service.id}:`, error);
              transformedService.providers = [];
            }
          }

          return transformedService;
        })
      );

      console.log('✅ [BOOKING SERVICE] Services loaded:', transformedServices.length);
      return transformedServices;
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error fetching services:', error);
      throw new Error('Failed to load services. Please try again.');
    }
  }

  /**
   * Get a single service provider by ID
   */
  async getServiceProvider(providerId: string): Promise<WixServiceProvider> {
    try {
      console.log('🎯 [BOOKING SERVICE] Fetching service provider:', providerId);

      const providerResponse = await wixBookingApiClient.getServiceProviderForBooking(providerId);
      if (!providerResponse || !providerResponse.success || !providerResponse.data) {
        throw new Error('Service provider not found');
      }

      const transformedProvider = this.transformProvider(providerResponse.data);

      console.log('✅ [BOOKING SERVICE] Provider loaded successfully');
      return transformedProvider;
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error fetching provider:', error);
      throw new Error('Failed to load service provider. Please try again.');
    }
  }

  /**
   * Get service providers
   */
  async getServiceProviders(serviceId: string): Promise<WixServiceProvider[]> {
    try {
      console.log('🎯 [BOOKING SERVICE] Fetching service providers:', serviceId);

      const providersResult = await wixBookingApiClient.queryServiceProviders({ serviceId });
      const transformedProviders = providersResult?.providers?.map(this.transformProvider) || [];

      console.log('✅ [BOOKING SERVICE] Providers loaded:', transformedProviders.length);
      return transformedProviders;
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error fetching providers:', error);
      throw new Error('Failed to load service providers. Please try again.');
    }
  }

  /**
   * Get available time slots for a service
   */
  async getAvailableTimeSlots(serviceId: string, providerId?: string, date?: Date): Promise<TimeSlot[]> {
    try {
      const queryDate = date || new Date();
      console.log('🎯 [BOOKING SERVICE] Fetching time slots:', { serviceId, providerId, date: queryDate });

      const slots = await wixBookingApiClient.getAvailableTimeSlots(serviceId, providerId, queryDate);
      const transformedSlots = slots?.map(slot => this.transformTimeSlot(slot, serviceId)) || [];

      console.log('✅ [BOOKING SERVICE] Time slots loaded:', transformedSlots.length);
      return transformedSlots;
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error fetching time slots:', error);
      throw new Error('Failed to load available time slots. Please try again.');
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(request: BookingRequest): Promise<WixBooking> {
    try {
      console.log('🎯 [BOOKING SERVICE] Creating booking:', request);

      const booking = await wixBookingApiClient.createBooking({
        serviceId: request.serviceId,
        providerId: request.providerId,
        startTime: request.startTime,
        endTime: request.endTime,
        notes: request.notes,
        contactInfo: request.contactInfo,
      });

      if (!booking) {
        throw new Error('Failed to create booking');
      }

      console.log('✅ [BOOKING SERVICE] Booking created successfully:', booking.id);
      return this.transformBooking(booking);
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error creating booking:', error);
      throw new Error('Failed to create booking. Please try again.');
    }
  }

  /**
   * Get bookings for a member
   */
  async getBookings(query: BookingQuery = {}): Promise<WixBooking[]> {
    try {
      console.log('🎯 [BOOKING SERVICE] Fetching bookings:', query);

      const bookings = await wixBookingApiClient.getBookings(query);
      const transformedBookings = bookings?.map(this.transformBooking) || [];

      console.log('✅ [BOOKING SERVICE] Bookings loaded:', transformedBookings.length);
      return transformedBookings;
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error fetching bookings:', error);
      throw new Error('Failed to load bookings. Please try again.');
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      console.log('🎯 [BOOKING SERVICE] Cancelling booking:', bookingId);

      await wixBookingApiClient.cancelBooking(bookingId);

      console.log('✅ [BOOKING SERVICE] Booking cancelled successfully');
    } catch (error) {
      console.error('❌ [BOOKING SERVICE] Error cancelling booking:', error);
      throw new Error('Failed to cancel booking. Please try again.');
    }
  }

  /**
   * Transform API service to standardized format
   */
  private transformService(apiService: any): WixService {
    return {
      id: apiService.id || '',
      name: apiService.name || 'Unnamed Service',
      description: apiService.description || '',
      // Preserve the full payment object instead of flattening it
      payment: apiService.payment,
      // Preserve the full media object instead of flattening it  
      media: apiService.media,
      // Keep simplified fields for backward compatibility
      duration: apiService.duration || apiService.schedule?.availabilityConstraints?.durations?.[0]?.minutes || 60,
      price: apiService.price || 0,
      currency: apiService.currency || 'USD',
      category: apiService.category || apiService.categoryId || '',
      imageUrl: apiService.imageUrl || apiService.media?.mainMedia?.image?.url || '',
      providers: [], // Will be populated separately if needed
      reviews: [], // Will be populated separately if needed
      rating: apiService.rating || 0,
      reviewCount: apiService.reviewCount || 0,
      isActive: apiService.isActive ?? true,
      bookingPolicy: apiService.bookingPolicy || {},
      locations: apiService.locations || [],
      tags: apiService.tags || [],
      schedule: apiService.schedule,
      createdDate: apiService.createdDate,
      updatedDate: apiService.updatedDate,
    };
  }

  /**
   * Transform API provider to standardized format
   */
  private transformProvider(apiProvider: any): WixServiceProvider {
    return {
      id: apiProvider.id || '',
      name: apiProvider.name || 'Unknown Provider',
      email: apiProvider.email || '',
      phone: apiProvider.phone || '',
      bio: apiProvider.bio || '',
      imageUrl: apiProvider.imageUrl || apiProvider.profilePicture?.url || '',
      specialties: apiProvider.specialties || [],
      rating: apiProvider.rating || 0,
      reviewCount: apiProvider.reviewCount || 0,
      isActive: apiProvider.isActive ?? true,
      schedule: apiProvider.schedule || {},
      createdDate: apiProvider.createdDate,
      updatedDate: apiProvider.updatedDate,
    };
  }

  /**
   * Transform API time slot to standardized format
   */
  private transformTimeSlot(apiSlot: any, serviceId: string): TimeSlot {
    return {
      id: apiSlot.id || `${serviceId}-${Date.now()}`,
      startTime: new Date(apiSlot.startTime),
      endTime: new Date(apiSlot.endTime),
      available: apiSlot.available ?? true,
      providerId: apiSlot.providerId,
      serviceId,
    };
  }

  /**
   * Transform API booking to standardized format
   */
  private transformBooking(apiBooking: any): WixBooking {
    return {
      id: apiBooking.id || '',
      serviceId: apiBooking.serviceId || '',
      providerId: apiBooking.providerId,
      startTime: new Date(apiBooking.startTime),
      endTime: new Date(apiBooking.endTime),
      status: apiBooking.status || 'pending',
      notes: apiBooking.notes || '',
      contactInfo: apiBooking.contactInfo || {},
      createdDate: apiBooking.createdDate ? new Date(apiBooking.createdDate) : new Date(),
      updatedDate: apiBooking.updatedDate ? new Date(apiBooking.updatedDate) : new Date(),
    };
  }
}

export const bookingService = WixBookingService.getInstance();
