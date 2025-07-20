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

// Import the unified template system (includes registry)
import {
  TEMPLATE_CONFIG,
  TemplateConfig,
  TemplateComplexity,
  getTemplatesByComplexity,
  getTemplateComponent,
  getTemplateConfig,
  getAllCategories,
} from '../../screen-templates/templateConfig';

const {width: screenWidth} = Dimensions.get('window');

interface TemplateIndexScreenProps {
  navigation?: any;
  onAppLaunch?: (app: {id: string; name: string; icon?: string}) => void;
}

const TemplateIndexScreen: React.FC<TemplateIndexScreenProps> = ({navigation, onAppLaunch}) => {
  const {theme} = useTheme();
  const [activeTab, setActiveTab] = useState<TemplateComplexity>('Simple');
  const [activeApp, setActiveApp] = useState<TemplateConfig | null>(null);

  // Get templates dynamically from configuration
  const filteredTemplates = getTemplatesByComplexity(activeTab);
  const categories = getAllCategories();

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
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    listContent: {
      padding: 16,
    },
    appGridContainer: {
      padding: 16,
    },
    templateContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    appContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      marginHorizontal: 8,
      width: (screenWidth - 56) / 2,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    templateHeader: {
      padding: 16,
    },
    templateHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    templateName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    complexityBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    complexityText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    categoryBadge: {
      backgroundColor: theme.colors.textSecondary + '20',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    templateDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    featuresContainer: {
      marginTop: 8,
    },
    featuresTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    featureItem: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 8,
      lineHeight: 16,
    },
    templateContent: {
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    templateWrapper: {
      minHeight: 300,
      overflow: 'hidden',
    },
    appLaunchContainer: {
      padding: 16,
      alignItems: 'center',
      height: 130,
      justifyContent: 'center',
    },
    launchButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      minWidth: 120,
    },
    launchButtonIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    launchButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 2,
    },
    launchButtonSubtext: {
      fontSize: 10,
      color: '#ffffff',
      opacity: 0.8,
    },
    customizableIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    customizableIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    customizableText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

  const renderTemplate = (template: TemplateConfig) => {
    const isApp = template.complexity === 'Apps';
    const containerStyle = isApp ? styles.appContainer : styles.templateContainer;
    const TemplateComponent = getTemplateComponent(template.componentKey);

    if (!TemplateComponent) {
      return (
        <View key={template.id} style={containerStyle}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateName}>Component not found</Text>
            <Text style={styles.templateDescription}>
              Template component "{template.componentKey}" is not available
            </Text>
          </View>
        </View>
      );
    }

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
          
          {template.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{template.category}</Text>
            </View>
          )}
          
          <Text style={styles.templateDescription} numberOfLines={isApp ? 3 : undefined}>
            {template.description}
          </Text>
          
          {template.features && template.features.length > 0 && !isApp && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Features:</Text>
              {template.features.slice(0, 4).map((feature, index) => (
                <Text key={index} style={styles.featureItem}>• {feature}</Text>
              ))}
            </View>
          )}

          {template.customizable && (
            <View style={styles.customizableIndicator}>
              <Text style={styles.customizableIcon}>⚙️</Text>
              <Text style={styles.customizableText}>Customizable</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.templateContent, isApp && {height: 130}]}>
          {isApp ? (
            <View style={styles.appLaunchContainer}>
              <TouchableOpacity
                style={styles.launchButton}
                onPress={() => {
                  if (onAppLaunch) {
                    onAppLaunch({
                      id: template.id,
                      name: template.name,
                      icon: template.icon,
                    });
                  } else {
                    setActiveApp(template);
                  }
                }}
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
              <TemplateComponent {...(template.defaultProps || {})} testIDPrefix={`${template.id}-`} />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAppModal = () => {
    if (!activeApp) return null;
    
    const TemplateComponent = getTemplateComponent(activeApp.componentKey);
    if (!TemplateComponent) return null;

    return (
      <AppContainer
        isVisible={!!activeApp}
        onClose={() => setActiveApp(null)}
        appName={activeApp.name}
        appIcon={activeApp.icon}>
        <TemplateComponent {...(activeApp.defaultProps || {})} />
      </AppContainer>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Template Gallery</Text>
        <Text style={styles.subtitle}>
          Interact with actual React Native components. All templates are live and fully
          functional with real data and interactions.
        </Text>
        <Text style={[styles.subtitle, {marginTop: 8, fontSize: 14}]}>
          Categories: {categories.join(' • ')}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {['Simple', 'Complex', 'Apps'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as TemplateComplexity)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab} ({getTemplatesByComplexity(tab as TemplateComplexity).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTemplates}
        renderItem={({item}: {item: TemplateConfig}) => renderTemplate(item)}
        keyExtractor={(item: TemplateConfig) => item.id}
        style={styles.content}
        contentContainerStyle={activeTab === 'Apps' ? styles.appGridContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={activeTab === 'Apps' ? 2 : 1}
        key={activeTab} // Force re-render when changing columns
      />

      {renderAppModal()}
    </SafeAreaView>
  );
};

export default TemplateIndexScreen; 