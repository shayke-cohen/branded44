/**
 * LoadingState - Reusable loading state component
 * 
 * Consistent loading UI across all screens
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createProductListStyles } from '../../shared/styles/ProductListStyles';

interface LoadingStateProps {
  message?: string;
  showDots?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  showDots = true,
}) => {
  const { theme } = useTheme();
  const styles = createProductListStyles(theme);

  // Animated dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showDots) return;

    const animateDots = () => {
      const createAnimation = (dot: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -10,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.loop(
        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 200),
          createAnimation(dot3, 400),
        ])
      ).start();
    };

    animateDots();
  }, [dot1, dot2, dot3, showDots]);

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>{message}</Text>
      {showDots && (
        <View style={styles.loadingDots}>
          <Animated.View
            style={[
              styles.loadingDot,
              { transform: [{ translateY: dot1 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              { transform: [{ translateY: dot2 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              { transform: [{ translateY: dot3 }] },
            ]}
          />
        </View>
      )}
    </View>
  );
};

export default LoadingState;
