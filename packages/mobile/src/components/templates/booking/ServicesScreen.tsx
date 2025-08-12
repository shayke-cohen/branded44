/**
 * ServicesScreen Template Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive services browsing screen with categories, search, and filtering.
 * Designed for service-based businesses like salons, fitness, healthcare, etc.
 * 
 * Features:
 * - Service category browsing
 * - Search and filter functionality
 * - Service grid/list display
 * - Popular services section
 * - Location-based filtering
 * - Price range filtering
 * - Service availability indicators
 * 
 * @example
 * ```tsx
 * <ServicesScreen
 *   services={servicesList}
 *   categories={serviceCategories}
 *   onServicePress={(service) => navigateToService(service.id)}
 *   onCategorySelect={(category) => filterByCategory(category)}
 *   onSearch={(query) => searchServices(query)}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { SearchForm, FilterPanel, SortPanel } from '../../blocks/forms';
import type { SearchFormData } from '../../blocks/forms/SearchForm';
import { ServiceCard } from '../../blocks/booking';
import { LoadingCard, ErrorCard } from '../../blocks/utility';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// Import types from booking blocks
import type { Service, ServiceProvider } from '../../blocks/booking/ServiceCard';

// Optional Wix integration imports
try {
  var { useWixBooking } = require('../../../context/WixBookingContext');
  var { adaptWixServices } = require('../../../utils/wixServiceAdapter');
  var WIX_INTEGRATION_AVAILABLE = true;
} catch (e) {
  var WIX_INTEGRATION_AVAILABLE = false;
  console.log('ℹ️ [SERVICES SCREEN] Wix integration not available, using generic mode');
}

// === TYPES ===

/**
 * Service category
 */
export interface ServiceCategory {
  /** Category unique identifier */
  id: string;
  /** Category name */
  name: string;
  /** Category icon */
  icon: string;
  /** Number of services in category */
  count: number;
  /** Category description */
  description?: string;
  /** Category color theme */
  color?: string;
}

/**
 * Service filter options
 */
export interface ServiceFilters {
  /** Selected categories */
  categories: string[];
  /** Price range */
  priceRange: {
    min: number;
    max: number;
  };
  /** Duration range */
  durationRange: {
    min: number;
    max: number;
  };
  /** Provider ratings */
  minRating: number;
  /** Service location type */
  locationTypes: ('onsite' | 'remote' | 'hybrid')[];
  /** Availability */
  availableToday: boolean;
  /** Service levels */
  levels: ('beginner' | 'intermediate' | 'advanced')[];
}

/**
 * Sort options
 */
export type ServiceSortOption = 
  | 'popularity'
  | 'price-low-high'
  | 'price-high-low'
  | 'rating'
  | 'duration'
  | 'availability'
  | 'newest';

/**
 * Screen layout mode
 */
export type LayoutMode = 'grid' | 'list';

/**
 * ServicesScreen component props
 */
export interface ServicesScreenProps {
  /** List of available services (required if not using Wix integration) */
  services?: Service[];
  /** Service categories (required if not using Wix integration) */
  categories?: ServiceCategory[];
  /** Featured services */
  featuredServices?: Service[];
  /** Loading state (managed automatically if using Wix integration) */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Search query */
  searchQuery?: string;
  /** Active filters */
  filters?: Partial<ServiceFilters>;
  /** Sort option */
  sortBy?: ServiceSortOption;
  /** Layout mode */
  layout?: LayoutMode;
  /** Service press handler */
  onServicePress?: (service: Service) => void;
  /** Category selection handler */
  onCategorySelect?: (category: ServiceCategory) => void;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Filter change handler */
  onFiltersChange?: (filters: Partial<ServiceFilters>) => void;
  /** Sort change handler */
  onSortChange?: (sortBy: ServiceSortOption) => void;
  /** Layout change handler */
  onLayoutChange?: (layout: LayoutMode) => void;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Load more handler */
  onLoadMore?: () => void;
  /** Navigation handlers */
  onBack?: () => void;
  /** Screen customization */
  showCategories?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showLayoutToggle?: boolean;
  /** Accessibility */
  testID?: string;
  
  // === WIX INTEGRATION OPTIONS ===
  /** Enable automatic Wix Bookings integration */
  enableWixIntegration?: boolean;
  /** Custom Wix filter options */
  wixFilters?: {
    categoryId?: string;
    providerId?: string;
    forceRefresh?: boolean;
  };
  /** Wix integration callbacks */
  onWixServiceLoad?: (services: Service[]) => void;
  onWixError?: (error: string) => void;
}

// === COMPONENT ===

/**
 * ServicesScreen - Browse available services
 * 
 * @example
 * ```tsx
 * const services = [
 *   {
 *     id: 'svc_1',
 *     name: 'Personal Training',
 *     description: 'One-on-one fitness training',
 *     category: 'fitness',
 *     duration: 60,
 *     durationUnit: 'minutes',
 *     pricing: { basePrice: 85, currency: 'USD', unit: 'session' },
 *     provider: { name: 'Sarah Johnson', rating: 4.9 },
 *     images: ['https://example.com/image.jpg'],
 *     availability: { available: true },
 *     rating: 4.8,
 *     reviewCount: 124
 *   }
 * ];
 * 
 * <ServicesScreen
 *   services={services}
 *   categories={categories}
 *   onServicePress={(service) => navigation.navigate('ServiceDetails', { serviceId: service.id })}
 *   onCategorySelect={(category) => setSelectedCategory(category.id)}
 * />
 * ```
 */
export default function ServicesScreen({
  // Generic props
  services: propServices = [],
  categories: propCategories = [],
  featuredServices = [],
  loading: propLoading = false,
  error: propError,
  searchQuery = '',
  filters = {},
  sortBy = 'popularity',
  layout = 'grid',
  onServicePress,
  onCategorySelect,
  onSearch,
  onFiltersChange,
  onSortChange,
  onLayoutChange,
  onRefresh,
  onLoadMore,
  onBack,
  showCategories = true,
  showFilters = true,
  showSort = true,
  showLayoutToggle = true,
  testID = 'services-screen',
  
  // Wix integration props
  enableWixIntegration = false,
  wixFilters,
  onWixServiceLoad,
  onWixError,
}: ServicesScreenProps) {
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // === WIX INTEGRATION ===
  
  // Conditionally use Wix hooks if integration is enabled
  const wixBooking = enableWixIntegration && WIX_INTEGRATION_AVAILABLE && useWixBooking ? useWixBooking() : null;
  
  // Determine data source: Wix or props
  const services = enableWixIntegration && wixBooking ? 
    adaptWixServices && wixBooking.services ? adaptWixServices(wixBooking.services, wixBooking.providers) : []
    : propServices;
    
  const categories = enableWixIntegration && wixBooking ? 
    wixBooking.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      count: cat.serviceCount || 0
    })) : propCategories;
    
  const loading = enableWixIntegration && wixBooking ? 
    wixBooking.servicesLoading || wixBooking.categoriesLoading 
    : propLoading;
    
  const error = enableWixIntegration && wixBooking ? 
    null // Wix errors handled internally
    : propError;

  // Load Wix data on mount and when filters change
  useEffect(() => {
    if (enableWixIntegration && wixBooking) {
      console.log('📅 [SERVICES SCREEN] Loading Wix services with filters:', wixFilters);
      
      Promise.all([
        wixBooking.loadServices(wixFilters),
        wixBooking.loadServiceCategories(wixFilters?.forceRefresh)
      ]).then(() => {
        const adaptedServices = adaptWixServices ? adaptWixServices(wixBooking.services, wixBooking.providers) : [];
        onWixServiceLoad?.(adaptedServices);
        console.log(`✅ [SERVICES SCREEN] Loaded ${adaptedServices.length} Wix services`);
      }).catch((err) => {
        console.error('❌ [SERVICES SCREEN] Failed to load Wix services:', err);
        onWixError?.(err.message || 'Failed to load services');
      });
    }
  }, [enableWixIntegration, wixFilters, wixBooking?.loadServices, wixBooking?.loadServiceCategories]);

  // Enhanced refresh handler for Wix integration
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (enableWixIntegration && wixBooking) {
        console.log('🔄 [SERVICES SCREEN] Refreshing Wix data...');
        await wixBooking.refreshAll();
        const adaptedServices = adaptWixServices ? adaptWixServices(wixBooking.services, wixBooking.providers) : [];
        onWixServiceLoad?.(adaptedServices);
      } else {
        await onRefresh?.();
      }
    } catch (err: any) {
      console.error('❌ [SERVICES SCREEN] Refresh failed:', err);
      if (enableWixIntegration) {
        onWixError?.(err.message || 'Failed to refresh services');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = (data: SearchFormData) => {
    onSearch?.(data.query);
  };

  // Handle category selection
  const handleCategoryPress = (category: ServiceCategory) => {
    onCategorySelect?.(category);
  };

  // Handle service press
  const handleServicePress = (service: Service) => {
    onServicePress?.(service);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: ServiceCategory }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(item)}
      style={styles.categoryCard}
      activeOpacity={0.7}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.categoryCount}>
        {item.count} services
      </Text>
    </TouchableOpacity>
  );

  // Render service item
  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={layout === 'grid' ? styles.gridItem : styles.listItem}>
      <ServiceCard
        service={item}
        onPress={() => handleServicePress(item)}
        layout={layout === 'grid' ? 'compact' : 'list'}
        showProvider={true}
        showPricing={true}
        showAvailability={true}
        showRating={true}
      />
    </View>
  );

  // Render loading state
  if (loading && services.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Services</Text>
        </View>
        <ScrollView style={styles.container}>
          <LoadingCard message="Loading services..." />
          <LoadingCard message="Loading categories..." />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Services</Text>
        </View>
        <View style={styles.container}>
          <ErrorCard
            type="network"
            title="Unable to load services"
            message={error}
            onRetry={onRefresh}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Services</Text>
        </View>
        
        {showLayoutToggle && (
          <TouchableOpacity
            onPress={() => onLayoutChange?.(layout === 'grid' ? 'list' : 'grid')}
            style={styles.layoutButton}
          >
            <Text style={styles.layoutIcon}>
              {layout === 'grid' ? '☰' : '⊞'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {/* Search Bar */}
            <View style={styles.searchSection}>
              <SearchForm
                placeholder="Search services..."
                onSearch={handleSearch}
              />
            </View>

            {/* Filter & Sort Bar */}
            {(showFilters || showSort) && (
              <View style={styles.filterBar}>
                {showFilters && (
                  <TouchableOpacity
                    onPress={() => setShowFilterModal(true)}
                    style={styles.filterButton}
                  >
                    <Text style={styles.filterButtonText}>
                      🔍 Filters
                    </Text>
                  </TouchableOpacity>
                )}
                
                {showSort && (
                  <TouchableOpacity
                    onPress={() => setShowSortModal(true)}
                    style={styles.sortButton}
                  >
                    <Text style={styles.sortButtonText}>
                      ↕ Sort: {sortBy}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Categories */}
            {showCategories && categories.length > 0 && (
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                />
              </View>
            )}

            {/* Featured Services */}
            {featuredServices.length > 0 && (
              <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>Featured Services</Text>
                <FlatList
                  data={featuredServices}
                  renderItem={renderServiceItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                />
              </View>
            )}

            {/* Services Grid/List */}
            <View style={styles.servicesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  All Services ({services.length})
                </Text>
              </View>

              <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                numColumns={layout === 'grid' ? 2 : 1}
                key={layout} // Force re-render when layout changes
                contentContainerStyle={styles.servicesList}
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.1}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[500]]}
          />
        }
      />

      {/* Filter Modal - Simplified for demo */}
      {showFilterModal && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: COLORS.white,
            padding: SPACING.lg,
            borderRadius: 12,
            margin: SPACING.lg
          }}>
            <Text style={{ fontSize: 18, marginBottom: SPACING.md }}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={{ color: COLORS.primary[600] }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sort Modal - Simplified for demo */}
      {showSortModal && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: COLORS.white,
            padding: SPACING.lg,
            borderRadius: 12,
            margin: SPACING.lg
          }}>
            <Text style={{ fontSize: 18, marginBottom: SPACING.md }}>Sort Options</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Text style={{ color: COLORS.primary[600] }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// === STYLES ===

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.gray[600],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
  },
  layoutButton: {
    padding: SPACING.xs,
  },
  layoutIcon: {
    fontSize: 20,
    color: COLORS.gray[600],
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  filterBar: {
    flexDirection: 'row' as const,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  filterButton: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
  },
  sortButton: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
  },
  categoriesSection: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.gray[900],
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoriesList: {
    paddingHorizontal: SPACING.md,
  },
  categoryCard: {
    alignItems: 'center' as const,
    marginRight: SPACING.md,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: SPACING.xs,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[900],
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
  },
  featuredSection: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[50],
  },
  featuredList: {
    paddingHorizontal: SPACING.md,
  },
  servicesSection: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: SPACING.sm,
  },
  servicesList: {
    paddingBottom: SPACING.xl,
  },
  gridItem: {
    flex: 0.5,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  listItem: {
    marginBottom: SPACING.md,
  },
};

// === EXPORTS ===
