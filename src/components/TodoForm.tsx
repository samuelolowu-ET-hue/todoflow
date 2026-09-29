'use client';

// WHY REACT-HOOK-FORM?
// react-hook-form is a lightweight library for managing form state and validation.
// Instead of tracking each input with useState, it registers inputs and validates
// them on submit (or on change). This reduces re-renders and keeps validation
// logic clean and declarative.

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Priority } from '@/types/todo';
import { ChevronDown, ChevronUp, Plus, Loader2, StickyNote } from 'lucide-react';

interface FormValues {
  title: string;
  notes: string;
  priority: Priority;
}

interface TodoFormProps {
  onSubmit: (data: { title: string; notes: string; priority: Priority }) => Promise<void>;
  isSubmitting: boolean;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; colorClass: string }[] = [
  { value: 'low',    label: 'Low Priority',    colorClass: 'priority-low' },
  { value: 'medium', label: 'Medium Priority', colorClass: 'priority-medium' },
  { value: 'high',   label: 'High Priority',   colorClass: 'priority-high' },
];

export default function TodoForm({ onSubmit, isSubmitting }: TodoFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      notes: '',
      priority: 'medium',
    },
  });

  const watchedPriority = watch('priority');

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit({
      title: data.title,
      notes: data.notes,
      priority: data.priority,
    });
    reset();
    setIsExpanded(false);
  };

  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === watchedPriority);

  return (
    <div className="card overflow-hidden">
      {/* Header bar — always visible, click to expand */}
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors duration-150"
        aria-expanded={isExpanded}
        aria-controls="todo-form-body"
      >
        <span className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Plus size={16} className="text-primary" />
        </span>
        <span className="font-medium text-sm text-foreground flex-1">
          Add a new task
        </span>
        {isExpanded
          ? <ChevronUp size={16} className="text-muted-foreground" />
          : <ChevronDown size={16} className="text-muted-foreground" />
        }
      </button>

      {/* Collapsible form body */}
      {isExpanded && (
        <div
          id="todo-form-body"
          className="border-t border-border px-4 pb-4 pt-4 slide-up"
        >
          <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            <div className="flex flex-col gap-4">

              {/* Title field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="todo-title"
                  className="text-sm font-medium text-foreground"
                >
                  Task Title
                  <span className="text-danger ml-1" aria-hidden="true">*</span>
                </label>
                <input
                  id="todo-title"
                  type="text"
                  placeholder="e.g. Review cohort assignment brief"
                  autoComplete="off"
                  disabled={isSubmitting}
                  className="form-input"
                  {...register('title', {
                    required: 'Task title is required.',
                    maxLength: {
                      value: 300,
                      message: 'Title must be 300 characters or fewer.',
                    },
                  })}
                />
                {errors.title && (
                  <p role="alert" className="text-xs text-danger mt-0.5">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Notes field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="todo-notes"
                  className="text-sm font-medium text-foreground flex items-center gap-1.5"
                >
                  <StickyNote size={14} className="text-muted-foreground" />
                  Notes
                  <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Add context, links, or reminders. Notes are saved and persist after refresh.
                </p>
                <textarea
                  id="todo-notes"
                  rows={3}
                  placeholder="e.g. Check Slack for the assignment PDF, focus on the data model section"
                  disabled={isSubmitting}
                  className="form-input resize-none"
                  {...register('notes', {
                    maxLength: {
                      value: 2000,
                      message: 'Notes must be 2000 characters or fewer.',
                    },
                  })}
                />
                {errors.notes && (
                  <p role="alert" className="text-xs text-danger mt-0.5">
                    {errors.notes.message}
                  </p>
                )}
              </div>

              {/* Priority selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="todo-priority"
                  className="text-sm font-medium text-foreground"
                >
                  Priority
                </label>
                <div className="relative">
                  <select
                    id="todo-priority"
                    disabled={isSubmitting}
                    className="form-input appearance-none pr-8 cursor-pointer"
                    {...register('priority')}
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <option key={`create-priority-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
                {/* Priority preview badge */}
                {currentPriority && (
                  <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${currentPriority.colorClass}`}>
                    {currentPriority.label}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ minWidth: '120px' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Add Task
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { reset(); setIsExpanded(false); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}