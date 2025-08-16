import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-left: 1px solid #e0e0e0;
`;

const PanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.$active ? '#3498db' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#3498db' : '#e9ecef'};
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #666;
`;

const ComponentInfo = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ComponentName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ComponentType = styled.div`
  font-size: 12px;
  color: #666;
`;

const PropertyGroup = styled.div`
  margin-bottom: 24px;
`;

const GroupTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
`;

const FileTree = styled.div`
  font-size: 12px;
`;

const FileItem = styled.div<{ $level: number; selected: boolean }>`
  padding: 8px 12px;
  padding-left: ${props => 8 + props.$level * 16}px;
  cursor: pointer;
  background: ${props => props.selected ? '#e3f2fd' : 'transparent'};
  border-radius: 4px;
  margin: 1px 0;
  
  &:hover {
    background: ${props => props.selected ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const PropertyPanel: React.FC = () => {
  const { state, updateFileTree } = useEditor();
  const [activeTab, setActiveTab] = useState<'properties' | 'files' | 'code'>('properties');
  const [componentCode, setComponentCode] = useState<string>('');
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['screens', 'screens/HomeScreen', 'screens/wix']));

  // Directory toggle handler (moved to top level to follow Rules of Hooks)
  const toggleDirectory = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  // File node renderer (moved to top level to follow Rules of Hooks)
  const renderFileNode = useCallback((node: any, level = 0): React.ReactNode => {
    const isExpanded = expandedDirs.has(node.path);
    
    return (
      <div key={`${node.id}-${level}`}>
        <FileItem
          $level={level}
          selected={node.path === state.activeFile}
          onClick={() => {
            if (node.type === 'directory') {
              toggleDirectory(node.path);
            } else {
              // Handle file selection
              console.log('📄 [PropertyPanel] File selected:', node.path);
            }
          }}
        >
          {node.type === 'directory' ? (isExpanded ? '📂' : '📁') : '📄'} {node.name}
        </FileItem>
        {node.children && node.type === 'directory' && isExpanded && (
          <div>
            {node.children.map((child: any) => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedDirs, state.activeFile, toggleDirectory]);

  // Load component source code
  const loadComponentCode = async (componentId: string) => {
    setIsLoadingCode(true);
    setCodeError(null);
    
    try {
      // Try to map component ID to actual file path
      const possiblePaths = [
        'screens/HomeScreen/HomeNavigation.tsx',
        'screens/HomeScreen/HomeScreen.tsx',
        'screens/SettingsScreen/SettingsScreen.tsx',
        'screens/wix/ecommerce/CartScreen/CartScreen.tsx',
        'screens/wix/navigation/ProductsNavigation.tsx',
        'screen-templates/templateConfig.ts'
      ];
      
      let foundCode = '';
      let foundPath = '';
      
      // Get session info from localStorage or global
      const sessionInfo = localStorage.getItem('visual-editor-session-id');
      
      if (sessionInfo) {
        for (const path of possiblePaths) {
          try {
            const response = await fetch(`http://localhost:3001/api/editor/session-file/${sessionInfo}/${path}`);
            if (response.ok) {
              foundCode = await response.text();
              foundPath = path;
              break;
            }
          } catch (error) {
            // Try next path
          }
        }
      }
      
      if (foundCode) {
        setComponentCode(foundCode);
        console.log(`📄 [PropertyPanel] Loaded code from: ${foundPath}`);
      } else {
        setCodeError('Component source code not found');
      }
    } catch (error) {
      console.error('❌ [PropertyPanel] Error loading component code:', error);
      setCodeError(error instanceof Error ? error.message : 'Failed to load code');
    } finally {
      setIsLoadingCode(false);
    }
  };

  // Load code when component changes
  React.useEffect(() => {
    if (state.selectedComponent && activeTab === 'code') {
      loadComponentCode(state.selectedComponent);
    }
  }, [state.selectedComponent, activeTab]);

  const renderProperties = () => {
    if (!state.selectedComponent) {
      return (
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No Component Selected</div>
          <div style={{ fontSize: '14px' }}>
            Click on a component in the phone frame or use the inspect tool to edit properties
          </div>
        </EmptyState>
      );
    }

    // Since selectedComponent is now a string ID, show basic info
    const componentId = state.selectedComponent;

    return (
      <>
        <ComponentInfo>
          <ComponentName>Selected Component</ComponentName>
          <ComponentType>ID: {componentId}</ComponentType>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
            Component Inspector Active
          </div>
        </ComponentInfo>

        <PropertyGroup>
          <GroupTitle>Inspector Status</GroupTitle>
          <div style={{ 
            padding: '16px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            🔍 Component Inspector is active!<br/>
            <br/>
            <strong>Selected:</strong> {componentId}<br/>
            <br/>
            Property editing will be available once the component registry is fully integrated with the LiveRenderer service.
          </div>
        </PropertyGroup>
      </>
    );
  };

  const renderFiles = () => {
    if (state.fileTree.length === 0) {
      return (
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No Files Loaded</div>
          <div style={{ fontSize: '14px' }}>
            File tree will appear here when src2 is initialized
          </div>
        </EmptyState>
      );
    }

    // Functions are now defined at component level (above)

    return (
      <FileTree>
        {state.fileTree.map(node => renderFileNode(node, 0))}
      </FileTree>
    );
  };

  const renderCode = () => {
    if (!state.selectedComponent) {
      return (
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💻</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No Component Selected</div>
          <div style={{ fontSize: '14px' }}>
            Select a component to view and edit its source code
          </div>
        </EmptyState>
      );
    }

    if (isLoadingCode) {
      return (
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Loading Code...</div>
          <div style={{ fontSize: '14px' }}>
            Fetching component source code...
          </div>
        </EmptyState>
      );
    }

    if (codeError) {
      return (
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Code Load Error</div>
          <div style={{ fontSize: '14px', color: '#d32f2f' }}>
            {codeError}
          </div>
        </EmptyState>
      );
    }

    return (
      <div style={{ padding: '16px' }}>
        <div style={{ 
          marginBottom: '16px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>Component:</strong> {state.selectedComponent}
          <br />
          <strong>Status:</strong> Source code loaded
        </div>
        
        <textarea
          value={componentCode}
          onChange={(e) => setComponentCode(e.target.value)}
          style={{
            width: '100%',
            height: '400px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '12px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            resize: 'vertical',
            background: '#fafafa'
          }}
          placeholder="Component source code will appear here..."
        />
        
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          gap: '8px' 
        }}>
          <button
            onClick={() => loadComponentCode(state.selectedComponent!)}
            style={{
              padding: '8px 16px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Reload
          </button>
          
          <button
            style={{
              padding: '8px 16px',
              background: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    );
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>Properties</PanelTitle>
      </PanelHeader>

      <TabContainer>
        <Tab
          $active={activeTab === 'properties'}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </Tab>
        <Tab
          $active={activeTab === 'files'}
          onClick={() => setActiveTab('files')}
        >
          Files
        </Tab>
        <Tab
          $active={activeTab === 'code'}
          onClick={() => setActiveTab('code')}
        >
          Code
        </Tab>
      </TabContainer>

      <PanelContent>
        {activeTab === 'properties' && renderProperties()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'code' && renderCode()}
      </PanelContent>
    </PanelContainer>
  );
};

export default PropertyPanel;