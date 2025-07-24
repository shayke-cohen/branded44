import {ComponentType} from 'react';

// Import unified registry system
import {
  registerComponent,
  registerEntities,
  getEntitiesByType,
  getEntityComponent,
  getEntity,
  type EntityConfig
} from '../config/registry';

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



// Import all screens from dedicated file
import '../config/importScreens';

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

// Enhanced helper functions for better consistency
export const getTemplateComponentById = (templateId: string): ComponentType<any> | undefined => {
  const config = getTemplateConfig(templateId);
  return config ? getTemplateComponent(config.componentKey) : undefined;
};

export const getTemplateWithComponent = (templateId: string): {config: TemplateConfig | undefined, component: ComponentType<any> | undefined} => {
  const config = getTemplateConfig(templateId);
  const component = config ? getTemplateComponent(config.componentKey) : undefined;
  return { config, component };
};

export const validateTemplate = (templateId: string): {isValid: boolean, error?: string} => {
  const config = getTemplateConfig(templateId);
  if (!config) {
    return { isValid: false, error: `Template config not found for "${templateId}"` };
  }
  
  const component = getTemplateComponent(config.componentKey);
  if (!component) {
    return { isValid: false, error: `Template component "${config.componentKey}" not found` };
  }
  
  return { isValid: true };
};

export const renderTemplateWithProps = (templateId: string, additionalProps: Record<string, any> = {}) => {
  const { config, component: TemplateComponent } = getTemplateWithComponent(templateId);
  
  if (!config || !TemplateComponent) {
    return null;
  }
  
  const finalProps = {
    ...(config.defaultProps || {}),
    ...additionalProps
  };
  
  return { TemplateComponent, finalProps, config };
};

// Unified template rendering helper
export const createTemplateRenderer = (
  fallbackComponent?: React.ComponentType<any>,
  onError?: (error: string) => void
) => {
  return (templateId: string, additionalProps: Record<string, any> = {}) => {
    const validation = validateTemplate(templateId);
    
    if (!validation.isValid) {
      onError?.(validation.error || 'Unknown template error');
      return fallbackComponent ? { TemplateComponent: fallbackComponent, finalProps: {}, config: null } : null;
    }
    
    return renderTemplateWithProps(templateId, additionalProps);
  };
};

// Initialize unified registry with all entities
function initializeUnifiedRegistry(): void {
  // Register all components
  registerComponent('AuthScreenTemplate', AuthScreenTemplate);
  registerComponent('DashboardScreenTemplate', DashboardScreenTemplate);
  registerComponent('FormScreenTemplate', FormScreenTemplate);
  registerComponent('ListScreenTemplate', ListScreenTemplate);
  registerComponent('ProductListScreen', ProductListScreen);
  registerComponent('ProductDetailScreen', ProductDetailScreen);
  registerComponent('CartScreen', CartScreen);
  registerComponent('CheckoutScreen', CheckoutScreen);
  registerComponent('SearchScreen', SearchScreen);

  // HomeScreen and SettingsScreen now self-register

  // Convert existing template configs to unified entities
  const templateEntities: EntityConfig[] = TEMPLATE_CONFIG.map(template => ({
    id: template.id,
    name: template.name,
    type: template.complexity === 'Apps' ? 'sample-app' : 'template',
    componentKey: template.componentKey,
    icon: template.icon,
    description: template.description,
    category: template.category,
    tags: [
      ...(template.features || []),
      template.complexity.toLowerCase(),
      ...(template.customizable ? ['customizable'] : [])
    ],
    metadata: {
      complexity: template.complexity,
      features: template.features,
      customizable: template.customizable,
      defaultProps: template.defaultProps
    }
  }));

  // Add screen entities (HomeScreen and SettingsScreen now self-register)
  const screenEntities: EntityConfig[] = [
    // TemplateIndexScreen removed for clean fitness app
  ];

  // Add navigation tab entities (Home and Settings tabs now self-managed)
  const navTabEntities: EntityConfig[] = [
    // templates-tab removed for clean fitness app
  ];

  // Add template mapping entities
  const templateMappingEntities: EntityConfig[] = [
    {
      id: 'AuthScreenTemplate-mapping',
      name: 'Auth Screen Template Mapping',
      type: 'template-mapping',
      category: 'Template Mappings',
      metadata: {
        key: 'AuthScreenTemplate',
        templateId: 'auth-template'
      }
    },
    {
      id: 'DashboardScreenTemplate-mapping',
      name: 'Dashboard Screen Template Mapping',
      type: 'template-mapping',
      category: 'Template Mappings',
      metadata: {
        key: 'DashboardScreenTemplate',
        templateId: 'dashboard-template'
      }
    },
    {
      id: 'FormScreenTemplate-mapping',
      name: 'Form Screen Template Mapping',
      type: 'template-mapping',
      category: 'Template Mappings',
      metadata: {
        key: 'FormScreenTemplate',
        templateId: 'form-template'
      }
    },
    {
      id: 'ListScreenTemplate-mapping',
      name: 'List Screen Template Mapping',
      type: 'template-mapping',
      category: 'Template Mappings',
      metadata: {
        key: 'ListScreenTemplate',
        templateId: 'list-template'
      }
    }
  ];

  // Register all entities
  registerEntities([
    ...templateEntities,
    ...screenEntities,
    ...navTabEntities,
    ...templateMappingEntities
  ]);
}

// Initialize the unified registry
initializeUnifiedRegistry();

// Unified registry helper functions (backward compatible + new)
export const getScreenConfig = (screenId: string) => {
  const entity = getEntity(screenId);
  return entity?.type === 'screen' ? entity : undefined;
};

export const getSampleAppConfig = (appId: string) => {
  const entity = getEntity(appId);
  return entity?.type === 'sample-app' ? entity : undefined;
};

export const getNavTabConfig = (tabId: string) => {
  const entity = getEntity(tabId);
  return entity?.type === 'nav-tab' ? entity : undefined;
};

export const getTemplateIdFromKey = (templateKey: string): string | undefined => {
  const mappings = getEntitiesByType('template-mapping');
  const mapping = mappings.find(m => m.metadata?.key === templateKey);
  return mapping?.metadata?.templateId;
};

export const getTabIdForScreen = (screenId: string): string | undefined => {
  const screenConfig = getScreenConfig(screenId);
  return screenConfig?.relationships?.tab as string;
};

export const getScreenIdForTab = (tabId: string): string | undefined => {
  const tabConfig = getNavTabConfig(tabId);
  return tabConfig?.relationships?.defaultScreen as string;
};

// New unified functions
export const getScreens = () => getEntitiesByType('screen');
export const getSampleApps = () => getEntitiesByType('sample-app');
export const getNavTabs = () => {
  const tabs = getEntitiesByType('nav-tab');
  // Sort tabs by position (default to 999 for tabs without position)
  return tabs.sort((a, b) => {
    const posA = a.metadata?.position || 999;
    const posB = b.metadata?.position || 999;
    return posA - posB;
  });
};
export const getTemplateMappings = () => getEntitiesByType('template-mapping');
export const getTemplates = () => getEntitiesByType('template');

export const getScreenComponent = (screenId: string) => getEntityComponent(screenId);
export const getSampleAppComponent = (appId: string) => getEntityComponent(appId);

// Export types for backward compatibility
export type ScreenConfig = EntityConfig & { type: 'screen' };
export type SampleAppConfig = EntityConfig & { type: 'sample-app' };
export type NavTabConfig = EntityConfig & { type: 'nav-tab' };

export default TEMPLATE_CONFIG; 