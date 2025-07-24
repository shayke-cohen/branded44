import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Alert } from '../../utils/alert';
import { useTheme } from '../../context/ThemeContext';
import { 
  wixCmsClient, 
  WixDataItem, 
  WixCollection, 
  WixDataResponse 
} from '../../utils/wixApiClient';

interface CMSScreenProps {
  navigation?: any;
  onBack?: () => void;
}

interface BlogPost extends WixDataItem {
  title?: string;
  content?: string;
  author?: string;
  publishDate?: string;
  category?: string;
}

const CMSScreen: React.FC<CMSScreenProps> = ({ navigation, onBack }) => {
  const { theme } = useTheme();
  const [collections, setCollections] = useState<WixCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [items, setItems] = useState<WixDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authError, setAuthError] = useState<string>('');

  const styles = createStyles(theme);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setAuthError(''); // Clear any previous auth errors
      console.log('📋 [CMS SCREEN] Loading collections (read-only mode)...');
      
      // Use getAvailableCollections instead of getCollections to avoid 403 errors
      const collectionsData = await wixCmsClient.getAvailableCollections();
      setCollections(collectionsData);
      
      if (collectionsData.length > 0) {
        setSelectedCollection(collectionsData[0].id);
        await loadCollectionItems(collectionsData[0].id);
      }
    } catch (error) {
      console.error('❌ [CMS SCREEN] Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionItems = async (collectionId: string) => {
    if (!collectionId) return;
    
    try {
      setLoading(true);
      console.log(`📋 [CMS SCREEN] Loading items from collection: ${collectionId}`);
      
      const response: WixDataResponse = await wixCmsClient.queryCollection(collectionId, {
        limit: 20,
        sort: [{ fieldName: '_createdDate', order: 'desc' }]
      });
      
      setItems(response.items);
      console.log(`✅ [CMS SCREEN] Loaded ${response.items.length} items`);
    } catch (error) {
      console.error('❌ [CMS SCREEN] Error loading collection items:', error);
      Alert.alert('Error', 'Failed to load collection items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchItems = async () => {
    if (!selectedCollection || !searchTerm.trim()) {
      await loadCollectionItems(selectedCollection);
      return;
    }

    try {
      setLoading(true);
      console.log(`🔍 [CMS SCREEN] Searching for: ${searchTerm}`);
      
      const response = await wixCmsClient.searchItems(
        selectedCollection,
        searchTerm,
        ['title', 'content', 'name', 'description'], // Common search fields
        20
      );
      
      setItems(response.items);
      console.log(`✅ [CMS SCREEN] Found ${response.items.length} matching items`);
    } catch (error) {
      console.error('❌ [CMS SCREEN] Error searching items:', error);
      Alert.alert('Error', 'Failed to search items. Please try again.');
    } finally {
      setLoading(false);
    }
  };





  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const renderItem = (item: WixDataItem, index: number) => {
    const collection = collections.find(c => c.id === selectedCollection);
    
    return (
      <View key={item._id || index} style={styles.itemCard}>
        {/* Header with ID and Read-Only Badge */}
        <View style={styles.itemHeader}>
          <View style={styles.itemIdContainer}>
            <Text style={styles.itemLabel}>Item</Text>
            <Text style={styles.itemId}>{item._id?.slice(-8) || 'No ID'}</Text>
          </View>
          <View style={styles.readOnlyBadge}>
            <Text style={styles.readOnlyText}>📖 Read Only</Text>
          </View>
        </View>
        
        {/* Main Content Area */}
        <View style={styles.itemContent}>
          {collection?.fields.map((field) => {
            const value = item[field.key];
            if (value === undefined || value === null) return null;
            
            return (
              <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.displayName}</Text>
                <View style={styles.fieldValueContainer}>
                  {field.type === 'BOOLEAN' ? (
                    <View style={[styles.booleanIndicator, value ? styles.booleanTrue : styles.booleanFalse]}>
                      <Text style={[styles.booleanText, value ? styles.booleanTextTrue : styles.booleanTextFalse]}>
                        {value ? '✓ True' : '✗ False'}
                      </Text>
                    </View>
                  ) : field.type === 'DATE' ? (
                    <Text style={styles.dateValue}>
                      📅 {new Date(value).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  ) : field.type === 'NUMBER' ? (
                    <Text style={styles.numberValue}>
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </Text>
                  ) : field.key === 'content' || field.type === 'RICH_TEXT' ? (
                    <Text style={styles.contentValue} numberOfLines={3}>
                      {String(value)}
                    </Text>
                  ) : field.key === 'title' || field.key === 'name' ? (
                    <Text style={styles.titleValue}>{String(value)}</Text>
                  ) : (
                    <Text style={styles.textValue}>{String(value)}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Footer with Metadata */}
        <View style={styles.itemFooter}>
          <Text style={styles.timestampLabel}>Created</Text>
          <Text style={styles.timestamp}>
            {item._createdDate ? new Date(item._createdDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Unknown'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {onBack && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <Text style={styles.title}>Wix CMS Data Collections (Read-Only)</Text>
      
      {/* Read-Only Mode Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📖 This is a read-only viewer using visitor authentication. You can browse data but cannot add, edit, or delete items.
        </Text>
      </View>
      
      {/* Authentication Error Message */}
      {authError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Authentication Info</Text>
          <Text style={styles.errorMessage}>{authError}</Text>
          <Text style={styles.errorNote}>
            💡 Collections that were successfully created using admin authentication:
          </Text>
          <Text style={styles.errorList}>
            • Demo Products (3 sample items)
            • Demo Blog Posts (3 sample articles)
            • Audio Books (custom collection)
            • Stores Products & Collections
            • Contact Forms & Subscribers
          </Text>
        </View>
      ) : null}
      
      {/* Collection Selector */}
      <View style={styles.selectorSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Collections</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{collections.length}</Text>
          </View>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {collections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              style={[
                styles.collectionChip,
                selectedCollection === collection.id && styles.selectedChip
              ]}
              onPress={() => {
                setSelectedCollection(collection.id);
                loadCollectionItems(collection.id);
              }}
            >
              <View style={styles.chipContent}>
                <Text style={styles.chipIcon}>🗄️</Text>
                <Text style={[
                  styles.chipText,
                  selectedCollection === collection.id && styles.selectedChipText
                ]}>
                  {collection.displayName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search */}
      <View style={styles.selectorSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔍 Search Items</Text>
          {searchTerm ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSearchTerm('');
                loadCollectionItems(selectedCollection);
              }}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search in collection..."
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={searchItems}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={searchItems}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>



      {/* Items List */}
      <View style={styles.selectorSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.itemsHeaderContent}>
            <Text style={styles.sectionTitle}>📋 Items</Text>
            {selectedCollection && (
              <Text style={styles.collectionName}>
                in {collections.find(c => c.id === selectedCollection)?.displayName || selectedCollection}
              </Text>
            )}
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length}</Text>
          </View>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {!loading && items.length === 0 && (
          <Text style={styles.emptyText}>
            No items found. {selectedCollection ? 'Try a different search or add some items.' : 'Select a collection first.'}
          </Text>
        )}

        {!loading && items.map(renderItem)}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: theme.colors.text,
  },
  infoContainer: {
    backgroundColor: theme.colors.success + '20',
    padding: 12,
    borderRadius: 6,
    margin: 10,
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.success,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.colors.surface,
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: theme.colors.text + '40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
  },
  selectorSection: {
    backgroundColor: theme.colors.surface,
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: theme.colors.text + '40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsHeaderContent: {
    flex: 1,
  },
  collectionName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chipsContainer: {
    paddingVertical: 5,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  collectionChip: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addItemContainer: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text + '40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 5,
  },
  itemId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  readOnlyBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  readOnlyText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemContent: {
    marginBottom: 10,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  fieldValueContainer: {
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  booleanIndicator: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  booleanTrue: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
  },
  booleanFalse: {
    backgroundColor: theme.colors.error + '20',
    borderColor: theme.colors.error,
  },
  booleanText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  booleanTextTrue: {
    color: theme.colors.success,
  },
  booleanTextFalse: {
    color: theme.colors.error,
  },
  dateValue: {
    fontSize: 13,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  numberValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  contentValue: {
    fontSize: 13,
    color: theme.colors.text,
  },
  titleValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  textValue: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  timestampLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: 20,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: 10,
  },
  errorNote: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 5,
  },
  errorList: {
    fontSize: 13,
    color: theme.colors.error,
  },
  header: {
    padding: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CMSScreen; 