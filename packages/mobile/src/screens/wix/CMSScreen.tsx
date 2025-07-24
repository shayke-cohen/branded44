import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { 
  wixCmsClient, 
  WixDataItem, 
  WixCollection, 
  WixDataResponse 
} from '../../utils/wixApiClient';

interface CMSScreenProps {
  navigation?: any;
}

interface BlogPost extends WixDataItem {
  title?: string;
  content?: string;
  author?: string;
  publishDate?: string;
  category?: string;
}

const CMSScreen: React.FC<CMSScreenProps> = ({ navigation }) => {
  const [collections, setCollections] = useState<WixCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [items, setItems] = useState<WixDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authError, setAuthError] = useState<string>('');

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

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 6,
    margin: 10,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  selectorSection: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
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
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: 'white',
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
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#333',
    fontSize: 14,
  },
  selectedChipText: {
    color: 'white',
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
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addItemContainer: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
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
    color: '#666',
    marginRight: 5,
  },
  itemId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  readOnlyBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  readOnlyText: {
    color: '#1976d2',
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
    color: '#555',
    marginBottom: 4,
  },
  fieldValueContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  booleanIndicator: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  booleanTrue: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  booleanFalse: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  booleanText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  booleanTextTrue: {
    color: '#4caf50',
  },
  booleanTextFalse: {
    color: '#f44336',
  },
  dateValue: {
    fontSize: 13,
    color: '#007bff',
    fontStyle: 'italic',
  },
  numberValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  contentValue: {
    fontSize: 13,
    color: '#555',
  },
  titleValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  textValue: {
    fontSize: 13,
    color: '#666',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  timestampLabel: {
    fontSize: 12,
    color: '#999',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 10,
  },
  errorNote: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  errorList: {
    fontSize: 13,
    color: '#856404',
  },
});

export default CMSScreen; 