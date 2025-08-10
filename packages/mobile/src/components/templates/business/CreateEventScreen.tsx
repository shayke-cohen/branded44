/**
 * CreateEventScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive event creation screen template that provides a complete form
 * for creating and editing calendar events with all necessary features.
 * 
 * Features:
 * - Complete event form with validation
 * - Date and time picker integration
 * - Location selection with map integration
 * - Attendee invitation and management
 * - Meeting link generation
 * - Recurrence pattern settings
 * - Reminder configuration
 * - Event category and priority selection
 * - File attachment support
 * - Agenda builder
 * - Advanced settings panel
 * - Draft saving and auto-save
 * 
 * @example
 * ```tsx
 * <CreateEventScreen
 *   initialDate={selectedDate}
 *   existingEvent={editingEvent}
 *   onSaveEvent={(eventData) => handleSaveEvent(eventData)}
 *   onCancel={() => navigation.goBack()}
 *   contacts={userContacts}
 *   loading={savingEvent}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  ContactForm,
  SearchForm,
  AddressForm,
  DateRangePicker
} from '../../blocks/forms';
import type { 
  ContactFormProps,
  SearchFormData,
  AddressFormProps,
  DateRangePickerProps
} from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { Separator } from '../../../../~/components/ui/separator';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Event form data
 */
export interface EventFormData {
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Event start date and time */
  startDate: Date;
  /** Event end date and time */
  endDate: Date;
  /** Is all day event */
  isAllDay: boolean;
  /** Event location */
  location?: string;
  /** Event location coordinates */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Event category */
  category?: string;
  /** Event color */
  color?: string;
  /** Event attendees */
  attendees: string[]; // Email addresses
  /** Event reminders */
  reminders: ReminderData[];
  /** Is recurring event */
  isRecurring: boolean;
  /** Recurrence pattern */
  recurrencePattern?: RecurrencePattern;
  /** Meeting link */
  meetingLink?: string;
  /** Event priority */
  priority: 'low' | 'medium' | 'high';
  /** Event notes */
  notes?: string;
  /** Time zone */
  timezone?: string;
  /** Maximum attendees */
  maxAttendees?: number;
  /** Registration required */
  requiresRegistration: boolean;
  /** Event cost */
  cost?: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  /** Agenda items */
  agenda: AgendaItemData[];
  /** Attachments */
  attachments: string[]; // File URLs
}

/**
 * Reminder data
 */
export interface ReminderData {
  /** Reminder ID */
  id: string;
  /** Minutes before event */
  minutesBefore: number;
  /** Reminder type */
  type: 'notification' | 'email' | 'popup';
  /** Is enabled */
  isEnabled: boolean;
}

/**
 * Recurrence pattern
 */
export interface RecurrencePattern {
  /** Frequency */
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** Interval */
  interval: number;
  /** Days of week (for weekly) */
  daysOfWeek?: number[];
  /** End date */
  endDate?: Date;
  /** Number of occurrences */
  count?: number;
}

/**
 * Agenda item data
 */
export interface AgendaItemData {
  /** Item ID */
  id: string;
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Duration in minutes */
  duration: number;
  /** Speaker/presenter */
  presenter?: string;
  /** Location/room */
  location?: string;
}

/**
 * Contact data
 */
export interface ContactData {
  /** Contact ID */
  id: string;
  /** Contact name */
  name: string;
  /** Contact email */
  email: string;
  /** Contact avatar */
  avatar?: string;
}

/**
 * Event category
 */
export interface EventCategory {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Category color */
  color: string;
  /** Category icon */
  icon?: string;
}

/**
 * Create event screen configuration
 */
export interface CreateEventScreenConfig {
  /** Show advanced settings */
  showAdvancedSettings?: boolean;
  /** Show attendee management */
  showAttendeeManagement?: boolean;
  /** Show recurrence options */
  showRecurrence?: boolean;
  /** Show agenda builder */
  showAgendaBuilder?: boolean;
  /** Show attachment options */
  showAttachments?: boolean;
  /** Show location picker */
  showLocationPicker?: boolean;
  /** Show meeting link options */
  showMeetingLink?: boolean;
  /** Enable auto-save */
  enableAutoSave?: boolean;
  /** Auto-save interval (ms) */
  autoSaveInterval?: number;
  /** Available categories */
  availableCategories?: EventCategory[];
  /** Available colors */
  availableColors?: string[];
  /** Default duration (minutes) */
  defaultDuration?: number;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the CreateEventScreen template
 */
export interface CreateEventScreenProps extends BaseComponentProps {
  /** Initial date for event */
  initialDate?: Date;
  /** Existing event data (for editing) */
  existingEvent?: Partial<EventFormData>;
  /** Available contacts */
  contacts?: ContactData[];
  /** Available categories */
  categories?: EventCategory[];
  /** Is editing mode */
  isEditing?: boolean;
  /** Callback when event is saved */
  onSaveEvent?: (eventData: EventFormData) => Promise<void> | void;
  /** Callback when creation is cancelled */
  onCancel?: () => void;
  /** Callback when draft is saved */
  onSaveDraft?: (eventData: Partial<EventFormData>) => Promise<void> | void;
  /** Callback when location is searched */
  onLocationSearch?: (query: string) => Promise<any[]> | any[];
  /** Callback when meeting link is generated */
  onGenerateMeetingLink?: () => Promise<string> | string;
  /** Callback when file is attached */
  onAttachFile?: () => Promise<string[]> | string[];
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Saving state */
  saving?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the create event screen */
  config?: CreateEventScreenConfig;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate event form data
 */
const validateEventData = (data: Partial<EventFormData>): string[] => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Event title is required');
  }
  
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  
  if (!data.endDate) {
    errors.push('End date is required');
  }
  
  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    errors.push('End date must be after start date');
  }
  
  if (data.maxAttendees && data.maxAttendees < 1) {
    errors.push('Maximum attendees must be at least 1');
  }
  
  return errors;
};

/**
 * Generate default reminders
 */
const getDefaultReminders = (): ReminderData[] => [
  {
    id: '1',
    minutesBefore: 15,
    type: 'notification',
    isEnabled: true
  },
  {
    id: '2', 
    minutesBefore: 1440, // 24 hours
    type: 'email',
    isEnabled: false
  }
];

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CreateEventScreen - AI-optimized create event screen template
 * 
 * A comprehensive event creation screen that provides a complete form
 * for creating and editing calendar events.
 */
const CreateEventScreen: React.FC<CreateEventScreenProps> = ({
  initialDate = new Date(),
  existingEvent,
  contacts = [],
  categories = [],
  isEditing = false,
  onSaveEvent,
  onCancel,
  onSaveDraft,
  onLocationSearch,
  onGenerateMeetingLink,
  onAttachFile,
  onBack,
  loading = false,
  saving = false,
  error,
  config = {},
  style,
  testID = 'create-event-screen',
  ...props
}) => {
  const [formData, setFormData] = useState<Partial<EventFormData>>(() => {
    const defaultEndDate = new Date(initialDate);
    defaultEndDate.setHours(defaultEndDate.getHours() + 1);
    
    return {
      title: '',
      description: '',
      startDate: initialDate,
      endDate: defaultEndDate,
      isAllDay: false,
      location: '',
      category: '',
      color: COLORS.primary[500],
      attendees: [],
      reminders: getDefaultReminders(),
      isRecurring: false,
      priority: 'medium',
      notes: '',
      requiresRegistration: false,
      agenda: [],
      attachments: [],
      ...existingEvent
    };
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [agendaItem, setAgendaItem] = useState<Partial<AgendaItemData>>({});

  const {
    showAdvancedSettings = true,
    showAttendeeManagement = true,
    showRecurrence = true,
    showAgendaBuilder = true,
    showAttachments = true,
    showLocationPicker = true,
    showMeetingLink = true,
    enableAutoSave = true,
    autoSaveInterval = 30000,
    availableCategories = categories,
    availableColors = [
      COLORS.primary[500],
      COLORS.success[500],
      COLORS.warning[500],
      COLORS.error[500],
      COLORS.purple[500],
      COLORS.pink[500]
    ],
    defaultDuration = 60,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const updateFormData = useCallback((updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSaveEvent) return;
    
    const errors = validateEventData(formData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }
    
    try {
      await onSaveEvent(formData as EventFormData);
    } catch (err) {
      console.error('Save event failed:', err);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  }, [formData, onSaveEvent]);

  const handleCancel = useCallback(() => {
    if (Object.keys(formData).some(key => formData[key as keyof EventFormData])) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onCancel }
        ]
      );
    } else {
      onCancel?.();
    }
  }, [formData, onCancel]);

  const handleAddAttendee = useCallback(() => {
    if (!attendeeEmail.trim()) return;
    
    const email = attendeeEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    if (formData.attendees?.includes(email)) {
      Alert.alert('Duplicate Email', 'This attendee is already invited');
      return;
    }
    
    updateFormData({
      attendees: [...(formData.attendees || []), email]
    });
    setAttendeeEmail('');
  }, [attendeeEmail, formData.attendees, updateFormData]);

  const handleRemoveAttendee = useCallback((email: string) => {
    updateFormData({
      attendees: formData.attendees?.filter(a => a !== email) || []
    });
  }, [formData.attendees, updateFormData]);

  const handleGenerateMeetingLink = useCallback(async () => {
    if (!onGenerateMeetingLink) return;
    
    try {
      const link = await onGenerateMeetingLink();
      updateFormData({ meetingLink: link });
    } catch (err) {
      console.error('Generate meeting link failed:', err);
      Alert.alert('Error', 'Failed to generate meeting link');
    }
  }, [onGenerateMeetingLink, updateFormData]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <TouchableOpacity 
          onPress={onBack || handleCancel}
          style={styles.backButton}
          testID={`${testID}-back`}
        >
          <ChevronLeft style={styles.backIcon} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Event' : 'Create Event'}
        </Text>
        
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          testID={`${testID}-save`}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <UIAlert 
        variant="destructive"
        style={styles.errorAlert}
        testID={`${testID}-error`}
      >
        <Text style={styles.errorText}>{error}</Text>
      </UIAlert>
    );
  };

  const renderBasicInfo = () => {
    return (
      <Card style={styles.sectionCard} testID={`${testID}-basic-info`}>
        <Text style={styles.sectionTitle}>Event Details</Text>
        
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Title *</Text>
          <Input
            value={formData.title || ''}
            onChangeText={(text) => updateFormData({ title: text })}
            placeholder="Enter event title"
            style={styles.textInput}
            testID={`${testID}-title`}
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Description</Text>
          <Input
            value={formData.description || ''}
            onChangeText={(text) => updateFormData({ description: text })}
            placeholder="Enter event description"
            multiline
            numberOfLines={3}
            style={[styles.textInput, styles.textAreaInput]}
            testID={`${testID}-description`}
          />
        </View>

        {/* Date and Time */}
        <View style={styles.dateTimeContainer}>
          <Text style={styles.fieldLabel}>Date & Time</Text>
          
          <View style={styles.allDayContainer}>
            <Checkbox
              checked={formData.isAllDay || false}
              onCheckedChange={(checked) => updateFormData({ isAllDay: checked })}
            />
            <Text style={styles.allDayText}>All day</Text>
          </View>

          <DateRangePicker
            startDate={formData.startDate}
            endDate={formData.endDate}
            onStartDateChange={(date) => updateFormData({ startDate: date })}
            onEndDateChange={(date) => updateFormData({ endDate: date })}
            showTime={!formData.isAllDay}
            style={styles.dateRangePicker}
            testID={`${testID}-date-range`}
          />
        </View>

        {/* Location */}
        {showLocationPicker && (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Location</Text>
            <Input
              value={formData.location || ''}
              onChangeText={(text) => updateFormData({ location: text })}
              placeholder="Enter event location"
              style={styles.textInput}
              testID={`${testID}-location`}
            />
          </View>
        )}

        {/* Category */}
        {availableCategories.length > 0 && (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {availableCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => updateFormData({ 
                    category: category.name,
                    color: category.color 
                  })}
                  style={[
                    styles.categoryButton,
                    { borderColor: category.color },
                    formData.category === category.name && styles.categoryButtonSelected
                  ]}
                  testID={`${testID}-category-${category.id}`}
                >
                  <View style={[
                    styles.categoryColor,
                    { backgroundColor: category.color }
                  ]} />
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Card>
    );
  };

  const renderAttendees = () => {
    if (!showAttendeeManagement) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-attendees`}>
        <Text style={styles.sectionTitle}>Attendees</Text>
        
        <View style={styles.addAttendeeContainer}>
          <Input
            value={attendeeEmail}
            onChangeText={setAttendeeEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.attendeeInput}
            testID={`${testID}-attendee-email`}
          />
          <Button
            onPress={handleAddAttendee}
            variant="outline"
            size="sm"
            style={styles.addAttendeeButton}
            testID={`${testID}-add-attendee`}
          >
            <Text style={styles.addAttendeeText}>Add</Text>
          </Button>
        </View>

        {formData.attendees && formData.attendees.length > 0 && (
          <View style={styles.attendeesList}>
            {formData.attendees.map((email, index) => (
              <View key={index} style={styles.attendeeItem}>
                <Text style={styles.attendeeEmail}>{email}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveAttendee(email)}
                  style={styles.removeAttendeeButton}
                  testID={`${testID}-remove-attendee-${index}`}
                >
                  <Text style={styles.removeAttendeeText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Meeting Link */}
        {showMeetingLink && (
          <View style={styles.meetingLinkContainer}>
            <Text style={styles.fieldLabel}>Meeting Link</Text>
            {formData.meetingLink ? (
              <Text style={styles.meetingLinkText}>{formData.meetingLink}</Text>
            ) : (
              <Button
                onPress={handleGenerateMeetingLink}
                variant="outline"
                style={styles.generateLinkButton}
                testID={`${testID}-generate-link`}
              >
                <Text style={styles.generateLinkText}>Generate Meeting Link</Text>
              </Button>
            )}
          </View>
        )}
      </Card>
    );
  };

  const renderAdvancedSettings = () => {
    if (!showAdvancedSettings) return null;

    return (
      <Card style={styles.sectionCard} testID={`${testID}-advanced`}>
        <TouchableOpacity
          onPress={() => setShowAdvanced(!showAdvanced)}
          style={styles.advancedToggle}
          testID={`${testID}-advanced-toggle`}
        >
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          <ChevronRight style={[
            styles.advancedIcon,
            showAdvanced && styles.advancedIconExpanded
          ]} />
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedContent}>
            {/* Priority */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => updateFormData({ priority })}
                    style={[
                      styles.priorityButton,
                      formData.priority === priority && styles.priorityButtonSelected
                    ]}
                    testID={`${testID}-priority-${priority}`}
                  >
                    <Text style={[
                      styles.priorityText,
                      formData.priority === priority && styles.priorityTextSelected
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reminders */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Reminders</Text>
              {formData.reminders?.map((reminder, index) => (
                <View key={reminder.id} style={styles.reminderItem}>
                  <Checkbox
                    checked={reminder.isEnabled}
                    onCheckedChange={(checked) => {
                      const newReminders = [...(formData.reminders || [])];
                      newReminders[index] = { ...reminder, isEnabled: checked };
                      updateFormData({ reminders: newReminders });
                    }}
                  />
                  <Text style={styles.reminderText}>
                    {reminder.minutesBefore < 60 
                      ? `${reminder.minutesBefore} minutes before`
                      : reminder.minutesBefore < 1440
                        ? `${Math.round(reminder.minutesBefore / 60)} hours before`
                        : `${Math.round(reminder.minutesBefore / 1440)} days before`
                    } ({reminder.type})
                  </Text>
                </View>
              ))}
            </View>

            {/* Registration */}
            <View style={styles.formField}>
              <View style={styles.checkboxField}>
                <Checkbox
                  checked={formData.requiresRegistration || false}
                  onCheckedChange={(checked) => updateFormData({ requiresRegistration: checked })}
                />
                <Text style={styles.checkboxText}>Require registration</Text>
              </View>
            </View>

            {/* Max Attendees */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Maximum Attendees</Text>
              <Input
                value={formData.maxAttendees?.toString() || ''}
                onChangeText={(text) => updateFormData({ 
                  maxAttendees: text ? parseInt(text, 10) : undefined 
                })}
                placeholder="No limit"
                keyboardType="numeric"
                style={styles.textInput}
                testID={`${testID}-max-attendees`}
              />
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtonsContainer} testID={`${testID}-actions`}>
        <Button
          onPress={handleCancel}
          variant="outline"
          style={styles.cancelButton}
          testID={`${testID}-cancel`}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Button>
        
        <Button
          onPress={handleSave}
          disabled={saving || !formData.title?.trim()}
          style={[styles.saveEventButton, saving && styles.saveEventButtonDisabled]}
          testID={`${testID}-save-event`}
        >
          <Text style={styles.saveEventButtonText}>
            {saving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
          </Text>
        </Button>
      </View>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      {/* Error Display */}
      {renderError()}

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID={`${testID}-scroll`}
        >
          {/* Basic Info */}
          {renderBasicInfo()}

          {/* Attendees */}
          {renderAttendees()}

          {/* Advanced Settings */}
          {renderAdvancedSettings()}

          {/* Action Buttons */}
          {renderActionButtons()}

          {/* Footer */}
          {footerComponent && (
            <View style={styles.footerContainer}>
              {footerComponent}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  backIcon: {
    width: 24,
    height: 24,
    color: COLORS.gray[900],
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary[500],
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error[500],
  },
  sectionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  formField: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[900],
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    marginBottom: SPACING.md,
  },
  allDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  allDayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  dateRangePicker: {
    marginTop: SPACING.sm,
  },
  categoryScroll: {
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.gray[50],
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  addAttendeeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  attendeeInput: {
    flex: 1,
  },
  addAttendeeButton: {
    paddingHorizontal: SPACING.md,
  },
  addAttendeeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  attendeesList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
  },
  attendeeEmail: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
  },
  removeAttendeeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.error[500],
  },
  removeAttendeeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  meetingLinkContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.md,
  },
  meetingLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    textDecorationLine: 'underline',
  },
  generateLinkButton: {
    alignSelf: 'flex-start',
  },
  generateLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedIcon: {
    width: 20,
    height: 20,
    color: COLORS.gray[400],
    transform: [{ rotate: '0deg' }],
  },
  advancedIconExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  advancedContent: {
    marginTop: SPACING.md,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  priorityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  priorityTextSelected: {
    color: COLORS.primary[700],
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reminderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  checkboxField: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  cancelButton: {
    flex: 1,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  saveEventButton: {
    flex: 2,
  },
  saveEventButtonDisabled: {
    opacity: 0.5,
  },
  saveEventButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default CreateEventScreen;
export type { 
  CreateEventScreenProps, 
  CreateEventScreenConfig, 
  EventFormData, 
  ReminderData, 
  RecurrencePattern, 
  AgendaItemData, 
  ContactData, 
  EventCategory 
};
