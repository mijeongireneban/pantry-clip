-- CreateEnum
CREATE TYPE "summarize_job_status" AS ENUM (
    'queued',
    'extracting',
    'summarizing',
    'completed',
    'insufficient_context',
    'failed'
);

-- CreateTable
CREATE TABLE "summarize_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "source_url" TEXT NOT NULL,
    "source_type" "source_type" NOT NULL,
    "status" "summarize_job_status" NOT NULL,
    "canonical_video_id" TEXT,
    "title_hint" TEXT,
    "description_hint" TEXT,
    "subtitle_text" TEXT,
    "transcript_text" TEXT,
    "evidence_sources" JSONB,
    "confidence" DOUBLE PRECISION,
    "draft_payload" JSONB,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summarize_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_summarize_jobs_user_created_id_desc" ON "summarize_jobs"("user_id", "created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "idx_summarize_jobs_user_status_created_desc" ON "summarize_jobs"("user_id", "status", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "summarize_jobs" ADD CONSTRAINT "summarize_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
