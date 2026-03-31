import type { TaskList } from "graphile-worker";

import { RECIPES_SUMMARIZE_TASK_IDENTIFIER } from "@/src/lib/server/recipes/recipes-summarize-queue.service";
import { recipesSummarizeTask } from "@/src/worker/tasks/recipes-summarize.task";

export const taskList: TaskList = {
  [RECIPES_SUMMARIZE_TASK_IDENTIFIER]: recipesSummarizeTask
};
