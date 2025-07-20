import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useTheme, useCart} from '../../../context';
import {CartItem} from '../../../types';
import {EMPTY_STATE_MESSAGES, VALIDATION_MESSAGES} from '../../../constants';

interface CartScreenProps {
  onCheckout?: () => void;
  onProductPress?: (productId: string) => void;
}

const CartScreen: React.FC<CartScreenProps> = ({onCheckout, onProductPress}) => {
  const {theme} = useTheme();
  const {cart, updateQuantity, removeFromCart, clearCart} = useCart();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    itemCount: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    clearButton: {
      alignSelf: 'flex-end',
      marginTop: 8,
    },
    clearButtonText: {
      fontSize: 14,
      color: theme.colors.error,
      fontWeight: '500',
    },
    listContainer: {
      flex: 1,
      paddingTop: 16,
    },
    cartItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    itemDetails: {
      flex: 1,
      justifyContent: 'space-between',
    },
    productInfo: {
      flex: 1,
    },
    productBrand: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    productOptions: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    quantityButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    quantityText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginHorizontal: 16,
      minWidth: 20,
      textAlign: 'center',
    },
    removeButton: {
      padding: 8,
    },
    removeButtonText: {
      fontSize: 14,
      color: theme.colors.error,
      fontWeight: '500',
    },
    summaryContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginBottom: 16,
    },
    totalLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    checkoutButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    checkoutButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    checkoutButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: 'white',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  const handleQuantityDecrease = (item: CartItem) => {
    const newQuantity = item.quantity - 1;
    if (newQuantity <= 0) {
      handleRemoveItem(item);
    } else {
      updateQuantity(item.product.id, item.size, item.color, newQuantity);
    }
  };

  const handleQuantityIncrease = (item: CartItem) => {
    updateQuantity(item.product.id, item.size, item.color, item.quantity + 1);
  };

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromCart(item.product.id, item.size, item.color);
            Alert.alert('Removed', VALIDATION_MESSAGES.CART_REMOVE_SUCCESS);
          },
        },
      ],
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ],
    );
  };

  const renderCartItem = ({item}: {item: CartItem}) => (
    <TouchableOpacity
      style={styles.cartItem}
      onPress={() => onProductPress?.(item.product.id)}
      testID={`cart-item-${item.product.id}`}>
      <Image source={{uri: item.product.images[0]}} style={styles.productImage} />
      
      <View style={styles.itemDetails}>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.product.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.productOptions}>
            Size: {item.size} • Color: {item.color}
          </Text>
          <Text style={styles.productPrice}>
            ${item.product.price * item.quantity}
          </Text>
        </View>
        
        <View style={styles.quantityContainer}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() => handleQuantityDecrease(item)}
              testID={`decrease-${item.product.id}`}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityIncrease(item)}
              testID={`increase-${item.product.id}`}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item)}
            testID={`remove-${item.product.id}`}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyText}>{EMPTY_STATE_MESSAGES.EMPTY_CART}</Text>
      <Text style={styles.emptySubtext}>
        {EMPTY_STATE_MESSAGES.EMPTY_CART_SUBTITLE}
      </Text>
    </View>
  );

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Cart</Text>
          <Text style={styles.itemCount}>0 items</Text>
        </View>
        {renderEmptyCart()}
      </View>
    );
  }

  const subtotal = cart.total;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{cart.itemCount} items</Text>
        {cart.items.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item, index) => `${item.product.id}-${item.size}-${item.color}-${index}`}
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        testID="cart-list"
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Shipping {subtotal > 100 && '(Free over $100)'}
          </Text>
          <Text style={styles.summaryValue}>
            ${shipping === 0 ? '0.00' : shipping.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            cart.items.length === 0 && styles.checkoutButtonDisabled,
          ]}
          onPress={onCheckout}
          disabled={cart.items.length === 0}
          testID="checkout-button">
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;