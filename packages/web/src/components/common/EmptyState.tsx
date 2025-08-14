/**
 * EmptyState - Web-specific empty state component
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Items Found',
  subtitle = 'Try adjusting your search or filters'
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
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        📦
      </Text>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
      }}>
        {subtitle}
      </Text>
    </View>
  );
};

export default EmptyState;
