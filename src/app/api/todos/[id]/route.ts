// BACKEND INTEGRATION POINT:
// Dynamic API route for operations on a specific todo by its UUID.
// PATCH updates fields; DELETE removes the record.
//
// WHY PATCH INSTEAD OF PUT?
// PATCH updates only the fields you send. PUT replaces the entire record.
// PATCH is safer here because we often only want to toggle 'completed'
// without accidentally clearing other fields.

import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UpdateTodoInput } from '@/types/todo';

// PATCH /api/todos/[id] — update specific fields of a todo
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up your Supabase environment variables.' },
      { status: 503 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Todo ID is required.' }, { status: 400 });
  }

  let body: UpdateTodoInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Build the update object, only including fields that were sent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title cannot be empty.' }, { status: 400 });
    }
    if (body.title.trim().length > 300) {
      return NextResponse.json({ error: 'Task title must be 300 characters or fewer.' }, { status: 400 });
    }
    updates.title = body.title.trim();
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes?.trim() || null;
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      return NextResponse.json({ error: 'Completed must be true or false.' }, { status: 400 });
    }
    updates.completed = body.completed;
  }

  if (body.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: 'Priority must be low, medium, or high.' }, { status: 400 });
    }
    updates.priority = body.priority;
  }

  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[PATCH /api/todos/${id}] Supabase error:`, error);
    return NextResponse.json(
      { error: 'Failed to update task. Please try again.' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// DELETE /api/todos/[id] — permanently remove a todo
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up your Supabase environment variables.' },
      { status: 503 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Todo ID is required.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[DELETE /api/todos/${id}] Supabase error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete task. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}