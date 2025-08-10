/**
 * PaymentForm - Credit Card Input with Validation Block Component
 * 
 * A comprehensive payment form with credit card validation, security features,
 * and payment method selection. Optimized for AI agents.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../~/components/ui/select';
import { Switch } from '../../../../~/components/ui/switch';
import { Text } from '../../../../~/components/ui/text';
import { Badge } from '../../../../~/components/ui/badge';
import { cn, validateField } from '../../../lib/utils';
import { PaymentMethod, FormErrors, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { CreditCard, Shield, Lock } from 'lucide-react-native';

/**
 * Props interface for PaymentForm component
 */
export interface PaymentFormProps {
  /**
   * Initial payment method data
   */
  initialPaymentMethod?: Partial<PaymentMethod>;
  
  /**
   * Callback when form is submitted successfully
   */
  onSubmit: (paymentData: PaymentFormData) => Promise<void>;
  
  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;
  
  /**
   * Current loading state of the form
   */
  loading?: LoadingState;
  
  /**
   * Custom styling for the container
   */
  style?: any;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Test identifier for automated testing
   */
  testID?: string;
  
  /**
   * Whether to show save payment method option
   */
  allowSave?: boolean;
  
  /**
   * Whether to show billing address fields
   */
  showBillingAddress?: boolean;
  
  /**
   * Available payment types
   */
  allowedPaymentTypes?: Array<'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay'>;
}

/**
 * Payment form data interface
 */
export interface PaymentFormData {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  isDefault: boolean;
  billingAddress?: {
    address1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * PaymentForm Component
 * 
 * Provides a comprehensive payment form with:
 * - Credit/debit card input with validation
 * - Expiry date and CVV validation
 * - Card brand detection
 * - Billing address integration
 * - Security features
 * 
 * @example
 * ```tsx
 * <PaymentForm
 *   onSubmit={handlePaymentSubmit}
 *   onCancel={handleCancel}
 *   loading="idle"
 *   allowSave={true}
 *   showBillingAddress={true}
 * />
 * ```
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialPaymentMethod,
  onSubmit,
  onCancel,
  loading = 'idle',
  style,
  className,
  testID = 'payment-form',
  allowSave = true,
  showBillingAddress = false,
  allowedPaymentTypes = ['credit_card', 'debit_card'],
}) => {
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    type: initialPaymentMethod?.type || 'credit_card',
    cardNumber: '',
    expiryMonth: initialPaymentMethod?.expiryMonth || new Date().getMonth() + 1,
    expiryYear: initialPaymentMethod?.expiryYear || new Date().getFullYear(),
    cvv: '',
    cardholderName: '',
    isDefault: initialPaymentMethod?.isDefault || false,
    billingAddress: showBillingAddress ? {
      address1: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    } : undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [cardBrand, setCardBrand] = useState<string>('');

  const isLoading = loading === 'loading';

  /**
   * Updates form field value and clears related errors
   */
  const updateField = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PaymentFormData],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Detects card brand from card number
   */
  const detectCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    if (/^(?:2131|1800|35)/.test(number)) return 'jcb';
    
    return '';
  };

  /**
   * Formats card number with spaces
   */
  const formatCardNumber = (value: string): string => {
    const number = value.replace(/\s/g, '');
    const brand = detectCardBrand(number);
    setCardBrand(brand);
    
    // Different formatting for different card types
    if (brand === 'amex') {
      return number.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      return number.replace(/(\d{4})/g, '$1 ').trim();
    }
  };

  /**
   * Validates credit card number using Luhn algorithm
   */
  const validateCardNumber = (cardNumber: string): boolean => {
    const number = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let alternate = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let n = parseInt(number.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  };

  /**
   * Validates the form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Card number validation
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // CVV validation
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else {
      const cvvLength = cardBrand === 'amex' ? 4 : 3;
      if (formData.cvv.length !== cvvLength) {
        newErrors.cvv = `CVV must be ${cvvLength} digits`;
      }
    }

    // Expiry validation
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (formData.expiryYear < currentYear || 
        (formData.expiryYear === currentYear && formData.expiryMonth < currentMonth)) {
      newErrors.expiry = 'Card has expired';
    }

    // Billing address validation (if required)
    if (showBillingAddress && formData.billingAddress) {
      const requiredBillingFields = ['address1', 'city', 'state', 'zipCode'];
      requiredBillingFields.forEach(field => {
        if (!formData.billingAddress![field as keyof typeof formData.billingAddress]?.trim()) {
          newErrors[`billingAddress.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment method. Please try again.');
    }
  };

  /**
   * Gets card brand display name and color
   */
  const getCardBrandInfo = (brand: string) => {
    const brands: Record<string, { name: string; color: string }> = {
      visa: { name: 'Visa', color: COLORS.primary[600] },
      mastercard: { name: 'Mastercard', color: COLORS.error[600] },
      amex: { name: 'American Express', color: COLORS.success[600] },
      discover: { name: 'Discover', color: COLORS.warning[600] },
      jcb: { name: 'JCB', color: COLORS.info[600] },
    };
    return brands[brand] || { name: '', color: COLORS.neutral[500] };
  };

  const brandInfo = getCardBrandInfo(cardBrand);

  return (
    <View
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('payment-form', className)}
      testID={testID}
    >
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <CreditCard size={24} color={COLORS.primary[600]} />
            <CardTitle>Payment Information</CardTitle>
            <Shield size={20} color={COLORS.success[600]} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Lock size={16} color={COLORS.neutral[500]} />
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
              Your payment information is secure and encrypted
            </Text>
          </View>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.formField }}>
          {/* Payment Type Selection */}
          {allowedPaymentTypes.length > 1 && (
            <View>
              <Label nativeID="paymentType">Payment Method</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateField('type', value)}
                disabled={isLoading}
              >
                <SelectTrigger aria-labelledby="paymentType">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {allowedPaymentTypes.includes('credit_card') && (
                    <SelectItem label="Credit Card" value="credit_card" />
                  )}
                  {allowedPaymentTypes.includes('debit_card') && (
                    <SelectItem label="Debit Card" value="debit_card" />
                  )}
                  {allowedPaymentTypes.includes('paypal') && (
                    <SelectItem label="PayPal" value="paypal" />
                  )}
                  {allowedPaymentTypes.includes('apple_pay') && (
                    <SelectItem label="Apple Pay" value="apple_pay" />
                  )}
                  {allowedPaymentTypes.includes('google_pay') && (
                    <SelectItem label="Google Pay" value="google_pay" />
                  )}
                </SelectContent>
              </Select>
            </View>
          )}

          {/* Card Number */}
          <View>
            <Label nativeID="cardNumber">Card Number *</Label>
            <View style={{ position: 'relative' }}>
              <Input
                aria-labelledby="cardNumber"
                value={formData.cardNumber}
                onChangeText={(value) => {
                  const formatted = formatCardNumber(value);
                  updateField('cardNumber', formatted);
                }}
                placeholder="1234 5678 9012 3456"
                editable={!isLoading}
                style={errors.cardNumber ? { borderColor: COLORS.error[500] } : {}}
                keyboardType="numeric"
                maxLength={cardBrand === 'amex' ? 17 : 19}
              />
              {cardBrand && (
                <View style={{ 
                  position: 'absolute', 
                  right: 12, 
                  top: '50%', 
                  transform: [{ translateY: -10 }] 
                }}>
                  <Badge variant="secondary" style={{ backgroundColor: brandInfo.color }}>
                    <Text style={{ color: COLORS.white, fontSize: TYPOGRAPHY.fontSize.xs }}>
                      {brandInfo.name}
                    </Text>
                  </Badge>
                </View>
              )}
            </View>
            {errors.cardNumber && (
              <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                {errors.cardNumber}
              </Text>
            )}
          </View>

          {/* Cardholder Name */}
          <View>
            <Label nativeID="cardholderName">Cardholder Name *</Label>
            <Input
              aria-labelledby="cardholderName"
              value={formData.cardholderName}
              onChangeText={(value) => updateField('cardholderName', value)}
              placeholder="Enter name as shown on card"
              editable={!isLoading}
              style={errors.cardholderName ? { borderColor: COLORS.error[500] } : {}}
              autoCapitalize="words"
            />
            {errors.cardholderName && (
              <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                {errors.cardholderName}
              </Text>
            )}
          </View>

          {/* Expiry and CVV */}
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            <View style={{ flex: 1 }}>
              <Label nativeID="expiryMonth">Expiry Month *</Label>
              <Select
                value={formData.expiryMonth.toString()}
                onValueChange={(value) => updateField('expiryMonth', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger aria-labelledby="expiryMonth">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem 
                      key={month} 
                      label={month.toString().padStart(2, '0')} 
                      value={month.toString()} 
                    />
                  ))}
                </SelectContent>
              </Select>
            </View>

            <View style={{ flex: 1 }}>
              <Label nativeID="expiryYear">Expiry Year *</Label>
              <Select
                value={formData.expiryYear.toString()}
                onValueChange={(value) => updateField('expiryYear', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger aria-labelledby="expiryYear">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <SelectItem key={year} label={year.toString()} value={year.toString()} />
                  ))}
                </SelectContent>
              </Select>
            </View>

            <View style={{ flex: 1 }}>
              <Label nativeID="cvv">CVV *</Label>
              <Input
                aria-labelledby="cvv"
                value={formData.cvv}
                onChangeText={(value) => updateField('cvv', value.replace(/\D/g, ''))}
                placeholder={cardBrand === 'amex' ? '1234' : '123'}
                editable={!isLoading}
                style={errors.cvv ? { borderColor: COLORS.error[500] } : {}}
                keyboardType="numeric"
                maxLength={cardBrand === 'amex' ? 4 : 3}
                secureTextEntry={true}
              />
              {errors.cvv && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.cvv}
                </Text>
              )}
            </View>
          </View>

          {errors.expiry && (
            <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm }}>
              {errors.expiry}
            </Text>
          )}

          {/* Billing Address */}
          {showBillingAddress && formData.billingAddress && (
            <View style={{ gap: SPACING.formField }}>
              <Text style={{ 
                fontSize: TYPOGRAPHY.fontSize.base, 
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                marginTop: SPACING.md
              }}>
                Billing Address
              </Text>

              <View>
                <Label nativeID="billingAddress1">Street Address *</Label>
                <Input
                  aria-labelledby="billingAddress1"
                  value={formData.billingAddress.address1}
                  onChangeText={(value) => updateField('billingAddress.address1', value)}
                  placeholder="Enter street address"
                  editable={!isLoading}
                  style={errors['billingAddress.address1'] ? { borderColor: COLORS.error[500] } : {}}
                />
                {errors['billingAddress.address1'] && (
                  <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                    {errors['billingAddress.address1']}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <View style={{ flex: 2 }}>
                  <Label nativeID="billingCity">City *</Label>
                  <Input
                    aria-labelledby="billingCity"
                    value={formData.billingAddress.city}
                    onChangeText={(value) => updateField('billingAddress.city', value)}
                    placeholder="Enter city"
                    editable={!isLoading}
                    style={errors['billingAddress.city'] ? { borderColor: COLORS.error[500] } : {}}
                  />
                  {errors['billingAddress.city'] && (
                    <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                      {errors['billingAddress.city']}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Label nativeID="billingState">State *</Label>
                  <Input
                    aria-labelledby="billingState"
                    value={formData.billingAddress.state}
                    onChangeText={(value) => updateField('billingAddress.state', value)}
                    placeholder="State"
                    editable={!isLoading}
                    style={errors['billingAddress.state'] ? { borderColor: COLORS.error[500] } : {}}
                  />
                  {errors['billingAddress.state'] && (
                    <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                      {errors['billingAddress.state']}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Label nativeID="billingZip">ZIP *</Label>
                  <Input
                    aria-labelledby="billingZip"
                    value={formData.billingAddress.zipCode}
                    onChangeText={(value) => updateField('billingAddress.zipCode', value)}
                    placeholder="ZIP"
                    editable={!isLoading}
                    style={errors['billingAddress.zipCode'] ? { borderColor: COLORS.error[500] } : {}}
                  />
                  {errors['billingAddress.zipCode'] && (
                    <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                      {errors['billingAddress.zipCode']}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Save Payment Method */}
          {allowSave && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  Save Payment Method
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  Securely save for future purchases
                </Text>
              </View>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(value) => updateField('isDefault', value)}
                disabled={isLoading}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
            {onCancel && (
              <Button
                variant="outline"
                onPress={onCancel}
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                <Text>Cancel</Text>
              </Button>
            )}
            
            <Button
              onPress={handleSubmit}
              style={{ flex: 1 }}
              disabled={isLoading}
            >
              <Text>{isLoading ? 'Processing...' : 'Save Payment Method'}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default PaymentForm;
