/**
 * Booking & Service Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all booking and service-related block components with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Booking Blocks
 * @author AI Component System
 * @version 1.0.0
 */

// === SERVICE COMPONENTS ===

export { default as ServiceCard } from './ServiceCard';
export type {
  ServiceCardProps,
  Service,
  ServiceCategory,
  ServiceLevel,
  ServicePricing,
  ServiceProvider,
  ServiceAvailability,
  ServiceAction,
} from './ServiceCard';

export { default as ServiceProviderCard } from './ServiceProviderCard';
export type {
  ServiceProviderCardProps,
  ServiceProvider as ProviderCardProvider,
  VerificationLevel,
  ProviderStatus,
  ProviderSpecialty,
  ProviderCertification,
  WorkingHours,
  ProviderPricing,
  ProviderStats,
  ProviderAction,
} from './ServiceProviderCard';

// === BOOKING COMPONENTS ===

export { default as BookingCalendar } from './BookingCalendar';
export type {
  BookingCalendarProps,
  TimeSlot,
  CalendarDay,
  AvailabilityRule,
  BookingConstraints,
  SelectedSlot,
  SlotStatus,
  CalendarView,
} from './BookingCalendar';

export { default as TimeSlotGrid } from './TimeSlotGrid';
export type {
  TimeSlotGridProps,
  TimeSlot as GridTimeSlot,
  TimeSlotStatus,
  GridLayout,
  TimeFormat,
  TimeRange,
  GridConfig,
  SelectedSlotInfo,
} from './TimeSlotGrid';

export { default as BookingForm } from './BookingForm';
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
} from './BookingForm';

export { default as BookingSummary } from './BookingSummary';
export type {
  BookingSummaryProps,
  BookingData,
  BookingStatus,
  PaymentStatus as SummaryPaymentStatus,
  ServiceInfo,
  ProviderInfo,
  CustomerInfo as SummaryCustomerInfo,
  PricingBreakdown,
  BookingPolicies,
  ReminderSettings,
  SummaryAction,
} from './BookingSummary';

export { default as AppointmentCard } from './AppointmentCard';
export type {
  AppointmentCardProps,
  Appointment,
  AppointmentStatus,
  AppointmentPriority,
  PaymentStatus as AppointmentPaymentStatus,
  Provider,
  Service as AppointmentService,
  Customer,
  ReminderSettings as AppointmentReminders,
  AppointmentAction,
} from './AppointmentCard';

export { default as ReviewCard } from './ReviewCard';
export type {
  ReviewCardProps,
  Review,
  ReviewVerification,
  RatingBreakdown,
  ReviewAuthor,
  ReviewMedia,
  ProviderResponse,
  ReviewHelpfulness,
  ReviewServiceInfo,
  ReviewAction,
} from './ReviewCard';

// === ADVANCED BOOKING COMPONENTS ===

export { default as ClassScheduleCard } from './ClassScheduleCard';
export type {
  ClassScheduleCardProps,
  ClassSchedule,
  ClassDifficulty,
  EnrollmentStatus,
  RecurrencePattern,
  ClassPricing,
  ClassInstructor,
  ClassEquipment,
  ClassOccurrence,
  ClassAction,
} from './ClassScheduleCard';

export { default as RecurringBookingForm } from './RecurringBookingForm';
export type {
  RecurringBookingFormProps,
  RecurringBookingData,
  RecurrencePattern as RecurringPattern,
  RecurrenceEnd,
  TimeSlotConfig,
  RecurringPricing,
  BookingException,
  OccurrencePreview,
  FormErrors as RecurringFormErrors,
  RecurrenceFrequency,
  RecurrenceEndType,
  DayOfWeek,
  MonthlyPattern,
} from './RecurringBookingForm';

export { default as CancellationPolicy } from './CancellationPolicy';
export type {
  CancellationPolicyProps,
  CancellationPolicy as PolicyData,
  CancellationFee,
  CancellationRule,
  PolicyException,
  NoShowPolicy,
  RefundProcessing,
  BookingDetails,
  FeeCalculation,
  CancellationFeeType,
  CancellationWindow,
  RefundMethod,
  PolicySeverity,
} from './CancellationPolicy';

export { default as WaitlistCard } from './WaitlistCard';
export type {
  WaitlistCardProps,
  WaitlistEntry,
  WaitlistService,
  WaitlistTimeSlot,
  WaitlistStats,
  WaitlistAction,
  WaitlistStatus,
  NotificationMethod,
  WaitlistPriority,
} from './WaitlistCard';

export { default as PackageCard } from './PackageCard';
export type {
  PackageCardProps,
  ServicePackage,
  PackageType,
  PackageStatus,
  BillingCycle,
  PackagePricing,
  PackageUsage,
  PackageBenefit,
  PackageRestrictions,
  PackageProvider,
  PackageComparison,
  PackageAction,
} from './PackageCard';

export { default as ResourceBookingCard } from './ResourceBookingCard';
export type {
  ResourceBookingCardProps,
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceCondition,
  ResourceFeature,
  ResourceSpecs,
  ResourcePricing,
  BookingConstraints,
  ResourceLocation,
  ResourceBookingSlot,
  BookingRequest,
  ResourceAction,
  DurationUnit,
} from './ResourceBookingCard';

// === UTILITY EXPORTS ===

export { cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these booking and service components effectively.
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For Service Discovery:
 * - Use `ServiceCard` for displaying individual services with pricing and booking options
 * - Use `ServiceProviderCard` for showing provider profiles with ratings and availability
 * - Both support multiple layouts (compact, standard, detailed) and custom actions
 * 
 * ### For Booking Flow:
 * - Use `BookingCalendar` for date and time selection with provider availability
 * - Use `TimeSlotGrid` for visual time slot selection with availability indicators
 * - Use `BookingForm` for collecting customer information and preferences
 * - Use `BookingSummary` for confirmation and booking details display
 * 
 * ### For Appointment Management:
 * - Use `AppointmentCard` for displaying upcoming/past appointments with quick actions
 * - Supports different statuses, priorities, and real-time updates
 * - Perfect for customer and provider dashboards
 * 
 * ### For Reviews & Feedback:
 * - Use `ReviewCard` for displaying customer reviews with ratings and media
 * - Supports rating breakdowns, helpfulness votes, and provider responses
 * - Perfect for building trust and social proof
 * 
 * ## Common Implementation Patterns
 * 
 * ### Service Marketplace:
 * ```tsx
 * // Service browsing screen
 * <FlatList
 *   data={services}
 *   renderItem={({ item }) => (
 *     <ServiceCard
 *       service={item}
 *       onPress={() => navigateToService(item.id)}
 *       onBook={() => startBookingFlow(item.id)}
 *       onFavorite={() => toggleFavorite(item.id)}
 *       showProvider={true}
 *       showBookingButton={true}
 *       layout="standard"
 *     />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 * 
 * ### Provider Directory:
 * ```tsx
 * // Provider listing screen
 * <FlatList
 *   data={providers}
 *   renderItem={({ item }) => (
 *     <ServiceProviderCard
 *       provider={item}
 *       onPress={() => navigateToProvider(item.id)}
 *       onBook={() => bookWithProvider(item.id)}
 *       onContact={() => contactProvider(item.id)}
 *       showRating={true}
 *       showSpecialties={true}
 *       showBookButton={true}
 *       layout="standard"
 *     />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 * 
 * ### Booking Flow:
 * ```tsx
 * // Step 1: Calendar selection
 * <BookingCalendar
 *   providerId="prov_123"
 *   serviceId="srv_456"
 *   serviceDuration={60}
 *   servicePrice={100}
 *   currency="USD"
 *   availabilityRules={providerSchedule}
 *   constraints={bookingRules}
 *   onSlotSelect={(slot) => proceedToForm(slot)}
 *   view="week"
 *   showPricing={true}
 * />
 * 
 * // Step 2: Customer information
 * <BookingForm
 *   serviceId="srv_456"
 *   providerId="prov_123"
 *   timeSlot={selectedSlot}
 *   customFields={serviceSpecificFields}
 *   onSubmit={(data) => processBooking(data)}
 *   requiresPayment={true}
 *   showPreferences={true}
 * />
 * 
 * // Step 3: Confirmation
 * <BookingSummary
 *   booking={completedBooking}
 *   onModify={() => modifyBooking(booking.id)}
 *   onCancel={() => cancelBooking(booking.id)}
 *   onContactProvider={() => contactProvider(booking.provider.id)}
 *   showPricing={true}
 *   showPolicies={true}
 * />
 * ```
 * 
 * ### Appointment Dashboard:
 * ```tsx
 * // Customer's upcoming appointments
 * <FlatList
 *   data={upcomingAppointments}
 *   renderItem={({ item }) => (
 *     <AppointmentCard
 *       appointment={item}
 *       onPress={() => viewAppointmentDetails(item.id)}
 *       onReschedule={() => rescheduleAppointment(item.id)}
 *       onCancel={() => cancelAppointment(item.id)}
 *       onJoinMeeting={() => joinVideoCall(item.meetingLink)}
 *       showProvider={true}
 *       showQuickActions={true}
 *       layout="standard"
 *     />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 * 
 * ### Reviews Display:
 * ```tsx
 * // Service reviews section
 * <FlatList
 *   data={serviceReviews}
 *   renderItem={({ item }) => (
 *     <ReviewCard
 *       review={item}
 *       onPress={() => viewFullReview(item.id)}
 *       onHelpfulVote={() => voteHelpful(item.id)}
 *       onAuthorPress={() => viewProfile(item.author.id)}
 *       showRatingBreakdown={true}
 *       showHelpfulness={true}
 *       showMedia={true}
 *       layout="standard"
 *     />
 *   )}
 *   keyExtractor={(item) => item.id}
 * />
 * ```
 * 
 * ## Data Structure Examples
 * 
 * ### Service Data:
 * ```typescript
 * const serviceData: Service = {
 *   id: 'srv_123',
 *   name: 'Deep Tissue Massage',
 *   description: 'Therapeutic massage targeting muscle tension and knots',
 *   category: 'health',
 *   duration: 90,
 *   durationUnit: 'minutes',
 *   pricing: {
 *     basePrice: 120,
 *     currency: 'USD',
 *     unit: 'session'
 *   },
 *   provider: {
 *     id: 'prov_456',
 *     name: 'Alex Thompson',
 *     rating: 4.8,
 *     reviewCount: 127,
 *     verified: true,
 *     specialties: ['Deep Tissue', 'Sports Massage']
 *   },
 *   availability: { available: true },
 *   rating: 4.9,
 *   reviewCount: 89,
 *   locationType: 'onsite',
 *   tags: ['massage', 'therapy', 'relaxation'],
 *   images: ['service_image_1.jpg', 'service_image_2.jpg']
 * };
 * ```
 * 
 * ### Booking Data:
 * ```typescript
 * const bookingData: BookingData = {
 *   id: 'book_789',
 *   confirmationNumber: 'CNF-ABC123',
 *   status: 'confirmed',
 *   dateTime: new Date('2024-01-15T14:00:00'),
 *   endTime: new Date('2024-01-15T15:30:00'),
 *   service: serviceData.service,
 *   provider: serviceData.provider,
 *   customer: {
 *     name: 'Sarah Johnson',
 *     email: 'sarah@example.com',
 *     phone: '+1234567890'
 *   },
 *   pricing: {
 *     basePrice: 120,
 *     fees: [],
 *     discounts: [],
 *     tax: 9.6,
 *     taxRate: 0.08,
 *     total: 129.6,
 *     currency: 'USD',
 *     paymentStatus: 'paid'
 *   },
 *   reminders: {
 *     email: true,
 *     sms: true,
 *     push: true,
 *     timeBefore: 60
 *   }
 * };
 * ```
 * 
 * ### Review Data:
 * ```typescript
 * const reviewData: Review = {
 *   id: 'rev_456',
 *   title: 'Amazing massage experience!',
 *   content: 'Alex was incredibly professional and the massage was exactly what I needed...',
 *   rating: {
 *     overall: 5,
 *     serviceQuality: 5,
 *     communication: 5,
 *     punctuality: 4
 *   },
 *   author: {
 *     id: 'user_789',
 *     name: 'Mike R.',
 *     verified: true,
 *     totalReviews: 8
 *   },
 *   date: new Date('2024-01-10'),
 *   verification: 'verified',
 *   media: [
 *     {
 *       id: 'media_1',
 *       type: 'image',
 *       url: 'review_photo.jpg',
 *       caption: 'Relaxing environment'
 *     }
 *   ],
 *   helpfulness: { helpful: 12, notHelpful: 0 },
 *   tags: ['professional', 'relaxing', 'effective']
 * };
 * ```
 * 
 * ## Advanced Usage Patterns
 * 
 * ### Multi-Service Booking:
 * ```tsx
 * <TimeSlotGrid
 *   slots={availableSlots}
 *   allowMultipleSelection={true}
 *   maxSelections={3}
 *   onMultipleSelect={(slots) => handleMultipleBooking(slots)}
 *   config={{
 *     columns: 3,
 *     showPricing: true,
 *     timeFormat: '12h'
 *   }}
 * />
 * ```
 * 
 * ### Provider Dashboard View:
 * ```tsx
 * <AppointmentCard
 *   appointment={clientAppointment}
 *   showCustomer={true}
 *   showProvider={false}
 *   showPaymentStatus={true}
 *   actions={[
 *     {
 *       id: 'start_session',
 *       label: 'Start Session',
 *       icon: '▶️',
 *       onPress: () => startSession(appointment.id)
 *     },
 *     {
 *       id: 'view_notes',
 *       label: 'Client Notes',
 *       icon: '📝',
 *       onPress: () => viewClientNotes(appointment.customer.id)
 *     }
 *   ]}
 * />
 * ```
 * 
 * ### Review with Response:
 * ```tsx
 * <ReviewCard
 *   review={reviewWithResponse}
 *   showResponse={true}
 *   showRatingBreakdown={true}
 *   onResponsePress={() => viewProviderResponse(review.response.id)}
 *   actions={[
 *     {
 *       id: 'respond',
 *       label: 'Respond',
 *       icon: '💬',
 *       onPress: () => respondToReview(review.id)
 *     }
 *   ]}
 * />
 * ```
 * 
 * ## Integration Patterns
 * 
 * ### State Management:
 * - Use React Context or Zustand for booking flow state
 * - Implement optimistic updates for favorites and votes
 * - Cache provider availability and service data
 * 
 * ### Navigation:
 * - Deep link to specific services and providers
 * - Implement booking flow as a stack navigator
 * - Use modals for quick actions like rescheduling
 * 
 * ### Real-time Features:
 * - WebSocket updates for appointment status changes
 * - Push notifications for booking confirmations and reminders
 * - Live availability updates during booking flow
 * 
 * ### Payment Integration:
 * - Stripe, PayPal, or Apple/Google Pay integration
 * - Support for deposits and full payments
 * - Refund and dispute handling
 * 
 * ### Analytics:
 * - Track booking conversion rates
 * - Monitor review sentiment
 * - Provider performance metrics
 * 
 * ## Complete Library Stats
 * - **14 Booking Block Components** for comprehensive service booking flows
 * - **100% TypeScript** with extensive type definitions for all booking scenarios
 * - **AI-Optimized** with detailed JSDoc documentation and usage examples
 * - **Production-Ready** with error handling, loading states, and accessibility
 * - **Flexible Layouts** supporting compact, standard, and detailed display modes
 * - **Real-time Ready** with status updates and live availability integration
 * - **Payment Ready** with pricing displays and payment status tracking
 * - **Review System** with ratings, media, and provider response capabilities
 */
