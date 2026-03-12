# PantryClip

MVP codebase for PantryClip using Next.js App Router + Next.js API Route Handlers.

## Structure (Blueprint-aligned)

- `src/app/`: routing shell only (pages/layouts/api route handlers)
- `src/apps/`: feature modules and app-level providers
- `src/apis/`: client-side API callers + DTO types
- `src/components/`: reusable shared components
- `src/lib/`: shared libraries/utilities (`react-query`, `axios`, `auth`, server utils)
- `src/config/`: app/runtime configuration
- `src/styles/`: global styles
- `docs/`: planning/product docs

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API docs (Swagger UI)

After starting the app, open:

- `http://localhost:3000/api-docs` for interactive Swagger UI
- `http://localhost:3000/api/openapi` for raw OpenAPI JSON

## Current status

- API route stubs are implemented for:
  - `GET /api/health`
  - `POST /api/recipes/summarize`
  - `POST /api/recipes`
  - `GET /api/recipes`
  - `GET /api/recipes/:id`
  - `PATCH /api/recipes/:id`
  - `DELETE /api/recipes/:id`
- Temporary in-memory repository is used as a placeholder.
- Temporary auth stub uses `DEV_USER_ID` or fallback `dev-user-id`.

## Next implementation steps

1. Replace auth stub with Supabase Auth session extraction.
2. Replace in-memory repository with Prisma + Postgres.
3. Implement OpenAI summarization logic in `POST /api/recipes/summarize`.
4. Build mobile-first UI screens from the docs.
