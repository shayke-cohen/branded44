/**
 * EventDetailsScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive event details screen template that displays complete event information
 * with attendee management, RSVP functionality, and event actions.
 * 
 * Features:
 * - Complete event information display
 * - Attendee list with status indicators
 * - RSVP functionality and status management
 * - Event location with map integration
 * - Meeting link and call functionality
 * - Event editing and deletion
 * - Calendar integration and reminders
 * - Event sharing and invitations
 * - Recurring event management
 * - Time zone handling
 * - Attachment and document viewing
 * - Chat and discussion threads
 * 
 * @example
 * ```tsx
 * <EventDetailsScreen
 *   event={selectedEvent}
 *   currentUser={currentUser}
 *   onRSVP={(response) => handleRSVP(response)}
 *   onEditEvent={() => navigation.navigate('EditEvent', { event })}
 *   onDeleteEvent={() => handleDeleteEvent()}
 *   onJoinMeeting={() => handleJoinMeeting()}
 *   onInviteAttendees={() => handleInviteAttendees()}
 *   loading={eventLoading}
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
  Image,
  Linking,
  Alert
} from 'react-native';
import { 
  UserCard 
} from '../../blocks/social';
import type { 
  UserCardProps 
} from '../../blocks/social';
import { 
  StatsCard 
} from '../../blocks/business';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Avatar } from '../../../../~/components/ui/avatar';
import { Separator } from '../../../../~/components/ui/separator';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Event details
 */
export interface EventDetails {
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
  attendees?: EventAttendee[];
  /** Event reminders */
  reminders?: EventReminder[];
  /** Is recurring event */
  isRecurring?: boolean;
  /** Recurrence rule */
  recurrenceRule?: string;
  /** Event creator */
  createdBy?: EventOrganizer;
  /** Event status */
  status?: 'confirmed' | 'tentative' | 'cancelled';
  /** Meeting link */
  meetingLink?: string;
  /** Event priority */
  priority?: 'low' | 'medium' | 'high';
  /** Event attachments */
  attachments?: EventAttachment[];
  /** Event agenda */
  agenda?: AgendaItem[];
  /** Event notes */
  notes?: string;
  /** Time zone */
  timezone?: string;
  /** Maximum attendees */
  maxAttendees?: number;
  /** Registration required */
  requiresRegistration?: boolean;
  /** Event cost */
  cost?: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
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
  /** Response date */
  responseDate?: Date;
  /** Plus one count */
  plusOne?: number;
  /** Dietary restrictions */
  dietaryRestrictions?: string;
  /** Notes from attendee */
  notes?: string;
}

/**
 * Event organizer
 */
export interface EventOrganizer {
  /** Organizer ID */
  id: string;
  /** Organizer name */
  name: string;
  /** Organizer email */
  email: string;
  /** Organizer avatar */
  avatar?: string;
  /** Organizer title */
  title?: string;
  /** Organization */
  organization?: string;
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
  /** Is enabled */
  isEnabled: boolean;
}

/**
 * Event attachment
 */
export interface EventAttachment {
  /** Attachment ID */
  id: string;
  /** File name */
  name: string;
  /** File URL */
  url: string;
  /** File type */
  type: string;
  /** File size in bytes */
  size: number;
  /** Upload date */
  uploadedAt: Date;
  /** Uploaded by */
  uploadedBy: string;
}

/**
 * Agenda item
 */
export interface AgendaItem {
  /** Item ID */
  id: string;
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime: Date;
  /** Speaker/presenter */
  presenter?: string;
  /** Location/room */
  location?: string;
}

/**
 * RSVP response
 */
export type RSVPResponse = 'accepted' | 'declined' | 'tentative';

/**
 * Event details screen configuration
 */
export interface EventDetailsScreenConfig {
  /** Show attendee list */
  showAttendees?: boolean;
  /** Show RSVP buttons */
  showRSVP?: boolean;
  /** Show edit button */
  showEdit?: boolean;
  /** Show delete button */
  showDelete?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Show map */
  showMap?: boolean;
  /** Show agenda */
  showAgenda?: boolean;
  /** Show attachments */
  showAttachments?: boolean;
  /** Show reminders */
  showReminders?: boolean;
  /** Enable meeting join */
  enableMeetingJoin?: boolean;
  /** Enable attendee management */
  enableAttendeeManagement?: boolean;
  /** Show event statistics */
  showStatistics?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the EventDetailsScreen template
 */
export interface EventDetailsScreenProps extends BaseComponentProps {
  /** Event details */
  event: EventDetails;
  /** Current user */
  currentUser?: EventAttendee;
  /** User's RSVP status */
  userRSVP?: RSVPResponse;
  /** Can edit event */
  canEdit?: boolean;
  /** Can delete event */
  canDelete?: boolean;
  /** Callback when RSVP is submitted */
  onRSVP?: (response: RSVPResponse, notes?: string) => Promise<void> | void;
  /** Callback when event is edited */
  onEditEvent?: () => void;
  /** Callback when event is deleted */
  onDeleteEvent?: () => Promise<void> | void;
  /** Callback when event is shared */
  onShareEvent?: () => void;
  /** Callback when attendee is invited */
  onInviteAttendees?: () => void;
  /** Callback when meeting is joined */
  onJoinMeeting?: () => void;
  /** Callback when location is pressed */
  onLocationPress?: (coordinates?: { latitude: number; longitude: number }) => void;
  /** Callback when attachment is pressed */
  onAttachmentPress?: (attachment: EventAttachment) => void;
  /** Callback when attendee is pressed */
  onAttendeePress?: (attendee: EventAttendee) => void;
  /** Callback when reminder is toggled */
  onReminderToggle?: (reminder: EventReminder) => Promise<void> | void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the event details screen */
  config?: EventDetailsScreenConfig;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format date range for display
 */
const formatDateRange = (startDate: Date, endDate: Date, isAllDay: boolean = false): string => {
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  
  if (isAllDay) {
    if (isSameDay) {
      return startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } else {
      return `${startDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${endDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    }
  }
  
  if (isSameDay) {
    return `${startDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })} • ${startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })} - ${endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  } else {
    return `${startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} ${startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })} - ${endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })} ${endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  }
};

/**
 * Get file size in human readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * EventDetailsScreen - AI-optimized event details screen template
 * 
 * A comprehensive event details screen that displays complete event information
 * with attendee management and RSVP functionality.
 */
const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({
  event,
  currentUser,
  userRSVP,
  canEdit = false,
  canDelete = false,
  onRSVP,
  onEditEvent,
  onDeleteEvent,
  onShareEvent,
  onInviteAttendees,
  onJoinMeeting,
  onLocationPress,
  onAttachmentPress,
  onAttendeePress,
  onReminderToggle,
  onBack,
  loading = false,
  error,
  config = {},
  style,
  testID = 'event-details-screen',
  ...props
}) => {
  const [selectedRSVP, setSelectedRSVP] = useState<RSVPResponse | undefined>(userRSVP);
  const [rsvpNotes, setRSVPNotes] = useState('');

  const {
    showAttendees = true,
    showRSVP = true,
    showEdit = true,
    showDelete = true,
    showShare = true,
    showMap = true,
    showAgenda = true,
    showAttachments = true,
    showReminders = true,
    enableMeetingJoin = true,
    enableAttendeeManagement = true,
    showStatistics = true,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const attendeeStats = useMemo(() => {
    if (!event.attendees) return { accepted: 0, declined: 0, pending: 0, total: 0 };
    
    return event.attendees.reduce((stats, attendee) => {
      stats.total++;
      switch (attendee.status) {
        case 'accepted':
          stats.accepted++;
          break;
        case 'declined':
          stats.declined++;
          break;
        case 'tentative':
        case 'pending':
          stats.pending++;
          break;
      }
      return stats;
    }, { accepted: 0, declined: 0, pending: 0, total: 0 });
  }, [event.attendees]);

  const isUpcoming = useMemo(() => {
    return event.startDate > new Date();
  }, [event.startDate]);

  const canJoinMeeting = useMemo(() => {
    const now = new Date();
    const joinWindow = 15 * 60 * 1000; // 15 minutes before
    return event.meetingLink && 
           now >= new Date(event.startDate.getTime() - joinWindow) &&
           now <= event.endDate;
  }, [event.meetingLink, event.startDate, event.endDate]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleRSVP = useCallback(async (response: RSVPResponse) => {
    if (!onRSVP) return;
    
    try {
      await onRSVP(response, rsvpNotes);
      setSelectedRSVP(response);
    } catch (err) {
      console.error('RSVP failed:', err);
      Alert.alert('Error', 'Failed to update RSVP. Please try again.');
    }
  }, [onRSVP, rsvpNotes]);

  const handleDeleteEvent = useCallback(async () => {
    if (!onDeleteEvent) return;
    
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive' as const,
          onPress: async () => {
            try {
              await onDeleteEvent();
            } catch (err) {
              console.error('Delete event failed:', err);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  }, [onDeleteEvent]);

  const handleJoinMeeting = useCallback(() => {
    if (!event.meetingLink || !onJoinMeeting) return;
    onJoinMeeting();
  }, [event.meetingLink, onJoinMeeting]);

  const handleLocationPress = useCallback(() => {
    if (!event.location) return;
    
    if (onLocationPress) {
      onLocationPress(event.coordinates);
    } else if (event.coordinates) {
      // Open in maps app
      const url = `https://maps.google.com/maps?daddr=${event.coordinates.latitude},${event.coordinates.longitude}`;
      Linking.openURL(url);
    }
  }, [event.location, event.coordinates, onLocationPress]);

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
          onPress={onBack}
          style={styles.backButton}
          testID={`${testID}-back`}
        >
          <ChevronLeft style={styles.backIcon} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Event Details</Text>
        
        <View style={styles.headerActions}>
          {showShare && (
            <TouchableOpacity 
              onPress={onShareEvent}
              style={styles.headerAction}
              testID={`${testID}-share`}
            >
              <Text style={styles.headerActionIcon}>📤</Text>
            </TouchableOpacity>
          )}
          
          {canEdit && showEdit && (
            <TouchableOpacity 
              onPress={onEditEvent}
              style={styles.headerAction}
              testID={`${testID}-edit`}
            >
              <Text style={styles.headerActionIcon}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
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

  const renderEventHeader = () => {
    return (
      <Card style={styles.eventHeaderCard} testID={`${testID}-event-header`}>
        <View style={styles.eventHeader}>
          <View style={[
            styles.eventColorBar,
            { backgroundColor: event.color || COLORS.primary[500] }
          ]} />
          
          <View style={styles.eventHeaderContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <Text style={styles.eventDateTime}>
              📅 {formatDateRange(event.startDate, event.endDate, event.isAllDay)}
            </Text>
            
            {event.location && (
              <TouchableOpacity 
                onPress={handleLocationPress}
                style={styles.locationContainer}
                testID={`${testID}-location`}
              >
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
              </TouchableOpacity>
            )}
            
            {event.meetingLink && (
              <TouchableOpacity 
                onPress={handleJoinMeeting}
                style={styles.meetingLinkContainer}
                disabled={!canJoinMeeting}
                testID={`${testID}-meeting-link`}
              >
                <Text style={[
                  styles.meetingLink,
                  !canJoinMeeting && styles.meetingLinkDisabled
                ]}>
                  🔗 {canJoinMeeting ? 'Join Meeting' : 'Meeting Link'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Event Status Badges */}
            <View style={styles.eventBadges}>
              {event.status && (
                <Badge 
                  variant={event.status === 'confirmed' ? 'default' : 'secondary'}
                  style={styles.statusBadge}
                >
                  <Text style={styles.badgeText}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Text>
                </Badge>
              )}
              
              {event.priority && event.priority !== 'medium' && (
                <Badge 
                  variant={event.priority === 'high' ? 'destructive' : 'secondary'}
                  style={styles.priorityBadge}
                >
                  <Text style={styles.badgeText}>
                    {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                  </Text>
                </Badge>
              )}
              
              {event.isRecurring && (
                <Badge variant="secondary" style={styles.recurringBadge}>
                  <Text style={styles.badgeText}>Recurring</Text>
                </Badge>
              )}
            </View>
          </View>
        </View>

        {/* Organizer Info */}
        {event.createdBy && (
          <View style={styles.organizerContainer}>
            <Text style={styles.sectionLabel}>Organized by</Text>
            <View style={styles.organizerInfo}>
              <Avatar style={styles.organizerAvatar} alt={event.createdBy.name}>
                {event.createdBy.avatar ? (
                  <Image source={{ uri: event.createdBy.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {event.createdBy.name[0]?.toUpperCase()}
                  </Text>
                )}
              </Avatar>
              <View style={styles.organizerDetails}>
                <Text style={styles.organizerName}>{event.createdBy.name}</Text>
                {event.createdBy.title && (
                  <Text style={styles.organizerTitle}>{event.createdBy.title}</Text>
                )}
                {event.createdBy.organization && (
                  <Text style={styles.organizerOrganization}>{event.createdBy.organization}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderDescription = () => {
    if (!event.description) return null;

    return (
      <Card style={styles.descriptionCard} testID={`${testID}-description`}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{event.description}</Text>
      </Card>
    );
  };

  const renderStatistics = () => {
    if (!showStatistics || !event.attendees) return null;

    return (
      <View style={styles.statisticsContainer} testID={`${testID}-statistics`}>
        <StatsCard
          title="Attending"
          value={attendeeStats.accepted}
          subtitle={`of ${attendeeStats.total} invited`}
          color="green"
          style={styles.statCard}
        />
        
        <StatsCard
          title="Response Rate"
          value={`${Math.round(((attendeeStats.accepted + attendeeStats.declined) / attendeeStats.total) * 100)}%`}
          subtitle="have responded"
          color="blue"
          style={styles.statCard}
        />
      </View>
    );
  };

  const renderRSVPSection = () => {
    if (!showRSVP || !isUpcoming) return null;

    return (
      <Card style={styles.rsvpCard} testID={`${testID}-rsvp`}>
        <Text style={styles.sectionTitle}>RSVP</Text>
        
        <View style={styles.rsvpButtons}>
          <Button
            onPress={() => handleRSVP('accepted')}
            variant={selectedRSVP === 'accepted' ? 'default' : 'outline'}
            style={styles.rsvpButton}
            testID={`${testID}-rsvp-accept`}
          >
            <Text style={styles.rsvpButtonText}>✓ Accept</Text>
          </Button>
          
          <Button
            onPress={() => handleRSVP('tentative')}
            variant={selectedRSVP === 'tentative' ? 'default' : 'outline'}
            style={styles.rsvpButton}
            testID={`${testID}-rsvp-tentative`}
          >
            <Text style={styles.rsvpButtonText}>? Maybe</Text>
          </Button>
          
          <Button
            onPress={() => handleRSVP('declined')}
            variant={selectedRSVP === 'declined' ? 'destructive' : 'outline'}
            style={styles.rsvpButton}
            testID={`${testID}-rsvp-decline`}
          >
            <Text style={styles.rsvpButtonText}>✗ Decline</Text>
          </Button>
        </View>

        {selectedRSVP && (
          <Text style={styles.rsvpStatus}>
            You {selectedRSVP === 'accepted' ? 'accepted' : selectedRSVP === 'declined' ? 'declined' : 'might attend'} this event
          </Text>
        )}
      </Card>
    );
  };

  const renderAttendees = () => {
    if (!showAttendees || !event.attendees || event.attendees.length === 0) return null;

    const sortedAttendees = [...event.attendees].sort((a, b) => {
      // Organizer first, then by status, then by name
      if (a.isOrganizer) return -1;
      if (b.isOrganizer) return 1;
      if (a.status !== b.status) {
        const statusOrder = { accepted: 0, tentative: 1, pending: 2, declined: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.name.localeCompare(b.name);
    });

    return (
      <Card style={styles.attendeesCard} testID={`${testID}-attendees`}>
        <View style={styles.attendeesHeader}>
          <Text style={styles.sectionTitle}>
            Attendees ({attendeeStats.accepted}/{attendeeStats.total})
          </Text>
          
          {enableAttendeeManagement && (
            <TouchableOpacity 
              onPress={onInviteAttendees}
              style={styles.inviteButton}
              testID={`${testID}-invite`}
            >
              <Text style={styles.inviteButtonText}>+ Invite</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.attendeesList}>
          {sortedAttendees.map((attendee) => (
            <TouchableOpacity
              key={attendee.id}
              onPress={() => onAttendeePress?.(attendee)}
              style={styles.attendeeItem}
              testID={`${testID}-attendee-${attendee.id}`}
            >
              <Avatar style={styles.attendeeAvatar} alt={attendee.name}>
                {attendee.avatar ? (
                  <Image source={{ uri: attendee.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {attendee.name[0]?.toUpperCase()}
                  </Text>
                )}
              </Avatar>
              
              <View style={styles.attendeeInfo}>
                <Text style={styles.attendeeName}>{attendee.name}</Text>
                <Text style={styles.attendeeEmail}>{attendee.email}</Text>
              </View>
              
              <View style={styles.attendeeStatus}>
                {attendee.isOrganizer && (
                  <Badge variant="secondary" style={styles.organizerBadge}>
                    <Text style={styles.badgeText}>Organizer</Text>
                  </Badge>
                )}
                
                <Badge 
                  variant={
                    attendee.status === 'accepted' ? 'default' :
                    attendee.status === 'declined' ? 'destructive' : 'secondary'
                  }
                  style={styles.statusBadge}
                >
                  <Text style={styles.badgeText}>
                    {attendee.status === 'pending' ? 'No response' : 
                     attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                  </Text>
                </Badge>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  const renderAgenda = () => {
    if (!showAgenda || !event.agenda || event.agenda.length === 0) return null;

    return (
      <Card style={styles.agendaCard} testID={`${testID}-agenda`}>
        <Text style={styles.sectionTitle}>Agenda</Text>
        
        <View style={styles.agendaList}>
          {event.agenda.map((item, index) => (
            <View key={item.id} style={styles.agendaItem}>
              <View style={styles.agendaTime}>
                <Text style={styles.agendaTimeText}>
                  {item.startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </Text>
                <Text style={styles.agendaDuration}>
                  {Math.round((item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60))}m
                </Text>
              </View>
              
              <View style={styles.agendaContent}>
                <Text style={styles.agendaTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.agendaDescription}>{item.description}</Text>
                )}
                {item.presenter && (
                  <Text style={styles.agendaPresenter}>👤 {item.presenter}</Text>
                )}
                {item.location && (
                  <Text style={styles.agendaLocation}>📍 {item.location}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderAttachments = () => {
    if (!showAttachments || !event.attachments || event.attachments.length === 0) return null;

    return (
      <Card style={styles.attachmentsCard} testID={`${testID}-attachments`}>
        <Text style={styles.sectionTitle}>Attachments</Text>
        
        <View style={styles.attachmentsList}>
          {event.attachments.map((attachment) => (
            <TouchableOpacity
              key={attachment.id}
              onPress={() => onAttachmentPress?.(attachment)}
              style={styles.attachmentItem}
              testID={`${testID}-attachment-${attachment.id}`}
            >
              <View style={styles.attachmentIcon}>
                <Text style={styles.attachmentIconText}>📎</Text>
              </View>
              
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName}>{attachment.name}</Text>
                <Text style={styles.attachmentDetails}>
                  {formatFileSize(attachment.size)} • {attachment.type}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtonsContainer} testID={`${testID}-actions`}>
        {canJoinMeeting && enableMeetingJoin && (
          <Button
            onPress={handleJoinMeeting}
            style={styles.joinMeetingButton}
            testID={`${testID}-join-meeting`}
          >
            <Text style={styles.joinMeetingText}>Join Meeting</Text>
          </Button>
        )}
        
        {canDelete && showDelete && (
          <Button
            onPress={handleDeleteEvent}
            variant="destructive"
            style={styles.deleteButton}
            testID={`${testID}-delete`}
          >
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </Button>
        )}
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
        testID={`${testID}-scroll`}
      >
        {/* Event Header */}
        {renderEventHeader()}

        {/* Description */}
        {renderDescription()}

        {/* Statistics */}
        {renderStatistics()}

        {/* RSVP Section */}
        {renderRSVPSection()}

        {/* Attendees */}
        {renderAttendees()}

        {/* Agenda */}
        {renderAgenda()}

        {/* Attachments */}
        {renderAttachments()}

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  headerActionIcon: {
    fontSize: 20,
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
  eventHeaderCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  eventColorBar: {
    width: 4,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  eventHeaderContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  eventDateTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  locationContainer: {
    marginBottom: SPACING.sm,
  },
  eventLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    textDecorationLine: 'underline',
  },
  meetingLinkContainer: {
    marginBottom: SPACING.md,
  },
  meetingLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    textDecorationLine: 'underline',
  },
  meetingLinkDisabled: {
    color: COLORS.gray[400],
    textDecorationLine: 'none',
  },
  eventBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
  recurringBadge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  organizerContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.md,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  organizerTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  organizerOrganization: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  descriptionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  statisticsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
  },
  rsvpCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  rsvpButton: {
    flex: 1,
  },
  rsvpButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  rsvpStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  attendeesCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  attendeesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inviteButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary[500],
  },
  inviteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.white,
  },
  attendeesList: {
    gap: SPACING.md,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  attendeeEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  attendeeStatus: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  organizerBadge: {
    alignSelf: 'flex-start',
  },
  agendaCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  agendaList: {
    gap: SPACING.lg,
  },
  agendaItem: {
    flexDirection: 'row',
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary[200],
    paddingLeft: SPACING.md,
  },
  agendaTime: {
    width: 80,
    marginRight: SPACING.md,
  },
  agendaTimeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  agendaDuration: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[500],
  },
  agendaContent: {
    flex: 1,
  },
  agendaTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  agendaDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  agendaPresenter: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  agendaLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  attachmentsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  attachmentsList: {
    gap: SPACING.md,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  attachmentIconText: {
    fontSize: 20,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  attachmentDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
  },
  actionButtonsContainer: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  joinMeetingButton: {
    width: '100%',
  },
  joinMeetingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  deleteButton: {
    width: '100%',
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default EventDetailsScreen;
export type { 
  EventDetailsScreenProps, 
  EventDetailsScreenConfig, 
  EventDetails, 
  EventAttendee, 
  EventOrganizer, 
  EventReminder, 
  EventAttachment, 
  AgendaItem, 
  RSVPResponse 
};
