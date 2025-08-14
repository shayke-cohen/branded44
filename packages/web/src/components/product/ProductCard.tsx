/**
 * ProductCard - Web-specific product card component
 * 
 * Displays individual products in a card layout matching the mobile design
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { WixProduct } from '@mobile/utils/wixApiClient';
import { useTheme } from '../../context/ThemeContext';
import { createWebProductStyles } from '../../styles/WebProductStyles';

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
  const styles = createWebProductStyles(theme);

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

  // Get image URL from various possible formats
  const getImageUrl = (product: WixProduct): string | null => {
    if (product.imageUrl) return product.imageUrl;
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.media?.mainMedia?.image?.url) return product.media.mainMedia.image.url;
    return null;
  };

  // Get formatted price
  const getFormattedPrice = (product: WixProduct): string => {
    if (product.price && typeof product.price === 'string') return product.price;
    if (product.price?.formatted?.price) return product.price.formatted.price;
    if (product.priceValue !== undefined) return `$${product.priceValue.toFixed(2)}`;
    return 'Price not available';
  };

  const imageUrl = getImageUrl(product);
  const formattedPrice = getFormattedPrice(product);

  return (
    <TouchableOpacity
      style={[styles.productCard, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
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
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name || 'Unnamed Product'}
        </Text>

        <Text style={styles.productPrice}>
          {formattedPrice}
        </Text>

        <Text style={[
          styles.productStock,
          product.inStock ? styles.productStockInStock : styles.productStockOutOfStock
        ]}>
          {product.inStock 
            ? `In Stock ${product.stockQuantity ? `(${product.stockQuantity})` : ''}` 
            : 'Out of Stock'
          }
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
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
