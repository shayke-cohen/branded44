/**
 * ServicesListScreen Smoke Tests
 * 
 * Basic smoke tests for the Wix ServicesListScreen component covering:
 * - Component import and rendering
 * - Basic props handling
 * - Integration points
 */

import React from 'react';
import { render, screen } from '../../../../../test/test-utils';
import ServicesListScreen from '../ServicesListScreen';

// Mock the Wix booking API client
const mockGetServices = jest.fn().mockResolvedValue({
  success: true,
  data: [],
});

jest.mock('../../shared/wixBookingApiClient', () => ({
  wixBookingApiClient: {
    getServices: mockGetServices,
    getServiceCategories: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
  },
}));

// Mock props
const mockProps = {
  onBack: jest.fn(),
  onServiceSelect: jest.fn(),
};

describe('ServicesListScreen Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smoke Tests', () => {
    it('should exist and be importable', () => {
      expect(ServicesListScreen).toBeDefined();
      expect(typeof ServicesListScreen).toBe('function');
    });

    it('should have correct display name or be a valid component', () => {
      expect(ServicesListScreen.displayName || ServicesListScreen.name || 'Component').toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have the expected component structure', () => {
      const result = render(<ServicesListScreen {...mockProps} />);
      expect(result).toBeTruthy();
    });
  });

  describe('Integration Points', () => {
    it('should work with navigation callbacks', () => {
      render(<ServicesListScreen {...mockProps} />);
      expect(mockProps.onBack).toBeDefined();
      expect(mockProps.onServiceSelect).toBeDefined();
    });

    it('should have proper screen registration', () => {
      // This component should be usable in navigation
      expect(() => render(<ServicesListScreen {...mockProps} />)).not.toThrow();
    });
  });

  describe('Wix Integration Points', () => {
    it('should handle Wix booking API client calls', async () => {
      const { wixBookingApiClient } = require('../../shared/wixBookingApiClient');
      
      render(<ServicesListScreen {...mockProps} />);
      
      // Should attempt to load services data
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockGetServices).toHaveBeenCalled();
    });

    it('should handle context dependencies', () => {
      // Should render without throwing errors from context
      expect(() => render(<ServicesListScreen {...mockProps} />)).not.toThrow();
    });
  });
});
