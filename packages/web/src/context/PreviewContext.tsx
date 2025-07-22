import React, {createContext, useContext, useState, ReactNode} from 'react';

export type PreviewMode = 'screens';
export type DeviceFrame = 'iphone' | 'android';
export type ScreenType = 'HomeScreen' | 'SettingsScreen' | 'TemplateIndexScreen';
interface PreviewContextType {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  deviceFrame: DeviceFrame;
  setDeviceFrame: (frame: DeviceFrame) => void;
  selectedScreen: ScreenType | null;
  setSelectedScreen: (screen: ScreenType | null) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('screens');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('iphone');
  const [selectedScreen, setSelectedScreen] = useState<ScreenType | null>('HomeScreen');

  return (
    <PreviewContext.Provider
      value={{
        previewMode,
        setPreviewMode,
        deviceFrame,
        setDeviceFrame,
        selectedScreen,
        setSelectedScreen,
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