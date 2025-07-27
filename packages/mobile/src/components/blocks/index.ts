/**
 * Main Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all block components with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Blocks
 * @author AI Component System
 * @version 1.0.0
 */

// === AUTHENTICATION BLOCKS ===
export * from './auth';

// === FORM BLOCKS ===
export * from './forms';

// === LIST BLOCKS ===
export * from './lists';

// === E-COMMERCE BLOCKS ===
export * from './ecommerce';

// === SHARED TYPES AND CONSTANTS ===
export { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';
export { cn } from '../../lib/utils';
export type { BaseComponentProps, User } from '../../lib/types';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For Authentication:
 * - Use `LoginForm`, `SignupForm` for user authentication
 * - Use `ForgotPasswordForm`, `OTPVerificationForm` for password recovery
 * - Use `ProfileCard`, `SocialLoginButtons` for user profile management
 * 
 * ### For Forms:
 * - Use `ContactForm` for customer inquiries
 * - Use `SearchForm` for advanced search functionality
 * 
 * ### For Lists & Data Display:
 * - Use `UserList` for displaying users with actions
 * - Use `ProductGrid` for e-commerce product listings
 * 
 * ### For E-commerce:
 * - Use `ProductCard` for individual product displays
 * - Use `CartItem` for shopping cart functionality
 * 
 * ## Complete Library Stats
 * - **15+ Block Components** across 4 major categories
 * - **100% TypeScript** with comprehensive type definitions
 * - **AI-Optimized** with extensive JSDoc documentation
 * - **Production-Ready** with error handling and loading states
 */ 