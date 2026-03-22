# Architecture Rules & Conventions

This document defines the architectural patterns, coding conventions, and engineering principles that govern this codebase. Follow these when adding new features, fixing bugs, or refactoring existing code.

The goal is **pragmatic consistency** — apply these patterns where they reduce complexity, not as ceremony. Avoid over-engineering; use only what is necessary for the current scope.

---

## Table of Contents

1. [Layer Architecture](#layer-architecture)
2. [Domain Organization (DDD-Lite)](#domain-organization-ddd-lite)
3. [SOLID Principles in Practice](#solid-principles-in-practice)
4. [File & Module Naming](#file--module-naming)
5. [Code Style](#code-style)
6. [Documentation & Comments](#documentation--comments)
7. [Error Handling](#error-handling)
8. [Observability](#observability)

---

## Layer Architecture

The project follows a **Clean Architecture** approach adapted for Next.js App Router. Code is separated into layers with a strict dependency direction: **UI → Actions → Infra/Data**.

```
┌──────────────────────────────────────────────────────┐
│  app/              (Routes — pages, layouts, UI)     │
│  components/       (Reusable UI components)          │
└──────┬───────────────────────────────────────────────┘
       │  depends on ▼
┌──────────────────────────────────────────────────────┐
│  lib/actions/      (Server Actions — use cases)      │
│  lib/hooks/        (Client-side state & logic)       │
│  lib/validations/  (Zod schemas — input contracts)   │
└──────┬───────────────────────────────────────────────┘
       │  depends on ▼
┌──────────────────────────────────────────────────────┐
│  lib/supabase/     (Infrastructure — DB clients)     │
│  lib/utils.ts      (Cross-cutting utilities)         │
│  types/            (Domain types & interfaces)       │
└──────────────────────────────────────────────────────┘
```

### Dependency Rules

| Layer | May depend on | Must NOT depend on |
|---|---|---|
| `app/`, `components/` | `lib/actions/`, `lib/hooks/`, `lib/validations/`, `types/`, `components/ui/` | `lib/supabase/` directly |
| `lib/actions/` (Server Actions) | `lib/supabase/`, `lib/validations/`, `types/` | `app/`, `components/`, `lib/hooks/` |
| `lib/hooks/` | `types/`, `lib/actions/` (via server action imports) | `lib/supabase/` |
| `lib/validations/` | `types/` (if needed) | `lib/actions/`, `lib/supabase/`, `app/` |
| `lib/supabase/` | external packages only | any `app/`, `lib/actions/`, `lib/hooks/` |
| `types/` | nothing (pure type definitions) | any other layer |

### Where New Code Goes

| You're building… | Put it in… |
|---|---|
| A new page or route | `app/` following Next.js App Router conventions |
| A reusable visual component | `components/` (domain-specific) or `components/ui/` (generic/shadcn) |
| Server-side data mutations or queries | `lib/actions/<domain>.ts` |
| Client-side state management or side effects | `lib/hooks/use-<name>.tsx` |
| Input validation schemas (Zod) | `lib/validations/<domain>.ts` |
| Database client setup or infra utilities | `lib/supabase/` |
| Shared type definitions | `types/<domain>.ts` |
| Shared utility functions | `lib/utils.ts` or `lib/utils/<name>.ts` if growing |

---

## Domain Organization (DDD-Lite)

We use domain-driven grouping without the full DDD ceremony. No aggregates, repositories, or domain events — just clear file boundaries that mirror the problem domains.

### Bounded Contexts

Each domain area has its own set of files across layers:

| Domain | Types | Validations | Actions | Hooks |
|---|---|---|---|---|
| Menu | `types/menu.ts` | `lib/validations/menu.ts` | `lib/actions/menu.ts` | — |
| Auth | `types/index.ts` | `lib/validations/auth.ts` | `lib/actions/auth.ts` | — |
| Cart | `types/menu.ts` | — | — | `lib/hooks/use-cart.tsx` |

### Guidelines

- **One file per domain per layer** — when a domain grows too large (300+ lines), split into sub-files (e.g., `lib/actions/menu-categories.ts`, `lib/actions/menu-items.ts`).
- **Domain types go in `types/`** — these are the source of truth for data shapes. Server Actions and components both import from here.
- **Zod schemas go in `lib/validations/`** — these define the input contracts. Inferred types (`z.infer<>`) from schemas can complement `types/` but should not replace explicit domain types.
- **When creating a new domain**, add the corresponding files in each relevant layer (`types/`, `lib/validations/`, `lib/actions/`).

---

## SOLID Principles in Practice

Apply SOLID where it reduces complexity. These are practical patterns, not dogma.

### Single Responsibility

Each file and function should own **one concern**:

| File | Single Concern |
|---|---|
| `lib/actions/menu.ts` | CRUD operations for menu entities via Supabase |
| `lib/validations/menu.ts` | Input validation schemas for menu data |
| `lib/hooks/use-cart.tsx` | Client-side cart state management |
| `lib/supabase/server.ts` | Server-side Supabase client factory |
| `lib/supabase/middleware.ts` | Auth session refresh in middleware |

**Guideline:** if a Server Action file handles multiple entities (categories, items, modifiers), that's fine as long as they belong to the same domain. Split when the file exceeds ~300 lines or the entities have distinct lifecycle concerns.

### Open/Closed

Prefer extension over modification:

- **New pages/routes** — add new route folders under `app/`. Don't modify existing page logic to accommodate new features.
- **New UI components** — compose from existing `components/ui/` primitives via shadcn patterns. Don't modify base components for feature-specific behavior.
- **New domains** — add new files per layer. Don't extend existing domain files with unrelated concerns.

### Dependency Inversion

- Components and pages depend on **Server Actions** (abstraction), never on `lib/supabase/` directly.
- The Supabase client is created through factory functions (`createClient()`), not instantiated inline.
- If the data source changes, only `lib/supabase/` and `lib/actions/` need to change — UI remains untouched.

### Interface Segregation

- Server Actions export only the functions that pages/components need. Don't create "god modules" exporting dozens of unrelated functions.
- Custom hooks expose a focused API. The `useCart()` hook returns only `{ state, dispatch, totalCount, totalPrice }` — not internal reducer details.

### Reusability — Check Before You Build

Before implementing new functionality, check existing code:

- **`lib/utils.ts`** — shared utilities (e.g., `cn()` for class merging)
- **`components/ui/`** — shadcn components already available in the project
- **`lib/supabase/`** — existing client factories and auth helpers

**When to extract to shared utilities:**
- The same logic is needed in 2+ places
- The function is general-purpose, not domain-specific

**When NOT to extract:**
- The logic is domain-specific and used in one place
- Extracting would create a thin wrapper with no reuse value

---

## File & Module Naming

| Element | Convention | Example |
|---|---|---|
| TypeScript files | `kebab-case.ts` / `kebab-case.tsx` | `use-cart.tsx`, `mock-data.ts` |
| React components (files) | `kebab-case.tsx` | `image-upload.tsx`, `bottom-nav.tsx` |
| React components (exports) | `PascalCase` | `ImageUpload`, `BottomNav` |
| Custom hooks | `use-<name>.tsx` (file), `use<Name>` (export) | `use-cart.tsx` → `useCart()` |
| Server Actions files | `<domain>.ts` in `lib/actions/` | `menu.ts`, `auth.ts`, `upload.ts` |
| Server Actions functions | `camelCase` verbs | `createCategory()`, `getMenuItems()` |
| Zod schemas | `camelCase` + `Schema` suffix | `menuItemSchema`, `categorySchema` |
| Type definitions | `PascalCase` | `MenuItem`, `CartItem`, `Category` |
| Constants | `UPPER_SNAKE_CASE` | `DEFAULT_SORT_ORDER` |
| Environment variables | `UPPER_SNAKE_CASE` | `NEXT_PUBLIC_SUPABASE_URL` |
| Route directories | `kebab-case` or Next.js conventions `(group)`, `[param]` | `(client)`, `[categoryId]` |
| Type-inferred exports from Zod | `PascalCase` + `Input` suffix | `CategoryInput`, `MenuItemInput` |

---

## Code Style

### General

- **TypeScript strict mode** — leverage the compiler. Avoid `any`; use `unknown` + type narrowing when needed.
- **Prefer explicit imports** — `import { X, Y } from 'module'`, not `import *`.
- **Keep functions under ~60 lines** — extract helpers when complexity grows.
- **Prefer early returns** over deep nesting.
- **Use `'use server'` and `'use client'` directives** explicitly at the top of files that require them.

### Type Safety

- Use explicit types for function parameters and return types on all **Server Actions** and **exported functions**.
- Internal helpers and inline callbacks can use type inference.
- Define domain types in `types/` — avoid `Record<string, unknown>` in public interfaces; use properly typed objects.
- Use Zod schemas in `lib/validations/` for runtime validation of external input (forms, API payloads).

### Component Patterns

- **Server Components by default** — only add `'use client'` when the component needs interactivity (state, effects, event handlers).
- **Colocation** — page-specific components that aren't reused can live in the route folder itself.
- **Composition over props drilling** — prefer React Context or composition patterns over passing props through many layers.
- **shadcn/ui as base** — use `components/ui/` primitives for consistency. Don't install additional UI libraries without justification.

---

## Documentation & Comments

### File-Level Comments

Server Action files and complex utility files should start with a brief comment explaining the domain they serve:

```typescript
/**
 * Server Actions for the digital menu domain.
 * Handles CRUD for categories, menu items, and modifiers.
 */
'use server'
```

### Function Documentation

Use JSDoc for **exported functions** in Server Actions and shared utilities. Keep it concise:

```typescript
/**
 * Fetches all categories for a restaurant, ordered by sort_order.
 * Throws on database error.
 */
export async function getCategories(restaurantId: string) { ... }
```

### Inline Comments

- **Don't** narrate what the code does (`// increment counter`)
- **Do** explain non-obvious intent, trade-offs, or workarounds
- **Do** reference PRDs or design docs when relevant (`// See PRD-02: cart clears when switching restaurants`)

### Type Definitions

Document non-obvious fields in type definitions:

```typescript
export type CartItem = {
  id: string          // unique combination of itemId + selected modifiers
  itemId: string      // references MenuItem.id
  quantity: number
  modifiers: CartModifier[]
}
```

---

## Error Handling

### Error Handling Policy

| Situation | Pattern | Example |
|---|---|---|
| Server Action — single mutation | Return `{ error: string }` on failure, `{ data }` on success | `createCategory()`, `updateMenuItem()` |
| Server Action — read/query | `throw new Error()` on failure (caught by error boundaries) | `getCategories()`, `getMenuItems()` |
| Client-side hook/state | `try/catch` with `console.error`, graceful fallback | `useCart()` localStorage parsing |
| Form validation | Use Zod schema `.safeParse()` — return field-level errors | Form components with `react-hook-form` |
| Supabase client errors | Check `error` property from Supabase response — never assume success | All Server Actions |

### Guidelines

- **Server Actions that mutate data** should return `{ error: string }` or `{ data }` / `{ success: true }` — let the UI decide how to display the error (toast, inline, etc.).
- **Server Actions that read data** can throw errors to be caught by Next.js error boundaries.
- **Never swallow errors silently** — at minimum, `console.error()` with context.
- **Validate input at the boundary** — validate with Zod schemas before sending data to Supabase.
- **Catch specific errors** when possible. Use generic `catch` only as a last-resort fallback.

### Return Type Convention for Mutations

```typescript
// Consistent return shape for mutation Server Actions
type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never }
  | { success: true; error?: never }
```

---

## Observability

### Logging

For a client-facing Next.js application, logging strategy differs from backend services:

| Context | Approach |
|---|---|
| **Server Actions** | Use `console.error()` for failures, `console.warn()` for recoverable issues. These appear in the server runtime logs. |
| **Client Components** | Use `console.error()` only for unexpected failures. Remove `console.log()` debug statements before committing. |
| **Middleware** | Use `console.error()` for auth/redirect failures. Keep minimal. |

### Error Context

When logging errors in Server Actions, include enough context to debug:

```typescript
if (error) {
  console.error(`[menu/createCategory] Failed for restaurant ${restaurantId}:`, error.message)
  return { error: error.message }
}
```

### `console.log()` Policy

- **Development only** — `console.log()` is acceptable during local development and debugging.
- **Do not commit** `console.log()` statements to `main`. Use `console.error()` or `console.warn()` for important runtime information.
- **Exception:** structured startup/config logs in server initialization code.

### Monitoring via Supabase

Database-level observability is handled through Supabase:
- Use Supabase Dashboard for query performance monitoring
- Use Row Level Security (RLS) policies to audit data access patterns
- Track errors in Server Actions with consistent error return shapes so they can be surfaced to the UI and eventually to future monitoring tools

---

## Quick Reference for LLM Agents

> **This section provides directives for AI coding assistants working on this codebase.**

1. **Read `AGENTS.md` first** — this file. Understand the layer architecture before writing any code.
2. **Never import `lib/supabase/` from `app/` or `components/`** — always go through Server Actions.
3. **New domain = new files, not bigger files** — create `types/<domain>.ts`, `lib/validations/<domain>.ts`, `lib/actions/<domain>.ts`.
4. **Validate before mutating** — use Zod schemas from `lib/validations/` in forms and Server Actions.
5. **Server Components by default** — add `'use client'` only when needed (state, effects, events).
6. **Check existing `components/ui/`** before creating new UI primitives.
7. **Follow the return convention** for mutation Server Actions: `{ data }` | `{ error }` | `{ success }`.
8. **Type everything** — avoid `any`. Use `types/` for domain types, Zod for runtime validation.
9. **Keep it lean** — don't add abstractions, wrappers, or services unless there's a clear reuse or decoupling benefit. This is a Next.js app, not an enterprise backend.
10. **Read Next.js docs** — this project uses Next.js 16 with App Router. Read `node_modules/next/dist/docs/` for current APIs and conventions. Heed deprecation notices.
