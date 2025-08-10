/**
 * Business Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all business template components (full screens) with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Business Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === BUSINESS TEMPLATES ===

export { default as CalendarScreen } from './CalendarScreen';
export type { 
  CalendarScreenProps, 
  CalendarScreenConfig, 
  CalendarEvent, 
  EventAttendee, 
  EventReminder, 
  CalendarViewType, 
  CalendarFilter 
} from './CalendarScreen';

export { default as EventDetailsScreen } from './EventDetailsScreen';
export type { 
  EventDetailsScreenProps, 
  EventDetailsScreenConfig, 
  EventDetails, 
  EventAttendee as EventDetailsAttendee, 
  EventOrganizer, 
  EventReminder as EventDetailsReminder, 
  EventAttachment, 
  AgendaItem, 
  RSVPResponse 
} from './EventDetailsScreen';

export { default as CreateEventScreen } from './CreateEventScreen';
export type { 
  CreateEventScreenProps, 
  CreateEventScreenConfig, 
  EventFormData, 
  ReminderData, 
  RecurrencePattern, 
  AgendaItemData, 
  ContactData, 
  EventCategory 
} from './CreateEventScreen';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';
export type { 
  BaseComponentProps
} from '../../../lib/types';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these business templates effectively.
 * 
 * ## Quick Template Selection Guide
 * 
 * ### For Calendar & Event Management:
 * - Use `CalendarScreen` for calendar views and event management
 * - Use `EventDetailsScreen` for detailed event information and RSVP
 * - Use `CreateEventScreen` for creating and editing events
 * - Includes meeting scheduling, attendee management, and calendar integration
 * - Built-in support for recurring events and reminders
 * 
 * ## Complete Business Workflow Implementation
 * 
 * ### Calendar Management Application:
 * ```tsx
 * // Main calendar screen with month/week/day views
 * <CalendarScreen
 *   events={calendarEvents}
 *   selectedDate={selectedDate}
 *   view="month"
 *   onDateSelect={(date) => setSelectedDate(date)}
 *   onEventPress={(event) => navigation.navigate('EventDetails', { event })}
 *   onCreateEvent={(date) => navigation.navigate('CreateEvent', { initialDate: date })}
 *   config={{
 *     defaultView: 'month',
 *     showMiniCalendar: true,
 *     showCategories: true,
 *     enableEventCreation: true,
 *     enableEventEditing: true,
 *     availableViews: ['month', 'week', 'day', 'agenda']
 *   }}
 * />
 * 
 * // Event details screen with RSVP and attendee management
 * <EventDetailsScreen
 *   event={selectedEvent}
 *   currentUser={currentUser}
 *   userRSVP={userRSVPStatus}
 *   canEdit={isEventOrganizer}
 *   canDelete={isEventOrganizer}
 *   onRSVP={(response) => handleRSVP(response)}
 *   onEditEvent={() => navigation.navigate('EditEvent', { event: selectedEvent })}
 *   onDeleteEvent={() => handleDeleteEvent()}
 *   onJoinMeeting={() => handleJoinMeeting()}
 *   onInviteAttendees={() => navigation.navigate('InviteAttendees')}
 *   config={{
 *     showAttendees: true,
 *     showRSVP: true,
 *     showAgenda: true,
 *     showAttachments: true,
 *     enableMeetingJoin: true,
 *     showStatistics: true
 *   }}
 * />
 * 
 * // Event creation screen with full form functionality
 * <CreateEventScreen
 *   initialDate={selectedDate}
 *   existingEvent={editingEvent}
 *   contacts={userContacts}
 *   categories={eventCategories}
 *   isEditing={!!editingEvent}
 *   onSaveEvent={(eventData) => handleSaveEvent(eventData)}
 *   onCancel={() => navigation.goBack()}
 *   onLocationSearch={(query) => searchLocations(query)}
 *   onGenerateMeetingLink={() => generateMeetingLink()}
 *   config={{
 *     showAdvancedSettings: true,
 *     showAttendeeManagement: true,
 *     showRecurrence: true,
 *     showAgendaBuilder: true,
 *     enableAutoSave: true,
 *     availableCategories: eventCategories
 *   }}
 * />
 * ```
 * 
 * ## Navigation Integration
 * 
 * ### React Navigation Stack:
 * ```tsx
 * const BusinessStack = createStackNavigator();
 * 
 * function BusinessNavigator() {
 *   return (
 *     <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
 *       <BusinessStack.Screen name="Calendar" component={CalendarScreen} />
 *       <BusinessStack.Screen name="EventDetails" component={EventDetailsScreen} />
 *       <BusinessStack.Screen name="CreateEvent" component={CreateEventScreen} />
 *       <BusinessStack.Screen name="EditEvent" component={CreateEventScreen} />
 *     </BusinessStack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### Tab Navigation Integration:
 * ```tsx
 * const MainTabs = createBottomTabNavigator();
 * 
 * function MainNavigator() {
 *   return (
 *     <MainTabs.Navigator>
 *       <MainTabs.Screen 
 *         name="Calendar" 
 *         component={CalendarScreen}
 *         options={{
 *           tabBarBadge: upcomingEventsCount > 0 ? upcomingEventsCount : undefined
 *         }}
 *       />
 *       <MainTabs.Screen name="Events" component={EventListScreen} />
 *     </MainTabs.Navigator>
 *   );
 * }
 * ```
 * 
 * ## Calendar Integration
 * 
 * ### Device Calendar Sync:
 * ```tsx
 * // Calendar screen with device sync
 * function CalendarContainer() {
 *   const { events, syncWithDevice, loading } = useCalendarSync();
 *   
 *   return (
 *     <CalendarScreen
 *       events={events}
 *       loading={loading}
 *       onRefresh={syncWithDevice}
 *       onCreateEvent={(date) => {
 *         navigation.navigate('CreateEvent', { 
 *           initialDate: date,
 *           syncToDevice: true 
 *         });
 *       }}
 *     />
 *   );
 * }
 * 
 * // Event creation with device sync
 * function CreateEventContainer({ route }) {
 *   const { saveToDevice } = useCalendarSync();
 *   
 *   const handleSaveEvent = async (eventData) => {
 *     try {
 *       // Save to backend
 *       await saveEvent(eventData);
 *       
 *       // Sync to device calendar
 *       if (route.params?.syncToDevice) {
 *         await saveToDevice(eventData);
 *       }
 *       
 *       navigation.goBack();
 *     } catch (error) {
 *       Alert.alert('Error', 'Failed to save event');
 *     }
 *   };
 *   
 *   return (
 *     <CreateEventScreen
 *       onSaveEvent={handleSaveEvent}
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 * 
 * ### Meeting Integration:
 * ```tsx
 * // Event details with video meeting
 * function EventDetailsContainer({ route }) {
 *   const { event } = route.params;
 *   const { joinMeeting, generateMeetingLink } = useMeetingService();
 *   
 *   const handleJoinMeeting = async () => {
 *     try {
 *       await joinMeeting(event.meetingLink);
 *     } catch (error) {
 *       Alert.alert('Error', 'Failed to join meeting');
 *     }
 *   };
 *   
 *   return (
 *     <EventDetailsScreen
 *       event={event}
 *       onJoinMeeting={handleJoinMeeting}
 *       config={{
 *         enableMeetingJoin: true,
 *         showAttendees: true
 *       }}
 *     />
 *   );
 * }
 * 
 * // Event creation with meeting generation
 * function CreateEventContainer() {
 *   const { generateMeetingLink } = useMeetingService();
 *   
 *   const handleGenerateMeetingLink = async () => {
 *     try {
 *       const link = await generateMeetingLink({
 *         title: formData.title,
 *         startTime: formData.startDate,
 *         duration: formData.duration
 *       });
 *       return link;
 *     } catch (error) {
 *       throw new Error('Failed to generate meeting link');
 *     }
 *   };
 *   
 *   return (
 *     <CreateEventScreen
 *       onGenerateMeetingLink={handleGenerateMeetingLink}
 *       config={{
 *         showMeetingLink: true,
 *         showAttendeeManagement: true
 *       }}
 *     />
 *   );
 * }
 * ```
 * 
 * ## State Management Integration
 * 
 * ### With Redux:
 * ```tsx
 * // Calendar management with Redux
 * function CalendarScreenContainer() {
 *   const dispatch = useDispatch();
 *   const { events, loading, selectedDate } = useSelector(state => state.calendar);
 *   
 *   return (
 *     <CalendarScreen
 *       events={events}
 *       selectedDate={selectedDate}
 *       loading={loading}
 *       onDateSelect={(date) => dispatch(selectDate(date))}
 *       onEventPress={(event) => dispatch(selectEvent(event))}
 *       onCreateEvent={(date) => dispatch(startCreateEvent(date))}
 *       onRefresh={() => dispatch(refreshEvents())}
 *     />
 *   );
 * }
 * 
 * // Event details with Redux
 * function EventDetailsContainer() {
 *   const dispatch = useDispatch();
 *   const { currentEvent, userRSVP } = useSelector(state => state.events);
 *   const { currentUser } = useSelector(state => state.auth);
 *   
 *   return (
 *     <EventDetailsScreen
 *       event={currentEvent}
 *       currentUser={currentUser}
 *       userRSVP={userRSVP}
 *       onRSVP={(response) => dispatch(updateRSVP({ eventId: currentEvent.id, response }))}
 *       onEditEvent={() => dispatch(startEditEvent(currentEvent))}
 *       onDeleteEvent={() => dispatch(deleteEvent(currentEvent.id))}
 *     />
 *   );
 * }
 * ```
 * 
 * ### With Context API:
 * ```tsx
 * // Using Calendar Context
 * function CalendarScreenWrapper() {
 *   const { 
 *     events, 
 *     selectedDate, 
 *     loading, 
 *     selectDate, 
 *     createEvent, 
 *     refreshEvents 
 *   } = useCalendar();
 *   
 *   return (
 *     <CalendarScreen
 *       events={events}
 *       selectedDate={selectedDate}
 *       loading={loading}
 *       onDateSelect={selectDate}
 *       onCreateEvent={createEvent}
 *       onRefresh={refreshEvents}
 *     />
 *   );
 * }
 * 
 * // Using Events Context
 * function EventDetailsWrapper() {
 *   const { currentEvent, updateRSVP, deleteEvent } = useEvents();
 *   const { currentUser } = useAuth();
 *   
 *   return (
 *     <EventDetailsScreen
 *       event={currentEvent}
 *       currentUser={currentUser}
 *       onRSVP={updateRSVP}
 *       onDeleteEvent={() => deleteEvent(currentEvent.id)}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Advanced Configuration Examples
 * 
 * ### Customized Calendar Screen:
 * ```tsx
 * <CalendarScreen
 *   events={events}
 *   selectedDate={selectedDate}
 *   view="month"
 *   config={{
 *     defaultView: 'month',
 *     showMiniCalendar: true,
 *     showCategories: true,
 *     showSearch: true,
 *     showFilters: true,
 *     enableEventCreation: true,
 *     enableEventEditing: true,
 *     enableDragDrop: false,
 *     showWeekNumbers: true,
 *     firstDayOfWeek: 1, // Monday
 *     showTodayButton: true,
 *     availableViews: ['month', 'week', 'day', 'agenda'],
 *     eventColors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b']
 *   }}
 *   categories={[
 *     { id: '1', name: 'Work', color: '#3b82f6' },
 *     { id: '2', name: 'Personal', color: '#22c55e' },
 *     { id: '3', name: 'Meeting', color: '#f59e0b' }
 *   ]}
 * />
 * ```
 * 
 * ### Feature-rich Event Details:
 * ```tsx
 * <EventDetailsScreen
 *   event={event}
 *   currentUser={currentUser}
 *   userRSVP={userRSVP}
 *   canEdit={isOrganizer}
 *   canDelete={isOrganizer}
 *   config={{
 *     showAttendees: true,
 *     showRSVP: true,
 *     showEdit: true,
 *     showDelete: true,
 *     showShare: true,
 *     showMap: true,
 *     showAgenda: true,
 *     showAttachments: true,
 *     showReminders: true,
 *     enableMeetingJoin: true,
 *     enableAttendeeManagement: true,
 *     showStatistics: true
 *   }}
 *   onRSVP={handleRSVP}
 *   onEditEvent={handleEdit}
 *   onDeleteEvent={handleDelete}
 *   onJoinMeeting={handleJoinMeeting}
 *   onLocationPress={openMaps}
 *   onAttachmentPress={openAttachment}
 * />
 * ```
 * 
 * ### Advanced Event Creation:
 * ```tsx
 * <CreateEventScreen
 *   initialDate={selectedDate}
 *   existingEvent={editingEvent}
 *   contacts={userContacts}
 *   categories={eventCategories}
 *   isEditing={!!editingEvent}
 *   config={{
 *     showAdvancedSettings: true,
 *     showAttendeeManagement: true,
 *     showRecurrence: true,
 *     showAgendaBuilder: true,
 *     showAttachments: true,
 *     showLocationPicker: true,
 *     showMeetingLink: true,
 *     enableAutoSave: true,
 *     autoSaveInterval: 30000,
 *     availableCategories: eventCategories,
 *     availableColors: ['#3b82f6', '#ef4444', '#22c55e'],
 *     defaultDuration: 60
 *   }}
 *   onSaveEvent={handleSaveEvent}
 *   onLocationSearch={searchLocations}
 *   onGenerateMeetingLink={generateMeetingLink}
 *   onAttachFile={selectFiles}
 * />
 * ```
 * 
 * ## Integration with External Services
 * 
 * ### Google Calendar Integration:
 * ```tsx
 * // Sync with Google Calendar
 * const handleSyncGoogleCalendar = async () => {
 *   try {
 *     const googleEvents = await GoogleCalendar.getEvents();
 *     const formattedEvents = googleEvents.map(formatGoogleEvent);
 *     dispatch(syncEvents(formattedEvents));
 *   } catch (error) {
 *     Alert.alert('Sync Error', 'Failed to sync with Google Calendar');
 *   }
 * };
 * ```
 * 
 * ### Outlook Integration:
 * ```tsx
 * // Sync with Outlook Calendar
 * const handleSyncOutlook = async () => {
 *   try {
 *     const outlookEvents = await OutlookCalendar.getEvents();
 *     const formattedEvents = outlookEvents.map(formatOutlookEvent);
 *     dispatch(syncEvents(formattedEvents));
 *   } catch (error) {
 *     Alert.alert('Sync Error', 'Failed to sync with Outlook');
 *   }
 * };
 * ```
 * 
 * ### Video Conferencing Integration:
 * ```tsx
 * // Zoom integration
 * const handleGenerateZoomLink = async (eventData) => {
 *   try {
 *     const meeting = await ZoomAPI.createMeeting({
 *       topic: eventData.title,
 *       start_time: eventData.startDate.toISOString(),
 *       duration: Math.ceil((eventData.endDate - eventData.startDate) / 60000),
 *       attendees: eventData.attendees
 *     });
 *     return meeting.join_url;
 *   } catch (error) {
 *     throw new Error('Failed to create Zoom meeting');
 *   }
 * };
 * 
 * // Teams integration
 * const handleGenerateTeamsLink = async (eventData) => {
 *   try {
 *     const meeting = await TeamsAPI.createMeeting({
 *       subject: eventData.title,
 *       startTime: eventData.startDate,
 *       endTime: eventData.endDate,
 *       attendees: eventData.attendees
 *     });
 *     return meeting.joinUrl;
 *   } catch (error) {
 *     throw new Error('Failed to create Teams meeting');
 *   }
 * };
 * ```
 */

/**
 * === STYLING SYSTEM ===
 * 
 * All templates use the centralized design system:
 * 
 * - `COLORS` - Comprehensive color palette with semantic meanings
 * - `SPACING` - Consistent spacing scale (xs, sm, md, lg, xl, etc.)
 * - `TYPOGRAPHY` - Font sizes, weights, and line heights
 * 
 * Templates accept custom styles via the `style` prop and can be
 * easily themed by modifying the constants file.
 * 
 * ### Custom Styling Example:
 * ```tsx
 * <CalendarScreen
 *   style={{ backgroundColor: '#f8fafc' }}
 *   config={{
 *     headerComponent: <CustomCalendarHeader />,
 *     footerComponent: <CustomCalendarFooter />
 *   }}
 * />
 * ```
 */

/**
 * === PERFORMANCE CONSIDERATIONS ===
 * 
 * These templates are optimized for performance:
 * 
 * ### Memory Management:
 * ```tsx
 * // Use pagination for large event lists
 * <CalendarScreen
 *   events={events}
 *   onPeriodChange={loadEventsForPeriod}
 *   config={{ itemsPerPage: 50 }}
 * />
 * 
 * // Optimize calendar rendering with virtualization
 * <CalendarScreen
 *   events={events}
 *   config={{ enableVirtualization: true }}
 * />
 * ```
 * 
 * ### Real-time Optimization:
 * ```tsx
 * // Throttle calendar updates
 * const throttledUpdate = useCallback(
 *   throttle((events) => setCalendarEvents(events), 1000),
 *   []
 * );
 * 
 * // Debounce search queries
 * const debouncedSearch = useCallback(
 *   debounce((query) => searchEvents(query), 300),
 *   []
 * );
 * ```
 */

/**
 * === ACCESSIBILITY FEATURES ===
 * 
 * All templates include comprehensive accessibility support:
 * 
 * - Screen reader compatibility with proper labels
 * - Keyboard navigation support
 * - High contrast mode support
 * - Voice control integration
 * - Touch target optimization
 * 
 * ### Accessibility Example:
 * ```tsx
 * <EventDetailsScreen
 *   testID="event-details"
 *   accessibilityLabel="Event details for team meeting"
 *   accessibilityHint="View event information, RSVP, and manage attendees"
 * />
 * ```
 */
