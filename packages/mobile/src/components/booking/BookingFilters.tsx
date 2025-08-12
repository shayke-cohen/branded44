/**
 * BookingFilters - Reusable booking filter component
 * 
 * Provides filter tabs for different booking states
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createBookingStyles } from '../../shared/styles/BookingStyles';
import type { BookingFilter } from '../../shared/hooks/useMyBookings';

interface BookingFiltersProps {
  activeFilter: BookingFilter;
  onFilterChange: (filter: BookingFilter) => void;
  stats: {
    total: number;
    upcoming: number;
    past: number;
    cancelled: number;
  };
  style?: any;
}

const FILTER_OPTIONS: Array<{
  key: BookingFilter;
  label: string;
  getCount: (stats: BookingFiltersProps['stats']) => number;
  icon: string;
}> = [
  {
    key: 'all',
    label: 'All',
    getCount: (stats) => stats.total,
    icon: '📋',
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    getCount: (stats) => stats.upcoming,
    icon: '📅',
  },
  {
    key: 'past',
    label: 'Past',
    getCount: (stats) => stats.past,
    icon: '✅',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    getCount: (stats) => stats.cancelled,
    icon: '❌',
  },
];

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  activeFilter,
  onFilterChange,
  stats,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createBookingStyles(theme);

  return (
    <View style={[styles.filterSection, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterOptions}
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.key;
          const count = option.getCount(stats);

          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterChip,
                isActive && styles.filterChipSelected,
              ]}
              onPress={() => onFilterChange(option.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextSelected,
                ]}
              >
                {option.icon} {option.label}
                {count > 0 && (
                  <Text style={{ fontSize: 10 }}> ({count})</Text>
                )}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default BookingFilters;
