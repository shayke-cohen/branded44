// Screen Templates for React Native Apps
// These are reusable screen patterns that can be customized for specific use cases

// Basic Templates - Starting points for common patterns
export {default as AuthScreenTemplate} from './AuthScreenTemplate';
export {default as DashboardScreenTemplate} from './DashboardScreenTemplate';
export {default as FormScreenTemplate} from './FormScreenTemplate';
export {default as ListScreenTemplate} from './ListScreenTemplate';

// Complex Examples - Full-featured reference implementations
export {default as ProductListScreen} from './examples/ProductListScreen';
export {default as ProductDetailScreen} from './examples/ProductDetailScreen';
export {default as CartScreen} from './examples/CartScreen';
export {default as CheckoutScreen} from './examples/CheckoutScreen';
export {default as SearchScreen} from './examples/SearchScreen';

// Dynamic Template Configuration System
export {
  TEMPLATE_CONFIG,
  TEMPLATE_COMPONENTS,
  getTemplatesByComplexity,
  getTemplatesByCategory,
  getTemplateComponent,
  getTemplateConfig,
  getAllCategories,
  getCustomizableTemplates,
} from './templateConfig';

export type {
  TemplateConfig,
  TemplateComplexity,
} from './templateConfig';

import TEMPLATE_CONFIG from './templateConfig';
export default TEMPLATE_CONFIG;

// Note: Copy the interfaces from the template files to your project when using them
// Each template contains TypeScript interfaces that define the expected props and data structures 