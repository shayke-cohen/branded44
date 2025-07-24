import React, { useState } from 'react';
import { View } from 'react-native';
import ProductListScreen from '../ProductListScreen';
import ProductDetailScreen from '../ProductDetailScreen';

export type ProductScreen = 'list' | 'detail';

const ProductsNavigation: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ProductScreen>('list');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();

  const navigateToProductDetail = (productId: string) => {
    console.log('🛍️ [NAV] Navigating to product detail:', productId);
    setSelectedProductId(productId);
    setCurrentScreen('detail');
  };

  const navigateBackToList = () => {
    console.log('🛍️ [NAV] Navigating back to product list');
    setCurrentScreen('list');
    setSelectedProductId(undefined);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'list':
        return (
          <ProductListScreen
            onProductPress={navigateToProductDetail}
          />
        );
      case 'detail':
        return (
          <ProductDetailScreen
            productId={selectedProductId!}
            onBack={navigateBackToList}
          />
        );
      default:
        return (
          <ProductListScreen
            onProductPress={navigateToProductDetail}
          />
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};

export default ProductsNavigation; 