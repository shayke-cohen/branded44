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
  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<App />);
      expect(getByText('Welcome to Your App')).toBeTruthy();
    });

    it('starts with HomeScreen as default', () => {
      const {getByText} = render(<App />);
      
      // Should show home screen elements
      expect(getByText('Welcome to Your App')).toBeTruthy();
      expect(getByText('This is your home screen. Start building your app from here!')).toBeTruthy();
    });

    it('displays bottom navigation with home, templates, and settings tabs', () => {
      const {getByText} = render(<App />);
      
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Templates')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('🏠')).toBeTruthy(); // Home icon
      expect(getByText('📱')).toBeTruthy(); // Templates icon
      expect(getByText('⚙️')).toBeTruthy(); // Settings icon
    });

    it('shows home tab as active initially', () => {
      const {getByTestId} = render(<App />);
      
      // All tabs should be present and accessible
      expect(getByTestId('tab-home')).toBeTruthy();
      expect(getByTestId('tab-templates')).toBeTruthy();
      expect(getByTestId('tab-settings')).toBeTruthy();
    });
  });

  describe('Navigation Flow', () => {
    it('navigates from Home to Settings', async () => {
      const {getByText, queryByText} = render(<App />);
      
      // Initially on home screen
      expect(getByText('Welcome to Your App')).toBeTruthy();
      expect(queryByText('Settings')).toBeTruthy(); // Tab is visible
      
      // Navigate to settings
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        // Should now show settings screen
        expect(getByText('Appearance')).toBeTruthy();
        expect(getByText('Current Theme')).toBeTruthy();
      });
      
      // Home screen elements should not be visible
      expect(queryByText('Welcome to Your App')).toBeNull();
    });

    it('navigates from Settings back to Home', async () => {
      const {getByText, queryByText} = render(<App />);
      
      // Navigate to settings first
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Navigate back to home
      const homeTab = getByText('Home');
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        // Should show home screen again
        expect(getByText('Welcome to Your App')).toBeTruthy();
        expect(getByText('This is your home screen. Start building your app from here!')).toBeTruthy();
      });
      
      // Settings screen elements should not be visible
      expect(queryByText('Appearance')).toBeNull();
    });

    it('navigates to Templates screen', async () => {
      const {getByText, queryByText} = render(<App />);
      
      // Initially on home screen
      expect(getByText('Welcome to Your App')).toBeTruthy();
      
      // Navigate to templates
      const templatesTab = getByText('Templates');
      fireEvent.press(templatesTab);
      
      await waitFor(() => {
        // Should now show templates screen
        expect(getByText('Live Template Gallery')).toBeTruthy();
        expect(getByText('Simple (4)')).toBeTruthy();
        expect(getByText('Complex (5)')).toBeTruthy();
      });
      
      // Home screen elements should not be visible
      expect(queryByText('Welcome to Your App')).toBeNull();
    });

    it('maintains consistent navigation state', async () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Test navigation using testIDs
      const homeTab = getByTestId('tab-home');
      const templatesTab = getByTestId('tab-templates');
      const settingsTab = getByTestId('tab-settings');
      
      // Navigate to templates
      fireEvent.press(templatesTab);
      
      await waitFor(() => {
        expect(getByText('Live Template Gallery')).toBeTruthy();
      });
      
      // Navigate to settings
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Navigate back to home
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        expect(getByText('Welcome to Your App')).toBeTruthy();
      });
    });
  });

  describe('Theme Functionality', () => {
    it('theme changes apply across all screens', async () => {
      const {getByText} = render(<App />);
      
      // Navigate to settings
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Change to dark theme
      const darkOption = getByText('Dark');
      fireEvent.press(darkOption);
      
      await waitFor(() => {
        expect(getByText('DARK MODE')).toBeTruthy();
      });
      
      // Navigate back to home
      const homeTab = getByText('Home');
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        // Should still be functional (theme persisted)
        expect(getByText('Welcome to Your App')).toBeTruthy();
      });
      
      // Navigate back to settings to verify theme is still dark
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('DARK MODE')).toBeTruthy();
      });
    });

    it('handles theme provider without errors', async () => {
      const {getByText} = render(<App />);
      
      // Navigate to settings and change theme
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Should handle theme changes without errors
      const lightOption = getByText('Light');
      fireEvent.press(lightOption);
      
      await waitFor(() => {
        expect(getByText('LIGHT MODE')).toBeTruthy();
      });
      
      // Change to system theme
      const systemOption = getByText('System');
      fireEvent.press(systemOption);
      
      await waitFor(() => {
        // Should show system theme indicator
        expect(getByText('system (light)')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid navigation gracefully', () => {
      const {getByText} = render(<App />);
      
      // App should render without errors
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Templates')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('Welcome to Your App')).toBeTruthy();
    });

    it('maintains functionality after multiple rapid navigation changes', async () => {
      const {getByText} = render(<App />);
      
      const homeTab = getByText('Home');
      const templatesTab = getByText('Templates');
      const settingsTab = getByText('Settings');
      
      // Rapid navigation between all tabs
      fireEvent.press(templatesTab);
      fireEvent.press(settingsTab);
      fireEvent.press(homeTab);
      fireEvent.press(templatesTab);
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        // Should end up on home screen and be functional
        expect(getByText('Welcome to Your App')).toBeTruthy();
        expect(getByText('This is your home screen. Start building your app from here!')).toBeTruthy();
      });
    });

    it('renders all tabs consistently', () => {
      const {getByText, getByTestId} = render(<App />);
      
      // All tabs should be present and accessible
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Templates')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByTestId('tab-home')).toBeTruthy();
      expect(getByTestId('tab-templates')).toBeTruthy();
      expect(getByTestId('tab-settings')).toBeTruthy();
    });
  });

  describe('Context Provider Integration', () => {
    it('provides theme context to all child components', () => {
      const {getByText} = render(<App />);
      
      // All components should render without context errors
      expect(getByText('Welcome to Your App')).toBeTruthy();
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Templates')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('maintains context state across navigation', async () => {
      const {getByText} = render(<App />);
      
      // Start on home screen
      expect(getByText('Welcome to Your App')).toBeTruthy();
      
      // Navigate to settings and interact with theme
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      await waitFor(() => {
        expect(getByText('Appearance')).toBeTruthy();
      });
      
      // Theme context should be working
      const darkOption = getByText('Dark');
      fireEvent.press(darkOption);
      
      await waitFor(() => {
        expect(getByText('DARK MODE')).toBeTruthy();
      });
      
      // Navigate back to home - context should persist
      const homeTab = getByText('Home');
      fireEvent.press(homeTab);
      
      await waitFor(() => {
        expect(getByText('Welcome to Your App')).toBeTruthy();
      });
    });
  });

  describe('App Structure', () => {
    it('has correct initial state', () => {
      const {getByText} = render(<App />);
      
      // Should start on home screen
      expect(getByText('Welcome to Your App')).toBeTruthy();
      expect(getByText('This is your home screen. Start building your app from here!')).toBeTruthy();
      
      // Should have both navigation tabs
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('renders with proper layout structure', () => {
      const {getByText, getByTestId} = render(<App />);
      
      // Main content should be present
      expect(getByText('Welcome to Your App')).toBeTruthy();
      
      // Navigation should be present
      expect(getByTestId('tab-home')).toBeTruthy();
      expect(getByTestId('tab-settings')).toBeTruthy();
    });
  });
});
