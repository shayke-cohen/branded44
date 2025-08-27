/**
 * ServiceGrid - Reusable service grid component
 * 
 * Handles service display in a responsive grid layout
 */

import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import ServiceCard from '../blocks/booking/ServiceCard';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import type { WixService } from '../../utils/wixBookingApiClient';
import { adaptWixService } from '../../utils/wixServiceAdapter';
import { useTheme } from '../../context/ThemeContext';
import { createServiceDetailStyles } from '../../shared/styles/ServiceDetailStyles';

interface ServiceGridProps {
  services: WixService[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onServicePress: (service: WixService) => void;
  onRefresh: () => void;
  onRetry: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  numColumns?: number;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  loading,
  error,
  refreshing,
  onServicePress,
  onRefresh,
  onRetry,
  emptyTitle = 'No Services Found',
  emptySubtitle = 'Try adjusting your search or filters',
  numColumns = 1,
}) => {
  const { theme } = useTheme();
  const styles = createServiceDetailStyles(theme);

  // Ensure services is safely handled
  const safeServices = services || [];
  
  // Show error state
  if (error && safeServices.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={onRetry}
      />
    );
  }
  
  console.log('🎯 [SERVICE GRID] Render state:', {
    servicesLength: safeServices.length,
    loading,
    error,
    refreshing
  });

  // Show loading state for initial load
  if (loading && safeServices.length === 0) {
    console.log('🎯 [SERVICE GRID] Showing loading state');
    return <LoadingState message="Loading services..." />;
  }

  // Show empty state
  if (!loading && safeServices.length === 0) {
    console.log('🎯 [SERVICE GRID] Showing empty state');
    return (
      <EmptyState
        title={emptyTitle}
        subtitle={emptySubtitle}
      />
    );
  }

  const renderService = ({ item, index }: { item: WixService; index: number }) => {
    // Convert WixService to Service format that ServiceCard expects
    // Handle case where providers might not be defined
    const providers = (item as any).providers || [];
    const adaptedService = adaptWixService(item, providers);
    
    return (
      <ServiceCard
        service={adaptedService}
        onPress={() => onServicePress(item)}
        style={{
          marginBottom: 16,
          marginRight: numColumns > 1 && index % numColumns !== numColumns - 1 ? 8 : 0,
          flex: numColumns > 1 ? 1 : undefined,
        }}
      />
    );
  };

  const renderHeader = () => {
    if (error && safeServices.length > 0) {
      return (
        <View style={styles.errorContainer}>
          <ErrorState message={error} onRetry={onRetry} />
        </View>
      );
    }
    return null;
  };

  return (
    <FlatList
      data={safeServices}
      renderItem={renderService}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      ListHeaderComponent={renderHeader}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={6}
    />
  );
};

export default ServiceGrid;
