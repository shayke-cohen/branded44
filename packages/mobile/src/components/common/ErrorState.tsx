/**
 * ErrorState - Reusable error state component
 * 
 * Consistent error UI across all screens
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createProductListStyles } from '../../shared/styles/ProductListStyles';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  retryText = 'Try Again',
}) => {
  const { theme } = useTheme();
  const styles = createProductListStyles(theme);

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>{retryText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorState;
