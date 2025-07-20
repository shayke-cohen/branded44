import React from 'react';
import {useColorScheme, View, Text, TouchableOpacity} from 'react-native';
import {render, fireEvent, act} from '../../test/test-utils';
import {ThemeProvider, useTheme} from '../ThemeContext';

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme');
const mockedUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

// Test component to access theme context
const TestComponent = () => {
  const {theme, themeMode, setThemeMode, isDark} = useTheme();
  
  return (
    <View>
      <Text testID="theme-mode">{themeMode}</Text>
      <Text testID="is-dark">{isDark.toString()}</Text>
      <Text testID="primary-color">{theme.colors.primary}</Text>
      <TouchableOpacity 
        testID="set-light" 
        onPress={() => setThemeMode('light')}
      >
        <Text>Set Light</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        testID="set-dark" 
        onPress={() => setThemeMode('dark')}
      >
        <Text>Set Dark</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        testID="set-system" 
        onPress={() => setThemeMode('system')}
      >
        <Text>Set System</Text>
      </TouchableOpacity>
    </View>
  );
};

const renderWithProvider = (systemScheme: 'light' | 'dark' = 'light') => {
  mockedUseColorScheme.mockReturnValue(systemScheme);
  
  return render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with system theme mode', () => {
      const {getByTestId} = renderWithProvider('light');
      expect(getByTestId('theme-mode')).toHaveTextContent('system');
    });

    it('uses light theme when system is light', () => {
      const {getByTestId} = renderWithProvider('light');
      expect(getByTestId('is-dark')).toHaveTextContent('false');
      expect(getByTestId('primary-color')).toHaveTextContent('#007AFF');
    });

    it('uses dark theme when system is dark', () => {
      const {getByTestId} = renderWithProvider('dark');
      expect(getByTestId('is-dark')).toHaveTextContent('true');
      expect(getByTestId('primary-color')).toHaveTextContent('#0A84FF');
    });
  });

  describe('Theme Mode Changes', () => {
    it('switches to light theme when set explicitly', () => {
      const {getByTestId} = renderWithProvider('dark'); // System is dark
      
      act(() => {
        fireEvent.press(getByTestId('set-light'));
      });
      
      expect(getByTestId('theme-mode')).toHaveTextContent('light');
      expect(getByTestId('is-dark')).toHaveTextContent('false');
      expect(getByTestId('primary-color')).toHaveTextContent('#007AFF');
    });

    it('switches to dark theme when set explicitly', () => {
      const {getByTestId} = renderWithProvider('light'); // System is light
      
      act(() => {
        fireEvent.press(getByTestId('set-dark'));
      });
      
      expect(getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(getByTestId('is-dark')).toHaveTextContent('true');
      expect(getByTestId('primary-color')).toHaveTextContent('#0A84FF');
    });

    it('switches back to system theme', () => {
      const {getByTestId} = renderWithProvider('light');
      
      // First set to dark
      act(() => {
        fireEvent.press(getByTestId('set-dark'));
      });
      
      expect(getByTestId('theme-mode')).toHaveTextContent('dark');
      
      // Then back to system
      act(() => {
        fireEvent.press(getByTestId('set-system'));
      });
      
      expect(getByTestId('theme-mode')).toHaveTextContent('system');
      expect(getByTestId('is-dark')).toHaveTextContent('false'); // System is light
    });
  });

  describe('System Theme Following', () => {
    it('follows system theme when in system mode', () => {
      // Start with light system
      const {getByTestId, rerender} = renderWithProvider('light');
      
      expect(getByTestId('theme-mode')).toHaveTextContent('system');
      expect(getByTestId('is-dark')).toHaveTextContent('false');
      
      // Change system to dark
      mockedUseColorScheme.mockReturnValue('dark');
      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('ignores system changes when not in system mode', () => {
      const {getByTestId, rerender} = renderWithProvider('light');
      
      // Set to explicit dark mode
      act(() => {
        fireEvent.press(getByTestId('set-dark'));
      });
      
      expect(getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(getByTestId('is-dark')).toHaveTextContent('true');
      
      // Change system to light (should be ignored)
      mockedUseColorScheme.mockReturnValue('light');
      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Should still be dark because we're in explicit dark mode
      expect(getByTestId('is-dark')).toHaveTextContent('true');
    });
  });

  describe('Theme Colors', () => {
    it('provides correct light theme colors', () => {
      const {getByTestId} = renderWithProvider('light');
      
      act(() => {
        fireEvent.press(getByTestId('set-light'));
      });
      
      expect(getByTestId('primary-color')).toHaveTextContent('#007AFF');
    });

    it('provides correct dark theme colors', () => {
      const {getByTestId} = renderWithProvider('light');
      
      act(() => {
        fireEvent.press(getByTestId('set-dark'));
      });
      
      expect(getByTestId('primary-color')).toHaveTextContent('#0A84FF');
    });
  });

  describe('Error Handling', () => {
    it('provides theme context correctly', () => {
      // Test that the hook works correctly when used within a provider
      const {getByTestId} = renderWithProvider('light');
      expect(getByTestId('theme-mode')).toHaveTextContent('system');
      expect(getByTestId('primary-color')).toHaveTextContent('#007AFF');
    });
  });

  describe('Provider Functionality', () => {
    it('provides theme context to nested components', () => {
      const NestedComponent = () => {
        const {theme} = useTheme();
        return <Text testID="nested-primary">{theme.colors.primary}</Text>;
      };
      
      const {getByTestId} = render(
        <ThemeProvider>
          <View>
            <NestedComponent />
          </View>
        </ThemeProvider>
      );
      
      expect(getByTestId('nested-primary')).toHaveTextContent('#007AFF');
    });

    it('maintains theme state across re-renders', () => {
      const {getByTestId, rerender} = renderWithProvider('light');
      
      // Set to dark theme
      act(() => {
        fireEvent.press(getByTestId('set-dark'));
      });
      
      expect(getByTestId('theme-mode')).toHaveTextContent('dark');
      
      // Re-render the same provider instance
      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Should maintain dark theme (same provider instance)
      expect(getByTestId('theme-mode')).toHaveTextContent('dark');
    });
  });
});