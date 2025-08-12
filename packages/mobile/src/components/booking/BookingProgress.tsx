/**
 * BookingProgress - Reusable booking progress indicator component
 * 
 * Shows current step in the booking flow
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createBookingStyles } from '../../shared/styles/BookingStyles';
import type { BookingStep } from '../../shared/hooks/useBookingFlow';

interface BookingProgressProps {
  currentStep: BookingStep;
  steps?: Array<{ key: BookingStep; label: string }>;
  style?: any;
}

const DEFAULT_STEPS = [
  { key: 'datetime' as BookingStep, label: 'Date & Time' },
  { key: 'details' as BookingStep, label: 'Details' },
  { key: 'confirmation' as BookingStep, label: 'Confirmation' },
];

export const BookingProgress: React.FC<BookingProgressProps> = ({
  currentStep,
  steps = DEFAULT_STEPS,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createBookingStyles(theme);

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <View style={[styles.progressContainer, style]}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          
          return (
            <View
              key={step.key}
              style={[
                styles.progressStep,
                isCompleted && styles.progressStepCompleted,
                isActive && styles.progressStepActive,
              ]}
            />
          );
        })}
      </View>

      {/* Progress Labels */}
      <View style={styles.progressLabels}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          
          return (
            <Text
              key={step.key}
              style={[
                styles.progressLabel,
                isActive && styles.progressLabelActive,
              ]}
            >
              {step.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

export default BookingProgress;
