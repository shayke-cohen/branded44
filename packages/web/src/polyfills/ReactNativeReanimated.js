// React Native Reanimated polyfill for web
import { View, Text, ScrollView, TextInput } from 'react-native-web';

// Mock animated values and functions
const mockAnimatedValue = (initialValue) => {
  const value = { value: initialValue };
  return {
    ...value,
    setValue: (newValue) => { value.value = newValue; },
    addListener: () => {},
    removeListener: () => {},
    removeAllListeners: () => {},
  };
};

// Mock useAnimatedStyle
const useAnimatedStyle = (styleFunction) => {
  try {
    return styleFunction() || {};
  } catch (error) {
    console.warn('useAnimatedStyle error:', error);
    return {};
  }
};

// Mock useSharedValue
const useSharedValue = (initialValue) => {
  return { value: initialValue };
};

// Mock useDerivedValue
const useDerivedValue = (derivedFunction) => {
  try {
    return { value: derivedFunction() };
  } catch (error) {
    console.warn('useDerivedValue error:', error);
    return { value: 0 };
  }
};

// Mock withTiming, withSpring, etc.
const withTiming = (value, config) => value;
const withSpring = (value, config) => value;
const withDelay = (delay, animation) => animation;
const withRepeat = (animation, numberOfReps) => animation;
const cancelAnimation = () => {};

// Mock runOnJS
const runOnJS = (fn) => fn;

// Mock Extrapolation enum
const Extrapolation = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

// Mock interpolate
const interpolate = (value, inputRange, outputRange, extrapolate) => {
  if (typeof value !== 'number') return outputRange[0];
  
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (value >= inputRange[i] && value <= inputRange[i + 1]) {
      const ratio = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + ratio * (outputRange[i + 1] - outputRange[i]);
    }
  }
  
  return value < inputRange[0] ? outputRange[0] : outputRange[outputRange.length - 1];
};

// Create animated components that are just regular components
const AnimatedView = View;
const AnimatedText = Text;
const AnimatedScrollView = ScrollView;
const AnimatedTextInput = TextInput;

// Export everything that react-native-reanimated typically exports
export default {
  View: AnimatedView,
  Text: AnimatedText,
  ScrollView: AnimatedScrollView,
  TextInput: AnimatedTextInput,
  createAnimatedComponent: (Component) => Component,
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  cancelAnimation,
  runOnJS,
  interpolate,
  Extrapolation,
  AnimatedView,
  AnimatedText,
  AnimatedScrollView,
  AnimatedTextInput,
};

export {
  AnimatedView,
  AnimatedText,
  AnimatedScrollView,
  AnimatedTextInput,
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  cancelAnimation,
  runOnJS,
  interpolate,
  Extrapolation,
};
