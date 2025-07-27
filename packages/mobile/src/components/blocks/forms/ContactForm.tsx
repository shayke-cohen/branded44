import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { validateEmail, validateField, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Contact form data interface
 */
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
}

/**
 * Properties for the ContactForm component
 */
export interface ContactFormProps extends BaseComponentProps {
  /** Callback when form is submitted */
  onSubmit: (data: ContactFormData) => Promise<void>;
  /** Callback for error handling */
  onError?: (error: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Show optional fields */
  showOptionalFields?: boolean;
  /** Required fields configuration */
  requiredFields?: (keyof ContactFormData)[];
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
}

/**
 * Form validation errors
 */
export interface ContactFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  company?: string;
  general?: string;
}

/**
 * ContactForm - AI-optimized contact form component
 * 
 * A comprehensive contact form with validation, optional fields,
 * and customizable requirements. Perfect for customer inquiries.
 * 
 * @example
 * ```tsx
 * <ContactForm
 *   onSubmit={(data) => handleContactSubmission(data)}
 *   showOptionalFields={true}
 *   requiredFields={['firstName', 'email', 'message']}
 *   title="Get in Touch"
 * />
 * ```
 */
const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  onError,
  loading = false,
  showOptionalFields = true,
  requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'],
  title = "Contact Us",
  description = "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  style,
  testID = 'contact-form',
  ...props
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    company: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Updates form field value
   */
  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Marks field as touched
   */
  const handleFieldBlur = (field: keyof ContactFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  /**
   * Validates individual field
   */
  const validateField = (field: keyof ContactFormData): boolean => {
    const value = formData[field];
    const isRequired = requiredFields.includes(field);
    let error = '';

    if (isRequired && !value?.trim()) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else if (field === 'email' && value && !validateEmail(value)) {
      error = 'Please enter a valid email address';
    } else if (field === 'phone' && value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
      error = 'Please enter a valid phone number';
    } else if (field === 'message' && value && value.length < 10) {
      error = 'Message must be at least 10 characters long';
    }

    setErrors(prev => ({ ...prev, [field]: error || undefined }));
    return !error;
  };

  /**
   * Validates entire form
   */
  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {};
    let isValid = true;

    // Validate all required fields
    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Validate optional fields if they have values
    Object.keys(formData).forEach(key => {
      const field = key as keyof ContactFormData;
      if (!requiredFields.includes(field) && formData[field]) {
        if (!validateField(field)) {
          isValid = false;
        }
      }
    });

    return isValid;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    // Mark all fields as touched
    const allFields = Object.keys(formData) as (keyof ContactFormData)[];
    const touchedState = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(touchedState);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        company: '',
      });
      setTouched({});
      setErrors({});
      
      Alert.alert('Success', 'Thank you for your message! We\'ll get back to you soon.', [{ text: 'OK' }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    }
  };

  const isFieldRequired = (field: keyof ContactFormData) => requiredFields.includes(field);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    card: {
      padding: SPACING.lg,
      margin: SPACING.md,
    },
    header: {
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.neutral[900],
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral[600],
      textAlign: 'center',
      lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    },
    row: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    halfWidth: {
      flex: 1,
    },
    inputContainer: {
      marginBottom: SPACING.md,
    },
    label: {
      marginBottom: SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
    },
    required: {
      color: COLORS.error[600],
      marginLeft: SPACING.xs,
    },
    input: {
      marginBottom: SPACING.xs,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    errorText: {
      color: COLORS.error[600],
      fontSize: TYPOGRAPHY.fontSize.sm,
      marginTop: SPACING.xs,
    },
    generalError: {
      backgroundColor: COLORS.error[50],
      padding: SPACING.md,
      borderRadius: 8,
      marginBottom: SPACING.md,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.error[600],
    },
    submitButton: {
      backgroundColor: COLORS.primary[600],
      marginTop: SPACING.md,
    },
    optionalText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral[500],
      textAlign: 'center',
      marginBottom: SPACING.lg,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      <Card style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {showOptionalFields && (
          <Text style={styles.optionalText}>
            Fields marked with * are required
          </Text>
        )}

        {/* General Error */}
        {errors.general && (
          <View style={styles.generalError}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Name Fields */}
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <View style={styles.inputContainer}>
              <View style={styles.label}>
                <Label>First Name</Label>
                {isFieldRequired('firstName') && <Text style={styles.required}>*</Text>}
              </View>
              <Input
                style={styles.input}
                placeholder="Enter first name"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                onBlur={() => handleFieldBlur('firstName')}
                editable={!loading}
                testID="first-name-input"
              />
              {touched.firstName && errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>
          </View>

          <View style={styles.halfWidth}>
            <View style={styles.inputContainer}>
              <View style={styles.label}>
                <Label>Last Name</Label>
                {isFieldRequired('lastName') && <Text style={styles.required}>*</Text>}
              </View>
              <Input
                style={styles.input}
                placeholder="Enter last name"
                value={formData.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                onBlur={() => handleFieldBlur('lastName')}
                editable={!loading}
                testID="last-name-input"
              />
              {touched.lastName && errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <View style={styles.label}>
            <Label>Email Address</Label>
            {isFieldRequired('email') && <Text style={styles.required}>*</Text>}
          </View>
          <Input
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            onBlur={() => handleFieldBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            testID="email-input"
          />
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Phone and Company (Optional) */}
        {showOptionalFields && (
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={styles.inputContainer}>
                <View style={styles.label}>
                  <Label>Phone Number</Label>
                  {isFieldRequired('phone') && <Text style={styles.required}>*</Text>}
                </View>
                <Input
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChangeText={(value) => updateField('phone', value)}
                  onBlur={() => handleFieldBlur('phone')}
                  keyboardType="phone-pad"
                  editable={!loading}
                  testID="phone-input"
                />
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.halfWidth}>
              <View style={styles.inputContainer}>
                <View style={styles.label}>
                  <Label>Company</Label>
                  {isFieldRequired('company') && <Text style={styles.required}>*</Text>}
                </View>
                <Input
                  style={styles.input}
                  placeholder="Enter company name"
                  value={formData.company}
                  onChangeText={(value) => updateField('company', value)}
                  onBlur={() => handleFieldBlur('company')}
                  editable={!loading}
                  testID="company-input"
                />
                {touched.company && errors.company && (
                  <Text style={styles.errorText}>{errors.company}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Subject Field */}
        <View style={styles.inputContainer}>
          <View style={styles.label}>
            <Label>Subject</Label>
            {isFieldRequired('subject') && <Text style={styles.required}>*</Text>}
          </View>
          <Input
            style={styles.input}
            placeholder="Enter subject"
            value={formData.subject}
            onChangeText={(value) => updateField('subject', value)}
            onBlur={() => handleFieldBlur('subject')}
            editable={!loading}
            testID="subject-input"
          />
          {touched.subject && errors.subject && (
            <Text style={styles.errorText}>{errors.subject}</Text>
          )}
        </View>

        {/* Message Field */}
        <View style={styles.inputContainer}>
          <View style={styles.label}>
            <Label>Message</Label>
            {isFieldRequired('message') && <Text style={styles.required}>*</Text>}
          </View>
          <Input
            style={[styles.input, styles.textArea]}
            placeholder="Enter your message..."
            value={formData.message}
            onChangeText={(value) => updateField('message', value)}
            onBlur={() => handleFieldBlur('message')}
            multiline={true}
            numberOfLines={4}
            editable={!loading}
            testID="message-input"
          />
          {touched.message && errors.message && (
            <Text style={styles.errorText}>{errors.message}</Text>
          )}
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitButton}
          testID="submit-button"
        >
          <Text>{loading ? 'Sending...' : 'Send Message'}</Text>
        </Button>
      </Card>
    </View>
  );
};

export default ContactForm; 