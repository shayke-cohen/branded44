const express = require('express');
const ValidationService = require('../services/ValidationService');

/**
 * Proxy routes for external API calls
 * Extracted from the monolithic visualEditor.js route file
 */
class ProxyRoutes {
  constructor() {
    this.router = express.Router();
    this.validationService = new ValidationService();
    this.setupRoutes();
  }

  setupRoutes() {
    // Wix API proxy - handles all Wix API calls to avoid CORS issues
    this.router.use('/wix-proxy', this.handleWixProxy.bind(this));
    this.router.options('/wix-proxy/*', this.handleWixProxyOptions.bind(this));
    
    // Also handle direct proxy routes for backward compatibility
    this.router.use('/api/wix-proxy', this.handleWixProxy.bind(this));
    this.router.options('/api/wix-proxy/*', this.handleWixProxyOptions.bind(this));
  }

  /**
   * Handle Wix API proxy requests
   */
  async handleWixProxy(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      // Handle both /api/editor/wix-proxy and /api/wix-proxy paths
      const cleanUrl = req.originalUrl
        .replace('/api/editor/wix-proxy', '')
        .replace('/api/wix-proxy', '');
      const targetUrl = `https://www.wixapis.com${cleanUrl}`;
      
      console.log(`🌐 [ProxyRoutes] ${req.method} ${targetUrl}`);
      
      // Prepare headers for the proxied request
      const headers = {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'User-Agent': 'Visual-Editor-Proxy/1.0',
      };
      
      // Forward specific Wix-related headers if present
      const allowedHeaders = ['authorization', 'wix-site-id', 'wix-client-id'];
      allowedHeaders.forEach(header => {
        if (req.headers[header]) {
          headers[header] = req.headers[header];
        }
      });
      
      // Prepare request options
      const requestOptions = {
        method: req.method,
        headers,
      };
      
      // Add body for POST/PUT/PATCH requests
      if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        requestOptions.body = JSON.stringify(req.body);
      }
      
      // Make the proxied request
      const response = await fetch(targetUrl, requestOptions);
      
      // Get response data
      const responseData = await response.text();
      
      // Set CORS headers for the browser
      this.setCorsHeaders(res);
      
      // Forward response status
      res.status(response.status);
      
      // Forward important response headers
      if (response.headers.get('content-type')) {
        res.header('Content-Type', response.headers.get('content-type'));
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ [ProxyRoutes] ${req.method} ${targetUrl} - ${response.status} (${duration}ms)`);
      
      // Send the response
      res.send(responseData);
      
    } catch (error) {
      console.error(`❌ [ProxyRoutes] Error proxying request:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, {
          requestId,
          details: 'Proxy request failed'
        })
      );
    }
  }

  /**
   * Handle preflight OPTIONS requests for CORS
   */
  handleWixProxyOptions(req, res) {
    console.log(`🌐 [ProxyRoutes] Handling OPTIONS preflight request`);
    
    this.setCorsHeaders(res);
    res.sendStatus(200);
  }

  /**
   * Set CORS headers for cross-origin requests
   * @private
   */
  setCorsHeaders(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, wix-site-id, wix-client-id, x-wix-member-id');
  }

  /**
   * Validate proxy request
   * @private
   */
  validateProxyRequest(req) {
    // Basic validation for proxy requests
    const { method, originalUrl } = req;
    
    if (!originalUrl) {
      return { valid: false, error: 'Invalid proxy URL' };
    }
    
    // Ensure we're only proxying to allowed domains
    const allowedDomains = ['www.wixapis.com'];
    const targetDomain = originalUrl.replace('/api/editor/wix-proxy', '').split('/')[1];
    
    if (targetDomain && !allowedDomains.includes(targetDomain)) {
      return { 
        valid: false, 
        error: 'Proxy target not allowed',
        securityViolation: true
      };
    }
    
    return { valid: true };
  }

  /**
   * Log proxy request for monitoring
   * @private
   */
  logProxyRequest(req, response, duration) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: response.status,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 [ProxyRoutes] Request logged:`, logData);
  }

  /**
   * Get the router instance
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      validationStats: this.validationService.getStats(),
      allowedDomains: ['www.wixapis.com'],
      version: '1.0.0'
    };
  }
}

module.exports = ProxyRoutes;
