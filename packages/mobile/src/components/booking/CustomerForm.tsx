/**
 * CustomerForm - Reusable customer information form component
 * 
 * Handles customer details input for booking
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createBookingStyles } from '../../shared/styles/BookingStyles';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

interface CustomerFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: Partial<CustomerInfo>) => void;
  errors?: Record<string, string>;
  style?: any;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customerInfo,
  onCustomerInfoChange,
  errors = {},
  style,
}) => {
  const { theme } = useTheme();
  const styles = createBookingStyles(theme);

  const handleFieldChange = (field: keyof CustomerInfo) => (value: string) => {
    onCustomerInfoChange({ [field]: value });
  };

  return (
    <View style={[styles.formSection, style]}>
      <Text style={styles.formTitle}>Your Information</Text>

      {/* Name fields */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.formLabel}>First Name</Text>
          <TextInput
            style={[
              styles.formInput,
              errors.firstName && { borderColor: theme.colors.error },
            ]}
            value={customerInfo.firstName}
            onChangeText={handleFieldChange('firstName')}
            placeholder="Enter first name"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {errors.firstName && (
            <Text style={styles.formError}>{errors.firstName}</Text>
          )}
        </View>

        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.formLabel}>Last Name</Text>
          <TextInput
            style={[
              styles.formInput,
              errors.lastName && { borderColor: theme.colors.error },
            ]}
            value={customerInfo.lastName}
            onChangeText={handleFieldChange('lastName')}
            placeholder="Enter last name"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {errors.lastName && (
            <Text style={styles.formError}>{errors.lastName}</Text>
          )}
        </View>
      </View>

      {/* Email field */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Email Address</Text>
        <TextInput
          style={[
            styles.formInput,
            errors.email && { borderColor: theme.colors.error },
          ]}
          value={customerInfo.email}
          onChangeText={handleFieldChange('email')}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        {errors.email && (
          <Text style={styles.formError}>{errors.email}</Text>
        )}
      </View>

      {/* Phone field */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Phone Number</Text>
        <TextInput
          style={[
            styles.formInput,
            errors.phone && { borderColor: theme.colors.error },
          ]}
          value={customerInfo.phone}
          onChangeText={handleFieldChange('phone')}
          placeholder="Enter your phone number"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        {errors.phone && (
          <Text style={styles.formError}>{errors.phone}</Text>
        )}
      </View>

      {/* Notes field */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Additional Notes (Optional)</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          value={customerInfo.notes || ''}
          onChangeText={handleFieldChange('notes')}
          placeholder="Any special requests or notes..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          autoCapitalize="sentences"
        />
      </View>
    </View>
  );
};

export default CustomerForm;
