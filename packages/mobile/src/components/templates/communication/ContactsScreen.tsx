/**
 * ContactsScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive contacts screen template that manages user connections
 * with search, organization, and social features.
 * 
 * Features:
 * - Contact list with UserCard integration
 * - Search and filter contacts
 * - Alphabetical grouping and indexing
 * - Contact categories (friends, family, work, etc.)
 * - Add new contacts functionality
 * - Import contacts from device/social media
 * - Contact synchronization
 * - Favorite contacts section
 * - Online status indicators
 * - Quick actions (call, message, video call)
 * - Contact sharing and invitations
 * - Bulk contact management
 * - Contact verification and badges
 * 
 * @example
 * ```tsx
 * <ContactsScreen
 *   contacts={userContacts}
 *   onContactPress={(contact) => navigation.navigate('Profile', { userId: contact.id })}
 *   onCallContact={(contact) => handleCallContact(contact)}
 *   onMessageContact={(contact) => handleMessageContact(contact)}
 *   onAddContact={() => navigation.navigate('AddContact')}
 *   loading={contactsLoading}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SectionList,
  Alert
} from 'react-native';
import { 
  UserCard,
  UserList 
} from '../../blocks/social';
import type { 
  UserCardProps,
  UserCardData
} from '../../blocks/social';
import { SearchForm } from '../../blocks/forms';
import type { SearchFormProps, SearchFormData } from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Contact information
 */
export interface Contact extends UserCardData {
  /** Contact category */
  category?: 'friends' | 'family' | 'work' | 'other';
  /** Phone numbers */
  phoneNumbers?: Array<{
    type: 'mobile' | 'home' | 'work';
    number: string;
    isPrimary?: boolean;
  }>;
  /** Email addresses */
  emails?: Array<{
    type: 'personal' | 'work' | 'other';
    email: string;
    isPrimary?: boolean;
  }>;
  /** Social media profiles */
  socialProfiles?: Array<{
    platform: string;
    username: string;
    url?: string;
  }>;
  /** Contact notes */
  notes?: string;
  /** Is favorite */
  isFavorite?: boolean;
  /** Is blocked */
  isBlocked?: boolean;
  /** Last contact date */
  lastContact?: Date;
  /** Contact frequency */
  contactFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
  /** Mutual connections */
  mutualConnections?: number;
}

/**
 * Contact group
 */
export interface ContactGroup {
  /** Group ID */
  id: string;
  /** Group title */
  title: string;
  /** Group contacts */
  contacts: Contact[];
  /** Group color */
  color?: string;
  /** Group icon */
  icon?: string;
}

/**
 * Contact filter type
 */
export type ContactFilterType = 'all' | 'favorites' | 'recent' | 'friends' | 'family' | 'work' | 'online' | 'blocked';

/**
 * Contact filter
 */
export interface ContactFilter {
  /** Filter type */
  type: ContactFilterType;
  /** Filter label */
  label: string;
  /** Filter count */
  count?: number;
  /** Is active */
  active: boolean;
}

/**
 * Contacts screen configuration
 */
export interface ContactsScreenConfig {
  /** Display style */
  displayStyle?: 'list' | 'grid' | 'alphabetical';
  /** Show search */
  showSearch?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show alphabet index */
  showAlphabetIndex?: boolean;
  /** Show favorites section */
  showFavorites?: boolean;
  /** Show online status */
  showOnlineStatus?: boolean;
  /** Show contact categories */
  showCategories?: boolean;
  /** Enable contact actions */
  enableContactActions?: boolean;
  /** Enable bulk selection */
  enableBulkSelection?: boolean;
  /** Enable contact sharing */
  enableContactSharing?: boolean;
  /** Show add contact button */
  showAddContactButton?: boolean;
  /** Enable contact import */
  enableContactImport?: boolean;
  /** Items per page */
  itemsPerPage?: number;
  /** Available filters */
  availableFilters?: ContactFilterType[];
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the ContactsScreen template
 */
export interface ContactsScreenProps extends BaseComponentProps {
  /** Contacts list */
  contacts?: Contact[];
  /** Contact groups */
  contactGroups?: ContactGroup[];
  /** Favorite contacts */
  favoriteContacts?: Contact[];
  /** Recent contacts */
  recentContacts?: Contact[];
  /** Available filters */
  filters?: ContactFilter[];
  /** Current active filter */
  activeFilter?: ContactFilterType;
  /** Search query */
  searchQuery?: string;
  /** Selected contacts */
  selectedContacts?: string[];
  /** Callback when contact is pressed */
  onContactPress?: (contact: Contact) => void;
  /** Callback when contact is called */
  onCallContact?: (contact: Contact, phoneNumber?: string) => void;
  /** Callback when contact is messaged */
  onMessageContact?: (contact: Contact) => void;
  /** Callback when contact is video called */
  onVideoCallContact?: (contact: Contact) => void;
  /** Callback when contact is favorited */
  onFavoriteContact?: (contactId: string) => Promise<void> | void;
  /** Callback when contact is blocked */
  onBlockContact?: (contactId: string) => Promise<void> | void;
  /** Callback when contact is shared */
  onShareContact?: (contact: Contact) => void;
  /** Callback when add contact is pressed */
  onAddContact?: () => void;
  /** Callback when import contacts is pressed */
  onImportContacts?: () => void;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback when filter changes */
  onFilterChange?: (filter: ContactFilterType) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback when bulk action is performed */
  onBulkAction?: (action: string, contactIds: string[]) => Promise<void> | void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Callback for load more contacts */
  onLoadMore?: () => Promise<void> | void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Has more contacts */
  hasMore?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the contacts screen */
  config?: ContactsScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ContactsScreen - AI-optimized contacts screen template
 * 
 * A comprehensive contacts screen that manages user connections
 * with search, organization, and social features.
 */
const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts = [],
  contactGroups = [],
  favoriteContacts = [],
  recentContacts = [],
  filters = [],
  activeFilter = 'all',
  searchQuery = '',
  selectedContacts = [],
  onContactPress,
  onCallContact,
  onMessageContact,
  onVideoCallContact,
  onFavoriteContact,
  onBlockContact,
  onShareContact,
  onAddContact,
  onImportContacts,
  onSearch,
  onFilterChange,
  onSelectionChange,
  onBulkAction,
  onRefresh,
  onLoadMore,
  onBack,
  loading = false,
  loadingMore = false,
  refreshing = false,
  hasMore = true,
  error,
  config = {},
  style,
  testID = 'contacts-screen',
  ...props
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectionMode, setSelectionMode] = useState(false);
  const [localSelectedContacts, setLocalSelectedContacts] = useState<string[]>(selectedContacts);
  const [displayStyle, setDisplayStyle] = useState<'list' | 'grid' | 'alphabetical'>(config.displayStyle || 'alphabetical');

  const {
    displayStyle: configDisplayStyle = 'alphabetical',
    showSearch = true,
    showFilters = true,
    showAlphabetIndex = true,
    showFavorites = true,
    showOnlineStatus = true,
    showCategories = true,
    enableContactActions = true,
    enableBulkSelection = true,
    enableContactSharing = true,
    showAddContactButton = true,
    enableContactImport = true,
    itemsPerPage = 50,
    availableFilters = ['all', 'favorites', 'recent', 'friends', 'family', 'work', 'online'],
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];

    // Apply search filter
    if (localSearchQuery.trim()) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        contact.phoneNumbers?.some(phone => 
          phone.number.includes(localSearchQuery)
        )
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'favorites':
        filtered = filtered.filter(contact => contact.isFavorite);
        break;
      case 'recent':
        filtered = recentContacts.filter(contact => 
          filtered.find(c => c.id === contact.id)
        );
        break;
      case 'friends':
        filtered = filtered.filter(contact => contact.category === 'friends');
        break;
      case 'family':
        filtered = filtered.filter(contact => contact.category === 'family');
        break;
      case 'work':
        filtered = filtered.filter(contact => contact.category === 'work');
        break;
      case 'online':
        filtered = filtered.filter(contact => contact.isOnline);
        break;
      case 'blocked':
        filtered = filtered.filter(contact => contact.isBlocked);
        break;
      case 'all':
      default:
        // Exclude blocked contacts from 'all'
        filtered = filtered.filter(contact => !contact.isBlocked);
        break;
    }

    return filtered;
  }, [contacts, localSearchQuery, activeFilter, recentContacts]);

  const alphabeticalContacts = useMemo(() => {
    if (displayStyle !== 'alphabetical') return [];

    const grouped = filteredContacts.reduce((acc, contact) => {
      const letter = contact.name[0]?.toUpperCase() || '#';
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    return Object.keys(grouped)
      .sort()
      .map(letter => ({
        title: letter,
        data: grouped[letter].sort((a, b) => a.name.localeCompare(b.name))
      }));
  }, [filteredContacts, displayStyle]);

  const hasContacts = filteredContacts.length > 0;
  const hasSelectedContacts = localSelectedContacts.length > 0;
  const isAllSelected = localSelectedContacts.length === filteredContacts.length && hasContacts;

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSearch = useCallback((searchData: SearchFormData) => {
    setLocalSearchQuery(searchData.query || '');
    onSearch?.(searchData);
  }, [onSearch]);

  const handleFilterPress = useCallback((filterType: ContactFilterType) => {
    onFilterChange?.(filterType);
  }, [onFilterChange]);

  const handleContactPress = useCallback((contact: Contact) => {
    if (selectionMode) {
      handleToggleSelection(contact.id);
    } else {
      onContactPress?.(contact);
    }
  }, [selectionMode, onContactPress]);

  const handleContactLongPress = useCallback((contact: Contact) => {
    if (!selectionMode) {
      setSelectionMode(true);
      handleToggleSelection(contact.id);
    }
  }, [selectionMode]);

  const handleToggleSelection = useCallback((contactId: string) => {
    const newSelectedContacts = localSelectedContacts.includes(contactId)
      ? localSelectedContacts.filter(id => id !== contactId)
      : [...localSelectedContacts, contactId];
    
    setLocalSelectedContacts(newSelectedContacts);
    onSelectionChange?.(newSelectedContacts);
  }, [localSelectedContacts, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    const newSelectedContacts = isAllSelected ? [] : filteredContacts.map(contact => contact.id);
    setLocalSelectedContacts(newSelectedContacts);
    onSelectionChange?.(newSelectedContacts);
  }, [isAllSelected, filteredContacts, onSelectionChange]);

  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setLocalSelectedContacts([]);
      onSelectionChange?.([]);
    }
  }, [selectionMode, onSelectionChange]);

  const handleContactAction = useCallback((action: string, contact: Contact) => {
    switch (action) {
      case 'call':
        onCallContact?.(contact);
        break;
      case 'message':
        onMessageContact?.(contact);
        break;
      case 'videoCall':
        onVideoCallContact?.(contact);
        break;
      case 'favorite':
        onFavoriteContact?.(contact.id);
        break;
      case 'block':
        onBlockContact?.(contact.id);
        break;
      case 'share':
        onShareContact?.(contact);
        break;
    }
  }, [onCallContact, onMessageContact, onVideoCallContact, onFavoriteContact, onBlockContact, onShareContact]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (!hasSelectedContacts || !onBulkAction) return;

    try {
      await onBulkAction(action, localSelectedContacts);
      setLocalSelectedContacts([]);
      setSelectionMode(false);
      onSelectionChange?.([]);
    } catch (err) {
      console.error('Bulk action failed:', err);
      Alert.alert('Error', `Failed to ${action} contacts`);
    }
  }, [hasSelectedContacts, localSelectedContacts, onBulkAction, onSelectionChange]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    try {
      await onRefresh();
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  }, [onRefresh]);

  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || loadingMore || !hasMore) return;
    try {
      await onLoadMore();
    } catch (err) {
      console.error('Load more failed:', err);
    }
  }, [onLoadMore, loadingMore, hasMore]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <View style={styles.headerTop}>
          {onBack ? (
            <TouchableOpacity 
              onPress={onBack}
              style={styles.backButton}
              testID={`${testID}-back`}
            >
              <ChevronLeft style={styles.backIcon} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          
          <Text style={styles.headerTitle}>Contacts</Text>
          
          <View style={styles.headerActions}>
            {enableBulkSelection && (
              <TouchableOpacity 
                onPress={handleToggleSelectionMode}
                style={styles.headerAction}
                testID={`${testID}-selection-toggle`}
              >
                <Text style={styles.headerActionText}>
                  {selectionMode ? 'Cancel' : 'Select'}
                </Text>
              </TouchableOpacity>
            )}
            
            {showAddContactButton && (
              <TouchableOpacity 
                onPress={onAddContact}
                style={styles.headerAction}
                testID={`${testID}-add-contact`}
              >
                <Text style={styles.headerActionIcon}>➕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contact Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{contacts.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          {favoriteContacts.length > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{favoriteContacts.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {contacts.filter(c => c.isOnline).length}
            </Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>

        {/* Search */}
        {showSearch && (
          <SearchForm
            onSearch={handleSearch}
            placeholder="Search contacts..."
            defaultValue={localSearchQuery}
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
        )}

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {availableFilters.map((filterType) => {
              const filter = filters.find(f => f.type === filterType) || {
                type: filterType,
                label: filterType.charAt(0).toUpperCase() + filterType.slice(1),
                active: activeFilter === filterType
              };

              return (
                <TouchableOpacity
                  key={filterType}
                  onPress={() => handleFilterPress(filterType)}
                  style={[
                    styles.filterButton,
                    filter.active && styles.filterButtonActive
                  ]}
                  testID={`${testID}-filter-${filterType}`}
                >
                  <Text style={[
                    styles.filterText,
                    filter.active && styles.filterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                  {filter.count !== undefined && filter.count > 0 && (
                    <Badge variant="secondary" style={styles.filterBadge}>
                      <Text style={styles.badgeText}>{filter.count}</Text>
                    </Badge>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Display Style Toggle */}
        <View style={styles.displayToggle}>
          <TouchableOpacity
            onPress={() => setDisplayStyle('list')}
            style={[
              styles.displayButton,
              displayStyle === 'list' && styles.displayButtonActive
            ]}
            testID={`${testID}-display-list`}
          >
            <Text style={styles.displayButtonText}>☰</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setDisplayStyle('grid')}
            style={[
              styles.displayButton,
              displayStyle === 'grid' && styles.displayButtonActive
            ]}
            testID={`${testID}-display-grid`}
          >
            <Text style={styles.displayButtonText}>⊞</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setDisplayStyle('alphabetical')}
            style={[
              styles.displayButton,
              displayStyle === 'alphabetical' && styles.displayButtonActive
            ]}
            testID={`${testID}-display-alphabetical`}
          >
            <Text style={styles.displayButtonText}>Az</Text>
          </TouchableOpacity>
        </View>

        {/* Selection Actions */}
        {selectionMode && hasSelectedContacts && (
          <View style={styles.selectionActions}>
            <Button
              onPress={() => handleBulkAction('favorite')}
              variant="outline"
              size="sm"
              style={styles.bulkActionButton}
              testID={`${testID}-bulk-favorite`}
            >
              <Text style={styles.bulkActionText}>Favorite</Text>
            </Button>
            
            <Button
              onPress={() => handleBulkAction('message')}
              variant="outline"
              size="sm"
              style={styles.bulkActionButton}
              testID={`${testID}-bulk-message`}
            >
              <Text style={styles.bulkActionText}>Message</Text>
            </Button>
            
            <Button
              onPress={() => handleBulkAction('delete')}
              variant="destructive"
              size="sm"
              style={styles.bulkActionButton}
              testID={`${testID}-bulk-delete`}
            >
              <Text style={styles.bulkActionText}>Delete</Text>
            </Button>
          </View>
        )}

        {/* Quick Actions */}
        {enableContactImport && (
          <View style={styles.quickActions}>
            <Button
              onPress={onImportContacts}
              variant="outline"
              size="sm"
              style={styles.quickActionButton}
              testID={`${testID}-import-contacts`}
            >
              <Text style={styles.quickActionText}>Import Contacts</Text>
            </Button>
          </View>
        )}
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <UIAlert 
        variant="destructive"
        style={styles.errorAlert}
        testID={`${testID}-error`}
      >
        <Text style={styles.errorText}>{error}</Text>
      </UIAlert>
    );
  };

  const renderFavorites = () => {
    if (!showFavorites || favoriteContacts.length === 0 || activeFilter !== 'all') return null;

    return (
      <View style={styles.favoritesSection} testID={`${testID}-favorites`}>
        <Text style={styles.sectionTitle}>Favorites</Text>
        <FlatList
          data={favoriteContacts.slice(0, 5)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.favoritesList}
          renderItem={({ item: contact }) => (
            <UserCard
              user={contact}
              onPress={() => handleContactPress(contact)}
              onAction={(action) => handleContactAction(action, contact)}
              showStats={false}
              variant="compact"
              style={styles.favoriteCard}
              testID={`${testID}-favorite-${contact.id}`}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  const renderContact = ({ item: contact }: { item: Contact }) => {
    const isSelected = localSelectedContacts.includes(contact.id);

    return (
      <UserCard
        user={contact}
        onPress={() => handleContactPress(contact)}
        onLongPress={() => handleContactLongPress(contact)}
        onAction={(action) => handleContactAction(action, contact)}
        selected={isSelected}
        showStats={showCategories}
        showOnlineStatus={showOnlineStatus}
        enableActions={enableContactActions}
        actionButtons={[
          {
            id: 'call',
            label: 'Call',
            icon: '📞',
            onPress: () => handleContactAction('call', contact),
            variant: 'outline'
          },
          {
            id: 'message',
            label: 'Message',
            icon: '💬',
            onPress: () => handleContactAction('message', contact),
            variant: 'outline'
          },
          {
            id: 'favorite',
            label: contact.isFavorite ? 'Unfavorite' : 'Favorite',
            icon: contact.isFavorite ? '💔' : '❤️',
            onPress: () => handleContactAction('favorite', contact),
            variant: 'ghost'
          }
        ]}
        style={[
          styles.contactCard,
          displayStyle === 'grid' && styles.contactCardGrid
        ]}
        testID={`${testID}-contact-${contact.id}`}
      />
    );
  };

  const renderAlphabeticalSection = ({ item }: { item: { title: string; data: Contact[] } }) => (
    <View style={styles.alphabeticalSection}>
      <Text style={styles.alphabeticalTitle}>{item.title}</Text>
      <FlatList
        data={item.data}
        renderItem={renderContact}
        keyExtractor={(contact) => contact.id}
        numColumns={displayStyle === 'grid' ? 2 : 1}
        key={displayStyle} // Force re-render on layout change
        scrollEnabled={false}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (hasContacts || loading) return null;

    const isSearching = localSearchQuery.trim().length > 0;
    const isFiltered = activeFilter !== 'all';

    return (
      <View style={styles.emptyContainer} testID={`${testID}-empty`}>
        <Text style={styles.emptyTitle}>
          {isSearching 
            ? 'No contacts found'
            : isFiltered 
              ? `No ${activeFilter} contacts`
              : 'No contacts yet'
          }
        </Text>
        <Text style={styles.emptyDescription}>
          {isSearching 
            ? 'Try adjusting your search terms'
            : isFiltered 
              ? `You don't have any ${activeFilter} contacts`
              : 'Add contacts to start connecting with people!'
          }
        </Text>
        
        {!isSearching && !isFiltered && showAddContactButton && (
          <Button
            onPress={onAddContact}
            style={styles.emptyActionButton}
            testID={`${testID}-empty-add-contact`}
          >
            <Text style={styles.emptyActionText}>Add Contact</Text>
          </Button>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more contacts...</Text>
      </View>
    );
  };

  const renderContactsList = () => {
    if (displayStyle === 'alphabetical') {
      return (
        <SectionList
          sections={alphabeticalContacts}
          renderItem={renderAlphabeticalSection}
          renderSectionHeader={() => null}
          keyExtractor={(item) => item.title}
          style={styles.contactsList}
          contentContainerStyle={[
            styles.contactsContent,
            !hasContacts && styles.contactsContentEmpty
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            ) : undefined
          }
          ListHeaderComponent={renderFavorites}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          testID={`${testID}-alphabetical-list`}
        />
      );
    }

    return (
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        numColumns={displayStyle === 'grid' ? 2 : 1}
        key={displayStyle} // Force re-render on layout change
        style={styles.contactsList}
        contentContainerStyle={[
          styles.contactsContent,
          !hasContacts && styles.contactsContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={renderFavorites}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        testID={`${testID}-list`}
      />
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      {/* Error Display */}
      {renderError()}

      {/* Contacts List */}
      {renderContactsList()}

      {/* Footer */}
      {footerComponent && (
        <View style={styles.footerContainer}>
          {footerComponent}
        </View>
      )}
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  backIcon: {
    width: 24,
    height: 24,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerAction: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  headerActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  headerActionIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  searchForm: {
    marginBottom: SPACING.md,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.primaryForeground,
  },
  filterBadge: {
    marginLeft: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  displayToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  displayButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  displayButtonActive: {
    backgroundColor: COLORS.primary,
  },
  displayButtonText: {
    fontSize: 18,
    color: COLORS.text,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bulkActionButton: {
    flex: 1,
  },
  bulkActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  quickActions: {
    marginBottom: SPACING.md,
  },
  quickActionButton: {
    width: '100%',
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  favoritesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  favoritesList: {
    gap: SPACING.md,
  },
  favoriteCard: {
    width: 100,
  },
  contactsList: {
    flex: 1,
  },
  contactsContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  contactsContentEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  alphabeticalSection: {
    marginBottom: SPACING.lg,
  },
  alphabeticalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    borderRadius: 4,
  },
  contactCard: {
    marginBottom: SPACING.md,
  },
  contactCardGrid: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  emptyActionButton: {
    paddingHorizontal: SPACING.xl,
  },
  emptyActionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  loadingFooter: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
});

export default ContactsScreen;
export type { 
  ContactsScreenProps, 
  ContactsScreenConfig, 
  Contact, 
  ContactGroup, 
  ContactFilter, 
  ContactFilterType 
};
