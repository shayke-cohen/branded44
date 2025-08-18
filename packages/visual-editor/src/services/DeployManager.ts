import { EditorState } from '../contexts/EditorContext';

export interface BuildProgress {
  step: string;
  progress: number; // 0-100
  status: 'pending' | 'building' | 'success' | 'error';
  message: string;
  timestamp: number;
}

export interface DeployResult {
  success: boolean;
  webBundle?: {
    success: boolean;
    size?: number;
    path?: string;
    error?: string;
  };
  mobileBundle?: {
    android?: {
      success: boolean;
      size?: number;
      path?: string;
      error?: string;
    };
    ios?: {
      success: boolean;
      size?: number;
      path?: string;
      error?: string;
    };
  };
  totalTime: number;
  buildId: string;
}

export class DeployManager {
  private serverUrl = 'http://localhost:3001';
  private progressListeners: ((progress: BuildProgress) => void)[] = [];
  private deployListeners: ((result: DeployResult) => void)[] = [];

  /**
   * Add progress listener
   */
  onProgress(listener: (progress: BuildProgress) => void): () => void {
    this.progressListeners.push(listener);
    return () => {
      const index = this.progressListeners.indexOf(listener);
      if (index > -1) {
        this.progressListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add deploy complete listener
   */
  onDeploy(listener: (result: DeployResult) => void): () => void {
    this.deployListeners.push(listener);
    return () => {
      const index = this.deployListeners.indexOf(listener);
      if (index > -1) {
        this.deployListeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit progress update
   */
  private emitProgress(progress: BuildProgress): void {
    this.progressListeners.forEach(listener => listener(progress));
  }

  /**
   * Emit deploy result
   */
  private emitDeploy(result: DeployResult): void {
    this.deployListeners.forEach(listener => listener(result));
  }

  /**
   * Deploy session - build both web and mobile bundles
   */
  async deploySession(sessionId: string, options: {
    buildWeb?: boolean;
    buildMobile?: boolean;
    platforms?: ('android' | 'ios')[];
    forceRebuild?: boolean;
  } = {}): Promise<DeployResult> {
    
    const buildId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const startTime = Date.now();
    
    const {
      buildWeb = true,
      buildMobile = true,
      platforms = ['android', 'ios'],
      forceRebuild = false
    } = options;

    console.log(`🚀 [DeployManager] Starting deployment: ${buildId}`);
    console.log(`🚀 [DeployManager] Session: ${sessionId}`);
    console.log(`🚀 [DeployManager] Options:`, { buildWeb, buildMobile, platforms, forceRebuild });

    const result: DeployResult = {
      success: false,
      totalTime: 0,
      buildId
    };

    try {
      // Step 1: Initialize
      this.emitProgress({
        step: 'Initializing',
        progress: 0,
        status: 'building',
        message: 'Starting deployment...',
        timestamp: Date.now()
      });

      let currentProgress = 10;
      const totalSteps = (buildWeb ? 1 : 0) + (buildMobile ? platforms.length : 0);
      const stepIncrement = 80 / totalSteps; // 80% for builds, 10% init, 10% finalize

      // Step 2: Build web bundle
      if (buildWeb) {
        this.emitProgress({
          step: 'Web Bundle',
          progress: currentProgress,
          status: 'building',
          message: 'Building web bundle...',
          timestamp: Date.now()
        });

        try {
          result.webBundle = await this.buildWebBundle(sessionId, forceRebuild);
          currentProgress += stepIncrement;
          
          this.emitProgress({
            step: 'Web Bundle',
            progress: currentProgress,
            status: result.webBundle.success ? 'success' : 'error',
            message: result.webBundle.success ? 
              `Web bundle built (${result.webBundle.size} bytes)` : 
              `Web bundle failed: ${result.webBundle.error}`,
            timestamp: Date.now()
          });
        } catch (error) {
          result.webBundle = {
            success: false,
            error: error.message
          };
          
          this.emitProgress({
            step: 'Web Bundle',
            progress: currentProgress,
            status: 'error',
            message: `Web bundle failed: ${error.message}`,
            timestamp: Date.now()
          });
        }
      }

      // Step 3: Build mobile bundles
      if (buildMobile) {
        result.mobileBundle = {};
        
        for (const platform of platforms) {
          this.emitProgress({
            step: `Mobile (${platform})`,
            progress: currentProgress,
            status: 'building',
            message: `Building ${platform} bundle...`,
            timestamp: Date.now()
          });

          try {
            const mobileBuild = await this.buildMobileBundle(sessionId, platform, forceRebuild);
            result.mobileBundle[platform] = mobileBuild;
            currentProgress += stepIncrement;
            
            this.emitProgress({
              step: `Mobile (${platform})`,
              progress: currentProgress,
              status: mobileBuild.success ? 'success' : 'error',
              message: mobileBuild.success ? 
                `${platform} bundle built (${mobileBuild.size} bytes)` : 
                `${platform} bundle failed: ${mobileBuild.error}`,
              timestamp: Date.now()
            });
          } catch (error) {
            result.mobileBundle[platform] = {
              success: false,
              error: error.message
            };
            
            this.emitProgress({
              step: `Mobile (${platform})`,
              progress: currentProgress,
              status: 'error',
              message: `${platform} bundle failed: ${error.message}`,
              timestamp: Date.now()
            });
          }
        }
      }

      // Step 4: Finalize
      result.totalTime = Date.now() - startTime;
      result.success = this.calculateOverallSuccess(result);

      this.emitProgress({
        step: 'Complete',
        progress: 100,
        status: result.success ? 'success' : 'error',
        message: result.success ? 
          `Deployment completed in ${result.totalTime}ms` : 
          'Deployment completed with errors',
        timestamp: Date.now()
      });

      console.log(`✅ [DeployManager] Deployment ${result.success ? 'completed' : 'failed'}: ${buildId}`);
      
      this.emitDeploy(result);
      return result;

    } catch (error) {
      console.error(`❌ [DeployManager] Deployment failed: ${buildId}`, error);
      
      result.totalTime = Date.now() - startTime;
      result.success = false;
      
      this.emitProgress({
        step: 'Error',
        progress: 100,
        status: 'error',
        message: `Deployment failed: ${error.message}`,
        timestamp: Date.now()
      });

      this.emitDeploy(result);
      return result;
    }
  }

  /**
   * Build web bundle using existing SessionBuilder
   */
  private async buildWebBundle(sessionId: string, forceRebuild: boolean = false): Promise<{
    success: boolean;
    size?: number;
    path?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.serverUrl}/api/editor/session/${sessionId}/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forceRebuild
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return {
        success: true,
        size: result.buildResult?.stats?.assets?.[0]?.size || 0,
        path: result.buildResult?.compiledAppPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build mobile bundle using SessionMobileBundleBuilder
   */
  private async buildMobileBundle(sessionId: string, platform: 'android' | 'ios', forceRebuild: boolean = false): Promise<{
    success: boolean;
    size?: number;
    path?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.serverUrl}/api/editor/session/${sessionId}/build-mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          dev: true,
          minify: false,
          forceRebuild
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return {
        success: true,
        size: result.result?.stats?.bundleSize || 0,
        path: result.result?.bundleUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate overall deployment success
   */
  private calculateOverallSuccess(result: DeployResult): boolean {
    let hasSuccess = false;
    let hasFailure = false;

    // Check web bundle
    if (result.webBundle) {
      if (result.webBundle.success) {
        hasSuccess = true;
      } else {
        hasFailure = true;
      }
    }

    // Check mobile bundles
    if (result.mobileBundle) {
      Object.values(result.mobileBundle).forEach(platformResult => {
        if (platformResult.success) {
          hasSuccess = true;
        } else {
          hasFailure = true;
        }
      });
    }

    // Success if at least one build succeeded and no critical failures
    return hasSuccess && !hasFailure;
  }

  /**
   * Quick deploy - build both web and mobile for current session
   */
  async quickDeploy(sessionId: string): Promise<DeployResult> {
    return this.deploySession(sessionId, {
      buildWeb: true,
      buildMobile: true,
      platforms: ['android', 'ios']
    });
  }
}

// Singleton instance
export const deployManager = new DeployManager();
