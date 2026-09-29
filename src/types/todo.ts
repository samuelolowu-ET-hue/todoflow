export type Priority = 'low' | 'medium' | 'high';

export type FilterType = 'all' | 'active' | 'completed' | 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  notes: string | null;
  completed: boolean;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  notes?: string;
  priority: Priority;
}

export interface UpdateTodoInput {
  title?: string;
  notes?: string;
  completed?: boolean;
  priority?: Priority;
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  highPriority: number;
}