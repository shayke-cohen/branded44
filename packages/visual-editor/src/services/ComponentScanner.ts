import { ComponentMetadata } from './ComponentRegistry';

export interface ComponentFile {
  path: string;
  name: string;
  category: string;
  type: 'block' | 'template' | 'screen';
  exports: string[];
  dependencies: string[];
}

export class ComponentScanner {
  private serverUrl: string;

  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  /**
   * Scan src2 directory for components
   */
  async scanComponents(): Promise<ComponentMetadata[]> {
    try {
      console.log('🔍 [ComponentScanner] Scanning src2 directory for components...');
      
      const response = await fetch(`${this.serverUrl}/api/editor/scan-components`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to scan components: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`🔍 [ComponentScanner] Found ${data.components.length} components`);
      
      return data.components.map((comp: any) => this.normalizeComponent(comp));
    } catch (error) {
      console.error('❌ [ComponentScanner] Failed to scan components:', error);
      return [];
    }
  }

  /**
   * Get component source code
   */
  async getComponentSource(componentPath: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.serverUrl}/api/editor/component-source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: componentPath })
      });

      if (!response.ok) {
        throw new Error(`Failed to get component source: ${response.statusText}`);
      }

      const data = await response.json();
      return data.source;
    } catch (error) {
      console.error(`❌ [ComponentScanner] Failed to get source for ${componentPath}:`, error);
      return null;
    }
  }

  /**
   * Get component dependencies
   */
  async getComponentDependencies(componentPath: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.serverUrl}/api/editor/component-dependencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: componentPath })
      });

      if (!response.ok) {
        throw new Error(`Failed to get component dependencies: ${response.statusText}`);
      }

      const data = await response.json();
      return data.dependencies || [];
    } catch (error) {
      console.error(`❌ [ComponentScanner] Failed to get dependencies for ${componentPath}:`, error);
      return [];
    }
  }

  /**
   * Normalize component data from server
   */
  private normalizeComponent(comp: any): ComponentMetadata {
    const category = this.inferCategory(comp.path);
    const name = this.inferName(comp.name, comp.path);
    const description = this.inferDescription(comp.name, category);

    return {
      id: comp.name,
      name,
      category,
      path: comp.path,
      description,
      tags: this.inferTags(comp.name, category)
    };
  }

  /**
   * Infer component category from path
   */
  private inferCategory(path: string): string {
    if (path.includes('/screens/')) return 'screens';
    if (path.includes('/templates/')) return 'templates';
    if (path.includes('/blocks/auth/')) return 'auth';
    if (path.includes('/blocks/booking/')) return 'booking';
    if (path.includes('/blocks/business/')) return 'business';
    if (path.includes('/blocks/communication/')) return 'communication';
    if (path.includes('/blocks/ecommerce/')) return 'ecommerce';
    if (path.includes('/blocks/finance/')) return 'finance';
    if (path.includes('/blocks/forms/')) return 'forms';
    if (path.includes('/blocks/health/')) return 'health';
    if (path.includes('/blocks/lists/')) return 'lists';
    if (path.includes('/blocks/location/')) return 'location';
    if (path.includes('/blocks/media/')) return 'media';
    if (path.includes('/blocks/restaurant/')) return 'restaurant';
    if (path.includes('/blocks/social/')) return 'social';
    if (path.includes('/blocks/utility/')) return 'utility';
    if (path.includes('/blocks/')) return 'blocks';
    return 'components';
  }

  /**
   * Infer human-readable name from component name
   */
  private inferName(name: string, path: string): string {
    // Remove common suffixes
    let cleanName = name
      .replace(/Screen$/, '')
      .replace(/Template$/, '')
      .replace(/Component$/, '')
      .replace(/Block$/, '')
      .replace(/Card$/, ' Card')
      .replace(/Form$/, ' Form')
      .replace(/List$/, ' List')
      .replace(/Grid$/, ' Grid');

    // Add spaces before capital letters
    cleanName = cleanName.replace(/([A-Z])/g, ' $1').trim();

    // Handle special cases
    if (path.includes('/screens/')) {
      cleanName += ' Screen';
    } else if (path.includes('/templates/')) {
      cleanName += ' Template';
    }

    return cleanName;
  }

  /**
   * Infer component description
   */
  private inferDescription(name: string, category: string): string {
    const descriptions: Record<string, string> = {
      // Auth
      'LoginForm': 'User authentication form with email and password',
      'SignupForm': 'User registration form for new accounts',
      'OTPVerification': 'One-time password verification component',
      'ProfileCard': 'User profile display card',
      'SettingsPanel': 'User settings and preferences panel',

      // Booking
      'BookingCalendar': 'Calendar interface for appointment booking',
      'AppointmentCard': 'Individual appointment display card',
      'BookingForm': 'Form for creating new bookings',
      'ServiceCard': 'Service selection card for bookings',
      'TimeSlotGrid': 'Available time slots selection grid',

      // Ecommerce
      'ProductCard': 'Product display card with image and details',
      'CartScreen': 'Shopping cart with items and checkout',
      'CheckoutScreen': 'Payment flow and order completion',
      'ProductGrid': 'Grid layout for multiple products',

      // Restaurant
      'MenuCard': 'Restaurant menu item display card',
      'OrderSummary': 'Order details and total summary',
      'RestaurantCard': 'Restaurant information display card',

      // Lists
      'ActivityFeed': 'Timeline of user activities',
      'NotificationList': 'List of user notifications',
      'MessageList': 'Chat or message conversation list',

      // Forms
      'AddressForm': 'Address input form with validation',
      'PaymentForm': 'Payment information input form',
      'FeedbackForm': 'User feedback and rating form',

      // Default
      'default': `${category} component for enhanced user experience`
    };

    return descriptions[name] || descriptions['default'];
  }

  /**
   * Infer component tags
   */
  private inferTags(name: string, category: string): string[] {
    const tags = [category];
    
    if (name.toLowerCase().includes('card')) tags.push('card');
    if (name.toLowerCase().includes('form')) tags.push('form');
    if (name.toLowerCase().includes('list')) tags.push('list');
    if (name.toLowerCase().includes('grid')) tags.push('grid');
    if (name.toLowerCase().includes('calendar')) tags.push('calendar');
    if (name.toLowerCase().includes('screen')) tags.push('screen');
    if (name.toLowerCase().includes('template')) tags.push('template');

    return tags;
  }
}

// Export singleton instance
export const componentScanner = new ComponentScanner();
