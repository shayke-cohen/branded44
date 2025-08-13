import React, { useState } from 'react';
import { View } from 'react-native';
import ProductListScreen from '../ecommerce/ProductListScreen/ProductListScreen';
import ProductDetailScreen from '../ecommerce/ProductDetailScreen/ProductDetailScreen';
import CartScreen from '../ecommerce/CartScreen/CartScreen';
import type { WixProduct } from '../../../utils/wixApiClient';

export type ProductScreen = 'list' | 'detail' | 'cart';

const ProductsNavigation: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ProductScreen>('list');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();

  const navigateToProductDetail = (product: WixProduct) => {
    console.log('🛍️ [NAV] Navigating to product detail:', product);
    setSelectedProductId(product.id);
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