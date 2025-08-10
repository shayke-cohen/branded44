/**
 * CheckoutScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive checkout screen template that handles the complete purchase flow
 * from cart review to payment processing and order confirmation.
 * 
 * Features:
 * - Multi-step checkout process with progress indicator
 * - Cart items review and editing
 * - Shipping address selection and validation
 * - Payment method selection and processing
 * - Order summary with taxes and fees
 * - Coupon/discount code application
 * - Shipping options selection
 * - Order confirmation and tracking
 * - Guest checkout option
 * - Save payment methods for future use
 * - Form validation and error handling
 * - Loading states and progress indicators
 * 
 * @example
 * ```tsx
 * <CheckoutScreen
 *   cartItems={cartItems}
 *   shippingAddress={shippingAddress}
 *   paymentMethods={paymentMethods}
 *   shippingOptions={shippingOptions}
 *   onPlaceOrder={(orderData) => handlePlaceOrder(orderData)}
 *   onUpdateAddress={(address) => handleUpdateAddress(address)}
 *   onSelectPayment={(payment) => handleSelectPayment(payment)}
 *   onApplyCoupon={(code) => handleApplyCoupon(code)}
 *   taxRate={0.08}
 *   loading={checkoutLoading}
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
  Alert 
} from 'react-native';
import { 
  CartItem,
  CartSummary 
} from '../../blocks/ecommerce';
import type { 
  CartItemData,
  CartSummaryData,
  ShippingOption,
  AppliedCoupon
} from '../../blocks/ecommerce';
import { 
  AddressForm, 
  PaymentForm,
  ContactForm
} from '../../blocks/forms';
import type { 
  AddressFormProps,
  PaymentFormProps,
  PaymentFormData
} from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { Separator } from '../../../../~/components/ui/separator';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { Check } from '../../../../~/lib/icons/Check';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Checkout step
 */
export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';

/**
 * Shipping address
 */
export interface ShippingAddress {
  /** Address ID */
  id?: string;
  /** Full name */
  fullName: string;
  /** Street address */
  street: string;
  /** City */
  city: string;
  /** State/Province */
  state: string;
  /** ZIP/Postal code */
  zipCode: string;
  /** Country */
  country: string;
  /** Phone number */
  phone?: string;
  /** Is default address */
  isDefault?: boolean;
}

/**
 * Payment method
 */
export interface PaymentMethod {
  /** Payment method ID */
  id: string;
  /** Payment type */
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  /** Display name */
  name: string;
  /** Payment details */
  details: string;
  /** Is default payment method */
  isDefault?: boolean;
  /** Payment icon */
  icon?: string;
  /** Is saved for future use */
  isSaved?: boolean;
}

/**
 * Order data
 */
export interface OrderData {
  /** Cart items */
  items: CartItemData[];
  /** Shipping address */
  shippingAddress: ShippingAddress;
  /** Billing address */
  billingAddress?: ShippingAddress;
  /** Payment method */
  paymentMethod: PaymentMethod;
  /** Payment data */
  paymentData?: PaymentFormData;
  /** Shipping option */
  shippingOption: ShippingOption;
  /** Applied coupons */
  coupons: AppliedCoupon[];
  /** Order summary */
  summary: CartSummaryData;
  /** Special instructions */
  instructions?: string;
}

/**
 * Checkout screen configuration
 */
export interface CheckoutScreenConfig {
  /** Show progress indicator */
  showProgress?: boolean;
  /** Enable guest checkout */
  enableGuestCheckout?: boolean;
  /** Show estimated delivery */
  showDeliveryEstimate?: boolean;
  /** Show order notes */
  showOrderNotes?: boolean;
  /** Require phone number */
  requirePhone?: boolean;
  /** Enable billing address */
  enableBillingAddress?: boolean;
  /** Available payment methods */
  availablePaymentMethods?: PaymentMethod['type'][];
  /** Default shipping option */
  defaultShippingOption?: string;
  /** Auto-advance steps */
  autoAdvance?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the CheckoutScreen template
 */
export interface CheckoutScreenProps extends BaseComponentProps {
  /** Cart items */
  cartItems: CartItemData[];
  /** Available shipping addresses */
  shippingAddresses?: ShippingAddress[];
  /** Selected shipping address */
  selectedShippingAddress?: ShippingAddress;
  /** Available payment methods */
  paymentMethods?: PaymentMethod[];
  /** Selected payment method */
  selectedPaymentMethod?: PaymentMethod;
  /** Available shipping options */
  shippingOptions?: ShippingOption[];
  /** Selected shipping option */
  selectedShippingOption?: ShippingOption;
  /** Applied coupons */
  appliedCoupons?: AppliedCoupon[];
  /** Current checkout step */
  currentStep?: CheckoutStep;
  /** Tax rate */
  taxRate?: number;
  /** Shipping fee */
  shippingFee?: number;
  /** Service fee */
  serviceFee?: number;
  /** Free shipping threshold */
  freeShippingThreshold?: number;
  /** Callback when order is placed */
  onPlaceOrder?: (orderData: OrderData) => Promise<void> | void;
  /** Callback when step changes */
  onStepChange?: (step: CheckoutStep) => void;
  /** Callback when shipping address is updated */
  onUpdateShippingAddress?: (address: ShippingAddress) => void;
  /** Callback when payment method is selected */
  onSelectPaymentMethod?: (method: PaymentMethod) => void;
  /** Callback when shipping option is selected */
  onSelectShippingOption?: (option: ShippingOption) => void;
  /** Callback when coupon is applied */
  onApplyCoupon?: (code: string) => Promise<AppliedCoupon | null> | AppliedCoupon | null;
  /** Callback when coupon is removed */
  onRemoveCoupon?: (coupon: AppliedCoupon) => void;
  /** Callback when cart item quantity changes */
  onUpdateCartItem?: (itemId: string, quantity: number) => void;
  /** Callback when cart item is removed */
  onRemoveCartItem?: (itemId: string) => void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Processing order state */
  processingOrder?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the checkout screen */
  config?: CheckoutScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CheckoutScreen - AI-optimized checkout screen template
 * 
 * A comprehensive checkout screen that handles the complete purchase flow
 * from cart review to order confirmation.
 */
const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cartItems,
  shippingAddresses = [],
  selectedShippingAddress,
  paymentMethods = [],
  selectedPaymentMethod,
  shippingOptions = [],
  selectedShippingOption,
  appliedCoupons = [],
  currentStep = 'cart',
  taxRate = 0.08,
  shippingFee = 0,
  serviceFee = 0,
  freeShippingThreshold = 50,
  onPlaceOrder,
  onStepChange,
  onUpdateShippingAddress,
  onSelectPaymentMethod,
  onSelectShippingOption,
  onApplyCoupon,
  onRemoveCoupon,
  onUpdateCartItem,
  onRemoveCartItem,
  onBack,
  loading = false,
  processingOrder = false,
  error,
  config = {},
  style,
  testID = 'checkout-screen',
  ...props
}) => {
  const [localStep, setLocalStep] = useState<CheckoutStep>(currentStep);
  const [localShippingAddress, setLocalShippingAddress] = useState<ShippingAddress | undefined>(selectedShippingAddress);
  const [localPaymentMethod, setLocalPaymentMethod] = useState<PaymentMethod | undefined>(selectedPaymentMethod);
  const [localShippingOption, setLocalShippingOption] = useState<ShippingOption | undefined>(selectedShippingOption);
  const [paymentData, setPaymentData] = useState<PaymentFormData | undefined>();
  const [couponCode, setCouponCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true);

  const {
    showProgress = true,
    enableGuestCheckout = true,
    showDeliveryEstimate = true,
    showOrderNotes = true,
    requirePhone = false,
    enableBillingAddress = true,
    availablePaymentMethods = ['card', 'paypal', 'apple_pay'],
    defaultShippingOption,
    autoAdvance = false,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const shippingCost = useMemo(() => {
    if (subtotal >= freeShippingThreshold) return 0;
    return localShippingOption?.cost || shippingFee;
  }, [subtotal, freeShippingThreshold, localShippingOption, shippingFee]);

  const tax = useMemo(() => {
    return subtotal * taxRate;
  }, [subtotal, taxRate]);

  const total = useMemo(() => {
    const discountAmount = appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);
    return subtotal + shippingCost + tax + serviceFee - discountAmount;
  }, [subtotal, shippingCost, tax, serviceFee, appliedCoupons]);

  const orderSummary: CartSummaryData = useMemo(() => ({
    subtotal,
    shipping: shippingCost,
    tax,
    serviceFee,
    total,
    coupons: appliedCoupons,
    currency: 'USD'
  }), [subtotal, shippingCost, tax, serviceFee, total, appliedCoupons]);

  const canProceed = useMemo(() => {
    switch (localStep) {
      case 'cart':
        return cartItems.length > 0;
      case 'shipping':
        return localShippingAddress !== undefined;
      case 'payment':
        return localPaymentMethod !== undefined;
      case 'review':
        return localShippingAddress && localPaymentMethod && localShippingOption;
      default:
        return false;
    }
  }, [localStep, cartItems.length, localShippingAddress, localPaymentMethod, localShippingOption]);

  const steps: CheckoutStep[] = ['cart', 'shipping', 'payment', 'review', 'confirmation'];
  const currentStepIndex = steps.indexOf(localStep);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleStepChange = useCallback((step: CheckoutStep) => {
    setLocalStep(step);
    onStepChange?.(step);
  }, [onStepChange]);

  const handleNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      handleStepChange(steps[nextIndex]);
    }
  }, [currentStepIndex, steps, handleStepChange]);

  const handlePreviousStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      handleStepChange(steps[prevIndex]);
    } else {
      onBack?.();
    }
  }, [currentStepIndex, steps, handleStepChange, onBack]);

  const handleShippingAddressChange = useCallback((address: ShippingAddress) => {
    setLocalShippingAddress(address);
    onUpdateShippingAddress?.(address);
    
    if (autoAdvance) {
      handleNextStep();
    }
  }, [onUpdateShippingAddress, autoAdvance, handleNextStep]);

  const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
    setLocalPaymentMethod(method);
    onSelectPaymentMethod?.(method);
    
    if (autoAdvance) {
      handleNextStep();
    }
  }, [onSelectPaymentMethod, autoAdvance, handleNextStep]);

  const handleShippingOptionSelect = useCallback((option: ShippingOption) => {
    setLocalShippingOption(option);
    onSelectShippingOption?.(option);
  }, [onSelectShippingOption]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim() || !onApplyCoupon) return;
    
    try {
      const coupon = await onApplyCoupon(couponCode.trim());
      if (coupon) {
        setCouponCode('');
        Alert.alert('Success', 'Coupon applied successfully!');
      } else {
        Alert.alert('Error', 'Invalid coupon code');
      }
    } catch (err) {
      console.error('Apply coupon failed:', err);
      Alert.alert('Error', 'Failed to apply coupon');
    }
  }, [couponCode, onApplyCoupon]);

  const handlePlaceOrder = useCallback(async () => {
    if (!canProceed || !onPlaceOrder || !localShippingAddress || !localPaymentMethod || !localShippingOption) {
      return;
    }

    const orderData: OrderData = {
      items: cartItems,
      shippingAddress: localShippingAddress,
      billingAddress: billingAddressSameAsShipping ? localShippingAddress : localShippingAddress, // Could be different
      paymentMethod: localPaymentMethod,
      paymentData,
      shippingOption: localShippingOption,
      coupons: appliedCoupons,
      summary: orderSummary,
      instructions: orderNotes
    };

    try {
      await onPlaceOrder(orderData);
      handleStepChange('confirmation');
    } catch (err) {
      console.error('Place order failed:', err);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  }, [
    canProceed, onPlaceOrder, localShippingAddress, localPaymentMethod, localShippingOption,
    cartItems, billingAddressSameAsShipping, paymentData, appliedCoupons, orderSummary, orderNotes,
    handleStepChange
  ]);

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
          onPress={handlePreviousStep}
          style={styles.backButton}
          testID={`${testID}-back`}
        >
          <ChevronLeft style={styles.backIcon} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {localStep === 'confirmation' ? 'Order Confirmed' : 'Checkout'}
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>
    );
  };

  const renderProgress = () => {
    if (!showProgress || localStep === 'confirmation') return null;

    return (
      <View style={styles.progressContainer} testID={`${testID}-progress`}>
        {steps.slice(0, -1).map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View style={[
              styles.progressCircle,
              index <= currentStepIndex && styles.progressCircleActive,
              index < currentStepIndex && styles.progressCircleCompleted
            ]}>
              {index < currentStepIndex ? (
                <Check style={styles.progressCheck} />
              ) : (
                <Text style={[
                  styles.progressNumber,
                  index <= currentStepIndex && styles.progressNumberActive
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.progressLabel,
              index <= currentStepIndex && styles.progressLabelActive
            ]}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </Text>
            {index < steps.length - 2 && (
              <View style={[
                styles.progressLine,
                index < currentStepIndex && styles.progressLineActive
              ]} />
            )}
          </View>
        ))}
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

  const renderCartStep = () => {
    if (localStep !== 'cart') return null;

    return (
      <View style={styles.stepContainer} testID={`${testID}-cart-step`}>
        <Text style={styles.stepTitle}>Review Your Order</Text>
        
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={(quantity) => onUpdateCartItem?.(item.id, quantity)}
            onRemove={() => onRemoveCartItem?.(item.id)}
            allowQuantityChange={true}
            style={styles.cartItem}
            testID={`${testID}-cart-item-${item.id}`}
          />
        ))}

        <CartSummary
          data={orderSummary}
          style={styles.cartSummary}
          testID={`${testID}-cart-summary`}
        />
      </View>
    );
  };

  const renderShippingStep = () => {
    if (localStep !== 'shipping') return null;

    return (
      <View style={styles.stepContainer} testID={`${testID}-shipping-step`}>
        <Text style={styles.stepTitle}>Shipping Address</Text>
        
        {shippingAddresses.length > 0 && (
          <View style={styles.savedAddresses}>
            <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>
            {shippingAddresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                onPress={() => handleShippingAddressChange(address)}
                style={[
                  styles.savedAddress,
                  localShippingAddress?.id === address.id && styles.savedAddressSelected
                ]}
                testID={`${testID}-saved-address-${address.id}`}
              >
                <Text style={styles.savedAddressName}>{address.fullName}</Text>
                <Text style={styles.savedAddressDetails}>
                  {address.street}, {address.city}, {address.state} {address.zipCode}
                </Text>
                {address.isDefault && (
                  <Badge variant="secondary" style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </Badge>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <AddressForm
          onSubmit={handleShippingAddressChange}
          initialData={localShippingAddress}
          style={styles.addressForm}
          testID={`${testID}-address-form`}
        />

        {/* Shipping Options */}
        {shippingOptions.length > 0 && (
          <Card style={styles.shippingOptionsCard}>
            <Text style={styles.sectionTitle}>Shipping Options</Text>
            {shippingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleShippingOptionSelect(option)}
                style={[
                  styles.shippingOption,
                  localShippingOption?.id === option.id && styles.shippingOptionSelected
                ]}
                testID={`${testID}-shipping-option-${option.id}`}
              >
                <View style={styles.shippingOptionInfo}>
                  <Text style={styles.shippingOptionName}>{option.name}</Text>
                  <Text style={styles.shippingOptionDescription}>{option.description}</Text>
                  {showDeliveryEstimate && option.estimatedDays && (
                    <Text style={styles.shippingOptionEstimate}>
                      Estimated delivery: {option.estimatedDays} days
                    </Text>
                  )}
                </View>
                <Text style={styles.shippingOptionPrice}>
                  {option.cost === 0 ? 'Free' : formatCurrency(option.cost, 'USD')}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}
      </View>
    );
  };

  const renderPaymentStep = () => {
    if (localStep !== 'payment') return null;

    return (
      <View style={styles.stepContainer} testID={`${testID}-payment-step`}>
        <Text style={styles.stepTitle}>Payment Method</Text>
        
        {paymentMethods.length > 0 && (
          <View style={styles.savedPaymentMethods}>
            <Text style={styles.savedPaymentMethodsTitle}>Saved Payment Methods</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => handlePaymentMethodSelect(method)}
                style={[
                  styles.savedPaymentMethod,
                  localPaymentMethod?.id === method.id && styles.savedPaymentMethodSelected
                ]}
                testID={`${testID}-payment-method-${method.id}`}
              >
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodDetails}>{method.details}</Text>
                </View>
                {method.isDefault && (
                  <Badge variant="secondary" style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </Badge>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <PaymentForm
          onSubmit={(data) => {
            setPaymentData(data);
            if (autoAdvance) {
              handleNextStep();
            }
          }}
          availableMethods={availablePaymentMethods}
          style={styles.paymentForm}
          testID={`${testID}-payment-form`}
        />

        {/* Coupon Code */}
        <Card style={styles.couponCard}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.couponInput}>
            <Input
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter promo code"
              style={styles.couponField}
              testID={`${testID}-coupon-input`}
            />
            <Button
              onPress={handleApplyCoupon}
              disabled={!couponCode.trim()}
              style={styles.couponButton}
              testID={`${testID}-apply-coupon`}
            >
              <Text style={styles.couponButtonText}>Apply</Text>
            </Button>
          </View>
          
          {appliedCoupons.length > 0 && (
            <View style={styles.appliedCoupons}>
              {appliedCoupons.map((coupon, index) => (
                <View key={index} style={styles.appliedCoupon}>
                  <Text style={styles.appliedCouponCode}>{coupon.code}</Text>
                  <Text style={styles.appliedCouponDiscount}>
                    -{formatCurrency(coupon.discountAmount, 'USD')}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => onRemoveCoupon?.(coupon)}
                    style={styles.removeCouponButton}
                  >
                    <Text style={styles.removeCouponText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
    );
  };

  const renderReviewStep = () => {
    if (localStep !== 'review') return null;

    return (
      <View style={styles.stepContainer} testID={`${testID}-review-step`}>
        <Text style={styles.stepTitle}>Review Order</Text>
        
        {/* Order Items Summary */}
        <Card style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Items ({cartItems.length})</Text>
          {cartItems.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.reviewItem}>
              <Text style={styles.reviewItemName}>{item.name}</Text>
              <Text style={styles.reviewItemDetails}>
                Qty: {item.quantity} × {formatCurrency(item.price, item.currency)}
              </Text>
            </View>
          ))}
          {cartItems.length > 3 && (
            <Text style={styles.reviewMoreItems}>
              +{cartItems.length - 3} more items
            </Text>
          )}
        </Card>

        {/* Shipping Address */}
        <Card style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Shipping Address</Text>
          <Text style={styles.reviewAddressName}>{localShippingAddress?.fullName}</Text>
          <Text style={styles.reviewAddressDetails}>
            {localShippingAddress?.street}
          </Text>
          <Text style={styles.reviewAddressDetails}>
            {localShippingAddress?.city}, {localShippingAddress?.state} {localShippingAddress?.zipCode}
          </Text>
        </Card>

        {/* Payment Method */}
        <Card style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Payment Method</Text>
          <Text style={styles.reviewPaymentMethod}>
            {localPaymentMethod?.icon} {localPaymentMethod?.name}
          </Text>
          <Text style={styles.reviewPaymentDetails}>
            {localPaymentMethod?.details}
          </Text>
        </Card>

        {/* Order Notes */}
        {showOrderNotes && (
          <Card style={styles.reviewCard}>
            <Text style={styles.reviewSectionTitle}>Order Notes</Text>
            <Input
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Special instructions for your order..."
              multiline
              numberOfLines={3}
              style={styles.orderNotesInput}
              testID={`${testID}-order-notes`}
            />
          </Card>
        )}

        {/* Final Summary */}
        <CartSummary
          data={orderSummary}
          style={styles.finalSummary}
          testID={`${testID}-final-summary`}
        />
      </View>
    );
  };

  const renderConfirmationStep = () => {
    if (localStep !== 'confirmation') return null;

    return (
      <View style={styles.confirmationContainer} testID={`${testID}-confirmation`}>
        <Text style={styles.confirmationTitle}>🎉 Order Confirmed!</Text>
        <Text style={styles.confirmationMessage}>
          Thank you for your order. You will receive a confirmation email shortly.
        </Text>
        
        <Card style={styles.confirmationCard}>
          <Text style={styles.confirmationOrderNumber}>Order #12345</Text>
          <Text style={styles.confirmationTotal}>
            Total: {formatCurrency(total, 'USD')}
          </Text>
          <Text style={styles.confirmationDelivery}>
            Estimated delivery: {localShippingOption?.estimatedDays} days
          </Text>
        </Card>

        <Button
          onPress={() => {/* Navigate to order tracking */}}
          style={styles.trackOrderButton}
          testID={`${testID}-track-order`}
        >
          <Text style={styles.trackOrderText}>Track Your Order</Text>
        </Button>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (localStep === 'confirmation') return null;

    return (
      <View style={styles.actionButtonsContainer} testID={`${testID}-actions`}>
        {localStep === 'review' ? (
          <Button
            onPress={handlePlaceOrder}
            disabled={!canProceed || processingOrder}
            size="lg"
            style={styles.placeOrderButton}
            testID={`${testID}-place-order`}
          >
            <Text style={styles.placeOrderText}>
              {processingOrder ? 'Processing...' : `Place Order - ${formatCurrency(total, 'USD')}`}
            </Text>
          </Button>
        ) : (
          <Button
            onPress={handleNextStep}
            disabled={!canProceed}
            size="lg"
            style={styles.continueButton}
            testID={`${testID}-continue`}
          >
            <Text style={styles.continueText}>Continue</Text>
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

      {/* Progress Indicator */}
      {renderProgress()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Step Content */}
        {renderCartStep()}
        {renderShippingStep()}
        {renderPaymentStep()}
        {renderReviewStep()}
        {renderConfirmationStep()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {renderActionButtons()}
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  backIcon: {
    width: 24,
    height: 24,
    color: COLORS.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.secondary,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressCircleActive: {
    backgroundColor: COLORS.primary,
  },
  progressCircleCompleted: {
    backgroundColor: COLORS.success,
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  progressNumberActive: {
    color: COLORS.primaryForeground,
  },
  progressCheck: {
    width: 16,
    height: 16,
    color: COLORS.primaryForeground,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: COLORS.border,
    zIndex: -1,
  },
  progressLineActive: {
    backgroundColor: COLORS.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for action buttons
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  stepContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  cartItem: {
    marginBottom: SPACING.md,
  },
  cartSummary: {
    marginTop: SPACING.lg,
  },
  savedAddresses: {
    marginBottom: SPACING.lg,
  },
  savedAddressesTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  savedAddress: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  savedAddressSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  savedAddressName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  savedAddressDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  defaultText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  addressForm: {
    marginBottom: SPACING.lg,
  },
  shippingOptionsCard: {
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  shippingOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  shippingOptionInfo: {
    flex: 1,
  },
  shippingOptionName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  shippingOptionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  shippingOptionEstimate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  shippingOptionPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  savedPaymentMethods: {
    marginBottom: SPACING.lg,
  },
  savedPaymentMethodsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  savedPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  savedPaymentMethodSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  paymentMethodDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  paymentForm: {
    marginBottom: SPACING.lg,
  },
  couponCard: {
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  couponInput: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  couponField: {
    flex: 1,
  },
  couponButton: {
    paddingHorizontal: SPACING.lg,
  },
  couponButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  appliedCoupons: {
    gap: SPACING.sm,
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  appliedCouponCode: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  appliedCouponDiscount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginRight: SPACING.md,
  },
  removeCouponButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.destructive,
  },
  removeCouponText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.destructiveForeground,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  reviewCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  reviewSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  reviewItem: {
    marginBottom: SPACING.sm,
  },
  reviewItemName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reviewItemDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  reviewMoreItems: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  reviewAddressName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reviewAddressDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  reviewPaymentMethod: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reviewPaymentDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  orderNotesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  finalSummary: {
    marginTop: SPACING.lg,
  },
  confirmationContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  confirmationMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  confirmationCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  confirmationOrderNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  confirmationTotal: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  confirmationDelivery: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  trackOrderButton: {
    paddingHorizontal: SPACING.xl,
  },
  trackOrderText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    width: '100%',
  },
  continueText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  placeOrderButton: {
    width: '100%',
  },
  placeOrderText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
});

export default CheckoutScreen;
export type { 
  CheckoutScreenProps, 
  CheckoutScreenConfig, 
  CheckoutStep, 
  ShippingAddress, 
  PaymentMethod, 
  OrderData 
};
