import React, {createContext, useContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotesState,
  NotesContextValue,
  Note,
  Folder,
  NotesFilter,
  NotesStats,
  NoteType,
  FOLDER_COLORS,
  FOLDER_ICONS,
  NOTE_TEMPLATES,
} from '../types';

const STORAGE_KEYS = {
  NOTES: '@NotesApp:notes',
  FOLDERS: '@NotesApp:folders',
  FILTER: '@NotesApp:filter',
  RECENT_SEARCHES: '@NotesApp:recentSearches',
};

type NotesAction =
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'SET_ERROR'; payload: string | null}
  | {type: 'SET_NOTES'; payload: Note[]}
  | {type: 'ADD_NOTE'; payload: Note}
  | {type: 'UPDATE_NOTE'; payload: {id: string; updates: Partial<Note>}}
  | {type: 'DELETE_NOTE'; payload: string}
  | {type: 'DELETE_MULTIPLE_NOTES'; payload: string[]}
  | {type: 'SET_FOLDERS'; payload: Folder[]}
  | {type: 'ADD_FOLDER'; payload: Folder}
  | {type: 'UPDATE_FOLDER'; payload: {id: string; updates: Partial<Folder>}}
  | {type: 'DELETE_FOLDER'; payload: string}
  | {type: 'SET_FILTER'; payload: Partial<NotesFilter>}
  | {type: 'CLEAR_FILTER'}
  | {type: 'SELECT_NOTE'; payload: Note | null}
  | {type: 'SELECT_FOLDER'; payload: Folder | null}
  | {type: 'SET_CREATING'; payload: boolean}
  | {type: 'SET_EDITING'; payload: boolean}
  | {type: 'SET_RECENT_SEARCHES'; payload: string[]}
  | {type: 'ADD_RECENT_SEARCH'; payload: string}
  | {type: 'CLEAR_RECENT_SEARCHES'};

const initialFilter: NotesFilter = {
  searchQuery: '',
  selectedTags: [],
  showPinned: false,
  showFavorites: false,
  showArchived: false,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

const initialState: NotesState = {
  notes: [],
  folders: [],
  filter: initialFilter,
  selectedNote: null,
  selectedFolder: null,
  isCreating: false,
  isEditing: false,
  searchSuggestions: [],
  recentSearches: [],
  loading: false,
  error: null,
};

// Utility functions
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const calculateReadingTime = (wordCount: number): number => {
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
};

const formatNoteContent = (content: string): string => {
  // Basic markdown-like formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting for word count
    .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/`(.*?)`/g, '$1') // Remove code formatting
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/[-*+]\s/g, '') // Remove list bullets
    .replace(/\d+\.\s/g, ''); // Remove numbered list markers
};

const updateFolderNoteCounts = (folders: Folder[], notes: Note[]): Folder[] => {
  return folders.map(folder => ({
    ...folder,
    noteCount: notes.filter(note => note.folderId === folder.id && !note.isArchived).length,
  }));
};

// Sample data generation
const generateSampleNotes = (): Note[] => {
  const now = new Date();
  const sampleNotes: Omit<Note, 'id' | 'wordCount' | 'readingTime'>[] = [
    {
      title: 'Welcome to Notes!',
      content: '# Welcome to Notes App! 📝\n\nThis is your first note. You can:\n\n- **Create** new notes\n- **Organize** with folders\n- **Search** and filter\n- **Pin** important notes\n- **Export** in multiple formats\n\nEnjoy organizing your thoughts!',
      type: 'text',
      tags: ['welcome', 'getting-started'],
      isPinned: true,
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      title: 'Project Ideas',
      content: '# Project Ideas 💡\n\n## Mobile Apps\n- Weather app with beautiful animations\n- Personal finance tracker\n- Habit tracking application\n\n## Web Applications\n- Recipe sharing platform\n- Task management tool\n- Learning management system\n\n## Notes\n- Research trending technologies\n- Consider user experience first\n- Start with MVP approach',
      type: 'text',
      folderId: 'work-folder',
      tags: ['ideas', 'projects', 'development'],
      isPinned: false,
      isFavorite: true,
      isArchived: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      title: 'Shopping List',
      content: '# Shopping List 🛒\n\n- [ ] Milk\n- [ ] Bread\n- [ ] Eggs\n- [ ] Apples\n- [ ] Chicken\n- [ ] Rice\n- [ ] Vegetables\n- [ ] Yogurt\n\n**Don\'t forget the reusable bags!**',
      type: 'checklist',
      folderId: 'personal-folder',
      tags: ['shopping', 'groceries'],
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      title: 'Meeting Notes - Q4 Planning',
      content: '# Q4 Planning Meeting 📊\n\n**Date:** December 15, 2024\n**Attendees:** Team leads, Product Manager\n\n## Key Decisions\n- Launch new feature in January\n- Increase testing coverage to 85%\n- Weekly progress reviews\n\n## Action Items\n- [ ] Create detailed timeline\n- [ ] Assign team resources\n- [ ] Set up monitoring\n\n## Next Meeting\nDecember 22, 2024 at 2:00 PM',
      type: 'text',
      folderId: 'work-folder',
      tags: ['meetings', 'planning', 'q4'],
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Book Recommendations',
      content: '# Must Read Books 📚\n\n## Fiction\n- *The Midnight Library* by Matt Haig\n- *Klara and the Sun* by Kazuo Ishiguro\n- *Project Hail Mary* by Andy Weir\n\n## Non-Fiction\n- *Atomic Habits* by James Clear\n- *Thinking, Fast and Slow* by Daniel Kahneman\n- *Sapiens* by Yuval Noah Harari\n\n## Technical\n- *Clean Code* by Robert Martin\n- *The Pragmatic Programmer* by Hunt & Thomas\n\n*"A reader lives a thousand lives before he dies... The man who never reads lives only one."* - George R.R. Martin',
      type: 'text',
      folderId: 'personal-folder',
      tags: ['books', 'reading', 'recommendations'],
      isPinned: false,
      isFavorite: true,
      isArchived: false,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  return sampleNotes.map(note => {
    const content = formatNoteContent(note.content);
    const wordCount = calculateWordCount(content);
    const readingTime = calculateReadingTime(wordCount);

    return {
      ...note,
      id: generateId(),
      wordCount,
      readingTime,
    };
  });
};

const generateSampleFolders = (): Folder[] => {
  const now = new Date();
  return [
    {
      id: 'work-folder',
      name: 'Work',
      color: FOLDER_COLORS[2], // Blue
      icon: FOLDER_ICONS[4], // 💼
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      noteCount: 0,
    },
    {
      id: 'personal-folder',
      name: 'Personal',
      color: FOLDER_COLORS[3], // Green
      icon: FOLDER_ICONS[15], // 🏠
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      noteCount: 0,
    },
    {
      id: 'ideas-folder',
      name: 'Ideas',
      color: FOLDER_COLORS[4], // Yellow
      icon: FOLDER_ICONS[6], // 💡
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      noteCount: 0,
    },
  ];
};

const notesReducer = (state: NotesState, action: NotesAction): NotesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, loading: action.payload};
    case 'SET_ERROR':
      return {...state, error: action.payload, loading: false};
    case 'SET_NOTES':
      return {...state, notes: action.payload};
    case 'ADD_NOTE':
      return {...state, notes: [action.payload, ...state.notes]};
    case 'UPDATE_NOTE': {
      const updatedNotes = state.notes.map(note =>
        note.id === action.payload.id
          ? {
              ...note,
              ...action.payload.updates,
              updatedAt: new Date(),
              wordCount: action.payload.updates.content
                ? calculateWordCount(formatNoteContent(action.payload.updates.content))
                : note.wordCount,
              readingTime: action.payload.updates.content
                ? calculateReadingTime(calculateWordCount(formatNoteContent(action.payload.updates.content)))
                : note.readingTime,
            }
          : note
      );
      return {...state, notes: updatedNotes};
    }
    case 'DELETE_NOTE':
      return {...state, notes: state.notes.filter(note => note.id !== action.payload)};
    case 'DELETE_MULTIPLE_NOTES':
      return {...state, notes: state.notes.filter(note => !action.payload.includes(note.id))};
    case 'SET_FOLDERS':
      return {...state, folders: action.payload};
    case 'ADD_FOLDER':
      return {...state, folders: [action.payload, ...state.folders]};
    case 'UPDATE_FOLDER': {
      const updatedFolders = state.folders.map(folder =>
        folder.id === action.payload.id ? {...folder, ...action.payload.updates} : folder
      );
      return {...state, folders: updatedFolders};
    }
    case 'DELETE_FOLDER': {
      const folderId = action.payload;
      // Move notes from deleted folder to no folder
      const updatedNotes = state.notes.map(note =>
        note.folderId === folderId ? {...note, folderId: undefined} : note
      );
      const updatedFolders = state.folders.filter(folder => folder.id !== folderId);
      return {...state, notes: updatedNotes, folders: updatedFolders};
    }
    case 'SET_FILTER':
      return {...state, filter: {...state.filter, ...action.payload}};
    case 'CLEAR_FILTER':
      return {...state, filter: initialFilter};
    case 'SELECT_NOTE':
      return {...state, selectedNote: action.payload};
    case 'SELECT_FOLDER':
      return {...state, selectedFolder: action.payload};
    case 'SET_CREATING':
      return {...state, isCreating: action.payload};
    case 'SET_EDITING':
      return {...state, isEditing: action.payload};
    case 'SET_RECENT_SEARCHES':
      return {...state, recentSearches: action.payload};
    case 'ADD_RECENT_SEARCH': {
      const newSearches = [action.payload, ...state.recentSearches.filter(s => s !== action.payload)].slice(0, 10);
      return {...state, recentSearches: newSearches};
    }
    case 'CLEAR_RECENT_SEARCHES':
      return {...state, recentSearches: []};
    default:
      return state;
  }
};

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export const NotesProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveNotes();
  }, [state.notes]);

  useEffect(() => {
    saveFolders();
  }, [state.folders]);

  useEffect(() => {
    saveRecentSearches();
  }, [state.recentSearches]);

  const loadData = async () => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});

      // Load notes
      const notesJson = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      let notes: Note[] = [];
      if (notesJson) {
        notes = JSON.parse(notesJson).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
      } else {
        // Generate sample data for first time
        notes = generateSampleNotes();
      }

      // Load folders
      const foldersJson = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);
      let folders: Folder[] = [];
      if (foldersJson) {
        folders = JSON.parse(foldersJson).map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
        }));
      } else {
        // Generate sample folders for first time
        folders = generateSampleFolders();
      }

      // Update folder note counts
      folders = updateFolderNoteCounts(folders, notes);

      // Load recent searches
      const recentSearchesJson = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      const recentSearches = recentSearchesJson ? JSON.parse(recentSearchesJson) : [];

      dispatch({type: 'SET_NOTES', payload: notes});
      dispatch({type: 'SET_FOLDERS', payload: folders});
      dispatch({type: 'SET_RECENT_SEARCHES', payload: recentSearches});
    } catch (error) {
      console.error('Failed to load notes data:', error);
      dispatch({type: 'SET_ERROR', payload: 'Failed to load data'});
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const saveNotes = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(state.notes));
      // Update folder counts when notes change
      const updatedFolders = updateFolderNoteCounts(state.folders, state.notes);
      dispatch({type: 'SET_FOLDERS', payload: updatedFolders});
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const saveFolders = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(state.folders));
    } catch (error) {
      console.error('Failed to save folders:', error);
    }
  };

  const saveRecentSearches = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(state.recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  };

  // Note operations
  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime'>) => {
    const now = new Date();
    const content = formatNoteContent(noteData.content);
    const wordCount = calculateWordCount(content);
    const readingTime = calculateReadingTime(wordCount);

    const newNote: Note = {
      ...noteData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      wordCount,
      readingTime,
    };

    dispatch({type: 'ADD_NOTE', payload: newNote});
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    dispatch({type: 'UPDATE_NOTE', payload: {id, updates}});
  };

  const deleteNote = (id: string) => {
    dispatch({type: 'DELETE_NOTE', payload: id});
  };

  const duplicateNote = (id: string) => {
    const originalNote = state.notes.find(note => note.id === id);
    if (originalNote) {
      addNote({
        ...originalNote,
        title: `${originalNote.title} (Copy)`,
        isPinned: false,
        isFavorite: false,
      });
    }
  };

  const togglePinNote = (id: string) => {
    const note = state.notes.find(n => n.id === id);
    if (note) {
      updateNote(id, {isPinned: !note.isPinned});
    }
  };

  const toggleFavoriteNote = (id: string) => {
    const note = state.notes.find(n => n.id === id);
    if (note) {
      updateNote(id, {isFavorite: !note.isFavorite});
    }
  };

  const archiveNote = (id: string) => {
    updateNote(id, {isArchived: true, isPinned: false});
  };

  const unarchiveNote = (id: string) => {
    updateNote(id, {isArchived: false});
  };

  // Folder operations
  const addFolder = (folderData: Omit<Folder, 'id' | 'createdAt' | 'noteCount'>) => {
    const newFolder: Folder = {
      ...folderData,
      id: generateId(),
      createdAt: new Date(),
      noteCount: 0,
    };

    dispatch({type: 'ADD_FOLDER', payload: newFolder});
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    dispatch({type: 'UPDATE_FOLDER', payload: {id, updates}});
  };

  const deleteFolder = (id: string) => {
    dispatch({type: 'DELETE_FOLDER', payload: id});
  };

  const moveNoteToFolder = (noteId: string, folderId?: string) => {
    updateNote(noteId, {folderId});
  };

  // Navigation and selection
  const selectNote = (note: Note | null) => {
    dispatch({type: 'SELECT_NOTE', payload: note});
  };

  const selectFolder = (folder: Folder | null) => {
    dispatch({type: 'SELECT_FOLDER', payload: folder});
  };

  const startCreating = () => {
    dispatch({type: 'SET_CREATING', payload: true});
    dispatch({type: 'SET_EDITING', payload: false});
    dispatch({type: 'SELECT_NOTE', payload: null});
  };

  const startEditing = (note: Note) => {
    dispatch({type: 'SELECT_NOTE', payload: note});
    dispatch({type: 'SET_EDITING', payload: true});
    dispatch({type: 'SET_CREATING', payload: false});
  };

  const cancelEditing = () => {
    dispatch({type: 'SET_CREATING', payload: false});
    dispatch({type: 'SET_EDITING', payload: false});
    dispatch({type: 'SELECT_NOTE', payload: null});
  };

  // Search and filtering
  const setFilter = (filter: Partial<NotesFilter>) => {
    dispatch({type: 'SET_FILTER', payload: filter});
  };

  const clearFilter = () => {
    dispatch({type: 'CLEAR_FILTER'});
  };

  const addRecentSearch = (query: string) => {
    if (query.trim()) {
      dispatch({type: 'ADD_RECENT_SEARCH', payload: query.trim()});
    }
  };

  const clearRecentSearches = () => {
    dispatch({type: 'CLEAR_RECENT_SEARCHES'});
  };

  // Bulk operations
  const deleteMultipleNotes = (noteIds: string[]) => {
    dispatch({type: 'DELETE_MULTIPLE_NOTES', payload: noteIds});
  };

  const moveMultipleNotes = (noteIds: string[], folderId?: string) => {
    noteIds.forEach(noteId => moveNoteToFolder(noteId, folderId));
  };

  const archiveMultipleNotes = (noteIds: string[]) => {
    noteIds.forEach(noteId => archiveNote(noteId));
  };

  // Data operations
  const exportNote = (noteId: string, format: 'txt' | 'md' | 'json'): string => {
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return '';

    switch (format) {
      case 'txt':
        return `${note.title}\n\n${note.content}`;
      case 'md':
        return `# ${note.title}\n\n${note.content}`;
      case 'json':
        return JSON.stringify(note, null, 2);
      default:
        return note.content;
    }
  };

  const importNotes = (data: string, format: 'txt' | 'md' | 'json') => {
    try {
      if (format === 'json') {
        const importedData = JSON.parse(data);
        if (Array.isArray(importedData)) {
          importedData.forEach((noteData: any) => {
            addNote({
              title: noteData.title || 'Imported Note',
              content: noteData.content || '',
              type: noteData.type || 'text',
              tags: noteData.tags || [],
              isPinned: false,
              isFavorite: false,
              isArchived: false,
            });
          });
        } else {
          addNote({
            title: importedData.title || 'Imported Note',
            content: importedData.content || data,
            type: 'text',
            tags: [],
            isPinned: false,
            isFavorite: false,
            isArchived: false,
          });
        }
      } else {
        addNote({
          title: `Imported ${format.toUpperCase()} Note`,
          content: data,
          type: 'text',
          tags: ['imported'],
          isPinned: false,
          isFavorite: false,
          isArchived: false,
        });
      }
    } catch (error) {
      console.error('Failed to import notes:', error);
      dispatch({type: 'SET_ERROR', payload: 'Failed to import notes'});
    }
  };

  const getStats = (): NotesStats => {
    const notes = state.notes;
    const folders = state.folders;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalNotes = notes.filter(n => !n.isArchived).length;
    const totalWords = notes.filter(n => !n.isArchived).reduce((sum, note) => sum + note.wordCount, 0);
    const pinnedNotes = notes.filter(n => n.isPinned && !n.isArchived).length;
    const favoriteNotes = notes.filter(n => n.isFavorite && !n.isArchived).length;
    const archivedNotes = notes.filter(n => n.isArchived).length;

    const byType: Record<NoteType, number> = {
      text: notes.filter(n => n.type === 'text' && !n.isArchived).length,
      checklist: notes.filter(n => n.type === 'checklist' && !n.isArchived).length,
      sketch: notes.filter(n => n.type === 'sketch' && !n.isArchived).length,
    };

    const byFolder: Record<string, number> = {};
    folders.forEach(folder => {
      byFolder[folder.name] = notes.filter(n => n.folderId === folder.id && !n.isArchived).length;
    });

    const notesCreatedToday = notes.filter(n => {
      const createdDate = new Date(n.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    }).length;

    const notesModifiedToday = notes.filter(n => {
      const modifiedDate = new Date(n.updatedAt);
      modifiedDate.setHours(0, 0, 0, 0);
      return modifiedDate.getTime() === today.getTime();
    }).length;

    const averageWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

    return {
      totalNotes,
      totalWords,
      totalFolders: folders.length,
      pinnedNotes,
      favoriteNotes,
      archivedNotes,
      byType,
      byFolder,
      recentActivity: {
        notesCreatedToday,
        notesModifiedToday,
        averageWordsPerNote,
      },
    };
  };

  const clearError = () => {
    dispatch({type: 'SET_ERROR', payload: null});
  };

  const value: NotesContextValue = {
    ...state,
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    togglePinNote,
    toggleFavoriteNote,
    archiveNote,
    unarchiveNote,
    addFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    selectNote,
    selectFolder,
    startCreating,
    startEditing,
    cancelEditing,
    setFilter,
    clearFilter,
    addRecentSearch,
    clearRecentSearches,
    deleteMultipleNotes,
    moveMultipleNotes,
    archiveMultipleNotes,
    exportNote,
    importNotes,
    getStats,
    clearError,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = (): NotesContextValue => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}; 