const path = require('path');
const fs = require('fs-extra');

/**
 * Service for validating requests and performing security checks
 * Extracted from the monolithic visualEditor.js route file
 */
class ValidationService {
  constructor() {
    this.allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css'];
    this.blockedPaths = ['node_modules', '.git', '.env', 'package-lock.json'];
  }

  /**
   * Validate session ID format
   * @param {string} sessionId - Session ID to validate
   * @returns {Object} Validation result
   */
  validateSessionId(sessionId) {
    if (!sessionId) {
      return { valid: false, error: 'Session ID is required' };
    }

    if (typeof sessionId !== 'string') {
      return { valid: false, error: 'Session ID must be a string' };
    }

    // Check format: session-{timestamp}-{random}
    const sessionPattern = /^session-\d+-[a-z0-9]+$/;
    if (!sessionPattern.test(sessionId)) {
      return { valid: false, error: 'Invalid session ID format' };
    }

    return { valid: true };
  }

  /**
   * Validate file path for security
   * @param {string} filePath - File path to validate
   * @param {string} workspacePath - Workspace base path
   * @returns {Object} Validation result
   */
  validateFilePath(filePath, workspacePath) {
    if (!filePath) {
      return { valid: false, error: 'File path is required' };
    }

    if (typeof filePath !== 'string') {
      return { valid: false, error: 'File path must be a string' };
    }

    // Resolve full path
    const fullPath = path.resolve(workspacePath, filePath);

    // Security check: ensure the file is within the workspace
    if (!fullPath.startsWith(path.resolve(workspacePath))) {
      return { 
        valid: false, 
        error: 'Access denied: File path outside workspace',
        securityViolation: true
      };
    }

    // Check for blocked paths
    const normalizedPath = path.normalize(filePath);
    for (const blockedPath of this.blockedPaths) {
      if (normalizedPath.includes(blockedPath)) {
        return { 
          valid: false, 
          error: `Access denied: ${blockedPath} is not allowed`,
          securityViolation: true
        };
      }
    }

    // Check file extension if it's a file
    const ext = path.extname(filePath).toLowerCase();
    if (ext && !this.allowedExtensions.includes(ext)) {
      return { 
        valid: false, 
        error: `File type not allowed: ${ext}`,
        allowedExtensions: this.allowedExtensions
      };
    }

    return { valid: true, fullPath };
  }

  /**
   * Validate request body content
   * @param {Object} body - Request body
   * @param {Array} requiredFields - Required field names
   * @returns {Object} Validation result
   */
  validateRequestBody(body, requiredFields = []) {
    if (!body || typeof body !== 'object') {
      return { valid: false, error: 'Request body is required' };
    }

    const missingFields = [];
    for (const field of requiredFields) {
      if (!(field in body) || body[field] === undefined || body[field] === null) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return { 
        valid: false, 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      };
    }

    return { valid: true };
  }

  /**
   * Validate content for file operations
   * @param {*} content - Content to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateFileContent(content, options = {}) {
    const { maxSize = 1024 * 1024 } = options; // 1MB default

    if (content === undefined || content === null) {
      return { valid: false, error: 'File content is required' };
    }

    if (typeof content !== 'string') {
      return { valid: false, error: 'File content must be a string' };
    }

    // Check content size
    const contentSize = Buffer.byteLength(content, 'utf8');
    if (contentSize > maxSize) {
      return { 
        valid: false, 
        error: `File content too large: ${contentSize} bytes (max: ${maxSize})`,
        actualSize: contentSize,
        maxSize
      };
    }

    return { valid: true, size: contentSize };
  }

  /**
   * Validate workspace path exists and is accessible
   * @param {string} workspacePath - Workspace path
   * @returns {Promise<Object>} Validation result
   */
  async validateWorkspace(workspacePath) {
    if (!workspacePath) {
      return { valid: false, error: 'Workspace path is required' };
    }

    try {
      const exists = await fs.pathExists(workspacePath);
      if (!exists) {
        return { valid: false, error: 'Workspace not found' };
      }

      const stats = await fs.stat(workspacePath);
      if (!stats.isDirectory()) {
        return { valid: false, error: 'Workspace path is not a directory' };
      }

      // Check if workspace is readable
      try {
        await fs.access(workspacePath, fs.constants.R_OK);
      } catch (error) {
        return { valid: false, error: 'Workspace is not readable' };
      }

      return { valid: true, stats };
    } catch (error) {
      return { 
        valid: false, 
        error: `Workspace validation failed: ${error.message}`,
        originalError: error
      };
    }
  }

  /**
   * Validate session exists and is accessible
   * @param {Object} sessionManager - Session manager instance
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Validation result
   */
  async validateSession(sessionManager, sessionId) {
    const sessionValidation = this.validateSessionId(sessionId);
    if (!sessionValidation.valid) {
      return sessionValidation;
    }

    if (!sessionManager) {
      return { valid: false, error: 'Session manager not available' };
    }

    // Try to get session from memory
    let session = sessionManager.getSession(sessionId);
    
    // If not in memory, try to load from filesystem
    if (!session) {
      try {
        session = await sessionManager.loadSessionFromFilesystem(sessionId);
      } catch (error) {
        return { 
          valid: false, 
          error: `Failed to load session: ${error.message}`,
          sessionId
        };
      }
    }

    if (!session) {
      return { 
        valid: false, 
        error: `Session not found: ${sessionId}`,
        sessionId
      };
    }

    // Validate workspace exists
    const workspaceValidation = await this.validateWorkspace(session.workspacePath);
    if (!workspaceValidation.valid) {
      return {
        valid: false,
        error: `Session workspace invalid: ${workspaceValidation.error}`,
        sessionId
      };
    }

    return { valid: true, session };
  }

  /**
   * Validate content tracing request
   * @param {Object} contentInfo - Content information
   * @returns {Object} Validation result
   */
  validateContentInfo(contentInfo) {
    if (!contentInfo || typeof contentInfo !== 'object') {
      return { valid: false, error: 'Content info is required' };
    }

    const { text, textContent, className, attributes } = contentInfo;

    // At least one search criteria is required
    if (!text && !textContent && !className && (!attributes || Object.keys(attributes).length === 0)) {
      return { 
        valid: false, 
        error: 'At least one search criteria is required (text, textContent, className, or attributes)'
      };
    }

    // Validate text fields (allow single characters for icons)
    if (text && (typeof text !== 'string' || text.length < 1)) {
      return { valid: false, error: 'Text must be a non-empty string' };
    }

    if (textContent && (typeof textContent !== 'string' || textContent.length < 1)) {
      return { valid: false, error: 'Text content must be a non-empty string' };
    }

    if (className && typeof className !== 'string') {
      return { valid: false, error: 'Class name must be a string' };
    }

    if (attributes && typeof attributes !== 'object') {
      return { valid: false, error: 'Attributes must be an object' };
    }

    return { valid: true };
  }

  /**
   * Create standardized error response
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   * @returns {Object} Error response object
   */
  createErrorResponse(message, options = {}) {
    const {
      statusCode = 400,
      requestId = Date.now().toString(),
      details = null,
      securityViolation = false
    } = options;

    return {
      success: false,
      error: message,
      requestId,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
      ...(securityViolation && { securityViolation: true })
    };
  }

  /**
   * Create standardized success response
   * @param {*} data - Response data
   * @param {Object} options - Additional options
   * @returns {Object} Success response object
   */
  createSuccessResponse(data, options = {}) {
    const {
      message = 'Operation completed successfully',
      requestId = Date.now().toString(),
      meta = {}
    } = options;

    return {
      success: true,
      message,
      ...data,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  /**
   * Sanitize file path for safe usage
   * @param {string} filePath - File path to sanitize
   * @returns {string} Sanitized file path
   */
  sanitizeFilePath(filePath) {
    return path.normalize(filePath)
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\.\./g, '') // Remove parent directory references
      .replace(/[<>:"|?*]/g, '_'); // Replace invalid characters
  }

  /**
   * Get validation service statistics
   * @returns {Object} Service stats
   */
  getStats() {
    return {
      allowedExtensions: this.allowedExtensions,
      blockedPaths: this.blockedPaths,
      version: '1.0.0'
    };
  }
}

module.exports = ValidationService;
