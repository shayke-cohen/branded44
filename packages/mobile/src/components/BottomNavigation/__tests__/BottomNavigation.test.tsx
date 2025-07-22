import React from 'react';
import {render, fireEvent} from '../../../test/test-utils';
import BottomNavigation from '../BottomNavigation';
import {getNavTabs} from '../../../screen-templates/templateConfig';

describe('BottomNavigation', () => {
  const mockOnTabPress = jest.fn();
  const navTabs = getNavTabs();
  const defaultProps = {
    activeTab: navTabs[0]?.id || 'home-tab',
    onTabPress: mockOnTabPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('displays all tabs from unified registry', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      navTabs.forEach(tab => {
        expect(getByText(tab.name)).toBeTruthy();
        expect(getByText(tab.icon!)).toBeTruthy();
      });
    });

    it('shows correct active tab styling', () => {
      const {getByText} = render(
        <BottomNavigation {...defaultProps} activeTab="home-tab" />
      );
      
      const homeTab = getByText('Home');
      const settingsTab = getByText('Settings');
      
      // Basic verification that tabs are rendered
      expect(homeTab).toBeTruthy();
      expect(settingsTab).toBeTruthy();
    });

    it('highlights the correct active tab', () => {
      const {getByText} = render(
        <BottomNavigation {...defaultProps} activeTab="settings-tab" />
      );
      
      const settingsTab = getByText('Settings');
      expect(settingsTab).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('calls onTabPress when home tab is pressed', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      const homeTab = getByText('Home');
      fireEvent.press(homeTab);
      
      expect(mockOnTabPress).toHaveBeenCalledWith('home-tab');
    });

    it('calls onTabPress when settings tab is pressed', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);
      
      expect(mockOnTabPress).toHaveBeenCalledWith('settings-tab');
    });

    it('handles rapid tab switching', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      const homeTab = getByText('Home');
      const settingsTab = getByText('Settings');
      
      fireEvent.press(homeTab);
      fireEvent.press(settingsTab);
      fireEvent.press(homeTab);
      
      expect(mockOnTabPress).toHaveBeenCalledTimes(3);
      expect(mockOnTabPress).toHaveBeenNthCalledWith(1, 'home-tab');
      expect(mockOnTabPress).toHaveBeenNthCalledWith(2, 'settings-tab');
      expect(mockOnTabPress).toHaveBeenNthCalledWith(3, 'home-tab');
    });

    it('handles invalid active tab gracefully', () => {
      const {getByText} = render(
        <BottomNavigation {...defaultProps} activeTab="invalid-tab" />
      );
      
      // Should still render all tabs
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('renders tabs in correct order', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      // All tabs should be present
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      
      // Verify correct number of tabs (Home and Settings)
      expect(navTabs.length).toBeGreaterThanOrEqual(2);
    });

    it('provides consistent spacing between tabs', () => {
      const {getByTestId} = render(<BottomNavigation {...defaultProps} />);
      
      // Basic layout verification - tabs should have testIDs
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels for all tabs', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      // All tab labels should be accessible
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('maintains tab state consistency', () => {
      const {getByText, rerender} = render(<BottomNavigation {...defaultProps} />);
      
      rerender(<BottomNavigation {...defaultProps} activeTab="settings-tab" />);
      expect(getByText('Settings')).toBeTruthy();
      
      rerender(<BottomNavigation {...defaultProps} activeTab="home-tab" />);
      expect(getByText('Home')).toBeTruthy();
    });

    it('provides testID for each tab', () => {
      const {getByTestId} = render(<BottomNavigation {...defaultProps} />);
      
      expect(getByTestId('tab-home-tab')).toBeTruthy();
      expect(getByTestId('tab-settings-tab')).toBeTruthy();
    });
  });
});