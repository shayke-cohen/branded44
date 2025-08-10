/**
 * Profile Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all profile and settings template components (full screens) with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Profile Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === PROFILE MANAGEMENT TEMPLATES ===

export { default as ProfileScreen } from './ProfileScreen';
export type { 
  ProfileScreenProps, 
  ProfileScreenConfig, 
  ProfileStats, 
  ProfileActivity, 
  ProfileAchievement 
} from './ProfileScreen';

export { default as SettingsScreen } from './SettingsScreen';
export type { 
  SettingsScreenProps, 
  SettingsScreenConfig, 
  SettingsSection, 
  SettingItem, 
  SettingType, 
  SettingOption 
} from './SettingsScreen';

export { default as AccountScreen } from './AccountScreen';
export type { 
  AccountScreenProps, 
  AccountScreenConfig, 
  VerificationStatus, 
  ConnectedAccount, 
  AccountActivity 
} from './AccountScreen';

export { default as SecurityScreen } from './SecurityScreen';
export type { 
  SecurityScreenProps, 
  SecurityScreenConfig, 
  SecuritySetting, 
  SecuritySettingKey, 
  ActiveSession, 
  LoginHistoryItem, 
  SecurityRecommendation 
} from './SecurityScreen';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';
export type { 
  BaseComponentProps,
  UserProfile 
} from '../../../lib/types';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these profile and settings templates effectively.
 * 
 * ## Quick Template Selection Guide
 * 
 * ### For Profile Display and Management:
 * - Use `ProfileScreen` for user profile viewing and editing
 * - Include profile stats, activity, and achievements
 * - Handle profile image editing and social features
 * 
 * ### For General Settings:
 * - Use `SettingsScreen` for comprehensive app settings
 * - Include account, notifications, privacy, and appearance
 * - Handle navigation to detailed settings screens
 * 
 * ### For Account Management:
 * - Use `AccountScreen` for account-specific settings
 * - Include profile editing, subscription, and verification
 * - Handle account verification and connected accounts
 * 
 * ### For Security Management:
 * - Use `SecurityScreen` for security and privacy settings
 * - Include password management, two-factor auth, and sessions
 * - Handle security recommendations and monitoring
 * 
 * ## Common Implementation Patterns
 * 
 * ### Complete Profile Management Flow:
 * ```tsx
 * // Profile display and editing
 * <ProfileScreen
 *   user={currentUser}
 *   onEditProfile={(data) => handleProfileUpdate(data)}
 *   onNavigateToSettings={() => navigation.navigate('Settings')}
 *   stats={{
 *     followers: 1250,
 *     following: 340,
 *     posts: 125
 *   }}
 *   isOwnProfile={true}
 * />
 * 
 * // General settings management
 * <SettingsScreen
 *   user={currentUser}
 *   settings={userSettings}
 *   onSettingChange={(key, value) => handleSettingChange(key, value)}
 *   onNavigateToSection={(section) => navigation.navigate(section)}
 *   onLogout={() => handleLogout()}
 * />
 * 
 * // Account management
 * <AccountScreen
 *   user={currentUser}
 *   subscription={userSubscription}
 *   verification={verificationStatus}
 *   onUpdateAccount={(data) => handleAccountUpdate(data)}
 *   onVerifyEmail={() => handleEmailVerification()}
 *   onManageSubscription={() => navigation.navigate('Subscription')}
 * />
 * 
 * // Security settings
 * <SecurityScreen
 *   user={currentUser}
 *   securitySettings={securitySettings}
 *   activeSessions={activeSessions}
 *   onUpdateSecurity={(key, value) => handleSecurityUpdate(key, value)}
 *   onChangePassword={() => navigation.navigate('ChangePassword')}
 *   onSetupTwoFactor={() => navigation.navigate('TwoFactorSetup')}
 * />
 * ```
 * 
 * ### Navigation Integration:
 * ```tsx
 * // React Navigation Stack
 * const ProfileStack = createStackNavigator();
 * 
 * function ProfileNavigator() {
 *   return (
 *     <ProfileStack.Navigator>
 *       <ProfileStack.Screen name="Profile" component={ProfileScreen} />
 *       <ProfileStack.Screen name="Settings" component={SettingsScreen} />
 *       <ProfileStack.Screen name="Account" component={AccountScreen} />
 *       <ProfileStack.Screen name="Security" component={SecurityScreen} />
 *     </ProfileStack.Navigator>
 *   );
 * }
 * ```
 * 
 * ### State Management Integration:
 * ```tsx
 * // Using with profile context
 * function ProfileScreens() {
 *   const { 
 *     user, 
 *     updateProfile, 
 *     settings, 
 *     updateSetting,
 *     loading 
 *   } = useProfile();
 * 
 *   return (
 *     <ProfileScreen
 *       user={user}
 *       onEditProfile={updateProfile}
 *       loading={loading}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Configuration Examples
 * 
 * ### Profile Screen with Social Features:
 * ```tsx
 * <ProfileScreen
 *   user={userProfile}
 *   stats={{
 *     followers: 1250,
 *     following: 340,
 *     posts: 125,
 *     custom: [
 *       { label: "Workouts", value: 89 },
 *       { label: "Goals Met", value: 12 }
 *     ]
 *   }}
 *   activity={recentActivity}
 *   achievements={userAchievements}
 *   isOwnProfile={true}
 *   config={{
 *     showStats: true,
 *     showActivity: true,
 *     showAchievements: true,
 *     showEditButton: true
 *   }}
 * />
 * ```
 * 
 * ### Settings Screen with Custom Sections:
 * ```tsx
 * <SettingsScreen
 *   user={currentUser}
 *   settings={userSettings}
 *   config={{
 *     showSearch: true,
 *     showUserHeader: true,
 *     customSections: [
 *       {
 *         id: 'fitness',
 *         title: 'Fitness Settings',
 *         settings: [
 *           {
 *             key: 'workout_reminders',
 *             type: 'toggle',
 *             title: 'Workout Reminders',
 *             description: 'Get reminded to work out',
 *             value: true
 *           }
 *         ]
 *       }
 *     ]
 *   }}
 * />
 * ```
 * 
 * ### Account Screen with Verification:
 * ```tsx
 * <AccountScreen
 *   user={currentUser}
 *   subscription={subscription}
 *   verification={{
 *     email: true,
 *     phone: false,
 *     twoFactor: true
 *   }}
 *   connectedAccounts={connectedAccounts}
 *   config={{
 *     showProfileEdit: true,
 *     showSubscription: true,
 *     showVerification: true,
 *     showConnectedAccounts: true
 *   }}
 * />
 * ```
 * 
 * ### Security Screen with Monitoring:
 * ```tsx
 * <SecurityScreen
 *   user={currentUser}
 *   securitySettings={securitySettings}
 *   activeSessions={activeSessions}
 *   loginHistory={loginHistory}
 *   recommendations={securityRecommendations}
 *   config={{
 *     showRecommendations: true,
 *     showSessionsSection: true,
 *     showLoginHistory: true,
 *     maxSessionsDisplay: 10,
 *     maxHistoryDisplay: 20
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
 * <ProfileScreen
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
 * type ProfileStackParamList = {
 *   Profile: undefined;
 *   Settings: undefined;
 *   Account: undefined;
 *   Security: undefined;
 *   EditProfile: undefined;
 *   ChangePassword: undefined;
 *   TwoFactorSetup: undefined;
 * };
 * ```
 */

/**
 * === DATA MANAGEMENT ===
 * 
 * These templates work well with various data management solutions:
 * 
 * ### With Redux Toolkit:
 * ```tsx
 * const ProfileScreen = () => {
 *   const user = useSelector(selectCurrentUser);
 *   const dispatch = useDispatch();
 * 
 *   return (
 *     <ProfileScreen
 *       user={user}
 *       onEditProfile={(data) => dispatch(updateProfile(data))}
 *     />
 *   );
 * };
 * ```
 * 
 * ### With React Query:
 * ```tsx
 * const ProfileScreen = () => {
 *   const { data: user } = useQuery('user', fetchUser);
 *   const updateMutation = useMutation(updateProfile);
 * 
 *   return (
 *     <ProfileScreen
 *       user={user}
 *       onEditProfile={(data) => updateMutation.mutate(data)}
 *       loading={updateMutation.isLoading}
 *     />
 *   );
 * };
 * ```
 */
