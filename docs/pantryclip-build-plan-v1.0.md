# PantryClip Build Plan v1.0

## 1. Objective
Ship a usable web MVP that lets users convert short-video recipe links into AI-drafted, editable, searchable recipe notes.

## 2. Build Principles
1. Keep scope strictly aligned with PRD v1.0.
2. Optimize for speed of validation, not completeness.
3. Treat AI output as draft only; user edit is mandatory before save.
4. Prioritize mobile-first usability for core flow.

## 3. Delivery Milestones

### Milestone 0: Project Setup (Day 1)
Deliverables:
- Next.js app initialized with TypeScript + Tailwind
- Env/config scaffold for DB, auth, OpenAI
- Base folder architecture (`ui/domain/server/shared`)
- CI basics (lint + typecheck)

Exit criteria:
- `npm run lint` and `npm run typecheck` pass
- App boots locally with placeholder pages

### Milestone 1: Auth + Data Foundation (Day 2-3)
Deliverables:
- Auth provider integrated (pick one: Supabase Auth recommended)
- DB schema for `users` and `recipes`
- Migration workflow enabled
- Server-side auth guards for recipe routes

Exit criteria:
- Authenticated user can sign in/out
- DB schema deployed in dev
- Unauthorized recipe access blocked

### Milestone 2: Core Recipe CRUD (Day 4-5)
Deliverables:
- `POST /api/recipes`
- `GET /api/recipes` (pagination)
- `GET /api/recipes/:id`
- `PATCH /api/recipes/:id`
- `DELETE /api/recipes/:id`
- Link paste + manual edit UI

Exit criteria:
- End-to-end create/edit/delete works per user
- Basic validation and error handling in place

### Milestone 3: Default AI Draft Flow (Day 6-7)
Deliverables:
- `POST /api/recipes/summarize`
- Source link -> AI draft (title, ingredients, steps)
- Mandatory review/edit step before final save
- Fallback path when AI fails/timeouts

Exit criteria:
- User can generate AI draft from link and save edited version
- AI failure does not block manual completion

### Milestone 4: Search + UX Polish (Day 8)
Deliverables:
- Title search on list page
- Mobile-first readability improvements
- Loading/empty/error states for key pages

Exit criteria:
- Users can quickly find recipes by title
- Core flow is usable on common mobile viewport sizes

### Milestone 5: Analytics + Launch Readiness (Day 9-10)
Deliverables:
- Event tracking (`recipe_created`, `recipe_viewed`, `recipe_searched`, `recipe_updated`, `ai_summary_used`)
- Minimal QA checklist completed
- Deployment to production

Exit criteria:
- Events appear in analytics tool
- Production URL available and core flow validated

## 4. Work Breakdown (Execution Checklist)

### 4.1 Product/Planning
- [ ] Convert PRD open decisions into explicit choices
- [ ] Finalize v1 information architecture and screen list
- [ ] Define acceptance criteria per core user flow

### 4.2 Backend
- [ ] Implement schema + migrations
- [ ] Build recipe API endpoints with ownership checks
- [ ] Add request/response validation (e.g., Zod)
- [ ] Add structured error handling and logging

### 4.3 AI Integration
- [ ] Define prompt template for recipe structuring
- [ ] Implement summarize endpoint with timeout/retry rules
- [ ] Normalize AI output to safe schema
- [ ] Require user confirmation/edit before persistence

### 4.4 Frontend
- [ ] Build link input + AI draft screen
- [ ] Build edit/review form (title, ingredients, steps)
- [ ] Build recipe list/detail screens
- [ ] Build search UX and no-results states

### 4.5 QA and Reliability
- [ ] Add integration tests for API happy paths
- [ ] Add negative tests (invalid URL, auth failure, missing fields)
- [ ] Add smoke test for full create->search->view flow
- [ ] Verify mobile responsiveness on key breakpoints

### 4.6 DevOps
- [ ] Set environment variables per stage
- [ ] Configure deployment and rollback notes
- [ ] Add monitoring for API errors and latency

## 5. Technical Decisions to Lock This Week
1. Auth: Supabase Auth vs NextAuth (recommend Supabase Auth for MVP speed)
2. DB access layer: Prisma vs Drizzle vs Supabase client
3. AI request strategy: synchronous response vs background job (recommend sync first)
4. Analytics tool: PostHog vs GA4 (recommend PostHog for product events)

## 6. Risks and Mitigation Plan
1. AI output quality is inconsistent
- Mitigation: strict output schema + mandatory user edit step.

2. Scope creep beyond core flow
- Mitigation: maintain explicit "Not Now" list and weekly scope review.

3. Slow velocity from unresolved technical choices
- Mitigation: lock core stack decisions by Day 1.

4. Low revisit rate after saving recipes
- Mitigation: optimize title quality, search relevance, and detail readability before new features.

## 7. Definition of Done for MVP Launch
1. Authenticated users can complete full flow: link -> AI draft -> edit -> save -> search -> reopen.
2. Recipe CRUD API is stable and ownership-protected.
3. Mobile-first UX is functional and readable for core screens.
4. Event tracking is live for all MVP success metrics.
5. Production deployment is stable for at least 72 hours without critical errors.

## 8. Immediate Next 5 Actions
1. Lock auth and DB stack decisions today.
2. Generate schema/migrations and seed one test user.
3. Build and test recipe CRUD endpoints.
4. Implement AI summarize endpoint with strict schema validation.
5. Build the main mobile flow and run a real cooking-session test.

---

End of Build Plan v1.0
