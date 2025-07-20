export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: TodoCategory;
  priority: TodoPriority;
  createdAt: Date;
  updatedAt: Date;
}

export enum TodoCategory {
  PERSONAL = 'Personal',
  WORK = 'Work',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
}

export enum TodoPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface TodoFilter {
  category?: TodoCategory;
  priority?: TodoPriority;
  completed?: boolean;
  searchQuery?: string;
}

export type TodoScreen = 'TodoList' | 'AddTodo' | 'TodoDetail';

export interface TodoNavigationState {
  currentScreen: TodoScreen;
  selectedTodoId?: string;
} 