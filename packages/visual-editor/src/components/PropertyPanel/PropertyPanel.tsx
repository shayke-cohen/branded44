import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  background: white;
  border-left: 1px solid #e0e0e0;
  flex-shrink: 0;
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
  overflow-x: hidden;
  padding: 16px;
  word-wrap: break-word;
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
  const [activeTab, setActiveTab] = useState<'properties' | 'files' | 'dev'>('properties');



  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['screens', 'screens/HomeScreen', 'screens/wix']));
  
  // File editor state
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [workspacePath, setWorkspacePath] = useState<string>('Loading...');

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
    
    // Check if this file is the current component's file
    const componentFilePath = state.selectedComponent ? getComponentFilePath(state.selectedComponent) : null;
    const isComponentFile = componentFilePath === node.path;
    
    return (
      <div key={`${node.path}-${level}`}>
        <FileItem
          $level={level}
          selected={node.path === selectedFilePath || node.path === state.activeFile}
          onClick={() => {
            if (node.type === 'directory') {
              toggleDirectory(node.path);
            } else {
              // Handle file selection - load file content
              loadFileContent(node.path);
            }
          }}
          title={node.path} // Show full path as tooltip
          style={{
            // Highlight component-related files with a prominent border and background
            border: isComponentFile ? '2px solid #3498db' : 'none',
            backgroundColor: isComponentFile ? '#e3f2fd' : (node.path === selectedFilePath ? '#f0f8ff' : undefined),
            // Add extra visual prominence for component files
            boxShadow: isComponentFile ? '0 2px 8px rgba(52, 152, 219, 0.2)' : undefined,
            borderRadius: isComponentFile ? '6px' : '4px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {node.type === 'directory' ? (isExpanded ? '📂' : '📁') : '📄'} 
              <span>{node.name}</span>
              {isComponentFile && (
                <span style={{ 
                  fontSize: '10px', 
                  background: '#3498db', 
                  color: 'white', 
                  padding: '1px 4px', 
                  borderRadius: '3px',
                  marginLeft: 'auto'
                }}>
                  🎯
                </span>
              )}
            </div>
            {node.type === 'file' && level === 0 && (
              <div style={{ 
                fontSize: '10px', 
                color: '#999', 
                marginTop: '2px',
                opacity: 0.7
              }}>
                {node.path}
              </div>
            )}
            {isComponentFile && level > 0 && (
              <div style={{ 
                fontSize: '9px', 
                color: '#3498db', 
                marginTop: '1px',
                fontWeight: '600'
              }}>
                Selected Component File
              </div>
            )}
          </div>
        </FileItem>
        {node.children && Array.isArray(node.children) && node.type === 'directory' && isExpanded && (
          <div>
            {node.children.map((child: any) => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedDirs, selectedFilePath, state.activeFile, state.selectedComponent, toggleDirectory]);

  // Load file content
  const loadFileContent = useCallback(async (filePath: string) => {
    setIsLoadingFile(true);
    setFileError(null);
    
    try {
      console.log(`📄 [PropertyPanel] Loading file: ${filePath}`);
      
      // Get session info from localStorage
      const sessionInfo = localStorage.getItem('visual-editor-session-id');
      
      if (!sessionInfo) {
        throw new Error('No active session found');
      }
      
      const response = await fetch(`http://localhost:3001/api/editor/session-file/${sessionInfo}/${filePath}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load file');
      }
      
      setFileContent(data.content);
      setSelectedFilePath(filePath);
      setHasUnsavedChanges(false);
      
      console.log(`✅ [PropertyPanel] File loaded: ${filePath}`);
    } catch (error) {
      console.error(`❌ [PropertyPanel] Error loading file ${filePath}:`, error);
      setFileError(error instanceof Error ? error.message : 'Failed to load file');
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

  // Save file content
  const saveFileContent = useCallback(async () => {
    if (!selectedFilePath) return;
    
    setIsSavingFile(true);
    setFileError(null);
    
    try {
      console.log(`💾 [PropertyPanel] Saving file: ${selectedFilePath}`);
      
      // Get session info from localStorage
      const sessionInfo = localStorage.getItem('visual-editor-session-id');
      
      if (!sessionInfo) {
        throw new Error('No active session found');
      }
      
      const response = await fetch(`http://localhost:3001/api/editor/session-file/${sessionInfo}/${selectedFilePath}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: fileContent }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save file: ${response.status}`);
      }
      
      const result = await response.json();
      setHasUnsavedChanges(false);
      
      console.log(`✅ [PropertyPanel] File saved: ${selectedFilePath}`, result);
    } catch (error) {
      console.error(`❌ [PropertyPanel] Error saving file ${selectedFilePath}:`, error);
      setFileError(error instanceof Error ? error.message : 'Failed to save file');
    } finally {
      setIsSavingFile(false);
    }
  }, [selectedFilePath, fileContent]);

  // Handle file content change
  const handleFileContentChange = useCallback((newContent: string) => {
    setFileContent(newContent);
    setHasUnsavedChanges(newContent !== fileContent);
  }, [fileContent]);

  // Map component ID/type to actual file paths
  const getComponentFilePath = (componentId: string): string | null => {
    // Create comprehensive mapping of component IDs to file paths
    const componentFileMap: Record<string, string> = {
      // Screen components
      'home-screen': 'screens/HomeScreen/HomeNavigation.tsx',
      'HomeNavigation': 'screens/HomeScreen/HomeNavigation.tsx', 
      'HomeScreen': 'screens/HomeScreen/HomeScreen.tsx',
      'settings-screen': 'screens/SettingsScreen/SettingsScreen.tsx',
      'SettingsScreen': 'screens/SettingsScreen/SettingsScreen.tsx',
      
      // Wix ecommerce screens
      'cart-screen': 'screens/wix/ecommerce/CartScreen/CartScreen.tsx',
      'CartScreen': 'screens/wix/ecommerce/CartScreen/CartScreen.tsx',
      'wix-cart': 'screens/wix/ecommerce/CartScreen/CartScreen.tsx',
      
      // Wix navigation screens
      'ProductsNavigation': 'screens/wix/navigation/ProductsNavigation.tsx',
      'products-screen': 'screens/wix/navigation/ProductsNavigation.tsx',
      
      // Wix restaurant screens
      'MenuScreen': 'components/templates/restaurant/MenuScreen.tsx',
      'WixMenuScreen': 'components/templates/restaurant/WixMenuScreen.tsx',
      'RestaurantDetailScreen': 'components/templates/restaurant/RestaurantDetailScreen.tsx',
      'WixRestaurantDetailScreen': 'components/templates/restaurant/WixRestaurantDetailScreen.tsx',
      
      // Wix auth screens  
      'LoginScreen': 'screens/wix/auth/LoginScreen/LoginScreen.tsx',
      'SignupScreen': 'screens/wix/auth/SignupScreen/SignupScreen.tsx',
      
      // Template config
      'templateConfig': 'screen-templates/templateConfig.ts',
      'TemplateConfig': 'screen-templates/templateConfig.ts',
      
      // Components
      'HamburgerMenu': 'screens/HomeScreen/HamburgerMenu.tsx',
      'CheckoutWebView': 'components/CheckoutWebView/CheckoutWebView.tsx',
      
      // Generic fallbacks for common patterns
      'Text': 'components/common/Text.tsx',
      'Button': 'components/common/Button.tsx',
      'Image': 'components/common/Image.tsx',
      'View': 'components/common/View.tsx',
    };

    // Try direct mapping first
    if (componentFileMap[componentId]) {
      return componentFileMap[componentId];
    }

    // Try pattern matching for screen components
    if (componentId.endsWith('-screen') || componentId.endsWith('Screen')) {
      const screenName = componentId.replace('-screen', '').replace('Screen', '');
      const capitalizedName = screenName.charAt(0).toUpperCase() + screenName.slice(1);
      return `screens/${capitalizedName}Screen/${capitalizedName}Screen.tsx`;
    }

    // Try pattern matching for navigation components
    if (componentId.endsWith('Navigation')) {
      return `screens/HomeScreen/${componentId}.tsx`;
    }

    return null;
  };

  // Get a description of why a component can't be mapped
  const getUnmappableReason = (componentId: string): string => {
    // Check if it's a styled/CSS-in-JS element
    if (componentId.includes('css-') || componentId.includes('r-') || 
        componentId.includes('sc-') || componentId.includes('emotion-')) {
      return 'This is a styled-component or CSS-in-JS generated element. These are styling wrappers that don\'t have editable source files.';
    }
    
    // Check if it's a native HTML element
    if (componentId.match(/^(div|span|p|h[1-6]|img|button|input|textarea|form|ul|li|nav|section|article|header|footer|main)/)) {
      return 'This is a native HTML element or wrapper. It may be generated by a parent React component.';
    }
    
    // Check if it's a generic element with timestamp
    if (componentId.match(/-\d{13,}$/)) {
      return 'This appears to be a dynamically generated DOM element without a direct source file mapping.';
    }
    
    return 'This component could not be mapped to a source file. It may be a generated element or part of a library component.';
  };



  // Load workspace path when component mounts
  React.useEffect(() => {
    const fetchWorkspacePath = async () => {
      try {
        const sessionInfo = localStorage.getItem('visual-editor-session-id');
        if (!sessionInfo) {
          setWorkspacePath('No session loaded');
          return;
        }

        // Try to get the workspace path from the files/tree API
        const response = await fetch('http://localhost:3001/api/editor/files/tree');
        if (response.ok) {
          const data = await response.json();
          if (data.workspacePath) {
            setWorkspacePath(data.workspacePath);
          } else {
            // Fallback to constructed path
            setWorkspacePath(`/Users/shayco/branded44/tmp/visual-editor-sessions/${sessionInfo}/workspace`);
          }
        } else {
          // Fallback to constructed path
          setWorkspacePath(`/Users/shayco/branded44/tmp/visual-editor-sessions/${sessionInfo}/workspace`);
        }
      } catch (error) {
        console.error('❌ [PropertyPanel] Error fetching workspace path:', error);
        const sessionInfo = localStorage.getItem('visual-editor-session-id');
        if (sessionInfo) {
          setWorkspacePath(`/Users/shayco/branded44/tmp/visual-editor-sessions/${sessionInfo}/workspace`);
        } else {
          setWorkspacePath('No session loaded');
        }
      }
    };

    fetchWorkspacePath();
  }, []);

  // Auto-correlate selected component with Files tab
  React.useEffect(() => {
    if (state.selectedComponent) {
      // Ensure Properties tab is active when a component is selected
      if (activeTab !== 'properties') {
        console.log('🎯 [PropertyPanel] Component selected - switching to Properties tab');
        setActiveTab('properties');
      }
      
      // Get the file path for the selected component
      const componentFilePath = getComponentFilePath(state.selectedComponent);
      
      console.log(`🎯 [PropertyPanel] Selected component: ${state.selectedComponent}`);
      console.log(`📁 [PropertyPanel] Mapped to file path: ${componentFilePath || 'No mapping found'}`);
      
      if (componentFilePath) {
        // Component has a valid file mapping
        setSelectedFilePath(componentFilePath);
        
        // Clear any existing content to ensure fresh load
        if (fileContent !== '') {
          console.log(`🗑️ [PropertyPanel] Clearing previous file content`);
          setFileContent('');
          setHasUnsavedChanges(false);
          setFileError(null);
        }
        

        
        // Load content based on active tab
        if (activeTab === 'files') {
          console.log(`📁 [PropertyPanel] Files tab active - loading content for: ${componentFilePath}`);
          loadFileContent(componentFilePath);
        }
        

        
        // Auto-expand directories to show the selected file
        const pathParts = componentFilePath.split('/');
        const newExpandedDirs = new Set(expandedDirs);
        let currentPath = '';
        for (let i = 0; i < pathParts.length - 1; i++) {
          currentPath += (i > 0 ? '/' : '') + pathParts[i];
          newExpandedDirs.add(currentPath);
        }
        setExpandedDirs(newExpandedDirs);
        
        console.log(`📂 [PropertyPanel] Auto-expanded directories: [${Array.from(newExpandedDirs).join(', ')}]`);
      } else {
        // Component doesn't have a file mapping (DOM element, styled component, etc.)
        console.log(`⚠️ [PropertyPanel] Component '${state.selectedComponent}' cannot be mapped to a source file`);
        
        // Clear file-related state
        setSelectedFilePath(null);
        setFileContent('');
        setFileError(null);
        setHasUnsavedChanges(false);
        

      }
    } else {
      // Clear selection when no component is selected
      console.log(`🎯 [PropertyPanel] No component selected - clearing selection`);
      if (activeTab !== 'files') {
        // Don't clear file selection if user is actively browsing files
        setSelectedFilePath(null);
        setFileContent('');
        setHasUnsavedChanges(false);
      }

    }
  }, [state.selectedComponent]);

  // Handle tab switching to load content for selected component
  React.useEffect(() => {
    if (!state.selectedComponent) return;
    
    const componentFilePath = getComponentFilePath(state.selectedComponent);
    if (!componentFilePath) return;
    
    console.log(`🔄 [PropertyPanel] Tab switched to '${activeTab}' with selected component: ${state.selectedComponent}`);
    
    // Load content based on which tab just became active
    if (activeTab === 'files' && selectedFilePath === componentFilePath) {
      // Only load if we don't already have content for this file
      if (fileContent === '' && !isLoadingFile) {
        console.log(`📁 [PropertyPanel] Loading file content for tab switch: ${componentFilePath}`);
        loadFileContent(componentFilePath);
      }
    }
  }, [activeTab]); // Only depend on activeTab to detect tab switching

  // Get component hierarchy from the inspector
  const [componentHierarchy, setComponentHierarchy] = React.useState<any[]>([]);
  const [selectedHierarchyIndex, setSelectedHierarchyIndex] = React.useState<number>(0);
  const [editMode, setEditMode] = React.useState<boolean>(false);
  
  // Hover preview state for real-time updates
  const [hoverPreviewComponent, setHoverPreviewComponent] = React.useState<any>(null);
  const [isShowingPreview, setIsShowingPreview] = React.useState<boolean>(false);
  
  // Content tracing results
  const [contentMatches, setContentMatches] = React.useState<any[]>([]);
  const [isLoadingContentTrace, setIsLoadingContentTrace] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<any>(null);

  // Legacy live inspection state (now replaced by hover preview)
  // const [liveInspectionComponent, setLiveInspectionComponent] = React.useState<any>(null);
  // const [isLiveInspecting, setIsLiveInspecting] = React.useState(false);

  // Legacy live code update listener (now replaced by hover preview)
  // React.useEffect(() => {
  //   const handleLiveCodeUpdate = (event: any) => {
  //     const component = event.detail?.component;
  //     setLiveInspectionComponent(component);
  //     setIsLiveInspecting(!!component);
  //     
  //     if (component?.contentInfo) {
  //       // Trigger live content tracing
  //       traceContent(component.contentInfo);
  //     } else {
  //       // Clear tracing results when no component
  //       setContentMatches([]);
  //       setSelectedMatch(null);
  //     }
  //   };
  //   
  //   window.addEventListener('live-code-update', handleLiveCodeUpdate);
  //   return () => window.removeEventListener('live-code-update', handleLiveCodeUpdate);
  // }, []);

  // Listen for component hierarchy updates (click selection)
  React.useEffect(() => {
    const handleComponentHierarchy = (event: any) => {
      if (event.detail?.hierarchy) {
        setComponentHierarchy(event.detail.hierarchy);
        
        // Ensure Properties tab is active when inspecting components
        if (activeTab !== 'properties') {
          console.log('🎯 [PropertyPanel] Component inspected - switching to Properties tab');
          setActiveTab('properties');
        }
        
        // Trigger content tracing for direct file mapping
        if (event.detail.hierarchy[0]?.contentInfo) {
          traceContent(event.detail.hierarchy[0].contentInfo);
        }
        
        // In edit mode, automatically select the first editable component
        if (editMode) {
          const editableIndex = event.detail.hierarchy.findIndex((c: any) => c.isEditable);
          setSelectedHierarchyIndex(editableIndex >= 0 ? editableIndex : 0);
        } else {
          setSelectedHierarchyIndex(0); // Start with the clicked element
        }
      }
    };
    
    window.addEventListener('component-hierarchy-updated', handleComponentHierarchy);
    return () => window.removeEventListener('component-hierarchy-updated', handleComponentHierarchy);
  }, [editMode, activeTab]);

  // Listen for hover preview events (real-time updates during inspection)
  React.useEffect(() => {
    const handleHoverPreview = (event: any) => {
      // console.log('📥 [PropertyPanel] Hover preview event received:', event.detail);
      if (event.detail?.isPreview) {
        const component = event.detail.component;
        if (component) {
          // console.log('👀 [PropertyPanel] Hover preview received for component:', component.name);
          setHoverPreviewComponent(component);
          setIsShowingPreview(true);
          
          // Trigger content tracing for the hovered component (optional)
          if (component?.contentInfo) {
            traceContent(component.contentInfo);
          }
        } else {
          // console.log('👀 [PropertyPanel] Hover preview cleared');
          setHoverPreviewComponent(null);
          setIsShowingPreview(false);
          
          // Clear tracing results when no component is hovered
          setContentMatches([]);
          setSelectedMatch(null);
        }
      }
    };
    
    window.addEventListener('component-hover-preview', handleHoverPreview);
    return () => window.removeEventListener('component-hover-preview', handleHoverPreview);
  }, []);

  // Content tracing function
  const traceContent = async (contentInfo: any) => {
    if (!contentInfo || (!contentInfo.text && !contentInfo.textContent && !contentInfo.className)) {
      console.log('📝 [PropertyPanel] No meaningful content to trace');
      return;
    }

    setIsLoadingContentTrace(true);
    setContentMatches([]);
    setSelectedMatch(null);

    try {
      const sessionId = localStorage.getItem('visual-editor-session-id');
      if (!sessionId) {
        throw new Error('No active session');
      }

      console.log('🔍 [PropertyPanel] Tracing content:', contentInfo);

      const response = await fetch('http://localhost:3001/api/editor/trace-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          contentInfo
        })
      });

      if (!response.ok) {
        throw new Error(`Content tracing failed: ${response.status}`);
      }

      const result = await response.json();
      setContentMatches(result.matches || []);
      
      // Auto-select the best match (highest confidence text match)
      if (result.matches && result.matches.length > 0) {
        const bestMatch = result.matches.find((m: any) => 
          m.matches.some((match: any) => match.type === 'text' && match.confidence > 0.7)
        ) || result.matches[0];
        
        setSelectedMatch(bestMatch);
        
        // Auto-load the best matching file
        loadFileContent(bestMatch.file);
        
        // Keep focus on Properties tab to show element content
        // User can manually switch to Files tab if they want to edit
        
        console.log('✅ [PropertyPanel] Content traced successfully:', result.matches.length, 'files found');
        console.log('📁 [PropertyPanel] Auto-loaded file (staying on Properties tab):', bestMatch.file);
      }

    } catch (error) {
      console.error('❌ [PropertyPanel] Content tracing error:', error);
    } finally {
      setIsLoadingContentTrace(false);
    }
  };

  // Emit edit mode changes to the inspector
  React.useEffect(() => {
    const editModeEvent = new CustomEvent('inspector-edit-mode-changed', {
      detail: { editMode }
    });
    window.dispatchEvent(editModeEvent);
  }, [editMode]);

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

    // Show info for any inspected component
    const componentId = state.selectedComponent;
    const componentFilePath = getComponentFilePath(componentId);
    
    // Get current component from hierarchy
    const currentComponent = componentHierarchy[selectedHierarchyIndex];
    const currentComponentPath = currentComponent ? getComponentFilePath(currentComponent.id) : componentFilePath;
    
    // Use hover preview component when available, otherwise use selected component
    const activeComponent = hoverPreviewComponent || currentComponent || state.selectedComponent;
    const isLiveMode = !!hoverPreviewComponent;

    return (
      <>
        {/* Live Inspection Status */}
        {isLiveMode && (
          <div style={{
            margin: '16px',
            padding: '12px',
            background: 'linear-gradient(90deg, #e3f2fd, #f3e5f5)',
            border: '2px solid #2196f3',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1565c0',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)'
          }}>
            <div style={{ marginBottom: '4px' }}>
              {isShowingPreview ? '👀 Hover Preview Active' : '🔍 Live Code Inspection Active'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#1976d2' }}>
              {isShowingPreview ? 'Showing properties for hovered element - click to select' : 'Hover over elements to see their source code instantly'}
            </div>
            {activeComponent && (
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 'normal', 
                color: '#424242',
                marginTop: '6px',
                fontFamily: 'monospace',
                background: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {activeComponent.name} ({activeComponent.type})
              </div>
            )}
          </div>
        )}

        {/* Content Tracing Results - Direct File Mapping */}
        {isLoadingContentTrace && (
          <div style={{
            margin: '16px',
            padding: '12px',
            background: '#f0f8ff',
            border: '1px solid #3498db',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '8px' }}>🔍 Tracing content in source files...</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Finding where this content is defined</div>
          </div>
        )}

        {contentMatches.length > 0 && (
          <div style={{
            margin: '16px',
            padding: '12px',
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: '#2e7d32' }}>
              🎯 Content Found in {contentMatches.length} File{contentMatches.length > 1 ? 's' : ''}
            </div>
            
            {contentMatches.slice(0, 3).map((fileMatch: any, index: number) => (
              <div key={index} style={{
                marginBottom: '8px',
                padding: '8px',
                background: selectedMatch === fileMatch ? '#c8e6c9' : '#f1f8e9',
                borderRadius: '4px',
                cursor: 'pointer',
                border: selectedMatch === fileMatch ? '2px solid #4caf50' : '1px solid #a5d6a7'
              }}
              onClick={() => {
                setSelectedMatch(fileMatch);
                // Auto-load file content
                loadFileContent(fileMatch.file);
              }}>
                <div style={{ fontWeight: '600', color: '#2e7d32', marginBottom: '4px' }}>
                  📄 {fileMatch.file}
                </div>
                
                <div style={{ fontSize: '12px', color: '#388e3c' }}>
                  {fileMatch.matches.length} match{fileMatch.matches.length > 1 ? 'es' : ''} found
                </div>
                
                {/* Show best match */}
                {fileMatch.matches[0] && (
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '11px', 
                    fontFamily: 'monospace',
                    background: '#fff',
                    padding: '4px',
                    borderRadius: '2px',
                    color: '#333'
                  }}>
                    Line {fileMatch.matches[0].line}: {fileMatch.matches[0].content}
                  </div>
                )}
              </div>
            ))}
            
            {contentMatches.length > 3 && (
              <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                ...and {contentMatches.length - 3} more files
              </div>
            )}
            
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  if (selectedMatch || contentMatches[0]) {
                    const fileToEdit = selectedMatch || contentMatches[0];
                    loadFileContent(fileToEdit.file);
                    setActiveTab('files'); // Only switch when user explicitly wants to edit
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🚀 Edit Best Match
              </button>
              
              <div style={{ fontSize: '11px', color: '#2e7d32' }}>
                💡 Click any file above to view/edit
              </div>
            </div>
          </div>
        )}

        {/* Show "No Content Found" only if tracing completed with no results */}
        {!isLoadingContentTrace && contentMatches.length === 0 && (activeComponent || state.selectedComponent) && (
          <div style={{
            margin: '16px',
            padding: '12px',
            background: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: '#f57c00' }}>
              {isLiveMode ? '🔍 No Source Code Found' : '⚠️ Content Not Found in Source Files'}
            </div>
            <div style={{ marginBottom: '8px', color: '#ef6c00' }}>
              {isLiveMode ? 
                'This element doesn\'t have traceable source code. Try hovering over text, buttons, or React components.' :
                'This element\'s content couldn\'t be traced to specific source files. This usually means:'
              }
            </div>
            {!isLiveMode && (
              <ul style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '12px', color: '#ef6c00' }}>
                <li>It's a dynamically generated element</li>
                <li>Content comes from props or state</li>
                <li>It's part of a library component</li>
              </ul>
            )}
          </div>
        )}

        {/* Show helpful message when not inspecting anything */}
        {!isLiveMode && !state.selectedComponent && contentMatches.length === 0 && (
          <div style={{
            margin: '16px',
            padding: '16px',
            background: '#f5f5f5',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Start Inspecting Elements
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              Click the inspect button and hover over elements to see their source code instantly.
              Only elements with editable code will be highlighted.
            </div>
          </div>
        )}

        {/* Component Hierarchy Navigation - Secondary Option */}
        {componentHierarchy.length > 1 && (
          <div style={{
            margin: '16px',
            padding: '12px',
            background: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              📍 Component Hierarchy
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
              {componentHierarchy.map((comp: any, index: number) => (
                <React.Fragment key={`${comp.id}-${index}`}>
                  <button
                    onClick={() => setSelectedHierarchyIndex(index)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: selectedHierarchyIndex === index ? '2px solid #3498db' : '1px solid #ddd',
                      background: selectedHierarchyIndex === index ? '#e3f2fd' : (comp.isEditable ? '#e8f5e8' : '#fff'),
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={`${comp.name} (${comp.type}${comp.isEditable ? ' - Editable' : ''})`}
                  >
                    {comp.isEditable ? '✅' : (comp.type === 'custom' ? '⚛️' : '🏷️')}
                    <span>{comp.name}</span>
                  </button>
                  {index < componentHierarchy.length - 1 && (
                    <span style={{ color: '#666', fontSize: '12px' }}>→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              ✅ Editable • ⚛️ React Component • 🏷️ DOM Element • Click to inspect different levels
            </div>
          </div>
        )}

        <ComponentInfo>
          <ComponentName>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span>
              <span>
                {currentComponent ? `${currentComponent.name} (Level ${selectedHierarchyIndex + 1})` : 'Inspected Component'}
              </span>
            </div>
          </ComponentName>
          <ComponentType>
            <strong>ID:</strong> {currentComponent ? currentComponent.id : componentId}
          </ComponentType>
          {currentComponentPath && (
            <ComponentType style={{ marginTop: '4px', color: '#3498db' }}>
              <strong>File:</strong> {currentComponentPath}
            </ComponentType>
          )}
          {currentComponent && (
            <ComponentType style={{ marginTop: '4px', color: currentComponent.isEditable ? '#4caf50' : '#ff9800' }}>
              <strong>Editable:</strong> {currentComponent.isEditable ? '✅ Yes' : '⚠️ No'}
            </ComponentType>
          )}
          <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
            Component Inspector Active
            {componentHierarchy.length > 1 && ` • ${componentHierarchy.length} levels found`}
          </div>
        </ComponentInfo>

        <PropertyGroup>
          <GroupTitle>Component Information</GroupTitle>
          
          <div style={{ 
            padding: '12px',
            background: currentComponentPath ? '#e8f5e8' : '#fff3cd',
            border: `1px solid ${currentComponentPath ? '#4caf50' : '#ffc107'}`,
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>{currentComponentPath ? '✅' : '⚠️'}</span>
              <strong>{currentComponentPath ? 'Source File Available' : 'DOM Element / Styled Component'}</strong>
            </div>
            
            <div style={{ marginLeft: '24px', fontSize: '13px' }}>
              {currentComponentPath ? (
                <div>
                  This component can be edited in the Files tab.
                </div>
              ) : (
                <div>
                  {getUnmappableReason(currentComponent ? currentComponent.id : componentId)}
                </div>
              )}
            </div>
          </div>
          
          {/* Smart Suggestions */}
          {componentHierarchy.length > 1 && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#e3f2fd',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: '600' }}>
                🚀 Quick Actions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {componentHierarchy.find(c => c.isEditable) && (
                  <button
                    onClick={() => {
                      const editableIndex = componentHierarchy.findIndex(c => c.isEditable);
                      setSelectedHierarchyIndex(editableIndex);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✅ Go to Editable Component
                  </button>
                )}
                
                {componentHierarchy.filter(c => c.type === 'custom').length > 0 && (
                  <button
                    onClick={() => {
                      const reactIndex = componentHierarchy.findIndex(c => c.type === 'custom');
                      setSelectedHierarchyIndex(reactIndex);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ⚛️ Go to React Component
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div style={{ 
            marginTop: '16px',
            fontSize: '13px',
            color: '#666'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Component Type:</strong> {componentId.includes('-') ? 'Native DOM Element' : 'React Component'}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Inspectable:</strong> ✅ All elements can be inspected
            </div>
            
            {componentFilePath && (
              <div style={{ marginTop: '12px', padding: '8px', background: '#f0f8ff', borderRadius: '4px' }}>
                💡 <strong>Tip:</strong> Switch to the Files tab to view and edit this component's source code.
              </div>
            )}
          </div>
        </PropertyGroup>

        {/* Element Content Section */}
        {currentComponent?.elementContent && (
          <PropertyGroup>
            <div style={{
              background: 'linear-gradient(90deg, #e3f2fd, #f3e5f5)',
              border: '2px solid #2196f3',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1565c0',
              textAlign: 'center'
            }}>
              🔍 Inspected Element Content
              <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', color: '#1976d2' }}>
                Live inspection of selected DOM element
              </div>
            </div>
            <GroupTitle>📋 Element Details</GroupTitle>
            
            {/* Basic Element Info */}
            <div style={{ 
              padding: '12px',
              background: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span>🏷️</span>
                <strong>Element: &lt;{currentComponent.elementContent.tagName}&gt;</strong>
              </div>
              
              {currentComponent.elementContent.id && (
                <div style={{ marginBottom: '4px' }}>
                  <strong>ID:</strong> <code>{currentComponent.elementContent.id}</code>
                </div>
              )}
              
              {currentComponent.elementContent.className && (
                <div style={{ marginBottom: '4px' }}>
                  <strong>Classes:</strong> <code>{currentComponent.elementContent.className}</code>
                </div>
              )}
              
              {currentComponent.elementContent.textContent && (
                <div style={{ marginBottom: '4px' }}>
                  <strong>Text:</strong> <span style={{ fontStyle: 'italic' }}>"{currentComponent.elementContent.textContent.substring(0, 100)}{currentComponent.elementContent.textContent.length > 100 ? '...' : ''}"</span>
                </div>
              )}
              
              {currentComponent.elementContent.children.length > 0 && (
                <div>
                  <strong>Children:</strong> {currentComponent.elementContent.children.length} elements
                </div>
              )}
            </div>

            {/* HTML Content */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <span>📄</span>
                <span>HTML Structure</span>
              </div>
              
              <textarea
                readOnly
                value={currentComponent.elementContent.outerHTML}
                style={{
                  width: '100%',
                  height: '150px',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '11px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: '#fafafa',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            {/* Computed Styles */}
            {Object.keys(currentComponent.elementContent.computedStyles).length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <span>🎨</span>
                  <span>Key Styles</span>
                </div>
                
                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '12px',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                }}>
                  {Object.entries(currentComponent.elementContent.computedStyles).map(([prop, value]) => (
                    <div key={prop} style={{ marginBottom: '2px' }}>
                      <span style={{ color: '#d73a49' }}>{prop}</span>: <span style={{ color: '#032f62' }}>{String(value)}</span>;
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {Object.keys(currentComponent.elementContent.attributes).length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <span>⚙️</span>
                  <span>Attributes</span>
                </div>
                
                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '12px'
                }}>
                  {Object.entries(currentComponent.elementContent.attributes).map(([attr, value]) => (
                    <div key={attr} style={{ marginBottom: '4px' }}>
                      <strong>{attr}:</strong> <code>{String(value)}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Children Preview */}
            {currentComponent.elementContent.children.length > 0 && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <span>👶</span>
                  <span>Child Elements ({currentComponent.elementContent.children.length})</span>
                </div>
                
                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '12px',
                  maxHeight: '120px',
                  overflow: 'auto'
                }}>
                  {currentComponent.elementContent.children.map((child: any, index: number) => (
                    <div key={index} style={{ 
                      marginBottom: '6px',
                      padding: '4px',
                      background: '#fff',
                      border: '1px solid #e9ecef',
                      borderRadius: '3px'
                    }}>
                      <div>
                        <strong>&lt;{child.tagName}&gt;</strong>
                        {child.className && <span style={{ color: '#6f42c1' }}> .{child.className}</span>}
                        {child.id && <span style={{ color: '#e83e8c' }}> #{child.id}</span>}
                      </div>
                      {child.textContent && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#6c757d', 
                          fontStyle: 'italic',
                          marginTop: '2px'
                        }}>
                          "{child.textContent.substring(0, 50)}{child.textContent.length > 50 ? '...' : ''}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PropertyGroup>
        )}
      </>
    );
  };

  const renderFiles = () => {
    if (!state.fileTree || !Array.isArray(state.fileTree) || state.fileTree.length === 0) {
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

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Workspace Path Header */}
        <div style={{ 
          padding: '12px', 
          background: '#f8f9fa', 
          borderBottom: '2px solid #e0e0e0',
          fontSize: '11px',
          color: '#666',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          wordBreak: 'break-all',
          lineHeight: '1.4'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontWeight: '600', 
            marginBottom: '4px', 
            color: '#333' 
          }}>
            <span>📁 Workspace Directory</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(workspacePath).then(() => {
                  console.log('📋 [PropertyPanel] Path copied to clipboard:', workspacePath);
                }).catch(err => {
                  console.error('❌ [PropertyPanel] Failed to copy path:', err);
                });
              }}
              style={{
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '10px',
                color: '#666',
                cursor: 'pointer'
              }}
              title="Copy path to clipboard"
            >
              📋 Copy
            </button>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '6px 8px', 
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            color: '#555',
            cursor: 'text',
            userSelect: 'text'
          }}>
            {workspacePath}
          </div>
        </div>

        {/* File Tree */}
        <div style={{ 
          borderBottom: selectedFilePath ? '1px solid #e0e0e0' : 'none',
          maxHeight: selectedFilePath ? '35%' : '100%', // Reduced from 40% to account for header
          overflowY: 'auto',
          flex: selectedFilePath ? 'none' : '1'
        }}>
          <div style={{ 
            padding: '8px 12px', 
            background: '#f8f9fa', 
            borderBottom: '1px solid #e0e0e0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#666'
          }}>
            🗂️ File Tree
          </div>
          <FileTree>
            {state.fileTree?.map(node => renderFileNode(node, 0))}
          </FileTree>
        </div>

        {/* File Editor */}
        {selectedFilePath && (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderTop: '1px solid #e0e0e0'
          }}>
            {/* File Header */}
            <div style={{ 
              padding: '8px 12px', 
              background: '#f8f9fa', 
              borderBottom: '1px solid #e0e0e0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#333'
            }}>
              📄 {selectedFilePath}
              {hasUnsavedChanges && <span style={{ color: '#ff6b6b' }}> *</span>}
            </div>

            {/* File Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {isLoadingFile ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  ⏳ Loading file...
                </div>
              ) : fileError ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#ff6b6b',
                  fontSize: '14px'
                }}>
                  ❌ Error: {fileError}
                </div>
              ) : (
                <>
                  <textarea
                    value={fileContent}
                    onChange={(e) => handleFileContentChange(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: 'none',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '12px',
                      resize: 'none',
                      background: '#fafafa',
                      outline: 'none'
                    }}
                    placeholder="File content will appear here..."
                  />
                  
                  {/* Save Button */}
                  <div style={{ 
                    padding: '8px 12px', 
                    background: '#f8f9fa', 
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={saveFileContent}
                      disabled={!hasUnsavedChanges || isSavingFile}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        background: hasUnsavedChanges ? '#3498db' : '#e9ecef',
                        color: hasUnsavedChanges ? 'white' : '#666',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: hasUnsavedChanges && !isSavingFile ? 'pointer' : 'not-allowed',
                        opacity: isSavingFile ? 0.7 : 1
                      }}
                    >
                      {isSavingFile ? '💾 Saving...' : '💾 Save'}
                    </button>
                    
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {hasUnsavedChanges ? 'Unsaved changes' : 'No changes'}
                    </div>
                    
                    <button
          onClick={() => {
                        setSelectedFilePath(null);
                        setFileContent('');
                        setHasUnsavedChanges(false);
                        setFileError(null);
                      }}
                      style={{
                        marginLeft: 'auto',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        background: '#e9ecef',
                        color: '#666',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };



  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>Properties</PanelTitle>
        
        {/* Edit Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '12px',
          marginLeft: 'auto'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            cursor: 'pointer',
            color: '#666'
          }}>
            <input
              type="checkbox"
              checked={editMode}
              onChange={(e) => setEditMode(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: editMode ? '#4caf50' : '#666' }}>
              {editMode ? '✅ Edit Mode' : '🔍 Inspect Mode'}
            </span>
          </label>
        </div>
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
          $active={activeTab === 'dev'}
          onClick={() => setActiveTab('dev')}
        >
          🔧 Dev
        </Tab>

      </TabContainer>

      <PanelContent>
        {activeTab === 'properties' && renderProperties()}
        {activeTab === 'files' && renderFiles()}

        {activeTab === 'dev' && (
          <div style={{ height: '100%', overflow: 'auto', padding: '16px' }}>
            <div style={{ 
              background: '#f8f9fa', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                Direct Mobile App Loading
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Using real mobile app with WebSocket hot-reloading.<br/>
                No bundling required!
              </div>
            </div>
          </div>
        )}

      </PanelContent>
    </PanelContainer>
  );
};

export default PropertyPanel;