// React Native Reanimated polyfill for web
export const useSharedValue = (initialValue) => {
  return { value: initialValue };
};

export const useAnimatedStyle = (styleFunction) => {
  return styleFunction();
};

export const withTiming = (value, config) => {
  return value;
};

export const withSpring = (value, config) => {
  return value;
};

export const runOnJS = (fn) => {
  return fn;
};

export const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
};

export default {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
};
