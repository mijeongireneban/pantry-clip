CREATE TYPE "summarize_job_stage" AS ENUM (
  'queued',
  'extracting_metadata',
  'extracting_subtitles',
  'downloading_media',
  'transcribing_audio',
  'extracting_frames',
  'analyzing_frames',
  'summarizing',
  'completed',
  'insufficient_context',
  'failed'
);

CREATE TYPE "summarize_job_failure_kind" AS ENUM (
  'source_rate_limited',
  'source_unavailable',
  'media_download_failed',
  'transcription_failed',
  'vision_failed',
  'insufficient_context',
  'internal_error'
);

ALTER TABLE "summarize_jobs"
  ADD COLUMN "stage" "summarize_job_stage" NOT NULL DEFAULT 'queued',
  ADD COLUMN "attempt_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "last_attempt_at" TIMESTAMPTZ(6),
  ADD COLUMN "provider_code" TEXT,
  ADD COLUMN "provider_message" TEXT,
  ADD COLUMN "failure_kind" "summarize_job_failure_kind",
  ADD COLUMN "media_debug" JSONB;
