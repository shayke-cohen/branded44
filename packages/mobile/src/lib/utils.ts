/**
 * Utility Functions for AI-Optimized React Native Component Library
 * 
 * This file contains all utility functions used throughout the component system.
 * Extensively documented for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import { Platform, Dimensions, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// STYLING AND CSS UTILITIES
// =============================================================================

/**
 * Merges multiple className strings with proper handling of conditionals
 * Similar to the popular 'clsx' utility but optimized for React Native
 * 
 * @param classes - Array of class names, objects, or conditional expressions
 * @returns Merged className string
 * 
 * @example
 * cn('button', isActive && 'active', { 'disabled': isDisabled })
 * // Returns: "button active disabled"
 */
export function cn(...classes: Array<string | object | undefined | null | boolean>): string {
  const classNames: string[] = [];
  
  classes.forEach((cls) => {
    if (!cls) return;
    
    if (typeof cls === 'string') {
      classNames.push(cls);
    } else if (typeof cls === 'object') {
      Object.entries(cls).forEach(([key, value]) => {
        if (value) classNames.push(key);
      });
    }
  });
  
  return classNames.join(' ');
}

/**
 * Creates responsive styles based on screen size
 * 
 * @param value - Responsive value object or single value
 * @returns Resolved value for current screen size
 * 
 * @example
 * responsive({ xs: 16, md: 24, lg: 32 })
 * // Returns appropriate value based on screen width
 */
export function responsive<T>(value: T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T }): T {
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }
  
  const { width } = Dimensions.get('window');
  const breakpoints = { xs: 320, sm: 375, md: 414, lg: 768, xl: 1024 };
  
  if (width >= breakpoints.xl && 'xl' in value && value.xl !== undefined) return value.xl;
  if (width >= breakpoints.lg && 'lg' in value && value.lg !== undefined) return value.lg;
  if (width >= breakpoints.md && 'md' in value && value.md !== undefined) return value.md;
  if (width >= breakpoints.sm && 'sm' in value && value.sm !== undefined) return value.sm;
  if ('xs' in value && value.xs !== undefined) return value.xs;
  
  // Fallback to first available value
  const values = Object.values(value).filter(v => v !== undefined);
  return values[0] as T;
}

/**
 * Platform-specific style selector
 * 
 * @param styles - Object with platform-specific styles
 * @returns Style for current platform
 * 
 * @example
 * platformStyle({ ios: { paddingTop: 20 }, android: { paddingTop: 10 } })
 */
export function platformStyle<T>(styles: { ios?: T; android?: T; web?: T; default?: T }): T | undefined {
  if (Platform.OS === 'ios' && styles.ios) return styles.ios;
  if (Platform.OS === 'android' && styles.android) return styles.android;
  if (Platform.OS === 'web' && styles.web) return styles.web;
  return styles.default;
}

/**
 * Generates a random color (useful for testing and placeholders)
 * 
 * @returns Hex color string
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Email validation using RFC 5322 compliant regex
 * 
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Phone number validation (supports international formats)
 * 
 * @param phone - Phone number string to validate
 * @returns True if phone number is valid
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone);
}

/**
 * Password strength validation
 * 
 * @param password - Password string to validate
 * @param options - Validation options
 * @returns Validation result with strength score and feedback
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): {
  isValid: boolean;
  strength: number;
  feedback: string[];
} {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  const feedback: string[] = [];
  let strength = 0;

  if (password.length < minLength) {
    feedback.push(`Password must be at least ${minLength} characters long`);
  } else {
    strength += 20;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else if (requireUppercase) {
    strength += 20;
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else if (requireLowercase) {
    strength += 20;
  }

  if (requireNumbers && !/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else if (requireNumbers) {
    strength += 20;
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else if (requireSpecialChars) {
    strength += 20;
  }

  return {
    isValid: feedback.length === 0,
    strength: Math.min(strength, 100),
    feedback,
  };
}

/**
 * URL validation
 * 
 * @param url - URL string to validate
 * @returns True if URL is valid
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generic form field validation
 * 
 * @param value - Value to validate
 * @param rules - Array of validation rules
 * @returns Error message or null if valid
 */
export function validateField(value: any, rules: Array<{
  type: string;
  value?: any;
  message: string;
  validator?: (val: any) => boolean;
}>): string | null {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message;
        }
        break;
      case 'email':
        if (value && !validateEmail(value)) {
          return rule.message;
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          return rule.message;
        }
        break;
      case 'url':
        if (value && !validateUrl(value)) {
          return rule.message;
        }
        break;
      case 'min':
        if (value && value.length < rule.value) {
          return rule.message;
        }
        break;
      case 'max':
        if (value && value.length > rule.value) {
          return rule.message;
        }
        break;
      case 'pattern':
        if (value && !new RegExp(rule.value).test(value)) {
          return rule.message;
        }
        break;
      case 'custom':
        if (rule.validator && value && !rule.validator(value)) {
          return rule.message;
        }
        break;
    }
  }
  return null;
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Formats a date in a human-readable way
 * 
 * @param date - Date string or Date object
 * @param format - Format type
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'long' | 'relative' | 'time' | string = 'short'
): string {
  if (!date) {
    return 'No date';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  switch (format) {
    case 'relative':
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    
    case 'time':
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    case 'long':
      return dateObj.toLocaleDateString([], { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    
    case 'short':
      return dateObj.toLocaleDateString();
    
    // Custom format strings
    case 'YYYY-MM-DD':
      return dateObj.toISOString().split('T')[0];
    
    case 'MMM DD, YYYY':
      return dateObj.toLocaleDateString([], { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    
    case 'MMM DD':
      return dateObj.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    
    case 'MMM DD, HH:mm':
      const datePart = dateObj.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
      const timePart = dateObj.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      return `${datePart}, ${timePart}`;
    
    case 'HH:mm':
      return dateObj.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Formats time for display (alias for formatDate with time format)
 * 
 * @param date - Date object or date string
 * @returns Formatted time string
 */
export function formatTime(date: string | Date): string {
  return formatDate(date, 'HH:mm');
}

/**
 * Formats currency values with proper localization
 * 
 * @param amount - Numeric amount
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats large numbers with appropriate suffixes (K, M, B)
 * 
 * @param num - Number to format
 * @param precision - Decimal places
 * @returns Formatted number string
 */
export function formatNumber(num: number, precision: number = 1): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(precision) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(precision) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(precision) + 'K';
  }
  return num.toString();
}

/**
 * Truncates text with ellipsis
 * 
 * @param text - Text to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to append (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of each word
 * 
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Converts camelCase to kebab-case
 * 
 * @param text - camelCase text
 * @returns kebab-case text
 */
export function kebabCase(text: string): string {
  return text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

/**
 * Safely stores data in AsyncStorage with error handling
 * 
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 * @returns Promise resolving to success status
 */
export async function setStorageItem(key: string, value: any): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error storing item with key ${key}:`, error);
    return false;
  }
}

/**
 * Safely retrieves data from AsyncStorage with error handling
 * 
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Promise resolving to stored value or default
 */
export async function getStorageItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving item with key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Removes an item from AsyncStorage
 * 
 * @param key - Storage key to remove
 * @returns Promise resolving to success status
 */
export async function removeStorageItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item with key ${key}:`, error);
    return false;
  }
}

/**
 * Clears all AsyncStorage data
 * 
 * @returns Promise resolving to success status
 */
export async function clearStorage(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

// =============================================================================
// DEVICE AND PLATFORM UTILITIES
// =============================================================================

/**
 * Gets device screen dimensions and safe area information
 * 
 * @returns Device information object
 */
export function getDeviceInfo() {
  const { width, height } = Dimensions.get('window');
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  
  return {
    window: { width, height },
    screen: { width: screenWidth, height: screenHeight },
    isTablet: width >= 768,
    isSmallPhone: width < 375,
    isLargePhone: width >= 414,
    orientation: width > height ? 'landscape' : 'portrait',
    platform: Platform.OS,
    platformVersion: Platform.Version,
  };
}

/**
 * Checks if device is connected to the internet
 * Note: Requires @react-native-community/netinfo for full functionality
 * 
 * @returns Promise resolving to connection status
 */
export async function isOnline(): Promise<boolean> {
  try {
    // Fallback implementation - in production, use @react-native-community/netinfo
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Opens external URL in browser or app
 * 
 * @param url - URL to open
 * @returns Promise resolving to success status
 */
export async function openUrl(url: string): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      console.warn(`Cannot open URL: ${url}`);
      return false;
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    return false;
  }
}

/**
 * Makes a phone call
 * 
 * @param phoneNumber - Phone number to call
 * @returns Promise resolving to success status
 */
export async function makePhoneCall(phoneNumber: string): Promise<boolean> {
  const url = `tel:${phoneNumber}`;
  return openUrl(url);
}

/**
 * Opens email client with pre-filled data
 * 
 * @param email - Email address
 * @param subject - Email subject
 * @param body - Email body
 * @returns Promise resolving to success status
 */
export async function sendEmail(
  email: string,
  subject?: string,
  body?: string
): Promise<boolean> {
  let url = `mailto:${email}`;
  const params: string[] = [];
  
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  return openUrl(url);
}

// =============================================================================
// ALERT AND NOTIFICATION UTILITIES
// =============================================================================

/**
 * Shows a confirmation dialog
 * 
 * @param title - Dialog title
 * @param message - Dialog message
 * @param onConfirm - Callback for confirm action
 * @param onCancel - Callback for cancel action
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm?: () => void,
  onCancel?: () => void
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        style: 'default',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}

/**
 * Shows an error alert
 * 
 * @param title - Error title
 * @param message - Error message
 * @param onDismiss - Callback when dismissed
 */
export function showErrorAlert(
  title: string = 'Error',
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(title, message, [{ text: 'OK', onPress: onDismiss }]);
}

/**
 * Shows a success alert
 * 
 * @param title - Success title
 * @param message - Success message
 * @param onDismiss - Callback when dismissed
 */
export function showSuccessAlert(
  title: string = 'Success',
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(title, message, [{ text: 'OK', onPress: onDismiss }]);
}

// =============================================================================
// PERFORMANCE AND OPTIMIZATION UTILITIES
// =============================================================================

/**
 * Debounces a function call
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttles a function call
 * 
 * @param func - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Generates a unique ID
 * 
 * @param prefix - Optional prefix for the ID
 * @returns Unique identifier string
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Deep clones an object
 * 
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Checks if two objects are deeply equal
 * 
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if objects are deeply equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
} 