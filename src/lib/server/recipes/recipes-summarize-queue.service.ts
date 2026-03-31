import { quickAddJob } from "graphile-worker";

import { getGraphileWorkerUtilsOptions } from "@/src/lib/server/worker/graphile-worker";

export const RECIPES_SUMMARIZE_TASK_IDENTIFIER = "recipes-summarize";

export type RecipesSummarizeTaskPayload = {
  jobId: string;
};

export async function enqueueSummarizeJob(jobId: string): Promise<void> {
  await quickAddJob(
    getGraphileWorkerUtilsOptions(),
    RECIPES_SUMMARIZE_TASK_IDENTIFIER,
    { jobId } satisfies RecipesSummarizeTaskPayload,
    {
      jobKey: `recipes-summarize:${jobId}`,
      jobKeyMode: "unsafe_dedupe",
      maxAttempts: 1
    }
  );
}
