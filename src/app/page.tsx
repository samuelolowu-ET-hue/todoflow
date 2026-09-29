// WHY IS THIS THE MAIN PAGE (src/app/page.tsx)?
// Next.js App Router serves src/app/page.tsx at the root URL "/".
// Since this is a single-screen application, all the content lives here.
// There is no redirect — the page IS the app.
//
// WHY 'use client' ON THE PAGE?
// This page manages application state (todos list, filter, loading state).
// Any component that uses useState or useEffect must be a Client Component.
// The 'use client' directive tells Next.js to render this component in the browser.
// Server Components cannot use hooks — they run only on the server.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Todo, Priority, FilterType, TodoStats } from '@/types/todo';
import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';
import TodoFilters from '@/components/TodoFilters';
import TodoStatsComponent from '@/components/TodoStats';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import AppLogo from '@/components/ui/AppLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';
import Link from 'next/link';

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// Shown when Supabase is not yet configured so the UI is not empty during preview.
const MOCK_TODOS: Todo[] = [
  {
    id: 'mock-1',
    title: 'Complete cohort assignment',
    notes: 'Build and deploy the TodoFlow application with all required features.',
    completed: false,
    priority: 'high',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Review Next.js documentation',
    notes: 'Focus on App Router and Server Components for the cohort project.',
    completed: true,
    priority: 'medium',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Set up Supabase database',
    notes: 'Create todos table with required schema. See AGENTS.md for SQL.',
    completed: false,
    priority: 'high',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

// ─── FILTER FUNCTION ────────────────────────────────────────────────────────
// Pure function: takes the full list and a filter, returns the filtered subset.
// Keeping this outside the component means it doesn't get recreated on every render.
function applyFilter(todos: Todo[], filter: FilterType): Todo[] {
  switch (filter) {
    case 'active':    return todos.filter(t => !t.completed);
    case 'completed': return todos.filter(t => t.completed);
    case 'low':       return todos.filter(t => t.priority === 'low');
    case 'medium':    return todos.filter(t => t.priority === 'medium');
    case 'high':      return todos.filter(t => t.priority === 'high');
    default:          return todos;
  }
}

// ─── STATS FUNCTION ─────────────────────────────────────────────────────────
function computeStats(todos: Todo[]): TodoStats {
  return {
    total:        todos.length,
    active:       todos.filter(t => !t.completed).length,
    completed:    todos.filter(t => t.completed).length,
    highPriority: todos.filter(t => t.priority === 'high' && !t.completed).length,
  };
}

// ─── FILTER COUNTS ──────────────────────────────────────────────────────────
function computeFilterCounts(todos: Todo[]) {
  return {
    all:       todos.length,
    active:    todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    low:       todos.filter(t => t.priority === 'low').length,
    medium:    todos.filter(t => t.priority === 'medium').length,
    high:      todos.filter(t => t.priority === 'high').length,
  };
}

export default function TodoManagementPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDbConfigured, setIsDbConfigured] = useState(true);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    todoId: string;
    todoTitle: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    todoId: '',
    todoTitle: '',
    isDeleting: false,
  });

  // ─── FETCH TODOS ──────────────────────────────────────────────────────────
  // WHY useCallback?
  // useCallback memoizes the function so it doesn't get recreated on every render.
  // This is important because fetchTodos is used in a useEffect dependency array.
  // Without useCallback, the effect would run in an infinite loop.
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/todos');
      if (res.status === 503) {
        // Supabase not configured — show mock data instead of error
        setIsDbConfigured(false);
        setTodos(MOCK_TODOS);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error: ${res.status}`);
      }
      const data: Todo[] = await res.json();
      setIsDbConfigured(true);
      setTodos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks.';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ─── CREATE TODO ──────────────────────────────────────────────────────────
  const handleCreateTodo = async (data: { title: string; notes: string; priority: Priority }) => {
    if (!isDbConfigured) {
      toast.error('Database not configured', {
        description: 'Please set up your Supabase environment variables to save tasks.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create task.');
      }
      const newTodo: Todo = await res.json();
      // Optimistically prepend the new todo to the list
      setTodos(prev => [newTodo, ...prev]);
      toast.success('Task created', {
        description: `"${newTodo.title}" added to your list.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task.';
      toast.error('Could not create task', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── TOGGLE COMPLETE ─────────────────────────────────────────────────────
  const handleToggleComplete = async (id: string, completed: boolean) => {
    if (!isDbConfigured) {
      toast.error('Database not configured', { description: 'Please set up Supabase to save changes.' });
      return;
    }
    // Optimistic update: update the UI immediately, then sync with the server.
    // WHY OPTIMISTIC UPDATES?
    // They make the app feel instant. If the server call fails, we roll back.
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed } : t)
    );
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update task.');
      }
      const updated: Todo = await res.json();
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      // Roll back the optimistic update
      setTodos(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !completed } : t)
      );
      const message = err instanceof Error ? err.message : 'Failed to update task.';
      toast.error('Could not update task', { description: message });
    }
  };

  // ─── UPDATE TODO ─────────────────────────────────────────────────────────
  const handleUpdateTodo = async (
    id: string,
    data: { title?: string; notes?: string; priority?: Priority }
  ) => {
    if (!isDbConfigured) {
      toast.error('Database not configured', { description: 'Please set up Supabase to save changes.' });
      throw new Error('Database not configured');
    }
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update task.');
      }
      const updated: Todo = await res.json();
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Task updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task.';
      toast.error('Could not save changes', { description: message });
      throw err; // Re-throw so TodoItem can keep its edit mode open
    }
  };

  // ─── DELETE TODO ─────────────────────────────────────────────────────────
  const handleRequestDelete = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    setDeleteModal({
      isOpen: true,
      todoId: id,
      todoTitle: todo.title,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    const { todoId } = deleteModal;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    // Start exit animation
    setExitingIds(prev => new Set(prev).add(todoId));

    // Wait for animation to complete before removing from state
    await new Promise(resolve => setTimeout(resolve, 250));

    if (!isDbConfigured) {
      // In demo mode, just remove from local state
      setTodos(prev => prev.filter(t => t.id !== todoId));
      setExitingIds(prev => { const next = new Set(prev); next.delete(todoId); return next; });
      setDeleteModal({ isOpen: false, todoId: '', todoTitle: '', isDeleting: false });
      toast.success('Task deleted (demo mode)');
      return;
    }

    try {
      const res = await fetch(`/api/todos/${todoId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete task.');
      }
      setTodos(prev => prev.filter(t => t.id !== todoId));
      setExitingIds(prev => { const next = new Set(prev); next.delete(todoId); return next; });
      toast.success('Task deleted');
    } catch (err) {
      // Remove from exiting set so the item reappears
      setExitingIds(prev => {
        const next = new Set(prev);
        next.delete(todoId);
        return next;
      });
      const message = err instanceof Error ? err.message : 'Failed to delete task.';
      toast.error('Could not delete task', { description: message });
    } finally {
      setDeleteModal({ isOpen: false, todoId: '', todoTitle: '', isDeleting: false });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, todoId: '', todoTitle: '', isDeleting: false });
  };

  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const filteredTodos = applyFilter(todos, activeFilter);
  const stats = computeStats(todos);
  const filterCounts = computeFilterCounts(todos);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <AppLogo size={32} />
            <span className="font-semibold text-lg text-foreground tracking-tight">
              TodoFlow
            </span>
          </div>
          <div className="flex-1" />
          <nav className="flex items-center gap-1">
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10">
              Tasks
            </span>
            <Link
              href="/analytics"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
            >
              Analytics
            </Link>
          </nav>
          <span className="text-xs text-muted-foreground hidden sm:block">
            AI Engineering Cohort · Lagos
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        <div className="max-w-3xl mx-auto">

          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">
              Task Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, organise, and track your cohort tasks with notes and priorities.
            </p>
          </div>

          {/* Database not configured banner */}
          {!isDbConfigured && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 fade-in"
            >
              <Database size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">Database not configured — Demo Mode</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Showing sample tasks. To enable persistence, set{' '}
                  <code className="bg-amber-100 px-1 rounded text-amber-900">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                  <code className="bg-amber-100 px-1 rounded text-amber-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
                  in your environment variables, then create the todos table (see AGENTS.md).
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="mb-6">
            <TodoStatsComponent stats={stats} loading={isLoading} />
          </div>

          {/* Create form */}
          <div className="mb-6">
            <TodoForm onSubmit={handleCreateTodo} isSubmitting={isSubmitting} />
          </div>

          {/* Error banner — shown when initial load fails */}
          {loadError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 p-4 rounded-lg bg-danger/10 border border-danger/20 fade-in"
            >
              <AlertCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-danger">Failed to load tasks</p>
                <p className="text-xs text-danger/80 mt-0.5">{loadError}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Make sure your Supabase environment variables are set and the database table exists.
                  See AGENTS.md for setup instructions.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchTodos}
                className="btn btn-secondary btn-sm flex-shrink-0"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          )}

          {/* Filters + task count */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <TodoFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={filterCounts}
              />
              {!isLoading && (
                <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                  {filteredTodos.length} task{filteredTodos.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Task list */}
          <TodoList
            todos={filteredTodos}
            activeFilter={activeFilter}
            loading={isLoading}
            exitingIds={exitingIds}
            onToggleComplete={handleToggleComplete}
            onUpdate={handleUpdateTodo}
            onDelete={handleRequestDelete}
          />
        </div>
      </main>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        todoTitle={deleteModal.todoTitle}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}