import React, {useState} from 'react';
import {View} from 'react-native';
import {TodoScreen} from '../types';
import TodoListScreen from '../screens/TodoListScreen';
import AddTodoScreen from '../screens/AddTodoScreen';
import TodoDetailScreen from '../screens/TodoDetailScreen';

const TodoNavigation: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<TodoScreen>('TodoList');
  const [selectedTodoId, setSelectedTodoId] = useState<string | undefined>();

  const navigateToScreen = (screen: TodoScreen, todoId?: string) => {
    setCurrentScreen(screen);
    setSelectedTodoId(todoId);
  };

  const navigateBack = () => {
    if (currentScreen === 'TodoDetail' || currentScreen === 'AddTodo') {
      setCurrentScreen('TodoList');
      setSelectedTodoId(undefined);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'TodoList':
        return (
          <TodoListScreen
            onAddTodo={() => navigateToScreen('AddTodo')}
            onTodoPress={(todoId) => navigateToScreen('TodoDetail', todoId)}
          />
        );
      case 'AddTodo':
        return (
          <AddTodoScreen
            onBack={navigateBack}
            onSave={navigateBack}
          />
        );
      case 'TodoDetail':
        return (
          <TodoDetailScreen
            todoId={selectedTodoId!}
            onBack={navigateBack}
          />
        );
      default:
        return (
          <TodoListScreen
            onAddTodo={() => navigateToScreen('AddTodo')}
            onTodoPress={(todoId) => navigateToScreen('TodoDetail', todoId)}
          />
        );
    }
  };

  return <View style={{flex: 1}}>{renderScreen()}</View>;
};

export default TodoNavigation; 