const fs = require('fs-extra');
const path = require('path');

/**
 * Service for scanning and discovering components in workspace
 * Extracted from the monolithic visualEditor.js route file
 */
class ComponentScannerService {
  constructor() {
    this.componentDirs = [
      { dir: 'components/blocks', type: 'block' },
      { dir: 'components/templates', type: 'template' },
      { dir: 'screens', type: 'screen' }
    ];
    this.supportedExtensions = ['.tsx', '.ts', '.jsx', '.js'];
    this.skipPatterns = ['.test.', '.spec.', '__tests__'];
  }

  /**
   * Scan workspace for components
   * @param {string} workspacePath - Path to workspace
   * @returns {Promise<Array>} Array of discovered components
   */
  async scanComponents(workspacePath) {
    console.log(`🔍 [ComponentScanner] Scanning components in: ${workspacePath}`);

    if (!await fs.pathExists(workspacePath)) {
      throw new Error(`Workspace not found: ${workspacePath}`);
    }

    const components = [];

    for (const { dir, type } of this.componentDirs) {
      const dirPath = path.join(workspacePath, dir);
      if (await fs.pathExists(dirPath)) {
        await this.scanDirectory(dirPath, dir, type, components);
      }
    }

    console.log(`📊 [ComponentScanner] Found ${components.length} components`);
    return this.processComponents(components);
  }

  /**
   * Recursively scan directory for components
   * @param {string} dirPath - Directory path
   * @param {string} relativePath - Relative path from workspace
   * @param {string} type - Component type
   * @param {Array} components - Array to collect components
   * @private
   */
  async scanDirectory(dirPath, relativePath, type, components) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDirPath = path.join(dirPath, entry.name);
        const subRelativePath = path.join(relativePath, entry.name);
        await this.scanDirectory(subDirPath, subRelativePath, type, components);
      } else if (this.isComponentFile(entry.name)) {
        const component = await this.analyzeComponentFile(
          path.join(dirPath, entry.name),
          path.join(relativePath, entry.name),
          type
        );
        if (component) {
          components.push(component);
        }
      }
    }
  }

  /**
   * Check if file is a component file
   * @param {string} fileName - File name
   * @returns {boolean} True if it's a component file
   * @private
   */
  isComponentFile(fileName) {
    // Check extension
    if (!this.supportedExtensions.some(ext => fileName.endsWith(ext))) {
      return false;
    }

    // Skip test files
    if (this.skipPatterns.some(pattern => fileName.includes(pattern))) {
      return false;
    }

    return true;
  }

  /**
   * Analyze a component file to extract metadata
   * @param {string} filePath - Full file path
   * @param {string} relativePath - Relative path from workspace
   * @param {string} type - Component type
   * @returns {Promise<Object|null>} Component metadata or null
   * @private
   */
  async analyzeComponentFile(filePath, relativePath, type) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const fileName = path.basename(relativePath);
      const componentName = fileName.replace(/\.(tsx?|jsx?)$/, '');
      
      const metadata = {
        id: `${type}-${componentName.toLowerCase().replace(/\s+/g, '-')}`,
        name: componentName,
        path: relativePath,
        category: type,
        type: 'component',
        filePath,
        ...this.extractComponentMetadata(content, componentName)
      };

      return metadata;
    } catch (error) {
      console.warn(`⚠️ [ComponentScanner] Error analyzing ${relativePath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract component metadata from file content
   * @param {string} content - File content
   * @param {string} componentName - Component name
   * @returns {Object} Extracted metadata
   * @private
   */
  extractComponentMetadata(content, componentName) {
    const metadata = {
      exports: [],
      imports: [],
      props: [],
      description: null,
      tags: [],
      hasTests: false
    };

    // Extract exports
    const exportMatches = content.match(/export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/g);
    if (exportMatches) {
      metadata.exports = exportMatches.map(match => {
        const nameMatch = match.match(/(\w+)$/);
        return nameMatch ? nameMatch[1] : null;
      }).filter(Boolean);
    }

    // Check for default export
    const defaultExportMatch = content.match(/export\s+default\s+(\w+)/);
    if (defaultExportMatch) {
      metadata.defaultExport = defaultExportMatch[1];
    }

    // Extract imports
    const importMatches = content.match(/import\s+.*?from\s+['"`](.*?)['"`]/g);
    if (importMatches) {
      metadata.imports = importMatches.map(match => {
        const pathMatch = match.match(/from\s+['"`](.*?)['"`]/);
        return pathMatch ? pathMatch[1] : null;
      }).filter(Boolean);
    }

    // Extract JSDoc description
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.*?)\s*\n\s*\*\//s);
    if (jsdocMatch) {
      metadata.description = jsdocMatch[1].trim();
    }

    // Extract props from TypeScript interface or PropTypes
    const propsInterface = this.extractPropsInterface(content);
    if (propsInterface.length > 0) {
      metadata.props = propsInterface;
    }

    // Check for React component patterns
    metadata.isReactComponent = this.isReactComponent(content);
    metadata.isHookComponent = this.isHookComponent(content);
    metadata.isClassComponent = this.isClassComponent(content);

    // Extract tags from comments
    const tagMatches = content.match(/@(\w+)/g);
    if (tagMatches) {
      metadata.tags = [...new Set(tagMatches.map(tag => tag.substring(1)))];
    }

    // Check if has associated test file
    metadata.hasTests = this.hasAssociatedTests(content, componentName);

    return metadata;
  }

  /**
   * Extract props interface from TypeScript content
   * @param {string} content - File content
   * @returns {Array} Array of prop definitions
   * @private
   */
  extractPropsInterface(content) {
    const props = [];
    
    // Look for Props interface
    const interfaceMatch = content.match(/interface\s+\w*Props\s*\{([^}]+)\}/s);
    if (interfaceMatch) {
      const propsContent = interfaceMatch[1];
      const propMatches = propsContent.match(/(\w+)(\?)?\s*:\s*([^;,\n]+)/g);
      
      if (propMatches) {
        props.push(...propMatches.map(prop => {
          const [, name, optional, type] = prop.match(/(\w+)(\?)?\s*:\s*([^;,\n]+)/);
          return {
            name,
            type: type.trim(),
            optional: !!optional,
            required: !optional
          };
        }));
      }
    }

    return props;
  }

  /**
   * Check if content represents a React component
   * @param {string} content - File content
   * @returns {boolean} True if it's a React component
   * @private
   */
  isReactComponent(content) {
    return content.includes('import React') || 
           content.includes("import { ") && content.includes("} from 'react'") ||
           content.includes('React.FC') ||
           content.includes('JSX.Element');
  }

  /**
   * Check if content uses React hooks
   * @param {string} content - File content
   * @returns {boolean} True if it uses hooks
   * @private
   */
  isHookComponent(content) {
    const hookPattern = /use[A-Z]\w*\(/;
    return hookPattern.test(content);
  }

  /**
   * Check if content is a class component
   * @param {string} content - File content
   * @returns {boolean} True if it's a class component
   * @private
   */
  isClassComponent(content) {
    return content.includes('extends React.Component') ||
           content.includes('extends Component');
  }

  /**
   * Check if component has associated test files
   * @param {string} content - File content
   * @param {string} componentName - Component name
   * @returns {boolean} True if has tests
   * @private
   */
  hasAssociatedTests(content, componentName) {
    // Look for test imports or test patterns in the same file
    return content.includes('describe(') ||
           content.includes('it(') ||
           content.includes('test(') ||
           content.includes('@testing-library');
  }

  /**
   * Process and enrich discovered components
   * @param {Array} components - Raw components
   * @returns {Array} Processed components
   * @private
   */
  processComponents(components) {
    return components
      .filter(Boolean)
      .map(component => ({
        ...component,
        // Add computed properties
        displayName: this.getDisplayName(component),
        searchableContent: this.getSearchableContent(component),
        lastModified: new Date().toISOString()
      }))
      .sort((a, b) => {
        // Sort by category, then by name
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Get display name for component
   * @param {Object} component - Component object
   * @returns {string} Display name
   * @private
   */
  getDisplayName(component) {
    // Convert PascalCase to readable format
    return component.name.replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Get searchable content for component
   * @param {Object} component - Component object
   * @returns {string} Searchable content
   * @private
   */
  getSearchableContent(component) {
    const parts = [
      component.name,
      component.displayName,
      component.description,
      component.category,
      component.tags.join(' '),
      component.props.map(p => p.name).join(' ')
    ].filter(Boolean);

    return parts.join(' ').toLowerCase();
  }

  /**
   * Get service statistics
   * @returns {Object} Service stats
   */
  getStats() {
    return {
      componentDirs: this.componentDirs,
      supportedExtensions: this.supportedExtensions,
      skipPatterns: this.skipPatterns
    };
  }
}

module.exports = ComponentScannerService;
