/**
 * LoadingState - Web-specific loading state component
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...'
}) => {
  const { theme } = useTheme();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      minHeight: 150,
    }}>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
      />
      <Text style={{
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
      }}>
        {message}
      </Text>
    </View>
  );
};

export default LoadingState;
