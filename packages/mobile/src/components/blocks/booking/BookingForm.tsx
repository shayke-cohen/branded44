/**
 * BookingForm Component - AI-Optimized React Native Component
 * 
 * A comprehensive booking form for service appointments and scheduling.
 * Features customer details, preferences, and booking confirmation.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Alert, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Textarea } from '../../../../~/components/ui/textarea';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Booking form field types
 */
export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date' | 'time';

/**
 * Form validation rules
 */
export interface ValidationRule {
  /** Rule type */
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  /** Rule value (for minLength, maxLength, pattern) */
  value?: any;
  /** Custom validation function */
  validator?: (value: any) => boolean;
  /** Error message */
  message: string;
}

/**
 * Form field configuration
 */
export interface FormField {
  /** Field identifier */
  id: string;
  /** Field label */
  label: string;
  /** Field type */
  type: FormFieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: any;
  /** Whether field is required */
  required?: boolean;
  /** Validation rules */
  validation?: ValidationRule[];
  /** Field options for select type */
  options?: Array<{ label: string; value: any }>;
  /** Field help text */
  helpText?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field icon */
  icon?: string;
  /** Field group */
  group?: string;
}

/**
 * Customer information
 */
export interface CustomerInfo {
  /** Customer name */
  name: string;
  /** Customer email */
  email: string;
  /** Customer phone */
  phone: string;
  /** Customer address */
  address?: string;
  /** Customer date of birth */
  dateOfBirth?: Date;
  /** Customer gender */
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  /** Emergency contact */
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  /** Customer notes */
  notes?: string;
}

/**
 * Booking preferences
 */
export interface BookingPreferences {
  /** Preferred communication method */
  communicationMethod: 'email' | 'phone' | 'sms' | 'app';
  /** Reminder preferences */
  reminders: {
    email: boolean;
    sms: boolean;
    push: boolean;
    timeBefore: number; // minutes
  };
  /** Accessibility requirements */
  accessibility?: string[];
  /** Special requests */
  specialRequests?: string;
  /** Dietary restrictions (for relevant services) */
  dietaryRestrictions?: string[];
  /** Medical conditions */
  medicalConditions?: string;
  /** Previous experience level */
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Payment information
 */
export interface PaymentInfo {
  /** Payment method */
  method: 'card' | 'cash' | 'paypal' | 'apple_pay' | 'google_pay';
  /** Whether to save payment method */
  savePaymentMethod?: boolean;
  /** Billing address same as service address */
  billingSameAsService?: boolean;
  /** Billing address */
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Booking form data
 */
export interface BookingFormData {
  /** Customer information */
  customer: CustomerInfo;
  /** Booking preferences */
  preferences: BookingPreferences;
  /** Payment information */
  payment?: PaymentInfo;
  /** Additional form fields */
  customFields: Record<string, any>;
  /** Terms and conditions accepted */
  termsAccepted: boolean;
  /** Privacy policy accepted */
  privacyAccepted: boolean;
  /** Marketing emails consent */
  marketingConsent?: boolean;
}

/**
 * Form errors
 */
export interface FormErrors {
  /** Field-specific errors */
  fields: Record<string, string>;
  /** General form errors */
  general?: string[];
}

/**
 * BookingForm component props
 */
export interface BookingFormProps {
  /** Service ID being booked */
  serviceId?: string;
  /** Provider ID being booked */
  providerId?: string;
  /** Selected time slot */
  timeSlot?: {
    startTime: Date;
    endTime: Date;
    price: number;
    currency: string;
  };
  /** Initial form data */
  initialData?: Partial<BookingFormData>;
  /** Custom form fields */
  customFields?: FormField[];
  /** Form submission handler */
  onSubmit?: (data: BookingFormData) => void | Promise<void>;
  /** Form data change handler */
  onChange?: (data: Partial<BookingFormData>) => void;
  /** Form validation handler */
  onValidate?: (data: BookingFormData, errors: FormErrors) => FormErrors;
  /** Whether form requires payment info */
  requiresPayment?: boolean;
  /** Whether to show customer info section */
  showCustomerInfo?: boolean;
  /** Whether to show preferences section */
  showPreferences?: boolean;
  /** Whether to show custom fields */
  showCustomFields?: boolean;
  /** Whether form is loading */
  loading?: boolean;
  /** Whether form is disabled */
  disabled?: boolean;
  /** Form errors */
  errors?: FormErrors;
  /** Success message */
  successMessage?: string;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Validate form field
 */
const validateField = (value: any, field: FormField): string | null => {
  if (!field.validation) return null;
  
  for (const rule of field.validation) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return rule.message;
        }
        break;
      case 'phone':
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (value && !phoneRegex.test(value)) {
          return rule.message;
        }
        break;
      case 'minLength':
        if (value && value.length < rule.value) {
          return rule.message;
        }
        break;
      case 'maxLength':
        if (value && value.length > rule.value) {
          return rule.message;
        }
        break;
      case 'pattern':
        if (value && !new RegExp(rule.value).test(value)) {
          return rule.message;
        }
        break;
      case 'custom':
        if (rule.validator && value && !rule.validator(value)) {
          return rule.message;
        }
        break;
    }
  }
  
  return null;
};

/**
 * Validate entire form
 */
const validateForm = (data: BookingFormData, customFields: FormField[]): FormErrors => {
  const errors: FormErrors = { fields: {} };
  
  // Validate customer info
  if (!data.customer.name?.trim()) {
    errors.fields.name = 'Name is required';
  }
  if (!data.customer.email?.trim()) {
    errors.fields.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer.email)) {
    errors.fields.email = 'Please enter a valid email address';
  }
  if (!data.customer.phone?.trim()) {
    errors.fields.phone = 'Phone number is required';
  }
  
  // Validate custom fields
  customFields.forEach(field => {
    const value = data.customFields[field.id];
    const fieldError = validateField(value, field);
    if (fieldError) {
      errors.fields[field.id] = fieldError;
    }
  });
  
  // Validate terms acceptance
  if (!data.termsAccepted) {
    errors.fields.termsAccepted = 'You must accept the terms and conditions';
  }
  if (!data.privacyAccepted) {
    errors.fields.privacyAccepted = 'You must accept the privacy policy';
  }
  
  return errors;
};

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
 * Format date and time
 */
const formatDateTime = (date: Date): string => {
  return date.toLocaleString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// === COMPONENT ===

/**
 * BookingForm - Comprehensive booking form
 * 
 * @example
 * ```tsx
 * const timeSlot = {
 *   startTime: new Date('2024-01-15T10:00:00'),
 *   endTime: new Date('2024-01-15T11:00:00'),
 *   price: 100,
 *   currency: 'USD'
 * };
 * 
 * const customFields = [
 *   {
 *     id: 'experience',
 *     label: 'Experience Level',
 *     type: 'select',
 *     required: true,
 *     options: [
 *       { label: 'Beginner', value: 'beginner' },
 *       { label: 'Intermediate', value: 'intermediate' },
 *       { label: 'Advanced', value: 'advanced' }
 *     ]
 *   }
 * ];
 * 
 * <BookingForm
 *   serviceId="srv_123"
 *   providerId="prov_456"
 *   timeSlot={timeSlot}
 *   customFields={customFields}
 *   onSubmit={(data) => processBooking(data)}
 *   requiresPayment={true}
 *   showPreferences={true}
 * />
 * ```
 */
export default function BookingForm({
  serviceId,
  providerId,
  timeSlot,
  initialData = {},
  customFields = [],
  onSubmit,
  onChange,
  onValidate,
  requiresPayment = false,
  showCustomerInfo = true,
  showPreferences = true,
  showCustomFields = true,
  loading = false,
  disabled = false,
  errors: externalErrors,
  successMessage,
  testID = 'booking-form',
}: BookingFormProps) {
  
  // State
  const [formData, setFormData] = useState<BookingFormData>({
    customer: {
      name: '',
      email: '',
      phone: '',
      ...initialData.customer,
    },
    preferences: {
      communicationMethod: 'email',
      reminders: {
        email: true,
        sms: false,
        push: true,
        timeBefore: 60,
      },
      ...initialData.preferences,
    },
    payment: initialData.payment,
    customFields: initialData.customFields || {},
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false,
    ...initialData,
  });
  
  const [internalErrors, setInternalErrors] = useState<FormErrors>({ fields: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use external errors if provided, otherwise use internal
  const formErrors = externalErrors || internalErrors;
  
  // Refs for form fields
  const fieldRefs = useRef<Record<string, RNTextInput | null>>({});

  // Update form data
  const updateFormData = (updates: Partial<BookingFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange?.(newData);
  };

  // Update customer info
  const updateCustomer = (updates: Partial<CustomerInfo>) => {
    updateFormData({
      customer: { ...formData.customer, ...updates },
    });
  };

  // Update preferences
  const updatePreferences = (updates: Partial<BookingPreferences>) => {
    updateFormData({
      preferences: { ...formData.preferences, ...updates },
    });
  };

  // Update custom field
  const updateCustomField = (fieldId: string, value: any) => {
    updateFormData({
      customFields: { ...formData.customFields, [fieldId]: value },
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate form
      let errors = validateForm(formData, customFields);
      
      // Apply custom validation if provided
      if (onValidate) {
        errors = onValidate(formData, errors);
      }
      
      if (Object.keys(errors.fields).length > 0 || errors.general?.length) {
        setInternalErrors(errors);
        setIsSubmitting(false);
        return;
      }
      
      // Clear errors and submit
      setInternalErrors({ fields: {} });
      await onSubmit?.(formData);
      
    } catch (error) {
      setInternalErrors({
        fields: {},
        general: ['An error occurred while submitting the form. Please try again.'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form field
  const renderFormField = (field: FormField) => {
    const value = formData.customFields[field.id] || field.defaultValue || '';
    const error = formErrors.fields[field.id];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <Text className="text-red-500">*</Text>}
            </Text>
            <Input
              ref={(ref) => { fieldRefs.current[field.id] = ref; }}
              placeholder={field.placeholder}
              value={value}
              onChangeText={(text) => updateCustomField(field.id, text)}
              keyboardType={field.type === 'email' ? 'email-address' : field.type === 'phone' ? 'phone-pad' : 'default'}
              editable={!field.disabled && !disabled}
              className={cn(error && 'border-red-500')}
            />
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
            {field.helpText && <Text className="text-gray-500 text-xs mt-1">{field.helpText}</Text>}
          </View>
        );
        
      case 'textarea':
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <Text className="text-red-500">*</Text>}
            </Text>
            <Textarea
              placeholder={field.placeholder}
              value={value}
              onChangeText={(text) => updateCustomField(field.id, text)}
              editable={!field.disabled && !disabled}
              className={cn(error && 'border-red-500')}
              numberOfLines={4}
            />
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
            {field.helpText && <Text className="text-gray-500 text-xs mt-1">{field.helpText}</Text>}
          </View>
        );
        
      case 'select':
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <Text className="text-red-500">*</Text>}
            </Text>
            <View className="space-y-2">
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={cn(
                    'p-3 rounded-lg border',
                    value === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  )}
                  onPress={() => updateCustomField(field.id, option.value)}
                  disabled={field.disabled || disabled}
                >
                  <Text className={cn(
                    'text-sm',
                    value === option.value ? 'text-blue-700 font-medium' : 'text-gray-700'
                  )}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
            {field.helpText && <Text className="text-gray-500 text-xs mt-1">{field.helpText}</Text>}
          </View>
        );
        
      case 'checkbox':
        return (
          <View key={field.id} className="mb-4">
            <View className="flex-row items-center">
              <Checkbox
                checked={!!value}
                onCheckedChange={(checked) => updateCustomField(field.id, checked)}
                disabled={field.disabled || disabled}
              />
              <Text className="text-sm text-gray-700 ml-2">
                {field.label} {field.required && <Text className="text-red-500">*</Text>}
              </Text>
            </View>
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
            {field.helpText && <Text className="text-gray-500 text-xs mt-1">{field.helpText}</Text>}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <ScrollView className="flex-1" testID={testID}>
      <Card className="p-4 m-4">
        
        {/* Success Message */}
        {successMessage && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <Text className="text-green-700">{successMessage}</Text>
          </View>
        )}
        
        {/* General Errors */}
        {formErrors.general && formErrors.general.length > 0 && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {formErrors.general.map((error, index) => (
              <Text key={index} className="text-red-700">{error}</Text>
            ))}
          </View>
        )}

        {/* Booking Summary */}
        {timeSlot && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Booking Summary
            </Text>
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-sm font-medium text-blue-900 mb-1">
                {formatDateTime(timeSlot.startTime)}
              </Text>
              <Text className="text-sm text-blue-700 mb-2">
                Duration: {Math.round((timeSlot.endTime.getTime() - timeSlot.startTime.getTime()) / 60000)} minutes
              </Text>
              <Text className="text-lg font-bold text-blue-900">
                {formatCurrency(timeSlot.price, timeSlot.currency)}
              </Text>
            </View>
          </View>
        )}

        {/* Customer Information */}
        {showCustomerInfo && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Full Name <Text className="text-red-500">*</Text>
              </Text>
              <Input
                placeholder="Enter your full name"
                value={formData.customer.name}
                onChangeText={(text) => updateCustomer({ name: text })}
                editable={!disabled}
                className={cn(formErrors.fields.name && 'border-red-500')}
              />
              {formErrors.fields.name && (
                <Text className="text-red-500 text-xs mt-1">{formErrors.fields.name}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address <Text className="text-red-500">*</Text>
              </Text>
              <Input
                placeholder="Enter your email"
                value={formData.customer.email}
                onChangeText={(text) => updateCustomer({ email: text })}
                keyboardType="email-address"
                editable={!disabled}
                className={cn(formErrors.fields.email && 'border-red-500')}
              />
              {formErrors.fields.email && (
                <Text className="text-red-500 text-xs mt-1">{formErrors.fields.email}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone Number <Text className="text-red-500">*</Text>
              </Text>
              <Input
                placeholder="Enter your phone number"
                value={formData.customer.phone}
                onChangeText={(text) => updateCustomer({ phone: text })}
                keyboardType="phone-pad"
                editable={!disabled}
                className={cn(formErrors.fields.phone && 'border-red-500')}
              />
              {formErrors.fields.phone && (
                <Text className="text-red-500 text-xs mt-1">{formErrors.fields.phone}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </Text>
              <Textarea
                placeholder="Any special requests or notes..."
                value={formData.customer.notes || ''}
                onChangeText={(text) => updateCustomer({ notes: text })}
                editable={!disabled}
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Preferences */}
        {showPreferences && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Preferences
            </Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Preferred Communication Method
              </Text>
              <View className="space-y-2">
                {[
                  { label: 'Email', value: 'email' },
                  { label: 'Phone Call', value: 'phone' },
                  { label: 'Text Message', value: 'sms' },
                  { label: 'App Notification', value: 'app' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={cn(
                      'p-3 rounded-lg border',
                      formData.preferences.communicationMethod === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    )}
                    onPress={() => updatePreferences({ communicationMethod: option.value as any })}
                    disabled={disabled}
                  >
                    <Text className={cn(
                      'text-sm',
                      formData.preferences.communicationMethod === option.value 
                        ? 'text-blue-700 font-medium' 
                        : 'text-gray-700'
                    )}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Reminders
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Checkbox
                    checked={formData.preferences.reminders.email}
                    onCheckedChange={(checked) => updatePreferences({
                      reminders: { ...formData.preferences.reminders, email: checked }
                    })}
                    disabled={disabled}
                  />
                  <Text className="text-sm text-gray-700 ml-2">Email reminders</Text>
                </View>
                <View className="flex-row items-center">
                  <Checkbox
                    checked={formData.preferences.reminders.sms}
                    onCheckedChange={(checked) => updatePreferences({
                      reminders: { ...formData.preferences.reminders, sms: checked }
                    })}
                    disabled={disabled}
                  />
                  <Text className="text-sm text-gray-700 ml-2">SMS reminders</Text>
                </View>
                <View className="flex-row items-center">
                  <Checkbox
                    checked={formData.preferences.reminders.push}
                    onCheckedChange={(checked) => updatePreferences({
                      reminders: { ...formData.preferences.reminders, push: checked }
                    })}
                    disabled={disabled}
                  />
                  <Text className="text-sm text-gray-700 ml-2">Push notifications</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Custom Fields */}
        {showCustomFields && customFields.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </Text>
            {customFields.map(renderFormField)}
          </View>
        )}

        {/* Terms and Conditions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Terms & Conditions
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <Checkbox
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => updateFormData({ termsAccepted: checked })}
                disabled={disabled}
              />
              <Text className="text-sm text-gray-700 ml-2 flex-1">
                I accept the{' '}
                <Text className="text-blue-600 underline">terms and conditions</Text>
                {' '}and{' '}
                <Text className="text-blue-600 underline">cancellation policy</Text>
                <Text className="text-red-500"> *</Text>
              </Text>
            </View>
            {formErrors.fields.termsAccepted && (
              <Text className="text-red-500 text-xs">{formErrors.fields.termsAccepted}</Text>
            )}
            
            <View className="flex-row items-start">
              <Checkbox
                checked={formData.privacyAccepted}
                onCheckedChange={(checked) => updateFormData({ privacyAccepted: checked })}
                disabled={disabled}
              />
              <Text className="text-sm text-gray-700 ml-2 flex-1">
                I accept the{' '}
                <Text className="text-blue-600 underline">privacy policy</Text>
                <Text className="text-red-500"> *</Text>
              </Text>
            </View>
            {formErrors.fields.privacyAccepted && (
              <Text className="text-red-500 text-xs">{formErrors.fields.privacyAccepted}</Text>
            )}
            
            <View className="flex-row items-start">
              <Checkbox
                checked={formData.marketingConsent || false}
                onCheckedChange={(checked) => updateFormData({ marketingConsent: checked })}
                disabled={disabled}
              />
              <Text className="text-sm text-gray-700 ml-2 flex-1">
                I would like to receive marketing emails and promotional offers
              </Text>
            </View>
          </View>
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
            {isSubmitting || loading ? 'Processing...' : 'Book Appointment'}
          </Text>
        </Button>

        {/* Security Notice */}
        <View className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Text className="text-xs text-gray-600 text-center">
            🔒 Your information is secure and encrypted. We will never share your personal details with third parties.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

// === EXPORTS ===

export type {
  BookingFormProps,
  BookingFormData,
  CustomerInfo,
  BookingPreferences,
  PaymentInfo,
  FormField,
  FormFieldType,
  ValidationRule,
  FormErrors,
};
