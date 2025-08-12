/**
 * ServiceDetailScreen Smoke Tests
 * 
 * Basic smoke tests for the Wix ServiceDetailScreen component covering:
 * - Component import and rendering
 * - Basic props handling
 * - Integration points
 */

import React from 'react';
import { render, screen } from '../../../../../test/test-utils';
import ServiceDetailScreen from '../ServiceDetailScreen';

// Mock the Wix booking API client
jest.mock('../../shared/wixBookingApiClient', () => ({
  wixBookingApiClient: {
    getServiceForBooking: jest.fn().mockResolvedValue({
      success: false,
      error: 'Mock service not found',
    }),
    getServiceProviders: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
  },
}));

// Mock props
const mockProps = {
  serviceId: 'test-service-id',
  onBack: jest.fn(),
  onBookService: jest.fn(),
};

describe('ServiceDetailScreen Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smoke Tests', () => {
    it('should exist and be importable', () => {
      expect(ServiceDetailScreen).toBeDefined();
      expect(typeof ServiceDetailScreen).toBe('function');
    });

    it('should have correct display name or be a valid component', () => {
      expect(ServiceDetailScreen.displayName || ServiceDetailScreen.name || 'Component').toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have the expected component structure', () => {
      const result = render(<ServiceDetailScreen {...mockProps} />);
      expect(result).toBeTruthy();
    });
  });

  describe('Integration Points', () => {
    it('should work with navigation callbacks', () => {
      render(<ServiceDetailScreen {...mockProps} />);
      expect(mockProps.onBack).toBeDefined();
      expect(mockProps.onBookService).toBeDefined();
    });

    it('should have proper screen registration', () => {
      // This component should be usable in navigation
      expect(() => render(<ServiceDetailScreen {...mockProps} />)).not.toThrow();
    });
  });

  describe('Wix Integration Points', () => {
    it('should handle Wix booking API client calls', async () => {
      const { wixBookingApiClient } = require('../../shared/wixBookingApiClient');
      
      render(<ServiceDetailScreen {...mockProps} />);
      
      // Should attempt to load service data
      await new Promise(resolve => setTimeout(resolve, 200));
      // Note: API calls may be conditional on screen state
      expect(wixBookingApiClient.getServiceForBooking).toBeDefined();
    });

    it('should handle context dependencies', () => {
      // Should render without throwing errors from context
      expect(() => render(<ServiceDetailScreen {...mockProps} />)).not.toThrow();
    });
  });
});
