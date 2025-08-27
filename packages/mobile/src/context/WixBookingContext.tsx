import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  wixBookingClient, 
  WixService, 
  WixServiceProvider, 
  WixServiceCategory,
  WixBooking,
  WixBookingSlot,
  WixBookingRequest,
  WixAvailabilityQuery
} from '../utils/wix';
import { useMember } from './index';

interface WixBookingContextType {
  // Services
  services: WixService[];
  servicesLoading: boolean;
  selectedService: WixService | null;
  
  // Categories
  categories: WixServiceCategory[];
  categoriesLoading: boolean;
  
  // Providers
  providers: WixServiceProvider[];
  providersLoading: boolean;
  selectedProvider: WixServiceProvider | null;
  
  // Availability & Booking
  availableSlots: WixBookingSlot[];
  availabilityLoading: boolean;
  selectedSlot: WixBookingSlot | null;
  
  // Customer Bookings
  customerBookings: WixBooking[];
  bookingsLoading: boolean;
  
  // Actions
  loadServices: (filters?: { categoryId?: string; forceRefresh?: boolean }) => Promise<void>;
  loadServiceCategories: (forceRefresh?: boolean) => Promise<void>;
  loadServiceProviders: (filters?: { serviceId?: string; forceRefresh?: boolean }) => Promise<void>;
  getService: (serviceId: string) => Promise<WixService | null>;
  
  // Selection actions
  selectService: (service: WixService | null) => void;
  selectProvider: (provider: WixServiceProvider | null) => void;
  selectSlot: (slot: WixBookingSlot | null) => void;
  
  // Availability actions
  loadAvailableSlots: (query: WixAvailabilityQuery) => Promise<void>;
  
  // Booking actions
  createBooking: (booking: WixBookingRequest) => Promise<WixBooking | null>;
  loadCustomerBookings: () => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>;
  rescheduleBooking: (bookingId: string, newSessionId: string) => Promise<WixBooking | null>;
  
  // Utility actions
  clearCache: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Helper functions
  getServicesByCategory: (categoryId: string) => WixService[];
  getProvidersByService: (serviceId: string) => WixServiceProvider[];
  isServiceAvailable: (serviceId: string) => boolean;
  
  // Member integration
  isMemberLoggedIn: () => boolean;
  getMemberInfo: () => { isLoggedIn: boolean; memberEmail?: string };
}

const WixBookingContext = createContext<WixBookingContextType | undefined>(undefined);

interface WixBookingProviderProps {
  children: ReactNode;
}

export const WixBookingProvider: React.FC<WixBookingProviderProps> = ({ children }) => {
  // State
  const [services, setServices] = useState<WixService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<WixService | null>(null);
  
  const [categories, setCategories] = useState<WixServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const [providers, setProviders] = useState<WixServiceProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<WixServiceProvider | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<WixBookingSlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<WixBookingSlot | null>(null);
  
  const [customerBookings, setCustomerBookings] = useState<WixBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  const { isLoggedIn, member } = useMember();

  console.log('📅 [BOOKING CONTEXT] WixBookingProvider initialized');

  // === SERVICE ACTIONS ===

  const loadServices = useCallback(async (filters?: { categoryId?: string; forceRefresh?: boolean }) => {
    try {
      setServicesLoading(true);
      console.log('📅 [BOOKING CONTEXT] Loading services with filters:', filters);
      
      const result = await wixBookingClient.queryServices({
        categoryId: filters?.categoryId,
        visible: true,
        limit: 50,
        forceRefresh: filters?.forceRefresh
      });
      
      setServices(result.services);
      console.log(`✅ [BOOKING CONTEXT] Loaded ${result.services.length} services`);
      
      // If a service was selected but no longer in the list, clear selection
      if (selectedService && !result.services.find(s => s.id === selectedService.id)) {
        setSelectedService(null);
        console.log('🔄 [BOOKING CONTEXT] Cleared selected service (no longer available)');
      }
      
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to load services:', error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, [selectedService]);

  const loadServiceCategories = useCallback(async (forceRefresh = false) => {
    try {
      setCategoriesLoading(true);
      console.log('📅 [BOOKING CONTEXT] Loading service categories...');
      
      const result = await wixBookingClient.queryServiceCategories(forceRefresh);
      setCategories(result.categories);
      
      console.log(`✅ [BOOKING CONTEXT] Loaded ${result.categories.length} service categories`);
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to load service categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadServiceProviders = useCallback(async (filters?: { serviceId?: string; forceRefresh?: boolean }) => {
    try {
      setProvidersLoading(true);
      console.log('📅 [BOOKING CONTEXT] Loading service providers with filters:', filters);
      
      const result = await wixBookingClient.queryServiceProviders({
        serviceId: filters?.serviceId,
        limit: 50,
        forceRefresh: filters?.forceRefresh
      });
      
      setProviders(result.providers);
      console.log(`✅ [BOOKING CONTEXT] Loaded ${result.providers.length} service providers`);
      
      // If a provider was selected but no longer in the list, clear selection
      if (selectedProvider && !result.providers.find(p => p.id === selectedProvider.id)) {
        setSelectedProvider(null);
        console.log('🔄 [BOOKING CONTEXT] Cleared selected provider (no longer available)');
      }
      
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to load service providers:', error);
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  }, [selectedProvider]);

  const getService = useCallback(async (serviceId: string): Promise<WixService | null> => {
    try {
      console.log(`📅 [BOOKING CONTEXT] Getting service: ${serviceId}`);
      
      // Check if service is already loaded
      const existingService = services.find(s => s.id === serviceId);
      if (existingService) {
        console.log('✅ [BOOKING CONTEXT] Service found in loaded services');
        return existingService;
      }
      
      // Fetch from API
      const serviceResult = await wixBookingClient.getServiceForBooking(serviceId);
      
      if (serviceResult.success && serviceResult.data) {
        const service = serviceResult.data;
        // Add to services list if not already there
        setServices(prev => {
          const exists = prev.find(s => s.id === serviceId);
          return exists ? prev : [...prev, service];
        });
        return service;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ [BOOKING CONTEXT] Failed to get service ${serviceId}:`, error);
      return null;
    }
  }, [services]);

  // === SELECTION ACTIONS ===

  const selectService = useCallback((service: WixService | null) => {
    setSelectedService(service);
    
    // Clear related selections when service changes
    if (service?.id !== selectedService?.id) {
      setSelectedProvider(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
    }
    
    console.log('📅 [BOOKING CONTEXT] Selected service:', service?.name || 'none');
  }, [selectedService]);

  const selectProvider = useCallback((provider: WixServiceProvider | null) => {
    setSelectedProvider(provider);
    
    // Clear slot selection when provider changes
    if (provider?.id !== selectedProvider?.id) {
      setSelectedSlot(null);
      setAvailableSlots([]);
    }
    
    console.log('📅 [BOOKING CONTEXT] Selected provider:', provider?.name || 'none');
  }, [selectedProvider]);

  const selectSlot = useCallback((slot: WixBookingSlot | null) => {
    setSelectedSlot(slot);
    console.log('📅 [BOOKING CONTEXT] Selected slot:', slot?.startTime || 'none');
  }, []);

  // === AVAILABILITY ACTIONS ===

  const loadAvailableSlots = useCallback(async (query: WixAvailabilityQuery) => {
    try {
      setAvailabilityLoading(true);
      console.log('📅 [BOOKING CONTEXT] Loading available slots:', query);
      
      const slots = await wixBookingClient.getAvailableSlots(query);
      setAvailableSlots(slots);
      
      // Clear selected slot if it's no longer available
      if (selectedSlot && !slots.find(s => s.sessionId === selectedSlot.sessionId)) {
        setSelectedSlot(null);
        console.log('🔄 [BOOKING CONTEXT] Cleared selected slot (no longer available)');
      }
      
      console.log(`✅ [BOOKING CONTEXT] Loaded ${slots.length} available slots`);
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to load available slots:', error);
      setAvailableSlots([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [selectedSlot]);

  // === BOOKING ACTIONS ===

  const createBooking = useCallback(async (booking: WixBookingRequest): Promise<WixBooking | null> => {
    try {
      console.log('📅 [BOOKING CONTEXT] Creating booking:', booking);
      
      const newBooking = await wixBookingClient.createBooking(booking);
      
      if (newBooking) {
        // Add to customer bookings list
        setCustomerBookings(prev => [newBooking, ...prev]);
        
        // Clear selections after successful booking
        setSelectedSlot(null);
        setAvailableSlots([]);
        
        console.log(`✅ [BOOKING CONTEXT] Booking created: ${newBooking.id}`);
      }
      
      return newBooking;
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to create booking:', error);
      return null;
    }
  }, []);

  const loadCustomerBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      console.log('📅 [BOOKING CONTEXT] Loading customer bookings...');
      
      // For member users, we could pass member ID, but API handles this automatically
      const bookings = await wixBookingClient.getCustomerBookings();
      setCustomerBookings(bookings);
      
      console.log(`✅ [BOOKING CONTEXT] Loaded ${bookings.length} customer bookings`);
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to load customer bookings:', error);
      setCustomerBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<boolean> => {
    try {
      console.log(`📅 [BOOKING CONTEXT] Canceling booking: ${bookingId}`);
      
      const success = await wixBookingClient.cancelBooking(bookingId, reason);
      
      if (success) {
        // Update the booking status in local state
        setCustomerBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'CANCELED' as const }
            : booking
        ));
        
        console.log(`✅ [BOOKING CONTEXT] Booking canceled: ${bookingId}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ [BOOKING CONTEXT] Failed to cancel booking ${bookingId}:`, error);
      return false;
    }
  }, []);

  const rescheduleBooking = useCallback(async (bookingId: string, newSessionId: string): Promise<WixBooking | null> => {
    try {
      console.log(`📅 [BOOKING CONTEXT] Rescheduling booking: ${bookingId} to session: ${newSessionId}`);
      
      const updatedBooking = await wixBookingClient.rescheduleBooking(bookingId, newSessionId);
      
      if (updatedBooking) {
        // Update the booking in local state
        setCustomerBookings(prev => prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        ));
        
        console.log(`✅ [BOOKING CONTEXT] Booking rescheduled: ${bookingId}`);
      }
      
      return updatedBooking;
    } catch (error) {
      console.error(`❌ [BOOKING CONTEXT] Failed to reschedule booking ${bookingId}:`, error);
      return null;
    }
  }, []);

  // === UTILITY ACTIONS ===

  const clearCache = useCallback(async () => {
    try {
      await wixBookingClient.clearCache();
      console.log('🗑️ [BOOKING CONTEXT] Cache cleared');
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to clear cache:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      console.log('🔄 [BOOKING CONTEXT] Refreshing all data...');
      
      await Promise.all([
        loadServices({ forceRefresh: true }),
        loadServiceCategories(true),
        loadServiceProviders({ forceRefresh: true }),
        ...(isLoggedIn ? [loadCustomerBookings()] : [])
      ]);
      
      console.log('✅ [BOOKING CONTEXT] All data refreshed');
    } catch (error) {
      console.error('❌ [BOOKING CONTEXT] Failed to refresh all data:', error);
    }
  }, [loadServices, loadServiceCategories, loadServiceProviders, loadCustomerBookings, isLoggedIn]);

  // === HELPER FUNCTIONS ===

  const getServicesByCategory = useCallback((categoryId: string): WixService[] => {
    return services.filter(service => service.category?.id === categoryId);
  }, [services]);

  const getProvidersByService = useCallback((serviceId: string): WixServiceProvider[] => {
    return providers.filter(provider => provider.services.includes(serviceId));
  }, [providers]);

  const isServiceAvailable = useCallback((serviceId: string): boolean => {
    const service = services.find(s => s.id === serviceId);
    return service?.status === 'ACTIVE' && service?.bookingOptions?.enableOnlineBooking === true;
  }, [services]);

  const isMemberLoggedIn = useCallback((): boolean => {
    return isLoggedIn;
  }, [isLoggedIn]);

  const getMemberInfo = useCallback(() => {
    return {
      isLoggedIn,
      memberEmail: member?.email?.address,
    };
  }, [isLoggedIn, member?.email?.address]);

  // === EFFECTS ===

  // Initialize data on mount
  useEffect(() => {
    console.log('📅 [BOOKING CONTEXT] Initializing booking data...');
    
    Promise.all([
      loadServices(),
      loadServiceCategories(),
      loadServiceProviders()
    ]).then(() => {
      console.log('✅ [BOOKING CONTEXT] Initial data loaded');
    });
  }, []); // Run once on mount

  // Load customer bookings when member logs in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('📅 [BOOKING CONTEXT] Member logged in, loading customer bookings...');
      loadCustomerBookings();
    } else {
      // Clear customer bookings when member logs out
      setCustomerBookings([]);
      console.log('📅 [BOOKING CONTEXT] Member logged out, cleared customer bookings');
    }
  }, [isLoggedIn, loadCustomerBookings]);

  // Context value
  const contextValue: WixBookingContextType = {
    // Services
    services,
    servicesLoading,
    selectedService,
    
    // Categories
    categories,
    categoriesLoading,
    
    // Providers
    providers,
    providersLoading,
    selectedProvider,
    
    // Availability & Booking
    availableSlots,
    availabilityLoading,
    selectedSlot,
    
    // Customer Bookings
    customerBookings,
    bookingsLoading,
    
    // Actions
    loadServices,
    loadServiceCategories,
    loadServiceProviders,
    getService,
    
    // Selection actions
    selectService,
    selectProvider,
    selectSlot,
    
    // Availability actions
    loadAvailableSlots,
    
    // Booking actions
    createBooking,
    loadCustomerBookings,
    cancelBooking,
    rescheduleBooking,
    
    // Utility actions
    clearCache,
    refreshAll,
    
    // Helper functions
    getServicesByCategory,
    getProvidersByService,
    isServiceAvailable,
    
    // Member integration
    isMemberLoggedIn,
    getMemberInfo,
  };

  return (
    <WixBookingContext.Provider value={contextValue}>
      {children}
    </WixBookingContext.Provider>
  );
};

export const useWixBooking = (): WixBookingContextType => {
  const context = useContext(WixBookingContext);
  if (!context) {
    throw new Error('useWixBooking must be used within a WixBookingProvider');
  }
  return context;
};

console.log('📅 [BOOKING CONTEXT] WixBookingContext module loaded');
