/**
 * RecurringBookingForm Component - AI-Optimized React Native Component
 * 
 * A comprehensive form for setting up recurring appointments and subscriptions.
 * Features flexible scheduling patterns, duration management, and payment options.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { Badge } from '../../../../~/components/ui/badge';
import { Calendar } from '../../../../~/components/ui/calendar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Recurrence frequency types
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Recurrence end conditions
 */
export type RecurrenceEndType = 'never' | 'after_occurrences' | 'on_date';

/**
 * Days of the week
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 6=Saturday

/**
 * Monthly recurrence patterns
 */
export type MonthlyPattern = 'same_date' | 'same_weekday' | 'last_weekday';

/**
 * Recurrence pattern configuration
 */
export interface RecurrencePattern {
  /** Frequency of recurrence */
  frequency: RecurrenceFrequency;
  /** Interval between occurrences */
  interval: number;
  /** Days of week for weekly recurrence */
  daysOfWeek?: DayOfWeek[];
  /** Monthly pattern */
  monthlyPattern?: MonthlyPattern;
  /** Day of month for monthly recurrence */
  dayOfMonth?: number;
  /** Week of month (1-4, -1 for last) */
  weekOfMonth?: number;
  /** Months of year for yearly recurrence */
  monthsOfYear?: number[];
}

/**
 * Recurrence end condition
 */
export interface RecurrenceEnd {
  /** Type of end condition */
  type: RecurrenceEndType;
  /** Number of occurrences if type is 'after_occurrences' */
  occurrences?: number;
  /** End date if type is 'on_date' */
  endDate?: Date;
}

/**
 * Time slot configuration
 */
export interface TimeSlotConfig {
  /** Start time */
  startTime: Date;
  /** Duration in minutes */
  duration: number;
  /** Time zone */
  timeZone?: string;
  /** Buffer time between slots */
  bufferTime?: number;
}

/**
 * Pricing configuration for recurring bookings
 */
export interface RecurringPricing {
  /** Price per occurrence */
  pricePerOccurrence: number;
  /** Currency code */
  currency: string;
  /** Discount for recurring booking */
  recurringDiscount?: {
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
  };
  /** Setup fee */
  setupFee?: number;
  /** Payment frequency */
  paymentFrequency: 'per_occurrence' | 'weekly' | 'monthly' | 'quarterly' | 'upfront';
  /** Total estimated cost */
  totalEstimatedCost?: number;
}

/**
 * Recurring booking exceptions
 */
export interface BookingException {
  /** Exception identifier */
  id: string;
  /** Date of exception */
  date: Date;
  /** Type of exception */
  type: 'skip' | 'reschedule' | 'cancel';
  /** New date if rescheduled */
  newDate?: Date;
  /** Reason for exception */
  reason?: string;
}

/**
 * Generated occurrence preview
 */
export interface OccurrencePreview {
  /** Occurrence date */
  date: Date;
  /** Occurrence number */
  number: number;
  /** Whether occurrence has exception */
  hasException?: boolean;
  /** Exception details */
  exception?: BookingException;
}

/**
 * Main recurring booking data
 */
export interface RecurringBookingData {
  /** Service being booked */
  serviceId: string;
  /** Provider identifier */
  providerId: string;
  /** Recurrence pattern */
  pattern: RecurrencePattern;
  /** Time slot configuration */
  timeSlot: TimeSlotConfig;
  /** Recurrence end condition */
  endCondition: RecurrenceEnd;
  /** Start date */
  startDate: Date;
  /** Pricing configuration */
  pricing: RecurringPricing;
  /** Customer preferences */
  preferences?: {
    autoReschedule: boolean;
    notificationFrequency: 'each' | 'weekly' | 'monthly';
    allowProviderReschedule: boolean;
  };
  /** Booking exceptions */
  exceptions: BookingException[];
  /** Customer notes */
  notes?: string;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  /** Field-specific errors */
  fields: Record<string, string>;
  /** General form errors */
  general?: string[];
}

/**
 * RecurringBookingForm component props
 */
export interface RecurringBookingFormProps {
  /** Service ID being booked */
  serviceId?: string;
  /** Provider ID being booked */
  providerId?: string;
  /** Initial form data */
  initialData?: Partial<RecurringBookingData>;
  /** Initial time slot */
  initialTimeSlot?: TimeSlotConfig;
  /** Service pricing per occurrence */
  servicePricing?: {
    basePrice: number;
    currency: string;
  };
  /** Form submission handler */
  onSubmit?: (data: RecurringBookingData) => void | Promise<void>;
  /** Form data change handler */
  onChange?: (data: Partial<RecurringBookingData>) => void;
  /** Pattern validation handler */
  onValidatePattern?: (pattern: RecurrencePattern, start: Date) => Promise<OccurrencePreview[]>;
  /** Whether form is loading */
  loading?: boolean;
  /** Whether form is disabled */
  disabled?: boolean;
  /** Form errors */
  errors?: FormErrors;
  /** Maximum occurrences allowed */
  maxOccurrences?: number;
  /** Minimum advance booking days */
  minAdvanceDays?: number;
  /** Maximum advance booking days */
  maxAdvanceDays?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Generate occurrence previews
 */
const generateOccurrencePreviews = (
  pattern: RecurrencePattern,
  startDate: Date,
  endCondition: RecurrenceEnd,
  maxPreview: number = 10
): OccurrencePreview[] => {
  const previews: OccurrencePreview[] = [];
  let currentDate = new Date(startDate);
  let occurrenceNumber = 1;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  while (previews.length < maxPreview) {
    // Check end conditions
    if (endCondition.type === 'after_occurrences' && 
        endCondition.occurrences && 
        occurrenceNumber > endCondition.occurrences) {
      break;
    }
    
    if (endCondition.type === 'on_date' && 
        endCondition.endDate && 
        currentDate > endCondition.endDate) {
      break;
    }
    
    // Add current occurrence
    previews.push({
      date: new Date(currentDate),
      number: occurrenceNumber,
    });
    
    // Calculate next occurrence
    switch (pattern.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + pattern.interval);
        break;
        
      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find next occurrence based on selected days
          let nextDay = new Date(currentDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          while (!pattern.daysOfWeek.includes(nextDay.getDay() as DayOfWeek)) {
            nextDay.setDate(nextDay.getDate() + 1);
          }
          
          currentDate = nextDay;
        } else {
          currentDate.setDate(currentDate.getDate() + (7 * pattern.interval));
        }
        break;
        
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + pattern.interval);
        break;
        
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + (3 * pattern.interval));
        break;
        
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + pattern.interval);
        break;
    }
    
    occurrenceNumber++;
  }
  
  return previews;
};

/**
 * Calculate total estimated cost
 */
const calculateTotalCost = (
  pricePerOccurrence: number,
  occurrenceCount: number,
  discount?: RecurringPricing['recurringDiscount'],
  setupFee?: number
): number => {
  let total = pricePerOccurrence * occurrenceCount;
  
  if (discount) {
    if (discount.type === 'percentage') {
      total = total * (1 - discount.value / 100);
    } else {
      total = total - (discount.value * occurrenceCount);
    }
  }
  
  if (setupFee) {
    total += setupFee;
  }
  
  return Math.max(0, total);
};

/**
 * Validate recurrence pattern
 */
const validatePattern = (pattern: RecurrencePattern): string | null => {
  if (pattern.interval < 1) {
    return 'Interval must be at least 1';
  }
  
  if (pattern.frequency === 'weekly' && 
      (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)) {
    return 'Please select at least one day of the week';
  }
  
  if (pattern.frequency === 'monthly' && pattern.monthlyPattern === 'same_date') {
    if (!pattern.dayOfMonth || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
      return 'Please select a valid day of the month';
    }
  }
  
  return null;
};

// === COMPONENT ===

/**
 * RecurringBookingForm - Setup recurring appointments
 * 
 * @example
 * ```tsx
 * const initialTimeSlot = {
 *   startTime: new Date('2024-01-15T10:00:00'),
 *   duration: 60
 * };
 * 
 * const servicePricing = {
 *   basePrice: 100,
 *   currency: 'USD'
 * };
 * 
 * <RecurringBookingForm
 *   serviceId="srv_123"
 *   providerId="prov_456"
 *   initialTimeSlot={initialTimeSlot}
 *   servicePricing={servicePricing}
 *   onSubmit={(data) => processRecurringBooking(data)}
 *   onValidatePattern={(pattern, start) => generatePreviews(pattern, start)}
 *   maxOccurrences={52}
 *   minAdvanceDays={1}
 *   maxAdvanceDays={365}
 * />
 * ```
 */
export default function RecurringBookingForm({
  serviceId,
  providerId,
  initialData = {},
  initialTimeSlot,
  servicePricing = { basePrice: 0, currency: 'USD' },
  onSubmit,
  onChange,
  onValidatePattern,
  loading = false,
  disabled = false,
  errors: externalErrors,
  maxOccurrences = 50,
  minAdvanceDays = 1,
  maxAdvanceDays = 365,
  testID = 'recurring-booking-form',
}: RecurringBookingFormProps) {
  
  // State
  const [formData, setFormData] = useState<RecurringBookingData>({
    serviceId: serviceId || '',
    providerId: providerId || '',
    pattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1], // Monday by default
    },
    timeSlot: initialTimeSlot || {
      startTime: new Date(),
      duration: 60,
    },
    endCondition: {
      type: 'after_occurrences',
      occurrences: 10,
    },
    startDate: new Date(),
    pricing: {
      pricePerOccurrence: servicePricing.basePrice,
      currency: servicePricing.currency,
      paymentFrequency: 'per_occurrence',
    },
    exceptions: [],
    ...initialData,
  });
  
  const [internalErrors, setInternalErrors] = useState<FormErrors>({ fields: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [occurrencePreviews, setOccurrencePreviews] = useState<OccurrencePreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // Use external errors if provided, otherwise use internal
  const formErrors = externalErrors || internalErrors;
  
  // Update form data
  const updateFormData = (updates: Partial<RecurringBookingData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange?.(newData);
  };

  // Update pattern
  const updatePattern = (updates: Partial<RecurrencePattern>) => {
    updateFormData({
      pattern: { ...formData.pattern, ...updates },
    });
  };

  // Update end condition
  const updateEndCondition = (updates: Partial<RecurrenceEnd>) => {
    updateFormData({
      endCondition: { ...formData.endCondition, ...updates },
    });
  };

  // Generate preview when pattern changes
  useEffect(() => {
    const generatePreview = async () => {
      if (onValidatePattern) {
        try {
          const previews = await onValidatePattern(formData.pattern, formData.startDate);
          setOccurrencePreviews(previews);
        } catch (error) {
          console.error('Preview generation failed:', error);
          const fallbackPreviews = generateOccurrencePreviews(
            formData.pattern,
            formData.startDate,
            formData.endCondition
          );
          setOccurrencePreviews(fallbackPreviews);
        }
      } else {
        const previews = generateOccurrencePreviews(
          formData.pattern,
          formData.startDate,
          formData.endCondition
        );
        setOccurrencePreviews(previews);
      }
    };

    generatePreview();
  }, [formData.pattern, formData.startDate, formData.endCondition, onValidatePattern]);

  // Calculate total cost
  const totalCost = calculateTotalCost(
    formData.pricing.pricePerOccurrence,
    formData.endCondition.type === 'after_occurrences' ? 
      (formData.endCondition.occurrences || 0) : 
      occurrencePreviews.length,
    formData.pricing.recurringDiscount,
    formData.pricing.setupFee
  );

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate pattern
      const patternError = validatePattern(formData.pattern);
      if (patternError) {
        setInternalErrors({
          fields: { pattern: patternError },
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate dates
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + minAdvanceDays);
      
      if (formData.startDate < minDate) {
        setInternalErrors({
          fields: { startDate: `Start date must be at least ${minAdvanceDays} days from now` },
        });
        setIsSubmitting(false);
        return;
      }
      
      // Clear errors and submit
      setInternalErrors({ fields: {} });
      await onSubmit?.(formData);
      
    } catch (error) {
      setInternalErrors({
        fields: {},
        general: ['An error occurred while setting up the recurring booking. Please try again.'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView className="flex-1" testID={testID}>
      <Card className="p-4 m-4">
        
        {/* General Errors */}
        {formErrors.general && formErrors.general.length > 0 && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {formErrors.general.map((error, index) => (
              <Text key={index} className="text-red-700">{error}</Text>
            ))}
          </View>
        )}

        {/* Frequency Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Recurrence Frequency
          </Text>
          
          <View className="space-y-2">
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as RecurrenceFrequency[]).map((freq) => (
              <TouchableOpacity
                key={freq}
                className={cn(
                  'p-3 rounded-lg border',
                  formData.pattern.frequency === freq
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                )}
                onPress={() => updatePattern({ frequency: freq })}
                disabled={disabled}
              >
                <Text className={cn(
                  'text-sm font-medium capitalize',
                  formData.pattern.frequency === freq ? 'text-blue-700' : 'text-gray-700'
                )}>
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {formErrors.fields.frequency && (
            <Text className="text-red-500 text-xs mt-1">{formErrors.fields.frequency}</Text>
          )}
        </View>

        {/* Interval Setting */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 mb-2">
            Repeat every
          </Text>
          <View className="flex-row items-center space-x-3">
            <View className="flex-1">
              <Input
                value={formData.pattern.interval.toString()}
                onChangeText={(text) => {
                  const interval = parseInt(text) || 1;
                  updatePattern({ interval: Math.max(1, interval) });
                }}
                keyboardType="numeric"
                placeholder="1"
                editable={!disabled}
              />
            </View>
            <Text className="text-sm text-gray-600">
              {formData.pattern.frequency === 'daily' ? 'day(s)' :
               formData.pattern.frequency === 'weekly' ? 'week(s)' :
               formData.pattern.frequency === 'monthly' ? 'month(s)' :
               formData.pattern.frequency === 'quarterly' ? 'quarter(s)' :
               'year(s)'}
            </Text>
          </View>
        </View>

        {/* Weekly Days Selection */}
        {formData.pattern.frequency === 'weekly' && (
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Days of the week
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {dayNames.map((day, index) => {
                const dayIndex = index as DayOfWeek;
                const isSelected = formData.pattern.daysOfWeek?.includes(dayIndex) || false;
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    className={cn(
                      'px-3 py-2 rounded-full border',
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    )}
                    onPress={() => {
                      const currentDays = formData.pattern.daysOfWeek || [];
                      const newDays = isSelected
                        ? currentDays.filter(d => d !== dayIndex)
                        : [...currentDays, dayIndex].sort();
                      updatePattern({ daysOfWeek: newDays });
                    }}
                    disabled={disabled}
                  >
                    <Text className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-blue-700' : 'text-gray-700'
                    )}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {formErrors.fields.pattern && (
              <Text className="text-red-500 text-xs mt-1">{formErrors.fields.pattern}</Text>
            )}
          </View>
        )}

        {/* Start Date */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 mb-2">
            Start Date
          </Text>
          <TouchableOpacity
            className="p-3 border border-gray-200 rounded-lg bg-white"
            onPress={() => {
              // In a real implementation, you'd open a date picker
              Alert.alert('Date Picker', 'Date picker would open here');
            }}
            disabled={disabled}
          >
            <Text className="text-sm text-gray-700">
              {formData.startDate.toLocaleDateString([], {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {formErrors.fields.startDate && (
            <Text className="text-red-500 text-xs mt-1">{formErrors.fields.startDate}</Text>
          )}
        </View>

        {/* End Condition */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            When to end
          </Text>
          
          <View className="space-y-3">
            {/* Never end */}
            <TouchableOpacity
              className={cn(
                'p-3 rounded-lg border',
                formData.endCondition.type === 'never'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              )}
              onPress={() => updateEndCondition({ type: 'never' })}
              disabled={disabled}
            >
              <Text className={cn(
                'text-sm font-medium',
                formData.endCondition.type === 'never' ? 'text-blue-700' : 'text-gray-700'
              )}>
                Never (until manually cancelled)
              </Text>
            </TouchableOpacity>
            
            {/* After number of occurrences */}
            <View
              className={cn(
                'p-3 rounded-lg border',
                formData.endCondition.type === 'after_occurrences'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              )}
            >
              <TouchableOpacity
                onPress={() => updateEndCondition({ type: 'after_occurrences' })}
                disabled={disabled}
              >
                <Text className={cn(
                  'text-sm font-medium mb-2',
                  formData.endCondition.type === 'after_occurrences' ? 'text-blue-700' : 'text-gray-700'
                )}>
                  After a certain number of sessions
                </Text>
              </TouchableOpacity>
              
              {formData.endCondition.type === 'after_occurrences' && (
                <View className="flex-row items-center space-x-2">
                  <Text className="text-sm text-gray-600">After</Text>
                  <View className="w-20">
                    <Input
                      value={(formData.endCondition.occurrences || 0).toString()}
                      onChangeText={(text) => {
                        const occurrences = parseInt(text) || 1;
                        updateEndCondition({ 
                          occurrences: Math.min(maxOccurrences, Math.max(1, occurrences))
                        });
                      }}
                      keyboardType="numeric"
                      placeholder="10"
                      editable={!disabled}
                    />
                  </View>
                  <Text className="text-sm text-gray-600">sessions</Text>
                </View>
              )}
            </View>
            
            {/* On specific date */}
            <View
              className={cn(
                'p-3 rounded-lg border',
                formData.endCondition.type === 'on_date'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              )}
            >
              <TouchableOpacity
                onPress={() => updateEndCondition({ type: 'on_date' })}
                disabled={disabled}
              >
                <Text className={cn(
                  'text-sm font-medium mb-2',
                  formData.endCondition.type === 'on_date' ? 'text-blue-700' : 'text-gray-700'
                )}>
                  On a specific date
                </Text>
              </TouchableOpacity>
              
              {formData.endCondition.type === 'on_date' && (
                <TouchableOpacity
                  className="p-2 border border-gray-200 rounded bg-white"
                  onPress={() => {
                    Alert.alert('Date Picker', 'End date picker would open here');
                  }}
                  disabled={disabled}
                >
                  <Text className="text-sm text-gray-700">
                    {formData.endCondition.endDate?.toLocaleDateString() || 'Select end date'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Pricing Summary */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Pricing Summary
          </Text>
          
          <View className="bg-gray-50 p-4 rounded-lg space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Price per session</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatCurrency(formData.pricing.pricePerOccurrence, formData.pricing.currency)}
              </Text>
            </View>
            
            {formData.endCondition.type === 'after_occurrences' && formData.endCondition.occurrences && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">
                  Total sessions ({formData.endCondition.occurrences})
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatCurrency(
                    formData.pricing.pricePerOccurrence * formData.endCondition.occurrences,
                    formData.pricing.currency
                  )}
                </Text>
              </View>
            )}
            
            {formData.pricing.recurringDiscount && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-green-600">
                  Recurring discount ({formData.pricing.recurringDiscount.description})
                </Text>
                <Text className="text-sm font-medium text-green-600">
                  -{formData.pricing.recurringDiscount.type === 'percentage' 
                    ? `${formData.pricing.recurringDiscount.value}%`
                    : formatCurrency(formData.pricing.recurringDiscount.value, formData.pricing.currency)
                  }
                </Text>
              </View>
            )}
            
            {formData.pricing.setupFee && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Setup fee</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatCurrency(formData.pricing.setupFee, formData.pricing.currency)}
                </Text>
              </View>
            )}
            
            <View className="border-t border-gray-200 pt-2">
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-gray-900">
                  Total estimated cost
                </Text>
                <Text className="text-base font-bold text-gray-900">
                  {formatCurrency(totalCost, formData.pricing.currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preview Button */}
        <Button
          onPress={() => setShowPreview(!showPreview)}
          variant="outline"
          className="mb-4"
        >
          <Text className="text-gray-700 font-medium">
            {showPreview ? 'Hide' : 'Show'} Schedule Preview
          </Text>
        </Button>

        {/* Schedule Preview */}
        {showPreview && (
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Upcoming Sessions ({occurrencePreviews.length} shown)
            </Text>
            
            {occurrencePreviews.length > 0 ? (
              <View className="space-y-2">
                {occurrencePreviews.slice(0, 10).map((preview) => (
                  <View
                    key={preview.number}
                    className="flex-row items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <View>
                      <Text className="text-sm font-medium text-gray-900">
                        Session #{preview.number}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {preview.date.toLocaleDateString([], {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    
                    <Text className="text-xs text-gray-500">
                      {formData.timeSlot.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                ))}
                
                {occurrencePreviews.length > 10 && (
                  <Text className="text-sm text-gray-500 text-center">
                    ... and {occurrencePreviews.length - 10} more sessions
                  </Text>
                )}
              </View>
            ) : (
              <Text className="text-sm text-gray-500 text-center py-4">
                No sessions generated. Please check your settings.
              </Text>
            )}
          </View>
        )}

        {/* Customer Notes */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 mb-2">
            Special Requests or Notes
          </Text>
          <Input
            value={formData.notes || ''}
            onChangeText={(text) => updateFormData({ notes: text })}
            placeholder="Any special requests or notes for your recurring sessions..."
            multiline={true}
            numberOfLines={3}
            editable={!disabled}
          />
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={disabled || isSubmitting || loading}
          className={cn(
            'w-full py-4',
            (disabled || isSubmitting || loading) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          <Text className="text-white font-semibold text-lg">
            {isSubmitting || loading ? 'Setting up...' : 'Setup Recurring Booking'}
          </Text>
        </Button>

        {/* Disclaimer */}
        <View className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text className="text-xs text-yellow-800">
            ⚠️ Recurring bookings can be modified or cancelled at any time. Changes will apply to future sessions only.
            You will receive notifications before each session according to your preferences.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

// === EXPORTS ===

export type {
  RecurringBookingFormProps,
  RecurringBookingData,
  RecurrencePattern,
  RecurrenceEnd,
  TimeSlotConfig,
  RecurringPricing,
  BookingException,
  OccurrencePreview,
  FormErrors as RecurringFormErrors,
  RecurrenceFrequency,
  RecurrenceEndType,
  DayOfWeek,
  MonthlyPattern,
};
