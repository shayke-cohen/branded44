/**
 * useMyBookings - Custom hook for my bookings logic
 * 
 * Centralizes all bookings list state management and business logic
 * Makes screens thin and focused on presentation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { bookingService } from '../../screens/wix/services/shared/WixBookingService';
import type { WixBooking } from '../../utils/wixBookingApiClient';

export type BookingFilter = 'all' | 'upcoming' | 'past' | 'cancelled';

interface UseMyBookingsState {
  bookings: WixBooking[];
  filteredBookings: WixBooking[];
  loading: boolean;
  refreshing: boolean;
  activeFilter: BookingFilter;
  error: string | null;
  stats: {
    total: number;
    upcoming: number;
    past: number;
    cancelled: number;
  };
}

interface UseMyBookingsActions {
  loadBookings: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  setFilter: (filter: BookingFilter) => void;
  cancelBooking: (bookingId: string) => Promise<void>;
  rescheduleBooking: (bookingId: string) => Promise<void>;
  clearError: () => void;
  retryLoad: () => Promise<void>;
}

interface UseMyBookingsReturn extends UseMyBookingsState, UseMyBookingsActions {
  isEmpty: boolean;
  hasUpcoming: boolean;
  canRefresh: boolean;
}

const INITIAL_STATE: UseMyBookingsState = {
  bookings: [],
  filteredBookings: [],
  loading: true,
  refreshing: false,
  activeFilter: 'all',
  error: null,
  stats: {
    total: 0,
    upcoming: 0,
    past: 0,
    cancelled: 0,
  },
};

export const useMyBookings = (): UseMyBookingsReturn => {
  // State
  const [state, setState] = useState<UseMyBookingsState>(INITIAL_STATE);
  
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
  const safeSetState = useCallback((updater: Partial<UseMyBookingsState> | ((prev: UseMyBookingsState) => UseMyBookingsState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Filter bookings based on active filter
   */
  const filterBookings = useCallback((bookings: WixBooking[], filter: BookingFilter): WixBooking[] => {
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.dateTime || booking.startDateTime || '');
          return bookingDate > now && booking.status !== 'CANCELLED';
        });
      
      case 'past':
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.dateTime || booking.startDateTime || '');
          return bookingDate <= now && booking.status !== 'CANCELLED';
        });
      
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'CANCELLED');
      
      case 'all':
      default:
        return bookings;
    }
  }, []);

  /**
   * Calculate booking statistics
   */
  const calculateStats = useCallback((bookings: WixBooking[]) => {
    const now = new Date();
    
    const stats = {
      total: bookings.length,
      upcoming: 0,
      past: 0,
      cancelled: 0,
    };

    bookings.forEach(booking => {
      if (booking.status === 'CANCELLED') {
        stats.cancelled++;
      } else {
        const bookingDate = new Date(booking.dateTime || booking.startDateTime || '');
        if (bookingDate > now) {
          stats.upcoming++;
        } else {
          stats.past++;
        }
      }
    });

    return stats;
  }, []);

  /**
   * Load all bookings
   */
  const loadBookings = useCallback(async () => {
    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [MY BOOKINGS HOOK] Loading bookings...');

      const bookings = await bookingService.getMyBookings();

      if (mounted.current) {
        const stats = calculateStats(bookings);
        const filteredBookings = filterBookings(bookings, state.activeFilter);

        safeSetState({
          bookings,
          filteredBookings,
          stats,
          loading: false,
        });

        console.log('✅ [MY BOOKINGS HOOK] Bookings loaded successfully', {
          total: bookings.length,
          filtered: filteredBookings.length,
          filter: state.activeFilter,
        });
      }
    } catch (error) {
      console.error('❌ [MY BOOKINGS HOOK] Error loading bookings:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load bookings',
        });
      }
    }
  }, [calculateStats, filterBookings, state.activeFilter, safeSetState]);

  /**
   * Refresh bookings
   */
  const refreshBookings = useCallback(async () => {
    try {
      safeSetState({ refreshing: true, error: null });

      console.log('🔄 [MY BOOKINGS HOOK] Refreshing bookings...');

      const bookings = await bookingService.getMyBookings();

      if (mounted.current) {
        const stats = calculateStats(bookings);
        const filteredBookings = filterBookings(bookings, state.activeFilter);

        safeSetState({
          bookings,
          filteredBookings,
          stats,
          refreshing: false,
        });

        console.log('✅ [MY BOOKINGS HOOK] Bookings refreshed successfully');
      }
    } catch (error) {
      console.error('❌ [MY BOOKINGS HOOK] Error refreshing bookings:', error);
      
      if (mounted.current) {
        safeSetState({
          refreshing: false,
          error: error instanceof Error ? error.message : 'Failed to refresh bookings',
        });
      }
    }
  }, [calculateStats, filterBookings, state.activeFilter, safeSetState]);

  /**
   * Set active filter and update filtered bookings
   */
  const setFilter = useCallback((filter: BookingFilter) => {
    console.log('🔄 [MY BOOKINGS HOOK] Setting filter:', filter);

    const filteredBookings = filterBookings(state.bookings, filter);

    safeSetState({
      activeFilter: filter,
      filteredBookings,
    });
  }, [state.bookings, filterBookings, safeSetState]);

  /**
   * Cancel a booking
   */
  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      safeSetState({ error: null });

      console.log('🔄 [MY BOOKINGS HOOK] Cancelling booking:', bookingId);

      const result = await bookingService.cancelBooking(bookingId);

      if (result.success) {
        console.log('✅ [MY BOOKINGS HOOK] Booking cancelled successfully');
        
        // Reload bookings to get updated status
        await loadBookings();

        return;
      }

      throw new Error(result.error || 'Failed to cancel booking');
    } catch (error) {
      console.error('❌ [MY BOOKINGS HOOK] Error cancelling booking:', error);
      
      if (mounted.current) {
        safeSetState({
          error: error instanceof Error ? error.message : 'Failed to cancel booking',
        });
      }
      
      throw error;
    }
  }, [loadBookings, safeSetState]);

  /**
   * Reschedule a booking (placeholder - would typically open a new booking flow)
   */
  const rescheduleBooking = useCallback(async (bookingId: string) => {
    try {
      console.log('🔄 [MY BOOKINGS HOOK] Rescheduling booking:', bookingId);

      // This would typically involve:
      // 1. Getting available slots for the service
      // 2. Opening a date/time picker
      // 3. Updating the booking with new date/time
      
      // For now, we'll just log it
      console.log('⚠️ [MY BOOKINGS HOOK] Reschedule feature not yet implemented');
      
      throw new Error('Reschedule feature coming soon');
    } catch (error) {
      console.error('❌ [MY BOOKINGS HOOK] Error rescheduling booking:', error);
      
      if (mounted.current) {
        safeSetState({
          error: error instanceof Error ? error.message : 'Failed to reschedule booking',
        });
      }
      
      throw error;
    }
  }, [safeSetState]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Retry loading after error
   */
  const retryLoad = useCallback(async () => {
    await loadBookings();
  }, [loadBookings]);

  /**
   * Auto-load bookings when hook is first used
   */
  useEffect(() => {
    if (mounted.current && state.bookings.length === 0 && !state.loading) {
      loadBookings();
    }
  }, []); // Only run once on mount

  /**
   * Update filtered bookings when filter or bookings change
   */
  useEffect(() => {
    const filteredBookings = filterBookings(state.bookings, state.activeFilter);
    
    if (mounted.current && JSON.stringify(filteredBookings) !== JSON.stringify(state.filteredBookings)) {
      safeSetState({ filteredBookings });
    }
  }, [state.bookings, state.activeFilter, filterBookings, state.filteredBookings, safeSetState]);

  /**
   * Derived state
   */
  const isEmpty = state.filteredBookings.length === 0 && !state.loading;
  const hasUpcoming = state.stats.upcoming > 0;
  const canRefresh = !state.loading && !state.refreshing;

  return {
    // State
    bookings: state.bookings,
    filteredBookings: state.filteredBookings,
    loading: state.loading,
    refreshing: state.refreshing,
    activeFilter: state.activeFilter,
    error: state.error,
    stats: state.stats,

    // Actions
    loadBookings,
    refreshBookings,
    setFilter,
    cancelBooking,
    rescheduleBooking,
    clearError,
    retryLoad,

    // Derived state
    isEmpty,
    hasUpcoming,
    canRefresh,
  };
};
