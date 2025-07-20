import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import {useTheme} from '../../../context';
import {useNotes} from '../context/NotesContext';
import {Note, Folder, NotesFilter, NOTE_TEMPLATES} from '../types';

const {width} = Dimensions.get('window');

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onLongPress: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({note, onPress, onLongPress}) => {
  const {theme} = useTheme();
  const colors = theme.colors;
  const {folders} = useNotes();
  
  const folder = folders.find(f => f.id === note.folderId);
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], {weekday: 'short'});
    } else {
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
  };

  const getPreviewText = (content: string) => {
    // Remove markdown formatting and get first 2 lines
    const cleanText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/[-*+]\s/g, '') // Remove bullets
      .replace(/\d+\.\s/g, '') // Remove numbers
      .trim();
    
    const lines = cleanText.split('\n').filter(line => line.trim());
    return lines.slice(0, 2).join(' ').substring(0, 120) + (cleanText.length > 120 ? '...' : '');
  };

  return (
    <TouchableOpacity
      style={[
        styles.noteCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: note.isPinned ? colors.primary : 
                          note.isFavorite ? '#FFD700' : 
                          folder?.color || colors.border,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteTitleContainer}>
          <Text style={[styles.noteTitle, {color: colors.text}]} numberOfLines={1}>
            {note.title || 'Untitled'}
          </Text>
          <View style={styles.noteIcons}>
            {note.isPinned && <Text style={styles.iconText}>📌</Text>}
            {note.isFavorite && <Text style={styles.iconText}>⭐</Text>}
            {note.type === 'checklist' && <Text style={styles.iconText}>✅</Text>}
          </View>
        </View>
        <Text style={[styles.noteDate, {color: colors.textSecondary}]}>
          {formatDate(note.updatedAt)}
        </Text>
      </View>
      
      {note.content.trim() && (
        <Text style={[styles.notePreview, {color: colors.textSecondary}]} numberOfLines={2}>
          {getPreviewText(note.content)}
        </Text>
      )}
      
      <View style={styles.noteFooter}>
        <View style={styles.noteMetadata}>
          {folder && (
            <View style={[styles.folderChip, {backgroundColor: folder.color + '20'}]}>
              <Text style={styles.folderIcon}>{folder.icon}</Text>
              <Text style={[styles.folderName, {color: folder.color}]}>{folder.name}</Text>
            </View>
          )}
          {note.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {note.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={[styles.tagChip, {backgroundColor: colors.primary + '20'}]}>
                  <Text style={[styles.tagText, {color: colors.primary}]}>#{tag}</Text>
                </View>
              ))}
              {note.tags.length > 2 && (
                <Text style={[styles.moreTagsText, {color: colors.textSecondary}]}>
                  +{note.tags.length - 2}
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.wordCountContainer}>
          <Text style={[styles.wordCount, {color: colors.textSecondary}]}>
            {note.wordCount} words · {note.readingTime}m read
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filter: NotesFilter;
  onFilterChange: (filter: Partial<NotesFilter>) => void;
  folders: Folder[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filter,
  onFilterChange,
  folders,
}) => {
  const {theme} = useTheme();
  const colors = theme.colors;

  const sortOptions = [
    {key: 'updatedAt', label: 'Last Modified'},
    {key: 'createdAt', label: 'Date Created'},
    {key: 'title', label: 'Title'},
    {key: 'wordCount', label: 'Word Count'},
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, {backgroundColor: colors.background}]}>
        <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
          <Text style={[styles.modalTitle, {color: colors.text}]}>Filter & Sort</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalCloseButton, {color: colors.primary}]}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Quick Filters */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, {color: colors.text}]}>Quick Filters</Text>
            <View style={styles.filterOptionsRow}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: filter.showPinned ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onFilterChange({showPinned: !filter.showPinned})}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    {color: filter.showPinned ? 'white' : colors.text},
                  ]}
                >
                  📌 Pinned
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: filter.showFavorites ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onFilterChange({showFavorites: !filter.showFavorites})}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    {color: filter.showFavorites ? 'white' : colors.text},
                  ]}
                >
                  ⭐ Favorites
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: filter.showArchived ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onFilterChange({showArchived: !filter.showArchived})}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    {color: filter.showArchived ? 'white' : colors.text},
                  ]}
                >
                  📦 Archived
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Folders */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, {color: colors.text}]}>Folders</Text>
            <View style={styles.foldersList}>
              <TouchableOpacity
                style={[
                  styles.folderFilterOption,
                  {
                    backgroundColor: !filter.selectedFolderId ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onFilterChange({selectedFolderId: undefined})}
              >
                <Text
                  style={[
                    styles.folderFilterText,
                    {color: !filter.selectedFolderId ? 'white' : colors.text},
                  ]}
                >
                  📁 All Notes
                </Text>
              </TouchableOpacity>
              {folders.map(folder => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderFilterOption,
                    {
                      backgroundColor: filter.selectedFolderId === folder.id ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => onFilterChange({selectedFolderId: folder.id})}
                >
                  <Text
                    style={[
                      styles.folderFilterText,
                      {color: filter.selectedFolderId === folder.id ? 'white' : colors.text},
                    ]}
                  >
                    {folder.icon} {folder.name} ({folder.noteCount})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, {color: colors.text}]}>Sort By</Text>
            <View style={styles.sortOptions}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor: filter.sortBy === option.key ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => onFilterChange({sortBy: option.key as any})}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      {color: filter.sortBy === option.key ? 'white' : colors.text},
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sortOrderContainer}>
              <TouchableOpacity
                style={[
                  styles.sortOrderOption,
                  {
                    backgroundColor: filter.sortOrder === 'desc' ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onFilterChange({sortOrder: 'desc'})}
              >
                <Text
                  style={[
                    styles.sortOrderText,
                    {color: filter.sortOrder === 'desc' ? 'white' : colors.text},
                  ]}
                >
                  ↓ Descending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortOrderOption,
                  {
                    backgroundColor: filter.sortOrder === 'asc' ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onFilterChange({sortOrder: 'asc'})}
              >
                <Text
                  style={[
                    styles.sortOrderText,
                    {color: filter.sortOrder === 'asc' ? 'white' : colors.text},
                  ]}
                >
                  ↑ Ascending
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const NotesScreen: React.FC = () => {
  const {theme} = useTheme();
  const colors = theme.colors;
  const {
    notes,
    folders,
    filter,
    loading,
    error,
    setFilter,
    clearFilter,
    startCreating,
    startEditing,
    deleteNote,
    togglePinNote,
    toggleFavoriteNote,
    addRecentSearch,
  } = useNotes();

  const [searchText, setSearchText] = useState(filter.searchQuery);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    setFilter({searchQuery: searchText});
    if (searchText.trim()) {
      addRecentSearch(searchText);
    }
  }, [searchText]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSelectionMode ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSelectionMode]);

  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      // Search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        if (
          !note.title.toLowerCase().includes(query) &&
          !note.content.toLowerCase().includes(query) &&
          !note.tags.some(tag => tag.toLowerCase().includes(query))
        ) {
          return false;
        }
      }

      // Folder filter
      if (filter.selectedFolderId && note.folderId !== filter.selectedFolderId) {
        return false;
      }

      // Type filter
      if (filter.noteType && note.type !== filter.noteType) {
        return false;
      }

      // Status filters
      if (filter.showPinned && !note.isPinned) return false;
      if (filter.showFavorites && !note.isFavorite) return false;
      if (filter.showArchived !== note.isArchived) return false;

      // Tags filter
      if (filter.selectedTags.length > 0) {
        if (!filter.selectedTags.some(tag => note.tags.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    // Sort notes
    filtered.sort((a, b) => {
      const aValue = a[filter.sortBy] as any;
      const bValue = b[filter.sortBy] as any;

      if (filter.sortBy === 'title') {
        return filter.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (filter.sortBy === 'createdAt' || filter.sortBy === 'updatedAt') {
        const aTime = new Date(aValue).getTime();
        const bTime = new Date(bValue).getTime();
        return filter.sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // For numbers (wordCount)
      return filter.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Always show pinned notes first
    const pinnedNotes = filtered.filter(note => note.isPinned);
    const unpinnedNotes = filtered.filter(note => !note.isPinned);
    
    return [...pinnedNotes, ...unpinnedNotes];
  }, [notes, filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotePress = (note: Note) => {
    if (isSelectionMode) {
      toggleNoteSelection(note.id);
    } else {
      startEditing(note);
    }
  };

  const handleNoteLongPress = (note: Note) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedNotes([note.id]);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedNotes([]);
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Notes',
      `Are you sure you want to delete ${selectedNotes.length} note(s)?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedNotes.forEach(noteId => deleteNote(noteId));
            exitSelectionMode();
          },
        },
      ]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filter.searchQuery) count++;
    if (filter.selectedFolderId) count++;
    if (filter.showPinned) count++;
    if (filter.showFavorites) count++;
    if (filter.showArchived) count++;
    if (filter.selectedTags.length > 0) count++;
    return count;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>
        {filter.searchQuery || getActiveFiltersCount() > 0 ? 'No notes found' : 'No notes yet'}
      </Text>
      <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
        {filter.searchQuery || getActiveFiltersCount() > 0 
          ? 'Try adjusting your search or filters'
          : 'Tap the + button to create your first note'
        }
      </Text>
      {(filter.searchQuery || getActiveFiltersCount() > 0) && (
        <TouchableOpacity
          style={[styles.clearFiltersButton, {backgroundColor: colors.primary}]}
          onPress={clearFilter}
        >
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNoteItem = ({item}: {item: Note}) => (
    <NoteCard
      note={item}
      onPress={() => handleNotePress(item)}
      onLongPress={() => handleNoteLongPress(item)}
    />
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Notes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, {backgroundColor: colors.background}]}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.filterButtonText}>🔧</Text>
            {getActiveFiltersCount() > 0 && (
              <View style={[styles.filterBadge, {backgroundColor: colors.primary}]}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <View style={[styles.searchBar, {backgroundColor: colors.background, borderColor: colors.border}]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder="Search notes..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchText('')}
            >
              <Text style={[styles.clearSearchText, {color: colors.textSecondary}]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <Animated.View
          style={[
            styles.selectionHeader,
            {
              backgroundColor: colors.primary,
              transform: [{translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-60, 0],
              })}],
            },
          ]}
        >
          <View style={styles.selectionHeaderContent}>
            <TouchableOpacity style={styles.selectionAction} onPress={exitSelectionMode}>
              <Text style={styles.selectionActionText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.selectionTitle}>
              {selectedNotes.length} selected
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity style={styles.selectionAction} onPress={handleBulkDelete}>
                <Text style={styles.selectionActionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notesList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Floating Action Button */}
      {!isSelectionMode && (
        <TouchableOpacity
          style={[styles.fab, {backgroundColor: colors.primary}]}
          onPress={startCreating}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filter={filter}
        onFilterChange={setFilter}
        folders={folders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterButtonText: {
    fontSize: 18,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 16,
  },
  selectionHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 44, // Status bar height
  },
  selectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectionActionText: {
    color: 'white',
    fontSize: 18,
  },
  notesList: {
    padding: 20,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  noteIcons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconText: {
    fontSize: 12,
    marginLeft: 4,
  },
  noteDate: {
    fontSize: 12,
    marginLeft: 8,
  },
  notePreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  noteMetadata: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  folderIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  folderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    marginLeft: 4,
  },
  wordCountContainer: {
    alignItems: 'flex-end',
  },
  wordCount: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  foldersList: {
    gap: 8,
  },
  folderFilterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  folderFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortOptions: {
    gap: 8,
    marginBottom: 12,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortOrderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOrderOption: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sortOrderText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 