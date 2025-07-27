import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Search filter option
 */
export interface SearchFilter {
  id: string;
  label: string;
  value: any;
  type: 'text' | 'select' | 'range' | 'date' | 'boolean';
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
}

/**
 * Search sort option
 */
export interface SearchSort {
  id: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Search form data
 */
export interface SearchFormData {
  query: string;
  filters: Record<string, any>;
  sort: SearchSort | null;
  category?: string;
}

/**
 * Properties for the SearchForm component
 */
export interface SearchFormProps extends BaseComponentProps {
  /** Callback when search is performed */
  onSearch: (data: SearchFormData) => void;
  /** Callback when search is cleared */
  onClear?: () => void;
  /** Initial search query */
  initialQuery?: string;
  /** Available filters */
  filters?: SearchFilter[];
  /** Available sort options */
  sortOptions?: SearchSort[];
  /** Available categories */
  categories?: { id: string; label: string }[];
  /** Show filters section */
  showFilters?: boolean;
  /** Show sort options */
  showSort?: boolean;
  /** Search placeholder text */
  placeholder?: string;
  /** Auto-search on typing (debounced) */
  autoSearch?: boolean;
  /** Debounce delay for auto-search */
  debounceMs?: number;
}

/**
 * SearchForm - AI-optimized search form component
 * 
 * A comprehensive search form with query input, filters, sorting,
 * and category selection. Perfect for content discovery.
 * 
 * @example
 * ```tsx
 * <SearchForm
 *   onSearch={(data) => handleSearch(data)}
 *   filters={[
 *     { id: 'price', label: 'Price Range', type: 'range', min: 0, max: 1000 },
 *     { id: 'category', label: 'Category', type: 'select', options: categories }
 *   ]}
 *   sortOptions={[
 *     { id: 'relevance', label: 'Relevance', field: 'score', direction: 'desc' },
 *     { id: 'date', label: 'Date', field: 'createdAt', direction: 'desc' }
 *   ]}
 *   autoSearch={true}
 * />
 * ```
 */
const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onClear,
  initialQuery = '',
  filters = [],
  sortOptions = [],
  categories = [],
  showFilters = true,
  showSort = true,
  placeholder = "Search...",
  autoSearch = false,
  debounceMs = 300,
  style,
  testID = 'search-form',
  ...props
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [selectedSort, setSelectedSort] = useState<SearchSort | null>(
    sortOptions.length > 0 ? sortOptions[0] : null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-search with debounce
  useEffect(() => {
    if (!autoSearch) return;

    const timeoutId = setTimeout(() => {
      if (query.trim() || Object.keys(selectedFilters).length > 0) {
        handleSearch();
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, selectedFilters, selectedSort, selectedCategory]);

  /**
   * Handles search execution
   */
  const handleSearch = () => {
    const searchData: SearchFormData = {
      query: query.trim(),
      filters: selectedFilters,
      sort: selectedSort,
      category: selectedCategory || undefined,
    };
    
    onSearch(searchData);
  };

  /**
   * Handles search clear
   */
  const handleClear = () => {
    setQuery('');
    setSelectedFilters({});
    setSelectedSort(sortOptions.length > 0 ? sortOptions[0] : null);
    setSelectedCategory('');
    setShowAdvanced(false);
    onClear?.();
  };

  /**
   * Updates filter value
   */
  const updateFilter = (filterId: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  /**
   * Renders filter input based on type
   */
  const renderFilter = (filter: SearchFilter) => {
    const value = selectedFilters[filter.id];

    switch (filter.type) {
      case 'select':
        return (
          <View key={filter.id} style={styles.filterContainer}>
            <Label style={styles.filterLabel}>{filter.label}</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    !value && styles.optionActive
                  ]}
                  onPress={() => updateFilter(filter.id, undefined)}
                >
                  <Text style={[
                    styles.optionText,
                    !value && styles.optionTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                {filter.options?.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      value === option.value && styles.optionActive
                    ]}
                    onPress={() => updateFilter(filter.id, option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      value === option.value && styles.optionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case 'boolean':
        return (
          <View key={filter.id} style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.booleanFilter,
                value && styles.booleanFilterActive
              ]}
              onPress={() => updateFilter(filter.id, !value)}
            >
              <Text style={[
                styles.booleanFilterText,
                value && styles.booleanFilterTextActive
              ]}>
                {value ? '✓' : '○'} {filter.label}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'text':
        return (
          <View key={filter.id} style={styles.filterContainer}>
            <Label style={styles.filterLabel}>{filter.label}</Label>
            <Input
              style={styles.filterInput}
              placeholder={`Enter ${filter.label.toLowerCase()}`}
              value={value || ''}
              onChangeText={(text) => updateFilter(filter.id, text)}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0 || selectedCategory;
  const hasAdvancedOptions = (showFilters && filters.length > 0) || (showSort && sortOptions.length > 0);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    card: {
      padding: SPACING.md,
      margin: SPACING.sm,
    },
    searchContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    searchInput: {
      flex: 1,
    },
    searchButton: {
      backgroundColor: COLORS.primary[600],
      paddingHorizontal: SPACING.lg,
    },
    clearButton: {
      backgroundColor: COLORS.neutral[400],
      paddingHorizontal: SPACING.md,
    },
    categoriesContainer: {
      marginBottom: SPACING.md,
    },
    categoriesLabel: {
      marginBottom: SPACING.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    categoriesScroll: {
      paddingVertical: SPACING.xs,
    },
    categoryOption: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      marginRight: SPACING.sm,
      borderRadius: 20,
      backgroundColor: COLORS.neutral[100],
      borderWidth: 1,
      borderColor: COLORS.neutral[200],
    },
    categoryOptionActive: {
      backgroundColor: COLORS.primary[600],
      borderColor: COLORS.primary[600],
    },
    categoryText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    categoryTextActive: {
      color: '#ffffff',
    },
    advancedToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.sm,
      marginBottom: SPACING.md,
    },
    advancedToggleText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary[600],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      marginRight: SPACING.xs,
    },
    advancedIcon: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary[600],
    },
    advancedSection: {
      borderTopWidth: 1,
      borderTopColor: COLORS.neutral[200],
      paddingTop: SPACING.md,
      marginTop: SPACING.md,
    },
    filtersSection: {
      marginBottom: SPACING.md,
    },
    filtersTitle: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.sm,
    },
    filterContainer: {
      marginBottom: SPACING.md,
    },
    filterLabel: {
      marginBottom: SPACING.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    filterInput: {
      backgroundColor: COLORS.neutral[50],
    },
    optionsRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    option: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 16,
      backgroundColor: COLORS.neutral[100],
      borderWidth: 1,
      borderColor: COLORS.neutral[200],
    },
    optionActive: {
      backgroundColor: COLORS.primary[600],
      borderColor: COLORS.primary[600],
    },
    optionText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    optionTextActive: {
      color: '#ffffff',
    },
    booleanFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      backgroundColor: COLORS.neutral[50],
      borderWidth: 1,
      borderColor: COLORS.neutral[200],
    },
    booleanFilterActive: {
      backgroundColor: COLORS.primary[50],
      borderColor: COLORS.primary[600],
    },
    booleanFilterText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    booleanFilterTextActive: {
      color: COLORS.primary[700],
    },
    sortSection: {
      marginBottom: SPACING.md,
    },
    sortTitle: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.neutral[900],
      marginBottom: SPACING.sm,
    },
    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    sortOption: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 16,
      backgroundColor: COLORS.neutral[100],
      borderWidth: 1,
      borderColor: COLORS.neutral[200],
    },
    sortOptionActive: {
      backgroundColor: COLORS.primary[600],
      borderColor: COLORS.primary[600],
    },
    sortText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    sortTextActive: {
      color: '#ffffff',
    },
    activeFiltersIndicator: {
      backgroundColor: COLORS.success[50],
      padding: SPACING.sm,
      borderRadius: 6,
      marginBottom: SPACING.md,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.success[600],
    },
    activeFiltersText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.success[700],
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      <Card style={styles.card}>
        {/* Main Search Input */}
        <View style={styles.searchContainer}>
          <Input
            style={styles.searchInput}
            placeholder={placeholder}
            value={query}
            onChangeText={setQuery}
            testID="search-input"
          />
          {!autoSearch && (
            <Button
              onPress={handleSearch}
              style={styles.searchButton}
              testID="search-button"
            >
              <Text>Search</Text>
            </Button>
          )}
          {(hasActiveFilters || query) && (
            <Button
              onPress={handleClear}
              style={styles.clearButton}
              testID="clear-button"
            >
              <Text>Clear</Text>
            </Button>
          )}
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <Label style={styles.categoriesLabel}>Categories</Label>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  !selectedCategory && styles.categoryOptionActive
                ]}
                onPress={() => setSelectedCategory('')}
              >
                <Text style={[
                  styles.categoryText,
                  !selectedCategory && styles.categoryTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category.id && styles.categoryOptionActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersIndicator}>
            <Text style={styles.activeFiltersText}>
              ✓ {Object.keys(selectedFilters).length + (selectedCategory ? 1 : 0)} filter(s) active
            </Text>
          </View>
        )}

        {/* Advanced Options Toggle */}
        {hasAdvancedOptions && (
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
            testID="advanced-toggle"
          >
            <Text style={styles.advancedToggleText}>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Text>
            <Text style={styles.advancedIcon}>
              {showAdvanced ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Advanced Section */}
        {showAdvanced && hasAdvancedOptions && (
          <View style={styles.advancedSection}>
            {/* Filters */}
            {showFilters && filters.length > 0 && (
              <View style={styles.filtersSection}>
                <Text style={styles.filtersTitle}>Filters</Text>
                {filters.map(renderFilter)}
              </View>
            )}

            {/* Sort Options */}
            {showSort && sortOptions.length > 0 && (
              <View style={styles.sortSection}>
                <Text style={styles.sortTitle}>Sort By</Text>
                <View style={styles.sortOptions}>
                  {sortOptions.map((sort) => (
                    <TouchableOpacity
                      key={sort.id}
                      style={[
                        styles.sortOption,
                        selectedSort?.id === sort.id && styles.sortOptionActive
                      ]}
                      onPress={() => setSelectedSort(sort)}
                    >
                      <Text style={[
                        styles.sortText,
                        selectedSort?.id === sort.id && styles.sortTextActive
                      ]}>
                        {sort.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </Card>
    </View>
  );
};

export default SearchForm; 