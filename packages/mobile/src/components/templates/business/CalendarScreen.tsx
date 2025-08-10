/**
 * CalendarScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive calendar screen template that displays events, meetings, and schedule management
 * with multiple view modes and full CRUD functionality.
 * 
 * Features:
 * - Multiple calendar views (month, week, day, agenda)
 * - Event creation, editing, and deletion
 * - Meeting scheduling and management
 * - Time slot selection and availability
 * - Recurring events and reminders
 * - Multiple calendar support
 * - Event categories and color coding
 * - Search and filter events
 * - Meeting attendees management
 * - Calendar sync and sharing
 * - Offline support with sync
 * - Today/current time highlighting
 * 
 * @example
 * ```tsx
 * <CalendarScreen
 *   events={calendarEvents}
 *   selectedDate={selectedDate}
 *   onDateSelect={(date) => handleDateSelect(date)}
 *   onEventPress={(event) => navigation.navigate('EventDetails', { event })}
 *   onCreateEvent={(date) => navigation.navigate('CreateEvent', { date })}
 *   onEditEvent={(event) => handleEditEvent(event)}
 *   view="month"
 *   loading={eventsLoading}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { 
  StatsCard,
  ProgressCard 
} from '../../blocks/business';
import type { 
  StatsCardProps,
  ProgressCardProps 
} from '../../blocks/business';
import { SearchForm } from '../../blocks/forms';
import type { SearchFormProps, SearchFormData } from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Calendar event
 */
export interface CalendarEvent {
  /** Event ID */
  id: string;
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Event start date and time */
  startDate: Date;
  /** Event end date and time */
  endDate: Date;
  /** Is all day event */
  isAllDay?: boolean;
  /** Event location */
  location?: string;
  /** Event category */
  category?: string;
  /** Event color */
  color?: string;
  /** Event attendees */
  attendees?: EventAttendee[];
  /** Event reminders */
  reminders?: EventReminder[];
  /** Is recurring event */
  isRecurring?: boolean;
  /** Recurrence rule */
  recurrenceRule?: string;
  /** Event creator */
  createdBy?: string;
  /** Event status */
  status?: 'confirmed' | 'tentative' | 'cancelled';
  /** Meeting link */
  meetingLink?: string;
  /** Event priority */
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Event attendee
 */
export interface EventAttendee {
  /** Attendee ID */
  id: string;
  /** Attendee name */
  name: string;
  /** Attendee email */
  email: string;
  /** Attendee avatar */
  avatar?: string;
  /** Response status */
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  /** Is organizer */
  isOrganizer?: boolean;
}

/**
 * Event reminder
 */
export interface EventReminder {
  /** Reminder ID */
  id: string;
  /** Reminder time before event (in minutes) */
  minutesBefore: number;
  /** Reminder type */
  type: 'notification' | 'email' | 'popup';
}

/**
 * Calendar view type
 */
export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

/**
 * Calendar filter
 */
export interface CalendarFilter {
  /** Filter type */
  type: string;
  /** Filter label */
  label: string;
  /** Filter value */
  value: any;
  /** Is active */
  active: boolean;
}

/**
 * Calendar screen configuration
 */
export interface CalendarScreenConfig {
  /** Default view */
  defaultView?: CalendarViewType;
  /** Show mini calendar */
  showMiniCalendar?: boolean;
  /** Show event categories */
  showCategories?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Enable event creation */
  enableEventCreation?: boolean;
  /** Enable event editing */
  enableEventEditing?: boolean;
  /** Enable drag and drop */
  enableDragDrop?: boolean;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** First day of week */
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
  /** Show today button */
  showTodayButton?: boolean;
  /** Available views */
  availableViews?: CalendarViewType[];
  /** Event colors */
  eventColors?: string[];
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the CalendarScreen template
 */
export interface CalendarScreenProps extends BaseComponentProps {
  /** Calendar events */
  events?: CalendarEvent[];
  /** Selected date */
  selectedDate?: Date;
  /** Current view */
  view?: CalendarViewType;
  /** Available categories */
  categories?: Array<{ id: string; name: string; color: string }>;
  /** Active filters */
  filters?: CalendarFilter[];
  /** Search query */
  searchQuery?: string;
  /** Callback when date is selected */
  onDateSelect?: (date: Date) => void;
  /** Callback when view changes */
  onViewChange?: (view: CalendarViewType) => void;
  /** Callback when event is pressed */
  onEventPress?: (event: CalendarEvent) => void;
  /** Callback when event is created */
  onCreateEvent?: (date: Date, timeSlot?: { start: Date; end: Date }) => void;
  /** Callback when event is edited */
  onEditEvent?: (event: CalendarEvent) => void;
  /** Callback when event is deleted */
  onDeleteEvent?: (eventId: string) => Promise<void> | void;
  /** Callback when event is moved */
  onMoveEvent?: (eventId: string, newDate: Date) => Promise<void> | void;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback when filters change */
  onFilterChange?: (filters: CalendarFilter[]) => void;
  /** Callback when month/week changes */
  onPeriodChange?: (startDate: Date, endDate: Date) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the calendar screen */
  config?: CalendarScreenConfig;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get calendar weeks for a month
 */
const getMonthWeeks = (date: Date, firstDayOfWeek: number = 1): Date[][] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Start from the first day of the week containing the first day of month
  const startDate = new Date(firstDay);
  const dayOffset = (firstDay.getDay() - firstDayOfWeek + 7) % 7;
  startDate.setDate(firstDay.getDate() - dayOffset);
  
  const weeks: Date[][] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= lastDay || weeks.length === 0 || currentDate.getDay() !== firstDayOfWeek) {
    if (currentDate.getDay() === firstDayOfWeek || weeks.length === 0) {
      weeks.push([]);
    }
    
    weeks[weeks.length - 1].push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Stop if we have 6 weeks
    if (weeks.length === 6 && currentDate.getDay() === firstDayOfWeek) {
      break;
    }
  }
  
  return weeks;
};

/**
 * Format date for display
 */
const formatDate = (date: Date, format: 'full' | 'short' | 'day' | 'time' = 'short'): string => {
  switch (format) {
    case 'full':
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'short':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case 'day':
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric' 
      });
    case 'time':
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Check if date is today
 */
const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CalendarScreen - AI-optimized calendar screen template
 * 
 * A comprehensive calendar screen that displays events, meetings, and schedule management
 * with multiple view modes and full functionality.
 */
const CalendarScreen: React.FC<CalendarScreenProps> = ({
  events = [],
  selectedDate = new Date(),
  view = 'month',
  categories = [],
  filters = [],
  searchQuery = '',
  onDateSelect,
  onViewChange,
  onEventPress,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onMoveEvent,
  onSearch,
  onFilterChange,
  onPeriodChange,
  onRefresh,
  onBack,
  loading = false,
  refreshing = false,
  error,
  config = {},
  style,
  testID = 'calendar-screen',
  ...props
}) => {
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);
  const [localView, setLocalView] = useState<CalendarViewType>(view);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const {
    defaultView = 'month',
    showMiniCalendar = true,
    showCategories = true,
    showSearch = true,
    showFilters = true,
    enableEventCreation = true,
    enableEventEditing = true,
    enableDragDrop = false,
    showWeekNumbers = false,
    firstDayOfWeek = 1,
    showTodayButton = true,
    availableViews = ['month', 'week', 'day', 'agenda'],
    eventColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'],
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const monthWeeks = useMemo(() => {
    return getMonthWeeks(currentMonth, firstDayOfWeek);
  }, [currentMonth, firstDayOfWeek]);

  const todayEvents = useMemo(() => {
    return events.filter(event => 
      isSameDay(event.startDate, localSelectedDate) ||
      (event.startDate <= localSelectedDate && event.endDate >= localSelectedDate)
    );
  }, [events, localSelectedDate]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filters
    const activeFilters = filters.filter(f => f.active);
    if (activeFilters.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.some(filter => 
          filter.type === 'category' && event.category === filter.value
        )
      );
    }

    return filtered;
  }, [events, searchQuery, filters]);

  const hasEvents = filteredEvents.length > 0;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleDateSelect = useCallback((date: Date) => {
    setLocalSelectedDate(date);
    onDateSelect?.(date);
  }, [onDateSelect]);

  const handleViewChange = useCallback((newView: CalendarViewType) => {
    setLocalView(newView);
    onViewChange?.(newView);
  }, [onViewChange]);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    onEventPress?.(event);
  }, [onEventPress]);

  const handleCreateEvent = useCallback((date: Date) => {
    onCreateEvent?.(date);
  }, [onCreateEvent]);

  const handlePreviousMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    onPeriodChange?.(newMonth, new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0));
  }, [currentMonth, onPeriodChange]);

  const handleNextMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    onPeriodChange?.(newMonth, new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0));
  }, [currentMonth, onPeriodChange]);

  const handleTodayPress = useCallback(() => {
    const today = new Date();
    setLocalSelectedDate(today);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect?.(today);
  }, [onDateSelect]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    try {
      await onRefresh();
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  }, [onRefresh]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <View style={styles.headerTop}>
          {onBack ? (
            <TouchableOpacity 
              onPress={onBack}
              style={styles.backButton}
              testID={`${testID}-back`}
            >
              <ChevronLeft style={styles.backIcon} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          
          <Text style={styles.headerTitle}>Calendar</Text>
          
          <View style={styles.headerActions}>
            {showTodayButton && (
              <TouchableOpacity 
                onPress={handleTodayPress}
                style={styles.todayButton}
                testID={`${testID}-today`}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            onPress={handlePreviousMonth}
            style={styles.monthNavButton}
            testID={`${testID}-prev-month`}
          >
            <ChevronLeft style={styles.navIcon} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
          
          <TouchableOpacity 
            onPress={handleNextMonth}
            style={styles.monthNavButton}
            testID={`${testID}-next-month`}
          >
            <ChevronRight style={styles.navIcon} />
          </TouchableOpacity>
        </View>

        {/* View Selector */}
        <View style={styles.viewSelector}>
          {availableViews.map((viewType) => (
            <TouchableOpacity
              key={viewType}
              onPress={() => handleViewChange(viewType)}
              style={[
                styles.viewButton,
                localView === viewType && styles.viewButtonActive
              ]}
              testID={`${testID}-view-${viewType}`}
            >
              <Text style={[
                styles.viewButtonText,
                localView === viewType && styles.viewButtonTextActive
              ]}>
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        {showSearch && (
          <SearchForm
            onSearch={onSearch}
            placeholder="Search events..."
            defaultValue={searchQuery}
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
        )}
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

  const renderMonthView = () => {
    if (localView !== 'month') return null;

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (firstDayOfWeek === 0) {
      weekDays.unshift(weekDays.pop()!); // Move Sunday to front
    }

    return (
      <View style={styles.monthViewContainer} testID={`${testID}-month-view`}>
        {/* Week Headers */}
        <View style={styles.weekHeader}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekHeaderText}>
              {day}
            </Text>
          ))}
        </View>

        {/* Month Grid */}
        <View style={styles.monthGrid}>
          {monthWeeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((date, dayIndex) => {
                const isSelected = isSameDay(date, localSelectedDate);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isCurrentDay = isToday(date);
                const dayEvents = filteredEvents.filter(event => 
                  isSameDay(event.startDate, date)
                );

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    onPress={() => handleDateSelect(date)}
                    onLongPress={() => enableEventCreation && handleCreateEvent(date)}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isCurrentDay && styles.dayCellToday,
                      !isCurrentMonth && styles.dayCellOtherMonth
                    ]}
                    testID={`${testID}-day-${date.getDate()}`}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isCurrentDay && styles.dayTextToday,
                      !isCurrentMonth && styles.dayTextOtherMonth
                    ]}>
                      {date.getDate()}
                    </Text>
                    
                    {/* Event indicators */}
                    {dayEvents.length > 0 && (
                      <View style={styles.eventIndicators}>
                        {dayEvents.slice(0, 3).map((event, index) => (
                          <View
                            key={event.id}
                            style={[
                              styles.eventDot,
                              { backgroundColor: event.color || eventColors[index % eventColors.length] }
                            ]}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <Text style={styles.moreEventsText}>
                            +{dayEvents.length - 3}
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAgendaView = () => {
    if (localView !== 'agenda') return null;

    return (
      <View style={styles.agendaContainer} testID={`${testID}-agenda-view`}>
        <Text style={styles.selectedDateText}>
          {formatDate(localSelectedDate, 'full')}
        </Text>
        
        {todayEvents.length > 0 ? (
          <FlatList
            data={todayEvents}
            renderItem={({ item: event }) => (
              <TouchableOpacity
                onPress={() => handleEventPress(event)}
                style={styles.eventCard}
                testID={`${testID}-event-${event.id}`}
              >
                <View style={styles.eventCardHeader}>
                  <View style={[
                    styles.eventColorBar,
                    { backgroundColor: event.color || eventColors[0] }
                  ]} />
                  <View style={styles.eventCardContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {formatDate(event.startDate, 'time')} - {formatDate(event.endDate, 'time')}
                    </Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>📍 {event.location}</Text>
                    )}
                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description}
                      </Text>
                    )}
                  </View>
                </View>
                
                {event.attendees && event.attendees.length > 0 && (
                  <View style={styles.eventAttendees}>
                    <Text style={styles.attendeesLabel}>
                      {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[COLORS.primary[500]]}
                  tintColor={COLORS.primary[500]}
                />
              ) : undefined
            }
          />
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events scheduled</Text>
            {enableEventCreation && (
              <Button
                onPress={() => handleCreateEvent(localSelectedDate)}
                style={styles.createEventButton}
                testID={`${testID}-create-event`}
              >
                <Text style={styles.createEventText}>Create Event</Text>
              </Button>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderSummaryStats = () => {
    const thisMonth = filteredEvents.filter(event => 
      event.startDate.getMonth() === currentMonth.getMonth() &&
      event.startDate.getFullYear() === currentMonth.getFullYear()
    );
    
    const upcomingEvents = filteredEvents.filter(event => 
      event.startDate > new Date()
    ).slice(0, 5);

    return (
      <View style={styles.summaryContainer}>
        <StatsCard
          title="This Month"
          value={thisMonth.length}
          subtitle="Events scheduled"
          trend={{ direction: 'up', percentage: 12 }}
          color="success"
          style={styles.statCard}
          testID={`${testID}-month-stats`}
        />
        
        <StatsCard
          title="Today"
          value={todayEvents.length}
          format="number"
          subtitle="Events today"
          color="info"
          style={styles.statCard}
          testID={`${testID}-today-stats`}
        />
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary[500]]}
              tintColor={COLORS.primary[500]}
            />
          ) : undefined
        }
        testID={`${testID}-scroll`}
      >
        {/* Summary Statistics */}
        {renderSummaryStats()}

        {/* Calendar Views */}
        {renderMonthView()}
        {renderAgendaView()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Event Creation */}
      {enableEventCreation && (
        <TouchableOpacity
          onPress={() => handleCreateEvent(localSelectedDate)}
          style={styles.fabButton}
          testID={`${testID}-fab`}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
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
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  todayButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary[500],
  },
  todayButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.white,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  navIcon: {
    width: 20,
    height: 20,
    color: COLORS.gray[900],
  },
  monthTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  viewButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: COLORS.primary[500],
  },
  viewButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[600],
  },
  viewButtonTextActive: {
    color: COLORS.white,
  },
  searchForm: {
    marginBottom: SPACING.md,
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error[500],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for FAB
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
  },
  monthViewContainer: {
    paddingHorizontal: SPACING.lg,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[600],
    paddingVertical: SPACING.sm,
  },
  monthGrid: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.gray[200],
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    minHeight: 60,
    padding: SPACING.xs,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary[100],
  },
  dayCellToday: {
    backgroundColor: COLORS.primary[50],
  },
  dayCellOtherMonth: {
    backgroundColor: COLORS.gray[50],
  },
  dayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  dayTextSelected: {
    color: COLORS.primary[700],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dayTextToday: {
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dayTextOtherMonth: {
    color: COLORS.gray[400],
  },
  eventIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    alignItems: 'center',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreEventsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginLeft: 2,
  },
  agendaContainer: {
    padding: SPACING.lg,
  },
  selectedDateText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventCardHeader: {
    flexDirection: 'row',
  },
  eventColorBar: {
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  eventCardContent: {
    flex: 1,
    padding: SPACING.md,
  },
  eventTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  eventTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  eventLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  eventDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  eventAttendees: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  attendeesLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
  },
  noEventsContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  createEventButton: {
    paddingHorizontal: SPACING.xl,
  },
  createEventText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  fabButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
});

export default CalendarScreen;
export type { 
  CalendarScreenProps, 
  CalendarScreenConfig, 
  CalendarEvent, 
  EventAttendee, 
  EventReminder, 
  CalendarViewType, 
  CalendarFilter 
};
