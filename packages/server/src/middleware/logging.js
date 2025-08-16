// Logging middleware to attach logging functions to request object

const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const emoji = {
    'info': '📋',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️'
  }[level] || '📋';
  
  const logData = {
    timestamp,
    level,
    message,
    ...data
  };
  
  // Format for console output
  const dataFields = Object.keys(data).length;
  const summary = dataFields > 0 ? `\n  Summary: ${dataFields} fields - ${Object.keys(data).slice(0, 3).join(', ')}${dataFields > 3 ? '...' : ''}` : '';
  
  console.log(`${emoji} [${timestamp}] ${message}${summary}`);
  
  return logData;
};

const updateConnectionStats = (success, duration) => {
  // This could be enhanced to track actual connection statistics
  const status = success ? '✅' : '❌';
  console.log(`⚡ [${new Date().toISOString()}] Request completed`);
  console.log(`  ${status} - ${duration}ms ${success ? '✅' : '❌'}`);
};

const loggingMiddleware = (req, res, next) => {
  // Attach logging functions to request object
  req.log = log;
  req.updateConnectionStats = updateConnectionStats;
  
  // Log incoming request
  const requestId = Date.now().toString();
  req.requestId = requestId;
  
  log('info', 'Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 50) + '...',
    timestamp: new Date().toISOString()
  });
  
  next();
};

module.exports = {
  loggingMiddleware,
  log,
  updateConnectionStats
};
