import React, { useState } from 'react';
import { View } from 'react-native';
import ProductListScreen from '../ProductListScreen';
import ProductDetailScreen from '../ProductDetailScreen';
import CartScreen from '../CartScreen';

export type ProductScreen = 'list' | 'detail' | 'cart';

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

  const navigateToCart = () => {
    console.log('🛒 [NAV] Navigating to cart');
    setCurrentScreen('cart');
  };

  const navigateBackFromCart = () => {
    console.log('🛒 [NAV] Navigating back from cart');
    setCurrentScreen('list');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'list':
        return (
          <ProductListScreen
            onProductPress={navigateToProductDetail}
            onCartPress={navigateToCart}
          />
        );
      case 'detail':
        return (
          <ProductDetailScreen
            productId={selectedProductId!}
            onBack={navigateBackToList}
            onCartPress={navigateToCart}
          />
        );
      case 'cart':
        return (
          <CartScreen onBack={navigateBackFromCart} />
        );
      default:
        return (
          <ProductListScreen
            onProductPress={navigateToProductDetail}
            onCartPress={navigateToCart}
          />
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};

export default ProductsNavigation; 