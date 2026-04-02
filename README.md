# PantryClip

PantryClip turns short-form cooking videos into structured, editable recipe notes.

Shorts and Reels are easy to save, but hard to actually cook from later. PantryClip is built for that gap: paste a video link, turn it into a readable recipe draft, edit what matters, and keep it in a searchable personal recipe library.

## Why PantryClip

- Save recipe ideas from short-form video without losing the details
- Convert video content into cooking-friendly notes with title, ingredients, and steps
- Review and edit the draft before saving, instead of trusting AI blindly
- Reopen recipes later in a format that is much easier to use in the kitchen

## Product Snapshot

PantryClip is currently a mobile-first web app focused on a single core workflow:

1. Paste a recipe video URL
2. Generate an editable recipe draft
3. Review or rewrite the content as needed
4. Save it to your personal library
5. Search and revisit it later

Current product highlights:

- Mobile-first recipe workflow
- Email/password authentication
- AI-assisted draft generation
- Manual editing before final save
- Personal recipe library with search
- Recipe detail, update, and delete flows

Current scope notes:

- AI drafting is currently tuned for YouTube Shorts
- PantryClip is intentionally focused on short-form recipe organization
- Pantry, meal planning, shopping lists, and social features are out of scope for the MVP

## What Makes It Useful

PantryClip is not trying to be a general recipe platform. It is a focused tool for people who already discover recipes through short-form video and want a cleaner way to save and reuse them.

That means the product is optimized for:

- fast capture
- minimal typing
- readable cooking notes
- easy search and revisit

## Visuals And Marketing Assets

The repo does not include polished product screenshots yet. A placeholder structure for future README visuals lives in [`docs/assets/readme/README.md`](./docs/assets/readme/README.md).

Recommended future assets:

- auth screen screenshot
- add-recipe flow screenshot
- recipe library screenshot
- recipe detail screenshot
- short GIF showing URL to draft flow

## Tech Stack

- Next.js App Router
- React 19 + TypeScript
- Prisma + PostgreSQL
- Supabase Auth
- Zod validation
- OpenAI-backed summarize pipeline
- Graphile Worker for background summarize jobs

## Architecture At A Glance

- `src/app/`: thin pages, layouts, and route handlers
- `src/apps/`: feature modules and app-level providers
- `src/apis/`: client-side fetch wrappers and DTOs
- `src/components/`: shared UI components
- `src/lib/auth/`: Supabase auth helpers
- `src/lib/server/`: server-only repositories, services, and worker helpers
- `src/worker/`: background worker entrypoints and task registration
- `prisma/`: schema and migrations
- `docs/`: product and implementation notes

## Quick Start

Install dependencies and generate Prisma types:

```bash
pnpm install
```

Start the app:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment

Recommended local environment variables:

- `DATABASE_URL`
- `GRAPHILE_WORKER_DATABASE_URL` for a dedicated worker connection
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Background Worker

PantryClip uses asynchronous summarize jobs for AI recipe drafting.

Run the full local flow:

1. Start the app with `pnpm dev`
2. Run worker migrations with `pnpm worker:migrate`
3. Start the worker in a second terminal with `pnpm worker`

When the app runs on Vercel and the worker runs elsewhere, keep the app on its runtime database URL and point the worker to its own connection string.

## API Docs

After the app is running:

- [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for Swagger UI
- [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi) for raw OpenAPI JSON

## Current Behavior

- Authenticated users can create and manage their own recipes
- Recipe data is stored with Prisma and PostgreSQL
- `POST /api/recipes/summarize` creates an async summarize job and returns `202`
- The client polls summarize job status before opening the draft review step
- Users can continue manually if AI extraction is weak or draft generation fails

## Verification

Useful local checks:

```bash
pnpm prisma:generate
pnpm typecheck
pnpm lint
```

## Product Docs

For deeper product and implementation context, start with:

- [`docs/pantryclip-project-brief-v0.1.md`](./docs/pantryclip-project-brief-v0.1.md)
- [`docs/pantryclip-prd-v1.0.md`](./docs/pantryclip-prd-v1.0.md)
- [`docs/pantryclip-feature-list-v1.0.md`](./docs/pantryclip-feature-list-v1.0.md)
