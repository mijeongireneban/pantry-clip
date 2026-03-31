# PantryClip (팬트리클립) — Project Brief v0.1

## 1. Core Problem Statement

유튜브 쇼츠 / 인스타 릴스 레시피를 가장 간단한 형태로 구조화해서 요리 노트로 저장하고 싶다.

짧은 영상 기반 레시피는 저장은 쉽지만:
- 다시 찾기 어렵고
- 내용이 구조화되어 있지 않으며
- 실제 요리할 때 참고하기 불편하다

PantryClip은 이를 "요리용 노트" 형태로 재정리해주는 도구다.

## 2. Target User

유튜브 쇼츠로 레시피를 많이 저장하는 자취 / 신혼 사용자

특징:
- 25~39세
- 요리에 관심은 많지만 전문적이지는 않음
- 쇼츠/릴스 기반으로 레시피 소비
- 저장은 많이 하지만 실제로 다시 보는 경우는 적음

## 3. Product Positioning

"쇼츠 레시피 전용 정리툴"

일반 레시피 앱이 아니라,
짧은 영상 기반 콘텐츠를 구조화하는 데 집중한다.

핵심은 재고관리도, 식단관리도 아님.
"영상 -> 구조화된 레시피" 변환에 집중.

## 4. MVP Scope (v0.1)

### Must-have features
1. 영상 링크 저장 (YouTube Shorts / Instagram Reels)
2. 레시피 텍스트 정리 (수동 입력 또는 AI 요약)
3. 나만의 레시피 리스트 조회
4. 검색 기능 (제목 기준)

### Not now
- 냉장고 재고 관리
- 식단 플래너
- 쇼핑 리스트
- 커뮤니티 / 소셜 기능
- 영양 정보 계산
- 자동 추천 알고리즘

## 5. UX Flow (Simple Version)

1. 링크 붙여넣기
2. 제목 자동 생성
3. 재료 / 조리법 구조화
4. 저장
5. 리스트에서 검색 및 열람

모든 과정은 모바일 화면 기준으로 단순하게.

## 6. Platform Strategy

### Initial phase
- Web MVP
- Mobile-first responsive design

이유:
- 개발 속도 최적화
- 빠른 실험 가능
- 유지보수 비용 최소화

### Long-term
- 앱 출시 가능성 있음
- Web 구조를 API 중심으로 설계하여 향후 React Native / Flutter 등으로 마이그레이션 고려

## 7. Success Criteria (Early Stage)

초기 목표는 "나 스스로 잘 쓰는가".

### First milestone
- 나 혼자 20개 이상 레시피 저장
- 실제로 5회 이상 다시 열람
- 요리할 때 앱을 실제 참고

### Second milestone (later)
- 100명 가입
- 평균 저장 10개 이상
- 재방문율 30% 이상

## 8. Current Status

- 이름 확정: PantryClip
- 포지셔닝 확정
- MVP 방향성 확정

다음 단계:
- 간단한 와이어프레임 설계
- DB 스키마 설계
- 개발 시작

---

## 9. Technical Structure (for MVP Build)

### 9.1 Recommended Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend/API: Next.js Route Handlers (or separate Node API later)
- Database: PostgreSQL (Supabase or managed Postgres)
- Auth: Supabase Auth or NextAuth (email/social login)
- AI summarization: OpenAI API (optional per recipe)
- Deployment: Vercel (app) + managed Postgres

### 9.2 Core Data Model (MVP)
- `users`
  - `id` (uuid, pk)
  - `email` (unique)
  - `created_at`
- `recipes`
  - `id` (uuid, pk)
  - `user_id` (fk -> users.id)
  - `source_url`
  - `source_type` (youtube_shorts | instagram_reels | other)
  - `title`
  - `ingredients_text`
  - `steps_text`
  - `summary_source` (manual | ai)
  - `created_at`
  - `updated_at`

Indexes:
- `(user_id, created_at desc)` for list pages
- `(user_id, title)` for title search

### 9.3 API Boundaries (MVP)
- `POST /api/recipes`: create recipe from link + structured text
- `GET /api/recipes`: list user recipes (pagination)
- `GET /api/recipes/:id`: get detail
- `PATCH /api/recipes/:id`: update title/ingredients/steps
- `DELETE /api/recipes/:id`: delete recipe
- `POST /api/recipes/summarize`: generate AI summary from user-provided text/caption

### 9.4 UX-to-Data Mapping
- Paste link -> store `source_url`, infer `source_type`
- Auto title generation -> seed `title` (editable)
- Ingredient/step structuring -> store in `ingredients_text`, `steps_text`
- Save -> `recipes` insert
- Search by title -> indexed query by `user_id + title`

---

## 10. App Migration Strategy (Web -> Mobile)

### 10.1 Architecture Principle
Adopt an API-first and domain-first architecture from day one:
- Keep UI logic and domain logic separated.
- Keep data access behind API/service boundaries.
- Avoid frontend-coupled DB access in page components.

### 10.2 Migration-ready Structure
- `app/` or `src/ui/`: web presentation layer only
- `src/domain/`: entities, validation, use-cases
- `src/server/`: API handlers and repository adapters
- `src/shared/`: DTOs, schemas, constants

This allows reuse of domain/shared layers when building mobile clients.

### 10.3 Incremental Migration Path
1. Build and validate PMF with web MVP
2. Stabilize API contracts (`/api/recipes` family)
3. Introduce token-based auth flow usable by mobile clients
4. Build React Native/Flutter app as API consumer
5. Keep web + mobile parity via shared API/versioning

### 10.4 Risks and Mitigation
- Risk: web implementation tightly coupled to framework internals
  - Mitigation: keep business logic in framework-agnostic services
- Risk: schema changes break mobile clients later
  - Mitigation: API versioning and backward-compatible fields
- Risk: AI summarization variability
  - Mitigation: always allow manual edit before final save

### 10.5 Definition of Done for Migration-readiness
- Domain logic not tied to web UI components
- API contracts documented and stable
- DB schema migration history managed (Prisma/Drizzle/Supabase migrations)
- Auth and permission checks centralized
- Mobile client can create/read/update recipe records via public API contracts

---

End of v0.1 document.
