export type NoteType = 'text' | 'checklist' | 'sketch';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  folderId?: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  readingTime: number; // in minutes
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId?: string;
  createdAt: Date;
  noteCount: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface TextFormatting {
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  isStrikethrough: boolean;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  listType: 'none' | 'bullet' | 'numbered';
}

export interface NotesFilter {
  searchQuery: string;
  selectedFolderId?: string;
  selectedTags: string[];
  noteType?: NoteType;
  showPinned: boolean;
  showFavorites: boolean;
  showArchived: boolean;
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'wordCount';
  sortOrder: 'asc' | 'desc';
}

export interface NotesStats {
  totalNotes: number;
  totalWords: number;
  totalFolders: number;
  pinnedNotes: number;
  favoriteNotes: number;
  archivedNotes: number;
  byType: Record<NoteType, number>;
  byFolder: Record<string, number>;
  recentActivity: {
    notesCreatedToday: number;
    notesModifiedToday: number;
    averageWordsPerNote: number;
  };
}

export interface NotesState {
  notes: Note[];
  folders: Folder[];
  filter: NotesFilter;
  selectedNote: Note | null;
  selectedFolder: Folder | null;
  isCreating: boolean;
  isEditing: boolean;
  searchSuggestions: string[];
  recentSearches: string[];
  loading: boolean;
  error: string | null;
}

export interface NotesContextValue extends NotesState {
  // Note operations
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  
  // Folder operations
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'noteCount'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  moveNoteToFolder: (noteId: string, folderId?: string) => void;
  
  // Navigation and selection
  selectNote: (note: Note | null) => void;
  selectFolder: (folder: Folder | null) => void;
  startCreating: () => void;
  startEditing: (note: Note) => void;
  cancelEditing: () => void;
  
  // Search and filtering
  setFilter: (filter: Partial<NotesFilter>) => void;
  clearFilter: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Bulk operations
  deleteMultipleNotes: (noteIds: string[]) => void;
  moveMultipleNotes: (noteIds: string[], folderId?: string) => void;
  archiveMultipleNotes: (noteIds: string[]) => void;
  
  // Data operations
  exportNote: (noteId: string, format: 'txt' | 'md' | 'json') => string;
  importNotes: (data: string, format: 'txt' | 'md' | 'json') => void;
  getStats: () => NotesStats;
  
  // Utility
  clearError: () => void;
}

// Predefined folder colors and icons
export const FOLDER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#F39C12', // Orange
  '#A569BD', // Purple
  '#5DADE2', // Light Blue
  '#58D68D', // Light Green
];

export const FOLDER_ICONS = [
  '📁', '📂', '📋', '📝', '💼', '🎯', '💡', '🔖', 
  '🎨', '📚', '🔬', '💻', '🎵', '📷', '✈️', '🏠',
  '💰', '🎓', '🍕', '⚽', '🌟', '🔥', '💎', '🚀'
];

// Note templates for quick creation
export const NOTE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Note',
    icon: '📝',
    content: '',
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: '🤝',
    content: '# Meeting Notes\n\n**Date:** \n**Attendees:** \n**Agenda:** \n\n## Discussion Points\n\n## Action Items\n\n## Next Steps\n',
  },
  {
    id: 'todo',
    name: 'To-Do List',
    icon: '✅',
    content: '# To-Do List\n\n- [ ] \n- [ ] \n- [ ] \n',
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    icon: '📖',
    content: '# Daily Journal\n\n**Date:** \n\n## How I\'m Feeling\n\n## What Happened Today\n\n## Grateful For\n\n## Tomorrow\'s Goals\n',
  },
  {
    id: 'recipe',
    name: 'Recipe',
    icon: '🍳',
    content: '# Recipe Name\n\n**Prep Time:** \n**Cook Time:** \n**Servings:** \n\n## Ingredients\n\n## Instructions\n\n## Notes\n',
  },
  {
    id: 'travel',
    name: 'Travel Plan',
    icon: '✈️',
    content: '# Travel Itinerary\n\n**Destination:** \n**Dates:** \n\n## Transportation\n\n## Accommodation\n\n## Activities\n\n## Packing List\n',
  },
];

// Export formats
export const EXPORT_FORMATS = [
  { id: 'txt', name: 'Plain Text (.txt)', extension: 'txt' },
  { id: 'md', name: 'Markdown (.md)', extension: 'md' },
  { id: 'json', name: 'JSON (.json)', extension: 'json' },
];

// Search suggestions based on common note categories
export const SEARCH_SUGGESTIONS = [
  'meeting notes', 'todo', 'ideas', 'recipes', 'travel', 'work', 'personal',
  'important', 'draft', 'review', 'project', 'shopping', 'goals', 'quotes'
]; 