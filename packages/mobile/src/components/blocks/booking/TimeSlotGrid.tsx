/**
 * TimeSlotGrid Component - AI-Optimized React Native Component
 * 
 * A visual time slot selection grid for booking appointments.
 * Features intuitive time selection with availability indicators and pricing.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Time slot status
 */
export type TimeSlotStatus = 'available' | 'booked' | 'unavailable' | 'selected' | 'disabled';

/**
 * Grid layout options
 */
export type GridLayout = 'compact' | 'comfortable' | 'spacious';

/**
 * Time format options
 */
export type TimeFormat = '12h' | '24h';

/**
 * Individual time slot
 */
export interface TimeSlot {
  /** Slot unique identifier */
  id: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime: Date;
  /** Slot status */
  status: TimeSlotStatus;
  /** Slot price */
  price?: number;
  /** Currency code */
  currency?: string;
  /** Provider identifier */
  providerId?: string;
  /** Service identifier */
  serviceId?: string;
  /** Special pricing indicator */
  specialPricing?: boolean;
  /** Discount percentage */
  discount?: number;
  /** Slot notes */
  notes?: string;
  /** Duration in minutes */
  duration: number;
}

/**
 * Time range for filtering
 */
export interface TimeRange {
  /** Start hour (0-23) */
  startHour: number;
  /** End hour (0-23) */
  endHour: number;
  /** Days of week (0=Sunday, 6=Saturday) */
  daysOfWeek?: number[];
}

/**
 * Grid configuration
 */
export interface GridConfig {
  /** Number of columns */
  columns: number;
  /** Show time labels */
  showTimeLabels: boolean;
  /** Show price labels */
  showPricing: boolean;
  /** Show duration */
  showDuration: boolean;
  /** Time format */
  timeFormat: TimeFormat;
  /** Slot height */
  slotHeight: number;
  /** Slot spacing */
  spacing: number;
}

/**
 * Selected slot information
 */
export interface SelectedSlotInfo {
  /** Selected slot */
  slot: TimeSlot;
  /** Selection index for multiple selections */
  index: number;
  /** Total selected count */
  totalSelected: number;
}

/**
 * TimeSlotGrid component props
 */
export interface TimeSlotGridProps {
  /** Array of time slots to display */
  slots: TimeSlot[];
  /** Selected slot IDs */
  selectedSlotIds?: string[];
  /** Slot selection handler */
  onSlotSelect?: (slotInfo: SelectedSlotInfo) => void;
  /** Slot deselection handler */
  onSlotDeselect?: (slotInfo: SelectedSlotInfo) => void;
  /** Multiple selection handler */
  onMultipleSelect?: (slots: TimeSlot[]) => void;
  /** Allow multiple slot selection */
  allowMultipleSelection?: boolean;
  /** Maximum number of selectable slots */
  maxSelections?: number;
  /** Grid layout variant */
  layout?: GridLayout;
  /** Grid configuration */
  config?: Partial<GridConfig>;
  /** Time range filter */
  timeRange?: TimeRange;
  /** Whether to show unavailable slots */
  showUnavailable?: boolean;
  /** Custom slot colors */
  slotColors?: Partial<Record<TimeSlotStatus, string>>;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether grid is disabled */
  disabled?: boolean;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format time for display
 */
const formatTime = (date: Date, format: TimeFormat = '12h'): string => {
  if (format === '24h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

/**
 * Format duration
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get slot color based on status
 */
const getSlotColor = (status: TimeSlotStatus, customColors?: Partial<Record<TimeSlotStatus, string>>): string => {
  if (customColors && customColors[status]) {
    return customColors[status];
  }
  
  const defaultColors: Record<TimeSlotStatus, string> = {
    available: COLORS.white,
    booked: COLORS.error[100],
    unavailable: COLORS.gray[100],
    selected: COLORS.primary[500],
    disabled: COLORS.gray[50],
  };
  
  return defaultColors[status];
};

/**
 * Get slot border color
 */
const getSlotBorderColor = (status: TimeSlotStatus, customColors?: Partial<Record<TimeSlotStatus, string>>): string => {
  if (customColors && customColors[status]) {
    return customColors[status];
  }
  
  const borderColors: Record<TimeSlotStatus, string> = {
    available: COLORS.gray[300],
    booked: COLORS.error[300],
    unavailable: COLORS.gray[200],
    selected: COLORS.primary[500],
    disabled: COLORS.gray[200],
  };
  
  return borderColors[status];
};

/**
 * Get slot text color
 */
const getSlotTextColor = (status: TimeSlotStatus): string => {
  const textColors: Record<TimeSlotStatus, string> = {
    available: COLORS.gray[900],
    booked: COLORS.error[700],
    unavailable: COLORS.gray[500],
    selected: COLORS.white,
    disabled: COLORS.gray[400],
  };
  
  return textColors[status];
};

/**
 * Filter slots by time range
 */
const filterSlotsByTimeRange = (slots: TimeSlot[], timeRange?: TimeRange): TimeSlot[] => {
  if (!timeRange) return slots;
  
  return slots.filter(slot => {
    const hour = slot.startTime.getHours();
    const dayOfWeek = slot.startTime.getDay();
    
    const inTimeRange = hour >= timeRange.startHour && hour < timeRange.endHour;
    const inDayRange = !timeRange.daysOfWeek || timeRange.daysOfWeek.includes(dayOfWeek);
    
    return inTimeRange && inDayRange;
  });
};

/**
 * Group slots by time period
 */
const groupSlotsByTime = (slots: TimeSlot[]): Record<string, TimeSlot[]> => {
  return slots.reduce((groups, slot) => {
    const timeKey = formatTime(slot.startTime, '24h');
    if (!groups[timeKey]) {
      groups[timeKey] = [];
    }
    groups[timeKey].push(slot);
    return groups;
  }, {} as Record<string, TimeSlot[]>);
};

// === COMPONENT ===

/**
 * TimeSlotGrid - Visual time slot selection grid
 * 
 * @example
 * ```tsx
 * const timeSlots = [
 *   {
 *     id: 'slot_1',
 *     startTime: new Date('2024-01-15T09:00:00'),
 *     endTime: new Date('2024-01-15T10:00:00'),
 *     status: 'available',
 *     price: 100,
 *     currency: 'USD',
 *     duration: 60
 *   },
 *   {
 *     id: 'slot_2',
 *     startTime: new Date('2024-01-15T10:00:00'),
 *     endTime: new Date('2024-01-15T11:00:00'),
 *     status: 'booked',
 *     duration: 60
 *   }
 * ];
 * 
 * <TimeSlotGrid
 *   slots={timeSlots}
 *   onSlotSelect={(slotInfo) => handleSlotSelection(slotInfo.slot)}
 *   allowMultipleSelection={false}
 *   layout="comfortable"
 *   config={{
 *     columns: 3,
 *     showPricing: true,
 *     timeFormat: '12h'
 *   }}
 * />
 * ```
 */
export default function TimeSlotGrid({
  slots = [],
  selectedSlotIds = [],
  onSlotSelect,
  onSlotDeselect,
  onMultipleSelect,
  allowMultipleSelection = false,
  maxSelections = 10,
  layout = 'comfortable',
  config = {},
  timeRange,
  showUnavailable = true,
  slotColors = {},
  loading = false,
  error,
  emptyMessage = 'No time slots available',
  disabled = false,
  testID = 'time-slot-grid',
}: TimeSlotGridProps) {
  
  // State
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedSlotIds);

  // Default configuration
  const gridConfig: GridConfig = {
    columns: 3,
    showTimeLabels: true,
    showPricing: true,
    showDuration: false,
    timeFormat: '12h',
    slotHeight: layout === 'compact' ? 60 : layout === 'spacious' ? 100 : 80,
    spacing: layout === 'compact' ? 8 : layout === 'spacious' ? 16 : 12,
    ...config,
  };

  // Filter and process slots
  const processedSlots = useMemo(() => {
    let filteredSlots = filterSlotsByTimeRange(slots, timeRange);
    
    if (!showUnavailable) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.status === 'available' || slot.status === 'selected'
      );
    }
    
    // Update status for selected slots
    return filteredSlots.map(slot => ({
      ...slot,
      status: internalSelectedIds.includes(slot.id) ? 'selected' : slot.status,
    }));
  }, [slots, timeRange, showUnavailable, internalSelectedIds]);

  // Handle slot selection
  const handleSlotPress = (slot: TimeSlot) => {
    if (disabled || slot.status === 'booked' || slot.status === 'unavailable' || slot.status === 'disabled') {
      return;
    }

    const isSelected = internalSelectedIds.includes(slot.id);
    let newSelectedIds: string[];

    if (allowMultipleSelection) {
      if (isSelected) {
        newSelectedIds = internalSelectedIds.filter(id => id !== slot.id);
      } else if (internalSelectedIds.length < maxSelections) {
        newSelectedIds = [...internalSelectedIds, slot.id];
      } else {
        return; // Max selections reached
      }
    } else {
      newSelectedIds = isSelected ? [] : [slot.id];
    }

    setInternalSelectedIds(newSelectedIds);

    // Call appropriate handlers
    const slotInfo: SelectedSlotInfo = {
      slot,
      index: newSelectedIds.indexOf(slot.id),
      totalSelected: newSelectedIds.length,
    };

    if (isSelected) {
      onSlotDeselect?.(slotInfo);
    } else {
      onSlotSelect?.(slotInfo);
    }

    if (allowMultipleSelection) {
      const selectedSlots = processedSlots.filter(s => newSelectedIds.includes(s.id));
      onMultipleSelect?.(selectedSlots);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Card className="p-4" testID={testID}>
        <View className="animate-pulse">
          <View className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <View 
                key={index} 
                className="h-20 bg-gray-200 rounded-lg"
              />
            ))}
          </View>
        </View>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="p-4" testID={testID}>
        <View className="items-center py-8">
          <Text className="text-red-600 text-center mb-2">⚠️ Error</Text>
          <Text className="text-gray-600 text-center">{error}</Text>
        </View>
      </Card>
    );
  }

  // Render empty state
  if (processedSlots.length === 0) {
    return (
      <Card className="p-4" testID={testID}>
        <View className="items-center py-8">
          <Text className="text-gray-500 text-center mb-2">📅</Text>
          <Text className="text-gray-600 text-center">{emptyMessage}</Text>
        </View>
      </Card>
    );
  }

  // Group slots for display
  const groupedSlots = groupSlotsByTime(processedSlots);
  const timeKeys = Object.keys(groupedSlots).sort();

  return (
    <Card className="p-4" testID={testID}>
      
      {/* Grid Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">
          Available Times
        </Text>
        
        {allowMultipleSelection && internalSelectedIds.length > 0 && (
          <Badge variant="secondary">
            <Text className="text-sm font-medium">
              {internalSelectedIds.length} selected
            </Text>
          </Badge>
        )}
      </View>

      {/* Selection Info */}
      {allowMultipleSelection && maxSelections > 1 && (
        <View className="mb-4">
          <Text className="text-sm text-gray-600">
            Select up to {maxSelections} time slots ({internalSelectedIds.length}/{maxSelections} selected)
          </Text>
        </View>
      )}

      {/* Time Slot Grid */}
      <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
        <View 
          className="gap-4"
          style={{ gap: gridConfig.spacing }}
        >
          {timeKeys.map((timeKey) => {
            const timeSlots = groupedSlots[timeKey];
            
            return (
              <View key={timeKey}>
                {/* Time Label */}
                {gridConfig.showTimeLabels && (
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    {timeKey}
                  </Text>
                )}
                
                {/* Slots Row */}
                <View 
                  className={`grid grid-cols-${gridConfig.columns} gap-${gridConfig.spacing / 4}`}
                  style={{ gap: gridConfig.spacing / 2 }}
                >
                  {timeSlots.map((slot) => {
                    const isSelected = internalSelectedIds.includes(slot.id);
                    const isDisabled = disabled || slot.status === 'booked' || 
                                     slot.status === 'unavailable' || slot.status === 'disabled';
                    
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        className={cn(
                          'rounded-lg border-2 p-3 items-center justify-center',
                          isSelected ? 'shadow-sm' : 'shadow-none',
                          isDisabled ? 'opacity-60' : 'opacity-100'
                        )}
                        style={{
                          height: gridConfig.slotHeight,
                          backgroundColor: getSlotColor(slot.status, slotColors),
                          borderColor: getSlotBorderColor(slot.status, slotColors),
                        }}
                        onPress={() => handleSlotPress(slot)}
                        disabled={isDisabled}
                        activeOpacity={0.8}
                      >
                        {/* Time Display */}
                        <Text 
                          className="text-sm font-semibold text-center"
                          style={{ color: getSlotTextColor(slot.status) }}
                        >
                          {formatTime(slot.startTime, gridConfig.timeFormat)}
                        </Text>
                        
                        {/* Duration */}
                        {gridConfig.showDuration && (
                          <Text 
                            className="text-xs text-center mt-1"
                            style={{ color: getSlotTextColor(slot.status) }}
                          >
                            {formatDuration(slot.duration)}
                          </Text>
                        )}
                        
                        {/* Price */}
                        {gridConfig.showPricing && slot.price && slot.status === 'available' && (
                          <Text 
                            className="text-xs font-medium text-center mt-1"
                            style={{ color: getSlotTextColor(slot.status) }}
                          >
                            {slot.discount ? (
                              <View className="items-center">
                                <Text 
                                  className="text-xs line-through"
                                  style={{ color: getSlotTextColor(slot.status) }}
                                >
                                  {formatCurrency(slot.price, slot.currency)}
                                </Text>
                                <Text 
                                  className="text-xs font-bold"
                                  style={{ color: getSlotTextColor(slot.status) }}
                                >
                                  {formatCurrency(slot.price * (1 - slot.discount / 100), slot.currency)}
                                </Text>
                              </View>
                            ) : (
                              formatCurrency(slot.price, slot.currency)
                            )}
                          </Text>
                        )}
                        
                        {/* Status Indicator */}
                        {slot.status === 'booked' && (
                          <Text className="text-xs text-center mt-1" style={{ color: getSlotTextColor(slot.status) }}>
                            Booked
                          </Text>
                        )}
                        
                        {slot.status === 'unavailable' && (
                          <Text className="text-xs text-center mt-1" style={{ color: getSlotTextColor(slot.status) }}>
                            N/A
                          </Text>
                        )}
                        
                        {/* Special Pricing Indicator */}
                        {slot.specialPricing && (
                          <View className="absolute top-1 right-1">
                            <Text className="text-xs">⭐</Text>
                          </View>
                        )}
                        
                        {/* Selection Indicator */}
                        {isSelected && (
                          <View className="absolute top-1 left-1">
                            <Text className="text-white text-xs">✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="flex-row justify-center mt-4 space-x-4">
        <View className="flex-row items-center">
          <View 
            className="w-3 h-3 rounded border mr-2"
            style={{ 
              backgroundColor: getSlotColor('available', slotColors),
              borderColor: getSlotBorderColor('available', slotColors),
            }}
          />
          <Text className="text-xs text-gray-600">Available</Text>
        </View>
        
        <View className="flex-row items-center">
          <View 
            className="w-3 h-3 rounded border mr-2"
            style={{ 
              backgroundColor: getSlotColor('selected', slotColors),
              borderColor: getSlotBorderColor('selected', slotColors),
            }}
          />
          <Text className="text-xs text-gray-600">Selected</Text>
        </View>
        
        <View className="flex-row items-center">
          <View 
            className="w-3 h-3 rounded border mr-2"
            style={{ 
              backgroundColor: getSlotColor('booked', slotColors),
              borderColor: getSlotBorderColor('booked', slotColors),
            }}
          />
          <Text className="text-xs text-gray-600">Booked</Text>
        </View>
      </View>

      {/* Clear Selection Button */}
      {allowMultipleSelection && internalSelectedIds.length > 0 && (
        <Button
          onPress={() => {
            setInternalSelectedIds([]);
            onMultipleSelect?.([]);
          }}
          variant="outline"
          className="mt-4"
        >
          <Text className="text-gray-700 font-medium">
            Clear Selection
          </Text>
        </Button>
      )}
    </Card>
  );
}

// === EXPORTS ===

export type {
  TimeSlotGridProps,
  TimeSlot,
  TimeSlotStatus,
  GridLayout,
  TimeFormat,
  TimeRange,
  GridConfig,
  SelectedSlotInfo,
};
