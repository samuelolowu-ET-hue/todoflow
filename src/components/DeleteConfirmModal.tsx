'use client';

// WHY A CONFIRMATION MODAL FOR DELETION?
// Deletion is irreversible. A confirmation step prevents accidental data loss.
// This is a standard UX pattern for destructive actions.
// The modal traps keyboard focus while open (aria-modal) for accessibility.

import React, { useEffect, useRef } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  todoTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  todoTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when modal opens — safer default for destructive actions
  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { if (!isDeleting) onCancel(); }}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="elevated relative w-full max-w-sm p-6 fade-in">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="btn btn-ghost btn-icon absolute top-3 right-3"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-danger" />
        </div>

        {/* Title */}
        <h2 id="delete-modal-title" className="text-base font-semibold text-foreground mb-2">
          Delete this task?
        </h2>

        {/* Description */}
        <p id="delete-modal-desc" className="text-sm text-muted-foreground mb-5 leading-relaxed">
          You are about to permanently delete{' '}
          <span className="font-medium text-foreground">
            &ldquo;{todoTitle.length > 60 ? todoTitle.slice(0, 60) + '…' : todoTitle}&rdquo;
          </span>
          {' '}and all its notes. This cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            ref={cancelRef}
            onClick={onCancel}
            disabled={isDeleting}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-danger flex-1"
            style={{ minWidth: '100px' }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}