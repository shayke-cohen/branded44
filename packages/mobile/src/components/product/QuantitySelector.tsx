/**
 * QuantitySelector - Reusable quantity selector component
 * 
 * Allows users to select product quantity with +/- buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createProductDetailStyles } from '../../shared/styles/ProductDetailStyles';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
  title?: string;
  style?: any;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 99,
  title = 'Quantity',
  style,
}) => {
  const { theme } = useTheme();
  const styles = createProductDetailStyles(theme);

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleTextInput = (text: string) => {
    const newQuantity = parseInt(text, 10);
    if (!isNaN(newQuantity) && newQuantity >= minQuantity && newQuantity <= maxQuantity) {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <View style={[styles.quantitySection, style]}>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityLabel}>{title}</Text>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrement}
            disabled={quantity <= minQuantity}
          >
            <Text
              style={[
                styles.quantityButtonText,
                quantity <= minQuantity && { opacity: 0.5 },
              ]}
            >
              −
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.quantityInput}
            value={quantity.toString()}
            onChangeText={handleTextInput}
            keyboardType="numeric"
            textAlign="center"
            maxLength={2}
          />

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrement}
            disabled={quantity >= maxQuantity}
          >
            <Text
              style={[
                styles.quantityButtonText,
                quantity >= maxQuantity && { opacity: 0.5 },
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default QuantitySelector;
