import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useTheme} from '../../../context';
import {useTodos} from '../context/TodoContext';
import {TodoCategory, TodoPriority} from '../types';

interface TodoListScreenProps {
  onAddTodo: () => void;
  onTodoPress: (todoId: string) => void;
}

const TodoListScreen: React.FC<TodoListScreenProps> = ({onAddTodo, onTodoPress}) => {
  const {theme} = useTheme();
  const {getFilteredTodos, getStats, toggleTodo, deleteTodo, setFilter, filter} = useTodos();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory | undefined>();
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority | undefined>();

  const todos = getFilteredTodos();
  const stats = getStats();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilter({...filter, searchQuery: query});
  };

  const handleCategoryFilter = (category: TodoCategory | undefined) => {
    setSelectedCategory(category);
    setFilter({...filter, category});
  };

  const handlePriorityFilter = (priority: TodoPriority | undefined) => {
    setSelectedPriority(priority);
    setFilter({...filter, priority});
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case TodoPriority.HIGH:
        return '#ff6b6b';
      case TodoPriority.MEDIUM:
        return '#ffd93d';
      case TodoPriority.LOW:
        return '#6bcf7f';
      default:
        return theme.colors.text;
    }
  };

  const getCategoryIcon = (category: TodoCategory) => {
    switch (category) {
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.text,
      marginTop: 4,
    },
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: theme.colors.text,
    },
    filtersContainer: {
      marginBottom: 16,
    },
    filterRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    filterButtonTextActive: {
      color: '#ffffff',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    todoItem: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    todoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    todoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    todoTitleCompleted: {
      textDecorationLine: 'line-through',
      opacity: 0.6,
    },
    todoMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    todoDescription: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 8,
    },
    todoActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    completeButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.primary + '20',
    },
    completeButtonText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    deleteButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: '#ff6b6b20',
    },
    deleteButtonText: {
      color: '#ff6b6b',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.6,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={theme.colors.text + '60'}
            value={searchQuery}
            onChangeText={handleSearch}
            testID="search-input"
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, !selectedCategory && styles.filterButtonActive]}
              onPress={() => handleCategoryFilter(undefined)}>
              <Text style={[styles.filterButtonText, !selectedCategory && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {Object.values(TodoCategory).map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.filterButton, selectedCategory === category && styles.filterButtonActive]}
                onPress={() => handleCategoryFilter(category)}>
                <Text style={[styles.filterButtonText, selectedCategory === category && styles.filterButtonTextActive]}>
                  {getCategoryIcon(category)} {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, !selectedPriority && styles.filterButtonActive]}
              onPress={() => handlePriorityFilter(undefined)}>
              <Text style={[styles.filterButtonText, !selectedPriority && styles.filterButtonTextActive]}>
                All Priority
              </Text>
            </TouchableOpacity>
            {Object.values(TodoPriority).map(priority => (
              <TouchableOpacity
                key={priority}
                style={[styles.filterButton, selectedPriority === priority && styles.filterButtonActive]}
                onPress={() => handlePriorityFilter(priority)}>
                <Text style={[styles.filterButtonText, selectedPriority === priority && styles.filterButtonTextActive]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Todo Button */}
        <TouchableOpacity style={styles.addButton} onPress={onAddTodo} testID="add-todo-button">
          <Text style={styles.addButtonText}>➕ Add New Task</Text>
        </TouchableOpacity>

        {/* Todo List */}
        {todos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedCategory || selectedPriority
                ? 'Try adjusting your filters'
                : 'Add your first task to get started!'}
            </Text>
          </View>
        ) : (
          todos.map(todo => (
            <TouchableOpacity
              key={todo.id}
              style={styles.todoItem}
              onPress={() => onTodoPress(todo.id)}
              testID={`todo-item-${todo.id}`}>
              <View style={styles.todoHeader}>
                <Text style={[styles.todoTitle, todo.completed && styles.todoTitleCompleted]}>
                  {todo.title}
                </Text>
                <View style={styles.todoMeta}>
                  <Text style={styles.categoryIcon}>{getCategoryIcon(todo.category)}</Text>
                  <View
                    style={[styles.priorityDot, {backgroundColor: getPriorityColor(todo.priority)}]}
                  />
                </View>
              </View>
              
              {todo.description && (
                <Text style={styles.todoDescription}>{todo.description}</Text>
              )}
              
              <View style={styles.todoActions}>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => toggleTodo(todo.id)}
                  testID={`toggle-todo-${todo.id}`}>
                  <Text style={styles.completeButtonText}>
                    {todo.completed ? 'Undo' : 'Complete'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTodo(todo.id)}
                  testID={`delete-todo-${todo.id}`}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TodoListScreen; 