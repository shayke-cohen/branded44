/**
 * @format
 * Navigation Integration Tests
 * 
 * These tests ensure that:
 * 1. All screens in the app render correctly
 * 2. Bottom navigation is present and functional on all screens
 * 3. Navigation state is properly maintained
 * 4. Screen transitions work smoothly
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

describe('Navigation Integration Tests', () => {
  describe('Complete Screen Rendering', () => {
    it('renders HomeScreen correctly with all expected elements', () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Verify HomeScreen content
      expect(getByText('Welcome to Your App')).toBeTruthy();
      expect(getByText('This is your home screen. Start building your app from here!')).toBeTruthy();
      
      // Verify bottom navigation is present
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('🏠')).toBeTruthy();
      expect(getByText('⚙️')).toBeTruthy();
    });

    it('renders SettingsScreen correctly with all expected elements', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Navigate to settings
      const settingsTab = getByTestId('tab-settings-tab');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        // Verify SettingsScreen content by checking unique elements
        expect(getByText('Appearance')).toBeTruthy();
        expect(getByText('Current Theme')).toBeTruthy();
        expect(getByText('About')).toBeTruthy();
        
        // Verify theme options are present
        expect(getByText('System')).toBeTruthy();
        expect(getByText('Light')).toBeTruthy();
        expect(getByText('Dark')).toBeTruthy();
      });
      
      // Verify bottom navigation is still present
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });

    it('ensures bottom navigation is visible on all screens', async () => {
      const {getByTestId} = render(<App />);
      
      // Check navigation is present on HomeScreen
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
      
      // Navigate to Settings and check navigation is still present
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByTestId('tab-home-tab')).toBeTruthy();
        expect(getByTestId('tab-settings-tab')).toBeTruthy();
      });
      
      // Navigate back to Home and check navigation is still present
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        expect(getByTestId('tab-home-tab')).toBeTruthy();
        expect(getByTestId('tab-settings-tab')).toBeTruthy();
      });
    });
  });

  describe('Complete Navigation Flow', () => {
    it('performs full navigation cycle and verifies screen changes', async () => {
      const {getByText, getByTestId, queryByText} = render(<App />);
      
      // Start on HomeScreen
      expect(getByText('Welcome to Your App')).toBeTruthy();
      expect(queryByText('Appearance')).toBeNull(); // Settings content should not be visible
      
      // Navigate to Settings
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
        expect(queryByText('Welcome to Your App')).toBeNull(); // Home content should not be visible
      });
      
      // Navigate back to Home
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        expect(getByText('Welcome to Your App')).toBeTruthy();
        expect(queryByText('Appearance')).toBeNull(); // Settings content should not be visible
      });
    });

    it('handles rapid navigation changes without errors', async () => {
      const {getByTestId} = render(<App />);
      
      const homeTab = getByTestId('tab-home-tab');
      const settingsTab = getByTestId('tab-settings-tab');
      
      // Perform rapid navigation changes
      for (let i = 0; i < 5; i++) {
        fireEvent.press(settingsTab);
        fireEvent.press(homeTab);
      }
      
      // App should still be functional
      await waitFor(() => {
        expect(getByTestId('tab-home-tab')).toBeTruthy();
        expect(getByTestId('tab-settings-tab')).toBeTruthy();
      });
    });

    it('maintains navigation state correctly during screen transitions', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Verify initial state
      expect(getByText('Welcome to Your App')).toBeTruthy();
      
      // Navigate and verify state change
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Navigate back and verify state restoration
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        expect(getByText('Welcome to Your App')).toBeTruthy();
      });
    });
  });

  describe('Navigation Functionality', () => {
    it('calls navigation handlers correctly for all tabs', () => {
      const {getByTestId} = render(<App />);
      
      // Both tabs should be pressable without errors
      expect(() => {
        fireEvent.press(getByTestId('tab-home-tab'));
        fireEvent.press(getByTestId('tab-settings-tab'));
      }).not.toThrow();
    });

    it('provides correct accessibility attributes for navigation', () => {
      const {getByTestId} = render(<App />);
      
      const homeTab = getByTestId('tab-home-tab');
      const settingsTab = getByTestId('tab-settings-tab');
      
      // Tabs should have accessibility properties
      expect(homeTab).toBeTruthy();
      expect(settingsTab).toBeTruthy();
      
      // Should be pressable
      expect(homeTab.props.accessible).toBe(true);
      expect(settingsTab.props.accessible).toBe(true);
    });

    it('maintains consistent tab labels and icons across navigation', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Check initial tab state
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('🏠')).toBeTruthy();
      expect(getByText('⚙️')).toBeTruthy();
      
      // Navigate to settings
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        // Labels and icons should remain consistent
        expect(getByText('Home')).toBeTruthy();
        expect(getByText('🏠')).toBeTruthy();
        expect(getByText('⚙️')).toBeTruthy();
        
        // Use testID to verify settings tab is still present
        expect(getByTestId('tab-settings-tab')).toBeTruthy();
      });
    });
  });

  describe('Screen State Persistence', () => {
    it('maintains theme state across all screen navigations', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Navigate to settings and change theme
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Change to dark theme
      fireEvent.press(getByText('Dark'));
      
      await waitFor(() => {
        expect(getByText('DARK MODE')).toBeTruthy();
      });
      
      // Navigate to home and back to settings - theme should persist
      fireEvent.press(getByTestId('tab-home-tab'));
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('DARK MODE')).toBeTruthy();
      });
    });

    it('ensures screens maintain their content integrity during navigation', async () => {
      const {getByText, getByTestId, queryByText} = render(<App />);
      
      // Navigate between screens multiple times
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
        expect(getByText('Current Theme')).toBeTruthy();
        expect(getByText('About')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        expect(getByText('Welcome to Your App')).toBeTruthy();
        expect(getByText('This is your home screen. Start building your app from here!')).toBeTruthy();
        
        // Settings content should not bleed through
        expect(queryByText('Appearance')).toBeNull();
      });
    });
  });

  describe('Error Resilience', () => {
    it('handles navigation errors gracefully', () => {
      const {getByTestId} = render(<App />);
      
      // App should handle navigation without throwing
      expect(() => {
        fireEvent.press(getByTestId('tab-settings-tab'));
        fireEvent.press(getByTestId('tab-home-tab'));
        fireEvent.press(getByTestId('tab-settings-tab'));
      }).not.toThrow();
    });

    it('maintains app stability during stress navigation', async () => {
      const {getByTestId, getByText} = render(<App />);
      
      // Perform many rapid navigation operations
      const homeTab = getByTestId('tab-home-tab');
      const settingsTab = getByTestId('tab-settings-tab');
      
      for (let i = 0; i < 10; i++) {
        fireEvent.press(settingsTab);
        fireEvent.press(homeTab);
      }
      
      // App should still be responsive and functional
      await waitFor(() => {
        expect(getByText('Welcome to Your App')).toBeTruthy();
        expect(homeTab).toBeTruthy();
        expect(settingsTab).toBeTruthy();
      });
    });
  });

  describe('Complete App Integration', () => {
    it('verifies complete app functionality from startup to navigation', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // 1. App starts correctly
      expect(getByText('Welcome to Your App')).toBeTruthy();
      
      // 2. Navigation is present and functional
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
      
      // 3. Can navigate to settings and use functionality
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // 4. Can interact with settings (change theme)
      fireEvent.press(getByText('Light'));
      
      await waitFor(() => {
        expect(getByText('LIGHT MODE')).toBeTruthy();
      });
      
      // 5. Can navigate back to home
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        expect(getByText('Welcome to Your App')).toBeTruthy();
      });
      
      // 6. All functionality still works
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });
  });
}); 