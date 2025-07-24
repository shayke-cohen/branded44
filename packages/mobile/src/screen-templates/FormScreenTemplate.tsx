import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Alert } from '../utils/alert';
import {useTheme} from '../context';

// Define your form data type here
interface FormData {
  name: string;
  email: string;
  phone: string;
  description: string;
}

interface FormScreenTemplateProps {
  title?: string;
  initialData?: Partial<FormData>;
  onSave?: (data: FormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  loading?: boolean;
  testIDPrefix?: string;
}

const FormScreenTemplate: React.FC<FormScreenTemplateProps> = ({
  title = 'Form Screen',
  initialData = {},
  onSave,
  onCancel,
  isEditing = false,
  loading = false,
  testIDPrefix = '',
}) => {
  const {theme} = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    description: initialData.description || '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    cancelButton: {
      padding: 8,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    fieldContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    requiredAsterisk: {
      color: theme.colors.error,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      minHeight: 48,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    buttonContainer: {
      padding: 16,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      opacity: loading ? 0.6 : 1,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Optional field validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (loading) return;

    if (validateForm()) {
      onSave?.(formData);
    } else {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
    }
  };

  const renderField = (
    key: keyof FormData,
    label: string,
    required = false,
    multiline = false,
    placeholder?: string
  ) => (
    <View style={styles.fieldContainer} key={key}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          errors[key] && styles.inputError,
        ]}
        value={formData[key]}
        onChangeText={(value) => updateField(key, value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.colors.textSecondary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
                        testID={`${testIDPrefix}${key}-input`}
        keyboardType={
          key === 'email' ? 'email-address' : 
          key === 'phone' ? 'phone-pad' : 'default'
        }
        autoCapitalize={
          key === 'email' ? 'none' : 
          key === 'name' ? 'words' : 'sentences'
        }
        autoCorrect={key !== 'email'}
      />
      {errors[key] && (
        <Text style={styles.errorText}>{errors[key]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            testID={`${testIDPrefix}cancel-button`}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {renderField('name', 'Full Name', true)}
        {renderField('email', 'Email Address', true)}
        {renderField('phone', 'Phone Number', true)}
        {renderField('description', 'Description', false, true, 'Optional description...')}

        {/* Add more fields as needed */}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
          testID="save-button">
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default FormScreenTemplate; 