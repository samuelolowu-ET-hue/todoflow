# AGENTS.md

## Project Overview

TodoFlow is a full-stack to-do list application built as part of an AI Engineering cohort assignment in Lagos, Nigeria.

The application allows users to:

- Create tasks with a title, notes, and priority
- Edit tasks (title, notes, priority)
- Delete tasks (with confirmation)
- Mark tasks as completed or incomplete
- Add and edit notes on any task
- Filter tasks by status (All, Active, Completed) and by priority (Low, Medium, High)
- Persist all data in a PostgreSQL database via Supabase

The primary goal is to demonstrate the ability to use an AI coding agent to build, test, debug, and deploy a functional web application.

---

## User Skill Level

The project owner is an early-stage AI Engineering learner participating in a cohort in Lagos, Nigeria.

When making changes:

- Explain important technical decisions clearly.
- Prefer simple, maintainable solutions over unnecessary complexity.
- Do not introduce libraries or architectural patterns without a clear reason.
- When changing existing functionality, explain what changed and why.
- Assume the project owner may need to explain the implementation during a technical review.

---

## Technology Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 15 (App Router)           |
| Language    | TypeScript                        |
| UI Library  | React 19                          |
| Styling     | Tailwind CSS v3                   |
| Database    | Supabase (PostgreSQL)             |
| Hosting     | Vercel or Netlify                 |
| Version Control | GitHub                        |
| Notifications | Sonner (toast notifications)    |

---

## Project Structure

/
├── AGENTS.md                    ← This file
├── README.md                    ← Setup and usage instructions
├── public/
│   └── assets/images/           ← Static images
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← Root layout, font, metadata
│   │   ├── page.tsx             ← Main todo management screen
│   │   └── api/
│   │       └── todos/
│   │           ├── route.ts     ← GET all todos, POST new todo
│   │           └── [id]/
│   │               └── route.ts ← PATCH update, DELETE todo
│   ├── components/
│   │   ├── TodoForm.tsx         ← Create new task form
│   │   ├── TodoList.tsx         ← Renders list of todos
│   │   ├── TodoItem.tsx         ← Individual task card with inline edit
│   │   ├── TodoFilters.tsx      ← Filter tabs
│   │   ├── TodoStats.tsx        ← Header stat counters
│   │   └── DeleteConfirmModal.tsx ← Confirmation dialog for deletion
│   ├── lib/
│   │   └── supabase.ts          ← Supabase client initialization
│   ├── types/
│   │   └── todo.ts              ← TypeScript type definitions
│   └── styles/
│       └── tailwind.css         ← Tailwind directives + CSS variables

---

## Database Schema

Run the following SQL in your Supabase SQL Editor to create the required table:

create table todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  completed boolean not null default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

### Why UUID instead of integer IDs?

UUIDs (Universally Unique Identifiers) are safer than sequential integers because they cannot be guessed or iterated. This matters even for personal apps because it prevents accidental exposure of your data structure.

---

## Environment Variables

Create a `.env.local` file at the root of the project:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

**Important security notes:**
- Never commit `.env.local` to version control.
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser.
- The **anon key** is safe for client-side use because Supabase Row Level Security (RLS) controls access.
- Never use the **service role key** in client-side code — it bypasses all security.

---

## Coding Standards

- Use TypeScript with explicit types for all important data structures.
- Use functional React components with hooks.
- Keep components small and focused on a single responsibility.
- Use descriptive variable and function names.
- Avoid duplicated logic — extract shared helpers to `/lib`.
- Keep business logic (API calls, data transforms) separate from presentation components where practical.
- Do not add dependencies unless they provide clear value.
- Remove unused imports, variables, and dead code.
- Do not leave `console.log` statements in production code.

---

## Functional Requirements

The application must support:

1. Creating a todo (title required, notes optional, priority required).
2. Editing a todo (title, notes, and priority can be changed).
3. Deleting a todo (with a confirmation dialog).
4. Marking a todo complete or incomplete (toggle).
5. Adding and editing notes (notes are first-class data, not placeholder text).
6. Assigning a priority: `low`, `medium`, or `high`.
7. Filtering todos by: All, Active, Completed, Low, Medium, High.
8. Persisting all data in Supabase/PostgreSQL.
9. Showing loading states while data is being fetched or mutated.
10. Showing an empty state when no todos match the current filter.
11. Displaying user-friendly error messages when operations fail.

---

## Notes Feature

Notes are a core feature, not an afterthought.

Every todo has a `notes` field stored in the database.

Users can:
- Add notes when creating a task.
- View notes on each task card (collapsed by default, expandable).
- Edit notes when editing a task.
- Save notes — they persist after page refresh.

Notes must never be displayed as static placeholder text. They are real persisted application data.

---

## Error Handling

- Never silently ignore errors from database or API operations.
- Log diagnostic information to the console during development only.
- Display a user-friendly error message in the UI.
- Never expose stack traces, SQL errors, or Supabase internals to the user.
- Errors should be localized — a failed delete should not crash the entire list.

---

## Security

- Use environment variables for all credentials.
- Never expose the Supabase service-role key in client-side code.
- Never commit `.env.local` or any file containing real credentials.
- Validate user input on the server side in API routes.
- Do not trust client-provided IDs without validation.

---

## Testing Checklist

Before declaring a feature complete, verify:

- [ ] Create a new task with title only
- [ ] Create a new task with title, notes, and priority
- [ ] Edit a task title
- [ ] Edit task notes
- [ ] Change task priority
- [ ] Mark a task as completed
- [ ] Mark a completed task as incomplete
- [ ] Delete a task (confirm the dialog appears)
- [ ] Filter by All, Active, Completed, Low, Medium, High
- [ ] Refresh the page and confirm all data persists
- [ ] Test on a mobile-sized screen (375px width)
- [ ] Verify error messages appear when the database is unavailable
- [ ] Run `npm run build` and confirm it succeeds with no errors

---

## Deployment Requirements

1. Push the project to a GitHub repository.
2. Connect the repository to Vercel or Netlify.
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the hosting platform's dashboard.
4. Deploy and wait for the build to complete.
5. Open the public URL in a browser and test all core flows.
6. Do not claim deployment is successful until the public URL has been manually tested.

---

## Maintenance

When making changes to this project:

1. Read and understand the existing implementation before changing anything.
2. Make the smallest reasonable change to achieve the goal.
3. Do not rewrite working functionality unnecessarily.
4. Update this file and the README if setup or usage changes.
5. Run `npm run build` after changes to confirm no TypeScript or build errors.

---

## Agent Behaviour

When an AI coding agent works on this project:

- Ask for clarification when requirements are genuinely ambiguous.
- Otherwise make reasonable, documented assumptions.
- Explain significant technical decisions.
- Prefer maintainability over cleverness.
- Avoid unnecessary complexity.
- Never claim a feature works without testing it.
- Do not add libraries without explaining why they are necessary.
- Do not rewrite working code without a clear reason.