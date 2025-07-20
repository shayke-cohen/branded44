import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import {useTheme} from '../../../context';
import {Product, Category} from '../../../types';
import {SAMPLE_PRODUCTS, CATEGORIES, EMPTY_STATE_MESSAGES} from '../../../constants';

interface ProductListScreenProps {
  onProductPress?: (product: Product) => void;
}

const ProductListScreen: React.FC<ProductListScreenProps> = ({
  onProductPress,
}) => {
  const {theme} = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {allProducts, showFeatured} = useMemo(() => {
    let products = SAMPLE_PRODUCTS;

    // Filter by category
    if (selectedCategory !== 'all') {
      products = products.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      );
    }

    const featuredProducts = !searchQuery 
      ? SAMPLE_PRODUCTS.filter(product => product.featured)
      : [];

    return {
      allProducts: products,
      showFeatured: featuredProducts.length > 0 && !searchQuery,
    };
  }, [selectedCategory, searchQuery]);

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
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
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
    },
    searchInput: {
      fontSize: 16,
      color: theme.colors.text,
    },
    categoriesContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    categoriesTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    categoryTextActive: {
      color: 'white',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginHorizontal: 16,
      marginBottom: 12,
      marginTop: 8,
    },
    productGrid: {
      paddingHorizontal: 8,
    },
    featuredGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      marginBottom: 16,
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
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
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
  });

  const renderCategoryButton = (category: Category | {id: string; name: string; icon: string}) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.id)}>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive,
        ]}>
        {category.icon} {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({item}: {item: Product}) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onProductPress?.(item)}
      testID={`product-${item.id}`}>
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
      <View style={styles.ratingContainer}>
        <Text>⭐</Text>
        <Text style={styles.rating}>
          {item.rating} ({item.reviewCount})
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{EMPTY_STATE_MESSAGES.NO_PRODUCTS}</Text>
      <Text style={styles.emptySubtext}>
        {EMPTY_STATE_MESSAGES.NO_PRODUCTS_SUBTITLE}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SoleStyle</Text>
        <Text style={styles.subtitle}>Find your perfect pair</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shoes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderCategoryButton({id: 'all', name: 'All', icon: '👟'})}
          {CATEGORIES.map(renderCategoryButton)}
        </ScrollView>
      </View>

      {showFeatured && (
        <>
          <Text style={styles.sectionTitle}>Featured</Text>
          <View style={styles.featuredGrid}>
            {SAMPLE_PRODUCTS.filter(product => product.featured).slice(0, 4).map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => onProductPress?.(item)}
                testID={`featured-product-${item.id}`}>
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
                <View style={styles.ratingContainer}>
                  <Text>⭐</Text>
                  <Text style={styles.rating}>
                    {item.rating} ({item.reviewCount})
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>
        {searchQuery ? 'Search Results' : selectedCategory === 'all' ? 'All Products' : 
         CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Products'}
      </Text>

      {allProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={allProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          style={styles.productGrid}
          showsVerticalScrollIndicator={false}
          testID="product-list"
        />
      )}
    </View>
  );
};

export default ProductListScreen;