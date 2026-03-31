import { run, runMigrations } from "graphile-worker";

import { getGraphileWorkerRunnerOptions } from "@/src/lib/server/worker/graphile-worker";
import { loadWorkerEnv } from "@/src/worker/load-env";
import { taskList } from "@/src/worker/task-list";

loadWorkerEnv();

async function main() {
  const options = getGraphileWorkerRunnerOptions(taskList);

  await runMigrations(options);

  const runner = await run(options);
  console.info("PantryClip worker started.");

  await runner.promise;
}

main().catch((error) => {
  console.error("PantryClip worker failed to start", error);
  process.exit(1);
});
