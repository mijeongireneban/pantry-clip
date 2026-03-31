# PantryClip Technical Decisions v1.0

> Status: Historical baseline.
>
> This document no longer reflects the current summarize architecture. In particular, it still assumes a synchronous summarize endpoint and client-only draft strategy.
>
> Current planning reference:
> [pantryclip-url-to-draft-ingestion-implementation-v2.0.md](./pantryclip-url-to-draft-ingestion-implementation-v2.0.md)

## 1. Purpose
Lock MVP technical decisions so implementation can proceed without re-opening foundational choices.

## 2. Locked Decisions (MVP)

1. Application stack
- Decision: Next.js (App Router) + TypeScript + Tailwind CSS.
- Why: Matches existing planning docs and enables fast full-stack delivery.

2. API architecture
- Decision: Use Next.js Route Handlers for MVP API (`/api/recipes*`).
- Why: Single deployment unit, lower operational overhead, easy transition to separate API later.

3. Data storage
- Decision: PostgreSQL on Supabase.
- Why: Managed Postgres + migrations + good fit for relational recipe/user model.

4. Authentication
- Decision: Supabase Auth (email/password first).
- Why: Fastest MVP path with built-in session management and straightforward RLS-compatible model.

5. ORM / DB access layer
- Decision: Prisma as the primary DB access layer.
- Why: Strong schema/migration workflow and team productivity for CRUD-heavy MVP.

6. AI provider and flow
- Decision: OpenAI API with synchronous summarize endpoint (`POST /api/recipes/summarize`) in MVP.
- Why: Simplest flow; avoids queue/background-job complexity until scale requires async.

7. AI draft policy
- Decision: AI output is draft-only and never auto-saved. User review/edit is mandatory before `POST /api/recipes`.
- Why: Controls AI quality risk and keeps user ownership of final recipe content.

8. URL ingestion policy
- Decision: URL-only best-effort summarization. If summarization fails, user can continue manually without blocking.
- Why: Lowest-friction UX and preserves completion path under AI failure.

9. Draft persistence strategy
- Decision: Keep AI draft client-side only for v1.0 (no server draft table).
- Why: Reduces schema/API scope; final persistence happens only on explicit save.

10. Duplicate link handling
- Decision: Soft warning on possible duplicate `(user_id, source_url)`; allow save.
- Why: Users may intentionally store multiple notes for same source.

11. Search scope
- Decision: Title-only search for v1.0 (`q` on `title`), indexed by `(user_id, title)`.
- Why: Meets MVP need with simpler indexing and predictable performance.

12. Analytics
- Decision: PostHog for product analytics.
- Why: Event-centric tracking aligns with MVP success metrics and fast instrumentation.

13. Error contract
- Decision: Standard error payload across endpoints:
  - `code`
  - `message`
  - `details?`
- Why: Consistent client handling and easier QA.

## 3. Schema Baseline

### `users`
- `id` uuid PK
- `email` unique not null
- `created_at` timestamp default now

### `recipes`
- `id` uuid PK
- `user_id` uuid FK -> `users.id` not null
- `source_url` text not null
- `source_type` enum(`youtube_shorts`,`instagram_reels`,`other`) not null
- `title` varchar(140) not null
- `ingredients_text` text not null
- `steps_text` text not null
- `summary_source` enum(`manual`,`ai`) not null default `ai`
- `ai_confidence` numeric nullable
- `created_at` timestamp default now
- `updated_at` timestamp default now

### Indexes
- `(user_id, created_at desc)`
- `(user_id, title)`
- `(user_id, source_url)` non-unique (duplicate warning helper)

## 4. API Baseline

1. `POST /api/recipes/summarize`
2. `POST /api/recipes`
3. `GET /api/recipes`
4. `GET /api/recipes/:id`
5. `PATCH /api/recipes/:id`
6. `DELETE /api/recipes/:id`

### API Rules
- All recipe endpoints are authenticated and owner-scoped.
- `summarize` does not persist recipe data.
- Server trims and normalizes text fields before persistence.
- `GET /api/recipes` supports cursor pagination (`limit` default 20, max 50).

## 5. Non-Functional Targets (MVP)

1. Mobile-first web UX for all core flows.
2. List page initial load target under 2.5s on standard mobile network.
3. No data loss after successful save response.
4. 72-hour post-launch stability with no critical errors.

## 6. Deferred to v1.1+

1. Ingredient/step full-text search.
2. Server-side draft recovery.
3. Async AI jobs with queue/retry workers.
4. Multi-language support beyond initial launch language.

---

Status: Approved baseline for MVP implementation.
