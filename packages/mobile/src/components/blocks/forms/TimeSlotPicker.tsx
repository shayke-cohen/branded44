/**
 * TimeSlotPicker - Available Time Slots Selection Block Component
 */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Text } from '../../../../~/components/ui/text';
import { Badge } from '../../../../~/components/ui/badge';
import { cn, formatDate } from '../../../lib/utils';
import { LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Clock } from 'lucide-react-native';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  label?: string;
}

export interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedSlot?: string;
  onSlotSelect: (slotId: string) => void;
  date?: string;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  timeSlots = [],
  selectedSlot,
  onSlotSelect,
  date,
  loading = 'idle',
  style,
  className,
  testID = 'time-slot-picker',
}) => {
  const isLoading = loading === 'loading';

  return (
    <View style={style} className={cn('time-slot-picker', className)} testID={testID}>
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Clock size={20} color={COLORS.primary[600]} />
            <CardTitle>Select Time</CardTitle>
            {date && (
              <Badge variant="secondary">
                <Text>{formatDate(date, 'short')}</Text>
              </Badge>
            )}
          </View>
        </CardHeader>
        
        <CardContent>
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedSlot === slot.id ? "default" : "outline"}
                  onPress={() => slot.available && onSlotSelect(slot.id)}
                  disabled={!slot.available || isLoading}
                  style={{ 
                    minWidth: 80,
                    opacity: slot.available ? 1 : 0.5,
                  }}
                >
                  <Text>{slot.label || slot.time}</Text>
                </Button>
              ))}
            </View>
            
            {timeSlots.filter(slot => slot.available).length === 0 && (
              <Text style={{ 
                textAlign: 'center', 
                color: COLORS.neutral[600],
                marginTop: SPACING.md 
              }}>
                No available time slots for this date
              </Text>
            )}
          </ScrollView>
        </CardContent>
      </Card>
    </View>
  );
};

export default TimeSlotPicker;
