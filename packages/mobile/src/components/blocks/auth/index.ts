/**
 * Authentication Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all authentication-related block components with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Authentication
 * @author AI Component System
 * @version 2.0.0
 */

// === CORE AUTHENTICATION COMPONENTS ===

export { default as LoginForm } from './LoginForm';
export type { LoginFormProps, LoginFormErrors } from './LoginForm';

export { default as SignupForm } from './SignupForm';
export type { SignupFormProps, SignupFormErrors } from './SignupForm';

// === PASSWORD MANAGEMENT ===

export { default as ForgotPasswordForm } from './ForgotPasswordForm';
export type { ForgotPasswordFormProps, ForgotPasswordFormErrors } from './ForgotPasswordForm';

// === VERIFICATION ===

export { default as OTPVerificationForm } from './OTPVerificationForm';
export type { OTPVerificationFormProps } from './OTPVerificationForm';

// === PROFILE MANAGEMENT ===

export { default as ProfileCard } from './ProfileCard';
export type { ProfileCardProps } from './ProfileCard';

export { default as ProfileEditForm } from './ProfileEditForm';
export type { ProfileEditFormProps } from './ProfileEditForm';

// === SETTINGS AND PREFERENCES ===

export { default as SettingsPanel } from './SettingsPanel';
export type { SettingsPanelProps } from './SettingsPanel';

export { default as SecuritySettings } from './SecuritySettings';
export type { SecuritySettingsProps } from './SecuritySettings';

export { default as NotificationSettings } from './NotificationSettings';
export type { NotificationSettingsProps } from './NotificationSettings';

// === SUBSCRIPTION AND ROLES ===

export { default as SubscriptionCard } from './SubscriptionCard';
export type { SubscriptionCardProps, SubscriptionPlan, SubscriptionData } from './SubscriptionCard';

export { default as UserRoleSelector } from './UserRoleSelector';
export type { UserRoleSelectorProps, RolePermission, RoleConfig } from './UserRoleSelector';

// === SOCIAL AUTHENTICATION ===

export { default as SocialLoginButtons } from './SocialLoginButtons';
export type { SocialLoginButtonsProps } from './SocialLoginButtons';

// === SHARED TYPES AND CONSTANTS ===

export type { 
  AuthData, 
  AuthMode, 
  SocialProvider, 
  User, 
  UserRole, 
  UserPreferences, 
  UserProfile 
} from '../../../lib/types';

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { validateEmail, validatePassword, validateField, cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these authentication components effectively.
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For User Login:
 * - Use `LoginForm` for standard email/password login
 * - Add `SocialLoginButtons` for social authentication options
 * - Use `ForgotPasswordForm` for password recovery
 * 
 * ### For User Registration:
 * - Use `SignupForm` for comprehensive registration
 * - Add `SocialLoginButtons` for social signup options
 * - Use `OTPVerificationForm` for email/phone verification
 * 
 * ### For Profile Management:
 * - Use `ProfileCard` to display user information
 * - Combine with edit forms for profile management
 * 
 * ## Common Implementation Patterns
 * 
 * ### Basic Login Screen:
 * ```tsx
 * <SafeAreaView style={styles.container}>
 *   <LoginForm
 *     onLogin={(data) => handleLogin(data)}
 *     onError={(error) => showError(error)}
 *     socialLogin={true}
 *     showForgotPassword={true}
 *   />
 *   <SocialLoginButtons
 *     onSocialLogin={(provider) => handleSocialAuth(provider)}
 *     providers={['google', 'apple', 'facebook']}
 *   />
 * </SafeAreaView>
 * ```
 * 
 * ### Registration Flow:
 * ```tsx
 * <SignupForm
 *   onSignup={(data) => handleSignup(data)}
 *   requireTerms={true}
 *   enablePasswordStrength={true}
 *   socialSignup={true}
 * />
 * ```
 * 
 * ### Password Recovery:
 * ```tsx
 * <ForgotPasswordForm
 *   onResetRequest={(email) => sendResetEmail(email)}
 *   onBack={() => navigation.goBack()}
 * />
 * ```
 * 
 * ### Phone/Email Verification:
 * ```tsx
 * <OTPVerificationForm
 *   onVerify={(otp) => verifyCode(otp)}
 *   onResendOTP={() => resendCode()}
 *   contactInfo="+1 (555) 123-4567"
 *   verificationType="phone"
 * />
 * ```
 * 
 * ### Profile Display:
 * ```tsx
 * <ProfileCard
 *   user={currentUser}
 *   onEdit={() => navigation.navigate('EditProfile')}
 *   showStatus={true}
 * />
 * ```
 */

/**
 * === VALIDATION UTILITIES ===
 * 
 * These utilities are commonly used with authentication forms:
 * 
 * - `validateEmail(email: string): boolean` - Email format validation
 * - `validatePassword(password: string): boolean` - Password strength validation
 * - `validateField(value: string, rules: ValidationRule[]): string | null` - General field validation
 */

/**
 * === STYLING SYSTEM ===
 * 
 * All components use the centralized design system:
 * 
 * - `COLORS` - Comprehensive color palette with semantic meanings
 * - `SPACING` - Consistent spacing scale (xs, sm, md, lg, xl, etc.)
 * - `TYPOGRAPHY` - Font sizes, weights, and line heights
 * 
 * Components accept custom styles via the `style` prop and can be
 * easily themed by modifying the constants file.
 */ 