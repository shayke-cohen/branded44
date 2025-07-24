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
  Animated,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWixCart } from '../../context/WixCartContext';
import { wixApiClient, formatPrice, safeString } from '../../utils/wixApiClient';

const { width } = Dimensions.get('window');

const CartScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    cart,
    loading,
    updateQuantity,
    removeFromCart,
    refreshCart,
    syncWithServer,
    getItemCount,
    getTotal,
    isMemberCart,
    getCartOwnerInfo,
  } = useWixCart();

  const [checkingOut, setCheckingOut] = useState(false);
  const bounceAnim = new Animated.Value(1);
  const shimmerAnim = new Animated.Value(0);

  console.log('🛒 [CART] CartScreen rendered - Items:', getItemCount(), 'Total:', getTotal());

  // Refresh cart on mount and start shimmer animation
  useEffect(() => {
    refreshCart();
    
    // Start shimmer animation for loading states
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    
    return () => shimmer.stop();
  }, [refreshCart]);

  const handleQuantityChange = useCallback(async (lineItemId: string, newQuantity: number) => {
    try {
      console.log('🛒 [DEBUG] Changing quantity:', { lineItemId, newQuantity });
      
      // Add bounce animation for quantity changes
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      await updateQuantity(lineItemId, newQuantity);
    } catch (error) {
      Alert.alert('🚨 Oops!', 'Failed to update quantity. Please try again! 🔄');
    }
  }, [updateQuantity, bounceAnim]);

  const handleRemoveItem = useCallback(async (lineItemId: string) => {
    Alert.alert(
      '🗑️ Remove Item',
      '💔 Are you sure you want to remove this item from your cart?',
      [
        { text: '❌ Cancel', style: 'cancel' },
        {
          text: '🗑️ Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🛒 [DEBUG] Removing item:', lineItemId);
              await removeFromCart([lineItemId]);
            } catch (error) {
              Alert.alert('🚨 Oops!', 'Failed to remove item. Please try again! 🔄');
            }
          },
        },
      ]
    );
  }, [removeFromCart]);

  const handleCheckout = useCallback(async () => {
    if (!cart || cart.lineItems.length === 0) {
      Alert.alert('🛒 Empty Cart', '🛍️ Please add items to your cart before checking out!');
      return;
    }

    try {
      setCheckingOut(true);
      console.log('🛒 [CART SCREEN] Starting checkout process...');
      console.log('🛒 [CART SCREEN] Cart state for checkout:', {
        cartId: cart.id,
        lineItemsCount: cart.lineItems?.length || 0,
        total: getTotal(),
        hasItems: cart.lineItems && cart.lineItems.length > 0
      });
      
      // Log each item being checked out
      if (cart.lineItems && cart.lineItems.length > 0) {
        console.log('🛒 [CART SCREEN] Items being checked out:');
        cart.lineItems.forEach((item, index) => {
          console.log(`🛒 [CART SCREEN] Item ${index + 1}:`, {
            id: item.id,
            name: item.productName?.original || 'Unknown',
            quantity: item.quantity,
            price: `${item.price.amount} ${item.price.currency}`
          });
        });
      }

      const { checkoutUrl } = await wixApiClient.createCheckout(cart.id);
      
      console.log('✅ [DEBUG] Checkout URL created:', checkoutUrl);

      // Open checkout in browser
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('🚨 Error', '💻 Unable to open checkout. Please try again!');
      }
    } catch (error) {
      console.error('❌ [ERROR] Checkout failed:', error);
      
      // Check if this is the demo product checkout error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('cannot create checkout without lineItems')) {
        Alert.alert(
          '🛍️ Demo Product Limitation',
          '⚠️ Cannot checkout with demo/template products.\n\n' +
          '✅ To test checkout:\n' +
          '1. Go to manage.wix.com\n' +
          '2. Create a real product\n' +
          '3. Add that product to cart\n' +
          '4. Try checkout again',
          [{ text: '👍 Got it!' }]
        );
      } else {
        Alert.alert(
          '🚨 Checkout Error',
          '💳 Failed to start checkout process. Please try again! 🔄',
          [{ text: '👍 OK' }]
        );
      }
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
      <Animated.View 
        key={item.id} 
        style={[
          styles.cartItem, 
          { 
            backgroundColor: theme.colors.surface,
            transform: [{ scale: bounceAnim }]
          }
        ]}
      >
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
            🛍️ {productName}
          </Text>
          <Text style={[styles.itemPrice, { color: '#FF6B6B' }]}>
            💰 {price} each
          </Text>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, styles.decreaseButton]}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={loading}
          >
            <Text style={styles.quantityButtonText}>➖</Text>
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <Text style={[styles.quantityText, { color: theme.colors.text }]}>
              {item.quantity}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.quantityButton, styles.increaseButton]}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
            disabled={loading}
          >
            <Text style={styles.quantityButtonText}>➕</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
          disabled={loading}
        >
          <Text style={styles.removeButtonText}>🗑️</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [theme, loading, handleQuantityChange, handleRemoveItem, bounceAnim]);

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
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Shopping Cart
            </Text>
            <Text style={[styles.itemCountText, { color: theme.colors.textSecondary }]}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          
          <View style={styles.headerButtons}>
            {/* Debug Member Auth Button */}
            <TouchableOpacity
              style={[styles.debugButton, { backgroundColor: '#FFA500' }]}
              onPress={() => {
                console.log('🔍 [MANUAL DEBUG] User triggered member auth analysis...');
                import('../../utils/wixApiClient').then(({ debugMemberAuth }) => {
                  debugMemberAuth();
                });
              }}
              disabled={loading}
            >
              <Text style={styles.syncButtonText}>🔍</Text>
              <Text style={styles.syncButtonLabel}>Debug</Text>
            </TouchableOpacity>
            
            {/* Sync with Server Button */}
            <TouchableOpacity
              style={[styles.syncButton, { backgroundColor: theme.colors.primary }]}
              onPress={syncWithServer}
              disabled={loading}
            >
              <Text style={styles.syncButtonText}>
                {loading ? '🔄' : '📡'}
              </Text>
              <Text style={styles.syncButtonLabel}>Sync</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Items or Empty State */}
        {!cart || cart.lineItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyMainTitle}>Your cart is empty</Text>
            <Text style={styles.emptyMainDescription}>
              Add some products to get started
            </Text>

            {/* Cart owner information */}
            <View style={styles.cartOwnerInfo}>
              <Text style={styles.cartOwnerTitle}>
                🛒 Cart Status: {isMemberCart() ? 'Member Cart' : 'Visitor Cart'}
              </Text>
              {isMemberCart() ? (
                <Text style={styles.cartOwnerText}>
                  ✅ Your cart is saved to your member account ({getCartOwnerInfo().memberEmail})
                </Text>
              ) : (
                <Text style={styles.cartOwnerText}>
                  ⚠️ This is a temporary visitor cart. Log in to save your cart permanently!
                </Text>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  boldText: {
    fontWeight: 'bold',
  },
  // Cart owner styles
  cartOwnerInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cartOwnerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  cartOwnerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Missing button styles  
  decreaseButton: {
    backgroundColor: '#dc3545',
  },
  increaseButton: {
    backgroundColor: '#28a745',
  },
  quantityDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  // Header and sync button styles
  headerLeft: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  debugButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 8,
    padding: 8,
  },
  syncButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 8,
    padding: 8,
  },
  syncButtonText: {
    fontSize: 16,
    marginBottom: 2,
  },
  syncButtonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CartScreen;

console.log('🛒 [DEBUG] CartScreen component loaded'); 