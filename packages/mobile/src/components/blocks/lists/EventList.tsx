/**
 * EventList Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive event listing component for displaying calendar events,
 * activities, and scheduled items with time-based organization.
 * 
 * Features:
 * - Time-based event display with date grouping
 * - Event categories and priority indicators
 * - RSVP and attendance tracking
 * - Location information with maps integration
 * - Recurring event indicators
 * - Quick actions (join, remind, share)
 * - Real-time status updates
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <EventList
 *   events={eventList}
 *   onEventSelect={(event) => navigateToEvent(event)}
 *   onRSVP={(event, status) => handleRSVP(event, status)}
 *   showLocation={true}
 *   groupByDate={true}
 *   allowRSVP={true}
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
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  SectionList
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, formatTime, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Event priority levels
 */
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Event status
 */
export type EventStatus = 'draft' | 'published' | 'started' | 'completed' | 'cancelled';

/**
 * RSVP status
 */
export type RSVPStatus = 'yes' | 'no' | 'maybe' | 'pending';

/**
 * Event recurrence pattern
 */
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * Event category
 */
export type EventCategory = 
  | 'meeting' 
  | 'conference' 
  | 'workshop' 
  | 'social' 
  | 'personal' 
  | 'deadline' 
  | 'reminder' 
  | 'other';

/**
 * Event location information
 */
export interface EventLocation {
  /** Location name */
  name: string;
  /** Street address */
  address?: string;
  /** Geographic coordinates */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Online meeting link */
  onlineLink?: string;
  /** Location type */
  type: 'physical' | 'online' | 'hybrid';
}

/**
 * Event attendee information
 */
export interface EventAttendee {
  /** Attendee ID */
  id: string;
  /** Display name */
  name: string;
  /** Profile picture URL */
  avatar?: string;
  /** Email address */
  email?: string;
  /** RSVP status */
  rsvpStatus: RSVPStatus;
  /** Whether this is the organizer */
  isOrganizer?: boolean;
}

/**
 * Event data structure
 */
export interface Event {
  /** Unique event identifier */
  id: string;
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Start date and time */
  startDate: Date;
  /** End date and time */
  endDate: Date;
  /** Event category */
  category: EventCategory;
  /** Priority level */
  priority: EventPriority;
  /** Current status */
  status: EventStatus;
  /** Location information */
  location?: EventLocation;
  /** Event organizer */
  organizer: EventAttendee;
  /** List of attendees */
  attendees: EventAttendee[];
  /** Maximum number of attendees */
  maxAttendees?: number;
  /** Recurrence pattern */
  recurrence: RecurrencePattern;
  /** Event color theme */
  color?: string;
  /** Event tags */
  tags?: string[];
  /** Whether RSVP is required */
  requiresRSVP: boolean;
  /** Event image */
  image?: string;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Event action configuration
 */
export interface EventAction {
  /** Action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon (emoji or icon name) */
  icon: string;
  /** Action handler */
  onPress: (event: Event) => void;
  /** Whether action is destructive */
  destructive?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * Props for the EventList component
 */
export interface EventListProps extends BaseComponentProps {
  /** Array of events to display */
  events: Event[];
  /** Callback when an event is selected */
  onEventSelect?: (event: Event) => void;
  /** Callback when RSVP status changes */
  onRSVP?: (event: Event, status: RSVPStatus) => void;
  /** Callback for event actions */
  onEventAction?: (action: string, event: Event) => void;
  /** Available actions for each event */
  actions?: EventAction[];
  /** Whether to show location information */
  showLocation?: boolean;
  /** Whether to show attendee count */
  showAttendees?: boolean;
  /** Whether to show event categories */
  showCategories?: boolean;
  /** Whether to group events by date */
  groupByDate?: boolean;
  /** Whether to allow RSVP actions */
  allowRSVP?: boolean;
  /** Whether to show recurring event indicators */
  showRecurrence?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of events to show initially */
  initialNumToRender?: number;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Load more events handler */
  onLoadMore?: () => void;
  /** Whether there are more events to load */
  hasMore?: boolean;
  /** Event filtering function */
  filterEvents?: (event: Event) => boolean;
  /** Event sorting function */
  sortEvents?: (a: Event, b: Event) => number;
  /** Layout variant */
  variant?: 'compact' | 'detailed' | 'card';
  /** Custom event item renderer */
  renderEvent?: (event: Event, index: number) => React.ReactElement;
  /** Custom section header renderer for grouped view */
  renderSectionHeader?: (title: string, events: Event[]) => React.ReactElement;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * EventList component for displaying calendar events and activities
 */
export const EventList: React.FC<EventListProps> = ({
  events,
  onEventSelect,
  onRSVP,
  onEventAction,
  actions = [],
  showLocation = true,
  showAttendees = true,
  showCategories = true,
  groupByDate = false,
  allowRSVP = true,
  showRecurrence = true,
  loading = false,
  error,
  emptyMessage = 'No events found',
  initialNumToRender = 10,
  onRefresh,
  onLoadMore,
  hasMore = false,
  filterEvents,
  sortEvents,
  variant = 'detailed',
  renderEvent,
  renderSectionHeader,
  style,
  testID = 'event-list',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [refreshing, setRefreshing] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const processedEvents = useMemo(() => {
    let filtered = events;

    // Apply custom filter
    if (filterEvents) {
      filtered = filtered.filter(filterEvents);
    }

    // Apply custom sort or default sort by start date
    if (sortEvents) {
      filtered = filtered.sort(sortEvents);
    } else {
      filtered = filtered.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    return filtered;
  }, [events, filterEvents, sortEvents]);

  const groupedEvents = useMemo(() => {
    if (!groupByDate) return null;

    const groups: { [key: string]: Event[] } = {};
    
    processedEvents.forEach(event => {
      const dateKey = formatDate(event.startDate, 'YYYY-MM-DD');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return Object.entries(groups).map(([date, eventList]) => ({
      title: formatDate(new Date(date), 'MMM DD, YYYY'),
      data: eventList,
    }));
  }, [processedEvents, groupByDate]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleEventPress = useCallback((event: Event) => {
    onEventSelect?.(event);
  }, [onEventSelect]);

  const handleRSVP = useCallback((event: Event, status: RSVPStatus) => {
    onRSVP?.(event, status);
  }, [onRSVP]);

  const handleAction = useCallback((action: EventAction, event: Event) => {
    action.onPress(event);
    onEventAction?.(action.id, event);
  }, [onEventAction]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getCategoryColor = (category: EventCategory): string => {
    const colors: Record<EventCategory, string> = {
      meeting: COLORS.info[500],
      conference: COLORS.primary[600],
      workshop: COLORS.success[500],
      social: COLORS.primary[400],
      personal: COLORS.warning[500],
      deadline: COLORS.error[500],
      reminder: COLORS.warning[400],
      other: COLORS.secondary[500],
    };
    return colors[category];
  };

  const getPriorityColor = (priority: EventPriority): string => {
    const colors: Record<EventPriority, string> = {
      low: COLORS.secondary[400],
      medium: COLORS.info[500],
      high: COLORS.warning[500],
      urgent: COLORS.error[500],
    };
    return colors[priority];
  };

  const getStatusColor = (status: EventStatus): string => {
    const colors: Record<EventStatus, string> = {
      draft: COLORS.secondary[400],
      published: COLORS.info[500],
      started: COLORS.success[500],
      completed: COLORS.secondary[600],
      cancelled: COLORS.error[500],
    };
    return colors[status];
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderEventItem = useCallback(({ item: event, index }: { item: Event; index: number }) => {
    if (renderEvent) {
      return renderEvent(event, index);
    }

    const isAllDay = 
      event.startDate.getHours() === 0 && 
      event.startDate.getMinutes() === 0 &&
      event.endDate.getHours() === 23 && 
      event.endDate.getMinutes() === 59;

    return (
      <Card 
        style={[
          styles.eventCard,
          variant === 'compact' && styles.compactCard,
          { borderLeftColor: event.color || getCategoryColor(event.category) }
        ]}
        testID={`${testID}-item-${index}`}
      >
        <TouchableOpacity
          onPress={() => handleEventPress(event)}
          style={styles.eventContent}
          accessibilityRole="button"
          accessibilityLabel={`Event: ${event.title}`}
        >
          {/* Header */}
          <View style={styles.eventHeader}>
            <View style={styles.eventTitleContainer}>
              <Text style={styles.eventTitle} numberOfLines={variant === 'compact' ? 1 : 2}>
                {event.title}
              </Text>
              {showRecurrence && event.recurrence !== 'none' && (
                <Badge 
                  variant="secondary" 
                  
                  style={styles.recurrenceBadge}
                >
                  🔄
                </Badge>
              )}
            </View>
            <View style={styles.eventMeta}>
              {showCategories && (
                <Badge 
                  variant="secondary"
                  style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}
                >
                  {event.category}
                </Badge>
              )}
              <Badge 
                variant="outline"
                style={[styles.statusBadge, { borderColor: getStatusColor(event.status) }]}
              >
                {event.status}
              </Badge>
            </View>
          </View>

          {/* Time */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {isAllDay 
                ? 'All Day' 
                : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`
              }
            </Text>
            {event.startDate.toDateString() !== event.endDate.toDateString() && (
              <Text style={styles.multiDayText}>
                Multi-day event
              </Text>
            )}
          </View>

          {/* Description */}
          {event.description && variant !== 'compact' && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>
          )}

          {/* Location */}
          {showLocation && event.location && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {event.location.type === 'online' ? '🌐 Online' : event.location.name}
              </Text>
            </View>
          )}

          {/* Attendees */}
          {showAttendees && event.attendees.length > 0 && (
            <View style={styles.attendeesContainer}>
              <View style={styles.attendeeAvatars}>
                {event.attendees.slice(0, 3).map((attendee, idx) => (
                  <Avatar
                    key={attendee.id}
                    style={[styles.attendeeAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                  >
                    {attendee.avatar && (
                      <AvatarImage source={{ uri: attendee.avatar }} />
                    )}
                    <AvatarFallback>
                      <Text style={styles.attendeeFallback}>
                        {attendee.name.charAt(0)}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                ))}
              </View>
              <Text style={styles.attendeeCount}>
                {event.attendees.length} 
                {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
              </Text>
            </View>
          )}

          {/* RSVP Buttons */}
          {allowRSVP && event.requiresRSVP && (
            <View style={styles.rsvpContainer}>
              <Button
                variant="outline"
                
                onPress={() => handleRSVP(event, 'yes')}
                style={styles.rsvpButton}
              >
                ✅ Yes
              </Button>
              <Button
                variant="outline"
                
                onPress={() => handleRSVP(event, 'maybe')}
                style={styles.rsvpButton}
              >
                ❓ Maybe
              </Button>
              <Button
                variant="outline"
                
                onPress={() => handleRSVP(event, 'no')}
                style={styles.rsvpButton}
              >
                ❌ No
              </Button>
            </View>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <View style={styles.actionsContainer}>
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.destructive ? "destructive" : "ghost"}
                  
                  onPress={() => handleAction(action, event)}
                  disabled={action.disabled}
                  style={styles.actionButton}
                >
                  {action.icon} {action.label}
                </Button>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  }, [
    variant,
    showRecurrence,
    showCategories,
    showLocation,
    showAttendees,
    allowRSVP,
    actions,
    renderEvent,
    handleEventPress,
    handleRSVP,
    handleAction,
    testID
  ]);

  const renderSectionHeaderDefault = useCallback(({ section: { title, data } }: any) => {
    if (renderSectionHeader) {
      return renderSectionHeader(title, data);
    }

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Badge variant="secondary" >
          {data.length} events
        </Badge>
      </View>
    );
  }, [renderSectionHeader]);

  // =============================================================================
  // ERROR & EMPTY STATES
  // =============================================================================

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  if (!loading && processedEvents.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.emptyText}>📅 {emptyMessage}</Text>
      </View>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  ) : undefined;

  if (groupByDate && groupedEvents) {
    return (
      <SectionList
        sections={groupedEvents}
        renderItem={renderEventItem}
        renderSectionHeader={renderSectionHeaderDefault}
        keyExtractor={(item) => item.id}
        style={[styles.container, style]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={refreshControl}
        initialNumToRender={initialNumToRender}
        testID={testID}
        {...props}
      />
    );
  }

  return (
    <FlatList
      data={processedEvents}
      renderItem={renderEventItem}
      keyExtractor={(item) => item.id}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={refreshControl}
      initialNumToRender={initialNumToRender}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      testID={testID}
      {...props}
    />
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  contentContainer: {
    padding: SPACING.md,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  compactCard: {
    marginBottom: SPACING.sm,
  },
  eventContent: {
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eventTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  eventTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    flex: 1,
  },
  recurrenceBadge: {
    marginLeft: SPACING.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  categoryBadge: {
    color: COLORS.white,
  },
  statusBadge: {
    backgroundColor: 'transparent',
  },
  timeContainer: {
    marginBottom: SPACING.sm,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
  },
  multiDayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[500],
    marginTop: SPACING.xs,
  },
  eventDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    flex: 1,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  attendeeAvatars: {
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  attendeeAvatar: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  attendeeFallback: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[600],
  },
  attendeeCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  rsvpContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rsvpButton: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  sectionHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error[500],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
});

export default EventList;
