# TodoFlow

A full-stack task management application built for productivity. Create, organise, and track tasks with notes, priorities, and analytics — all persisted in a real database.

> Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

---

## ✨ Features

### Task Management
- **Create tasks** with a title and optional notes
- **Edit tasks** inline — title, notes, and priority
- **Delete tasks** with a confirmation prompt (no accidental deletes)
- **Complete / uncomplete tasks** with a single click
- **Persistent storage** — all data lives in Supabase/PostgreSQL and survives page refreshes

### Notes
- Each task can carry a freeform note
- Notes are editable at any time
- Notes are stored in the database and never lost on refresh

### Priority
- Every task can be assigned a priority: `low`, `medium`, or `high`
- Priority is colour-coded in the UI for quick scanning

### Filtering
- Filter the task list by: **All**, **Active**, **Completed**
- Filter by priority level

### Analytics Dashboard (`/analytics`)
- **KPI cards**: total tasks, completed, active, high-priority count
- **Completion rate** — donut ring visualisation
- **Priority breakdown** — bar chart (total vs done per priority) and pie chart
- **14-day creation trend** — line chart showing task creation over time

### Theme
- **Light / Dark mode** toggle (sun/moon icon)
- Smooth 300 ms CSS transitions across all surfaces
- Preference persisted to `localStorage`
- Accessible colour palette with sufficient contrast in both modes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts |
| Hosting | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main task list (Home)
│   ├── analytics/page.tsx    # Analytics dashboard
│   ├── api/todos/            # REST API routes (GET, POST, PATCH, DELETE)
│   └── layout.tsx            # Root layout + ThemeProvider
├── components/
│   ├── TodoForm.tsx          # New task form
│   ├── TodoList.tsx          # Task list container
│   ├── TodoItem.tsx          # Individual task row
│   ├── TodoFilters.tsx       # Filter bar
│   ├── TodoStats.tsx         # Summary stats strip
│   ├── DeleteConfirmModal.tsx# Deletion confirmation dialog
│   └── ThemeToggle.tsx       # Light/dark toggle button
├── contexts/
│   ├── ThemeContext.tsx       # Theme state + localStorage persistence
│   └── AuthContext.tsx        # Auth state (Supabase)
├── lib/
│   └── supabase/             # Supabase client setup
└── types/
    └── todo.ts               # Shared TypeScript types
```

---

## 🗄️ Database Schema

```sql
todos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  notes       text,
  completed   boolean DEFAULT false,
  priority    text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
)
```

---

## ⚙️ Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:4028](http://localhost:4028) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (port 4028) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

---

## 🚢 Deployment

1. Push to GitHub
2. Import the repo into [Vercel](https://vercel.com)
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables
4. Deploy

After deployment, verify:
- Create a task → add notes → set priority → complete it → refresh → confirm data persists

---

## 🗺️ Roadmap / Planned Features

- [ ] User authentication (per-user task lists)
- [ ] Due dates and reminders
- [ ] Task tags / labels
- [ ] Drag-and-drop reordering
- [ ] Subtasks
- [ ] Export to CSV

---

## 📄 Agent Guidelines

See [`AGENTS.md`](./AGENTS.md) for the full specification that governs how AI coding agents should operate on this repository — including workflow, code standards, data rules, security, and the definition of done.

---

Built with ❤️ on [Rocket.new](https://rocket.new)