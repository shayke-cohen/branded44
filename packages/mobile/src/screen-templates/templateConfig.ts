import {ComponentType} from 'react';

// Import all template components
import AuthScreenTemplate from './AuthScreenTemplate';
import DashboardScreenTemplate from './DashboardScreenTemplate';
import FormScreenTemplate from './FormScreenTemplate';
import ListScreenTemplate from './ListScreenTemplate';

// Import complex examples
import ProductListScreen from './examples/ProductListScreen';
import ProductDetailScreen from './examples/ProductDetailScreen';
import CartScreen from './examples/CartScreen';
import CheckoutScreen from './examples/CheckoutScreen';
import SearchScreen from './examples/SearchScreen';

// Import sample apps
import {TodoApp} from '../sample-apps/TodoApp';
import {CalculatorApp} from '../sample-apps/CalculatorApp';
import {WeatherApp} from '../sample-apps/WeatherApp';
import {NotesApp} from '../sample-apps/NotesApp';

export type TemplateComplexity = 'Simple' | 'Complex' | 'Apps';

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  complexity: TemplateComplexity;
  componentKey: string;
  icon?: string;
  features?: string[];
  defaultProps?: Record<string, any>;
  customizable?: boolean;
  category?: string;
}

// Template component registry for dynamic loading
export const TEMPLATE_COMPONENTS: Record<string, ComponentType<any>> = {
  // Basic Templates
  'auth-template': AuthScreenTemplate,
  'dashboard-template': DashboardScreenTemplate,
  'form-template': FormScreenTemplate,
  'list-template': ListScreenTemplate,
  
  // Complex Examples
  'product-list': ProductListScreen,
  'product-detail': ProductDetailScreen,
  'cart': CartScreen,
  'checkout': CheckoutScreen,
  'search': SearchScreen,
  
  // Sample Apps
  'todo-app': TodoApp,
  'calculator-app': CalculatorApp,
  'weather-app': WeatherApp,
  'notes-app': NotesApp,
};

// Template configuration data
export const TEMPLATE_CONFIG: TemplateConfig[] = [
  // Simple Templates
  {
    id: 'auth-template',
    name: 'Authentication Template',
    description: 'Multi-mode authentication with social login, validation, and accessibility features.',
    complexity: 'Simple',
    componentKey: 'auth-template',
    icon: '🔐',
    features: ['Form validation', 'Social login', 'Password reset', 'Multi-mode support'],
    customizable: true,
    category: 'User Management',
    defaultProps: {
      mode: 'login',
      showSocialLogins: true,
      allowModeSwitch: true,
      enableBiometric: false,
    },
  },
  {
    id: 'dashboard-template',
    name: 'Dashboard Template',
    description: 'Customizable dashboard with stat cards, quick actions, and responsive layout.',
    complexity: 'Simple',
    componentKey: 'dashboard-template',
    icon: '📊',
    features: ['Statistics', 'Quick actions', 'Responsive layout', 'Real-time updates'],
    customizable: true,
    category: 'Analytics',
    defaultProps: {
      title: 'Sample Dashboard',
      showRefreshButton: true,
      autoRefresh: false,
      stats: [
        {id: 'users', label: 'Users', value: '1,234', trend: '+12%', icon: '👥'},
        {id: 'revenue', label: 'Revenue', value: '$45.2K', trend: '+8%', icon: '💰'},
        {id: 'orders', label: 'Orders', value: '856', trend: '+15%', icon: '📦'},
        {id: 'growth', label: 'Growth', value: '23%', trend: '+5%', icon: '📈'},
      ],
      quickActions: [
        {id: 'add-user', label: 'Add User', icon: '➕', onPress: () => console.log('Add User')},
        {id: 'reports', label: 'Reports', icon: '📊', onPress: () => console.log('Reports')},
        {id: 'settings', label: 'Settings', icon: '⚙️', onPress: () => console.log('Settings')},
      ],
    },
  },
  {
    id: 'form-template',
    name: 'Form Template',
    description: 'Dynamic form with validation, error handling, and various input types.',
    complexity: 'Simple',
    componentKey: 'form-template',
    icon: '📝',
    features: ['Input validation', 'Dynamic fields', 'Error handling', 'Auto-save'],
    customizable: true,
    category: 'Data Entry',
    defaultProps: {
      title: 'Sample Form',
      submitButtonText: 'Submit Form',
      showProgressBar: true,
      enableAutoSave: false,
      fields: [
        {
          key: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your name',
        },
        {
          key: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'your@email.com',
        },
        {
          key: 'bio',
          label: 'Bio',
          type: 'textarea',
          placeholder: 'Tell us about yourself',
        },
      ],
      onSubmit: async (data: any) => {
        console.log('Form submitted:', data);
      },
    },
  },
  {
    id: 'list-template',
    name: 'List Template',
    description: 'Searchable list with filtering, multiple display modes, and empty states.',
    complexity: 'Simple',
    componentKey: 'list-template',
    icon: '📋',
    features: ['Search', 'Filtering', 'Pull to refresh', 'Multiple layouts'],
    customizable: true,
    category: 'Data Display',
    defaultProps: {
      title: 'Sample List',
      searchable: true,
      refreshable: true,
      displayMode: 'list',
      emptyMessage: 'No items found',
      data: [
        {id: '1', name: 'Item 1', category: 'Category A', status: 'active'},
        {id: '2', name: 'Item 2', category: 'Category B', status: 'pending'},
        {id: '3', name: 'Item 3', category: 'Category A', status: 'active'},
        {id: '4', name: 'Item 4', category: 'Category C', status: 'completed'},
      ],
    },
  },

  // Complex Examples
  {
    id: 'product-list',
    name: 'Product List Screen',
    description: 'Full e-commerce product listing with filtering, sorting, wishlist, and cart integration.',
    complexity: 'Complex',
    componentKey: 'product-list',
    icon: '🛍️',
    features: ['Product filtering', 'Sort options', 'Wishlist', 'Cart integration', 'Search'],
    customizable: true,
    category: 'E-commerce',
    defaultProps: {
      onProductPress: (product: any) => console.log('Product pressed:', product.name),
      showFilters: true,
      showSort: true,
      showSearch: true,
    },
  },
  {
    id: 'product-detail',
    name: 'Product Detail Screen',
    description: 'Comprehensive product view with image gallery, reviews, specifications, and purchase options.',
    complexity: 'Complex',
    componentKey: 'product-detail',
    icon: '📱',
    features: ['Image gallery', 'Reviews', 'Specifications', 'Purchase options', 'Related products'],
    customizable: true,
    category: 'E-commerce',
    defaultProps: {
      productId: '1',
      onBack: () => console.log('Back pressed'),
      showReviews: true,
      showSpecs: true,
      showRelated: true,
    },
  },
  {
    id: 'cart',
    name: 'Cart Screen',
    description: 'Complete shopping cart with quantity management, pricing calculations, and checkout flow.',
    complexity: 'Complex',
    componentKey: 'cart',
    icon: '🛒',
    features: ['Quantity management', 'Price calculations', 'Coupon codes', 'Shipping options'],
    customizable: true,
    category: 'E-commerce',
    defaultProps: {
      onBack: () => console.log('Back pressed'),
      onCheckout: () => console.log('Checkout pressed'),
      showCoupons: true,
      showShipping: true,
    },
  },
  {
    id: 'checkout',
    name: 'Checkout Screen',
    description: 'Multi-step checkout with address management, payment processing, and order confirmation.',
    complexity: 'Complex',
    componentKey: 'checkout',
    icon: '💳',
    features: ['Address management', 'Payment processing', 'Order confirmation', 'Multi-step flow'],
    customizable: true,
    category: 'E-commerce',
    defaultProps: {
      onBack: () => console.log('Back pressed'),
      onOrderComplete: (order: any) => console.log('Order completed:', order),
      showGuestCheckout: true,
      showSavedCards: true,
    },
  },
  {
    id: 'search',
    name: 'Search Screen',
    description: 'Advanced search interface with filters, suggestions, history, and result management.',
    complexity: 'Complex',
    componentKey: 'search',
    icon: '🔍',
    features: ['Advanced filters', 'Search suggestions', 'Search history', 'Voice search'],
    customizable: true,
    category: 'Navigation',
    defaultProps: {
      onProductPress: (product: any) => console.log('Product pressed:', product.name),
      showVoiceSearch: true,
      showHistory: true,
      showSuggestions: true,
    },
  },

  // Sample Apps
  {
    id: 'todo-app',
    name: 'Todo App',
    description: 'Complete task management application with categories, priorities, and local persistence.',
    complexity: 'Apps',
    componentKey: 'todo-app',
    icon: '✅',
    features: [
      'Add, edit, delete todos',
      'Categories & priorities', 
      'Filter & search',
      'Local storage persistence',
      'Statistics & progress tracking',
    ],
    customizable: false,
    category: 'Productivity',
  },
  {
    id: 'calculator-app',
    name: 'Calculator App',
    description: 'Advanced calculator with history, memory functions, and scientific operations.',
    complexity: 'Apps',
    componentKey: 'calculator-app',
    icon: '🧮',
    features: [
      'Basic & advanced operations',
      'Memory functions (MC, MR, M+, M-)',
      'Calculation history',
      'Error handling',
      'Local storage persistence',
    ],
    customizable: false,
    category: 'Utilities',
  },
  {
    id: 'weather-app',
    name: 'Weather App',
    description: 'Beautiful weather forecasting with location search, 7-day forecasts, and weather alerts.',
    complexity: 'Apps',
    componentKey: 'weather-app',
    icon: '🌤️',
    features: [
      'Current weather & forecasts',
      'Location search & saved locations',
      'Hourly & 7-day forecasts',
      'Weather alerts & warnings',
      'Unit preferences (°C/°F, km/h/mph)',
    ],
    customizable: false,
    category: 'Weather',
  },
  {
    id: 'notes-app',
    name: 'Notes App',
    description: 'Rich text note-taking with folders, tags, search, and export capabilities.',
    complexity: 'Apps',
    componentKey: 'notes-app',
    icon: '📝',
    features: [
      'Rich text editing with formatting',
      'Folder organization & tagging',
      'Advanced search & filtering',
      'Note templates & export',
      'Pin favorites & auto-save',
    ],
    customizable: false,
    category: 'Productivity',
  },
];

// Helper functions for template management
export const getTemplatesByComplexity = (complexity: TemplateComplexity): TemplateConfig[] => {
  return TEMPLATE_CONFIG.filter(template => template.complexity === complexity);
};

export const getTemplatesByCategory = (category: string): TemplateConfig[] => {
  return TEMPLATE_CONFIG.filter(template => template.category === category);
};

export const getTemplateComponent = (componentKey: string): ComponentType<any> | undefined => {
  return TEMPLATE_COMPONENTS[componentKey];
};

export const getTemplateConfig = (templateId: string): TemplateConfig | undefined => {
  return TEMPLATE_CONFIG.find(template => template.id === templateId);
};

export const getAllCategories = (): string[] => {
  const categories = TEMPLATE_CONFIG
    .map(template => template.category)
    .filter((category): category is string => category !== undefined);
  return [...new Set(categories)].sort();
};

export const getCustomizableTemplates = (): TemplateConfig[] => {
  return TEMPLATE_CONFIG.filter(template => template.customizable === true);
};

export default TEMPLATE_CONFIG; 