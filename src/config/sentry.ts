const DEFAULT_DEV_TRACES_SAMPLE_RATE = 1;
const DEFAULT_PROD_TRACES_SAMPLE_RATE = 0.05;

function readEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function parseSampleRate(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : undefined;
}

export function getClientSentryDsn(): string | undefined {
  return readEnv(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function getServerSentryDsn(): string | undefined {
  return readEnv(process.env.SENTRY_DSN) ?? getClientSentryDsn();
}

export function getWorkerSentryDsn(): string | undefined {
  return readEnv(process.env.SENTRY_WORKER_DSN) ?? getServerSentryDsn();
}

export function getSentryEnvironment(): string {
  return (
    readEnv(process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT) ??
    readEnv(process.env.SENTRY_ENVIRONMENT) ??
    readEnv(process.env.VERCEL_ENV) ??
    process.env.NODE_ENV ??
    "development"
  );
}

export function getSentryRelease(): string | undefined {
  return (
    readEnv(process.env.SENTRY_RELEASE) ??
    readEnv(process.env.VERCEL_GIT_COMMIT_SHA)
  );
}

export function getSentryTracesSampleRate(): number {
  const configuredRate = parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ??
      process.env.SENTRY_TRACES_SAMPLE_RATE
  );

  if (configuredRate !== undefined) {
    return configuredRate;
  }

  return process.env.NODE_ENV === "development"
    ? DEFAULT_DEV_TRACES_SAMPLE_RATE
    : DEFAULT_PROD_TRACES_SAMPLE_RATE;
}
