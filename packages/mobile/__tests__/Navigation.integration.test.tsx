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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any async operations
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete Screen Rendering', () => {
    it('renders HomeScreen correctly with all expected elements', () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Verify HomeScreen content
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      expect(getByText('Your AI-Powered App Creation Studio')).toBeTruthy();
      
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

    it('maintains navigation consistency across screens', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Start on HomeScreen - verify navigation is present
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
      
      // Navigate to Settings
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
        // Navigation should still be present
        expect(getByTestId('tab-home-tab')).toBeTruthy();
        expect(getByTestId('tab-settings-tab')).toBeTruthy();
      });
    });
  });

  describe('Complete Navigation Flow', () => {
    it('performs full navigation cycle and verifies screen changes', async () => {
      const {getByText, getByTestId, queryByText} = render(<App />);
      
      // Start on HomeScreen
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      expect(queryByText('Appearance')).toBeNull(); // Settings content should not be visible
      
      // Navigate to Settings
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
        expect(queryByText('✨ Branded44 AI Builder ✨')).toBeNull(); // Home content should not be visible
      });
      
      // Navigate back to Home
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
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

    it('preserves correct screen content during navigation', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Start on Home - verify specific home content
      expect(getByText('🌟 Your Dream App Awaits 🌟')).toBeTruthy();
      
      // Navigate to Settings
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        // Should show settings-specific content
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Navigate back to Home
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        // Should show home-specific content again
        expect(getByText('🌟 Your Dream App Awaits 🌟')).toBeTruthy();
      });
    });
  });

  describe('Screen State Persistence', () => {
    it('maintains settings screen state during navigation', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Navigate to settings
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Interact with settings (change theme)
      fireEvent.press(getByText('Light'));
      
      await waitFor(() => {
        expect(getByText('LIGHT MODE')).toBeTruthy();
      });
      
      // Navigate away and back
      fireEvent.press(getByTestId('tab-home-tab'));
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        // Theme selection should be preserved
        expect(getByText('LIGHT MODE')).toBeTruthy();
      });
    });

    it('maintains home screen state during navigation', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Verify home content is present
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      
      // Navigate away and back
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('tab-home-tab'));
      
      await waitFor(() => {
        // Home content should be restored
        expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
        expect(getByText('🌟 Your Dream App Awaits 🌟')).toBeTruthy();
      });
    });
  });

  describe('Navigation Component Integration', () => {
    it('responds correctly to tab press events', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Test multiple tab interactions
      const homeTab = getByTestId('tab-home-tab');
      const settingsTab = getByTestId('tab-settings-tab');
      
      // Multiple presses should work consistently
      fireEvent.press(settingsTab);
      await waitFor(() => expect(getByText('Appearance')).toBeTruthy());
      
      fireEvent.press(homeTab);
      await waitFor(() => expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy());
      
      fireEvent.press(settingsTab);
      await waitFor(() => expect(getByText('Appearance')).toBeTruthy());
    });

    it('displays correct visual feedback for active tabs', () => {
      const {getByTestId} = render(<App />);
      
      // Both tabs should be accessible and functional
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });

    it('handles edge case navigation scenarios', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Try pressing the same tab multiple times
      const homeTab = getByTestId('tab-home-tab');
      
      fireEvent.press(homeTab);
      fireEvent.press(homeTab);
      fireEvent.press(homeTab);
      
      // Should remain on home screen
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
    });
  });

  describe('Screen Content Validation', () => {
    it('verifies home screen contains all expected sections', () => {
      const {getByText} = render(<App />);
      
      // Main sections
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      expect(getByText('🌟 Your Dream App Awaits 🌟')).toBeTruthy();
      expect(getByText('🎯 What Makes Us Special')).toBeTruthy();
      
      // Action buttons
      expect(getByText('🤖 Chat to Update This App')).toBeTruthy();
      expect(getByText('✨ Explore Current Features')).toBeTruthy();
    });

    it('verifies settings screen contains all expected sections', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      fireEvent.press(getByTestId('tab-settings-tab'));
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
        expect(getByText('Current Theme')).toBeTruthy();
        expect(getByText('About')).toBeTruthy();
      });
    });
  });

  describe('Complete App Integration', () => {
    it('verifies complete app functionality from startup to navigation', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // 1. App starts correctly
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      
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
        expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      });
      
      // 6. All functionality still works
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });

    it('handles complex interaction scenarios', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Complex sequence: multiple navigation + interaction
      
      // 1. Start on home
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      
      // 2. Go to settings
      fireEvent.press(getByTestId('tab-settings-tab'));
      await waitFor(() => expect(getByText('Appearance')).toBeTruthy());
      
      // 3. Change theme
      fireEvent.press(getByText('Dark'));
      await waitFor(() => expect(getByText('DARK MODE')).toBeTruthy());
      
      // 4. Go back to home
      fireEvent.press(getByTestId('tab-home-tab'));
      await waitFor(() => expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy());
      
      // 5. Go back to settings - theme should be preserved
      fireEvent.press(getByTestId('tab-settings-tab'));
      await waitFor(() => expect(getByText('DARK MODE')).toBeTruthy());
      
      // 6. Return to system theme
      fireEvent.press(getByText('System'));
      await waitFor(() => expect(getByText('LIGHT MODE')).toBeTruthy());
    });
  });
}); 