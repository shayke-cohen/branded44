import React from 'react';
import { AppRegistry } from 'react-native';

export interface ComponentMetadata {
  id: string;
  name: string;
  category: string;
  path: string;
  props?: Record<string, any>;
  description?: string;
}

export interface RenderOptions {
  props?: Record<string, any>;
  wrapInProvider?: boolean;
  deviceType?: 'iphone' | 'android';
}

export class LiveRenderer {
  private container: HTMLElement | null = null;
  private currentComponent: React.ComponentType | null = null;
  private currentProps: Record<string, any> = {};
  private componentRegistry: Map<string, ComponentMetadata> = new Map();
  private reactRoot: any = null; // React 18 root instance

  constructor() {
    console.log('🎨 [LiveRenderer] Initializing React Native Web...');
    this.initializeReactNativeWeb();
    this.loadComponentRegistry();
    this.setupHotReload();
  }

  /**
   * Initialize React Native Web for component rendering
   */
  private initializeReactNativeWeb() {
    // Configure React Native Web for web rendering
    if (typeof window !== 'undefined') {
      // Set up React Native Web platform detection
      (window as any).__REACT_NATIVE_WEB__ = true;
      
      // Initialize AppRegistry for component registration
      AppRegistry.setWrapperComponentProvider(() => {
        return ({ children }: { children: React.ReactNode }) => 
          React.createElement('div', {
            style: { 
              flex: 1, 
              height: '100%',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
          }, children);
      });
    }
  }

  /**
   * Load component registry from the mobile app
   */
  private async loadComponentRegistry() {
    try {
      console.log('📋 [LiveRenderer] Loading component registry...');
      
      // Screen Templates
      this.addComponentToRegistry({
        id: 'HomeScreen',
        name: 'Home Screen',
        category: 'screens',
        path: '/screens/HomeScreen',
        description: 'Main landing page with quick actions and recent activity'
      });

      this.addComponentToRegistry({
        id: 'LoginForm',
        name: 'Login Screen',
        category: 'screens',
        path: '/screens/AuthDemoScreen',
        description: 'Authentication screen with sign in form'
      });

      this.addComponentToRegistry({
        id: 'ProfileScreen',
        name: 'Profile Screen',
        category: 'screens',
        path: '/screens/ProfileScreen',
        description: 'User profile management screen'
      });

      this.addComponentToRegistry({
        id: 'SettingsScreen',
        name: 'Settings Screen',
        category: 'screens',
        path: '/screens/SettingsScreen',
        description: 'App settings and preferences'
      });

      // E-commerce Templates
      this.addComponentToRegistry({
        id: 'ProductCard',
        name: 'Product Card',
        category: 'ecommerce',
        path: '/components/blocks/ecommerce/ProductCard',
        description: 'Product display card with image, details, and purchase options'
      });

      this.addComponentToRegistry({
        id: 'CartScreen',
        name: 'Cart Screen',
        category: 'ecommerce',
        path: '/screens/CartScreen',
        description: 'Shopping cart with items and checkout'
      });

      this.addComponentToRegistry({
        id: 'CheckoutScreen',
        name: 'Checkout',
        category: 'ecommerce',
        path: '/screens/CheckoutScreen',
        description: 'Payment flow and order completion'
      });

      // Booking Templates
      this.addComponentToRegistry({
        id: 'BookingCalendar',
        name: 'Booking Calendar',
        category: 'booking',
        path: '/components/blocks/booking/BookingCalendar',
        description: 'Calendar interface for appointment booking'
      });

      console.log(`📋 [LiveRenderer] Loaded ${this.componentRegistry.size} components`);
    } catch (error) {
      console.error('❌ [LiveRenderer] Failed to load component registry:', error);
    }
  }

  /**
   * Add a component to the registry
   */
  addComponentToRegistry(metadata: ComponentMetadata) {
    this.componentRegistry.set(metadata.id, metadata);
  }

  /**
   * Setup hot reload functionality
   */
  private setupHotReload() {
    console.log('🔥 [LiveRenderer] Setting up hot reload...');
    
    // Listen for file watcher hot reload events
    window.addEventListener('fileWatcher:hotReload', ((event: CustomEvent) => {
      const { path, componentId, timestamp } = event.detail;
      console.log(`🔥 [LiveRenderer] Hot reload triggered for: ${componentId} (${path})`);
      
      // If the changed component is currently being rendered, re-render it
      if (this.currentComponent && componentId) {
        this.handleHotReload(componentId, path, timestamp);
      }
    }) as EventListener);
  }

  /**
   * Handle hot reload for a specific component
   */
  private async handleHotReload(componentId: string, filePath: string, timestamp: number) {
    try {
      console.log(`🔥 [LiveRenderer] Hot reloading component: ${componentId}`);
      
      // For now, we'll just re-render the current component
      if (this.container && this.currentComponent) {
        console.log(`🔥 [LiveRenderer] Re-rendering component after hot reload`);
        
        // Create a fresh component element
        const componentElement = React.createElement(this.currentComponent, {
          ...this.currentProps,
          key: `hotreload-${timestamp}` // Force re-render with new key
        });

        // Wrap and render
        const wrappedElement = this.wrapForPhoneFrame(componentElement, {});
        
        // Re-render using existing React root
        if (this.reactRoot) {
          this.reactRoot.render(wrappedElement);
        }
        
        console.log(`✅ [LiveRenderer] Hot reload completed for: ${componentId}`);
        
        // Emit hot reload success event
        window.dispatchEvent(new CustomEvent('liveRenderer:hotReloadComplete', {
          detail: { componentId, filePath, timestamp }
        }));
      }
      
    } catch (error) {
      console.error(`❌ [LiveRenderer] Hot reload failed for ${componentId}:`, error);
      
      // Emit hot reload error event
      window.dispatchEvent(new CustomEvent('liveRenderer:hotReloadError', {
        detail: { 
          componentId, 
          filePath, 
          error: error instanceof Error ? error.message : String(error), 
          timestamp 
        }
      }));
    }
  }

  /**
   * Get all available components
   */
  getAvailableComponents(): ComponentMetadata[] {
    return Array.from(this.componentRegistry.values());
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentMetadata[] {
    return this.getAvailableComponents().filter(comp => comp.category === category);
  }

  /**
   * Set the container element for rendering
   */
  setContainer(container: HTMLElement) {
    // Clean up existing root if container is changing
    if (this.reactRoot && this.container !== container) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    
    this.container = container;
    console.log('📱 [LiveRenderer] Container set for rendering');
  }

  /**
   * Load a component dynamically
   */
  async loadComponent(componentId: string): Promise<React.ComponentType | null> {
    try {
      const metadata = this.componentRegistry.get(componentId);
      if (!metadata) {
        console.warn(`⚠️ [LiveRenderer] Component not found: ${componentId}`);
        return null;
      }

      console.log(`🔄 [LiveRenderer] Loading component: ${metadata.name}`);

      // Try to load actual component first
      const actualComponent = await this.loadActualComponent(componentId);
      if (actualComponent) {
        return actualComponent;
      }

      // Fallback to placeholder
      console.log(`📝 [LiveRenderer] Using placeholder for: ${componentId}`);
      const PlaceholderComponent = this.createPlaceholderComponent(metadata);
      
      return PlaceholderComponent;
    } catch (error) {
      console.error(`❌ [LiveRenderer] Failed to load component ${componentId}:`, error);
      return null;
    }
  }

  /**
   * Load actual component implementation
   */
  private async loadActualComponent(componentId: string): Promise<React.ComponentType | null> {
    try {
      // Create realistic demo components based on component ID
      switch (componentId) {
        case 'home-screen':
        case 'HomeScreen':
          return this.createHomeScreenComponent();
        
        case 'login-screen':
        case 'LoginForm':
          return this.createLoginFormComponent();
        
        case 'ProfileScreen':
          return this.createProfileScreenComponent();
        
        case 'SettingsScreen':
          return this.createSettingsScreenComponent();
        
        case 'ProductCard':
          return this.createProductCardComponent();
        
        case 'CartScreen':
          return this.createCartScreenComponent();
        
        case 'CheckoutScreen':
          return this.createCheckoutScreenComponent();
        
        case 'BookingCalendar':
          return this.createBookingCalendarComponent();
        
        default:
          return null;
      }
    } catch (error) {
      console.error(`❌ [LiveRenderer] Error loading actual component:`, error);
      return null;
    }
  }

  /**
   * Create Home Screen component
   */
  private createHomeScreenComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500
      }
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('h1', {
          key: 'title',
          style: {
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#2d3748'
          }
        }, 'Welcome Back!'),
        React.createElement('div', {
          key: 'avatar',
          style: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#3182ce',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 16,
            fontWeight: 600
          }
        }, 'JD')
      ]),

      // Quick Actions
      React.createElement('div', {
        key: 'quick-actions',
        style: {
          marginBottom: 24
        }
      }, [
        React.createElement('h2', {
          key: 'actions-title',
          style: {
            margin: 0,
            marginBottom: 16,
            fontSize: 18,
            fontWeight: 600,
            color: '#4a5568'
          }
        }, 'Quick Actions'),
        React.createElement('div', {
          key: 'actions-grid',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12
          }
        }, [
          React.createElement('button', {
            key: 'shop',
            style: {
              padding: '16px 12px',
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }
          }, [
            React.createElement('span', { key: 'icon', style: { fontSize: 24 } }, '🛍️'),
            React.createElement('span', { key: 'label', style: { fontSize: 12, fontWeight: 500 } }, 'Shop')
          ]),
          React.createElement('button', {
            key: 'bookings',
            style: {
              padding: '16px 12px',
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }
          }, [
            React.createElement('span', { key: 'icon', style: { fontSize: 24 } }, '📅'),
            React.createElement('span', { key: 'label', style: { fontSize: 12, fontWeight: 500 } }, 'Bookings')
          ]),
          React.createElement('button', {
            key: 'profile',
            style: {
              padding: '16px 12px',
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }
          }, [
            React.createElement('span', { key: 'icon', style: { fontSize: 24 } }, '👤'),
            React.createElement('span', { key: 'label', style: { fontSize: 12, fontWeight: 500 } }, 'Profile')
          ])
        ])
      ]),

      // Recent Activity
      React.createElement('div', {
        key: 'recent-activity',
        style: { flex: 1 }
      }, [
        React.createElement('h2', {
          key: 'activity-title',
          style: {
            margin: 0,
            marginBottom: 16,
            fontSize: 18,
            fontWeight: 600,
            color: '#4a5568'
          }
        }, 'Recent Activity'),
        React.createElement('div', {
          key: 'activity-list',
          style: {
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }
        }, [
          React.createElement('div', {
            key: 'activity-1',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#f7fafc'
            }
          }, [
            React.createElement('span', { key: 'icon', style: { fontSize: 20 } }, '🛒'),
            React.createElement('div', { key: 'content', style: { flex: 1 } }, [
              React.createElement('div', { key: 'title', style: { fontSize: 14, fontWeight: 500 } }, 'Order #1234 shipped'),
              React.createElement('div', { key: 'time', style: { fontSize: 12, color: '#718096' } }, '2 hours ago')
            ])
          ]),
          React.createElement('div', {
            key: 'activity-2',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#f7fafc'
            }
          }, [
            React.createElement('span', { key: 'icon', style: { fontSize: 20 } }, '📅'),
            React.createElement('div', { key: 'content', style: { flex: 1 } }, [
              React.createElement('div', { key: 'title', style: { fontSize: 14, fontWeight: 500 } }, 'Appointment confirmed'),
              React.createElement('div', { key: 'time', style: { fontSize: 12, color: '#718096' } }, 'Yesterday')
            ])
          ])
        ])
      ])
    ]);
  }

  /**
   * Create Login Form component
   */
  private createLoginFormComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        flex: 1,
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        margin: 10,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: 400,
        minHeight: 500
      }
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        style: { textAlign: 'center', marginBottom: 32 }
      }, [
        React.createElement('div', {
          key: 'icon',
          style: { fontSize: 48, marginBottom: 16 }
        }, '🔐'),
        React.createElement('h2', {
          key: 'title',
          style: { 
            margin: 0, 
            marginBottom: 8, 
            color: '#2d3748',
            fontSize: 28,
            fontWeight: 700
          }
        }, 'Sign In'),
        React.createElement('p', {
          key: 'subtitle',
          style: { 
            margin: 0, 
            color: '#718096',
            fontSize: 16
          }
        }, 'Welcome back! Please sign in to continue.')
      ]),

      // Form
      React.createElement('div', {
        key: 'form',
        style: { display: 'flex', flexDirection: 'column', gap: 20 }
      }, [
        // Email field
        React.createElement('div', {
          key: 'email-field',
          style: { display: 'flex', flexDirection: 'column', gap: 8 }
        }, [
          React.createElement('label', {
            key: 'email-label',
            style: { fontSize: 14, fontWeight: 600, color: '#4a5568' }
          }, 'Email Address'),
          React.createElement('input', {
            key: 'email-input',
            type: 'email',
            placeholder: 'Enter your email',
            style: {
              padding: '14px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 16,
              outline: 'none'
            }
          })
        ]),

        // Password field
        React.createElement('div', {
          key: 'password-field',
          style: { display: 'flex', flexDirection: 'column', gap: 8 }
        }, [
          React.createElement('label', {
            key: 'password-label',
            style: { fontSize: 14, fontWeight: 600, color: '#4a5568' }
          }, 'Password'),
          React.createElement('input', {
            key: 'password-input',
            type: 'password',
            placeholder: 'Enter your password',
            style: {
              padding: '14px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 16,
              outline: 'none'
            }
          })
        ]),

        // Submit button
        React.createElement('button', {
          key: 'submit',
          style: {
            padding: '16px 24px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 8
          }
        }, 'Sign In'),

        // Footer
        React.createElement('div', {
          key: 'footer',
          style: { textAlign: 'center', marginTop: 24 }
        }, [
          React.createElement('span', {
            key: 'text',
            style: { fontSize: 14, color: '#718096' }
          }, "Don't have an account? "),
          React.createElement('a', {
            key: 'link',
            href: '#',
            style: { fontSize: 14, color: '#3182ce', textDecoration: 'none', fontWeight: 600 }
          }, 'Sign up')
        ])
      ])
    ]);
  }

  /**
   * Create Product Card component
   */
  private createProductCardComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        margin: 10,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column'
      }
    }, [
      // Product image
      React.createElement('div', {
        key: 'image',
        style: {
          width: '100%',
          height: 200,
          backgroundColor: '#f7fafc',
          borderRadius: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64
        }
      }, '📱'),

      // Product info
      React.createElement('div', {
        key: 'info',
        style: { flex: 1, display: 'flex', flexDirection: 'column' }
      }, [
        React.createElement('h3', {
          key: 'title',
          style: {
            margin: 0,
            marginBottom: 8,
            fontSize: 20,
            fontWeight: 700,
            color: '#2d3748'
          }
        }, 'iPhone 15 Pro'),
        React.createElement('p', {
          key: 'description',
          style: {
            margin: 0,
            marginBottom: 16,
            fontSize: 14,
            color: '#718096',
            lineHeight: 1.5
          }
        }, 'The most advanced iPhone with titanium design and A17 Pro chip.'),

        // Price and action
        React.createElement('div', {
          key: 'price-section',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto'
          }
        }, [
          React.createElement('span', {
            key: 'price',
            style: {
              fontSize: 24,
              fontWeight: 800,
              color: '#2d3748'
            }
          }, '$999'),
          React.createElement('button', {
            key: 'add-to-cart',
            style: {
              padding: '12px 20px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }
          }, 'Add to Cart')
        ])
      ])
    ]);
  }

  /**
   * Create Booking Calendar component
   */
  private createBookingCalendarComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        margin: 10,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        minWidth: 350,
        minHeight: 400
      }
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('h3', {
          key: 'title',
          style: {
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: '#2d3748'
          }
        }, 'Book Appointment'),
        React.createElement('div', {
          key: 'nav',
          style: { display: 'flex', gap: 8 }
        }, [
          React.createElement('button', {
            key: 'prev',
            style: {
              padding: '8px 12px',
              backgroundColor: '#f7fafc',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }
          }, '←'),
          React.createElement('button', {
            key: 'next',
            style: {
              padding: '8px 12px',
              backgroundColor: '#f7fafc',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }
          }, '→')
        ])
      ]),

      // Calendar
      React.createElement('div', {
        key: 'calendar',
        style: { marginBottom: 20 }
      }, [
        React.createElement('div', {
          key: 'month',
          style: {
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 600,
            color: '#4a5568',
            marginBottom: 16
          }
        }, 'December 2024'),
        
        // Time slots
        React.createElement('div', {
          key: 'time-slots',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 16
          }
        }, [
          '9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:00 PM', '5:30 PM'
        ].map((time, i) =>
          React.createElement('button', {
            key: `time-${i}`,
            style: {
              padding: '10px 8px',
              backgroundColor: i === 1 ? '#3182ce' : '#f7fafc',
              color: i === 1 ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer'
            }
          }, time)
        ))
      ]),

      // Book button
      React.createElement('button', {
        key: 'book-button',
        style: {
          width: '100%',
          padding: '16px',
          backgroundColor: '#48bb78',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, 'Book Appointment')
    ]);
  }

  /**
   * Create Profile Screen component
   */
  private createProfileScreenComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500
      }
    }, [
      // Profile Header
      React.createElement('div', {
        key: 'profile-header',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 32,
          padding: 24,
          backgroundColor: 'white',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }, [
        React.createElement('div', {
          key: 'avatar',
          style: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#3182ce',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 32,
            fontWeight: 700
          }
        }, 'JD'),
        React.createElement('div', {
          key: 'info',
          style: { flex: 1 }
        }, [
          React.createElement('h1', {
            key: 'name',
            style: {
              margin: 0,
              marginBottom: 8,
              fontSize: 28,
              fontWeight: 700,
              color: '#2d3748'
            }
          }, 'John Doe'),
          React.createElement('p', {
            key: 'email',
            style: {
              margin: 0,
              fontSize: 16,
              color: '#718096'
            }
          }, 'john.doe@example.com'),
          React.createElement('div', {
            key: 'badges',
            style: {
              display: 'flex',
              gap: 8,
              marginTop: 12
            }
          }, [
            React.createElement('span', {
              key: 'premium',
              style: {
                padding: '4px 12px',
                backgroundColor: '#ffd700',
                color: '#744210',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600
              }
            }, '⭐ Premium'),
            React.createElement('span', {
              key: 'verified',
              style: {
                padding: '4px 12px',
                backgroundColor: '#48bb78',
                color: 'white',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600
              }
            }, '✓ Verified')
          ])
        ])
      ]),

      // Profile Options
      React.createElement('div', {
        key: 'profile-options',
        style: {
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }, [
        ['👤', 'Edit Profile', 'Update your personal information'],
        ['🔒', 'Privacy & Security', 'Manage your account security'],
        ['💳', 'Payment Methods', 'Manage cards and billing'],
        ['📱', 'Notifications', 'Control your notification preferences'],
        ['❓', 'Help & Support', 'Get help and contact support']
      ].map(([icon, title, subtitle], i) =>
        React.createElement('div', {
          key: `option-${i}`,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 16,
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }
        }, [
          React.createElement('span', {
            key: 'icon',
            style: { fontSize: 24 }
          }, icon),
          React.createElement('div', {
            key: 'content',
            style: { flex: 1 }
          }, [
            React.createElement('div', {
              key: 'title',
              style: {
                fontSize: 16,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 4
              }
            }, title),
            React.createElement('div', {
              key: 'subtitle',
              style: {
                fontSize: 14,
                color: '#718096'
              }
            }, subtitle)
          ]),
          React.createElement('span', {
            key: 'arrow',
            style: {
              fontSize: 16,
              color: '#a0aec0'
            }
          }, '→')
        ])
      ))
    ]);
  }

  /**
   * Create Settings Screen component
   */
  private createSettingsScreenComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500
      }
    }, [
      // Header
      React.createElement('h1', {
        key: 'title',
        style: {
          margin: 0,
          marginBottom: 24,
          fontSize: 28,
          fontWeight: 700,
          color: '#2d3748'
        }
      }, 'Settings'),

      // Settings Groups
      React.createElement('div', {
        key: 'settings-groups',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }
      }, [
        // App Settings
        React.createElement('div', {
          key: 'app-settings',
          style: {
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }
        }, [
          React.createElement('h2', {
            key: 'app-title',
            style: {
              margin: 0,
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 600,
              color: '#4a5568'
            }
          }, 'App Settings'),
          React.createElement('div', {
            key: 'app-options',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }
          }, [
            ['🌙', 'Dark Mode', false],
            ['🔔', 'Push Notifications', true],
            ['📍', 'Location Services', true],
            ['🔊', 'Sound Effects', false]
          ].map(([icon, label, enabled], i) =>
            React.createElement('div', {
              key: `app-${i}`,
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#f7fafc'
              }
            }, [
              React.createElement('div', {
                key: 'left',
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }
              }, [
                React.createElement('span', {
                  key: 'icon',
                  style: { fontSize: 20 }
                }, icon),
                React.createElement('span', {
                  key: 'label',
                  style: {
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#2d3748'
                  }
                }, label)
              ]),
              React.createElement('div', {
                key: 'toggle',
                style: {
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: enabled ? '#48bb78' : '#cbd5e0',
                  position: 'relative',
                  cursor: 'pointer'
                }
              }, React.createElement('div', {
                style: {
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 2,
                  left: enabled ? 22 : 2,
                  transition: 'left 0.2s'
                }
              }))
            ])
          ))
        ]),

        // Account Settings
        React.createElement('div', {
          key: 'account-settings',
          style: {
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }
        }, [
          React.createElement('h2', {
            key: 'account-title',
            style: {
              margin: 0,
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 600,
              color: '#4a5568'
            }
          }, 'Account'),
          React.createElement('div', {
            key: 'account-options',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }
          }, [
            ['🔐', 'Change Password'],
            ['📧', 'Email Preferences'],
            ['🗑️', 'Delete Account'],
            ['📤', 'Export Data']
          ].map(([icon, label], i) =>
            React.createElement('button', {
              key: `account-${i}`,
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 8,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }
            }, [
              React.createElement('span', {
                key: 'icon',
                style: { fontSize: 20 }
              }, icon),
              React.createElement('span', {
                key: 'label',
                style: {
                  fontSize: 16,
                  fontWeight: 500,
                  color: i === 2 ? '#e53e3e' : '#2d3748'
                }
              }, label)
            ])
          ))
        ])
      ])
    ]);
  }

  /**
   * Create Cart Screen component
   */
  private createCartScreenComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500
      }
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }
      }, [
        React.createElement('h1', {
          key: 'title',
          style: {
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#2d3748'
          }
        }, 'Shopping Cart'),
        React.createElement('span', {
          key: 'count',
          style: {
            padding: '6px 12px',
            backgroundColor: '#3182ce',
            color: 'white',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600
          }
        }, '3 items')
      ]),

      // Cart Items
      React.createElement('div', {
        key: 'cart-items',
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 24
        }
      }, [
        ['📱', 'iPhone 15 Pro', '$999', '1'],
        ['💻', 'MacBook Air', '$1299', '1'],
        ['🎧', 'AirPods Pro', '$249', '1']
      ].map(([icon, name, price, qty], i) =>
        React.createElement('div', {
          key: `item-${i}`,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 16,
            backgroundColor: 'white',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }
        }, [
          React.createElement('span', {
            key: 'icon',
            style: { fontSize: 32 }
          }, icon),
          React.createElement('div', {
            key: 'info',
            style: { flex: 1 }
          }, [
            React.createElement('h3', {
              key: 'name',
              style: {
                margin: 0,
                marginBottom: 4,
                fontSize: 16,
                fontWeight: 600,
                color: '#2d3748'
              }
            }, name),
            React.createElement('p', {
              key: 'price',
              style: {
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: '#3182ce'
              }
            }, price)
          ]),
          React.createElement('div', {
            key: 'quantity',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }
          }, [
            React.createElement('button', {
              key: 'minus',
              style: {
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f7fafc',
                border: 'none',
                cursor: 'pointer'
              }
            }, '−'),
            React.createElement('span', {
              key: 'qty',
              style: {
                fontSize: 16,
                fontWeight: 600,
                minWidth: 20,
                textAlign: 'center'
              }
            }, qty),
            React.createElement('button', {
              key: 'plus',
              style: {
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f7fafc',
                border: 'none',
                cursor: 'pointer'
              }
            }, '+')
          ])
        ])
      )),

      // Cart Summary
      React.createElement('div', {
        key: 'cart-summary',
        style: {
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }, [
        React.createElement('div', {
          key: 'summary-lines',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 20
          }
        }, [
          ['Subtotal', '$2,547'],
          ['Shipping', '$29'],
          ['Tax', '$204']
        ].map(([label, amount], i) =>
          React.createElement('div', {
            key: `line-${i}`,
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 16,
              color: '#4a5568'
            }
          }, [
            React.createElement('span', { key: 'label' }, label),
            React.createElement('span', { key: 'amount' }, amount)
          ])
        )),
        React.createElement('div', {
          key: 'total',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 20,
            fontWeight: 700,
            color: '#2d3748',
            paddingTop: 16,
            borderTop: '2px solid #e2e8f0',
            marginBottom: 20
          }
        }, [
          React.createElement('span', { key: 'label' }, 'Total'),
          React.createElement('span', { key: 'amount' }, '$2,780')
        ]),
        React.createElement('button', {
          key: 'checkout',
          style: {
            width: '100%',
            padding: '16px',
            backgroundColor: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer'
          }
        }, 'Proceed to Checkout')
      ])
    ]);
  }

  /**
   * Create Checkout Screen component
   */
  private createCheckoutScreenComponent(): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500
      }
    }, [
      // Header
      React.createElement('h1', {
        key: 'title',
        style: {
          margin: 0,
          marginBottom: 24,
          fontSize: 28,
          fontWeight: 700,
          color: '#2d3748'
        }
      }, 'Checkout'),

      // Progress Steps
      React.createElement('div', {
        key: 'progress',
        style: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: 32,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }, [
        ['1', 'Shipping', true],
        ['2', 'Payment', true],
        ['3', 'Review', false]
      ].map(([step, label, completed], i) =>
        React.createElement('div', {
          key: `step-${i}`,
          style: {
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }
        }, [
          React.createElement('div', {
            key: 'circle',
            style: {
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: completed ? '#48bb78' : '#e2e8f0',
              color: completed ? 'white' : '#a0aec0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600
            }
          }, completed ? '✓' : step),
          React.createElement('span', {
            key: 'label',
            style: {
              marginLeft: 8,
              fontSize: 14,
              fontWeight: 500,
              color: completed ? '#2d3748' : '#a0aec0'
            }
          }, label),
          i < 2 && React.createElement('div', {
            key: 'line',
            style: {
              flex: 1,
              height: 2,
              backgroundColor: completed ? '#48bb78' : '#e2e8f0',
              marginLeft: 16
            }
          })
        ])
      )),

      // Payment Form
      React.createElement('div', {
        key: 'payment-form',
        style: {
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 20
        }
      }, [
        React.createElement('h2', {
          key: 'form-title',
          style: {
            margin: 0,
            marginBottom: 20,
            fontSize: 20,
            fontWeight: 600,
            color: '#2d3748'
          }
        }, 'Payment Information'),
        React.createElement('div', {
          key: 'form-fields',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }
        }, [
          React.createElement('input', {
            key: 'card-number',
            type: 'text',
            placeholder: 'Card Number',
            style: {
              padding: '14px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 16
            }
          }),
          React.createElement('div', {
            key: 'card-details',
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16
            }
          }, [
            React.createElement('input', {
              key: 'expiry',
              type: 'text',
              placeholder: 'MM/YY',
              style: {
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 16
              }
            }),
            React.createElement('input', {
              key: 'cvv',
              type: 'text',
              placeholder: 'CVV',
              style: {
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 16
              }
            })
          ]),
          React.createElement('input', {
            key: 'name',
            type: 'text',
            placeholder: 'Cardholder Name',
            style: {
              padding: '14px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 16
            }
          })
        ])
      ]),

      // Order Summary
      React.createElement('div', {
        key: 'order-summary',
        style: {
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 20
        }
      }, [
        React.createElement('h3', {
          key: 'summary-title',
          style: {
            margin: 0,
            marginBottom: 16,
            fontSize: 18,
            fontWeight: 600,
            color: '#2d3748'
          }
        }, 'Order Summary'),
        React.createElement('div', {
          key: 'total',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 20,
            fontWeight: 700,
            color: '#2d3748'
          }
        }, [
          React.createElement('span', { key: 'label' }, 'Total'),
          React.createElement('span', { key: 'amount' }, '$2,780')
        ])
      ]),

      // Place Order Button
      React.createElement('button', {
        key: 'place-order',
        style: {
          width: '100%',
          padding: '18px',
          backgroundColor: '#3182ce',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, 'Place Order')
    ]);
  }

  /**
   * Create a placeholder component for testing
   */
  private createPlaceholderComponent(metadata: ComponentMetadata): React.ComponentType {
    return () => React.createElement('div', {
      style: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: 8,
        margin: 10
      }
    }, [
      React.createElement('h3', { 
        key: 'title',
        style: { 
          margin: 0, 
          marginBottom: 8, 
          color: '#495057',
          fontSize: 18,
          fontWeight: 600
        } 
      }, metadata.name),
      React.createElement('p', { 
        key: 'desc',
        style: { 
          margin: 0, 
          color: '#6c757d',
          fontSize: 14,
          textAlign: 'center'
        } 
      }, metadata.description || 'Component preview'),
      React.createElement('div', {
        key: 'category',
        style: {
          marginTop: 12,
          padding: '4px 8px',
          backgroundColor: '#e9ecef',
          borderRadius: 4,
          fontSize: 12,
          color: '#495057',
          fontWeight: 500
        }
      }, metadata.category)
    ]);
  }

  /**
   * Render a component in the phone frame
   */
  async renderComponent(componentId: string, options: RenderOptions = {}) {
    if (!this.container) {
      console.error('❌ [LiveRenderer] No container set for rendering');
      return;
    }

    try {
      console.log(`🎨 [LiveRenderer] Rendering component: ${componentId}`);

      let component = await this.loadComponent(componentId);
      if (!component) {
        // Create a basic component for dropped/unknown components
        console.log(`🔄 [LiveRenderer] Creating placeholder for unknown component: ${componentId}`);
        const metadata: ComponentMetadata = {
          id: componentId,
          name: componentId,
          category: 'dropped',
          path: '',
          description: `Dropped component: ${componentId}`
        };
        this.componentRegistry.set(componentId, metadata);
        component = this.createPlaceholderComponent(metadata);
      }

      this.currentComponent = component;
      this.currentProps = options.props || {};

      // Create the component element
      const componentElement = React.createElement(component, this.currentProps);

          // Wrap in a phone-appropriate container
    const wrappedElement = this.wrapForPhoneFrame(componentElement, options);

    // Create or reuse React root
    if (!this.reactRoot && this.container) {
      const { createRoot } = await import('react-dom/client');
      this.reactRoot = createRoot(this.container);
    }

    // Render using React Native Web
    if (this.reactRoot) {
      this.reactRoot.render(wrappedElement);
    }

    console.log(`✅ [LiveRenderer] Successfully rendered: ${componentId}`);
    } catch (error) {
      console.error(`❌ [LiveRenderer] Failed to render component ${componentId}:`, error);
      this.renderError(`Failed to render: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Wrap component for phone frame rendering
   */
  private wrapForPhoneFrame(component: React.ReactElement, options: RenderOptions) {
    const { deviceType = 'iphone' } = options;

    return React.createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        position: 'relative'
      }
    }, [
      // Status bar simulation
      React.createElement('div', {
        key: 'status-bar',
        style: {
          height: 44,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          color: '#ffffff',
          fontSize: 14,
          fontWeight: '600'
        }
      }, [
        React.createElement('span', { key: 'time' }, '15:47'),
        React.createElement('div', { 
          key: 'indicators',
          style: { display: 'flex', gap: 4 }
        }, [
          React.createElement('span', { key: 'signal' }, '📶'),
          React.createElement('span', { key: 'wifi' }, '📶'),
          React.createElement('span', { key: 'battery' }, '🔋')
        ])
      ]),
      
      // Component content area
      React.createElement('div', {
        key: 'content',
        style: {
          flex: 1,
          overflow: 'auto',
          position: 'relative'
        }
      }, component)
    ]);
  }

  /**
   * Render an error state
   */
  private renderError(message: string) {
    if (!this.container) return;

    const errorElement = React.createElement('div', {
      style: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff5f5',
        border: '2px dashed #fed7d7',
        borderRadius: 8,
        margin: 10
      }
    }, [
      React.createElement('div', {
        key: 'icon',
        style: { fontSize: 48, marginBottom: 16 }
      }, '⚠️'),
      React.createElement('h3', {
        key: 'title',
        style: { 
          margin: 0, 
          marginBottom: 8, 
          color: '#c53030',
          fontSize: 16,
          fontWeight: 600
        }
      }, 'Render Error'),
      React.createElement('p', {
        key: 'message',
        style: { 
          margin: 0, 
          color: '#742a2a',
          fontSize: 14,
          textAlign: 'center'
        }
      }, message)
    ]);

    // Create or reuse React root for error rendering
    if (!this.reactRoot && this.container) {
      const { createRoot } = require('react-dom/client');
      this.reactRoot = createRoot(this.container);
    }

    if (this.reactRoot) {
      this.reactRoot.render(errorElement);
    }
  }

  /**
   * Update component props and re-render
   */
  async updateComponentProps(newProps: Record<string, any>) {
    if (!this.currentComponent) {
      console.warn('⚠️ [LiveRenderer] No component currently rendered');
      return;
    }

    this.currentProps = { ...this.currentProps, ...newProps };
    
    // Re-render with updated props
    const componentElement = React.createElement(this.currentComponent, this.currentProps);
    const wrappedElement = this.wrapForPhoneFrame(componentElement, {});

    if (this.container) {
      const { createRoot } = require('react-dom/client');
      const root = createRoot(this.container);
      root.render(wrappedElement);
      
      console.log('🔄 [LiveRenderer] Component props updated');
    }
  }

  /**
   * Clear the current render
   */
  clear() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    
    if (this.container) {
      this.container.innerHTML = '';
      this.currentComponent = null;
      this.currentProps = {};
      console.log('🧹 [LiveRenderer] Render cleared');
    }
  }

  /**
   * Get current component info
   */
  getCurrentComponent(): { component: React.ComponentType | null; props: Record<string, any> } {
    return {
      component: this.currentComponent,
      props: this.currentProps
    };
  }
}

// Export singleton instance
export const liveRenderer = new LiveRenderer();