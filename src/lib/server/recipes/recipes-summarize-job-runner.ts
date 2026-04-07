import { captureSummarizeJobFailure } from "@/src/lib/server/monitoring/sentry";
import {
  type ExtractedRecipeContext,
  extractRecipeContext,
  hasSufficientRecipeContext
} from "@/src/lib/server/recipes/recipes-extraction.service";
import {
  completeSummarizeJob,
  getSummarizeJobForWorker,
  markSummarizeJobExtracting,
  markSummarizeJobFailed,
  markSummarizeJobInsufficientContext,
  markSummarizeJobSummarizing,
  setSummarizeJobStage,
  storeSummarizeJobEvidence
} from "@/src/lib/server/recipes/recipes-summarize-jobs.repository";
import {
  type SummarizeJobFailureKind,
  type SummarizeJobStage
} from "@/src/lib/server/recipes/recipes-summarize-jobs.types";
import { summarizeRecipeFromContext } from "@/src/lib/server/recipes/recipes-summarizer.service";
import { ApiError } from "@/src/lib/utils/api-error";

export async function runSummarizeJob(jobId: string): Promise<void> {
  const job = await getSummarizeJobForWorker(jobId);

  if (!job || job.status !== "queued") {
    return;
  }

  await markSummarizeJobExtracting(jobId);
  let context: ExtractedRecipeContext | null = null;
  let currentStage: SummarizeJobStage = "extracting_metadata";

  try {
    context = await extractRecipeContext(
      { sourceUrl: job.sourceUrl },
      {
        onStageChange: async (stage) => {
          currentStage = stage;
          await setSummarizeJobStage(jobId, stage);
        }
      }
    );

    await storeSummarizeJobEvidence(jobId, context);

    if (!hasSufficientRecipeContext(context)) {
      await markSummarizeJobInsufficientContext(
        jobId,
        context,
        "영상에서 레시피 정보를 충분히 추출하지 못했습니다. 직접 입력으로 계속해주세요."
      );
      return;
    }

    await markSummarizeJobSummarizing(jobId);
    currentStage = "summarizing";

    const draft = await summarizeRecipeFromContext(job.sourceUrl, context);
    await completeSummarizeJob(jobId, context, draft);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400 && context) {
      await markSummarizeJobInsufficientContext(
        jobId,
        context,
        error.message
      );
      return;
    }

    const message =
      error instanceof Error ? error.message : "Unexpected summarize job failure";
    const failureKind: SummarizeJobFailureKind = "internal_error";

    captureSummarizeJobFailure(error, {
      failureKind,
      jobId,
      sourceUrl: job.sourceUrl,
      stage: currentStage
    });

    await markSummarizeJobFailed(jobId, "SUMMARIZE_FAILED", message, {
      failureKind
    });
  }
}
