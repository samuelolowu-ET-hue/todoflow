// WHY A SEPARATE STATS COMPONENT?
// Keeping the stats header isolated means it can receive just the data it needs
// (a TodoStats object) and render it. It has no side effects and no async logic.
// This makes it easy to test and easy to understand.

import React from 'react';
import type { TodoStats } from '@/types/todo';

interface TodoStatsProps {
  stats: TodoStats;
  loading: boolean;
}

function StatCard({
  label,
  value,
  colorClass,
  loading,
}: {
  label: string;
  value: number;
  colorClass: string;
  loading: boolean;
}) {
  return (
    <div className="card px-4 py-3 flex flex-col gap-1 min-w-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {loading ? (
        <div className="animate-pulse bg-muted rounded h-8 w-12" />
      ) : (
        <span
          className={`text-3xl font-bold tabular-nums leading-none ${colorClass}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default function TodoStats({ stats, loading }: TodoStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="Total Tasks"
        value={stats.total}
        colorClass="text-foreground"
        loading={loading}
      />
      <StatCard
        label="Active"
        value={stats.active}
        colorClass="text-primary"
        loading={loading}
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        colorClass="text-success"
        loading={loading}
      />
      <StatCard
        label="High Priority"
        value={stats.highPriority}
        colorClass="text-danger"
        loading={loading}
      />
    </div>
  );
}