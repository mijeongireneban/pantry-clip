# PantryClip

PantryClip is a mobile-first Next.js app for turning short-form cooking videos into editable recipe drafts.

## Current stack

- Next.js App Router
- React 19 + TypeScript
- Prisma + PostgreSQL
- Supabase Auth
- Zod validation
- OpenAI-backed summarize pipeline
- Graphile Worker for background summarize jobs

## Project structure

- `src/app/`: thin pages, layouts, and route handlers
- `src/apps/`: feature modules and app-level providers
- `src/apis/`: client-side fetch wrappers and DTOs
- `src/components/`: shared UI components
- `src/lib/auth/`: Supabase auth helpers
- `src/lib/server/`: server-only repositories, services, and worker helpers
- `src/worker/`: background worker entrypoints and task registration
- `prisma/`: schema and SQL migrations
- `docs/`: product and implementation notes

## Quick start

Install dependencies and generate Prisma types:

```bash
pnpm install
```

Start the web app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Background worker

Summarize jobs are asynchronous. To run them locally:

1. Start the app with `pnpm dev`
2. Run Graphile Worker migrations:

```bash
pnpm worker:migrate
```

3. Start the worker in a second terminal:

```bash
pnpm worker
```

Recommended environment setup:

- `DATABASE_URL`: app database connection string
- `GRAPHILE_WORKER_DATABASE_URL`: optional dedicated worker connection string
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

When the web app runs on Vercel and the worker runs elsewhere, keep the app on its normal runtime DB URL and point the dedicated worker at its own connection string.

## API docs

After starting the app, open:

- [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for Swagger UI
- [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi) for raw OpenAPI JSON

## Current behavior

- Supabase email/password auth is live
- Recipes are persisted with Prisma/Postgres
- `POST /api/recipes/summarize` creates an async summarize job and returns `202`
- The client polls job status and either:
  - fills an AI-generated draft
  - or opens manual entry if extraction is weak or generation fails
- AI drafting is currently positioned for YouTube Shorts only

## Verification

Useful local checks:

```bash
pnpm prisma:generate
pnpm typecheck
pnpm lint
```
