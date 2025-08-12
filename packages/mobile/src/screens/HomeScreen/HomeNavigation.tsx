import React, { useState } from 'react';
import { View } from 'react-native';
import HomeScreen from './HomeScreen';
import MemberAuthScreen from '../wix/auth/MemberAuthScreen/MemberAuthScreen';
import SettingsScreen from '../SettingsScreen';
import CartScreen from '../wix/ecommerce/CartScreen/CartScreen';
import ProductsNavigation from '../wix/navigation/ProductsNavigation';
import CMSScreen from '../wix/content/CMSScreen/CMSScreen';

export type HomeScreenType = 
  | 'home' 
  | 'profile' 
  | 'settings' 
  | 'cart' 
  | 'store' 
  | 'cms';

const HomeNavigation: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<HomeScreenType>('home');

  const navigateToScreen = (screen: HomeScreenType) => {
    console.log(`📱 [NAV] Navigating to ${screen}`);
    setCurrentScreen(screen);
  };

  const navigateBackToHome = () => {
    console.log('🏠 [NAV] Navigating back to home');
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onMenuPress={(screen: string) => navigateToScreen(screen as HomeScreenType)}
          />
        );
      case 'profile':
        return (
          <MemberAuthScreen onBack={navigateBackToHome} />
        );
      case 'settings':
        return (
          <SettingsScreen onBack={navigateBackToHome} />
        );
      case 'cart':
        return (
          <CartScreen onBack={navigateBackToHome} />
        );
      case 'store':
        return (
          <ProductsNavigation />
        );
      case 'cms':
        return (
          <CMSScreen onBack={navigateBackToHome} />
        );
      default:
        return (
          <HomeScreen
            onMenuPress={(screen: string) => navigateToScreen(screen as HomeScreenType)}
          />
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};

export default HomeNavigation; 