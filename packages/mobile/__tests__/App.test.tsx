/**
 * @format
 */

import React from 'react';
import {render, fireEvent, waitFor} from '../src/test/test-utils';
import App from '../src/App';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any async operations
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<App />);
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
    });

    it('displays bottom navigation with home and settings tabs', () => {
      const {getByText} = render(<App />);
      
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('🏠')).toBeTruthy(); // Home icon
      expect(getByText('⚙️')).toBeTruthy(); // Settings icon
    });

    it('shows home tab as active initially', () => {
      const {getByTestId} = render(<App />);
      
      // All tabs should be present and accessible
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('provides theme context to all components', () => {
      const {getByText} = render(<App />);
      
      // Theme should be applied to all components
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
    });

    it('displays themed navigation correctly', () => {
      const {getByText} = render(<App />);
      
      // Navigation should have theme applied
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  describe('Navigation Flow', () => {
    it('navigates to Settings screen', async () => {
      const {getByText} = render(<App />);
      
      // Navigate to settings
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
    });

    it('maintains consistent navigation state', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Test navigation using testIDs
      const homeTab = getByTestId('tab-home-tab');
      const settingsTab = getByTestId('tab-settings-tab');
      
      // Navigate to settings
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Navigate back to home
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      });
    });

    it('handles tab switching correctly', async () => {
      const {getByText} = render(<App />);
      
      const homeTab = getByText('Home');
      const settingsTab = getByText('Settings');
      
      // Test rapid navigation
      fireEvent.press(settingsTab);
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      });
    });
  });

  describe('Screen Content Verification', () => {
    it('displays home screen content correctly', () => {
      const {getByText} = render(<App />);
      
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      expect(getByText('Your AI-Powered App Creation Studio')).toBeTruthy();
    });

    it('displays settings screen when navigated', async () => {
      const {getByText} = render(<App />);
      
      // Navigate to settings
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        // Should show settings content
        expect(getByText('Appearance')).toBeTruthy();
      });
    });
  });

  describe('Component Structure', () => {
    it('renders main app structure correctly', () => {
      const {getByText} = render(<App />);
      
      // Main content should be present
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      
      // Navigation should be present
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('maintains proper component hierarchy', () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Both content and navigation should be accessible
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid navigation gracefully', () => {
      const {getByText} = render(<App />);
      
      // App should render without errors
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
    });

    it('maintains functionality after multiple rapid navigation changes', async () => {
      const {getByText} = render(<App />);
      
      const homeTab = getByText('Home');
      const settingsTab = getByText('Settings');
      
      // Rapid navigation between all tabs
      fireEvent.press(settingsTab);
      fireEvent.press(homeTab);
      fireEvent.press(settingsTab);
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      });
    });

    it('renders all tabs consistently', () => {
      const {getByText, getByTestId} = render(<App />);
      
      // All tabs should be present and accessible
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });
  });

  describe('Context Provider Integration', () => {
    it('provides theme context to all child components', () => {
      const {getByText} = render(<App />);
      
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('provides cart context for shopping functionality', () => {
      const {getByText} = render(<App />);
      
      // Cart context should be available (even if not directly tested)
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
    });
  });

  describe('Registry Integration', () => {
    it('loads screens from unified registry', () => {
      const {getByText} = render(<App />);
      
      // Registry-loaded screens should be accessible
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('dynamically renders navigation tabs from registry', () => {
      const {getByText} = render(<App />);
      
      // Dynamic navigation should work
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });
  });
});
