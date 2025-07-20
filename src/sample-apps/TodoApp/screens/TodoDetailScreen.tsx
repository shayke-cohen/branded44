import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../../context';
import {useTodos} from '../context/TodoContext';

interface TodoDetailScreenProps {
  todoId: string;
  onBack: () => void;
}

const TodoDetailScreen: React.FC<TodoDetailScreenProps> = ({todoId, onBack}) => {
  const {theme} = useTheme();
  const {todos, toggleTodo, deleteTodo} = useTodos();

  const todo = todos.find(t => t.id === todoId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 8,
      marginRight: 16,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    todoCard: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    todoTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    todoDescription: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.8,
      marginBottom: 16,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    completeButton: {
      backgroundColor: theme.colors.primary + '20',
    },
    completeButtonText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: '#ff6b6b20',
    },
    deleteButtonText: {
      color: '#ff6b6b',
      fontWeight: '600',
    },
    errorText: {
      fontSize: 18,
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 40,
    },
  });

  if (!todo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.errorText}>Todo not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} testID="back-button">
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Task Details</Text>
      </View>

      <View style={styles.todoCard}>
        <Text style={styles.todoTitle}>{todo.title}</Text>
        
        {todo.description && (
          <Text style={styles.todoDescription}>{todo.description}</Text>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => toggleTodo(todo.id)}
            testID="toggle-complete-button">
            <Text style={styles.completeButtonText}>
              {todo.completed ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              deleteTodo(todo.id);
              onBack();
            }}
            testID="delete-button">
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TodoDetailScreen; 