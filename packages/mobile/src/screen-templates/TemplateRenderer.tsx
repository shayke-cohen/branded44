import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  getTemplateWithComponent,
  validateTemplate,
  TemplateConfig
} from './templateConfig';

interface TemplateRendererProps {
  templateId: string;
  additionalProps?: Record<string, any>;
  showHeader?: boolean;
  style?: any;
  onError?: (error: string) => void;
  fallbackComponent?: React.ComponentType<any>;
  wrapperStyle?: any;
}

interface TemplateHeaderProps {
  config: TemplateConfig;
  style?: any;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({config, style}) => (
  <View style={[styles.templateHeader, style]}>
    <View style={styles.templateHeaderRow}>
      <Text style={styles.templateTitle}>
        {config.icon} {config.name}
      </Text>
      <View style={styles.complexityBadge}>
        <Text style={styles.complexityText}>{config.complexity}</Text>
      </View>
    </View>
    {config.category && (
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{config.category}</Text>
      </View>
    )}
    <Text style={styles.templateDescription}>{config.description}</Text>
    {config.features && (
      <View style={styles.featuresContainer}>
        {config.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    )}
    {config.customizable && (
      <View style={styles.customizableIndicator}>
        <Text style={styles.customizableIcon}>⚙️</Text>
        <Text style={styles.customizableText}>Customizable</Text>
      </View>
    )}
  </View>
);

const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  templateId,
  additionalProps = {},
  showHeader = false,
  style,
  onError,
  fallbackComponent: FallbackComponent,
  wrapperStyle
}) => {
  // Validate template first
  const validation = validateTemplate(templateId);
  
  if (!validation.isValid) {
    const errorMessage = validation.error || 'Unknown template error';
    onError?.(errorMessage);
    
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorTitle}>❌ Template Error</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Text style={styles.errorCode}>Template ID: {templateId}</Text>
      </View>
    );
  }

  // Get template config and component
  const { config, component: TemplateComponent } = getTemplateWithComponent(templateId);
  
  if (!config || !TemplateComponent) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorTitle}>❌ Component Not Found</Text>
        <Text style={styles.errorMessage}>
          Template component "{config?.componentKey || templateId}" could not be loaded
        </Text>
      </View>
    );
  }

  // Merge props
  const finalProps = {
    ...(config.defaultProps || {}),
    ...additionalProps
  };

  return (
    <View style={[styles.container, style]}>
      {showHeader && <TemplateHeader config={config} />}
      
      <View style={[styles.templateWrapper, wrapperStyle]}>
        <TemplateComponent {...finalProps} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  templateHeader: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  templateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  complexityBadge: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  complexityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  categoryBadge: {
    backgroundColor: '#66666620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666666',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
  },
  customizableIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customizableIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  customizableText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  templateWrapper: {
    flex: 1,
    minHeight: 300,
    overflow: 'hidden',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    margin: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#7f1d1d',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorCode: {
    fontSize: 12,
    color: '#991b1b',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});

export default TemplateRenderer; 