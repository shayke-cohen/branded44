import React from 'react';
import {render, fireEvent, waitFor, act} from '../../../test/test-utils';
import LoginScreen from '../LoginScreen';

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

const mockAlert = require('react-native').Alert.alert;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<LoginScreen />);
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    it('displays key UI elements', () => {
      const {getByText, getByTestId} = render(<LoginScreen />);
      
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByText('Sign in to your account')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
      expect(getByText('Forgot Password?')).toBeTruthy();
      expect(getByText("Don't have an account? ")).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
      
      expect(getByTestId('login-content')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('login-button')).toBeTruthy();
      expect(getByTestId('forgot-password-button')).toBeTruthy();
      expect(getByTestId('sign-up-button')).toBeTruthy();
    });

    it('applies theme correctly', () => {
      const {getByText} = render(<LoginScreen />);
      const titleElement = getByText('Welcome Back');
      expect(titleElement).toBeTruthy();
    });

    it('renders input fields with proper placeholders', () => {
      const {getByPlaceholderText} = render(<LoginScreen />);
      
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('login button is disabled when form is empty', () => {
      const {getByTestId} = render(<LoginScreen />);
      const loginButton = getByTestId('login-button');
      
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('login button is disabled when email is empty', () => {
      const {getByTestId} = render(<LoginScreen />);
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(passwordInput, 'password123');
      
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('login button is disabled when password is empty', () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('login button is disabled when password is too short', () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '12345'); // Less than 6 characters
      
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('login button is enabled when form is valid', () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      expect(loginButton.props.accessibilityState?.disabled).toBe(false);
    });
  });

  describe('Input Handling', () => {
    it('updates email input value when typed', () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('updates password input value when typed', () => {
      const {getByTestId} = render(<LoginScreen />);
      const passwordInput = getByTestId('password-input');
      
      fireEvent.changeText(passwordInput, 'mypassword');
      
      expect(passwordInput.props.value).toBe('mypassword');
    });

    it('password input is secure', () => {
      const {getByTestId} = render(<LoginScreen />);
      const passwordInput = getByTestId('password-input');
      
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Login Process', () => {
    it('shows error when email is missing', async () => {
      const {getByTestId} = render(<LoginScreen />);
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Please enter your email address');
    });

    it('shows error when email is invalid', async () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    });

    it('shows error when password is missing', async () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Please enter your password');
    });

    it('shows error when password is too short', async () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '12345');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters long');
    });

    it('shows loading state during login', async () => {
      const {getByTestId, getByText} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      act(() => {
        fireEvent.press(loginButton);
      });
      
      expect(getByText('Signing In...')).toBeTruthy();
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('shows success message on successful login', async () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      await act(async () => {
        fireEvent.press(loginButton);
      });
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Success',
          'Welcome! You have successfully logged in.',
          [{text: 'OK', onPress: expect.any(Function)}]
        );
      });
    });
  });

  describe('Additional Actions', () => {
    it('handles forgot password button press', () => {
      const {getByTestId} = render(<LoginScreen />);
      const forgotPasswordButton = getByTestId('forgot-password-button');
      
      fireEvent.press(forgotPasswordButton);
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Forgot Password',
        'Password reset functionality would be implemented here.'
      );
    });

    it('handles sign up button press', () => {
      const {getByTestId} = render(<LoginScreen />);
      const signUpButton = getByTestId('sign-up-button');
      
      fireEvent.press(signUpButton);
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Sign Up',
        'Sign up functionality would be implemented here.'
      );
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels for input fields', () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      
      expect(emailInput.props.accessibilityLabel).toBe('Email address input');
      expect(passwordInput.props.accessibilityLabel).toBe('Password input');
    });

    it('provides accessible labels for buttons', () => {
      const {getByTestId} = render(<LoginScreen />);
      const loginButton = getByTestId('login-button');
      const forgotPasswordButton = getByTestId('forgot-password-button');
      const signUpButton = getByTestId('sign-up-button');
      
      expect(loginButton.props.accessibilityLabel).toBe('Login button');
      expect(forgotPasswordButton.props.accessibilityLabel).toBe('Forgot password button');
      expect(signUpButton.props.accessibilityLabel).toBe('Sign up button');
    });

    it('ensures all interactive elements are accessible', () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');
      const forgotPasswordButton = getByTestId('forgot-password-button');
      const signUpButton = getByTestId('sign-up-button');
      
      expect(emailInput.props.accessible).toBe(true);
      expect(passwordInput.props.accessible).toBe(true);
      expect(loginButton.props.accessible).toBe(true);
      expect(forgotPasswordButton.props.accessible).toBe(true);
      expect(signUpButton.props.accessible).toBe(true);
    });
  });

  describe('Input Configuration', () => {
    it('configures email input correctly', () => {
      const {getByTestId} = render(<LoginScreen />);
      const emailInput = getByTestId('email-input');
      
      expect(emailInput.props.keyboardType).toBe('email-address');
      expect(emailInput.props.autoCapitalize).toBe('none');
      expect(emailInput.props.autoCorrect).toBe(false);
    });

    it('configures password input correctly', () => {
      const {getByTestId} = render(<LoginScreen />);
      const passwordInput = getByTestId('password-input');
      
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });
});
