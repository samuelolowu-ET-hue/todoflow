'use client';

// WHY INLINE EDITING?
// Navigating to a separate edit page for a simple task creates unnecessary friction.
// Inline editing (transforming the card into a form) keeps the user in context.
// This is a common pattern in productivity apps like Notion, Linear, and Todoist.

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Todo, Priority } from '@/types/todo';
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  StickyNote,
  Flag,
  Calendar,
} from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onUpdate: (id: string, data: { title?: string; notes?: string; priority?: Priority }) => Promise<void>;
  onDelete: (id: string) => void;
  isExiting: boolean;
}

interface EditFormValues {
  title: string;
  notes: string;
  priority: Priority;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
];

const PRIORITY_BADGE_CLASS: Record<Priority, string> = {
  low:    'priority-low',
  medium: 'priority-medium',
  high:   'priority-high',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
};

function formatDate(isoString: string): string {
  // We use a locale-independent format to avoid SSR/CSR hydration mismatch.
  // toLocaleDateString() can produce different output on server vs browser.
  const d = new Date(isoString);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function TodoItem({
  todo,
  onToggleComplete,
  onUpdate,
  onDelete,
  isExiting,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    defaultValues: {
      title: todo.title,
      notes: todo.notes ?? '',
      priority: todo.priority,
    },
  });

  const handleToggleComplete = async () => {
    setIsTogglingComplete(true);
    await onToggleComplete(todo.id, !todo.completed);
    setIsTogglingComplete(false);
  };

  const handleStartEdit = () => {
    reset({
      title: todo.title,
      notes: todo.notes ?? '',
      priority: todo.priority,
    });
    setIsEditing(true);
    setIsNotesExpanded(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (data: EditFormValues) => {
    setIsSavingEdit(true);
    await onUpdate(todo.id, {
      title: data.title,
      notes: data.notes,
      priority: data.priority,
    });
    setIsSavingEdit(false);
    setIsEditing(false);
  };

  // ─── VIEW MODE ──────────────────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <div
        className={`
          card group transition-all duration-200
          ${isExiting ? 'todo-exit' : 'fade-in'}
          ${todo.completed ? 'opacity-60' : ''}
        `}
      >
        <div className="px-4 py-3.5">
          <div className="flex items-start gap-3">
            {/* Completion checkbox */}
            <div className="mt-0.5 flex-shrink-0">
              {isTogglingComplete ? (
                <Loader2 size={18} className="animate-spin text-primary mt-0.5" />
              ) : (
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={handleToggleComplete}
                  disabled={isTogglingComplete}
                  className="todo-checkbox"
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                />
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start gap-2 flex-wrap">
                <span
                  className={`
                    text-sm font-medium leading-snug flex-1 min-w-0 break-words
                    ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}
                  `}
                >
                  {todo.title}
                </span>

                {/* Priority badge */}
                <span
                  className={`
                    text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0
                    ${PRIORITY_BADGE_CLASS[todo.priority]}
                  `}
                >
                  <Flag size={10} />
                  {PRIORITY_LABEL[todo.priority]}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {/* Created date */}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={11} />
                  {formatDate(todo.created_at)}
                </span>

                {/* Notes indicator / toggle */}
                {todo.notes && (
                  <button
                    type="button"
                    onClick={() => setIsNotesExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-accent transition-colors duration-150"
                    aria-expanded={isNotesExpanded}
                  >
                    <StickyNote size={11} />
                    {isNotesExpanded ? 'Hide notes' : 'Show notes'}
                    {isNotesExpanded
                      ? <ChevronUp size={11} />
                      : <ChevronDown size={11} />
                    }
                  </button>
                )}
              </div>

              {/* Notes content (expandable) */}
              {todo.notes && isNotesExpanded && (
                <div className="mt-2.5 p-3 rounded-lg bg-muted/50 border border-border/60 slide-up">
                  <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {todo.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={handleStartEdit}
                className="btn btn-ghost btn-icon"
                aria-label={`Edit task: ${todo.title}`}
                title="Edit task"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(todo.id)}
                className="btn btn-ghost btn-icon hover:text-danger"
                aria-label={`Delete task: ${todo.title}`}
                title="Delete task — this cannot be undone"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── EDIT MODE ───────────────────────────────────────────────────────────────
  return (
    <div className="card border-primary/50 shadow-lg shadow-primary/5 fade-in">
      <div className="px-4 py-4">
        {/* Edit mode header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Editing task
          </span>
        </div>

        <form onSubmit={handleSubmit(handleSaveEdit)} noValidate>
          <div className="flex flex-col gap-3">

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label htmlFor={`edit-title-${todo.id}`} className="text-xs font-medium text-muted-foreground">
                Title <span className="text-danger">*</span>
              </label>
              <input
                id={`edit-title-${todo.id}`}
                type="text"
                disabled={isSavingEdit}
                className="form-input"
                autoFocus
                {...register('title', {
                  required: 'Title is required.',
                  maxLength: { value: 300, message: 'Max 300 characters.' },
                })}
              />
              {errors.title && (
                <p role="alert" className="text-xs text-danger">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label htmlFor={`edit-notes-${todo.id}`} className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <StickyNote size={11} />
                Notes
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id={`edit-notes-${todo.id}`}
                rows={3}
                disabled={isSavingEdit}
                className="form-input resize-none"
                placeholder="Add context, links, or reminders…"
                {...register('notes', {
                  maxLength: { value: 2000, message: 'Max 2000 characters.' },
                })}
              />
              {errors.notes && (
                <p role="alert" className="text-xs text-danger">
                  {errors.notes.message}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
              <label htmlFor={`edit-priority-${todo.id}`} className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Flag size={11} />
                Priority
              </label>
              <div className="relative">
                <select
                  id={`edit-priority-${todo.id}`}
                  disabled={isSavingEdit}
                  className="form-input appearance-none pr-8 cursor-pointer"
                  {...register('priority')}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={`edit-priority-opt-${opt.value}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSavingEdit}
                className="btn btn-primary btn-sm"
                style={{ minWidth: '90px' }}
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    Save
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSavingEdit}
                className="btn btn-secondary btn-sm"
              >
                <X size={13} />
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}