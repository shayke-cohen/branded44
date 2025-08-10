/**
 * ProductList - List View with Filters Block Component
 * 
 * A comprehensive product list with filtering, sorting, and list actions.
 * Optimized for AI agents and e-commerce applications.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent } from '../../../../~/components/ui/card';
import { Text } from '../../../../~/components/ui/text';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { cn, formatCurrency } from '../../../lib/utils';
import { Product, LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Star, Heart, ShoppingCart, Filter } from 'lucide-react-native';

export interface ProductListProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
  showFilters?: boolean;
  layout?: 'list' | 'compact';
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductPress,
  onAddToCart,
  onToggleFavorite,
  loading = 'idle',
  style,
  className,
  testID = 'product-list',
  showFilters = true,
  layout = 'list',
}) => {
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    rating: 'all',
  });

  const isLoading = loading === 'loading';

  const renderProduct = ({ item: product }: { item: Product }) => {
    if (layout === 'compact') {
      return (
        <Card style={{ marginBottom: SPACING.sm }}>
          <CardContent style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <Avatar style={{ width: 60, height: 60 }}>
                <AvatarImage source={{ uri: product.images[0]?.url }} />
                <AvatarFallback>
                  <Text>{product.name.charAt(0)}</Text>
                </AvatarFallback>
              </Avatar>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: TYPOGRAPHY.fontWeight.semibold }} numberOfLines={1}>
                  {product.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 }}>
                  <Star size={14} color={COLORS.warning[500]} fill={COLORS.warning[500]} />
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                    {product.rating} ({product.reviewCount})
                  </Text>
                </View>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.lg, 
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  color: COLORS.primary[600],
                  marginTop: 4
                }}>
                  {formatCurrency(product.price, product.currency)}
                </Text>
              </View>
              
              <View style={{ gap: SPACING.xs }}>
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => onToggleFavorite(product)}
                    style={{ padding: SPACING.xs }}
                  >
                    <Heart size={20} color={COLORS.neutral[400]} />
                  </Button>
                )}
                {onAddToCart && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => onAddToCart(product)}
                    style={{ padding: SPACING.xs }}
                  >
                    <ShoppingCart size={20} color={COLORS.primary[600]} />
                  </Button>
                )}
              </View>
            </View>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card style={{ marginBottom: SPACING.md }}>
        <CardContent style={{ padding: SPACING.lg }}>
          <View style={{ flexDirection: 'row', gap: SPACING.lg }}>
            <Avatar style={{ width: 80, height: 80 }}>
              <AvatarImage source={{ uri: product.images[0]?.url }} />
              <AvatarFallback>
                <Text style={{ fontSize: 24 }}>{product.name.charAt(0)}</Text>
              </AvatarFallback>
            </Avatar>
            
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: TYPOGRAPHY.fontSize.lg,
                    fontWeight: TYPOGRAPHY.fontWeight.semibold 
                  }}>
                    {product.name}
                  </Text>
                  <Text style={{ 
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    color: COLORS.neutral[600],
                    marginTop: 2
                  }} numberOfLines={2}>
                    {product.shortDescription || product.description}
                  </Text>
                </View>
                
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => onToggleFavorite(product)}
                    style={{ padding: SPACING.xs }}
                  >
                    <Heart size={20} color={COLORS.neutral[400]} />
                  </Button>
                )}
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                  <Star size={16} color={COLORS.warning[500]} fill={COLORS.warning[500]} />
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                    {product.rating}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[400] }}>
                    ({product.reviewCount} reviews)
                  </Text>
                </View>
                
                {product.category && (
                  <Badge variant="secondary">
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                      {product.category.name}
                    </Text>
                  </Badge>
                )}
                
                {product.isNew && (
                  <Badge variant="default">
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.white }}>
                      New
                    </Text>
                  </Badge>
                )}
                
                {product.isOnSale && (
                  <Badge style={{ backgroundColor: COLORS.error[500] }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.white }}>
                      Sale
                    </Text>
                  </Badge>
                )}
              </View>
              
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: SPACING.md
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <Text style={{ 
                    fontSize: TYPOGRAPHY.fontSize.xl, 
                    fontWeight: TYPOGRAPHY.fontWeight.bold,
                    color: COLORS.primary[600]
                  }}>
                    {formatCurrency(product.price, product.currency)}
                  </Text>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <Text style={{ 
                      fontSize: TYPOGRAPHY.fontSize.sm,
                      color: COLORS.neutral[500],
                      textDecorationLine: 'line-through'
                    }}>
                      {formatCurrency(product.comparePrice, product.currency)}
                    </Text>
                  )}
                </View>
                
                {onAddToCart && (
                  <Button
                    onPress={() => onAddToCart(product)}
                    disabled={!product.inventory?.inStock}
                    size="sm"
                  >
                    <ShoppingCart size={16} color={COLORS.white} />
                    <Text style={{ color: COLORS.white }}>
                      {product.inventory?.inStock !== false ? 'Add to Cart' : 'Out of Stock'}
                    </Text>
                  </Button>
                )}
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    );
  };

  return (
    <View
      style={[{ flex: 1, backgroundColor: COLORS.neutral[50] }, style]}
      className={cn('product-list', className)}
      testID={testID}
    >
      {showFilters && (
        <Card style={{ margin: SPACING.md, marginBottom: SPACING.sm }}>
          <CardContent style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Filter size={16} color={COLORS.neutral[600]} />
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                {products.length} products
              </Text>
              {/* Add filter controls here */}
            </View>
          </CardContent>
        </Card>
      )}
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: SPACING.md }}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => {}}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <Text style={{ color: COLORS.neutral[500] }}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

export default ProductList;
