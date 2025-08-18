import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { deployManager, BuildProgress, DeployResult } from '../../services/DeployManager';

const DeployModal = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeployCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 500px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const DeployHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const DeployTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const ProgressContainer = styled.div`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled.div<{ $progress: number; $status: string }>`
  height: 100%;
  background: ${props => 
    props.$status === 'error' ? '#ef4444' :
    props.$status === 'success' ? '#10b981' :
    '#3b82f6'
  };
  width: ${props => props.$progress}%;
  transition: width 0.3s ease, background 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
`;

const StepList = styled.div`
  margin-bottom: 20px;
`;

const StepItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
  
  .icon {
    width: 20px;
    text-align: center;
  }
  
  .step-name {
    font-weight: 500;
    color: ${props => 
      props.$status === 'error' ? '#ef4444' :
      props.$status === 'success' ? '#10b981' :
      props.$status === 'building' ? '#3b82f6' :
      '#999'
    };
  }
  
  .step-message {
    color: #666;
    font-size: 13px;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 20px;
`;

const ResultItem = styled.div<{ $success: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${props => props.$success ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.$success ? '#bbf7d0' : '#fecaca'};
  border-radius: 8px;
  margin-bottom: 8px;
  
  .result-name {
    font-weight: 500;
    color: ${props => props.$success ? '#065f46' : '#991b1b'};
  }
  
  .result-size {
    font-size: 12px;
    color: ${props => props.$success ? '#047857' : '#b91c1c'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    border: none;
    
    &:hover {
      background: #2563eb;
    }
    
    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  ` : `
    background: #f9fafb;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f3f4f6;
    }
  `}
`;

interface DeployProgressProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string | null;
}

export const DeployProgress: React.FC<DeployProgressProps> = ({
  visible,
  onClose,
  sessionId
}) => {
  const [progress, setProgress] = useState<BuildProgress[]>([]);
  const [result, setResult] = useState<DeployResult | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    const unsubscribeProgress = deployManager.onProgress((newProgress) => {
      setProgress(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(p => p.step === newProgress.step);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = newProgress;
        } else {
          updated.push(newProgress);
        }
        
        return updated;
      });
    });

    const unsubscribeResult = deployManager.onDeploy((deployResult) => {
      setResult(deployResult);
      setIsDeploying(false);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeResult();
    };
  }, []);

  const handleDeploy = async () => {
    if (!sessionId) return;
    
    setIsDeploying(true);
    setProgress([]);
    setResult(null);
    
    try {
      // If this is a redeploy (result exists), force rebuild
      const forceRebuild = !!result;
      if (forceRebuild) {
        console.log('🔄 [DeployProgress] Force redeploying session:', sessionId);
        await deployManager.deploySession(sessionId, {
          buildWeb: true,
          buildMobile: true,
          platforms: ['android', 'ios'],
          forceRebuild: true
        });
      } else {
        await deployManager.quickDeploy(sessionId);
      }
    } catch (error) {
      console.error('Deploy failed:', error);
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    if (!isDeploying) {
      onClose();
    }
  };

  const getOverallProgress = () => {
    if (progress.length === 0) return 0;
    return Math.max(...progress.map(p => p.progress));
  };

  const getOverallStatus = () => {
    if (result) {
      return result.success ? 'success' : 'error';
    }
    if (isDeploying) {
      return 'building';
    }
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'building': return '⏳';
      default: return '⚪';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <DeployModal $visible={visible}>
      <DeployCard>
        <DeployHeader>
          <DeployTitle>
            🚀 Deploy Session
            {sessionId && <span style={{ fontSize: '14px', color: '#666' }}>
              ({sessionId.substring(0, 8)}...)
            </span>}
          </DeployTitle>
          <CloseButton onClick={handleClose} disabled={isDeploying}>
            ×
          </CloseButton>
        </DeployHeader>

        <ProgressContainer>
          <ProgressBar>
            <ProgressFill 
              $progress={getOverallProgress()} 
              $status={getOverallStatus()}
            />
          </ProgressBar>
          <ProgressText>
            <span>
              {isDeploying ? 'Deploying...' : 
               result ? (result.success ? 'Deployment Complete' : 'Deployment Failed') :
               'Ready to Deploy'}
            </span>
            <span>{getOverallProgress()}%</span>
          </ProgressText>
        </ProgressContainer>

        {progress.length > 0 && (
          <StepList>
            {progress.map((step, index) => (
              <StepItem key={index} $status={step.status}>
                <span className="icon">{getStepIcon(step.status)}</span>
                <div style={{ flex: 1 }}>
                  <div className="step-name">{step.step}</div>
                  <div className="step-message">{step.message}</div>
                </div>
              </StepItem>
            ))}
          </StepList>
        )}

        {result && (
          <ResultsContainer>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
              Build Results
            </h4>
            
            {result.webBundle && (
              <ResultItem $success={result.webBundle.success}>
                <div>
                  <div className="result-name">
                    🌐 Web Bundle
                  </div>
                  {result.webBundle.error && (
                    <div style={{ fontSize: '12px', color: '#991b1b' }}>
                      {result.webBundle.error}
                    </div>
                  )}
                </div>
                {result.webBundle.size && (
                  <div className="result-size">
                    {formatBytes(result.webBundle.size)}
                  </div>
                )}
              </ResultItem>
            )}

            {result.mobileBundle && Object.entries(result.mobileBundle).map(([platform, bundle]) => (
              <ResultItem key={platform} $success={bundle.success}>
                <div>
                  <div className="result-name">
                    📱 {platform.charAt(0).toUpperCase() + platform.slice(1)} Bundle
                  </div>
                  {bundle.error && (
                    <div style={{ fontSize: '12px', color: '#991b1b' }}>
                      {bundle.error}
                    </div>
                  )}
                </div>
                {bundle.size && (
                  <div className="result-size">
                    {formatBytes(bundle.size)}
                  </div>
                )}
              </ResultItem>
            ))}
            
            <div style={{ 
              marginTop: '12px', 
              fontSize: '12px', 
              color: '#666', 
              textAlign: 'center' 
            }}>
              Total time: {result.totalTime}ms
            </div>
          </ResultsContainer>
        )}

        <ActionButtons>
          <Button onClick={handleClose} disabled={isDeploying}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button 
              $variant="primary" 
              onClick={handleDeploy}
              disabled={isDeploying || !sessionId}
            >
              {isDeploying ? 'Deploying...' : 'Start Deploy'}
            </Button>
          )}
          {result && !result.success && (
            <Button 
              $variant="primary" 
              onClick={handleDeploy}
              disabled={isDeploying || !sessionId}
            >
              Retry Deploy
            </Button>
          )}
          {result && result.success && (
            <Button 
              $variant="primary" 
              onClick={handleDeploy}
              disabled={isDeploying || !sessionId}
            >
              🔄 Redeploy
            </Button>
          )}
        </ActionButtons>
      </DeployCard>
    </DeployModal>
  );
};

export default DeployProgress;
