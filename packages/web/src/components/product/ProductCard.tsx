/**
 * ProductCard - Web-specific product card component
 * 
 * Displays individual products in a card layout matching the mobile design
 */

import React, { useState, useCallback, useEffect } from 'react';
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
  
  const productId = (product as any)._id || product.id || 'unknown';
  
  // Ultra-simple approach: just track adding state, no forcing
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress(product);
    }
  }, [disabled, onPress, product]);

  const handleAddToCart = useCallback(async () => {
    if (isAddingToCart || disabled || !product.inStock) {
      console.log('🚫 [WEB PRODUCT CARD] Add to cart blocked:', {
        isAddingToCart,
        disabled,
        inStock: product.inStock,
        productId: productId
      });
      return;
    }
    
    console.log('🛒 [WEB PRODUCT CARD] Adding to cart:', productId);
    console.log('🛒 [WEB PRODUCT CARD] Product details:', {
      id: product.id,
      _id: (product as any)._id,
      name: product.name,
      inStock: product.inStock
    });
    setIsAddingToCart(true);
    
    try {
      await onAddToCart(product);
      console.log('✅ [WEB PRODUCT CARD] Successfully added to cart:', productId);
    } catch (error) {
      console.error('❌ [WEB PRODUCT CARD] Failed to add to cart:', error);
      throw error;
    } finally {
      // Always reset state in finally block
      setIsAddingToCart(false);
      console.log('🔓 [WEB PRODUCT CARD] Cleared adding state for:', productId);
    }
  }, [isAddingToCart, disabled, product, onAddToCart, productId]);

  const isOutOfStock = !product.inStock;
  const isAddToCartDisabled = disabled || isOutOfStock || isAddingToCart;

  // Get image URL from various possible formats
  const getImageUrl = (product: WixProduct): string | null => {
    if ((product as any).imageUrl) return (product as any).imageUrl;
    if (product.images && product.images.length > 0) return product.images[0];
    if ((product as any).media?.mainMedia?.image?.url) return (product as any).media.mainMedia.image.url;
    return null;
  };

  // Get formatted price
  const getFormattedPrice = (product: WixProduct): string => {
    if (product.price && typeof product.price === 'string') return product.price;
    if ((product.price as any)?.formatted?.price) return (product.price as any).formatted.price;
    if ((product as any).priceValue !== undefined) return `$${(product as any).priceValue.toFixed(2)}`;
    if (product.price?.price) return product.price.price;
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
          style={styles.productImage as any}
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
            {isAddingToCart ? '⏳ Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
