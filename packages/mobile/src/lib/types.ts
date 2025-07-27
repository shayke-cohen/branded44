/**
 * TypeScript Type Definitions for AI-Optimized React Native Component Library
 * 
 * This file contains all TypeScript interfaces and types used throughout the component system.
 * Extensively documented for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import { ReactNode, ComponentProps } from 'react';
import { ViewStyle, TextStyle, ImageStyle, Animated } from 'react-native';

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Common utility types for component props
 */
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

/**
 * Loading and error states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  code?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Common component base props
 */
export interface BaseComponentProps {
  /**
   * Custom CSS class names for styling
   */
  className?: string;
  
  /**
   * Custom styles for the component
   */
  style?: ViewStyle | TextStyle | ImageStyle;
  
  /**
   * Test identifier for automated testing
   */
  testID?: string;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether the component is in loading state
   */
  loading?: boolean;
  
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  
  /**
   * Accessibility hint for screen readers
   */
  accessibilityHint?: string;
}

// =============================================================================
// USER RELATED TYPES
// =============================================================================

/**
 * User authentication states
 */
export type AuthState = 'authenticated' | 'unauthenticated' | 'loading' | 'error';

/**
 * Authentication modes for auth forms
 */
export type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email' | 'verify-phone';

/**
 * Social login providers
 */
export type SocialProvider = 'google' | 'facebook' | 'apple' | 'twitter' | 'linkedin' | 'github';

/**
 * Core user interface
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isActive: boolean;
  role: UserRole;
  preferences: UserPreferences;
}

/**
 * User roles and permissions
 */
export type UserRole = 'admin' | 'moderator' | 'user' | 'guest' | 'premium';

/**
 * User preferences and settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security: boolean;
  mentions: boolean;
  comments: boolean;
  likes: boolean;
  follows: boolean;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  searchable: boolean;
  showOnlineStatus: boolean;
  allowMessagesFromStrangers: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

/**
 * User profile for display
 */
export interface UserProfile {
  user: User;
  stats: UserStats;
  isFollowing?: boolean;
  isBlocked?: boolean;
  mutualFriends?: number;
}

/**
 * User statistics
 */
export interface UserStats {
  followers: number;
  following: number;
  posts: number;
  likes: number;
  views: number;
  points?: number;
  level?: number;
}

/**
 * Authentication data for forms
 */
export interface AuthData {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  termsAccepted?: boolean;
  marketingConsent?: boolean;
}

// =============================================================================
// FORM AND INPUT TYPES
// =============================================================================

/**
 * Form field configuration
 */
export interface FormField {
  name: string;
  label: string;
  type: InputType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  hint?: string;
  defaultValue?: any;
}

/**
 * Input field types
 */
export type InputType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'phone' 
  | 'url' 
  | 'search'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'image';

/**
 * Form validation rules
 */
export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  [fieldName: string]: string | undefined;
}

/**
 * Select option for dropdowns and lists
 */
export interface SelectOption {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Filter configuration for lists
 */
export interface FilterConfig {
  name: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'search';
  options?: SelectOption[];
  min?: number;
  max?: number;
  defaultValue?: any;
}

/**
 * Sort configuration for lists
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// =============================================================================
// CONTENT AND MEDIA TYPES
// =============================================================================

/**
 * Media file information
 */
export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  alt?: string;
  caption?: string;
}

/**
 * Post or content item
 */
export interface Post {
  id: string;
  author: User;
  content: string;
  media?: MediaFile[];
  tags?: string[];
  mentions?: User[];
  location?: Location;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  visibility: 'public' | 'friends' | 'private';
  type: 'text' | 'image' | 'video' | 'link' | 'poll';
}

/**
 * Comment on a post
 */
export interface Comment {
  id: string;
  author: User;
  content: string;
  postId: string;
  parentId?: string; // For nested comments
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked?: boolean;
}

/**
 * Geographic location
 */
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

// =============================================================================
// E-COMMERCE TYPES
// =============================================================================

/**
 * Product information
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  currency: string;
  images: MediaFile[];
  category: ProductCategory;
  brand?: string;
  tags: string[];
  variants?: ProductVariant[];
  inventory: ProductInventory;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Product category
 */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: ProductCategory[];
}

/**
 * Product variant (size, color, etc.)
 */
export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  sku?: string;
  inventory?: number;
  image?: string;
}

/**
 * Product inventory information
 */
export interface ProductInventory {
  quantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  allowBackorder: boolean;
  trackQuantity: boolean;
}

/**
 * Shopping cart item
 */
export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
  addedAt: string;
}

/**
 * Shopping cart
 */
export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  itemCount: number;
}

/**
 * Order information
 */
export interface Order {
  id: string;
  orderNumber: string;
  customer: User;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

/**
 * Order status
 */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

/**
 * Address information
 */
export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
}

// =============================================================================
// BUSINESS AND PRODUCTIVITY TYPES
// =============================================================================

/**
 * Task or todo item
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  creator: User;
  project?: Project;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: MediaFile[];
  comments?: Comment[];
}

/**
 * Task status
 */
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';

/**
 * Task priority
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Project information
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived' | 'cancelled';
  owner: User;
  members: User[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  taskCount: number;
  completedTaskCount: number;
}

/**
 * Calendar event
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: Location;
  attendees?: User[];
  organizer: User;
  status: 'confirmed' | 'tentative' | 'cancelled';
  recurrence?: RecurrenceRule;
  reminders?: EventReminder[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Event recurrence rule
 */
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  count?: number;
  byWeekDay?: number[];
  byMonthDay?: number[];
}

/**
 * Event reminder
 */
export interface EventReminder {
  type: 'notification' | 'email' | 'sms';
  minutes: number;
}

// =============================================================================
// COMPONENT SPECIFIC TYPES
// =============================================================================

/**
 * Generic list item for display components
 */
export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  icon?: string;
  badge?: string;
  status?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Navigation item for menus and navigation
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
  children?: NavigationItem[];
  badge?: string;
  disabled?: boolean;
}

/**
 * Statistic card data
 */
export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  subtitle?: string;
}

/**
 * Quick action button
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  color?: string;
  disabled?: boolean;
}

/**
 * Notification item
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

/**
 * Toast notification
 */
export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// =============================================================================
// ANIMATION AND INTERACTION TYPES
// =============================================================================

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing?: string;
  delay?: number;
  repeat?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

/**
 * Gesture event data
 */
export interface GestureEventData {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
}

// =============================================================================
// THEME AND STYLING TYPES
// =============================================================================

/**
 * Theme configuration
 */
export interface Theme {
  colors: typeof import('./constants').COLORS;
  spacing: typeof import('./constants').SPACING;
  typography: typeof import('./constants').TYPOGRAPHY;
  layout: typeof import('./constants').LAYOUT;
  animations: typeof import('./constants').ANIMATIONS;
  shadows: typeof import('./constants').SHADOWS;
}

/**
 * Responsive value type
 */
export type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

// =============================================================================
// EXPORT HELPER TYPES
// =============================================================================

/**
 * Extract component props from React component
 */
export type ComponentPropsOf<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Make all properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make all properties required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Extract keys of type T
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T]; 