import type { Task } from "graphile-worker";

import { runSummarizeJob } from "@/src/lib/server/recipes/recipes-summarize-job-runner";
import type { RecipesSummarizeTaskPayload } from "@/src/lib/server/recipes/recipes-summarize-queue.service";

export const recipesSummarizeTask: Task = async (payload) => {
  const { jobId } = payload as RecipesSummarizeTaskPayload;
  await runSummarizeJob(jobId);
};
