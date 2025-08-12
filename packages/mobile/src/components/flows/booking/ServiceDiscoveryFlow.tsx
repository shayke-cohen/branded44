/**
 * ServiceDiscoveryFlow Component - AI-Optimized React Native Component Library
 * 
 * A complete end-to-end service discovery and booking flow.
 * Guides users from browsing services to booking confirmation.
 * 
 * Flow Steps:
 * 1. Browse services by category
 * 2. Filter and search services
 * 3. View service details
 * 4. Select provider
 * 5. Choose date and time
 * 6. Complete booking
 * 7. Booking confirmation
 * 
 * Features:
 * - Multi-step navigation
 * - State management across screens
 * - Progress tracking
 * - Data persistence
 * - Error handling and recovery
 * - Analytics tracking points
 * 
 * @example
 * ```tsx
 * <ServiceDiscoveryFlow
 *   onFlowComplete={(booking) => handleBookingSuccess(booking)}
 *   onFlowCancel={() => navigation.goBack()}
 *   analytics={analyticsService}
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  SafeAreaView,
  Alert,
  BackHandler,
} from 'react-native';
import {
  ServicesScreen,
  ServiceDetailsScreen,
  BookingScreen,
} from '../../templates/booking';
import { COLORS, SPACING } from '../../../lib/constants';

// === TYPES ===

/**
 * Flow step identifier
 */
export type FlowStep = 
  | 'browse'
  | 'details'
  | 'booking'
  | 'confirmation';

/**
 * Flow state data
 */
export interface FlowState {
  /** Current step */
  currentStep: FlowStep;
  /** Selected service */
  selectedService: Service | null;
  /** Selected provider */
  selectedProvider: ServiceProvider | null;
  /** Search query */
  searchQuery: string;
  /** Applied filters */
  filters: any;
  /** Flow progress */
  progress: number;
  /** Flow start time */
  startTime: Date;
  /** Step history */
  stepHistory: FlowStep[];
}

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  /** Event name */
  event: string;
  /** Event properties */
  properties: Record<string, any>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Flow analytics interface
 */
export interface FlowAnalytics {
  /** Track flow start */
  trackFlowStart: (flowId: string) => void;
  /** Track step change */
  trackStepChange: (step: FlowStep, data?: any) => void;
  /** Track flow completion */
  trackFlowComplete: (booking: BookingData) => void;
  /** Track flow cancellation */
  trackFlowCancel: (step: FlowStep, reason?: string) => void;
  /** Track user action */
  trackAction: (action: string, data?: any) => void;
}

/**
 * ServiceDiscoveryFlow component props
 */
export interface ServiceDiscoveryFlowProps {
  /** Initial services data */
  initialServices?: Service[];
  /** Initial categories */
  initialCategories?: ServiceCategory[];
  /** Initial providers */
  initialProviders?: ServiceProvider[];
  /** Pre-selected service */
  preSelectedService?: Service;
  /** Pre-selected category */
  preSelectedCategory?: string;
  /** Flow completion handler */
  onFlowComplete?: (booking: BookingData) => void;
  /** Flow cancellation handler */
  onFlowCancel?: (step: FlowStep) => void;
  /** Step change handler */
  onStepChange?: (step: FlowStep, state: FlowState) => void;
  /** Data loading handlers */
  onLoadServices?: () => Promise<Service[]>;
  onLoadProviders?: (serviceId: string) => Promise<ServiceProvider[]>;
  onLoadServiceDetails?: (serviceId: string) => Promise<Service>;
  /** Booking submission handler */
  onSubmitBooking?: (booking: BookingData) => Promise<any>;
  /** Analytics service */
  analytics?: FlowAnalytics;
  /** Flow customization */
  allowBackNavigation?: boolean;
  enableAnalytics?: boolean;
  autoSaveProgress?: boolean;
  /** Accessibility */
  testID?: string;
}

// === COMPONENT ===

/**
 * ServiceDiscoveryFlow - Complete service discovery and booking flow
 * 
 * @example
 * ```tsx
 * const analytics = {
 *   trackFlowStart: (flowId) => Analytics.track('flow_start', { flowId }),
 *   trackStepChange: (step, data) => Analytics.track('step_change', { step, ...data }),
 *   trackFlowComplete: (booking) => Analytics.track('booking_complete', { bookingId: booking.id }),
 *   trackFlowCancel: (step, reason) => Analytics.track('flow_cancel', { step, reason }),
 *   trackAction: (action, data) => Analytics.track(action, data),
 * };
 * 
 * <ServiceDiscoveryFlow
 *   onFlowComplete={(booking) => {
 *     navigation.navigate('BookingSuccess', { booking });
 *   }}
 *   onFlowCancel={(step) => {
 *     navigation.goBack();
 *   }}
 *   analytics={analytics}
 * />
 * ```
 */
export default function ServiceDiscoveryFlow({
  initialServices = [],
  initialCategories = [],
  initialProviders = [],
  preSelectedService,
  preSelectedCategory,
  onFlowComplete,
  onFlowCancel,
  onStepChange,
  onLoadServices,
  onLoadProviders,
  onLoadServiceDetails,
  onSubmitBooking,
  analytics,
  allowBackNavigation = true,
  enableAnalytics = true,
  autoSaveProgress = true,
  testID = 'service-discovery-flow',
}: ServiceDiscoveryFlowProps) {
  
  // Flow state
  const [flowState, setFlowState] = useState<FlowState>({
    currentStep: preSelectedService ? 'details' : 'browse',
    selectedService: preSelectedService || null,
    selectedProvider: null,
    searchQuery: '',
    filters: preSelectedCategory ? { category: preSelectedCategory } : {},
    progress: 0,
    startTime: new Date(),
    stepHistory: [],
  });

  // Data state
  const [services, setServices] = useState<Service[]>(initialServices);
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
  const [providers, setProviders] = useState<ServiceProvider[]>(initialProviders);
  const [serviceDetails, setServiceDetails] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const flowId = useRef(`flow_${Date.now()}`);
  const analyticsRef = useRef(analytics);

  // Flow progress calculation
  const stepProgressMap: Record<FlowStep, number> = {
    browse: 25,
    details: 50,
    booking: 75,
    confirmation: 100,
  };

  // Initialize flow
  useEffect(() => {
    if (enableAnalytics && analyticsRef.current) {
      analyticsRef.current.trackFlowStart(flowId.current);
    }

    // Load initial data if needed
    if (services.length === 0 && onLoadServices) {
      loadServices();
    }

    // Set up back handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  // Update progress when step changes
  useEffect(() => {
    const newProgress = stepProgressMap[flowState.currentStep];
    setFlowState(prev => ({
      ...prev,
      progress: newProgress,
    }));

    // Track step change
    if (enableAnalytics && analyticsRef.current) {
      analyticsRef.current.trackStepChange(flowState.currentStep, {
        progress: newProgress,
        flowId: flowId.current,
      });
    }

    // Notify parent
    onStepChange?.(flowState.currentStep, flowState);

    // Auto-save progress
    if (autoSaveProgress) {
      saveFlowProgress();
    }
  }, [flowState.currentStep]);

  // Load services
  const loadServices = async () => {
    if (!onLoadServices) return;
    
    setLoading(true);
    setError(null);
    try {
      const loadedServices = await onLoadServices();
      setServices(loadedServices);
    } catch (err) {
      setError('Unable to load services. Please try again.');
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load providers for service
  const loadProviders = async (serviceId: string) => {
    if (!onLoadProviders) return;
    
    setLoading(true);
    try {
      const loadedProviders = await onLoadProviders(serviceId);
      setProviders(loadedProviders);
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load service details
  const loadServiceDetails = async (serviceId: string) => {
    if (!onLoadServiceDetails) return;
    
    setLoading(true);
    try {
      const details = await onLoadServiceDetails(serviceId);
      setServiceDetails(details);
    } catch (err) {
      console.error('Failed to load service details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to step
  const navigateToStep = (step: FlowStep, updateHistory: boolean = true) => {
    setFlowState(prev => ({
      ...prev,
      currentStep: step,
      stepHistory: updateHistory ? [...prev.stepHistory, prev.currentStep] : prev.stepHistory,
    }));
  };

  // Handle service selection
  const handleServiceSelect = async (service: Service) => {
    setFlowState(prev => ({
      ...prev,
      selectedService: service,
    }));

    // Track service selection
    if (enableAnalytics && analyticsRef.current) {
      analyticsRef.current.trackAction('service_selected', {
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
      });
    }

    // Load service details and providers
    await Promise.all([
      loadServiceDetails(service.id),
      loadProviders(service.id),
    ]);

    // Navigate to details
    navigateToStep('details');
  };

  // Handle booking initiation
  const handleBookingStart = (service: Service) => {
    // Track booking start
    if (enableAnalytics && analyticsRef.current) {
      analyticsRef.current.trackAction('booking_started', {
        serviceId: service.id,
        serviceName: service.name,
      });
    }

    navigateToStep('booking');
  };

  // Handle booking completion
  const handleBookingComplete = async (booking: BookingData) => {
    setLoading(true);
    try {
      // Submit booking
      if (onSubmitBooking) {
        await onSubmitBooking(booking);
      }

      // Track completion
      if (enableAnalytics && analyticsRef.current) {
        analyticsRef.current.trackFlowComplete(booking);
      }

      // Navigate to confirmation
      navigateToStep('confirmation');

      // Complete flow
      onFlowComplete?.(booking);
      
    } catch (err) {
      Alert.alert(
        'Booking Error',
        'Unable to complete your booking. Please try again.',
        [
          { text: 'OK', onPress: () => {} }
        ]
      );
      console.error('Booking submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBackPress = (): boolean => {
    if (!allowBackNavigation) return true;

    const { stepHistory, currentStep } = flowState;
    
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setFlowState(prev => ({
        ...prev,
        currentStep: previousStep,
        stepHistory: prev.stepHistory.slice(0, -1),
      }));
      return true;
    }

    // Handle flow cancellation
    handleFlowCancel('user_back_navigation');
    return true;
  };

  // Handle flow cancellation
  const handleFlowCancel = (reason: string = 'user_initiated') => {
    // Track cancellation
    if (enableAnalytics && analyticsRef.current) {
      analyticsRef.current.trackFlowCancel(flowState.currentStep, reason);
    }

    onFlowCancel?.(flowState.currentStep);
  };

  // Save flow progress
  const saveFlowProgress = () => {
    // Implement local storage or async storage
    // This would typically save the flow state for later restoration
  };

  // Handle search
  const handleSearch = (query: string) => {
    setFlowState(prev => ({
      ...prev,
      searchQuery: query,
    }));

    // Track search
    if (enableAnalytics && analyticsRef.current) {
      analyticsRef.current.trackAction('service_search', {
        query,
        resultsCount: services.length,
      });
    }
  };

  // Handle filters
  const handleFiltersChange = (filters: any) => {
    setFlowState(prev => ({
      ...prev,
      filters,
    }));

    // Track filtering
    if (enableAnalytics && analyticsRef.current) {
      analyticsRef.current.trackAction('services_filtered', {
        filters,
        resultsCount: services.length,
      });
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (flowState.currentStep) {
      case 'browse':
        return (
          <ServicesScreen
            services={services}
            categories={categories}
            loading={loading}
            error={error}
            searchQuery={flowState.searchQuery}
            filters={flowState.filters}
            onServicePress={handleServiceSelect}
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            onRefresh={loadServices}
            onBack={() => handleFlowCancel('user_back_navigation')}
          />
        );

      case 'details':
        return (
          <ServiceDetailsScreen
            service={serviceDetails || flowState.selectedService!}
            provider={flowState.selectedProvider}
            loading={loading}
            error={error}
            onBookNow={handleBookingStart}
            onBack={() => navigateToStep('browse')}
          />
        );

      case 'booking':
        return (
          <BookingScreen
            service={flowState.selectedService!}
            provider={flowState.selectedProvider}
            providers={providers}
            loading={loading}
            error={error}
            onBookingComplete={handleBookingComplete}
            onBack={() => navigateToStep('details')}
            onCancel={() => handleFlowCancel('user_cancel_booking')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      {renderCurrentStep()}
    </SafeAreaView>
  );
}

// === STYLES ===

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
};

// === EXPORTS ===

export type {
  ServiceDiscoveryFlowProps,
  FlowStep,
  FlowState,
  AnalyticsEvent,
  FlowAnalytics,
};
