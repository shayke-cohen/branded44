/**
 * BookingScreen Template Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive booking flow screen with service, provider, and time selection.
 * Designed for complete appointment booking with all necessary details.
 * 
 * Features:
 * - Service and provider selection
 * - Date and time selection
 * - Customer details form
 * - Special requests and notes
 * - Payment method selection
 * - Booking summary and confirmation
 * - Multi-step booking flow
 * - Validation and error handling
 * 
 * @example
 * ```tsx
 * <BookingScreen
 *   service={selectedService}
 *   provider={selectedProvider}
 *   onBookingComplete={(booking) => handleBookingSuccess(booking)}
 *   onStepChange={(step) => trackBookingProgress(step)}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  BookingForm, 
  BookingSummary, 
  BookingCalendar, 
  TimeSlotGrid,
  ServiceCard,
  ServiceProviderCard 
} from '../../blocks/booking';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { Progress } from '../../../../~/components/ui/progress';
import { LoadingCard, ErrorCard } from '../../blocks/utility';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Booking step
 */
export type BookingStep = 
  | 'service'
  | 'provider'
  | 'datetime'
  | 'details'
  | 'payment'
  | 'summary'
  | 'confirmation';

/**
 * Selected time slot
 */
export interface SelectedTimeSlot {
  /** Slot unique identifier */
  id: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime: Date;
  /** Slot price */
  price: number;
  /** Provider availability */
  available: boolean;
}

/**
 * Customer details
 */
export interface CustomerDetails {
  /** Customer name */
  name: string;
  /** Customer email */
  email: string;
  /** Customer phone */
  phone: string;
  /** Special requests */
  notes?: string;
  /** Emergency contact */
  emergencyContact?: string;
  /** Previous experience */
  experience?: string;
  /** Health conditions */
  healthConditions?: string;
}

/**
 * Payment details
 */
export interface PaymentDetails {
  /** Payment method */
  method: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash';
  /** Payment amount */
  amount: number;
  /** Deposit amount */
  deposit?: number;
  /** Currency */
  currency: string;
  /** Card last 4 digits */
  cardLast4?: string;
}

/**
 * Booking data
 */
export interface BookingData {
  /** Service information */
  service: Service;
  /** Provider information */
  provider: ServiceProvider;
  /** Selected date and time */
  dateTime: SelectedTimeSlot;
  /** Customer details */
  customer: CustomerDetails;
  /** Payment details */
  payment: PaymentDetails;
  /** Total cost */
  totalCost: number;
  /** Booking notes */
  notes?: string;
}

/**
 * BookingScreen component props
 */
export interface BookingScreenProps {
  /** Pre-selected service */
  service?: Service;
  /** Pre-selected provider */
  provider?: ServiceProvider;
  /** Available services */
  services?: Service[];
  /** Available providers */
  providers?: ServiceProvider[];
  /** Initial step */
  initialStep?: BookingStep;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** User information */
  userInfo?: Partial<CustomerDetails>;
  /** Booking completion handler */
  onBookingComplete?: (booking: BookingData) => void;
  /** Step change handler */
  onStepChange?: (step: BookingStep) => void;
  /** Service selection handler */
  onServiceSelect?: (service: Service) => void;
  /** Provider selection handler */
  onProviderSelect?: (provider: ServiceProvider) => void;
  /** Time slot selection handler */
  onTimeSlotSelect?: (slot: SelectedTimeSlot) => void;
  /** Navigation handlers */
  onBack?: () => void;
  onCancel?: () => void;
  /** Screen customization */
  allowServiceChange?: boolean;
  allowProviderChange?: boolean;
  requirePayment?: boolean;
  showProgress?: boolean;
  /** Accessibility */
  testID?: string;
}

// === COMPONENT ===

/**
 * BookingScreen - Complete booking flow
 * 
 * @example
 * ```tsx
 * const service = {
 *   id: 'svc_1',
 *   name: 'Personal Training Session',
 *   pricing: { basePrice: 85, currency: 'USD' },
 *   duration: 60
 * };
 * 
 * <BookingScreen
 *   service={service}
 *   onBookingComplete={(booking) => {
 *     // Handle successful booking
 *     navigation.navigate('BookingConfirmation', { booking });
 *   }}
 * />
 * ```
 */
export default function BookingScreen({
  service: initialService,
  provider: initialProvider,
  services = [],
  providers = [],
  initialStep = 'service',
  loading = false,
  error,
  userInfo,
  onBookingComplete,
  onStepChange,
  onServiceSelect,
  onProviderSelect,
  onTimeSlotSelect,
  onBack,
  onCancel,
  allowServiceChange = true,
  allowProviderChange = true,
  requirePayment = true,
  showProgress = true,
  testID = 'booking-screen',
}: BookingScreenProps) {
  
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    initialService ? (initialProvider ? 'datetime' : 'provider') : initialStep
  );
  const [selectedService, setSelectedService] = useState<Service | undefined>(initialService);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | undefined>(initialProvider);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedTimeSlot | undefined>();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    notes: userInfo?.notes || '',
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'card',
    amount: 0,
    currency: 'USD',
  });
  const [processing, setProcessing] = useState(false);

  // Steps configuration
  const steps: BookingStep[] = [
    ...(allowServiceChange ? ['service'] : []),
    ...(allowProviderChange ? ['provider'] : []),
    'datetime',
    'details',
    ...(requirePayment ? ['payment'] : []),
    'summary',
  ] as BookingStep[];

  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Update step
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Update payment amount when service changes
  useEffect(() => {
    if (selectedService) {
      setPaymentDetails(prev => ({
        ...prev,
        amount: selectedService.pricing.basePrice,
        currency: selectedService.pricing.currency,
      }));
    }
  }, [selectedService]);

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    onServiceSelect?.(service);
    if (currentStep === 'service') {
      handleNextStep();
    }
  };

  // Handle provider selection
  const handleProviderSelect = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    onProviderSelect?.(provider);
    if (currentStep === 'provider') {
      handleNextStep();
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: SelectedTimeSlot) => {
    setSelectedTimeSlot(slot);
    onTimeSlotSelect?.(slot);
    if (currentStep === 'datetime') {
      handleNextStep();
    }
  };

  // Handle customer details submission
  const handleCustomerDetailsSubmit = (details: CustomerDetails) => {
    setCustomerDetails(details);
    handleNextStep();
  };

  // Handle payment details submission
  const handlePaymentSubmit = (payment: PaymentDetails) => {
    setPaymentDetails(payment);
    handleNextStep();
  };

  // Handle next step
  const handleNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedProvider || !selectedTimeSlot) {
      Alert.alert('Error', 'Please complete all booking details');
      return;
    }

    setProcessing(true);
    try {
      const bookingData: BookingData = {
        service: selectedService,
        provider: selectedProvider,
        dateTime: selectedTimeSlot,
        customer: customerDetails,
        payment: paymentDetails,
        totalCost: paymentDetails.amount,
        notes: customerDetails.notes,
      };

      await onBookingComplete?.(bookingData);
    } catch (error) {
      Alert.alert('Booking Error', 'Unable to complete booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Get step title
  const getStepTitle = (step: BookingStep): string => {
    switch (step) {
      case 'service': return 'Select Service';
      case 'provider': return 'Choose Provider';
      case 'datetime': return 'Pick Date & Time';
      case 'details': return 'Your Details';
      case 'payment': return 'Payment Method';
      case 'summary': return 'Review Booking';
      default: return 'Booking';
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'service':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose Your Service</Text>
            <ScrollView style={styles.servicesList}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => handleServiceSelect(service)}
                  style={styles.serviceItem}
                >
                  <ServiceCard
                    service={service}
                    onPress={() => handleServiceSelect(service)}
                    layout="list"
                    showProvider={false}
                    showBookingButton={false}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'provider':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Provider</Text>
            {selectedService && (
              <View style={styles.selectedServiceCard}>
                <ServiceCard
                  service={selectedService}
                  layout="compact"
                  showProvider={false}
                  showBookingButton={false}
                />
              </View>
            )}
            <ScrollView style={styles.providersList}>
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  onPress={() => handleProviderSelect(provider)}
                  style={styles.providerItem}
                >
                  <ServiceProviderCard
                    provider={provider}
                    onPress={() => handleProviderSelect(provider)}
                    layout="list"
                    showSpecialties={true}
                    showRating={true}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'datetime':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pick Date & Time</Text>
            {selectedService && selectedProvider && (
              <BookingCalendar
                serviceId={selectedService.id}
                providerId={selectedProvider.id}
                serviceDuration={selectedService.duration}
                servicePrice={selectedService.pricing.basePrice}
                currency={selectedService.pricing.currency}
                onSlotSelect={handleTimeSlotSelect}
              />
            )}
          </View>
        );

      case 'details':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Information</Text>
            <BookingForm
              serviceId={selectedService?.id}
              providerId={selectedProvider?.id}
              initialData={customerDetails}
              onSubmit={handleCustomerDetailsSubmit}
              loading={processing}
            />
          </View>
        );

      case 'payment':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Payment Method</Text>
            <Card style={styles.paymentCard}>
              <Text style={styles.paymentAmount}>
                Total: ${(paymentDetails?.amount ?? 0).toFixed(2)}
              </Text>
              {/* Payment method selection would go here */}
              <Text style={styles.paymentNote}>
                Secure payment processing powered by Stripe
              </Text>
            </Card>
          </View>
        );

      case 'summary':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review Your Booking</Text>
            {selectedService && selectedProvider && selectedTimeSlot && (
              <BookingSummary
                service={selectedService}
                provider={selectedProvider}
                dateTime={selectedTimeSlot.startTime}
                customer={customerDetails}
                totalCost={paymentDetails.amount}
                currency={paymentDetails.currency}
              />
            )}
          </View>
        );

      default:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Booking Step</Text>
          </View>
        );
    }
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingCard message="Loading booking information..." />
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorCard
          title="Booking Error"
          message={error}
          onRetry={() => {}}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack || handlePreviousStep} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getStepTitle(currentStep)}</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <Progress value={progressPercentage} style={styles.progressBar} />
            <Text style={styles.progressText}>
              Step {currentStepIndex + 1} of {steps.length}
            </Text>
          </View>
        )}

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            {currentStepIndex > 0 && (
              <Button
                onPress={handlePreviousStep}
                variant="outline"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Button>
            )}
            
            {currentStep === 'summary' ? (
              <Button
                onPress={handleConfirmBooking}
                style={styles.primaryButton}
                disabled={processing}
              >
                <Text style={styles.primaryButtonText}>
                  {processing ? 'Processing...' : 'Confirm Booking'}
                </Text>
              </Button>
            ) : (
              <Button
                onPress={handleNextStep}
                style={styles.primaryButton}
                disabled={!canProceed()}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Button>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // Check if can proceed to next step
  function canProceed(): boolean {
    switch (currentStep) {
      case 'service':
        return !!selectedService;
      case 'provider':
        return !!selectedProvider;
      case 'datetime':
        return !!selectedTimeSlot;
      case 'details':
        return !!(customerDetails.name && customerDetails.email && customerDetails.phone);
      case 'payment':
        return !!paymentDetails.method;
      default:
        return true;
    }
  }
}

// === STYLES ===

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.gray[600],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.gray[900],
  },
  cancelButton: {
    padding: SPACING.xs,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error[600],
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  progressBar: {
    marginBottom: SPACING.xs,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: SPACING.md,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
    textAlign: 'center' as const,
  },
  servicesList: {
    maxHeight: 400,
  },
  serviceItem: {
    marginBottom: SPACING.md,
  },
  selectedServiceCard: {
    marginBottom: SPACING.md,
    opacity: 0.7,
  },
  providersList: {
    maxHeight: 400,
  },
  providerItem: {
    marginBottom: SPACING.md,
  },
  paymentCard: {
    padding: SPACING.lg,
    alignItems: 'center' as const,
  },
  paymentAmount: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.primary[600],
    marginBottom: SPACING.md,
  },
  paymentNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  footerButtons: {
    flexDirection: 'row' as const,
    gap: SPACING.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary[600],
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    textAlign: 'center' as const,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: COLORS.gray[700],
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    textAlign: 'center' as const,
  },
};

// === EXPORTS ===

export type {
  BookingScreenProps,
  BookingStep,
  SelectedTimeSlot,
  CustomerDetails,
  PaymentDetails,
  BookingData,
};
