import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface ComponentNode {
  id: string;
  type: string;
  name?: string;
  filePath?: string;
  props?: Record<string, any>;
  children?: ComponentNode[];
  parent?: string;
  expanded?: boolean;
}

export interface EditorState {
  selectedComponent: string | null; // Changed to component ID for LiveRenderer
  componentTree: ComponentNode[];
  currentScreen: string | null;
  currentTabId: string | null; // Active tab ID for mobile app navigation
  isInspecting: boolean;
  isDragging: boolean;
  src2Status: 'initializing' | 'ready' | 'error';
  fileTree: FileNode[];
  openFiles: string[];
  activeFile: string | null;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  isOpen?: boolean;
}

type EditorAction =
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'UPDATE_COMPONENT_TREE'; payload: ComponentNode[] }
  | { type: 'SET_CURRENT_SCREEN'; payload: string }
  | { type: 'SET_CURRENT_TAB'; payload: string }
  | { type: 'TOGGLE_INSPECTION'; payload?: boolean }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_SRC2_STATUS'; payload: EditorState['src2Status'] }
  | { type: 'UPDATE_FILE_TREE'; payload: FileNode[] }
  | { type: 'OPEN_FILE'; payload: string }
  | { type: 'CLOSE_FILE'; payload: string }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'UPDATE_COMPONENT_PROPS'; payload: { id: string; props: Record<string, any> } };

const initialState: EditorState = {
  selectedComponent: null,
  componentTree: [],
  currentScreen: null,
  currentTabId: null,
  isInspecting: false,
  isDragging: false,
  src2Status: 'initializing',
  fileTree: [],
  openFiles: [],
  activeFile: null,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT_COMPONENT':
      return {
        ...state,
        selectedComponent: action.payload,
      };

    case 'UPDATE_COMPONENT_TREE':
      return {
        ...state,
        componentTree: action.payload,
      };

    case 'SET_CURRENT_SCREEN':
      return {
        ...state,
        currentScreen: action.payload,
      };

    case 'SET_CURRENT_TAB':
      return {
        ...state,
        currentTabId: action.payload,
      };

    case 'TOGGLE_INSPECTION':
      return {
        ...state,
        isInspecting: action.payload !== undefined ? action.payload : !state.isInspecting,
      };

    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.payload,
      };

    case 'SET_SRC2_STATUS':
      return {
        ...state,
        src2Status: action.payload,
      };

    case 'UPDATE_FILE_TREE':
      return {
        ...state,
        fileTree: action.payload,
      };

    case 'OPEN_FILE':
      return {
        ...state,
        openFiles: state.openFiles.includes(action.payload)
          ? state.openFiles
          : [...state.openFiles, action.payload],
        activeFile: action.payload,
      };

    case 'CLOSE_FILE':
      const newOpenFiles = state.openFiles.filter(file => file !== action.payload);
      return {
        ...state,
        openFiles: newOpenFiles,
        activeFile: state.activeFile === action.payload
          ? newOpenFiles[newOpenFiles.length - 1] || null
          : state.activeFile,
      };

    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFile: action.payload,
      };

    case 'UPDATE_COMPONENT_PROPS':
      const updateComponentInTree = (nodes: ComponentNode[]): ComponentNode[] => {
        return nodes.map(node => {
          if (node.id === action.payload.id) {
            return {
              ...node,
              props: { ...node.props, ...action.payload.props },
            };
          }
          if (node.children) {
            return {
              ...node,
              children: updateComponentInTree(node.children),
            };
          }
          return node;
        });
      };

      return {
        ...state,
        componentTree: updateComponentInTree(state.componentTree),
        // selectedComponent is now just an ID string, so we don't update it here
        selectedComponent: state.selectedComponent,
      };

    default:
      return state;
  }
}

interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Helper functions
  selectComponent: (componentId: string | null) => void;
  updateComponentTree: (tree: ComponentNode[]) => void;
  setCurrentScreen: (screen: string) => void;
  setCurrentTab: (tabId: string) => void;
  toggleInspection: (enabled?: boolean) => void;
  setDragging: (isDragging: boolean) => void;
  setSrc2Status: (status: EditorState['src2Status']) => void;
  updateFileTree: (tree: FileNode[]) => void;
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  setActiveFile: (filePath: string | null) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Helper functions
  const selectComponent = (componentId: string | null) => {
    dispatch({ type: 'SELECT_COMPONENT', payload: componentId });
  };

  const updateComponentTree = (tree: ComponentNode[]) => {
    dispatch({ type: 'UPDATE_COMPONENT_TREE', payload: tree });
  };

  const setCurrentScreen = (screen: string) => {
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: screen });
  };

  const setCurrentTab = (tabId: string) => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: tabId });
  };

  const toggleInspection = (enabled?: boolean) => {
    dispatch({ type: 'TOGGLE_INSPECTION', payload: enabled });
  };

  const setDragging = (isDragging: boolean) => {
    dispatch({ type: 'SET_DRAGGING', payload: isDragging });
  };

  const setSrc2Status = (status: EditorState['src2Status']) => {
    dispatch({ type: 'SET_SRC2_STATUS', payload: status });
  };

  const updateFileTree = (tree: FileNode[]) => {
    dispatch({ type: 'UPDATE_FILE_TREE', payload: tree });
  };

  const openFile = (filePath: string) => {
    dispatch({ type: 'OPEN_FILE', payload: filePath });
  };

  const closeFile = (filePath: string) => {
    dispatch({ type: 'CLOSE_FILE', payload: filePath });
  };

  const setActiveFile = (filePath: string | null) => {
    dispatch({ type: 'SET_ACTIVE_FILE', payload: filePath });
  };

  const updateComponentProps = (id: string, props: Record<string, any>) => {
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', payload: { id, props } });
  };

  const contextValue: EditorContextType = {
    state,
    dispatch,
    selectComponent,
    updateComponentTree,
    setCurrentScreen,
    setCurrentTab,
    toggleInspection,
    setDragging,
    setSrc2Status,
    updateFileTree,
    openFile,
    closeFile,
    setActiveFile,
    updateComponentProps,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
