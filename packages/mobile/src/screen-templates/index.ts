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
  TEMPLATE_COMPONENTS,
  getTemplatesByComplexity,
  getTemplatesByCategory,
  getTemplateComponent,
  getTemplateConfig,
  getAllCategories,
  getCustomizableTemplates,
  getTemplateComponentById,
  getTemplateWithComponent,
  validateTemplate,
  renderTemplateWithProps,
  createTemplateRenderer,
} from './templateConfig';

// Shared Template Renderer Component
export { default as TemplateRenderer } from './TemplateRenderer';

// Unified Registry System (includes screens, apps, navigation)
export {
  getScreenConfig,
  getSampleAppConfig,
  getNavTabConfig,
  getTemplateIdFromKey,
  getTabIdForScreen,
  getScreenIdForTab,
  getScreens,
  getSampleApps,
  getNavTabs,
  getTemplateMappings,
  getTemplates,
  getScreenComponent,
  getSampleAppComponent,
  type ScreenConfig,
  type SampleAppConfig,
  type NavTabConfig,
} from './templateConfig';

// Registry Core (for advanced usage)
export {
  registerComponent,
  registerEntity,
  registerEntities,
  getEntity,
  getComponent,
  getEntityComponent,
  getEntitiesByType,
  getEntitiesByCategory,
  searchEntities,
  globalRegistry,
  type EntityConfig,
} from '../config/registry';

export type {
  TemplateConfig,
  TemplateComplexity,
} from './templateConfig';

// Default export removed to prevent circular dependency issues
// Use named exports instead: import {TEMPLATE_CONFIG} from './screen-templates'
export {default as TEMPLATE_CONFIG} from './templateConfig';

// Note: Copy the interfaces from the template files to your project when using them
// Each template contains TypeScript interfaces that define the expected props and data structures 