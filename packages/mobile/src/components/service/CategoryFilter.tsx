/**
 * CategoryFilter - Reusable category filter component
 * 
 * Displays category chips for filtering services
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createServiceDetailStyles } from '../../shared/styles/ServiceDetailStyles';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  style?: any;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createServiceDetailStyles(theme);

  if (!categories || categories.length === 0) {
    return null;
  }

  const allCategories = ['All', ...categories];

  return (
    <View style={[styles.serviceSection, style]}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {allCategories.map((category, index) => {
          const isSelected = category === 'All' 
            ? selectedCategory === null 
            : selectedCategory === category;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.serviceMetric,
                isSelected && styles.badgePrimary,
                { marginRight: 8 }
              ]}
              onPress={() => onCategorySelect(category === 'All' ? null : category)}
            >
              <Text
                style={[
                  styles.serviceMetricText,
                  isSelected && styles.badgeText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryFilter;
