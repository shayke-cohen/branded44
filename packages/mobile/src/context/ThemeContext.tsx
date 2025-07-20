import React, {createContext, useContext, useState} from 'react';
import {useColorScheme} from 'react-native';
import {Theme, ThemeMode, ThemeContextType} from '../types';

const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: '#f5f5f5',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#FF3B30',
    success: '#34C759',
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#007AFF',
    tabBarInactive: '#8E8E93',
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#30D158',
    tabBarBackground: '#1C1C1E',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#8E8E93',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{theme, themeMode, setThemeMode, isDark}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};