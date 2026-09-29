'use client';

import React from 'react';
import type { Todo, Priority, FilterType } from '@/types/todo';
import TodoItem from './TodoItem';
import { CheckCircle2, ClipboardList } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  activeFilter: FilterType;
  loading: boolean;
  exitingIds: Set<string>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onUpdate: (id: string, data: { title?: string; notes?: string; priority?: Priority }) => Promise<void>;
  onDelete: (id: string) => void;
}

// Skeleton row for loading state
function TodoSkeleton({ index }: { index: number }) {
  return (
    <div
      className="card px-4 py-3.5 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-4.5 h-4.5 rounded bg-muted mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
        <div className="h-5 w-16 bg-muted rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ filter }: { filter: FilterType }) {
  const messages: Record<FilterType, { icon: React.ReactNode; heading: string; body: string }> = {
    all:       { icon: <ClipboardList size={32} className="text-muted-foreground" />, heading: 'No tasks yet', body: 'Add your first task using the form above. Tasks you create will appear here.' },
    active:    { icon: <CheckCircle2 size={32} className="text-success" />,           heading: 'All caught up!', body: 'You have no active tasks. Everything is either completed or not yet created.' },
    completed: { icon: <CheckCircle2 size={32} className="text-muted-foreground" />,  heading: 'No completed tasks', body: 'Mark tasks as complete using the checkbox on each task card.' },
    low:       { icon: <ClipboardList size={32} className="text-info" />,             heading: 'No low priority tasks', body: 'Tasks assigned low priority will appear here.' },
    medium:    { icon: <ClipboardList size={32} className="text-warning" />,          heading: 'No medium priority tasks', body: 'Tasks assigned medium priority will appear here.' },
    high:      { icon: <ClipboardList size={32} className="text-danger" />,           heading: 'No high priority tasks', body: 'Tasks assigned high priority will appear here.' },
  };

  const msg = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center fade-in">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {msg.icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">{msg.heading}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{msg.body}</p>
    </div>
  );
}

export default function TodoList({
  todos,
  activeFilter,
  loading,
  exitingIds,
  onToggleComplete,
  onUpdate,
  onDelete,
}: TodoListProps) {
  // Loading state — show skeletons
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <TodoSkeleton key={`skeleton-${i + 1}`} index={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (todos.length === 0) {
    return <EmptyState filter={activeFilter} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {todos.map(todo => (
        <TodoItem
          key={`todo-${todo.id}`}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isExiting={exitingIds.has(todo.id)}
        />
      ))}
    </div>
  );
}