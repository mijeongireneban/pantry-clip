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

      await markSummarizeJobFailed(job.jobId, "QUEUE_ENQUEUE_FAILED", message, {
        failureKind: "internal_error"
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
