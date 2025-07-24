import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Alert } from '../../../utils/alert';
import {useTheme, useCart} from '../../../context';
import {Address, PaymentMethod} from '../../../types';
import {VALIDATION_MESSAGES} from '../../../constants';

interface CheckoutScreenProps {
  onOrderComplete?: () => void;
  onBack?: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  onOrderComplete,
  onBack,
}) => {
  const {theme} = useTheme();
  const {cart, clearCart} = useCart();
  
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'credit',
    last4: '',
    expiryDate: '',
  });

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    backText: {
      fontSize: 24,
      color: theme.colors.primary,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    scrollContent: {
      flex: 1,
      paddingBottom: 120,
    },
    section: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    inputContainer: {
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halfWidth: {
      width: '48%',
    },
    paymentMethodContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    paymentMethodButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    paymentMethodButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    paymentMethodText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    paymentMethodTextActive: {
      color: 'white',
    },
    orderSummary: {
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    checkoutContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    placeOrderButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    placeOrderButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    placeOrderText: {
      fontSize: 18,
      fontWeight: '600',
      color: 'white',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
  });

  const validateForm = () => {
    const requiredFields = [
      'firstName',
      'lastName',
      'street',
      'city',
      'state',
      'zipCode',
    ];
    
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof Address]?.trim()) {
        Alert.alert('Validation Error', `${field} is required`);
        return false;
      }
    }

    if (!cardNumber.trim() || cardNumber.length < 16) {
      Alert.alert('Validation Error', 'Please enter a valid card number');
      return false;
    }

    if (!paymentMethod.expiryDate?.trim()) {
      Alert.alert('Validation Error', 'Please enter the card expiry date');
      return false;
    }

    if (!cvv.trim() || cvv.length < 3) {
      Alert.alert('Validation Error', 'Please enter a valid CVV');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      Alert.alert('Order Placed!', VALIDATION_MESSAGES.CHECKOUT_SUCCESS, [
        {text: 'OK', onPress: onOrderComplete},
      ]);
    }, 2000);
  };

  const updateShippingAddress = (field: keyof Address, value: string) => {
    setShippingAddress(prev => ({...prev, [field]: value}));
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ');
    setCardNumber(formatted.trim());
    setPaymentMethod(prev => ({...prev, last4: cleaned.slice(-4)}));
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{2})(\d{2})/, '$1/$2');
    setPaymentMethod(prev => ({...prev, expiryDate: formatted}));
  };

  const subtotal = cart.total;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const isFormValid = 
    shippingAddress.firstName &&
    shippingAddress.lastName &&
    shippingAddress.street &&
    shippingAddress.city &&
    shippingAddress.state &&
    shippingAddress.zipCode &&
    cardNumber.length >= 16 &&
    paymentMethod.expiryDate &&
    cvv.length >= 3;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} testID="back-button">
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.firstName}
                onChangeText={text => updateShippingAddress('firstName', text)}
                placeholder="John"
                testID="first-name-input"
              />
            </View>
            
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.lastName}
                onChangeText={text => updateShippingAddress('lastName', text)}
                placeholder="Doe"
                testID="last-name-input"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.street}
              onChangeText={text => updateShippingAddress('street', text)}
              placeholder="123 Main Street"
              testID="street-input"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.city}
                onChangeText={text => updateShippingAddress('city', text)}
                placeholder="New York"
                testID="city-input"
              />
            </View>
            
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.state}
                onChangeText={text => updateShippingAddress('state', text)}
                placeholder="NY"
                testID="state-input"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.zipCode}
              onChangeText={text => updateShippingAddress('zipCode', text)}
              placeholder="10001"
              keyboardType="numeric"
              testID="zip-input"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.paymentMethodContainer}>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod.type === 'credit' && styles.paymentMethodButtonActive,
              ]}
              onPress={() => setPaymentMethod(prev => ({...prev, type: 'credit'}))}>
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod.type === 'credit' && styles.paymentMethodTextActive,
                ]}>
                💳 Credit Card
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod.type === 'debit' && styles.paymentMethodButtonActive,
              ]}
              onPress={() => setPaymentMethod(prev => ({...prev, type: 'debit'}))}>
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod.type === 'debit' && styles.paymentMethodTextActive,
                ]}>
                💳 Debit Card
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Number *</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={formatCardNumber}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
              testID="card-number-input"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Expiry Date *</Text>
              <TextInput
                style={styles.input}
                value={paymentMethod.expiryDate}
                onChangeText={formatExpiryDate}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
                testID="expiry-input"
              />
            </View>
            
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>CVV *</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                testID="cvv-input"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cart.itemCount} items)</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Shipping {subtotal > 100 && '(Free over $100)'}
              </Text>
              <Text style={styles.summaryValue}>
                ${shipping === 0 ? '0.00' : shipping.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!isFormValid || isProcessing) && styles.placeOrderButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={!isFormValid || isProcessing}
          testID="place-order-button">
          <Text style={styles.placeOrderText}>
            {isProcessing ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutScreen;