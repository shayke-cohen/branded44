/**
 * TimeSlotPicker - Reusable time slot selection component
 * 
 * Displays available time slots and handles selection
 */

import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import type { TimeSlot } from '../../screens/wix/services/shared/WixBookingService';
import { useTheme } from '../../context/ThemeContext';
import { createServiceDetailStyles } from '../../shared/styles/ServiceDetailStyles';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  loading: boolean;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  style?: any;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  timeSlots,
  selectedTimeSlot,
  loading,
  onTimeSlotSelect,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createServiceDetailStyles(theme);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderTimeSlot = ({ item }: { item: TimeSlot }) => {
    const isSelected = selectedTimeSlot?.id === item.id;
    const isDisabled = !item.available;

    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          isSelected && styles.timeSlotSelected,
          isDisabled && styles.timeSlotDisabled,
        ]}
        onPress={() => !isDisabled && onTimeSlotSelect(item)}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.timeSlotText,
            isSelected && styles.timeSlotTextSelected,
            isDisabled && styles.timeSlotTextDisabled,
          ]}
        >
          {formatTime(item.startTime)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={style}>
        <LoadingState message="Loading available times..." />
      </View>
    );
  }

  const availableSlots = (timeSlots || []).filter(slot => slot.available);
  const unavailableSlots = (timeSlots || []).filter(slot => !slot.available);

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <View style={style}>
        <EmptyState
          title="No time slots available"
          subtitle="Please try selecting a different date or provider"
        />
      </View>
    );
  }

  return (
    <View style={[styles.bookingSection, style]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Times</Text>
        <Text style={styles.sectionCount}>
          {availableSlots.length} available
        </Text>
      </View>

      <View style={styles.timeSlotsContainer}>
        {availableSlots.length > 0 && (
          <>
            <FlatList
              data={availableSlots}
              renderItem={renderTimeSlot}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.timeSlotsGrid}
              scrollEnabled={false}
              columnWrapperStyle={styles.timeSlotsGrid}
            />
          </>
        )}

        {unavailableSlots.length > 0 && availableSlots.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>
              Unavailable Times
            </Text>
            <FlatList
              data={unavailableSlots}
              renderItem={renderTimeSlot}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.timeSlotsGrid}
              scrollEnabled={false}
              columnWrapperStyle={styles.timeSlotsGrid}
            />
          </View>
        )}

        {availableSlots.length === 0 && (
          <EmptyState
            title="No available times"
            subtitle="All time slots are booked for this date. Please try another date."
          />
        )}
      </View>
    </View>
  );
};

export default TimeSlotPicker;
