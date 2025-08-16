// React Navigation polyfill for web
const React = require('react');

// Navigation context mock
const NavigationContext = React.createContext({
  navigate: () => {},
  goBack: () => {},
  canGoBack: () => false,
  getState: () => ({}),
  dispatch: () => {},
  addListener: () => () => {},
  removeListener: () => {},
});

// useNavigation hook
const useNavigation = () => {
  return React.useContext(NavigationContext);
};

// useFocusEffect hook
const useFocusEffect = (callback) => {
  React.useEffect(() => {
    callback();
  }, [callback]);
};

// useIsFocused hook
const useIsFocused = () => {
  return true; // Always focused in web environment
};

// useRoute hook
const useRoute = () => {
  return {
    key: 'web-route',
    name: 'WebScreen',
    params: {},
  };
};

// NavigationContainer component
const NavigationContainer = ({ children, ...props }) => {
  const navigationValue = {
    navigate: (name, params) => {
      console.log('Navigate to:', name, params);
    },
    goBack: () => {
      console.log('Go back');
    },
    canGoBack: () => false,
    getState: () => ({}),
    dispatch: () => {},
    addListener: () => () => {},
    removeListener: () => {},
  };

  return React.createElement(
    NavigationContext.Provider,
    { value: navigationValue },
    React.createElement('div', { ...props, style: { flex: 1, ...props.style } }, children)
  );
};

// CommonActions
const CommonActions = {
  navigate: (name, params) => ({
    type: 'NAVIGATE',
    payload: { name, params },
  }),
  goBack: () => ({
    type: 'GO_BACK',
  }),
  reset: (state) => ({
    type: 'RESET',
    payload: state,
  }),
};

// CommonJS exports
const navigationExports = {
  useNavigation,
  useFocusEffect,
  useIsFocused,
  useRoute,
  NavigationContainer,
  CommonActions,
};

module.exports = navigationExports;
module.exports.default = navigationExports;
module.exports.useNavigation = useNavigation;
module.exports.useFocusEffect = useFocusEffect;
module.exports.useIsFocused = useIsFocused;
module.exports.useRoute = useRoute;
module.exports.NavigationContainer = NavigationContainer;
module.exports.CommonActions = CommonActions;
