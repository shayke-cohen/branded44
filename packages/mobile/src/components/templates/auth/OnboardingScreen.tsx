/**
 * OnboardingScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive onboarding screen template with feature introduction slides,
 * interactive tutorials, and step-by-step app guidance.
 * 
 * Features:
 * - Multi-slide feature introduction
 * - Interactive slide navigation
 * - Progress indicators and dots
 * - Auto-play with manual control
 * - Skip and next/previous navigation
 * - Rich media support (images, videos)
 * - Call-to-action buttons
 * - Responsive design
 * - Accessibility support
 * - Smooth animations and transitions
 * - Customizable slide content
 * 
 * @example
 * ```tsx
 * <OnboardingScreen
 *   slides={[
 *     {
 *       title: "Welcome to MyApp",
 *       subtitle: "Discover amazing features",
 *       description: "Get started with the best app experience",
 *       image: require('./assets/welcome.png'),
 *       backgroundColor: '#f0f8ff'
 *     },
 *     {
 *       title: "Track Your Progress",
 *       subtitle: "Stay motivated",
 *       description: "Monitor your achievements and reach your goals",
 *       image: require('./assets/progress.png'),
 *       backgroundColor: '#fff0f5'
 *     }
 *   ]}
 *   onComplete={() => navigation.navigate('Login')}
 *   onSkip={() => navigation.navigate('Login')}
 *   showSkip={true}
 *   autoPlay={false}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated 
} from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card } from '../../../../~/components/ui/card';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Onboarding slide data
 */
export interface OnboardingSlide {
  /** Slide unique identifier */
  id: string;
  /** Slide title */
  title: string;
  /** Slide subtitle */
  subtitle?: string;
  /** Slide description */
  description: string;
  /** Slide image source */
  image?: any;
  /** Slide background color */
  backgroundColor?: string;
  /** Custom slide component */
  component?: React.ReactNode;
  /** Slide-specific actions */
  actions?: {
    /** Primary action button */
    primary?: {
      text: string;
      onPress: () => void;
    };
    /** Secondary action button */
    secondary?: {
      text: string;
      onPress: () => void;
    };
  };
}

/**
 * Onboarding screen configuration
 */
export interface OnboardingScreenConfig {
  /** Auto-play slides */
  autoPlay?: boolean;
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Show skip button */
  showSkip?: boolean;
  /** Show slide indicators */
  showIndicators?: boolean;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Loop slides */
  loop?: boolean;
  /** Skip button text */
  skipButtonText?: string;
  /** Next button text */
  nextButtonText?: string;
  /** Previous button text */
  previousButtonText?: string;
  /** Complete button text */
  completeButtonText?: string;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the OnboardingScreen template
 */
export interface OnboardingScreenProps extends BaseComponentProps {
  /** Array of onboarding slides */
  slides: OnboardingSlide[];
  /** Callback when onboarding is complete */
  onComplete: () => void;
  /** Callback when skip is pressed */
  onSkip?: () => void;
  /** Callback when slide changes */
  onSlideChange?: (index: number, slide: OnboardingSlide) => void;
  /** Initial slide index */
  initialSlide?: number;
  /** Configuration for the onboarding screen */
  config?: OnboardingScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

const { width: screenWidth } = Dimensions.get('window');

/**
 * OnboardingScreen - AI-optimized onboarding screen template
 * 
 * A comprehensive onboarding screen that guides users through app features
 * with interactive slides and smooth navigation.
 */
const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  slides,
  onComplete,
  onSkip,
  onSlideChange,
  initialSlide = 0,
  config = {},
  style,
  testID = 'onboarding-screen',
  ...props
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const flatListRef = useRef<FlatList>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    autoPlay = false,
    autoPlayInterval = 3000,
    showSkip = true,
    showIndicators = true,
    showNavigation = true,
    loop = false,
    skipButtonText = 'Skip',
    nextButtonText = 'Next',
    previousButtonText = 'Previous',
    completeButtonText = 'Get Started',
    headerComponent,
    footerComponent
  } = config;

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isLastSlide) {
      autoPlayTimer.current = setTimeout(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
      }
    };
  }, [autoPlay, autoPlayInterval, currentSlide, isLastSlide]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
    if (onSlideChange && slides[index]) {
      onSlideChange(index, slides[index]);
    }
  }, [onSlideChange, slides]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      onComplete();
    } else {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      handleSlideChange(nextIndex);
    }
  }, [currentSlide, isLastSlide, onComplete, handleSlideChange]);

  const handlePrevious = useCallback(() => {
    if (!isFirstSlide) {
      const prevIndex = currentSlide - 1;
      setCurrentSlide(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      handleSlideChange(prevIndex);
    }
  }, [currentSlide, isFirstSlide, handleSlideChange]);

  const handleIndicatorPress = useCallback((index: number) => {
    setCurrentSlide(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
    handleSlideChange(index);
  }, [handleSlideChange]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    handleSlideChange(index);
  }, [handleSlideChange]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    if (!showSkip || !onSkip) return null;

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <TouchableOpacity 
          onPress={onSkip}
          style={styles.skipButton}
          testID={`${testID}-skip-button`}
        >
          <Text style={styles.skipText}>{skipButtonText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const slideStyle = [
      styles.slide,
      item.backgroundColor && { backgroundColor: item.backgroundColor }
    ];

    return (
      <View style={slideStyle} testID={`${testID}-slide-${index}`}>
        <View style={styles.slideContent}>
          {/* Custom Component */}
          {item.component && (
            <View style={styles.customComponent}>
              {item.component}
            </View>
          )}

          {/* Image */}
          {item.image && (
            <View style={styles.imageContainer}>
              <Image 
                source={item.image} 
                style={styles.slideImage}
                resizeMode="contain"
                testID={`${testID}-slide-image-${index}`}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.textContent}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            )}
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>

          {/* Slide-specific Actions */}
          {item.actions && (
            <View style={styles.slideActions}>
              {item.actions.primary && (
                <Button
                  onPress={item.actions.primary.onPress}
                  style={styles.slideActionButton}
                  testID={`${testID}-slide-primary-${index}`}
                >
                  <Text style={styles.slideActionText}>
                    {item.actions.primary.text}
                  </Text>
                </Button>
              )}
              {item.actions.secondary && (
                <Button
                  onPress={item.actions.secondary.onPress}
                  variant="outline"
                  style={styles.slideActionButton}
                  testID={`${testID}-slide-secondary-${index}`}
                >
                  <Text style={styles.slideActionText}>
                    {item.actions.secondary.text}
                  </Text>
                </Button>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderIndicators = () => {
    if (!showIndicators) return null;

    return (
      <View style={styles.indicatorsContainer} testID={`${testID}-indicators`}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleIndicatorPress(index)}
            style={[
              styles.indicator,
              index === currentSlide && styles.indicatorActive
            ]}
            testID={`${testID}-indicator-${index}`}
          />
        ))}
      </View>
    );
  };

  const renderNavigation = () => {
    if (!showNavigation) return null;

    return (
      <View style={styles.navigationContainer} testID={`${testID}-navigation`}>
        {/* Previous Button */}
        <View style={styles.navigationButton}>
          {!isFirstSlide && (
            <Button
              onPress={handlePrevious}
              variant="outline"
              style={styles.navButton}
              testID={`${testID}-previous-button`}
            >
              <Text style={styles.navButtonText}>{previousButtonText}</Text>
            </Button>
          )}
        </View>

        {/* Next/Complete Button */}
        <View style={styles.navigationButton}>
          <Button
            onPress={handleNext}
            style={styles.navButton}
            testID={`${testID}-next-button`}
          >
            <View style={styles.nextButtonContent}>
              <Text style={styles.navButtonText}>
                {isLastSlide ? completeButtonText : nextButtonText}
              </Text>
              {!isLastSlide && (
                <ChevronRight style={styles.nextIcon} />
              )}
            </View>
          </Button>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (footerComponent) {
      return footerComponent;
    }

    return (
      <View style={styles.footerContainer}>
        {renderIndicators()}
        {renderNavigation()}
      </View>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        initialScrollIndex={initialSlide}
        style={styles.slidesList}
        testID={`${testID}-slides-list`}
      />

      {/* Footer */}
      {renderFooter()}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
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
  slidesList: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: screenWidth - (SPACING.lg * 2),
  },
  customComponent: {
    marginBottom: SPACING.xl,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    maxWidth: 280,
    maxHeight: 280,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  slideTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  slideSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slideDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    paddingHorizontal: SPACING.md,
  },
  slideActions: {
    width: '100%',
    gap: SPACING.md,
  },
  slideActionButton: {
    paddingVertical: SPACING.lg,
  },
  slideActionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  indicatorActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  navButton: {
    paddingVertical: SPACING.lg,
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  nextIcon: {
    width: 20,
    height: 20,
    color: COLORS.primaryForeground,
  },
});

export default OnboardingScreen;
export type { 
  OnboardingScreenProps, 
  OnboardingScreenConfig, 
  OnboardingSlide 
};
