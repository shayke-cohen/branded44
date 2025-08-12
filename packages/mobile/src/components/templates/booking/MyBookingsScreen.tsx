/**
 * MyBookingsScreen Template Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive booking management screen for customers to view and manage their appointments.
 * Designed for complete booking lifecycle management.
 * 
 * Features:
 * - Upcoming and past bookings
 * - Booking status tracking
 * - Quick actions (reschedule, cancel)
 * - Booking details and receipts
 * - Provider contact information
 * - Review and rating capabilities
 * - Calendar view integration
 * - Search and filter options
 * 
 * @example
 * ```tsx
 * <MyBookingsScreen
 *   bookings={userBookings}
 *   onBookingPress={(booking) => viewBookingDetails(booking)}
 *   onReschedule={(booking) => rescheduleBooking(booking)}
 *   onCancel={(booking) => cancelBooking(booking)}
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
import { AppointmentCard } from '../../blocks/booking';
import { SearchForm, FilterPanel } from '../../blocks/forms';
import { LoadingCard, ErrorCard } from '../../blocks/utility';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../~/components/ui/tabs';
// Temporary workaround for @rn-primitives/tabs module resolution issue
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TEMPORARY TABS IMPLEMENTATION ===
// Simple custom tabs to replace broken @rn-primitives/tabs

interface CustomTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  style?: any;
  children: React.ReactNode;
}

interface CustomTabsListProps {
  style?: any;
  children: React.ReactNode;
}

interface CustomTabsTriggerProps {
  value: string;
  style?: any;
  children: React.ReactNode;
}

interface CustomTabsContentProps {
  value: string;
  style?: any;
  children: React.ReactNode;
}

// Simple Tabs Context
const TabsContext = React.createContext<{
  activeValue: string;
  onValueChange: (value: string) => void;
}>({ activeValue: '', onValueChange: () => {} });

const CustomTabs: React.FC<CustomTabsProps> = ({ value, onValueChange, style, children }) => (
  <TabsContext.Provider value={{ activeValue: value, onValueChange }}>
    <View style={style}>{children}</View>
  </TabsContext.Provider>
);

const CustomTabsList: React.FC<CustomTabsListProps> = ({ style, children }) => (
  <View style={style}>{children}</View>
);

const CustomTabsTrigger: React.FC<CustomTabsTriggerProps> = ({ value, style, children }) => {
  const { activeValue, onValueChange } = React.useContext(TabsContext);
  return (
    <TouchableOpacity style={style} onPress={() => onValueChange(value)}>
      {children}
    </TouchableOpacity>
  );
};

const CustomTabsContent: React.FC<CustomTabsContentProps> = ({ value, style, children }) => {
  const { activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;
  return <View style={style}>{children}</View>;
};

// Use custom components
const Tabs = CustomTabs;
const TabsList = CustomTabsList;
const TabsTrigger = CustomTabsTrigger;
const TabsContent = CustomTabsContent;

// === TYPES ===

/**
 * Booking status
 */
export type BookingStatus = 
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'no-show'
  | 'rescheduled';

/**
 * Booking filter options
 */
export interface BookingFilters {
  /** Status filter */
  status: BookingStatus[];
  /** Date range */
  dateRange: {
    start: Date;
    end: Date;
  };
  /** Provider filter */
  providers: string[];
  /** Service types */
  services: string[];
}

/**
 * Booking action
 */
export interface BookingAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon: string;
  /** Action type */
  type: 'primary' | 'secondary' | 'destructive';
  /** Whether action is available */
  available: boolean;
  /** Action handler */
  onPress: () => void;
}

/**
 * MyBookingsScreen component props
 */
export interface MyBookingsScreenProps {
  /** List of user bookings */
  bookings: Appointment[];
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Search query */
  searchQuery?: string;
  /** Active filters */
  filters?: Partial<BookingFilters>;
  /** Active tab */
  activeTab?: 'upcoming' | 'past' | 'cancelled';
  /** Booking press handler */
  onBookingPress?: (booking: Appointment) => void;
  /** Reschedule handler */
  onReschedule?: (booking: Appointment) => void;
  /** Cancel handler */
  onCancel?: (booking: Appointment) => void;
  /** Review handler */
  onReview?: (booking: Appointment) => void;
  /** Contact provider handler */
  onContactProvider?: (booking: Appointment) => void;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Filter change handler */
  onFiltersChange?: (filters: Partial<BookingFilters>) => void;
  /** Tab change handler */
  onTabChange?: (tab: 'upcoming' | 'past' | 'cancelled') => void;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Load more handler */
  onLoadMore?: () => void;
  /** Navigation handlers */
  onBack?: () => void;
  onNewBooking?: () => void;
  /** Screen customization */
  showSearch?: boolean;
  showFilters?: boolean;
  showCalendarView?: boolean;
  enableActions?: boolean;
  /** Accessibility */
  testID?: string;
}

// === COMPONENT ===

/**
 * MyBookingsScreen - Customer booking management
 * 
 * @example
 * ```tsx
 * const bookings = [
 *   {
 *     id: 'apt_1',
 *     service: { name: 'Personal Training', duration: 60 },
 *     provider: { name: 'Sarah Johnson', rating: 4.9 },
 *     startTime: new Date('2024-01-15T10:00:00'),
 *     status: 'confirmed',
 *     totalCost: 85
 *   }
 * ];
 * 
 * <MyBookingsScreen
 *   bookings={bookings}
 *   onBookingPress={(booking) => navigation.navigate('BookingDetails', { id: booking.id })}
 *   onReschedule={(booking) => navigation.navigate('Reschedule', { id: booking.id })}
 * />
 * ```
 */
export default function MyBookingsScreen({
  bookings = [],
  loading = false,
  error,
  searchQuery = '',
  filters = {},
  activeTab = 'upcoming',
  onBookingPress,
  onReschedule,
  onCancel,
  onReview,
  onContactProvider,
  onSearch,
  onFiltersChange,
  onTabChange,
  onRefresh,
  onLoadMore,
  onBack,
  onNewBooking,
  showSearch = true,
  showFilters = true,
  showCalendarView = false,
  enableActions = true,
  testID = 'my-bookings-screen',
}: MyBookingsScreenProps) {
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filter bookings by tab
  const filterBookingsByTab = (bookings: Appointment[], tab: string) => {
    const now = new Date();
    
    switch (tab) {
      case 'upcoming':
        return bookings.filter(booking => 
          new Date(booking.startTime) >= now && 
          ['confirmed', 'pending'].includes(booking.status)
        );
      case 'past':
        return bookings.filter(booking => 
          new Date(booking.startTime) < now && 
          booking.status === 'completed'
        );
      case 'cancelled':
        return bookings.filter(booking => 
          ['cancelled', 'no-show'].includes(booking.status)
        );
      default:
        return bookings;
    }
  };

  // Get filtered bookings
  const filteredBookings = filterBookingsByTab(bookings, activeTab);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  // Handle booking press
  const handleBookingPress = (booking: Appointment) => {
    onBookingPress?.(booking);
  };

  // Get booking actions
  const getBookingActions = (booking: Appointment): BookingAction[] => {
    const actions: BookingAction[] = [];
    const now = new Date();
    const bookingTime = new Date(booking.startTime);
    const hoursUntilBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    switch (booking.status) {
      case 'confirmed':
        if (hoursUntilBooking > 24) {
          actions.push({
            id: 'reschedule',
            label: 'Reschedule',
            icon: '📅',
            type: 'secondary',
            available: true,
            onPress: () => onReschedule?.(booking),
          });
        }
        
        if (hoursUntilBooking > 2) {
          actions.push({
            id: 'cancel',
            label: 'Cancel',
            icon: '❌',
            type: 'destructive',
            available: true,
            onPress: () => handleCancelBooking(booking),
          });
        }

        actions.push({
          id: 'contact',
          label: 'Contact Provider',
          icon: '💬',
          type: 'secondary',
          available: true,
          onPress: () => onContactProvider?.(booking),
        });
        break;

      case 'completed':
        if (!booking.reviewed) {
          actions.push({
            id: 'review',
            label: 'Leave Review',
            icon: '⭐',
            type: 'primary',
            available: true,
            onPress: () => onReview?.(booking),
          });
        }

        actions.push({
          id: 'rebook',
          label: 'Book Again',
          icon: '🔄',
          type: 'secondary',
          available: true,
          onPress: () => handleRebookService(booking),
        });
        break;
    }

    return actions;
  };

  // Handle cancel booking
  const handleCancelBooking = (booking: Appointment) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive',
          onPress: () => onCancel?.(booking),
        },
      ]
    );
  };

  // Handle rebook service
  const handleRebookService = (booking: Appointment) => {
    // Navigate to booking flow with pre-selected service and provider
    onNewBooking?.();
  };

  // Get status color
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case 'confirmed': return COLORS.success[500];
      case 'pending': return COLORS.warning[500];
      case 'cancelled': return COLORS.error[500];
      case 'completed': return COLORS.blue[500];
      case 'no-show': return COLORS.gray[500];
      case 'rescheduled': return COLORS.purple[500];
      default: return COLORS.gray[500];
    }
  };

  // Get status label
  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      case 'no-show': return 'No Show';
      case 'rescheduled': return 'Rescheduled';
      default: return status;
    }
  };

  // Render booking item
  const renderBookingItem = ({ item }: { item: Appointment }) => {
    const actions = enableActions ? getBookingActions(item) : [];
    
    return (
      <View style={styles.bookingItem}>
        <AppointmentCard
          appointment={item}
          onPress={() => handleBookingPress(item)}
          layout="expanded"
          showActions={false}
          showProvider={true}
          showStatus={true}
        />
        
        {/* Status Badge */}
        <Badge 
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusLabel(item.status)}
          </Text>
        </Badge>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <View style={styles.actionButtons}>
            {actions.map((action) => (
              <Button
                key={action.id}
                onPress={action.onPress}
                variant={action.type === 'primary' ? 'default' : 'outline'}
                size="sm"
                style={[
                  styles.actionButton,
                  action.type === 'destructive' && styles.destructiveButton,
                ]}
                disabled={!action.available}
              >
                <Text style={[
                  styles.actionButtonText,
                  action.type === 'destructive' && styles.destructiveButtonText,
                ]}>
                  {action.icon} {action.label}
                </Text>
              </Button>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>
        {activeTab === 'upcoming' && 'No Upcoming Bookings'}
        {activeTab === 'past' && 'No Past Bookings'}
        {activeTab === 'cancelled' && 'No Cancelled Bookings'}
      </Text>
      <Text style={styles.emptyMessage}>
        {activeTab === 'upcoming' && 'Book your first appointment to get started!'}
        {activeTab === 'past' && 'Your completed bookings will appear here.'}
        {activeTab === 'cancelled' && 'Your cancelled bookings will appear here.'}
      </Text>
      
      {activeTab === 'upcoming' && onNewBooking && (
        <Button
          onPress={onNewBooking}
          style={styles.emptyActionButton}
        >
          <Text style={styles.emptyActionText}>Book Now</Text>
        </Button>
      )}
    </View>
  );

  // Render loading state
  if (loading && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
        </View>
        <ScrollView style={styles.content}>
          <LoadingCard message="Loading your bookings..." />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
        </View>
        <View style={styles.content}>
          <ErrorCard
            title="Unable to load bookings"
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
          <Text style={styles.title}>My Bookings</Text>
        </View>
        
        <View style={styles.headerRight}>
          {showCalendarView && (
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              style={styles.viewToggle}
            >
              <Text style={styles.viewIcon}>
                {viewMode === 'list' ? '📅' : '📋'}
              </Text>
            </TouchableOpacity>
          )}
          
          {onNewBooking && (
            <TouchableOpacity onPress={onNewBooking} style={styles.newBookingButton}>
              <Text style={styles.newBookingIcon}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search & Filters */}
      {(showSearch || showFilters) && (
        <View style={styles.searchSection}>
          {showSearch && (
            <SearchForm
              placeholder="Search bookings..."
              value={searchQuery}
              onSearch={handleSearch}
              showFilters={showFilters}
              onFiltersPress={() => setShowFilterModal(true)}
            />
          )}
        </View>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} style={styles.tabs}>
        <TabsList style={styles.tabsList}>
          <TabsTrigger value="upcoming" style={styles.tabTrigger}>
            <Text style={styles.tabText}>Upcoming</Text>
          </TabsTrigger>
          <TabsTrigger value="past" style={styles.tabTrigger}>
            <Text style={styles.tabText}>Past</Text>
          </TabsTrigger>
          <TabsTrigger value="cancelled" style={styles.tabTrigger}>
            <Text style={styles.tabText}>Cancelled</Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} style={styles.tabContent}>
          {filteredBookings.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredBookings}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.bookingsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[COLORS.primary[500]]}
                />
              }
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.1}
              showsVerticalScrollIndicator={false}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterPanel
          visible={showFilterModal}
          filters={filters}
          onFiltersChange={(newFilters) => {
            onFiltersChange?.(newFilters);
            setShowFilterModal(false);
          }}
          onClose={() => setShowFilterModal(false)}
        />
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
  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
  },
  viewToggle: {
    padding: SPACING.xs,
  },
  viewIcon: {
    fontSize: 20,
  },
  newBookingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[600],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  newBookingIcon: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  tabs: {
    flex: 1,
  },
  tabsList: {
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tabTrigger: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  tabContent: {
    flex: 1,
  },
  bookingsList: {
    padding: SPACING.md,
  },
  bookingItem: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    position: 'relative' as const,
  },
  statusBadge: {
    position: 'absolute' as const,
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center' as const,
  },
  destructiveButton: {
    borderColor: COLORS.error[300],
  },
  destructiveButtonText: {
    color: COLORS.error[600],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    textAlign: 'center' as const,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  emptyActionButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary[600],
    borderRadius: 8,
  },
  emptyActionText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  content: {
    flex: 1,
  },
};

// === EXPORTS ===

export type {
  MyBookingsScreenProps,
  BookingStatus,
  BookingFilters,
  BookingAction,
};
