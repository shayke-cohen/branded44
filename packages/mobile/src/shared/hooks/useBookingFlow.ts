/**
 * useBookingFlow - Custom hook for booking flow logic
 * 
 * Centralizes all booking flow state management and business logic
 * Makes screens thin and focused on presentation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { bookingService } from '../../screens/wix/services/shared/WixBookingService';
import type { WixService, WixServiceProvider } from '../../utils/wixBookingApiClient';

export type BookingStep = 'datetime' | 'details' | 'confirmation';

export interface BookingData {
  serviceId: string;
  providerId?: string;
  selectedDate: Date | null;
  selectedTime: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  };
  additionalInfo?: any;
}

interface UseBookingFlowState {
  currentStep: BookingStep;
  loading: boolean;
  submitting: boolean;
  service: WixService | null;
  provider: WixServiceProvider | null;
  availableSlots: string[];
  bookingData: BookingData;
  error: string | null;
  bookingId: string | null;
}

interface UseBookingFlowActions {
  initializeBooking: (serviceId: string, providerId?: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  updateCustomerInfo: (info: Partial<BookingData['customerInfo']>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  submitBooking: () => Promise<void>;
  loadAvailableSlots: (date: Date) => Promise<void>;
  clearError: () => void;
  resetBooking: () => void;
}

interface UseBookingFlowReturn extends UseBookingFlowState, UseBookingFlowActions {
  canProceed: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  formErrors: Record<string, string>;
}

const INITIAL_BOOKING_DATA: BookingData = {
  serviceId: '',
  providerId: undefined,
  selectedDate: null,
  selectedTime: '',
  customerInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  },
  additionalInfo: {},
};

const INITIAL_STATE: UseBookingFlowState = {
  currentStep: 'datetime',
  loading: false,
  submitting: false,
  service: null,
  provider: null,
  availableSlots: [],
  bookingData: INITIAL_BOOKING_DATA,
  error: null,
  bookingId: null,
};

const STEP_ORDER: BookingStep[] = ['datetime', 'details', 'confirmation'];

export const useBookingFlow = (): UseBookingFlowReturn => {
  // State
  const [state, setState] = useState<UseBookingFlowState>(INITIAL_STATE);
  
  // Refs
  const mounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseBookingFlowState> | ((prev: UseBookingFlowState) => UseBookingFlowState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Initialize booking with service and provider
   */
  const initializeBooking = useCallback(async (serviceId: string, providerId?: string) => {
    try {
      safeSetState({ 
        loading: true, 
        error: null,
        bookingData: { ...INITIAL_BOOKING_DATA, serviceId, providerId }
      });

      console.log('🔄 [BOOKING FLOW HOOK] Initializing booking...', { serviceId, providerId });

      // Load service details
      const service = await bookingService.getService(serviceId);
      
      let provider: WixServiceProvider | null = null;
      if (providerId) {
        provider = await bookingService.getServiceProvider(providerId);
      }

      if (mounted.current) {
        safeSetState({
          service,
          provider,
          loading: false,
        });

        console.log('✅ [BOOKING FLOW HOOK] Booking initialized successfully');
      }
    } catch (error) {
      console.error('❌ [BOOKING FLOW HOOK] Error initializing booking:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize booking',
        });
      }
    }
  }, [safeSetState]);

  /**
   * Set selected date and load available slots
   */
  const setSelectedDate = useCallback(async (date: Date) => {
    safeSetState(prev => ({
      bookingData: {
        ...prev.bookingData,
        selectedDate: date,
        selectedTime: '', // Reset selected time when date changes
      },
    }));

    await loadAvailableSlots(date);
  }, [safeSetState]);

  /**
   * Set selected time slot
   */
  const setSelectedTime = useCallback((time: string) => {
    safeSetState(prev => ({
      bookingData: {
        ...prev.bookingData,
        selectedTime: time,
      },
    }));
  }, [safeSetState]);

  /**
   * Update customer information
   */
  const updateCustomerInfo = useCallback((info: Partial<BookingData['customerInfo']>) => {
    safeSetState(prev => ({
      bookingData: {
        ...prev.bookingData,
        customerInfo: {
          ...prev.bookingData.customerInfo,
          ...info,
        },
      },
    }));
  }, [safeSetState]);

  /**
   * Load available time slots for a date
   */
  const loadAvailableSlots = useCallback(async (date: Date) => {
    if (!state.service) {
      console.warn('⚠️ [BOOKING FLOW HOOK] Cannot load slots without service');
      return;
    }

    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [BOOKING FLOW HOOK] Loading available slots for:', date.toISOString().split('T')[0]);

      const slots = await bookingService.getAvailableSlots(
        state.service.id,
        date,
        state.provider?.id
      );

      if (mounted.current) {
        safeSetState({
          availableSlots: slots,
          loading: false,
        });

        console.log('✅ [BOOKING FLOW HOOK] Available slots loaded:', slots.length);
      }
    } catch (error) {
      console.error('❌ [BOOKING FLOW HOOK] Error loading available slots:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          availableSlots: [],
          error: error instanceof Error ? error.message : 'Failed to load available slots',
        });
      }
    }
  }, [state.service, state.provider, safeSetState]);

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      safeSetState({ currentStep: nextStep });
      console.log('🔄 [BOOKING FLOW HOOK] Moving to step:', nextStep);
    }
  }, [state.currentStep, safeSetState]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const previousStep = STEP_ORDER[currentIndex - 1];
      safeSetState({ currentStep: previousStep });
      console.log('🔄 [BOOKING FLOW HOOK] Moving to step:', previousStep);
    }
  }, [state.currentStep, safeSetState]);

  /**
   * Submit booking
   */
  const submitBooking = useCallback(async () => {
    if (!state.service || !state.bookingData.selectedDate || !state.bookingData.selectedTime) {
      safeSetState({ error: 'Missing required booking information' });
      return;
    }

    try {
      safeSetState({ submitting: true, error: null });

      console.log('🔄 [BOOKING FLOW HOOK] Submitting booking...', {
        serviceId: state.service.id,
        date: state.bookingData.selectedDate.toISOString().split('T')[0],
        time: state.bookingData.selectedTime,
      });

      const booking = await bookingService.createBooking({
        serviceId: state.service.id,
        providerId: state.provider?.id,
        dateTime: new Date(
          state.bookingData.selectedDate.toISOString().split('T')[0] + 'T' + state.bookingData.selectedTime
        ),
        customerInfo: state.bookingData.customerInfo,
        additionalInfo: state.bookingData.additionalInfo,
      });

      if (mounted.current) {
        safeSetState({
          submitting: false,
          bookingId: booking.id,
          currentStep: 'confirmation',
        });

        console.log('✅ [BOOKING FLOW HOOK] Booking submitted successfully:', booking.id);
      }
    } catch (error) {
      console.error('❌ [BOOKING FLOW HOOK] Error submitting booking:', error);
      
      if (mounted.current) {
        safeSetState({
          submitting: false,
          error: error instanceof Error ? error.message : 'Failed to submit booking',
        });
      }
    }
  }, [state.service, state.provider, state.bookingData, safeSetState]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Reset booking flow
   */
  const resetBooking = useCallback(() => {
    safeSetState(INITIAL_STATE);
  }, [safeSetState]);

  /**
   * Validate customer form
   */
  const formErrors = React.useMemo((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const { customerInfo } = state.bookingData;

    if (!customerInfo.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!customerInfo.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!customerInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!customerInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    return errors;
  }, [state.bookingData.customerInfo]);

  /**
   * Derived state
   */
  const currentStepIndex = STEP_ORDER.indexOf(state.currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;

  const canProceed = React.useMemo(() => {
    switch (state.currentStep) {
      case 'datetime':
        return !!(state.bookingData.selectedDate && state.bookingData.selectedTime);
      case 'details':
        return Object.keys(formErrors).length === 0;
      case 'confirmation':
        return false; // No next step after confirmation
      default:
        return false;
    }
  }, [state.currentStep, state.bookingData, formErrors]);

  return {
    // State
    currentStep: state.currentStep,
    loading: state.loading,
    submitting: state.submitting,
    service: state.service,
    provider: state.provider,
    availableSlots: state.availableSlots,
    bookingData: state.bookingData,
    error: state.error,
    bookingId: state.bookingId,

    // Actions
    initializeBooking,
    setSelectedDate,
    setSelectedTime,
    updateCustomerInfo,
    goToNextStep,
    goToPreviousStep,
    submitBooking,
    loadAvailableSlots,
    clearError,
    resetBooking,

    // Derived state
    canProceed,
    isFirstStep,
    isLastStep,
    progress,
    formErrors,
  };
};
