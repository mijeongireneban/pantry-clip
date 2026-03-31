# PantryClip PRD v1.0

## 1. Overview

### 1.1 Product Name
PantryClip (팬트리클립)

### 1.2 One-line Summary
PantryClip helps users turn short-form recipe videos into structured, searchable cooking notes.

### 1.3 Background
Users frequently save YouTube Shorts and Instagram Reels recipes, but struggle to reuse them because video content is hard to scan and unstructured for actual cooking.

### 1.4 Problem Statement
Short-form recipe content is easy to save but hard to retrieve and use during cooking. Users need a fast way to convert video-based recipes into clear notes (title, ingredients, steps) they can search and reference.

---

## 2. Goals and Non-Goals

### 2.1 Product Goals (MVP)
1. Let users save recipe links from Shorts/Reels.
2. Convert recipe info into a structured format usable while cooking.
3. Let users browse and search their saved recipes quickly.
4. Validate whether users actually return to and use saved notes.

### 2.2 Non-Goals (MVP)
1. Pantry/inventory tracking
2. Meal planning
3. Shopping list generation
4. Social/community features
5. Nutrition calculation
6. Recommendation algorithms

---

## 3. Target Users

### 3.1 Primary Segment
Singles or newly married users who consume many short-form recipe videos.

### 3.2 Profile
- Age: 25-39
- Interested in home cooking but non-expert
- Heavy Shorts/Reels recipe consumption
- Save content frequently, revisit infrequently

### 3.3 Core User Need
"Help me capture this quick recipe now and find/use it later when I cook."

---

## 4. MVP Scope

### 4.1 In-Scope Features
1. Save source URL (YouTube Shorts / Instagram Reels)
2. Create structured recipe content
- Default AI-assisted summarization from short video link
- User review and edit of AI draft before final save
3. Recipe list view (latest first)
4. Title-based search
5. Recipe detail, edit, and delete

### 4.2 Out-of-Scope for v1.0
Everything listed in Non-Goals section.

### 4.3 Functional Requirements
1. User can create a recipe record from a source URL.
2. System infers `source_type` from URL pattern.
3. System proposes an initial title; user can edit before save.
4. User can input and edit ingredients and steps as plain text.
5. User can list recipes with pagination.
6. User can search recipes by title.
7. User can view recipe detail and update/delete it.
8. AI summarization is the default draft path and must remain user-editable before final save.

### 4.4 Non-Functional Requirements
1. Mobile-first responsive UX.
2. Initial load target: under 2.5s on standard mobile network for list page.
3. Basic reliability: no data loss on successful save responses.
4. Security baseline: authenticated access to own recipes only.

---

## 5. User Experience

### 5.1 Primary Flow
1. Paste video link
2. Auto-generate editable title
3. Fill or refine ingredients/steps (manual or AI-assisted)
4. Save recipe
5. Search and reopen from recipe list

### 5.2 UX Principles
1. One-screen focus on core task (save and structure quickly)
2. Minimize typing burden
3. Optimize readability while cooking (clear sectioning, concise text)

---

## 6. Success Metrics

### 6.1 Phase 1: Founder Validation
1. Store 20+ recipes personally
2. Reopen recipes 5+ times
3. Use PantryClip during actual cooking sessions

### 6.2 Phase 2: Early User Validation
1. 100 signed-up users
2. Average 10+ saved recipes per activated user
3. 30%+ 4-week returning user rate

### 6.3 Event Tracking (Minimum)
1. `recipe_created`
2. `recipe_viewed`
3. `recipe_searched`
4. `recipe_updated`
5. `ai_summary_used`

---

## 7. Technical Design (MVP)

### 7.1 Recommended Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend/API: Next.js Route Handlers
- DB: PostgreSQL (Supabase or managed Postgres)
- Auth: Supabase Auth or NextAuth
- AI: OpenAI API (optional path)
- Deploy: Vercel + managed Postgres

### 7.2 Data Model
#### `users`
- `id` uuid (PK)
- `email` unique
- `created_at`

#### `recipes`
- `id` uuid (PK)
- `user_id` uuid (FK -> users.id)
- `source_url`
- `source_type` enum (`youtube_shorts`, `instagram_reels`, `other`)
- `title`
- `ingredients_text`
- `steps_text`
- `summary_source` enum (`manual`, `ai`)
- `created_at`
- `updated_at`

Indexes:
- `(user_id, created_at desc)`
- `(user_id, title)`

### 7.3 API Endpoints
1. `POST /api/recipes`
2. `GET /api/recipes`
3. `GET /api/recipes/:id`
4. `PATCH /api/recipes/:id`
5. `DELETE /api/recipes/:id`
6. `POST /api/recipes/summarize`

### 7.4 Architecture Principle
API-first, domain-first layering:
- UI layer: presentation only
- Domain layer: entities/use-cases/validation
- Server layer: handlers/repositories
- Shared layer: DTOs/schemas/constants

---

## 8. Milestones and Timeline

### 8.1 Milestone A: Product Definition
- PRD finalized
- Wireframe complete
- DB schema finalized

### 8.2 Milestone B: MVP Build
- Auth + recipe CRUD complete
- Search complete
- AI summarize endpoint complete (optional toggle)
- Mobile-first UI polish

### 8.3 Milestone C: Validation
- Personal usage milestone achieved
- Analytics baseline collected
- Prioritized backlog for v1.1 created

---

## 9. Risks and Mitigations

1. AI summary quality inconsistency
- Mitigation: always keep manual edit step before save.

2. Framework-coupled domain logic
- Mitigation: isolate business logic from UI components.

3. Future mobile migration friction
- Mitigation: stabilize API contracts and version carefully.

4. Low revisit behavior despite saves
- Mitigation: optimize search and recipe readability first, before adding new feature scope.

---

## 10. Open Decisions

1. Auth provider choice: Supabase Auth vs NextAuth
2. AI usage policy: default off vs opt-in prompt
3. Search evolution: title-only vs title + ingredients in v1.1
4. Initial language support: Korean only vs bilingual

---

## 11. Definition of Done (MVP)

1. User can create/read/update/delete own recipe records securely.
2. User can search recipes by title with acceptable speed.
3. Mobile web UX supports full core flow end-to-end.
4. Analytics events for create/view/search are recorded.
5. Product is used in real cooking context and meets Phase 1 validation criteria.

---

End of PRD v1.0
