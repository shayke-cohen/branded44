/**
 * SortPanel - Sort Options with Direction Block Component
 * 
 * A comprehensive sorting interface with multiple sort fields and directions.
 * Optimized for AI agents and search/list components.
 * 
 * @author AI Component System  
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Text } from '../../../../~/components/ui/text';
import { Badge } from '../../../../~/components/ui/badge';
import { cn } from '../../../lib/utils';
import { SortConfig, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { ArrowUp, ArrowDown, SortAsc } from 'lucide-react-native';

export interface SortPanelProps {
  sortOptions: SortConfig[];
  currentSort?: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
  layout?: 'vertical' | 'horizontal';
  showIcons?: boolean;
}

export const SortPanel: React.FC<SortPanelProps> = ({
  sortOptions,
  currentSort,
  onSortChange,
  loading = 'idle',
  style,
  className,
  testID = 'sort-panel',
  layout = 'vertical',
  showIcons = true,
}) => {
  const isLoading = loading === 'loading';

  const renderSortOption = (option: SortConfig) => {
    const isActive = currentSort?.field === option.field && currentSort?.direction === option.direction;
    
    return (
      <Button
        key={`${option.field}-${option.direction}`}
        variant={isActive ? "default" : "outline"}
        onPress={() => onSortChange(option)}
        disabled={isLoading}
        style={{ 
          justifyContent: layout === 'horizontal' ? 'center' : 'space-between',
          flex: layout === 'horizontal' ? 1 : undefined,
        }}
      >
        <Text>{option.label}</Text>
        {showIcons && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
            {option.direction === 'asc' ? (
              <ArrowUp size={16} color={isActive ? COLORS.white : COLORS.neutral[600]} />
            ) : (
              <ArrowDown size={16} color={isActive ? COLORS.white : COLORS.neutral[600]} />
            )}
          </View>
        )}
      </Button>
    );
  };

  return (
    <View
      style={style}
      className={cn('sort-panel', className)}
      testID={testID}
    >
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <SortAsc size={20} color={COLORS.primary[600]} />
            <CardTitle>Sort By</CardTitle>
            {currentSort && (
              <Badge variant="secondary">
                <Text>{currentSort.label}</Text>
              </Badge>
            )}
          </View>
        </CardHeader>
        
        <CardContent>
          <View style={{ 
            flexDirection: layout === 'horizontal' ? 'row' : 'column',
            gap: SPACING.sm,
            flexWrap: layout === 'horizontal' ? 'wrap' : 'nowrap',
          }}>
            {sortOptions.map(renderSortOption)}
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default SortPanel;
