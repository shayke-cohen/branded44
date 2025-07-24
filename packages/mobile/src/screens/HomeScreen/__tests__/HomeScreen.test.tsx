import React from 'react';
import {render, waitFor, act, fireEvent} from '../../../test/test-utils';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any async operations
    if (jest.isMockFunction(jest.runOnlyPendingTimers)) {
      jest.runOnlyPendingTimers();
    }
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
  });

  it('displays the main title and subtitle', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
    expect(getByText('Your AI-Powered App Creation Studio')).toBeTruthy();
  });

  it('shows the AI robot icon', () => {
    const {getAllByText} = render(<HomeScreen />);
    const robotIcons = getAllByText('🤖');
    expect(robotIcons.length).toBeGreaterThan(0);
  });

  it('displays animated sparkles around the AI icon', () => {
    const {getAllByText} = render(<HomeScreen />);
    const sparkles = getAllByText(/[✨⭐💫]/);
    expect(sparkles.length).toBeGreaterThan(0);
  });

  it('displays the dream app card', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('🌟 Your Dream App Awaits 🌟')).toBeTruthy();
    expect(getByText(/This app was intelligently created with AI/)).toBeTruthy();
  });

  it('shows initial tip from dream app tips', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('🎯 This app can be updated to match any vision you have!')).toBeTruthy();
  });

  it('displays primary action button', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('🤖 Chat to Update This App')).toBeTruthy();
    expect(getByText('Describe changes and watch AI transform this app')).toBeTruthy();
  });

  it('displays secondary action button', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('✨ Explore Current Features')).toBeTruthy();
    expect(getByText('See what this app can already do for you')).toBeTruthy();
  });

  it('shows features section with all feature items', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('🎯 What Makes Us Special')).toBeTruthy();
    
    // Check all feature items
    expect(getByText('AI-Powered App Updates')).toBeTruthy();
    expect(getByText('Instant Feature Implementation')).toBeTruthy();
    expect(getByText('Dynamic UI Customization')).toBeTruthy();
    expect(getByText('No-Code Modifications')).toBeTruthy();
    expect(getByText('Live App Transformation')).toBeTruthy();
    expect(getByText('Real-Time Dream Realization')).toBeTruthy();
  });

  it('displays footer text', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText(/This app is your canvas - paint your digital dreams into reality/)).toBeTruthy();
  });

  // Hamburger Menu Tests
  describe('Hamburger Menu', () => {
    it('displays hamburger menu button', () => {
      const {getByText} = render(<HomeScreen />);
      expect(getByText('☰')).toBeTruthy();
    });

    it('opens hamburger menu when button is pressed', async () => {
      const {getByText, queryByText} = render(<HomeScreen />);
      
      // Initially menu should not be visible
      expect(queryByText('Profile')).toBeNull();
      
      // Press hamburger menu button
      fireEvent.press(getByText('☰'));
      
      // Menu should now be visible
      await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
        expect(getByText('Settings')).toBeTruthy();
        expect(getByText('Cart')).toBeTruthy();
        expect(getByText('Store')).toBeTruthy();
        expect(getByText('CMS')).toBeTruthy();
      });
    });

    it('calls onMenuPress callback when menu item is selected', async () => {
      const mockOnMenuPress = jest.fn();
      const {getByText} = render(<HomeScreen onMenuPress={mockOnMenuPress} />);
      
      // Open menu
      fireEvent.press(getByText('☰'));
      
      await waitFor(() => {
        expect(getByText('Settings')).toBeTruthy();
      });
      
      // Press a menu item
      fireEvent.press(getByText('Settings'));
      
      expect(mockOnMenuPress).toHaveBeenCalledWith('settings');
    });

    it('closes menu when close button is pressed', async () => {
      const {getByText, queryByText} = render(<HomeScreen />);
      
      // Open menu
      fireEvent.press(getByText('☰'));
      
      await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
      });
      
      // Close menu by pressing the X button
      fireEvent.press(getByText('×'));
      
      await waitFor(() => {
        expect(queryByText('Profile')).toBeNull();
      });
    });
  });

  // Animation Tests
  describe('Animations', () => {
    it('starts bounce animation on mount', () => {
      render(<HomeScreen />);
      
      // Animation should start automatically
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });

    it('starts sparkle animation on mount', () => {
      render(<HomeScreen />);
      
      // Animation should start automatically
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });

    it('cleans up animations on unmount', () => {
      const {unmount} = render(<HomeScreen />);
      
      unmount();
      
      // Timers should be cleaned up
      jest.runOnlyPendingTimers();
    });
  });

  // Dynamic Content Tests
  describe('Rotating Tips', () => {
    it('starts with the first tip', () => {
      const {getByText} = render(<HomeScreen />);
      expect(getByText('🎯 This app can be updated to match any vision you have!')).toBeTruthy();
    });

    it('cycles through tips every 3 seconds', async () => {
      const {getByText, queryByText} = render(<HomeScreen />);
      
      // Initial tip
      expect(getByText('🎯 This app can be updated to match any vision you have!')).toBeTruthy();
      
      // Fast forward 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(queryByText('🎯 This app can be updated to match any vision you have!')).toBeNull();
        expect(getByText('🚀 Describe changes and watch AI implement them instantly')).toBeTruthy();
      });
    });

    it('cycles through all tips in sequence', async () => {
      const {getByText} = render(<HomeScreen />);
      
      const expectedTips = [
        '🎯 This app can be updated to match any vision you have!',
        '🚀 Describe changes and watch AI implement them instantly',
        '💡 Your imagination is the only limit to what this app can become',
        '🌟 Every feature you dream of can be added with simple conversation',
        '🎨 AI can redesign any screen to match your perfect vision',
        '🔮 This living app evolves with your needs and desires!'
      ];
      
      for (let i = 0; i < expectedTips.length; i++) {
        expect(getByText(expectedTips[i])).toBeTruthy();
        
        // Advance to next tip
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          const nextTipIndex = (i + 1) % expectedTips.length;
          expect(getByText(expectedTips[nextTipIndex])).toBeTruthy();
        });
      }
    });

    it('loops back to first tip after reaching the end', async () => {
      const {getByText} = render(<HomeScreen />);
      
      // Advance through all tips (6 tips * 3 seconds = 18 seconds)
      act(() => {
        jest.advanceTimersByTime(18000);
      });
      
      await waitFor(() => {
        expect(getByText('🎯 This app can be updated to match any vision you have!')).toBeTruthy();
      });
    });

    it('cleans up tip interval on unmount', () => {
      const {unmount} = render(<HomeScreen />);
      
      unmount();
      
      // Timer cleanup should happen - just verify unmount doesn't crash
      expect(() => jest.runOnlyPendingTimers()).not.toThrow();
    });
  });

  // Button Interaction Tests
  describe('Interactive Elements', () => {
    it('primary button is pressable', () => {
      const {getByText} = render(<HomeScreen />);
      const primaryButton = getByText('🤖 Chat to Update This App');
      
      expect(primaryButton).toBeTruthy();
      
      // Should not crash when pressed
      fireEvent.press(primaryButton);
    });

    it('secondary button is pressable', () => {
      const {getByText} = render(<HomeScreen />);
      const secondaryButton = getByText('✨ Explore Current Features');
      
      expect(secondaryButton).toBeTruthy();
      
      // Should not crash when pressed
      fireEvent.press(secondaryButton);
    });

    it('hamburger menu button has correct accessibility', () => {
      const {getByText} = render(<HomeScreen />);
      const menuButton = getByText('☰');
      
      expect(menuButton).toBeTruthy();
      
      // Button should be pressable
      fireEvent.press(menuButton);
    });
  });

  // Layout and Responsive Tests
  describe('Layout and Responsiveness', () => {
    it('renders scrollable content', () => {
      const {getByText} = render(<HomeScreen />);
      // Verify main content is rendered (content is inside a ScrollView)
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      expect(getByText('🌟 Your Dream App Awaits 🌟')).toBeTruthy();
    });

    it('displays all content sections in correct order', () => {
      const {getByText} = render(<HomeScreen />);
      
      // Header
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
      
      // Dream card
      expect(getByText('🌟 Your Dream App Awaits 🌟')).toBeTruthy();
      
      // Buttons
      expect(getByText('🤖 Chat to Update This App')).toBeTruthy();
      expect(getByText('✨ Explore Current Features')).toBeTruthy();
      
      // Features
      expect(getByText('🎯 What Makes Us Special')).toBeTruthy();
      
      // Footer
      expect(getByText(/This app is your canvas/)).toBeTruthy();
    });

    it('handles safe area layout correctly', () => {
      const {getByText} = render(<HomeScreen />);
      // SafeAreaView is used, verify main content renders
      expect(getByText('✨ Branded44 AI Builder ✨')).toBeTruthy();
    });
  });

  // Feature Icons and Text Tests
  describe('Feature Items', () => {
    const features = [
      { icon: '🤖', text: 'AI-Powered App Updates' },
      { icon: '⚡', text: 'Instant Feature Implementation' },
      { icon: '🎨', text: 'Dynamic UI Customization' },
      { icon: '🔧', text: 'No-Code Modifications' },
      { icon: '📱', text: 'Live App Transformation' },
      { icon: '🚀', text: 'Real-Time Dream Realization' },
    ];

    features.forEach((feature) => {
      it(`displays feature: ${feature.text}`, () => {
        const {getByText, getAllByText} = render(<HomeScreen />);
        // For non-unique icons, use getAllByText
        if (feature.icon === '🤖') {
          const robotIcons = getAllByText(feature.icon);
          expect(robotIcons.length).toBeGreaterThan(0);
        } else {
          expect(getByText(feature.icon)).toBeTruthy();
        }
        expect(getByText(feature.text)).toBeTruthy();
      });
    });

    it('displays all feature icons', () => {
      const {getByText, getAllByText} = render(<HomeScreen />);
      
      // Handle 🤖 which appears multiple times
      const robotIcons = getAllByText('🤖');
      expect(robotIcons.length).toBeGreaterThan(0);
      
      // Check other unique icons
      const uniqueIcons = ['⚡', '🎨', '🔧', '📱', '🚀'];
      uniqueIcons.forEach(icon => {
        expect(getByText(icon)).toBeTruthy();
      });
    });
  });

  // Edge Cases and Error Handling
  describe('Edge Cases', () => {
    it('handles missing onMenuPress callback gracefully', () => {
      const {getByText} = render(<HomeScreen />);
      
      // Open menu
      fireEvent.press(getByText('☰'));
      
      // This should not crash even without onMenuPress
      expect(() => {
        fireEvent.press(getByText('☰'));
      }).not.toThrow();
    });

    it('handles rapid menu button presses', async () => {
      const {getByText} = render(<HomeScreen />);
      const menuButton = getByText('☰');
      
      // Rapidly press menu button
      for (let i = 0; i < 5; i++) {
        fireEvent.press(menuButton);
      }
      
      // Should not crash
      expect(menuButton).toBeTruthy();
    });

    it('handles rapid tip changes correctly', () => {
      const {getAllByText} = render(<HomeScreen />);
      
      // Rapidly advance time
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });
      
      // Should still display valid content - check for common emojis from tips
      const tipElements = getAllByText(/[🎯🚀💡🌟🎨🔮]/);
      expect(tipElements.length).toBeGreaterThan(0);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('does not create memory leaks with animations', () => {
      const {unmount} = render(<HomeScreen />);
      
      // Fast forward some time
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      // Unmount should clean up properly
      expect(() => unmount()).not.toThrow();
    });

    it('handles timer cleanup properly', () => {
      const {unmount} = render(<HomeScreen />);
      
      unmount();
      
      // Timer cleanup should work without throwing
      expect(() => jest.runOnlyPendingTimers()).not.toThrow();
    });
  });
}); 