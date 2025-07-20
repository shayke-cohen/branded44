import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import {useTheme} from '../context';

// Define your item type here
interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: 'active' | 'inactive';
}

interface ListScreenTemplateProps {
  title?: string;
  searchable?: boolean;
  refreshable?: boolean;
  onItemPress?: (item: ListItem) => void;
  onAdd?: () => void;
  emptyMessage?: string;
}

const ListScreenTemplate: React.FC<ListScreenTemplateProps> = ({
  title = 'List Screen',
  searchable = true,
  refreshable = true,
  onItemPress,
  onAdd,
  emptyMessage = 'No items found',
}) => {
  const {theme} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Replace with your actual data source
  const [items, setItems] = useState<ListItem[]>([
    {id: '1', title: 'Sample Item 1', subtitle: 'Description 1', status: 'active'},
    {id: '2', title: 'Sample Item 2', subtitle: 'Description 2', status: 'inactive'},
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: searchable ? 16 : 0,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    addButton: {
      marginLeft: 12,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    listContent: {
      paddingVertical: 8,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 4,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    itemSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 12,
    },
    activeBadge: {
      backgroundColor: theme.colors.success,
    },
    inactiveBadge: {
      backgroundColor: theme.colors.error,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRefresh = () => {
    setRefreshing(true);
    // Replace with your refresh logic
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderItem = ({item}: {item: ListItem}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress?.(item)}
      testID={`list-item-${item.id}`}
      activeOpacity={0.7}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.status && (
        <View style={[
          styles.statusBadge,
          item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {searchable && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="search-input"
            />
            {onAdd && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={onAdd}
                testID="add-button">
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          refreshable ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmpty}
        testID="items-list"
      />
    </View>
  );
};

export default ListScreenTemplate; 