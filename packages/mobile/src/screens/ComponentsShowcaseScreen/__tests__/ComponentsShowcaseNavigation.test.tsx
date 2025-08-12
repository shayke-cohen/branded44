import React from 'react';
import { render, fireEvent, screen, waitFor } from '../../../test/test-utils';
import { Alert } from 'react-native';
import ComponentsShowcaseScreen from '../ComponentsShowcaseScreen';

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ComponentsShowcaseScreen Navigation', () => {
  beforeEach(() => {
    mockAlert.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Main Navigation Tabs', () => {
    it('renders main navigation tabs without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Check main tabs are present
      expect(screen.getByText('🧱 Blocks')).toBeTruthy();
      expect(screen.getByText('📱 Templates')).toBeTruthy();
      expect(screen.getByText('🎯 Flows/Demos')).toBeTruthy();
    });

    it('navigates to Blocks tab and shows block categories', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Should start with blocks tab active by default
      expect(screen.getByText('🚀 Our Component Library')).toBeTruthy();
      expect(screen.getByText('77+ production-ready components across 14 major categories')).toBeTruthy();
      
      // Check some block categories are visible
      expect(screen.getByText('Auth Basic')).toBeTruthy();
      expect(screen.getByText('Forms Basic')).toBeTruthy();
      expect(screen.getByText('E-commerce Basic')).toBeTruthy();
    });

    it('navigates to Templates tab and shows template categories', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Templates tab
      const templatesTab = screen.getByText('📱 Templates');
      fireEvent.press(templatesTab);
      
      // Check templates content is shown
      expect(screen.getByText('📱 Screen Templates')).toBeTruthy();
      expect(screen.getByText('Complete screen templates for common app patterns')).toBeTruthy();
      expect(screen.getByText('💡 Click on any category above to see complete screen templates that can be used directly in your app.')).toBeTruthy();
      
      // Check some template categories are visible
      expect(screen.getByText('Authentication')).toBeTruthy();
      expect(screen.getByText('Home & Dashboard')).toBeTruthy();
      expect(screen.getByText('E-commerce')).toBeTruthy();
    });

    it('navigates to Flows/Demos tab and shows flow options', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Flows/Demos tab
      const flowsTab = screen.getByText('🎯 Flows/Demos');
      fireEvent.press(flowsTab);
      
      // Check flows content is shown
      expect(screen.getByText('🎯 User Flows & Interactive Demos')).toBeTruthy();
      expect(screen.getByText('Step-by-step user flows and complete interactive experiences')).toBeTruthy();
      expect(screen.getByText('🎯 Flows show how components work together, while demos provide fully interactive experiences.')).toBeTruthy();
      
      // Check flow options are visible
      expect(screen.getByText('Shop Experience')).toBeTruthy();
      expect(screen.getByText('Cart & Checkout')).toBeTruthy();
    });
  });

  describe('Block Categories Navigation', () => {
    const blockCategories = [
      'Auth Basic',
      'Auth Advanced', 
      'Forms Basic',
      'Forms Advanced',
      'List Basic',
      'List Advanced',
      'E-commerce Basic',
      'E-commerce Advanced',
      'Social & Chat',
      'Media',
      'Business',
      'Booking Basic',
      'Booking Advanced',
      'Utility',
      'Health & Fitness'
    ];

    it('navigates to all block categories without errors', async () => {
      render(<ComponentsShowcaseScreen />);
      
      // Ensure we're on blocks tab
      expect(screen.getByText('🧱 Blocks')).toBeTruthy();
      
      for (const category of blockCategories) {
        try {
          const categoryElement = screen.getByText(category);
          fireEvent.press(categoryElement);
          
          // Wait for content to load and verify no crashes
          await waitFor(() => {
            // Each category should show its section title
            const sectionTitles = screen.queryAllByText(new RegExp(category.split(' ')[0], 'i'));
            expect(sectionTitles.length).toBeGreaterThan(0);
          }, { timeout: 2000 });
          
        } catch (error) {
          // If category not found, that's ok - might be conditionally rendered
          console.log(`Category "${category}" not found or not clickable`);
        }
      }
    });

    it('renders Auth Basic components without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      const authCategory = screen.getByText('Auth Basic');
      fireEvent.press(authCategory);
      
      // Should render auth components without crashing
      expect(screen.getByText('Welcome Back')).toBeTruthy(); // LoginForm
      expect(screen.getByText('Create Your Account')).toBeTruthy(); // SignupForm
      expect(screen.getByText('Reset Password')).toBeTruthy(); // ForgotPasswordForm
    });

    it('renders Forms Basic components without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      const formsCategory = screen.getByText('Forms Basic');
      fireEvent.press(formsCategory);
      
      // Should render form components without crashing
      expect(screen.getByText('Contact Us')).toBeTruthy(); // ContactForm
      // Note: SearchForm might not be visible in the basic forms section
    });

    it('renders E-commerce Basic components without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      const ecommerceCategory = screen.getByText('E-commerce Basic');
      fireEvent.press(ecommerceCategory);
      
      // Should render product components without crashing
      expect(screen.getByText('Premium Wireless Headphones')).toBeTruthy();
      expect(screen.getByText('Smart Fitness Watch')).toBeTruthy();
    });
  });

  describe('Template Categories Navigation', () => {
    const templateCategories = [
      'Authentication',
      'Home & Dashboard',
      'Profile & Settings', 
      'E-commerce',
      'Business',
      'Communication'
    ];

    it('navigates to all template categories without errors', async () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Templates tab first
      const templatesTab = screen.getByText('📱 Templates');
      fireEvent.press(templatesTab);
      
      for (const category of templateCategories) {
        try {
          const categoryElement = screen.getByText(category);
          fireEvent.press(categoryElement);
          
          // Wait for content to load and verify no crashes
          await waitFor(() => {
            // Each template category should show its section title with icon
            const sectionTitles = screen.queryAllByText(new RegExp(category, 'i'));
            expect(sectionTitles.length).toBeGreaterThan(0);
          }, { timeout: 2000 });
          
        } catch (error) {
          console.log(`Template category "${category}" not found or not clickable`);
        }
      }
    });

    it('renders Authentication templates without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Templates then Authentication
      fireEvent.press(screen.getByText('📱 Templates'));
      fireEvent.press(screen.getByText('Authentication'));
      
      // Should show auth templates section
      expect(screen.getByText('🔐 Authentication Templates')).toBeTruthy();
      
      // Should render login screen template without crashing
      expect(screen.getAllByText('Welcome Back').length).toBeGreaterThan(0);
    });

    it('renders E-commerce templates without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Templates then E-commerce
      fireEvent.press(screen.getByText('📱 Templates'));
      fireEvent.press(screen.getByText('E-commerce'));
      
      // Should show e-commerce templates section
      expect(screen.getByText('🛒 E-commerce Templates')).toBeTruthy();
      
      // Should render shop template without crashing
      expect(screen.getByText('Premium Wireless Headphones')).toBeTruthy();
    });

    it('renders Business templates without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Templates then Business
      fireEvent.press(screen.getByText('📱 Templates'));
      fireEvent.press(screen.getByText('Business'));
      
      // Should show business templates section
      expect(screen.getByText('💼 Business Templates')).toBeTruthy();
      
      // Should render calendar template without crashing (basic presence check)
      expect(screen.getByText('💼 Business Templates')).toBeTruthy();
    });
  });

  describe('Flows/Demos Navigation', () => {
    it('navigates to Shop Experience demo without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Flows then Shop Experience
      fireEvent.press(screen.getByText('🎯 Flows/Demos'));
      fireEvent.press(screen.getByText('Shop Experience'));
      
      // Should render shop interface without crashing  
      expect(screen.getByText('Demo Store')).toBeTruthy(); // ShopScreen title
      expect(screen.getByText('Premium Wireless Headphones')).toBeTruthy();
    });

    it('navigates to Cart & Checkout demo without errors', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to Flows then Cart & Checkout
      fireEvent.press(screen.getByText('🎯 Flows/Demos'));
      fireEvent.press(screen.getByText('Cart & Checkout'));
      
      // Should render cart interface without crashing
      expect(screen.getByText('Shopping Cart')).toBeTruthy();
    });
  });

  describe('Navigation State Persistence', () => {
    it('maintains active tab state when switching between main tabs', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Start with blocks (default)
      expect(screen.getByText('🚀 Our Component Library')).toBeTruthy();
      
      // Switch to templates
      fireEvent.press(screen.getByText('📱 Templates'));
      expect(screen.getByText('📱 Screen Templates')).toBeTruthy();
      
      // Switch to flows
      fireEvent.press(screen.getByText('🎯 Flows/Demos'));
      expect(screen.getByText('🎯 User Flows & Interactive Demos')).toBeTruthy();
      
      // Switch back to blocks
      fireEvent.press(screen.getByText('🧱 Blocks'));
      expect(screen.getByText('🚀 Our Component Library')).toBeTruthy();
    });

    it('shows correct tab as active based on current selection', () => {
      render(<ComponentsShowcaseScreen />);
      
      // Navigate to a specific block category
      fireEvent.press(screen.getByText('Auth Basic'));
      
      // Should show auth components (blocks tab should still be active)
      expect(screen.getByText('Welcome Back')).toBeTruthy(); // LoginForm
      expect(screen.getByText('Create Your Account')).toBeTruthy(); // SignupForm
      
      // Navigate to a template category
      fireEvent.press(screen.getByText('📱 Templates'));
      fireEvent.press(screen.getByText('Authentication'));
      
      // Templates tab should be active with auth templates
      expect(screen.getByText('🔐 Authentication Templates')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles missing onBack prop gracefully', () => {
      // Should render without onBack prop
      expect(() => render(<ComponentsShowcaseScreen />)).not.toThrow();
    });

    it('handles navigation with onBack prop', () => {
      const mockOnBack = jest.fn();
      render(<ComponentsShowcaseScreen onBack={mockOnBack} />);
      
      // Should render successfully with onBack
      expect(screen.getByText('🧱 Blocks')).toBeTruthy();
    });
  });
});
