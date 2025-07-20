import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {useTheme} from '../../../context';
import {useNotes} from '../context/NotesContext';
import {
  Note,
  Folder,
  NoteType,
  TextFormatting,
  NOTE_TEMPLATES,
  FOLDER_COLORS,
  FOLDER_ICONS,
  EXPORT_FORMATS,
} from '../types';

const {width, height} = Dimensions.get('window');

interface FormattingBarProps {
  formatting: TextFormatting;
  onFormattingChange: (formatting: Partial<TextFormatting>) => void;
}

const FormattingBar: React.FC<FormattingBarProps> = ({formatting, onFormattingChange}) => {
  const {theme} = useTheme();
  const colors = theme.colors;

  const formatButtons = [
    {key: 'bold', icon: 'B', active: formatting.isBold},
    {key: 'italic', icon: 'I', active: formatting.isItalic},
    {key: 'underline', icon: 'U', active: formatting.isUnderlined},
    {key: 'strikethrough', icon: 'S', active: formatting.isStrikethrough},
  ];

  const alignmentButtons = [
    {key: 'left', icon: '⬅️', value: 'left' as const},
    {key: 'center', icon: '↔️', value: 'center' as const},
    {key: 'right', icon: '➡️', value: 'right' as const},
  ];

  const listButtons = [
    {key: 'bullet', icon: '•', value: 'bullet' as const},
    {key: 'numbered', icon: '1.', value: 'numbered' as const},
  ];

  return (
    <View style={[styles.formattingBar, {backgroundColor: colors.surface, borderTopColor: colors.border}]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formattingContent}>
        {/* Text Formatting */}
        <View style={styles.formattingGroup}>
          {formatButtons.map(button => (
            <TouchableOpacity
              key={button.key}
              style={[
                styles.formatButton,
                {
                  backgroundColor: button.active ? colors.primary : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                switch (button.key) {
                  case 'bold':
                    onFormattingChange({isBold: !formatting.isBold});
                    break;
                  case 'italic':
                    onFormattingChange({isItalic: !formatting.isItalic});
                    break;
                  case 'underline':
                    onFormattingChange({isUnderlined: !formatting.isUnderlined});
                    break;
                  case 'strikethrough':
                    onFormattingChange({isStrikethrough: !formatting.isStrikethrough});
                    break;
                }
              }}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  {
                    color: button.active ? 'white' : colors.text,
                    fontWeight: button.key === 'bold' ? 'bold' : 'normal',
                    fontStyle: button.key === 'italic' ? 'italic' : 'normal',
                    textDecorationLine: button.key === 'underline' ? 'underline' : 
                                       button.key === 'strikethrough' ? 'line-through' : 'none',
                  },
                ]}
              >
                {button.icon}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={[styles.divider, {backgroundColor: colors.border}]} />

        {/* Text Alignment */}
        <View style={styles.formattingGroup}>
          {alignmentButtons.map(button => (
            <TouchableOpacity
              key={button.key}
              style={[
                styles.formatButton,
                {
                  backgroundColor: formatting.textAlign === button.value ? colors.primary : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onFormattingChange({textAlign: button.value})}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  {color: formatting.textAlign === button.value ? 'white' : colors.text},
                ]}
              >
                {button.icon}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={[styles.divider, {backgroundColor: colors.border}]} />

        {/* Lists */}
        <View style={styles.formattingGroup}>
          {listButtons.map(button => (
            <TouchableOpacity
              key={button.key}
              style={[
                styles.formatButton,
                {
                  backgroundColor: formatting.listType === button.value ? colors.primary : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => 
                onFormattingChange({
                  listType: formatting.listType === button.value ? 'none' : button.value
                })
              }
            >
              <Text
                style={[
                  styles.formatButtonText,
                  {color: formatting.listType === button.value ? 'white' : colors.text},
                ]}
              >
                {button.icon}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Font Size */}
        <View style={[styles.divider, {backgroundColor: colors.border}]} />
        <View style={styles.formattingGroup}>
          <TouchableOpacity
            style={[styles.formatButton, {borderColor: colors.border}]}
            onPress={() => onFormattingChange({fontSize: Math.max(12, formatting.fontSize - 2)})}
          >
            <Text style={[styles.formatButtonText, {color: colors.text}]}>A-</Text>
          </TouchableOpacity>
          <Text style={[styles.fontSizeText, {color: colors.text}]}>{formatting.fontSize}</Text>
          <TouchableOpacity
            style={[styles.formatButton, {borderColor: colors.border}]}
            onPress={() => onFormattingChange({fontSize: Math.min(24, formatting.fontSize + 2)})}
          >
            <Text style={[styles.formatButtonText, {color: colors.text}]}>A+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

interface TemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({visible, onClose, onSelectTemplate}) => {
  const {theme} = useTheme();
  const colors = theme.colors;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, {backgroundColor: colors.background}]}>
        <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
          <Text style={[styles.modalTitle, {color: colors.text}]}>Choose Template</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalCloseButton, {color: colors.primary}]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.templatesContainer}>
          {NOTE_TEMPLATES.map(template => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateOption, {backgroundColor: colors.surface, borderColor: colors.border}]}
              onPress={() => {
                onSelectTemplate(template);
                onClose();
              }}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <Text style={[styles.templateName, {color: colors.text}]}>{template.name}</Text>
              </View>
              {template.content && (
                <Text style={[styles.templatePreview, {color: colors.textSecondary}]} numberOfLines={3}>
                  {template.content.substring(0, 150)}...
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

interface FolderModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFolderId?: string;
  onSelectFolder: (folderId?: string) => void;
  folders: Folder[];
}

const FolderModal: React.FC<FolderModalProps> = ({
  visible,
  onClose,
  selectedFolderId,
  onSelectFolder,
  folders,
}) => {
  const {theme} = useTheme();
  const colors = theme.colors;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, {backgroundColor: colors.background}]}>
        <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
          <Text style={[styles.modalTitle, {color: colors.text}]}>Select Folder</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalCloseButton, {color: colors.primary}]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.foldersContainer}>
          <TouchableOpacity
            style={[
              styles.folderOption,
              {
                backgroundColor: !selectedFolderId ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              onSelectFolder(undefined);
              onClose();
            }}
          >
            <Text style={styles.folderOptionIcon}>📁</Text>
            <Text
              style={[
                styles.folderOptionName,
                {color: !selectedFolderId ? 'white' : colors.text},
              ]}
            >
              No Folder
            </Text>
          </TouchableOpacity>

          {folders.map(folder => (
            <TouchableOpacity
              key={folder.id}
              style={[
                styles.folderOption,
                {
                  backgroundColor: selectedFolderId === folder.id ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                onSelectFolder(folder.id);
                onClose();
              }}
            >
              <Text style={styles.folderOptionIcon}>{folder.icon}</Text>
              <Text
                style={[
                  styles.folderOptionName,
                  {color: selectedFolderId === folder.id ? 'white' : colors.text},
                ]}
              >
                {folder.name}
              </Text>
              <Text
                style={[
                  styles.folderNoteCount,
                  {color: selectedFolderId === folder.id ? 'white' : colors.textSecondary},
                ]}
              >
                {folder.noteCount}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

export const NoteEditorScreen: React.FC = () => {
  const {theme} = useTheme();
  const colors = theme.colors;
  const {
    selectedNote,
    folders,
    isCreating,
    isEditing,
    addNote,
    updateNote,
    cancelEditing,
    exportNote,
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('text');
  const [folderId, setFolderId] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [formatting, setFormatting] = useState<TextFormatting>({
    isBold: false,
    isItalic: false,
    isUnderlined: false,
    isStrikethrough: false,
    fontSize: 16,
    textAlign: 'left',
    listType: 'none',
  });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFormattingBar, setShowFormattingBar] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isEditing && selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setNoteType(selectedNote.type);
      setFolderId(selectedNote.folderId);
      setTags(selectedNote.tags);
      setIsPinned(selectedNote.isPinned);
      setIsFavorite(selectedNote.isFavorite);
    } else if (isCreating) {
      resetForm();
    }
  }, [isEditing, isCreating, selectedNote]);

  useEffect(() => {
    // Auto-save for existing notes
    if (isEditing && selectedNote) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(false); // Silent save
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, noteType, folderId, tags, isPinned, isFavorite]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setNoteType('text');
    setFolderId(undefined);
    setTags([]);
    setTagInput('');
    setIsPinned(false);
    setIsFavorite(false);
    setFormatting({
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      isStrikethrough: false,
      fontSize: 16,
      textAlign: 'left',
      listType: 'none',
    });
  };

  const handleSave = (showAlert = true) => {
    if (!title.trim() && !content.trim()) {
      if (showAlert) {
        Alert.alert('Empty Note', 'Please add a title or content before saving.');
      }
      return;
    }

    const noteData = {
      title: title.trim() || 'Untitled',
      content: content.trim(),
      type: noteType,
      folderId,
      tags,
      isPinned,
      isFavorite,
      isArchived: false,
    };

    if (isEditing && selectedNote) {
      updateNote(selectedNote.id, noteData);
    } else {
      addNote(noteData);
    }

    if (showAlert) {
      cancelEditing();
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          {text: 'Keep Editing', style: 'cancel'},
          {text: 'Discard', style: 'destructive', onPress: cancelEditing},
        ]
      );
    } else {
      cancelEditing();
    }
  };

  const handleTemplateSelect = (template: any) => {
    setTitle(template.name);
    setContent(template.content);
    if (template.id === 'todo') {
      setNoteType('checklist');
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleExport = (format: 'txt' | 'md' | 'json') => {
    if (selectedNote) {
      const exportedContent = exportNote(selectedNote.id, format);
      // Here you would typically share or save the file
      Alert.alert('Export Complete', `Note exported as ${format.toUpperCase()}`);
    }
  };

  const getWordCount = () => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = () => {
    const wordCount = getWordCount();
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const selectedFolder = folders.find(f => f.id === folderId);

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Text style={[styles.headerButtonText, {color: colors.primary}]}>Cancel</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, {color: colors.text}]}>
            {isCreating ? 'New Note' : 'Edit Note'}
          </Text>
          {selectedNote && (
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
              {getWordCount()} words · {getReadingTime()}m read
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={() => handleSave(true)}>
          <Text style={[styles.headerButtonText, {color: colors.primary}]}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Editor Content */}
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Note Type Selector */}
        <View style={styles.typeSelector}>
          {(['text', 'checklist'] as NoteType[]).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeOption,
                {
                  backgroundColor: noteType === type ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setNoteType(type)}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  {color: noteType === type ? 'white' : colors.text},
                ]}
              >
                {type === 'text' ? '📝 Text' : '✅ Checklist'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title Input */}
        <TextInput
          ref={titleInputRef}
          style={[
            styles.titleInput,
            {
              color: colors.text,
              fontSize: formatting.fontSize + 4,
              textAlign: formatting.textAlign,
              fontWeight: formatting.isBold ? 'bold' : 'normal',
              fontStyle: formatting.isItalic ? 'italic' : 'normal',
            },
          ]}
          placeholder="Note title..."
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          onSubmitEditing={() => contentInputRef.current?.focus()}
        />

        {/* Content Input */}
        <TextInput
          ref={contentInputRef}
          style={[
            styles.contentInput,
            {
              color: colors.text,
              fontSize: formatting.fontSize,
              textAlign: formatting.textAlign,
              fontWeight: formatting.isBold ? 'bold' : 'normal',
              fontStyle: formatting.isItalic ? 'italic' : 'normal',
              textDecorationLine: formatting.isUnderlined ? 'underline' : 
                                 formatting.isStrikethrough ? 'line-through' : 'none',
            },
          ]}
          placeholder="Start writing..."
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          onFocus={() => setShowFormattingBar(true)}
          onBlur={() => {
            // Hide formatting bar after a delay to allow for button presses
            setTimeout(() => setShowFormattingBar(false), 200);
          }}
        />

        {/* Note Options */}
        <View style={styles.optionsContainer}>
          {/* Folder Selection */}
          <TouchableOpacity
            style={[styles.optionButton, {backgroundColor: colors.surface, borderColor: colors.border}]}
            onPress={() => setShowFolderModal(true)}
          >
            <Text style={styles.optionIcon}>
              {selectedFolder ? selectedFolder.icon : '📁'}
            </Text>
            <Text style={[styles.optionText, {color: colors.text}]}>
              {selectedFolder ? selectedFolder.name : 'No Folder'}
            </Text>
            <Text style={[styles.optionArrow, {color: colors.textSecondary}]}>›</Text>
          </TouchableOpacity>

          {/* Tags */}
          <View style={[styles.tagsSection, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <Text style={[styles.tagsLabel, {color: colors.text}]}>Tags:</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tagChip, {backgroundColor: colors.primary}]}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagChipText}>#{tag}</Text>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={[styles.tagInput, {color: colors.text}]}
                placeholder="Add tag..."
                placeholderTextColor={colors.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Note Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: isPinned ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setIsPinned(!isPinned)}
            >
              <Text style={[styles.actionIcon, {color: isPinned ? 'white' : colors.text}]}>📌</Text>
              <Text style={[styles.actionText, {color: isPinned ? 'white' : colors.text}]}>
                Pin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: isFavorite ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Text style={[styles.actionIcon, {color: isFavorite ? 'white' : colors.text}]}>⭐</Text>
              <Text style={[styles.actionText, {color: isFavorite ? 'white' : colors.text}]}>
                Favorite
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: colors.surface, borderColor: colors.border}]}
              onPress={() => setShowTemplateModal(true)}
            >
              <Text style={[styles.actionIcon, {color: colors.text}]}>📋</Text>
              <Text style={[styles.actionText, {color: colors.text}]}>Template</Text>
            </TouchableOpacity>

            {selectedNote && (
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: colors.surface, borderColor: colors.border}]}
                onPress={() => setShowExportModal(true)}
              >
                <Text style={[styles.actionIcon, {color: colors.text}]}>📤</Text>
                <Text style={[styles.actionText, {color: colors.text}]}>Export</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Formatting Bar */}
      {showFormattingBar && (
        <FormattingBar
          formatting={formatting}
          onFormattingChange={(newFormatting) =>
            setFormatting(prev => ({...prev, ...newFormatting}))
          }
        />
      )}

      {/* Modals */}
      <TemplateModal
        visible={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      <FolderModal
        visible={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        selectedFolderId={folderId}
        onSelectFolder={setFolderId}
        folders={folders}
      />

      {/* Export Modal */}
      <Modal visible={showExportModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, {backgroundColor: colors.background}]}>
          <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>Export Note</Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Text style={[styles.modalCloseButton, {color: colors.primary}]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.exportOptions}>
            {EXPORT_FORMATS.map(format => (
              <TouchableOpacity
                key={format.id}
                style={[styles.exportOption, {backgroundColor: colors.surface, borderColor: colors.border}]}
                onPress={() => {
                  handleExport(format.id as any);
                  setShowExportModal(false);
                }}
              >
                <Text style={[styles.exportOptionText, {color: colors.text}]}>{format.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingVertical: 8,
  },
  contentInput: {
    minHeight: 200,
    textAlignVertical: 'top',
    paddingVertical: 8,
    lineHeight: 24,
  },
  optionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  optionArrow: {
    fontSize: 18,
  },
  tagsSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  tagRemove: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
  },
  tagInput: {
    minWidth: 100,
    padding: 8,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formattingBar: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  formattingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  formattingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formatButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  formatButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fontSizeText: {
    fontSize: 12,
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  templatesContainer: {
    padding: 20,
  },
  templateOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
  },
  templatePreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  foldersContainer: {
    padding: 20,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  folderOptionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  folderOptionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  folderNoteCount: {
    fontSize: 14,
  },
  exportOptions: {
    padding: 20,
  },
  exportOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'center',
  },
  exportOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 