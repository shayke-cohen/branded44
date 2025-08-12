/**
 * Booking Flows Index - AI-Optimized React Native Component Library
 * 
 * This file exports all booking and service-related flow components for easy imports.
 * These flows provide complete multi-screen user journeys for booking-based applications.
 * 
 * @example
 * ```tsx
 * import { 
 *   ServiceDiscoveryFlow,
 *   BookingManagementFlow,
 *   ClassEnrollmentFlow 
 * } from '@/components/flows/booking';
 * ```
 */

// Core Booking Flows
export { default as ServiceDiscoveryFlow } from './ServiceDiscoveryFlow';

// Flow Types
export type { 
  ServiceDiscoveryFlowProps, 
  FlowStep, 
  FlowState, 
  AnalyticsEvent, 
  FlowAnalytics 
} from './ServiceDiscoveryFlow';

/**
 * AI AGENT USAGE GUIDE
 * ====================
 * 
 * ## Booking & Service Flows
 * 
 * These flows provide complete multi-screen user journeys for service-based businesses.
 * Each flow manages state, navigation, and data across multiple screens to create
 * seamless booking experiences.
 * 
 * ### Flow Categories:
 * 
 * #### 1. Service Discovery & Booking
 * - `ServiceDiscoveryFlow` - Browse → Filter → Service → Provider → Book → Confirm
 * 
 * #### 2. Booking Management (Coming Soon)
 * - `BookingManagementFlow` - View bookings → Modify → Reschedule → Cancel → Refund
 * - `ProviderOnboardingFlow` - Register → Profile → Services → Availability → Payment → Live
 * - `ReviewFlow` - Service completion → Rating → Review → Photos → Submit → Thank you
 * - `ClassEnrollmentFlow` - Browse classes → Details → Schedule → Enroll → Payment → Confirmation
 * 
 * ### Usage Examples:
 * 
 * #### Complete Service Discovery Flow:
 * ```tsx
 * // Service discovery and booking flow
 * <ServiceDiscoveryFlow
 *   onFlowComplete={(booking) => {
 *     // Handle successful booking
 *     navigation.navigate('BookingSuccess', { booking });
 *     showToast('Booking confirmed!');
 *   }}
 *   onFlowCancel={(step) => {
 *     // Handle flow cancellation
 *     navigation.goBack();
 *     Analytics.track('flow_cancelled', { step });
 *   }}
 *   onStepChange={(step, state) => {
 *     // Track progress
 *     setProgress(state.progress);
 *     Analytics.track('flow_step_change', { step, progress: state.progress });
 *   }}
 *   analytics={analyticsService}
 *   enableAnalytics={true}
 *   autoSaveProgress={true}
 * />
 * ```
 * 
 * #### Flow with Pre-selected Service:
 * ```tsx
 * // Start flow with pre-selected service (deep linking)
 * <ServiceDiscoveryFlow
 *   preSelectedService={selectedService}
 *   preSelectedCategory="fitness"
 *   onFlowComplete={handleBookingComplete}
 *   allowBackNavigation={true}
 * />
 * ```
 * 
 * ### Navigation Integration:
 * 
 * ```tsx
 * // React Navigation with flow integration
 * function BookingNavigator() {
 *   return (
 *     <Stack.Navigator>
 *       <Stack.Screen 
 *         name="ServiceDiscovery" 
 *         component={ServiceDiscoveryFlow}
 *         options={{ headerShown: false }}
 *       />
 *       <Stack.Screen 
 *         name="BookingSuccess" 
 *         component={BookingSuccessScreen}
 *       />
 *     </Stack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### Analytics Integration:
 * 
 * ```tsx
 * // Analytics service for flow tracking
 * const bookingAnalytics: FlowAnalytics = {
 *   trackFlowStart: (flowId) => {
 *     Analytics.track('booking_flow_start', {
 *       flowId,
 *       timestamp: new Date(),
 *       user: currentUser.id,
 *     });
 *   },
 *   
 *   trackStepChange: (step, data) => {
 *     Analytics.track('booking_step_change', {
 *       step,
 *       progress: data?.progress,
 *       duration: data?.duration,
 *       flowId: data?.flowId,
 *     });
 *   },
 *   
 *   trackFlowComplete: (booking) => {
 *     Analytics.track('booking_flow_complete', {
 *       bookingId: booking.id,
 *       serviceId: booking.service.id,
 *       providerId: booking.provider.id,
 *       totalCost: booking.totalCost,
 *       currency: booking.payment.currency,
 *     });
 *   },
 *   
 *   trackFlowCancel: (step, reason) => {
 *     Analytics.track('booking_flow_cancel', {
 *       step,
 *       reason,
 *       completionRate: getCompletionRate(step),
 *     });
 *   },
 *   
 *   trackAction: (action, data) => {
 *     Analytics.track(action, {
 *       ...data,
 *       timestamp: new Date(),
 *     });
 *   },
 * };
 * ```
 * 
 * ### State Management:
 * 
 * ```tsx
 * // Flow state management with Zustand
 * interface BookingFlowStore {
 *   currentFlow: string | null;
 *   flowState: FlowState | null;
 *   savedProgress: Record<string, FlowState>;
 *   
 *   startFlow: (flowId: string, initialState?: Partial<FlowState>) => void;
 *   updateFlowState: (state: Partial<FlowState>) => void;
 *   saveProgress: (flowId: string, state: FlowState) => void;
 *   restoreProgress: (flowId: string) => FlowState | null;
 *   completeFlow: (result: any) => void;
 *   cancelFlow: () => void;
 * }
 * 
 * const useBookingFlowStore = create<BookingFlowStore>((set, get) => ({
 *   currentFlow: null,
 *   flowState: null,
 *   savedProgress: {},
 *   
 *   startFlow: (flowId, initialState) => set({
 *     currentFlow: flowId,
 *     flowState: {
 *       currentStep: 'browse',
 *       progress: 0,
 *       startTime: new Date(),
 *       ...initialState,
 *     },
 *   }),
 *   
 *   updateFlowState: (state) => set((prev) => ({
 *     flowState: prev.flowState ? { ...prev.flowState, ...state } : null,
 *   })),
 *   
 *   saveProgress: (flowId, state) => set((prev) => ({
 *     savedProgress: {
 *       ...prev.savedProgress,
 *       [flowId]: state,
 *     },
 *   })),
 * }));
 * ```
 * 
 * ### Error Handling:
 * 
 * ```tsx
 * // Error boundary for flows
 * class FlowErrorBoundary extends React.Component {
 *   constructor(props) {
 *     super(props);
 *     this.state = { hasError: false, error: null };
 *   }
 *   
 *   static getDerivedStateFromError(error) {
 *     return { hasError: true, error };
 *   }
 *   
 *   componentDidCatch(error, errorInfo) {
 *     Analytics.track('flow_error', {
 *       error: error.message,
 *       stack: error.stack,
 *       errorInfo,
 *     });
 *   }
 *   
 *   render() {
 *     if (this.state.hasError) {
 *       return <FlowErrorScreen onRetry={this.props.onRetry} />;
 *     }
 *     
 *     return this.props.children;
 *   }
 * }
 * ```
 * 
 * ### API Integration:
 * 
 * ```tsx
 * // API service for booking flows
 * const bookingFlowAPI = {
 *   // Service discovery
 *   getServices: async (filters?: any) => {
 *     const response = await fetch('/api/services', {
 *       method: 'GET',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ filters }),
 *     });
 *     return response.json();
 *   },
 *   
 *   // Service details
 *   getServiceDetails: async (serviceId: string) => {
 *     const response = await fetch(`/api/services/${serviceId}`);
 *     return response.json();
 *   },
 *   
 *   // Provider information
 *   getProviders: async (serviceId: string) => {
 *     const response = await fetch(`/api/services/${serviceId}/providers`);
 *     return response.json();
 *   },
 *   
 *   // Booking submission
 *   submitBooking: async (bookingData: BookingData) => {
 *     const response = await fetch('/api/bookings', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(bookingData),
 *     });
 *     return response.json();
 *   },
 * };
 * ```
 * 
 * ### Performance Optimization:
 * 
 * ```tsx
 * // Optimized flow with lazy loading
 * const ServiceDiscoveryFlowLazy = React.lazy(() => 
 *   import('./ServiceDiscoveryFlow')
 * );
 * 
 * function OptimizedBookingFlow() {
 *   return (
 *     <Suspense fallback={<LoadingSpinner />}>
 *       <ServiceDiscoveryFlowLazy
 *         onLoadServices={bookingFlowAPI.getServices}
 *         onLoadServiceDetails={bookingFlowAPI.getServiceDetails}
 *         onLoadProviders={bookingFlowAPI.getProviders}
 *         onSubmitBooking={bookingFlowAPI.submitBooking}
 *       />
 *     </Suspense>
 *   );
 * }
 * ```
 * 
 * ### Testing Patterns:
 * 
 * ```tsx
 * // Flow testing with React Native Testing Library
 * describe('ServiceDiscoveryFlow', () => {
 *   const mockAnalytics = {
 *     trackFlowStart: jest.fn(),
 *     trackStepChange: jest.fn(),
 *     trackFlowComplete: jest.fn(),
 *     trackFlowCancel: jest.fn(),
 *     trackAction: jest.fn(),
 *   };
 *   
 *   it('completes the full booking flow', async () => {
 *     const onFlowComplete = jest.fn();
 *     
 *     render(
 *       <ServiceDiscoveryFlow
 *         initialServices={mockServices}
 *         onFlowComplete={onFlowComplete}
 *         analytics={mockAnalytics}
 *       />
 *     );
 *     
 *     // Test service selection
 *     fireEvent.press(screen.getByText('Personal Training'));
 *     expect(mockAnalytics.trackAction).toHaveBeenCalledWith('service_selected', expect.any(Object));
 *     
 *     // Test booking completion
 *     fireEvent.press(screen.getByText('Book Now'));
 *     // ... continue testing flow steps
 *     
 *     await waitFor(() => {
 *       expect(onFlowComplete).toHaveBeenCalled();
 *     });
 *   });
 * });
 * ```
 * 
 * ### Customization Examples:
 * 
 * ```tsx
 * // Custom flow with business-specific logic
 * <ServiceDiscoveryFlow
 *   initialServices={gymServices}
 *   preSelectedCategory="fitness"
 *   onFlowComplete={(booking) => {
 *     // Custom post-booking logic
 *     sendConfirmationEmail(booking);
 *     updateMembershipStatus(booking.customer);
 *     scheduleReminder(booking);
 *   }}
 *   analytics={gymAnalytics}
 *   allowBackNavigation={true}
 *   enableAnalytics={true}
 *   autoSaveProgress={true}
 * />
 * ```
 * 
 * ### Complete Library Stats:
 * - 1 Service Booking Flow (4 more planned)
 * - Multi-step navigation management
 * - State persistence across screens
 * - Analytics integration built-in
 * - Error handling and recovery
 * - Progress tracking and saving
 * - Back navigation support
 * - Deep linking ready
 * - Performance optimized
 * - TypeScript definitions included
 * - Comprehensive testing support
 */
