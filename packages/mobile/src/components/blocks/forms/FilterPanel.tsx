/**
 * FilterPanel - Multi-Category Filtering Block Component
 * 
 * A comprehensive filtering interface with categories, ranges, dates,
 * and multi-select options. Optimized for AI agents.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Input } from '../../../../~/components/ui/input';
import { Switch } from '../../../../~/components/ui/switch';
import { Separator } from '../../../../~/components/ui/separator';
import { Text } from '../../../../~/components/ui/text';
import { Badge } from '../../../../~/components/ui/badge';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { cn } from '../../../lib/utils';
import { FilterConfig, SelectOption, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Filter, X, Check } from 'lucide-react-native';

/**
 * Props interface for FilterPanel component
 */
export interface FilterPanelProps {
  /**
   * Available filter configurations
   */
  filters: FilterConfig[];
  
  /**
   * Current filter values
   */
  values: Record<string, any>;
  
  /**
   * Callback when filters are applied
   */
  onApply: (filters: Record<string, any>) => void;
  
  /**
   * Callback when filters are cleared
   */
  onClear?: () => void;
  
  /**
   * Callback when individual filter changes
   */
  onChange?: (filterId: string, value: any) => void;
  
  /**
   * Current loading state
   */
  loading?: LoadingState;
  
  /**
   * Custom styling for the container
   */
  style?: any;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Test identifier for automated testing
   */
  testID?: string;
  
  /**
   * Whether to show filter summary
   */
  showSummary?: boolean;
  
  /**
   * Whether to show apply/clear buttons
   */
  showActions?: boolean;
  
  /**
   * Maximum number of expanded sections
   */
  maxExpanded?: number;
}

/**
 * FilterPanel Component
 * 
 * Provides comprehensive filtering capabilities with:
 * - Multiple filter types (select, range, date, search)
 * - Collapsible sections
 * - Filter summary and counts
 * - Apply/clear actions
 * 
 * @example
 * ```tsx
 * <FilterPanel
 *   filters={filterConfigurations}
 *   values={currentFilters}
 *   onApply={handleApplyFilters}
 *   onClear={handleClearFilters}
 *   showSummary={true}
 *   showActions={true}
 * />
 * ```
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onApply,
  onClear,
  onChange,
  loading = 'idle',
  style,
  className,
  testID = 'filter-panel',
  showSummary = true,
  showActions = true,
  maxExpanded = 3,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(filters.slice(0, maxExpanded).map(f => f.name))
  );
  const [localValues, setLocalValues] = useState<Record<string, any>>(values);

  const isLoading = loading === 'loading';

  /**
   * Updates local filter value
   */
  const updateFilter = (filterId: string, value: any) => {
    const newValues = { ...localValues, [filterId]: value };
    setLocalValues(newValues);
    onChange?.(filterId, value);
  };

  /**
   * Toggles section expansion
   */
  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  /**
   * Handles apply filters
   */
  const handleApply = () => {
    onApply(localValues);
  };

  /**
   * Handles clear filters
   */
  const handleClear = () => {
    const clearedValues: Record<string, any> = {};
    filters.forEach(filter => {
      clearedValues[filter.name] = filter.defaultValue;
    });
    setLocalValues(clearedValues);
    onClear?.();
  };

  /**
   * Gets active filter count
   */
  const getActiveFilterCount = (): number => {
    return Object.entries(localValues).filter(([key, value]) => {
      const filter = filters.find(f => f.name === key);
      if (!filter) return false;
      
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return value !== filter.defaultValue;
      return value !== filter.defaultValue;
    }).length;
  };

  /**
   * Renders different filter types
   */
  const renderFilterInput = (filter: FilterConfig) => {
    const value = localValues[filter.name] || filter.defaultValue;

    switch (filter.type) {
      case 'search':
        return (
          <Input
            value={value || ''}
            onChangeText={(text) => updateFilter(filter.name, text)}
            placeholder={`Search ${filter.label.toLowerCase()}...`}
            editable={!isLoading}
          />
        );

      case 'select':
        return (
          <View style={{ gap: SPACING.sm }}>
            {filter.options?.map((option) => (
              <Button
                key={option.value}
                variant={value === option.value ? "default" : "outline"}
                onPress={() => updateFilter(filter.name, option.value)}
                disabled={isLoading || option.disabled}
                style={{ justifyContent: 'flex-start' }}
              >
                <Text>{option.label}</Text>
                {option.description && (
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.neutral[500] }}>
                    {option.description}
                  </Text>
                )}
              </Button>
            ))}
          </View>
        );

      case 'multiselect':
        return (
          <View style={{ gap: SPACING.sm }}>
            {filter.options?.map((option) => {
              const isSelected = Array.isArray(value) && value.includes(option.value);
              return (
                <View key={option.value} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      updateFilter(filter.name, newValues);
                    }}
                    disabled={isLoading || option.disabled}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.base }}>{option.label}</Text>
                    {option.description && (
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                        {option.description}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );

      case 'range':
        const rangeValue = value || { min: filter.min || 0, max: filter.max || 100 };
        return (
          <View style={{ gap: SPACING.md }}>
            <View style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Label nativeID={`${filter.name}-min`}>Min</Label>
                <Input
                  aria-labelledby={`${filter.name}-min`}
                  value={rangeValue.min?.toString() || ''}
                  onChangeText={(text) => {
                    const numValue = parseInt(text) || filter.min || 0;
                    updateFilter(filter.name, { ...rangeValue, min: numValue });
                  }}
                  placeholder={filter.min?.toString() || '0'}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
              <Text style={{ color: COLORS.neutral[500] }}>to</Text>
              <View style={{ flex: 1 }}>
                <Label nativeID={`${filter.name}-max`}>Max</Label>
                <Input
                  aria-labelledby={`${filter.name}-max`}
                  value={rangeValue.max?.toString() || ''}
                  onChangeText={(text) => {
                    const numValue = parseInt(text) || filter.max || 100;
                    updateFilter(filter.name, { ...rangeValue, max: numValue });
                  }}
                  placeholder={filter.max?.toString() || '100'}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>
        );

      case 'date':
        return (
          <View style={{ gap: SPACING.md }}>
            <Input
              value={value || ''}
              onChangeText={(text) => updateFilter(filter.name, text)}
              placeholder="YYYY-MM-DD"
              editable={!isLoading}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const activeCount = getActiveFilterCount();

  return (
    <View
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('filter-panel', className)}
      testID={testID}
    >
      {/* Header with Summary */}
      {showSummary && (
        <Card style={{ marginBottom: SPACING.md }}>
          <CardHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Filter size={20} color={COLORS.primary[600]} />
                <CardTitle>Filters</CardTitle>
                {activeCount > 0 && (
                  <Badge variant="default">
                    <Text style={{ color: COLORS.white }}>{activeCount}</Text>
                  </Badge>
                )}
              </View>
              {activeCount > 0 && onClear && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleClear}
                  disabled={isLoading}
                >
                  <X size={16} color={COLORS.neutral[600]} />
                  <Text style={{ color: COLORS.neutral[600] }}>Clear All</Text>
                </Button>
              )}
            </View>
          </CardHeader>
        </Card>
      )}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Filter Sections */}
        {filters.map((filter, index) => {
          const isExpanded = expandedSections.has(filter.name);
          const hasValue = localValues[filter.name] !== undefined && 
                          localValues[filter.name] !== filter.defaultValue &&
                          (Array.isArray(localValues[filter.name]) ? localValues[filter.name].length > 0 : true);

          return (
            <Card key={filter.name} style={{ marginBottom: SPACING.md }}>
              <CardHeader>
                <Button
                  variant="ghost"
                  onPress={() => toggleSection(filter.name)}
                  style={{ 
                    justifyContent: 'space-between',
                    paddingHorizontal: 0,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    <Text style={{ 
                      fontSize: TYPOGRAPHY.fontSize.base, 
                      fontWeight: TYPOGRAPHY.fontWeight.semibold 
                    }}>
                      {filter.label}
                    </Text>
                    {hasValue && (
                      <Badge variant="secondary">
                        <Check size={12} color={COLORS.success[600]} />
                      </Badge>
                    )}
                  </View>
                  <Text style={{ 
                    fontSize: 18,
                    transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                    color: COLORS.neutral[500]
                  }}>
                    ▼
                  </Text>
                </Button>
              </CardHeader>

              {isExpanded && (
                <CardContent style={{ paddingTop: 0 }}>
                  {renderFilterInput(filter)}
                </CardContent>
              )}
            </Card>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      {showActions && (
        <View style={{ 
          padding: SPACING.md,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.neutral[200],
          gap: SPACING.md
        }}>
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            {onClear && activeCount > 0 && (
              <Button
                variant="outline"
                onPress={handleClear}
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                <Text>Clear</Text>
              </Button>
            )}
            
            <Button
              onPress={handleApply}
              style={{ flex: 1 }}
              disabled={isLoading}
            >
              <Text>
                {isLoading ? 'Applying...' : `Apply${activeCount > 0 ? ` (${activeCount})` : ''}`}
              </Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default FilterPanel;
