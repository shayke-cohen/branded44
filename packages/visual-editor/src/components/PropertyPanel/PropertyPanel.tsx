import React, { useState } from 'react';
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

const FileItem = styled.div<{ level: number; selected: boolean }>`
  padding: 8px 12px;
  padding-left: ${props => 8 + props.level * 16}px;
  cursor: pointer;
  background: ${props => props.selected ? '#e3f2fd' : 'transparent'};
  border-radius: 4px;
  margin: 1px 0;
  
  &:hover {
    background: ${props => props.selected ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const PropertyPanel: React.FC = () => {
  const { state } = useEditor();
  const [activeTab, setActiveTab] = useState<'properties' | 'files'>('properties');

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

    const renderFileNode = (node: any, level = 0) => (
      <div key={node.id}>
        <FileItem
          level={level}
          selected={node.path === state.activeFile}
          onClick={() => {
            if (node.type === 'file') {
              // Handle file selection
            }
          }}
        >
          {node.type === 'directory' ? '📁' : '📄'} {node.name}
        </FileItem>
        {node.children && node.isOpen && (
          <div>
            {node.children.map((child: any) => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    );

    return (
      <FileTree>
        {state.fileTree.map(node => renderFileNode(node))}
      </FileTree>
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
      </TabContainer>

      <PanelContent>
        {activeTab === 'properties' ? renderProperties() : renderFiles()}
      </PanelContent>
    </PanelContainer>
  );
};

export default PropertyPanel;