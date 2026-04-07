import * as Sentry from "@sentry/node";

import {
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
  getWorkerSentryDsn
} from "@/src/config/sentry";
import type {
  SummarizeJobFailureKind,
  SummarizeJobStage
} from "@/src/lib/server/recipes/recipes-summarize-jobs.types";

let workerSentryInitialized = false;

type SummarizeJobFailureContext = {
  failureKind: SummarizeJobFailureKind;
  jobId: string;
  sourceUrl: string;
  stage: SummarizeJobStage;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Unknown error");
}

function sanitizeSourceUrl(sourceUrl: string): string {
  try {
    const parsed = new URL(sourceUrl);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString();
  } catch {
    return sourceUrl;
  }
}

export function initWorkerSentry(): void {
  if (workerSentryInitialized) {
    return;
  }

  const dsn = getWorkerSentryDsn();

  Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    tracesSampleRate: getSentryTracesSampleRate()
  });

  workerSentryInitialized = true;
}

export function captureSummarizeJobFailure(
  error: unknown,
  context: SummarizeJobFailureContext
): void {
  Sentry.withScope((scope) => {
    scope.setTag("service", "worker");
    scope.setTag("summarize.job_id", context.jobId);
    scope.setTag("summarize.stage", context.stage);
    scope.setTag("summarize.failure_kind", context.failureKind);
    scope.setContext("summarizeJob", {
      failureKind: context.failureKind,
      jobId: context.jobId,
      sourceUrl: sanitizeSourceUrl(context.sourceUrl),
      stage: context.stage
    });

    Sentry.captureException(toError(error));
  });
}

export async function captureWorkerStartupFailure(error: unknown): Promise<void> {
  initWorkerSentry();

  Sentry.withScope((scope) => {
    scope.setTag("service", "worker");
    scope.setTag("worker.phase", "startup");
    Sentry.captureException(toError(error));
  });

  await Sentry.flush(2_000);
}
