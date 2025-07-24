import React, {ReactElement} from 'react';
import {render, RenderOptions} from '@testing-library/react-native';
import {ThemeProvider} from '../context/ThemeContext';
import {CartProvider} from '../context/CartContext';
import {WixCartProvider} from '../context/WixCartContext';
import {MemberProvider} from '../context/MemberContext';
import {ProductCacheProvider} from '../context/ProductCacheContext';

// Custom render function that includes providers
const AllTheProviders = ({children}: {children: React.ReactNode}) => {
  return (
    <ThemeProvider>
      <CartProvider>
        <MemberProvider>
          <WixCartProvider>
            <ProductCacheProvider>
              {children}
            </ProductCacheProvider>
          </WixCartProvider>
        </MemberProvider>
      </CartProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, {wrapper: AllTheProviders, ...options});

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export {customRender as render};

// Test data helpers
export const createMockYogaClass = (overrides = {}) => ({
  id: '1',
  name: 'Test Yoga Class',
  instructor: 'Test Instructor',
  duration: 60,
  difficulty: 'Beginner' as const,
  time: '9:00 AM',
  isBooked: false,
  ...overrides,
});

export const createMockYogaClasses = (count = 3) =>
  Array.from({length: count}, (_, index) =>
    createMockYogaClass({
      id: String(index + 1),
      name: `Test Yoga Class ${index + 1}`,
      instructor: `Instructor ${index + 1}`,
      difficulty: index % 3 === 0 ? 'Beginner' : index % 3 === 1 ? 'Intermediate' : 'Advanced',
      isBooked: index % 2 === 0,
    }),
  );

// Common test helpers
export const waitForElementToBeRemoved = async (
  element: any,
  options?: any,
) => {
  const {waitForElementToBeRemoved: originalWaitForElementToBeRemoved} =
    await import('@testing-library/react-native');
  return originalWaitForElementToBeRemoved(element, options);
};

// Mock functions
export const mockAlert = jest.fn();
export const mockUseColorScheme = jest.fn(() => 'light');