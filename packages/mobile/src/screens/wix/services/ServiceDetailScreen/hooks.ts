/**
 * useServiceDetail - Custom hook for service detail logic
 * 
 * Centralizes all service detail state management and business logic
 * Makes screens thin and focused on presentation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { bookingService, type ServiceQuery, type TimeSlot, type BookingRequest } from '../shared/WixBookingService';
import type { WixService, WixServiceProvider, WixBooking } from '../utils/wixBookingApiClient';

interface UseServiceDetailState {
  service: WixService | null;
  providers: WixServiceProvider[];
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  loadingProviders: boolean;
  loadingTimeSlots: boolean;
  selectedProvider: WixServiceProvider | null;
  selectedDate: Date;
  selectedTimeSlot: TimeSlot | null;
  bookingInProgress: boolean;
}

interface UseServiceDetailActions {
  loadService: () => Promise<void>;
  loadProviders: () => Promise<void>;
  loadTimeSlots: (date?: Date, providerId?: string) => Promise<void>;
  selectProvider: (provider: WixServiceProvider | null) => void;
  selectDate: (date: Date) => void;
  selectTimeSlot: (timeSlot: TimeSlot | null) => void;
  createBooking: (request: Partial<BookingRequest>) => Promise<WixBooking>;
  retryLoad: () => Promise<void>;
  clearError: () => void;
}

interface UseServiceDetailReturn extends UseServiceDetailState, UseServiceDetailActions {}

const INITIAL_STATE: UseServiceDetailState = {
  service: null,
  providers: [],
  timeSlots: [],
  loading: true,
  error: null,
  loadingProviders: false,
  loadingTimeSlots: false,
  selectedProvider: null,
  selectedDate: new Date(),
  selectedTimeSlot: null,
  bookingInProgress: false,
};

export const useServiceDetail = (serviceId: string, providerId?: string): UseServiceDetailReturn => {
  // State
  const [state, setState] = useState<UseServiceDetailState>(INITIAL_STATE);
  
  // Refs
  const mounted = useRef(true);
  const currentServiceId = useRef(serviceId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Update service ID if it changes
  useEffect(() => {
    if (serviceId !== currentServiceId.current) {
      currentServiceId.current = serviceId;
      setState(INITIAL_STATE);
      loadService();
    }
  }, [serviceId]);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseServiceDetailState> | ((prev: UseServiceDetailState) => UseServiceDetailState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Load service details
   */
  const loadService = useCallback(async () => {
    if (!serviceId) {
      safeSetState({ error: 'Service ID is required', loading: false });
      return;
    }

    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [SERVICE DETAIL HOOK] Loading service:', serviceId);

      const query: ServiceQuery = {
        serviceId,
        includeProviders: true,
        includeReviews: true,
      };

      const service = await bookingService.getService(query);

      if (mounted.current) {
        safeSetState(prev => ({
          service,
          providers: service.providers || [],
          loading: false,
          error: null,
          selectedProvider: providerId 
            ? service.providers?.find(p => p.id === providerId) || null 
            : service.providers?.[0] || null,
        }));

        console.log('✅ [SERVICE DETAIL HOOK] Service loaded successfully');

        // Auto-load time slots for today with the selected provider
        loadTimeSlots(new Date(), providerId);
      }
    } catch (error) {
      console.error('❌ [SERVICE DETAIL HOOK] Error loading service:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load service',
        });
      }
    }
  }, [serviceId, providerId, safeSetState]);

  /**
   * Load service providers
   */
  const loadProviders = useCallback(async () => {
    if (!serviceId) return;

    try {
      safeSetState({ loadingProviders: true, error: null });

      console.log('🔄 [SERVICE DETAIL HOOK] Loading providers for service:', serviceId);

      const providers = await bookingService.getServiceProviders(serviceId);

      if (mounted.current) {
        safeSetState(prev => ({
          providers,
          loadingProviders: false,
          selectedProvider: prev.selectedProvider || providers[0] || null,
        }));

        console.log('✅ [SERVICE DETAIL HOOK] Providers loaded successfully');
      }
    } catch (error) {
      console.error('❌ [SERVICE DETAIL HOOK] Error loading providers:', error);
      
      if (mounted.current) {
        safeSetState({
          loadingProviders: false,
          error: error instanceof Error ? error.message : 'Failed to load providers',
        });
      }
    }
  }, [serviceId, safeSetState]);

  /**
   * Load available time slots
   */
  const loadTimeSlots = useCallback(async (date?: Date, targetProviderId?: string) => {
    if (!serviceId) return;

    try {
      const queryDate = date || state.selectedDate;
      const queryProviderId = targetProviderId || state.selectedProvider?.id;

      safeSetState({ loadingTimeSlots: true, error: null });

      console.log('🔄 [SERVICE DETAIL HOOK] Loading time slots:', { 
        serviceId, 
        providerId: queryProviderId, 
        date: queryDate 
      });

      const timeSlots = await bookingService.getAvailableTimeSlots(
        serviceId, 
        queryProviderId, 
        queryDate
      );

      if (mounted.current) {
        safeSetState({
          timeSlots,
          loadingTimeSlots: false,
          selectedTimeSlot: null, // Reset selection when slots change
        });

        console.log('✅ [SERVICE DETAIL HOOK] Time slots loaded successfully');
      }
    } catch (error) {
      console.error('❌ [SERVICE DETAIL HOOK] Error loading time slots:', error);
      
      if (mounted.current) {
        safeSetState({
          loadingTimeSlots: false,
          error: error instanceof Error ? error.message : 'Failed to load time slots',
        });
      }
    }
  }, [serviceId, state.selectedDate, state.selectedProvider?.id, safeSetState]);

  /**
   * Select a provider
   */
  const selectProvider = useCallback((provider: WixServiceProvider | null) => {
    safeSetState(prev => ({
      selectedProvider: provider,
      selectedTimeSlot: null, // Reset time slot selection
    }));

    // Load time slots for the new provider
    if (provider) {
      loadTimeSlots(state.selectedDate, provider.id);
    }
  }, [state.selectedDate, loadTimeSlots, safeSetState]);

  /**
   * Select a date
   */
  const selectDate = useCallback((date: Date) => {
    safeSetState(prev => ({
      selectedDate: date,
      selectedTimeSlot: null, // Reset time slot selection
    }));

    // Load time slots for the new date
    loadTimeSlots(date, state.selectedProvider?.id);
  }, [state.selectedProvider?.id, loadTimeSlots, safeSetState]);

  /**
   * Select a time slot
   */
  const selectTimeSlot = useCallback((timeSlot: TimeSlot | null) => {
    safeSetState({ selectedTimeSlot: timeSlot });
  }, [safeSetState]);

  /**
   * Create a booking
   */
  const createBooking = useCallback(async (request: Partial<BookingRequest>): Promise<WixBooking> => {
    if (!serviceId || !state.selectedTimeSlot) {
      throw new Error('Service and time slot must be selected');
    }

    try {
      safeSetState({ bookingInProgress: true, error: null });

      console.log('🔄 [SERVICE DETAIL HOOK] Creating booking:', request);

      const bookingRequest: BookingRequest = {
        serviceId,
        providerId: state.selectedProvider?.id,
        startTime: state.selectedTimeSlot.startTime,
        endTime: state.selectedTimeSlot.endTime,
        ...request,
      };

      const booking = await bookingService.createBooking(bookingRequest);

      if (mounted.current) {
        safeSetState({
          bookingInProgress: false,
          selectedTimeSlot: null, // Reset after successful booking
        });

        // Reload time slots to reflect the booked slot
        loadTimeSlots(state.selectedDate, state.selectedProvider?.id);

        console.log('✅ [SERVICE DETAIL HOOK] Booking created successfully');
      }

      return booking;
    } catch (error) {
      console.error('❌ [SERVICE DETAIL HOOK] Error creating booking:', error);
      
      if (mounted.current) {
        safeSetState({
          bookingInProgress: false,
          error: error instanceof Error ? error.message : 'Failed to create booking',
        });
      }

      throw error;
    }
  }, [serviceId, state.selectedTimeSlot, state.selectedProvider?.id, state.selectedDate, loadTimeSlots, safeSetState]);

  /**
   * Retry loading after error
   */
  const retryLoad = useCallback(async () => {
    await loadService();
  }, [loadService]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Auto-load service when hook is first used
   */
  useEffect(() => {
    if (serviceId && mounted.current) {
      loadService();
    }
  }, []); // Only run once on mount

  /**
   * Derived state
   */
  const canBook = !!(
    state.service && 
    state.selectedTimeSlot && 
    !state.bookingInProgress && 
    state.selectedTimeSlot.available
  );

  return {
    // State
    service: state.service,
    providers: state.providers,
    timeSlots: state.timeSlots,
    loading: state.loading,
    error: state.error,
    loadingProviders: state.loadingProviders,
    loadingTimeSlots: state.loadingTimeSlots,
    selectedProvider: state.selectedProvider,
    selectedDate: state.selectedDate,
    selectedTimeSlot: state.selectedTimeSlot,
    bookingInProgress: state.bookingInProgress,

    // Actions
    loadService,
    loadProviders,
    loadTimeSlots,
    selectProvider,
    selectDate,
    selectTimeSlot,
    createBooking,
    retryLoad,
    clearError,

    // Derived state
    canBook,
  };
};
