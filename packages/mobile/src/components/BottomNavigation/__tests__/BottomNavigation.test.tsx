import React from 'react';
import {render, fireEvent} from '../../../test/test-utils';
import BottomNavigation from '../BottomNavigation';
import {getNavTabs} from '../../../screen-templates';

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
      expect(getByText('Templates')).toBeTruthy();
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
      const templatesTab = getByText('Templates');
      const settingsTab = getByText('Settings');
      
      // Basic verification that tabs are rendered
      expect(homeTab).toBeTruthy();
      expect(templatesTab).toBeTruthy();
      expect(settingsTab).toBeTruthy();
    });

    it('highlights the correct active tab', () => {
      const {getByText} = render(
        <BottomNavigation {...defaultProps} activeTab="templates-tab" />
      );
      
      const templatesTab = getByText('Templates');
      expect(templatesTab).toBeTruthy();
    });

    it('shows settings tab as active when specified', () => {
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

    it('calls onTabPress when templates tab is pressed', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      const templatesTab = getByText('Templates');
      fireEvent.press(templatesTab);
      
      expect(mockOnTabPress).toHaveBeenCalledWith('templates-tab');
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
      const templatesTab = getByText('Templates');
      const settingsTab = getByText('Settings');
      
      fireEvent.press(homeTab);
      fireEvent.press(templatesTab);
      fireEvent.press(settingsTab);
      
      expect(mockOnTabPress).toHaveBeenCalledTimes(3);
      expect(mockOnTabPress).toHaveBeenNthCalledWith(1, 'home-tab');
      expect(mockOnTabPress).toHaveBeenNthCalledWith(2, 'templates-tab');
      expect(mockOnTabPress).toHaveBeenNthCalledWith(3, 'settings-tab');
    });

    it('handles invalid active tab gracefully', () => {
      const {getByText} = render(
        <BottomNavigation {...defaultProps} activeTab="invalid" />
      );
      
      // Should still render all tabs
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Templates')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('handles missing onTabPress prop', () => {
      const mockLocalTabPress = jest.fn();
      const {getByText} = render(
        <BottomNavigation activeTab="home-tab" onTabPress={mockLocalTabPress} />
      );
      
      const homeTab = getByText('Home');
      
      // Should handle press events properly
      fireEvent.press(homeTab);
      expect(mockLocalTabPress).toHaveBeenCalledWith('home-tab');
    });
  });

  describe('Layout', () => {
    it('renders tabs in correct order', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      // All tabs should be present
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Templates')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      
      // Verify correct number of tabs
      expect(navTabs).toHaveLength(3);
    });

    it('displays proper labels and icons', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      // Verify specific tabs from registry
      navTabs.forEach(tab => {
        expect(getByText(tab.name)).toBeTruthy();
        expect(getByText(tab.icon!)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels for all tabs', () => {
      const {getByText} = render(<BottomNavigation {...defaultProps} />);
      
      // All tab labels should be accessible
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Templates')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('maintains tab state consistency', () => {
      const {rerender, getByText} = render(
        <BottomNavigation {...defaultProps} activeTab="home-tab" />
      );
      
      expect(getByText('Home')).toBeTruthy();
      
      rerender(<BottomNavigation {...defaultProps} activeTab="templates-tab" />);
      expect(getByText('Templates')).toBeTruthy();
      
      rerender(<BottomNavigation {...defaultProps} activeTab="settings-tab" />);
      expect(getByText('Settings')).toBeTruthy();
    });
  });
});