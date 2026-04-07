import { run, runMigrations } from "graphile-worker";

import {
  captureWorkerStartupFailure,
  initWorkerSentry
} from "@/src/lib/server/monitoring/sentry";
import { getGraphileWorkerRunnerOptions } from "@/src/lib/server/worker/graphile-worker";
import { loadWorkerEnv } from "@/src/worker/load-env";
import { taskList } from "@/src/worker/task-list";

loadWorkerEnv();
initWorkerSentry();

async function main() {
  const options = getGraphileWorkerRunnerOptions(taskList);

  await runMigrations(options);

  const runner = await run(options);
  console.info("PantryClip worker started.");

  await runner.promise;
}

main().catch(async (error) => {
  console.error("PantryClip worker failed to start", error);
  await captureWorkerStartupFailure(error);
  process.exit(1);
});
