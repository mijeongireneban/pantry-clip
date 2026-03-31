# PantryClip Product Planning v1.0

## 1. Purpose
Define the non-code planning artifacts needed before implementation:
- Domain/schema design
- API contract design
- User flow and information architecture
- UI/UX structure and interaction rules

## 2. Product Scope Boundary (v1.0)
In scope:
1. Link input (YouTube Shorts / Instagram Reels)
2. Default AI draft generation
3. User review/edit before save
4. Recipe list and detail
5. Title search
6. Recipe update/delete

Out of scope:
1. Pantry inventory
2. Shopping list
3. Social/community
4. Recommendation engine

## 3. Information Architecture

### 3.1 Core Objects
1. User
2. Recipe
3. AI Draft Session (optional transient object, may not be persisted)

### 3.2 Screen Map (Mobile-first)
1. Auth
- Sign in / sign up

2. Recipe Home
- Search bar
- Recipe list (latest first)
- CTA: "Add recipe"

3. Add Recipe
- URL input
- "Generate with AI" action
- Loading/failed states

4. Review Draft
- Editable fields: title, ingredients, steps
- Save button
- Retry AI button (optional)

5. Recipe Detail
- Full structured content
- Edit / Delete actions

6. Edit Recipe
- Same form as Review Draft (without generation step)

## 4. User Flow Design

### 4.1 Primary Flow (Happy Path)
1. User pastes short-video URL
2. System validates URL format and infers source type
3. System requests AI draft
4. User reviews and edits title/ingredients/steps
5. User saves recipe
6. User returns to list, can search and reopen recipe

### 4.2 Edge Flow A: AI Failure
1. AI draft fails (timeout/invalid response)
2. System shows failure reason + action options
3. User either retries AI or continues with manual editing
4. User can still save recipe manually

### 4.3 Edge Flow B: Poor AI Draft
1. AI returns low-quality/incomplete output
2. User edits all fields directly
3. Save succeeds and marks source as AI-assisted

### 4.4 Edge Flow C: Duplicate/Similar Link
1. User enters a link already saved
2. System warns "similar link exists" (soft warning)
3. User can continue to save as separate note

## 5. UI/UX Planning

### 5.1 UX Principles
1. One core job per screen
2. Strong readability for cooking context
3. Reduce cognitive load during editing
4. Never block user due to AI quality

### 5.2 Form Design Rules
1. Title is single-line input, max length enforced
2. Ingredients and steps use multiline fields
3. Auto-save is not required in v1.0; explicit save only
4. Validation errors appear inline near each field

### 5.3 Empty / Loading / Error States
1. Empty list: explain value + show add CTA
2. AI loading: progress text + cancel/back option
3. AI error: retry + manual continue actions
4. Search no-result: preserve query + show clear button

### 5.4 Accessibility Baseline
1. Minimum body text size for mobile readability
2. Sufficient color contrast
3. All key actions reachable by keyboard
4. Labels for inputs and buttons

### 5.5 Wireframe Checklist
1. Auth screen
2. Home/list screen
3. Add-link screen
4. AI-review/edit screen
5. Detail screen
6. Edit confirmation + delete confirmation modal

## 6. Schema Planning

### 6.1 `users`
- `id` uuid PK
- `email` unique not null
- `created_at` timestamp not null default now

### 6.2 `recipes`
- `id` uuid PK
- `user_id` uuid FK -> users.id not null
- `source_url` text not null
- `source_type` enum(`youtube_shorts`,`instagram_reels`,`other`) not null
- `title` varchar(140) not null
- `ingredients_text` text not null
- `steps_text` text not null
- `summary_source` enum(`manual`,`ai`) not null default `ai`
- `ai_confidence` numeric nullable
- `created_at` timestamp not null default now
- `updated_at` timestamp not null default now

### 6.3 Suggested Constraints
1. `source_url` must be valid URL format
2. `title` length between 1 and 140
3. `ingredients_text` and `steps_text` cannot be empty at save time

### 6.4 Suggested Indexes
1. `(user_id, created_at desc)`
2. `(user_id, title)`
3. Optional dedupe helper: `(user_id, source_url)` non-unique

## 7. API Contract Planning

### 7.1 Endpoint Set (v1.0)
1. `POST /api/recipes/summarize`
2. `POST /api/recipes`
3. `GET /api/recipes`
4. `GET /api/recipes/:id`
5. `PATCH /api/recipes/:id`
6. `DELETE /api/recipes/:id`

### 7.2 Contract: `POST /api/recipes/summarize`
Request:
- `sourceUrl: string`

Response:
- `sourceType: "youtube_shorts" | "instagram_reels" | "other"`
- `titleDraft: string`
- `ingredientsDraft: string`
- `stepsDraft: string`
- `confidence?: number`

Rules:
1. This endpoint does not persist recipe data.
2. Client must require user review/edit before save.

### 7.3 Contract: `POST /api/recipes`
Request:
- `sourceUrl: string`
- `sourceType: enum`
- `title: string`
- `ingredientsText: string`
- `stepsText: string`
- `summarySource: "manual" | "ai"`

Response:
- `id`
- full recipe object

Rules:
1. Server validates ownership from auth context.
2. Server normalizes whitespace and trims fields.

### 7.4 Contract: `GET /api/recipes`
Query:
- `q?: string` (title search)
- `cursor?: string`
- `limit?: number` (default 20, max 50)

Response:
- `items: Recipe[]`
- `nextCursor?: string`

### 7.5 Error Model (all endpoints)
Standard error shape:
- `code` (e.g., `INVALID_INPUT`, `UNAUTHORIZED`, `NOT_FOUND`, `AI_TIMEOUT`)
- `message`
- `details?`

## 8. Data + UX Mapping
1. URL input -> `source_url`, inferred `source_type`
2. AI draft fields -> form defaults only (not persisted yet)
3. User edits -> final persisted fields
4. Search input -> query `q` against indexed title
5. Detail/edit/delete -> operations on `recipe.id` under owner scope

## 9. Planning Decisions to Finalize Before Build
1. URL ingestion policy
- Option A: user-provided caption/transcript required
- Option B: URL-only best effort (faster UX, higher AI risk)

2. Draft persistence strategy
- Option A: keep draft client-side only (simple)
- Option B: store draft server-side for recovery (more work)

3. Duplicate handling policy
- Option A: soft warning only (recommended)
- Option B: hard block duplicate URLs

4. Search scope in v1.0
- Option A: title only (recommended)
- Option B: title + ingredients (heavier indexing)

## 10. Design Deliverables Checklist
1. User flow diagram (happy + edge)
2. Low-fi wireframes for all 6 core screens
3. API schema doc (request/response examples)
4. ERD for `users` and `recipes`
5. UX copy sheet (button labels, error messages, empty states)
6. QA acceptance criteria per flow

## 11. Recommended Sequence (Non-Technical Planning First)
1. Finalize user flow + edge cases
2. Freeze screen map and wireframes
3. Freeze schema and API contracts
4. Write acceptance criteria and UX copy
5. Start implementation with minimal ambiguity

---

End of Product Planning v1.0
