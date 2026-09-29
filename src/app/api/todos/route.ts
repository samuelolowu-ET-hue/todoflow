// BACKEND INTEGRATION POINT:
// This is a Next.js API Route (App Router format).
// It runs on the server, so it is safe to use Supabase here.
//
// WHY USE API ROUTES INSTEAD OF CALLING SUPABASE DIRECTLY FROM THE CLIENT?
// For this personal app, either approach works. We use API routes because:
// 1. It keeps all database logic in one place (easier to debug).
// 2. It allows server-side input validation before hitting the database.
// 3. It's a good habit for when you add authentication later.
//
// SQL TABLE REQUIRED (run in Supabase SQL Editor):
// create table todos (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   notes text,
//   completed boolean not null default false,
//   priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now()
// );

import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { CreateTodoInput } from '@/types/todo';

// GET /api/todos — fetch all todos, newest first
export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Log the full error server-side for debugging
    console.error('[GET /api/todos] Supabase error:', error);
    // Return a user-friendly message without exposing database internals
    return NextResponse.json(
      { error: 'Failed to load tasks. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// POST /api/todos — create a new todo
export async function POST(request: Request) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up your Supabase environment variables.' },
      { status: 503 }
    );
  }

  let body: CreateTodoInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // Server-side validation
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    return NextResponse.json(
      { error: 'Task title is required.' },
      { status: 400 }
    );
  }

  if (body.title.trim().length > 300) {
    return NextResponse.json(
      { error: 'Task title must be 300 characters or fewer.' },
      { status: 400 }
    );
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (!body.priority || !validPriorities.includes(body.priority)) {
    return NextResponse.json(
      { error: 'Priority must be low, medium, or high.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('todos')
    .insert({
      title: body.title.trim(),
      notes: body.notes?.trim() || null,
      priority: body.priority,
      completed: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[POST /api/todos] Supabase error:', error);
    return NextResponse.json(
      { error: 'Failed to create task. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}