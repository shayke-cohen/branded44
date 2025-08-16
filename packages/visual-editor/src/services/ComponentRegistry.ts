import React from 'react';

export interface ComponentMetadata {
  id: string;
  name: string;
  category: string;
  path: string;
  description: string;
  tags?: string[];
  props?: Record<string, any>;
}

export class ComponentRegistry {
  private components: Map<string, ComponentMetadata> = new Map();

  constructor() {
    console.log('📋 [ComponentRegistry] Initializing component registry...');
    this.loadDefaultComponents();
  }

  /**
   * Add a component to the registry
   */
  addComponent(metadata: ComponentMetadata) {
    this.components.set(metadata.id, metadata);
    //console.log(`📦 [ComponentRegistry] Registered component: ${metadata.name}`);
  }

  /**
   * Get component metadata by ID
   */
  getComponent(id: string): ComponentMetadata | undefined {
    return this.components.get(id);
  }

  /**
   * Get all available components
   */
  getAllComponents(): ComponentMetadata[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentMetadata[] {
    return this.getAllComponents().filter(comp => comp.category === category);
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    const categories = new Set(this.getAllComponents().map(comp => comp.category));
    return Array.from(categories);
  }

  /**
   * Search components by name or description
   */
  searchComponents(query: string): ComponentMetadata[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllComponents().filter(comp => 
      comp.name.toLowerCase().includes(lowercaseQuery) ||
      comp.description.toLowerCase().includes(lowercaseQuery) ||
      comp.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Load default components into registry
   */
  private loadDefaultComponents() {
    // Screen Templates
    this.addComponent({
      id: 'HomeScreen',
      name: 'Home Screen',
      category: 'screens',
      path: '/screens/HomeScreen',
      description: 'Main landing page with quick actions and recent activity',
      tags: ['home', 'dashboard', 'landing']
    });

    this.addComponent({
      id: 'LoginForm',
      name: 'Login Screen',
      category: 'screens',
      path: '/screens/AuthDemoScreen',
      description: 'Authentication screen with sign in form',
      tags: ['auth', 'login', 'signin']
    });

    this.addComponent({
      id: 'ProfileScreen',
      name: 'Profile Screen',
      category: 'screens',
      path: '/screens/ProfileScreen',
      description: 'User profile management screen',
      tags: ['profile', 'user', 'account']
    });

    this.addComponent({
      id: 'SettingsScreen',
      name: 'Settings Screen',
      category: 'screens',
      path: '/screens/SettingsScreen',
      description: 'App settings and preferences',
      tags: ['settings', 'preferences', 'config']
    });

    // E-commerce Templates
    this.addComponent({
      id: 'ProductCard',
      name: 'Product Card',
      category: 'ecommerce',
      path: '/components/blocks/ecommerce/ProductCard',
      description: 'Product display card with image, details, and purchase options',
      tags: ['product', 'card', 'ecommerce', 'shop']
    });

    this.addComponent({
      id: 'CartScreen',
      name: 'Cart Screen',
      category: 'ecommerce',
      path: '/screens/CartScreen',
      description: 'Shopping cart with items and checkout',
      tags: ['cart', 'shopping', 'checkout']
    });

    this.addComponent({
      id: 'CheckoutScreen',
      name: 'Checkout',
      category: 'ecommerce',
      path: '/screens/CheckoutScreen',
      description: 'Payment flow and order completion',
      tags: ['checkout', 'payment', 'order']
    });

    // Booking Templates
    this.addComponent({
      id: 'BookingCalendar',
      name: 'Booking Calendar',
      category: 'booking',
      path: '/components/blocks/booking/BookingCalendar',
      description: 'Calendar interface for appointment booking',
      tags: ['booking', 'calendar', 'appointment', 'schedule']
    });

    console.log(`📋 [ComponentRegistry] Loaded ${this.components.size} default components`);
  }
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry();
