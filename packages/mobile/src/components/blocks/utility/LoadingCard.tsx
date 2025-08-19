/**
 * LoadingCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive loading state card component with multiple animation styles,
 * skeleton loading, and customizable loading indicators for various use cases.
 * 
 * Features:
 * - Multiple loading animation types (skeleton, spinner, pulse, wave)
 * - Customizable loading layouts (text, image, list, card)
 * - Progress indicators for long operations
 * - Custom loading messages and tips
 * - Animated placeholders
 * - Accessibility support
 * - Dark mode compatibility
 * 
 * @example
 * ```tsx
 * <LoadingCard
 *   type="skeleton"
 *   layout="card"
 *   message="Loading your content..."
 *   showProgress={true}
 *   progress={45}
 *   tips={["This usually takes a few seconds"]}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Loading animation type
 */
export type LoadingType = 'skeleton' | 'spinner' | 'pulse' | 'wave' | 'dots' | 'bars';

/**
 * Loading layout template
 */
export type LoadingLayout = 'text' | 'card' | 'list' | 'profile' | 'image' | 'table' | 'custom';

/**
 * Loading size
 */
export type LoadingSize = 'small' | 'medium' | 'large';

/**
 * Custom skeleton element
 */
export interface SkeletonElement {
  /** Element type */
  type: 'text' | 'image' | 'circle' | 'rect';
  /** Width (percentage or fixed) */
  width: string | number;
  /** Height */
  height: number;
  /** Border radius */
  borderRadius?: number;
  /** Margin bottom */
  marginBottom?: number;
}

/**
 * Props for the LoadingCard component
 */
export interface LoadingCardProps extends BaseComponentProps {
  /** Loading animation type */
  type?: LoadingType;
  /** Loading layout template */
  layout?: LoadingLayout;
  /** Loading size */
  size?: LoadingSize;
  /** Loading message */
  message?: string;
  /** Subtitle message */
  subtitle?: string;
  /** Whether to show progress indicator */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Loading tips to show */
  tips?: string[];
  /** Custom skeleton elements */
  skeletonElements?: SkeletonElement[];
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether animation is enabled */
  animated?: boolean;
  /** Custom loading icon */
  icon?: string;
  /** Color theme */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Whether to show border */
  showBorder?: boolean;
  /** Number of skeleton items (for lists) */
  itemCount?: number;
  /** Minimum height */
  minHeight?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * LoadingCard component for displaying loading states
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({
  type = 'skeleton',
  layout = 'card',
  size = 'medium',
  message = 'Loading...',
  subtitle,
  showProgress = false,
  progress = 0,
  tips,
  skeletonElements,
  animationDuration = 1500,
  animated = true,
  icon,
  color = COLORS.primary[500],
  backgroundColor = COLORS.white,
  showBorder = true,
  itemCount = 3,
  minHeight,
  style,
  testID = 'loading-card',
  ...props
}) => {
  // =============================================================================
  // ANIMATION SETUP
  // =============================================================================

  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Only use native driver on actual mobile platforms, not web
    const useNativeDriver = Platform.OS !== 'web';

    const createAnimation = () => {
      switch (type) {
        case 'skeleton':
        case 'pulse':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: animationDuration / 2,
                easing: Easing.ease,
                useNativeDriver,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0.3,
                duration: animationDuration / 2,
                easing: Easing.ease,
                useNativeDriver,
              }),
            ])
          );

        case 'spinner':
          return Animated.loop(
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: animationDuration,
              easing: Easing.linear,
              useNativeDriver,
            })
          );

        case 'wave':
          return Animated.loop(
            Animated.timing(translateAnim, {
              toValue: 1,
              duration: animationDuration,
              easing: Easing.ease,
              useNativeDriver,
            })
          );

        case 'dots':
        case 'bars':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: animationDuration / 3,
                easing: Easing.ease,
                useNativeDriver,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: animationDuration / 3,
                easing: Easing.ease,
                useNativeDriver,
              }),
            ])
          );

        default:
          return Animated.loop(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: animationDuration,
              easing: Easing.ease,
              useNativeDriver,
            })
          );
      }
    };

    const animation = createAnimation();
    animation.start();

    return () => animation.stop();
  }, [type, animated, animationDuration, fadeAnim, rotateAnim, scaleAnim, translateAnim]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getSkeletonStyle = () => ({
    opacity: fadeAnim,
    backgroundColor: COLORS.neutral[200],
  });

  const getSpinnerTransform = () => ({
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  });

  const getWaveTransform = () => ({
    transform: [
      {
        translateX: translateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 100],
        }),
      },
    ],
  });

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderSkeletonElement = (element: SkeletonElement, index: number) => {
    const elementStyle = [
      styles.skeletonElement,
      getSkeletonStyle(),
      {
        width: typeof element.width === 'string' ? element.width : element.width,
        height: element.height,
        borderRadius: element.borderRadius || 4,
        marginBottom: element.marginBottom || SPACING.sm,
      },
    ];

    if (element.type === 'circle') {
      elementStyle.push({ borderRadius: element.height / 2 });
    }

    return <Animated.View key={index} style={elementStyle} />;
  };

  const renderSkeletonLayout = () => {
    if (skeletonElements) {
      return (
        <View style={styles.customSkeleton}>
          {skeletonElements.map((element, index) => renderSkeletonElement(element, index))}
        </View>
      );
    }

    const layouts: Record<LoadingLayout, SkeletonElement[]> = {
      text: [
        { type: 'text', width: '80%', height: 16 },
        { type: 'text', width: '60%', height: 16 },
        { type: 'text', width: '40%', height: 16 },
      ],
      card: [
        { type: 'image', width: '100%', height: 120, borderRadius: 8 },
        { type: 'text', width: '70%', height: 20, marginBottom: SPACING.xs },
        { type: 'text', width: '100%', height: 14 },
        { type: 'text', width: '80%', height: 14 },
      ],
      list: Array(itemCount).fill(null).map(() => [
        { type: 'circle', width: 40, height: 40 },
        { type: 'text', width: '60%', height: 16 },
        { type: 'text', width: '40%', height: 12 },
      ]).flat(),
      profile: [
        { type: 'circle', width: 80, height: 80, marginBottom: SPACING.md },
        { type: 'text', width: '50%', height: 20, marginBottom: SPACING.xs },
        { type: 'text', width: '70%', height: 14 },
      ],
      image: [
        { type: 'image', width: '100%', height: 200, borderRadius: 8 },
      ],
      table: Array(4).fill(null).map(() => [
        { type: 'text', width: '25%', height: 14 },
        { type: 'text', width: '25%', height: 14 },
        { type: 'text', width: '25%', height: 14 },
        { type: 'text', width: '25%', height: 14 },
      ]).flat(),
      custom: [
        { type: 'text', width: '60%', height: 16 },
      ],
    };

    const elements = layouts[layout] || layouts.text;
    
    return (
      <View style={styles.skeletonContainer}>
        {elements.map((element, index) => renderSkeletonElement(element, index))}
      </View>
    );
  };

  const renderSpinner = () => (
    <View style={styles.spinnerContainer}>
      <Animated.View style={[styles.spinner, { borderColor: color }, getSpinnerTransform()]} />
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: color },
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  const renderBars = () => (
    <View style={styles.barsContainer}>
      {[0, 1, 2, 3].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            { backgroundColor: color },
            {
              transform: [
                {
                  scaleY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: color 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    );
  };

  const renderTips = () => {
    if (!tips || tips.length === 0) return null;

    return (
      <View style={styles.tipsContainer}>
        {tips.map((tip, index) => (
          <Text key={index} style={styles.tipText}>
            💡 {tip}
          </Text>
        ))}
      </View>
    );
  };

  const renderLoadingContent = () => {
    switch (type) {
      case 'skeleton':
      case 'pulse':
      case 'wave':
        return renderSkeletonLayout();
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'bars':
        return renderBars();
      default:
        return renderSkeletonLayout();
    }
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card
      style={[
        styles.card,
        size === 'small' && styles.smallCard,
        size === 'large' && styles.largeCard,
        !showBorder && styles.noBorder,
        { backgroundColor, minHeight },
        style
      ]}
      testID={testID}
      {...props}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <View style={styles.textContainer}>
            <Text style={styles.message}>{message}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {/* Loading Content */}
        {renderLoadingContent()}

        {/* Progress */}
        {renderProgress()}

        {/* Tips */}
        {renderTips()}
      </View>
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    margin: 0,
  },
  smallCard: {
    minHeight: 100,
  },
  largeCard: {
    minHeight: 300,
  },
  noBorder: {
    borderWidth: 0,
    elevation: 0,
    boxShadow: 'none',
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  skeletonContainer: {
    marginBottom: SPACING.md,
  },
  customSkeleton: {
    marginBottom: SPACING.md,
  },
  skeletonElement: {
    borderRadius: 4,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  spinner: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRadius: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'end',
    paddingVertical: SPACING.lg,
    gap: SPACING.xs,
  },
  bar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[600],
    minWidth: 35,
    textAlign: 'right',
  },
  tipsContainer: {
    gap: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
});

export default LoadingCard;
