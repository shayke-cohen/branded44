/**
 * AddressForm - Address Input with Validation Block Component
 * 
 * A comprehensive address form with field validation, country/state selection,
 * and postal code verification. Optimized for AI agents.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../~/components/ui/select';
import { Switch } from '../../../../~/components/ui/switch';
import { Text } from '../../../../~/components/ui/text';
import { cn, validateField } from '../../../lib/utils';
import { Address, FormErrors, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { MapPin, Home, Building } from 'lucide-react-native';

/**
 * Props interface for AddressForm component
 */
export interface AddressFormProps {
  /**
   * Initial address data to populate the form
   */
  initialAddress?: Partial<Address>;
  
  /**
   * Callback when form is submitted successfully
   */
  onSubmit: (addressData: Omit<Address, 'id'>) => Promise<void>;
  
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
   * Whether to show address type selection
   */
  showAddressType?: boolean;
  
  /**
   * Whether to show company field
   */
  showCompanyField?: boolean;
  
  /**
   * Whether to allow setting as default address
   */
  allowSetDefault?: boolean;
  
  /**
   * Available countries list
   */
  countries?: Array<{ code: string; name: string; }>;
  
  /**
   * Callback for address validation/autocomplete
   */
  onAddressLookup?: (query: string) => Promise<Array<{
    formatted: string;
    address1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>>;
}

/**
 * Address form data interface
 */
interface AddressFormData {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
}

/**
 * AddressForm Component
 * 
 * Provides a comprehensive address input form with:
 * - Personal information fields
 * - Complete address fields with validation
 * - Country and state selection
 * - Address type selection
 * - Default address option
 * 
 * @example
 * ```tsx
 * <AddressForm
 *   onSubmit={handleAddressSubmit}
 *   onCancel={handleCancel}
 *   loading="idle"
 *   showAddressType={true}
 *   showCompanyField={true}
 *   allowSetDefault={true}
 * />
 * ```
 */
export const AddressForm: React.FC<AddressFormProps> = ({
  initialAddress,
  onSubmit,
  onCancel,
  loading = 'idle',
  style,
  className,
  testID = 'address-form',
  showAddressType = true,
  showCompanyField = false,
  allowSetDefault = true,
  countries = [],
  onAddressLookup,
}) => {
  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    firstName: initialAddress?.firstName || '',
    lastName: initialAddress?.lastName || '',
    company: initialAddress?.company || '',
    address1: initialAddress?.address1 || '',
    address2: initialAddress?.address2 || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zipCode: initialAddress?.zipCode || '',
    country: initialAddress?.country || 'US',
    phone: initialAddress?.phone || '',
    isDefault: initialAddress?.isDefault || false,
    type: initialAddress?.type || 'shipping',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [lookupSuggestions, setLookupSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isLoading = loading === 'loading';

  // Default countries list
  const defaultCountries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
  ];

  const countryOptions = countries.length > 0 ? countries : defaultCountries;

  /**
   * US States for state selection
   */
  const usStates = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  ];

  /**
   * Updates form field value and clears related errors
   */
  const updateField = (field: keyof AddressFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handles address lookup for autocomplete
   */
  const handleAddressLookup = async (query: string) => {
    if (!onAddressLookup || query.length < 3) {
      setShowSuggestions(false);
      return;
    }

    try {
      const suggestions = await onAddressLookup(query);
      setLookupSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Address lookup failed:', error);
    }
  };

  /**
   * Applies selected address suggestion
   */
  const applySuggestion = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      address1: suggestion.address1,
      city: suggestion.city,
      state: suggestion.state,
      zipCode: suggestion.zipCode,
      country: suggestion.country,
    }));
    setShowSuggestions(false);
  };

  /**
   * Validates the form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    const requiredFields = [
      { field: 'firstName', message: 'First name is required' },
      { field: 'lastName', message: 'Last name is required' },
      { field: 'address1', message: 'Street address is required' },
      { field: 'city', message: 'City is required' },
      { field: 'state', message: 'State/Province is required' },
      { field: 'zipCode', message: 'ZIP/Postal code is required' },
      { field: 'country', message: 'Country is required' },
    ];

    requiredFields.forEach(({ field, message }) => {
      if (!formData[field as keyof AddressFormData]?.toString().trim()) {
        newErrors[field] = message;
      }
    });

    // Phone validation (if provided)
    if (formData.phone) {
      const phoneError = validateField(formData.phone, [
        { type: 'phone', message: 'Please enter a valid phone number' }
      ]);
      if (phoneError) newErrors.phone = phoneError;
    }

    // ZIP code validation based on country
    if (formData.zipCode && formData.country === 'US') {
      const zipError = validateField(formData.zipCode, [
        { type: 'pattern', value: '^\\d{5}(-\\d{4})?$', message: 'Please enter a valid US ZIP code' }
      ]);
      if (zipError) newErrors.zipCode = zipError;
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
      const addressData: Omit<Address, 'id'> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company || undefined,
        address1: formData.address1,
        address2: formData.address2 || undefined,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone || undefined,
        isDefault: formData.isDefault,
        type: formData.type,
      };

      await onSubmit(addressData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  /**
   * Gets address type icon
   */
  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'shipping':
        return <Home size={20} color={COLORS.primary[600]} />;
      case 'billing':
        return <Building size={20} color={COLORS.secondary[600]} />;
      default:
        return <MapPin size={20} color={COLORS.neutral[600]} />;
    }
  };

  return (
    <View
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      testID={testID}
    >
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <MapPin size={24} color={COLORS.primary[600]} />
            <CardTitle>Address Information</CardTitle>
          </View>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.formField }}>
          {/* Address Type */}
          {showAddressType && (
            <View>
              <Label nativeID="addressType">Address Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateField('type', value)}
                disabled={isLoading}
              >
                <SelectTrigger aria-labelledby="addressType">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    {getAddressTypeIcon(formData.type)}
                    <SelectValue placeholder="Select address type" />
                  </View>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem label="Shipping Address" value="shipping" />
                  <SelectItem label="Billing Address" value="billing" />
                  <SelectItem label="Both Shipping & Billing" value="both" />
                </SelectContent>
              </Select>
            </View>
          )}

          {/* Name Fields */}
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            <View style={{ flex: 1 }}>
              <Label nativeID="firstName">First Name *</Label>
              <Input
                aria-labelledby="firstName"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                placeholder="Enter first name"
                editable={!isLoading}
                style={errors.firstName ? { borderColor: COLORS.error[500] } : {}}
              />
              {errors.firstName && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.firstName}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Label nativeID="lastName">Last Name *</Label>
              <Input
                aria-labelledby="lastName"
                value={formData.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                placeholder="Enter last name"
                editable={!isLoading}
                style={errors.lastName ? { borderColor: COLORS.error[500] } : {}}
              />
              {errors.lastName && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.lastName}
                </Text>
              )}
            </View>
          </View>

          {/* Company Field */}
          {showCompanyField && (
            <View>
              <Label nativeID="company">Company (Optional)</Label>
              <Input
                aria-labelledby="company"
                value={formData.company}
                onChangeText={(value) => updateField('company', value)}
                placeholder="Enter company name"
                editable={!isLoading}
              />
            </View>
          )}

          {/* Address Line 1 with Lookup */}
          <View style={{ position: 'relative' }}>
            <Label nativeID="address1">Street Address *</Label>
            <Input
              aria-labelledby="address1"
              value={formData.address1}
              onChangeText={(value) => {
                updateField('address1', value);
                if (onAddressLookup) {
                  handleAddressLookup(value);
                }
              }}
              placeholder="Enter street address"
              editable={!isLoading}
              style={errors.address1 ? { borderColor: COLORS.error[500] } : {}}
            />
            {errors.address1 && (
              <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                {errors.address1}
              </Text>
            )}

            {/* Address Suggestions */}
            {showSuggestions && (
              <Card style={{ 
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: 200,
                backgroundColor: COLORS.white,
              }}>
                <CardContent style={{ padding: 0 }}>
                  {lookupSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onPress={() => applySuggestion(suggestion)}
                      style={{ 
                        justifyContent: 'flex-start',
                        padding: SPACING.md,
                        borderRadius: 0,
                      }}
                    >
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'left' }}>
                        {suggestion.formatted}
                      </Text>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </View>

          {/* Address Line 2 */}
          <View>
            <Label nativeID="address2">Apartment, Suite, etc. (Optional)</Label>
            <Input
              aria-labelledby="address2"
              value={formData.address2}
              onChangeText={(value) => updateField('address2', value)}
              placeholder="Apt, suite, unit, building, floor, etc."
              editable={!isLoading}
            />
          </View>

          {/* City, State, ZIP */}
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            <View style={{ flex: 2 }}>
              <Label nativeID="city">City *</Label>
              <Input
                aria-labelledby="city"
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
                placeholder="Enter city"
                editable={!isLoading}
                style={errors.city ? { borderColor: COLORS.error[500] } : {}}
              />
              {errors.city && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.city}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Label nativeID="zipCode">ZIP Code *</Label>
              <Input
                aria-labelledby="zipCode"
                value={formData.zipCode}
                onChangeText={(value) => updateField('zipCode', value)}
                placeholder="ZIP"
                editable={!isLoading}
                style={errors.zipCode ? { borderColor: COLORS.error[500] } : {}}
              />
              {errors.zipCode && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.zipCode}
                </Text>
              )}
            </View>
          </View>

          {/* State and Country */}
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            <View style={{ flex: 1 }}>
              <Label nativeID="state">State/Province *</Label>
              {formData.country === 'US' ? (
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateField('state', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger aria-labelledby="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {usStates.map((state) => (
                      <SelectItem key={state.code} label={state.name} value={state.code} />
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  aria-labelledby="state"
                  value={formData.state}
                  onChangeText={(value) => updateField('state', value)}
                  placeholder="Enter state/province"
                  editable={!isLoading}
                  style={errors.state ? { borderColor: COLORS.error[500] } : {}}
                />
              )}
              {errors.state && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.state}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Label nativeID="country">Country *</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => {
                  updateField('country', value);
                  // Reset state when country changes
                  if (value !== 'US') {
                    updateField('state', '');
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger aria-labelledby="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.code} label={country.name} value={country.code} />
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                  {errors.country}
                </Text>
              )}
            </View>
          </View>

          {/* Phone */}
          <View>
            <Label nativeID="phone">Phone Number (Optional)</Label>
            <Input
              aria-labelledby="phone"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Enter phone number"
              editable={!isLoading}
              style={errors.phone ? { borderColor: COLORS.error[500] } : {}}
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                {errors.phone}
              </Text>
            )}
          </View>

          {/* Set as Default */}
          {allowSetDefault && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  Set as Default Address
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  Use this address for future orders
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
              <Text>{isLoading ? 'Saving...' : 'Save Address'}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default AddressForm;
