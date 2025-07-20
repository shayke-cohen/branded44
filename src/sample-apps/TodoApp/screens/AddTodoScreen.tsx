import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTheme} from '../../../context';
import {useTodos} from '../context/TodoContext';
import {TodoCategory, TodoPriority} from '../types';

interface AddTodoScreenProps {
  onBack: () => void;
  onSave: () => void;
}

const AddTodoScreen: React.FC<AddTodoScreenProps> = ({onBack, onSave}) => {
  const {theme} = useTheme();
  const {addTodo} = useTodos();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TodoCategory>(TodoCategory.PERSONAL);
  const [priority, setPriority] = useState<TodoPriority>(TodoPriority.MEDIUM);

  const handleSave = () => {
    if (title.trim()) {
      addTodo(title.trim(), description.trim() || undefined, category, priority);
      onSave();
    }
  };

  const getCategoryIcon = (cat: TodoCategory) => {
    switch (cat) {
      case TodoCategory.PERSONAL:
        return '👤';
      case TodoCategory.WORK:
        return '💼';
      case TodoCategory.SHOPPING:
        return '🛍️';
      case TodoCategory.HEALTH:
        return '🏥';
      default:
        return '📝';
    }
  };

  const getPriorityColor = (prio: TodoPriority) => {
    switch (prio) {
      case TodoPriority.HIGH:
        return '#ff6b6b';
      case TodoPriority.MEDIUM:
        return '#ffd93d';
      case TodoPriority.LOW:
        return '#6bcf7f';
      default:
        return theme.colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    saveButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 8,
      marginBottom: 8,
    },
    optionButtonActive: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 4,
    },
    optionTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    priorityButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 8,
      marginBottom: 8,
    },
    priorityDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} testID="back-button">
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Task</Text>
        <TouchableOpacity
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!title.trim()}
          testID="save-button">
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter task title..."
            placeholderTextColor={theme.colors.text + '60'}
            value={title}
            onChangeText={setTitle}
            testID="title-input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add description (optional)..."
            placeholderTextColor={theme.colors.text + '60'}
            value={description}
            onChangeText={setDescription}
            multiline
            testID="description-input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsContainer}>
            {Object.values(TodoCategory).map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.optionButton, category === cat && styles.optionButtonActive]}
                onPress={() => setCategory(cat)}
                testID={`category-${cat.toLowerCase()}`}>
                <Text>{getCategoryIcon(cat)}</Text>
                <Text style={[styles.optionText, category === cat && styles.optionTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.optionsContainer}>
            {Object.values(TodoPriority).map(prio => (
              <TouchableOpacity
                key={prio}
                style={[styles.priorityButton, priority === prio && styles.optionButtonActive]}
                onPress={() => setPriority(prio)}
                testID={`priority-${prio.toLowerCase()}`}>
                <View style={[styles.priorityDot, {backgroundColor: getPriorityColor(prio)}]} />
                <Text style={[styles.optionText, priority === prio && styles.optionTextActive]}>
                  {prio}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddTodoScreen; 