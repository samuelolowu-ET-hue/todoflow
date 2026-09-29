'use client';

import React from 'react';
import type { FilterType } from '@/types/todo';

interface TodoFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    low: number;
    medium: number;
    high: number;
  };
}

const FILTERS: { key: FilterType; label: string; dotClass?: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'low',       label: 'Low',    dotClass: 'bg-info' },
  { key: 'medium',    label: 'Medium', dotClass: 'bg-warning' },
  { key: 'high',      label: 'High',   dotClass: 'bg-danger' },
];

export default function TodoFilters({ activeFilter, onFilterChange, counts }: TodoFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter tasks"
      className="flex flex-wrap gap-1.5"
    >
      {FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        const count = counts[f.key];

        return (
          <button
            key={`filter-${f.key}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(f.key)}
            className={`
              btn btn-sm flex items-center gap-1.5 transition-all duration-150
              ${isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted hover:text-foreground'
              }
            `}
          >
            {f.dotClass && (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.dotClass}`} />
            )}
            {f.label}
            <span
              className={`
                text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center
                ${isActive
                  ? 'bg-white/20 text-white' :'bg-muted text-muted-foreground'
                }
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}