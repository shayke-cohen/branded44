const fs = require('fs-extra');
const path = require('path');

/**
 * Service for tracing content across session files
 * Extracted from the monolithic visualEditor.js route file
 */
class ContentTracingService {
  constructor() {
    this.supportedExtensions = ['.tsx', '.jsx', '.ts', '.js'];
    this.skipPatterns = ['node_modules', '.git', 'dist', 'build', '.DS_Store'];
  }

  /**
   * Trace content in session workspace files
   * @param {string} workspacePath - Path to workspace
   * @param {Object} contentInfo - Content information to search for
   * @returns {Promise<Array>} Array of matches
   */
  async traceContent(workspacePath, contentInfo) {
    console.log(`🔍 [ContentTracing] Searching for content in: ${workspacePath}`);
    console.log(`📝 [ContentTracing] Content info:`, contentInfo);

    if (!await fs.pathExists(workspacePath)) {
      throw new Error(`Workspace not found: ${workspacePath}`);
    }

    const files = await this.getRelevantFiles(workspacePath);
    const matches = [];

    for (const filePath of files) {
      try {
        const fileMatches = await this.searchInFile(filePath, contentInfo, workspacePath);
        if (fileMatches.length > 0) {
          matches.push({
            file: path.relative(workspacePath, filePath),
            fullPath: filePath,
            matches: fileMatches
          });
        }
      } catch (error) {
        console.warn(`⚠️ [ContentTracing] Error reading ${filePath}:`, error.message);
      }
    }

    // Sort matches by relevance
    matches.sort((a, b) => this.calculateRelevanceScore(b) - this.calculateRelevanceScore(a));

    console.log(`📍 [ContentTracing] Found ${matches.length} matching files`);
    return matches;
  }

  /**
   * Get all relevant files for searching
   * @param {string} workspacePath - Workspace path
   * @returns {Promise<Array>} Array of file paths
   */
  async getRelevantFiles(workspacePath) {
    const files = [];
    await this.scanDirectory(workspacePath, files);
    return files;
  }

  /**
   * Recursively scan directory for relevant files
   * @param {string} dirPath - Directory path
   * @param {Array} files - Array to collect files
   * @private
   */
  async scanDirectory(dirPath, files) {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        // Skip ignored directories
        if (!this.skipPatterns.includes(item) && !item.startsWith('.')) {
          await this.scanDirectory(itemPath, files);
        }
      } else if (stats.isFile()) {
        // Include supported file types
        const ext = path.extname(item).toLowerCase();
        if (this.supportedExtensions.includes(ext)) {
          files.push(itemPath);
        }
      }
    }
  }

  /**
   * Search for content in a specific file
   * @param {string} filePath - File path
   * @param {Object} contentInfo - Content to search for
   * @param {string} workspacePath - Workspace path for relative paths
   * @returns {Promise<Array>} Array of matches in the file
   * @private
   */
  async searchInFile(filePath, contentInfo, workspacePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(workspacePath, filePath);
    const fileMatches = [];
    const { text, textContent, className, attributes = {} } = contentInfo;

    // Search for text content (highest priority)
    if (text && text.length > 2) {
      const textMatches = this.findTextInFile(content, text, relativePath);
      fileMatches.push(...textMatches.map(m => ({ ...m, type: 'text', priority: 1 })));
    }

    // Search for alternative text content
    if (textContent && textContent !== text && textContent.length > 2) {
      const textContentMatches = this.findTextInFile(content, textContent, relativePath);
      fileMatches.push(...textContentMatches.map(m => ({ ...m, type: 'textContent', priority: 1 })));
    }

    // Search for class names
    if (className) {
      const classNames = className.split(' ').filter(cls => cls.length > 3);
      for (const cls of classNames) {
        const classMatches = this.findClassInFile(content, cls, relativePath);
        fileMatches.push(...classMatches.map(m => ({ ...m, type: 'className', priority: 2 })));
      }
    }

    // Search for attributes
    for (const [attr, value] of Object.entries(attributes)) {
      if (value && typeof value === 'string' && value.length > 2) {
        const attrMatches = this.findAttributeInFile(content, attr, value, relativePath);
        fileMatches.push(...attrMatches.map(m => ({ ...m, type: 'attribute', attr, priority: 3 })));
      }
    }

    return fileMatches;
  }

  /**
   * Find text matches in file content
   * @param {string} content - File content
   * @param {string} searchText - Text to search for
   * @param {string} filePath - File path for context
   * @returns {Array} Array of text matches
   * @private
   */
  findTextInFile(content, searchText, filePath) {
    const matches = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const index = line.toLowerCase().indexOf(searchText.toLowerCase());

      if (index !== -1) {
        matches.push({
          line: i + 1,
          column: index + 1,
          content: line.trim(),
          context: this.getLineContext(lines, i, 2),
          confidence: this.calculateTextConfidence(line, searchText)
        });
      }
    }

    return matches;
  }

  /**
   * Find class name matches in file content
   * @param {string} content - File content
   * @param {string} className - Class name to search for
   * @param {string} filePath - File path for context
   * @returns {Array} Array of class matches
   * @private
   */
  findClassInFile(content, className, filePath) {
    const matches = [];
    const lines = content.split('\n');
    
    // Escape special regex characters
    const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const classRegex = new RegExp(`(class|className)=['""][^'"]*${escapedClassName}[^'"]*['"]`, 'gi');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = classRegex.exec(line);

      if (match) {
        matches.push({
          line: i + 1,
          column: match.index + 1,
          content: line.trim(),
          context: this.getLineContext(lines, i, 2),
          confidence: 0.8
        });
      }
    }

    return matches;
  }

  /**
   * Find attribute matches in file content
   * @param {string} content - File content
   * @param {string} attr - Attribute name
   * @param {string} value - Attribute value
   * @param {string} filePath - File path for context
   * @returns {Array} Array of attribute matches
   * @private
   */
  findAttributeInFile(content, attr, value, filePath) {
    const matches = [];
    const lines = content.split('\n');
    
    // Escape special regex characters
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const attrRegex = new RegExp(`${attr}=['""]${escapedValue}['"]`, 'gi');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = attrRegex.exec(line);

      if (match) {
        matches.push({
          line: i + 1,
          column: match.index + 1,
          content: line.trim(),
          context: this.getLineContext(lines, i, 2),
          confidence: 0.9
        });
      }
    }

    return matches;
  }

  /**
   * Calculate text confidence score
   * @param {string} line - Line content
   * @param {string} searchText - Search text
   * @returns {number} Confidence score (0-1)
   * @private
   */
  calculateTextConfidence(line, searchText) {
    const exactMatch = line.includes(searchText);
    const inJSX = line.includes('<') && line.includes('>');
    const inString = /['"`]/.test(line);
    
    let confidence = 0.5;
    if (exactMatch) confidence += 0.3;
    if (inJSX) confidence += 0.2;
    if (inString) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Get line context around a match
   * @param {Array} lines - All lines
   * @param {number} lineIndex - Target line index
   * @param {number} contextSize - Number of context lines
   * @returns {Object} Context object
   * @private
   */
  getLineContext(lines, lineIndex, contextSize) {
    const start = Math.max(0, lineIndex - contextSize);
    const end = Math.min(lines.length, lineIndex + contextSize + 1);
    
    return {
      before: lines.slice(start, lineIndex),
      after: lines.slice(lineIndex + 1, end)
    };
  }

  /**
   * Calculate relevance score for sorting
   * @param {Object} matchResult - Match result object
   * @returns {number} Relevance score
   * @private
   */
  calculateRelevanceScore(matchResult) {
    const textMatches = matchResult.matches.filter(m => m.type === 'text').length;
    const totalMatches = matchResult.matches.length;
    const avgConfidence = matchResult.matches.reduce((sum, m) => sum + (m.confidence || 0.5), 0) / totalMatches;
    
    return (textMatches * 10) + (totalMatches * 2) + (avgConfidence * 5);
  }

  /**
   * Get service statistics
   * @returns {Object} Service stats
   */
  getStats() {
    return {
      supportedExtensions: this.supportedExtensions,
      skipPatterns: this.skipPatterns
    };
  }
}

module.exports = ContentTracingService;
