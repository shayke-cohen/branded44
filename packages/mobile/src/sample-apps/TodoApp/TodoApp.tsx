import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TodoProvider} from './context/TodoContext';
import TodoNavigation from './navigation/TodoNavigation';
import {useTheme} from '../../context';

const TodoApp: React.FC = () => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <View style={styles.container} testID="todo-app">
      <TodoProvider>
        <TodoNavigation />
      </TodoProvider>
    </View>
  );
};

export default TodoApp; 