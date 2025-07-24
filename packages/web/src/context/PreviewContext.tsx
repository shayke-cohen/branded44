import React, {createContext, useContext, useState, ReactNode} from 'react';

export type PreviewMode = 'screens' | 'templates';
export type DeviceFrame = 'iphone' | 'android';
export type ScreenType = 'HomeScreen' | 'SettingsScreen' | 'TemplateIndexScreen';
export type TemplateType = 'AuthScreenTemplate' | 'DashboardScreenTemplate' | 'FormScreenTemplate' | 'ListScreenTemplate';

interface PreviewContextType {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  deviceFrame: DeviceFrame;
  setDeviceFrame: (frame: DeviceFrame) => void;
  selectedScreen: ScreenType | null;
  setSelectedScreen: (screen: ScreenType | null) => void;
  selectedTemplate: TemplateType | null;
  setSelectedTemplate: (template: TemplateType | null) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('screens');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('iphone');
  const [selectedScreen, setSelectedScreen] = useState<ScreenType | null>('HomeScreen');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>('AuthScreenTemplate');

  return (
    <PreviewContext.Provider
      value={{
        previewMode,
        setPreviewMode,
        deviceFrame,
        setDeviceFrame,
        selectedScreen,
        setSelectedScreen,
        selectedTemplate,
        setSelectedTemplate,
      }}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
}; 