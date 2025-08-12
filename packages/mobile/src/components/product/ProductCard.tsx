/**
 * ProductCard - Reusable product card component
 * 
 * Extracted from large screen files to improve reusability and maintainability
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import type { WixProduct } from '../../utils/wixApiClient';
import { useTheme } from '../../context/ThemeContext';
import { createProductListStyles } from '../../shared/styles/ProductListStyles';

interface ProductCardProps {
  product: WixProduct;
  onPress: (product: WixProduct) => void;
  onAddToCart: (product: WixProduct) => void;
  style?: any;
  disabled?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  style,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = createProductListStyles(theme);

  const handlePress = () => {
    if (!disabled) {
      onPress(product);
    }
  };

  const handleAddToCart = () => {
    if (!disabled && product.inStock) {
      onAddToCart(product);
    }
  };

  const isOutOfStock = !product.inStock;
  const isAddToCartDisabled = disabled || isOutOfStock;

  return (
    <TouchableOpacity
      style={[styles.productCard, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImagePlaceholderText}>
            No Image{'\n'}Available
          </Text>
        </View>
      )}

      {/* Product Info */}
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>

      <Text style={styles.productPrice}>
        {product.price}
      </Text>

      <Text style={[
        styles.productStock,
        product.inStock ? styles.productStockInStock : styles.productStockOutOfStock
      ]}>
        {product.inStock ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
      </Text>

      {/* Add to Cart Button */}
      <TouchableOpacity
        style={[
          styles.addToCartButton,
          isAddToCartDisabled && styles.addToCartButtonDisabled
        ]}
        onPress={handleAddToCart}
        disabled={isAddToCartDisabled}
      >
        <Text style={[
          styles.addToCartButtonText,
          isAddToCartDisabled && styles.addToCartButtonTextDisabled
        ]}>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ProductCard;
