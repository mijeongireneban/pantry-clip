import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import {
  isYouTubeShortsUrl,
  summarizeRecipeSchema
} from "@/src/apps/recipes/recipes.schemas";
import { requireUserId } from "@/src/lib/auth/require-user-id";
import {
  createSummarizeJob,
  markSummarizeJobFailed
} from "@/src/lib/server/recipes/recipes-summarize-jobs.repository";
import { enqueueSummarizeJob } from "@/src/lib/server/recipes/recipes-summarize-queue.service";
import { ApiError, toErrorResponse } from "@/src/lib/utils/api-error";

function sanitizeSourceUrl(sourceUrl: string): string {
  try {
    const parsed = new URL(sourceUrl);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString();
  } catch {
    return sourceUrl;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const json = await request.json();
    const input = summarizeRecipeSchema.parse(json);

    if (!isYouTubeShortsUrl(input.sourceUrl)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "AI draft generation currently works only with YouTube Shorts links.",
        400
      );
    }

    const job = await createSummarizeJob(userId, input);

    try {
      await enqueueSummarizeJob(job.jobId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to enqueue summarize job";
      const failureKind = "internal_error" as const;

      Sentry.withScope((scope) => {
        scope.setTag("service", "web");
        scope.setTag("summarize.job_id", job.jobId);
        scope.setTag("summarize.stage", "queued");
        scope.setTag("summarize.failure_kind", failureKind);
        scope.setContext("summarizeJob", {
          failureKind,
          jobId: job.jobId,
          sourceUrl: sanitizeSourceUrl(input.sourceUrl),
          stage: "queued"
        });

        Sentry.captureException(
          error instanceof Error ? error : new Error(message)
        );
      });

      await markSummarizeJobFailed(job.jobId, "QUEUE_ENQUEUE_FAILED", message, {
        failureKind
      });

      throw new ApiError(
        "INTERNAL_ERROR",
        "AI 초안 작업을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.",
        500
      );
    }

    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    const normalized = toErrorResponse(error);
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}
