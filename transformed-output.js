import {ComponentType} from 'react';

// Import simplified registry system for screen registration only
import {
  registerComponent,
  registerEntities,
  getEntitiesByType,
  getEntityComponent,
  getEntity
} from '../config/registry';

// Import all template components
import AuthScreenTemplate from './AuthScreenTemplate';
import DashboardScreenTemplate from './DashboardScreenTemplate';
import FormScreenTemplate from './FormScreenTemplate';
import ListScreenTemplate from './ListScreenTemplate';

// Import complex examples
// ProductListScreen removed - using actual Wix screen instead
import ProductDetailScreen from './examples/ProductDetailScreen';
import CartScreen from './examples/CartScreen';
import CheckoutScreen from './examples/CheckoutScreen';
import SearchScreen from './examples/SearchScreen';



// Import all screens from dedicated file (actual app screens)
import '../config/importScreens';





// Template component registry - FOR SHOWCASE/DEMO ONLY
// These templates are NOT used in the actual app flow, only in TemplateIndexScreen
export const TEMPLATE_COMPONENTS = {
  // Basic Templates (showcase only)
  'auth-template': AuthScreenTemplate,
  'dashboard-template': DashboardScreenTemplate,
  'form-template': FormScreenTemplate,
  'list-template': ListScreenTemplate,
  
  // Complex Examples (showcase only)
  'product-detail': ProductDetailScreen,
  'cart': CartScreen,
  'checkout': CheckoutScreen,
  'search': SearchScreen};

// Template configuration data - FOR SHOWCASE/DEMO ONLY
// These templates are displayed in TemplateIndexScreen but NOT used in actual app navigation
export const TEMPLATE_CONFIG = [
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
      enableBiometric: false}},
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
      ]}},
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
          placeholder: 'Enter your name'},
        {
          key: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'your@email.com'},
        {
          key: 'bio',
          label: 'Bio',
          type: 'textarea',
          placeholder: 'Tell us about yourself'},
      ],
      onSubmit: async (data: any) => {
        console.log('Form submitted:', data);
      }}},
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
      ]}},

  // Complex Examples
  // Product List Screen removed - using actual Wix screen instead
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
      showRelated: true}},
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
      showShipping: true}},
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
      showSavedCards: true}},
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
      showSuggestions: true}},


];

// Helper functions for template management
export const getTemplatesByComplexity = (complexity: TemplateComplexity) => {
  return TEMPLATE_CONFIG.filter(template => template.complexity === complexity);
};

export const getTemplatesByCategory = (category: string) => {
  return TEMPLATE_CONFIG.filter(template => template.category === category);
};

export const getTemplateComponent = (componentKey: string): ComponentType<any> | undefined => {
  return TEMPLATE_COMPONENTS[componentKey];
};

export const getTemplateConfig = (templateId: string): TemplateConfig | undefined => {
  return TEMPLATE_CONFIG.find(template => template.id === templateId);
};

export const getAllCategories = () => {
  const categories = TEMPLATE_CONFIG
    .map(template => template.category)
    .filter((category): category is string => category !== undefined);
  return [...new Set(categories)].sort();
};

export const getCustomizableTemplates = () => {
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

export const renderTemplateWithProps = (templateId: string, additionalProps = {}) => {
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
  return (templateId: string, additionalProps = {}) => {
    const validation = validateTemplate(templateId);
    
    if (!validation.isValid) {
      onError?.(validation.error || 'Unknown template error');
      return fallbackComponent ? { TemplateComponent: fallbackComponent, finalProps: {}, config: null } : null;
    }
    
    return renderTemplateWithProps(templateId, additionalProps);
  };
};

// Initialize simplified registry for showcase templates only
// NOTE: Actual app screens self-register via importScreens.ts
function initializeTemplateShowcase(): void {
  // Register template components for showcase display
  registerComponent('AuthScreenTemplate', AuthScreenTemplate);
  registerComponent('DashboardScreenTemplate', DashboardScreenTemplate);
  registerComponent('FormScreenTemplate', FormScreenTemplate);
  registerComponent('ListScreenTemplate', ListScreenTemplate);
  registerComponent('ProductDetailScreen', ProductDetailScreen);
  registerComponent('CartScreen', CartScreen);
  registerComponent('CheckoutScreen', CheckoutScreen);
  registerComponent('SearchScreen', SearchScreen);

  // Convert template configs to entities for showcase purposes
  const showcaseTemplateEntities = TEMPLATE_CONFIG.map(template => ({
    id: template.id,
    name: template.name,
    type: template.complexity === 'Apps' ? 'showcase-app' : 'showcase-template',
    componentKey: template.componentKey,
    icon: template.icon,
    description: template.description,
    category: template.category,
    tags: [
      'showcase-only',
      ...(template.features || []),
      template.complexity.toLowerCase(),
      ...(template.customizable ? ['customizable'] : [])
    ],
    metadata: {
      complexity: template.complexity,
      features: template.features,
      customizable: template.customizable,
      defaultProps: template.defaultProps,
      isShowcaseOnly: true
    }
  }));

  // Register only showcase entities
  registerEntities(showcaseTemplateEntities);
}

// Initialize the template showcase registry
initializeTemplateShowcase();

// Registry helper functions for actual app navigation (simplified)
// These work with the actual screens registered via importScreens.ts
export const getScreenConfig = (screenId: string) => {
  const entity = getEntity(screenId);
  return entity?.type === 'screen' ? entity : undefined;
};

export const getNavTabConfig = (tabId: string) => {
  const entity = getEntity(tabId);
  return entity?.type === 'nav-tab' ? entity : undefined;
};

export const getScreenIdForTab = (tabId: string): string | undefined => {
  const tabConfig = getNavTabConfig(tabId);
  return tabConfig?.relationships?.defaultScreen as string;
};

// Showcase-specific helpers
export const getShowcaseTemplateConfig = (templateId: string) => {
  const entity = getEntity(templateId);
  return (entity?.type === 'showcase-template' || entity?.type === 'showcase-app') ? entity : undefined;
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




export default TEMPLATE_CONFIG; 