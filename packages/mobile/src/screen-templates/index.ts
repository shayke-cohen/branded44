// Screen Templates for React Native Apps
// ⚠️  IMPORTANT: These templates are for SHOWCASE/DEMO purposes only
// ⚠️  The actual app uses real Wix screens, NOT these templates
// ⚠️  Templates are only displayed in TemplateIndexScreen for demonstration

// Basic Templates - Starting points for common patterns (SHOWCASE ONLY)
export {default as AuthScreenTemplate} from './AuthScreenTemplate';
export {default as DashboardScreenTemplate} from './DashboardScreenTemplate';
export {default as FormScreenTemplate} from './FormScreenTemplate';
export {default as ListScreenTemplate} from './ListScreenTemplate';

// Complex Examples - Full-featured reference implementations (SHOWCASE ONLY)
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

// Simplified Registry System (for actual app navigation)
export {
  getScreenConfig,
  getNavTabConfig,
  getScreenIdForTab,
  getScreens,
  getNavTabs,
  getScreenComponent,
  type ScreenConfig,
  type NavTabConfig,
  
  // Showcase-specific functions (for TemplateIndexScreen)
  getShowcaseTemplates,
  getShowcaseApps,
  getShowcaseComponent,
  getShowcaseTemplateConfig,
  type ShowcaseTemplateConfig,
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

// ARCHITECTURE NOTES:
// - Templates are for showcase/demo purposes in TemplateIndexScreen only
// - Actual app navigation uses real screens (HomeNavigation, ProductsNavigation, etc.)
// - Real screens self-register via importScreens.ts 
// - Copy template interfaces to your project when building new features 