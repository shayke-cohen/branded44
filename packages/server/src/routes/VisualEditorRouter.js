const express = require('express');
const { getIO } = require('../services/socketService');

// Import modular route controllers
const SessionRoutes = require('./SessionRoutes');
const FileRoutes = require('./FileRoutes');
const BuildRoutes = require('./BuildRoutes');
const ComponentRoutes = require('./ComponentRoutes');
const ProxyRoutes = require('./ProxyRoutes');

/**
 * Main Visual Editor Router
 * Combines all modular route controllers to replace the monolithic visualEditor.js
 * 
 * This provides a clean, modular architecture with:
 * - Separation of concerns
 * - Better testability
 * - Easier maintenance
 * - Clear responsibilities
 */
class VisualEditorRouter {
  constructor() {
    this.router = express.Router();
    this.routeControllers = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Set up global middleware for all visual editor routes
   */
  setupMiddleware() {
    // Middleware to attach Socket.IO to requests
    this.router.use(this.attachIO);
    
    // Request logging middleware
    this.router.use(this.requestLogger);
    
    // Error handling middleware setup (will be applied at the end)
    this.errorHandler = this.createErrorHandler();
  }

  /**
   * Middleware to attach Socket.IO instance to requests
   */
  attachIO(req, res, next) {
    try {
      req.io = getIO();
      next();
    } catch (error) {
      req.io = null;
      next();
    }
  }

  /**
   * Request logging middleware
   */
  requestLogger(req, res, next) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Attach request ID and logging functions
    req.requestId = requestId;
    req.startTime = startTime;
    
    // Add logging helper
    req.log = (level, message, data = {}) => {
      const logEntry = {
        level,
        message,
        requestId,
        method: req.method,
        path: req.path,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        ...data
      };
      console.log(`📝 [${level.toUpperCase()}] ${message}`, logEntry);
    };
    
    // Add connection stats helper (backward compatibility)
    req.updateConnectionStats = (success, duration) => {
      const status = success ? 'success' : 'error';
      req.log('info', `Request completed: ${status}`, { 
        success, 
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    };
    
    console.log(`🔄 [VisualEditor] ${req.method} ${req.path} - Start (${requestId})`);
    
    // Log when response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? 'error' : 'info';
      console.log(`✅ [VisualEditor] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
  }

  /**
   * Set up all route controllers
   */
  setupRoutes() {
    console.log('🔧 [VisualEditorRouter] Setting up modular route controllers...');

    // Initialize route controllers
    const sessionRoutes = new SessionRoutes();
    const fileRoutes = new FileRoutes();
    const buildRoutes = new BuildRoutes();
    const componentRoutes = new ComponentRoutes();
    const proxyRoutes = new ProxyRoutes();

    // Store references for monitoring and stats
    this.routeControllers.set('session', sessionRoutes);
    this.routeControllers.set('file', fileRoutes);
    this.routeControllers.set('build', buildRoutes);
    this.routeControllers.set('component', componentRoutes);
    this.routeControllers.set('proxy', proxyRoutes);

    // Mount route controllers
    this.router.use('/', sessionRoutes.getRouter());
    this.router.use('/', fileRoutes.getRouter());
    this.router.use('/', buildRoutes.getRouter());
    this.router.use('/', componentRoutes.getRouter());
    this.router.use('/', proxyRoutes.getRouter());

    // Health check endpoint
    this.router.get('/health', this.healthCheck.bind(this));
    
    // Statistics endpoint
    this.router.get('/stats', this.getStats.bind(this));
    
    // Test endpoint (for backward compatibility)
    this.router.get('/test', this.testEndpoint.bind(this));

    // Apply error handling middleware
    this.router.use(this.errorHandler);

    console.log('✅ [VisualEditorRouter] All route controllers registered');
  }

  /**
   * Health check endpoint
   */
  healthCheck(req, res) {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        used: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`
      },
      routes: Array.from(this.routeControllers.keys()),
      version: '2.0.0-modular'
    });
  }

  /**
   * Get statistics from all route controllers
   */
  getStats(req, res) {
    const stats = {
      router: {
        version: '2.0.0-modular',
        controllers: Array.from(this.routeControllers.keys()),
        totalControllers: this.routeControllers.size
      }
    };

    // Collect stats from each controller
    for (const [name, controller] of this.routeControllers) {
      try {
        if (typeof controller.getStats === 'function') {
          stats[name] = controller.getStats();
        }
      } catch (error) {
        stats[name] = { error: `Failed to get stats: ${error.message}` };
      }
    }

    res.json(stats);
  }

  /**
   * Test endpoint for verification
   */
  testEndpoint(req, res) {
    res.json({ 
      message: 'Modular Visual Editor routes are working correctly!',
      version: '2.0.0-modular',
      timestamp: new Date().toISOString(),
      controllers: Array.from(this.routeControllers.keys())
    });
  }

  /**
   * Create error handling middleware
   */
  createErrorHandler() {
    return (error, req, res, next) => {
      const requestId = req.requestId || 'unknown';
      const duration = Date.now() - (req.startTime || Date.now());
      
      console.error(`❌ [VisualEditorRouter] Unhandled error in ${req.method} ${req.path}:`, error);
      
      // Log error
      if (req.log) {
        req.log('error', 'Unhandled route error', {
          error: error.message,
          stack: error.stack,
          duration: `${duration}ms`
        });
      }
      
      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId,
        timestamp: new Date().toISOString(),
        ...(isDevelopment && { 
          details: error.message,
          stack: error.stack 
        })
      });
    };
  }

  /**
   * Get the router instance
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get route controller by name
   */
  getController(name) {
    return this.routeControllers.get(name);
  }

  /**
   * Get all controller names
   */
  getControllerNames() {
    return Array.from(this.routeControllers.keys());
  }

  /**
   * Clean up resources
   */
  cleanup() {
    console.log('🧹 [VisualEditorRouter] Cleaning up route controllers...');
    
    for (const [name, controller] of this.routeControllers) {
      try {
        if (typeof controller.cleanup === 'function') {
          controller.cleanup();
        }
      } catch (error) {
        console.error(`❌ [VisualEditorRouter] Error cleaning up ${name} controller:`, error);
      }
    }
    
    this.routeControllers.clear();
    console.log('✅ [VisualEditorRouter] Cleanup completed');
  }
}

// Export a function that creates and returns the router
// This allows for easy integration with the existing app structure
function createVisualEditorRouter() {
  const visualEditorRouter = new VisualEditorRouter();
  
  // Export cleanup function for graceful shutdown
  visualEditorRouter.getRouter().cleanup = () => visualEditorRouter.cleanup();
  
  return visualEditorRouter.getRouter();
}

module.exports = createVisualEditorRouter;
