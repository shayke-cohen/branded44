import React, { useState } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';

// Import real navigation tabs from mobile app
import {
  getNavTabs,
  getScreenIdForTab,
  type NavTabConfig
} from '@mobile/screen-templates/templateConfig';

const ScreenSelectorContainer = styled.div`
  border-bottom: 1px solid #e0e0e0;
`;

const SelectorHeader = styled.div`
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f0f0f0;
  }
`;

const SelectorTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SelectorTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const CollapseIcon = styled.span<{ $collapsed: boolean }>`
  font-size: 12px;
  color: #666;
  transition: transform 0.2s ease;
  transform: ${props => props.$collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
`;

const ScreenList = styled.div`
  overflow-y: auto;
`;

const ScreenItem = styled.div<{ $active: boolean }>`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background: ${props => props.$active ? '#e3f2fd' : 'transparent'};
  border-left: ${props => props.$active ? '3px solid #3498db' : '3px solid transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const ScreenIcon = styled.span`
  font-size: 16px;
  min-width: 20px;
  text-align: center;
`;

const ScreenInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ScreenName = styled.div<{ $active: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$active ? '#1976d2' : '#333'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ScreenDescription = styled.div`
  font-size: 11px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
`;

interface ScreenOption {
  id: string;
  name: string;
  icon: string;
  description?: string;
  tabId: string;
}

// Get real navigation tabs from mobile app
const getScreenOptions = (): ScreenOption[] => {
  const navTabs = getNavTabs();
  return navTabs.map(tab => ({
    id: getScreenIdForTab(tab.id) || tab.id,
    name: tab.name,
    icon: tab.icon || '📱',
    description: tab.metadata?.description || `Navigate to ${tab.name}`,
    tabId: tab.id
  }));
};

interface ScreenSelectorProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const ScreenSelector: React.FC<ScreenSelectorProps> = ({ 
  collapsed = false, 
  onToggle 
}) => {
  const { state, setCurrentScreen, setCurrentTab } = useEditor();
  
  // Get real screen options from navigation tabs
  const screenOptions = getScreenOptions();

  const handleScreenSelect = (screen: ScreenOption) => {
    console.log('📱 [ScreenSelector] Screen selected:', screen.name, '->', screen.id, 'Tab:', screen.tabId);
    setCurrentScreen(screen.id);
    setCurrentTab(screen.tabId);
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <ScreenSelectorContainer>
      <SelectorHeader onClick={handleToggle}>
        <SelectorTitleGroup>
          <span>📱</span>
          <SelectorTitle>App Screens</SelectorTitle>
        </SelectorTitleGroup>
        <CollapseIcon $collapsed={collapsed}>▼</CollapseIcon>
      </SelectorHeader>
      
      {!collapsed && (
        <ScreenList>
          {screenOptions.map(screen => (
            <ScreenItem
              key={screen.id}
              $active={state.currentScreen === screen.id}
              onClick={() => handleScreenSelect(screen)}
            >
              <ScreenIcon>{screen.icon}</ScreenIcon>
              <ScreenInfo>
                <ScreenName $active={state.currentScreen === screen.id}>
                  {screen.name}
                </ScreenName>
                <ScreenDescription>
                  {screen.description}
                </ScreenDescription>
              </ScreenInfo>
            </ScreenItem>
          ))}
        </ScreenList>
      )}
    </ScreenSelectorContainer>
  );
};

export default ScreenSelector;
