-- Migration: Add RLS policies for todos table
-- The todos table already exists with RLS enabled.
-- This app has no authentication, so we allow public access to all operations.
-- This is appropriate for a personal/cohort assignment app without user accounts.

-- Allow anyone to read todos
DROP POLICY IF EXISTS "todos_select_public" ON public.todos;
CREATE POLICY "todos_select_public"
ON public.todos
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert todos
DROP POLICY IF EXISTS "todos_insert_public" ON public.todos;
CREATE POLICY "todos_insert_public"
ON public.todos
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update todos
DROP POLICY IF EXISTS "todos_update_public" ON public.todos;
CREATE POLICY "todos_update_public"
ON public.todos
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to delete todos
DROP POLICY IF EXISTS "todos_delete_public" ON public.todos;
CREATE POLICY "todos_delete_public"
ON public.todos
FOR DELETE
TO public
USING (true);
