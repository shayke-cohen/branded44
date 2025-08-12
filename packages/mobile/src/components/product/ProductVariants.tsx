/**
 * ProductVariants - Reusable product variants selector component
 * 
 * Displays product variants (size, color, etc.) and handles selection
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createProductDetailStyles } from '../../shared/styles/ProductDetailStyles';

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  available: boolean;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
  title?: string;
  style?: any;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
  title = 'Options',
  style,
}) => {
  const { theme } = useTheme();
  const styles = createProductDetailStyles(theme);

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <View style={[styles.variantsSection, style]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.variantGrid}
      >
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isDisabled = !variant.available;

          return (
            <TouchableOpacity
              key={variant.id}
              style={[
                styles.variantOption,
                isSelected && styles.variantOptionSelected,
                isDisabled && { opacity: 0.5 },
              ]}
              onPress={() => !isDisabled && onVariantSelect(variant)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.variantText,
                  isSelected && styles.variantTextSelected,
                ]}
              >
                {variant.value}
              </Text>
              {!variant.available && (
                <Text style={[styles.variantText, { fontSize: 10 }]}>
                  Out of Stock
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ProductVariants;
