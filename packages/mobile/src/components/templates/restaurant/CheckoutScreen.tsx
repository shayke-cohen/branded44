/**
 * CheckoutScreen Template - AI-Optimized React Native Component
 * 
 * A comprehensive checkout screen template that handles payment processing,
 * order finalization, and confirmation for restaurant orders.
 * 
 * @category Restaurant Templates
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  TouchableOpacity 
} from 'react-native';
import { 
  OrderSummary,
  type OrderSummaryData 
} from '../../blocks/restaurant';
import { 
  AddressForm, 
  PaymentForm, 
  type AddressFormData,
  type PaymentFormData 
} from '../../blocks/forms';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Checkout screen configuration
 */
export interface CheckoutScreenConfig {
  /** Screen title */
  title?: string;
  /** Show delivery address form */
  showDeliveryAddress?: boolean;
  /** Show payment form */
  showPaymentForm?: boolean;
  /** Show order summary */
  showOrderSummary?: boolean;
  /** Show special instructions */
  showSpecialInstructions?: boolean;
  /** Show order confirmation */
  showOrderConfirmation?: boolean;
  /** Require phone verification */
  requirePhoneVerification?: boolean;
  /** Enable order scheduling */
  enableOrderScheduling?: boolean;
  /** Show estimated delivery time */
  showEstimatedTime?: boolean;
  /** Show loyalty points */
  showLoyaltyPoints?: boolean;
}

/**
 * Delivery time slot
 */
export interface DeliveryTimeSlot {
  id: string;
  label: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
  fee?: number;
}

/**
 * Payment method option
 */
export interface PaymentMethodOption {
  id: string;
  type: 'credit-card' | 'debit-card' | 'digital-wallet' | 'cash' | 'gift-card';
  name: string;
  description: string;
  icon?: string;
  available: boolean;
  processingFee?: number;
}

/**
 * Checkout step
 */
export type CheckoutStep = 'delivery' | 'payment' | 'review' | 'confirmation';

/**
 * Checkout screen state
 */
export interface CheckoutScreenState {
  /** Current checkout step */
  currentStep: CheckoutStep;
  /** Delivery address */
  deliveryAddress?: AddressFormData;
  /** Payment information */
  paymentInfo?: PaymentFormData;
  /** Special instructions */
  specialInstructions: string;
  /** Selected delivery time slot */
  selectedTimeSlot?: string;
  /** Selected payment method */
  selectedPaymentMethod?: string;
  /** Order confirmation data */
  confirmationData?: {
    orderId: string;
    estimatedTime: number;
    trackingUrl?: string;
  };
  /** Loading states */
  loading: {
    payment: boolean;
    confirmation: boolean;
    timeSlots: boolean;
  };
  /** Form validation errors */
  errors: {
    delivery?: string;
    payment?: string;
    general?: string;
  };
}

/**
 * Properties for the CheckoutScreen template
 */
export interface CheckoutScreenProps extends BaseComponentProps {
  /** Order summary data */
  orderSummary: OrderSummaryData;
  /** Available delivery time slots */
  deliveryTimeSlots?: DeliveryTimeSlot[];
  /** Available payment methods */
  paymentMethods?: PaymentMethodOption[];
  /** Default delivery address */
  defaultDeliveryAddress?: AddressFormData;
  /** Default payment method */
  defaultPaymentMethod?: PaymentFormData;
  /** Restaurant information */
  restaurantInfo?: {
    name: string;
    phone?: string;
    estimatedTime?: number;
  };
  /** Callback when delivery address is updated */
  onDeliveryAddressUpdate?: (address: AddressFormData) => void;
  /** Callback when payment method is updated */
  onPaymentMethodUpdate?: (payment: PaymentFormData) => void;
  /** Callback when time slot is selected */
  onTimeSlotSelect?: (slotId: string) => void;
  /** Callback when special instructions are updated */
  onSpecialInstructionsUpdate?: (instructions: string) => void;
  /** Callback when promo code is applied */
  onApplyPromoCode?: () => void;
  /** Callback when tip is edited */
  onEditTip?: () => void;
  /** Callback to place order */
  onPlaceOrder?: (orderData: {
    deliveryAddress?: AddressFormData;
    paymentInfo?: PaymentFormData;
    specialInstructions?: string;
    timeSlot?: string;
  }) => Promise<{ orderId: string; estimatedTime: number; trackingUrl?: string }>;
  /** Callback to go back to previous step */
  onBackStep?: () => void;
  /** Callback to return to cart */
  onBackToCart?: () => void;
  /** Callback when order is confirmed */
  onOrderConfirmed?: (orderId: string) => void;
  /** Configuration for the screen */
  config?: CheckoutScreenConfig;
  /** Loading state */
  loading?: boolean;
}

/**
 * Default configuration
 */
const defaultConfig: CheckoutScreenConfig = {
  title: 'Checkout',
  showDeliveryAddress: true,
  showPaymentForm: true,
  showOrderSummary: true,
  showSpecialInstructions: true,
  showOrderConfirmation: true,
  requirePhoneVerification: false,
  enableOrderScheduling: true,
  showEstimatedTime: true,
  showLoyaltyPoints: true,
};

/**
 * CheckoutScreen - Complete order checkout interface
 * 
 * @example
 * ```tsx
 * <CheckoutScreen
 *   orderSummary={orderSummaryData}
 *   deliveryTimeSlots={availableTimeSlots}
 *   paymentMethods={paymentOptions}
 *   defaultDeliveryAddress={userAddress}
 *   restaurantInfo={restaurant}
 *   onDeliveryAddressUpdate={handleAddressUpdate}
 *   onPaymentMethodUpdate={handlePaymentUpdate}
 *   onPlaceOrder={handlePlaceOrder}
 *   onBackToCart={handleBackToCart}
 *   config={{
 *     showDeliveryAddress: true,
 *     showPaymentForm: true,
 *     enableOrderScheduling: true
 *   }}
 * />
 * ```
 */
export default function CheckoutScreen({
  orderSummary,
  deliveryTimeSlots = [],
  paymentMethods = [],
  defaultDeliveryAddress,
  defaultPaymentMethod,
  restaurantInfo,
  onDeliveryAddressUpdate,
  onPaymentMethodUpdate,
  onTimeSlotSelect,
  onSpecialInstructionsUpdate,
  onApplyPromoCode,
  onEditTip,
  onPlaceOrder,
  onBackStep,
  onBackToCart,
  onOrderConfirmed,
  config = defaultConfig,
  loading = false,
  testID = 'checkout-screen',
}: CheckoutScreenProps) {

  // Merge with default config
  const screenConfig = { ...defaultConfig, ...config };

  // Internal state
  const [state, setState] = useState<CheckoutScreenState>({
    currentStep: 'delivery',
    deliveryAddress: defaultDeliveryAddress,
    paymentInfo: defaultPaymentMethod,
    specialInstructions: '',
    selectedTimeSlot: deliveryTimeSlots[0]?.id,
    selectedPaymentMethod: paymentMethods[0]?.id,
    loading: {
      payment: false,
      confirmation: false,
      timeSlots: false,
    },
    errors: {},
  });

  // Handle step navigation
  const goToStep = useCallback((step: CheckoutStep) => {
    setState(prev => ({ ...prev, currentStep: step, errors: {} }));
  }, []);

  // Handle delivery address update
  const handleDeliveryAddressUpdate = useCallback((address: AddressFormData) => {
    setState(prev => ({ ...prev, deliveryAddress: address }));
    onDeliveryAddressUpdate?.(address);
  }, [onDeliveryAddressUpdate]);

  // Handle payment method update
  const handlePaymentMethodUpdate = useCallback((payment: PaymentFormData) => {
    setState(prev => ({ ...prev, paymentInfo: payment }));
    onPaymentMethodUpdate?.(payment);
  }, [onPaymentMethodUpdate]);

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback((slotId: string) => {
    setState(prev => ({ ...prev, selectedTimeSlot: slotId }));
    onTimeSlotSelect?.(slotId);
  }, [onTimeSlotSelect]);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    let isValid = true;
    const errors: any = {};

    switch (state.currentStep) {
      case 'delivery':
        if (screenConfig.showDeliveryAddress && !state.deliveryAddress) {
          errors.delivery = 'Please provide a delivery address';
          isValid = false;
        }
        break;
      case 'payment':
        if (screenConfig.showPaymentForm && !state.paymentInfo) {
          errors.payment = 'Please select a payment method';
          isValid = false;
        }
        break;
    }

    setState(prev => ({ ...prev, errors }));
    return isValid;
  }, [state.currentStep, state.deliveryAddress, state.paymentInfo, screenConfig]);

  // Handle next step
  const handleNextStep = useCallback(() => {
    if (!validateCurrentStep()) return;

    const steps: CheckoutStep[] = ['delivery', 'payment', 'review'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1]);
    }
  }, [state.currentStep, validateCurrentStep, goToStep]);

  // Handle previous step
  const handlePrevStep = useCallback(() => {
    const steps: CheckoutStep[] = ['delivery', 'payment', 'review'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1]);
    } else {
      onBackStep?.();
    }
  }, [state.currentStep, goToStep, onBackStep]);

  // Handle place order
  const handlePlaceOrder = useCallback(async () => {
    if (!validateCurrentStep()) return;

    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, payment: true } }));
      
      const orderData = {
        deliveryAddress: state.deliveryAddress,
        paymentInfo: state.paymentInfo,
        specialInstructions: state.specialInstructions,
        timeSlot: state.selectedTimeSlot,
      };

      const result = await onPlaceOrder?.(orderData);
      
      if (result) {
        setState(prev => ({ 
          ...prev, 
          confirmationData: result,
          currentStep: 'confirmation',
          loading: { ...prev.loading, payment: false, confirmation: true }
        }));
        
        // Simulate processing time
        setTimeout(() => {
          setState(prev => ({ ...prev, loading: { ...prev.loading, confirmation: false } }));
          onOrderConfirmed?.(result.orderId);
        }, 2000);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, payment: false },
        errors: { ...prev.errors, general: 'Failed to place order. Please try again.' }
      }));
      Alert.alert('Order Failed', 'Unable to process your order. Please try again.');
    }
  }, [validateCurrentStep, state, onPlaceOrder, onOrderConfirmed]);

  // Get step title
  const getStepTitle = useCallback((step: CheckoutStep): string => {
    switch (step) {
      case 'delivery': return 'Delivery Details';
      case 'payment': return 'Payment';
      case 'review': return 'Review Order';
      case 'confirmation': return 'Order Confirmed';
      default: return '';
    }
  }, []);

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: CheckoutStep[] = ['delivery', 'payment', 'review'];
    const currentIndex = steps.indexOf(state.currentStep);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index <= currentIndex && styles.stepCircleActive,
              index < currentIndex && styles.stepCircleCompleted
            ]}>
              <Text style={[
                styles.stepNumber,
                index <= currentIndex && styles.stepNumberActive
              ]}>
                {index < currentIndex ? '✓' : index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepLabel,
              index <= currentIndex && styles.stepLabelActive
            ]}>
              {getStepTitle(step)}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                index < currentIndex && styles.stepConnectorCompleted
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render delivery step
  const renderDeliveryStep = () => (
    <View style={styles.stepContent}>
      {screenConfig.showDeliveryAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <AddressForm
            onSubmit={handleDeliveryAddressUpdate}
            initialData={state.deliveryAddress}
            showSaveAsDefault={true}
            loading={false}
          />
          {state.errors.delivery && (
            <Text style={styles.errorText}>{state.errors.delivery}</Text>
          )}
        </View>
      )}

      {screenConfig.enableOrderScheduling && deliveryTimeSlots.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          <View style={styles.timeSlots}>
            {deliveryTimeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  state.selectedTimeSlot === slot.id && styles.selectedTimeSlot,
                  !slot.available && styles.unavailableTimeSlot
                ]}
                onPress={() => handleTimeSlotSelect(slot.id)}
                disabled={!slot.available}
              >
                <Text style={[
                  styles.timeSlotLabel,
                  state.selectedTimeSlot === slot.id && styles.selectedTimeSlotLabel,
                  !slot.available && styles.unavailableText
                ]}>
                  {slot.label}
                </Text>
                {slot.fee && slot.fee > 0 && (
                  <Text style={styles.timeSlotFee}>+${slot.fee.toFixed(2)}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {screenConfig.showSpecialInstructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TouchableOpacity 
            style={styles.instructionsInput}
            onPress={() => {
              Alert.prompt(
                'Special Instructions',
                'Any special requests for your order?',
                (text) => {
                  setState(prev => ({ ...prev, specialInstructions: text || '' }));
                  onSpecialInstructionsUpdate?.(text || '');
                },
                'plain-text',
                state.specialInstructions
              );
            }}
          >
            <Text style={[
              styles.instructionsText,
              !state.specialInstructions && styles.placeholderText
            ]}>
              {state.specialInstructions || 'Tap to add special instructions...'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render payment step
  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      {screenConfig.showPaymentForm && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <PaymentForm
            onSubmit={handlePaymentMethodUpdate}
            initialData={state.paymentInfo}
            showSaveAsDefault={true}
            loading={state.loading.payment}
          />
          {state.errors.payment && (
            <Text style={styles.errorText}>{state.errors.payment}</Text>
          )}
        </View>
      )}
    </View>
  );

  // Render review step
  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <OrderSummary
          orderData={orderSummary}
          onApplyPromoCode={onApplyPromoCode}
          onEditTip={onEditTip}
          showDetailedBreakdown={true}
          showPaymentMethods={false}
          showDeliveryInfo={screenConfig.showEstimatedTime}
          readOnly={true}
        />
      </View>

      {state.deliveryAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>Address:</Text>
            <Text style={styles.reviewValue}>
              {state.deliveryAddress.street}, {state.deliveryAddress.city}
            </Text>
            {state.specialInstructions && (
              <>
                <Text style={styles.reviewLabel}>Instructions:</Text>
                <Text style={styles.reviewValue}>{state.specialInstructions}</Text>
              </>
            )}
          </View>
        </View>
      )}

      {state.errors.general && (
        <Text style={styles.errorText}>{state.errors.general}</Text>
      )}
    </View>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <View style={styles.confirmationContent}>
      {state.loading.confirmation ? (
        <View style={styles.loadingState}>
          <Text style={styles.loadingIcon}>⏳</Text>
          <Text style={styles.loadingTitle}>Processing Your Order</Text>
          <Text style={styles.loadingMessage}>Please wait while we confirm your order...</Text>
        </View>
      ) : (
        <View style={styles.successState}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successMessage}>
            Your order has been placed successfully.
          </Text>
          
          {state.confirmationData && (
            <View style={styles.confirmationDetails}>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Order ID:</Text>
                <Text style={styles.confirmationValue}>{state.confirmationData.orderId}</Text>
              </View>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Estimated Time:</Text>
                <Text style={styles.confirmationValue}>
                  {state.confirmationData.estimatedTime} minutes
                </Text>
              </View>
              {restaurantInfo?.phone && (
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Restaurant:</Text>
                  <Text style={styles.confirmationValue}>{restaurantInfo.phone}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={state.currentStep === 'confirmation' ? undefined : handlePrevStep}>
          <Text style={styles.backButton}>
            {state.currentStep === 'confirmation' ? '' : '← Back'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {state.currentStep === 'confirmation' ? 'Order Status' : screenConfig.title}
        </Text>
        <TouchableOpacity onPress={onBackToCart}>
          <Text style={styles.cartButton}>
            {state.currentStep === 'confirmation' ? 'Done' : 'Cart'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Step Indicator */}
      {state.currentStep !== 'confirmation' && renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {state.currentStep === 'delivery' && renderDeliveryStep()}
        {state.currentStep === 'payment' && renderPaymentStep()}
        {state.currentStep === 'review' && renderReviewStep()}
        {state.currentStep === 'confirmation' && renderConfirmationStep()}
      </ScrollView>

      {/* Action Buttons */}
      {state.currentStep !== 'confirmation' && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              state.currentStep === 'review' ? styles.placeOrderButton : styles.nextButton,
              state.loading.payment && styles.disabledButton
            ]}
            onPress={state.currentStep === 'review' ? handlePlaceOrder : handleNextStep}
            disabled={state.loading.payment}
          >
            <Text style={styles.actionButtonText}>
              {state.loading.payment ? 'Processing...' : 
               state.currentStep === 'review' ? `Place Order • $${orderSummary.total.toFixed(2)}` : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// === STYLES ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary[600],
    fontWeight: '600',
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cartButton: {
    fontSize: 16,
    color: COLORS.primary[600],
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.card,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary[500],
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.success[500],
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '75%',
    right: '-75%',
    height: 2,
    backgroundColor: COLORS.gray[200],
  },
  stepConnectorCompleted: {
    backgroundColor: COLORS.success[500],
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  unavailableTimeSlot: {
    opacity: 0.5,
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  selectedTimeSlotLabel: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  timeSlotFee: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  unavailableText: {
    opacity: 0.5,
  },
  instructionsInput: {
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    minHeight: 60,
  },
  instructionsText: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  placeholderText: {
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  reviewCard: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
    marginTop: 8,
  },
  reviewValue: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  confirmationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingState: {
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  loadingMessage: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successState: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.success[600],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING.xl,
  },
  confirmationDetails: {
    width: '100%',
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.success[200],
  },
  confirmationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  confirmationLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  confirmationValue: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  actionSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: COLORS.primary[600],
  },
  placeOrderButton: {
    backgroundColor: COLORS.success[600],
  },
  disabledButton: {
    backgroundColor: COLORS.gray[400],
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

// === EXPORTS ===

export type {
  CheckoutScreenProps,
  CheckoutScreenConfig,
  CheckoutScreenState,
  CheckoutStep,
  DeliveryTimeSlot,
  PaymentMethodOption,
};
