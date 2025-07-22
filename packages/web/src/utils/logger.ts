export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';
export type LogContext = 'connection' | 'request' | 'stream' | 'error' | 'performance' | 'claude';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  sessionId?: string;
  requestId?: string;
}

interface ConnectionMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastSuccessTime?: string;
  lastErrorTime?: string;
  connectionHealth: 'healthy' | 'degraded' | 'failed';
}

class WebLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;
  private metrics: ConnectionMetrics = {
    requestCount: 0,
    successCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    connectionHealth: 'healthy'
  };
  private responseTimes: number[] = [];
  private maxResponseTimes = 100;

  constructor() {
    this.sessionId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.info('connection', 'Web logger initialized', { sessionId: this.sessionId });
  }

  private log(level: LogLevel, context: LogContext, message: string, data?: any, requestId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
      sessionId: this.sessionId,
      requestId
    };

    this.logs.push(entry);
    
    // Keep logs within limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with emoji and formatting
    const emoji = {
      debug: '🔍',
      info: '📋',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level];

    const contextEmoji = {
      connection: '🔗',
      request: '📤',
      stream: '📨',
      error: '💥',
      performance: '⚡',
      claude: '🤖'
    }[context];

    console.log(`${emoji}${contextEmoji} [${entry.timestamp.split('T')[1].split('.')[0]}] ${message}`);
    
    if (data) {
      if (level === 'error' || data.verbose) {
        console.log('   Data:', JSON.stringify(data, null, 2));
      } else {
        // Condensed data for non-error logs
        const condensed = this.condenseData(data);
        if (condensed) {
          console.log(`   ${condensed}`);
        }
      }
    }
  }

  private condenseData(data: any): string {
    if (!data || typeof data !== 'object') return '';
    
    const parts: string[] = [];
    
    if (data.duration) parts.push(`${data.duration}ms`);
    if (data.status) parts.push(`status:${data.status}`);
    if (data.method) parts.push(`method:${data.method}`);
    if (data.url) parts.push(`url:${data.url.replace('http://localhost:3001', 'server')}`);
    if (data.promptLength) parts.push(`prompt:${data.promptLength}chars`);
    if (data.messageCount) parts.push(`messages:${data.messageCount}`);
    if (data.error) parts.push(`error:${data.error.substring(0, 50)}...`);
    if (data.requestId) parts.push(`req:${data.requestId.split('-').pop()}`);
    
    return parts.join(' | ');
  }

  debug(context: LogContext, message: string, data?: any, requestId?: string) {
    this.log('debug', context, message, data, requestId);
  }

  info(context: LogContext, message: string, data?: any, requestId?: string) {
    this.log('info', context, message, data, requestId);
  }

  warn(context: LogContext, message: string, data?: any, requestId?: string) {
    this.log('warn', context, message, data, requestId);
  }

  error(context: LogContext, message: string, data?: any, requestId?: string) {
    this.log('error', context, message, data, requestId);
    this.updateMetrics('error');
  }

  success(context: LogContext, message: string, data?: any, requestId?: string) {
    this.log('success', context, message, data, requestId);
    this.updateMetrics('success');
  }

  // Performance tracking
  startRequest(requestId: string, url: string, options: any = {}) {
    this.metrics.requestCount++;
    this.info('request', 'Starting request', {
      requestId,
      url,
      method: options.method || 'POST',
      startTime: Date.now()
    }, requestId);
    
    return {
      requestId,
      startTime: Date.now()
    };
  }

  endRequest(requestId: string, success: boolean, duration: number, data?: any) {
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes = this.responseTimes.slice(-this.maxResponseTimes);
    }

    // Update average response time
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    if (success) {
      this.success('request', 'Request completed', {
        requestId,
        duration,
        avgResponseTime: Math.round(this.metrics.averageResponseTime),
        ...data
      }, requestId);
      this.metrics.lastSuccessTime = new Date().toISOString();
    } else {
      this.error('request', 'Request failed', {
        requestId,
        duration,
        avgResponseTime: Math.round(this.metrics.averageResponseTime),
        ...data
      }, requestId);
      this.metrics.lastErrorTime = new Date().toISOString();
    }

    this.updateConnectionHealth();
  }

  private updateMetrics(type: 'success' | 'error') {
    if (type === 'success') {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }
  }

  private updateConnectionHealth() {
    const totalRequests = this.metrics.successCount + this.metrics.errorCount;
    if (totalRequests === 0) {
      this.metrics.connectionHealth = 'healthy';
      return;
    }

    const successRate = this.metrics.successCount / totalRequests;
    const avgResponseTime = this.metrics.averageResponseTime;
    
    if (successRate >= 0.9 && avgResponseTime < 5000) {
      this.metrics.connectionHealth = 'healthy';
    } else if (successRate >= 0.7 && avgResponseTime < 10000) {
      this.metrics.connectionHealth = 'degraded';
    } else {
      this.metrics.connectionHealth = 'failed';
    }

    this.debug('performance', 'Connection health updated', {
      successRate: `${Math.round(successRate * 100)}%`,
      avgResponseTime: `${Math.round(avgResponseTime)}ms`,
      health: this.metrics.connectionHealth,
      requests: totalRequests
    });
  }

  // Stream message tracking
  logStreamMessage(requestId: string, message: any, messageIndex: number) {
    const data: any = {
      requestId,
      messageIndex,
      type: message.type,
      timestamp: message.timestamp
    };

    if (message.type === 'text') {
      data.contentLength = message.content?.length || 0;
    } else if (message.type === 'tool_use') {
      data.toolName = message.name;
    } else if (message.type === 'tool_result') {
      data.isError = message.is_error;
    }

    this.debug('stream', `Message #${messageIndex}: ${message.type}`, data, requestId);
  }

  // Claude-specific logging
  logClaudeStart(requestId: string, promptLength: number, options: any) {
    this.info('claude', 'Claude Code execution started', {
      requestId,
      promptLength,
      maxTurns: options.maxTurns,
      workingDirectory: options.workingDirectory,
      dangerouslySkipPermissions: options.dangerouslySkipPermissions
    }, requestId);
  }

  logClaudeComplete(requestId: string, messageCount: number, duration: number) {
    this.success('claude', 'Claude Code execution completed', {
      requestId,
      messageCount,
      duration,
      messagesPerSecond: Math.round((messageCount / duration) * 1000)
    }, requestId);
  }

  logClaudeError(requestId: string, error: string, details?: any) {
    this.error('claude', 'Claude Code execution failed', {
      requestId,
      error,
      details
    }, requestId);
  }

  // Get current metrics and logs
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  getLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Health check functionality
  async healthCheck(): Promise<{ healthy: boolean; latency: number; timestamp: string }> {
    const startTime = Date.now();
    const requestId = `health-${Date.now()}`;
    
    try {
      this.debug('connection', 'Health check started', { requestId });
      
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const latency = Date.now() - startTime;
      const healthy = response.ok;
      
      if (healthy) {
        this.success('connection', 'Health check passed', { latency, requestId });
      } else {
        this.error('connection', 'Health check failed', { status: response.status, latency, requestId });
      }
      
      return {
        healthy,
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error('connection', 'Health check error', { error: errorMessage, latency, requestId });
      return {
        healthy: false,
        latency,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Clear logs (useful for debugging)
  clearLogs() {
    this.logs = [];
    this.info('connection', 'Logs cleared');
  }
}

// Create singleton instance
export const webLogger = new WebLogger();

// Export convenience functions
export const log = {
  debug: (context: LogContext, message: string, data?: any, requestId?: string) => 
    webLogger.debug(context, message, data, requestId),
  info: (context: LogContext, message: string, data?: any, requestId?: string) => 
    webLogger.info(context, message, data, requestId),
  warn: (context: LogContext, message: string, data?: any, requestId?: string) => 
    webLogger.warn(context, message, data, requestId),
  error: (context: LogContext, message: string, data?: any, requestId?: string) => 
    webLogger.error(context, message, data, requestId),
  success: (context: LogContext, message: string, data?: any, requestId?: string) => 
    webLogger.success(context, message, data, requestId),
}; 