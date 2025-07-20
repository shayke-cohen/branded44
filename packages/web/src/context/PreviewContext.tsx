import React, {createContext, useContext, useState, ReactNode} from 'react';

export type PreviewMode = 'screens' | 'sample-apps' | 'templates';
export type ScreenType = 'home' | 'settings' | 'templates';
export type SampleAppType = 'todo' | 'notes' | 'weather' | 'calculator';
export type TemplateType = 'auth' | 'dashboard' | 'form' | 'list' | 'profile';

interface PreviewContextType {
  mode: PreviewMode;
  setMode: (mode: PreviewMode) => void;
  selectedScreen: ScreenType;
  setSelectedScreen: (screen: ScreenType) => void;
  selectedSampleApp: SampleAppType;
  setSelectedSampleApp: (app: SampleAppType) => void;
  selectedTemplate: TemplateType;
  setSelectedTemplate: (template: TemplateType) => void;
  deviceFrame: 'iphone' | 'android';
  setDeviceFrame: (frame: 'iphone' | 'android') => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

interface PreviewProviderProps {
  children: ReactNode;
}

export const PreviewProvider: React.FC<PreviewProviderProps> = ({children}) => {
  const [mode, setMode] = useState<PreviewMode>('screens');
  const [selectedScreen, setSelectedScreen] = useState<ScreenType>('home');
  const [selectedSampleApp, setSelectedSampleApp] = useState<SampleAppType>('todo');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('auth');
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'android'>('iphone');

  return (
    <PreviewContext.Provider
      value={{
        mode,
        setMode,
        selectedScreen,
        setSelectedScreen,
        selectedSampleApp,
        setSelectedSampleApp,
        selectedTemplate,
        setSelectedTemplate,
        deviceFrame,
        setDeviceFrame,
      }}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
}; 