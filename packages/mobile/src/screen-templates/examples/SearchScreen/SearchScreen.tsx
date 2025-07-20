import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {useTheme} from '../../../context';
import {Product} from '../../../types';
import {SAMPLE_PRODUCTS, CATEGORIES, EMPTY_STATE_MESSAGES} from '../../../constants';

interface SearchScreenProps {
  onProductPress?: (product: Product) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({onProductPress}) => {
  const {theme} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string;
    priceRange: string;
    brand: string;
  }>({
    category: 'all',
    priceRange: 'all',
    brand: 'all',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const brands = useMemo(() => {
    const allBrands = [...new Set(SAMPLE_PRODUCTS.map(p => p.brand))];
    return allBrands.sort();
  }, []);

  const priceRanges = [
    {key: 'all', label: 'All Prices', min: 0, max: Infinity},
    {key: 'under50', label: 'Under $50', min: 0, max: 50},
    {key: '50to100', label: '$50 - $100', min: 50, max: 100},
    {key: '100to200', label: '$100 - $200', min: 100, max: 200},
    {key: 'over200', label: 'Over $200', min: 200, max: Infinity},
  ];

  const filteredProducts = useMemo(() => {
    let products = SAMPLE_PRODUCTS;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedFilters.category !== 'all') {
      products = products.filter(product => product.category === selectedFilters.category);
    }

    // Price range filter
    if (selectedFilters.priceRange !== 'all') {
      const range = priceRanges.find(r => r.key === selectedFilters.priceRange);
      if (range) {
        products = products.filter(
          product => product.price >= range.min && product.price <= range.max,
        );
      }
    }

    // Brand filter
    if (selectedFilters.brand !== 'all') {
      products = products.filter(product => product.brand === selectedFilters.brand);
    }

    return products;
  }, [searchQuery, selectedFilters]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    searchContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    clearButton: {
      padding: 4,
    },
    clearButtonText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    filtersContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    filterSection: {
      marginBottom: 16,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '500',
    },
    filterTextActive: {
      color: 'white',
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    resultsCount: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    clearFiltersButton: {
      padding: 4,
    },
    clearFiltersText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    productGrid: {
      paddingHorizontal: 8,
    },
    productCard: {
      flex: 1,
      margin: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    productImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.border,
    },
    productBrand: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    productName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    price: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    originalPrice: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    recentSearches: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    recentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    recentItem: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    recentText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: 'all',
      priceRange: 'all',
      brand: 'all',
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(filter => filter !== 'all');

  const renderFilterButton = (
    options: any[],
    selectedValue: string,
    onSelect: (value: string) => void,
    getLabel: (option: any) => string,
    getValue: (option: any) => string,
  ) => {
    return options.map(option => {
      const value = getValue(option);
      const label = getLabel(option);
      const isActive = selectedValue === value;
      
      return (
        <TouchableOpacity
          key={value}
          style={[styles.filterButton, isActive && styles.filterButtonActive]}
          onPress={() => onSelect(value)}>
          <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderProduct = ({item}: {item: Product}) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onProductPress?.(item)}
      testID={`search-product-${item.id}`}>
      <Image source={{uri: item.images[0]}} style={styles.productImage} />
      <Text style={styles.productBrand}>{item.brand}</Text>
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${item.price}</Text>
        {item.originalPrice && (
          <Text style={styles.originalPrice}>${item.originalPrice}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No results found' : 'Start searching'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery
          ? 'Try different keywords or adjust your filters'
          : 'Search for shoes by name, brand, or category'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for shoes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            testID="search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!searchQuery && recentSearches.length > 0 && (
        <View style={styles.recentSearches}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => setSearchQuery(search)}>
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Category</Text>
          <View style={styles.filterOptions}>
            {renderFilterButton(
              [{id: 'all', name: 'All'}, ...CATEGORIES],
              selectedFilters.category,
              value => setSelectedFilters(prev => ({...prev, category: value})),
              option => option.name,
              option => option.id,
            )}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Price Range</Text>
          <View style={styles.filterOptions}>
            {renderFilterButton(
              priceRanges,
              selectedFilters.priceRange,
              value => setSelectedFilters(prev => ({...prev, priceRange: value})),
              option => option.label,
              option => option.key,
            )}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Brand</Text>
          <View style={styles.filterOptions}>
            {renderFilterButton(
              [{name: 'All', key: 'all'}, ...brands.map(brand => ({name: brand, key: brand}))],
              selectedFilters.brand,
              value => setSelectedFilters(prev => ({...prev, brand: value})),
              option => option.name,
              option => option.key,
            )}
          </View>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => `search-${item.id}`}
          numColumns={2}
          style={styles.productGrid}
          showsVerticalScrollIndicator={false}
          testID="search-results"
        />
      )}
    </View>
  );
};

export default SearchScreen;