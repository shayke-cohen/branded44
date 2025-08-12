/**
 * Booking Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all booking and service-related template components for easy imports.
 * These templates provide complete screen implementations for booking-based applications.
 * 
 * @example
 * ```tsx
 * import { 
 *   ServicesScreen, 
 *   ServiceDetailsScreen, 
 *   BookingScreen 
 * } from '@/components/templates/booking';
 * ```
 */

// Core Booking Templates
export { default as ServicesScreen } from './ServicesScreen';
export { default as ServiceDetailsScreen } from './ServiceDetailsScreen';
export { default as BookingScreen } from './BookingScreen';
export { default as MyBookingsScreen } from './MyBookingsScreen';

// Template Types
export type { ServicesScreenProps, ServiceCategory, ServiceFilters, ServiceSortOption, LayoutMode } from './ServicesScreen';
export type { ServiceDetailsScreenProps, ServicePackage, SimilarService, ServiceFeature } from './ServiceDetailsScreen';
export type { BookingScreenProps, BookingStep, SelectedTimeSlot, CustomerDetails, PaymentDetails, BookingData } from './BookingScreen';
export type { MyBookingsScreenProps, BookingStatus, BookingFilters, BookingAction } from './MyBookingsScreen';

/**
 * AI AGENT USAGE GUIDE
 * ====================
 * 
 * ## Booking & Service Templates
 * 
 * These templates provide complete screen implementations for service-based businesses
 * like salons, fitness centers, healthcare, consultancy, and more.
 * 
 * ### Template Categories:
 * 
 * #### 1. Service Discovery
 * - `ServicesScreen` - Browse and search services
 * - `ServiceDetailsScreen` - Detailed service view with booking CTA
 * 
 * #### 2. Booking Management
 * - `BookingScreen` - Complete booking flow
 * - `MyBookingsScreen` - Customer booking management
 * 
 * ### Usage Examples:
 * 
 * #### Service Discovery Flow:
 * ```tsx
 * // Browse services
 * <ServicesScreen
 *   services={services}
 *   categories={categories}
 *   onServicePress={(service) => navigation.navigate('ServiceDetails', { service })}
 *   onCategorySelect={(category) => filterServices(category)}
 * />
 * 
 * // View service details
 * <ServiceDetailsScreen
 *   service={selectedService}
 *   provider={serviceProvider}
 *   reviews={serviceReviews}
 *   onBookNow={(service) => navigation.navigate('Booking', { service })}
 * />
 * ```
 * 
 * #### Booking Management:
 * ```tsx
 * // Complete booking flow
 * <BookingScreen
 *   service={selectedService}
 *   provider={selectedProvider}
 *   onBookingComplete={(booking) => {
 *     navigation.navigate('BookingConfirmation', { booking });
 *   }}
 * />
 * 
 * // Manage existing bookings
 * <MyBookingsScreen
 *   bookings={userBookings}
 *   onBookingPress={(booking) => navigation.navigate('BookingDetails', { booking })}
 *   onReschedule={(booking) => rescheduleBooking(booking)}
 * />
 * ```
 * 
 * ### Navigation Setup:
 * 
 * ```tsx
 * // React Navigation Stack
 * const BookingStack = createStackNavigator();
 * 
 * function BookingNavigator() {
 *   return (
 *     <BookingStack.Navigator>
 *       <BookingStack.Screen name="Services" component={ServicesScreen} />
 *       <BookingStack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
 *       <BookingStack.Screen name="Booking" component={BookingScreen} />
 *       <BookingStack.Screen name="MyBookings" component={MyBookingsScreen} />
 *     </BookingStack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### State Management:
 * 
 * ```tsx
 * // Zustand store for booking state
 * interface BookingStore {
 *   services: Service[];
 *   selectedService: Service | null;
 *   bookings: Appointment[];
 *   setSelectedService: (service: Service) => void;
 *   addBooking: (booking: Appointment) => void;
 * }
 * ```
 * 
 * ### API Integration:
 * 
 * ```tsx
 * // Service API calls
 * const bookingApi = {
 *   getServices: () => fetch('/api/services'),
 *   getService: (id: string) => fetch(`/api/services/${id}`),
 *   createBooking: (data: BookingData) => fetch('/api/bookings', {
 *     method: 'POST',
 *     body: JSON.stringify(data)
 *   }),
 *   getBookings: () => fetch('/api/bookings'),
 * };
 * ```
 * 
 * ### Common Props Patterns:
 * 
 * #### Service Data Structure:
 * ```tsx
 * const service: Service = {
 *   id: 'svc_1',
 *   name: 'Personal Training Session',
 *   description: 'One-on-one fitness training',
 *   category: 'fitness',
 *   duration: 60,
 *   durationUnit: 'minutes',
 *   pricing: {
 *     basePrice: 85,
 *     currency: 'USD',
 *     unit: 'session'
 *   },
 *   provider: {
 *     id: 'prov_1',
 *     name: 'Sarah Johnson',
 *     rating: 4.9,
 *     verified: true
 *   },
 *   images: ['https://example.com/image.jpg'],
 *   availability: { available: true },
 *   rating: 4.8,
 *   reviewCount: 124
 * };
 * ```
 * 
 * ### Business Logic Integration:
 * 
 * ```tsx
 * // Booking business logic
 * const handleBookingFlow = {
 *   // Step 1: Service selection
 *   selectService: (service: Service) => {
 *     setSelectedService(service);
 *     navigation.navigate('ServiceDetails', { service });
 *   },
 *   
 *   // Step 2: Booking initiation
 *   startBooking: (service: Service) => {
 *     navigation.navigate('Booking', { service });
 *   },
 *   
 *   // Step 3: Booking completion
 *   completeBooking: async (bookingData: BookingData) => {
 *     const booking = await bookingApi.createBooking(bookingData);
 *     addBooking(booking);
 *     navigation.navigate('BookingConfirmation', { booking });
 *   }
 * };
 * ```
 * 
 * ### Error Handling:
 * 
 * ```tsx
 * // Error handling patterns
 * const handleBookingError = (error: Error) => {
 *   console.error('Booking error:', error);
 *   Alert.alert('Booking Error', error.message);
 * };
 * 
 * // Loading states
 * const [loading, setLoading] = useState(false);
 * const [error, setError] = useState<string | null>(null);
 * ```
 * 
 * ### Customization Examples:
 * 
 * ```tsx
 * // Custom service card styling
 * <ServicesScreen
 *   services={services}
 *   layout="grid"
 *   showCategories={true}
 *   showFilters={true}
 *   onServicePress={handleServicePress}
 * />
 * 
 * // Custom booking flow
 * <BookingScreen
 *   service={service}
 *   allowServiceChange={false}
 *   requirePayment={true}
 *   showProgress={true}
 *   onBookingComplete={handleBookingComplete}
 * />
 * ```
 * 
 * ### Performance Optimization:
 * 
 * ```tsx
 * // Lazy loading and caching
 * const servicesQuery = useQuery('services', bookingApi.getServices, {
 *   staleTime: 5 * 60 * 1000, // 5 minutes
 *   cacheTime: 10 * 60 * 1000, // 10 minutes
 * });
 * 
 * // Virtual list for large datasets
 * <FlatList
 *   data={services}
 *   renderItem={renderServiceItem}
 *   windowSize={10}
 *   removeClippedSubviews={true}
 *   getItemLayout={getItemLayout}
 * />
 * ```
 * 
 * ### Complete Library Stats:
 * - 4 Booking Template Components
 * - Full booking flow coverage
 * - Service discovery and management
 * - Customer booking management
 * - Provider interaction patterns
 * - Payment integration ready
 * - Review and rating systems
 * - Multi-platform support (iOS/Android)
 * - TypeScript definitions included
 * - Accessibility support built-in
 */
