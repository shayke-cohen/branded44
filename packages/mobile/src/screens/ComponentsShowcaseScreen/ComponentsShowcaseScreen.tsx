import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useTheme } from '../../context';
import { SPACING } from '../../lib/constants';
import { 
  LoginForm, SignupForm, ForgotPasswordForm, OTPVerificationForm, ProfileCard, SocialLoginButtons, ContactForm, SearchForm,
  UserList, ProductGrid,
  ProductCard, CartItem,
  type UserListItem, type Product, type ProductCardData, type CartItemData,
  type ContactFormData, type SearchFormData
} from '../../components/blocks';
import { type User } from '../../lib/types';
import { ShopScreen, CartScreen } from '../../components/templates/ecommerce';

export interface ComponentsShowcaseScreenProps {
  onBack?: () => void;
}

type ShowcaseMode = 'blocks' | 'templates' | 'auth' | 'forms' | 'lists' | 'ecommerce' | 'shop' | 'cart';

/**
 * ComponentsShowcaseScreen - Comprehensive component library showcase
 */
const ComponentsShowcaseScreen: React.FC<ComponentsShowcaseScreenProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [activeMode, setActiveMode] = useState<ShowcaseMode>('blocks');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstrations
  const mockUsers: UserListItem[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'online',
      lastSeen: '2 min ago',
      mutual: 5,
      stats: { postsCount: 42, followersCount: 1205, followingCount: 892 }
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      status: 'away',
      lastSeen: '1 hour ago',
      mutual: 12,
      stats: { postsCount: 87, followersCount: 3401, followingCount: 445 }
    },
    {
      id: '3',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      status: 'offline',
      lastSeen: '1 day ago',
      mutual: 3,
      stats: { postsCount: 23, followersCount: 567, followingCount: 234 }
    }
  ];

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      originalPrice: 249.99,
      currency: '$',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
      category: 'Electronics',
      brand: 'TechPro',
      rating: 4.5,
      reviewCount: 1247,
      inStock: true,
      stockCount: 15,
      tags: ['wireless', 'headphones', 'noise-cancellation'],
      isWishlisted: false,
      discount: 20
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      description: 'Track your fitness goals with this advanced smartwatch',
      price: 299.99,
      currency: '$',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'],
      category: 'Electronics',
      brand: 'FitTech',
      rating: 4.2,
      reviewCount: 892,
      inStock: true,
      stockCount: 8,
      tags: ['smartwatch', 'fitness', 'health'],
      isWishlisted: true
    },
    {
      id: '3',
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt',
      price: 29.99,
      currency: '$',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'],
      category: 'Clothing',
      brand: 'EcoWear',
      rating: 4.8,
      reviewCount: 356,
      inStock: true,
      stockCount: 23,
      tags: ['organic', 'cotton', 'sustainable'],
      isWishlisted: false
    }
  ];

  const mockCartItems: CartItemData[] = [
    {
      id: '1',
      productId: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones',
      price: 199.99,
      originalPrice: 249.99,
      quantity: 1,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      brand: 'TechPro',
      variant: { color: 'Black', size: 'Standard' },
      inStock: true,
      stockCount: 15
    },
    {
      id: '2',
      productId: '2',
      name: 'Smart Fitness Watch',
      price: 299.99,
      quantity: 1,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      brand: 'FitTech',
      variant: { color: 'Silver', size: '42mm' },
      inStock: true,
      stockCount: 8
    }
  ];

  // Demo handlers
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Login Success', `Welcome back, ${email}!`);
  };

  const handleSignup = async (data: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    Alert.alert('Signup Success', `Account created for ${data.email}!`);
  };

  const handlePasswordReset = async (email: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Reset Link Sent', `Password reset link sent to ${email}`);
  };

  const handleOTPVerification = async (otp: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Success', `OTP ${otp} verified successfully!`);
  };

  const handleResendOTP = async () => {
    Alert.alert('Info', 'New OTP sent to +1 (555) 123-4567');
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Message Sent', `Thank you ${data.firstName}, we'll get back to you soon!`);
  };

  const handleSearch = (data: SearchFormData) => {
    Alert.alert('Search Performed', `Query: ${data.query || 'All items'}\nFilters: ${Object.keys(data.filters || {}).length}`);
  };

  const handleUserSelect = (user: UserListItem) => {
    Alert.alert('User Selected', `Selected: ${user.firstName} ${user.lastName}`);
  };

  const handleAddToCart = async (product: Product) => {
    Alert.alert('Added to Cart', `${product.name} added to cart!`);
  };

  const handleToggleWishlist = async (product: Product) => {
    Alert.alert('Wishlist Updated', `${product.name} ${product.isWishlisted ? 'removed from' : 'added to'} wishlist!`);
  };

  const userActions = [
    { id: 'message', label: 'Message', icon: '💬', onPress: (user: UserListItem) => Alert.alert('Message', `Send message to ${user.firstName}`) },
    { id: 'follow', label: 'Follow', icon: '👥', onPress: (user: UserListItem) => Alert.alert('Follow', `Following ${user.firstName}`) }
  ];

  const demoModes = [
    { id: 'blocks', label: 'All Blocks', icon: '🧱', description: 'Overview of all block components' },
    { id: 'auth', label: 'Auth Blocks', icon: '🔐', description: 'Authentication components' },
    { id: 'forms', label: 'Form Blocks', icon: '📝', description: 'Form and input components' },
    { id: 'lists', label: 'List Blocks', icon: '📋', description: 'Data display components' },
    { id: 'ecommerce', label: 'E-commerce', icon: '🛒', description: 'Shopping components' },
    { id: 'templates', label: 'Templates', icon: '📱', description: 'Full screen templates' },
    { id: 'shop', label: 'Shop Demo', icon: '🏪', description: 'Complete shop experience' },
    { id: 'cart', label: 'Cart Demo', icon: '🛍️', description: 'Shopping cart experience' }
  ];

  const renderDemoComponent = () => {
    switch (activeMode) {
      case 'blocks':
        return (
          <View style={styles.blocksGrid}>
            <Text style={styles.sectionTitle}>🚀 Our Component Library</Text>
            <Text style={styles.sectionDescription}>
              15+ production-ready components across 4 major categories
            </Text>
            
            <View style={styles.categoryGrid}>
              {demoModes.slice(1, 6).map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={styles.categoryCard}
                  onPress={() => setActiveMode(mode.id as ShowcaseMode)}
                >
                  <Text style={styles.categoryIcon}>{mode.icon}</Text>
                  <Text style={styles.categoryLabel}>{mode.label}</Text>
                  <Text style={styles.categoryDescription}>{mode.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>15+</Text>
                <Text style={styles.statLabel}>Components</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>TypeScript</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>∞</Text>
                <Text style={styles.statLabel}>Possibilities</Text>
              </View>
            </View>
          </View>
        );

      case 'auth':
        return (
          <View style={styles.componentContainer}>
            <LoginForm
              onLogin={handleLogin}
              socialLogin={true}
              loading={loading}
              title="Welcome Back"
              subtitle="Sign in to continue your journey"
            />
            
            <SignupForm
              onSignup={handleSignup}
              socialSignup={true}
              loading={loading}
              title="Create Your Account"
              subtitle="Join us and start your journey today"
              style={{ marginTop: 20 }}
            />
            
            <ForgotPasswordForm
              onResetRequest={handlePasswordReset}
              loading={loading}
              title="Reset Password"
              description="Enter your email and we'll send you a recovery link"
              style={{ marginTop: 20 }}
            />
            
            <OTPVerificationForm
              onVerify={handleOTPVerification}
              onResendOTP={handleResendOTP}
              contactInfo="+1 (555) 123-4567"
              verificationType="phone"
              title="Verify Your Phone Number"
              loading={loading}
              length={6}
              autoSubmit={true}
              style={{ marginTop: 20 }}
            />
            
            <ProfileCard
              user={{
                id: "demo-user-1",
                email: "john.doe@example.com",
                firstName: "John",
                lastName: "Doe",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                isVerified: true,
                isActive: true,
                role: "user",
                preferences: {
                  theme: "light",
                  notifications: true,
                  language: "en"
                }
              }}
              style={{ marginTop: 20 }}
            />
            
            <SocialLoginButtons
              onGoogleLogin={() => Alert.alert('Google Login')}
              onAppleLogin={() => Alert.alert('Apple Login')}
              onFacebookLogin={() => Alert.alert('Facebook Login')}
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>
        );

      case 'forms':
        return (
          <View style={styles.componentContainer}>
            <ContactForm
              onSubmit={handleContactSubmit}
              loading={loading}
              showPhone={true}
              showCompany={true}
            />
          </View>
        );

      case 'lists':
        return (
          <View style={styles.componentContainer}>
            <UserList
              users={mockUsers}
              onUserSelect={handleUserSelect}
              actions={userActions}
              showSearch={true}
              layout="list"
              allowLayoutSwitch={true}
              showStats={true}
            />
          </View>
        );

      case 'ecommerce':
        return (
          <View style={styles.componentContainer}>
            <ProductGrid
              products={mockProducts}
              onProductSelect={(product) => Alert.alert('Product', product.name)}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              numColumns={1}
              showWishlist={true}
              showAddToCart={true}
              showRating={true}
              cardStyle="detailed"
            />
          </View>
        );

      case 'shop':
        return (
          <ShopScreen
            products={mockProducts}
            onProductSelect={(product) => Alert.alert('Product Selected', product.name)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onSearch={handleSearch}
            config={{
              title: "Demo Store",
              showSearch: true,
              showCategories: true,
              gridColumns: 2
            }}
            loading={loading}
          />
        );

      case 'cart':
        return (
          <CartScreen
            cartItems={mockCartItems}
            onQuantityChange={async (id, qty) => Alert.alert('Quantity Updated', `Item ${id}: ${qty}`)}
            onRemoveItem={async (id) => Alert.alert('Item Removed', `Removed item ${id}`)}
            onCheckout={(items, summary) => Alert.alert('Checkout', `Total: ${summary.currency}${summary.total.toFixed(2)}`)}
            onContinueShopping={() => setActiveMode('shop')}
            onItemPress={(item) => Alert.alert('Item Details', item.name)}
            taxRate={0.08}
            shippingCost={5.99}
            freeShippingThreshold={50}
          />
        );

      default:
        return (
          <View style={styles.componentContainer}>
            <Text style={styles.componentTitle}>Select a component category above</Text>
          </View>
        );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    tabContainer: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabScroll: {
      paddingHorizontal: 16,
    },
    tabsRow: {
      flexDirection: 'row',
      paddingVertical: 12,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    activeTabText: {
      color: '#ffffff',
    },
    content: {
      flex: 1,
    },
    blocksGrid: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    categoryCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    categoryLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    categoryDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    componentContainer: {
      flex: 1,
      padding: 16,
    },
    componentTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎨 Component Showcase</Text>
        <Text style={styles.headerSubtitle}>
          Explore our comprehensive AI-optimized React Native component library
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <View style={styles.tabsRow}>
            {demoModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.tab, activeMode === mode.id && styles.activeTab]}
                onPress={() => setActiveMode(mode.id as ShowcaseMode)}
              >
                <Text style={[styles.tabText, activeMode === mode.id && styles.activeTabText]}>
                  {mode.icon} {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDemoComponent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComponentsShowcaseScreen; 