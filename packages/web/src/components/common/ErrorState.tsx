/**
 * ErrorState - Web-specific error state component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry
}) => {
  const { theme } = useTheme();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      minHeight: 200,
    }}>
      <Text style={{
        fontSize: 24,
        marginBottom: 16,
      }}>
        ⚠️
      </Text>
      <Text style={{
        fontSize: 16,
        color: theme.colors.error || '#F44336',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
      }}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={{
            height: 40,
            paddingHorizontal: 24,
            borderRadius: 8,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onPress={onRetry}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.background || '#FFFFFF',
          }}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;
