/**
 * EmptyState - Reusable empty state component
 * 
 * Consistent empty state UI across all screens
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createProductListStyles } from '../../shared/styles/ProductListStyles';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
}) => {
  const { theme } = useTheme();
  const styles = createProductListStyles(theme);

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{title}</Text>
      {subtitle && (
        <Text style={styles.emptySubtext}>{subtitle}</Text>
      )}
    </View>
  );
};

export default EmptyState;
