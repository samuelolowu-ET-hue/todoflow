'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type { Todo } from '@/types/todo';
import AppLogo from '@/components/ui/AppLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft, TrendingUp, CheckCircle2, ListTodo, AlertTriangle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// ─── MOCK DATA (same as main page) ──────────────────────────────────────────
const MOCK_TODOS: Todo[] = [
  {
    id: 'mock-1',
    title: 'Complete cohort assignment',
    notes: null,
    completed: false,
    priority: 'high',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Review Next.js documentation',
    notes: null,
    completed: true,
    priority: 'medium',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Set up Supabase database',
    notes: null,
    completed: false,
    priority: 'high',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getCreationTrends(todos: Todo[]) {
  const counts: Record<string, { date: string; created: number; completed: number }> = {};

  todos.forEach(todo => {
    const d = new Date(todo.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!counts[key]) counts[key] = { date: label, created: 0, completed: 0 };
    counts[key].created += 1;
    if (todo.completed) counts[key].completed += 1;
  });

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([, v]) => v);
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={16} />
        </span>
      </div>
      <div>
        <span className="text-3xl font-bold tabular-nums text-foreground">{value}</span>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="elevated px-3 py-2 text-xs rounded-lg shadow-lg">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/todos');
      if (res.status === 503) {
        setTodos(MOCK_TODOS);
        return;
      }
      if (!res.ok) throw new Error('Failed to load');
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch {
      setTodos(MOCK_TODOS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ─── DERIVED METRICS ───────────────────────────────────────────────────────
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const priorityCounts = [
    { name: 'High', value: todos.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: todos.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: todos.filter(t => t.priority === 'low').length, color: '#3b82f6' },
  ];

  const priorityBarData = [
    {
      priority: 'High',
      Total: todos.filter(t => t.priority === 'high').length,
      Done: todos.filter(t => t.priority === 'high' && t.completed).length,
    },
    {
      priority: 'Medium',
      Total: todos.filter(t => t.priority === 'medium').length,
      Done: todos.filter(t => t.priority === 'medium' && t.completed).length,
    },
    {
      priority: 'Low',
      Total: todos.filter(t => t.priority === 'low').length,
      Done: todos.filter(t => t.priority === 'low' && t.completed).length,
    },
  ];

  const trendData = getCreationTrends(todos);

  // Circumference for donut ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <AppLogo size={32} />
            <span className="font-semibold text-lg text-foreground tracking-tight">
              TodoFlow
            </span>
          </div>
          <div className="flex-1" />
          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
            >
              <ArrowLeft size={14} />
              Tasks
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10">
              Analytics
            </span>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={22} className="text-primary" />
              Productivity Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualise your task completion, priorities, and creation trends.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-5 h-28 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : (
            <>
              {/* ── KPI CARDS ─────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total Tasks"
                  value={total}
                  sub="All time"
                  icon={ListTodo}
                  accent="bg-primary/10 text-primary"
                />
                <StatCard
                  label="Completed"
                  value={completed}
                  sub={`${completionRate}% rate`}
                  icon={CheckCircle2}
                  accent="bg-success/10 text-success"
                />
                <StatCard
                  label="Active"
                  value={active}
                  sub="In progress"
                  icon={TrendingUp}
                  accent="bg-info/10 text-info"
                />
                <StatCard
                  label="High Priority"
                  value={todos.filter(t => t.priority === 'high').length}
                  sub={`${todos.filter(t => t.priority === 'high' && t.completed).length} done`}
                  icon={AlertTriangle}
                  accent="bg-danger/10 text-danger"
                />
              </div>

              {/* ── ROW 2: Completion Ring + Priority Bar ─────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Completion Rate Donut */}
                <div className="card p-6 flex flex-col gap-4">
                  <h2 className="text-sm font-semibold text-foreground">Completion Rate</h2>
                  <div className="flex items-center justify-center gap-8">
                    {/* SVG Donut */}
                    <div className="relative flex-shrink-0">
                      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                        {/* Track */}
                        <circle
                          cx="70" cy="70" r={radius}
                          fill="none"
                          stroke="var(--muted)"
                          strokeWidth="14"
                        />
                        {/* Progress */}
                        <circle
                          cx="70" cy="70" r={radius}
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="14"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground tabular-nums">{completionRate}%</span>
                        <span className="text-xs text-muted-foreground">done</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{completed} completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-muted flex-shrink-0" />
                        <span className="text-sm text-foreground">{active} remaining</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority Distribution Bar */}
                <div className="card p-6 flex flex-col gap-4">
                  <h2 className="text-sm font-semibold text-foreground">Tasks by Priority</h2>
                  {total === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                      No tasks yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={priorityBarData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="priority"
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }}
                        />
                        <Bar dataKey="Total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="Done" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* ── ROW 3: Priority Pie + Creation Trend ──────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">

                {/* Priority Pie */}
                <div className="card p-6 flex flex-col gap-4 md:col-span-2">
                  <h2 className="text-sm font-semibold text-foreground">Priority Breakdown</h2>
                  {total === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                      No tasks yet
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={priorityCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {priorityCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2 w-full">
                        {priorityCounts.map(p => (
                          <div key={p.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                              <span className="text-xs text-muted-foreground">{p.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-foreground tabular-nums">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Creation Trend Line */}
                <div className="card p-6 flex flex-col gap-4 md:col-span-3">
                  <h2 className="text-sm font-semibold text-foreground">Creation Trends (Last 14 Days)</h2>
                  {trendData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                      No data yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }} />
                        <Line
                          type="monotone"
                          dataKey="created"
                          name="Created"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={{ fill: 'var(--primary)', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          name="Completed"
                          stroke="var(--success)"
                          strokeWidth={2}
                          dot={{ fill: 'var(--success)', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
