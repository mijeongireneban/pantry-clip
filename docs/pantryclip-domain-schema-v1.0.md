# PantryClip Domain and Schema v1.0 (MVP)

## 1. Domain Scope (MVP)
PantryClip MVP supports:
1. Authenticated user access
2. Save recipe from short-video URL
3. AI-assisted draft + manual edit before save
4. Recipe list (latest first)
5. Title-based search
6. Recipe detail/edit/delete

Not included in this schema version:
1. Pantry inventory
2. Meal planning
3. Shopping list
4. Social features
5. Nutrition engine

## 2. Domain Model

### 2.1 User
Represents an authenticated account owner.

Fields:
1. `id` (UUID)
2. `email` (unique)
3. `created_at`
4. `updated_at`

### 2.2 Recipe
Represents a user-owned, structured cooking note.

Fields:
1. `id` (UUID)
2. `user_id` (FK -> users.id)
3. `source_url`
4. `source_type` (`youtube_shorts` | `instagram_reels` | `other`)
5. `title`
6. `ingredients_text`
7. `steps_text`
8. `summary_source` (`manual` | `ai`)
9. `ai_confidence` (nullable float 0..1)
10. `created_at`
11. `updated_at`

Rules:
1. Recipe belongs to exactly one user.
2. All read/write operations are scoped by `user_id`.
3. `title`, `ingredients_text`, and `steps_text` are required.
4. `ai_confidence` must be null for manual entries, optional for AI-drafted entries.

## 3. API-Domain Mapping
1. `POST /api/recipes/summarize`
  Returns draft payload only (not persisted).
2. `POST /api/recipes`
  Persists final reviewed recipe.
3. `GET /api/recipes`
  Returns user recipes sorted by `created_at DESC`.
4. `GET /api/recipes/:id`
  Returns single user-owned recipe.
5. `PATCH /api/recipes/:id`
  Updates editable fields (`title`, `ingredients_text`, `steps_text`, optionally source metadata).
6. `DELETE /api/recipes/:id`
  Hard delete in MVP.

## 4. Storage Schema (PostgreSQL)

### 4.1 Enums
1. `source_type`: `youtube_shorts`, `instagram_reels`, `other`
2. `summary_source`: `manual`, `ai`

### 4.2 Tables
1. `users`
2. `recipes`

### 4.3 Constraints
1. `users.email` unique and lowercased at app layer
2. `recipes.user_id` FK with `ON DELETE CASCADE`
3. `recipes.ai_confidence` constrained to `0 <= value <= 1`
4. `recipes.title` max length 140

## 5. Index Strategy (MVP)
1. List page: `(user_id, created_at DESC, id DESC)`
2. Search by title (case-insensitive):
  `CREATE INDEX ... ON recipes (user_id, lower(title));`
3. Ownership detail lookup:
  Primary key on `id` + ownership filter by `user_id`

## 6. Query Patterns
1. List:
  `WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2`
2. Search:
  `WHERE user_id = $1 AND lower(title) LIKE '%' || lower($2) || '%'`
3. Detail:
  `WHERE id = $1 AND user_id = $2`

## 7. Cursor Pagination Shape
Use opaque cursor from `(created_at, id)` pair.

Cursor decode contract:
1. `createdAt`: ISO datetime
2. `id`: UUID

Next page predicate:
`(created_at, id) < ($createdAt, $id)` with same ordering.

## 8. Validation Contract (App Layer)
1. `source_url`: valid URL
2. `title`: trimmed, 1..140 chars
3. `ingredients_text`: trimmed, min 1
4. `steps_text`: trimmed, min 1
5. `summary_source`: enum
6. `ai_confidence`: nullable, 0..1

## 9. Future-Compatible Extensions (Not in MVP)
1. `archived_at` for soft delete
2. Full-text search (`tsvector`) over title + ingredients
3. `language` field for multilingual support
4. `recipe_events` table for product analytics

