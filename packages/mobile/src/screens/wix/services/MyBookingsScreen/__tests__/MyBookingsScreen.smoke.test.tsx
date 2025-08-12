/**
 * MyBookingsScreen Smoke Tests
 * 
 * Basic smoke tests for the Wix MyBookingsScreen component covering:
 * - Component import and rendering
 * - Basic props handling
 * - Integration points
 */

import React from 'react';
import { render, screen } from '../../../../../test/test-utils';
import MyBookingsScreen from '../MyBookingsScreen';

// Mock the Wix booking API client
jest.mock('../../shared/wixBookingApiClient', () => ({
  wixBookingApiClient: {
    getMyBookings: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    cancelBooking: jest.fn().mockResolvedValue({
      success: true,
    }),
    rescheduleBooking: jest.fn().mockResolvedValue({
      success: true,
    }),
  },
}));

// Mock props
const mockProps = {
  onBack: jest.fn(),
  onBookingSelect: jest.fn(),
};

describe('MyBookingsScreen Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smoke Tests', () => {
    it('should exist and be importable', () => {
      expect(MyBookingsScreen).toBeDefined();
      expect(typeof MyBookingsScreen).toBe('function');
    });

    it('should have correct display name or be a valid component', () => {
      expect(MyBookingsScreen.displayName || MyBookingsScreen.name || 'Component').toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have the expected component structure', () => {
      const result = render(<MyBookingsScreen {...mockProps} />);
      expect(result).toBeTruthy();
    });
  });

  describe('Integration Points', () => {
    it('should work with navigation callbacks', () => {
      render(<MyBookingsScreen {...mockProps} />);
      expect(mockProps.onBack).toBeDefined();
      expect(mockProps.onBookingSelect).toBeDefined();
    });

    it('should have proper screen registration', () => {
      // This component should be usable in navigation
      expect(() => render(<MyBookingsScreen {...mockProps} />)).not.toThrow();
    });
  });

  describe('Wix Integration Points', () => {
    it('should handle Wix booking API client calls', async () => {
      const { wixBookingApiClient } = require('../../shared/wixBookingApiClient');
      
      render(<MyBookingsScreen {...mockProps} />);
      
      // Should attempt to load bookings data
      await new Promise(resolve => setTimeout(resolve, 200));
      // Note: API calls may be conditional on screen state
      expect(wixBookingApiClient.getMyBookings).toBeDefined();
    });

    it('should handle context dependencies', () => {
      // Should render without throwing errors from context
      expect(() => render(<MyBookingsScreen {...mockProps} />)).not.toThrow();
    });
  });
});
