/**
 * DateRangePicker - Start/End Date Selection Block Component
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Text } from '../../../../~/components/ui/text';
import { cn, formatDate } from '../../../lib/utils';
import { LoadingState, FormErrors } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Calendar } from 'lucide-react-native';

export interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate = '',
  endDate = '',
  onDateRangeChange,
  loading = 'idle',
  style,
  className,
  testID = 'date-range-picker',
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [errors, setErrors] = useState<FormErrors>({});

  const isLoading = loading === 'loading';

  const handleApply = () => {
    const newErrors: FormErrors = {};
    
    if (localStartDate && localEndDate && new Date(localStartDate) > new Date(localEndDate)) {
      newErrors.dateRange = 'Start date must be before end date';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onDateRangeChange(localStartDate, localEndDate);
    }
  };

  return (
    <View style={style} className={cn('date-range-picker', className)} testID={testID}>
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Calendar size={20} color={COLORS.primary[600]} />
            <CardTitle>Date Range</CardTitle>
          </View>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.formField }}>
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            <View style={{ flex: 1 }}>
              <Label nativeID="startDate">Start Date</Label>
              <Input
                aria-labelledby="startDate"
                value={localStartDate}
                onChangeText={setLocalStartDate}
                placeholder="YYYY-MM-DD"
                editable={!isLoading}
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Label nativeID="endDate">End Date</Label>
              <Input
                aria-labelledby="endDate"
                value={localEndDate}
                onChangeText={setLocalEndDate}
                placeholder="YYYY-MM-DD"
                editable={!isLoading}
              />
            </View>
          </View>
          
          {errors.dateRange && (
            <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm }}>
              {errors.dateRange}
            </Text>
          )}
          
          <Button onPress={handleApply} disabled={isLoading}>
            <Text>{isLoading ? 'Applying...' : 'Apply Date Range'}</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
};

export default DateRangePicker;
