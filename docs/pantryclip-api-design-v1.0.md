# PantryClip API Design v1.0 (MVP)

> Status: Historical baseline.
>
> This API draft no longer matches the current summarize flow. The current app uses async summarize jobs, not a synchronous draft-returning summarize response.
>
> Current planning reference:
> [pantryclip-url-to-draft-ingestion-implementation-v2.0.md](./pantryclip-url-to-draft-ingestion-implementation-v2.0.md)
>
> Current implementation contract reference:
> [`src/lib/server/openapi/openapi.spec.ts`](../src/lib/server/openapi/openapi.spec.ts)

## 1. API Principles
1. Base path: `/api`
2. Data format: JSON only
3. Auth model: session-based auth; all recipe endpoints require authenticated user
4. Multi-tenant safety: every recipe operation is scoped by `user_id`
5. AI summarize endpoint returns draft data only; persistence happens only via `POST /api/recipes`

## 2. Conventions

### 2.1 Headers
1. Request: `Content-Type: application/json` (for POST/PATCH)
2. Response: `Content-Type: application/json`

### 2.2 Success Envelope
Return resource JSON directly (no outer `data` wrapper) for MVP simplicity.

### 2.3 Error Envelope
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": {
    "field": "title",
    "reason": "Required"
  }
}
```

### 2.4 Standard Error Codes
1. `UNAUTHORIZED` (401)
2. `FORBIDDEN` (403) reserved
3. `NOT_FOUND` (404)
4. `VALIDATION_ERROR` (400)
5. `INTERNAL_ERROR` (500)

## 3. Resource Models

### 3.1 Recipe
```json
{
  "id": "0e03d1b3-38e0-4c66-81f0-4f9f11111111",
  "userId": "9a61c3d0-188f-45fb-8cc8-9f1a22222222",
  "sourceUrl": "https://www.youtube.com/shorts/abc123",
  "sourceType": "youtube_shorts",
  "title": "10-Minute Soy Butter Udon",
  "ingredientsText": "- Udon noodles\\n- Soy sauce\\n- Butter",
  "stepsText": "1. Boil noodles\\n2. Toss with sauce",
  "summarySource": "ai",
  "aiConfidence": 0.86,
  "createdAt": "2026-03-03T20:01:02.000Z",
  "updatedAt": "2026-03-03T20:01:02.000Z"
}
```

Enums:
1. `sourceType`: `youtube_shorts` | `instagram_reels` | `other`
2. `summarySource`: `manual` | `ai`

## 4. Endpoints

### 4.1 Health
`GET /api/health`

Auth: public

Response `200`:
```json
{
  "ok": true,
  "service": "pantry-clip-api",
  "timestamp": "2026-03-03T20:01:02.000Z",
  "uptimeSec": 1234
}
```

---

### 4.2 Summarize Recipe Draft
`POST /api/recipes/summarize`

Auth: required

Request body:
```json
{
  "sourceUrl": "https://www.youtube.com/shorts/abc123"
}
```

Validation:
1. `sourceUrl` must be a valid URL

Response `200`:
```json
{
  "sourceType": "youtube_shorts",
  "titleDraft": "Spicy Tuna Mayo Rice Bowl",
  "ingredientsDraft": "- Tuna\\n- Mayo\\n- Rice",
  "stepsDraft": "1. Mix tuna and mayo\\n2. Serve over rice",
  "confidence": 0.78
}
```

Error status:
1. `400` invalid payload
2. `401` unauthenticated
3. `500` summarize/internal failure

---

### 4.3 Create Recipe
`POST /api/recipes`

Auth: required

Request body:
```json
{
  "sourceUrl": "https://www.youtube.com/shorts/abc123",
  "sourceType": "youtube_shorts",
  "title": "Spicy Tuna Mayo Rice Bowl",
  "ingredientsText": "- Tuna\\n- Mayo\\n- Rice",
  "stepsText": "1. Mix tuna and mayo\\n2. Serve over rice",
  "summarySource": "ai",
  "aiConfidence": 0.78
}
```

Validation:
1. `sourceUrl` valid URL
2. `title` length 1..140
3. `ingredientsText` min length 1
4. `stepsText` min length 1
5. `aiConfidence` nullable, range 0..1

Response `201`: `Recipe`

Error status:
1. `400` invalid payload
2. `401` unauthenticated
3. `500` internal error

---

### 4.4 List Recipes
`GET /api/recipes?q={query}&limit={1..50}&cursor={opaque}`

Auth: required

Query params:
1. `q` optional title query (case-insensitive contains)
2. `limit` optional, default `20`, max `50`
3. `cursor` optional opaque cursor for pagination

Response `200`:
```json
{
  "items": [
    {
      "id": "0e03d1b3-38e0-4c66-81f0-4f9f11111111",
      "userId": "9a61c3d0-188f-45fb-8cc8-9f1a22222222",
      "sourceUrl": "https://www.youtube.com/shorts/abc123",
      "sourceType": "youtube_shorts",
      "title": "10-Minute Soy Butter Udon",
      "ingredientsText": "- Udon",
      "stepsText": "1. Cook",
      "summarySource": "manual",
      "aiConfidence": null,
      "createdAt": "2026-03-03T20:01:02.000Z",
      "updatedAt": "2026-03-03T20:01:02.000Z"
    }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTAzLTAzVDIwOjAxOjAyLjAwMFoiLCJpZCI6IjBlMDNkMWIzLTM4ZTAtNGM2Ni04MWYwLTRmOWYxMTExMTExMSJ9"
}
```

Sorting:
1. `createdAt DESC`
2. tie-breaker `id DESC`

Error status:
1. `400` invalid query
2. `401` unauthenticated
3. `500` internal error

---

### 4.5 Get Recipe Detail
`GET /api/recipes/:id`

Auth: required

Response `200`: `Recipe`

Error status:
1. `401` unauthenticated
2. `404` missing or not owned
3. `500` internal error

---

### 4.6 Update Recipe
`PATCH /api/recipes/:id`

Auth: required

Request body (partial):
```json
{
  "title": "Updated title",
  "ingredientsText": "- Updated",
  "stepsText": "1. Updated"
}
```

Rules:
1. At least one updatable field is required
2. Same validation as create for provided fields

Response `200`: updated `Recipe`

Error status:
1. `400` invalid payload
2. `401` unauthenticated
3. `404` missing or not owned
4. `500` internal error

---

### 4.7 Delete Recipe
`DELETE /api/recipes/:id`

Auth: required

Response `200`:
```json
{
  "ok": true
}
```

Error status:
1. `401` unauthenticated
2. `404` missing or not owned
3. `500` internal error

## 5. Pagination Contract
Cursor is an opaque base64-encoded JSON object:
```json
{
  "createdAt": "2026-03-03T20:01:02.000Z",
  "id": "0e03d1b3-38e0-4c66-81f0-4f9f11111111"
}
```

Server applies:
`(created_at, id) < (cursor.createdAt, cursor.id)`

## 6. Security and Ownership
1. Auth required for `/api/recipes*`
2. `user_id` is derived from session, never accepted from client payload
3. Unauthorized cross-user access returns `404` (resource not found)

## 7. Implementation Notes (Current -> Target)
1. Current code already exposes these endpoint paths.
2. Current summarize is stubbed; replace with OpenAI pipeline.
3. Current repository is in-memory; replace with Postgres implementation.
4. Add explicit `VALIDATION_ERROR` mapping for Zod errors for contract compliance.
