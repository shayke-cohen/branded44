import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {useTheme} from '../../context';
import {AppContainer} from '../../components';

// Import basic templates
import AuthScreenTemplate from '../../screen-templates/AuthScreenTemplate';
import DashboardScreenTemplate from '../../screen-templates/DashboardScreenTemplate';
import FormScreenTemplate from '../../screen-templates/FormScreenTemplate';
import ListScreenTemplate from '../../screen-templates/ListScreenTemplate';

// Import complex examples
import ProductListScreen from '../../screen-templates/examples/ProductListScreen';
import ProductDetailScreen from '../../screen-templates/examples/ProductDetailScreen';
import CartScreen from '../../screen-templates/examples/CartScreen';
import CheckoutScreen from '../../screen-templates/examples/CheckoutScreen';
import SearchScreen from '../../screen-templates/examples/SearchScreen';

// Import sample apps
import {TodoApp} from '../../sample-apps/TodoApp';
import {CalculatorApp} from '../../sample-apps/CalculatorApp';
import {WeatherApp} from '../../sample-apps/WeatherApp';
import {NotesApp} from '../../sample-apps/NotesApp';

const {width: screenWidth} = Dimensions.get('window');

interface Template {
  id: string;
  name: string;
  description: string;
  complexity: 'Simple' | 'Complex' | 'Apps';
  component: React.ComponentType<any>;
  props?: any;
  features?: string[];
  icon?: string;
}

const templates: Template[] = [
  // Simple Templates
  {
    id: 'auth',
    name: 'Authentication Template',
    description: 'Multi-mode authentication with social login, validation, and accessibility features.',
    complexity: 'Simple',
    component: AuthScreenTemplate,
    props: {
      mode: 'login' as const,
      showSocialLogins: true,
      allowModeSwitch: true,
    },
  },
  {
    id: 'dashboard',
    name: 'Dashboard Template',
    description: 'Customizable dashboard with stat cards, quick actions, and responsive layout.',
    complexity: 'Simple',
    component: DashboardScreenTemplate,
    props: {
      title: 'Sample Dashboard',
      stats: [
        {id: 'users', label: 'Users', value: '1,234', trend: '+12%', icon: '👥'},
        {id: 'revenue', label: 'Revenue', value: '$45.2K', trend: '+8%', icon: '💰'},
        {id: 'orders', label: 'Orders', value: '856', trend: '+15%', icon: '📦'},
        {id: 'growth', label: 'Growth', value: '23%', trend: '+5%', icon: '📈'},
      ],
      quickActions: [
        {id: 'add-user', label: 'Add User', icon: '➕', onPress: () => console.log('Add User')},
        {id: 'reports', label: 'Reports', icon: '📊', onPress: () => console.log('Reports')},
        {id: 'settings', label: 'Settings', icon: '⚙️', onPress: () => console.log('Settings')},
      ],
    },
  },
  {
    id: 'form',
    name: 'Form Template',
    description: 'Dynamic form with validation, error handling, and various input types.',
    complexity: 'Simple',
    component: FormScreenTemplate,
    props: {
      title: 'Sample Form',
      fields: [
        {
          key: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your name',
        },
        {
          key: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'your@email.com',
        },
        {
          key: 'bio',
          label: 'Bio',
          type: 'textarea',
          placeholder: 'Tell us about yourself',
        },
      ],
      submitButtonText: 'Submit Form',
      onSubmit: async (data: any) => {
        console.log('Form submitted:', data);
      },
    },
  },
  {
    id: 'list',
    name: 'List Template',
    description: 'Searchable list with filtering, multiple display modes, and empty states.',
    complexity: 'Simple',
    component: ListScreenTemplate,
    props: {
      title: 'Sample List',
      data: [
        {id: '1', name: 'Item 1', category: 'Category A'},
        {id: '2', name: 'Item 2', category: 'Category B'},
        {id: '3', name: 'Item 3', category: 'Category A'},
      ],
      renderItem: (item: any) => (
        <View style={{padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee'}}>
          <Text style={{fontSize: 16, fontWeight: '600'}}>{item.name}</Text>
          <Text style={{fontSize: 14, color: '#666'}}>{item.category}</Text>
        </View>
      ),
      displayMode: 'list' as const,
      emptyMessage: 'No items found',
    },
  },
  
  // Complex Examples
  {
    id: 'product-list',
    name: 'Product List Screen',
    description: 'Full e-commerce product listing with filtering, sorting, wishlist, and cart integration.',
    complexity: 'Complex',
    component: ProductListScreen,
    props: {
      onProductPress: (product: any) => console.log('Product pressed:', product.name),
    },
  },
  {
    id: 'product-detail',
    name: 'Product Detail Screen',
    description: 'Comprehensive product view with image gallery, reviews, specifications, and purchase options.',
    complexity: 'Complex',
    component: ProductDetailScreen,
    props: {
      productId: '1',
      onBack: () => console.log('Back pressed'),
    },
  },
  {
    id: 'cart',
    name: 'Cart Screen',
    description: 'Complete shopping cart with quantity management, pricing calculations, and checkout flow.',
    complexity: 'Complex',
    component: CartScreen,
    props: {
      onBack: () => console.log('Back pressed'),
      onCheckout: () => console.log('Checkout pressed'),
    },
  },
  {
    id: 'checkout',
    name: 'Checkout Screen',
    description: 'Multi-step checkout with address management, payment processing, and order confirmation.',
    complexity: 'Complex',
    component: CheckoutScreen,
    props: {
      onBack: () => console.log('Back pressed'),
      onOrderComplete: (order: any) => console.log('Order completed:', order),
    },
  },
  {
    id: 'search',
    name: 'Search Screen',
    description: 'Advanced search interface with filters, suggestions, history, and result management.',
    complexity: 'Complex',
    component: SearchScreen,
    props: {
      onProductPress: (product: any) => console.log('Product pressed:', product.name),
    },
  },
  
  // Sample Apps (Full Applications)
  {
    id: 'todo-app',
    name: 'Todo App',
    description: 'Complete task management application with categories, priorities, and local persistence.',
    complexity: 'Apps',
    component: TodoApp,
    icon: '✅',
    features: [
      'Add, edit, delete todos',
      'Categories & priorities',
      'Filter & search',
      'Local storage persistence',
      'Statistics & progress tracking',
    ],
  },
  {
    id: 'calculator-app',
    name: 'Calculator App',
    description: 'Advanced calculator with history, memory functions, and scientific operations.',
    complexity: 'Apps',
    component: CalculatorApp,
    icon: '🧮',
    features: [
      'Basic & advanced operations',
      'Memory functions (MC, MR, M+, M-)',
      'Calculation history',
      'Error handling',
      'Local storage persistence',
    ],
  },
  {
    id: 'weather-app',
    name: 'Weather App',
    description: 'Beautiful weather forecasting with location search, 7-day forecasts, and weather alerts.',
    complexity: 'Apps',
    component: WeatherApp,
    icon: '🌤️',
    features: [
      'Current weather & forecasts',
      'Location search & saved locations',
      'Hourly & 7-day forecasts',
      'Weather alerts & warnings',
      'Unit preferences (°C/°F, km/h/mph)',
    ],
  },
  {
    id: 'notes-app',
    name: 'Notes App',
    description: 'Rich text note-taking with folders, tags, search, and export capabilities.',
    complexity: 'Apps',
    component: NotesApp,
    icon: '📝',
    features: [
      'Rich text editing with formatting',
      'Folder organization & tagging',
      'Advanced search & filtering',
      'Note templates & export',
      'Pin favorites & auto-save',
    ],
  },
];

interface TemplateIndexScreenProps {
  navigation?: any;
}

const TemplateIndexScreen: React.FC<TemplateIndexScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const [activeTab, setActiveTab] = useState<'Simple' | 'Complex' | 'Apps'>('Simple');
  const [activeApp, setActiveApp] = useState<Template | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 50,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    tabTextActive: {
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
    },
    templateContainer: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    templateHeader: {
      padding: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    templateHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    templateName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    complexityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: theme.colors.primary + '20',
      marginLeft: 8,
    },
    complexityText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    templateDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    featuresContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    featuresTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 6,
    },
    featureItem: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: 2,
    },
    templateContent: {
      height: 300,
      backgroundColor: theme.colors.background,
    },
    templateWrapper: {
      flex: 1,
      transform: [{scale: 0.9}],
      marginHorizontal: -20,
    },
    appLaunchContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    launchButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 140,
      maxWidth: '90%',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    launchButtonIcon: {
      fontSize: 28,
      marginBottom: 8,
    },
    launchButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
      textAlign: 'center',
    },
    launchButtonSubtext: {
      fontSize: 11,
      color: '#FFFFFF',
      opacity: 0.85,
      textAlign: 'center',
    },
    listContent: {
      padding: 16,
    },
    // Improved grid styling for Apps
    appGridContainer: {
      paddingHorizontal: 8,
    },
    appGridItem: {
      flex: 1,
      marginHorizontal: 8,
      marginBottom: 16,
      maxWidth: (screenWidth - 48) / 2, // Ensure proper width calculation
    },
  });

  const filteredTemplates = templates.filter(template => template.complexity === activeTab);

  const renderTemplate = (template: Template) => {
    const TemplateComponent = template.component;
    const isApp = template.complexity === 'Apps';
    
    // Use different container styles for Apps grid layout
    const containerStyle = isApp ? [
      styles.templateContainer,
      styles.appGridItem,
      {height: 240}, // Slightly increased height for better button spacing
    ] : styles.templateContainer;

    return (
      <View key={template.id} style={containerStyle}>
        <View style={styles.templateHeader}>
          <View style={styles.templateHeaderRow}>
            <Text style={styles.templateName} numberOfLines={1}>
              {template.icon && `${template.icon} `}{template.name}
            </Text>
            <View style={styles.complexityBadge}>
              <Text style={styles.complexityText}>{template.complexity}</Text>
            </View>
          </View>
          
          <Text style={styles.templateDescription} numberOfLines={isApp ? 3 : undefined}>
            {template.description}
          </Text>
          
          {template.features && template.features.length > 0 && !isApp && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Features:</Text>
              {template.features.map((feature, index) => (
                <Text key={index} style={styles.featureItem}>• {feature}</Text>
              ))}
            </View>
          )}
        </View>
        
        <View style={[styles.templateContent, isApp && {height: 130}]}>
          {isApp ? (
            <View style={styles.appLaunchContainer}>
              <TouchableOpacity
                style={styles.launchButton}
                onPress={() => setActiveApp(template)}
                testID={`launch-${template.id}`}
                activeOpacity={0.8}>
                <Text style={styles.launchButtonIcon}>🚀</Text>
                <Text style={styles.launchButtonText} numberOfLines={2}>
                  Launch {template.name.replace(' App', '')}
                </Text>
                <Text style={styles.launchButtonSubtext}>Tap to open</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.templateWrapper}>
              <TemplateComponent {...(template.props || {})} testIDPrefix={`${template.id}-`} />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Template Gallery</Text>
        <Text style={styles.subtitle}>
          Interact with actual React Native components. All templates are live and fully 
          functional with real data and interactions.
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Simple' && styles.tabActive]}
          onPress={() => setActiveTab('Simple')}
        >
          <Text style={[styles.tabText, activeTab === 'Simple' && styles.tabTextActive]}>
            Simple ({templates.filter(t => t.complexity === 'Simple').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Complex' && styles.tabActive]}
          onPress={() => setActiveTab('Complex')}
        >
          <Text style={[styles.tabText, activeTab === 'Complex' && styles.tabTextActive]}>
            Complex ({templates.filter(t => t.complexity === 'Complex').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Apps' && styles.tabActive]}
          onPress={() => setActiveTab('Apps')}
        >
          <Text style={[styles.tabText, activeTab === 'Apps' && styles.tabTextActive]}>
            Apps ({templates.filter(t => t.complexity === 'Apps').length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTemplates}
        renderItem={({item}: {item: Template}) => renderTemplate(item)}
        keyExtractor={(item: Template) => item.id}
        style={styles.content}
        contentContainerStyle={activeTab === 'Apps' ? styles.appGridContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={activeTab === 'Apps' ? 2 : 1}
        key={activeTab} // Force re-render when changing columns
      />

      {activeApp && (
        <AppContainer
          isVisible={!!activeApp}
          onClose={() => setActiveApp(null)}
          appName={activeApp.name}
          appIcon={activeApp.icon}>
          {activeApp.id === 'todo-app' ? (
            <TodoApp />
          ) : activeApp.id === 'calculator-app' ? (
            <CalculatorApp />
          ) : activeApp.id === 'weather-app' ? (
            <WeatherApp />
          ) : activeApp.id === 'notes-app' ? (
            <NotesApp />
          ) : (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 18, textAlign: 'center'}}>
                {activeApp.icon} {activeApp.name} will launch here
              </Text>
              <Text style={{fontSize: 14, color: 'gray', marginTop: 8, textAlign: 'center'}}>
                App integration pending
              </Text>
            </View>
          )}
        </AppContainer>
      )}
    </View>
  );
};

export default TemplateIndexScreen; 