# AGENTS.md

## 1. Purpose

This file defines how an AI coding agent must operate when working on this repository.

The agent is responsible for making safe, maintainable, tested changes while preserving the existing functionality of the application.

This is an educational project. The owner is an early-stage AI Engineering learner and should be able to understand and explain the implementation.

Prefer clarity and maintainability over cleverness or unnecessary abstraction.

---

## 2. Project Context

This repository contains a full-stack to-do application.

The application must support:

* Creating tasks
* Editing tasks
* Deleting tasks
* Completing and uncompleting tasks
* Adding notes to tasks
* Editing notes
* Assigning task priority
* Filtering tasks
* Persistent storage
* Production deployment

### Required Notes Feature

Notes are a core product requirement.

Notes must:

* Belong to a specific task.
* Be persisted in the database.
* Be editable.
* Remain available after page refresh.
* Never be implemented as static or mock data.

### Additional Feature

Task priority is an additional required feature.

Supported priorities:

* `low`
* `medium`
* `high`

---

## 3. Technology Constraints

Use the existing project stack unless there is a compelling reason to change it.

Preferred stack:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase/PostgreSQL
* GitHub
* Vercel or Netlify

### Dependency Rule

Do not add a dependency unless:

1. The functionality cannot reasonably be implemented with the existing stack.
2. The dependency provides meaningful value.
3. Its addition does not introduce unnecessary complexity.

Before installing a package, inspect the existing dependencies and determine whether an existing solution is sufficient.

---

## 4. Agent Operating Principles

The agent MUST:

* Inspect the repository before making changes.
* Understand existing code before modifying it.
* Prefer small, incremental changes.
* Preserve working functionality.
* Avoid unnecessary rewrites.
* Reuse existing components and utilities where appropriate.
* Keep business logic understandable.
* Validate changes before declaring them complete.
* Clearly report assumptions and unresolved issues.

The agent MUST NOT:

* Claim a feature works without testing it.
* Invent APIs, environment variables, files, or database structures.
* Replace working architecture without justification.
* Introduce unnecessary frameworks or libraries.
* Commit secrets.
* Disable linting or type checking merely to make the build pass.
* Delete tests simply because they fail.
* Hide errors from the user.

---

# 5. Standard Workflow

For every non-trivial task, follow this workflow.

## Step 1 — Inspect

Before editing:

* Inspect the repository structure.
* Identify the relevant files.
* Read the existing implementation.
* Check package scripts.
* Check existing tests.
* Check relevant database/schema code.
* Check environment-variable requirements.

Do not modify files before understanding the relevant implementation.

---

## Step 2 — Plan

For changes involving multiple files or meaningful architecture:

1. Identify the desired outcome.
2. Identify affected files.
3. Identify potential regressions.
4. Choose the smallest reasonable implementation.

For simple changes, a full written plan is unnecessary.

If requirements are ambiguous and the ambiguity materially affects the implementation, ask for clarification.

Otherwise make the simplest reasonable assumption and state it.

---

## Step 3 — Implement

Implement the smallest change that satisfies the requirement.

Follow existing project conventions.

Prefer:

* Small components
* Explicit types
* Clear function names
* Reusable logic
* Predictable data flow
* Simple state management

Avoid premature abstraction.

Do not create generic utilities until there is a real need for reuse.

---

## Step 4 — Validate

After implementation:

1. Run the relevant tests.
2. Run linting.
3. Run TypeScript/type checking if configured.
4. Run the production build when appropriate.
5. Manually verify important user flows.

Fix failures caused by the change before declaring the task complete.

Do not ignore warnings or errors without explaining why they are safe to leave unresolved.

---

## 6. Code Standards

### TypeScript

Use TypeScript throughout the application.

Avoid:

```ts
any
```

unless there is a documented and justified reason.

Prefer explicit types for:

* Database records
* Component props
* API responses
* Function parameters
* Important application state

Keep types close to the code they describe unless they are shared across multiple modules.

---

### React

Use functional components.

Keep components focused on a single responsibility.

Avoid unnecessarily large components.

Separate:

* UI rendering
* Data access
* Business logic

when doing so improves maintainability.

Do not introduce state-management libraries unless the application's complexity genuinely requires one.

---

### Naming

Use descriptive names.

Prefer:

```text
TodoItem
TodoForm
TodoFilters
updateTodo
deleteTodo
```

over ambiguous names such as:

```text
Item
Form
handleData
processThing
```

---

### Comments

Do not add comments that merely restate the code.

Use comments when explaining:

* Non-obvious business logic
* Important architectural decisions
* Workarounds
* External constraints
* Security considerations

---

# 7. Data and Database Rules

The application uses persistent database storage.

A task should contain at least:

```text
id
title
notes
completed
priority
created_at
updated_at
```

Priority values must be constrained to:

```text
low
medium
high
```

Database operations must handle failures explicitly.

Do not assume database operations succeeded merely because no exception was thrown.

When modifying the schema:

1. Inspect the existing schema first.
2. Make the smallest required change.
3. Preserve existing data where possible.
4. Update application types and queries accordingly.
5. Verify the application still works after the migration.

---

# 8. Error Handling

Errors must be handled at the appropriate layer.

For user-facing failures:

* Show a clear, useful message.
* Preserve the rest of the application where possible.
* Do not expose stack traces or internal implementation details.

For development diagnostics:

* Use appropriate logging.
* Include enough context to identify the failure.
* Never log secrets or sensitive credentials.

Never silently swallow an error.

Bad:

```ts
try {
  await saveTodo();
} catch {}
```

Better:

```ts
try {
  await saveTodo();
} catch (error) {
  console.error("Failed to save todo", error);
  setError("Unable to save the task. Please try again.");
}
```

---

# 9. Security Rules

Never commit secrets.

Never expose:

* Database passwords
* API keys
* Service-role keys
* Private tokens
* Authentication secrets

Use environment variables.

Client-side code must only receive credentials explicitly designed to be public.

Never bypass security controls merely to make development easier.

Validate user-controlled input before using it in database operations or other sensitive contexts.

---

# 10. UI and UX Rules

The application should be:

* Responsive
* Accessible
* Keyboard usable where practical
* Visually consistent
* Simple to understand

Important asynchronous operations should provide feedback.

Examples:

* Loading state
* Disabled submit button
* Error state
* Empty state
* Success feedback where appropriate

Destructive operations such as deletion should require an appropriate confirmation or undo mechanism.

Do not sacrifice usability merely to make the implementation shorter.

---

# 11. Testing Requirements

At minimum, verify these flows:

### Task Management

* Create task
* Edit task
* Delete task
* Complete task
* Uncomplete task

### Notes

* Create task with notes
* View notes
* Edit notes
* Save notes
* Refresh page
* Confirm notes persist

### Priority

* Set low priority
* Set medium priority
* Set high priority
* Change priority

### Filtering

Verify:

* All tasks
* Active tasks
* Completed tasks
* Priority filtering

### Reliability

Also verify:

* Empty task list
* Failed database operation
* Slow/loading state
* Mobile layout
* Production build

---

# 12. Git Practices

Make changes that are easy to review.

Prefer focused commits when the agent is asked to commit.

Commit messages should describe the change.

Examples:

```text
feat: add task notes
feat: add task priority filtering
fix: handle failed todo updates
test: add todo persistence tests
```

Do not create commits containing unrelated changes.

Never rewrite or destroy Git history unless explicitly instructed.

---

# 13. Deployment

The application must be deployable to a public URL.

Before deployment:

* Confirm the production build succeeds.
* Confirm required environment variables are configured.
* Confirm the database is accessible.
* Confirm the application works without development-only assumptions.

After deployment:

1. Open the public URL.
2. Create a task.
3. Add notes.
4. Change priority.
5. Complete the task.
6. Refresh the page.
7. Confirm persisted data remains available.
8. Test the primary user flows again.

Do not report deployment as successful until the deployed application has been verified.

---

# 14. Environment Variables

Environment variables must be documented without exposing secret values.

If required variables are missing:

* Identify which variables are required.
* Explain where they are used.
* Do not invent credentials.
* Do not commit `.env` files containing secrets.

A safe example file may be maintained:

```text
.env.example
```

Example values must be placeholders only.

---

# 15. Handling Existing Bugs

If a task exposes an unrelated existing bug:

1. Determine whether it blocks the requested work.
2. Do not silently rewrite unrelated code.
3. Fix it if the fix is small and clearly safe.
4. Otherwise report it separately.

Do not expand the scope of a task unnecessarily.

---

# 16. Handling Ambiguous Requests

When requirements are unclear:

### Ask for clarification when:

* Two interpretations would produce materially different behaviour.
* A decision affects the database schema.
* A decision affects security.
* A destructive action is requested but its scope is unclear.

### Make a reasonable assumption when:

* The ambiguity is minor.
* The implementation is easily reversible.
* Existing project conventions provide a clear answer.

When making an assumption, state it briefly.

---

# 17. Documentation

Keep documentation synchronized with the actual implementation.

Update documentation when changes affect:

* Setup
* Environment variables
* Database schema
* Development commands
* Deployment
* Major architecture

Do not create documentation for functionality that does not exist.

---

# 18. Definition of Done

A task is complete only when:

* The requested functionality exists.
* Existing functionality still works.
* Type checking passes where configured.
* Linting passes where configured.
* Relevant tests pass.
* The production build succeeds when applicable.
* Error handling is implemented.
* No secrets were introduced.
* Documentation is updated when necessary.
* The implementation has been manually verified when appropriate.

For deployment tasks, the public URL must also be tested.

Never use "done" to mean "the code was generated."

"Done" means the implementation was **verified**.

---

# 19. Final Response Format

After completing a task, report:

### Changed

Briefly describe what was implemented.

### Files

List the important files changed.

### Validation

Report the checks actually performed.

Example:

```text
✓ TypeScript
✓ ESLint
✓ Production build
✓ Todo creation
✓ Notes persistence
✓ Priority filtering
```

Do not claim checks were performed if they were not.

### Known Issues

List any remaining problems, limitations, or assumptions.

Keep the final report concise and factual.