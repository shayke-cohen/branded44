import {Tab, ThemeOption, Category, Product} from '../types';

// Navigation constants
export const TABS: Tab[] = [
  {key: 'home', label: 'Home', icon: '🏠'},
  {key: 'templates', label: 'Templates', icon: '📱'},
  {key: 'settings', label: 'Settings', icon: '⚙️'},
];

// Theme constants
export const THEME_OPTIONS: ThemeOption[] = [
  {key: 'system', label: 'System', description: 'Follow system setting'},
  {key: 'light', label: 'Light', description: 'Light theme'},
  {key: 'dark', label: 'Dark', description: 'Dark theme'},
];

// App constants
export const APP_NAME = 'SoleStyle';
export const EMPTY_STATE_MESSAGES = {
  NO_PRODUCTS: 'No products found!',
  NO_PRODUCTS_SUBTITLE: 'Try adjusting your search or filters',
  EMPTY_CART: 'Your cart is empty',
  EMPTY_CART_SUBTITLE: 'Add some great shoes to get started',
};

// Product categories
export const CATEGORIES: Category[] = [
  {id: 'running', name: 'Running', icon: '🏃', subcategories: ['Trail', 'Road', 'Cross Training']},
  {id: 'casual', name: 'Casual', icon: '👟', subcategories: ['Sneakers', 'Loafers', 'Canvas']},
  {id: 'dress', name: 'Dress', icon: '👞', subcategories: ['Oxfords', 'Loafers', 'Boots']},
  {id: 'athletic', name: 'Athletic', icon: '⚽', subcategories: ['Basketball', 'Soccer', 'Tennis']},
  {id: 'boots', name: 'Boots', icon: '🥾', subcategories: ['Hiking', 'Work', 'Fashion']},
];

// Sample products data
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Air Max 270',
    brand: 'Nike',
    price: 150,
    originalPrice: 180,
    category: 'running',
    subcategory: 'Road',
    sizes: ['7', '8', '8.5', '9', '9.5', '10', '11'],
    colors: ['Black', 'White', 'Navy', 'Red'],
    images: ['https://via.placeholder.com/300x300/000000/FFFFFF?text=Nike+Air+Max+270'],
    description: 'The Nike Air Max 270 delivers visible Max Air cushioning and sleek style.',
    rating: 4.5,
    reviewCount: 1234,
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Chuck Taylor All Star',
    brand: 'Converse',
    price: 65,
    category: 'casual',
    subcategory: 'Canvas',
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Red', 'Navy'],
    images: ['https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Converse+Chuck+Taylor'],
    description: 'The iconic Chuck Taylor All Star sneaker that started it all.',
    rating: 4.3,
    reviewCount: 2156,
    inStock: true,
  },
  {
    id: '3',
    name: 'Ultraboost 22',
    brand: 'Adidas',
    price: 190,
    category: 'running',
    subcategory: 'Road',
    sizes: ['7', '8', '8.5', '9', '9.5', '10', '10.5', '11'],
    colors: ['Black', 'White', 'Grey'],
    images: ['https://via.placeholder.com/300x300/000000/FFFFFF?text=Adidas+Ultraboost'],
    description: 'Experience incredible energy return with Boost technology.',
    rating: 4.7,
    reviewCount: 892,
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Classic Leather',
    brand: 'Reebok',
    price: 75,
    category: 'casual',
    subcategory: 'Sneakers',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black', 'Navy'],
    images: ['https://via.placeholder.com/300x300/FFFFFF/000000?text=Reebok+Classic'],
    description: 'Timeless design meets modern comfort in this classic sneaker.',
    rating: 4.1,
    reviewCount: 567,
    inStock: true,
  },
  {
    id: '5',
    name: 'Jordan 1 Retro High',
    brand: 'Jordan',
    price: 170,
    category: 'athletic',
    subcategory: 'Basketball',
    sizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    colors: ['Black/Red', 'White/Black', 'Royal Blue'],
    images: ['https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Jordan+1+Retro'],
    description: 'The shoe that started it all. Classic Jordan style and performance.',
    rating: 4.8,
    reviewCount: 3421,
    inStock: true,
    featured: true,
  },
  {
    id: '6',
    name: 'Timberland 6-Inch Boot',
    brand: 'Timberland',
    price: 200,
    category: 'boots',
    subcategory: 'Work',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Wheat', 'Black', 'Brown'],
    images: ['https://via.placeholder.com/300x300/DEB887/000000?text=Timberland+Boot'],
    description: 'Durable waterproof boots built for any adventure.',
    rating: 4.4,
    reviewCount: 1876,
    inStock: true,
  },
];

// Validation constants
export const VALIDATION_MESSAGES = {
  CART_ADD_SUCCESS: 'Added to cart!',
  CART_REMOVE_SUCCESS: 'Removed from cart',
  CHECKOUT_SUCCESS: 'Order placed successfully!',
  REQUIRED_FIELD: 'This field is required',
};