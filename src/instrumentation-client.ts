import * as Sentry from "@sentry/nextjs";

import {
  getClientSentryDsn,
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate
} from "@/src/config/sentry";

const dsn = getClientSentryDsn();

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: getSentryEnvironment(),
  release: getSentryRelease(),
  tracesSampleRate: getSentryTracesSampleRate()
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
