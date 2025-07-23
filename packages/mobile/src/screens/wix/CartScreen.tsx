import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWixCart } from '../../context/WixCartContext';
import { wixApiClient, formatPrice, safeString } from '../../utils/wixApiClient';
import { registerScreen } from '../../config/registry';

const { width } = Dimensions.get('window');

const CartScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    cart,
    loading,
    updateQuantity,
    removeFromCart,
    refreshCart,
    getItemCount,
    getTotal,
  } = useWixCart();

  const [checkingOut, setCheckingOut] = useState(false);

  console.log('🛒 [CART] CartScreen rendered - Items:', getItemCount(), 'Total:', getTotal());

  // Refresh cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleQuantityChange = useCallback(async (lineItemId: string, newQuantity: number) => {
    try {
      console.log('🛒 [DEBUG] Changing quantity:', { lineItemId, newQuantity });
      await updateQuantity(lineItemId, newQuantity);
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    }
  }, [updateQuantity]);

  const handleRemoveItem = useCallback(async (lineItemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🛒 [DEBUG] Removing item:', lineItemId);
              await removeFromCart([lineItemId]);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            }
          },
        },
      ]
    );
  }, [removeFromCart]);

  const handleCheckout = useCallback(async () => {
    if (!cart || cart.lineItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }

    try {
      setCheckingOut(true);
      console.log('🛒 [DEBUG] Starting checkout process...');

      const { checkoutUrl } = await wixApiClient.createCheckout(cart.id);
      
      console.log('✅ [DEBUG] Checkout URL created:', checkoutUrl);

      // Open checkout in browser
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('Error', 'Unable to open checkout. Please try again.');
      }
    } catch (error) {
      console.error('❌ [ERROR] Checkout failed:', error);
      Alert.alert(
        'Checkout Error',
        'Failed to start checkout process. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCheckingOut(false);
    }
  }, [cart]);

  const renderCartItem = useCallback((item: any) => {
    const productName = safeString(item.productName?.original || 'Unknown Product');
    const price = formatPrice({
      currency: item.price.currency,
      price: item.price.amount,
    });

    return (
      <View key={item.id} style={[styles.cartItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
            {productName}
          </Text>
          <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
            {price} each
          </Text>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.border }]}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={loading}
          >
            <Text style={[styles.quantityButtonText, { color: theme.colors.text }]}>-</Text>
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: theme.colors.text }]}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.border }]}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
            disabled={loading}
          >
            <Text style={[styles.quantityButtonText, { color: theme.colors.text }]}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
          disabled={loading}
        >
          <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  }, [theme, loading, handleQuantityChange, handleRemoveItem]);

  if (loading && !cart) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading cart...
        </Text>
      </View>
    );
  }

  const itemCount = getItemCount();
  const totalPrice = getTotal();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Shopping Cart
          </Text>
          <Text style={[styles.itemCountText, { color: theme.colors.textSecondary }]}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Cart Items or Empty State */}
        {!cart || cart.lineItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyMainTitle}>Your cart is empty</Text>
            <Text style={styles.emptyMainDescription}>
              Add some products to get started
            </Text>
            
            {/* Demo product limitation notice */}
            <View style={styles.demoNotice}>
              <Text style={styles.demoTitle}>⚠️ Demo Product Limitation</Text>
              <Text style={styles.demoText}>
                The current products are Wix demo/template products. To test full cart functionality:
              </Text>
              <Text style={styles.demoInstructions}>
                1. Go to your Wix dashboard (manage.wix.com){'\n'}
                2. Click Products → + New Product{'\n'}
                3. Create a real product with your own details{'\n'}
                4. Test adding that product to cart
              </Text>
            </View>

            {/* Simple instruction instead of navigation button */}
            <View style={styles.navigationHint}>
              <Text style={styles.navigationHintText}>
                💡 Tap the <Text style={styles.boldText}>Products</Text> tab below to browse products
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
              {cart.lineItems.map(renderCartItem)}
            </ScrollView>

            {/* Cart Summary */}
            <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {totalPrice}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: checkingOut ? 0.7 : 1,
                  }
                ]}
                onPress={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.checkoutButtonText, { color: '#FFFFFF' }]}>
                    Proceed to Checkout
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.checkoutNote, { color: theme.colors.textSecondary }]}>
                You'll be redirected to complete your purchase
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemCountText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Updated empty state styles with unique names
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyMainTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMainDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  demoNotice: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  demoInstructions: {
    fontSize: 12,
    textAlign: 'left',
    fontStyle: 'italic',
    color: '#666',
  },
  startShoppingButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  startShoppingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navigationHint: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b2ebf2',
  },
  navigationHintText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#00796b',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

// Self-register this screen
registerScreen(CartScreen, {
  name: 'Cart',
  icon: '🛒',
  category: 'Store',
  hasTab: true,
  tabPosition: 4,
  description: 'View and manage shopping cart items',
  tags: ['store', 'cart', 'checkout', 'wix']
});

export default CartScreen;

console.log('🛒 [DEBUG] CartScreen component loaded'); 