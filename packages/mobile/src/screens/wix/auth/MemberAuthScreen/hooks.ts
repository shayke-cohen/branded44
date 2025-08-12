/**
 * useMemberAuth - Custom hook for member authentication logic
 * 
 * Centralizes all member auth state management and business logic
 * Makes screens thin and focused on presentation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { memberService, MemberCredentials, MemberRegistrationData, MemberProfile } from '../shared/WixMemberService';
import { useMember } from '../../../../context';

interface UseMemberAuthState {
  isLogin: boolean;
  loading: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  error: string | null;
  success: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface UseMemberAuthActions {
  setIsLogin: (isLogin: boolean) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  handleLogin: () => Promise<void>;
  handleRegister: () => Promise<void>;
  handleLogout: () => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
  clearForm: () => void;
  validateForm: () => boolean;
}

interface UseMemberAuthReturn extends UseMemberAuthState, UseMemberAuthActions {
  canSubmit: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong';
  isFormValid: boolean;
}

const INITIAL_STATE: UseMemberAuthState = {
  isLogin: true,
  loading: false,
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  error: null,
  success: null,
  fieldErrors: {},
};

export const useMemberAuth = (): UseMemberAuthReturn => {
  // State
  const [state, setState] = useState<UseMemberAuthState>(INITIAL_STATE);
  
  // Member context
  const { isLoggedIn, member, refreshMemberStatus } = useMember();
  
  // Refs
  const mounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseMemberAuthState> | ((prev: UseMemberAuthState) => UseMemberAuthState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Set authentication mode (login/register)
   */
  const setIsLogin = useCallback((isLogin: boolean) => {
    safeSetState({ 
      isLogin, 
      error: null, 
      success: null, 
      fieldErrors: {} 
    });
  }, [safeSetState]);

  /**
   * Form field setters
   */
  const setEmail = useCallback((email: string) => {
    safeSetState(prev => ({ 
      email, 
      fieldErrors: { ...prev.fieldErrors, email: undefined } 
    }));
  }, [safeSetState]);

  const setPassword = useCallback((password: string) => {
    safeSetState(prev => ({ 
      password, 
      fieldErrors: { ...prev.fieldErrors, password: undefined } 
    }));
  }, [safeSetState]);

  const setConfirmPassword = useCallback((confirmPassword: string) => {
    safeSetState(prev => ({ 
      confirmPassword, 
      fieldErrors: { ...prev.fieldErrors, confirmPassword: undefined } 
    }));
  }, [safeSetState]);

  const setFirstName = useCallback((firstName: string) => {
    safeSetState(prev => ({ 
      firstName, 
      fieldErrors: { ...prev.fieldErrors, firstName: undefined } 
    }));
  }, [safeSetState]);

  const setLastName = useCallback((lastName: string) => {
    safeSetState(prev => ({ 
      lastName, 
      fieldErrors: { ...prev.fieldErrors, lastName: undefined } 
    }));
  }, [safeSetState]);

  /**
   * Validate form fields
   */
  const validateForm = useCallback((): boolean => {
    const errors: typeof state.fieldErrors = {};

    // Email validation
    if (!state.email.trim()) {
      errors.email = 'Email is required';
    } else if (!memberService.validateEmail(state.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!state.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = memberService.validatePassword(state.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }

    // Registration-specific validations
    if (!state.isLogin) {
      if (state.password !== state.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (!state.firstName.trim()) {
        errors.firstName = 'First name is required';
      }

      if (!state.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
    }

    safeSetState({ fieldErrors: errors });
    return Object.keys(errors).length === 0;
  }, [state, safeSetState]);

  /**
   * Handle login
   */
  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      safeSetState({ loading: true, error: null, success: null });

      console.log('🔄 [MEMBER AUTH HOOK] Attempting login...');

      const credentials: MemberCredentials = {
        email: state.email,
        password: state.password,
      };

      const result = await memberService.login(credentials);

      if (result.success) {
        console.log('✅ [MEMBER AUTH HOOK] Login successful');
        
        safeSetState({ 
          loading: false,
          success: 'Login successful! Welcome back.',
        });

        // Refresh member status in context
        setTimeout(() => {
          refreshMemberStatus();
        }, 100);

      } else {
        console.warn('⚠️ [MEMBER AUTH HOOK] Login failed:', result.error);
        
        safeSetState({
          loading: false,
          error: result.error || 'Login failed',
        });
      }
    } catch (error) {
      console.error('❌ [MEMBER AUTH HOOK] Login error:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Login failed',
        });
      }
    }
  }, [state, validateForm, refreshMemberStatus, safeSetState]);

  /**
   * Handle registration
   */
  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      safeSetState({ loading: true, error: null, success: null });

      console.log('🔄 [MEMBER AUTH HOOK] Attempting registration...');

      const registrationData: MemberRegistrationData = {
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword,
        firstName: state.firstName,
        lastName: state.lastName,
      };

      const result = await memberService.register(registrationData);

      if (result.success) {
        console.log('✅ [MEMBER AUTH HOOK] Registration successful');
        
        let successMessage = 'Registration successful!';
        
        if (result.state === 'PENDING_EMAIL_VERIFICATION') {
          successMessage = 'Registration successful! Please check your email to verify your account.';
        } else if (result.state === 'SUCCESS') {
          successMessage = 'Registration and login successful! Welcome!';
          // Refresh member status in context
          setTimeout(() => {
            refreshMemberStatus();
          }, 100);
        }

        safeSetState({ 
          loading: false,
          success: successMessage,
        });

      } else {
        console.warn('⚠️ [MEMBER AUTH HOOK] Registration failed:', result.error);
        
        safeSetState({
          loading: false,
          error: result.error || 'Registration failed',
        });
      }
    } catch (error) {
      console.error('❌ [MEMBER AUTH HOOK] Registration error:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Registration failed',
        });
      }
    }
  }, [state, validateForm, refreshMemberStatus, safeSetState]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    try {
      safeSetState({ loading: true, error: null, success: null });

      console.log('🔄 [MEMBER AUTH HOOK] Attempting logout...');

      const result = await memberService.logout();

      if (result.success) {
        console.log('✅ [MEMBER AUTH HOOK] Logout successful');
        
        safeSetState({ 
          loading: false,
          success: 'Logged out successfully.',
        });

        // Refresh member status in context
        setTimeout(() => {
          refreshMemberStatus();
        }, 100);

      } else {
        console.warn('⚠️ [MEMBER AUTH HOOK] Logout failed:', result.error);
        
        safeSetState({
          loading: false,
          error: result.error || 'Logout failed',
        });
      }
    } catch (error) {
      console.error('❌ [MEMBER AUTH HOOK] Logout error:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Logout failed',
        });
      }
    }
  }, [refreshMemberStatus, safeSetState]);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async () => {
    if (!state.email.trim()) {
      safeSetState({ error: 'Please enter your email address' });
      return;
    }

    if (!memberService.validateEmail(state.email)) {
      safeSetState({ error: 'Please enter a valid email address' });
      return;
    }

    try {
      safeSetState({ loading: true, error: null, success: null });

      console.log('🔄 [MEMBER AUTH HOOK] Requesting password reset...');

      const result = await memberService.requestPasswordReset(state.email);

      if (result.success) {
        console.log('✅ [MEMBER AUTH HOOK] Password reset requested');
        
        safeSetState({ 
          loading: false,
          success: 'Password reset email sent! Check your inbox.',
        });

      } else {
        console.warn('⚠️ [MEMBER AUTH HOOK] Password reset failed:', result.error);
        
        safeSetState({
          loading: false,
          error: result.error || 'Failed to send reset email',
        });
      }
    } catch (error) {
      console.error('❌ [MEMBER AUTH HOOK] Password reset error:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to send reset email',
        });
      }
    }
  }, [state.email, safeSetState]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    safeSetState({ success: null });
  }, [safeSetState]);

  /**
   * Clear form data
   */
  const clearForm = useCallback(() => {
    safeSetState({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      error: null,
      success: null,
      fieldErrors: {},
    });
  }, [safeSetState]);

  /**
   * Calculate password strength
   */
  const passwordStrength = React.useMemo((): 'weak' | 'medium' | 'strong' => {
    const { password } = state;
    
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    
    // Check for complexity
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const complexityScore = [hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
    
    if (complexityScore >= 3) return 'strong';
    if (complexityScore >= 2) return 'medium';
    return 'weak';
  }, [state.password]);

  /**
   * Derived state
   */
  const canSubmit = !state.loading && state.email.trim() && state.password.trim() && 
    (state.isLogin || (state.firstName.trim() && state.lastName.trim() && state.confirmPassword.trim()));
  
  const isFormValid = Object.keys(state.fieldErrors).length === 0;

  return {
    // State
    isLogin: state.isLogin,
    loading: state.loading,
    email: state.email,
    password: state.password,
    confirmPassword: state.confirmPassword,
    firstName: state.firstName,
    lastName: state.lastName,
    error: state.error,
    success: state.success,
    fieldErrors: state.fieldErrors,

    // Actions
    setIsLogin,
    setEmail,
    setPassword,
    setConfirmPassword,
    setFirstName,
    setLastName,
    handleLogin,
    handleRegister,
    handleLogout,
    requestPasswordReset,
    clearError,
    clearSuccess,
    clearForm,
    validateForm,

    // Derived state
    canSubmit,
    passwordStrength,
    isFormValid,
  };
};
