import type { RunnerOptions, TaskList, WorkerUtilsOptions } from "graphile-worker";

const DEFAULT_GRAPHILE_WORKER_SCHEMA = "graphile_worker";
const DEFAULT_GRAPHILE_WORKER_CONCURRENCY = 1;
const DEFAULT_GRAPHILE_WORKER_POLL_INTERVAL_MS = 2_000;

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function readQueueConnectionString(): string {
  const value =
    process.env.GRAPHILE_WORKER_DATABASE_URL ??
    process.env.DATABASE_URL;

  if (!value) {
    throw new Error(
      "GRAPHILE_WORKER_DATABASE_URL or DATABASE_URL must be set."
    );
  }

  return value;
}

function readRunnerConnectionString(): string {
  const value =
    process.env.GRAPHILE_WORKER_DATABASE_URL ??
    process.env.DIRECT_URL ??
    process.env.DATABASE_URL;

  if (!value) {
    throw new Error(
      "GRAPHILE_WORKER_DATABASE_URL, DIRECT_URL, or DATABASE_URL must be set."
    );
  }

  return value;
}

function getBaseWorkerOptions(connectionString: string): WorkerUtilsOptions {
  return {
    connectionString,
    schema: process.env.GRAPHILE_WORKER_SCHEMA ?? DEFAULT_GRAPHILE_WORKER_SCHEMA,
    noPreparedStatements: true
  };
}

export function getGraphileWorkerUtilsOptions(): WorkerUtilsOptions {
  return getBaseWorkerOptions(readQueueConnectionString());
}

export function getGraphileWorkerRunnerOptions(taskList?: TaskList): RunnerOptions {
  return {
    ...getBaseWorkerOptions(readRunnerConnectionString()),
    taskList,
    concurrency: parsePositiveInteger(
      process.env.GRAPHILE_WORKER_CONCURRENCY,
      DEFAULT_GRAPHILE_WORKER_CONCURRENCY
    ),
    pollInterval: parsePositiveInteger(
      process.env.GRAPHILE_WORKER_POLL_INTERVAL_MS,
      DEFAULT_GRAPHILE_WORKER_POLL_INTERVAL_MS
    )
  };
}
