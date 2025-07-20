import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTheme} from '@mobile/context';

// Import the new dynamic template system
import {
  TEMPLATE_CONFIG,
  TemplateConfig,
  TemplateComplexity,
  getTemplatesByComplexity,
  getTemplateComponent,
  getTemplateConfig,
  getAllCategories,
} from '@mobile/screen-templates/templateConfig';

interface WebTemplateIndexScreenProps {
  onAppLaunch?: (app: {id: string; name: string; icon?: string}) => void;
}

const WebTemplateIndexScreen: React.FC<WebTemplateIndexScreenProps> = ({onAppLaunch}) => {
  const {theme} = useTheme();
  const [activeTab, setActiveTab] = useState<TemplateComplexity>('Simple');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);

  // Get templates dynamically from configuration
  const filteredTemplates = getTemplatesByComplexity(activeTab);
  const categories = getAllCategories();

  const renderTemplate = (item: TemplateConfig) => {
    if (item.complexity === 'Apps') {
      return (
        <View key={item.id} style={styles.appCard}>
          <View style={styles.appHeader}>
            <Text style={styles.appIcon}>{item.icon}</Text>
            <Text style={styles.appName}>{item.name}</Text>
            <View style={styles.appBadge}>
              <Text style={styles.appBadgeText}>Apps</Text>
            </View>
          </View>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          <Text style={styles.appDescription}>{item.description}</Text>
          {item.customizable && (
            <View style={styles.customizableIndicator}>
              <Text style={styles.customizableIcon}>⚙️</Text>
              <Text style={styles.customizableText}>Customizable</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.launchButton}
            onPress={() => onAppLaunch?.({id: item.id, name: item.name, icon: item.icon})}>
            <Text style={styles.launchIcon}>🚀</Text>
            <Text style={styles.launchTitle}>Launch {item.name}</Text>
            <Text style={styles.launchSubtitle}>Tap to open</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.templateCard}
          onPress={() => setSelectedTemplate(item)}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateIcon}>{item.icon}</Text>
            <Text style={styles.templateName}>{item.name}</Text>
            <View style={styles.complexityBadge}>
              <Text style={styles.complexityText}>{item.complexity}</Text>
            </View>
          </View>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          <Text style={styles.templateDescription}>{item.description}</Text>
          {item.features && (
            <View style={styles.featuresContainer}>
              {item.features.slice(0, 3).map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
          {item.customizable && (
            <View style={styles.customizableIndicator}>
              <Text style={styles.customizableIcon}>⚙️</Text>
              <Text style={styles.customizableText}>Customizable</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
  };

  const renderTemplateDetail = () => {
    if (!selectedTemplate) return null;

    const TemplateComponent = getTemplateComponent(selectedTemplate.componentKey);
    
    if (!TemplateComponent) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Template component "{selectedTemplate.componentKey}" not found
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.templateDetail}>
        <View style={styles.templateDetailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedTemplate(null)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.templateDetailTitle}>{selectedTemplate.name}</Text>
          <View style={styles.templateBadge}>
            <Text style={styles.templateBadgeText}>Template</Text>
          </View>
        </View>
        <View style={styles.templateContent}>
          <TemplateComponent {...(selectedTemplate.defaultProps || {})} />
        </View>
      </View>
    );
  };

  if (selectedTemplate) {
    return renderTemplateDetail();
  }

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
    categoriesText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 8,
      fontStyle: 'italic',
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
    appGridContainer: {
      padding: 16,
    },
    listContent: {
      padding: 16,
    },
    appCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      marginHorizontal: 8,
      width: '45%',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    appHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    appIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    appName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    appBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    appBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    categoryBadge: {
      backgroundColor: theme.colors.textSecondary + '20',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: 8,
      alignSelf: 'flex-start',
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    appDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
      marginBottom: 12,
    },
    customizableIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
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
    launchButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    launchIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    launchTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 2,
    },
    launchSubtitle: {
      fontSize: 10,
      color: '#ffffff',
      opacity: 0.8,
    },
    templateCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    templateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    templateIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    templateName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    complexityBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    complexityText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    templateDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    featuresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    featureTag: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    featureText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    templateDetail: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    templateDetailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    templateDetailTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    templateBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    templateBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    templateContent: {
      flex: 1,
    },
    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Template Gallery</Text>
        <Text style={styles.subtitle}>
          Interact with actual React Native components. All templates are live and fully
          functional with real data and interactions.
        </Text>
        <Text style={styles.categoriesText}>
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
        key={activeTab}
      />
    </SafeAreaView>
  );
};

export default WebTemplateIndexScreen; 