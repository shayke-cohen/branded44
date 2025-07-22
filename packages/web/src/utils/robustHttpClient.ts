import { webLogger } from './logger';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: any, attempt: number) => boolean;
}

interface StreamingConfig extends RequestConfig {
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onComplete?: (messages: any[]) => void;
  onConnection?: () => void;
}

export class RobustHttpClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(baseUrl = 'http://localhost:3001', defaultTimeout = 300000, defaultRetries = 3) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
    this.defaultRetries = defaultRetries;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, and server errors (5xx) are retryable
    if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
    if (error.name === 'AbortError') return true;
    if (error.status >= 500) return true;
    if (error.code === 'NETWORK_ERROR') return true;
    return false;
  }

  // Sleep utility for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Standard HTTP request with retry logic
  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const requestId = this.generateRequestId();
    const url = `${this.baseUrl}${endpoint}`;
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = 1000,
      retryCondition = this.isRetryableError
    } = config;

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...(body && { body: JSON.stringify(body) })
    };

    const requestStart = webLogger.startRequest(requestId, url, requestOptions);
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        webLogger.debug('request', `Attempt ${attempt + 1}/${retries + 1}`, {
          requestId,
          url,
          method,
          timeout,
          attempt: attempt + 1
        }, requestId);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - requestStart.startTime;

                 if (!response.ok) {
           const errorData: any = {
             status: response.status,
             statusText: response.statusText,
             url,
             method,
             attempt: attempt + 1
           };

           // Try to get error details from response
           try {
             const errorBody = await response.json();
             errorData.details = errorBody;
           } catch {
             errorData.details = await response.text();
           }

           const httpError = new Error(`HTTP ${response.status}: ${response.statusText}`);
           (httpError as any).status = response.status;
           (httpError as any).response = response;
           (httpError as any).details = errorData.details;

          // Check if we should retry
          if (attempt < retries && retryCondition(httpError, attempt)) {
            webLogger.warn('request', `HTTP error, retrying in ${retryDelay}ms`, errorData, requestId);
            await this.sleep(retryDelay * (attempt + 1)); // Exponential backoff
            continue;
          }

          // Final failure
          webLogger.endRequest(requestId, false, responseTime, errorData);
          throw httpError;
        }

        // Success
        const result = await response.json();
        webLogger.endRequest(requestId, true, responseTime, {
          status: response.status,
          responseSize: JSON.stringify(result).length
        });

        return result;

      } catch (error) {
        lastError = error;
        const responseTime = Date.now() - requestStart.startTime;
        const errorData = {
          error: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown',
          url,
          method,
          attempt: attempt + 1,
          timeout
        };

        // Check if we should retry
        if (attempt < retries && retryCondition(error, attempt)) {
          webLogger.warn('request', `Request failed, retrying in ${retryDelay}ms`, errorData, requestId);
          await this.sleep(retryDelay * (attempt + 1));
          continue;
        }

        // Final failure
        webLogger.endRequest(requestId, false, responseTime, errorData);
        throw error;
      }
    }

    throw lastError;
  }

  // Streaming request for Server-Sent Events
  async streamRequest(endpoint: string, config: StreamingConfig = {}): Promise<any[]> {
    const requestId = this.generateRequestId();
    const url = `${this.baseUrl}${endpoint}`;
    const {
      method = 'POST',
      headers = {},
      body,
      timeout = 600000, // 10 minutes default for streaming
      onMessage,
      onError,
      onComplete,
      onConnection
    } = config;

    webLogger.info('request', 'Starting streaming request', {
      requestId,
      url,
      method,
      timeout,
      bodySize: body ? JSON.stringify(body).length : 0
    }, requestId);

    const requestStart = webLogger.startRequest(requestId, url, { method, streaming: true });
    const allMessages: any[] = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        webLogger.warn('request', 'Streaming request timeout, aborting', { requestId, timeout }, requestId);
        controller.abort();
      }, timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const errorText = await response.text();
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).details = errorText;
        
        webLogger.endRequest(requestId, false, Date.now() - requestStart.startTime, {
          status: response.status,
          error: errorText
        });
        throw error;
      }

      webLogger.success('connection', 'Streaming connection established', { requestId, status: response.status }, requestId);
      onConnection?.();

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      let messageCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line.length > 6) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                messageCount++;
                
                if (data.type === 'connection') {
                  webLogger.debug('stream', 'Connection message received', { requestId, data }, requestId);
                } else if (data.type === 'message') {
                  allMessages.push(data.message);
                  webLogger.logStreamMessage(requestId, data.message, allMessages.length);
                  onMessage?.(data);
                } else if (data.type === 'complete') {
                  const finalMessages = data.messages || allMessages;
                  webLogger.success('stream', 'Streaming completed', {
                    requestId,
                    totalMessages: finalMessages.length,
                    duration: data.duration
                  }, requestId);
                  onComplete?.(finalMessages);
                  clearTimeout(timeoutId);
                  webLogger.endRequest(requestId, true, Date.now() - requestStart.startTime, {
                    messageCount: finalMessages.length,
                    streamDuration: data.duration
                  });
                  return finalMessages;
                } else if (data.type === 'error') {
                  webLogger.error('stream', 'Streaming error received', {
                    requestId,
                    error: data.error,
                    details: data.details
                  }, requestId);
                  const streamError = new Error(data.error || 'Streaming error');
                  (streamError as any).details = data.details;
                  onError?.(streamError);
                  throw streamError;
                }
              }
            } catch (parseError) {
              webLogger.warn('stream', 'Failed to parse SSE data', {
                requestId,
                line,
                error: parseError instanceof Error ? parseError.message : String(parseError)
              }, requestId);
            }
          }
        }
      }

      clearTimeout(timeoutId);
      webLogger.success('stream', 'Stream ended normally', {
        requestId,
        totalMessages: allMessages.length
      }, requestId);
      
      webLogger.endRequest(requestId, true, Date.now() - requestStart.startTime, {
        messageCount: allMessages.length
      });

      return allMessages;

    } catch (error) {
      const responseTime = Date.now() - requestStart.startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      webLogger.error('stream', 'Streaming request failed', {
        requestId,
        error: errorMessage,
        messagesReceived: allMessages.length
      }, requestId);
      
      webLogger.endRequest(requestId, false, responseTime, {
        error: errorMessage,
        messageCount: allMessages.length
      });
      
      onError?.(error);
      throw error;
    }
  }

  // Health check with enhanced monitoring
  async healthCheck(): Promise<{ healthy: boolean; latency: number; details?: any }> {
    try {
      const result = await this.request('/health', {
        timeout: 5000,
        retries: 1
      });
      
      return {
        healthy: true,
        latency: 0, // Will be set by logger
        details: result
      };
    } catch (error) {
      return {
        healthy: false,
        latency: 0,
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Check Claude Code SDK availability
  async checkClaudeCode(): Promise<{ available: boolean; details?: any }> {
    try {
      const result = await this.request('/check-claude-code', {
        timeout: 5000,
        retries: 1
      });
      
      return {
        available: result.installed === true,
        details: result
      };
    } catch (error) {
      return {
        available: false,
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Get connection metrics
  getMetrics() {
    return webLogger.getMetrics();
  }

  // Get recent logs
  getLogs(count = 50) {
    return webLogger.getLogs(count);
  }
}

// Create singleton instance
export const httpClient = new RobustHttpClient(); 