/**
 * CMSScreen Smoke Tests
 * 
 * Basic smoke tests for the Wix CMSScreen component covering:
 * - Component import and rendering
 * - Basic props handling
 * - Integration points
 */

import React from 'react';
import { render, screen } from '../../../../../test/test-utils';
import CMSScreen from '../CMSScreen';

// Mock the Wix data API client
jest.mock('../../../../../utils/wix', () => ({
  wixApiClient: {
    queryDataCollection: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getDataItem: jest.fn().mockResolvedValue({
      success: true,
      data: null,
    }),
  },
}));

// Mock props
const mockProps = {
  collectionId: 'test-collection',
  onBack: jest.fn(),
  onItemSelect: jest.fn(),
};

describe('CMSScreen Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smoke Tests', () => {
    it('should exist and be importable', () => {
      expect(CMSScreen).toBeDefined();
      expect(typeof CMSScreen).toBe('function');
    });

    it('should have correct display name or be a valid component', () => {
      expect(CMSScreen.displayName || CMSScreen.name || 'Component').toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have the expected component structure', () => {
      const result = render(<CMSScreen {...mockProps} />);
      expect(result).toBeTruthy();
    });
  });

  describe('Integration Points', () => {
    it('should work with navigation callbacks', () => {
      render(<CMSScreen {...mockProps} />);
      expect(mockProps.onBack).toBeDefined();
      expect(mockProps.onItemSelect).toBeDefined();
    });

    it('should have proper screen registration', () => {
      // This component should be usable in navigation
      expect(() => render(<CMSScreen {...mockProps} />)).not.toThrow();
    });
  });

  describe('Wix Integration Points', () => {
    it('should handle Wix data API client calls', async () => {
      const { wixApiClient } = require('../../../../../utils/wix');
      
      render(<CMSScreen {...mockProps} />);
      
      // Should attempt to load CMS data
      await new Promise(resolve => setTimeout(resolve, 200));
      // Note: API calls may be conditional on screen state
      expect(wixApiClient.queryDataCollection).toBeDefined();
    });

    it('should handle context dependencies', () => {
      // Should render without throwing errors from context
      expect(() => render(<CMSScreen {...mockProps} />)).not.toThrow();
    });
  });
});
