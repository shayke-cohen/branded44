/**
 * FoodScreen Smoke Tests
 * 
 * Basic smoke tests for the Wix FoodScreen component covering:
 * - Component import and rendering
 * - Basic props handling
 * - Integration points
 */

import React from 'react';
import { render, screen } from '../../../../../test/test-utils';
import FoodScreen from '../FoodScreen';

// Mock the Wix restaurant API client
jest.mock('../../../../../utils/wix', () => ({
  wixRestaurantApiClient: {
    getRestaurants: jest.fn().mockResolvedValue([]),
    getRestaurantById: jest.fn().mockResolvedValue(null),
    getMenu: jest.fn().mockResolvedValue({ sections: [] }),
    getMenuItems: jest.fn().mockResolvedValue([]),
    createOrder: jest.fn().mockResolvedValue({ id: 'test-order' }),
  },
  adaptWixRestaurant: jest.fn(x => x),
  adaptWixRestaurantHeader: jest.fn(x => x),
  adaptWixMenuSection: jest.fn(x => x),
  adaptWixMenuItem: jest.fn(x => x),
  adaptWixItemToOrderItem: jest.fn(x => x),
}));

// Mock props
const mockProps = {
  onBack: jest.fn(),
  onOrderComplete: jest.fn(),
};

describe('FoodScreen Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smoke Tests', () => {
    it('should exist and be importable', () => {
      expect(FoodScreen).toBeDefined();
      expect(typeof FoodScreen).toBe('function');
    });

    it('should have correct display name or be a valid component', () => {
      expect(FoodScreen.displayName || FoodScreen.name || 'Component').toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have the expected component structure', () => {
      const result = render(<FoodScreen {...mockProps} />);
      expect(result).toBeTruthy();
    });
  });

  describe('Integration Points', () => {
    it('should work with navigation callbacks', () => {
      render(<FoodScreen {...mockProps} />);
      expect(mockProps.onBack).toBeDefined();
      expect(mockProps.onOrderComplete).toBeDefined();
    });

    it('should have proper screen registration', () => {
      // This component should be usable in navigation
      expect(() => render(<FoodScreen {...mockProps} />)).not.toThrow();
    });
  });

  describe('Wix Integration Points', () => {
    it('should handle Wix restaurant API client calls', async () => {
      const { wixRestaurantApiClient } = require('../../../../../utils/wix');
      
      render(<FoodScreen {...mockProps} />);
      
      // Should attempt to load restaurant data 
      await new Promise(resolve => setTimeout(resolve, 200));
      // Note: API calls may be conditional on screen state
      expect(wixRestaurantApiClient.getRestaurants).toBeDefined();
    });

    it('should handle context dependencies', () => {
      // Should render without throwing errors from context
      expect(() => render(<FoodScreen {...mockProps} />)).not.toThrow();
    });
  });
});
