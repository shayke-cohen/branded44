/**
 * ProviderSelector - Reusable provider selection component
 * 
 * Displays available service providers and handles selection
 */

import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import type { WixServiceProvider } from '../../utils/wixBookingApiClient';
import { useTheme } from '../../context/ThemeContext';
import { createServiceDetailStyles } from '../../shared/styles/ServiceDetailStyles';

interface ProviderSelectorProps {
  providers: WixServiceProvider[];
  selectedProvider: WixServiceProvider | null;
  loading: boolean;
  onProviderSelect: (provider: WixServiceProvider) => void;
  style?: any;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProvider,
  loading,
  onProviderSelect,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createServiceDetailStyles(theme);

  const renderProvider = ({ item }: { item: WixServiceProvider }) => {
    const isSelected = selectedProvider?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.providerCard,
          isSelected && styles.providerCardSelected,
        ]}
        onPress={() => onProviderSelect(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text
                    key={star}
                    style={[
                      styles.ratingStar,
                      { color: star <= item.rating ? '#FFD700' : '#E0E0E0' },
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text style={styles.ratingText}>
                ({item.reviewCount || 0})
              </Text>
            </View>
          )}
        </View>

        {item.bio && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.bio}
          </Text>
        )}

        {item.specialties && item.specialties.length > 0 && (
          <View style={styles.serviceMetrics}>
            {item.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{specialty}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingState message="Loading providers..." />;
  }

  if (providers.length === 0) {
    return (
      <EmptyState
        title="No providers available"
        subtitle="This service doesn't have any available providers at the moment"
      />
    );
  }

  return (
    <View style={[styles.providersSection, style]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Choose Provider</Text>
        <Text style={styles.sectionCount}>
          {providers.length} available
        </Text>
      </View>

      <FlatList
        data={providers}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.providersGrid}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Let parent scroll
      />
    </View>
  );
};

export default ProviderSelector;
