/**
 * WelcomeScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive welcome screen template for app introduction with call-to-action buttons.
 * Perfect for onboarding new users with brand presentation and navigation to auth flows.
 * 
 * Features:
 * - App logo and branding display
 * - Welcome message and app description
 * - Call-to-action buttons (Login, Sign Up)
 * - Optional app feature highlights
 * - Social proof elements
 * - Skip option for guest access
 * - Responsive layout with SafeAreaView
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <WelcomeScreen
 *   appName="MyApp"
 *   appDescription="The best app for your needs"
 *   onLogin={() => navigation.navigate('Login')}
 *   onSignup={() => navigation.navigate('Signup')}
 *   onSkip={() => navigation.navigate('Home')}
 *   showSkip={true}
 *   features={[
 *     { title: "Fast", description: "Lightning fast performance" },
 *     { title: "Secure", description: "Your data is safe with us" }
 *   ]}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image,
  TouchableOpacity 
} from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Feature highlight configuration
 */
export interface FeatureHighlight {
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Optional icon name or source */
  icon?: string;
}

/**
 * Social proof element configuration
 */
export interface SocialProof {
  /** Type of social proof */
  type: 'users' | 'rating' | 'downloads' | 'reviews';
  /** Display value */
  value: string;
  /** Optional label */
  label?: string;
}

/**
 * Welcome screen configuration
 */
export interface WelcomeScreenConfig {
  /** App logo source */
  logo?: any;
  /** Background image source */
  backgroundImage?: any;
  /** Show feature highlights */
  showFeatures?: boolean;
  /** Show social proof */
  showSocialProof?: boolean;
  /** Show skip option */
  showSkip?: boolean;
  /** Primary button text */
  primaryButtonText?: string;
  /** Secondary button text */
  secondaryButtonText?: string;
}

/**
 * Properties for the WelcomeScreen template
 */
export interface WelcomeScreenProps extends BaseComponentProps {
  /** App name to display */
  appName: string;
  /** App description or tagline */
  appDescription?: string;
  /** Callback when login button is pressed */
  onLogin: () => void;
  /** Callback when signup button is pressed */
  onSignup: () => void;
  /** Callback when skip is pressed */
  onSkip?: () => void;
  /** Feature highlights to display */
  features?: FeatureHighlight[];
  /** Social proof elements */
  socialProof?: SocialProof[];
  /** Configuration for the welcome screen */
  config?: WelcomeScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * WelcomeScreen - AI-optimized welcome screen template
 * 
 * A comprehensive welcome screen that introduces users to your app with
 * branding, features, and clear call-to-action buttons.
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  appName,
  appDescription,
  onLogin,
  onSignup,
  onSkip,
  features = [],
  socialProof = [],
  config = {},
  style,
  testID = 'welcome-screen',
  ...props
}) => {
  const {
    logo,
    backgroundImage,
    showFeatures = true,
    showSocialProof = true,
    showSkip = false,
    primaryButtonText = 'Get Started',
    secondaryButtonText = 'Sign In'
  } = config;

  const renderLogo = () => {
    if (logo) {
      return (
        <Image 
          source={logo} 
          style={styles.logo}
          resizeMode="contain"
          testID={`${testID}-logo`}
        />
      );
    }
    
    return (
      <View style={styles.logoPlaceholder} testID={`${testID}-logo-placeholder`}>
        <Text style={styles.logoText}>{appName.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  const renderFeatures = () => {
    if (!showFeatures || features.length === 0) return null;

    return (
      <View style={styles.featuresContainer} testID={`${testID}-features`}>
        <Text style={styles.featuresTitle}>Why Choose {appName}?</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Card 
              key={index}
              style={styles.featureCard}
              testID={`${testID}-feature-${index}`}
            >
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </Card>
          ))}
        </View>
      </View>
    );
  };

  const renderSocialProof = () => {
    if (!showSocialProof || socialProof.length === 0) return null;

    return (
      <View style={styles.socialProofContainer} testID={`${testID}-social-proof`}>
        {socialProof.map((proof, index) => (
          <Badge 
            key={index}
            variant="secondary"
            style={styles.socialProofBadge}
            testID={`${testID}-social-proof-${index}`}
          >
            <Text style={styles.socialProofText}>
              {proof.value} {proof.label || proof.type}
            </Text>
          </Badge>
        ))}
      </View>
    );
  };

  const containerStyle = [
    styles.container,
    backgroundImage && styles.backgroundContainer,
    style
  ];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {backgroundImage && (
        <Image 
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        {/* Skip Button */}
        {showSkip && onSkip && (
          <View style={styles.skipContainer}>
            <TouchableOpacity 
              onPress={onSkip}
              style={styles.skipButton}
              testID={`${testID}-skip-button`}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logo and App Name */}
        <View style={styles.brandContainer} testID={`${testID}-brand`}>
          {renderLogo()}
          <Text style={styles.appName}>{appName}</Text>
          {appDescription && (
            <Text style={styles.appDescription}>{appDescription}</Text>
          )}
        </View>

        {/* Social Proof */}
        {renderSocialProof()}

        {/* Feature Highlights */}
        {renderFeatures()}

        {/* Call to Action Buttons */}
        <View style={styles.ctaContainer} testID={`${testID}-cta`}>
          <Button
            onPress={onSignup}
            style={styles.primaryButton}
            testID={`${testID}-signup-button`}
          >
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
          </Button>
          
          <Button
            onPress={onLogin}
            variant="outline"
            style={styles.secondaryButton}
            testID={`${testID}-login-button`}
          >
            <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundContainer: {
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingTop: SPACING.md,
    paddingRight: SPACING.sm,
  },
  skipButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  brandContainer: {
    alignItems: 'center',
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.primary,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoText: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryForeground,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  appDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    paddingHorizontal: SPACING.md,
  },
  socialProofContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  socialProofBadge: {
    marginHorizontal: SPACING.xs,
  },
  socialProofText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  featuresContainer: {
    marginBottom: SPACING.xl,
  },
  featuresTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featuresGrid: {
    gap: SPACING.md,
  },
  featureCard: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  ctaContainer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  primaryButton: {
    paddingVertical: SPACING.lg,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  secondaryButton: {
    paddingVertical: SPACING.lg,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default WelcomeScreen;
export type { WelcomeScreenProps, WelcomeScreenConfig, FeatureHighlight, SocialProof };
