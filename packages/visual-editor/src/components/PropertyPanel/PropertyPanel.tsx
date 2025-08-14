import React, { useState } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';

const PanelContainer = styled.div`
  width: 300px;
  background: #ffffff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
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
  color: #666;
  text-align: center;
`;

const PropertyGroup = styled.div`
  margin-bottom: 24px;
`;

const GroupTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const PropertyRow = styled.div`
  margin-bottom: 12px;
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const PropertySelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const PropertyTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ColorInput = styled.input`
  width: 40px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const ComponentInfo = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const ComponentName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ComponentType = styled.div`
  font-size: 12px;
  color: #666;
  font-family: monospace;
`;

const FileTree = styled.div`
  font-family: monospace;
  font-size: 12px;
`;

const FileItem = styled.div<{ level: number; selected?: boolean }>`
  padding: 4px 8px;
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
  const { state, updateComponentProps } = useEditor();
  const [activeTab, setActiveTab] = useState<'properties' | 'files'>('properties');

  const handlePropertyChange = (propertyName: string, value: any) => {
    if (state.selectedComponent) {
      updateComponentProps(state.selectedComponent.id, {
        [propertyName]: value
      });
    }
  };

  const renderProperties = () => {
    if (!state.selectedComponent) {
      return (
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No Component Selected</div>
          <div style={{ fontSize: '14px' }}>
            Click on a component in the phone frame to edit its properties
          </div>
        </EmptyState>
      );
    }

    const component = state.selectedComponent;
    const props = component.props || {};

    return (
      <>
        <ComponentInfo>
          <ComponentName>{component.name || component.type}</ComponentName>
          <ComponentType>{component.type}</ComponentType>
          {component.filePath && (
            <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
              {component.filePath}
            </div>
          )}
        </ComponentInfo>

        <PropertyGroup>
          <GroupTitle>Layout</GroupTitle>
          <PropertyRow>
            <PropertyLabel>Width</PropertyLabel>
            <PropertyInput
              type="text"
              value={props.width || ''}
              onChange={(e) => handlePropertyChange('width', e.target.value)}
              placeholder="auto, 100%, 200px"
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Height</PropertyLabel>
            <PropertyInput
              type="text"
              value={props.height || ''}
              onChange={(e) => handlePropertyChange('height', e.target.value)}
              placeholder="auto, 100%, 200px"
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Margin</PropertyLabel>
            <PropertyInput
              type="text"
              value={props.margin || ''}
              onChange={(e) => handlePropertyChange('margin', e.target.value)}
              placeholder="10px, 10px 20px"
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Padding</PropertyLabel>
            <PropertyInput
              type="text"
              value={props.padding || ''}
              onChange={(e) => handlePropertyChange('padding', e.target.value)}
              placeholder="10px, 10px 20px"
            />
          </PropertyRow>
        </PropertyGroup>

        <PropertyGroup>
          <GroupTitle>Appearance</GroupTitle>
          <PropertyRow>
            <PropertyLabel>Background Color</PropertyLabel>
            <ColorInput
              type="color"
              value={props.backgroundColor || '#ffffff'}
              onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Border Radius</PropertyLabel>
            <PropertyInput
              type="text"
              value={props.borderRadius || ''}
              onChange={(e) => handlePropertyChange('borderRadius', e.target.value)}
              placeholder="0px, 8px, 50%"
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Opacity</PropertyLabel>
            <PropertyInput
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={props.opacity || 1}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
            />
          </PropertyRow>
        </PropertyGroup>

        {component.type === 'Text' && (
          <PropertyGroup>
            <GroupTitle>Text</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Content</PropertyLabel>
              <PropertyTextarea
                value={props.children || ''}
                onChange={(e) => handlePropertyChange('children', e.target.value)}
                placeholder="Enter text content..."
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Font Size</PropertyLabel>
              <PropertyInput
                type="text"
                value={props.fontSize || ''}
                onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
                placeholder="16px, 1.2em"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Font Weight</PropertyLabel>
              <PropertySelect
                value={props.fontWeight || 'normal'}
                onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </PropertySelect>
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Text Color</PropertyLabel>
              <ColorInput
                type="color"
                value={props.color || '#000000'}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Text Align</PropertyLabel>
              <PropertySelect
                value={props.textAlign || 'left'}
                onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </PropertySelect>
            </PropertyRow>
          </PropertyGroup>
        )}

        <PropertyGroup>
          <GroupTitle>Advanced</GroupTitle>
          <PropertyRow>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={props.disabled || false}
                onChange={(e) => handlePropertyChange('disabled', e.target.checked)}
              />
              <PropertyLabel>Disabled</PropertyLabel>
            </CheckboxContainer>
          </PropertyRow>
          <PropertyRow>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={props.hidden || false}
                onChange={(e) => handlePropertyChange('hidden', e.target.checked)}
              />
              <PropertyLabel>Hidden</PropertyLabel>
            </CheckboxContainer>
          </PropertyRow>
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
