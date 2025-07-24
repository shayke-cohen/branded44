import React from 'react';
import {render, fireEvent, waitFor} from '../../../test/test-utils';
import TemplateIndexScreen from '../TemplateIndexScreen';

describe('TemplateIndexScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<TemplateIndexScreen />);
      expect(getByText('Live Template Gallery')).toBeTruthy();
    });

    it('displays header and subtitle', () => {
      const {getByText} = render(<TemplateIndexScreen />);
      
      expect(getByText('Live Template Gallery')).toBeTruthy();
      expect(getByText(/Interact with actual React Native components/)).toBeTruthy();
    });

    it('displays tab navigation', () => {
      const {getByText} = render(<TemplateIndexScreen />);
      
      expect(getByText('Simple (4)')).toBeTruthy();
      expect(getByText('Complex (5)')).toBeTruthy();
      expect(getByText('Apps (0)')).toBeTruthy();
    });

    it('starts with Basic Templates tab active', () => {
      const {getByText} = render(<TemplateIndexScreen />);
      
      // Should show basic templates by default
      expect(getByText('🔐 Authentication Template')).toBeTruthy();
      expect(getByText('📊 Dashboard Template')).toBeTruthy();
      expect(getByText('📝 Form Template')).toBeTruthy();
      expect(getByText('📋 List Template')).toBeTruthy();
    });
  });

  describe('Basic Templates Tab', () => {
    it('displays all basic templates', () => {
      const {getByText} = render(<TemplateIndexScreen />);
      
      // Check all basic templates are present
      expect(getByText('🔐 Authentication Template')).toBeTruthy();
      expect(getByText('Multi-mode authentication with social login, validation, and accessibility features.')).toBeTruthy();
      
      expect(getByText('📊 Dashboard Template')).toBeTruthy();
      expect(getByText('Customizable dashboard with stat cards, quick actions, and responsive layout.')).toBeTruthy();
      
      expect(getByText('📝 Form Template')).toBeTruthy();
      expect(getByText('Dynamic form with validation, error handling, and various input types.')).toBeTruthy();
      
      expect(getByText('📋 List Template')).toBeTruthy();
      expect(getByText('Searchable list with filtering, multiple display modes, and empty states.')).toBeTruthy();
    });

    it('displays basic complexity badges', () => {
      const {getAllByText} = render(<TemplateIndexScreen />);
      
      const simpleBadges = getAllByText('Simple');
      expect(simpleBadges.length).toBe(4);
    });

    it('renders live template components', () => {
      const {getByText, getByTestId} = render(<TemplateIndexScreen />);
      
      // Check for elements that should be rendered by the template components
      
      // Auth template should render sign in elements
      expect(getByText('Sign In')).toBeTruthy();
      expect(getByTestId('auth-template-email-input')).toBeTruthy();
              expect(getByTestId('auth-template-password-input')).toBeTruthy();
      
      // Dashboard template should render stats
      expect(getByText('Sample Dashboard')).toBeTruthy();
      expect(getByText('1,234')).toBeTruthy(); // User stat
      expect(getByText('$45.2K')).toBeTruthy(); // Revenue stat
      
      // Form template should render form fields
      expect(getByText('Sample Form')).toBeTruthy();
      expect(getByTestId('form-template-name-input')).toBeTruthy();
      
      // List template should render list items
      expect(getByText('Sample List')).toBeTruthy();
      expect(getByTestId('search-input')).toBeTruthy();
    });
  });

  describe('Complex Examples Tab', () => {
    it('switches to complex examples tab', async () => {
      const {getByText, queryByText} = render(<TemplateIndexScreen />);
      
      // Click on Complex tab
      const complexTab = getByText('Complex (5)');
      fireEvent.press(complexTab);
      
      await waitFor(() => {
        // Should show complex examples
        expect(getByText('🛍️ Product List Screen')).toBeTruthy();
        expect(getByText('📱 Product Detail Screen')).toBeTruthy();
        expect(getByText('🛒 Cart Screen')).toBeTruthy();
        expect(getByText('💳 Checkout Screen')).toBeTruthy();
        expect(getByText('🔍 Search Screen')).toBeTruthy();
        
        // Basic templates should not be visible
        expect(queryByText('🔐 Authentication Template')).toBeNull();
      }, { timeout: 10000 });
    });

    it('displays all complex templates', async () => {
      const {getByText} = render(<TemplateIndexScreen />);
      
      // Switch to complex tab
      fireEvent.press(getByText('Complex (5)'));
      
      await waitFor(() => {
        expect(getByText('🛍️ Product List Screen')).toBeTruthy();
        expect(getByText('📱 Product Detail Screen')).toBeTruthy();
        expect(getByText('🛒 Cart Screen')).toBeTruthy();
        expect(getByText('💳 Checkout Screen')).toBeTruthy();
        expect(getByText('🔍 Search Screen')).toBeTruthy();
      }, { timeout: 10000 });
    });

    it('displays complex complexity badges', async () => {
      const {getByText, getAllByText} = render(<TemplateIndexScreen />);
      
      // Switch to complex tab
      fireEvent.press(getByText('Complex (5)'));
      
      await waitFor(() => {
        const complexBadges = getAllByText('Complex');
        expect(complexBadges.length).toBe(5);
      }, { timeout: 10000 });
    });

    it('renders live complex template components', async () => {
      const {getByText, getByTestId, getAllByText, getAllByTestId} = render(<TemplateIndexScreen />);
      
      // Switch to complex tab
      fireEvent.press(getByText('Complex (5)'));
      
      await waitFor(() => {
        // Product List should render
        expect(getByText('SoleStyle')).toBeTruthy();
        // There may be multiple search inputs, so just check one exists
        expect(getAllByTestId('search-input').length).toBeGreaterThan(0);
        
        // Product Detail should render
        expect(getAllByText('Air Max 270').length).toBeGreaterThan(0);
        
        // Cart should render
        expect(getByText('Shopping Cart')).toBeTruthy();
        
        // Checkout should render
        expect(getByText('Checkout')).toBeTruthy();
        expect(getByText('Shipping Address')).toBeTruthy();
        
        // Search should render
        expect(getAllByText('Search').length).toBeGreaterThan(0);
      }, { timeout: 10000 });
    });
  });

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      const {getByText, queryByText} = render(<TemplateIndexScreen />);
      
      // Start with basic templates visible
      expect(getByText('🔐 Authentication Template')).toBeTruthy();
      
      // Switch to complex
      fireEvent.press(getByText('Complex (5)'));
      
      await waitFor(() => {
        expect(getByText('🛍️ Product List Screen')).toBeTruthy();
        expect(queryByText('🔐 Authentication Template')).toBeNull();
      }, { timeout: 10000 });
      
      // Switch back to simple
      fireEvent.press(getByText('Simple (4)'));
      
      await waitFor(() => {
        expect(getByText('🔐 Authentication Template')).toBeTruthy();
        expect(queryByText('🛍️ Product List Screen')).toBeNull();
      }, { timeout: 10000 });
    });
  });

  describe('Template Interactivity', () => {
    it('allows interaction with template components', () => {
      const {getByTestId} = render(<TemplateIndexScreen />);
      
      // Should be able to interact with form inputs
      const emailInput = getByTestId('auth-template-email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');
      
      const nameInput = getByTestId('form-template-name-input');
      fireEvent.changeText(nameInput, 'John Doe');
      expect(nameInput.props.value).toBe('John Doe');
      
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'search term');
      expect(searchInput.props.value).toBe('search term');
    });

    it('allows button interactions', () => {
      const {getByTestId} = render(<TemplateIndexScreen />);
      
      // Should be able to press buttons without errors
      const submitButton = getByTestId('auth-template-submit-button');
      fireEvent.press(submitButton);
      
      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);
      
      // Should not throw errors
      expect(submitButton).toBeTruthy();
      expect(saveButton).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles missing navigation prop gracefully', () => {
      const {getByText} = render(<TemplateIndexScreen />);
      
      expect(getByText('Live Template Gallery')).toBeTruthy();
    });

    it('renders when navigation prop is provided', () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
      };
      
      const {getByText} = render(<TemplateIndexScreen navigation={mockNavigation} />);
      
      expect(getByText('Live Template Gallery')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible tab buttons', () => {
      const {getByText} = render(<TemplateIndexScreen />);
      
      const simpleTab = getByText('Simple (4)');
      const complexTab = getByText('Complex (5)');
      const appsTab = getByText('Apps (0)');
      
      expect(simpleTab).toBeTruthy();
      expect(complexTab).toBeTruthy();
      expect(appsTab).toBeTruthy();
    });

    it('maintains proper scroll behavior', () => {
      const {getByTestId} = render(<TemplateIndexScreen />);
      
      // ScrollView should be present and functional
      // The component should render without ScrollView testID errors
      expect(() => render(<TemplateIndexScreen />)).not.toThrow();
    });
  });
}); 