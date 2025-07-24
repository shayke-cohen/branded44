import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';

// Web window type declaration
declare global {
  interface Window {
    open(url: string, target: string): Window | null;
  }
}
import { Alert } from '../../utils/alert';
import { useTheme } from '../../context/ThemeContext';
import { useWixCart } from '../../context/WixCartContext';
import { wixApiClient, formatPrice, safeString } from '../../utils/wixApiClient';

import { CheckoutWebView } from '../../components';

const { width } = Dimensions.get('window');

interface CartScreenProps {
  onBack?: () => void; // Optional back navigation callback
}

const CartScreen: React.FC<CartScreenProps> = ({ onBack }) => {
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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const bounceAnim = new Animated.Value(1);
  const shimmerAnim = new Animated.Value(0);

  console.log('🛒 [CART] CartScreen rendered - Items:', getItemCount(), 'Total:', getTotal());
  console.log('🛒 [CART] Cart object changed:', {
    cartId: cart?.id,
    itemsLength: cart?.lineItems?.length,
    wixTotal: cart?.totals?.total,
    loading
  });

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

  // Track cart changes for debugging
  useEffect(() => {
    console.log('🛒 [CART EFFECT] Cart state changed:', {
      cartId: cart?.id,
      itemCount: getItemCount(),
      total: getTotal(),
      wixTotal: cart?.totals?.total,
      lineItemsCount: cart?.lineItems?.length || 0
    });
  }, [cart, getItemCount, getTotal]);

  const handleQuantityChange = useCallback(async (lineItemId: string, newQuantity: number) => {
    try {
      console.log('🛒 [CART SCREEN] Button clicked - Changing quantity:', { 
        lineItemId, 
        currentQuantity: cart?.lineItems?.find(item => item.id === lineItemId)?.quantity,
        newQuantity,
        cartId: cart?.id 
      });
      
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
      
      console.log('🛒 [CART SCREEN] Calling updateQuantity...');
      await updateQuantity(lineItemId, newQuantity);
      console.log('🛒 [CART SCREEN] updateQuantity completed');
    } catch (error) {
      console.error('🛒 [CART SCREEN] Error updating quantity:', error instanceof Error ? error.message : String(error));
      Alert.alert('🚨 Oops!', 'Failed to update quantity. Please try again! 🔄');
    }
  }, [updateQuantity, bounceAnim, cart]);

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
              console.error('🛒 [CART SCREEN] Error removing item:', error instanceof Error ? error.message : String(error));
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

      const { checkoutUrl: url } = await wixApiClient.createCheckout(cart.id);
      
      console.log('✅ [DEBUG] Checkout URL created:', url);

      // Open checkout in WebView modal
      setCheckoutUrl(url);
      setShowCheckoutModal(true);
    } catch (error) {
      console.error('❌ [ERROR] Checkout failed:', error instanceof Error ? error.message : String(error));
      
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
  
  // Debug cart state
  console.log('🛒 [CART SCREEN] Current cart state:', {
    cartExists: !!cart,
    cartId: cart?.id,
    lineItemsCount: cart?.lineItems?.length || 0,
    lineItems: cart?.lineItems?.map(item => ({
      id: item.id,
      name: item.productName?.original,
      quantity: item.quantity,
      price: item.price?.amount
    })) || [],
    itemCount,
    totalPrice,
    wixCalculatedTotal: cart?.totals?.total,
    loading
  });

  return (
    <SafeAreaView style={[
      { flex: 1, backgroundColor: theme.colors.background },
      Platform.OS === 'web' && { position: 'relative' }
    ]}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
            </TouchableOpacity>
          )}
          <View style={[styles.headerContent, { flex: onBack ? 1 : 0, alignItems: onBack ? 'center' : 'flex-start' }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Shopping Cart
            </Text>
            <Text style={[styles.itemCountText, { color: theme.colors.textSecondary }]}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
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
                {Platform.OS === 'web' ? 'Secure web checkout interface' : 'Secure checkout within the app'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Checkout Modal - Platform Aware */}
      {Platform.OS === 'web' ? (
        // Web: Use iframe-based checkout interface positioned within the mobile frame
        showCheckoutModal && checkoutUrl && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}>
                        {/* Web Checkout Header - Compact for Mobile Frame */}
            <div style={{
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 15px',
              borderBottom: '1px solid #e1e5e9',
              minHeight: '50px',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                margin: 0,
              }}>
                🛒 Checkout
              </h3>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    backgroundColor: '#f8f9fa',
                    color: '#495057',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && (globalThis as any).window) {
                      (globalThis as any).window.open(checkoutUrl, '_blank');
                    }
                    setShowCheckoutModal(false);
                    setCheckoutUrl('');
                  }}
                >
                  🔗 New Tab
                </button>
                
                <button
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #dc3545',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCheckoutUrl('');
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Web Checkout Content */}
            <div style={{ flex: 1, backgroundColor: '#fff' }}>
              <iframe
                src={checkoutUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Secure Checkout"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                allow="payment; encrypted-media"
              />
            </div>
          </div>
        )
      ) : (
        // React Native: Use WebView Modal
        <Modal
          visible={showCheckoutModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowCheckoutModal(false)}
        >
          {checkoutUrl && CheckoutWebView ? (
            <CheckoutWebView
              checkoutUrl={checkoutUrl}
              onClose={() => {
                setShowCheckoutModal(false);
                setCheckoutUrl('');
              }}
              onSuccess={() => {
                // Refresh cart after successful checkout
                refreshCart();
                setShowCheckoutModal(false);
                setCheckoutUrl('');
                Alert.alert(
                  '🎉 Success!', 
                  'Your order has been placed! Check your email for confirmation.',
                  [{ text: 'Continue Shopping', onPress: () => {} }]
                );
              }}
              onError={(error: string) => {
                console.error('❌ [CHECKOUT MODAL] Error:', error);
                setShowCheckoutModal(false);
                setCheckoutUrl('');
                Alert.alert(
                  '⚠️ Checkout Error',
                  'There was an issue with the checkout process. Please try again.',
                  [{ text: 'OK', onPress: () => {} }]
                );
              }}
            />
          ) : checkoutUrl && !CheckoutWebView ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginBottom: 20 }}>
                WebView not available
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#007bff',
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
                onPress={() => {
                  // For React Native, we could use Linking to open external browser
                  if (Platform.OS !== 'web' && typeof require !== 'undefined') {
                    const Linking = require('react-native').Linking;
                    Linking.openURL(checkoutUrl);
                  }
                  setShowCheckoutModal(false);
                  setCheckoutUrl('');
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>
                  Open in Browser
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#6c757d',
                  padding: 15,
                  borderRadius: 8,
                }}
                onPress={() => {
                  setShowCheckoutModal(false);
                  setCheckoutUrl('');
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Modal>
      )}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  // Header styles
  headerContent: {
    alignItems: 'center',
  },
});

export default CartScreen;

console.log('🛒 [DEBUG] CartScreen component loaded'); 