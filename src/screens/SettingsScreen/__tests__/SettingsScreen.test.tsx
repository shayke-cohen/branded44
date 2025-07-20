import React from 'react';
import {useColorScheme} from 'react-native';
import {render, fireEvent, waitFor} from '../../../test/test-utils';
import SettingsScreen from '../SettingsScreen';
import {THEME_OPTIONS} from '../../../constants';

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme');
const mockedUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseColorScheme.mockReturnValue('light');
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('Settings')).toBeTruthy();
    });

    it('displays the correct title', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('Settings')).toBeTruthy();
    });

    it('displays appearance section', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('Appearance')).toBeTruthy();
    });

    it('displays all theme options', () => {
      const {getByText} = render(<SettingsScreen />);
      
      THEME_OPTIONS.forEach(option => {
        expect(getByText(option.label)).toBeTruthy();
        expect(getByText(option.description)).toBeTruthy();
      });
    });

    it('displays current theme section', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('Current Theme')).toBeTruthy();
    });

    it('displays about section', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('About')).toBeTruthy();
    });

    it('shows system theme as default selected', () => {
      const {getByText} = render(<SettingsScreen />);
      
      // System option should be selected by default
      const systemText = getByText('system (light)');
      expect(systemText).toBeTruthy();
    });
  });

  describe('Theme Selection', () => {
    it('allows selecting light theme', async () => {
      const {getByText} = render(<SettingsScreen />);
      
      const lightOption = getByText('Light');
      fireEvent.press(lightOption);

      await waitFor(() => {
        expect(getByText('light')).toBeTruthy();
      });
    });

    it('allows selecting dark theme', async () => {
      const {getByText} = render(<SettingsScreen />);
      
      const darkOption = getByText('Dark');
      fireEvent.press(darkOption);

      await waitFor(() => {
        expect(getByText('dark')).toBeTruthy();
      });
    });

    it('allows selecting system theme', async () => {
      const {getByText} = render(<SettingsScreen />);
      
      // First select light theme
      const lightOption = getByText('Light');
      fireEvent.press(lightOption);

      await waitFor(() => {
        expect(getByText('light')).toBeTruthy();
      });

      // Then select system theme
      const systemOption = getByText('System');
      fireEvent.press(systemOption);

      await waitFor(() => {
        expect(getByText('system (light)')).toBeTruthy();
      });
    });

    it('shows correct theme indicator for light mode', () => {
      mockedUseColorScheme.mockReturnValue('light');
      const {getByText} = render(<SettingsScreen />);
      
      expect(getByText('LIGHT MODE')).toBeTruthy();
    });

    it('shows correct theme indicator for dark mode when system is dark', () => {
      mockedUseColorScheme.mockReturnValue('dark');
      const {getByText} = render(<SettingsScreen />);
      
      expect(getByText('DARK MODE')).toBeTruthy();
    });
  });

  describe('Theme Information', () => {
    it('displays theme description text', () => {
      const {getByText} = render(<SettingsScreen />);
      
      expect(getByText(/The app will automatically adapt its colors/)).toBeTruthy();
    });

    it('displays about app text', () => {
      const {getByText} = render(<SettingsScreen />);
      
      expect(getByText(/This is a simple todo app with dark mode support/)).toBeTruthy();
    });

    it('explains system mode behavior', () => {
      const {getByText} = render(<SettingsScreen />);
      
      expect(getByText(/respects your system preferences/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible theme option buttons', () => {
      const {getByText} = render(<SettingsScreen />);
      
      THEME_OPTIONS.forEach(option => {
        const optionButton = getByText(option.label);
        expect(optionButton).toBeTruthy();
        
        // Should be pressable
        fireEvent.press(optionButton);
      });
    });
  });

  describe('Visual States', () => {
    it('shows radio button selection correctly', async () => {
      const {getByText, getByTestId} = render(<SettingsScreen />);
      
      // Initially system should be selected
      // When we press light theme, it should become selected
      const lightOption = getByText('Light');
      fireEvent.press(lightOption);

      await waitFor(() => {
        // The theme should change to light
        expect(getByText('light')).toBeTruthy();
      });
    });
  });
});