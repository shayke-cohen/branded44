/**
 * BookingCalendar Component - AI-Optimized React Native Component
 * 
 * A comprehensive booking calendar for service appointments and scheduling.
 * Features provider availability, time slot selection, and booking management.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Time slot availability status
 */
export type SlotStatus = 'available' | 'booked' | 'unavailable' | 'break' | 'blocked';

/**
 * Calendar view modes
 */
export type CalendarView = 'month' | 'week' | 'day';

/**
 * Time slot data structure
 */
export interface TimeSlot {
  /** Slot unique identifier */
  id: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime: Date;
  /** Slot availability status */
  status: SlotStatus;
  /** Price for this slot */
  price?: number;
  /** Currency code */
  currency?: string;
  /** Provider ID for this slot */
  providerId?: string;
  /** Service ID for this slot */
  serviceId?: string;
  /** Existing booking ID if booked */
  bookingId?: string;
  /** Special notes for this slot */
  notes?: string;
  /** Whether this is a recurring slot */
  recurring?: boolean;
  /** Slot duration in minutes */
  duration: number;
}

/**
 * Calendar day data
 */
export interface CalendarDay {
  /** Date for this day */
  date: Date;
  /** Available time slots */
  slots: TimeSlot[];
  /** Whether this day is selectable */
  selectable: boolean;
  /** Whether this day is today */
  isToday: boolean;
  /** Whether this day is in current month */
  inCurrentMonth: boolean;
  /** Special day type */
  type?: 'holiday' | 'weekend' | 'working' | 'unavailable';
  /** Day notes */
  notes?: string;
}

/**
 * Provider availability rules
 */
export interface AvailabilityRule {
  /** Rule identifier */
  id: string;
  /** Day of week (0 = Sunday, 6 = Saturday) */
  dayOfWeek: number;
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
  /** Whether available on this day */
  available: boolean;
  /** Break times */
  breaks?: Array<{
    startTime: string;
    endTime: string;
    reason?: string;
  }>;
  /** Special pricing for this time */
  priceMultiplier?: number;
}

/**
 * Booking constraints
 */
export interface BookingConstraints {
  /** Minimum advance booking time in hours */
  minAdvanceHours: number;
  /** Maximum advance booking time in days */
  maxAdvanceDays: number;
  /** Minimum booking duration in minutes */
  minDuration: number;
  /** Maximum booking duration in minutes */
  maxDuration: number;
  /** Available slot intervals in minutes */
  slotInterval: number;
  /** Buffer time between bookings in minutes */
  bufferTime: number;
  /** Maximum bookings per day */
  maxBookingsPerDay?: number;
  /** Blackout dates */
  blackoutDates?: Date[];
}

/**
 * Selected booking slot
 */
export interface SelectedSlot {
  /** Selected time slot */
  slot: TimeSlot;
  /** Selected date */
  date: Date;
  /** Service duration */
  duration: number;
  /** Total price */
  price: number;
  /** Currency */
  currency: string;
}

/**
 * BookingCalendar component props
 */
export interface BookingCalendarProps {
  /** Provider ID to show availability for */
  providerId?: string;
  /** Service ID to book */
  serviceId?: string;
  /** Service duration in minutes */
  serviceDuration?: number;
  /** Base service price */
  servicePrice?: number;
  /** Currency code */
  currency?: string;
  /** Calendar view mode */
  view?: CalendarView;
  /** Initial selected date */
  initialDate?: Date;
  /** Provider availability rules */
  availabilityRules?: AvailabilityRule[];
  /** Booking constraints */
  constraints?: BookingConstraints;
  /** Existing bookings to display */
  existingBookings?: TimeSlot[];
  /** Slot selection handler */
  onSlotSelect?: (slot: SelectedSlot) => void;
  /** Date change handler */
  onDateChange?: (date: Date) => void;
  /** View change handler */
  onViewChange?: (view: CalendarView) => void;
  /** Load more slots handler */
  onLoadSlots?: (startDate: Date, endDate: Date) => Promise<TimeSlot[]>;
  /** Whether to show pricing */
  showPricing?: boolean;
  /** Whether to show provider info */
  showProvider?: boolean;
  /** Whether multiple slots can be selected */
  allowMultiSelect?: boolean;
  /** Custom slot colors */
  slotColors?: Partial<Record<SlotStatus, string>>;
  /** Whether calendar is loading */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format time display
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date display
 */
const formatDate = (date: Date, format: 'short' | 'long' = 'short'): string => {
  if (format === 'long') {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Get slot color based on status
 */
const getSlotColor = (status: SlotStatus, customColors?: Partial<Record<SlotStatus, string>>): string => {
  if (customColors && customColors[status]) {
    return customColors[status];
  }
  
  const defaultColors: Record<SlotStatus, string> = {
    available: COLORS.success[500],
    booked: COLORS.error[500],
    unavailable: COLORS.gray[400],
    break: COLORS.orange[500],
    blocked: COLORS.red[600],
  };
  
  return defaultColors[status];
};

/**
 * Generate time slots for a day
 */
const generateDaySlots = (
  date: Date, 
  rules: AvailabilityRule[], 
  constraints: BookingConstraints,
  existingSlots: TimeSlot[] = []
): TimeSlot[] => {
  const dayOfWeek = date.getDay();
  const dayRule = rules.find(rule => rule.dayOfWeek === dayOfWeek && rule.available);
  
  if (!dayRule) return [];
  
  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = dayRule.startTime.split(':').map(Number);
  const [endHour, endMinute] = dayRule.endTime.split(':').map(Number);
  
  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const current = new Date(startTime);
  let slotIndex = 0;
  
  while (current < endTime) {
    const slotEnd = new Date(current.getTime() + constraints.slotInterval * 60000);
    
    // Check if slot conflicts with existing bookings
    const conflicting = existingSlots.find(existing => 
      (current >= existing.startTime && current < existing.endTime) ||
      (slotEnd > existing.startTime && slotEnd <= existing.endTime)
    );
    
    // Check if slot is in break time
    const inBreak = dayRule.breaks?.some(breakTime => {
      const [breakStartHour, breakStartMinute] = breakTime.startTime.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = breakTime.endTime.split(':').map(Number);
      
      const breakStart = new Date(date);
      breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);
      
      const breakEnd = new Date(date);
      breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);
      
      return current >= breakStart && current < breakEnd;
    });
    
    const slot: TimeSlot = {
      id: `slot_${date.toISOString().split('T')[0]}_${slotIndex}`,
      startTime: new Date(current),
      endTime: new Date(slotEnd),
      status: conflicting ? 'booked' : inBreak ? 'break' : 'available',
      duration: constraints.slotInterval,
      bookingId: conflicting?.bookingId,
    };
    
    slots.push(slot);
    current.setTime(current.getTime() + constraints.slotInterval * 60000);
    slotIndex++;
  }
  
  return slots;
};

/**
 * Check if date is selectable
 */
const isDateSelectable = (date: Date, constraints: BookingConstraints): boolean => {
  const now = new Date();
  const minDate = new Date(now.getTime() + constraints.minAdvanceHours * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + constraints.maxAdvanceDays * 24 * 60 * 60 * 1000);
  
  return date >= minDate && date <= maxDate && 
         !constraints.blackoutDates?.some(blackout => 
           blackout.toDateString() === date.toDateString()
         );
};

// === COMPONENT ===

/**
 * BookingCalendar - Calendar for booking appointments
 * 
 * @example
 * ```tsx
 * const availabilityRules = [
 *   {
 *     id: 'rule_1',
 *     dayOfWeek: 1, // Monday
 *     startTime: '09:00',
 *     endTime: '17:00',
 *     available: true,
 *     breaks: [{ startTime: '12:00', endTime: '13:00', reason: 'Lunch' }]
 *   }
 * ];
 * 
 * const constraints = {
 *   minAdvanceHours: 2,
 *   maxAdvanceDays: 30,
 *   minDuration: 30,
 *   maxDuration: 180,
 *   slotInterval: 30,
 *   bufferTime: 15
 * };
 * 
 * <BookingCalendar
 *   providerId="prov_123"
 *   serviceId="srv_456"
 *   serviceDuration={60}
 *   servicePrice={100}
 *   currency="USD"
 *   availabilityRules={availabilityRules}
 *   constraints={constraints}
 *   onSlotSelect={(slot) => proceedToBooking(slot)}
 *   showPricing={true}
 * />
 * ```
 */
export default function BookingCalendar({
  providerId,
  serviceId,
  serviceDuration = 60,
  servicePrice = 0,
  currency = 'USD',
  view = 'week',
  initialDate = new Date(),
  availabilityRules,
  constraints,
  existingBookings,
  onSlotSelect,
  onDateChange,
  onViewChange,
  onLoadSlots,
  showPricing = true,
  showProvider = true,
  allowMultiSelect = false,
  slotColors,
  loading = false,
  error,
  testID = 'booking-calendar',
}: BookingCalendarProps) {
  
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [currentView, setCurrentView] = useState(view);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Memoize default values to prevent infinite re-renders
  const memoizedAvailabilityRules = useMemo(() => availabilityRules || [], [availabilityRules]);
  const memoizedConstraints = useMemo(() => constraints || {
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    minDuration: 30,
    maxDuration: 180,
    slotInterval: 30,
    bufferTime: 15,
  }, [constraints]);
  const memoizedExistingBookings = useMemo(() => existingBookings || [], [existingBookings]);

  const generateCalendarDays = useCallback(async () => {
    setIsLoadingSlots(true);
    
    try {
      const days: CalendarDay[] = [];
      let startDate: Date;
      let endDate: Date;
      
      if (currentView === 'month') {
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      } else if (currentView === 'week') {
        const dayOfWeek = selectedDate.getDay();
        startDate = new Date(selectedDate);
        startDate.setDate(selectedDate.getDate() - dayOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      } else {
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
      }
      
      // Load additional slots if handler provided
      let additionalSlots: TimeSlot[] = [];
      if (onLoadSlots) {
        const loadedSlots = await onLoadSlots(startDate, endDate);
        additionalSlots = loadedSlots || [];
      }
      
      const allExistingSlots = [...(existingBookings || []), ...additionalSlots];
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const daySlots = generateDaySlots(new Date(date), memoizedAvailabilityRules, memoizedConstraints, allExistingSlots);
        
        const calendarDay: CalendarDay = {
          date: new Date(date),
          slots: daySlots,
          selectable: isDateSelectable(new Date(date), memoizedConstraints),
          isToday: date.toDateString() === new Date().toDateString(),
          inCurrentMonth: date.getMonth() === selectedDate.getMonth(),
          type: date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : 'working',
        };
        
        days.push(calendarDay);
      }
      
      setCalendarDays(days);
    } catch (err) {
      console.error('Error generating calendar days:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDate, currentView, memoizedAvailabilityRules, memoizedConstraints, memoizedExistingBookings, onLoadSlots]);

  // Generate calendar days when dependencies change
  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateChange?.(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.status !== 'available') {
      Alert.alert('Unavailable', 'This time slot is not available for booking.');
      return;
    }
    
    const selectedSlot: SelectedSlot = {
      slot,
      date: selectedDate,
      duration: serviceDuration,
      price: servicePrice,
      currency,
    };
    
    if (allowMultiSelect) {
      const existingIndex = selectedSlots.findIndex(s => s.slot.id === slot.id);
      if (existingIndex >= 0) {
        setSelectedSlots(prev => prev.filter((_, index) => index !== existingIndex));
      } else {
        setSelectedSlots(prev => [...prev, selectedSlot]);
      }
    } else {
      setSelectedSlots([selectedSlot]);
      onSlotSelect?.(selectedSlot);
    }
  };

  const handleViewChange = (newView: CalendarView) => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  // Render view selector
  const renderViewSelector = () => (
    <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
      {(['month', 'week', 'day'] as CalendarView[]).map((viewMode) => (
        <TouchableOpacity
          key={viewMode}
          className={cn(
            'flex-1 py-2 px-3 rounded-md',
            currentView === viewMode ? 'bg-white shadow-sm' : 'bg-transparent'
          )}
          onPress={() => handleViewChange(viewMode)}
        >
          <Text className={cn(
            'text-center text-sm font-medium capitalize',
            currentView === viewMode ? 'text-gray-900' : 'text-gray-600'
          )}>
            {viewMode}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render calendar header
  const renderCalendarHeader = () => (
    <View className="flex-row items-center justify-between mb-4">
      <TouchableOpacity
        className="p-2 rounded-lg bg-gray-100"
        onPress={() => {
          const prevDate = new Date(selectedDate);
          if (currentView === 'month') {
            prevDate.setMonth(prevDate.getMonth() - 1);
          } else if (currentView === 'week') {
            prevDate.setDate(prevDate.getDate() - 7);
          } else {
            prevDate.setDate(prevDate.getDate() - 1);
          }
          handleDateSelect(prevDate);
        }}
      >
        <Text className="text-lg">←</Text>
      </TouchableOpacity>
      
      <Text className="text-lg font-semibold text-gray-900">
        {formatDate(selectedDate, 'long')}
      </Text>
      
      <TouchableOpacity
        className="p-2 rounded-lg bg-gray-100"
        onPress={() => {
          const nextDate = new Date(selectedDate);
          if (currentView === 'month') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          } else if (currentView === 'week') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else {
            nextDate.setDate(nextDate.getDate() + 1);
          }
          handleDateSelect(nextDate);
        }}
      >
        <Text className="text-lg">→</Text>
      </TouchableOpacity>
    </View>
  );

  // Render time slots for selected day
  const renderTimeSlots = () => {
    const selectedDay = calendarDays.find(day => 
      day.date.toDateString() === selectedDate.toDateString()
    );
    
    if (!selectedDay || selectedDay.slots.length === 0) {
      return (
        <View className="items-center py-8">
          <Text className="text-gray-500 text-center">
            No available time slots for this date
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView className="max-h-96">
        <View className="grid grid-cols-3 gap-2">
          {selectedDay.slots.map((slot) => {
            const isSelected = selectedSlots.some(s => s.slot.id === slot.id);
            const slotColor = getSlotColor(slot.status, slotColors);
            
            return (
              <TouchableOpacity
                key={slot.id}
                className={cn(
                  'p-3 rounded-lg border',
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                  slot.status === 'available' ? 'bg-white' : 'bg-gray-50'
                )}
                style={slot.status !== 'available' ? { 
                  backgroundColor: `${slotColor}20`,
                  borderColor: slotColor 
                } : undefined}
                onPress={() => handleSlotSelect(slot)}
                disabled={slot.status !== 'available'}
              >
                <Text className={cn(
                  'text-sm font-medium text-center',
                  slot.status === 'available' ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {formatTime(slot.startTime)}
                </Text>
                
                {showPricing && slot.status === 'available' && (
                  <Text className="text-xs text-gray-600 text-center mt-1">
                    ${servicePrice}
                  </Text>
                )}
                
                {slot.status !== 'available' && (
                  <Badge 
                    variant="secondary" 
                    className="mt-1"
                    style={{ backgroundColor: slotColor }}
                  >
                    <Text className="text-white text-xs capitalize">
                      {slot.status}
                    </Text>
                  </Badge>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Handle loading state
  if (loading || isLoadingSlots) {
    return (
      <Card className="p-4 animate-pulse" testID={testID}>
        <View className="space-y-4">
          <View className="h-10 bg-gray-200 rounded" />
          <View className="h-8 bg-gray-200 rounded" />
          <View className="grid grid-cols-7 gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <View key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card className="p-4" testID={testID}>
      
      {/* Error State */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      {/* View Selector */}
      {renderViewSelector()}
      
      {/* Calendar Header */}
      {renderCalendarHeader()}
      
      {/* Calendar Grid - Week/Day view */}
      {currentView !== 'month' && (
        <View>
          {/* Week Days */}
          {currentView === 'week' && (
            <View className="flex-row mb-4">
              {calendarDays.map((day) => (
                <TouchableOpacity
                  key={day.date.toISOString()}
                  className={cn(
                    'flex-1 p-2 mx-1 rounded-lg border',
                    day.date.toDateString() === selectedDate.toDateString() 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white',
                    !day.selectable && 'opacity-50'
                  )}
                  onPress={() => handleDateSelect(day.date)}
                  disabled={!day.selectable}
                >
                  <Text className={cn(
                    'text-xs text-center font-medium',
                    day.isToday ? 'text-blue-600' : 'text-gray-900'
                  )}>
                    {day.date.toLocaleDateString([], { weekday: 'short' })}
                  </Text>
                  <Text className={cn(
                    'text-sm text-center font-semibold mt-1',
                    day.isToday ? 'text-blue-600' : 'text-gray-900'
                  )}>
                    {day.date.getDate()}
                  </Text>
                  
                  {/* Available slots indicator */}
                  <View className="flex-row justify-center mt-1">
                    {day.slots.filter(s => s.status === 'available').length > 0 && (
                      <View className="w-1 h-1 bg-green-500 rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Time Slots */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Available Times - {formatDate(selectedDate)}
            </Text>
            {renderTimeSlots()}
          </View>
        </View>
      )}

      {/* Selected Slots Summary */}
      {selectedSlots.length > 0 && allowMultiSelect && (
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm font-medium text-blue-900 mb-2">
            Selected Slots ({selectedSlots.length})
          </Text>
          {selectedSlots.map((selected, index) => (
            <Text key={index} className="text-sm text-blue-700">
              {formatDate(selected.date)} at {formatTime(selected.slot.startTime)}
            </Text>
          ))}
          
          <Button
            onPress={() => onSlotSelect?.(selectedSlots[0])} // Handle multiple slots
            className="mt-3 bg-blue-600"
            size="sm"
          >
            <Text className="text-white font-medium">
              Continue with {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
            </Text>
          </Button>
        </View>
      )}

      {/* Legend */}
      <View className="mt-4 flex-row justify-center space-x-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-green-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Available</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-red-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Booked</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-orange-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Break</Text>
        </View>
      </View>
    </Card>
  );
}

// === EXPORTS ===

export type {
  BookingCalendarProps,
  TimeSlot,
  CalendarDay,
  AvailabilityRule,
  BookingConstraints,
  SelectedSlot,
  SlotStatus,
  CalendarView,
};
