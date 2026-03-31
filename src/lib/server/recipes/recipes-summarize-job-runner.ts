import {
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
  storeSummarizeJobEvidence
} from "@/src/lib/server/recipes/recipes-summarize-jobs.repository";
import { summarizeRecipeFromContext } from "@/src/lib/server/recipes/recipes-summarizer.service";
import { ApiError } from "@/src/lib/utils/api-error";

export async function runSummarizeJob(jobId: string): Promise<void> {
  const job = await getSummarizeJobForWorker(jobId);

  if (!job || job.status !== "queued") {
    return;
  }

  await markSummarizeJobExtracting(jobId);

  try {
    const context = await extractRecipeContext({ sourceUrl: job.sourceUrl });

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

    const draft = await summarizeRecipeFromContext(job.sourceUrl, context);
    await completeSummarizeJob(jobId, context, draft);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const context = await extractRecipeContext({ sourceUrl: job.sourceUrl });

      await markSummarizeJobInsufficientContext(
        jobId,
        context,
        error.message
      );
      return;
    }

    const message =
      error instanceof Error ? error.message : "Unexpected summarize job failure";

    await markSummarizeJobFailed(jobId, "SUMMARIZE_FAILED", message);
  }
}
