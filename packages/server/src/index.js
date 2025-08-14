const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { query } = require('@anthropic-ai/claude-code');
const fetch = require('node-fetch');
const { createClient } = require('@wix/sdk');
const { currentCart } = require('@wix/ecom');

const app = express();
const port = process.env.PORT || 3001;

// Enhanced logging function with verbosity control
const VERBOSE_LOGGING = process.env.VERBOSE_LOGGING === 'true' || false;

// Connection tracking
const connectionStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  responseTimes: [],
  activeConnections: 0,
  startTime: Date.now()
};

function updateConnectionStats(success, responseTime) {
  connectionStats.totalRequests++;
  if (success) {
    connectionStats.successfulRequests++;
  } else {
    connectionStats.failedRequests++;
  }
  
  connectionStats.responseTimes.push(responseTime);
  if (connectionStats.responseTimes.length > 100) {
    connectionStats.responseTimes = connectionStats.responseTimes.slice(-100);
  }
  
  connectionStats.averageResponseTime = 
    connectionStats.responseTimes.reduce((a, b) => a + b, 0) / connectionStats.responseTimes.length;
}

function getConnectionHealth() {
  if (connectionStats.totalRequests === 0) return 'healthy';
  
  const successRate = connectionStats.successfulRequests / connectionStats.totalRequests;
  const avgResponseTime = connectionStats.averageResponseTime;
  
  if (successRate >= 0.9 && avgResponseTime < 5000) return 'healthy';
  if (successRate >= 0.7 && avgResponseTime < 10000) return 'degraded';
  return 'failed';
}

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const emoji = {
    'info': '📋',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️',
    'debug': '🔍',
    'stream': '📨',
    'connection': '🔗',
    'performance': '⚡'
  }[level] || '📋';
  
  console.log(`${emoji} [${timestamp}] ${message}`);
  
  if (data) {
    if (VERBOSE_LOGGING || level === 'error') {
      // Full detailed logging for verbose mode or errors
      console.log('   Data:', JSON.stringify(data, null, 2));
    } else if (level === 'stream') {
      // For stream messages, show condensed version unless verbose
      const { type, messageIndex, timestamp: msgTime, toolName, contentLength } = data;
      console.log(`   ${type} #${messageIndex} (${msgTime}ms)${toolName ? ` tool:${toolName}` : ''}${contentLength ? ` chars:${contentLength}` : ''}`);
    } else if (level === 'performance') {
      // Performance metrics condensed
      const { duration, success, endpoint, method } = data;
      console.log(`   ${method} ${endpoint} - ${duration}ms ${success ? '✅' : '❌'}`);
    } else {
      // For other levels, show summary
      const keys = Object.keys(data);
      console.log(`   Summary: ${keys.length} fields - ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
    }
  }
}

// Enable CORS for web app
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for large prompts

// Request tracking middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.requestId = requestId;
  req.startTime = startTime;
  
  log('info', `Incoming request`, {
    requestId,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    contentLength: req.get('Content-Length')
  });
  
  connectionStats.activeConnections++;
  
  // Override res.end to track response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    updateConnectionStats(success, duration);
    connectionStats.activeConnections--;
    
    log('performance', 'Request completed', {
      requestId,
      method: req.method,
      endpoint: req.path,
      duration,
      status: res.statusCode,
      success,
      activeConnections: connectionStats.activeConnections
    });
    
    originalEnd.apply(this, args);
  };
  
  next();
});

// Wix API Configuration
const WIX_CONFIG = {
  siteId: process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316',
  clientId: process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694',
  apiBaseUrl: 'https://www.wixapis.com'
};

// Helper function to generate visitor tokens
async function generateVisitorTokens() {
  try {
    log('info', 'Generating visitor tokens internally');
    
    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId
      },
      body: JSON.stringify({
        clientId: WIX_CONFIG.clientId,
        grantType: 'anonymous'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Failed to generate visitor tokens internally', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Failed to generate visitor tokens: ${response.status} ${errorText}`);
    }

    const tokens = await response.json();
    log('success', 'Visitor tokens generated internally');
    return tokens;
  } catch (error) {
    log('error', 'Error generating visitor tokens internally', { error: error.message });
    throw error;
  }
}

// Create Wix SDK client with authentication
const createWixClient = (accessToken) => {
  return createClient({
    modules: {
      currentCart
    },
    auth: {
      accessToken
    },
    host: {
      siteId: WIX_CONFIG.siteId
    }
  });
};

// Wix API Proxy Endpoints

// Generate visitor tokens
app.post('/api/wix/visitor-tokens', async (req, res) => {
  try {
    log('info', 'Generating Wix visitor tokens', {
      siteId: WIX_CONFIG.siteId,
      clientId: WIX_CONFIG.clientId
    });

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId
      },
      body: JSON.stringify({
        clientId: WIX_CONFIG.clientId,
        grantType: 'anonymous'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Failed to generate visitor tokens', {
        status: response.status,
        error: errorText
      });
      return res.status(response.status).json({
        error: 'Failed to generate visitor tokens',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Visitor tokens generated successfully');
    
    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });
  } catch (error) {
    log('error', 'Visitor token generation error', { error: error.message });
    
    // If network is down, provide mock tokens for testing
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      log('warn', 'Network issue detected, providing mock tokens for testing');
      res.json({
        access_token: 'mock_access_token_for_testing',
        refresh_token: 'mock_refresh_token_for_testing',
        expires_in: 3600,
        _mock: true
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});

// Refresh visitor tokens
app.post('/api/wix/refresh-tokens', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    log('info', 'Refreshing Wix visitor tokens');

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refresh_token,
        grantType: 'refresh_token'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Failed to refresh tokens', {
        status: response.status,
        error: errorText
      });
      return res.status(response.status).json({
        error: 'Failed to refresh tokens',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Visitor tokens refreshed successfully');
    
    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });
  } catch (error) {
    log('error', 'Token refresh error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Member login
app.post('/api/wix/member/login', async (req, res) => {
  try {
    const { email, password, visitorToken } = req.body;
    
    if (!email || !password || !visitorToken) {
      return res.status(400).json({ 
        error: 'Email, password, and visitor token are required' 
      });
    }

    log('info', 'Processing member login', { email });

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/_api/iam/authentication/v2/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId,
        'Authorization': `Bearer ${visitorToken}`
      },
      body: JSON.stringify({
        loginId: { email },
        password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Member login failed', {
        status: response.status,
        error: errorText,
        email
      });
      return res.status(response.status).json({
        error: 'Login failed',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Member login successful', { email });
    
    res.json(data);
  } catch (error) {
    log('error', 'Member login error', { error: error.message });
    
    // If network is down, provide mock response for testing
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      log('warn', 'Network issue detected, providing mock login response for testing');
      res.json({
        state: 'SUCCESS',
        identity: {
          id: 'mock_member_id',
          email: { address: email },
          identityProfile: {
            firstName: 'Test',
            lastName: 'User'
          }
        },
        sessionToken: 'mock_session_token',
        _mock: true
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});

// Member registration
app.post('/api/wix/member/register', async (req, res) => {
  try {
    const { email, password, profile, visitorToken } = req.body;
    
    if (!email || !password || !visitorToken) {
      return res.status(400).json({ 
        error: 'Email, password, and visitor token are required' 
      });
    }

    log('info', 'Processing member registration', { email });

    const requestBody = {
      loginId: { email },
      password,
      ...(profile && { profile })
    };

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/_api/iam/authentication/v2/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId,
        'Authorization': `Bearer ${visitorToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Member registration failed', {
        status: response.status,
        error: errorText,
        email
      });
      return res.status(response.status).json({
        error: 'Registration failed',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Member registration successful', { email });
    
    res.json(data);
  } catch (error) {
    log('error', 'Member registration error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Generic Wix API proxy
app.post('/api/wix/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body, visitorToken } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    log('info', 'Proxying Wix API request', { 
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      method 
    });

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      ...headers
    };

    if (visitorToken) {
      requestHeaders['Authorization'] = `Bearer ${visitorToken}`;
    }

    const fetchOptions = {
      method,
      headers: requestHeaders
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      log('error', 'Wix API proxy request failed', {
        status: response.status,
        url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
        error: responseData
      });
      return res.status(response.status).json({
        error: 'API request failed',
        details: responseData
      });
    }

    log('success', 'Wix API proxy request successful', {
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      method
    });
    
    res.json(responseData);
  } catch (error) {
    log('error', 'Wix API proxy error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ===== BOOKING API ENDPOINTS =====

// Query booking services endpoint
app.post('/api/wix/bookings/services/query', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { query = {}, fieldsets = [], visitorToken } = req.body;
    
    log('info', 'Processing booking services query', {
      requestId,
      query,
      fieldsets
    });

    // Generate visitor tokens if not provided
    let tokens = { access_token: visitorToken };
    if (!visitorToken) {
      log('info', 'No visitor token provided, generating new tokens', { requestId });
      tokens = await generateVisitorTokens();
    }

    // Make the booking services query request
    const response = await fetch(`https://www.wixapis.com/bookings/v2/services/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId
      },
      body: JSON.stringify({
        query,
        fieldsets
      })
    });

    const endTime = Date.now();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      log('error', 'Booking services query failed', {
        requestId,
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        duration: endTime - startTime
      });
      return res.status(response.status).json({
        error: `Booking services query failed: ${response.statusText}`,
        details: errorData,
        requestId
      });
    }

    const result = await response.json();
    
    log('success', 'Booking services query successful', {
      requestId,
      servicesCount: result.services?.length || 0,
      duration: endTime - startTime
    });

    res.json({
      success: true,
      data: result,
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const endTime = Date.now();
    log('error', 'Booking services query error', {
      requestId,
      error: error.message,
      stack: error.stack,
      duration: endTime - startTime
    });
    res.status(500).json({
      error: 'Internal server error during booking services query',
      details: error.message,
      requestId
    });
  }
});

// Get booking service availability endpoint
app.post('/api/wix/bookings/availability/query', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { query = {}, visitorToken } = req.body;
    
    log('info', 'Processing booking availability query', {
      requestId,
      query
    });

    // Generate visitor tokens if not provided
    let tokens = { access_token: visitorToken };
    if (!visitorToken) {
      log('info', 'No visitor token provided, generating new tokens', { requestId });
      tokens = await generateVisitorTokens();
    }

    // Make the booking availability query request
    const response = await fetch(`https://www.wixapis.com/bookings/v2/availability/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId
      },
      body: JSON.stringify({
        query
      })
    });

    const endTime = Date.now();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      log('error', 'Booking availability query failed', {
        requestId,
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        duration: endTime - startTime
      });
      return res.status(response.status).json({
        error: `Booking availability query failed: ${response.statusText}`,
        details: errorData,
        requestId
      });
    }

    const result = await response.json();
    
    log('success', 'Booking availability query successful', {
      requestId,
      slotsCount: result.slots?.length || 0,
      duration: endTime - startTime
    });

    res.json({
      success: true,
      data: result,
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const endTime = Date.now();
    log('error', 'Booking availability query error', {
      requestId,
      error: error.message,
      stack: error.stack,
      duration: endTime - startTime
    });
    res.status(500).json({
      error: 'Internal server error during booking availability query',
      details: error.message,
      requestId
    });
  }
});

// Create booking endpoint
app.post('/api/wix/bookings/create', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { booking, visitorToken } = req.body;
    
    log('info', 'Processing booking creation', {
      requestId,
      serviceId: booking?.bookedEntity?.serviceId
    });

    // Generate visitor tokens if not provided
    let tokens = { access_token: visitorToken };
    if (!visitorToken) {
      log('info', 'No visitor token provided, generating new tokens', { requestId });
      tokens = await generateVisitorTokens();
    }

    // Make the create booking request
    const response = await fetch(`https://www.wixapis.com/bookings/v1/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId
      },
      body: JSON.stringify({
        booking
      })
    });

    const endTime = Date.now();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      log('error', 'Booking creation failed', {
        requestId,
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        duration: endTime - startTime
      });
      return res.status(response.status).json({
        error: `Booking creation failed: ${response.statusText}`,
        details: errorData,
        requestId
      });
    }

    const result = await response.json();
    
    log('success', 'Booking creation successful', {
      requestId,
      bookingId: result.booking?.id,
      duration: endTime - startTime
    });

    res.json({
      success: true,
      data: result,
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const endTime = Date.now();
    log('error', 'Booking creation error', {
      requestId,
      error: error.message,
      stack: error.stack,
      duration: endTime - startTime
    });
    res.status(500).json({
      error: 'Internal server error during booking creation',
      details: error.message,
      requestId
    });
  }
});

// ===== PRODUCTS API ENDPOINTS =====

// Query products endpoint
app.post('/api/wix/products/query', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { filters = {}, visitorToken } = req.body;
    
    log('info', 'Products query request', { 
      requestId,
      filters: { ...filters, visitorToken: visitorToken ? '[REDACTED]' : undefined }
    });

    // Generate visitor tokens if not provided (same pattern as booking endpoints)
    let tokens = { access_token: visitorToken };
    if (!visitorToken) {
      log('info', 'No visitor token provided, generating new tokens', { requestId });
      tokens = await generateVisitorTokens();
    }

    // Build request body for Catalog V1 API
    const requestBody = {
      query: {
        paging: {
          limit: filters.limit || 50,
          offset: filters.offset || 0
        }
      },
      includeVariants: true
    };

    // Add filter for visible products
    if (filters.visible !== false) {
      requestBody.query.filter = '{"visible": "true"}';
    }

    // Add sort parameter if provided
    if (filters.sort) {
      try {
        const sortObj = JSON.parse(filters.sort);
        const sortString = `[${JSON.stringify(sortObj)}]`;
        requestBody.query.sort = sortString;
        log('debug', 'Applied sort to products query', { requestId, sort: sortString });
      } catch (err) {
        log('warning', 'Invalid sort format for products query', { requestId, sort: filters.sort });
      }
    }

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`
    };

    const url = `${WIX_CONFIG.apiBaseUrl}/stores-reader/v1/products/query`;
    
    log('debug', 'Making products query request to Wix API', {
      requestId,
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      bodySize: JSON.stringify(requestBody).length
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const responseTime = Date.now() - startTime;
    updateConnectionStats(response.ok, responseTime);

    if (!response.ok) {
      log('error', 'Products query failed', {
        requestId,
        status: response.status,
        error: responseData,
        responseTime
      });
      return res.status(response.status).json({
        error: 'Products query failed',
        details: responseData
      });
    }

    log('success', 'Products query successful', {
      requestId,
      productsCount: responseData.products?.length || 0,
      responseTime
    });

    res.json(responseData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateConnectionStats(false, responseTime);
    
    log('error', 'Products query error', { 
      requestId,
      error: error.message,
      responseTime
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get single product endpoint
app.get('/api/wix/products/:productId', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { productId } = req.params;
    const visitorToken = req.headers.authorization?.replace('Bearer ', '');
    
    log('info', 'Product detail request', { 
      requestId,
      productId,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if not provided (same pattern as booking endpoints)
    let tokens = { access_token: visitorToken };
    if (!visitorToken) {
      log('info', 'No visitor token provided, generating new tokens', { requestId });
      tokens = await generateVisitorTokens();
    }

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`
    };

    const url = `${WIX_CONFIG.apiBaseUrl}/stores-reader/v1/products/${productId}`;
    
    log('debug', 'Making product detail request to Wix API', {
      requestId,
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      productId
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const responseTime = Date.now() - startTime;
    updateConnectionStats(response.ok, responseTime);

    if (!response.ok) {
      log('error', 'Product detail failed', {
        requestId,
        productId,
        status: response.status,
        error: responseData,
        responseTime
      });
      return res.status(response.status).json({
        error: 'Product detail failed',
        details: responseData
      });
    }

    log('success', 'Product detail successful', {
      requestId,
      productId,
      productName: responseData.product?.name || 'Unknown',
      responseTime
    });

    res.json(responseData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateConnectionStats(false, responseTime);
    
    log('error', 'Product detail error', { 
      requestId,
      productId: req.params.productId,
      error: error.message,
      responseTime
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ===== BOOKING API ENDPOINTS =====

// Query services endpoint
app.post('/api/wix/bookings/v2/services/query', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { query = {}, fieldsets = [], visitorToken } = req.body;
    
    log('info', 'Booking services query request', { 
      requestId,
      query,
      fieldsets,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if none provided
    let tokens;
    if (visitorToken) {
      tokens = { access_token: visitorToken };
      log('debug', 'Using provided visitor token for services', { requestId });
    } else {
      log('info', 'No visitor token provided, generating new tokens', { requestId });
      tokens = await generateVisitorTokens();
      if (!tokens) {
        log('error', 'Failed to generate visitor tokens for services', { requestId });
        return res.status(500).json({
          error: 'Authentication failed',
          details: 'Could not generate visitor tokens'
        });
      }
      log('info', 'Visitor tokens generated internally for services', { requestId });
    }

    // Build request body for Bookings V2 API
    const requestBody = {
      query: {
        paging: {
          limit: query.paging?.limit || 50,
          offset: query.paging?.offset || 0
        },
        filter: query.filter || {}
      },
      fieldsets: fieldsets.length > 0 ? fieldsets : ['FULL']
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`
    };

    const url = `${WIX_CONFIG.apiBaseUrl}/bookings/v2/services/query`;
    
    log('debug', 'Making services query request to Wix API', {
      requestId,
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      bodySize: JSON.stringify(requestBody).length
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    const responseTime = Date.now() - startTime;
    updateConnectionStats(response.ok, responseTime);

    if (!response.ok) {
      log('error', 'Services query failed', {
        requestId,
        status: response.status,
        error: responseData,
        responseTime
      });
      return res.status(response.status).json({
        error: 'Services query failed',
        details: responseData
      });
    }

    log('success', 'Services query successful', {
      requestId,
      servicesCount: responseData.services?.length || 0,
      responseTime
    });

    res.json(responseData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateConnectionStats(false, responseTime);
    
    log('error', 'Services query error', { 
      requestId,
      error: error.message,
      responseTime
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get single service endpoint
app.get('/api/wix/bookings/v2/services/:serviceId', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { serviceId } = req.params;
    const visitorToken = req.headers.authorization?.replace('Bearer ', '');
    
    log('info', 'Service detail request', { 
      requestId,
      serviceId,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if none provided
    let tokens;
    if (visitorToken) {
      tokens = { access_token: visitorToken };
      log('debug', 'Using provided visitor token for service detail', { requestId });
    } else {
      log('info', 'No visitor token provided, generating new tokens', { requestId });
      tokens = await generateVisitorTokens();
      if (!tokens) {
        log('error', 'Failed to generate visitor tokens for service detail', { requestId });
        return res.status(500).json({
          error: 'Authentication failed',
          details: 'Could not generate visitor tokens'
        });
      }
      log('info', 'Visitor tokens generated internally for service detail', { requestId });
    }

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`
    };

    const url = `${WIX_CONFIG.apiBaseUrl}/bookings/v2/services/${serviceId}`;
    
    log('debug', 'Making service detail request to Wix API', {
      requestId,
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      serviceId
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders
    });

    const responseData = await response.json();
    const responseTime = Date.now() - startTime;
    updateConnectionStats(response.ok, responseTime);

    if (!response.ok) {
      log('error', 'Service detail failed', {
        requestId,
        serviceId,
        status: response.status,
        error: responseData,
        responseTime
      });
      return res.status(response.status).json({
        error: 'Service detail failed',
        details: responseData
      });
    }

    log('success', 'Service detail successful', {
      requestId,
      serviceId,
      serviceName: responseData.service?.name || 'Unknown',
      responseTime
    });

    res.json(responseData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateConnectionStats(false, responseTime);
    
    log('error', 'Service detail error', { 
      requestId,
      serviceId: req.params.serviceId,
      error: error.message,
      responseTime
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Query categories endpoint
app.post('/api/wix/bookings/v1/categories/query', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { query = {}, visitorToken } = req.body;
    
    log('info', 'Booking categories query request', { 
      requestId,
      query,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if none provided
    let tokens;
    if (visitorToken) {
      tokens = { access_token: visitorToken };
    } else {
      tokens = await generateVisitorTokens();
      if (!tokens) {
        return res.status(500).json({
          error: 'Authentication failed',
          details: 'Could not generate visitor tokens'
        });
      }
    }

    const requestBody = {
      query: {
        paging: {
          limit: query.paging?.limit || 100,
          offset: query.paging?.offset || 0
        }
      }
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`
    };

    const url = `${WIX_CONFIG.apiBaseUrl}/bookings/v1/categories/query`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    const responseTime = Date.now() - startTime;
    updateConnectionStats(response.ok, responseTime);

    if (!response.ok) {
      log('error', 'Categories query failed', {
        requestId,
        status: response.status,
        error: responseData,
        responseTime
      });
      return res.status(response.status).json({
        error: 'Categories query failed',
        details: responseData
      });
    }

    log('success', 'Categories query successful', {
      requestId,
      categoriesCount: responseData.categories?.length || 0,
      responseTime
    });

    res.json(responseData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateConnectionStats(false, responseTime);
    
    log('error', 'Categories query error', { 
      requestId,
      error: error.message,
      responseTime
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Query staff members endpoint
app.post('/api/wix/bookings/v1/staff-members/query', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { query = {}, visitorToken } = req.body;
    
    log('info', 'Booking staff members query request', { 
      requestId,
      query,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if none provided
    let tokens;
    if (visitorToken) {
      tokens = { access_token: visitorToken };
    } else {
      tokens = await generateVisitorTokens();
      if (!tokens) {
        return res.status(500).json({
          error: 'Authentication failed',
          details: 'Could not generate visitor tokens'
        });
      }
    }

    const requestBody = {
      query: {
        paging: {
          limit: query.paging?.limit || 100,
          offset: query.paging?.offset || 0
        },
        filter: query.filter || {}
      }
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`
    };

    const url = `${WIX_CONFIG.apiBaseUrl}/bookings/v1/staff-members/query`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    const responseTime = Date.now() - startTime;
    updateConnectionStats(response.ok, responseTime);

    if (!response.ok) {
      log('error', 'Staff members query failed', {
        requestId,
        status: response.status,
        error: responseData,
        responseTime
      });
      return res.status(response.status).json({
        error: 'Staff members query failed',
        details: responseData
      });
    }

    log('success', 'Staff members query successful', {
      requestId,
      staffMembersCount: responseData.staffMembers?.length || 0,
      responseTime
    });

    res.json(responseData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateConnectionStats(false, responseTime);
    
    log('error', 'Staff members query error', { 
      requestId,
      error: error.message,
      responseTime
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ===== CART API ENDPOINTS =====

// Get current cart endpoint
app.get('/api/wix/cart/current', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const visitorToken = req.headers.authorization?.replace('Bearer ', '');
    
    log('info', 'Get current cart request', { 
      requestId,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if none provided
    let tokens;
    if (visitorToken) {
      tokens = { access_token: visitorToken };
    } else {
      tokens = await generateVisitorTokens();
      if (!tokens) {
        return res.status(500).json({
          error: 'Authentication failed',
          details: 'Could not generate visitor tokens'
        });
      }
    }

    // Create Wix SDK client with authentication
    const wixClient = createWixClient(tokens.access_token);

    log('info', 'Using Wix SDK for get current cart', { 
      requestId,
      hasAccessToken: !!tokens.access_token
    });

    // Use Wix SDK instead of direct REST API
    const response = await wixClient.currentCart.getCurrentCart();

    const responseTime = Date.now() - startTime;
    const cartData = { cart: response.cart };
    log('info', 'Get current cart successful', { 
      requestId, 
      cartId: cartData.cart?.id,
      itemCount: cartData.cart?.lineItems?.length || 0,
      responseTime 
    });

    res.json(cartData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log('error', 'Get current cart error', { 
      requestId, 
      error: error.message,
      responseTime 
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Add to cart endpoint
app.post('/api/wix/cart/add', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { lineItems, visitorToken } = req.body;
    
    log('info', 'Add to cart request', { 
      requestId,
      itemCount: lineItems?.length || 0,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if none provided
    let tokens;
    if (visitorToken) {
      tokens = { access_token: visitorToken };
    } else {
      tokens = await generateVisitorTokens();
      if (!tokens) {
        return res.status(500).json({
          error: 'Authentication failed',
          details: 'Could not generate visitor tokens'
        });
      }
    }

    const requestBody = {
      lineItems: lineItems || []
    };

    // Try different authentication headers to match mobile SDK behavior
    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`,
      'wix-client-id': WIX_CONFIG.clientId
    };

    log('info', 'Making add to cart request with enhanced headers', { 
      requestId,
      itemCount: lineItems?.length || 0,
      hasAccessToken: !!tokens.access_token,
      siteId: WIX_CONFIG.siteId,
      clientId: WIX_CONFIG.clientId
    });

    const response = await fetch(`https://www.wixapis.com/ecom/v1/carts/current/add-to-cart`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Add to cart failed', { 
        requestId, 
        status: response.status, 
        error: errorText,
        responseTime 
      });
      return res.status(response.status).json({
        error: 'Failed to add to cart',
        details: errorText
      });
    }

    const cartData = await response.json();
    log('info', 'Add to cart successful', { 
      requestId, 
      cartId: cartData.cart?.id,
      itemCount: cartData.cart?.lineItems?.length || 0,
      responseTime 
    });

    // Include visitor tokens in response for web client session persistence
    const responseData = {
      ...cartData,
      visitorTokens: tokens
    };

    res.json(responseData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log('error', 'Add to cart error', { 
      requestId, 
      error: error.message,
      responseTime 
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Remove from cart endpoint
app.post('/api/wix/cart/remove', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId;
  
  try {
    const { lineItemIds, visitorToken } = req.body;
    
    log('info', 'Remove from cart request', { 
      requestId,
      lineItemIds,
      hasVisitorToken: !!visitorToken
    });

    // Generate visitor tokens if none provided
    let tokens;
    if (visitorToken) {
      tokens = { access_token: visitorToken };
    } else {
      tokens = await generateVisitorTokens();
      if (!tokens) {
        return res.status(500).json({
          error: 'Authentication failed',
          details: 'Could not generate visitor tokens'
        });
      }
    }

    const requestBody = {
      lineItemIds: Array.isArray(lineItemIds) ? lineItemIds : [lineItemIds]
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      'Authorization': `Bearer ${tokens.access_token}`
    };

    const response = await fetch(`https://www.wixapis.com/ecom/v1/carts/current/remove-line-items`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Remove from cart failed', { 
        requestId, 
        status: response.status, 
        error: errorText,
        responseTime 
      });
      return res.status(response.status).json({
        error: 'Failed to remove from cart',
        details: errorText
      });
    }

    const cartData = await response.json();
    log('info', 'Remove from cart successful', { 
      requestId, 
      cartId: cartData.cart?.id,
      itemCount: cartData.cart?.lineItems?.length || 0,
      responseTime 
    });

    res.json(cartData);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log('error', 'Remove from cart error', { 
      requestId, 
      error: error.message,
      responseTime 
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Test endpoint to verify the system is working
app.get('/api/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Wix API proxy server is working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/wix/visitor-tokens',
      'POST /api/wix/refresh-tokens', 
      'POST /api/wix/member/login',
      'POST /api/wix/member/register',
      'POST /api/wix/proxy',
      'POST /api/wix/bookings/services/query',
      'POST /api/wix/bookings/availability/query',
      'POST /api/wix/bookings/create',
      'POST /api/wix/products/query',
      'GET /api/wix/products/:productId'
    ]
  });
});

// Health check endpoint with enhanced statistics
app.get('/health', (req, res) => {
  const uptime = Date.now() - connectionStats.startTime;
  const health = getConnectionHealth();
  
  const healthData = {
    status: 'OK',
    message: 'Claude Code server is running',
    timestamp: new Date().toISOString(),
    port: port,
    sdk: 'enabled',
    health: {
      status: health,
      uptime: uptime,
      uptimeFormatted: `${Math.floor(uptime / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`
    },
    connections: {
      total: connectionStats.totalRequests,
      successful: connectionStats.successfulRequests,
      failed: connectionStats.failedRequests,
      active: connectionStats.activeConnections,
      successRate: connectionStats.totalRequests > 0 ? 
        Math.round((connectionStats.successfulRequests / connectionStats.totalRequests) * 100) : 100
    },
    performance: {
      averageResponseTime: Math.round(connectionStats.averageResponseTime),
      recentResponseTimes: connectionStats.responseTimes.slice(-5)
    }
  };
  
  log('debug', 'Health check requested', {
    requestId: req.requestId,
    health: health,
    totalRequests: connectionStats.totalRequests,
    activeConnections: connectionStats.activeConnections
  });
  
  res.json(healthData);
});

// Check if Claude Code SDK is available
app.get('/check-claude-code', (req, res) => {
  try {
    // Try to access the query function to verify SDK is available
    if (typeof query === 'function') {
      res.json({ 
        installed: true, 
        method: 'SDK',
        message: 'Claude Code SDK is ready',
        features: ['streaming', 'better-error-handling', 'no-shell-escaping']
      });
    } else {
      res.json({ 
        installed: false, 
        error: 'Claude Code SDK not available',
        installCommand: 'npm install @anthropic-ai/claude-code'
      });
    }
  } catch (error) {
    res.json({ 
      installed: false, 
      error: 'Claude Code SDK error',
      details: error.message
    });
  }
});

// Server statistics endpoint
app.get('/stats', (req, res) => {
  const uptime = Date.now() - connectionStats.startTime;
  const health = getConnectionHealth();
  
  const stats = {
    server: {
      uptime: uptime,
      uptimeFormatted: `${Math.floor(uptime / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`,
      startTime: new Date(connectionStats.startTime).toISOString(),
      health: health,
      verboseLogging: VERBOSE_LOGGING
    },
    connections: {
      total: connectionStats.totalRequests,
      successful: connectionStats.successfulRequests,
      failed: connectionStats.failedRequests,
      active: connectionStats.activeConnections,
      successRate: connectionStats.totalRequests > 0 ? 
        (connectionStats.successfulRequests / connectionStats.totalRequests * 100).toFixed(1) : '100.0'
    },
    performance: {
      averageResponseTime: Math.round(connectionStats.averageResponseTime),
      minResponseTime: connectionStats.responseTimes.length > 0 ? Math.min(...connectionStats.responseTimes) : 0,
      maxResponseTime: connectionStats.responseTimes.length > 0 ? Math.max(...connectionStats.responseTimes) : 0,
      recentResponseTimes: connectionStats.responseTimes.slice(-10),
      responseTimeDistribution: {
        fast: connectionStats.responseTimes.filter(t => t < 1000).length,
        medium: connectionStats.responseTimes.filter(t => t >= 1000 && t < 5000).length,
        slow: connectionStats.responseTimes.filter(t => t >= 5000).length
      }
    },
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  
  log('debug', 'Server statistics requested', {
    requestId: req.requestId,
    health: health,
    memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
  });
  
  res.json(stats);
});

// Execute Claude Code command using SDK with streaming
app.post('/execute-claude-code-stream', async (req, res) => {
  const { 
    prompt, 
    workingDirectory, 
    maxTurns = 20,
    systemPrompt,
    appendSystemPrompt,
    allowedTools,
    disallowedTools,
    mcpConfig,
    permissionPromptTool,
    model,
    permissionMode,
    verbose = false,
    addDir,
    dangerouslySkipPermissions = false,
    anthropicBaseUrl,
    anthropicAuthToken
  } = req.body;

  // Use explicit dangerouslySkipPermissions parameter
  const shouldSkipPermissions = dangerouslySkipPermissions;

  // Log request details
  log('info', 'Claude Code streaming request received', {
    promptLength: prompt ? prompt.length : 0,
    workingDirectory,
    maxTurns,
    model,
    shouldSkipPermissions,
    hasSystemPrompt: !!systemPrompt,
    allowedTools: allowedTools ? (Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',')) : null,
    anthropicBaseUrl: anthropicBaseUrl ? 'custom' : 'default'
  });

  if (!prompt) {
    log('error', 'No prompt provided in request');
    return res.status(400).json({ 
      error: 'Prompt is required',
      example: { prompt: "Your Claude Code prompt here" }
    });
  }

  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write('data: {"type":"connection","status":"connected"}\n\n');

  // Change to working directory if specified
  const originalCwd = process.cwd();
  const targetCwd = workingDirectory || originalCwd;
  
  try {
    process.chdir(targetCwd);
    log('info', `Executing Claude Code SDK (STREAMING)`, {
      workingDirectory: targetCwd,
      promptSnippet: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : '')
    });
    
    const startTime = Date.now();
    const messages = [];
    const abortController = new AbortController();
    
    // Set up timeout
    const timeout = setTimeout(() => {
      abortController.abort();
    }, 600000); // 10 minute timeout for streaming

    try {
      // Set environment variables if provided
      if (anthropicBaseUrl) {
        process.env.ANTHROPIC_BASE_URL = anthropicBaseUrl;
        log('debug', 'Using custom Anthropic base URL', { url: anthropicBaseUrl });
      }
      if (anthropicAuthToken) {
        process.env.ANTHROPIC_AUTH_TOKEN = anthropicAuthToken;
        log('debug', 'Using custom auth token', { tokenLength: anthropicAuthToken.length });
      }
      


      // Build comprehensive options object
      const options = {
        maxTurns: maxTurns
      };

      // Add system prompt options
      if (systemPrompt) {
        options.systemPrompt = systemPrompt;
      }
      if (appendSystemPrompt) {
        options.appendSystemPrompt = appendSystemPrompt;
      }

      // Add tool permissions
      if (allowedTools) {
        options.allowedTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
      }
      if (disallowedTools) {
        options.disallowedTools = Array.isArray(disallowedTools) ? disallowedTools : disallowedTools.split(',').map(t => t.trim());
      }

      // Add MCP configuration
      if (mcpConfig) {
        options.mcpConfig = mcpConfig;
      }
      if (permissionPromptTool) {
        options.permissionPromptTool = permissionPromptTool;
      }

      // Grant specific permissions to working directory instead of bypassing all permissions
      if (shouldSkipPermissions && workingDirectory) {
        // Allow all Write, Edit, MultiEdit, Read, and Bash tools - testing broader permissions
        const workingDirTools = [
          'Write',
          'Edit', 
          'MultiEdit',
          'Read',
          'Bash'  // Enable shell commands like ls, cat, grep, etc.
        ];
        
        if (allowedTools) {
          // Merge with existing allowed tools
          const existingTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
          options.allowedTools = [...existingTools, ...workingDirTools];
        } else {
          options.allowedTools = workingDirTools;
        }
        
        log('debug', 'Granted permissions for working directory', {
          workingDirectory,
          allowedTools: options.allowedTools
        });
      } else if (shouldSkipPermissions) {
        options.dangerouslySkipPermissions = true;
        log('warn', 'DANGER: Skipping all permissions!', {
          method: 'dangerouslySkipPermissions',
          streaming: true
        });
      } else {
        // Add permission mode only if it's a valid value and we're not skipping permissions
        if (permissionMode && permissionMode !== 'default') {
          console.log(`📋 Permission mode: ${permissionMode} (may not be supported by SDK)`);
          // Only add supported permission modes if any
          // options.permissionMode = permissionMode;
        }
      }

      // Add model selection
      if (model) {
        options.model = model;
      }

      // Add verbose logging
      if (verbose) {
        options.verbose = true;
      }

      // Add additional directories
      if (addDir) {
        options.addDir = Array.isArray(addDir) ? addDir : addDir.split(',').map(d => d.trim());
      }
      if (workingDirectory) {
        options.addDir = Array.isArray(workingDirectory) ? workingDirectory : workingDirectory.split(',').map(d => d.trim());
      }

      // Log SDK options before execution
      log('debug', 'SDK options configured', {
        maxTurns: options.maxTurns,
        hasSystemPrompt: !!options.systemPrompt,
        allowedToolsCount: options.allowedTools?.length || 0,
        dangerouslySkipPermissions: options.dangerouslySkipPermissions,
        model: options.model || 'default'
      });

      // Stream Claude Code messages in real-time
      for await (const message of query({
        prompt: prompt,
        abortController: abortController,
        options: options,
      })) {
        messages.push(message);
        
        // Send message immediately via SSE
        res.write(`data: ${JSON.stringify({
          type: 'message',
          message: message,
          timestamp: Date.now() - startTime
        })}\n\n`);
        
        // Enhanced message logging with full content
        const messageData = {
          type: message.type,
          messageIndex: messages.length,
          timestamp: Date.now() - startTime,
          fullMessage: message // Include the complete message for debugging
        };

        if (message.type === 'text') {
          messageData.contentLength = message.content?.length || 0;
          messageData.contentPreview = message.content?.substring(0, 200) + (message.content?.length > 200 ? '...' : '');
          messageData.fullContent = message.content; // Full text content
        } else if (message.type === 'tool_use') {
          messageData.toolName = message.name;
          messageData.inputKeys = message.input ? Object.keys(message.input) : [];
          messageData.toolInput = message.input; // Full tool input
          messageData.toolUseId = message.id;
        } else if (message.type === 'tool_result') {
          messageData.toolUseId = message.tool_use_id;
          messageData.isError = message.is_error;
          messageData.resultContent = message.content; // Full tool result content
          if (message.is_error) {
            messageData.errorDetails = message.error;
          }
        } else {
          // Log any other message types we might not be handling
          messageData.unknownType = true;
          messageData.rawMessage = message;
        }

        log('stream', `Claude message received`, messageData);
        
        // Also log a condensed version for easier reading
        const condensed = {
          type: message.type,
          index: messages.length,
          time: `${Date.now() - startTime}ms`
        };
        if (message.type === 'text') {
          condensed.contentLength = message.content?.length;
        } else if (message.type === 'tool_use') {
          condensed.tool = message.name;
        } else if (message.type === 'tool_result') {
          condensed.success = !message.is_error;
        }
        console.log(`📨 ${JSON.stringify(condensed)}`);
      }

      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      log('success', 'Claude Code SDK streaming completed', {
        duration: `${duration}ms`,
        totalMessages: messages.length,
        messageTypes: messages.reduce((acc, msg) => {
          acc[msg.type] = (acc[msg.type] || 0) + 1;
          return acc;
        }, {}),
        workingDirectory: targetCwd
      });
      
      // Send completion message
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        success: true,
        messages: messages,
        messageCount: messages.length,
        duration: duration,
        method: 'SDK-STREAM',
        workingDirectory: targetCwd,
        maxTurns: maxTurns
      })}\n\n`);

      res.end();

    } catch (error) {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      log('error', 'Claude Code SDK streaming failed', {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorType: error.constructor.name,
        stack: error.stack?.split('\n').slice(0, 5), // First 5 lines of stack
        messagesReceived: messages.length,
        workingDirectory: targetCwd
      });
      
      // Send error message
      res.write(`data: ${JSON.stringify({
        type: 'error',
        success: false,
        error: 'Failed to execute Claude Code SDK',
        details: error.message || 'Unknown error',
        duration: duration,
        method: 'SDK-STREAM'
      })}\n\n`);
      
      res.end();
    }

  } finally {
    // Restore original working directory
    process.chdir(originalCwd);
  }
});

// Execute Claude Code command using SDK (non-streaming, original endpoint)
app.post('/execute-claude-code', async (req, res) => {
  const { 
    prompt, 
    workingDirectory, 
    maxTurns = 20,
    systemPrompt,
    appendSystemPrompt,
    allowedTools,
    disallowedTools,
    mcpConfig,
    permissionPromptTool,
    model,
    permissionMode,
    verbose = false,
    addDir,
    dangerouslySkipPermissions = false,
    anthropicBaseUrl,
    anthropicAuthToken
  } = req.body;

  // Use explicit dangerouslySkipPermissions parameter
  const shouldSkipPermissions = dangerouslySkipPermissions;

  // Log request details
  log('info', 'Claude Code regular request received', {
    promptLength: prompt ? prompt.length : 0,
    workingDirectory,
    maxTurns,
    model,
    shouldSkipPermissions,
    hasSystemPrompt: !!systemPrompt,
    streaming: false
  });

  if (!prompt) {
    log('error', 'No prompt provided in regular request');
    return res.status(400).json({ 
      error: 'Prompt is required',
      example: { prompt: "Your Claude Code prompt here" }
    });
  }

  // Change to working directory if specified
  const originalCwd = process.cwd();
  const targetCwd = workingDirectory || originalCwd;
  
  try {
    process.chdir(targetCwd);
    console.log(`🚀 Executing Claude Code SDK in: ${targetCwd}`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);
    console.log(`🔄 Max turns: ${maxTurns}`);
    
    const startTime = Date.now();
    const messages = [];
    const abortController = new AbortController();
    
    // Set up timeout
    const timeout = setTimeout(() => {
      abortController.abort();
    }, 300000); // 5 minute timeout

    try {
      // Set environment variables if provided
      if (anthropicBaseUrl) {
        process.env.ANTHROPIC_BASE_URL = anthropicBaseUrl;
        console.log(`🔧 Using custom base URL: ${anthropicBaseUrl}`);
      }
      if (anthropicAuthToken) {
        process.env.ANTHROPIC_AUTH_TOKEN = anthropicAuthToken;
        console.log(`🔑 Using custom auth token`);
      }
      


      // Build comprehensive options object
      const options = {
        maxTurns: maxTurns
      };

      // Add system prompt options
      if (systemPrompt) {
        options.systemPrompt = systemPrompt;
      }
      if (appendSystemPrompt) {
        options.appendSystemPrompt = appendSystemPrompt;
      }

      // Add tool permissions
      if (allowedTools) {
        options.allowedTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
      }
      if (disallowedTools) {
        options.disallowedTools = Array.isArray(disallowedTools) ? disallowedTools : disallowedTools.split(',').map(t => t.trim());
      }

      // Add MCP configuration
      if (mcpConfig) {
        options.mcpConfig = mcpConfig;
      }
      if (permissionPromptTool) {
        options.permissionPromptTool = permissionPromptTool;
      }

      // Grant specific permissions to working directory instead of bypassing all permissions
      if (shouldSkipPermissions && workingDirectory) {
        // Allow all Write, Edit, MultiEdit, Read tools - testing broader permissions
        const workingDirTools = [
          'Write',
          'Edit', 
          'MultiEdit',
          'Read'
        ];
        
        if (allowedTools) {
          // Merge with existing allowed tools
          const existingTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
          options.allowedTools = [...existingTools, ...workingDirTools];
        } else {
          options.allowedTools = workingDirTools;
        }
        
        console.log(`🔧 REGULAR: Granted permissions for working directory: ${workingDirectory}`);
        console.log(`📝 Allowed tools:`, options.allowedTools);
      } else if (shouldSkipPermissions) {
        options.dangerouslySkipPermissions = true;
        console.log(`⚠️  DANGER: Skipping all permissions! (REGULAR - Using dangerouslySkipPermissions)`);
        console.log(`🔧 Permission options set:`, {
          dangerouslySkipPermissions: true
        });
      } else {
        // Add permission mode only if it's a valid value and we're not skipping permissions
        if (permissionMode && permissionMode !== 'default') {
          console.log(`📋 Permission mode: ${permissionMode} (may not be supported by SDK)`);
          // Only add supported permission modes if any
          // options.permissionMode = permissionMode;
        }
      }

      // Add model selection
      if (model) {
        options.model = model;
      }

      // Add verbose logging
      if (verbose) {
        options.verbose = true;
      }

      // Add additional directories
      if (addDir) {
        options.addDir = Array.isArray(addDir) ? addDir : addDir.split(',').map(d => d.trim());
      }
      if (workingDirectory) {
        options.addDir = Array.isArray(workingDirectory) ? workingDirectory : workingDirectory.split(',').map(d => d.trim());
      }

      if (verbose) {
        console.log(`🔧 System prompt: ${systemPrompt ? 'Custom' : 'Default'}`);
        console.log(`🛠️ Allowed tools: ${allowedTools || 'Default'}`);
        console.log(`🚫 Disallowed tools: ${disallowedTools || 'None'}`);
        console.log(`📋 Permission mode: ${permissionMode || 'default'}`);
        console.log(`🤖 Model: ${model || 'Default'}`);
        console.log(`⚠️ Skip permissions: ${shouldSkipPermissions}`);
        console.log(`📊 SDK Options:`, JSON.stringify(options, null, 2));
      }

      // Use the SDK to query Claude Code
      for await (const message of query({
        prompt: prompt,
        abortController: abortController,
        options: options,
      })) {
        messages.push(message);
        
        // Log progress
        console.log(`📨 Received message: ${message.type}`);
        if (message.type === 'text') {
          console.log(`📝 Text content: ${message.content?.substring(0, 100)}...`);
        } else if (message.type === 'tool_use') {
          console.log(`🔧 Tool use: ${message.name}`);
        }
      }

      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Claude Code SDK completed successfully in ${duration}ms`);
      console.log(`📊 Total messages: ${messages.length}`);
      
      res.json({
        success: true,
        messages: messages,
        messageCount: messages.length,
        duration: duration,
        method: 'SDK',
        workingDirectory: targetCwd,
        maxTurns: maxTurns
      });

    } catch (error) {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      if (abortController.signal.aborted) {
        console.error(`⏰ Claude Code SDK timeout after ${duration}ms`);
        return res.status(408).json({
          success: false,
          error: 'Claude Code execution timeout',
          duration: duration,
          timeout: 300000
        });
      }
      
      console.error(`❌ Claude Code SDK failed after ${duration}ms:`, error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to execute Claude Code SDK', 
        details: error.message,
        duration: duration,
        method: 'SDK'
      });
    }

  } catch (error) {
    console.error(`❌ Directory or execution error:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to execute Claude Code',
      details: error.message
    });
  } finally {
    // Always restore original working directory
    process.chdir(originalCwd);
  }
});

// Get current working directory
app.get('/working-directory', (req, res) => {
  res.json({
    cwd: process.cwd(),
    resolved: path.resolve(process.cwd())
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /check-claude-code', 
      'POST /execute-claude-code',
      'GET /working-directory'
    ]
  });
});

app.listen(port, () => {
  console.log('🎯 ==========================================');
  console.log(`🚀 Claude Code Server (SDK) running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔧 Using Claude Code SDK instead of CLI`);
  console.log(`✨ Features: System prompts, Tool permissions, MCP support`);
  console.log(`🛠️ Supports: Model selection, Permission modes, Verbose logging`);
  console.log(`📊 Enhanced logging: Messages, timings, errors, tool usage`);
  console.log(`🔍 Verbose logging: ${VERBOSE_LOGGING ? 'ENABLED' : 'DISABLED'} (set VERBOSE_LOGGING=true to enable)`);
  console.log('🎯 ==========================================');
  
  log('success', 'Claude Code Server started', {
    port,
    features: ['SDK', 'streaming', 'enhanced-logging'],
    verboseLogging: VERBOSE_LOGGING,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});
