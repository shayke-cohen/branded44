// Product related types
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit' | 'debit' | 'paypal';
  last4?: string;
  expiryDate?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

// Theme related types
export interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    tabBarBackground: string;
    tabBarActive: string;
    tabBarInactive: string;
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

// Navigation related types
export interface Tab {
  key: string;
  label: string;
  icon: string;
}

export interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  cartItemCount?: number; // Optional for template compatibility
}

// Theme option type for settings
export interface ThemeOption {
  key: ThemeMode;
  label: string;
  description: string;
}