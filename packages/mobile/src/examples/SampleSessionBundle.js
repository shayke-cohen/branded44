/**
 * Sample Session Bundle Structure
 * 
 * This shows how session bundles should be structured to work with
 * the ComponentRegistry and SessionBundleLoader dynamic execution system.
 * 
 * The Metro bundler will generate bundles in this format from the session workspace.
 */

// Import React (available in execution context)
const React = require('react');
const { View, Text, StyleSheet, TouchableOpacity } = require('react-native');

// Sample Custom Screen Components
const CustomHomeScreen = (props) => {
  return React.createElement(View, { style: styles.screen },
    React.createElement(Text, { style: styles.title }, '🏠 Custom Home Screen'),
    React.createElement(Text, { style: styles.subtitle }, 'This screen was loaded dynamically!'),
    React.createElement(Text, { style: styles.props }, `Props: ${JSON.stringify(props, null, 2)}`)
  );
};

const CustomSettingsScreen = (props) => {
  return React.createElement(View, { style: styles.screen },
    React.createElement(Text, { style: styles.title }, '⚙️ Custom Settings Screen'),
    React.createElement(Text, { style: styles.subtitle }, 'Hot-swapped at runtime!'),
    React.createElement(TouchableOpacity, { 
      style: styles.button,
      onPress: () => console.log('Custom settings button pressed!')
    },
      React.createElement(Text, { style: styles.buttonText }, 'Custom Action')
    )
  );
};

// Sample Custom Service
const CustomApiClient = {
  baseUrl: 'https://api.example.com',
  
  async fetchData(endpoint) {
    console.log(`📡 [CustomApiClient] Fetching: ${this.baseUrl}/${endpoint}`);
    // Simulate API call
    return { 
      data: `Mock data from ${endpoint}`, 
      timestamp: Date.now(),
      source: 'session-bundle'
    };
  },
  
  async postData(endpoint, data) {
    console.log(`📤 [CustomApiClient] Posting to: ${this.baseUrl}/${endpoint}`, data);
    return { success: true, id: Math.random().toString(36) };
  }
};

// Sample Custom App Component (optional - replaces entire app)
const CustomApp = (props) => {
  return React.createElement(View, { style: styles.app },
    React.createElement(Text, { style: styles.appTitle }, '🚀 Custom Session App'),
    React.createElement(Text, { style: styles.appSubtitle }, 'Completely replaced app structure'),
    React.createElement(CustomHomeScreen, { sessionProp: 'Hello from session app!' })
  );
};

// Sample Navigation Configuration
const customNavigation = {
  initialRouteName: 'CustomHome',
  routes: {
    CustomHome: {
      component: CustomHomeScreen,
      title: 'Custom Home',
      icon: '🏠'
    },
    CustomSettings: {
      component: CustomSettingsScreen,
      title: 'Custom Settings',
      icon: '⚙️'
    }
  },
  options: {
    headerShown: true,
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#999'
  }
};

// Styles (shared across components)
const styles = {
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  app: {
    flex: 1,
    backgroundColor: '#e8f4f8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 40,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  props: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};

// Export the session module (this is what ComponentRegistry expects)
const sessionModule = {
  // Screens that can override default app screens
  screens: {
    HomeScreen: CustomHomeScreen,
    SettingsScreen: CustomSettingsScreen,
    // Add more custom screens here...
  },
  
  // Services that can be used by the app
  services: {
    apiClient: CustomApiClient,
    // Add more custom services here...
  },
  
  // Navigation configuration (optional)
  navigation: customNavigation,
  
  // App component (optional - replaces entire app)
  App: CustomApp,
  
  // Metadata about this session bundle
  meta: {
    version: '1.0.0',
    description: 'Sample session bundle for dynamic loading demo',
    author: 'Visual Editor',
    createdAt: new Date().toISOString(),
    components: ['HomeScreen', 'SettingsScreen'],
    services: ['apiClient'],
    hasCustomApp: true,
    hasCustomNavigation: true
  }
};

// Export as both named export and default export for compatibility
module.exports = sessionModule;
module.exports.default = sessionModule;

// Also expose individual components for direct access
module.exports.CustomHomeScreen = CustomHomeScreen;
module.exports.CustomSettingsScreen = CustomSettingsScreen;
module.exports.CustomApiClient = CustomApiClient;
module.exports.CustomApp = CustomApp;

console.log('📦 [SessionBundle] Sample session bundle loaded with', Object.keys(sessionModule.screens || {}).length, 'screens');
