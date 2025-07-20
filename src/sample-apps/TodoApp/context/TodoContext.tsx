import React, {createContext, useContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Todo, TodoCategory, TodoPriority, TodoStats, TodoFilter} from '../types';

const STORAGE_KEY = '@TodoApp:todos';

interface TodoContextState {
  todos: Todo[];
  filter: TodoFilter;
  isLoading: boolean;
}

interface TodoContextValue extends TodoContextState {
  addTodo: (title: string, description?: string, category?: TodoCategory, priority?: TodoPriority) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: TodoFilter) => void;
  clearFilter: () => void;
  getStats: () => TodoStats;
  getFilteredTodos: () => Todo[];
}

type TodoAction =
  | {type: 'SET_TODOS'; payload: Todo[]}
  | {type: 'ADD_TODO'; payload: Todo}
  | {type: 'UPDATE_TODO'; payload: {id: string; updates: Partial<Todo>}}
  | {type: 'DELETE_TODO'; payload: string}
  | {type: 'SET_FILTER'; payload: TodoFilter}
  | {type: 'SET_LOADING'; payload: boolean};

const initialState: TodoContextState = {
  todos: [],
  filter: {},
  isLoading: false,
};

const todoReducer = (state: TodoContextState, action: TodoAction): TodoContextState => {
  switch (action.type) {
    case 'SET_TODOS':
      return {...state, todos: action.payload};
    case 'ADD_TODO':
      return {...state, todos: [...state.todos, action.payload]};
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? {...todo, ...action.payload.updates, updatedAt: new Date()}
            : todo
        ),
      };
    case 'DELETE_TODO':
      return {...state, todos: state.todos.filter(todo => todo.id !== action.payload)};
    case 'SET_FILTER':
      return {...state, filter: action.payload};
    case 'SET_LOADING':
      return {...state, isLoading: action.payload};
    default:
      return state;
  }
};

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export const TodoProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Load todos from storage on mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Save todos to storage whenever todos change
  useEffect(() => {
    if (state.todos.length > 0) {
      saveTodos(state.todos);
    }
  }, [state.todos]);

  const loadTodos = async () => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      const todosJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (todosJson) {
        const todos = JSON.parse(todosJson).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }));
        dispatch({type: 'SET_TODOS', payload: todos});
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const saveTodos = async (todos: Todo[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  const addTodo = (
    title: string,
    description?: string,
    category: TodoCategory = TodoCategory.PERSONAL,
    priority: TodoPriority = TodoPriority.MEDIUM
  ) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      category,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({type: 'ADD_TODO', payload: newTodo});
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    dispatch({type: 'UPDATE_TODO', payload: {id, updates}});
  };

  const deleteTodo = (id: string) => {
    dispatch({type: 'DELETE_TODO', payload: id});
  };

  const toggleTodo = (id: string) => {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
      updateTodo(id, {completed: !todo.completed});
    }
  };

  const setFilter = (filter: TodoFilter) => {
    dispatch({type: 'SET_FILTER', payload: filter});
  };

  const clearFilter = () => {
    dispatch({type: 'SET_FILTER', payload: {}});
  };

  const getStats = (): TodoStats => {
    const total = state.todos.length;
    const completed = state.todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {total, completed, pending, completionRate};
  };

  const getFilteredTodos = (): Todo[] => {
    return state.todos.filter(todo => {
      if (state.filter.category && todo.category !== state.filter.category) return false;
      if (state.filter.priority && todo.priority !== state.filter.priority) return false;
      if (state.filter.completed !== undefined && todo.completed !== state.filter.completed) return false;
      if (state.filter.searchQuery) {
        const query = state.filter.searchQuery.toLowerCase();
        return (
          todo.title.toLowerCase().includes(query) ||
          (todo.description && todo.description.toLowerCase().includes(query))
        );
      }
      return true;
    });
  };

  const value: TodoContextValue = {
    ...state,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setFilter,
    clearFilter,
    getStats,
    getFilteredTodos,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodos = (): TodoContextValue => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}; 