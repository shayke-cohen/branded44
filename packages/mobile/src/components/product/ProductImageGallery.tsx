/**
 * ProductImageGallery - Reusable product image gallery component
 * 
 * Displays product images with navigation and indicators
 */

import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createProductDetailStyles } from '../../shared/styles/ProductDetailStyles';

interface ProductImageGalleryProps {
  images: string[];
  style?: any;
}

const { width } = Dimensions.get('window');

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createProductDetailStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.imageGallery, style]}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            No Image{'\n'}Available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.imageGallery, style]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((imageUrl, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.imageIndicator,
                index === currentIndex && styles.imageIndicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ProductImageGallery;
