import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Alert } from '../../../utils/alert';
import {useTheme, useCart} from '../../../context';
import {Product} from '../../../types';
import {VALIDATION_MESSAGES} from '../../../constants';

interface ProductDetailScreenProps {
  product: Product;
  onBack?: () => void;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
}) => {
  const {theme} = useTheme();
  const {addToCart} = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handle missing product
  if (!product) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Product not found</Text>
      </View>
    );
  }

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
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    imageContainer: {
      height: 300,
      backgroundColor: theme.colors.surface,
      marginBottom: 16,
    },
    productImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },
    indicatorActive: {
      backgroundColor: theme.colors.primary,
    },
    content: {
      paddingHorizontal: 16,
    },
    brand: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    price: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    originalPrice: {
      fontSize: 20,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: 12,
    },
    featuredBadge: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    discountBadge: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginLeft: 12,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    rating: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginRight: 12,
      marginBottom: 12,
    },
    optionButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    optionTextSelected: {
      color: 'white',
    },
    colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginRight: 12,
      marginBottom: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorOptionSelected: {
      borderColor: theme.colors.primary,
      borderWidth: 3,
    },
    colorSwatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    addToCartContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    addToCartButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    addToCartButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    addToCartText: {
      fontSize: 18,
      fontWeight: '600',
      color: 'white',
    },
    stockStatus: {
      fontSize: 14,
      color: theme.colors.success,
      marginBottom: 16,
    },
    outOfStock: {
      color: theme.colors.error,
    },
  });

  const getColorStyle = (color: string) => {
    const colorMap: {[key: string]: string} = {
      Black: '#000000',
      White: '#FFFFFF',
      Red: '#FF0000',
      Navy: '#000080',
      Grey: '#808080',
      'Black/Red': '#000000',
      'White/Black': '#FFFFFF',
      'Royal Blue': '#4169E1',
      Wheat: '#F5DEB3',
      Brown: '#A52A2A',
    };
    return {backgroundColor: colorMap[color] || '#CCCCCC'};
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Select Size', 'Please select a size before adding to cart.');
      return;
    }
    
    if (!selectedColor) {
      Alert.alert('Select Color', 'Please select a color before adding to cart.');
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    Alert.alert('Success', VALIDATION_MESSAGES.CART_ADD_SUCCESS);
  };

  const isAddToCartDisabled = !selectedSize || !selectedColor || !product.inStock;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} testID="back-button">
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: product.images[selectedImageIndex]}}
            style={styles.productImage}
            testID="product-image"
          />
        </View>

        {product.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.indicatorActive,
                ]}
                onPress={() => setSelectedImageIndex(index)}
              />
            ))}
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          {product.featured && (
            <Text style={styles.featuredBadge}>Featured</Text>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            )}
            {product.originalPrice && (
              <Text style={styles.discountBadge}>
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Text>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.rating}>
              <Text>{product.rating}</Text> ({product.reviewCount} reviews)
            </Text>
          </View>

          <Text style={[styles.stockStatus, !product.inStock && styles.outOfStock]}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Size</Text>
            <View style={styles.optionsContainer}>
              {product.sizes.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    selectedSize === size && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedSize(size)}
                  testID={`size-${size}`}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedSize === size && styles.optionTextSelected,
                    ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.optionsContainer}>
              {product.colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  testID={`color-${color}`}>
                  <View style={[styles.colorSwatch, getColorStyle(color)]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.addToCartContainer}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isAddToCartDisabled && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isAddToCartDisabled}
          testID="add-to-cart-button">
          <Text style={styles.addToCartText}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;