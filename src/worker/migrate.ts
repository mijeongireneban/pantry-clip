import { runMigrations } from "graphile-worker";

import { getGraphileWorkerRunnerOptions } from "@/src/lib/server/worker/graphile-worker";
import { loadWorkerEnv } from "@/src/worker/load-env";

loadWorkerEnv();

async function main() {
  await runMigrations(getGraphileWorkerRunnerOptions());
  console.info("Graphile Worker migrations are up to date.");
}

main().catch((error) => {
  console.error("Failed to run Graphile Worker migrations", error);
  process.exit(1);
});
