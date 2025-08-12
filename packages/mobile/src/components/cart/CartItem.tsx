/**
 * CartItem - Reusable cart item component
 * 
 * Displays individual cart items with quantity controls and remove functionality
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createCartStyles } from '../../shared/styles/CartStyles';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: string;
    imageUrl?: string;
    quantity: number;
    selectedVariant?: any;
  };
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  style?: any;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createCartStyles(theme);

  const handleQuantityIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <View style={[styles.cartItem, style]}>
      {/* Product Image */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Text style={styles.itemImagePlaceholderText}>
            No{'\n'}Image
          </Text>
        </View>
      )}

      {/* Item Info */}
      <View style={styles.itemInfo}>
        {/* Header */}
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={handleRemove}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>

        {/* Variant */}
        {item.selectedVariant && (
          <Text style={styles.itemVariant}>
            {item.selectedVariant.name}: {item.selectedVariant.value}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>{item.price}</Text>
          
          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleQuantityDecrease}
              disabled={item.quantity <= 1}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  item.quantity <= 1 && { opacity: 0.5 },
                ]}
              >
                −
              </Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleQuantityIncrease}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartItem;
