/**
 * CollectionSelector - Reusable collection selection component
 * 
 * Displays available collections as selectable chips
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createCMSStyles } from '../../shared/styles/CMSStyles';
import type { WixCollection } from '../../utils/wixApiClient';

interface CollectionSelectorProps {
  collections: WixCollection[];
  selectedCollection: string;
  onSelectionChange: (collectionId: string) => void;
  title?: string;
  style?: any;
}

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  collections,
  selectedCollection,
  onSelectionChange,
  title = 'Collections',
  style,
}) => {
  const { theme } = useTheme();
  const styles = createCMSStyles(theme);

  const handleCollectionPress = (collectionId: string) => {
    onSelectionChange(collectionId);
  };

  if ((collections || []).length === 0) {
    return null;
  }

  return (
    <View style={[styles.collectionSection, style]}>
      <Text style={styles.collectionTitle}>{title}</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collectionSelector}
      >
        {/* All Collections option */}
        <TouchableOpacity
          style={[
            styles.collectionChip,
            selectedCollection === '' && styles.collectionChipSelected,
          ]}
          onPress={() => handleCollectionPress('')}
        >
          <Text
            style={[
              styles.collectionChipText,
              selectedCollection === '' && styles.collectionChipTextSelected,
            ]}
          >
            All Collections
          </Text>
        </TouchableOpacity>

        {/* Individual collections */}
        {(collections || []).map((collection) => {
          const isSelected = selectedCollection === collection.id;
          
          return (
            <TouchableOpacity
              key={collection.id}
              style={[
                styles.collectionChip,
                isSelected && styles.collectionChipSelected,
              ]}
              onPress={() => handleCollectionPress(collection.id)}
            >
              <Text
                style={[
                  styles.collectionChipText,
                  isSelected && styles.collectionChipTextSelected,
                ]}
              >
                {collection.displayName || collection.name || collection.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CollectionSelector;
