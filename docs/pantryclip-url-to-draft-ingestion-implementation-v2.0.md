# PantryClip URL-to-Draft Ingestion Implementation v2.0

## 1. Decision

URL-to-draft is a signature feature for PantryClip.

That changes the architecture decision:

- URL ingestion can no longer be treated as a best-effort helper inside the web runtime.
- Media extraction must become a dedicated product capability with its own worker, retries, observability, and failure handling.
- The current Vercel `after()` path is a stepping stone, not the long-term implementation.

## 2. Current Problem

The current summarize pipeline already proved an important point:

1. Prompting is not the main bottleneck.
2. Evidence acquisition is the main bottleneck.
3. Serverless Vercel execution is the wrong operational shape for media extraction.

### 2.1 Observed production limitation

Current Pass 2A attempts to download YouTube Shorts audio inside the summarize job path.

Observed behavior:

- the app creates the summarize job successfully
- the background execution starts
- YouTube audio download is attempted from Vercel serverless runtime
- YouTube returns `429`
- the job falls back to weak evidence or `insufficient_context`

This means the current failure is not primarily "AI quality."
It is "source platform access is unreliable from the current runtime."

### 2.2 Root architectural limitations

1. The current worker runs through Next.js `after()`
- good for light background work
- not good for media download, retries, rate limits, or binary-based processing

2. The current extractor uses unofficial source access
- practical, but brittle
- subject to platform throttling and behavior changes

3. The current runtime does not control egress well enough
- shared cloud/serverless IP reputation is a real constraint

4. The pipeline still bundles source access, extraction, and summarization too tightly
- we need clearer separation between:
  - source acquisition
  - evidence extraction
  - evidence fusion
  - final draft synthesis

## 3. Recommendation Summary

Build a dedicated ingestion layer and move summarize jobs off the web runtime.

Recommended architecture:

1. Keep the web app on Vercel.
2. Keep job records in Postgres.
3. Add a dedicated worker service on non-Vercel compute.
4. Use a Postgres-backed queue so the repo stays operationally simple.
5. Replace `@distube/ytdl-core` as the primary extraction path with worker-side media tooling.
6. Treat frame analysis as a later step that depends on stable media access.

## 4. Recommended Stack

### 4.1 Web app

- Next.js on Vercel
- existing route handlers remain the API surface
- the app creates jobs and polls status only

### 4.2 Queue and worker orchestration

Recommended choice:

- Graphile Worker

Why this is the recommendation:

- uses PostgreSQL, which PantryClip already depends on
- avoids introducing Redis or a second queue system immediately
- supports durable background jobs, retries, and exponential backoff
- works well with a separate dedicated Node worker service

### 4.3 Worker runtime

Recommended shape:

- dedicated Node worker service
- deployed outside Vercel
- long-lived process
- controlled outbound network
- local temporary disk available
- binaries installed in the worker image

Practical requirement:

- the worker must be able to run `yt-dlp` and `ffmpeg`

### 4.4 Media extraction tools

- `yt-dlp` for metadata, subtitles, and media access
- `ffmpeg` for audio extraction and later frame sampling

### 4.5 AI services

- OpenAI transcription API for extracted audio
- OpenAI image/vision input later for frame analysis
- existing final recipe summarizer can remain a separate stage

## 5. What Changes In The Product Model

Because URL-to-draft is core, PantryClip should behave like an ingestion system:

1. User submits URL
2. PantryClip records a job
3. PantryClip extracts evidence in durable background infrastructure
4. PantryClip either:
   - produces a draft from strong evidence, or
   - explains the extraction failure clearly

This means "source blocked" should become a first-class system state.
It should not look like a mysterious AI failure.

## 6. Target Architecture

### 6.1 High-level flow

```text
Client -> POST /api/recipes/summarize
       -> create summarize_jobs row
       -> enqueue graphile_worker job
       -> return 202 + jobId

Dedicated worker -> load summarize job
                 -> extract metadata/subtitles
                 -> if needed: download media
                 -> transcribe audio
                 -> if still needed: sample frames later
                 -> synthesize recipe draft
                 -> update summarize_jobs

Client -> GET /api/recipes/summarize/:jobId
       -> poll until terminal status
```

### 6.2 Client-facing status vs internal stage

Keep the current client-facing `status` field:

- `queued`
- `extracting`
- `summarizing`
- `completed`
- `insufficient_context`
- `failed`

Add an internal `stage` field for operational visibility:

- `queued`
- `extracting_metadata`
- `extracting_subtitles`
- `downloading_media`
- `transcribing_audio`
- `extracting_frames`
- `analyzing_frames`
- `summarizing`
- `completed`
- `insufficient_context`
- `failed`

This lets the UI stay simple while the worker becomes debuggable.

## 7. Recommended Repo Changes

### 7.1 API layer

Keep:

- `POST /api/recipes/summarize`
- `GET /api/recipes/summarize/:jobId`

Change:

- remove execution via `after()`
- replace it with job enqueue only

### 7.2 Worker entry points

Recommended additions:

- `src/worker/tasks/recipes-summarize.task.ts`
- `src/worker/task-list.ts`
- `src/worker/worker.ts`

### 7.3 Server modules

Recommended additions/refactors:

- `src/lib/server/recipes/recipes-source-extractor.service.ts`
- `src/lib/server/recipes/recipes-ytdlp.service.ts`
- `src/lib/server/recipes/recipes-media-download.service.ts`
- `src/lib/server/recipes/recipes-audio.service.ts`
- `src/lib/server/recipes/recipes-transcription.service.ts`
- `src/lib/server/recipes/recipes-frame-extraction.service.ts`
- `src/lib/server/recipes/recipes-vision.service.ts`
- `src/lib/server/recipes/recipes-evidence-fusion.service.ts`
- `src/lib/server/recipes/recipes-summarizer.service.ts`

### 7.4 Package/runtime additions

Expected additions:

- `graphile-worker`
- `yt-dlp` available in worker image
- `ffmpeg` available in worker image

Optional helper additions:

- `execa` for shelling out to media tools
- lightweight structured logging helper

## 8. Data Model Changes

The existing `SummarizeJob` model is a good foundation, but it needs operational fields.

Recommended additions:

- `stage`
- `attemptCount`
- `lastAttemptAt`
- `providerCode`
- `providerMessage`
- `failureKind`
- `visionNotes`
- `mediaDebug`

Recommended `failureKind` values:

- `SOURCE_RATE_LIMITED`
- `SOURCE_UNAVAILABLE`
- `MEDIA_DOWNLOAD_FAILED`
- `TRANSCRIPTION_FAILED`
- `VISION_FAILED`
- `INSUFFICIENT_CONTEXT`
- `INTERNAL_ERROR`

Why these fields matter:

- explain failures to users and to us
- separate source blocking from AI quality
- support retries and future analytics

## 9. Queueing Strategy

### 9.1 Job creation

`POST /api/recipes/summarize` should do only this:

1. validate input
2. require auth
3. create summarize job row
4. enqueue worker job with `jobId`
5. return `202`

### 9.2 Worker responsibilities

The worker should own:

1. stage updates
2. retries
3. evidence extraction
4. provider error classification
5. final summarize step

### 9.3 Retry policy

Retry only retryable source failures.

Suggested retryable cases:

- temporary network errors
- source throttling/rate limit
- transient transcription provider failure

Suggested non-retryable cases:

- invalid or unsupported URL
- missing video
- media too large after compression strategy
- persistent insufficient context

## 10. Evidence Extraction Pipeline

### Step 1: Normalize source

- validate YouTube Shorts URL
- derive canonical video ID
- normalize to canonical watch URL for downstream processing

### Step 2: Metadata and subtitles

- fetch title/description
- attempt subtitle or auto-subtitle extraction first
- score subtitle usefulness

### Step 3: Media download

If subtitle evidence is weak:

- attempt worker-side media access with `yt-dlp`
- record any provider block or throttle code
- cache results by canonical video ID where practical

### Step 4: Audio extraction

- use `ffmpeg` to create a transcription-friendly audio file
- compress to stay within transcription limits
- chunk only if necessary

### Step 5: Transcription

- transcribe audio with OpenAI
- store transcript separately from subtitles
- preserve evidence source tags

### Step 6: Evidence fusion

Combine:

- title
- description
- subtitles
- transcript
- later: vision notes

Then score evidence quality before recipe synthesis.

### Step 7: Final draft synthesis

Only when evidence is strong enough:

- call the recipe summarizer
- validate structured output
- save draft payload and confidence

## 11. Pass Breakdown

### Pass A: Move off Vercel runtime

Scope:

- add Graphile Worker
- create worker process
- replace `after()` with enqueue
- add internal `stage` and retry/failure fields

Success criteria:

- summarize jobs run outside Vercel request lifecycle
- retries are durable
- provider errors are classified

### Pass B: Move source extraction to worker tooling

Scope:

- replace primary media access path with `yt-dlp`
- worker image includes `ffmpeg`
- metadata/subtitle extraction runs in worker

Success criteria:

- current Vercel-side `429` path is no longer the main extraction route
- stage transitions are visible

### Pass C: Worker-side audio transcription

Scope:

- extract audio with `ffmpeg`
- call OpenAI transcription
- store transcript and evidence provenance

Success criteria:

- audio transcription no longer depends on Vercel function execution
- jobs degrade gracefully when media is blocked

### Pass D: Frame analysis (true Pass 2B)

Scope:

- frame sampling
- vision analysis
- evidence fusion upgrade

Gate:

- do not start until Pass C is stable enough to evaluate remaining failures

## 12. Deployment Model

Recommended deployment split:

### App

- Vercel
- pooled Postgres runtime URL

### Worker

- separate service from the same repo
- direct Postgres connection
- Node 20+
- `yt-dlp` and `ffmpeg` installed

Important note:

The worker should use a direct Postgres connection where durable workers and queue operations make sense.
The web app can continue using the pooled connection strategy already set up for Vercel.

## 13. Operations And Observability

Required before broad rollout:

1. structured logs by `jobId`
2. `failureKind` classification
3. attempt counts
4. average duration by stage
5. success rate by source type
6. cache hit rate once caching exists

Required QA dataset:

- at least 25 representative YouTube Shorts
- bucket outcomes into:
  - good draft
  - recoverable draft
  - wrong draft
  - insufficient context
  - source blocked
  - system failure

## 14. Risks

1. Source platform blocking will still exist
- moving off Vercel improves the worker shape
- it does not magically grant permanent extraction reliability

2. This feature is infrastructure-heavy
- if PantryClip keeps URL-to-draft as core, this is an intentional product investment

3. Compliance and platform policy should be reviewed
- PantryClip is depending on third-party media access as part of a core feature

## 15. Recommendation

Implement this in order:

1. Move summarize execution off Vercel `after()`
2. Add a dedicated worker with Postgres-backed queueing
3. Move metadata/subtitle/media extraction into the worker
4. Keep audio transcription in the worker
5. Add frame analysis only after the worker-based extraction path is stable

In short:

Do not keep iterating on the current Vercel-bound extraction path.
Build the ingestion layer that a signature URL-to-draft feature actually needs.
