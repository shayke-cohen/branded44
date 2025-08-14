        <span className="component-name">
          {component.name || component.type}
        </span>
        
        {component.filePath && (
          <span className="component-path" aria-label={`File: ${component.filePath}`}>
            {component.filePath}
          </span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div role="group" aria-label={`${component.type} children`}>
          {component.children!.map((child, index) => (
            <ComponentTreeNode
              key={child.id}
              component={child}
              level={level + 1}
              posinset={index + 1}
              setsize={component.children!.length}
              selected={child.id === selectedId}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </>
  );
});

const getComponentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'View': '📦',
    'Text': '📝',
    'TouchableOpacity': '👆',
    'Image': '🖼️',
    'ScrollView': '📜',
    'FlatList': '📋',
    'TextInput': '✏️',
    'Switch': '🔄'
  };
  return icons[type] || '📄';
};

interface ComponentNode {
  id: string;
  type: string;
  name?: string;
  filePath?: string;
  children?: ComponentNode[];
  expanded?: boolean;
}
```

## Deployment Pipeline

### 1. **Production Build Process**

```bash
#!/bin/bash
# scripts/build-production.sh

echo "🏗️ Building Visual React Native Editor for Production"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --workspaces

# Run tests
echo "🧪 Running tests..."
npm run test --workspaces

# Build all packages
echo "🔨 Building packages..."

# Build visual editor
cd packages/visual-editor
npm run build
cd ../..

# Build server with editor extensions
cd packages/server
npm run build
cd ../..

# Build web with editor integration
cd packages/web
npm run build
cd ../..

# Mobile doesn't need build for development, but prepare assets
cd packages/mobile
expo export --platform all --output-dir dist
cd ../..

echo "✅ Production build complete!"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf visual-editor-deployment.tar.gz \
  packages/visual-editor/dist \
  packages/server/dist \
  packages/web/dist \
  packages/mobile/dist \
  package.json \
  README.md

echo "🚀 Deployment package ready: visual-editor-deployment.tar.gz"
```

### 2. **Docker Configuration**

```dockerfile
# Dockerfile.production
FROM node:18-alpine as builder

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/web/package*.json ./packages/web/
COPY packages/visual-editor/package*.json ./packages/visual-editor/

# Install dependencies
RUN npm ci --workspaces --only=production

# Copy source code
COPY . .

# Build all packages
RUN npm run build --workspaces

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Copy built applications
COPY --from=builder /app/packages/server/dist ./server
COPY --from=builder /app/packages/web/dist ./web
COPY --from=builder /app/packages/visual-editor/dist ./visual-editor
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S visual-editor -u 1001

# Create directories for src2 management
RUN mkdir -p /app/workspace/mobile/src2 && \
    chown -R visual-editor:nodejs /app/workspace

USER visual-editor

EXPOSE 3001

CMD ["node", "server/index.js"]
```

### 3. **Environment Configuration**

```yaml
# docker-compose.yml
version: '3.8'

services:
  visual-editor:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3001:3001"
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - EXPO_ACCESS_TOKEN=${EXPO_ACCESS_TOKEN}
    volumes:
      - workspace:/app/workspace
      - ./config:/app/config:ro
    networks:
      - visual-editor-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - visual-editor-network
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=visual_editor
      - POSTGRES_USER=visual_editor
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - visual-editor-network
    restart: unless-stopped

volumes:
  workspace:
  redis-data:
  postgres-data:

networks:
  visual-editor-network:
    driver: bridge
```

### 4. **Kubernetes Deployment**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: visual-editor
  labels:
    app: visual-editor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: visual-editor
  template:
    metadata:
      labels:
        app: visual-editor
    spec:
      containers:
      - name: visual-editor
        image: your-registry/visual-editor:latest
        ports:
        - containerPort: 3001
        - containerPort: 3002
        env:
        - name: NODE_ENV
          value: "production"
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: visual-editor-secrets
              key: openai-api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: visual-editor-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: workspace
          mountPath: /app/workspace
      volumes:
      - name: workspace
        persistentVolumeClaim:
          claimName: visual-editor-workspace

---
apiVersion: v1
kind: Service
metadata:
  name: visual-editor-service
spec:
  selector:
    app: visual-editor
  ports:
  - name: api
    port: 3001
    targetPort: 3001
  - name: editor
    port: 3002
    targetPort: 3002
  type: LoadBalancer

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: visual-editor-workspace
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
```

### 5. **CI/CD Pipeline**

```yaml
# .github/workflows/deploy.yml
name: Deploy Visual Editor

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/visual-editor

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci --workspaces
    
    - name: Run tests
      run: npm run test --workspaces
    
    - name: Run linting
      run: npm run lint --workspaces
    
    - name: Type checking
      run: npm run type-check --workspaces

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci --workspaces
    
    - name: Build packages
      run: npm run build --workspaces
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-artifacts
        path: |
          packages/*/dist
          packages/*/build

  docker:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.production
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: [test, build, docker]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Deploy to Kubernetes
      run: |
        export KUBECONFIG=kubeconfig
        sed -i "s|image:.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}|" k8s/deployment.yaml
        kubectl apply -f k8s/
        kubectl rollout status deployment/visual-editor --timeout=300s
    
    - name: Verify deployment
      run: |
        export KUBECONFIG=kubeconfig
        kubectl get pods -l app=visual-editor
        kubectl get services
```

### 6. **Health Checks and Monitoring**

```javascript
// packages/server/src/health.js
const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {}
  };

  try {
    // Check file system access
    const workspaceDir = path.resolve(__dirname, '../../../workspace');
    await fs.access(workspaceDir);
    health.checks.filesystem = 'healthy';
  } catch (error) {
    health.checks.filesystem = 'unhealthy';
    health.status = 'degraded';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  health.checks.memory = {
    status: memUsageMB < 512 ? 'healthy' : 'warning',
    usage: `${memUsageMB}MB`,
    heap: memUsage
  };

  // Check if any critical services are down
  if (health.checks.filesystem === 'unhealthy') {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
  const readiness = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // Check if application is fully initialized
    if (!global.appInitialized) {
      throw new Error('Application not fully initialized');
    }

    // Check database connectivity if applicable
    if (global.database) {
      await global.database.ping();
      readiness.checks.database = 'ready';
    }

    // Check workspace directory
    const workspaceDir = path.resolve(__dirname, '../../../workspace');
    await fs.ensureDir(workspaceDir);
    readiness.checks.workspace = 'ready';

    res.json(readiness);
  } catch (error) {
    readiness.status = 'not ready';
    readiness.error = error.message;
    res.status(503).json(readiness);
  }
});

// Metrics endpoint for monitoring
router.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    }
  };

  // Add application-specific metrics
  if (global.metrics) {
    metrics.application = global.metrics.getSnapshot();
  }

  res.json(metrics);
});

module.exports = router;
```

### 7. **Backup and Recovery**

```bash
#!/bin/bash
# scripts/backup.sh

echo "💾 Starting Visual Editor backup..."

BACKUP_DIR="/backups/visual-editor/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup workspace directory (contains src2 files)
echo "📁 Backing up workspace..."
tar -czf "$BACKUP_DIR/workspace.tar.gz" /app/workspace/

# Backup database if applicable
if [ ! -z "$DATABASE_URL" ]; then
  echo "🗄️ Backing up database..."
  pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database.sql"
fi

# Backup configuration
echo "⚙️ Backing up configuration..."
cp -r /app/config "$BACKUP_DIR/"

# Create backup manifest
cat > "$BACKUP_DIR/manifest.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "version": "$npm_package_version",
  "files": [
    "workspace.tar.gz",
    "database.sql",
    "config/"
  ]
}
EOF

echo "✅ Backup complete: $BACKUP_DIR"

# Clean up old backups (keep last 7 days)
find /backups/visual-editor -type d -mtime +7 -exec rm -rf {} +

echo "🧹 Old backups cleaned up"
```

This completes the comprehensive Visual React Native Editor architecture document! The document now includes:

## Complete Coverage:

1. **System Overview** - Real-time updates and instant synchronization
2. **Monorepo Integration** - Seamless integration with existing projects
3. **Physical src2 Architecture** - File system approach for maximum compatibility
4. **Real-time Update System** - Instant updates across all environments without bundling
5. **Implementation Code** - Complete working examples for all components
6. **Testing Strategy** - Unit, integration, and E2E testing approaches
7. **Error Handling** - Comprehensive error recovery and graceful degradation
8. **Performance Optimization** - Memory management, debouncing, and virtual scrolling
9. **Security** - Code sanitization and file system security
10. **Monitoring** - Analytics and performance monitoring
11. **Accessibility** - Keyboard navigation and screen reader support
12. **Deployment** - Production-ready deployment with Docker, Kubernetes, and CI/CD

The architecture is specifically designed for integration with existing monorepos and provides instant updates across Visual Editor, Web Preview, and Mobile App without requiring manual bundling during development. This creates a seamless development experience while maintaining the flexibility to deploy to production when ready.        if (interactionType) {
          this.startOperation(`interaction-${interactionType}`);
          
          // Measure time until next frame
          requestAnimationFrame(() => {
            this.endOperation(`interaction-${interactionType}`);
          });
        }
      });
    });
  }

  private getInteractionType(element: HTMLElement, eventType: string): string | null {
    const classList = element.classList;
    
    if (classList.contains('component-palette-item')) return 'palette-select';
    if (classList.contains('phone-frame')) return 'component-select';
    if (classList.contains('properties-panel')) return 'property-edit';
    if (element.tagName === 'INPUT') return 'input-edit';
    if (element.tagName === 'BUTTON') return 'button-click';
    
    return null;
  }

  private sendAnalyticsEvent(eventName: string, properties: any) {
    // Send to analytics service (implement based on your analytics provider)
    if (window.analytics) {
      window.analytics.track(eventName, properties);
    }
  }

  cleanup() {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

interface MetricSummary {
  count: number;
  avg: number;
  min: number;
  max: number;
  p95: number;
  latest: number;
}
```

### 2. **User Analytics**

```typescript
// packages/visual-editor/src/utils/Analytics.ts
export class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId = this.generateSessionId();
  private userId = this.getUserId();
  private sessionStartTime = Date.now();

  trackEvent(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties: properties || {},
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: Date.now() - this.sessionStartTime
    };

    this.events.push(event);
    this.sendEvent(event);
    
    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }

  trackComponentAction(action: string, component: ComponentInfo) {
    this.trackEvent('component_action', {
      action,
      componentType: component.type,
      componentId: component.id,
      filePath: component.filePath,
      hasChildren: component.children?.length > 0,
      depth: component.depth || 0
    });
  }

  trackAIUsage(type: 'generate' | 'modify', prompt: string, success: boolean, duration?: number) {
    this.trackEvent('ai_usage', {
      type,
      promptLength: prompt.length,
      promptWords: prompt.split(' ').length,
      success,
      duration,
      timestamp: Date.now()
    });
  }

  trackDeployment(method: string, success: boolean, duration: number, error?: string) {
    this.trackEvent('deployment', {
      method,
      success,
      duration,
      error: error || null,
      timestamp: Date.now()
    });
  }

  trackPerformance(metric: string, value: number, context?: any) {
    this.trackEvent('performance_metric', {
      metric,
      value,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  trackError(error: Error, context?: any) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  trackFeatureUsage(feature: string, details?: any) {
    this.trackEvent('feature_usage', {
      feature,
      details,
      timestamp: Date.now()
    });
  }

  trackUserFlow(step: string, flowName: string, metadata?: any) {
    this.trackEvent('user_flow', {
      step,
      flowName,
      metadata,
      timestamp: Date.now()
    });
  }

  // Track specific visual editor events
  trackComponentDrag(componentType: string, source: string, target: string) {
    this.trackEvent('component_drag', {
      componentType,
      source,
      target,
      timestamp: Date.now()
    });
  }

  trackStyleEdit(componentType: string, property: string, oldValue: any, newValue: any) {
    this.trackEvent('style_edit', {
      componentType,
      property,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
  }

  trackFileOperation(operation: string, filePath: string, duration: number, success: boolean) {
    this.trackEvent('file_operation', {
      operation,
      filePath,
      duration,
      success,
      timestamp: Date.now()
    });
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // Send to analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
      // Store failed events for retry
      this.storeFailedEvent(event);
    }
  }

  private storeFailedEvent(event: AnalyticsEvent) {
    const failedEvents = JSON.parse(
      localStorage.getItem('failed_analytics_events') || '[]'
    );
    failedEvents.push(event);
    
    // Keep only last 100 failed events
    if (failedEvents.length > 100) {
      failedEvents.shift();
    }
    
    localStorage.setItem('failed_analytics_events', JSON.stringify(failedEvents));
  }

  async retryFailedEvents() {
    const failedEvents = JSON.parse(
      localStorage.getItem('failed_analytics_events') || '[]'
    );

    if (failedEvents.length === 0) return;

    console.log(`Retrying ${failedEvents.length} failed analytics events`);

    for (const event of failedEvents) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        console.warn('Retry failed for event:', event.name);
        break; // Stop retrying if still failing
      }
    }

    // Clear successful retries
    localStorage.removeItem('failed_analytics_events');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    let userId = localStorage.getItem('visual-editor-user-id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visual-editor-user-id', userId);
    }
    return userId;
  }

  getSessionSummary() {
    const sessionEvents = this.events.filter(e => e.sessionId === this.sessionId);
    const currentDuration = Date.now() - this.sessionStartTime;
    
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.sessionStartTime,
      duration: currentDuration,
      eventCount: sessionEvents.length,
      actions: this.summarizeActions(sessionEvents),
      features: this.summarizeFeatureUsage(sessionEvents),
      performance: this.summarizePerformance(sessionEvents)
    };
  }

  private summarizeActions(events: AnalyticsEvent[]) {
    const actions = events.filter(e => e.name === 'component_action');
    const summary = new Map<string, number>();
    
    for (const event of actions) {
      const action = event.properties.action;
      summary.set(action, (summary.get(action) || 0) + 1);
    }
    
    return Object.fromEntries(summary);
  }

  private summarizeFeatureUsage(events: AnalyticsEvent[]) {
    const features = events.filter(e => e.name === 'feature_usage');
    const summary = new Map<string, number>();
    
    for (const event of features) {
      const feature = event.properties.feature;
      summary.set(feature, (summary.get(feature) || 0) + 1);
    }
    
    return Object.fromEntries(summary);
  }

  private summarizePerformance(events: AnalyticsEvent[]) {
    const perfEvents = events.filter(e => e.name === 'performance_metric');
    const metrics = new Map<string, number[]>();
    
    for (const event of perfEvents) {
      const metric = event.properties.metric;
      if (!metrics.has(metric)) {
        metrics.set(metric, []);
      }
      metrics.get(metric)!.push(event.properties.value);
    }
    
    const summary: Record<string, any> = {};
    for (const [metric, values] of metrics) {
      summary[metric] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }
    
    return summary;
  }

  // Export analytics data for analysis
  exportAnalyticsData() {
    const data = {
      sessionSummary: this.getSessionSummary(),
      events: this.events,
      exportedAt: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-editor-analytics-${this.sessionId}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId: string;
  sessionDuration: number;
}

interface ComponentInfo {
  type: string;
  id: string;
  filePath: string;
  children?: ComponentInfo[];
  depth?: number;
}

// Global analytics instance
export const analytics = new Analytics();

// Auto-track page views and session events
analytics.trackEvent('session_start', {
  url: window.location.href,
  referrer: document.referrer,
  userAgent: navigator.userAgent,
  timestamp: Date.now()
});

// Track session end
window.addEventListener('beforeunload', () => {
  analytics.trackEvent('session_end', {
    duration: Date.now() - analytics['sessionStartTime'],
    timestamp: Date.now()
  });
});

// Retry failed events on page load
analytics.retryFailedEvents();
```

## Accessibility Features

### 1. **Keyboard Navigation**

```typescript
// packages/visual-editor/src/utils/KeyboardNavigation.ts
export class KeyboardNavigation {
  private selectedElement: HTMLElement | null = null;
  private selectableElements: HTMLElement[] = [];
  private focusHistory: HTMLElement[] = [];
  private shortcuts = new Map<string, () => void>();

  initialize() {
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.updateSelectableElements();
    this.createScreenReaderAnnouncer();
  }

  private setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    
    // Update selectable elements when DOM changes
    const observer = new MutationObserver(() => {
      this.updateSelectableElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-selectable', 'tabindex']
    });
  }

  private setupKeyboardShortcuts() {
    // Navigation shortcuts
    this.shortcuts.set('Tab', () => this.navigateNext(false));
    this.shortcuts.set('Shift+Tab', () => this.navigateNext(true));
    this.shortcuts.set('Enter', () => this.activateSelected());
    this.shortcuts.set('Space', () => this.activateSelected());
    this.shortcuts.set('Escape', () => this.clearSelection());
    
    // Arrow key navigation
    this.shortcuts.set('ArrowUp', () => this.navigateWithArrows('up'));
    this.shortcuts.set('ArrowDown', () => this.navigateWithArrows('down'));
    this.shortcuts.set('ArrowLeft', () => this.navigateWithArrows('left'));
    this.shortcuts.set('ArrowRight', () => this.navigateWithArrows('right'));
    
    // Application shortcuts
    this.shortcuts.set('Ctrl+S', () => this.triggerSave());
    this.shortcuts.set('Ctrl+Z', () => this.triggerUndo());
    this.shortcuts.set('Ctrl+Y', () => this.triggerRedo());
    this.shortcuts.set('Ctrl+D', () => this.triggerDuplicate());
    this.shortcuts.set('Delete', () => this.triggerDelete());
    this.shortcuts.set('Ctrl+A', () => this.triggerSelectAll());
    
    // Help shortcut
    this.shortcuts.set('F1', () => this.showKeyboardHelp());
    this.shortcuts.set('Ctrl+/', () => this.showKeyboardHelp());
  }

  private handleKeyDown(event: KeyboardEvent) {
    const keyCombo = this.getKeyCombo(event);
    const handler = this.shortcuts.get(keyCombo);
    
    if (handler) {
      event.preventDefault();
      handler();
      return;
    }

    // Handle character navigation (jump to elements starting with letter)
    if (event.key.length === 1 && !event.ctrlKey && !event.altKey) {
      this.jumpToElementStartingWith(event.key.toLowerCase());
    }
  }

  private getKeyCombo(event: KeyboardEvent): string {
    const parts = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    parts.push(event.key);
    
    return parts.join('+');
  }

  private navigateNext(reverse: boolean = false) {
    this.updateSelectableElements();
    
    if (this.selectableElements.length === 0) return;

    let currentIndex = this.selectedElement 
      ? this.selectableElements.indexOf(this.selectedElement)
      : -1;

    if (reverse) {
      currentIndex = currentIndex <= 0 
        ? this.selectableElements.length - 1 
        : currentIndex - 1;
    } else {
      currentIndex = currentIndex >= this.selectableElements.length - 1 
        ? 0 
        : currentIndex + 1;
    }

    this.selectElement(this.selectableElements[currentIndex]);
  }

  private navigateWithArrows(direction: 'up' | 'down' | 'left' | 'right') {
    if (!this.selectedElement) {
      this.navigateNext();
      return;
    }

    const currentRect = this.selectedElement.getBoundingClientRect();
    const candidates = this.selectableElements.filter(el => el !== this.selectedElement);
    
    let bestCandidate: HTMLElement | null = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
      const candidateRect = candidate.getBoundingClientRect();
      
      if (!this.isInDirection(currentRect, candidateRect, direction)) {
        continue;
      }

      const distance = this.calculateDistance(currentRect, candidateRect, direction);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      this.selectElement(bestCandidate);
    }
  }

  private isInDirection(
    current: DOMRect, 
    candidate: DOMRect, 
    direction: string
  ): boolean {
    switch (direction) {
      case 'up':
        return candidate.bottom <= current.top;
      case 'down':
        return candidate.top >= current.bottom;
      case 'left':
        return candidate.right <= current.left;
      case 'right':
        return candidate.left >= current.right;
      default:
        return false;
    }
  }

  private calculateDistance(
    current: DOMRect, 
    candidate: DOMRect, 
    direction: string
  ): number {
    const currentCenter = {
      x: current.left + current.width / 2,
      y: current.top + current.height / 2
    };
    
    const candidateCenter = {
      x: candidate.left + candidate.width / 2,
      y: candidate.top + candidate.height / 2
    };

    // Calculate distance based on direction
    switch (direction) {
      case 'up':
      case 'down':
        return Math.abs(candidateCenter.x - currentCenter.x) + 
               Math.abs(candidateCenter.y - currentCenter.y);
      case 'left':
      case 'right':
        return Math.abs(candidateCenter.x - currentCenter.x) + 
               Math.abs(candidateCenter.y - currentCenter.y);
      default:
        return Infinity;
    }
  }

  private jumpToElementStartingWith(char: string) {
    const matches = this.selectableElements.filter(el => {
      const text = this.getElementText(el);
      return text.toLowerCase().startsWith(char);
    });

    if (matches.length > 0) {
      // Find next match after current selection
      const currentIndex = this.selectedElement ? matches.indexOf(this.selectedElement) : -1;
      const nextIndex = (currentIndex + 1) % matches.length;
      this.selectElement(matches[nextIndex]);
    }
  }

  private selectElement(element: HTMLElement) {
    // Add to focus history
    if (this.selectedElement && this.selectedElement !== element) {
      this.focusHistory.push(this.selectedElement);
      
      // Keep history limited
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }

    // Remove previous selection
    this.selectedElement?.classList.remove('keyboard-selected');
    this.selectedElement?.removeAttribute('aria-current');
    
    // Add new selection
    this.selectedElement = element;
    element.classList.add('keyboard-selected');
    element.setAttribute('aria-current', 'true');
    element.focus();
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest',
      inline: 'nearest'
    });
    
    // Announce to screen readers
    this.announceSelection(element);
  }

  private activateSelected() {
    if (!this.selectedElement) return;

    // Trigger click or appropriate action
    if (this.selectedElement.tagName === 'BUTTON' || 
        this.selectedElement.getAttribute('role') === 'button') {
      this.selectedElement.click();
    } else if (this.selectedElement.tagName === 'INPUT') {
      (this.selectedElement as HTMLInputElement).focus();
    } else {
      // For component elements, trigger selection
      const event = new CustomEvent('keyboard-activate', {
        detail: { element: this.selectedElement }
      });
      this.selectedElement.dispatchEvent(event);
    }
  }

  private clearSelection() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('keyboard-selected');
      this.selectedElement.removeAttribute('aria-current');
      this.selectedElement = null;
      this.announceToScreenReader('Selection cleared');
    }
  }

  private updateSelectableElements() {
    this.selectableElements = Array.from(
      document.querySelectorAll('[data-selectable="true"], [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
  }

  private announceSelection(element: HTMLElement) {
    const announcement = this.createAnnouncement(element);
    this.announceToScreenReader(announcement);
  }

  private createAnnouncement(element: HTMLElement): string {
    const componentType = element.dataset.componentType || 'element';
    const componentName = element.dataset.componentName || element.textContent?.trim() || 'unnamed';
    const position = this.getElementPosition(element);
    
    return `Selected ${componentType} ${componentName}. ${position}`;
  }

  private getElementPosition(element: HTMLElement): string {
    const index = this.selectableElements.indexOf(element) + 1;
    const total = this.selectableElements.length;
    return `${index} of ${total}`;
  }

  private getElementText(element: HTMLElement): string {
    return element.textContent?.trim() || 
           element.getAttribute('aria-label') || 
           element.getAttribute('title') || 
           element.dataset.componentName || 
           '';
  }

  private createScreenReaderAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(announcer);
  }

  private announceToScreenReader(message: string) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }

  private showKeyboardHelp() {
    const helpModal = document.createElement('div');
    helpModal.innerHTML = `
      <div class="keyboard-help-overlay" role="dialog" aria-labelledby="keyboard-help-title">
        <div class="keyboard-help-content">
          <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
          
          <section>
            <h3>Navigation</h3>
            <ul>
              <li><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> - Navigate between elements</li>
              <li><kbd>Arrow Keys</kbd> - Navigate in direction</li>
              <li><kbd>Enter</kbd> / <kbd>Space</kbd> - Activate selected element</li>
              <li><kbd>Escape</kbd> - Clear selection</li>
              <li><kbd>Character</kbd> - Jump to element starting with letter</li>
            </ul>
          </section>
          
          <section>
            <h3>Actions</h3>
            <ul>
              <li><kbd>Ctrl+S</kbd> - Save changes</li>
              <li><kbd>Ctrl+Z</kbd> - Undo</li>
              <li><kbd>Ctrl+Y</kbd> - Redo</li>
              <li><kbd>Ctrl+D</kbd> - Duplicate selected component</li>
              <li><kbd>Delete</kbd> - Delete selected component</li>
              <li><kbd>Ctrl+A</kbd> - Select all</li>
            </ul>
          </section>
          
          <section>
            <h3>Help</h3>
            <ul>
              <li><kbd>F1</kbd> / <kbd>Ctrl+/</kbd> - Show this help</li>
            </ul>
          </section>
          
          <button id="close-help" autofocus>Close (Escape)</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // Handle close
    const closeBtn = helpModal.querySelector('#close-help') as HTMLButtonElement;
    const closeHandler = () => {
      helpModal.remove();
      document.removeEventListener('keydown', escapeHandler);
    };
    
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeHandler();
      }
    };
    
    closeBtn.addEventListener('click', closeHandler);
    document.addEventListener('keydown', escapeHandler);
  }

  // Application action handlers
  private triggerSave() {
    const event = new CustomEvent('keyboard-save');
    document.dispatchEvent(event);
    this.announceToScreenReader('Save triggered');
  }

  private triggerUndo() {
    const event = new CustomEvent('keyboard-undo');
    document.dispatchEvent(event);
    this.announceToScreenReader('Undo triggered');
  }

  private triggerRedo() {
    const event = new CustomEvent('keyboard-redo');
    document.dispatchEvent(event);
    this.announceToScreenReader('Redo triggered');
  }

  private triggerDuplicate() {
    if (this.selectedElement) {
      const event = new CustomEvent('keyboard-duplicate', {
        detail: { element: this.selectedElement }
      });
      document.dispatchEvent(event);
      this.announceToScreenReader('Component duplicated');
    }
  }

  private triggerDelete() {
    if (this.selectedElement) {
      const event = new CustomEvent('keyboard-delete', {
        detail: { element: this.selectedElement }
      });
      document.dispatchEvent(event);
      this.announceToScreenReader('Component deleted');
    }
  }

  private triggerSelectAll() {
    const event = new CustomEvent('keyboard-select-all');
    document.dispatchEvent(event);
    this.announceToScreenReader('All components selected');
  }

  cleanup() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focusin', this.handleFocusIn);
    
    const announcer = document.getElementById('sr-announcer');
    announcer?.remove();
  }

  private handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (target && this.selectableElements.includes(target)) {
      this.selectElement(target);
    }
  }
}
```

### 2. **Screen Reader Support**

```typescript
// packages/visual-editor/src/components/AccessibleComponentTree.tsx
import React, { useRef, useEffect } from 'react';

interface AccessibleComponentTreeProps {
  components: ComponentNode[];
  selectedId?: string;
  onSelect: (component: ComponentNode) => void;
  onExpand: (componentId: string) => void;
}

export const AccessibleComponentTree: React.FC<AccessibleComponentTreeProps> = ({
  components,
  selectedId,
  onSelect,
  onExpand
}) => {
  const treeRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected item into view
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedId]);

  return (
    <div 
      ref={treeRef}
      role="tree" 
      aria-label="Component tree structure"
      className="component-tree"
    >
      {components.map((component, index) => (
        <ComponentTreeNode
          key={component.id}
          component={component}
          level={1}
          posinset={index + 1}
          setsize={components.length}
          selected={selectedId === component.id}
          onSelect={onSelect}
          onExpand={onExpand}
          ref={selectedId === component.id ? selectedRef : undefined}
        />
      ))}
    </div>
  );
};

interface ComponentTreeNodeProps {
  component: ComponentNode;
  level: number;
  posinset: number;
  setsize: number;
  selected: boolean;
  onSelect: (component: ComponentNode) => void;
  onExpand: (componentId: string) => void;
}

const ComponentTreeNode = React.forwardRef<HTMLDivElement, ComponentTreeNodeProps>(({
  component,
  level,
  posinset,
  setsize,
  selected,
  onSelect,
  onExpand
}, ref) => {
  const hasChildren = component.children && component.children.length > 0;
  const isExpanded = component.expanded || false;

  const handleClick = () => {
    onSelect(component);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect(component);
        break;
        
      case 'ArrowRight':
        if (hasChildren && !isExpanded) {
          event.preventDefault();
          onExpand(component.id);
        }
        break;
        
      case 'ArrowLeft':
        if (hasChildren && isExpanded) {
          event.preventDefault();
          onExpand(component.id);
        }
        break;
    }
  };

  const getAriaLabel = () => {
    const parts = [
      `${component.type} component`,
      component.name ? `named ${component.name}` : '',
      hasChildren ? `${component.children!.length} children` : 'no children',
      isExpanded ? 'expanded' : hasChildren ? 'collapsed' : ''
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <>
      <div
        ref={ref}
        role="treeitem"
        tabIndex={selected ? 0 : -1}
        aria-level={level}
        aria-posinset={posinset}
        aria-setsize={setsize}
        aria-selected={selected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={getAriaLabel()}
        data-selectable="true"
        data-component-type={component.type}
        data-component-name={component.name || component.type}
        className={`tree-node ${selected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {hasChildren && (
          <button
            className="expand-button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              onExpand(component.id);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        <span className="component-icon" aria-hidden="true">
          {getComponentIcon(component.type)}
        </span>
        
        <span className="  }

  immediate<T extends (...args: any[]) => any>(
    key: string,
    func: T
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
        this.timers.delete(key);
      }
      
      func(...args);
    };
  }

  cleanup() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

// Usage in components
export class OptimizedFileSyncManager {
  private debouncer = new Debouncer();

  constructor() {
    this.debouncedFileWrite = this.debouncer.debounce(
      'file-write',
      this.writeFile.bind(this),
      300
    );
  }

  updateFile(filePath: string, content: string) {
    // Immediate visual update
    this.updateVisualPreview(filePath, content);
    
    // Debounced file write
    this.debouncedFileWrite(filePath, content);
  }

  cleanup() {
    this.debouncer.cleanup();
  }
}
```

### 3. **Memory Management**

```typescript
// packages/visual-editor/src/utils/MemoryManager.ts
export class MemoryManager {
  private caches = new Map<string, Map<string, any>>();
  private maxCacheSize = 1000;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB

  getCache(name: string): Map<string, any> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new Map());
    }
    return this.caches.get(name)!;
  }

  set(cacheName: string, key: string, value: any) {
    const cache = this.getCache(cacheName);
    
    // Check memory usage before adding
    if (this.getMemoryUsage() > this.memoryThreshold) {
      this.performGarbageCollection();
    }
    
    // Implement LRU eviction
    if (cache.size >= this.maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, value);
  }

  get(cacheName: string, key: string) {
    const cache = this.getCache(cacheName);
    const value = cache.get(key);
    
    // Move to end (LRU)
    if (value !== undefined) {
      cache.delete(key);
      cache.set(key, value);
    }
    
    return value;
  }

  clearCache(name: string) {
    this.caches.get(name)?.clear();
  }

  performGarbageCollection() {
    console.log('🗑️ Performing memory cleanup...');
    
    // Clear least recently used caches
    for (const [name, cache] of this.caches) {
      if (cache.size > this.maxCacheSize / 2) {
        const keysToRemove = Array.from(cache.keys())
          .slice(0, Math.floor(cache.size / 2));
        
        keysToRemove.forEach(key => cache.delete(key));
        console.log(`Cleared ${keysToRemove.length} items from ${name} cache`);
      }
    }
  }

  getMemoryUsage(): number {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  getMemoryStats() {
    let totalItems = 0;
    const cacheStats = new Map<string, number>();
    
    for (const [name, cache] of this.caches) {
      const size = cache.size;
      cacheStats.set(name, size);
      totalItems += size;
    }
    
    return {
      totalCaches: this.caches.size,
      totalItems,
      memoryUsage: this.getMemoryUsage(),
      cacheStats: Object.fromEntries(cacheStats)
    };
  }

  startMemoryMonitoring() {
    setInterval(() => {
      const usage = this.getMemoryUsage();
      if (usage > this.memoryThreshold) {
        console.warn(`High memory usage: ${Math.round(usage / 1024 / 1024)}MB`);
        this.performGarbageCollection();
      }
    }, 30000); // Check every 30 seconds
  }
}

// Global memory manager instance
export const memoryManager = new MemoryManager();
```

### 4. **Component Rendering Optimization**

```typescript
// packages/visual-editor/src/components/OptimizedPhoneFrame.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { throttle } from 'lodash';

interface OptimizedPhoneFrameProps {
  componentTree: ComponentNode[];
  onComponentSelect: (component: ComponentNode) => void;
  selectedComponentId?: string;
}

export const OptimizedPhoneFrame = memo<OptimizedPhoneFrameProps>(({
  componentTree,
  onComponentSelect,
  selectedComponentId
}) => {
  // Memoize expensive computations
  const renderedComponents = useMemo(() => {
    return renderComponentTree(componentTree, selectedComponentId);
  }, [componentTree, selectedComponentId]);

  // Throttle selection events
  const throttledSelect = useMemo(
    () => throttle(onComponentSelect, 100),
    [onComponentSelect]
  );

  // Optimize event handlers
  const handleComponentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    
    const componentData = event.currentTarget.getAttribute('data-component');
    if (componentData) {
      const component = JSON.parse(componentData);
      throttledSelect(component);
    }
  }, [throttledSelect]);

  return (
    <div className="phone-frame" onClick={handleComponentClick}>
      <div className="phone-screen">
        {renderedComponents}
      </div>
    </div>
  );
});

// Optimized component renderer
const renderComponentTree = (
  components: ComponentNode[], 
  selectedId?: string
): React.ReactNode => {
  return components.map((component) => (
    <OptimizedComponent
      key={component.id}
      component={component}
      isSelected={component.id === selectedId}
    />
  ));
};

interface OptimizedComponentProps {
  component: ComponentNode;
  isSelected: boolean;
}

const OptimizedComponent = memo<OptimizedComponentProps>(({ 
  component, 
  isSelected 
}) => {
  const componentStyle = useMemo(() => ({
    ...component.style,
    outline: isSelected ? '2px solid #007AFF' : 'none',
    position: 'relative' as const
  }), [component.style, isSelected]);

  const componentData = useMemo(() => 
    JSON.stringify(component), 
    [component]
  );

  return React.createElement(
    getComponentTag(component.type),
    {
      style: componentStyle,
      'data-component': componentData,
      'data-component-id': component.id,
      key: component.id
    },
    component.children && renderComponentTree(component.children)
  );
});

// Component tag mapping with memoization
const componentTagCache = new Map<string, string>();

const getComponentTag = (type: string): string => {
  if (componentTagCache.has(type)) {
    return componentTagCache.get(type)!;
  }

  const mapping: Record<string, string> = {
    'View': 'div',
    'Text': 'span',
    'TouchableOpacity': 'button',
    'Image': 'img',
    'ScrollView': 'div',
    'TextInput': 'input',
    'FlatList': 'div',
  };

  const tag = mapping[type] || 'div';
  componentTagCache.set(type, tag);
  return tag;
};
```

## Security Considerations

### 1. **Code Sanitization**

```typescript
// packages/visual-editor/src/utils/CodeSanitizer.ts
export class CodeSanitizer {
  private dangerousPatterns = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(\s*["'`][^"'`]*["'`]/gi,
    /setInterval\s*\(\s*["'`][^"'`]*["'`]/gi,
    /document\.write/gi,
    /innerHTML\s*=/gi,
    /outerHTML\s*=/gi,
    /onclick\s*=/gi,
    /onerror\s*=/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /fetch\s*\(\s*["'`][^"'`]*["'`]/gi,
    /XMLHttpRequest/gi,
    /window\./gi,
    /document\./gi,
    /process\./gi,
    /require\s*\(/gi
  ];

  private allowedImports = [
    'react',
    'react-native',
    'react-native-web',
    '@react-navigation',
    'lodash',
    'moment',
    'date-fns',
    'axios',
    '@expo'
  ];

  sanitizeCode(code: string): SanitizationResult {
    const warnings: string[] = [];
    let sanitized = code;
    let safe = true;

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(code)) {
        const patternName = this.getPatternName(pattern);
        warnings.push(`Potentially dangerous pattern detected: ${patternName}`);
        sanitized = sanitized.replace(pattern, `/* REMOVED: unsafe ${patternName} */`);
        safe = false;
      }
    }

    // Validate imports
    const importValidation = this.validateImports(code);
    if (!importValidation.safe) {
      warnings.push(...importValidation.warnings);
      sanitized = importValidation.sanitized;
      safe = false;
    }

    // Check for suspicious string patterns
    const stringValidation = this.validateStrings(sanitized);
    if (!stringValidation.safe) {
      warnings.push(...stringValidation.warnings);
      sanitized = stringValidation.sanitized;
      safe = false;
    }

    return {
      safe,
      sanitized,
      warnings,
      originalLength: code.length,
      sanitizedLength: sanitized.length
    };
  }

  private validateImports(code: string): SanitizationResult {
    const warnings: string[] = [];
    let sanitized = code;
    let safe = true;

    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const moduleName = match[1];
      const fullImport = match[0];

      if (!this.isAllowedImport(moduleName)) {
        warnings.push(`Unauthorized import detected: ${moduleName}`);
        sanitized = sanitized.replace(
          fullImport, 
          `/* REMOVED: unauthorized import ${moduleName} */`
        );
        safe = false;
      }
    }

    return { safe, sanitized, warnings };
  }

  private validateStrings(code: string): SanitizationResult {
    const warnings: string[] = [];
    let sanitized = code;
    let safe = true;

    // Check for base64 encoded strings (potential obfuscation)
    const base64Regex = /['"`][A-Za-z0-9+/]{20,}={0,2}['"`]/g;
    if (base64Regex.test(code)) {
      warnings.push('Suspicious base64-like strings detected');
      safe = false;
    }

    // Check for extremely long strings (potential obfuscation)
    const longStringRegex = /['"`][^'"`]{200,}['"`]/g;
    if (longStringRegex.test(code)) {
      warnings.push('Unusually long strings detected');
      safe = false;
    }

    return { safe, sanitized, warnings };
  }

  private isAllowedImport(moduleName: string): boolean {
    // Allow relative imports
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      return true;
    }

    // Check against allowed list
    return this.allowedImports.some(allowed => 
      moduleName === allowed || moduleName.startsWith(`${allowed}/`)
    );
  }

  private getPatternName(pattern: RegExp): string {
    const patternMap = new Map([
      [/eval/, 'eval()'],
      [/Function/, 'Function()'],
      [/setTimeout.*string/, 'setTimeout with string'],
      [/document\.write/, 'document.write'],
      [/innerHTML/, 'innerHTML'],
      [/onclick/, 'onclick handler'],
      [/javascript:/, 'javascript: protocol'],
      [/fetch/, 'fetch()'],
      [/window\./, 'window access'],
      [/process\./, 'process access'],
      [/require/, 'require()']
    ]);

    for (const [regex, name] of patternMap) {
      if (regex.test(pattern.source)) {
        return name;
      }
    }

    return pattern.source;
  }

  sanitizeProps(props: any): any {
    const sanitized = { ...props };

    // Remove function props (security risk)
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'function') {
        console.warn(`Removed function prop: ${key}`);
        delete sanitized[key];
      }
      
      // Sanitize style objects
      if (key === 'style' && typeof value === 'object') {
        sanitized[key] = this.sanitizeStyles(value);
      }

      // Sanitize string props for XSS
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      }
    }

    return sanitized;
  }

  private sanitizeStyles(styles: any): any {
    const sanitized = { ...styles };
    
    // Remove potentially dangerous style properties
    const dangerousProps = [
      'expression',
      'behavior',
      'binding',
      '-moz-binding',
      'javascript'
    ];
    
    for (const prop of dangerousProps) {
      delete sanitized[prop];
    }

    // Sanitize URLs in style values
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && value.includes('url(')) {
        sanitized[key] = this.sanitizeStyleUrl(value);
      }
    }

    return sanitized;
  }

  private sanitizeString(str: string): string {
    // Basic XSS prevention
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  private sanitizeStyleUrl(value: string): string {
    // Only allow data URLs for images and http(s) URLs
    const urlRegex = /url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
    
    return value.replace(urlRegex, (match, url) => {
      if (url.startsWith('data:image/') || 
          url.startsWith('http://') || 
          url.startsWith('https://')) {
        return match;
      }
      
      console.warn(`Removed suspicious URL: ${url}`);
      return 'url()';
    });
  }
}

interface SanitizationResult {
  safe: boolean;
  sanitized: string;
  warnings: string[];
  originalLength?: number;
  sanitizedLength?: number;
}

// Usage in AI service
export class SecureAIService extends AIService {
  private sanitizer = new CodeSanitizer();

  async generateComponent(prompt: string, context = {}) {
    const result = await super.generateComponent(prompt, context);
    
    // Sanitize generated code
    const sanitizationResult = this.sanitizer.sanitizeCode(result.code);
    
    if (!sanitizationResult.safe) {
      console.warn('AI generated unsafe code:', sanitizationResult.warnings);
      
      // Show warnings to user
      this.showSecurityWarnings(sanitizationResult.warnings);
    }
    
    return {
      ...result,
      code: sanitizationResult.sanitized,
      securityWarnings: sanitizationResult.warnings
    };
  }

  private showSecurityWarnings(warnings: string[]) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'security-warnings';
    warningDiv.innerHTML = `
      <div class="warning-header">🔒 Security Warning</div>
      <p>The AI generated code contained potentially unsafe patterns:</p>
      <ul>
        ${warnings.map(w => `<li>${w}</li>`).join('')}
      </ul>
      <p>The code has been automatically sanitized.</p>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => warningDiv.remove(), 10000);
  }
}
```

### 2. **File System Security**

```typescript
// packages/visual-editor/src/utils/FileSystemSecurity.ts
export class FileSystemSecurity {
  private allowedExtensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
  private allowedDirectories = ['src2', 'components', 'screens', 'utils', 'hooks'];
  private maxFileSize = 1024 * 1024; // 1MB
  private maxFilesPerOperation = 50;

  validateFilePath(filePath: string): ValidationResult {
    // Prevent directory traversal
    if (filePath.includes('..') || filePath.includes('~') || filePath.includes('//')) {
      return { valid: false, reason: 'Directory traversal not allowed' };
    }

    // Prevent absolute paths
    if (path.isAbsolute(filePath)) {
      return { valid: false, reason: 'Absolute paths not allowed' };
    }

    // Normalize path to prevent bypass attempts
    const normalizedPath = path.normalize(filePath);
    
    // Check if path escapes allowed directories
    if (normalizedPath.startsWith('../')) {
      return { valid: false, reason: 'Path escapes allowed directories' };
    }

    // Check if path is within allowed directories
    const isInAllowedDir = this.allowedDirectories.some(dir => 
      normalizedPath.startsWith(dir + '/') || normalizedPath === dir
    );

    if (!isInAllowedDir) {
      return { valid: false, reason: 'File must be in allowed directory' };
    }

    // Check file extension
    const ext = path.extname(filePath);
    if (!this.allowedExtensions.includes(ext)) {
      return { valid: false, reason: 'File extension not allowed' };
    }

    // Check for suspicious patterns in filename
    if (this.hasSuspiciousFilename(filePath)) {
      return { valid: false, reason: 'Suspicious filename pattern' };
    }

    return { valid: true };
  }

  async validateFileContent(content: string, filePath: string): Promise<ValidationResult> {
    // Check file size
    if (content.length > this.maxFileSize) {
      return { 
        valid: false, 
        reason: `File too large: ${content.length} bytes (max: ${this.maxFileSize})` 
      };
    }

    // Check for binary content
    if (this.isBinaryContent(content)) {
      return { valid: false, reason: 'Binary content not allowed' };
    }

    // Scan for suspicious content
    const suspiciousPatterns = [
      /require\s*\(\s*['"`]fs['"`]\s*\)/gi,
      /require\s*\(\s*['"`]child_process['"`]\s*\)/gi,
      /require\s*\(\s*['"`]net['"`]\s*\)/gi,
      /require\s*\(\s*['"`]http['"`]\s*\)/gi,
      /require\s*\(\s*['"`]crypto['"`]\s*\)/gi,
      /process\.env(?!\.NODE_ENV|\.EXPO_)/gi,
      /__dirname/gi,
      /__filename/gi,
      /Buffer\./gi,
      /global\./gi
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        return { 
          valid: false, 
          reason: `Suspicious pattern detected: ${pattern.toString()}` 
        };
      }
    }

    // Check for obfuscated code
    if (this.isObfuscatedCode(content)) {
      return { valid: false, reason: 'Obfuscated code detected' };
    }

    return { valid: true };
  }

  private hasSuspiciousFilename(filePath: string): boolean {
    const filename = path.basename(filePath);
    
    // Check for hidden files
    if (filename.startsWith('.')) {
      return true;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|sh|ps1)$/i,
      /\.(php|asp|jsp)$/i,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
      /[<>:"|?*]/g // Invalid filename characters
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  private isBinaryContent(content: string): boolean {
    // Check for null bytes (common in binary files)
    if (content.includes('\0')) {
      return true;
    }

    // Check for high ratio of non-printable characters
    const nonPrintableCount = (content.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g) || []).length;
    const ratio = nonPrintableCount / content.length;
    
    return ratio > 0.1; // More than 10% non-printable characters
  }

  private isObfuscatedCode(content: string): boolean {
    // Check for extremely long variable names (common in obfuscation)
    if (/\b[a-zA-Z_$][a-zA-Z0-9_$]{50,}\b/.test(content)) {
      return true;
    }

    // Check for hex-encoded strings
    if (/\\x[0-9a-fA-F]{2}/.test(content)) {
      return true;
    }

    // Check for excessive use of escape sequences
    const escapeCount = (content.match(/\\[nrtbfv]/g) || []).length;
    if (escapeCount > content.length * 0.05) { // More than 5% escape sequences
      return true;
    }

    return false;
  }

  validateBatchOperation(filePaths: string[]): ValidationResult {
    if (filePaths.length > this.maxFilesPerOperation) {
      return {
        valid: false,
        reason: `Too many files in batch operation: ${filePaths.length} (max: ${this.maxFilesPerOperation})`
      };
    }

    // Check each file path
    for (const filePath of filePaths) {
      const result = this.validateFilePath(filePath);
      if (!result.valid) {
        return {
          valid: false,
          reason: `Invalid file in batch: ${filePath} - ${result.reason}`
        };
      }
    }

    return { valid: true };
  }
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// Usage in server routes
export const secureFileHandler = (security: FileSystemSecurity) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { filePath, content } = req.body;

    // Validate file path
    const pathValidation = security.validateFilePath(filePath);
    if (!pathValidation.valid) {
      return res.status(400).json({ 
        error: 'Invalid file path', 
        reason: pathValidation.reason 
      });
    }

    // Validate file content if provided
    if (content) {
      const contentValidation = await security.validateFileContent(content, filePath);
      if (!contentValidation.valid) {
        return res.status(400).json({ 
          error: 'Invalid file content', 
          reason: contentValidation.reason 
        });
      }
    }

    next();
  };
};
```

## Monitoring & Analytics

### 1. **Performance Monitoring**

```typescript
// packages/visual-editor/src/utils/PerformanceMonitor.ts
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private observers = new Map<string, PerformanceObserver>();
  private startTimes = new Map<string, number>();

  startMonitoring() {
    this.observeRenderTime();
    this.observeFileOperations();
    this.observeMemoryUsage();
    this.observeUserInteractions();
  }

  private observeRenderTime() {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('component-render')) {
          this.recordMetric('render-time', entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.set('render', observer);
  }

  measureRender<T>(componentName: string, renderFn: () => T): T {
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;
    const measureName = `${componentName}-render`;

    performance.mark(startMark);
    const result = renderFn();
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    return result;
  }

  startOperation(operationName: string) {
    this.startTimes.set(operationName, performance.now());
  }

  endOperation(operationName: string) {
    const startTime = this.startTimes.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(operationName, duration);
      this.startTimes.delete(operationName);
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Check for performance issues
    this.checkPerformanceThresholds(name, value);
  }

  private checkPerformanceThresholds(metricName: string, value: number) {
    const thresholds = {
      'render-time': 16, // 60 FPS
      'file-write-time': 1000,
      'ai-response-time': 5000,
      'bundle-time': 30000
    };

    const threshold = thresholds[metricName];
    if (threshold && value > threshold) {
      console.warn(`⚠️ Performance issue: ${metricName} took ${value.toFixed(2)}ms (threshold: ${threshold}ms)`);
      
      this.reportPerformanceIssue(metricName, value, threshold);
    }
  }

  private reportPerformanceIssue(metricName: string, value: number, threshold: number) {
    // Send to analytics service
    this.sendAnalyticsEvent('performance_issue', {
      metric: metricName,
      value,
      threshold,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  }

  getMetrics() {
    const summary = new Map<string, MetricSummary>();
    
    for (const [name, values] of this.metrics) {
      if (values.length === 0) continue;

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const sorted = [...values].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      
      summary.set(name, {
        count: values.length,
        avg: Math.round(avg * 100) / 100,
        min: Math.min(...values),
        max: Math.max(...values),
        p95,
        latest: values[values.length - 1]
      });
    }
    
    return Object.fromEntries(summary);
  }

  private observeFileOperations() {
    // Hook into file operations to measure performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      
      if (url.includes('/api/editor/')) {
        const operationName = this.getOperationNameFromUrl(url);
        this.startOperation(operationName);
        
        try {
          const result = await originalFetch(...args);
          this.endOperation(operationName);
          return result;
        } catch (error) {
          this.endOperation(operationName);
          throw error;
        }
      }
      
      return originalFetch(...args);
    };
  }

  private getOperationNameFromUrl(url: string): string {
    if (url.includes('/write')) return 'file-write-time';
    if (url.includes('/read')) return 'file-read-time';
    if (url.includes('/deploy')) return 'deployment-time';
    return 'api-call-time';
  }

  private observeMemoryUsage() {
    if (!performance.memory) return;

    setInterval(() => {
      this.recordMetric('memory-used', performance.memory.usedJSHeapSize);
      this.recordMetric('memory-total', performance.memory.totalJSHeapSize);
      this.recordMetric('memory-limit', performance.memory.jsHeapSizeLimit);
    }, 10000); // Every 10 seconds
  }

  private observeUserInteractions() {
    // Track user interaction response times
    const interactionEvents = ['click', 'input', 'keydown'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const target = event.target as HTMLElement;
        const interactionType = this.getInteractionType(target, eventType);
        
        if (interactionType) {
          this.startOperation(`interaction-${inter    "dev:web": "cd packages/web && npm run dev",
    "dev:editor": "cd packages/visual-editor && npm run dev",
    "dev:mobile": "cd packages/mobile && EXPO_USE_SRC2=true expo start",
    "build:all": "npm run build --workspaces",
    "editor:init": "curl -X POST http://localhost:3001/api/editor/init",
    "editor:cleanup": "curl -X POST http://localhost:3001/api/editor/cleanup",
    "deploy:mobile": "cd packages/visual-editor && npm run deploy:mobile"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### 6. **Visual Editor Package Configuration**

```json
// packages/visual-editor/package.json
{
  "name": "@your-project/visual-editor",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "webpack serve --mode development --port 3002",
    "build": "webpack --mode production",
    "init:src2": "curl -X POST http://localhost:3001/api/editor/init",
    "cleanup:src2": "curl -X POST http://localhost:3001/api/editor/cleanup",
    "deploy:mobile": "node scripts/deploy-mobile.js"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-native-web": "^0.19.0",
    "@babel/core": "^7.22.0",
    "@babel/generator": "^7.22.0",
    "@babel/parser": "^7.22.0",
    "@babel/traverse": "^7.22.0",
    "socket.io-client": "^4.7.0",
    "openai": "^4.0.0",
    "chokidar": "^3.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "webpack": "^5.88.0",
    "webpack-dev-server": "^4.15.0",
    "@babel/preset-react": "^7.22.0",
    "@babel/preset-typescript": "^7.22.0",
    "babel-loader": "^9.1.0",
    "html-webpack-plugin": "^5.5.0"
  }
}
```

### 7. **Main Visual Editor Application**

```typescript
// packages/visual-editor/src/App.tsx
import React, { useState, useEffect } from 'react';
import { LiveRenderer } from './services/LiveRenderer';
import { ComponentInspector } from './services/ComponentInspector';
import { AdvancedDragDrop } from './services/DragDropManager';
import { Src2Manager } from './services/Src2Manager';
import { AIService } from './services/AIService';
import { MobileDeploymentManager } from './services/MobileDeploymentManager';
import { PhoneFrame } from './components/PhoneFrame';
import { ComponentPalette } from './components/ComponentPalette';
import { PropertiesPanel } from './components/PropertiesPanel';
import { DeploymentPanel } from './components/DeploymentPanel';

const App: React.FC = () => {
  const [componentTree, setComponentTree] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize services
  const liveRenderer = new LiveRenderer(document.getElementById('phone-frame'));
  const inspector = new ComponentInspector(liveRenderer);
  const dragDrop = new AdvancedDragDrop({ renderer: liveRenderer, inspector });
  const src2Manager = new Src2Manager();
  const aiService = new AIService(process.env.REACT_APP_OPENAI_API_KEY);
  const deploymentManager = new MobileDeploymentManager({
    expo: { accessToken: process.env.REACT_APP_EXPO_TOKEN }
  });

  useEffect(() => {
    initializeEditor();
    return () => cleanup();
  }, []);

  const initializeEditor = async () => {
    try {
      setIsLoading(true);
      
      // Initialize src2 environment
      await src2Manager.initializeEditingEnvironment();
      
      // Set up component inspector
      inspector.enableInspection();
      inspector.on('component_selected', setSelectedComponent);
      
      // Set up real-time updates
      liveRenderer.on('tree_updated', setComponentTree);
      
      setIsInitialized(true);
      console.log('✅ Visual editor initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize visual editor:', error);
      alert(`Failed to initialize: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = async () => {
    try {
      await src2Manager.cleanup();
      inspector.cleanup();
      liveRenderer.cleanup();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const handleComponentMove = async (component, targetFile, newTree) => {
    try {
      setComponentTree(newTree);
      await dragDrop.updateSourceFiles(newTree);
      console.log('✅ Component moved successfully');
    } catch (error) {
      console.error('❌ Failed to move component:', error);
    }
  };

  const handleComponentAdd = async (componentTemplate, targetLocation) => {
    try {
      const newComponent = { ...componentTemplate, id: generateId() };
      const newTree = insertComponentInTree(componentTree, newComponent, targetLocation);
      
      setComponentTree(newTree);
      await dragDrop.updateSourceFiles(newTree);
      console.log('✅ Component added successfully');
    } catch (error) {
      console.error('❌ Failed to add component:', error);
    }
  };

  const handleAIModification = async (prompt) => {
    if (!selectedComponent) return;
    
    try {
      setIsLoading(true);
      const result = await aiService.modifyComponent(
        selectedComponent.code,
        prompt,
        selectedComponent.filePath
      );
      console.log('🤖 AI modification completed:', result);
    } catch (error) {
      console.error('❌ AI modification failed:', error);
      alert(`AI modification failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileDeploy = async (options) => {
    try {
      setIsLoading(true);
      const deployment = await deploymentManager.deployToMobile(options);
      
      // Show deployment success with QR code
      showDeploymentSuccess(deployment);
      console.log('🚀 Mobile deployment successful:', deployment);
    } catch (error) {
      console.error('❌ Mobile deployment failed:', error);
      alert(`Deployment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showDeploymentSuccess = (deployment) => {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; max-width: 400px;">
          <h2>🚀 Deployment Successful!</h2>
          <p>Scan this QR code with Expo Go:</p>
          <img src="${deployment.qrCode}" alt="QR Code" style="margin: 20px auto; display: block;" />
          <p style="font-size: 12px; color: #666;">Deployment ID: ${deployment.deploymentId}</p>
          <button onclick="this.parentElement.parentElement.remove()" style="background: #007AFF; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Visual Editor...</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="error-screen">
        <h2>Failed to Initialize</h2>
        <p>Please ensure your server is running and try refreshing.</p>
        <button onClick={initializeEditor}>Retry</button>
      </div>
    );
  }

  return (
    <div className="visual-editor">
      <header className="editor-header">
        <h1>🎨 Visual React Native Editor</h1>
        <div className="header-actions">
          <button onClick={() => handleMobileDeploy({ method: 'expo' })}>
            📱 Deploy to Mobile
          </button>
          <button onClick={cleanup}>
            🧹 Close Editor
          </button>
        </div>
      </header>

      <div className="editor-layout">
        <ComponentPalette 
          onComponentDrag={handleComponentAdd}
          className="left-panel"
        />
        
        <div className="center-panel">
          <PhoneFrame 
            id="phone-frame"
            componentTree={componentTree}
            onComponentSelect={setSelectedComponent}
            onComponentMove={handleComponentMove}
          />
        </div>
        
        <div className="right-panel">
          <PropertiesPanel 
            selectedComponent={selectedComponent}
            onAIPrompt={handleAIModification}
            onStyleChange={(changes) => inspector.updateComponentStyle(changes)}
          />
          
          <DeploymentPanel 
            onDeploy={handleMobileDeploy}
            deploymentHistory={deploymentManager.deploymentHistory}
          />
        </div>
      </div>
    </div>
  );
};

// Utility functions
const generateId = () => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const insertComponentInTree = (tree, component, location) => {
  // Implementation for inserting component at specific location
  const newTree = [...tree];
  // Insert logic here based on location
  return newTree;
};

export default App;
```

## Testing Strategy

### 1. **Unit Testing**

```javascript
// packages/visual-editor/src/__tests__/LiveRenderer.test.ts
import { LiveRenderer } from '../services/LiveRenderer';

describe('LiveRenderer', () => {
  let renderer: LiveRenderer;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    renderer = new LiveRenderer(mockContainer);
  });

  test('should transform React Native code to web', async () => {
    const rnCode = `
      import { View, Text } from 'react-native';
      export default () => <View><Text>Hello</Text></View>;
    `;
    
    const transformed = await renderer.transformCode(rnCode);
    expect(transformed).toContain('react-native-web');
  });

  test('should update module cache correctly', async () => {
    const filePath = 'components/TestComponent.tsx';
    const code = 'export default () => <View>Test</View>';
    
    await renderer.updateModule(filePath, code);
    expect(renderer.moduleCache.has(filePath)).toBe(true);
  });

  test('should write to src2 and trigger updates', async () => {
    const filePath = 'components/TestComponent.tsx';
    const content = 'export default () => <View>Updated</View>';
    
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    await renderer.writeToSrc2(filePath, content);
    
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3001/api/editor/write',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content })
      })
    );
  });
});

// packages/visual-editor/src/__tests__/ComponentInspector.test.ts
import { ComponentInspector } from '../services/ComponentInspector';

describe('ComponentInspector', () => {
  let inspector: ComponentInspector;
  let mockRenderer: any;

  beforeEach(() => {
    mockRenderer = {
      container: document.createElement('div'),
      socket: { on: jest.fn() }
    };
    inspector = new ComponentInspector(mockRenderer);
  });

  test('should extract component info from fiber', () => {
    const mockFiber = {
      type: { name: 'TestComponent' },
      memoizedProps: { test: 'prop' },
      memoizedState: null
    };

    const info = inspector.fiberInspector.getComponentInfo(mockFiber);
    
    expect(info.name).toBe('TestComponent');
    expect(info.props.test).toBe('prop');
  });

  test('should handle component selection', () => {
    const mockComponent = {
      fiber: {},
      filePath: 'components/Test.tsx',
      props: {},
      state: null,
      element: document.createElement('div'),
      componentName: 'Test',
      path: []
    };

    const emitSpy = jest.spyOn(inspector, 'emit');
    inspector.selectComponent(mockComponent);
    
    expect(inspector.selectedComponent).toBe(mockComponent);
    expect(emitSpy).toHaveBeenCalledWith('component_selected', mockComponent);
  });
});
```

### 2. **Integration Testing**

```javascript
// packages/visual-editor/src/__tests__/integration/FileSync.test.ts
import { Src2Manager } from '../services/Src2Manager';
import fs from 'fs-extra';
import path from 'path';

describe('File Synchronization Integration', () => {
  let src2Manager: Src2Manager;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(__dirname, 'temp-'));
    
    // Create mock src directory
    const srcDir = path.join(tempDir, 'src');
    await fs.ensureDir(srcDir);
    await fs.writeFile(path.join(srcDir, 'App.tsx'), 'export default () => <View />');
    
    src2Manager = new Src2Manager();
    src2Manager.srcPath = srcDir;
    src2Manager.src2Path = path.join(tempDir, 'src2');
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  test('should create src2 from src', async () => {
    await src2Manager.initializeEditingEnvironment();
    
    const src2Exists = await fs.pathExists(src2Manager.src2Path);
    expect(src2Exists).toBe(true);
    
    const appContent = await fs.readFile(
      path.join(src2Manager.src2Path, 'App.tsx'), 
      'utf8'
    );
    expect(appContent).toBe('export default () => <View />');
  });

  test('should sync file changes to src2', async () => {
    await src2Manager.initializeEditingEnvironment();
    
    const newContent = 'export default () => <View><Text>Hello</Text></View>';
    const filePath = path.join(src2Manager.src2Path, 'App.tsx');
    
    await fs.writeFile(filePath, newContent);
    
    const updatedContent = await fs.readFile(filePath, 'utf8');
    expect(updatedContent).toBe(newContent);
  });

  test('should cleanup src2 on exit', async () => {
    await src2Manager.initializeEditingEnvironment();
    expect(await fs.pathExists(src2Manager.src2Path)).toBe(true);
    
    await src2Manager.cleanup();
    expect(await fs.pathExists(src2Manager.src2Path)).toBe(false);
  });
});
```

### 3. **E2E Testing**

```javascript
// packages/visual-editor/src/__tests__/e2e/VisualEditor.test.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Editor E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start all services
    await page.goto('http://localhost:3002');
    
    // Wait for editor to initialize
    await page.waitForSelector('[data-testid="phone-frame"]');
  });

  test('should initialize src2 environment', async ({ page }) => {
    // Check if editor is initialized
    await expect(page.locator('.visual-editor')).toBeVisible();
    await expect(page.locator('[data-testid="component-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="phone-frame"]')).toBeVisible();
  });

  test('should allow drag and drop from component palette', async ({ page }) => {
    // Drag a component from palette
    const textComponent = page.locator('[data-testid="component-Text"]');
    const phoneFrame = page.locator('[data-testid="phone-frame"]');
    
    await textComponent.dragTo(phoneFrame);
    
    // Verify component appears in phone frame
    await expect(phoneFrame.locator('text=Sample Text')).toBeVisible();
  });

  test('should sync changes across environments', async ({ page, context }) => {
    // Open additional pages for other environments
    const webPreviewPage = await context.newPage();
    await webPreviewPage.goto('http://localhost:3000');
    
    // Make a change in visual editor
    await page.click('[data-testid="component-in-frame"]');
    await page.fill('[data-testid="style-input-padding"]', '20');
    
    // Wait for sync
    await page.waitForTimeout(1000);
    
    // Verify change appears in web preview
    const iframe = webPreviewPage.frameLocator('iframe');
    await expect(iframe.locator('[style*="padding: 20"]')).toBeVisible();
  });

  test('should deploy to mobile successfully', async ({ page }) => {
    // Click deploy button
    await page.click('[data-testid="deploy-button"]');
    
    // Wait for deployment to complete
    await page.waitForSelector('[data-testid="qr-code"]', { timeout: 30000 });
    
    // Verify QR code is displayed
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
    await expect(page.locator('text=Deployment Successful')).toBeVisible();
  });

  test('should handle AI modifications', async ({ page }) => {
    // Select a component
    await page.click('[data-testid="component-in-frame"]');
    
    // Enter AI prompt
    await page.fill('[data-testid="ai-prompt-input"]', 'Add a red background color');
    await page.click('[data-testid="ai-apply-button"]');
    
    // Wait for AI processing
    await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden' });
    
    // Verify component was modified
    await expect(page.locator('[style*="background-color: red"]')).toBeVisible();
  });
});
```

## Error Handling & Recovery

### 1. **Error Boundary System**

```typescript
// packages/visual-editor/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Visual Editor Error:', error, errorInfo);
    
    // Send error to monitoring service
    this.reportError(error, errorInfo);
    
    // Notify parent component
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  reportError(error: Error, errorInfo: ErrorInfo) {
    // Report to error monitoring service (Sentry, etc.)
    if (window.errorReporting) {
      window.errorReporting.captureException(error, {
        extra: errorInfo,
        tags: {
          component: 'visual-editor',
          feature: 'rendering'
        }
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong</h2>
            <p>The visual editor encountered an unexpected error.</p>
            
            <details className="error-details">
              <summary>Error details</summary>
              <pre className="error-stack">
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo && (
                <pre className="error-component-stack">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                🔄 Try again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="reload-button"
              >
                🔄 Reload editor
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. **Graceful Degradation**

```typescript
// packages/visual-editor/src/utils/SafeExecutor.ts
export class SafeExecutor {
  static async executeWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    errorHandler?: (error: Error) => void
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.warn('Primary execution failed, falling back:', error);
      errorHandler?.(error as Error);
      return await fallback();
    }
  }

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    backoffMultiplier: number = 1.5
  ): Promise<T> {
    let lastError: Error;
    let currentDelay = delay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        console.warn(
          `Attempt ${attempt}/${maxRetries} failed, retrying in ${currentDelay}ms:`, 
          error
        );
        
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }
    
    throw lastError!;
  }
}

// Usage examples
export class RobustFileManager {
  async writeFileWithRetry(filePath: string, content: string) {
    return SafeExecutor.executeWithRetry(
      () => this.writeFile(filePath, content),
      3,
      300
    );
  }

  async writeFileWithFallback(filePath: string, content: string) {
    return SafeExecutor.executeWithFallback(
      () => this.writeToSrc2(filePath, content),
      () => this.saveToLocalStorage(filePath, content),
      (error) => console.error('File write failed:', error)
    );
  }
}
```

### 3. **State Recovery**

```typescript
// packages/visual-editor/src/utils/StateManager.ts
export class StateManager {
  private backupKey = 'visual-editor-backup';
  private backupInterval = 30000; // 30 seconds
  private backupTimer?: NodeJS.Timeout;

  startAutoBackup(getState: () => any) {
    this.backupTimer = setInterval(() => {
      this.backupState(getState());
    }, this.backupInterval);
  }

  stopAutoBackup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = undefined;
    }
  }

  backupState(state: any) {
    try {
      const backup = {
        state,
        timestamp: Date.now(),
        version: '1.0.0',
        url: window.location.href
      };
      
      localStorage.setItem(this.backupKey, JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to backup state:', error);
    }
  }

  restoreState(): any | null {
    try {
      const backupData = localStorage.getItem(this.backupKey);
      if (!backupData) return null;
      
      const backup = JSON.parse(backupData);
      
      // Check if backup is recent (within 1 hour)
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - backup.timestamp > oneHour) {
        console.warn('Backup is too old, ignoring');
        return null;
      }
      
      console.log('Restored state from backup:', new Date(backup.timestamp));
      return backup.state;
    } catch (error) {
      console.error('Failed to restore state:', error);
      return null;
    }
  }

  clearBackup() {
    localStorage.removeItem(this.backupKey);
  }

  hasBackup(): boolean {
    return localStorage.getItem(this.backupKey) !== null;
  }
}

// Usage in main App component
export const useStateRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const stateManager = new StateManager();

  useEffect(() => {
    // Check for backup on mount
    if (stateManager.hasBackup()) {
      const shouldRestore = window.confirm(
        'Found a previous editing session. Would you like to restore it?'
      );
      
      if (shouldRestore) {
        setIsRecovering(true);
        const restoredState = stateManager.restoreState();
        if (restoredState) {
          // Apply restored state
          return restoredState;
        }
      } else {
        stateManager.clearBackup();
      }
    }
    
    return null;
  }, []);

  return { isRecovering, stateManager };
};
```

## Performance Optimization

### 1. **Virtual Scrolling for Large Component Trees**

```typescript
// packages/visual-editor/src/components/VirtualizedComponentTree.tsx
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface ComponentTreeProps {
  components: ComponentNode[];
  onComponentSelect: (component: ComponentNode) => void;
  height: number;
}

export const VirtualizedComponentTree: React.FC<ComponentTreeProps> = ({
  components,
  onComponentSelect,
  height
}) => {
  const flattenedComponents = useMemo(() => {
    return flattenComponentTree(components);
  }, [components]);

  const Row = useCallback(({ index, style }) => {
    const component = flattenedComponents[index];
    
    return (
      <div style={style}>
        <ComponentTreeItem
          component={component}
          onSelect={onComponentSelect}
          depth={component.depth}
        />
      </div>
    );
  }, [flattenedComponents, onComponentSelect]);

  return (
    <List
      height={height}
      itemCount={flattenedComponents.length}
      itemSize={32}
      itemData={flattenedComponents}
    >
      {Row}
    </List>
  );
};

function flattenComponentTree(
  components: ComponentNode[], 
  depth = 0
): FlattenedComponent[] {
  const result: FlattenedComponent[] = [];
  
  for (const component of components) {
    result.push({ ...component, depth });
    
    if (component.children && component.expanded) {
      result.push(...flattenComponentTree(component.children, depth + 1));
    }
  }
  
  return result;
}

interface ComponentTreeItemProps {
  component: FlattenedComponent;
  onSelect: (component: ComponentNode) => void;
  depth: number;
}

const ComponentTreeItem: React.FC<ComponentTreeItemProps> = React.memo(({ 
  component, 
  onSelect, 
  depth 
}) => {
  const handleClick = useCallback(() => {
    onSelect(component);
  }, [component, onSelect]);

  return (
    <div 
      className="component-tree-item"
      style={{ 
        paddingLeft: depth * 20,
        cursor: 'pointer',
        padding: '4px 8px',
        borderBottom: '1px solid #eee'
      }}
      onClick={handleClick}
    >
      <span className="component-icon">
        {component.children?.length > 0 ? (component.expanded ? '📂' : '📁') : '📄'}
      </span>
      <span className="component-name">{component.type}</span>
      <span className="component-path">{component.filePath}</span>
    </div>
  );
});
```

### 2. **Debounced Operations**

```typescript
// packages/visual-editor/src/utils/Debouncer.ts
export class Debouncer {
  private timers = new Map<string, NodeJS.Timeout>();

  debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        func(...args);
        this.timers.delete(key);
      }, delay);

      this.timers.set(key, timer);
    };# Visual React Native Editor - Complete Architecture & Implementation Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Integration Strategy](#integration-strategy)
4. [File System Architecture](#file-system-architecture)
5. [Real-time Update System](#real-time-update-system)
6. [Requirements](#requirements)
7. [Core Components](#core-components)
8. [Implementation Code](#implementation-code)
9. [Integration Guide](#integration-guide)
10. [Testing Strategy](#testing-strategy)
11. [Error Handling & Recovery](#error-handling--recovery)
12. [Performance Optimization](#performance-optimization)
13. [Security Considerations](#security-considerations)
14. [Monitoring & Analytics](#monitoring--analytics)
15. [Accessibility Features](#accessibility-features)
16. [Deployment Pipeline](#deployment-pipeline)

## System Overview

A web-based visual development environment for React Native applications that integrates with existing monorepo structures, enabling:
- **Visual editing** of React Native components with drag-and-drop interface
- **Live preview** in a phone frame with instant updates across all environments
- **AI-powered** component generation and modifications
- **Physical src2 directory** for safe editing with real-time synchronization
- **Mobile deployment** via over-the-air updates
- **Seamless integration** with existing mobile/web/server packages

### Key Features
- Duplicate `mobile/src` to `mobile/src2` for safe editing
- Component inspector with click-to-select
- Real-time style and prop editing with instant HMR
- Drag-and-drop component library
- AI prompt integration for component modifications
- **Instant updates** across Visual Editor, Web Preview, and Mobile App
- **No bundling required** during development (uses Hot Module Replacement)
- Mobile bundle generation and deployment for production

### Real-time Update Flow
```
Visual Editor/AI Change → src2 File Write → Automatic Updates
                                         ├─ Visual Editor (instant HMR)
                                         ├─ Web Preview (Metro HMR) 
                                         └─ Mobile App (Fast Refresh)
```

## Architecture

### Monorepo Integration Architecture

```
your-existing-repo/
├── packages/
│   ├── mobile/              # Existing RN app
│   │   ├── src/            # Original source (read-only in editor)
│   │   ├── src2/           # Editing copy (created by visual editor)
│   │   ├── App.tsx         # Smart switching between src/src2
│   │   └── metro.config.js # Watches both src and src2
│   ├── web/                # Existing web renderer
│   │   └── src/
│   │       └── App.tsx     # Link to visual editor
│   ├── server/             # Existing server + editor APIs
│   │   ├── routes/
│   │   │   └── editor.js   # New editor endpoints
│   │   └── services/
│   │       └── FileWatcher.js # Real-time file watching
│   └── visual-editor/      # 🆕 New visual editor package
│       ├── src/
│       ├── package.json
│       └── webpack.config.js
└── package.json
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Visual Editor Package (Port 3002)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Component   │  │ Visual      │  │ AI Integration      │  │
│  │ Palette     │  │ Editor      │  │ - LLM API          │  │
│  │             │  │ - Inspector │  │ - Code Generation  │  │
│  │             │  │ - Drag&Drop │  │ - Modifications    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Live        │  │ Code Sync   │  │ Physical FS        │  │
│  │ Renderer    │  │ Manager     │  │ - src2 Management  │  │
│  │ - RN Web    │  │ - AST Gen   │  │ - File Watcher     │  │
│  │ - Phone UI  │  │ - HMR       │  │ - Real Files       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↕ Real-time Socket.IO Communication ↕
┌─────────────────────────────────────────────────────────────┐
│              Extended Server Package (Port 3001)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Editor APIs │  │ File Watcher│  │ Mobile Deployment  │  │
│  │ - src2 Init │  │ - Chokidar  │  │ - Expo Updates     │  │
│  │ - File Sync │  │ - Socket.IO │  │ - Bundle Generation│  │
│  │ - Deploy    │  │ - HMR Proxy │  │ - QR Code Deploy   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↕ File System Operations ↕
┌─────────────────────────────────────────────────────────────┐
│                    Physical File System                     │
├─────────────────────────────────────────────────────────────┤
│  mobile/src/          mobile/src2/         web/src/          │
│  ├── App.tsx         ├── App.tsx          ├── App.tsx       │
│  ├── components/     ├── components/      └── components/   │
│  └── screens/        └── screens/             └── Link to   │
│  (Original files)    (Editable copy)            Visual      │
│                                                 Editor      │
└─────────────────────────────────────────────────────────────┘
            ↕ Metro Bundler + Fast Refresh ↕
┌─────────────────────────────────────────────────────────────┐
│                    Development Servers                      │
├─────────────────────────────────────────────────────────────┤
│  Web Preview         Mobile Preview        Visual Editor    │
│  (Port 3000)         (Expo/Metro)         (Port 3002)      │
│  ├── iframe to       ├── Fast Refresh     ├── Live RN Web  │
│  │   Metro bundle    ├── Hot Reload       ├── Instant HMR  │
│  └── src2 rendering  └── src2 switching   └── Phone Frame  │
└─────────────────────────────────────────────────────────────┘
```

### Real-time Update Data Flow

```
Developer/AI Edit → src2 File Write → File Watcher → Socket.IO Broadcast
                                                            ↓
                    ┌─────────────────┬─────────────────────┼─────────────────┐
                    ↓                 ↓                     ↓                 ↓
            Visual Editor      Web Preview           Mobile App         Metro Dev
            React Native Web   Metro HMR Bundle      Fast Refresh       Server HMR
            Hot Replacement    Auto-iframe reload    Auto-reload        Broadcasts
            (instant)          (instant)             (instant)          (instant)
```

## Integration Strategy

### Recommended Approach: Separate Package Integration

Given an existing monorepo with `mobile`, `web`, and `server` packages, the visual editor should be added as a **separate package** that integrates with the existing infrastructure.

#### Benefits of Separate Package:
- ✅ **Clean separation of concerns** - Visual editor is isolated and focused
- ✅ **Independent development** - Can be developed and tested separately
- ✅ **No disruption** - Existing packages remain unchanged
- ✅ **Easy maintenance** - Clear boundaries and responsibilities
- ✅ **Future extraction** - Can be extracted as standalone tool later
- ✅ **Flexible deployment** - Can run standalone or embedded

#### Integration Points:
1. **Server Extension** - Add editor API endpoints to existing server
2. **Web Integration** - Add link/iframe to visual editor from web package  
3. **Mobile Configuration** - Smart switching between src and src2
4. **File System** - Physical src2 directory for Metro bundler compatibility

### Package Structure Integration

```
your-existing-repo/
├── packages/
│   ├── mobile/                 # 📱 Existing - Minimal changes
│   │   ├── src/               # Original source (protected)
│   │   ├── src2/              # 🆕 Editing copy (auto-generated)
│   │   ├── App.tsx            # 🔄 Smart src/src2 switching
│   │   ├── metro.config.js    # 🔄 Watch both directories
│   │   └── package.json
│   ├── web/                   # 🌐 Existing - Add editor link
│   │   ├── src/
│   │   │   └── App.tsx        # 🔄 Add visual editor link
│   │   └── package.json
│   ├── server/                # 🖥️ Existing - Add editor APIs
│   │   ├── routes/
│   │   │   ├── index.js       # Existing routes
│   │   │   └── editor.js      # 🆕 Editor endpoints
│   │   ├── services/
│   │   │   └── FileWatcher.js # 🆕 Real-time file watching
│   │   └── package.json
│   ├── visual-editor/         # 🆕 New standalone package
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── webpack.config.js
│   └── shared/               # 🔄 Optional - shared utilities
│       ├── types/
│       └── utils/
├── package.json              # 🔄 Root workspace configuration
└── README.md
```

### Integration with Existing Web Package

```javascript
// packages/web/src/App.tsx (existing)
import React from 'react';
import { MobileAppRenderer } from './components/MobileAppRenderer';

const App = () => {
  return (
    <div>
      <h1>Mobile App Preview</h1>
      <MobileAppRenderer sourcePath="mobile/src" />
      
      {/* Add visual editor integration */}
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <a 
          href="http://localhost:3002" 
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'inline-block',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          🎨 Open Visual Editor
        </a>
        <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
          Edit your mobile app visually with AI assistance
        </p>
      </div>
    </div>
  );
};

export default App;
```

### Package.json Workspace Configuration

```json
// Root package.json
{
  "name": "your-project-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:web\" \"npm run dev:editor\" \"npm run dev:mobile\"",
    "dev:server": "cd packages/server && npm run dev",
    "dev:web": "cd packages/web && npm run dev", 
    "dev:editor": "cd packages/visual-editor && npm run dev",
    "dev:mobile": "cd packages/mobile && EXPO_USE_SRC2=true expo start",
    "build:all": "npm run build --workspaces",
    "editor:init": "cd packages/visual-editor && npm run init:src2",
    "editor:cleanup": "cd packages/visual-editor && npm run cleanup:src2"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "lerna": "^7.1.0"
  }
}
```

## File System Architecture

### Physical src2 Approach (Recommended)

The visual editor uses **physical files** in a `src2` directory rather than a virtual file system for maximum compatibility with existing tooling.

#### Why Physical Files:
- ✅ **Metro bundler compatibility** - Works without custom resolvers
- ✅ **IDE support** - Can open src2 in VS Code, inspect files
- ✅ **Hot reload works natively** - Existing HMR systems work
- ✅ **Debugging capabilities** - Real files, source maps work perfectly
- ✅ **Git integration** - Can diff, branch, track changes
- ✅ **Tool ecosystem** - ESLint, Prettier, TypeScript all work

#### File Lifecycle:
```
Original State:           Editor Active:           Editor Closed:
mobile/                   mobile/                  mobile/
├── src/                 ├── src/ (read-only)     ├── src/
│   ├── App.tsx         │   ├── App.tsx          │   ├── App.tsx
│   └── components/     │   └── components/      │   └── components/
└── package.json        ├── src2/ (editable)     └── package.json
                        │   ├── App.tsx          
                        │   └── components/      (src2 auto-deleted)
                        └── package.json
```

### File Operations

```javascript
// packages/visual-editor/src/services/Src2Manager.ts
export class Src2Manager {
  private src2Path = './packages/mobile/src2';
  private srcPath = './packages/mobile/src';

  async initializeEditingEnvironment() {
    // 1. Backup check - ensure src2 doesn't exist
    if (await fs.pathExists(this.src2Path)) {
      throw new Error('src2 already exists. Close other editor instances.');
    }

    // 2. Copy src to src2
    await fs.copy(this.srcPath, this.src2Path);
    
    // 3. Set up file watcher for real-time updates
    this.setupFileWatcher();
    
    // 4. Configure cleanup on exit
    this.setupCleanup();
    
    console.log('✅ Editing environment initialized');
    return this.src2Path;
  }

  setupFileWatcher() {
    this.watcher = chokidar.watch(this.src2Path, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.watcher.on('change', (filePath) => {
      // Notify all environments of changes
      this.notifyFileChange(filePath);
    });
  }

  async promoteSrc2ToSrc() {
    // When editing is complete, replace src with src2
    await fs.remove(this.srcPath);
    await fs.move(this.src2Path, this.srcPath);
    console.log('✅ Changes promoted to src');
  }

  async cleanup() {
    this.watcher?.close();
    await fs.remove(this.src2Path);
    console.log('🧹 Editing environment cleaned up');
  }
}
```

## Real-time Update System

### Instant Updates Across All Environments

When a file is modified in `src2` (via visual editor or AI), changes are **automatically reflected** in all environments **without manual bundling**:

#### Update Flow Architecture
```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Visual Editor     │    │    File System       │    │   All Environments  │
│                     │    │                      │    │                     │
│ ┌─ Component Edit   │    │ ┌─ Write to src2/    │    │ ┌─ Visual Editor    │
│ ├─ Style Change    ─┼───▶│ ├─ File.tsx          ├───▶│ ├─ Web Preview      │
│ ├─ AI Modification  │    │ ├─ Trigger Watcher   │    │ ├─ Mobile App       │
│ └─ Drag & Drop      │    │ └─ Socket.IO Emit    │    │ └─ Metro Dev Server │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
      (Instant UI)              (Physical File)            (Auto HMR/Reload)
```

### 1. Visual Editor - Instant Updates ⚡

```javascript
// packages/visual-editor/src/services/LiveRenderer.ts
export class LiveRenderer {
  async updateComponent(filePath: string, newContent: string) {
    // 1. Write to physical src2 file
    await this.writeToSrc2(filePath, newContent);
    
    // 2. Transform RN → RN Web for instant preview
    const webCode = await this.transformForWeb(newContent);
    
    // 3. Update module cache (instant)
    this.moduleCache.set(filePath, webCode);
    
    // 4. Trigger component re-render (instant)
    this.phoneFrame.updateComponent(filePath, webCode);
    
    console.log(`⚡ Visual Editor updated instantly: ${filePath}`);
  }

  transformForWeb(rnCode: string) {
    return babel.transform(rnCode, {
      presets: ['@babel/preset-react'],
      plugins: ['react-native-web/babel']
    }).code;
  }
}
```

### 2. Web Preview - Auto Reload 🔄

```javascript
// packages/web/src/components/MobileAppRenderer.tsx
export const MobileAppRenderer = () => {
  const [bundleKey, setBundleKey] = useState(Date.now());

  useEffect(() => {
    // Connect to server for file change notifications
    const socket = io('http://localhost:3001');
    
    socket.on('file_changed', (data) => {
      console.log(`🔄 Web Preview reloading: ${data.filePath}`);
      
      // Force iframe reload with new bundle
      setBundleKey(Date.now());
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="mobile-preview">
      <iframe 
        key={bundleKey}
        src={`http://localhost:8081/index.bundle?platform=web&dev=true&entry=src2/App.tsx&t=${bundleKey}`}
        width="375" 
        height="667"
        title="Mobile App Preview"
      />
    </div>
  );
};
```

### 3. Mobile App - Fast Refresh 📱

```javascript
// packages/mobile/App.tsx
import { registerRootComponent } from 'expo';

// Smart switching between src and src2
const isDevelopment = __DEV__;
const useVisualEditor = process.env.EXPO_USE_SRC2 === 'true';

let AppComponent;

if (useVisualEditor && isDevelopment) {
  // Load from src2 - Fast Refresh will auto-update
  AppComponent = require('./src2/App').default;
  console.log('📱 Mobile app using src2 with Fast Refresh');
} else {
  // Production - load from src
  AppComponent = require('./src/App').default;
}

registerRootComponent(AppComponent);
```

### 4. Metro Configuration for Dual Directory Support

```javascript
// packages/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch both src and src2
config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'src2'),
];

// Dynamic resolver based on environment
if (process.env.EXPO_USE_SRC2 === 'true') {
  config.resolver.alias = {
    // Redirect imports from src to src2
    './src': './src2',
  };
  
  console.log('Metro configured for src2 editing mode');
}

// Enable Fast Refresh for src2
config.transformer.enableBabelRCLookup = true;
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Log file requests for debugging
    if (req.url.includes('src2')) {
      console.log(`📦 Metro serving: ${req.url}`);
    }
    return middleware(req, res, next);
  };
};

module.exports = config;
```

### 5. Server-Side File Watcher

```javascript
// packages/server/src/services/FileWatcher.js
const chokidar = require('chokidar');
const { Server } = require('socket.io');

class FileWatcher {
  constructor(io) {
    this.io = io;
    this.setupSrc2Watcher();
  }

  setupSrc2Watcher() {
    const src2Path = path.resolve(__dirname, '../../mobile/src2');
    
    this.watcher = chokidar.watch(src2Path, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', (filePath) => {
      const relativePath = path.relative(src2Path, filePath);
      console.log(`📝 src2 file changed: ${relativePath}`);
      
      // Broadcast to all connected clients
      this.io.emit('file_changed', {
        filePath: relativePath,
        fullPath: filePath,
        timestamp: Date.now(),
        source: 'file_system'
      });
      
      // Trigger Metro reload
      this.notifyMetroDevServer(filePath);
    });

    console.log(`👀 Watching src2 directory: ${src2Path}`);
  }

  notifyMetroDevServer(filePath) {
    // Send HMR signal to Metro
    fetch('http://localhost:8081/onchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changed: [filePath],
        type: 'file_changed'
      })
    }).catch(err => {
      console.warn('Could not notify Metro dev server:', err.message);
    });
  }
}

module.exports = FileWatcher;
```

### Development Workflow

```bash
# Start all services with src2 support
npm run dev

# Individual services:
npm run dev:server    # Port 3001 - File watcher + APIs
npm run dev:web       # Port 3000 - Web preview with iframe
npm run dev:editor    # Port 3002 - Visual editor
npm run dev:mobile    # Expo - Mobile app with Fast Refresh

# Environment variables for src2 mode:
EXPO_USE_SRC2=true npm run dev:mobile
```

### Update Summary

**✅ All environments update automatically without bundling:**

| Environment | Update Method | Speed | Bundling Required |
|-------------|---------------|-------|-------------------|
| **Visual Editor** | React Native Web HMR | Instant ⚡ | No |
| **Web Preview** | Metro dev server reload | Instant ⚡ | No |
| **Mobile App** | Expo Fast Refresh | Instant ⚡ | No |
| **Production Deploy** | Bundle generation | ~30s | Yes |

The magic happens because all environments in **development mode** use file watchers and hot module replacement. Only production mobile deployment requires bundling src2.

## Requirements

### Functional Requirements

#### 1. Visual Component Editing
- [ ] Click-to-select components in phone preview
- [ ] Drag-and-drop component positioning
- [ ] Real-time style property editing
- [ ] Component props modification
- [ ] Visual hierarchy tree navigation

#### 2. Component Library
- [ ] Drag-and-drop component palette
- [ ] Categorized component library (Layout, Input, Display, Lists)
- [ ] Custom component creation and reuse
- [ ] Smart component suggestions based on context

#### 3. Code Synchronization
- [ ] **Physical src2 directory** creation and management
- [ ] **Real-time file watching** with Chokidar
- [ ] AST-based code generation
- [ ] StyleSheet.create() updates
- [ ] Import/export management
- [ ] **Smart src/src2 switching** in mobile app

#### 4. AI Integration
- [ ] LLM-powered component generation
- [ ] Natural language component modifications
- [ ] Context-aware code suggestions
- [ ] Automated refactoring assistance

#### 5. Live Preview & Real-time Updates
- [ ] React Native Web rendering in phone frame
- [ ] **Instant updates** across all environments without bundling
- [ ] Hot module replacement for visual editor
- [ ] **Metro dev server integration** for web preview auto-reload
- [ ] **Expo Fast Refresh** for mobile app instant updates
- [ ] Cross-platform preview (iOS/Android)

#### 6. File System Management
- [ ] **Physical src2 directory** creation and management
- [ ] **Real-time file watching** with Chokidar
- [ ] **Smart src/src2 switching** in mobile app
- [ ] Automatic cleanup on editor close
- [ ] File conflict prevention and resolution

#### 7. Mobile Deployment
- [ ] Bundle generation from src2
- [ ] Over-the-air deployment
- [ ] QR code scanning for mobile loading
- [ ] Version management and rollback

### Technical Requirements

#### Performance
- [ ] Sub-300ms response time for visual changes
- [ ] Debounced file operations (300ms)
- [ ] Efficient AST parsing and generation
- [ ] Memory-optimized component tree handling
- [ ] **Instant HMR** across all environments

#### Compatibility
- [ ] React Native 0.70+
- [ ] TypeScript support
- [ ] Modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices (iOS 13+, Android 8+)
- [ ] **Existing monorepo structure** integration

#### Development Environment
- [ ] Node.js 16+
- [ ] **Metro bundler integration** with dual directory support
- [ ] **Expo CLI support** with src2 switching
- [ ] **Socket.IO** for real-time communication
- [ ] Hot reload capability across all packages

## Core Components

### 1. Live Renderer System
Handles real-time rendering of React Native components in web browser with phone frame UI and instant HMR updates.

### 2. Component Inspector
Provides click-to-select functionality and maps DOM elements to React components using Fiber tree.

### 3. Drag & Drop Manager
Manages component movement, positioning, and library integration with visual guides and snap-to-grid.

### 4. Code Synchronization Engine
Manages physical src2 files with real-time file watching and AST-based code generation.

### 5. AI Integration Layer
Interfaces with LLM APIs for component generation and intelligent modifications.

### 6. File System Manager
Handles src2 directory operations, file watching with Chokidar, and cleanup management.

### 7. Real-time Communication
Socket.IO integration for instant updates across Visual Editor, Web Preview, and Mobile App.

## Implementation Code

### Visual Editor Package Structure

```
packages/visual-editor/
├── package.json
├── webpack.config.js
├── src/
│   ├── App.tsx                    # Main editor application
│   ├── components/
│   │   ├── PhoneFrame.tsx         # Preview with mobile/src2 rendering
│   │   ├── ComponentPalette.tsx   # Drag-drop component library
│   │   ├── PropertiesPanel.tsx    # Component editing panel
│   │   ├── CodeEditor.tsx         # Code view/edit
│   │   └── DeploymentPanel.tsx    # Mobile deployment controls
│   ├── services/
│   │   ├── Src2Manager.ts         # src2 directory management
│   │   ├── LiveRenderer.ts        # React Native Web rendering
│   │   ├── ComponentInspector.ts  # Click-to-select logic
│   │   ├── DragDropManager.ts     # Drag and drop system
│   │   ├── CodeGenerator.ts       # AST manipulation
│   │   ├── AIService.ts           # LLM integration
│   │   └── SocketManager.ts       # Real-time communication
│   ├── utils/
│   │   ├── ComponentLibrary.ts    # RN component templates
│   │   ├── FileHelpers.ts         # File system utilities
│   │   └── StyleHelpers.ts        # Style manipulation
│   └── types/
│       ├── Component.ts           # Component type definitions
│       └── Editor.ts              # Editor type definitions
└── public/
    └── index.html
```

### Core Live Renderer with Instant Updates

```javascript
// packages/visual-editor/src/services/LiveRenderer.ts
import { babel } from '@babel/core';
import { io } from 'socket.io-client';

export class LiveRenderer {
  constructor(containerElement) {
    this.container = containerElement;
    this.moduleCache = new Map();
    this.componentRegistry = new Map();
    this.socket = io('http://localhost:3001');
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('file_changed', (data) => {
      console.log(`🔄 File changed externally: ${data.filePath}`);
      this.reloadModule(data.filePath);
    });
  }

  async updateModule(filePath, newCode) {
    try {
      // 1. Write to physical src2 file
      await this.writeToSrc2(filePath, newCode);
      
      // 2. Transform for web preview (instant)
      const transformedCode = await this.transformCode(newCode);
      
      // 3. Update module cache
      const module = this.createModule(transformedCode, filePath);
      this.moduleCache.set(filePath, module);
      
      // 4. Re-render dependent components (instant)
      this.rerenderDependentComponents(filePath);
      
      console.log(`⚡ Updated ${filePath} instantly`);
    } catch (error) {
      this.showError(error);
    }
  }

  async writeToSrc2(filePath, content) {
    // Write to physical file - triggers file watcher
    const response = await fetch('http://localhost:3001/api/editor/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content })
    });

    if (!response.ok) {
      throw new Error(`Failed to write file: ${response.statusText}`);
    }
  }

  transformCode(code) {
    return babel.transform(code, {
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      plugins: ['react-native-web/babel']
    }).code;
  }

  createModule(code, filePath) {
    const moduleFunction = new Function('require', 'module', 'exports', code);
    const module = { exports: {} };
    const require = this.createRequireFunction(filePath);
    moduleFunction(require, module, module.exports);
    return module.exports;
  }

  rerenderDependentComponents(filePath) {
    const dependents = this.findDependentComponents(filePath);
    dependents.forEach(component => {
      this.rerenderComponent(component);
    });
  }

  triggerHotReload() {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onHotUpdate();
    }
  }
}
```

### Server Extensions for Editor APIs

```javascript
// packages/server/src/routes/editor.js
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

const router = express.Router();

// Initialize editing environment
router.post('/init', async (req, res) => {
  try {
    const srcPath = path.resolve(__dirname, '../../mobile/src');
    const src2Path = path.resolve(__dirname, '../../mobile/src2');
    
    // Check if src2 already exists
    if (await fs.pathExists(src2Path)) {
      return res.status(400).json({ 
        error: 'src2 already exists. Close other editor instances.' 
      });
    }

    // Copy src to src2
    await fs.copy(srcPath, src2Path);

    // Set up file watcher for src2
    const watcher = chokidar.watch(src2Path, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', (filePath) => {
      const relativePath = path.relative(src2Path, filePath);
      console.log(`📝 src2 file changed: ${relativePath}`);
      
      // Notify all connected clients
      req.io.emit('file_changed', {
        filePath: relativePath,
        fullPath: filePath,
        timestamp: Date.now(),
        source: 'file_system'
      });
    });

    // Store watcher for cleanup
    req.app.locals.src2Watcher = watcher;

    res.json({ 
      success: true, 
      message: 'Editing environment initialized',
      src2Path: src2Path
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Write file to src2
router.post('/write', async (req, res) => {
  try {
    const { filePath, content } = req.body;
    const src2Path = path.resolve(__dirname, '../../mobile/src2');
    const fullPath = path.join(src2Path, filePath);
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullPath));
    
    // Write file
    await fs.writeFile(fullPath, content, 'utf8');
    
    res.json({ success: true, path: fullPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read file from src2
router.get('/read/:filePath(*)', async (req, res) => {
  try {
    const filePath = req.params.filePath;
    const src2Path = path.resolve(__dirname, '../../mobile/src2');
    const fullPath = path.join(src2Path, filePath);
    
    const content = await fs.readFile(fullPath, 'utf8');
    res.json({ content, filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deploy to mobile
router.post('/deploy', async (req, res) => {
  try {
    const { method = 'expo' } = req.body;
    const src2Path = path.resolve(__dirname, '../../mobile/src2');
    
    const deploymentManager = new MobileDeploymentManager();
    const result = await deploymentManager.deploy(src2Path, method);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cleanup src2
router.post('/cleanup', async (req, res) => {
  try {
    const src2Path = path.resolve(__dirname, '../../mobile/src2');
    
    // Close file watcher
    if (req.app.locals.src2Watcher) {
      req.app.locals.src2Watcher.close();
      delete req.app.locals.src2Watcher;
    }
    
    // Remove src2 directory
    await fs.remove(src2Path);
    
    res.json({ success: true, message: 'Editing environment cleaned up' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Component Inspector System with Real-time Updates

```javascript
// packages/visual-editor/src/services/ComponentInspector.ts
export class ComponentInspector {
  constructor(renderer) {
    this.renderer = renderer;
    this.selectedComponent = null;
    this.overlay = this.createOverlay();
    this.fiberInspector = new FiberInspector();
    this.setupSocketListener();
  }

  setupSocketListener() {
    this.renderer.socket.on('file_changed', (data) => {
      // Update inspector when files change externally
      if (this.selectedComponent?.filePath === data.filePath) {
        this.refreshSelectedComponent();
      }
    });
  }

  enableInspection() {
    this.renderer.container.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const component = this.getComponentFromElement(e.target);
      this.selectComponent(component);
    });
  }

  getComponentFromElement(element) {
    const fiber = this.fiberInspector.getFiberFromElement(element);
    if (!fiber) return null;

    return {
      fiber,
      filePath: this.getComponentFilePath(fiber),
      props: fiber.memoizedProps,
      state: fiber.memoizedState,
      element: element,
      componentName: this.getComponentName(fiber),
      path: this.getComponentPath(fiber)
    };
  }

  selectComponent(component) {
    this.selectedComponent = component;
    this.highlightComponent(component.element);
    this.showPropertiesPanel(component);
    this.showCodePanel(component);
    this.emit('component_selected', component);
  }

  async updateComponentStyle(styleChanges) {
    if (!this.selectedComponent) return;

    const { filePath } = this.selectedComponent;
    
    // Update component instantly in visual editor
    this.applyStyleChangesInstantly(styleChanges);
    
    // Update the actual file
    await this.updateComponentFile(filePath, styleChanges);
  }

  applyStyleChangesInstantly(styleChanges) {
    // Apply changes to DOM immediately for instant feedback
    const element = this.selectedComponent.element;
    Object.assign(element.style, styleChanges);
  }

  async updateComponentFile(filePath, styleChanges) {
    try {
      // Read current file content
      const response = await fetch(`http://localhost:3001/api/editor/read/${filePath}`);
      const { content } = await response.json();
      
      // Parse and update AST
      const updatedCode = await this.updateStyleInCode(content, styleChanges);
      
      // Write back to src2 (triggers all environment updates)
      await this.renderer.writeToSrc2(filePath, updatedCode);
      
      console.log(`📝 Updated ${filePath} with style changes`);
    } catch (error) {
      console.error('Failed to update component file:', error);
    }
  }

  highlightComponent(element) {
    this.clearHighlights();
    
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.className = 'component-highlight';
    highlight.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid #007AFF;
      background: rgba(0, 122, 255, 0.1);
      pointer-events: none;
      z-index: 9999;
      border-radius: 4px;
    `;
    document.body.appendChild(highlight);
  }

  getComponentFilePath(fiber) {
    let current = fiber;
    while (current) {
      if (current.type && current.type.__source) {
        return current.type.__source.fileName.replace('../mobile/src/', '');
      }
      if (current._debugSource) {
        return current._debugSource.fileName.replace('../mobile/src/', '');
      }
      current = current.return;
    }
    return 'unknown';
  }
}

// React Fiber integration for component mapping
class FiberInspector {
  getFiberFromElement(element) {
    const key = Object.keys(element).find(key => 
      key.startsWith('__reactInternalInstance') || 
      key.startsWith('__reactFiber')
    );
    return element[key];
  }

  getComponentInfo(fiber) {
    let current = fiber;
    
    while (current) {
      if (current.type && typeof current.type !== 'string') {
        return {
          name: current.type.name || current.type.displayName,
          fiber: current,
          props: current.memoizedProps,
          state: current.memoizedState,
          filePath: this.getSourceLocation(current.type)
        };
      }
      current = current.return;
    }
    return null;
  }

  getSourceLocation(componentType) {
    return componentType.__source?.fileName || 'unknown';
  }
}
```

### Advanced Drag & Drop System with Visual Guides

```javascript
// packages/visual-editor/src/services/DragDropManager.ts
export class AdvancedDragDrop {
  constructor(editor) {
    this.editor = editor;
    this.dragState = {
      isDragging: false,
      draggedComponent: null,
      dropZones: [],
      insertionPoint: null
    };
    this.guides = { horizontal: [], vertical: [] };
  }

  handleComponentDrag(component, event) {
    this.dragState.isDragging = true;
    this.dragState.draggedComponent = component;
    
    this.showDropZones();
    this.addPositionGuides();
    this.trackMouseMovement(event);
  }

  async handleDrop(dropTarget, insertionPoint) {
    if (!this.dragState.draggedComponent || !dropTarget) return;

    const { draggedComponent } = this.dragState;
    
    // Update component tree structure
    const newTree = this.updateComponentTree(draggedComponent, dropTarget, insertionPoint);
    
    // Update visual editor instantly
    this.updateVisualTree(newTree);
    
    // Update src2 files
    await this.updateSourceFiles(newTree);
    
    // Clean up drag state
    this.cleanupDragState();
  }

  async updateSourceFiles(newTree) {
    // Determine which files need updating
    const affectedFiles = this.getAffectedFiles(newTree);
    
    for (const filePath of affectedFiles) {
      const updatedCode = await this.generateCodeForFile(filePath, newTree);
      await this.editor.renderer.writeToSrc2(filePath, updatedCode);
    }
  }

  showDropZones() {
    const containers = this.findValidContainers();
    
    containers.forEach(container => {
      const dropZone = this.createDropZone(container);
      this.dragState.dropZones.push(dropZone);
    });
  }

  createDropZone(container) {
    return {
      element: container,
      type: this.getContainerType(container),
      accepts: this.getAcceptedComponents(container),
      insertionPoints: this.calculateInsertionPoints(container)
    };
  }

  calculateInsertionPoints(container) {
    const children = Array.from(container.children);
    const points = [];
    
    children.forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      
      points.push({
        index: index,
        position: 'before',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: 4
      });
      
      if (index === children.length - 1) {
        points.push({
          index: index + 1,
          position: 'after',
          x: rect.left,
          y: rect.bottom,
          width: rect.width,
          height: 4
        });
      }
    });
    
    return points;
  }

  showAlignmentGuides(draggedElement) {
    const allElements = this.getAllVisibleElements();
    const draggedRect = draggedElement.getBoundingClientRect();
    
    this.guides.horizontal = [];
    this.guides.vertical = [];
    
    allElements.forEach(element => {
      if (element === draggedElement) return;
      
      const rect = element.getBoundingClientRect();
      
      // Vertical alignment guides
      if (Math.abs(rect.left - draggedRect.left) < 10) {
        this.guides.vertical.push({ x: rect.left, type: 'left' });
      }
      if (Math.abs(rect.right - draggedRect.right) < 10) {
        this.guides.vertical.push({ x: rect.right, type: 'right' });
      }
      
      // Horizontal alignment guides  
      if (Math.abs(rect.top - draggedRect.top) < 10) {
        this.guides.horizontal.push({ y: rect.top, type: 'top' });
      }
      if (Math.abs(rect.bottom - draggedRect.bottom) < 10) {
        this.guides.horizontal.push({ y: rect.bottom, type: 'bottom' });
      }
    });
    
    this.renderGuides();
  }

  renderGuides() {
    this.clearGuides();
    
    this.guides.vertical.forEach(guide => {
      const line = document.createElement('div');
      line.className = 'alignment-guide vertical';
      line.style.cssText = `
        position: fixed;
        left: ${guide.x}px;
        top: 0;
        bottom: 0;
        width: 1px;
        background: #007AFF;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(line);
    });

    this.guides.horizontal.forEach(guide => {
      const line = document.createElement('div');
      line.className = 'alignment-guide horizontal';
      line.style.cssText = `
        position: fixed;
        top: ${guide.y}px;
        left: 0;
        right: 0;
        height: 1px;
        background: #007AFF;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(line);
    });
  }

  clearGuides() {
    document.querySelectorAll('.alignment-guide').forEach(guide => {
      guide.remove();
    });
  }

  cleanupDragState() {
    this.dragState = {
      isDragging: false,
      draggedComponent: null,
      dropZones: [],
      insertionPoint: null
    };
    this.clearGuides();
    this.clearDropZones();
  }
}
```

### AI Integration with Real-time Code Updates

```javascript
// packages/visual-editor/src/services/AIService.ts
export class AIService {
  constructor(apiKey, baseURL) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.contextBuilder = new ContextBuilder();
  }

  async generateComponent(prompt, context = {}) {
    const fullContext = await this.contextBuilder.buildContext(context);
    
    const systemPrompt = `You are an expert React Native developer. Generate clean, functional React Native components based on user prompts.

Context:
${fullContext}

Requirements:
- Use TypeScript
- Follow React Native best practices
- Include proper props interfaces
- Use StyleSheet.create for styles
- Make components reusable and well-structured
- Include proper imports

Return only the component code, no explanations.`;

    const response = await this.callLLM(systemPrompt, prompt);
    const result = this.parseComponentResponse(response);
    
    // Create new file in src2
    await this.createComponentFile(result);
    
    return result;
  }

  async modifyComponent(existingCode, modifications, filePath) {
    const systemPrompt = `You are an expert React Native developer. Modify the given React Native component based on the user's instructions.

Existing Component:
\`\`\`typescript
${existingCode}
\`\`\`

Requirements:
- Maintain existing functionality unless explicitly asked to change
- Keep the same component structure and props interface unless modifications require changes
- Use TypeScript
- Follow React Native best practices
- Preserve existing imports and add new ones as needed

Return only the modified component code, no explanations.`;

    const response = await this.callLLM(systemPrompt, modifications);
    const result = this.parseComponentResponse(response);
    
    // Update existing file in src2 (triggers all environment updates)
    await this.updateComponentFile(filePath, result.code);
    
    return result;
  }

  async createComponentFile(componentResult) {
    const { code, metadata } = componentResult;
    const fileName = `${metadata.name}.tsx`;
    const filePath = `components/${fileName}`;
    
    // Write to src2 - triggers automatic updates everywhere
    const response = await fetch('http://localhost:3001/api/editor/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content: code })
    });

    if (!response.ok) {
      throw new Error('Failed to create component file');
    }

    console.log(`🤖 AI created new component: ${filePath}`);
    return { filePath, code, metadata };
  }

  async updateComponentFile(filePath, newCode) {
    // Write to src2 file - all environments update automatically
    const response = await fetch('http://localhost:3001/api/editor/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content: newCode })
    });

    if (!response.ok) {
      throw new Error('Failed to update component file');
    }

    console.log(`🤖 AI updated component: ${filePath}`);
  }

  async callLLM(systemPrompt, userPrompt) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  parseComponentResponse(response) {
    const codeMatch = response.match(/```(?:typescript|tsx|javascript|jsx)?\n([\s\S]*?)\n```/);
    const code = codeMatch ? codeMatch[1] : response;
    
    return {
      code: code.trim(),
      metadata: this.extractComponentMetadata(code)
    };
  }

  extractComponentMetadata(code) {
    const nameMatch = code.match(/(?:const|function|class)\s+(\w+)/);
    const propsMatch = code.match(/interface\s+(\w+Props)/);
    
    return {
      name: nameMatch ? nameMatch[1] : 'UnnamedComponent',
      propsInterface: propsMatch ? propsMatch[1] : null,
      hasStyles: code.includes('StyleSheet.create'),
      imports: this.extractImports(code)
    };
  }

  extractImports(code) {
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }
}
```

### Mobile Deployment with src2 Support

```javascript
// packages/visual-editor/src/services/MobileDeploymentManager.ts
export class MobileDeploymentManager {
  constructor(config) {
    this.config = config;
    this.deploymentHistory = [];
  }

  async deployToMobile(options = {}) {
    try {
      console.log('🚀 Starting mobile deployment from src2...');
      
      const src2Path = path.resolve(__dirname, '../../../mobile/src2');
      
      // Step 1: Validate src2 directory
      await this.validateSrc2Directory(src2Path);
      
      // Step 2: Generate bundle from src2
      const bundleResult = await this.generateBundleFromSrc2(src2Path, options);
      
      // Step 3: Deploy via chosen method
      const deploymentResult = await this.deploy(bundleResult, options.method || 'expo');
      
      // Step 4: Generate QR code for mobile access
      const qrCode = await this.generateQRCode(deploymentResult.url);
      
      // Step 5: Record deployment
      this.recordDeployment(deploymentResult);
      
      console.log('✅ Mobile deployment successful!');
      return {
        success: true,
        url: deploymentResult.url,
        qrCode: qrCode,
        bundleSize: bundleResult.size,
        deploymentId: deploymentResult.id,
        source: 'src2'
      };
      
    } catch (error) {
      console.error('❌ Mobile deployment failed:', error);
      throw error;
    }
  }

  async validateSrc2Directory(src2Path) {
    // Check if src2 exists
    if (!await fs.pathExists(src2Path)) {
      throw new Error('src2 directory not found. Initialize visual editor first.');
    }

    // Check if required files exist in src2
    const requiredFiles = ['App.tsx', 'index.js'];
    
    for (const file of requiredFiles) {
      const filePath = path.join(src2Path, file);
      if (!await fs.pathExists(filePath)) {
        throw new Error(`Required file missing in src2: ${file}`);
      }
    }
  }

  async generateBundleFromSrc2(src2Path, options) {
    const bundleConfig = {
      entry: path.join(src2Path, 'App.tsx'),
      platform: options.platform || 'ios',
      dev: false,
      minify: true,
      outputDir: path.join(src2Path, '../dist'),
      sourceDir: src2Path
    };
    
    // Use Metro to bundle src2
    const bundleResult = await this.bundleWithMetro(bundleConfig);
    
    return {
      bundlePath: bundleResult.bundlePath,
      sourcemapPath: bundleResult.sourcemapPath,
      assets: bundleResult.assets,
      size: bundleResult.size
    };
  }

  async bundleWithMetro(config) {
    // Configure Metro to use src2 as source
    const metroConfig = {
      projectRoot: path.dirname(config.sourceDir),
      watchFolders: [config.sourceDir],
      resolver: {
        alias: {
          // Ensure imports resolve to src2
          '../src': config.sourceDir,
          './src': config.sourceDir
        }
      }
    };

    const Metro = require('metro');
    const bundleResult = await Metro.runBuild(metroConfig, {
      entry: config.entry,
      platform: config.platform,
      dev: config.dev,
      minify: config.minify,
      out: config.outputDir
    });
    
    return {
      bundlePath: path.join(config.outputDir, 'index.bundle'),
      sourcemapPath: path.join(config.outputDir, 'index.map'),
      assets: bundleResult.assets,
      size: bundleResult.size
    };
  }

  async deployViaExpo(bundleResult) {
    const formData = new FormData();
    formData.append('bundle', fs.createReadStream(bundleResult.bundlePath));
    formData.append('manifest', JSON.stringify({
      name: 'Visual Editor App',
      version: '1.0.0',
      platform: 'universal',
      source: 'src2'
    }));
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.expo.accessToken}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    return {
      id: result.id,
      url: result.url,
      method: 'expo'
    };
  }

  async generateQRCode(url) {
    const QRCode = require('qrcode');
    return await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  recordDeployment(deploymentResult) {
    this.deploymentHistory.push({
      ...deploymentResult,
      timestamp: Date.now(),
      status: 'active'
    });
    
    // Keep only last 10 deployments
    if (this.deploymentHistory.length > 10) {
      this.deploymentHistory.shift();
    }
  }
}
```

## Integration Guide

### 1. **Project Setup**

```bash
# Add visual editor to existing monorepo
cd your-existing-repo

# Create visual editor package
mkdir -p packages/visual-editor
cd packages/visual-editor

# Initialize package
npm init -y

# Install dependencies
npm install react react-dom react-native-web
npm install @babel/core @babel/generator @babel/parser @babel/traverse
npm install socket.io-client chokidar
npm install openai # for AI integration

# Install development dependencies
npm install -D @types/react @types/react-dom
npm install -D typescript webpack webpack-dev-server
npm install -D @babel/preset-react @babel/preset-typescript
```

### 2. **Server Integration**

```javascript
// packages/server/src/index.js - Add to existing server
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const editorRoutes = require('./routes/editor');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST"]
  }
});

// Add editor routes
app.use('/api/editor', editorRoutes);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

server.listen(3001, () => {
  console.log('🚀 Server with Visual Editor support running on port 3001');
});
```

### 3. **Mobile App Configuration**

```javascript
// packages/mobile/App.tsx - Smart src/src2 switching
import { registerRootComponent } from 'expo';

const isDevelopment = __DEV__;
const useVisualEditor = process.env.EXPO_USE_SRC2 === 'true';

let AppComponent;

if (useVisualEditor && isDevelopment) {
  // Visual editor mode - load from src2
  AppComponent = require('./src2/App').default;
  console.log('📱 Mobile app using src2 with Fast Refresh');
} else {
  // Normal mode - load from src
  AppComponent = require('./src/App').default;
  console.log('📱 Mobile app using src');
}

// Enable Fast Refresh for both modes
if (isDevelopment && module.hot) {
  module.hot.accept();
}

registerRootComponent(AppComponent);
```

### 4. **Metro Configuration Update**

```javascript
// packages/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch both src and src2 directories
config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'src2'),
];

// Dynamic resolver based on environment
if (process.env.EXPO_USE_SRC2 === 'true') {
  config.resolver.alias = {
    './src': './src2',
  };
  
  console.log('📦 Metro configured for src2 editing mode');
}

// Enhanced middleware for debugging
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    if (req.url.includes('src2')) {
      console.log(`📦 Metro serving from src2: ${req.url}`);
    }
    return middleware(req, res, next);
  };
};

module.exports = config;
```

### 5. **Development Workflow Scripts**

```json
// Root package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:web\" \"npm run dev:editor\" \"npm run dev:mobile\"",
    "dev:server": "cd packages/server && npm run dev",
    "dev:web": "