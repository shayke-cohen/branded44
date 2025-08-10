/**
 * Authentication Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all authentication template components (full screens) with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Authentication Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === AUTHENTICATION SCREEN TEMPLATES ===

export { default as WelcomeScreen } from './WelcomeScreen';
export type { 
  WelcomeScreenProps, 
  WelcomeScreenConfig, 
  FeatureHighlight, 
  SocialProof 
} from './WelcomeScreen';

export { default as LoginScreen } from './LoginScreen';
export type { LoginScreenProps, LoginScreenConfig } from './LoginScreen';

export { default as SignupScreen } from './SignupScreen';
export type { 
  SignupScreenProps, 
  SignupScreenConfig, 
  SignupData 
} from './SignupScreen';

export { default as ForgotPasswordScreen } from './ForgotPasswordScreen';
export type { 
  ForgotPasswordScreenProps, 
  ForgotPasswordScreenConfig, 
  ResetRequestData, 
  ResetMethod 
} from './ForgotPasswordScreen';

export { default as OTPVerificationScreen } from './OTPVerificationScreen';
export type { 
  OTPVerificationScreenProps, 
  OTPVerificationScreenConfig, 
  OTPVerificationData, 
  VerificationType 
} from './OTPVerificationScreen';

export { default as CreateProfileScreen } from './CreateProfileScreen';
export type { 
  CreateProfileScreenProps, 
  CreateProfileScreenConfig, 
  ProfileCreationData 
} from './CreateProfileScreen';

export { default as OnboardingScreen } from './OnboardingScreen';
export type { 
  OnboardingScreenProps, 
  OnboardingScreenConfig, 
  OnboardingSlide 
} from './OnboardingScreen';

export { default as PermissionsScreen } from './PermissionsScreen';
export type { 
  PermissionsScreenProps, 
  PermissionsScreenConfig, 
  PermissionConfig, 
  PermissionResult, 
  PermissionType, 
  PermissionStatus 
} from './PermissionsScreen';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';
export type { 
  BaseComponentProps,
  AuthData,
  SocialProvider 
} from '../../../lib/types';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these authentication templates effectively.
 * 
 * ## Quick Template Selection Guide
 * 
 * ### For App Introduction:
 * - Use `WelcomeScreen` for app onboarding and feature introduction
 * - Include app branding, feature highlights, and CTA buttons
 * - Perfect for first-time users or guest access
 * 
 * ### For User Authentication:
 * - Use `LoginScreen` for existing user sign-in
 * - Combine with social login options and forgot password
 * - Include validation and error handling
 * 
 * ### For User Registration:
 * - Use `SignupScreen` for new user account creation
 * - Include terms acceptance and password validation
 * - Combine with social signup options
 * 
 * ### For Password Recovery:
 * - Use `ForgotPasswordScreen` for password reset flow
 * - Include email validation and success confirmation
 * - Handle reset request and user feedback
 * 
 * ### For Account Verification:
 * - Use `OTPVerificationScreen` for phone/email verification
 * - Include resend functionality and countdown timer
 * - Handle auto-submission and validation
 * 
 * ### For Profile Setup:
 * - Use `CreateProfileScreen` for initial profile creation
 * - Include image upload and step-by-step guidance
 * - Handle onboarding flow and skip options
 * 
 * ### For App Introduction:
 * - Use `OnboardingScreen` for feature introduction slides
 * - Include interactive navigation and auto-play
 * - Handle multiple slides with progress indicators
 * 
 * ### For App Permissions:
 * - Use `PermissionsScreen` for requesting permissions
 * - Include clear explanations and benefits
 * - Handle permission status and settings navigation
 * 
 * ## Common Implementation Patterns
 * 
 * ### Complete Authentication Flow:
 * ```tsx
 * // App introduction
 * <WelcomeScreen
 *   appName="MyApp"
 *   appDescription="The best app for your needs"
 *   onLogin={() => navigation.navigate('Login')}
 *   onSignup={() => navigation.navigate('Signup')}
 *   features={[
 *     { title: "Fast", description: "Lightning fast performance" },
 *     { title: "Secure", description: "Your data is safe" }
 *   ]}
 * />
 * 
 * // User login
 * <LoginScreen
 *   onLogin={(data) => handleLogin(data)}
 *   onForgotPassword={() => navigation.navigate('ForgotPassword')}
 *   onSignup={() => navigation.navigate('Signup')}
 *   onSocialLogin={(provider) => handleSocialLogin(provider)}
 *   socialProviders={['google', 'apple', 'facebook']}
 * />
 * 
 * // User registration
 * <SignupScreen
 *   onSignup={(data) => handleSignup(data)}
 *   onLogin={() => navigation.navigate('Login')}
 *   onSocialSignup={(provider) => handleSocialSignup(provider)}
 *   onTermsPress={() => navigation.navigate('Terms')}
 *   config={{ requireTerms: true, showMarketingOptIn: true }}
 * />
 * 
 * // Password recovery
 * <ForgotPasswordScreen
 *   onResetRequest={(data) => handlePasswordReset(data)}
 *   onBack={() => navigation.goBack()}
 *   onLoginReturn={() => navigation.navigate('Login')}
 * />
 * 
 * // OTP verification
 * <OTPVerificationScreen
 *   onVerify={(data) => handleOTPVerification(data)}
 *   onResendOTP={() => handleResendOTP()}
 *   contactInfo="+1 (555) 123-4567"
 *   verificationType="phone"
 * />
 * 
 * // Profile creation
 * <CreateProfileScreen
 *   onCreateProfile={(data) => handleProfileCreation(data)}
 *   onSkip={() => navigation.navigate('Dashboard')}
 *   isOnboarding={true}
 * />
 * 
 * // App onboarding
 * <OnboardingScreen
 *   slides={onboardingSlides}
 *   onComplete={() => navigation.navigate('Login')}
 *   onSkip={() => navigation.navigate('Login')}
 * />
 * 
 * // Permissions request
 * <PermissionsScreen
 *   permissions={requiredPermissions}
 *   onPermissionRequest={(type) => requestPermission(type)}
 *   onComplete={(results) => handlePermissionsComplete(results)}
 * />
 * ```
 * 
 * ### Navigation Integration:
 * ```tsx
 * // React Navigation Stack
 * const AuthStack = createStackNavigator();
 * 
 * function AuthNavigator() {
 *   return (
 *     <AuthStack.Navigator screenOptions={{ headerShown: false }}>
 *       <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
 *       <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
 *       <AuthStack.Screen name="Login" component={LoginScreen} />
 *       <AuthStack.Screen name="Signup" component={SignupScreen} />
 *       <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
 *       <AuthStack.Screen name="OTPVerification" component={OTPVerificationScreen} />
 *       <AuthStack.Screen name="CreateProfile" component={CreateProfileScreen} />
 *       <AuthStack.Screen name="Permissions" component={PermissionsScreen} />
 *     </AuthStack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### State Management Integration:
 * ```tsx
 * // Using with authentication context
 * function AuthScreens() {
 *   const { login, signup, resetPassword, loading, error } = useAuth();
 * 
 *   return (
 *     <LoginScreen
 *       onLogin={login}
 *       onForgotPassword={resetPassword}
 *       loading={loading}
 *       error={error}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Configuration Examples
 * 
 * ### Welcome Screen with Features:
 * ```tsx
 * <WelcomeScreen
 *   appName="FitnessTracker"
 *   appDescription="Track your fitness journey"
 *   features={[
 *     { title: "Track Workouts", description: "Log your exercises" },
 *     { title: "Monitor Progress", description: "See your improvements" },
 *     { title: "Social Features", description: "Connect with friends" }
 *   ]}
 *   socialProof={[
 *     { type: "users", value: "10k+", label: "active users" },
 *     { type: "rating", value: "4.8", label: "app rating" }
 *   ]}
 *   config={{
 *     showFeatures: true,
 *     showSocialProof: true,
 *     showSkip: true
 *   }}
 * />
 * ```
 * 
 * ### Custom Login Screen:
 * ```tsx
 * <LoginScreen
 *   config={{
 *     title: "Welcome Back",
 *     subtitle: "Sign in to continue your journey",
 *     showSocialLogin: true,
 *     socialProviders: ['google', 'apple'],
 *     showForgotPassword: true,
 *     showSignupLink: true
 *   }}
 * />
 * ```
 */

/**
 * === STYLING SYSTEM ===
 * 
 * All templates use the centralized design system:
 * 
 * - `COLORS` - Comprehensive color palette with semantic meanings
 * - `SPACING` - Consistent spacing scale (xs, sm, md, lg, xl, etc.)
 * - `TYPOGRAPHY` - Font sizes, weights, and line heights
 * 
 * Templates accept custom styles via the `style` prop and can be
 * easily themed by modifying the constants file.
 * 
 * ### Custom Styling Example:
 * ```tsx
 * <LoginScreen
 *   style={{ backgroundColor: '#f5f5f5' }}
 *   config={{
 *     headerComponent: <CustomHeader />,
 *     footerComponent: <CustomFooter />
 *   }}
 * />
 * ```
 */

/**
 * === NAVIGATION TYPES ===
 * 
 * These types can be used with React Navigation for type-safe navigation:
 * 
 * ```tsx
 * type AuthStackParamList = {
 *   Welcome: undefined;
 *   Login: undefined;
 *   Signup: undefined;
 *   ForgotPassword: undefined;
 * };
 * ```
 */
